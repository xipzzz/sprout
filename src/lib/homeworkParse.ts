/* homeworkParse — legacy single word-pick helper.
 * The scan play flow uses homeworkScan.ts (deskew + multi-question OCR).
 * Do not add canned choices here. No paid API keys.
 */

import { createWorker } from 'tesseract.js';
import { draftHaveHasWordPick } from './haveHasOcrRules';

export interface WordPickQuestion {
  prompt: string;
  choices: string[];
  correct: string;
  source: 'sample' | 'provider';
}

/** JSON shape a parse provider should return. */
export interface WordPickJson {
  prompt: string;
  choices: string[]; // ideally 3–4
  correct: string;   // must be one of choices
}

export type ParseOutcome =
  | { ok: true; question: WordPickQuestion }
  | {
      ok: false;
      reason: 'no_provider' | 'parse_failed' | 'bad_image';
      message: string;
    };

/**
 * Pluggable parser — default is Tesseract.js; swap via registerHomeworkParseProvider.
 * Contract: image in → ONE WordPickJson / WordPickQuestion out.
 */
export interface HomeworkParseProvider {
  id: string; // e.g. 'tesseract'
  label: string;
  isAvailable: () => boolean;
  parseImage: (file: File) => Promise<ParseOutcome>;
}

let activeProvider: HomeworkParseProvider | null = null;

export function registerHomeworkParseProvider(provider: HomeworkParseProvider | null) {
  activeProvider = provider;
}

export function getHomeworkParseProvider(): HomeworkParseProvider | null {
  return activeProvider;
}

export function hasHomeworkParseProvider(): boolean {
  return Boolean(activeProvider?.isAvailable());
}

/** Compress / resize an image toward ~1280px JPEG for OCR. */
export async function compressHomeworkImage(
  file: File,
  opts: { maxEdge?: number; quality?: number } = {},
): Promise<Blob> {
  const maxEdge = opts.maxEdge ?? 1280;
  const quality = opts.quality ?? 0.82;
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    const scale = Math.min(1, maxEdge / Math.max(img.width, img.height));
    const w = Math.max(1, Math.round(img.width * scale));
    const h = Math.max(1, Math.round(img.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('no canvas');
    ctx.drawImage(img, 0, 0, w, h);
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('toBlob failed'))),
        'image/jpeg',
        quality,
      );
    });
    return blob;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function wordPickFromJson(json: WordPickJson, source: WordPickQuestion['source'] = 'provider'): WordPickQuestion | null {
  if (
    !json?.prompt ||
    !Array.isArray(json.choices) ||
    json.choices.length < 2 ||
    !json.correct ||
    !json.choices.includes(json.correct)
  ) {
    return null;
  }
  return {
    prompt: json.prompt,
    choices: json.choices.slice(0, 4),
    correct: json.correct,
    source,
  };
}

/**
 * Heuristic: turn raw OCR text into one word-pick draft.
 * Best on clear printed worksheets; handwriting often needs parent edits.
 * Returns null when text is blank / too weak.
 */
export function draftWordPickFromOcrText(text: string): WordPickJson | null {
  const haveHasDraft = draftHaveHasWordPick(text);
  if (haveHasDraft) return haveHasDraft;

  const raw = (text || '').replace(/\u0000/g, '').trim();
  if (raw.replace(/\s+/g, '').length < 6) return null;

  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.replace(/\s+/g, ' ').trim())
    .filter((l) => l.length > 0);

  // Letter/number-prefixed options: A) word  1. word  (b) word  • word
  const optionRe = /^(?:[\(\[]?[A-Da-d1-4][\)\]\.\:]|\u2022|-|\*)\s+(.+)$/;
  const optionWords: string[] = [];
  for (const line of lines) {
    const m = line.match(optionRe);
    if (m) {
      const w = cleanChoiceToken(m[1]);
      if (w) optionWords.push(w);
    }
  }

  // Question-ish line
  const questionLine =
    lines.find((l) => /\?/.test(l)) ||
    lines.find((l) => /^(which|what|pick|choose|circle|find|select|match)\b/i.test(l)) ||
    lines[0] ||
    '';

  let prompt = questionLine.replace(optionRe, '').trim();
  if (!prompt || prompt.length < 4) {
    prompt = 'Which word matches the homework?';
  }
  if (!/[?.!]$/.test(prompt)) prompt = `${prompt}?`;

  // Candidate content words from whole text (skip stopwords / short junk)
  const tokens = raw
    .toLowerCase()
    .replace(/[^a-z'\s-]/g, ' ')
    .split(/\s+/)
    .map((t) => t.replace(/^'+|'+$/g, ''))
    .filter((t) => t.length >= 3 && t.length <= 18 && !STOPWORDS.has(t));

  const uniq = uniquePreserve(optionWords.length >= 2 ? optionWords : tokens);
  if (uniq.length < 2) return null;

  const choices = uniq.slice(0, 4);
  if (choices.length < 2) return null;

  // Correct = first substantive option / first unique token (parent can edit)
  const correct = choices[0];

  return { prompt, choices, correct };
}

/** Browser Tesseract.js OCR → draft word-pick. Key-free / static-host friendly. */
export function createTesseractProvider(): HomeworkParseProvider {
  return {
    id: 'tesseract',
    label: 'Tesseract.js (open-source OCR)',
    isAvailable: () => typeof window !== 'undefined' && typeof document !== 'undefined',
    parseImage: async (file: File): Promise<ParseOutcome> => {
      let worker: Awaited<ReturnType<typeof createWorker>> | null = null;
      try {
        const blob = await compressHomeworkImage(file);
        worker = await createWorker('eng');
        const { data } = await worker.recognize(blob);
        const draft = draftWordPickFromOcrText(data?.text || '');
        if (!draft) {
          return {
            ok: false,
            reason: 'parse_failed',
            message:
              'Could not read enough clear text from that photo. Try a sharper printed worksheet.',
          };
        }
        const question = wordPickFromJson(draft, 'provider');
        if (!question) {
          return {
            ok: false,
            reason: 'parse_failed',
            message:
              'We read some text but could not build a word-pick. Try another photo.',
          };
        }
        return { ok: true, question };
      } catch {
        return {
          ok: false,
          reason: 'parse_failed',
          message:
            'Open-source text scan failed on that photo. Try again.',
        };
      } finally {
        if (worker) {
          try {
            await worker.terminate();
          } catch { /* ignore */ }
        }
      }
    },
  };
}

/**
 * Parse a user-uploaded homework image via the registered provider.
 * With no provider: never invent a parse.
 */
export async function parseHomeworkImage(file: File): Promise<ParseOutcome> {
  if (!file || !file.type.startsWith('image/')) {
    return {
      ok: false,
      reason: 'bad_image',
      message: 'That file does not look like a photo. Try a homework picture.',
    };
  }

  const provider = activeProvider;
  if (!provider || !provider.isAvailable()) {
    return {
      ok: false,
      reason: 'no_provider',
      message:
        'Live photo parsing is not available right now.',
    };
  }

  try {
    return await provider.parseImage(file);
  } catch {
    return {
      ok: false,
      reason: 'parse_failed',
      message: 'We could not read that photo. Try again.',
    };
  }
}

// Register open-source Tesseract as the default provider on module load.
registerHomeworkParseProvider(createTesseractProvider());

function cleanChoiceToken(s: string): string | null {
  const t = s
    .replace(/[^a-zA-Z'\-\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!t) return null;
  // Prefer a single word if the option is long
  const parts = t.split(' ').filter(Boolean);
  const word = parts.length <= 3 ? t : parts[0];
  if (word.length < 2 || word.length > 24) return null;
  return word;
}

function uniquePreserve(items: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of items) {
    const key = raw.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(raw);
  }
  return out;
}

const STOPWORDS = new Set([
  'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her',
  'was', 'one', 'our', 'out', 'been', 'they', 'with', 'this',
  'that', 'from', 'which', 'what', 'when', 'where', 'your', 'their',
  'will', 'would', 'could', 'should', 'about', 'into', 'than', 'then', 'them',
  'these', 'those', 'circle', 'choose', 'pick', 'select', 'match', 'find',
  'word', 'words', 'means', 'mean', 'below', 'above', 'each', 'name', 'write',
  'read', 'look', 'does', 'did', 'how', 'why', 'who', 'its', 'his', 'she',
  'him', 'her', 'yes', 'no', 'answer', 'question', 'homework', 'exercise',
]);

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('image load failed'));
    img.src = url;
  });
}
