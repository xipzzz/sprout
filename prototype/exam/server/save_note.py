"""Write one Obsidian Markdown note per scan.

Default vault: /Users/ml/Documents/10_Obsidian/Xip/Sprout/
Also writes SPROUT_SAVE_DIR when that folder is different.
"""

from __future__ import annotations

import os
from datetime import date, datetime
from pathlib import Path

from schema import subject_slug, to_child_view

DEFAULT_VAULT = "/Users/ml/Documents/10_Obsidian/Xip/Sprout"
FALLBACK_DIR = "sprout-notes"


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


def render_markdown(scan: dict, when: date | None = None) -> str:
    when = when or date.today()
    questions = scan.get("questions") or []
    flag_lines = []
    for question in questions:
        for flag in question.get("flags") or []:
            flag_lines.append(
                f"{question.get('id')} {flag.get('field')}: {flag.get('kind')} — {flag.get('note')}"
            )
    front = [
        "---",
        f"date: {when.isoformat()}",
        f"subject: {subject_slug(scan.get('subject') or '')}",
        f"source_photo: {_yaml_quote(scan.get('source_photo') or '')}",
        f"question_count: {len(questions)}",
        f"extraction: {scan.get('extraction') or 'unknown'}",
    ]
    if flag_lines:
        front.append("flags:")
        front.extend(f"  - {_yaml_quote(line)}" for line in flag_lines)
    else:
        front.append("flags: []")
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
                f"Practice answer (hidden from the child): {question.get('correct_answer') or '(unknown)'}",
                "",
                f"For you: {question.get('explanation') or ''}",
                "",
            ]
        )
        flags = question.get("flags") or []
        if flags:
            parent.append("Flags:")
            parent.append("")
            for flag in flags:
                label = "AI wrote this" if flag.get("kind") == "generated" else "AI filled this in"
                parent.append(f"- {label} ({flag.get('field')}): {flag.get('note')}")
            parent.append("")

    child = to_child_view(scan)
    practice = [
        "## Practice prompts",
        "",
        "The child view uses only these stems and choices. No handwritten answer, teacher's mark, or correct answer.",
        "",
    ]
    for question in child["questions"]:
        practice.append(f"### {question['id']}. {question['stem']}")
        practice.append("")
        if question["choices"]:
            for choice in question["choices"]:
                practice.append(f"- {choice}")
        else:
            practice.append("- (read the sentence)")
        practice.append("")
    return "\n".join(front + parent + practice).rstrip() + "\n"


def save_scan(scan: dict) -> dict:
    when = date.today()
    body = render_markdown(scan, when)
    name = _filename(scan.get("subject") or "", when)
    written: list[str] = []
    skipped: list[str] = []
    for folder in destination_dirs():
        usable = _usable(folder)
        if not usable:
            skipped.append(folder)
            continue
        path = _unique_path(usable, name)
        Path(path).write_text(body, encoding="utf-8")
        written.append(path)
    if not written:
        fallback = _usable(os.path.abspath(FALLBACK_DIR))
        if not fallback:
            raise OSError("Could not write the Markdown note")
        path = _unique_path(fallback, name)
        Path(path).write_text(body, encoding="utf-8")
        written.append(path)
    return {"paths": written, "skipped": skipped}
