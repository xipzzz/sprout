import os
import tempfile
import unittest
from datetime import datetime
from pathlib import Path

from extract import stub_scan
from fastapi.testclient import TestClient
from notebook_note import BLOCK_END, BLOCK_START, merge_notebook, merge_review, save_notebook, save_review
from save_note import render_markdown, save_scan

NOW = datetime(2026, 10, 17, 18, 30)

PAYLOAD = {
    "groups": [
        {
            "label": "Maths",
            "count": 2,
            "topics": [
                {
                    "label": "Fractions",
                    "entries": [
                        {
                            "stem": "What is 3/4 of 12?",
                            "choices": [],
                            "student_answer": "8",
                            "correct_answer": "9",
                            "paper_title": "Maths worksheet",
                            "added": "2026-10-17",
                        }
                    ],
                },
                {
                    "label": "Addition and subtraction",
                    "entries": [
                        {
                            "stem": "25 + 17 = ____",
                            "choices": [],
                            "student_answer": "41",
                            "correct_answer": "42",
                            "paper_title": "Maths worksheet",
                            "added": "2026-10-17",
                        }
                    ],
                },
            ],
        },
        {
            "label": "English",
            "count": 1,
            "topics": [
                {
                    "label": "Word meaning (vocabulary)",
                    "entries": [
                        {
                            "stem": "The plant needs ____ to grow.",
                            "choices": ["water", "soil"],
                            "student_answer": "watr",
                            "correct_answer": "water",
                            "paper_title": "English homework",
                            "added": "2026-10-17",
                        }
                    ],
                }
            ],
        },
    ],
    "weak": [
        {"label": "Fractions", "subject_label": "Maths", "in_notebook": 1, "practice_tries": 2, "practice_misses": 2},
        {"label": "Word meaning (vocabulary)", "subject_label": "English", "in_notebook": 1, "practice_tries": 0, "practice_misses": 0},
    ],
    "sessions": [
        {"at": "2026-10-17 11:00", "scope": "Fractions", "right": 0, "wrong": 1, "unchecked": 0, "total": 1,
         "missed": [{"label": "Fractions", "count": 1}]},
        {"at": "2026-10-17 10:00", "scope": "This page", "right": 1, "wrong": 2, "unchecked": 1, "total": 4,
         "missed": [{"label": "Fractions", "count": 1}, {"label": "Word problems", "count": 1}]},
    ],
    "log": ["Practice, Fractions: 0 of 1 right on the first try. Missed: Fractions 1."],
}


class NotebookNoteTests(unittest.TestCase):
    def test_new_note_groups_ranks_and_logs(self):
        text = merge_notebook(None, PAYLOAD, NOW)
        self.assertTrue(text.startswith("---\ntitle: Sprout mistake notebook"))
        self.assertIn("3 questions in the notebook.", text)
        self.assertIn("### Maths (2)", text)
        self.assertIn("#### Fractions (1)", text)
        self.assertIn("### English (1)", text)
        self.assertLess(text.index("### Maths (2)"), text.index("### English (1)"))
        self.assertIn("Child wrote: 8. Practice answer: 9.", text)
        self.assertIn("| 1 | Fractions | Maths | 1 | 2 of 2 |", text)
        self.assertIn("| 2 | Word meaning (vocabulary) | English | 1 | not practised |", text)
        self.assertIn("| 2026-10-17 10:00 | This page | 1 of 3, 1 not checked | Fractions 1, Word problems 1 |", text)
        self.assertIn("- 2026-10-17 18:30 · Practice, Fractions: 0 of 1 right", text)
        self.assertNotIn("\u2014", text)

    def test_rewrite_keeps_parent_notes_and_appends_log(self):
        first = merge_notebook(None, PAYLOAD, NOW)
        edited = first.replace("# Mistake notebook\n", "# Mistake notebook\n\nMy own note: revise fractions on Sunday.\n")
        smaller = dict(PAYLOAD, groups=PAYLOAD["groups"][1:], log=["Took one out."])
        second = merge_notebook(edited, smaller, datetime(2026, 10, 18, 9, 0))
        self.assertIn("My own note: revise fractions on Sunday.", second)
        self.assertEqual(second.count(BLOCK_START), 1)
        self.assertEqual(second.count(BLOCK_END), 1)
        self.assertIn("1 question in the notebook.", second)
        self.assertNotIn("### Maths (2)", second)
        self.assertIn("2026-10-17 18:30 · Practice, Fractions", second)
        self.assertIn("2026-10-18 09:00 · Took one out.", second)
        self.assertLess(second.index("18:30 · Practice"), second.index("09:00 · Took one out."))

    def test_save_writes_mistakes_md_in_vault(self):
        try:
            with tempfile.TemporaryDirectory() as vault:
                os.environ["SPROUT_VAULT_DIR"] = vault
                result = save_notebook(PAYLOAD, NOW)
                self.assertEqual(result["paths"], [str(Path(vault) / "Mistakes.md")])
                save_notebook(dict(PAYLOAD, log=["Second save."]), NOW)
                text = (Path(vault) / "Mistakes.md").read_text(encoding="utf-8")
                self.assertEqual(text.count(BLOCK_START), 1)
                self.assertIn("Second save.", text)
        finally:
            os.environ.pop("SPROUT_VAULT_DIR", None)


class ReviewNoteTests(unittest.TestCase):
    QUESTIONS = [
        {"id": "1", "stem": "Which word means a baby plant?", "topic": "Word meaning (vocabulary)", "topic_source": "rule", "mark": "right"},
        {"id": "3", "stem": "The plant needs ____ to grow.", "topic": "Spelling", "topic_source": "parent", "mark": "wrong"},
    ]

    def test_review_block_goes_before_practice_prompts(self):
        note = render_markdown(stub_scan("sample-exam-english.png") | {"deskew": {"applied": True, "corners": []}})
        merged = merge_review(note, {"questions": self.QUESTIONS})
        self.assertLess(merged.index("## Parent review"), merged.index("## Practice prompts"))
        self.assertIn("| 3. The plant needs ____ to grow. | Spelling (set by you) | Wrong |", merged)
        practice = merged.split("## Practice prompts", 1)[1]
        self.assertNotIn("Wrong", practice)
        self.assertNotIn("Spelling", practice)
        again = merge_review(merged, {"questions": [dict(self.QUESTIONS[1], mark="right")]})
        self.assertEqual(again.count("## Parent review"), 1)
        self.assertIn("| Right |", again)

    def test_review_only_touches_notes_in_the_vault(self):
        scan = stub_scan("sample-exam-english.png")
        scan["deskew"] = {"applied": True, "corners": []}
        try:
            with tempfile.TemporaryDirectory() as vault, tempfile.TemporaryDirectory() as elsewhere:
                os.environ["SPROUT_VAULT_DIR"] = vault
                note_path = save_scan(scan)["paths"][0]
                outside = Path(elsewhere) / "other.md"
                outside.write_text("keep me", encoding="utf-8")
                result = save_review({"paths": [note_path, str(outside), vault + "/../x.md"], "questions": self.QUESTIONS})
                self.assertEqual(result["paths"], [note_path])
                self.assertEqual(outside.read_text(encoding="utf-8"), "keep me")
                self.assertIn("## Parent review", Path(note_path).read_text(encoding="utf-8"))
        finally:
            os.environ.pop("SPROUT_VAULT_DIR", None)

    def test_api_routes(self):
        from app import app

        client = TestClient(app)
        try:
            with tempfile.TemporaryDirectory() as vault:
                os.environ["SPROUT_VAULT_DIR"] = vault
                response = client.post("/api/notebook", json=PAYLOAD)
                self.assertEqual(response.status_code, 200)
                self.assertTrue(response.json()["ok"])
                self.assertTrue((Path(vault) / "Mistakes.md").exists())
                review = client.post("/api/review", json={"paths": ["/etc/passwd.md"], "questions": []})
                self.assertEqual(review.json()["paths"], [])
        finally:
            os.environ.pop("SPROUT_VAULT_DIR", None)


class ChildRoundScreenTests(unittest.TestCase):
    """The child round screen gets the child view and a grading callback, nothing else."""

    SCREEN = Path(__file__).resolve().parents[3] / "src" / "screens" / "ExamMistakesRound.tsx"

    def test_screen_has_no_route_to_answers(self):
        source = self.SCREEN.read_text(encoding="utf-8")
        self.assertNotIn("../exam/notebook", source)
        self.assertIn("import type { RoundGrade } from '../exam/mistakesRound'", source)
        self.assertNotRegex(source, r"import \{[^}]*\} from '\.\./exam/mistakesRound'")
        for name in ("correct_answer", "student_answer", "teacher_mark", "explanation", "answerKey", "localStorage"):
            self.assertNotIn(name, source)


if __name__ == "__main__":
    unittest.main()
