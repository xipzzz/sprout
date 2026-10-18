"""Local OCR selection, clean-image boundary and batch export behavior."""

import asyncio
import csv
import io
import os
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from unittest import mock

import httpx
import numpy as np
from PIL import Image

import app
import extract
import local_ocr
from batch import main
from schema import assert_child_view_safe, to_child_view

FIXTURE = Path(__file__).resolve().parents[1] / "fixtures" / "exif-rotate-6.jpg"
TEXT = "1. Pick a flower.\nA) rose\nB) lily\n"


class LocalOcrTests(unittest.TestCase):
    def test_paddle_receives_bgr_and_returns_text_in_reader_order(self):
        rgb = np.array([[[10, 20, 30]]], dtype=np.uint8)
        engine = mock.Mock()
        engine.predict.return_value = [{"rec_texts": [" 1. Pick a flower. ", "", "A) rose", "B) lily"]}]
        with mock.patch.object(local_ocr, "_paddle_engine", return_value=engine):
            self.assertEqual(local_ocr.read_paddle(rgb, "eng"), TEXT.strip())
        np.testing.assert_array_equal(engine.predict.call_args.args[0], [[[30, 20, 10]]])

    def test_optional_dependency_missing_has_clear_message(self):
        local_ocr._paddle_engine.cache_clear()
        with mock.patch.dict(sys.modules, {"paddleocr": None}):
            with self.assertRaisesRegex(local_ocr.OcrUnavailable, "requirements-paddle.txt"):
                local_ocr.read_paddle(np.zeros((4, 4, 3), np.uint8), "eng")
        local_ocr._paddle_engine.cache_clear()

    def test_query_selects_paddle_before_paid_keys_and_uses_upright_clean_image(self):
        seen = []
        def read(rgb, backend, lang):
            seen.append((rgb, backend, lang))
            return TEXT
        async def request():
            async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app.app), base_url="http://test") as client:
                return await client.post("/api/extract?ocr=paddle", files={"file": ("camera.jpg", FIXTURE.read_bytes(), "image/jpeg")})
        with mock.patch.object(extract, "recognize", side_effect=read), mock.patch.object(
            extract, "vision_api_key", side_effect=AssertionError("Must not check paid keys")
        ), mock.patch.dict(os.environ, {"SPROUT_OCR": "tesseract"}):
            response = asyncio.run(request())
        scan = response.json()["scan"]
        self.assertEqual(scan["extraction"], "paddle")
        self.assertEqual(seen[0][1:], ("paddle", "eng"))
        self.assertGreater(seen[0][0].shape[0], seen[0][0].shape[1])
        self.assertIn("PaddleOCR", scan["questions"][0]["flags"][0]["note"])
        assert_child_view_safe(scan, to_child_view(scan))

    def test_environment_selects_paddle_and_missing_runtime_does_not_fall_back(self):
        with mock.patch.dict(os.environ, {"SPROUT_OCR": "paddle"}), mock.patch.object(
            extract, "recognize", side_effect=local_ocr.OcrUnavailable(local_ocr.PADDLE_HELP)
        ), mock.patch.object(extract, "vision_api_key", side_effect=AssertionError("Must not check paid keys")):
            result = asyncio.run(extract.extract_scan(FIXTURE.read_bytes(), "photo.jpg", False, ""))
        self.assertFalse(result["ok"])
        self.assertNotIn("need_ocr", result)
        self.assertIn("requirements-paddle.txt", result["message"])


class BatchTests(unittest.TestCase):
    def test_rejects_repository_output_and_symlinks_into_repository(self):
        with tempfile.TemporaryDirectory() as folder:
            link = Path(folder) / "checkout"
            link.symlink_to(extract.REPO_ROOT, target_is_directory=True)
            for output in (extract.REPO_ROOT / "results.csv", link / "results.csv"):
                with self.subTest(output=output), mock.patch("sys.stderr", new_callable=io.StringIO), self.assertRaises(SystemExit) as raised:
                    main(["--ocr", "paddle", folder, "--out", str(output)])
                self.assertEqual(raised.exception.code, 2)
                self.assertFalse(output.exists())

    def test_paddle_failure_gets_one_csv_row_and_nonzero_exit(self):
        with tempfile.TemporaryDirectory() as folder:
            photo = Path(folder) / "photo.jpg"
            photo.write_bytes(FIXTURE.read_bytes())
            output = Path(folder) / "results.csv"
            original = photo.read_bytes()
            with mock.patch.object(local_ocr, "_paddle_engine", side_effect=local_ocr.OcrUnavailable(local_ocr.PADDLE_HELP)):
                self.assertEqual(main(["--ocr", "paddle", folder, "--out", str(output)]), 1)
            with output.open() as handle:
                rows = list(csv.DictReader(handle))
            self.assertEqual(len(rows), 1)
            self.assertEqual(rows[0]["status"], "error")
            self.assertIn("requirements-paddle.txt", rows[0]["error"])
            self.assertEqual(photo.read_bytes(), original)
            self.assertEqual(sorted(p.name for p in Path(folder).iterdir()), ["photo.jpg", "results.csv"])

    @unittest.skipUnless(shutil.which("tesseract"), "Local Tesseract not installed")
    def test_real_module_cli_reads_rotated_fixture_and_continues_after_bad_image(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            (root / "rotated.jpg").write_bytes(FIXTURE.read_bytes())
            (root / "broken.jpg").write_bytes(b"invalid image")
            output = root / "results.csv"
            command = [sys.executable, "-B", "-m", "prototype.exam.server.batch", "--ocr", "tesseract", folder, "--out", str(output)]
            result = subprocess.run(command, cwd=extract.REPO_ROOT, capture_output=True, text=True, timeout=45)
            self.assertEqual(result.returncode, 1, result.stderr)
            with output.open() as handle:
                rows = list(csv.DictReader(handle))
            success = [row for row in rows if row["status"] == "ok"]
            self.assertEqual(len(success), 1, rows)
            self.assertIn("Count the seeds", success[0]["stem"])
            self.assertEqual(success[0]["file"], "rotated.jpg")
            self.assertEqual([row["file"] for row in rows if row["status"] == "error"], ["broken.jpg"])
            self.assertEqual(sorted(p.name for p in root.iterdir()), ["broken.jpg", "results.csv", "rotated.jpg"])
