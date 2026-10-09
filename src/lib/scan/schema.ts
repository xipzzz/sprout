/* Strict check for the vision model's JSON.
   extra fields, bad types, or an error string → failure, and the questions
   are not returned. A failed read must never become practice. */

import { QUESTION_TYPES, type QuestionType, type ScannedQuestion } from './types';
import { normalizeScannedQuestion } from './wordOrder';

const QUESTION_KEYS = new Set(['id', 'type', 'instruction', 'prompt', 'options', 'left', 'right', 'emphasis']);
const ROOT_KEYS = new Set(['questions', 'error']);
const MAX_QUESTIONS = 40;

export type SchemaResult =
  | { ok: true; questions: ScannedQuestion[] }
  | { ok: false; reason: string };

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isQuestionType(value: string): value is QuestionType {
  return (QUESTION_TYPES as readonly string[]).includes(value);
}

function isQuestion(value: unknown): value is ScannedQuestion {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const obj = value as Record<string, unknown>;
  for (const key of Object.keys(obj)) {
    if (!QUESTION_KEYS.has(key)) return false;
  }
  if (typeof obj.id !== 'string' || obj.id.trim() === '') return false;
  if (typeof obj.type !== 'string' || !isQuestionType(obj.type)) return false;
  if (typeof obj.instruction !== 'string' || typeof obj.prompt !== 'string') return false;
  if (!isStringArray(obj.options) || !isStringArray(obj.left) || !isStringArray(obj.right) || !isStringArray(obj.emphasis)) {
    return false;
  }
  return true;
}

/** A question has to carry real printed text. We do not fill gaps. */
export function questionIsUsable(q: ScannedQuestion): boolean {
  if (q.type === 'matching') {
    return q.left.length >= 2
      && q.right.length >= 2
      && q.left.length <= 12
      && q.right.length <= 12
      && q.left.every((s) => s.trim() !== '')
      && q.right.every((s) => s.trim() !== '');
  }
  if (q.prompt.trim() === '') return false;
  if (q.type === 'multiple_choice') {
    const options = q.options.map((o) => o.trim()).filter(Boolean);
    return options.length >= 2 && options.length <= 8 && options.length === q.options.length;
  }
  if (q.type === 'fill_blank' && q.options.length > 0) {
    return q.options.length <= 8 && q.options.every((o) => o.trim() !== '');
  }
  return true;
}

/**
 * Validate `{ questions, error }` from the vision model.
 * When `error` is non-empty, questions are dropped even if they were present.
 */
export function validateModelPayload(value: unknown): SchemaResult {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { ok: false, reason: 'The reader did not return a JSON object.' };
  }
  const obj = value as Record<string, unknown>;
  for (const key of Object.keys(obj)) {
    if (!ROOT_KEYS.has(key)) {
      return { ok: false, reason: 'The reader returned unexpected fields.' };
    }
  }
  if (typeof obj.error !== 'string' || !Array.isArray(obj.questions)) {
    return { ok: false, reason: 'The reader JSON is missing questions or error.' };
  }
  if (obj.error.trim()) {
    return { ok: false, reason: obj.error.trim() };
  }
  if (obj.questions.length > MAX_QUESTIONS) {
    return { ok: false, reason: 'The reader returned too many questions for one page.' };
  }
  const questions: ScannedQuestion[] = [];
  const ids = new Set<string>();
  for (const item of obj.questions) {
    if (!isQuestion(item)) return { ok: false, reason: 'A question did not match the schema.' };
    if (ids.has(item.id)) return { ok: false, reason: 'The reader repeated a question id.' };
    ids.add(item.id);
    const normalized = normalizeScannedQuestion(item);
    if (!normalized) continue;
    if (!questionIsUsable(normalized)) return { ok: false, reason: 'A question was missing its printed text.' };
    questions.push(normalized);
  }
  if (questions.length === 0) {
    return { ok: false, reason: 'No printed questions were found on that page.' };
  }
  return { ok: true, questions };
}

/** Pull the first JSON object out of a model reply. Throws if there is none. */
export function extractJsonObject(raw: string): unknown {
  const trimmed = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  try {
    return JSON.parse(trimmed);
  } catch {
    /* try the first {...} span */
  }
  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start >= 0 && end > start) return JSON.parse(trimmed.slice(start, end + 1));
  throw new Error('The reader did not return JSON.');
}
