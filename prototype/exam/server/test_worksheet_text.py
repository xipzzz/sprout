import asyncio
import json
import unittest
from pathlib import Path

from extract import extract_scan, sheet_from_ocr
from schema import assert_child_view_safe, to_child_view
from worksheet_text import parse_worksheet_text, resplit_glued, strip_junk

FIXTURES = Path(__file__).resolve().parents[1] / "fixtures"
PHOTO = FIXTURES / "01-local-worksheet1.jpg"
# Raw text the browser's Tesseract.js sends for the photo (what /?exam=1 parses).
OCR = FIXTURES / "01-local-worksheet1.ocr.txt"
# Same photo through Tesseract.js in Node. Resizing differs, so the glitches differ.
OCR_NODE = FIXTURES / "01-local-worksheet1.ocr-node.txt"


def parsed(text):
    return [(q.stem, q.choices) for q in parse_worksheet_text(text).questions]


def blank_flagged(questions):
    return [q["id"] for q in questions if any("answer line was not read" in f["note"] for f in q["flags"])]


class RealWorksheetTests(unittest.TestCase):
    """Real photo 01-local-worksheet1.jpg and its raw Tesseract.js text."""

    def setUp(self):
        self.text = OCR.read_text(encoding="utf-8")
        self.variants = {
            "browser": self.text,
            "browser-crlf": self.text.replace("\n", "\r\n"),
            "node": OCR_NODE.read_text(encoding="utf-8"),
        }

    def test_five_questions_three_choices_each(self):
        for name, text in self.variants.items():
            with self.subTest(name):
                title, questions = sheet_from_ocr(text)
                self.assertEqual(title, "Worksheet 2")
                self.assertEqual(len(questions), 5)
                self.assertEqual([len(q["choices"]) for q in questions], [3, 3, 3, 3, 3])
                self.assertEqual(
                    [q["choices"] for q in questions],
                    [
                        ["It", "He", "She"],
                        ["is", "are", "was"],
                        ["in", "on", "over"],
                        ["in", "into", "through"],
                        ["or", "so", "and"],
                    ],
                )

    def test_stems_are_cleaned_and_resplits_flagged(self):
        for name, text in self.variants.items():
            with self.subTest(name):
                _, questions = sheet_from_ocr(text)
                stems = [q["stem"] for q in questions]
                self.assertTrue(stems[0].startswith("Ali is playing with his new toy."))
                self.assertTrue(stems[1].startswith("Samad and Ali"))
                self.assertTrue(stems[2].startswith("The horse jumped"))
                self.assertIn("pour the sugar", stems[3])
                self.assertIn("said Mrs Lim.", stems[3])
                self.assertEqual(stems[4], "Fiona fell down ____ hurt her knee.")
                for stem in stems:
                    self.assertNotIn("Worksheet", stem)
                    self.assertNotRegex(stem.replace("____", ""), r"[_«»]")
                notes = [flag["note"] for flag in questions[0]["flags"] if flag["field"] == "stem"]
                self.assertTrue(any("Aliis → Ali is" in note for note in notes))
                for question in questions:
                    has_blank = "____" in question["stem"]
                    self.assertEqual(question["id"] in blank_flagged(questions), not has_blank)

    def test_browser_text_details(self):
        _, questions = sheet_from_ocr(self.text)
        self.assertEqual(questions[1]["stem"], "Samad and Ali ____ cleaning the whiteboard.")
        self.assertEqual(questions[3]["stem"], '"Please pour the sugar ____ the jar\u201d said Mrs Lim.')
        self.assertEqual(blank_flagged(questions), ["1", "3"])

    def test_real_photo_through_extract_and_child_view(self):
        result = asyncio.run(extract_scan(PHOTO.read_bytes(), "src-01.jpg", False, self.text))
        self.assertTrue(result["ok"])
        scan = result["scan"]
        self.assertEqual(scan["extraction"], "tesseract")
        self.assertEqual(scan["paper_title"], "Worksheet 2")
        self.assertEqual(len(scan["questions"]), 5)
        child = to_child_view(scan)
        assert_child_view_safe(scan, child)
        for question in child["questions"]:
            self.assertEqual(set(question), {"id", "stem", "choices"})
        blob = json.dumps(child, ensure_ascii=False)
        self.assertNotIn("Tesseract", blob)
        self.assertNotIn("placeholder", blob)

    def test_real_photo_answers_wait_for_the_parent(self):
        scan = asyncio.run(extract_scan(PHOTO.read_bytes(), "src-01.jpg", False, self.text))["scan"]
        for question in scan["questions"]:
            self.assertEqual(question["correct_answer"], "", f"Q{question['id']} must not default to a choice")
            self.assertFalse(any(flag["field"] == "correct_answer" for flag in question["flags"]))


class LayoutTests(unittest.TestCase):
    def test_dot_number_and_lettered_choices(self):
        self.assertEqual(
            parsed("1. Which word means a baby plant?\nA. bloom\nB. seedling\nC. root\nD. fence\n2. Pick one.\nA) cat\nB) dog"),
            [("Which word means a baby plant?", ["bloom", "seedling", "root", "fence"]), ("Pick one.", ["cat", "dog"])],
        )

    def test_paren_number_and_lower_letters(self):
        self.assertEqual(
            parsed("1) She ____ a red bag.\na) have\nb) has\n2) They ____ two cats.\na) have\nb) has"),
            [("She ____ a red bag.", ["have", "has"]), ("They ____ two cats.", ["have", "has"])],
        )

    def test_q_prefix_and_numbered_choices(self):
        self.assertEqual(
            parsed("Q1 The cat sat ____ the mat.\n1) on\n2) in\n3) at\nQ2 I ____ a boy.\n1) am\n2) is"),
            [("The cat sat ____ the mat.", ["on", "in", "at"]), ("I ____ a boy.", ["am", "is"])],
        )

    def test_bare_number_and_bracketed_inline_choices(self):
        self.assertEqual(
            parsed("Name: ________\n1 ____ is my dog.\n(1) It (2) Its (3) It's\n2 The sun is ____.\n(1) hot (2) cold (3) wet"),
            [("____ is my dog.", ["It", "Its", "It's"]), ("The sun is ____.", ["hot", "cold", "wet"])],
        )

    def test_inline_choices_on_the_question_line(self):
        self.assertEqual(
            parsed("1. Which word means a baby plant? A bloom B seedling C root"),
            [("Which word means a baby plant?", ["bloom", "seedling", "root"])],
        )

    def test_bare_letter_choices_across_lines(self):
        self.assertEqual(
            parsed("1. Which word means a baby plant?\nA bloom B seedling\nC root D fence"),
            [("Which word means a baby plant?", ["bloom", "seedling", "root", "fence"])],
        )

    def test_title_instructions_and_page_number_are_not_questions(self):
        sheet = parse_worksheet_text(
            "Worksheet 7\nChoose (1, 2 or 3).\n1 Tom ____ a bike.\n(1) has\n(2) have\n(3) had ( )\n7\n"
        )
        self.assertEqual(sheet.title, "Worksheet 7")
        self.assertEqual([(q.stem, q.choices) for q in sheet.questions], [("Tom ____ a bike.", ["has", "have", "had"])])

    def test_wrapped_stem_joins_the_next_line(self):
        self.assertEqual(
            parsed("1 The horse jumped ____ the fence to get to the other\nside of the field.\n(1) in\n(2) over"),
            [("The horse jumped ____ the fence to get to the other side of the field.", ["in", "over"])],
        )

    def test_dropped_bracket_choice_stays_a_choice(self):
        self.assertEqual(
            parsed("1 Ali has a toy.\n1) It\n(2) He\n(3) She\n2 Next one.\n(1) a\n(2) b"),
            [("Ali has a toy.", ["It", "He", "She"]), ("Next one.", ["a", "b"])],
        )

    def test_long_numbered_line_is_the_next_question(self):
        self.assertEqual(
            parsed("1. First question here?\n(1) yes\n2. Samad and Ali ____ cleaning the board.\n(1) is\n(2) are"),
            [("First question here?", []), ("Samad and Ali ____ cleaning the board.", ["is", "are"])],
        )

    def test_unnumbered_single_question_still_parses(self):
        self.assertEqual(
            parsed("Have or Has\nShe ____ a red bag?\nA) have\nB) has"),
            [("She ____ a red bag?", ["have", "has"])],
        )


class CleanupTests(unittest.TestCase):
    def test_strip_answer_bracket_debris(self):
        self.assertEqual(strip_junk("(3) She «9"), "(3) She")
        self.assertEqual(strip_junk("(3) was C0)"), "(3) was")
        self.assertEqual(strip_junk("(3) over ( )"), "(3) over")
        self.assertEqual(strip_junk("(3) through «)"), "(3) through")
        self.assertEqual(strip_junk("toy.__ is fun"), "toy. ____ is fun")
        self.assertEqual(strip_junk("Fill in (a) word (cat)"), "Fill in (a) word (cat)")

    def test_resplit_glued_words(self):
        self.assertEqual(resplit_glued("hisnewtoy")[0], "his new toy")
        self.assertEqual(resplit_glued("Thehorsejumped")[0], "The horse jumped")
        self.assertEqual(resplit_glued("Fionafelldown")[0], "Fiona fell down")
        self.assertEqual(resplit_glued("Aliis playing", {"Ali"})[0], "Ali is playing")
        self.assertEqual(resplit_glued("Samadand Ali")[0], "Samad and Ali")

    def test_resplit_leaves_real_words_alone(self):
        for word in ["Ethan", "Simon", "Megan", "England", "Island", "together", "forget", "whiteboard", "become"]:
            self.assertEqual(resplit_glued(word), (word, []), word)
        self.assertEqual(resplit_glued("Aliis playing")[0], "Aliis playing")


if __name__ == "__main__":
    unittest.main()
