"""Read a folder locally and export question rows to a CSV outside the checkout."""

from __future__ import annotations

import sys

# Suppress caches for the imported server modules. Run Python with -B to also
# suppress the interpreter's cache for this entry module.
sys.dont_write_bytecode = True

import argparse
import csv
import json
import os
import tempfile
from pathlib import Path

# The web server uses flat modules through uvicorn's --app-dir. Support the
# requested package-style CLI without changing that entry point.
sys.path.insert(0, str(Path(__file__).resolve().parent))
from extract import REPO_ROOT, local_scan

IMAGES = {".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tif", ".tiff"}
COLUMNS = ["file", "ocr", "status", "subject", "question_id", "stem", "choices", "choice_letters", "error"]


def csv_text(value: str) -> str:
    # A photographed formula must remain text when the CSV opens in a spreadsheet.
    return "'" + value if value.lstrip().startswith(("=", "+", "-", "@")) else value


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--ocr", required=True, choices=["paddle", "tesseract"])
    parser.add_argument("folder", type=Path)
    parser.add_argument("--out", required=True, type=Path)
    args = parser.parse_args(argv)
    folder, output = args.folder.resolve(), args.out.resolve()
    if not folder.is_dir():
        parser.error("The image folder does not exist.")
    if output.is_relative_to(REPO_ROOT):
        parser.error("CSV output must be outside the Sprout repository. Use an absolute path such as /tmp/results.csv.")
    if output.exists():
        parser.error("The output already exists. Choose a new CSV path.")
    if output.suffix.lower() != ".csv":
        parser.error("The output must have a .csv extension.")
    photos = sorted(path for path in folder.rglob("*") if path.is_file() and path.suffix.lower() in IMAGES)
    if not photos:
        parser.error("No supported images were found in that folder.")
    output.parent.mkdir(parents=True, exist_ok=True)
    failures = 0
    # Some optional runtimes write logs relative to cwd. Confine those to scratch.
    original_cwd = Path.cwd()
    cache_names = ("PADDLE_HOME", "PADDLE_PDX_CACHE_HOME", "XDG_CACHE_HOME", "HF_HOME")
    previous_cache = {name: os.environ.get(name) for name in cache_names}
    with tempfile.TemporaryDirectory(prefix="sprout-batch-") as scratch:
        for name in cache_names:
            configured = Path(os.environ.get(name) or str(Path.home() / ".cache" / "sprout" / name.lower())).resolve()
            os.environ[name] = str(Path(scratch) / name.lower() if configured.is_relative_to(REPO_ROOT) else configured)
        os.chdir(scratch)
        try:
            with output.open("x", encoding="utf-8", newline="") as handle:
                writer = csv.DictWriter(handle, fieldnames=COLUMNS)
                writer.writeheader()
                for photo in photos:
                    base = {"file": csv_text(str(photo.relative_to(folder))), "ocr": args.ocr}
                    try:
                        scan = local_scan(photo.read_bytes(), photo.name, args.ocr)
                        for question in scan["questions"]:
                            writer.writerow({**base, "status": "ok", "subject": scan["subject"],
                                             "question_id": csv_text(question["id"]), "stem": csv_text(question["stem"]),
                                             "choices": json.dumps(question["choices"], ensure_ascii=False),
                                             "choice_letters": json.dumps(question["choice_letters"], ensure_ascii=False)})
                    except Exception as exc:
                        failures += 1
                        writer.writerow({**base, "status": "error", "error": csv_text(str(exc))})
        finally:
            os.chdir(original_cwd)
            for name, previous in previous_cache.items():
                if previous is None:
                    os.environ.pop(name, None)
                else:
                    os.environ[name] = previous
    print(f"Read {len(photos)} images. {failures} failed. CSV: {output}")
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
