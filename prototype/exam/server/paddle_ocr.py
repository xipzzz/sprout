"""Optional local OCR with PaddleOCR (PP-OCRv5 mobile, CPU).

Install with `pip install -r prototype/exam/server/requirements-paddle.txt`.
Models are public and download once into ~/.paddlex on first use. No account, no key.
One recognition model (PP-OCRv5_mobile_rec) reads Chinese and English, so there is
no language retry. Boxes are grouped into lines top to bottom, left to right.
"""

from __future__ import annotations

import importlib.util
import os
import threading
from dataclasses import dataclass

import numpy as np

ENGINES = ("tesseract", "paddle")
INSTALL = "pip install -r prototype/exam/server/requirements-paddle.txt"
DET_MODEL = "PP-OCRv5_mobile_det"
REC_MODEL = "PP-OCRv5_mobile_rec"
BLANK = "____"

_lock = threading.Lock()
_engine = None


class PaddleUnavailable(RuntimeError):
    pass


def engine_name(requested: str | None = None) -> str:
    """The OCR engine for this request: the explicit choice, else SPROUT_OCR, else tesseract."""
    name = (requested or os.environ.get("SPROUT_OCR") or "tesseract").strip().lower()
    if name not in ENGINES:
        raise ValueError(f"Unknown OCR engine {name!r}. Use one of: {', '.join(ENGINES)}.")
    return name


def available() -> bool:
    return importlib.util.find_spec("paddleocr") is not None and importlib.util.find_spec("paddle") is not None


def _get_engine():
    global _engine
    with _lock:
        if _engine is None:
            if not available():
                raise PaddleUnavailable(f"PaddleOCR is not installed. Run: {INSTALL}")
            from paddleocr import PaddleOCR

            _engine = PaddleOCR(
                text_detection_model_name=DET_MODEL,
                text_recognition_model_name=REC_MODEL,
                use_doc_orientation_classify=False,
                use_doc_unwarping=False,
                use_textline_orientation=False,
                text_det_box_thresh=0.3,
                text_det_unclip_ratio=2.0,
                # oneDNN in paddlepaddle 3.3 fails on some x86 CPUs; Apple Silicon never uses it.
                enable_mkldnn=False,
            )
        return _engine


@dataclass
class Box:
    text: str
    x0: float
    y0: float
    x1: float
    y1: float

    @property
    def height(self) -> float:
        return max(1.0, self.y1 - self.y0)


def read_boxes(rgb: np.ndarray) -> list[Box]:
    engine = _get_engine()
    with _lock:
        result = engine.predict(np.ascontiguousarray(rgb[..., ::-1]))[0]
    boxes = []
    for text, box in zip(result["rec_texts"], result["rec_boxes"]):
        text = str(text).strip()
        if text:
            x0, y0, x1, y1 = (float(v) for v in box)
            boxes.append(Box(text, x0, y0, x1, y1))
    return boxes


def group_lines(boxes: list[Box]) -> list[list[Box]]:
    """A box joins a line when its centre sits near the line's centre. Spans never grow, so lines do not chain."""
    lines: list[list[Box]] = []
    for box in sorted(boxes, key=lambda b: (b.y0 + b.y1) / 2):
        centre = (box.y0 + box.y1) / 2
        for line in lines:
            line_centre = float(np.mean([(b.y0 + b.y1) / 2 for b in line]))
            line_height = float(np.median([b.height for b in line]))
            if abs(centre - line_centre) <= 0.3 * min(line_height, box.height):
                line.append(box)
                break
        else:
            lines.append([box])
    lines.sort(key=lambda line: min(b.y0 for b in line))
    return [sorted(line, key=lambda b: b.x0) for line in lines]


def _underline_between(rgb: np.ndarray | None, left: Box, right: Box) -> bool:
    """A printed answer line in the gap between two boxes on one line."""
    if rgb is None:
        return False
    height = min(left.height, right.height)
    x0, x1 = int(left.x1) + 2, int(right.x0) - 2
    if x1 - x0 < 0.8 * height:
        return False
    y0 = int((left.y0 + left.y1) / 2)
    y1 = int(max(left.y1, right.y1) + 0.4 * height)
    region = rgb[max(0, y0) : min(rgb.shape[0], y1), max(0, x0) : min(rgb.shape[1], x1)]
    if region.size == 0:
        return False
    luma = region.astype(np.float32) @ np.array([0.299, 0.587, 0.114], np.float32)
    return bool(((luma < 140).mean(axis=1) >= 0.7).any())


def lines_to_text(lines: list[list[Box]], rgb: np.ndarray | None = None) -> str:
    out = []
    for line in lines:
        text = line[0].text
        for left, right in zip(line, line[1:]):
            if _underline_between(rgb, left, right):
                text = text.rstrip("_-–— ") + f" {BLANK} " + right.text.lstrip("._-–—, ")
            else:
                text += " " + right.text
        out.append(text)
    return "\n".join(out)


def paddle_text(rgb: np.ndarray) -> str:
    return lines_to_text(group_lines(read_boxes(rgb)), rgb)
