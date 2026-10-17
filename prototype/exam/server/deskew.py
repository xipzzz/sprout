"""Four-corner page deskew and a simple colored-ink lift.

Sprout's existing Tesseract scan path does not deskew. This is the prototype's
page-warp step: find the bright page quadrilateral and warp it flat.
"""

from __future__ import annotations

import io

import numpy as np
from PIL import Image


def load_rgb(image_bytes: bytes, max_edge: int = 1600) -> Image.Image:
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    scale = min(1.0, max_edge / max(image.size))
    if scale < 1:
        image = image.resize(
            (max(1, int(image.width * scale)), max(1, int(image.height * scale))),
            Image.Resampling.LANCZOS,
        )
    return image


def _page_corners(rgb: np.ndarray) -> np.ndarray | None:
    bright = rgb.min(axis=2) > 200
    ys, xs = np.where(bright)
    if xs.size < 80:
        return None
    pts = np.stack([xs.astype(float), ys.astype(float)], axis=1)
    total = pts.sum(axis=1)
    diff = pts[:, 0] - pts[:, 1]
    corners = np.stack(
        [
            pts[np.argmin(total)],
            pts[np.argmax(diff)],
            pts[np.argmax(total)],
            pts[np.argmin(diff)],
        ]
    )
    if _quad_area(corners) < rgb.shape[0] * rgb.shape[1] * 0.2:
        return None
    return corners


def _quad_area(corners: np.ndarray) -> float:
    x, y = corners[:, 0], corners[:, 1]
    return float(0.5 * np.abs(np.dot(x, np.roll(y, -1)) - np.dot(y, np.roll(x, -1))))


def _homography(src: np.ndarray, dst: np.ndarray) -> np.ndarray:
    matrix = []
    target = []
    for (x, y), (u, v) in zip(src, dst):
        matrix.append([x, y, 1, 0, 0, 0, -u * x, -u * y])
        target.append(u)
        matrix.append([0, 0, 0, x, y, 1, -v * x, -v * y])
        target.append(v)
    solved = np.linalg.solve(np.asarray(matrix, float), np.asarray(target, float))
    return np.array(
        [[solved[0], solved[1], solved[2]], [solved[3], solved[4], solved[5]], [solved[6], solved[7], 1.0]]
    )


def _warp(rgb: np.ndarray, corners: np.ndarray) -> np.ndarray:
    top = np.linalg.norm(corners[1] - corners[0])
    bottom = np.linalg.norm(corners[2] - corners[3])
    left = np.linalg.norm(corners[3] - corners[0])
    right = np.linalg.norm(corners[2] - corners[1])
    width = int(max(top, bottom))
    height = int(max(left, right))
    width = min(max(width, 32), 2000)
    height = min(max(height, 32), 2000)
    destination = np.array(
        [[0, 0], [width - 1, 0], [width - 1, height - 1], [0, height - 1]],
        dtype=float,
    )
    transform = _homography(destination, corners)
    ys, xs = np.mgrid[0:height, 0:width]
    ones = np.ones_like(xs, dtype=float)
    mapped = transform @ np.stack([xs.ravel(), ys.ravel(), ones.ravel()])
    mapped /= mapped[2]
    xi = mapped[0].reshape(height, width)
    yi = mapped[1].reshape(height, width)
    return _bilinear(rgb, xi, yi)


def _bilinear(rgb: np.ndarray, xs: np.ndarray, ys: np.ndarray) -> np.ndarray:
    height, width = rgb.shape[:2]
    x0 = np.floor(xs).astype(np.int32)
    y0 = np.floor(ys).astype(np.int32)
    x1 = x0 + 1
    y1 = y0 + 1
    valid = (x0 >= 0) & (y0 >= 0) & (x1 < width) & (y1 < height)
    x0c = np.clip(x0, 0, width - 1)
    x1c = np.clip(x1, 0, width - 1)
    y0c = np.clip(y0, 0, height - 1)
    y1c = np.clip(y1, 0, height - 1)
    wx = (xs - x0)[..., None]
    wy = (ys - y0)[..., None]
    top = rgb[y0c, x0c] * (1 - wx) + rgb[y0c, x1c] * wx
    bottom = rgb[y1c, x0c] * (1 - wx) + rgb[y1c, x1c] * wx
    mixed = top * (1 - wy) + bottom * wy
    out = np.full(xs.shape + (3,), 255, dtype=np.float32)
    out[valid] = mixed[valid]
    return np.clip(out, 0, 255).astype(np.uint8)


def lift_colored_ink(rgb: np.ndarray) -> tuple[np.ndarray, int]:
    """Replace blue handwriting and red marks with paper white.

    Pencil and black print stay. This is a prototype ink lift, not an inpainter.
    """
    red = rgb[:, :, 0].astype(int)
    green = rgb[:, :, 1].astype(int)
    blue = rgb[:, :, 2].astype(int)
    blue_ink = (blue > red + 18) & (blue > green + 12) & (blue < 250)
    red_ink = (red > green + 28) & (red > blue + 28) & (red > 90) & (green < 180)
    mask = blue_ink | red_ink
    out = rgb.copy()
    out[mask] = 255
    return out, int(mask.sum())


def jpeg_data_url(rgb: np.ndarray, quality: int = 70) -> str:
    import base64

    image = Image.fromarray(rgb, "RGB")
    buffer = io.BytesIO()
    image.save(buffer, format="JPEG", quality=quality)
    encoded = base64.b64encode(buffer.getvalue()).decode("ascii")
    return f"data:image/jpeg;base64,{encoded}"


def prepare_page(image_bytes: bytes) -> dict:
    image = load_rgb(image_bytes)
    rgb = np.asarray(image)
    corners = _page_corners(rgb)
    applied = False
    flat = rgb
    corner_list: list[list[float]] = []
    if corners is not None:
        try:
            flat = _warp(rgb, corners)
            applied = True
            corner_list = [[round(float(x), 1), round(float(y), 1)] for x, y in corners]
        except np.linalg.LinAlgError:
            flat = rgb
    clean, lifted = lift_colored_ink(flat)
    return {
        "deskew": {"applied": applied, "corners": corner_list},
        "ink_pixels_lifted": lifted,
        "deskew_jpeg": jpeg_data_url(flat),
        "clean_jpeg": jpeg_data_url(clean),
        "clean_rgb": clean,
    }
