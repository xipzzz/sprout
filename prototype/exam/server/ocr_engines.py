"""Server-side OCR engines for the cleaned page: Tesseract (default) or local PaddleOCR.

Pick the engine with SPROUT_OCR=paddle, or per request with ?ocr=paddle.
PaddleOCR is optional. Install it with:

    pip install -r prototype/exam/server/requirements-paddle.txt

Both engines run on this machine. Neither needs a key or an account.
"""

from __future__ import annotations

import os
import shutil
import subprocess
import tempfile

import numpy as np

ENGINES = ("tesseract", "paddle")

PADDLE_INSTALL_HINT = (
    "PaddleOCR is not installed on this server. Install it with "
    "'pip install -r prototype/exam/server/requirements-paddle.txt' "
    "(paddlepaddle needs Python 3.9 to 3.12), or drop ocr=paddle to use Tesseract."
)

# Sprout's OCR language codes mapped to PaddleOCR's.
PADDLE_LANG = {"eng": "en", "chi_sim": "ch"}


class OcrUnavailable(RuntimeError):
    """The chosen engine cannot run here. The message says what to install."""


def pick_engine(requested: str = "") -> str:
    """The request value wins, then SPROUT_OCR, then Tesseract."""
    for value in (requested, os.environ.get("SPROUT_OCR", "")):
        value = (value or "").strip().lower()
        if value in ENGINES:
            return value
    return "tesseract"


def tesseract_langs() -> set[str]:
    if not shutil.which("tesseract"):
        return set()
    try:
        out = subprocess.check_output(["tesseract", "--list-langs"], stderr=subprocess.STDOUT, text=True, timeout=10)
    except (OSError, subprocess.SubprocessError):
        return set()
    return {line.strip() for line in out.splitlines()[1:] if line.strip()}


def tesseract_text(rgb: np.ndarray, lang: str = "eng") -> str:
    """Text from the Tesseract binary, or empty when it is missing or fails."""
    if not shutil.which("tesseract"):
        return ""
    from PIL import Image

    with tempfile.NamedTemporaryFile(suffix=".png") as handle:
        Image.fromarray(rgb, "RGB").save(handle.name)
        try:
            out = subprocess.check_output(
                # psm 4 reads the page as one column. The default (psm 3) splits a worksheet into
                # blocks and drops the question numbers from the choices.
                ["tesseract", handle.name, "stdout", "-l", lang, "--psm", "4"],
                stderr=subprocess.DEVNULL,
                text=True,
                timeout=40,
            )
        except (OSError, subprocess.SubprocessError):
            return ""
    return out.strip()


_paddle_readers: dict[str, object] = {}


def _paddle_reader(lang: str):
    try:
        from paddleocr import PaddleOCR
    except ImportError as exc:
        raise OcrUnavailable(PADDLE_INSTALL_HINT) from exc
    code = PADDLE_LANG.get(lang, "en")
    if code not in _paddle_readers:
        try:
            # PaddleOCR 3.x. The page is already upright and flat, so skip its own orientation steps.
            _paddle_readers[code] = PaddleOCR(
                lang=code,
                use_doc_orientation_classify=False,
                use_doc_unwarping=False,
                use_textline_orientation=False,
            )
        except (TypeError, ValueError):
            # PaddleOCR 2.x does not know those options.
            _paddle_readers[code] = PaddleOCR(lang=code, show_log=False)
    return _paddle_readers[code]


def _paddle_boxes(result) -> list[tuple[list[list[float]], str]]:
    """(polygon, text) pairs from either PaddleOCR 3.x predict() or 2.x ocr() output."""
    boxes: list[tuple[list[list[float]], str]] = []
    for page in result or []:
        if page is None:
            continue
        data = page.json.get("res", page.json) if hasattr(page, "json") else page
        if isinstance(data, dict):
            for poly, text in zip(data.get("rec_polys") or data.get("dt_polys") or [], data.get("rec_texts") or []):
                boxes.append((np.asarray(poly, dtype=float).tolist(), str(text)))
            continue
        for item in data:
            if isinstance(item, (list, tuple)) and len(item) == 2 and isinstance(item[1], (list, tuple)):
                boxes.append((np.asarray(item[0], dtype=float).tolist(), str(item[1][0])))
    return boxes


def lines_from_boxes(boxes: list[tuple[list[list[float]], str]]) -> str:
    """Join word or phrase boxes into reading-order lines, so the worksheet parser sees Tesseract-like text."""
    items = []
    for poly, text in boxes:
        if not text.strip():
            continue
        ys = [point[1] for point in poly]
        xs = [point[0] for point in poly]
        items.append((min(ys), max(ys), min(xs), text.strip()))
    items.sort(key=lambda item: (item[0], item[2]))
    lines: list[list[tuple[float, float, float, str]]] = []
    for item in items:
        top, bottom = item[0], item[1]
        middle = (top + bottom) / 2
        if lines:
            last = lines[-1]
            last_top = min(entry[0] for entry in last)
            last_bottom = max(entry[1] for entry in last)
            if last_top <= middle <= last_bottom:
                last.append(item)
                continue
        lines.append([item])
    return "\n".join(" ".join(entry[3] for entry in sorted(line, key=lambda e: e[2])) for line in lines)


def paddle_text(rgb: np.ndarray, lang: str = "eng") -> str:
    """Text from local PaddleOCR. Raises OcrUnavailable with an install hint when it is missing."""
    reader = _paddle_reader(lang)
    image = np.ascontiguousarray(rgb[:, :, ::-1])  # PaddleOCR expects BGR, like OpenCV.
    if hasattr(reader, "predict"):
        result = reader.predict(image)
    else:
        result = reader.ocr(image, cls=False)
    return lines_from_boxes(_paddle_boxes(result))


def page_text(rgb: np.ndarray, lang: str, engine: str) -> str:
    return paddle_text(rgb, lang) if engine == "paddle" else tesseract_text(rgb, lang)
