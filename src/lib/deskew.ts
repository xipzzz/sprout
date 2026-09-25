/* Four-corner page deskew.
   Bright paper → convex hull → best quad → perspective warp + mild contrast.
   Crop-only is not enough: a tilted sheet must land upright.
   No DOM here so the geometry can run in unit tests. */

export interface Point {
  x: number;
  y: number;
}

export interface Raster {
  width: number;
  height: number;
  data: Uint8ClampedArray;
}

export type DeskewOutcome =
  | { ok: true; image: Raster; corners: [Point, Point, Point, Point] }
  | { ok: false; message: string };

const PAPER_MISS =
  'Could not find the four corners of the page. Retake the photo with the whole sheet in frame.';

const WARP_RETAKE =
  'That page is still too warped to read the top lines. Retake it flatter, with the whole sheet in frame.';

export function deskewRaster(src: Raster): DeskewOutcome {
  if (src.width < 20 || src.height < 20) {
    return { ok: false, message: PAPER_MISS };
  }

  const detected = detectPaperQuad(src);
  if (!detected) return { ok: false, message: PAPER_MISS };

  const warped = warpQuad(src, detected);
  // Column-shift "bow flatten" slices horizontal text into vertical strips. Do not run it.
  if (warpTooSevere(warpConflict(warped))) {
    return { ok: false, message: WARP_RETAKE };
  }
  const cleaned = suppressLooseInk(warped);
  applyMildContrast(cleaned.data);
  return { ok: true, image: cleaned, corners: detected };
}

/** Luminance stretch kept small so printed (1)(2)(3) marks stay visible. */
export function applyMildContrast(data: Uint8ClampedArray) {
  const contrast = 1.08;
  const intercept = 128 * (1 - contrast);
  for (let i = 0; i < data.length; i += 4) {
    data[i] = clamp8(data[i] * contrast + intercept);
    data[i + 1] = clamp8(data[i + 1] * contrast + intercept);
    data[i + 2] = clamp8(data[i + 2] * contrast + intercept);
  }
}

export function detectPaperQuad(src: Raster): [Point, Point, Point, Point] | null {
  const maxEdge = 480;
  const scale = Math.min(1, maxEdge / Math.max(src.width, src.height));
  const sw = Math.max(8, Math.round(src.width * scale));
  const sh = Math.max(8, Math.round(src.height * scale));
  const mask = paperMask(src, sw, sh);
  const points = boundaryPoints(mask, sw, sh);
  if (points.length < 12) return null;

  const hull = convexHull(points);
  const quad = quadFromHull(hull);
  if (!quad) return null;

  const full: [Point, Point, Point, Point] = [
    { x: quad[0].x / scale, y: quad[0].y / scale },
    { x: quad[1].x / scale, y: quad[1].y / scale },
    { x: quad[2].x / scale, y: quad[2].y / scale },
    { x: quad[3].x / scale, y: quad[3].y / scale },
  ];
  if (!quadIsPage(full, src.width, src.height)) return null;
  return full;
}

export function convexHull(points: Point[]): Point[] {
  const sorted = dedupe(points).sort((a, b) => (a.x === b.x ? a.y - b.y : a.x - b.x));
  if (sorted.length <= 3) return sorted;
  const cross = (o: Point, a: Point, b: Point) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  const lower: Point[] = [];
  for (const p of sorted) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
    lower.push(p);
  }
  const upper: Point[] = [];
  for (let i = sorted.length - 1; i >= 0; i--) {
    const p = sorted[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
    upper.push(p);
  }
  lower.pop();
  upper.pop();
  return lower.concat(upper);
}

/** Extreme points of a convex page are its four corners. */
export function quadFromHull(hull: Point[]): [Point, Point, Point, Point] | null {
  if (hull.length < 4) return null;
  return orderCorners(hull);
}

export function orderCorners(pts: Point[]): [Point, Point, Point, Point] | null {
  if (pts.length < 4) return null;
  let tl = pts[0];
  let br = pts[0];
  let tr = pts[0];
  let bl = pts[0];
  for (const p of pts) {
    if (p.x + p.y < tl.x + tl.y) tl = p;
    if (p.x + p.y > br.x + br.y) br = p;
    if (p.x - p.y > tr.x - tr.y) tr = p;
    if (p.x - p.y < bl.x - bl.y) bl = p;
  }
  const corners: [Point, Point, Point, Point] = [tl, tr, br, bl];
  const keys = new Set(corners.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`));
  if (keys.size < 4) return null;
  return corners;
}

export function solveHomography(from: Point[], to: Point[]): number[] | null {
  const a: number[][] = [];
  const b: number[] = [];
  for (let i = 0; i < 4; i++) {
    const x = from[i].x;
    const y = from[i].y;
    const u = to[i].x;
    const v = to[i].y;
    a.push([x, y, 1, 0, 0, 0, -x * u, -y * u]);
    b.push(u);
    a.push([0, 0, 0, x, y, 1, -x * v, -y * v]);
    b.push(v);
  }
  const h = solveLinear(a, b);
  if (!h) return null;
  return [h[0], h[1], h[2], h[3], h[4], h[5], h[6], h[7], 1];
}

export function applyHomography(h: number[], x: number, y: number): Point {
  const w = h[6] * x + h[7] * y + h[8];
  if (Math.abs(w) < 1e-8) return { x: 0, y: 0 };
  return {
    x: (h[0] * x + h[1] * y + h[2]) / w,
    y: (h[3] * x + h[4] * y + h[5]) / w,
  };
}

function paperMask(src: Raster, sw: number, sh: number): Uint8Array {
  const lum = new Uint8Array(sw * sh);
  const chroma = new Uint8Array(sw * sh);
  for (let y = 0; y < sh; y++) {
    const sy = Math.min(src.height - 1, Math.floor((y + 0.5) * src.height / sh));
    for (let x = 0; x < sw; x++) {
      const sx = Math.min(src.width - 1, Math.floor((x + 0.5) * src.width / sw));
      const i = (sy * src.width + sx) * 4;
      const r = src.data[i];
      const g = src.data[i + 1];
      const b = src.data[i + 2];
      const idx = y * sw + x;
      lum[idx] = clamp8(0.2126 * r + 0.7152 * g + 0.0722 * b);
      chroma[idx] = Math.max(r, g, b) - Math.min(r, g, b);
    }
  }

  const hist = new Uint32Array(256);
  for (let i = 0; i < lum.length; i++) {
    if (chroma[i] < 70) hist[lum[i]]++;
  }
  let peak = 200;
  let peakCount = 0;
  for (let v = 160; v <= 255; v++) {
    if (hist[v] > peakCount) {
      peakCount = hist[v];
      peak = v;
    }
  }
  let threshold = Math.max(150, Math.min(220, peak - 28));
  let mask = thresholdMask(lum, chroma, sw, sh, threshold);
  if (countMask(mask) < sw * sh * 0.08) {
    threshold = 140;
    mask = thresholdMask(lum, chroma, sw, sh, threshold);
  }
  return mask;
}

function thresholdMask(lum: Uint8Array, chroma: Uint8Array, sw: number, sh: number, threshold: number) {
  const mask = new Uint8Array(sw * sh);
  for (let i = 0; i < mask.length; i++) {
    if (lum[i] >= threshold && chroma[i] < 70) mask[i] = 1;
  }
  // Fill small text holes so the hull follows the page, not the letters.
  const filled = mask.slice();
  for (let y = 1; y < sh - 1; y++) {
    for (let x = 1; x < sw - 1; x++) {
      const i = y * sw + x;
      if (mask[i]) continue;
      let around = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (mask[(y + dy) * sw + (x + dx)]) around++;
        }
      }
      if (around >= 5) filled[i] = 1;
    }
  }
  return filled;
}

function boundaryPoints(mask: Uint8Array, sw: number, sh: number): Point[] {
  const pts: Point[] = [];
  const step = sw > 240 ? 2 : 1;
  for (let y = step; y < sh - step; y += step) {
    for (let x = step; x < sw - step; x += step) {
      const i = y * sw + x;
      if (!mask[i]) continue;
      const edge = !mask[i - 1] || !mask[i + 1] || !mask[i - sw] || !mask[i + sw];
      if (edge) pts.push({ x, y });
    }
  }
  return pts;
}

function quadIsPage(corners: [Point, Point, Point, Point], width: number, height: number): boolean {
  const area = polygonArea(corners);
  if (area < width * height * 0.12) return false;
  if (area > width * height * 0.98) return true;
  for (let i = 0; i < 4; i++) {
    const angle = cornerAngle(corners[(i + 3) % 4], corners[i], corners[(i + 1) % 4]);
    if (angle < 40 || angle > 150) return false;
  }
  const minSide = Math.min(width, height) * 0.08;
  for (let i = 0; i < 4; i++) {
    for (let j = i + 1; j < 4; j++) {
      if (Math.hypot(corners[i].x - corners[j].x, corners[i].y - corners[j].y) < minSide) return false;
    }
  }
  return true;
}

function warpQuad(src: Raster, corners: [Point, Point, Point, Point]): Raster {
  const [tl, tr, br, bl] = corners;
  let outW = Math.round(Math.max(distance(tl, tr), distance(bl, br)));
  let outH = Math.round(Math.max(distance(tl, bl), distance(tr, br)));
  outW = Math.max(8, Math.min(2000, outW));
  outH = Math.max(8, Math.min(2000, outH));
  const dest: Point[] = [
    { x: 0, y: 0 },
    { x: outW - 1, y: 0 },
    { x: outW - 1, y: outH - 1 },
    { x: 0, y: outH - 1 },
  ];
  const h = solveHomography(dest, corners);
  const data = new Uint8ClampedArray(outW * outH * 4);
  if (!h) return { width: outW, height: outH, data };
  for (let y = 0; y < outH; y++) {
    for (let x = 0; x < outW; x++) {
      const p = applyHomography(h, x, y);
      const o = (y * outW + x) * 4;
      sampleBilinear(src, p.x, p.y, data, o);
    }
  }
  return { width: outW, height: outH, data };
}

function sampleBilinear(src: Raster, x: number, y: number, dest: Uint8ClampedArray, offset: number) {
  if (x < 0 || y < 0 || x > src.width - 1 || y > src.height - 1) {
    dest[offset] = 255;
    dest[offset + 1] = 255;
    dest[offset + 2] = 255;
    dest[offset + 3] = 255;
    return;
  }
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const x1 = Math.min(src.width - 1, x0 + 1);
  const y1 = Math.min(src.height - 1, y0 + 1);
  const tx = x - x0;
  const ty = y - y0;
  const i00 = (y0 * src.width + x0) * 4;
  const i10 = (y0 * src.width + x1) * 4;
  const i01 = (y1 * src.width + x0) * 4;
  const i11 = (y1 * src.width + x1) * 4;
  for (let c = 0; c < 4; c++) {
    const v =
      src.data[i00 + c] * (1 - tx) * (1 - ty) +
      src.data[i10 + c] * tx * (1 - ty) +
      src.data[i01 + c] * (1 - tx) * ty +
      src.data[i11 + c] * tx * ty;
    dest[offset + c] = clamp8(v);
  }
}

function solveLinear(matrix: number[][], values: number[]): number[] | null {
  const n = values.length;
  const m = matrix.map((row, i) => [...row, values[i]]);
  for (let col = 0; col < n; col++) {
    let pivot = col;
    for (let r = col + 1; r < n; r++) {
      if (Math.abs(m[r][col]) > Math.abs(m[pivot][col])) pivot = r;
    }
    if (Math.abs(m[pivot][col]) < 1e-9) return null;
    if (pivot !== col) {
      const tmp = m[col];
      m[col] = m[pivot];
      m[pivot] = tmp;
    }
    const div = m[col][col];
    for (let c = col; c <= n; c++) m[col][c] /= div;
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const factor = m[r][col];
      for (let c = col; c <= n; c++) m[r][c] -= factor * m[col][c];
    }
  }
  return m.map((row) => row[n]);
}

function polygonArea(pts: Point[]): number {
  let area = 0;
  for (let i = 0; i < pts.length; i++) {
    const j = (i + 1) % pts.length;
    area += pts[i].x * pts[j].y - pts[j].x * pts[i].y;
  }
  return Math.abs(area) / 2;
}

function cornerAngle(prev: Point, cur: Point, next: Point): number {
  const v1x = prev.x - cur.x;
  const v1y = prev.y - cur.y;
  const v2x = next.x - cur.x;
  const v2y = next.y - cur.y;
  const mag = Math.hypot(v1x, v1y) * Math.hypot(v2x, v2y);
  if (mag < 1e-6) return 0;
  const cos = Math.min(1, Math.max(-1, (v1x * v2x + v1y * v2y) / mag));
  return (Math.acos(cos) * 180) / Math.PI;
}

function distance(a: Point, b: Point) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function dedupe(points: Point[]): Point[] {
  const seen = new Set<string>();
  const out: Point[] = [];
  for (const p of points) {
    const key = `${Math.round(p.x)},${Math.round(p.y)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(p);
  }
  return out;
}

function countMask(mask: Uint8Array) {
  let n = 0;
  for (let i = 0; i < mask.length; i++) n += mask[i];
  return n;
}

function clamp8(v: number) {
  return v < 0 ? 0 : v > 255 ? 255 : Math.round(v);
}

/** How far the top ink bows away from a straight edge, as a fraction of height. */
export function residualBow(image: Raster): number {
  const tops = columnTops(image);
  if (tops.length < 8) return 0;
  const left = tops[0];
  const right = tops[tops.length - 1];
  let maxDev = 0;
  for (let i = 0; i < tops.length; i++) {
    const line = left + ((right - left) * i) / (tops.length - 1);
    maxDev = Math.max(maxDev, Math.abs(tops[i] - line));
  }
  return maxDev / image.height;
}

export function bowNeedsFlatten(bow: number): boolean {
  return bow > 0.03;
}

/** Column-shift a bowed top line. Not used by deskew: uneven shifts shred text rows. */
export function flattenResidualBow(image: Raster): Raster {
  if (!bowNeedsFlatten(residualBow(image))) return image;
  const tops = columnTops(image);
  const target = Math.min(...tops);
  const out = new Uint8ClampedArray(image.data.length);
  out.fill(255);
  const step = image.width / tops.length;
  for (let x = 0; x < image.width; x++) {
    const shift = Math.round(tops[Math.min(tops.length - 1, Math.floor(x / step))] - target);
    for (let y = 0; y < image.height; y++) {
      const srcY = y + shift;
      if (srcY < 0 || srcY >= image.height) continue;
      const from = (srcY * image.width + x) * 4;
      const to = (y * image.width + x) * 4;
      out[to] = image.data[from];
      out[to + 1] = image.data[from + 1];
      out[to + 2] = image.data[from + 2];
      out[to + 3] = image.data[from + 3];
    }
  }
  return { width: image.width, height: image.height, data: out };
}

/** How much column ink-span (bottom − top) varies, as a fraction of height.
 *  A uniform bow shifts a whole column, so the span stays even and flatten can fix it.
 *  Top and bottom curling apart stays large after that shift. */
export function warpConflict(image: Raster): number {
  const spans = columnSpans(image);
  if (spans.length < 8) return 0;
  const sorted = [...spans].sort((a, b) => a - b);
  const mid = sorted[Math.floor(sorted.length / 2)];
  const band = Math.max(8, mid * 0.35);
  const kept = sorted.filter((span) => Math.abs(span - mid) <= band);
  if (kept.length < 8) return 0;
  return (kept[kept.length - 1] - kept[0]) / image.height;
}

export function warpTooSevere(conflict: number): boolean {
  return conflict > 0.12;
}

/** Share of large steps while following the longest horizontal ink run. A sliced row scores high. */
export function horizontalDiscontinuity(image: Raster): number {
  const seed = longestInkRun(image);
  if (!seed || seed.length < 6) return 0;
  let steps = 0;
  let jumps = 0;
  const walk = (from: number, to: number, dir: number) => {
    let y = seed.y;
    for (let x = from; dir > 0 ? x < to : x > to; x += dir) {
      const near = closestInkY(image, x, y, 2);
      const next = near >= 0 ? near : closestInkY(image, x, y, 24);
      if (next < 0) continue;
      steps++;
      if (Math.abs(next - y) >= 3) jumps++;
      y = next;
    }
  };
  walk(seed.x + seed.length, image.width, 1);
  walk(seed.x - 1, -1, -1);
  if (steps < 8) return 0;
  return jumps / steps;
}

function longestInkRun(image: Raster): { x: number; y: number; length: number } | null {
  let best: { x: number; y: number; length: number } | null = null;
  for (let y = 0; y < image.height; y++) {
    let runStart = -1;
    for (let x = 0; x <= image.width; x++) {
      const on = x < image.width && pixelLum(image, x, y) < 160;
      if (on && runStart < 0) runStart = x;
      if (!on && runStart >= 0) {
        const length = x - runStart;
        if (!best || length > best.length) best = { x: runStart, y, length };
        runStart = -1;
      }
    }
  }
  return best;
}

function closestInkY(image: Raster, x: number, y: number, radius: number): number {
  if (x < 0 || x >= image.width) return -1;
  let best = -1;
  let bestDist = radius + 1;
  const y0 = Math.max(0, y - radius);
  const y1 = Math.min(image.height - 1, y + radius);
  for (let yy = y0; yy <= y1; yy++) {
    if (pixelLum(image, x, yy) >= 160) continue;
    const dist = Math.abs(yy - y);
    if (dist < bestDist) {
      bestDist = dist;
      best = yy;
    }
  }
  return best;
}

function columnSpans(image: Raster): number[] {
  const bins = Math.min(24, image.width);
  const spans: number[] = [];
  for (let b = 0; b < bins; b++) {
    const x0 = Math.floor((b * image.width) / bins);
    const x1 = Math.max(x0 + 1, Math.floor(((b + 1) * image.width) / bins));
    let top = -1;
    let bottom = -1;
    for (let y = 0; y < image.height; y++) {
      if (!rowHasInk(image, x0, x1, y)) continue;
      if (top < 0) top = y;
      bottom = y;
    }
    if (top <= 2 || bottom >= image.height - 3) continue;
    if (bottom > top) spans.push(bottom - top);
  }
  return spans;
}

/** Drop circled and loose pen strokes. Dense printed letters stay. */
export function suppressLooseInk(image: Raster): Raster {
  const { width, height } = image;
  const dark = darkMask(image);
  const seen = new Uint8Array(width * height);
  const out = new Uint8ClampedArray(image.data);
  const stack: number[] = [];
  const pixels: number[] = [];

  for (let start = 0; start < dark.length; start++) {
    if (!dark[start] || seen[start]) continue;
    stack.length = 0;
    pixels.length = 0;
    stack.push(start);
    seen[start] = 1;
    let minX = width;
    let minY = height;
    let maxX = 0;
    let maxY = 0;
    while (stack.length > 0) {
      const idx = stack.pop()!;
      pixels.push(idx);
      const x = idx % width;
      const y = (idx - x) / width;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
      pushDarkNeighbors(dark, seen, stack, x, y, width, height);
    }
    const count = pixels.length;
    const bw = maxX - minX + 1;
    const bh = maxY - minY + 1;
    const area = bw * bh;
    const loose = area >= 280 && Math.min(bw, bh) >= 16 && count / area < 0.16;
    if (!loose) continue;
    for (const idx of pixels) {
      const x = idx % width;
      const y = (idx - x) / width;
      if (locallyDense(dark, x, y, width, height)) continue;
      const o = idx * 4;
      out[o] = 255;
      out[o + 1] = 255;
      out[o + 2] = 255;
      out[o + 3] = 255;
    }
  }
  return { width, height, data: out };
}

function darkMask(image: Raster): Uint8Array {
  const mask = new Uint8Array(image.width * image.height);
  for (let y = 0; y < image.height; y++) {
    for (let x = 0; x < image.width; x++) {
      if (pixelLum(image, x, y) < 150) mask[y * image.width + x] = 1;
    }
  }
  return mask;
}

function pushDarkNeighbors(
  dark: Uint8Array,
  seen: Uint8Array,
  stack: number[],
  x: number,
  y: number,
  width: number,
  height: number,
) {
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
      const next = ny * width + nx;
      if (!dark[next] || seen[next]) continue;
      seen[next] = 1;
      stack.push(next);
    }
  }
}

function locallyDense(dark: Uint8Array, x: number, y: number, width: number, height: number): boolean {
  let ink = 0;
  let total = 0;
  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
      total++;
      ink += dark[ny * width + nx];
    }
  }
  return total > 0 && ink / total >= 0.45;
}

function rowHasInk(image: Raster, x0: number, x1: number, y: number): boolean {
  for (let x = x0; x < x1; x++) {
    if (pixelLum(image, x, y) < 170) return true;
  }
  return false;
}

function pixelLum(image: Raster, x: number, y: number): number {
  const i = (y * image.width + x) * 4;
  return 0.2126 * image.data[i] + 0.7152 * image.data[i + 1] + 0.0722 * image.data[i + 2];
}

function columnTops(image: Raster): number[] {
  const bins = Math.min(24, image.width);
  const tops: number[] = [];
  for (let b = 0; b < bins; b++) {
    const x0 = Math.floor((b * image.width) / bins);
    const x1 = Math.max(x0 + 1, Math.floor(((b + 1) * image.width) / bins));
    let top = -1;
    for (let y = 0; y < image.height * 0.45; y++) {
      if (rowHasInk(image, x0, x1, y)) {
        top = y;
        break;
      }
    }
    if (top >= 0) tops.push(top);
  }
  return tops;
}
