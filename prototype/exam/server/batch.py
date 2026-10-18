"""Run a folder of worksheet photos through one OCR engine and write a CSV.

    prototype/exam/.venv/bin/python -m prototype.exam.server.batch --ocr paddle ~/pages --out ~/sprout-results/paddle.csv

Each photo goes through the same path as the app: straighten, lift ink, OCR the
cleaned page, parse, flag, and check the child payload. Nothing is saved to the
vault, and the CSV must live outside the repo, so private pages never land in git.
Tesseract uses a local `tesseract` binary if there is one, else Tesseract.js in Node
(the browser's engine; needs `npm install`).
"""

from __future__ import annotations

import sys

sys.dont_write_bytecode = True

import argparse
import asyncio
import csv
import subprocess
import tempfile
import time
from pathlib import Path

SERVER = Path(__file__).resolve().parent
REPO_ROOT = SERVER.parents[2]
if str(SERVER) not in sys.path:
    sys.path.insert(0, str(SERVER))

import paddle_ocr  # noqa: E402
from scan_reader import read_photo  # noqa: E402
from schema import assert_child_view_safe, to_child_view  # noqa: E402
from worksheet_text import printed_numbers  # noqa: E402

IMAGE_SUFFIXES = {".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tif", ".tiff"}
OCR_FIXTURE = REPO_ROOT / "prototype" / "exam" / "ocr_fixture.mjs"
COLUMNS = [
    "file",
    "engine",
    "status",
    "ocr_lang",
    "layout",
    "questions",
    "printed_numbers",
    "detected_numbers",
    "split_check",
    "choices_parsed",
    "page_flags",
    "child_guard",
    "prepare_s",
    "ocr_s",
    "total_s",
    "message",
]
SENTINELS = {
    "student_answer": "sprout-batch-child-wrote",
    "teacher_mark": "sprout-batch-teacher-mark",
    "explanation": "sprout-batch-parent-explanation",
}


def inside_repo(path: Path) -> bool:
    try:
        path.resolve().relative_to(REPO_ROOT)
        return True
    except ValueError:
        return False


def images_in(folder: Path) -> list[Path]:
    return sorted(p for p in folder.rglob("*") if p.is_file() and p.suffix.lower() in IMAGE_SUFFIXES)


def node_tesseract(image_jpeg: bytes, lang: str) -> str:
    with tempfile.TemporaryDirectory(prefix="sprout-batch-") as tmp:
        image = Path(tmp) / "page.jpg"
        image.write_bytes(image_jpeg)
        out = subprocess.run(
            ["node", str(OCR_FIXTURE), str(image), lang],
            capture_output=True,
            text=True,
            timeout=300,
            cwd=tmp,
        )
    if out.returncode != 0:
        raise RuntimeError(f"Tesseract.js failed: {out.stderr.strip()[:200]}")
    return out.stdout


def split_check(printed: list[int], detected: list[int]) -> str:
    missing = sorted(set(printed) - set(detected))
    extra = sorted(set(detected) - set(printed))
    if not missing and not extra:
        return "ok"
    parts = []
    if missing:
        parts.append("missing " + " ".join(map(str, missing)))
    if extra:
        parts.append("extra " + " ".join(map(str, extra)))
    return "; ".join(parts)


def child_guard(scan: dict) -> str:
    """Fill the parent fields with sentinels, then check none of them reach the child payload."""
    parent = {
        **scan,
        "questions": [
            {**question, **SENTINELS, "correct_answer": question["choices"][0] if question["choices"] else "sprout-batch-answer"}
            for question in scan["questions"]
        ],
    }
    child = to_child_view(parent)
    try:
        assert_child_view_safe(parent, child)
    except AssertionError as exc:
        return f"FAIL: {exc}"
    blob = repr(child)
    if any(value in blob for value in SENTINELS.values()) or any(set(q) != {"id", "stem", "choices"} for q in child["questions"]):
        return "FAIL: parent field in child payload"
    return "pass"


async def read_page(path: Path, engine: str, subject: str) -> dict:
    data = path.read_bytes()
    started = time.perf_counter()
    if engine == "paddle":
        result = await read_photo(data, path.name, False, "", subject, "", "paddle")
    else:
        result = await read_photo(data, path.name, False, "", subject, "", "tesseract")
        tried = set()
        while result.get("need_ocr") and result.get("ocr_lang") not in tried:
            lang = result["ocr_lang"]
            tried.add(lang)
            jpeg = _decode(result["ocr_jpeg"])
            ocr_started = time.perf_counter()
            text = node_tesseract(jpeg, lang)
            node_s = time.perf_counter() - ocr_started
            result = await read_photo(data, path.name, False, text, subject, lang, "tesseract")
            result.setdefault("timings", {})["ocr_s"] = round(result.get("timings", {}).get("ocr_s", 0) + node_s, 3)
    result["total_s"] = round(time.perf_counter() - started, 3)
    return result


def _decode(data_url: str) -> bytes:
    import base64

    return base64.b64decode(data_url.split(",", 1)[1])


def row_for(path: Path, folder: Path, engine: str, result: dict) -> dict:
    timings = result.get("timings") or {}
    row = {
        "file": str(path.relative_to(folder)),
        "engine": engine,
        "prepare_s": timings.get("prepare_s", ""),
        "ocr_s": timings.get("ocr_s", ""),
        "total_s": result.get("total_s", ""),
        "ocr_lang": result.get("ocr_lang", ""),
    }
    if not result.get("ok"):
        status = "unsupported" if result.get("unsupported") else "error"
        return {**row, "status": status, "message": result.get("message", "")[:200], "questions": 0}
    scan = result["scan"]
    detected = [int(q["id"]) for q in scan["questions"] if str(q["id"]).isdigit()]
    printed = printed_numbers(result.get("ocr_text", ""))
    flags = [flag["kind"] for flag in scan.get("page_flags") or []]
    layout = next((kind for kind in flags if kind in {"cloze", "editing"}), "questions")
    return {
        **row,
        "status": "ok",
        "ocr_lang": scan.get("ocr_lang", ""),
        "layout": layout,
        "questions": len(scan["questions"]),
        "printed_numbers": " ".join(map(str, printed)),
        "detected_numbers": " ".join(map(str, detected)),
        "split_check": split_check(printed, detected),
        "choices_parsed": sum(1 for q in scan["questions"] if len(q["choices"]) >= 2),
        "page_flags": " ".join(flags),
        "child_guard": child_guard(scan),
        "message": "",
    }


async def run(folder: Path, out: Path, engine: str, subject: str) -> list[dict]:
    rows = []
    with out.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=COLUMNS)
        writer.writeheader()
        for path in images_in(folder):
            try:
                result = await read_page(path, engine, subject)
                row = row_for(path, folder, engine, result)
            except Exception as exc:  # one bad page must not stop the batch
                row = {"file": str(path.relative_to(folder)), "engine": engine, "status": "error", "message": str(exc)[:200]}
            writer.writerow(row)
            handle.flush()
            rows.append(row)
            print(f"{row['file']}: {row['status']} q={row.get('questions', 0)} choices={row.get('choices_parsed', '')} "
                  f"split={row.get('split_check', '')} guard={row.get('child_guard', '')} {row.get('total_s', '')}s",
                  file=sys.stderr)
    return rows


def _remove_own_bytecode() -> None:
    """`python -m` caches this file's bytecode before any line here runs; take it back out of the repo."""
    import importlib.util

    cached = Path(importlib.util.cache_from_source(__file__))
    cached.unlink(missing_ok=True)
    try:
        cached.parent.rmdir()
    except OSError:
        pass


def main(argv: list[str] | None = None) -> int:
    _remove_own_bytecode()
    parser = argparse.ArgumentParser(prog="python -m prototype.exam.server.batch", description=__doc__.split("\n\n")[0])
    parser.add_argument("folder", type=Path, help="folder of worksheet photos (searched recursively)")
    parser.add_argument("--ocr", choices=paddle_ocr.ENGINES, default=None, help="OCR engine (default: SPROUT_OCR or tesseract)")
    parser.add_argument("--out", type=Path, required=True, help="CSV path, outside the repo")
    parser.add_argument("--subject", default="auto", help="auto, english, math or chinese")
    args = parser.parse_args(argv)

    engine = paddle_ocr.engine_name(args.ocr)
    out = args.out.expanduser()
    if inside_repo(out):
        print(f"Refusing to write {out}: results must stay outside the repo ({REPO_ROOT}).", file=sys.stderr)
        return 2
    folder = args.folder.expanduser()
    if not folder.is_dir():
        print(f"Not a folder: {folder}", file=sys.stderr)
        return 2
    if engine == "paddle" and not paddle_ocr.available():
        print(f"PaddleOCR is not installed. Run: {paddle_ocr.INSTALL}", file=sys.stderr)
        return 2
    out.parent.mkdir(parents=True, exist_ok=True)
    rows = asyncio.run(run(folder, out, engine, args.subject))
    ok = sum(1 for row in rows if row["status"] == "ok")
    with_choices = sum(1 for row in rows if (row.get("choices_parsed") or 0) > 0)
    guard_fail = sum(1 for row in rows if str(row.get("child_guard", "")).startswith("FAIL"))
    print(
        f"{len(rows)} pages, {ok} read, {with_choices} with parsed choices, "
        f"{guard_fail} guard failures. Wrote {out}",
        file=sys.stderr,
    )
    return 1 if guard_fail else 0


if __name__ == "__main__":
    sys.exit(main())
