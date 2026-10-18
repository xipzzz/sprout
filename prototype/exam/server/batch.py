"""Scan a folder of homework photos with one OCR engine and write one CSV row per photo.

Run from the repo root:

    python -m prototype.exam.server.batch --ocr tesseract ~/Pictures/homework --out ~/Desktop/results.csv
    python -m prototype.exam.server.batch --ocr paddle ~/Pictures/homework --out ~/Desktop/results.csv

It never writes into the repo: --out must point outside it, and no note or scan copy is saved.
It never calls a paid vision model, even when ZHIPU_API_KEY is set.
"""

from __future__ import annotations

import argparse
import csv
import sys
import time
from pathlib import Path

SERVER_DIR = Path(__file__).resolve().parent
REPO_ROOT = SERVER_DIR.parents[2]
if str(SERVER_DIR) not in sys.path:
    sys.path.insert(0, str(SERVER_DIR))

from deskew import prepare_page  # noqa: E402
from extract import _tesseract_scan  # noqa: E402
from ocr_engines import ENGINES, PADDLE_INSTALL_HINT, OcrUnavailable, _paddle_reader, tesseract_langs  # noqa: E402

PHOTO_SUFFIXES = {".jpg", ".jpeg", ".png", ".heic", ".webp", ".tif", ".tiff", ".bmp"}

COLUMNS = [
    "file",
    "engine",
    "ok",
    "message",
    "subject",
    "ocr_lang",
    "paper_title",
    "question_count",
    "questions_with_choices",
    "flag_count",
    "page_flags",
    "exif_orientation",
    "deskew_applied",
    "ink_pixels_lifted",
    "seconds",
    "stems",
]


def inside_repo(path: Path) -> bool:
    resolved = path.expanduser().resolve()
    return resolved == REPO_ROOT or REPO_ROOT in resolved.parents


def photos_in(folder: Path) -> list[Path]:
    return sorted(p for p in folder.iterdir() if p.is_file() and p.suffix.lower() in PHOTO_SUFFIXES)


def scan_row(photo: Path, engine: str, subject: str) -> dict:
    started = time.perf_counter()
    row = {column: "" for column in COLUMNS}
    row.update(file=photo.name, engine=engine)
    try:
        page = prepare_page(photo.read_bytes())
    except Exception as exc:  # A broken photo should not stop the batch.
        row.update(ok="no", message=f"Could not open the photo: {exc}"[:300])
        row["seconds"] = f"{time.perf_counter() - started:.2f}"
        return row
    row.update(
        exif_orientation=page["deskew"].get("exif_orientation", 1),
        deskew_applied="yes" if page["deskew"]["applied"] else "no",
        ink_pixels_lifted=page["ink_pixels_lifted"],
    )
    result = _tesseract_scan(page, {}, photo.name, "", subject, "", engine)
    if result.get("need_ocr"):
        lang = result.get("ocr_lang", "eng")
        if not tesseract_langs():
            message = "The tesseract binary is not installed. Install it, or use --ocr paddle."
        elif lang not in tesseract_langs():
            message = f"Tesseract has no {lang} language data. Install it (brew install tesseract-lang), or use --ocr paddle."
        else:
            message = f"Tesseract read no text ({lang})."
        result = {"ok": False, "ocr_lang": lang, "message": message}
    if result.get("ok"):
        scan = result["scan"]
        questions = scan["questions"]
        row.update(
            ok="yes",
            subject=scan["subject"],
            ocr_lang=scan.get("ocr_lang", ""),
            paper_title=scan["paper_title"],
            question_count=len(questions),
            questions_with_choices=sum(1 for q in questions if q["choices"]),
            flag_count=sum(len(q["flags"]) for q in questions),
            page_flags=" ".join(flag["kind"] for flag in scan.get("page_flags") or []),
            stems=" | ".join(f"{q['id']}. {q['stem']}" for q in questions)[:2000],
        )
    else:
        row.update(ok="no", message=result.get("message", ""), ocr_lang=result.get("ocr_lang", ""))
    row["seconds"] = f"{time.perf_counter() - started:.2f}"
    return row


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="python -m prototype.exam.server.batch", description=__doc__.split("\n\n")[0])
    parser.add_argument("folder", type=Path, help="folder of homework photos")
    parser.add_argument("--ocr", choices=ENGINES, default="tesseract", help="OCR engine (default: tesseract)")
    parser.add_argument("--out", type=Path, required=True, help="CSV path, outside the repo")
    parser.add_argument("--subject", default="auto", help="auto, english, math or chinese (default: auto)")
    args = parser.parse_args(argv)

    folder = args.folder.expanduser()
    out = args.out.expanduser()
    if not folder.is_dir():
        parser.error(f"{folder} is not a folder")
    if inside_repo(out):
        parser.error(f"--out {out} is inside the repo. Pick a path outside {REPO_ROOT}.")
    photos = photos_in(folder)
    if not photos:
        parser.error(f"No photos in {folder}")
    if args.ocr == "paddle":
        try:
            _paddle_reader("eng")
        except OcrUnavailable:
            print(PADDLE_INSTALL_HINT, file=sys.stderr)
            return 2

    out.parent.mkdir(parents=True, exist_ok=True)
    passed = 0
    with out.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=COLUMNS)
        writer.writeheader()
        for index, photo in enumerate(photos, 1):
            row = scan_row(photo, args.ocr, args.subject)
            writer.writerow(row)
            handle.flush()
            passed += row["ok"] == "yes"
            print(f"[{index}/{len(photos)}] {photo.name}: {row['ok']} {row['question_count'] or row['message'][:80]}")
    print(f"{passed} of {len(photos)} photos gave questions. Wrote {out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
