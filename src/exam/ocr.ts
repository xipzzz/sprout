/* Which image the browser OCRs, and in which language.
   The server sends back the cleaned, straightened page. The raw photo is never OCR'd. */

import type { OcrEngine, OcrLang, ParentScan } from './types.ts';

export type ReadResponse = {
  ok: boolean;
  need_ocr?: boolean;
  unsupported?: boolean;
  ocr_lang?: OcrLang;
  ocr_jpeg?: string;
  message?: string;
  scan?: ParentScan;
};

export type OcrPass = { image: string; lang: OcrLang };

const LANGS: OcrLang[] = ['eng', 'chi_sim'];

/** The next pass the server asked for, or null. At most one pass per language, so the loop ends. */
export function nextOcrPass(response: ReadResponse, tried: OcrLang[]): OcrPass | null {
  if (!response.need_ocr) return null;
  const lang = response.ocr_lang && LANGS.includes(response.ocr_lang) ? response.ocr_lang : 'eng';
  if (tried.includes(lang)) return null;
  const image = response.ocr_jpeg || '';
  if (!image.startsWith('data:image/')) return null;
  return { image, lang };
}

export function dataUrlToBlob(dataUrl: string): Blob {
  const [prefix, encoded = ''] = dataUrl.split(',', 2);
  const mime = /data:([^;]+)/.exec(prefix)?.[1] || 'image/jpeg';
  const binary = atob(encoded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

export const SUBJECTS = [
  { value: 'auto', label: 'Auto' },
  { value: 'english', label: 'English' },
  { value: 'math', label: 'Maths' },
  { value: 'chinese', label: 'Chinese' },
] as const;

export type SubjectChoice = (typeof SUBJECTS)[number]['value'];

/** `?ocr=paddle` on the page URL asks the local server for PaddleOCR. Anything else uses the default. */
export function ocrEngineFromQuery(search: string): OcrEngine | '' {
  const value = new URLSearchParams(search).get('ocr');
  return value === 'paddle' || value === 'tesseract' ? value : '';
}
