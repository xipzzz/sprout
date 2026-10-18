"""Obsidian side of the mistake notebook.

Mistakes.md sits next to the scan notes. Sprout rewrites only the block between
the markers and appends to the Log at the end, so anything the parent writes
outside the block is kept. The scan note gets a Parent review block with each
question's topic and mark, placed before its Practice prompts section.
"""

from __future__ import annotations

import os
from datetime import datetime
from pathlib import Path

from save_note import FALLBACK_DIR, _usable, destination_dirs

NOTEBOOK_FILE = "Mistakes.md"
BLOCK_START = "<!-- sprout:notebook:start -->"
BLOCK_END = "<!-- sprout:notebook:end -->"
REVIEW_START = "<!-- sprout:review:start -->"
REVIEW_END = "<!-- sprout:review:end -->"
LOG_HEADING = "## Log"
MARK_WORDS = {"right": "Right", "wrong": "Wrong", "unmarked": "Not marked"}


def _text(value) -> str:
    return " ".join(str(value or "").split())


def _plural(count: int, word: str) -> str:
    return f"{count} {word}" if count == 1 else f"{count} {word}s"


def render_block(payload: dict, now: datetime | None = None) -> str:
    now = now or datetime.now()
    groups = payload.get("groups") or []
    total = sum(int(group.get("count") or 0) for group in groups)
    lines = [
        BLOCK_START,
        f"_Updated {now.strftime('%Y-%m-%d %H:%M')} by Sprout. "
        "Sprout rewrites this block. Write your own notes outside it._",
        "",
        "## Mistake notebook",
        "",
        f"{_plural(total, 'question')} in the notebook. Answers here are for a parent.",
        "",
    ]
    for group in groups:
        lines.extend([f"### {_text(group.get('label'))} ({int(group.get('count') or 0)})", ""])
        for topic in group.get("topics") or []:
            entries = topic.get("entries") or []
            lines.extend([f"#### {_text(topic.get('label'))} ({len(entries)})", ""])
            for entry in entries:
                choices = ", ".join(_text(choice) for choice in entry.get("choices") or []) or "(none)"
                lines.append(
                    f"- {_text(entry.get('stem'))} Choices: {choices}. "
                    f"Child wrote: {_text(entry.get('student_answer')) or '(blank)'}. "
                    f"Practice answer: {_text(entry.get('correct_answer')) or '(unknown)'}. "
                    f"Your mark: {MARK_WORDS.get(str(entry.get('parent_mark') or 'wrong'), 'Wrong')}. "
                    f"From {_text(entry.get('paper_title')) or 'a scan'}, {_text(entry.get('added'))}."
                )
            lines.append("")

    weak = payload.get("weak") or []
    lines.extend(["## Weak topics", ""])
    if weak:
        lines.extend(
            [
                "Ranked by questions in the notebook plus wrong first tries in practice.",
                "",
                "| Rank | Topic | Subject | In notebook | Missed in practice |",
                "|---|---|---|---|---|",
            ]
        )
        for rank, row in enumerate(weak, start=1):
            tries = int(row.get("practice_tries") or 0)
            misses = int(row.get("practice_misses") or 0)
            missed = f"{misses} of {tries}" if tries else "not practised"
            lines.append(
                f"| {rank} | {_text(row.get('label'))} | {_text(row.get('subject_label'))} "
                f"| {int(row.get('in_notebook') or 0)} | {missed} |"
            )
    else:
        lines.append("No weak topics yet.")
    lines.append("")

    sessions = payload.get("sessions") or []
    lines.extend(["## Practice sessions", ""])
    if sessions:
        lines.extend(["| When | Round | Right first try | Missed by topic |", "|---|---|---|---|"])
        for session in sessions:
            checked = int(session.get("right") or 0) + int(session.get("wrong") or 0)
            score = f"{int(session.get('right') or 0)} of {checked}"
            unchecked = int(session.get("unchecked") or 0)
            if unchecked:
                score += f", {unchecked} not checked"
            missed = ", ".join(
                f"{_text(item.get('label'))} {int(item.get('count') or 0)}" for item in session.get("missed") or []
            ) or "none"
            lines.append(f"| {_text(session.get('at'))} | {_text(session.get('scope'))} | {score} | {missed} |")
    else:
        lines.append("No practice yet.")
    lines.extend(["", BLOCK_END])
    return "\n".join(lines)


def merge_notebook(existing: str | None, payload: dict, now: datetime | None = None) -> str:
    now = now or datetime.now()
    block = render_block(payload, now)
    log = [f"- {now.strftime('%Y-%m-%d %H:%M')} · {_text(line)}" for line in payload.get("log") or [] if _text(line)]
    if not existing:
        front = [
            "---",
            "title: Sprout mistake notebook",
            f"created: {now.strftime('%Y-%m-%d')}",
            "tags: [sprout, mistakes]",
            "---",
            "",
            "# Mistake notebook",
            "",
        ]
        body = "\n".join(front) + block + f"\n\n{LOG_HEADING}\n\n"
        return body + ("\n".join(log) + "\n" if log else "")
    start = existing.find(BLOCK_START)
    end = existing.find(BLOCK_END)
    if start >= 0 and end > start:
        text = existing[:start] + block + existing[end + len(BLOCK_END) :]
    else:
        text = existing.rstrip() + "\n\n" + block + "\n"
    if LOG_HEADING not in text:
        text = text.rstrip() + f"\n\n{LOG_HEADING}\n\n"
    if log:
        text = text.rstrip() + "\n" + "\n".join(log) + "\n"
    return text


def save_notebook(payload: dict, now: datetime | None = None) -> dict:
    written: list[str] = []
    skipped: list[str] = []
    folders = []
    for folder in destination_dirs():
        usable = _usable(folder)
        if usable:
            folders.append(usable)
        else:
            skipped.append(folder)
    if not folders:
        fallback = _usable(os.path.abspath(FALLBACK_DIR))
        if not fallback:
            raise OSError("Could not write the mistake notebook")
        folders.append(fallback)
    for folder in folders:
        path = Path(folder) / NOTEBOOK_FILE
        existing = path.read_text(encoding="utf-8") if path.exists() else None
        path.write_text(merge_notebook(existing, payload, now), encoding="utf-8")
        written.append(str(path))
    return {"paths": written, "skipped": skipped}


def render_review(payload: dict) -> str:
    lines = [
        REVIEW_START,
        "## Parent review",
        "",
        "Topic and mark for each question, set or checked by a parent.",
        "",
        "| Question | Topic | Mark |",
        "|---|---|---|",
    ]
    for question in payload.get("questions") or []:
        topic = _text(question.get("topic"))
        if question.get("topic_source") == "parent":
            topic += " (set by you)"
        mark = MARK_WORDS.get(str(question.get("mark") or ""), "Not marked")
        stem = _text(question.get("stem")).replace("|", "/")
        lines.append(f"| {_text(question.get('id'))}. {stem} | {topic} | {mark} |")
    lines.extend(["", REVIEW_END])
    return "\n".join(lines)


def merge_review(existing: str, payload: dict) -> str:
    block = render_review(payload)
    start = existing.find(REVIEW_START)
    end = existing.find(REVIEW_END)
    if start >= 0 and end > start:
        return existing[:start] + block + existing[end + len(REVIEW_END) :]
    anchor = existing.find("\n## Practice prompts")
    if anchor >= 0:
        return existing[: anchor + 1] + block + "\n\n" + existing[anchor + 1 :]
    return existing.rstrip() + "\n\n" + block + "\n"


def _allowed_roots() -> list[str]:
    roots = [os.path.realpath(folder) for folder in destination_dirs()]
    roots.append(os.path.realpath(os.path.abspath(FALLBACK_DIR)))
    return roots


def _inside(path: str, roots: list[str]) -> bool:
    real = os.path.realpath(path)
    return any(os.path.commonpath([real, root]) == root for root in roots)


def save_review(payload: dict) -> dict:
    """Update the Parent review block in scan notes this saver wrote earlier."""
    roots = _allowed_roots()
    written: list[str] = []
    skipped: list[str] = []
    for raw in payload.get("paths") or []:
        path = str(raw)
        if not path.endswith(".md") or not _inside(path, roots) or not os.path.isfile(path):
            skipped.append(path)
            continue
        if os.path.basename(path) == NOTEBOOK_FILE:
            skipped.append(path)
            continue
        note = Path(path)
        note.write_text(merge_review(note.read_text(encoding="utf-8"), payload), encoding="utf-8")
        written.append(path)
    return {"paths": written, "skipped": skipped}
