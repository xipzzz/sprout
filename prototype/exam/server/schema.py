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
