import os
import tempfile
import unittest
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

from deskew import prepare_page
from extract import load_fixture, parse_model_payload, questions_from_ocr, stub_scan
from save_note import render_markdown, save_scan
from schema import assert_child_view_safe, contains_token, map_question, to_child_view


class SchemaTests(unittest.TestCase):
    def test_maps_nested_answer_and_feedback_shape(self):
        # Sprout's own sample, written in the nested shape the mapper also accepts.
        question = map_question(
            {
                "id": "7",
                "stem": "小明有____支红笔和____支蓝笔",
                "options": {"A": "6", "B": "9"},
                "student_answer": {"final": "6 和 9"},
                "teacher_feedback": {"is_correct": False, "score": "1分", "symbols": ["×"]},
                "correct_answer": "6",
                "explanation": "一共十五支，蓝笔比红笔多三支。",
            },
            1,
        )
        self.assertEqual(question["stem"], "小明有____支红笔和____支蓝笔")
        self.assertEqual(question["choices"], ["6", "9"])
        self.assertEqual(question["student_answer"], "6 和 9")
        self.assertEqual(question["teacher_mark"], "× 1分")
        self.assertEqual(question["correct_answer"], "6")
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
                    "teacher_mark": "3分",
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
        for secret in ("watr", "secret-handwriting", "hidden-key", "3分", "✓", "×", "Guessed hidden-key"):
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


def rich_question() -> dict:
    """Sprout's own sample with every extra field a reader can return."""
    return map_question(
        {
            "id": "4",
            "type": "word problem",
            "stem": "Mei has 12 stickers. She gives away some.",
            "options": {"A": "5", "B": "7"},
            "student_answer": {"final": "7", "steps": ["12 - 5 = 7"]},
            "teacher_feedback": {"is_correct": True, "score": "2", "symbols": ["✓"], "comment": "Neat working!"},
            "sub_questions": [
                {"id": "4a", "stem": "How many are left?", "student_answer": "seven", "correct_answer": "seven"},
            ],
        },
        4,
    )


class ExtraFieldTests(unittest.TestCase):
    def test_extra_fields_land_on_the_parent_question(self):
        question = rich_question()
        self.assertEqual(question["choice_labels"], ["A", "B"])
        self.assertEqual(question["question_type"], "word problem")
        self.assertEqual(question["working"], ["12 - 5 = 7"])
        self.assertIs(question["is_correct"], True)
        self.assertEqual(question["teacher_comment"], "Neat working!")
        self.assertEqual(question["marks"], "2")
        self.assertEqual([sub["id"] for sub in question["sub_questions"]], ["4a"])
        self.assertEqual(question["sub_questions"][0]["correct_answer"], "seven")

    def test_flat_sprout_keys_map_too(self):
        question = map_question(
            {"stem": "Pick one.", "choices": ["x", "y"], "choice_labels": ["1", "2"], "is_correct": "yes", "marks": "1/2"},
            2,
        )
        self.assertEqual(question["choice_labels"], ["1", "2"])
        self.assertIsNone(question["is_correct"])
        self.assertEqual(question["marks"], "1/2")
        self.assertEqual(question["sub_questions"], [])

    def test_child_view_keeps_only_id_stem_choices(self):
        scan = {"subject": "math", "questions": [rich_question()]}
        child = to_child_view(scan)
        assert_child_view_safe(scan, child)
        self.assertEqual(child["questions"], [
            {"id": "4", "stem": "Mei has 12 stickers. She gives away some.", "choices": ["5", "7"]}
        ])
        blob = __import__("json").dumps(child, ensure_ascii=False)
        for secret in ("Neat working", "12 - 5 = 7", "seven", "4a", "word problem"):
            self.assertNotIn(secret, blob)

    def test_extra_fields_in_a_child_payload_fail(self):
        scan = {"subject": "math", "questions": [rich_question()]}
        child = to_child_view(scan)
        child["questions"][0]["choice_labels"] = ["A", "B"]
        with self.assertRaises(AssertionError):
            assert_child_view_safe(scan, child)

    def test_sub_question_answer_in_a_stem_fails(self):
        scan = {"subject": "math", "questions": [rich_question()]}
        child = to_child_view(scan)
        child["questions"][0]["stem"] += " Hint: seven."
        with self.assertRaises(AssertionError):
            assert_child_view_safe(scan, child)

    def test_teacher_comment_in_a_stem_fails(self):
        scan = {"subject": "math", "questions": [rich_question()]}
        child = to_child_view(scan)
        child["questions"][0]["stem"] = "Neat working!"
        with self.assertRaises(AssertionError):
            assert_child_view_safe(scan, child)

    def test_ocr_keeps_printed_choice_labels(self):
        questions = questions_from_ocr("1. Which word?\nA) bloom\nB) root\n\n2. Pick a number.\n(1) ten (2) six (3) nine\n")
        self.assertEqual(questions[0]["choice_labels"], ["A", "B"])
        self.assertEqual(questions[1]["choice_labels"], ["1", "2", "3"])

    def test_note_shows_extras_in_the_parent_copy_only(self):
        scan = {"subject": "math", "paper_title": "Sums", "questions": [rich_question()]}
        parent, practice = render_markdown(scan).split("## Practice prompts", 1)
        for line in ("Choice labels: A, B", "Question type: word problem", "Child's working: 12 - 5 = 7",
                     "Teacher marked it right.", "Marks: 2", "Teacher's comment: Neat working!", "Part 4a:"):
            self.assertIn(line, parent)
        for secret in ("Neat working", "12 - 5", "Part 4a", "word problem"):
            self.assertNotIn(secret, practice)


class WholeTokenTests(unittest.TestCase):
    def _scan(self, stem):
        return {
            "subject": "math",
            "questions": [map_question({"id": "8", "stem": stem, "correct_answer": "8"}, 1)],
        }

    def test_answer_inside_a_longer_number_is_not_a_leak(self):
        scan = self._scan("There are 58 apples. How many are red?")
        assert_child_view_safe(scan, to_child_view(scan))

    def test_lone_answer_in_the_stem_is_a_leak(self):
        scan = self._scan("Add 8 more apples. How many now?")
        with self.assertRaises(AssertionError):
            assert_child_view_safe(scan, to_child_view(scan))

    def test_token_rules(self):
        cases = [
            ("There are 58 apples.", "8", False),
            ("Add 8.", "8", True),
            ("8个苹果", "8", True),
            ("Waterfall", "water", False),
            ("Water is wet.", "water", True),
            ("小明喝水", "水", True),
            ("Ticked ✓ here", "✓", True),
        ]
        for text, needle, expected in cases:
            self.assertEqual(contains_token(text, needle), expected, (text, needle))


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
