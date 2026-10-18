"""Map a read page into Sprout's parent schema, and strip the child view."""

from __future__ import annotations

import json
from typing import Any

# Everything a reader may say about a question beyond id, stem and choices.
PARENT_ONLY = (
    "choice_labels",
    "question_type",
    "student_answer",
    "working_steps",
    "teacher_mark",
    "marked_right",
    "teacher_comment",
    "marks_awarded",
    "correct_answer",
    "explanation",
    "parts",
)
FORBIDDEN_CHILD_KEYS = {
    *PARENT_ONLY,
    "correct",
    "score",
    "flags",
    "reconstructions",
    "previews",
    "review",
    "stem_edited",
    "page_flags",
}
FLAG_FIELDS = {"stem", "choices", *PARENT_ONLY} - {"choice_labels"}

PRACTICE_REVIEWS = {"picked", "read_aloud"}
QUESTION_TYPES = ("multiple_choice", "fill_blank", "cloze", "editing", "open")
TYPE_SPELLINGS = {"mcq": "multiple_choice", "fill_in": "fill_blank", "proofreading": "editing"}
# Shorter parent-only text (a step like "6") can sit in a printed stem by chance; the key check still applies.
MIN_LEAK_TEXT = 6
TICKS = {"✓", "✔", "√", "☑"}
CROSSES = {"✗", "✘", "×", "x", "X", "☒"}


def _text(value: Any) -> str:
    if value is None or isinstance(value, (dict, bool)):
        return ""
    return str(value).strip()


def _lines(value: Any) -> list[str]:
    if isinstance(value, str):
        value = value.splitlines()
    if not isinstance(value, list):
        return []
    return [line for line in map(_text, value) if line]


def _flags(raw: dict) -> list[dict]:
    kept = []
    for item in raw.get("flags") or raw.get("reconstructions") or []:
        if not isinstance(item, dict) or item.get("field") not in FLAG_FIELDS:
            continue
        kind = item.get("kind") if item.get("kind") in {"reconstructed", "generated"} else "reconstructed"
        kept.append({"field": item["field"], "kind": kind, "note": _text(item.get("note")) or "Filled in by the reader."})
    return kept


def _labels(raw: dict, choices: list[str]) -> list[str]:
    labels = _lines(raw.get("choice_labels"))
    return labels if len(labels) == len(choices) else []


def _kind(raw: dict, stem: str, choices: list[str]) -> str:
    said = _text(raw.get("question_type")).lower().replace(" ", "_").replace("-", "_")
    said = TYPE_SPELLINGS.get(said, said)
    if said in QUESTION_TYPES:
        return said
    if len(choices) > 1:
        return "multiple_choice"
    return "fill_blank" if "____" in stem else "open"


def _verdict(raw: dict, mark: str) -> bool | None:
    if isinstance(raw.get("marked_right"), bool):
        return raw["marked_right"]
    seen = set(mark.split())
    ticked, crossed = bool(seen & TICKS), bool(seen & CROSSES)
    return ticked if ticked != crossed else None


def _comment(raw: dict) -> str:
    said = raw.get("teacher_comment")
    return " ".join(_lines(said)) if isinstance(said, list) else _text(said)


def _parts(raw: dict) -> list[dict]:
    found = []
    for position, item in enumerate(item for item in raw.get("parts") or [] if isinstance(item, dict)):
        mark = _text(item.get("teacher_mark"))
        found.append(
            {
                "label": _text(item.get("label")) or "abcdefghij"[position % 10],
                "stem": _text(item.get("stem")),
                "student_answer": _text(item.get("student_answer")),
                "teacher_mark": mark,
                "correct_answer": _text(item.get("correct_answer")),
                "marked_right": _verdict(item, mark),
                "working_steps": _lines(item.get("working_steps")),
            }
        )
    return found


def map_question(raw: dict, index: int) -> dict:
    """Parent question. Everything past id, stem and choices stays parent-side."""
    stem = _text(raw.get("stem"))
    choices = _lines(raw.get("choices"))
    mark = _text(raw.get("teacher_mark"))
    explanation = _text(raw.get("explanation"))
    flags = _flags(raw)
    if explanation and all(flag["field"] != "explanation" for flag in flags):
        flags.append({"field": "explanation", "kind": "generated", "note": "Written for the parent. The child does not see this."})
    return {
        "id": _text(raw.get("id")) or str(index),
        "stem": stem,
        "choices": choices,
        "choice_labels": _labels(raw, choices),
        "question_type": _kind(raw, stem, choices),
        "student_answer": _text(raw.get("student_answer")),
        "working_steps": _lines(raw.get("working_steps")),
        "teacher_mark": mark,
        "marked_right": _verdict(raw, mark),
        "teacher_comment": _comment(raw),
        "marks_awarded": _text(raw.get("marks_awarded")),
        "correct_answer": _text(raw.get("correct_answer")),
        "explanation": explanation,
        "parts": _parts(raw),
        "flags": flags,
    }


def subject_slug(subject: str) -> str:
    text = (subject or "").strip().lower()
    if text in {"数学", "math", "maths"}:
        return "math"
    if text in {"英语", "english"}:
        return "english"
    if text in {"华文", "中文", "语文", "chinese"}:
        return "chinese"
    cleaned = "".join(ch for ch in text if ch.isalnum())
    return cleaned or "homework"


def to_child_view(scan: dict) -> dict:
    return {
        "subject": scan.get("subject") or "",
        "questions": [
            {
                "id": question.get("id") or "",
                "stem": question.get("stem") or "",
                "choices": list(question.get("choices") or []),
            }
            for question in scan.get("questions") or []
            if "review" not in question or question["review"] in PRACTICE_REVIEWS
        ],
    }


def _walk_keys(value: Any, found: list[str]) -> None:
    if isinstance(value, list):
        for item in value:
            _walk_keys(item, found)
        return
    if isinstance(value, dict):
        for key, inner in value.items():
            if key in FORBIDDEN_CHILD_KEYS:
                found.append(key)
            _walk_keys(inner, found)


def assert_child_view_safe(parent: dict, child: dict) -> None:
    leaked: list[str] = []
    _walk_keys(child, leaked)
    if leaked:
        raise AssertionError(f"Child view leaked keys: {', '.join(leaked)}")
    for question in child.get("questions") or []:
        if set(question.keys()) != {"id", "stem", "choices"}:
            raise AssertionError(f"Child question has unexpected fields: {sorted(question.keys())}")
    blob = json.dumps(child, ensure_ascii=False)
    choice_text = {
        choice
        for question in parent.get("questions") or []
        for choice in (question.get("choices") or [])
    }
    for question in parent.get("questions") or []:
        explanation = question.get("explanation") or ""
        if explanation and explanation in blob:
            raise AssertionError(f"Child view leaked the explanation for {question.get('id')}")
        mark = question.get("teacher_mark") or ""
        if mark and mark not in choice_text and mark in blob:
            raise AssertionError(f"Child view leaked the teacher mark for {question.get('id')}")
        written = question.get("student_answer") or ""
        if written and written not in choice_text and written in blob:
            raise AssertionError(f"Child view leaked the handwritten answer for {question.get('id')}")
        correct = question.get("correct_answer") or ""
        if correct and correct not in choice_text and correct in blob:
            raise AssertionError(f"Child view leaked the correct answer for {question.get('id')}")
        for flag in question.get("flags") or []:
            note = (flag or {}).get("note") or ""
            if note and note in blob:
                raise AssertionError(f"Child view leaked a flag note for {question.get('id')}")
        comment = question.get("teacher_comment") or ""
        if len(comment) >= MIN_LEAK_TEXT and comment in blob:
            raise AssertionError(f"Child view leaked the teacher comment for {question.get('id')}")
        private = list(question.get("working_steps") or [])
        for sub in question.get("parts") or []:
            private += [sub.get("student_answer") or "", sub.get("correct_answer") or "", *(sub.get("working_steps") or [])]
        for text in private:
            if len(text) >= MIN_LEAK_TEXT and text not in choice_text and text in blob:
                raise AssertionError(f"Child view leaked parent-only work for {question.get('id')}")
