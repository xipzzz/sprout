import os
import tempfile
import unittest
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

from deskew import prepare_page
from extract import load_fixture, parse_model_payload, questions_from_ocr, stub_scan
from save_note import render_markdown, save_scan
from schema import assert_child_view_safe, map_question, to_child_view


class SchemaTests(unittest.TestCase):
    def test_maps_goppai_shaped_question(self):
        question = map_question(
            {
                "id": "19",
                "stem": "客厅面积有____平方米",
                "options": {"A": "30", "B": "15"},
                "student_answer": {"final": "30, 15"},
                "teacher_feedback": {"is_correct": True, "score": "2分", "symbols": ["√"]},
                "correct_answer": "30",
                "explanation": "四分之一乘以一百二十是三十。",
            },
            1,
        )
        self.assertEqual(question["stem"], "客厅面积有____平方米")
        self.assertEqual(question["choices"], ["30", "15"])
        self.assertEqual(question["student_answer"], "30, 15")
        self.assertEqual(question["teacher_mark"], "√ 2分")
        self.assertEqual(question["correct_answer"], "30")
        self.assertTrue(any(flag["field"] == "explanation" for flag in question["flags"]))

    def test_child_view_drops_answers(self):
        scan = stub_scan("sample-exam-english.png")
        scan["questions"].append(
            map_question(
                {
                    "id": "9",
                    "stem": "Read this.",
                    "choices": [],
                    "student_answer": "secret-handwriting",
                    "teacher_mark": "2分",
                    "correct_answer": "hidden-key",
                    "explanation": "The answer is hidden-key.",
                    "flags": [{"field": "correct_answer", "kind": "reconstructed", "note": "Guessed hidden-key."}],
                },
                9,
            )
        )
        child = to_child_view(scan)
        assert_child_view_safe(scan, child)
        blob = __import__("json").dumps(child, ensure_ascii=False)
        for secret in ("watr", "secret-handwriting", "hidden-key", "2分", "✓", "×", "Guessed hidden-key"):
            self.assertNotIn(secret, blob)

    def test_model_fence_and_ocr_flags(self):
        data = parse_model_payload('```json\n{"questions":[{"stem":"Hi?","choices":["a","b"]}]}\n```')
        self.assertEqual(data["questions"][0]["stem"], "Hi?")
        questions = questions_from_ocr("1. Which word?\nA) bloom\nB) root\n")
        fields = {flag["field"] for flag in questions[0]["flags"]}
        self.assertIn("stem", fields)
        self.assertIn("correct_answer", fields)
        self.assertIn("explanation", fields)


class DeskewTests(unittest.TestCase):
    def test_rotated_page_is_straightened(self):
        page = Image.new("RGB", (420, 560), "white")
        draw = ImageDraw.Draw(page)
        draw.rectangle((40, 36, 380, 58), fill=(10, 10, 10))
        canvas = Image.new("RGB", (760, 900), (90, 84, 78))
        turned = page.rotate(28, expand=True, fillcolor=(90, 84, 78))
        canvas.paste(turned, (50, 40))
        buffer = __import__("io").BytesIO()
        canvas.save(buffer, format="PNG")
        prepared = prepare_page(buffer.getvalue())
        self.assertTrue(prepared["deskew"]["applied"])
        encoded = prepared["deskew_jpeg"].split(",", 1)[1]
        flat = np.asarray(Image.open(__import__("io").BytesIO(__import__("base64").b64decode(encoded))))
        dark = flat.min(axis=2) < 40
        ys, xs = np.where(dark)
        self.assertGreater(ys.size, 30)
        self.assertLess(ys.std(), xs.std() * 0.35)


class SaveTests(unittest.TestCase):
    def test_writes_vault_and_local_copy(self):
        scan = stub_scan("sample-exam-english.png")
        scan["deskew"] = {"applied": True, "corners": []}
        scan["ink_pixels_lifted"] = 12
        try:
            with tempfile.TemporaryDirectory() as vault, tempfile.TemporaryDirectory() as local:
                os.environ["SPROUT_VAULT_DIR"] = vault
                os.environ["SPROUT_SAVE_DIR"] = local
                paths = save_scan(scan)
                self.assertEqual(paths["skipped"], [])
                self.assertEqual(len(paths["paths"]), 2)
                self.assertTrue(all(Path(path).name.endswith("-english.md") for path in paths["paths"]))
                text = Path(paths["paths"][0]).read_text(encoding="utf-8")
                parent, practice = text.split("## Practice prompts", 1)
                self.assertIn("source_photo:", parent)
                self.assertIn("question_count: 3", parent)
                self.assertIn("watr", parent)
                self.assertIn("✓", parent)
                self.assertNotIn("watr", practice)
                self.assertNotIn("✓", practice)
                self.assertNotIn("×", practice)
                self.assertNotIn("The missing word is water", practice)
                self.assertIn("## Parent copy", render_markdown(scan))
        finally:
            os.environ.pop("SPROUT_VAULT_DIR", None)
            os.environ.pop("SPROUT_SAVE_DIR", None)


if __name__ == "__main__":
    unittest.main()
