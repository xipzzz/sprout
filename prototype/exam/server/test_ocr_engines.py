"""OCR engine choice (SPROUT_OCR / ?ocr=paddle), the PaddleOCR path, and the batch CLI."""

import asyncio
import csv
import os
import sys
import tempfile
import unittest
from pathlib import Path
from unittest import mock

import batch
import extract
import ocr_engines
from ocr_engines import PADDLE_INSTALL_HINT, OcrUnavailable, lines_from_boxes, pick_engine

FIXTURES = Path(__file__).resolve().parents[1] / "fixtures"
WORKSHEET_TEXT = (FIXTURES / "01-local-worksheet1.ocr.txt").read_text(encoding="utf-8")


def box(x, y, text, w=60, h=20):
    return [[x, y], [x + w, y], [x + w, y + h], [x, y + h]], text


class PickEngineTests(unittest.TestCase):
    def test_request_then_env_then_tesseract(self):
        with mock.patch.dict(os.environ, {"SPROUT_OCR": ""}):
            self.assertEqual(pick_engine(""), "tesseract")
            self.assertEqual(pick_engine("paddle"), "paddle")
            self.assertEqual(pick_engine("cloud"), "tesseract")
        with mock.patch.dict(os.environ, {"SPROUT_OCR": "Paddle"}):
            self.assertEqual(pick_engine(""), "paddle")
            self.assertEqual(pick_engine("tesseract"), "tesseract")


class PaddleLineTests(unittest.TestCase):
    def test_boxes_join_into_reading_order_lines(self):
        boxes = [
            box(200, 52, "toy."),
            box(10, 50, "1. Ali has a"),
            box(10, 100, "(1) It"),
            box(120, 102, "(2) He"),
        ]
        self.assertEqual(lines_from_boxes(boxes), "1. Ali has a toy.\n(1) It (2) He")

    def test_paddle_3_and_2_output_shapes(self):
        class Page:
            json = {"res": {"rec_polys": [box(0, 0, "")[0]], "rec_texts": ["Hello"]}}

        self.assertEqual(ocr_engines._paddle_boxes([Page()])[0][1], "Hello")
        legacy = [[[box(0, 0, "")[0], ("Hi", 0.9)]]]
        self.assertEqual(ocr_engines._paddle_boxes(legacy)[0][1], "Hi")


class PaddleScanTests(unittest.TestCase):
    def _scan(self, **patches):
        page = (FIXTURES / "01-local-worksheet1.jpg").read_bytes()
        with mock.patch.object(extract, "vision_api_key", return_value="would-be-paid"), mock.patch.multiple(
            extract, **patches
        ):
            return asyncio.run(extract.extract_scan(page, "page.jpg", False, "", "auto", "", "paddle"))

    def test_missing_paddle_gives_the_install_hint(self):
        with mock.patch.dict(sys.modules, {"paddleocr": None}):
            ocr_engines._paddle_readers.clear()
            result = self._scan(PADDLE_NOTE=extract.PADDLE_NOTE)
        self.assertFalse(result["ok"])
        self.assertTrue(result["ocr_unavailable"])
        self.assertEqual(result["message"], PADDLE_INSTALL_HINT)
        self.assertIn("requirements-paddle.txt", result["message"])

    def test_paddle_text_is_parsed_and_never_calls_vision(self):
        def fail_vision(*_args, **_kwargs):
            raise AssertionError("ocr=paddle must not call the vision model")

        result = self._scan(paddle_text=mock.Mock(return_value=WORKSHEET_TEXT), vision_extract=fail_vision)
        self.assertTrue(result["ok"])
        scan = result["scan"]
        self.assertEqual(scan["extraction"], "paddle")
        self.assertEqual(len(scan["questions"]), 5)
        notes = {flag["note"] for q in scan["questions"] for flag in q["flags"]}
        self.assertIn(extract.PADDLE_NOTE, notes)
        self.assertFalse(any("Tesseract.js" in note for note in notes))

    def test_browser_ocr_text_is_ignored_for_paddle(self):
        page = (FIXTURES / "01-local-worksheet1.jpg").read_bytes()
        reader = mock.Mock(return_value=WORKSHEET_TEXT)
        with mock.patch.object(extract, "paddle_text", reader):
            result = asyncio.run(extract.extract_scan(page, "p.jpg", False, "junk", "auto", "eng", "paddle"))
        reader.assert_called_once()
        self.assertTrue(result["ok"])


def repo_csvs() -> set[Path]:
    root = batch.REPO_ROOT
    return set(root.glob("*.csv")) | set((root / "prototype").rglob("*.csv")) | set((root / "src").rglob("*.csv"))


class BatchTests(unittest.TestCase):
    def test_refuses_an_out_path_inside_the_repo(self):
        with tempfile.TemporaryDirectory() as folder:
            (Path(folder) / "a.jpg").write_bytes((FIXTURES / "01-local-worksheet1.jpg").read_bytes())
            inside = batch.REPO_ROOT / "prototype" / "results.csv"
            with self.assertRaises(SystemExit), mock.patch("sys.stderr"):
                batch.main(["--ocr", "tesseract", folder, "--out", str(inside)])
            self.assertFalse(inside.exists())

    def test_missing_paddle_exits_with_the_hint(self):
        with tempfile.TemporaryDirectory() as folder, tempfile.TemporaryDirectory() as out_dir:
            (Path(folder) / "a.jpg").write_bytes((FIXTURES / "01-local-worksheet1.jpg").read_bytes())
            out = Path(out_dir) / "r.csv"
            with mock.patch.object(batch, "_paddle_reader", side_effect=OcrUnavailable(PADDLE_INSTALL_HINT)), mock.patch(
                "sys.stderr"
            ) as err:
                self.assertEqual(batch.main(["--ocr", "paddle", folder, "--out", str(out)]), 2)
            self.assertIn("requirements-paddle.txt", "".join(call.args[0] for call in err.write.call_args_list))
            self.assertFalse(out.exists())

    def test_writes_one_row_per_photo(self):
        before = repo_csvs()
        with tempfile.TemporaryDirectory() as folder, tempfile.TemporaryDirectory() as out_dir:
            for name in ("01-local-worksheet1.jpg", "02-rotated-exif6-worksheet1.jpg"):
                (Path(folder) / name).write_bytes((FIXTURES / name).read_bytes())
            (Path(folder) / "notes.txt").write_text("not a photo", encoding="utf-8")
            out = Path(out_dir) / "nested" / "results.csv"
            with mock.patch.object(extract, "_tesseract_text", return_value=WORKSHEET_TEXT), mock.patch("sys.stdout"):
                self.assertEqual(batch.main(["--ocr", "tesseract", folder, "--out", str(out)]), 0)
            rows = list(csv.DictReader(out.open(encoding="utf-8")))
        self.assertEqual([row["file"] for row in rows], ["01-local-worksheet1.jpg", "02-rotated-exif6-worksheet1.jpg"])
        self.assertEqual({row["ok"] for row in rows}, {"yes"})
        self.assertEqual({row["question_count"] for row in rows}, {"5"})
        self.assertEqual([row["exif_orientation"] for row in rows], ["1", "6"])
        self.assertEqual(repo_csvs(), before)


if __name__ == "__main__":
    unittest.main()
