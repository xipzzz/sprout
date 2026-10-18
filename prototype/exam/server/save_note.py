"""Write one Obsidian Markdown note per scan.

Default vault: /Users/ml/Documents/10_Obsidian/Xip/Sprout/
Also writes SPROUT_SAVE_DIR when that folder is different.
"""

from __future__ import annotations

import json
import os
import re
from datetime import date, datetime
from pathlib import Path

from schema import subject_slug, to_child_view

DEFAULT_VAULT = "/Users/ml/Documents/10_Obsidian/Xip/Sprout"
FALLBACK_DIR = "sprout-notes"
NOTE_NAME = re.compile(r"^\d{4}-\d{2}-\d{2}-[a-z0-9]+(?:-\d{4})?\.md$")


def _yaml_quote(value: str) -> str:
    return '"' + value.replace("\\", "\\\\").replace('"', '\\"') + '"'


def destination_dirs() -> list[str]:
    vault = os.environ.get("SPROUT_VAULT_DIR", DEFAULT_VAULT).strip() or DEFAULT_VAULT
    local = os.environ.get("SPROUT_SAVE_DIR", "").strip()
    ordered: list[str] = []
    for folder in (vault, local):
        if folder and folder not in ordered:
            ordered.append(folder)
    return ordered


def _usable(folder: str) -> str | None:
    try:
        os.makedirs(folder, exist_ok=True)
        probe = os.path.join(folder, ".sprout-write-test")
        with open(probe, "w", encoding="utf-8") as handle:
            handle.write("ok")
        os.remove(probe)
        return folder
    except OSError:
        return None


def _filename(subject: str, when: date) -> str:
    return f"{when.isoformat()}-{subject_slug(subject)}.md"


def _unique_path(folder: str, name: str) -> str:
    path = os.path.join(folder, name)
    if not os.path.exists(path):
        return path
    stamp = datetime.now().strftime("%H%M")
    stem, ext = os.path.splitext(name)
    return os.path.join(folder, f"{stem}-{stamp}{ext}")


def _practice_line(question: dict) -> str:
    review = question.get("review")
    answer = question.get("correct_answer") or ""
    if review == "picked":
        return f"Practice answer, picked by parent (hidden from the child): {answer}"
    if review == "open":
        return "Practice answer: not picked yet. Practice stays locked."
    if review == "dropped":
        return "Dropped by parent. Not in practice."
    if review == "read_aloud":
        return "Practice: read aloud, no answer to pick."
    return f"Practice answer (hidden from the child): {answer or '(unknown)'}"


def render_markdown(scan: dict, when: date | None = None) -> str:
    when = when or date.today()
    questions = scan.get("questions") or []
    locked = any(question.get("review") == "open" for question in questions)
    practice_questions = [] if locked else to_child_view(scan)["questions"]
    flag_lines = []
    for question in questions:
        for flag in question.get("flags") or []:
            flag_lines.append(
                f"{question.get('id')} {flag.get('field')}: {flag.get('kind')}. {flag.get('note')}"
            )
    front = [
        "---",
        f"date: {when.isoformat()}",
        f"subject: {subject_slug(scan.get('subject') or '')}",
        f"source_photo: {_yaml_quote(scan.get('source_photo') or '')}",
        f"question_count: {len(questions)}",
        f"practice_count: {len(practice_questions)}",
        f"extraction: {scan.get('extraction') or 'unknown'}",
    ]
    if flag_lines:
        front.append("flags:")
        front.extend(f"  - {_yaml_quote(line)}" for line in flag_lines)
    else:
        front.append("flags: []")
    page_notes = scan.get("page_flags") or []
    if page_notes:
        front.append("page_flags:")
        front.extend(f"  - {_yaml_quote(str(flag.get('kind')) + ': ' + str(flag.get('note')))}" for flag in page_notes)
    front.append("---")

    parent = [
        "",
        f"# {scan.get('paper_title') or 'Homework'} · {when.isoformat()}",
        "",
        "## Parent copy",
        "",
        "Answers, marks, and notes in this section are for a parent.",
        "",
    ]
    if scan.get("note"):
        parent.extend([scan["note"], ""])
    for flag in page_notes:
        parent.extend([f"Page check ({flag.get('kind')}): {flag.get('note')}", ""])
    for question in questions:
        parent.extend(
            [
                f"### {question.get('id')}. {question.get('stem') or ''}",
                "",
                "Choices: " + (", ".join(question.get("choices") or []) or "(none)"),
                "",
                f"Child's handwritten answer: {question.get('student_answer') or '(blank)'}",
                "",
                f"Teacher's mark: {question.get('teacher_mark') or '(none)'}",
                "",
                _practice_line(question),
                "",
            ]
        )
        details = {key: question[key] for key in (
            "choice_letters", "working", "is_correct", "teacher_comment", "marks", "question_type", "sub_questions"
        ) if key in question}
        if details:
            parent.extend(["Parsed details (parent only):", "", "```json", json.dumps(details, ensure_ascii=False, indent=2), "```", ""])
        if question.get("stem_edited"):
            parent.extend(["Stem edited by parent before practice.", ""])
        explanation = question.get("explanation") or "an explanation appears once an answer is picked."
        parent.extend([f"For you: {explanation}", ""])
        flags = question.get("flags") or []
        if flags:
            parent.append("Flags:")
            parent.append("")
            for flag in flags:
                label = "AI wrote this" if flag.get("kind") == "generated" else "AI filled this in"
                parent.append(f"- {label} ({flag.get('field')}): {flag.get('note')}")
            parent.append("")

    practice = [
        "## Practice prompts",
        "",
        "The child view uses only these stems and choices. No handwritten answer, teacher's mark, or correct answer.",
        "",
    ]
    if locked:
        practice.extend(["Practice is locked until every question has a picked answer or is dropped.", ""])
    elif not practice_questions:
        practice.extend(["No practice. Every question was dropped.", ""])
    for question in practice_questions:
        practice.append(f"### {question['id']}. {question['stem']}")
        practice.append("")
        if question["choices"]:
            for choice in question["choices"]:
                practice.append(f"- {choice}")
        else:
            practice.append("- (read the sentence)")
        practice.append("")
    return "\n".join(front + parent + practice).rstrip() + "\n"


def _target_path(folder: str, name: str, replace: list[str]) -> str:
    """Reuse an earlier note for this scan, but only a Sprout note directly inside folder."""
    real_folder = os.path.realpath(folder)
    for candidate in replace:
        if not isinstance(candidate, str) or not NOTE_NAME.match(os.path.basename(candidate)):
            continue
        if os.path.realpath(os.path.dirname(candidate)) == real_folder and os.path.isfile(candidate):
            return os.path.join(folder, os.path.basename(candidate))
    return _unique_path(folder, name)


def save_scan(scan: dict, replace: list[str] | None = None) -> dict:
    """Write the note. Paths in replace, from an earlier save of the same scan, are overwritten."""
    when = date.today()
    body = render_markdown(scan, when)
    name = _filename(scan.get("subject") or "", when)
    replace = list(replace or [])
    written: list[str] = []
    skipped: list[str] = []
    for folder in destination_dirs():
        usable = _usable(folder)
        if not usable:
            skipped.append(folder)
            continue
        path = _target_path(usable, name, replace)
        Path(path).write_text(body, encoding="utf-8")
        written.append(path)
    if not written:
        fallback = _usable(os.path.abspath(FALLBACK_DIR))
        if not fallback:
            raise OSError("Could not write the Markdown note")
        path = _target_path(fallback, name, replace)
        Path(path).write_text(body, encoding="utf-8")
        written.append(path)
    return {"paths": written, "skipped": skipped}
