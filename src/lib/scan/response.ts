/* Turn a Worker HTTP response into either real questions or a failure.
   Error responses never carry questions, even if a body includes some. */

import { validateModelPayload } from './schema';
import { cleanSuggestion } from './suggestions';
import type { ScannedQuestion } from './types';

export type ScanOutcome =
  | { ok: true; questions: ScannedQuestion[]; suggestions: Record<string, string> }
  | { ok: false; code: string; message: string };

const FRIENDLY: Record<string, string> = {
  unauthorized: 'Pip needs a grown-up to be signed in before reading homework.',
  auth_not_configured: 'Scanning needs a parent sign-in, and that is not connected yet.',
  daily_limit: 'Pip has read enough pages for today. More homework can wait until tomorrow.',
  spending_cap: 'Scanning is paused for now. A grown-up can turn it back on.',
  rate_limit: 'That was a lot of photos at once. Wait a minute, then try again.',
  not_configured: 'Scanning is not set up yet.',
  provider_disabled: 'Scanning is not set up yet.',
  provider_error: 'Pip could not read that page. Try another photo.',
  invalid: 'Pip could not read that page. Try another photo.',
  too_large: 'That photo is too big. Try one page, a little closer.',
  bad_image: 'That file does not look like a photo of a page.',
  read_failed: 'Pip could not read that page. Try another photo.',
};

function codeOf(body: unknown): string {
  if (!body || typeof body !== 'object') return '';
  const code = (body as { code?: unknown }).code;
  return typeof code === 'string' ? code : '';
}

export function safeReaderText(text: string): string {
  const trimmed = text.trim().slice(0, 180);
  if (!trimmed || /https?:|data:image|base64/i.test(trimmed)) {
    return 'Pip could not read that page. Try another photo.';
  }
  return trimmed;
}

function failure(code: string, body: unknown): ScanOutcome {
  const known = FRIENDLY[code];
  if (known) return { ok: false, code, message: known };
  const raw = body && typeof body === 'object' ? (body as { error?: unknown }).error : '';
  const message = typeof raw === 'string' && raw.trim()
    ? safeReaderText(raw)
    : 'Pip could not read that page. Try another photo.';
  return { ok: false, code: code || 'read_failed', message };
}

function pickQuestion(value: unknown): unknown {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return value;
  const obj = value as Record<string, unknown>;
  return {
    id: obj.id,
    type: obj.type,
    instruction: obj.instruction,
    prompt: obj.prompt,
    options: obj.options,
    left: obj.left,
    right: obj.right,
    emphasis: obj.emphasis,
  };
}

/**
 * Interpret a scan response. Non-200 bodies are failures even when they
 * contain a `questions` array — those questions are ignored.
 */
export function interpretScanResponse(status: number, body: unknown): ScanOutcome {
  if (status !== 200) return failure(codeOf(body) || 'read_failed', body);
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return failure('invalid', body);
  }
  const obj = body as Record<string, unknown>;
  if (typeof obj.error === 'string' && obj.error.trim()) {
    return { ok: false, code: 'read_failed', message: safeReaderText(obj.error) };
  }
  if (!Array.isArray(obj.questions)) return failure('invalid', body);
  const validated = validateModelPayload({
    error: '',
    questions: obj.questions.map(pickQuestion),
  });
  if (!validated.ok) {
    return { ok: false, code: 'invalid', message: safeReaderText(validated.reason) };
  }
  const suggestions: Record<string, string> = {};
  obj.questions.forEach((item, index) => {
    const question = validated.questions[index];
    if (!question || !item || typeof item !== 'object') return;
    const suggestion = (item as { suggestion?: unknown }).suggestion;
    if (typeof suggestion !== 'string') return;
    const clean = cleanSuggestion(question, suggestion);
    if (clean) suggestions[question.id] = clean;
  });
  return { ok: true, questions: validated.questions, suggestions };
}
