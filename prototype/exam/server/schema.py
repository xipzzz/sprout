"""Map an extracted page into Sprout's parent schema, and strip the child view."""

from __future__ import annotations

import re
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
    "choice_letters", "working", "is_correct", "teacher_comment", "marks", "question_type", "sub_questions",
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


def _text_list(value: Any) -> list[str]:
    values = value if isinstance(value, list) else [value]
    return [text for item in values if (text := _as_text(item))]


def _parent_details(raw: dict) -> dict:
    answer = raw.get("student_answer")
    feedback = raw.get("teacher_feedback")
    feedback = feedback if isinstance(feedback, dict) else {}
    marks = raw.get("marks") or raw.get("student_marks") or {}
    marks = marks if isinstance(marks, dict) else {}
    steps = raw.get("working", answer.get("steps", []) if isinstance(answer, dict) else [])
    working = []
    for step in steps if isinstance(steps, list) else [steps]:
        if isinstance(step, dict):
            working.append({"expression": _as_text(step.get("expression")),
                            "result": _as_text(step.get("result")), "steps": _text_list(step.get("steps"))})
        elif _as_text(step):
            working.append({"expression": _as_text(step), "result": "", "steps": []})
    options = raw.get("options")
    if isinstance(options, dict) and not raw.get("choices"):
        letters = [str(key) for key, value in options.items() if _as_text(value)]
    else:
        letters = _text_list(raw.get("choice_letters"))
    correct = raw.get("is_correct", feedback.get("is_correct"))
    children = raw.get("sub_questions") or []
    return {
        "choice_letters": letters,
        "working": working,
        "is_correct": correct if isinstance(correct, bool) else None,
        "teacher_comment": _as_text(raw.get("teacher_comment", feedback.get("comment"))),
        "marks": {
            "selected": _text_list(marks.get("selected", marks.get("checked_options"))),
            "crossed": marks.get("crossed") is True,
            "note": _as_text(marks.get("note", marks.get("other_marks"))),
            "symbols": _text_list(marks.get("symbols", feedback.get("symbols"))),
            "score": _as_text(marks.get("score", feedback.get("score"))),
        },
        "question_type": _as_text(raw.get("question_type", raw.get("type"))),
        "sub_questions": [map_question(item, index + 1) for index, item in enumerate(children) if isinstance(item, dict)]
                         if isinstance(children, list) else [],
    }


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
        **_parent_details(raw),
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


def _contains_token(text: str, secret: str) -> bool:
    def token_char(char: str) -> bool:
        return char == "_" or unicodedata.category(char)[0] in {"L", "M", "N"}

    for match in re.finditer(re.escape(secret), text):
        before = match.start() > 0 and token_char(text[match.start() - 1])
        after = match.end() < len(text) and token_char(text[match.end()])
        if not before and not after:
            return True
    return False


def _parent_questions(questions: list[dict]):
    for question in questions:
        yield question
        yield from _parent_questions(question.get("sub_questions") or [])


def assert_child_view_safe(parent: dict, child: dict) -> None:
    leaked: list[str] = []
    _walk_keys(child, leaked)
    if leaked:
        raise AssertionError(f"Child view leaked keys: {', '.join(leaked)}")
    for question in child.get("questions") or []:
        if set(question.keys()) != {"id", "stem", "choices"}:
            raise AssertionError(f"Child question has unexpected fields: {sorted(question.keys())}")
    if set(child) != {"subject", "questions"}:
        raise AssertionError("Child view has unexpected fields")
    originals = {q["id"]: q for q in parent.get("questions") or []}
    visible_by_id = {}
    for question in child.get("questions") or []:
        original = originals.get(question["id"])
        if original is None:
            raise AssertionError(f"Unknown child question: {question['id']}")
        visible = [(question["stem"], False)]
        visible.extend((choice, choice in original.get("choices", [])) for choice in question["choices"])
        if question["id"] in visible_by_id:
            raise AssertionError(f"Duplicate child question: {question['id']}")
        visible_by_id[question["id"]] = visible
    for root in parent.get("questions") or []:
        visible = [(child.get("subject") or "", False), *visible_by_id.get(root["id"], [])]
        for question in _parent_questions([root]):
            secrets = [
                ("explanation", question.get("explanation"), False),
                ("teacher mark", question.get("teacher_mark"), False),
                ("handwritten answer", question.get("student_answer"), True),
                ("correct answer", question.get("correct_answer"), True),
            ]
            secrets.append(("teacher comment", question.get("teacher_comment"), False))
            marks = question.get("marks") or {}
            secrets.extend((label, marks.get(key), False) for label, key in (("mark note", "note"), ("score", "score")))
            secrets.extend(("teacher symbol", symbol, False) for symbol in marks.get("symbols") or [])
            for step in question.get("working") or []:
                secrets.extend(("working", text, False) for text in [step["expression"], step["result"], *step["steps"]])
            secrets.extend(("flag note", flag.get("note"), False) for flag in question.get("flags") or [])
            for label, secret, allow_choice in secrets:
                if not secret:
                    continue
                if any(not (allow_choice and printed and text == secret) and _contains_token(text, secret)
                       for text, printed in visible):
                    raise AssertionError(f"Child view leaked the {label} for {question.get('id')}")
