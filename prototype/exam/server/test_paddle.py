"""The optional PaddleOCR path, the engine switch, and the batch CLI.

Unit tests run everywhere. Tests marked "real Paddle" run only when
requirements-paddle.txt is installed (they download ~13 MB of models once).
"""

import asyncio
import csv
import os
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from unittest import mock

import numpy as np
from fastapi.testclient import TestClient

import app as app_module
import batch
import extract
import paddle_ocr
import synthetic_pages as sp
from extract import extract_scan
from paddle_ocr import Box, group_lines, lines_to_text
from schema import assert_child_view_safe, to_child_view

SERVER = Path(__file__).resolve().parent
REPO = SERVER.parents[2]
SYNTH = SERVER.parent / "fixtures" / "synthetic"
REAL = SERVER.parent / "fixtures" / "01-local-worksheet1.jpg"


def run(coro):
    return asyncio.run(coro)


def paddle_scan(jpeg: bytes, text: str) -> dict:
    with mock.patch.object(paddle_ocr, "available", return_value=True), mock.patch.object(
        paddle_ocr, "paddle_text", return_value=text
    ):
        return run(extract_scan(jpeg, "page.jpg", False, "", "auto", "", "paddle"))


class EngineSwitchTests(unittest.TestCase):
    def test_default_is_tesseract(self):
        with mock.patch.dict(os.environ, {}, clear=False):
            os.environ.pop("SPROUT_OCR", None)
            self.assertEqual(paddle_ocr.engine_name(), "tesseract")
            self.assertEqual(paddle_ocr.engine_name(""), "tesseract")

    def test_env_and_explicit_choice(self):
        with mock.patch.dict(os.environ, {"SPROUT_OCR": "Paddle"}):
            self.assertEqual(paddle_ocr.engine_name(), "paddle")
            self.assertEqual(paddle_ocr.engine_name("tesseract"), "tesseract")

    def test_unknown_engine_is_refused(self):
        with self.assertRaises(ValueError):
            paddle_ocr.engine_name("got-ocr")

    def test_missing_paddle_names_the_install_command(self):
        with mock.patch.object(paddle_ocr, "available", return_value=False):
            result = run(extract_scan(sp.clean_blue_url().jpeg, "page.jpg", False, "", "auto", "", "paddle"))
        self.assertFalse(result["ok"])
        self.assertTrue(result["engine_missing"])
        self.assertIn("requirements-paddle.txt", result["message"])
        self.assertNotIn("scan", result)

    def test_explicit_engine_skips_the_vision_key(self):
        text = (SYNTH / "clean-blue-url.ocr-clean.txt").read_text(encoding="utf-8")
        with mock.patch.object(extract, "vision_api_key", return_value="sk-test") as key, mock.patch.object(
            extract, "vision_extract"
        ) as vision:
            result = paddle_scan(sp.clean_blue_url().jpeg, text)
        vision.assert_not_called()
        key.assert_not_called()
        self.assertEqual(result["scan"]["extraction"], "paddle")


class ApiPassThroughTests(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app_module.app)
        self.calls = []

        async def fake(*args):
            self.calls.append(args)
            return {"ok": True}

        patcher = mock.patch.object(app_module, "extract_scan", side_effect=fake)
        patcher.start()
        self.addCleanup(patcher.stop)

    def post(self, url: str, data: dict | None = None):
        return self.client.post(url, files={"file": ("page.jpg", b"jpeg", "image/jpeg")}, data=data or {})

    def test_query_option_reaches_extract(self):
        self.assertEqual(self.post("/api/extract?ocr=paddle").status_code, 200)
        self.assertEqual(self.calls[-1][-1], "paddle")

    def test_form_field_reaches_extract(self):
        self.post("/api/extract", {"ocr": "paddle"})
        self.assertEqual(self.calls[-1][-1], "paddle")

    def test_no_choice_leaves_it_to_the_server(self):
        self.post("/api/extract")
        self.assertEqual(self.calls[-1][-1], "")

    def test_unknown_engine_is_a_400(self):
        response = self.post("/api/extract?ocr=nope")
        self.assertEqual(response.status_code, 400)
        self.assertFalse(response.json()["ok"])
        self.assertEqual(self.calls, [])

    def test_health_reports_the_engine(self):
        body = self.client.get("/api/health").json()
        self.assertIn(body["ocr_default"], paddle_ocr.ENGINES)
        self.assertIsInstance(body["paddle_installed"], bool)


class LineOrderTests(unittest.TestCase):
    def test_boxes_become_lines_top_to_bottom_left_to_right(self):
        boxes = [
            Box("(A) in", 40, 130, 120, 160),
            Box("fence.", 400, 82, 470, 112),
            Box("1. The horse jumped", 40, 80, 260, 110),
            Box("(B) on", 200, 132, 280, 162),
        ]
        lines = group_lines(boxes)
        self.assertEqual([[b.text for b in line] for line in lines], [["1. The horse jumped", "fence."], ["(A) in", "(B) on"]])

    def test_a_tall_box_does_not_chain_two_lines(self):
        boxes = [Box("one", 0, 0, 50, 30), Box("tall", 60, 10, 110, 70), Box("two", 0, 45, 50, 75)]
        self.assertEqual(len(group_lines(boxes)), 3)

    def test_printed_line_in_a_gap_becomes_a_blank(self):
        rgb = np.full((200, 600, 3), 250, np.uint8)
        rgb[108:111, 270:390] = 20
        left, right = Box("The horse jumped _", 40, 80, 260, 110), Box(".the fence.", 400, 82, 470, 112)
        self.assertEqual(lines_to_text([[left, right]], rgb), "The horse jumped ____ the fence.")
        self.assertEqual(lines_to_text([[left, right]], np.full_like(rgb, 250)), "The horse jumped _ .the fence.")


class PaddleParseTests(unittest.TestCase):
    """Paddle text goes through the same parser, cleanup and flags as Tesseract."""

    def test_chinese_text_is_read_as_chinese_with_flags(self):
        text = (SYNTH / "chinese-ink-mcq.ocr-chi_sim.txt").read_text(encoding="utf-8")
        result = paddle_scan(sp.chinese_ink_mcq().jpeg, text)
        scan = result["scan"]
        self.assertEqual((scan["subject"], scan["ocr_lang"], scan["ocr_engine"]), ("chinese", "chi_sim", "paddle"))
        self.assertEqual([len(q["choices"]) for q in scan["questions"]], [4, 4, 4, 4])
        self.assertIn("PaddleOCR PP-OCRv5", " ".join(f["note"] for f in scan["page_flags"]))
        self.assertTrue(all("PaddleOCR" in q["flags"][0]["note"] for q in scan["questions"]))
        self.assertEqual(set(result["timings"]), {"prepare_s", "ocr_s"})
        assert_child_view_safe(scan, to_child_view(scan))

    def test_empty_read_is_unsupported(self):
        result = paddle_scan(sp.clean_blue_url().jpeg, "")
        self.assertTrue(result["unsupported"])
        self.assertNotIn("scan", result)


@unittest.skipUnless(paddle_ocr.available(), "real Paddle: pip install -r requirements-paddle.txt")
class RealPaddleTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.results = {}

    def read(self, name: str, jpeg: bytes) -> dict:
        if name not in self.results:
            self.results[name] = run(extract_scan(jpeg, f"{name}.jpg", False, "", "auto", "", "paddle"))
        result = self.results[name]
        self.assertTrue(result["ok"], result.get("message"))
        assert_child_view_safe(result["scan"], to_child_view(result["scan"]))
        self.assertEqual(batch.child_guard(result["scan"]), "pass")
        return result["scan"]

    def test_blue_ink_page(self):
        questions = self.read("blue", sp.blue_ink_mcq().jpeg)["questions"]
        self.assertEqual([len(q["choices"]) for q in questions], [3, 3, 3, 3, 3])
        self.assertGreaterEqual(sum("____" in q["stem"] for q in questions), 4)
        self.assertEqual(questions[1]["stem"], "Samad and Ali ____ cleaning the whiteboard.")

    def test_cloze_page(self):
        scan = self.read("cloze", sp.cloze_passage().jpeg)
        self.assertEqual(len(scan["questions"]), 6)
        self.assertEqual(scan["questions"][0]["stem"], "Last Sunday, Ben and his family went ____ the zoo.")
        self.assertIn("cloze", [f["kind"] for f in scan["page_flags"]])

    def test_chinese_page(self):
        scan = self.read("chinese", sp.chinese_mcq().jpeg)
        self.assertEqual(scan["ocr_lang"], "chi_sim")
        self.assertEqual(scan["questions"][0]["stem"], "小明每天早上七点钟去学校。")
        self.assertEqual(scan["questions"][0]["choices"], ["上课", "学校", "公园", "商店"])

    def test_chinese_page_with_ink_keeps_the_blanks(self):
        scan = self.read("chinese-ink", sp.chinese_ink_mcq().jpeg)
        self.assertEqual([len(q["choices"]) for q in scan["questions"]], [4, 4, 4, 4])
        self.assertEqual(scan["questions"][0]["stem"], "小华____和妈妈去公园玩。")
        self.assertTrue(all("____" in q["stem"] for q in scan["questions"]))

    def test_real_photo(self):
        questions = self.read("real", REAL.read_bytes())["questions"]
        self.assertEqual([len(q["choices"]) for q in questions], [3, 3, 3, 3, 3])
        self.assertTrue(all("____" in q["stem"] for q in questions))


class BatchTests(unittest.TestCase):
    def setUp(self):
        self.tmp = Path(tempfile.mkdtemp(prefix="sprout-batch-test-"))
        self.addCleanup(shutil.rmtree, self.tmp, True)
        (self.tmp / "pages").mkdir()
        (self.tmp / "pages" / "chinese-ink.jpg").write_bytes(sp.chinese_ink_mcq().jpeg)

    def test_refuses_to_write_inside_the_repo(self):
        out = REPO / "prototype" / "exam" / "results.csv"
        with mock.patch("sys.stderr"):
            self.assertEqual(batch.main([str(self.tmp / "pages"), "--ocr", "tesseract", "--out", str(out)]), 2)
        self.assertFalse(out.exists())

    def test_missing_paddle_exits_with_the_install_command(self):
        with mock.patch.object(paddle_ocr, "available", return_value=False), mock.patch("sys.stderr") as err:
            code = batch.main([str(self.tmp / "pages"), "--ocr", "paddle", "--out", str(self.tmp / "out.csv")])
        self.assertEqual(code, 2)
        self.assertIn("requirements-paddle.txt", "".join(str(c) for c in err.write.call_args_list))

    def test_split_check(self):
        self.assertEqual(batch.split_check([1, 2, 3], [1, 2, 3]), "ok")
        self.assertEqual(batch.split_check([12, 13, 15], [12, 13, 14, 15]), "extra 14")
        self.assertEqual(batch.split_check([1, 2, 3], [1, 3]), "missing 2")

    def test_child_guard_catches_a_leak(self):
        scan = {"questions": [{"id": "1", "stem": "s", "choices": ["a", "b"]}]}
        self.assertEqual(batch.child_guard(scan), "pass")
        with mock.patch.object(batch, "to_child_view", side_effect=lambda s: {"questions": s["questions"]}):
            self.assertTrue(batch.child_guard(scan).startswith("FAIL"))

    def test_csv_row_from_a_mocked_paddle_read(self):
        text = (SYNTH / "chinese-ink-mcq.ocr-chi_sim.txt").read_text(encoding="utf-8")
        out = self.tmp / "results" / "paddle.csv"
        with mock.patch.object(paddle_ocr, "available", return_value=True), mock.patch.object(
            paddle_ocr, "paddle_text", return_value=text
        ), mock.patch("sys.stderr"):
            code = batch.main([str(self.tmp / "pages"), "--ocr", "paddle", "--out", str(out)])
        self.assertEqual(code, 0)
        rows = list(csv.DictReader(out.read_text(encoding="utf-8").splitlines()))
        self.assertEqual(list(rows[0]), batch.COLUMNS)
        row = rows[0]
        self.assertEqual((row["file"], row["engine"], row["status"], row["ocr_lang"]), ("chinese-ink.jpg", "paddle", "ok", "chi_sim"))
        self.assertEqual((row["questions"], row["choices_parsed"], row["split_check"]), ("4", "4", "ok"))
        self.assertEqual(row["printed_numbers"], "1 2 3 4")
        self.assertEqual(row["child_guard"], "pass")
        self.assertGreater(float(row["total_s"]), 0)

    def test_cli_module_writes_nothing_into_the_repo(self):
        refused = self.cli(str(self.tmp / "pages"), "--ocr", "tesseract", "--out", str(REPO / "x.csv"))
        self.assertEqual(refused.returncode, 2, refused.stderr)
        self.assertIn("outside the repo", refused.stderr)
        self.assertFalse((REPO / "x.csv").exists())

        (self.tmp / "empty").mkdir()
        done = self.cli(str(self.tmp / "empty"), "--ocr", "tesseract", "--out", str(self.tmp / "empty.csv"))
        self.assertEqual(done.returncode, 0, done.stderr)
        self.assertEqual((self.tmp / "empty.csv").read_text(encoding="utf-8").strip(), ",".join(batch.COLUMNS))

        if paddle_ocr.available():
            done = self.cli(str(self.tmp / "pages"), "--ocr", "paddle", "--out", str(self.tmp / "paddle.csv"))
            self.assertEqual(done.returncode, 0, done.stderr)
            row = next(csv.DictReader((self.tmp / "paddle.csv").read_text(encoding="utf-8").splitlines()))
            self.assertEqual((row["status"], row["questions"], row["child_guard"]), ("ok", "4", "pass"))

    def cli(self, *args: str) -> subprocess.CompletedProcess:
        """Run the CLI as the owner would and fail if it adds or changes any file in the repo."""
        before = repo_files()
        env = {k: v for k, v in os.environ.items() if k != "PYTHONDONTWRITEBYTECODE"}
        done = subprocess.run(
            [sys.executable, "-m", "prototype.exam.server.batch", *args], cwd=REPO, capture_output=True, text=True, env=env
        )
        after = repo_files()
        self.assertEqual(sorted(set(after) - set(before)), [])
        self.assertEqual([p for p in after if after[p] != before[p]], [])
        return done


def repo_files() -> dict[str, int]:
    skip = {".git", ".venv", "node_modules"}
    files = {}
    for root, dirs, names in os.walk(REPO):
        dirs[:] = [d for d in dirs if d not in skip]
        for name in names:
            path = os.path.join(root, name)
            files[path] = os.stat(path).st_mtime_ns
    return files


if __name__ == "__main__":
    unittest.main()
