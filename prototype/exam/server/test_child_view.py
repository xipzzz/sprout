import os
import tempfile
import unittest
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

from deskew import load_rgb, prepare_page
from extract import load_fixture, parse_model_payload, questions_from_ocr, stub_scan
from save_note import render_markdown, save_scan
from schema import assert_child_view_safe, map_question, to_child_view


class SchemaTests(unittest.TestCase):
    def test_maps_nested_reader_fields(self):
        question = map_question(
            {
                "id": "19",
                "stem": "花瓶里有____朵花。",
                "options": {"A": "7", "B": "9"},
                "student_answer": {"final": "9"},
                "teacher_feedback": {"is_correct": True, "score": "2分", "symbols": ["√"]},
                "correct_answer": "7",
                "explanation": "三朵加四朵是七朵。",
            },
            1,
        )
        self.assertEqual(question["stem"], "花瓶里有____朵花。")
        self.assertEqual(question["choices"], ["7", "9"])
        self.assertEqual(question["student_answer"], "9")
        self.assertEqual(question["teacher_mark"], "√ 2分")
        self.assertEqual(question["correct_answer"], "7")
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

    def test_answer_tokens_not_numeric_substrings_or_ids(self):
        for answer, stem in (("8", "Count 58 seeds."), ("seed", "Count seedlings.")):
            scan = {"subject": "math", "questions": [map_question({"id": "8", "stem": stem, "correct_answer": answer}, 8)]}
            assert_child_view_safe(scan, to_child_view(scan))

    def test_whole_answer_token_is_rejected(self):
        for stem in ("Count 8 seeds.", "Count (8).", "Answer: 8!"):
            scan = {"questions": [map_question({"id": "1", "stem": stem, "correct_answer": "8"}, 1)]}
            with self.subTest(stem=stem), self.assertRaises(AssertionError):
                assert_child_view_safe(scan, to_child_view(scan))

    def test_other_question_choice_does_not_hide_answer_in_stem(self):
        scan = {"questions": [
            map_question({"stem": "Answer: 8.", "correct_answer": "8"}, 1),
            map_question({"stem": "Pick a number.", "choices": ["8", "9"]}, 2),
        ]}
        with self.assertRaises(AssertionError):
            assert_child_view_safe(scan, to_child_view(scan))

    def test_model_fence_and_ocr_flags(self):
        data = parse_model_payload('```json\n{"questions":[{"stem":"Hi?","choices":["a","b"]}]}\n```')
        self.assertEqual(data["questions"][0]["stem"], "Hi?")
        questions = questions_from_ocr("1. Which word?\nA) bloom\nB) root\n")
        fields = {flag["field"] for flag in questions[0]["flags"]}
        self.assertIn("stem", fields)
        self.assertNotIn("explanation", fields)
        self.assertEqual(questions[0]["correct_answer"], "")
        self.assertEqual(questions[0]["explanation"], "")


class DeskewTests(unittest.TestCase):
    def test_camera_exif_fixture_is_upright_before_deskew_and_ocr(self):
        photo = (Path(__file__).resolve().parents[1] / "fixtures" / "exif-rotate-6.jpg").read_bytes()
        upright = load_rgb(photo)
        self.assertEqual(upright.size, (360, 520))
        self.assertLess(np.asarray(upright)[30:60, 30:60].mean(), 10)
        prepared = prepare_page(photo)
        # The OCR input and both previews must use the same upright coordinate system.
        images = [prepared["clean_rgb"]]
        for key in ("deskew_jpeg", "clean_jpeg", "ocr_jpeg"):
            data = __import__("base64").b64decode(prepared[key].split(",", 1)[1])
            preview = Image.open(__import__("io").BytesIO(data))
            self.assertNotIn(274, preview.getexif())
            images.append(np.asarray(preview))
        for image in images:
            self.assertGreater(image.shape[0], image.shape[1])
            self.assertLess(image[30:60, 30:60].mean(), 10)
            self.assertGreater(image[-70:-30, -70:-30].mean(), 240)

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

    def test_resave_updates_the_same_note_only_inside_the_vault(self):
        scan = reviewed_scan()
        try:
            with tempfile.TemporaryDirectory() as vault, tempfile.TemporaryDirectory() as elsewhere:
                os.environ["SPROUT_VAULT_DIR"] = vault
                os.environ.pop("SPROUT_SAVE_DIR", None)
                first = save_scan(scan)["paths"]
                again = save_scan(scan, first)["paths"]
                self.assertEqual(first, again)
                self.assertEqual(len(os.listdir(vault)), 1)

                outside = Path(elsewhere) / Path(first[0]).name
                outside.write_text("keep", encoding="utf-8")
                odd = Path(vault) / "notes.md"
                odd.write_text("keep", encoding="utf-8")
                moved = save_scan(scan, [str(outside), str(odd)])["paths"]
                self.assertEqual(outside.read_text(encoding="utf-8"), "keep")
                self.assertEqual(odd.read_text(encoding="utf-8"), "keep")
                self.assertEqual(Path(moved[0]).parent, Path(vault))
                self.assertNotEqual(moved, first)
        finally:
            os.environ.pop("SPROUT_VAULT_DIR", None)


def reviewed_scan(statuses=("picked", "picked", "dropped")):
    answers = ["He", "are", ""]
    stems = [
        "Ali is playing with his new toy. ____ is having fun.",
        "Samad and Ali ____ cleaning the whiteboard.",
        "The horse jumped ____ the fence.",
    ]
    choices = [["It", "He", "She"], ["is", "are", "was"], ["in", "on", "over"]]
    questions = []
    for index, status in enumerate(statuses):
        questions.append(
            {
                "id": str(index + 1),
                "stem": stems[index],
                "choices": choices[index],
                "student_answer": "",
                "teacher_mark": "",
                "correct_answer": answers[index] if status == "picked" else "",
                "explanation": "Tesseract read the print.",
                "flags": [],
                "review": status,
                "stem_edited": index == 0,
            }
        )
    return {
        "extraction": "tesseract",
        "subject": "english",
        "paper_title": "Worksheet 2",
        "source_photo": "src-01.jpg",
        "note": "",
        "deskew": {"applied": True, "corners": []},
        "ink_pixels_lifted": 0,
        "questions": questions,
    }


class ReviewNoteTests(unittest.TestCase):
    def test_picks_go_to_the_parent_section_only(self):
        scan = reviewed_scan()
        text = render_markdown(scan)
        parent, practice = text.split("## Practice prompts", 1)
        self.assertIn("practice_count: 2", parent)
        self.assertIn("Practice answer, picked by parent (hidden from the child): He", parent)
        self.assertIn("Practice answer, picked by parent (hidden from the child): are", parent)
        self.assertIn("Dropped by parent. Not in practice.", parent)
        self.assertIn("Stem edited by parent before practice.", parent)
        self.assertNotIn("picked", practice)
        self.assertNotIn("Practice answer", practice)
        self.assertNotIn("The horse jumped", practice)
        self.assertIn("### 1. Ali is playing with his new toy. ____ is having fun.", practice)

        child = to_child_view(scan)
        assert_child_view_safe(scan, child)
        self.assertEqual([q["id"] for q in child["questions"]], ["1", "2"])
        for question in child["questions"]:
            self.assertEqual(set(question), {"id", "stem", "choices"})

    def test_open_question_locks_practice_in_the_note(self):
        text = render_markdown(reviewed_scan(("picked", "open", "picked")))
        parent, practice = text.split("## Practice prompts", 1)
        self.assertIn("practice_count: 0", parent)
        self.assertIn("Practice answer: not picked yet. Practice stays locked.", parent)
        self.assertIn("Practice is locked", practice)
        self.assertNotIn("###", practice)

    def test_every_question_dropped_means_no_practice(self):
        scan = reviewed_scan(("dropped", "dropped", "dropped"))
        self.assertEqual(to_child_view(scan)["questions"], [])
        practice = render_markdown(scan).split("## Practice prompts", 1)[1]
        self.assertIn("No practice. Every question was dropped.", practice)
        self.assertNotIn("###", practice)


if __name__ == "__main__":
    unittest.main()
