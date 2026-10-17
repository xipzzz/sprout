import { recognizeHomeworkText } from '../lib/homeworkParse';
import type { ParentScan } from './types.ts';

export type ExtractResponse = {
  ok: boolean;
  need_ocr?: boolean;
  message?: string;
  scan?: ParentScan;
};

async function postExtract(file: File, extra: Record<string, string>): Promise<ExtractResponse> {
  const body = new FormData();
  body.append('file', file, file.name || 'homework.jpg');
  for (const [key, value] of Object.entries(extra)) body.append(key, value);
  const res = await fetch('/api/extract', { method: 'POST', body });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Scan server returned ${res.status}`);
  }
  return res.json() as Promise<ExtractResponse>;
}

export async function extractExam(file: File, demo: boolean): Promise<ParentScan> {
  const first = await postExtract(file, { demo: demo ? '1' : '0', subject: 'auto' });
  if (first.ok && first.scan) return first.scan;
  if (first.need_ocr) {
    const ocrText = await recognizeHomeworkText(file);
    const second = await postExtract(file, {
      demo: '0',
      subject: 'auto',
      ocr_text: ocrText,
    });
    if (second.ok && second.scan) return second.scan;
    throw new Error(second.message || 'Could not read that photo.');
  }
  throw new Error(first.message || 'Could not read that photo.');
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
