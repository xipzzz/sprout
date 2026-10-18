import { createWorker } from 'tesseract.js';
import { dataUrlToBlob, nextOcrPass, type ExtractResponse, type SubjectChoice } from './ocr.ts';
import type { OcrLang, ParentScan } from './types.ts';

export type { ExtractResponse } from './ocr.ts';

async function postExtract(file: File, extra: Record<string, string>): Promise<ExtractResponse> {
  const body = new FormData();
  body.append('file', file, file.name || 'homework.jpg');
  for (const [key, value] of Object.entries(extra)) body.append(key, value);
  const requestedOcr = new URLSearchParams(window.location.search).get('ocr');
  const endpoint = requestedOcr ? `/api/extract?ocr=${encodeURIComponent(requestedOcr)}` : '/api/extract';
  const res = await fetch(endpoint, { method: 'POST', body });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Scan server returned ${res.status}`);
  }
  return res.json() as Promise<ExtractResponse>;
}

/** Free Tesseract.js. Language data (eng, chi_sim) comes from the public tesseract.js CDN, no sign-in. */
async function recognizeCleanPage(image: string, lang: OcrLang): Promise<string> {
  const worker = await createWorker(lang);
  try {
    const { data } = await worker.recognize(dataUrlToBlob(image));
    return data?.text || '';
  } finally {
    try {
      await worker.terminate();
    } catch {
      /* ignore */
    }
  }
}

export class UnsupportedPageError extends Error {}

export async function extractExam(
  file: File,
  demo: boolean,
  subject: SubjectChoice = 'auto',
  onStep: (message: string) => void = () => {},
): Promise<ParentScan> {
  let response = await postExtract(file, { demo: demo ? '1' : '0', subject });
  const tried: OcrLang[] = [];
  for (let pass = nextOcrPass(response, tried); pass; pass = nextOcrPass(response, tried)) {
    tried.push(pass.lang);
    onStep(pass.lang === 'chi_sim' ? 'Reading the cleaned page in Chinese…' : 'Reading the cleaned page…');
    const ocrText = await recognizeCleanPage(pass.image, pass.lang);
    response = await postExtract(file, { demo: '0', subject, ocr_text: ocrText, ocr_lang: pass.lang });
  }
  if (response.ok && response.scan) return response.scan;
  if (response.unsupported) throw new UnsupportedPageError(response.message || 'Sprout cannot read this page yet.');
  throw new Error(response.message || 'Could not read that photo.');
}

/** Saves the parent copy. Passing the paths from an earlier save of the same scan updates that note. */
export async function saveExam(
  scan: ParentScan,
  replace: string[] = [],
): Promise<{ paths: string[]; skipped: string[] }> {
  const payload = { scan: { ...scan, previews: undefined }, replace };
  const res = await fetch('/api/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Save failed (${res.status})`);
  }
  const data = (await res.json()) as { ok: boolean; paths?: string[]; skipped?: string[]; message?: string };
  if (!data.ok) throw new Error(data.message || 'Save failed');
  return { paths: data.paths || [], skipped: data.skipped || [] };
}
