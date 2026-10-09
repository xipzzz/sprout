/* On-device page cleanup. Port of the proven opencv.js pipeline:
   find the page, straighten it, flatten light, remove blue pen and pencil.
   The upload is a downscaled JPEG of the cleaned page (`vis`). */

export interface CleanPage {
  vis: Uint8Array;
  width: number;
  height: number;
  pageFound: boolean;
}

// opencv.js ships a generated runtime. The callable surface used here is wider than its types.
interface Cv {
  onRuntimeInitialized?: () => void;
  Mat: new () => CvMat;
  MatVector: new () => CvMat;
  Size: new (w: number, h: number) => unknown;
  COLOR_RGBA2GRAY: number;
  COLOR_RGBA2RGB: number;
  COLOR_RGB2HSV: number;
  INTER_AREA: number;
  INTER_LINEAR: number;
  THRESH_BINARY: number;
  THRESH_OTSU: number;
  THRESH_BINARY_INV: number;
  MORPH_RECT: number;
  MORPH_ELLIPSE: number;
  MORPH_CLOSE: number;
  RETR_EXTERNAL: number;
  CHAIN_APPROX_SIMPLE: number;
  CV_32FC2: number;
  CV_8UC1: number;
  CV_32F: number;
  CV_32S: number;
  BORDER_REPLICATE: number;
  matFromImageData: (image: { data: Uint8ClampedArray | Uint8Array; width: number; height: number }) => CvMat;
  matFromArray: (rows: number, cols: number, type: number, data: number[] | Uint8Array) => CvMat;
  getPerspectiveTransform: (src: CvMat, dst: CvMat) => CvMat;
  getStructuringElement: (shape: number, size: unknown) => CvMat;
  RotatedRect: { points: (rect: unknown) => { x: number; y: number }[] };
  resize: (...args: unknown[]) => void;
  cvtColor: (...args: unknown[]) => void;
  GaussianBlur: (...args: unknown[]) => void;
  threshold: (...args: unknown[]) => void;
  morphologyEx: (...args: unknown[]) => void;
  findContours: (...args: unknown[]) => void;
  contourArea: (contour: CvMat) => number;
  convexHull: (...args: unknown[]) => void;
  approxPolyDP: (...args: unknown[]) => void;
  arcLength: (contour: CvMat, closed: boolean) => number;
  minAreaRect: (hull: CvMat) => unknown;
  warpPerspective: (...args: unknown[]) => void;
  divide: (...args: unknown[]) => void;
  medianBlur: (...args: unknown[]) => void;
  Laplacian: (...args: unknown[]) => void;
  meanStdDev: (...args: unknown[]) => void;
  addWeighted: (...args: unknown[]) => void;
  dilate: (...args: unknown[]) => void;
  split: (...args: unknown[]) => void;
  connectedComponentsWithStats: (...args: unknown[]) => number;
}

interface CvMat {
  cols: number;
  rows: number;
  data: Uint8Array;
  data32S: Int32Array;
  data64F: Float64Array;
  delete: () => void;
  size: () => number;
  get: (index: number) => CvMat;
}

let pending: Promise<Cv> | null = null;

export function loadCv(): Promise<Cv> {
  if (!pending) {
    pending = import('@techstark/opencv-js').then((mod) => {
      const cvp = (mod as { default?: unknown }).default ?? mod;
      if (cvp && typeof (cvp as Promise<Cv>).then === 'function') return cvp as Promise<Cv>;
      const cv = cvp as Cv;
      if (cv?.Mat) return cv;
      return new Promise<Cv>((resolve) => {
        cv.onRuntimeInitialized = () => resolve(cv);
      });
    }).catch((err: unknown) => {
      pending = null;
      throw err;
    });
  }
  return pending;
}

function orderQuad(pts: number[][]): number[][] {
  const s = pts.map((p) => p[0] + p[1]);
  const d = pts.map((p) => p[0] - p[1]);
  const tl = pts[s.indexOf(Math.min(...s))];
  const br = pts[s.indexOf(Math.max(...s))];
  const tr = pts[d.indexOf(Math.max(...d))];
  const bl = pts[d.indexOf(Math.min(...d))];
  return [tl, tr, br, bl];
}

const dist = (a: number[], b: number[]) => Math.hypot(a[0] - b[0], a[1] - b[1]);

function findPage(cv: Cv, src: CvMat): { quad: number[][] | null } {
  const W = src.cols;
  const H = src.rows;
  const f = 600 / Math.max(W, H);
  const small = new cv.Mat();
  const g = new cv.Mat();
  const th = new cv.Mat();
  cv.resize(src, small, new cv.Size(Math.round(W * f), Math.round(H * f)), 0, 0, cv.INTER_AREA);
  cv.cvtColor(small, g, cv.COLOR_RGBA2GRAY);
  cv.GaussianBlur(g, g, new cv.Size(5, 5), 0);
  cv.threshold(g, th, 0, 255, cv.THRESH_BINARY + cv.THRESH_OTSU);
  const k = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(15, 15));
  cv.morphologyEx(th, th, cv.MORPH_CLOSE, k);
  const cs = new cv.MatVector();
  const hi = new cv.Mat();
  cv.findContours(th, cs, hi, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
  let best = -1;
  let bestA = 0;
  for (let i = 0; i < cs.size(); i++) {
    const a = cv.contourArea(cs.get(i));
    if (a > bestA) { bestA = a; best = i; }
  }
  const ratio = bestA / (small.cols * small.rows);
  let quad: number[][] | null = null;
  if (best >= 0 && ratio > 0.2 && ratio < 0.92) {
    const c = cs.get(best);
    const hull = new cv.Mat();
    const ap = new cv.Mat();
    cv.convexHull(c, hull);
    cv.approxPolyDP(hull, ap, 0.02 * cv.arcLength(hull, true), true);
    if (ap.rows === 4) {
      const p: number[][] = [];
      for (let i = 0; i < 4; i++) p.push([ap.data32S[2 * i] / f, ap.data32S[2 * i + 1] / f]);
      quad = orderQuad(p);
    } else {
      const rr = cv.minAreaRect(hull);
      const pts = cv.RotatedRect.points(rr);
      quad = orderQuad(pts.map((p: { x: number; y: number }) => [p.x / f, p.y / f]));
    }
    hull.delete();
    ap.delete();
  }
  [small, g, th, k, cs, hi].forEach((m) => m.delete());
  return { quad };
}

/** Straighten `rgba` and return the ink-cleaned page. `cv` comes from loadCv(). */
export function preprocessRgba(cv: Cv, rgba: Uint8ClampedArray | Uint8Array, W: number, H: number): CleanPage {
  const trash: { delete(): void }[] = [];
  const keep = <T extends { delete(): void }>(m: T): T => {
    trash.push(m);
    return m;
  };
  try {
    let src = cv.matFromImageData({ data: rgba, width: W, height: H });
    trash.push(src);
    const page = findPage(cv, src);
    if (page.quad) {
      const [tl, tr, br, bl] = page.quad;
      const w = Math.max(dist(tl, tr), dist(bl, br));
      const h = Math.max(dist(tl, bl), dist(tr, br));
      const [ow, oh] = h >= w ? [1700, 2200] : [2200, 1700];
      const srcPts = keep(cv.matFromArray(4, 1, cv.CV_32FC2, ([] as number[]).concat(tl, tr, br, bl)));
      const dstPts = keep(cv.matFromArray(4, 1, cv.CV_32FC2, [0, 0, ow, 0, ow, oh, 0, oh]));
      const M = keep(cv.getPerspectiveTransform(srcPts, dstPts));
      const dst = new cv.Mat();
      cv.warpPerspective(src, dst, M, new cv.Size(ow, oh), cv.INTER_LINEAR, cv.BORDER_REPLICATE);
      src = dst;
      trash.push(dst);
    }
    const w = src.cols;
    const h = src.rows;
    const gray = keep(new cv.Mat());
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
    const sm = keep(new cv.Mat());
    const bg = keep(new cv.Mat());
    const closeK = keep(cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(11, 11)));
    cv.resize(gray, sm, new cv.Size(Math.round(w / 4), Math.round(h / 4)), 0, 0, cv.INTER_AREA);
    cv.morphologyEx(sm, sm, cv.MORPH_CLOSE, closeK);
    cv.GaussianBlur(sm, sm, new cv.Size(9, 9), 0);
    cv.resize(sm, bg, new cv.Size(w, h), 0, 0, cv.INTER_LINEAR);
    const norm = keep(new cv.Mat());
    cv.divide(gray, bg, norm, 255);

    const mb = keep(new cv.Mat());
    const lap = keep(new cv.Mat());
    const mu = keep(new cv.Mat());
    const sd = keep(new cv.Mat());
    cv.medianBlur(norm, mb, 3);
    cv.Laplacian(mb, lap, cv.CV_32F);
    cv.meanStdDev(lap, mu, sd);
    const lapVar = sd.data64F[0] ** 2;
    const sharpen = lapVar < 300;
    if (sharpen) {
      const g2 = new cv.Mat();
      cv.GaussianBlur(norm, g2, new cv.Size(0, 0), 2.0);
      cv.addWeighted(norm, 2.0, g2, -1.0, 0, norm);
      g2.delete();
    }

    const rgb = keep(new cv.Mat());
    const hsv = keep(new cv.Mat());
    cv.cvtColor(src, rgb, cv.COLOR_RGBA2RGB);
    cv.cvtColor(rgb, hsv, cv.COLOR_RGB2HSV);
    const N = w * h;
    const nd = Uint8Array.from(norm.data as Uint8Array);
    const hd = Uint8Array.from(hsv.data as Uint8Array);
    const blue = new Uint8Array(N);
    for (let i = 0; i < N; i++) {
      const hue = hd[3 * i];
      const sat = hd[3 * i + 1];
      const val = hd[3 * i + 2];
      if (hue >= 95 && hue <= 135 && sat >= 70 && val >= 30 && nd[i] < 230) blue[i] = 1;
    }
    const bm = keep(cv.matFromArray(h, w, cv.CV_8UC1, blue));
    const ellipse = keep(cv.getStructuringElement(cv.MORPH_ELLIPSE, new cv.Size(5, 5)));
    cv.dilate(bm, bm, ellipse);

    const bch = keep(new cv.Mat());
    const bgB = keep(new cv.Mat());
    const smB = keep(new cv.Mat());
    const chans = keep(new cv.MatVector());
    cv.split(rgb, chans);
    const B = chans.get(2);
    cv.resize(B, smB, new cv.Size(Math.round(w / 4), Math.round(h / 4)), 0, 0, cv.INTER_AREA);
    cv.morphologyEx(smB, smB, cv.MORPH_CLOSE, closeK);
    cv.resize(smB, bgB, new cv.Size(w, h), 0, 0, cv.INTER_LINEAR);
    cv.divide(B, bgB, bch, 255);
    for (let i = 0; i < N; i++) {
      if (bm.data[i]) {
        const v = bch.data[i];
        nd[i] = v > 110 ? 255 : Math.max(nd[i], v);
      }
    }
    B.delete();

    const hist = new Uint32Array(256);
    for (let i = 0; i < N; i++) hist[nd[i]]++;
    let acc = 0;
    let inkN = 0;
    for (let v = 0; v < 170; v++) inkN += hist[v];
    let p10 = 0;
    for (let v = 0; v < 256; v++) {
      acc += hist[v];
      if (acc >= inkN * 0.10) { p10 = v; break; }
    }
    const darkT = Math.max(70, Math.min(125, p10 + 45));
    norm.data.set(nd);
    const mid = keep(new cv.Mat());
    cv.threshold(norm, mid, 170, 255, cv.THRESH_BINARY_INV);
    const lab = keep(new cv.Mat());
    const stats = keep(new cv.Mat());
    const cen = keep(new cv.Mat());
    const nl = cv.connectedComponentsWithStats(mid, lab, stats, cen, 8, cv.CV_32S);
    const minv = new Uint8Array(nl).fill(255);
    const labels = Int32Array.from(lab.data32S as Int32Array);
    for (let i = 0; i < N; i++) {
      const label = labels[i];
      if (label && nd[i] < minv[label]) minv[label] = nd[i];
    }
    const kill = new Uint8Array(nl);
    const SD = stats.data32S as Int32Array;
    for (let label = 1; label < nl; label++) {
      const bw = SD[5 * label + 2];
      const bh = SD[5 * label + 3];
      kill[label] = (minv[label] > darkT && Math.max(bw, bh) > 70) || minv[label] > 150 ? 1 : 0;
    }
    for (let i = 0; i < N; i++) {
      const label = labels[i];
      if (label && kill[label]) nd[i] = 255;
    }
    if (!sharpen) {
      for (let i = 0; i < N; i++) {
        const v = nd[i];
        nd[i] = v >= 190 ? 255 : Math.round(v * 255 / 190);
      }
    }
    return { vis: Uint8Array.from(nd), width: w, height: h, pageFound: Boolean(page.quad) };
  } finally {
    trash.forEach((m) => {
      try { m.delete(); } catch { /* already released */ }
    });
  }
}

async function imageDataFromFile(file: Blob, maxEdge: number): Promise<ImageData> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('canvas');
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  return ctx.getImageData(0, 0, w, h);
}

function grayToJpeg(gray: Uint8Array, w: number, h: number, maxEdge: number, quality: number): Promise<Blob> {
  const scale = Math.min(1, maxEdge / Math.max(w, h));
  const ow = Math.max(1, Math.round(w * scale));
  const oh = Math.max(1, Math.round(h * scale));
  const src = document.createElement('canvas');
  src.width = w;
  src.height = h;
  const sctx = src.getContext('2d');
  if (!sctx) return Promise.reject(new Error('canvas'));
  const img = sctx.createImageData(w, h);
  for (let i = 0; i < w * h; i++) {
    const v = gray[i];
    img.data[i * 4] = v;
    img.data[i * 4 + 1] = v;
    img.data[i * 4 + 2] = v;
    img.data[i * 4 + 3] = 255;
  }
  sctx.putImageData(img, 0, 0);
  const out = document.createElement('canvas');
  out.width = ow;
  out.height = oh;
  const octx = out.getContext('2d');
  if (!octx) return Promise.reject(new Error('canvas'));
  octx.drawImage(src, 0, 0, ow, oh);
  return new Promise((resolve, reject) => {
    out.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('jpeg'))), 'image/jpeg', quality);
  });
}

/** JPEG of the photo itself, only shrunk to fit the upload limit. */
export async function photoAsJpeg(file: Blob): Promise<Blob> {
  const image = await imageDataFromFile(file, 1600);
  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas');
  ctx.putImageData(image, 0, 0);
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((result) => (result ? resolve(result) : reject(new Error('jpeg'))), 'image/jpeg', 0.82);
  });
  return blob;
}

/** Clean one photo and return a JPEG small enough to upload. */
export async function cleanHomeworkPhoto(file: Blob): Promise<Blob> {
  const image = await imageDataFromFile(file, 1800);
  const cv = await loadCv();
  const cleaned = preprocessRgba(cv, image.data, image.width, image.height);
  let jpeg = await grayToJpeg(cleaned.vis, cleaned.width, cleaned.height, 1280, 0.82);
  if (jpeg.size > 3_200_000) {
    jpeg = await grayToJpeg(cleaned.vis, cleaned.width, cleaned.height, 960, 0.7);
  }
  return jpeg;
}
