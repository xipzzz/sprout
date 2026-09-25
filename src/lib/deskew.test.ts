/**
 * Deskew geometry — a tilted page must perspective-warp, not just crop.
 * Run: npx tsx src/lib/deskew.test.ts
 */
import {
  applyHomography,
  applyMildContrast,
  bowNeedsFlatten,
  convexHull,
  deskewRaster,
  flattenResidualBow,
  horizontalDiscontinuity,
  orderCorners,
  residualBow,
  solveHomography,
  suppressLooseInk,
  warpConflict,
  warpTooSevere,
  type Point,
  type Raster,
} from './deskew';

function assert(cond: boolean, message: string) {
  if (!cond) throw new Error(message);
}

function raster(width: number, height: number, fill: [number, number, number]): Raster {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < data.length; i += 4) {
    data[i] = fill[0];
    data[i + 1] = fill[1];
    data[i + 2] = fill[2];
    data[i + 3] = 255;
  }
  return { width, height, data };
}

function setPixel(image: Raster, x: number, y: number, rgb: [number, number, number]) {
  if (x < 0 || y < 0 || x >= image.width || y >= image.height) return;
  const i = (Math.round(y) * image.width + Math.round(x)) * 4;
  image.data[i] = rgb[0];
  image.data[i + 1] = rgb[1];
  image.data[i + 2] = rgb[2];
}

function inside(point: Point, corners: Point[]): boolean {
  let hit = false;
  for (let i = 0, j = corners.length - 1; i < corners.length; j = i++) {
    const yi = corners[i].y;
    const yj = corners[j].y;
    const xi = corners[i].x;
    const xj = corners[j].x;
    if ((yi > point.y) !== (yj > point.y) && point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi) {
      hit = !hit;
    }
  }
  return hit;
}

function lum(image: Raster, x: number, y: number) {
  const i = (y * image.width + x) * 4;
  return 0.2126 * image.data[i] + 0.7152 * image.data[i + 1] + 0.0722 * image.data[i + 2];
}

const from = [
  { x: 0, y: 0 },
  { x: 100, y: 0 },
  { x: 100, y: 80 },
  { x: 0, y: 80 },
];
const to = [
  { x: 40, y: 30 },
  { x: 150, y: 20 },
  { x: 160, y: 120 },
  { x: 30, y: 110 },
];
const homography = solveHomography(from, to);
assert(Boolean(homography), 'homography should solve');
for (let i = 0; i < 4; i++) {
  const mapped = applyHomography(homography!, from[i].x, from[i].y);
  assert(Math.abs(mapped.x - to[i].x) < 0.2 && Math.abs(mapped.y - to[i].y) < 0.2, 'corner mapping');
}

const hull = convexHull([
  ...to,
  { x: 90, y: 28 },
  { x: 100, y: 70 },
  { x: 80, y: 100 },
]);
const ordered = orderCorners(hull);
assert(Boolean(ordered), 'quad from hull');
assert(Math.abs(ordered![0].x - 40) < 1 && Math.abs(ordered![0].y - 30) < 1, 'top-left corner');
assert(Math.abs(ordered![2].x - 160) < 1 && Math.abs(ordered![2].y - 120) < 1, 'bottom-right corner');

const photo = raster(240, 200, [18, 22, 28]);
const page: Point[] = [
  { x: 70, y: 28 },
  { x: 190, y: 48 },
  { x: 170, y: 160 },
  { x: 46, y: 142 },
];
for (let y = 0; y < photo.height; y++) {
  for (let x = 0; x < photo.width; x++) {
    if (inside({ x, y }, page)) setPixel(photo, x, y, [248, 246, 240]);
  }
}
for (let x = 78; x < 150; x++) setPixel(photo, x, 90, [96, 96, 96]);

const straightened = deskewRaster(photo);
assert(straightened.ok, 'tilted page should deskew');
if (!straightened.ok) throw new Error('unreachable');
const out = straightened.image;
assert(lum(out, 2, 2) > 220, 'output corner should be paper, not leftover desk');
assert(lum(out, out.width - 3, 2) > 220, 'top-right should be paper');
assert(lum(out, 2, out.height - 3) > 220, 'bottom-left should be paper');
assert(out.width < 150 && out.height < 150, 'warp should match the page, not the dark bounding box');

let graySurvived = false;
for (let y = 0; y < out.height; y++) {
  for (let x = 0; x < out.width; x++) {
    const value = lum(out, x, y);
    if (value > 70 && value < 170) graySurvived = true;
  }
}
assert(graySurvived, 'mild contrast must keep gray printed marks');

const marks = raster(4, 1, [110, 110, 110]);
applyMildContrast(marks.data);
assert(marks.data[0] < 160 && marks.data[0] > 70, 'option marks stay inked');

const dark = raster(80, 80, [12, 12, 12]);
const missed = deskewRaster(dark);
assert(!missed.ok, 'a photo with no page should fail instead of OCR');

const bowed = raster(80, 60, [250, 250, 250]);
for (let x = 0; x < bowed.width; x++) {
  const y = Math.round(8 + 12 * Math.sin((x / (bowed.width - 1)) * Math.PI));
  setPixel(bowed, x, y, [20, 20, 20]);
}
const before = residualBow(bowed);
assert(bowNeedsFlatten(before), 'a bowed top line is measurable');
assert(!warpTooSevere(warpConflict(bowed)), 'a uniform bow is not rejected after four-corner deskew');

const conflicted = raster(80, 60, [250, 250, 250]);
for (let x = 0; x < conflicted.width; x++) {
  const wave = Math.sin((x / (conflicted.width - 1)) * Math.PI);
  setPixel(conflicted, x, Math.round(8 + 14 * wave), [20, 20, 20]);
  setPixel(conflicted, x, Math.round(50 - 14 * wave), [20, 20, 20]);
}
assert(warpTooSevere(warpConflict(conflicted)), 'opposite curl is too warped for the top lines');

const curledPage = raster(120, 100, [18, 22, 28]);
for (let y = 10; y < 90; y++) {
  for (let x = 14; x < 106; x++) setPixel(curledPage, x, y, [248, 246, 240]);
}
for (let x = 20; x < 100; x++) {
  const wave = Math.sin(((x - 20) / 79) * Math.PI);
  setPixel(curledPage, x, Math.round(22 + 16 * wave), [20, 20, 20]);
  setPixel(curledPage, x, Math.round(74 - 16 * wave), [20, 20, 20]);
}
const rejected = deskewRaster(curledPage);
assert(!rejected.ok, 'a page that stays warped should ask for a retake');
if (!rejected.ok) assert(/too warped/i.test(rejected.message), `retake message: ${rejected.message}`);

const ink = raster(80, 80, [250, 250, 250]);
for (let y = 30; y < 46; y++) {
  for (let x = 8; x < 20; x++) setPixel(ink, x, y, [20, 20, 20]);
}
for (let deg = 0; deg < 360; deg++) {
  const rad = (deg * Math.PI) / 180;
  setPixel(ink, Math.round(48 + 18 * Math.cos(rad)), Math.round(40 + 18 * Math.sin(rad)), [20, 20, 20]);
}
const ruled = raster(120, 100, [18, 22, 28]);
for (let y = 10; y < 90; y++) {
  for (let x = 12; x < 108; x++) setPixel(ruled, x, y, [248, 246, 240]);
}
for (let b = 0; b < 24; b++) {
  const x = 18 + b * 3;
  const speck = 16 + (b % 3) * 4;
  setPixel(ruled, x, speck, [20, 20, 20]);
  setPixel(ruled, x + 1, speck, [20, 20, 20]);
}
for (let x = 18; x < 100; x++) setPixel(ruled, x, 55, [20, 20, 20]);
const ruledOut = deskewRaster(ruled);
assert(ruledOut.ok, 'a straight rule on a tilted-enough page should still publish');
if (!ruledOut.ok) throw new Error('unreachable');
assert(horizontalDiscontinuity(ruledOut.image) < 0.05, `deskew must not slice the rule: ${horizontalDiscontinuity(ruledOut.image)}`);
const sliced = flattenResidualBow(ruledOut.image);
assert(horizontalDiscontinuity(sliced) > 0.2, `column shift should be detected as strips: ${horizontalDiscontinuity(sliced)}`);

const cleaned = suppressLooseInk(ink);
assert(lum(cleaned, 12, 36) < 80, 'a dense printed block stays');
assert(lum(cleaned, 48 + 18, 40) > 220, 'a hollow circle is removed');

console.log('deskew tests passed');
