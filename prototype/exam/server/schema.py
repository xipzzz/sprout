"""Map an extracted page into Sprout's parent schema, and strip the child view."""

from __future__ import annotations

import unicodedata
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
    "working",
    "is_correct",
    "teacher_comment",
    "marks",
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
}


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


def _choice_labels(raw: dict) -> list[str]:
    labels = raw.get("choice_labels")
    if isinstance(labels, list):
        return [str(item).strip() for item in labels if str(item).strip()]
    options = raw.get("options")
    if isinstance(options, dict):
        return [str(key).strip() for key, value in options.items() if str(value).strip()]
    return []


def _feedback(raw: dict) -> dict:
    feedback = raw.get("teacher_feedback")
    return feedback if isinstance(feedback, dict) else {}


def _working(raw: dict) -> list[str]:
    steps = raw.get("working")
    if steps is None and isinstance(raw.get("student_answer"), dict):
        steps = raw["student_answer"].get("steps")
    if isinstance(steps, str):
        steps = [steps]
    if not isinstance(steps, list):
        return []
    return [_as_text(step) for step in steps if _as_text(step)]


def _is_correct(raw: dict) -> bool | None:
    value = raw.get("is_correct", _feedback(raw).get("is_correct"))
    return value if isinstance(value, bool) else None


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


def map_question(raw: dict, index: int) -> dict:
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
    return {
        "id": _as_text(raw.get("id")) or str(index),
        "stem": _as_text(raw.get("stem")),
        "choices": _choices(raw),
        "student_answer": _as_text(raw.get("student_answer")),
        "teacher_mark": _teacher_mark(raw),
        "correct_answer": _as_text(raw.get("correct_answer") or raw.get("answer")),
        "explanation": explanation,
        "flags": flags,
        "choice_labels": _choice_labels(raw),
        "question_type": _as_text(raw.get("question_type") or raw.get("type")),
        "working": _working(raw),
        "is_correct": _is_correct(raw),
        "teacher_comment": _as_text(raw.get("teacher_comment") or _feedback(raw).get("comment")),
        "marks": _as_text(raw.get("marks") or _feedback(raw).get("score")),
        "sub_questions": [
            map_question(item, number + 1)
            for number, item in enumerate(raw.get("sub_questions") or [])
            if isinstance(item, dict)
        ],
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


def _is_word_char(char: str) -> bool:
    """A letter or digit that joins its neighbours into one word. Each Han character is a token on its own."""
    return bool(char) and char.isalnum() and not unicodedata.name(char, "").startswith("CJK")


def contains_token(text: str, needle: str) -> bool:
    """True when needle sits in text as whole tokens, ignoring case. "8" is in "Add 8 more" but not in "58"."""
    hay = text.lower()
    target = needle.strip().lower()
    if not target:
        return False
    guard_start = _is_word_char(target[0])
    guard_end = _is_word_char(target[-1])
    at = hay.find(target)
    while at != -1:
        before = hay[at - 1] if at > 0 else ""
        after = hay[at + len(target)] if at + len(target) < len(hay) else ""
        if not (guard_start and _is_word_char(before)) and not (guard_end and _is_word_char(after)):
            return True
        at = hay.find(target, at + 1)
    return False


def _child_text(child: dict) -> str:
    """Only the text the child can read: subject, stems and choices. Ids are question numbers, not answers."""
    parts = [str(child.get("subject") or "")]
    for question in child.get("questions") or []:
        parts.append(str(question.get("stem") or ""))
        parts.extend(str(choice) for choice in question.get("choices") or [])
    return "\n".join(parts)


def assert_child_view_safe(parent: dict, child: dict) -> None:
    leaked: list[str] = []
    _walk_keys(child, leaked)
    if leaked:
        raise AssertionError(f"Child view leaked keys: {', '.join(leaked)}")
    for question in child.get("questions") or []:
        if set(question.keys()) != {"id", "stem", "choices"}:
            raise AssertionError(f"Child question has unexpected fields: {sorted(question.keys())}")
    blob = _child_text(child)
    choice_text = {
        choice
        for question in parent.get("questions") or []
        for choice in (question.get("choices") or [])
    }
    for question in _with_sub_questions(parent.get("questions") or []):
        _assert_no_secret_text(question, blob, choice_text)


def _with_sub_questions(questions: list[dict]) -> list[dict]:
    out = []
    for question in questions:
        out.append(question)
        out.extend(_with_sub_questions(question.get("sub_questions") or []))
    return out


def _assert_no_secret_text(question: dict, blob: str, choice_text: set[str]) -> None:
    qid = question.get("id")
    explanation = question.get("explanation") or ""
    if explanation and contains_token(blob, explanation):
        raise AssertionError(f"Child view leaked the explanation for {qid}")
    comment = question.get("teacher_comment") or ""
    if comment and contains_token(blob, comment):
        raise AssertionError(f"Child view leaked the teacher comment for {qid}")
    for step in question.get("working") or []:
        if step and step not in choice_text and contains_token(blob, step):
            raise AssertionError(f"Child view leaked the child's working for {qid}")
    mark = question.get("teacher_mark") or ""
    if mark and mark not in choice_text and contains_token(blob, mark):
        raise AssertionError(f"Child view leaked the teacher mark for {qid}")
    written = question.get("student_answer") or ""
    if written and written not in choice_text and contains_token(blob, written):
        raise AssertionError(f"Child view leaked the handwritten answer for {qid}")
    correct = question.get("correct_answer") or ""
    if correct and correct not in choice_text and contains_token(blob, correct):
        raise AssertionError(f"Child view leaked the correct answer for {qid}")
    for flag in question.get("flags") or []:
        note = (flag or {}).get("note") or ""
        if note and contains_token(blob, note):
            raise AssertionError(f"Child view leaked a flag note for {qid}")
