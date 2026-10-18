"""Four-corner page deskew and a simple colored-ink lift.

Sprout's existing Tesseract scan path does not deskew. This is the prototype's
page-warp step: find the bright page quadrilateral and warp it flat.
"""

from __future__ import annotations

import io

import numpy as np
from PIL import Image
from scipy import ndimage

ORIENTATION_TAG = 274
T = Image.Transpose
# EXIF orientation value -> (what the parent is told, the transpose that stands the page up).
ORIENTATIONS = {
    2: ("mirrored", T.FLIP_LEFT_RIGHT),
    3: ("turned 180°", T.ROTATE_180),
    4: ("flipped", T.FLIP_TOP_BOTTOM),
    5: ("turned and mirrored", T.TRANSPOSE),
    6: ("turned 90° clockwise", T.ROTATE_270),
    7: ("turned and mirrored", T.TRANSVERSE),
    8: ("turned 90° anticlockwise", T.ROTATE_90),
}
UPRIGHT_TURN = {value: label for value, (label, _) in ORIENTATIONS.items()}


def load_rgb(image_bytes: bytes, max_edge: int = 1600) -> tuple[Image.Image, int]:
    """Decode a photo upright: phones store sideways pixels plus an EXIF orientation tag.

    Returns the image and the EXIF orientation it had (1 when none or unknown).
    """
    with Image.open(io.BytesIO(image_bytes)) as photo:
        tag = photo.getexif().get(ORIENTATION_TAG)
        page = photo.convert("RGB")
    orientation = tag if tag in ORIENTATIONS else 1
    if orientation != 1:
        page = page.transpose(ORIENTATIONS[orientation][1])
    ratio = max_edge / max(page.size)
    if ratio < 1:
        page = page.resize(tuple(max(1, int(side * ratio)) for side in page.size), Image.Resampling.LANCZOS)
    return page, orientation


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


_DISK2 = ndimage.generate_binary_structure(2, 1)


def _luma(rgb: np.ndarray) -> np.ndarray:
    channels = rgb.astype(np.float32)
    return 0.299 * channels[..., 0] + 0.587 * channels[..., 1] + 0.114 * channels[..., 2]


def _ink_candidates(rgb: np.ndarray, loose: bool = False) -> np.ndarray:
    red = rgb[:, :, 0].astype(int)
    green = rgb[:, :, 1].astype(int)
    blue = rgb[:, :, 2].astype(int)
    margin = (10, 6, 18) if loose else (18, 12, 28)
    blue_ink = (blue > red + margin[0]) & (blue > green + margin[1]) & (blue < 250)
    red_ink = (red > green + margin[2]) & (red > blue + margin[2]) & (red > 90) & (green < 190)
    return blue_ink | red_ink


def paper_colour(rgb: np.ndarray, skip: np.ndarray, block: int = 32) -> np.ndarray:
    """Per-pixel paper colour: the median of bright, non-ink pixels in each block."""
    height, width = rgb.shape[:2]
    luma = _luma(rgb)
    bright = (luma > np.percentile(luma, 60) - 25) & ~skip
    fallback = np.median(rgb[bright], axis=0) if bright.any() else np.array([255, 255, 255], float)
    rows, cols = -(-height // block), -(-width // block)
    grid = np.empty((rows, cols, 3), np.float32)
    for row in range(rows):
        for col in range(cols):
            area = (slice(row * block, (row + 1) * block), slice(col * block, (col + 1) * block))
            picked = rgb[area][bright[area]]
            grid[row, col] = np.median(picked, axis=0) if len(picked) > block else fallback
    grid = ndimage.median_filter(grid, size=(3, 3, 1), mode="nearest")
    full = np.repeat(np.repeat(grid, block, axis=0), block, axis=1)[:height, :width]
    return full.astype(np.uint8)


def printed_rows(mask: np.ndarray) -> np.ndarray:
    """Coloured pixels that sit in a row of evenly sized glyphs on one flat baseline.

    That is how printed blue text (a URL, a heading) looks. Handwriting has joined
    letters, a tilted or wobbly baseline, and uneven letter sizes.
    """
    labels, count = ndimage.label(mask, structure=np.ones((3, 3)))
    keep = np.zeros(mask.shape, bool)
    if not count:
        return keep
    boxes = ndimage.find_objects(labels)
    glyphs = []
    for index, box in enumerate(boxes, start=1):
        if box is None:
            continue
        height = box[0].stop - box[0].start
        width = box[1].stop - box[1].start
        if 6 <= height <= 80 and width <= 3 * height:
            glyphs.append((box[0].start, box[0].stop, box[1].start, box[1].stop, index))
    glyphs.sort(key=lambda glyph: (glyph[0] + glyph[1]) / 2)
    rows: list[list[tuple]] = []
    for glyph in glyphs:
        centre = (glyph[0] + glyph[1]) / 2
        if rows:
            last = rows[-1]
            heights = np.median([g[1] - g[0] for g in last])
            last_centre = np.median([(g[0] + g[1]) / 2 for g in last])
            if abs(centre - last_centre) < 0.45 * heights:
                last.append(glyph)
                continue
        rows.append([glyph])
    for row in rows:
        for run in _horizontal_runs(row):
            if len(run) < 6:
                continue
            heights = np.array([g[1] - g[0] for g in run], float)
            median_height = float(np.median(heights))
            regular = heights[(heights > 0.6 * median_height) & (heights < 1.45 * median_height)]
            if len(regular) < 0.75 * len(run):
                continue
            bottoms = np.array([g[1] for g in run if 0.6 * median_height < g[1] - g[0] < 1.15 * median_height], float)
            if len(bottoms) < 4:
                continue
            spread = float(np.median(np.abs(bottoms - np.median(bottoms))))
            if spread > max(1.0, 0.07 * median_height):
                continue
            for glyph in run:
                keep |= labels == glyph[4]
    return keep


def _horizontal_runs(row: list[tuple]) -> list[list[tuple]]:
    ordered = sorted(row, key=lambda glyph: glyph[2])
    runs: list[list[tuple]] = []
    for glyph in ordered:
        height = glyph[1] - glyph[0]
        if runs and glyph[2] - runs[-1][-1][3] < 1.6 * max(height, runs[-1][-1][1] - runs[-1][-1][0]):
            runs[-1].append(glyph)
        else:
            runs.append([glyph])
    return runs


def lift_colored_ink(rgb: np.ndarray) -> tuple[np.ndarray, int]:
    """Lift blue handwriting and red marks, and keep the print.

    Printed coloured rows stay. Where ink crosses black print, the dark print pixels
    stay and lose their ink tint. Lifted pixels get the local paper colour.
    Pencil stays (see pencil_score). This is a prototype ink lift, not an inpainter.
    """
    luma = _luma(rgb)
    channels = rgb.astype(np.int16)
    chroma = channels.max(axis=2) - channels.min(axis=2)
    candidates = _ink_candidates(rgb)
    protected_print = printed_rows(candidates)
    ink = candidates & ~protected_print

    neutral_dark = (luma < 95) & (chroma < 40)
    near_print = ndimage.binary_dilation(neutral_dark, structure=_DISK2, iterations=2)
    ink_luma = float(np.median(luma[ink])) if ink.any() else 80.0
    print_luma = float(np.percentile(luma[neutral_dark], 30)) if neutral_dark.any() else 30.0
    cut = min(60.0, (ink_luma + print_luma) / 2)
    overlap = ink & near_print & (luma < cut)
    lifted = ink & ~overlap

    fringe = ndimage.binary_dilation(lifted, structure=_DISK2, iterations=1) & _ink_candidates(rgb, loose=True)
    lifted |= fringe & ~near_print & ~ndimage.binary_dilation(protected_print, iterations=1)

    out = rgb.copy()
    paper = paper_colour(rgb, candidates | neutral_dark)
    out[lifted] = paper[lifted]
    grey = np.clip(luma[overlap], 0, 255).astype(np.uint8)
    out[overlap] = np.stack([grey, grey, grey], axis=1)
    return out, int(lifted.sum())


def pencil_score(rgb: np.ndarray) -> dict:
    """Grey, mid-tone strokes away from black print: likely pencil. Nothing is removed."""
    luma = _luma(rgb)
    channels = rgb.astype(np.int16)
    chroma = channels.max(axis=2) - channels.min(axis=2)
    paper = _luma(paper_colour(rgb, luma < 150))
    near_dark = ndimage.binary_dilation(luma < 70, structure=_DISK2, iterations=3)
    grey = (luma > 70) & (luma < paper - 45) & (chroma < 30) & ~near_dark
    labels, count = ndimage.label(grey, structure=np.ones((3, 3)))
    if not count:
        return {"likely": False, "pixels": 0}
    sizes = ndimage.sum(grey, labels, index=np.arange(1, count + 1))
    boxes = ndimage.find_objects(labels)
    total = 0
    for size, box in zip(sizes, boxes):
        if box is None or size < 25:
            continue
        height = box[0].stop - box[0].start
        width = box[1].stop - box[1].start
        if min(height, width) <= 3 and max(height, width) >= 40:
            continue
        total += int(size)
    threshold = max(400, int(0.0008 * rgb.shape[0] * rgb.shape[1]))
    return {"likely": total >= threshold, "pixels": total}


def jpeg_data_url(rgb: np.ndarray, quality: int = 70) -> str:
    import base64

    image = Image.fromarray(rgb, "RGB")
    buffer = io.BytesIO()
    image.save(buffer, format="JPEG", quality=quality)
    encoded = base64.b64encode(buffer.getvalue()).decode("ascii")
    return f"data:image/jpeg;base64,{encoded}"


def prepare_page(image_bytes: bytes) -> dict:
    image, orientation = load_rgb(image_bytes)
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
        "deskew": {
            "applied": applied,
            "corners": corner_list,
            "exif_orientation": orientation,
            "upright_turn": UPRIGHT_TURN.get(orientation, ""),
        },
        "ink_pixels_lifted": lifted,
        "pencil": pencil_score(clean),
        "deskew_jpeg": jpeg_data_url(flat),
        "clean_jpeg": jpeg_data_url(clean),
        "ocr_jpeg": jpeg_data_url(clean, quality=92),
        "clean_rgb": clean,
    }
