"""Map an extracted page into Sprout's parent schema, and strip the child view."""

from __future__ import annotations

import json
from typing import Any

FORBIDDEN_CHILD_KEYS = {
    "student_answer",
    "teacher_mark",
    "correct_answer",
    "correct",
    "explanation",
    "teacher_feedback",
    "student_marks",
    "score",
    "flags",
    "reconstructions",
    "previews",
    "review",
    "stem_edited",
    "page_flags",
    "choice_labels",
    "question_type",
    "working_steps",
    "is_correct",
    "teacher_comment",
    "sub_questions",
}

PRACTICE_REVIEWS = {"picked", "read_aloud"}

FLAG_FIELDS = {
    "stem",
    "choices",
    "student_answer",
    "teacher_mark",
    "correct_answer",
    "explanation",
    "working_steps",
    "is_correct",
    "teacher_comment",
    "student_marks",
    "question_type",
    "sub_questions",
}

QUESTION_TYPES = {
    "multiple_choice": {"multiple_choice", "mcq", "choice", "choices", "选择", "选择题"},
    "fill_blank": {"fill_blank", "fill_in", "fill", "blank", "填空", "填空题"},
    "cloze": {"cloze", "grammar_cloze", "完形填空"},
    "editing": {"editing", "proofreading", "改错"},
    "open": {"open", "short_answer", "written", "problem", "word_problem", "问答", "问答题", "应用题"},
}
# Shorter parent-only text (a step like "6") can sit in a printed stem by chance; the key check still applies.
MIN_LEAK_TEXT = 6
TICKS = {"✓", "✔", "√", "☑"}
CROSSES = {"✗", "✘", "×", "x", "X", "☒"}


def _as_text(value: Any) -> str:
    if value is None:
        return ""
    if isinstance(value, str):
        return value.strip()
    if isinstance(value, (int, float)):
        return str(value)
    if isinstance(value, dict):
        for key in ("final", "text", "value"):
            if value.get(key):
                return str(value[key]).strip()
        return ""
    return str(value).strip()


def _choices(raw: dict) -> list[str]:
    choices = raw.get("choices")
    if isinstance(choices, list) and choices:
        return [str(item).strip() for item in choices if str(item).strip()]
    options = raw.get("options") or {}
    if isinstance(options, dict):
        return [str(value).strip() for value in options.values() if str(value).strip()]
    if isinstance(options, list):
        return [str(item).strip() for item in options if str(item).strip()]
    return []


def _teacher_mark(raw: dict) -> str:
    direct = _as_text(raw.get("teacher_mark"))
    if direct:
        return direct
    feedback = raw.get("teacher_feedback") or {}
    if not isinstance(feedback, dict):
        return ""
    symbols = feedback.get("symbols") or []
    if isinstance(symbols, str):
        symbols = [symbols]
    score = _as_text(feedback.get("score"))
    parts = [str(item).strip() for item in symbols if str(item).strip()]
    if score:
        parts.append(score)
    return " ".join(parts).strip()


def _flags(raw: dict) -> list[dict]:
    incoming = raw.get("flags") or raw.get("reconstructions") or []
    flags = []
    if isinstance(incoming, list):
        for item in incoming:
            if not isinstance(item, dict):
                continue
            field = str(item.get("field") or "")
            if field not in FLAG_FIELDS:
                continue
            kind = item.get("kind") or "reconstructed"
            if kind not in {"reconstructed", "generated"}:
                kind = "reconstructed"
            flags.append(
                {
                    "field": field,
                    "kind": kind,
                    "note": _as_text(item.get("note") or item.get("reason")) or "Filled in by the reader.",
                }
            )
    return flags


def _feedback(raw: dict) -> dict:
    feedback = raw.get("teacher_feedback")
    return feedback if isinstance(feedback, dict) else {}


def _choice_labels(raw: dict, choices: list[str]) -> list[str]:
    labels = raw.get("choice_labels") or raw.get("choice_letters")
    options = raw.get("options")
    if not labels and isinstance(options, dict) and not raw.get("choices"):
        labels = [key for key, value in options.items() if str(value).strip()]
    labels = [str(label).strip() for label in labels or []]
    return labels if len(labels) == len(choices) and all(labels) else []


def _question_type(raw: dict, stem: str, choices: list[str]) -> str:
    given = _as_text(raw.get("question_type") or raw.get("type")).lower().replace("-", "_").replace(" ", "_")
    for name, aliases in QUESTION_TYPES.items():
        if given in aliases:
            return name
    if len(choices) >= 2:
        return "multiple_choice"
    if "____" in stem:
        return "fill_blank"
    return "open"


def _working_steps(raw: dict) -> list[str]:
    steps = raw.get("working_steps") or raw.get("working") or raw.get("steps") or []
    if isinstance(steps, str):
        steps = steps.splitlines()
    if not isinstance(steps, list):
        return []
    return [text for text in (_as_text(step) for step in steps) if text]


def _is_correct(raw: dict, mark: str) -> bool | None:
    for value in (raw.get("is_correct"), _feedback(raw).get("is_correct")):
        if isinstance(value, bool):
            return value
    symbols = set(mark.split())
    if symbols & TICKS and not symbols & CROSSES:
        return True
    if symbols & CROSSES and not symbols & TICKS:
        return False
    return None


def _teacher_comment(raw: dict) -> str:
    comment = raw.get("teacher_comment") or _feedback(raw).get("comment") or _feedback(raw).get("comments")
    if isinstance(comment, list):
        return " ".join(_as_text(item) for item in comment if _as_text(item))
    return _as_text(comment)


def _student_marks(raw: dict) -> str:
    return _as_text(raw.get("student_marks") or raw.get("marks") or raw.get("score") or _feedback(raw).get("score"))


def _sub_questions(raw: dict) -> list[dict]:
    items = raw.get("sub_questions") or raw.get("subquestions") or raw.get("parts") or []
    if not isinstance(items, list):
        return []
    subs = []
    for position, item in enumerate(items, start=1):
        if not isinstance(item, dict):
            continue
        mark = _teacher_mark(item)
        subs.append(
            {
                "label": _as_text(item.get("label") or item.get("id")) or chr(ord("a") + position - 1),
                "stem": _as_text(item.get("stem")),
                "student_answer": _as_text(item.get("student_answer")),
                "teacher_mark": mark,
                "correct_answer": _as_text(item.get("correct_answer") or item.get("answer")),
                "is_correct": _is_correct(item, mark),
                "working_steps": _working_steps(item),
            }
        )
    return subs


def map_question(raw: dict, index: int) -> dict:
    """Parent question. Everything past id, stem and choices stays parent-side."""
    explanation = _as_text(raw.get("explanation"))
    flags = _flags(raw)
    if explanation and not any(flag["field"] == "explanation" for flag in flags):
        flags.append(
            {
                "field": "explanation",
                "kind": "generated",
                "note": "Written for the parent. The child does not see this.",
            }
        )
    stem = _as_text(raw.get("stem"))
    choices = _choices(raw)
    mark = _teacher_mark(raw)
    return {
        "id": _as_text(raw.get("id")) or str(index),
        "stem": stem,
        "choices": choices,
        "choice_labels": _choice_labels(raw, choices),
        "question_type": _question_type(raw, stem, choices),
        "student_answer": _as_text(raw.get("student_answer")),
        "working_steps": _working_steps(raw),
        "teacher_mark": mark,
        "is_correct": _is_correct(raw, mark),
        "teacher_comment": _teacher_comment(raw),
        "student_marks": _student_marks(raw),
        "correct_answer": _as_text(raw.get("correct_answer") or raw.get("answer")),
        "explanation": explanation,
        "sub_questions": _sub_questions(raw),
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
        for sub in question.get("sub_questions") or []:
            private += [sub.get("student_answer") or "", sub.get("correct_answer") or "", *(sub.get("working_steps") or [])]
        for text in private:
            if len(text) >= MIN_LEAK_TEXT and text not in choice_text and text in blob:
                raise AssertionError(f"Child view leaked parent-only work for {question.get('id')}")
