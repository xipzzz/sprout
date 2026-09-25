/* Scan pipeline: straighten the page first, then OCR that image only.
   Tesseract.js runs in the browser. No paid cloud OCR and no sample bank. */

import { createWorker, PSM } from 'tesseract.js';
import { deskewRaster, type Raster } from './deskew';
import {
  isHandwritingToken,
  mergeWorksheetReads,
  textWithoutHandwriting,
  type DraftQuestion,
  type OcrWord,
} from './homeworkQuestions';

export type StraightenOutcome =
  | { ok: true; previewBlob: Blob; width: number; height: number }
  | { ok: false; message: string };

export type ReadOutcome =
  | { ok: true; questions: DraftQuestion[] }
  | { ok: false; message: string };

const DESKEW_FAIL = 'Could not straighten that photo. Retake it with the whole page in frame.';

export function hasOnDeviceOcr(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

/** Deskew only. Callers must not OCR the original tilted file. */
export async function straightenHomeworkFile(file: File): Promise<StraightenOutcome> {
  if (!file || !file.type.startsWith('image/')) {
    return { ok: false, message: 'That file does not look like a photo. Choose a picture of the worksheet.' };
  }
  if (!hasOnDeviceOcr()) {
    return { ok: false, message: 'Page straightening needs the app running in a browser.' };
  }
  try {
    const source = await fileToRaster(file, 1800);
    const deskewed = deskewRaster(source);
    if (!deskewed.ok) return { ok: false, message: deskewed.message || DESKEW_FAIL };
    const previewBlob = await rasterToJpeg(deskewed.image);
    return {
      ok: true,
      previewBlob,
      width: deskewed.image.width,
      height: deskewed.image.height,
    };
  } catch {
    return { ok: false, message: DESKEW_FAIL };
  }
}

/** OCR the already-straightened sheet and draft questions from that text only. */
export async function readStraightenedSheet(previewBlob: Blob): Promise<ReadOutcome> {
  if (!hasOnDeviceOcr()) {
    return { ok: false, message: 'On-device text reading is unavailable in this browser.' };
  }
  let worker: Awaited<ReturnType<typeof createWorker>> | null = null;
  try {
    worker = await createWorker('eng');
    await worker.setParameters({
      tessedit_pageseg_mode: PSM.SINGLE_BLOCK,
      preserve_interword_spaces: '1',
    });
    const { data } = await worker.recognize(previewBlob);
    const words = collectWords(data);
    let topText = '';
    let topWords: OcrWord[] = [];
    try {
      const topBlob = await cropTopBlob(previewBlob);
      const top = await worker.recognize(topBlob);
      topText = top.data?.text || '';
      topWords = collectWords(top.data);
    } catch { /* the full-page read still stands */ }
    const questions = mergeWorksheetReads(
      textWithoutHandwriting(words, data.text || ''),
      textWithoutHandwriting(topWords, topText),
      words.filter((word) => !isHandwritingToken(word)),
      data.confidence ?? 50,
    );
    if (questions.length === 0) {
      return {
        ok: false,
        message: 'The straightened page did not yield numbered questions. Retake a clearer printed sheet.',
      };
    }
    return { ok: true, questions };
  } catch {
    return {
      ok: false,
      message: 'On-device text reading failed. Retake the photo and try again.',
    };
  } finally {
    if (worker) {
      try { await worker.terminate(); } catch { /* ignore */ }
    }
  }
}

async function cropTopBlob(blob: Blob, fraction = 0.42): Promise<Blob> {
  const bitmap = await createImageBitmap(blob);
  const height = Math.max(1, Math.round(bitmap.height * fraction));
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    bitmap.close();
    return blob;
  }
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();
  return new Promise((resolve, reject) => {
    canvas.toBlob((next) => (next ? resolve(next) : reject(new Error('crop'))), 'image/jpeg', 0.92);
  });
}

async function fileToRaster(file: File, maxEdge: number): Promise<Raster> {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('no canvas');
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  const image = ctx.getImageData(0, 0, width, height);
  return { width, height, data: image.data };
}

interface TessWord {
  text: string;
  confidence: number;
  bbox?: { x0: number; y0: number; x1: number; y1: number };
}

function collectWords(data: {
  words?: TessWord[];
  blocks: { paragraphs: { lines: { words: TessWord[] }[] }[] }[] | null;
}): OcrWord[] {
  const direct = data.words || [];
  const source = direct.length > 0 ? direct : (data.blocks || []).flatMap((block) =>
    (block.paragraphs || []).flatMap((paragraph) =>
      (paragraph.lines || []).flatMap((line) => line.words || []),
    ),
  );
  return source
    .filter((word) => word.text && word.text.trim())
    .map((word) => ({
      text: word.text,
      confidence: word.confidence,
      bbox: word.bbox,
    }));
}

function rasterToJpeg(raster: Raster): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = raster.width;
  canvas.height = raster.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('no canvas');
  const pixels = new Uint8ClampedArray(raster.width * raster.height * 4);
  pixels.set(raster.data);
  ctx.putImageData(new ImageData(pixels, raster.width, raster.height), 0, 0);
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('toBlob failed'))),
      'image/jpeg',
      0.92,
    );
  });
}
