/* Suggested answers are optional and never become new questions.
   A suggestion that is not on the printed page (for choices and matching)
   is dropped. The parent still has to confirm whatever remains. */

import type { ScannedQuestion } from './types';

export interface Pair {
  left: string;
  right: string;
}

export function parsePairs(q: ScannedQuestion, text: string): Pair[] | null {
  const lines = text.split(/\n+/).map((line) => line.trim()).filter(Boolean);
  if (lines.length !== q.left.length) return null;
  const pairs: Pair[] = [];
  const usedLeft = new Set<string>();
  const usedRight = new Set<string>();
  for (const line of lines) {
    const parts = line.split(/\s*=>\s*/);
    if (parts.length !== 2) return null;
    const left = parts[0].trim();
    const right = parts[1].trim();
    if (!q.left.includes(left) || !q.right.includes(right)) return null;
    if (usedLeft.has(left) || usedRight.has(right)) return null;
    usedLeft.add(left);
    usedRight.add(right);
    pairs.push({ left, right });
  }
  if (!q.left.every((left) => usedLeft.has(left))) return null;
  return pairs;
}

/** Empty string means "no suggestion" — never a made-up choice. */
export function cleanSuggestion(q: ScannedQuestion, answer: string): string {
  const text = answer.trim();
  if (!text) return '';
  if (q.type === 'multiple_choice' || (q.type === 'fill_blank' && q.options.length > 0)) {
    return q.options.includes(text) ? text : '';
  }
  if (q.type === 'matching') {
    const pairs = parsePairs(q, text);
    return pairs ? pairs.map((p) => `${p.left} => ${p.right}`).join('\n') : '';
  }
  return text;
}

export function suggestionsFromModel(questions: ScannedQuestion[], raw: unknown): Record<string, string> {
  const out: Record<string, string> = {};
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return out;
  const list = (raw as { suggestions?: unknown }).suggestions;
  if (!Array.isArray(list)) return out;
  const byId = new Map(questions.map((q) => [q.id, q]));
  for (const item of list) {
    if (!item || typeof item !== 'object') continue;
    const id = (item as { id?: unknown }).id;
    const answer = (item as { answer?: unknown }).answer;
    if (typeof id !== 'string' || typeof answer !== 'string') continue;
    const question = byId.get(id);
    if (!question) continue;
    const clean = cleanSuggestion(question, answer);
    if (clean) out[id] = clean;
  }
  return out;
}
