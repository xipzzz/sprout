"""Local OCR adapters. Neither adapter calls a paid service."""

from __future__ import annotations

import os
import shutil
import subprocess
import tempfile
from functools import lru_cache
from pathlib import Path

import numpy as np
from PIL import Image

PADDLE_HELP = (
    "PaddleOCR is unavailable in this Python environment. "
    "Install prototype/exam/server/requirements-paddle.txt with a supported Python and PaddlePaddle wheel, "
    "or select tesseract. No paid key is needed."
)


class OcrUnavailable(RuntimeError):
    pass


def read_tesseract(rgb: np.ndarray, lang: str) -> str:
    if not shutil.which("tesseract"):
        raise OcrUnavailable("Local Tesseract is not installed. Install it and its language data, or use browser OCR.")
    with tempfile.TemporaryDirectory(prefix="sprout-ocr-") as folder:
        image = Path(folder) / "page.png"
        Image.fromarray(rgb).save(image)
        try:
            result = subprocess.run(
                ["tesseract", str(image), "stdout", "-l", lang],
                capture_output=True, text=True, timeout=90, check=True,
            )
        except (OSError, subprocess.SubprocessError) as exc:
            raise OcrUnavailable(f"Local Tesseract failed for language {lang}. Check its language data.") from exc
    return result.stdout.strip()


@lru_cache(maxsize=2)
def _paddle_engine(lang: str):
    # Keep model downloads in the user's cache, including when the caller is in the checkout.
    cache = Path.home() / ".cache" / "sprout"
    os.environ.setdefault("PADDLE_HOME", str(cache / "paddle"))
    os.environ.setdefault("PADDLE_PDX_CACHE_HOME", str(cache / "paddlex"))
    try:
        from paddleocr import PaddleOCR

        return PaddleOCR(
            lang="ch" if lang == "chi_sim" else "en", device="cpu",
            use_doc_orientation_classify=False, use_doc_unwarping=False, use_textline_orientation=False,
        )
    except Exception as exc:
        raise OcrUnavailable(PADDLE_HELP) from exc


def read_paddle(rgb: np.ndarray, lang: str) -> str:
    engine = _paddle_engine(lang)
    try:
        # Paddle's NumPy image input uses OpenCV's BGR channel order.
        pages = engine.predict(rgb[:, :, ::-1].copy())
        lines = [text.strip() for page in pages for text in page["rec_texts"] if isinstance(text, str) and text.strip()]
    except Exception as exc:
        raise OcrUnavailable("PaddleOCR could not read the cleaned page. Check its local models and runtime. " + PADDLE_HELP) from exc
    return "\n".join(lines)


def recognize(rgb: np.ndarray, backend: str, lang: str = "eng") -> str:
    if backend == "paddle":
        return read_paddle(rgb, lang)
    if backend == "tesseract":
        return read_tesseract(rgb, lang)
    raise ValueError("Choose OCR paddle or tesseract.")
