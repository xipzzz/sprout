"""Synthetic pages that reproduce the patterns from the private P1-P4 test set.

Image tests build pages from synthetic_pages.py, so they know which pixels are
print and which are ink. Text tests use Tesseract.js output saved in
fixtures/synthetic (see prototype/exam/ocr_fixture.mjs).
"""

import asyncio
import base64
import io
import re
import unittest
from pathlib import Path
from unittest import mock

import numpy as np
from PIL import Image

import extract
import synthetic_pages as sp
from deskew import _ink_candidates, _luma, lift_colored_ink, pencil_score, prepare_page
from extract import extract_scan, ocr_decision, read_sheet
from save_note import render_markdown
from schema import assert_child_view_safe, to_child_view
from worksheet_text import parse_worksheet_text, text_script

SYNTH = Path(__file__).resolve().parents[1] / "fixtures" / "synthetic"


def fixture(name: str) -> str:
    return (SYNTH / name).read_text(encoding="utf-8")


def decode(data_url: str) -> np.ndarray:
    return np.asarray(Image.open(io.BytesIO(base64.b64decode(data_url.split(",", 1)[1]))).convert("RGB"))


def run(coro):
    return asyncio.run(coro)


def child_safe(scan: dict) -> dict:
    child = to_child_view(scan)
    assert_child_view_safe(scan, child)
    return child


def tesseract_scan(text: str, lang: str = "eng", subject: str = "auto") -> dict:
    page = sp.clean_blue_url()
    with mock.patch.object(extract, "_tesseract_text", return_value=""), mock.patch.object(
        extract, "vision_api_key", return_value=None
    ):
        return run(extract_scan(page.jpeg, "page.jpg", False, text, subject, lang))


class InkLiftTests(unittest.TestCase):
    """Pattern 4: the lift kept blue print and black print under the pen."""

    @classmethod
    def setUpClass(cls):
        cls.page = sp.blue_ink_mcq()
        cls.out, cls.lifted = lift_colored_ink(cls.page.photo)
        cls.luma = _luma(cls.out)

    def test_blue_printed_url_survives(self):
        kept = _ink_candidates(self.out)[self.page.blue_print_mask].mean()
        self.assertGreater(kept, 0.95)

    def test_black_print_under_blue_ink_has_no_holes(self):
        overlap = self.page.print_mask & self.page.hand_mask
        self.assertGreater(overlap.sum(), 500)
        self.assertGreater((self.luma < 120)[overlap].mean(), 0.95)
        self.assertGreater((self.luma < 120)[self.page.print_mask].mean(), 0.97)

    def test_handwriting_is_lifted_and_filled_with_paper(self):
        hand_only = self.page.hand_mask & ~self.page.print_mask
        self.assertLess(_ink_candidates(self.out)[hand_only].mean(), 0.01)
        self.assertLess((self.luma < 150)[hand_only].mean(), 0.08)
        paper = _luma(self.page.photo)[~(self.page.print_mask | self.page.hand_mask | self.page.blue_print_mask)]
        self.assertLess(abs(np.median(self.luma[hand_only]) - np.median(paper)), 12)

    def test_clean_page_is_left_alone(self):
        page = sp.clean_blue_url()
        out, lifted = lift_colored_ink(page.photo)
        self.assertLess(lifted, 100)
        self.assertGreater(_ink_candidates(out)[page.blue_print_mask].mean(), 0.95)

    def test_cloze_answers_in_blanks_are_lifted(self):
        page = sp.cloze_passage()
        out, _ = lift_colored_ink(page.photo)
        hand_only = page.hand_mask & ~page.print_mask
        self.assertLess(_ink_candidates(out)[hand_only].mean(), 0.01)
        self.assertGreater((_luma(out) < 120)[page.print_mask].mean(), 0.97)


class PencilTests(unittest.TestCase):
    """Pattern 6: pencil is not removed, but the page is flagged."""

    def test_only_the_pencil_page_is_flagged(self):
        for build in sp.ALL:
            page = build()
            with self.subTest(page.name):
                clean, _ = lift_colored_ink(page.photo)
                self.assertEqual(pencil_score(clean)["likely"], page.name == "pencil-mcq")

    def test_pencil_flag_reaches_the_parent_and_not_the_child(self):
        page = sp.pencil_mcq()
        text = fixture("pencil-mcq.ocr-clean.txt")
        with mock.patch.object(extract, "vision_api_key", return_value=None):
            result = run(extract_scan(page.jpeg, "pencil.jpg", False, text, "english", "eng"))
        scan = result["scan"]
        self.assertEqual([flag["kind"] for flag in scan["page_flags"]], ["pencil"])
        self.assertIn("Pencil is not lifted", scan["page_flags"][0]["note"])
        child = child_safe(scan)
        self.assertNotIn("page_flags", child)
        note = render_markdown(scan)
        parent, practice = note.split("## Practice prompts")
        self.assertIn("Page check (pencil)", parent)
        self.assertNotIn("pencil", practice.lower())


class CleanPageOcrTests(unittest.TestCase):
    """Pattern 1: OCR reads the cleaned, straightened page, not the photo."""

    def test_server_hands_back_the_cleaned_page_for_ocr(self):
        page = sp.blue_ink_mcq()
        prepared = prepare_page(page.jpeg)
        ocr_image = decode(prepared["ocr_jpeg"]).astype(int)
        self.assertLess(np.abs(ocr_image - prepared["clean_rgb"].astype(int)).mean(), 2.0)
        photo_ink = _ink_candidates(decode(prepared["deskew_jpeg"])).mean()
        self.assertLess(_ink_candidates(decode(prepared["ocr_jpeg"])).mean(), photo_ink / 5)

    def test_need_ocr_sends_the_cleaned_page_and_the_language(self):
        page = sp.blue_ink_mcq()
        with mock.patch.object(extract, "_tesseract_text", return_value=""), mock.patch.object(
            extract, "vision_api_key", return_value=None
        ):
            english = run(extract_scan(page.jpeg, "page.jpg", False, "", "auto"))
            chinese = run(extract_scan(sp.chinese_mcq().jpeg, "page.jpg", False, "", "chinese"))
        self.assertTrue(english["need_ocr"])
        self.assertEqual(english["ocr_lang"], "eng")
        self.assertLess(_ink_candidates(decode(english["ocr_jpeg"])).mean(), 0.002)
        self.assertEqual(chinese["ocr_lang"], "chi_sim")

    def test_handwriting_leaks_from_the_photo_but_not_the_clean_page(self):
        leaked_words = {"Hg", "g,o", "int,", "ang"}
        raw = parse_worksheet_text(fixture("blue-ink-mcq.ocr-raw.txt"))
        clean = parse_worksheet_text(fixture("blue-ink-mcq.ocr-clean.txt"))
        raw_text = " ".join(q.stem for q in raw.questions) + " ".join(r for q in raw.questions for r in q.removed)
        self.assertTrue(any(word in raw_text for word in leaked_words))
        clean_stems = " ".join(q.stem for q in clean.questions)
        self.assertIn("because", sp.blue_ink_mcq().hand_words)
        for word in leaked_words | {"because"}:
            self.assertNotIn(word, clean_stems)
        self.assertEqual([len(q.choices) for q in raw.questions], [2, 0, 2, 2, 2])
        self.assertEqual([len(q.choices) for q in clean.questions], [3, 3, 3, 3, 3])

    def test_real_photo_cleaned_page_parses(self):
        text = (SYNTH.parent / "01-local-worksheet1.ocr-clean.txt").read_text(encoding="utf-8")
        sheet, questions = read_sheet(text)
        self.assertEqual([q["choices"] for q in questions][1:], [
            ["is", "are", "was"], ["in", "on", "over"], ["in", "into", "through"], ["or", "so", "and"],
        ])
        self.assertEqual(questions[0]["choices"], ["It", "He", "She"])
        self.assertTrue(questions[0]["stem"].startswith("Ali is playing with his new toy."))
        self.assertTrue(questions[1]["stem"].startswith("Samad and Ali ____"))
        child_safe({"subject": "english", "questions": questions})


class NoisyParserTests(unittest.TestCase):
    """Pattern 2: '(2)-on', '{3)', a stray mark before '1)', 'k 3', '\\ 1) nurse', ': 9.'."""

    def test_p1_picture_box_page(self):
        sheet = parse_worksheet_text(fixture("p1-picture-box.ocr.txt"))
        self.assertEqual(sheet.title, "Section A")
        self.assertEqual([q.number for q in sheet.questions], [7, 8, 9, 10])
        self.assertEqual(
            [q.choices for q in sheet.questions],
            [
                ["nurse", "vet", "farmer", "doctor"],
                ["hat", "coat", "vest", "shoe"],
                ["song", "cake", "book", "ball"],
                ["classmates", "teacher", "dog", "bag"],
            ],
        )
        self.assertEqual(sheet.questions[2].stem, "Tom reads a ____ every night before he sleeps.")
        self.assertIn("TT]", sheet.questions[2].removed)

    def test_p4_maths_page_resyncs_misread_numbers(self):
        sheet = parse_worksheet_text(fixture("p4-maths.ocr.txt"))
        self.assertEqual([q.number for q in sheet.questions], [12, 13, 14, 15, 16, 17])
        self.assertEqual([len(q.choices) for q in sheet.questions], [4, 4, 4, 4, 4, 4])
        self.assertEqual(sheet.questions[0].choices, ["5.25", "6.25", "6.5", "7.25"])
        self.assertEqual(sheet.questions[1].choices, ["0.04", "0.4", "4.0", "40"])
        self.assertTrue(sheet.questions[2].stem.startswith("A ribbon is 6 m long."))
        self.assertEqual(sheet.questions[4].choices[-1], "8 x 1.25")
        self.assertTrue(sheet.questions[5].stem.startswith("Sam had $20."))

    def test_answer_bracket_writing_is_not_a_choice(self):
        sheet = parse_worksheet_text(fixture("pencil-mcq.ocr-clean.txt"))
        for question in sheet.questions:
            self.assertFalse(any("(" in choice for choice in question.choices), question.choices)

    def test_line_after_the_last_choice_is_set_aside_and_flagged(self):
        sheet, questions = read_sheet(fixture("clean-blue-url.ocr-clean.txt"))
        self.assertEqual(questions[-1]["choices"], ["or", "so", "and"])
        self.assertEqual(sheet.questions[-1].set_aside, ["Not suitable for children under three."])
        self.assertTrue(any("left out" in flag["note"] for flag in questions[-1]["flags"]))

    def test_footer_and_url_lines_are_dropped(self):
        for name in ("blue-ink-mcq.ocr-clean.txt", "cloze-passage.ocr-clean.txt", "p1-picture-box.ocr.txt", "p4-maths.ocr.txt"):
            with self.subTest(name):
                sheet = parse_worksheet_text(fixture(name))
                everything = " ".join(q.stem + " " + " ".join(q.choices) for q in sheet.questions).lower()
                self.assertNotIn("sgexam", everything)
                self.assertNotIn("www", everything)
                self.assertNotIn("page 3", everything)


class ClozeTests(unittest.TestCase):
    """Pattern 3: one question per inline blank, with its own sentence as the stem."""

    def test_grammar_cloze(self):
        sheet, questions = read_sheet(fixture("cloze-passage.ocr-clean.txt"))
        self.assertEqual(sheet.layout, "cloze")
        self.assertEqual(sheet.title, "Section B: Grammar Cloze")
        self.assertEqual(
            [q["stem"] for q in questions],
            [
                "Last Sunday, Ben and his family went ____ the zoo.",
                "They saw a big elephant ____ was eating bananas.",
                "Ben's sister was scared ____ the tiger roared loudly.",
                "After lunch, they ____ the monkeys swing from tree to tree.",
                "Ben ____ a photo of a baby monkey.",
                "It was ____ best day of the holidays.",
            ],
        )
        self.assertTrue(all("blank in the passage" in " ".join(f["note"] for f in q["flags"]) for q in questions))
        child = child_safe({"subject": "english", "questions": questions})
        self.assertEqual(len(child["questions"]), 6)

    def test_editing_passage_keeps_the_marker(self):
        sheet, questions = read_sheet(fixture("editing-passage.ocr.txt"))
        self.assertEqual(sheet.layout, "editing")
        self.assertEqual(len(questions), 5)
        self.assertEqual(questions[0]["stem"], "Yesterday my brother and I (1) goes to the park.")
        self.assertEqual(questions[2]["stem"], "My brother (3) climb up the slide and wave at me.")
        self.assertEqual(questions[3]["stem"], "My brother climb up the slide and (4) wave at me.")
        for question in questions:
            self.assertEqual(len(re.findall(r"\(\d\)", question["stem"])), 1)

    def test_cloze_page_flag(self):
        result = tesseract_scan(fixture("cloze-passage.ocr-clean.txt"))
        self.assertEqual([flag["kind"] for flag in result["scan"]["page_flags"]], ["cloze"])
        child_safe(result["scan"])


class ChineseTests(unittest.TestCase):
    """Pattern 5: Chinese pages are read with chi_sim, or flagged as unsupported."""

    def test_english_ocr_of_a_chinese_page_is_garbled(self):
        self.assertTrue(text_script(fixture("chinese-mcq.ocr-eng.txt"))["garbled"])
        for name in ("blue-ink-mcq.ocr-clean.txt", "cloze-passage.ocr-clean.txt", "p1-picture-box.ocr.txt", "p4-maths.ocr.txt"):
            self.assertFalse(text_script(fixture(name))["garbled"], name)

    def test_garbled_english_read_asks_for_chi_sim_once(self):
        self.assertEqual(ocr_decision(fixture("chinese-mcq.ocr-eng.txt"), "eng"), {"action": "retry", "ocr_lang": "chi_sim"})
        result = tesseract_scan(fixture("chinese-mcq.ocr-eng.txt"), "eng")
        self.assertFalse(result["ok"])
        self.assertTrue(result["need_ocr"])
        self.assertEqual(result["ocr_lang"], "chi_sim")
        self.assertIn("Chinese", result["message"])

    def test_chi_sim_read_parses_three_questions_with_four_choices(self):
        result = tesseract_scan(fixture("chinese-mcq.ocr-chi_sim.txt"), "chi_sim")
        scan = result["scan"]
        self.assertEqual(scan["subject"], "chinese")
        self.assertEqual(scan["paper_title"], "华文练习二")
        self.assertEqual([q["stem"] for q in scan["questions"]], [
            "小明每天早上七点钟去学校。", "妈妈在厨房里做饭。", "我们要爱护公园里的花草。",
        ])
        self.assertEqual(scan["questions"][0]["choices"], ["上课", "学校", "公园", "商店"])
        self.assertEqual(scan["questions"][1]["choices"], ["厨房", "花园", "学校", "医院"])
        self.assertIn("chinese", [flag["kind"] for flag in scan["page_flags"]])
        self.assertTrue(all("chi_sim" in q["flags"][0]["note"] for q in scan["questions"]))
        child_safe(scan)

    def test_chi_sim_that_finds_no_chinese_is_unsupported(self):
        result = tesseract_scan(fixture("chinese-mcq.ocr-eng.txt"), "chi_sim")
        self.assertFalse(result["ok"])
        self.assertTrue(result["unsupported"])
        self.assertNotIn("scan", result)

    def test_subject_names(self):
        from schema import subject_slug

        for name in ("华文", "中文", "Chinese"):
            self.assertEqual(subject_slug(name), "chinese")


class ChildGuardTests(unittest.TestCase):
    """The child payload stays answer-free on every synthetic pattern."""

    def test_every_fixture(self):
        for path in sorted(SYNTH.glob("*.txt")):
            text = path.read_text(encoding="utf-8")
            lang = "chi_sim" if "chi_sim" in path.name else "eng"
            if ocr_decision(text, lang)["action"] != "parse":
                continue
            with self.subTest(path.name):
                _, questions = read_sheet(text, lang)
                for question in questions:
                    question.update(
                        {
                            "student_answer": "child wrote this",
                            "teacher_mark": "✗ see me",
                            "correct_answer": question["choices"][0] if question["choices"] else "hidden answer",
                            "explanation": "Parent-only explanation.",
                        }
                    )
                scan = {"subject": "english", "questions": questions, "page_flags": [{"kind": "pencil", "note": "n"}]}
                child = child_safe(scan)
                for item in child["questions"]:
                    self.assertEqual(set(item), {"id", "stem", "choices"})


if __name__ == "__main__":
    unittest.main()
