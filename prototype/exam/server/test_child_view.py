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
        self.assertEqual(question["choice_labels"], ["A", "B"])
        self.assertEqual(question["question_type"], "multiple_choice")
        self.assertIs(question["is_correct"], True)
        self.assertEqual(question["student_marks"], "2分")

    def test_extra_page_fields_stay_parent_side(self):
        raw = {
            "id": "4",
            "stem": "Sam has 3 bags of 6 apples.",
            "type": "word problem",
            "student_answer": "18",
            "working": "3 x 6 = 18\n18 apples",
            "teacher_feedback": {"comment": ["Neat working,", "well done"], "score": "2/2"},
            "teacher_mark": "✓",
            "correct_answer": "18",
            "sub_questions": [
                {"label": "a", "stem": "How many bags?", "student_answer": "3", "teacher_mark": "✓", "answer": "3"},
                {"stem": "How many apples in each bag?", "student_answer": "sub-wrote-five", "teacher_mark": "×",
                 "correct_answer": "sub-key-six", "working_steps": ["sub-step counted"]},
            ],
            "flags": [{"field": "teacher_comment", "kind": "reconstructed", "note": "Faint red pen."}],
        }
        question = map_question(raw, 4)
        self.assertEqual(question["question_type"], "open")
        self.assertEqual(question["working_steps"], ["3 x 6 = 18", "18 apples"])
        self.assertEqual(question["teacher_comment"], "Neat working, well done")
        self.assertEqual(question["student_marks"], "2/2")
        self.assertIs(question["is_correct"], True)
        self.assertEqual([sub["label"] for sub in question["sub_questions"]], ["a", "b"])
        self.assertEqual(question["sub_questions"][0]["correct_answer"], "3")
        self.assertIs(question["sub_questions"][1]["is_correct"], False)
        self.assertEqual(question["flags"][0]["field"], "teacher_comment")

        scan = {"subject": "math", "questions": [question]}
        child = to_child_view(scan)
        assert_child_view_safe(scan, child)
        self.assertEqual(set(child["questions"][0]), {"id", "stem", "choices"})
        blob = __import__("json").dumps(child, ensure_ascii=False)
        for secret in ("Neat working", "18 apples", "2/2", "sub-wrote-five", "sub-key-six", "sub-step", "open"):
            self.assertNotIn(secret, blob)

        leaked = {"subject": "math", "questions": [{**child["questions"][0], "stem": "Neat working, well done"}]}
        with self.assertRaises(AssertionError):
            assert_child_view_safe(scan, leaked)
        for key in ("working_steps", "sub_questions", "teacher_comment", "is_correct", "question_type", "choice_labels"):
            with self.subTest(key), self.assertRaises(AssertionError):
                assert_child_view_safe(scan, {"questions": [{**child["questions"][0], key: "x"}]})

        note = render_markdown(scan)
        parent_copy, practice = note.split("## Practice prompts")
        for shown in ("Question type: open", "Marked: right", "Marks: 2/2", "Teacher's comment: Neat working",
                      "Working: 3 x 6 = 18 / 18 apples", "(b) How many apples in each bag?", "sub-key-six"):
            self.assertIn(shown, parent_copy)
        for secret in ("Neat working", "sub-key-six", "Marks:"):
            self.assertNotIn(secret, practice)

    def test_question_type_and_mark_fallbacks(self):
        self.assertEqual(map_question({"stem": "She ____ a bag.", "teacher_mark": "x"}, 1)["question_type"], "fill_blank")
        self.assertIs(map_question({"stem": "Hi", "teacher_mark": "x"}, 1)["is_correct"], False)
        self.assertIsNone(map_question({"stem": "Hi", "teacher_mark": "✓ ×"}, 1)["is_correct"])
        self.assertEqual(map_question({"stem": "Hi", "choices": ["a", "b"], "choice_labels": ["A"]}, 1)["choice_labels"], [])
        self.assertEqual(map_question({"stem": "Hi", "type": "填空题"}, 1)["question_type"], "fill_blank")

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
        self.assertNotIn("explanation", fields)
        self.assertEqual(questions[0]["correct_answer"], "")
        self.assertEqual(questions[0]["explanation"], "")


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
