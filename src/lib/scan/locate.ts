/* Find a question on the straightened page without a new schema field.
   Prefer the printed words when they can be located. Otherwise use a band
   from the question's order. Null means show the whole page with no mark. */

export interface PageBand {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface PageWord {
  text: string;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

function tokens(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}'\s]+/gu, ' ')
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word.length >= 3 && word !== 'the');
}

/** A horizontal slice of the page for question `index` of `count`. */
export function bandFromOrder(index: number, count: number): PageBand | null {
  if (count <= 0 || index < 0 || index >= count) return null;
  const h = Math.min(0.28, Math.max(0.16, 0.7 / count));
  const center = (index + 0.5) / count;
  const y = Math.max(0, Math.min(1 - h, center - h / 2));
  return { x: 0.04, y, w: 0.92, h };
}

/** Union of the word boxes that best match the question, in printed order. */
export function bandFromWords(words: PageWord[], prompt: string, width: number, height: number): PageBand | null {
  const wanted = tokens(prompt);
  if (wanted.length === 0 || words.length === 0 || width <= 0 || height <= 0) return null;
  const cleaned = words
    .map((word) => ({ ...word, key: word.text.toLowerCase().replace(/[^\p{L}\p{N}']/gu, '') }))
    .filter((word) => word.key.length >= 3);
  let best: { score: number; boxes: PageWord[] } | null = null;
  for (let start = 0; start < cleaned.length; start++) {
    const boxes: PageWord[] = [];
    let cursor = start;
    let found = 0;
    for (const token of wanted) {
      const at = cleaned.findIndex((word, index) => index >= cursor && word.key === token);
      if (at < 0) continue;
      boxes.push(cleaned[at]);
      cursor = at + 1;
      found += 1;
    }
    const score = found / wanted.length;
    if (!best || score > best.score) best = { score, boxes };
    if (score === 1) break;
  }
  if (!best || best.score < 0.6 || best.boxes.length === 0) return null;
  const x0 = Math.min(...best.boxes.map((box) => box.x0));
  const y0 = Math.min(...best.boxes.map((box) => box.y0));
  const x1 = Math.max(...best.boxes.map((box) => box.x1));
  const y1 = Math.max(...best.boxes.map((box) => box.y1));
  const padX = width * 0.04;
  const padY = height * 0.03;
  const left = Math.max(0, x0 - padX);
  const top = Math.max(0, y0 - padY);
  const right = Math.min(width, x1 + padX);
  const bottom = Math.min(height, y1 + padY);
  return {
    x: left / width,
    y: top / height,
    w: Math.max(0.12, (right - left) / width),
    h: Math.max(0.08, (bottom - top) / height),
  };
}

/** Text match when the page can be read. Otherwise the order band. */
export async function findQuestionOnPage(
  src: string,
  prompt: string,
  index: number,
  count: number,
): Promise<PageBand | null> {
  if (!prompt.trim() || index < 0) return bandFromOrder(index, count);
  try {
    const { createWorker } = await import('tesseract.js');
    const worker = await createWorker('eng');
    try {
      const { data } = await worker.recognize(src);
      const read = data as {
        imageSize?: { width?: number; height?: number };
        words?: { text: string; bbox: { x0: number; y0: number; x1: number; y1: number } }[];
      };
      const width = read.imageSize?.width || 0;
      const height = read.imageSize?.height || 0;
      const words: PageWord[] = (read.words || []).map((word) => ({
        text: word.text,
        x0: word.bbox.x0,
        y0: word.bbox.y0,
        x1: word.bbox.x1,
        y1: word.bbox.y1,
      }));
      const found = bandFromWords(words, prompt, width, height);
      if (found) return found;
    } finally {
      await worker.terminate();
    }
  } catch {
    /* The page is still shown. */
  }
  return bandFromOrder(index, count);
}
