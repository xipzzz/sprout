/* Parent check screen state.
   Nothing is playable until the parent confirms an answer.
   Edits clear confirmation. Deleted questions are skipped. */

import { needsExactCopy } from './mistake';
import { parsePairs, type Pair } from './suggestions';
import type { ScannedQuestion } from './types';
import { usesOnlyPrintedWords, wordOrderTiles } from './wordOrder';

export interface ReviewQuestion {
  id: string;
  type: ScannedQuestion['type'];
  instruction: string;
  prompt: string;
  options: string[];
  left: string[];
  right: string[];
  emphasis: string[];
  needsExactCopy: boolean;
  /** Model suggestion, already cleaned. Empty if none. Not an answer yet. */
  suggestion: string;
  answer: string;
  pairs: Pair[];
  distractors: [string, string];
  extraTiles: [string, string];
  confirmed: boolean;
  deleted: boolean;
}

export type ReviewAction =
  | { type: 'prompt'; id: string; value: string }
  | { type: 'instruction'; id: string; value: string }
  | { type: 'option'; id: string; index: number; value: string }
  | { type: 'answer'; id: string; value: string }
  | { type: 'distractor'; id: string; index: 0 | 1; value: string }
  | { type: 'extra'; id: string; index: 0 | 1; value: string }
  | { type: 'pair'; id: string; left: string; right: string }
  | { type: 'delete'; id: string }
  | { type: 'restore'; id: string }
  | { type: 'confirm'; id: string }
  | { type: 'add-option'; id: string }
  | { type: 'set-type'; id: string; value: ReviewQuestion['type'] }
  | { type: 'add-question' };

function sheetWords(questions: ScannedQuestion[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  const push = (raw: string) => {
    const text = raw.trim();
    if (!text || text === '___' || text.length > 32) return;
    const key = text.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    out.push(text);
  };
  for (const q of questions) {
    q.options.forEach(push);
    q.left.forEach(push);
    q.right.forEach(push);
    for (const word of `${q.prompt} ${q.instruction}`.split(/\s+/)) {
      const clean = word.replace(/^[^a-zA-Z']+|[^a-zA-Z']+$/g, '');
      if (clean.length >= 3) push(clean);
    }
  }
  return out;
}

function pickTwo(words: string[], avoid: string[]): [string, string] {
  const skip = new Set(avoid.map((w) => w.toLowerCase()));
  const picked = words.filter((w) => !skip.has(w.toLowerCase()));
  return [picked[0] ?? '', picked[1] ?? ''];
}

function blankPairs(q: ScannedQuestion): Pair[] {
  return q.left.map((left) => ({ left, right: '' }));
}

export function createReview(
  questions: ScannedQuestion[],
  suggestions: Record<string, string> = {},
): ReviewQuestion[] {
  const words = sheetWords(questions);
  return questions.map((q) => {
    const suggestion = suggestions[q.id] ?? '';
    const pairs = q.type === 'matching' ? (parsePairs(q, suggestion) ?? blankPairs(q)) : [];
    const answer = q.type === 'matching' ? '' : suggestion;
    const avoid = [answer, ...q.options, ...q.left, ...q.right];
    const [d1, d2] = pickTwo(words, avoid);
    const [e1, e2] = q.type === 'rewrite' ? pickTwo(words, answer.split(/\s+/)) : ['', ''];
    return {
      id: q.id,
      type: q.type,
      instruction: q.instruction,
      prompt: q.prompt,
      options: [...q.options],
      left: [...q.left],
      right: [...q.right],
      emphasis: [...q.emphasis],
      needsExactCopy: needsExactCopy(q.instruction, q.prompt),
      suggestion,
      answer,
      pairs,
      distractors: q.type === 'fill_blank' && q.options.length === 0 ? [d1, d2] : ['', ''],
      extraTiles: [e1, e2],
      confirmed: false,
      deleted: false,
    };
  });
}

export function canConfirm(q: ReviewQuestion): boolean {
  if (q.deleted) return false;
  if (q.type === 'matching') {
    if (q.pairs.length !== q.left.length) return false;
    const rights = new Set<string>();
    for (const pair of q.pairs) {
      if (!q.left.includes(pair.left) || !q.right.includes(pair.right)) return false;
      if (rights.has(pair.right)) return false;
      rights.add(pair.right);
    }
    return rights.size === q.left.length;
  }
  if (q.type === 'multiple_choice' || (q.type === 'fill_blank' && q.options.length > 0)) {
    return q.options.includes(q.answer);
  }
  if (q.type === 'fill_blank') {
    const answer = q.answer.trim();
    const a = q.distractors[0].trim();
    const b = q.distractors[1].trim();
    if (!answer || !a || !b) return false;
    const keys = [answer, a, b].map((w) => w.toLowerCase());
    return new Set(keys).size === 3;
  }
  const printed = wordOrderTiles(q.prompt);
  if (printed) return usesOnlyPrintedWords(printed, q.answer);
  return sentenceTokens(q.answer).length >= 2;
}

export function sentenceTokens(answer: string): string[] {
  return answer
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[.,!?;:“”]+/g, ' ')
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean);
}

function touch(q: ReviewQuestion, patch: Partial<ReviewQuestion>): ReviewQuestion {
  const next = { ...q, ...patch, confirmed: false };
  next.needsExactCopy = needsExactCopy(next.instruction, next.prompt);
  return next;
}

function blankQuestion(id: string): ReviewQuestion {
  return {
    id,
    type: 'fill_blank',
    instruction: '',
    prompt: '',
    options: [],
    left: [],
    right: [],
    emphasis: [],
    needsExactCopy: false,
    suggestion: '',
    answer: '',
    pairs: [],
    distractors: ['', ''],
    extraTiles: ['', ''],
    confirmed: false,
    deleted: false,
  };
}

export function reviewReducer(state: ReviewQuestion[], action: ReviewAction): ReviewQuestion[] {
  if (action.type === 'add-question') {
    return [...state, blankQuestion(`added-${state.length + 1}`)];
  }
  return state.map((q) => {
    if (q.id !== action.id) return q;
    switch (action.type) {
      case 'prompt':
        return touch(q, { prompt: action.value });
      case 'instruction':
        return touch(q, { instruction: action.value });
      case 'option': {
        const options = q.options.map((option, index) => (index === action.index ? action.value : option));
        const answer = options.includes(q.answer) ? q.answer : '';
        return touch(q, { options, answer });
      }
      case 'answer':
        return touch(q, { answer: action.value });
      case 'distractor': {
        const distractors: [string, string] = [...q.distractors];
        distractors[action.index] = action.value;
        return touch(q, { distractors });
      }
      case 'extra': {
        const extraTiles: [string, string] = [...q.extraTiles];
        extraTiles[action.index] = action.value;
        return touch(q, { extraTiles });
      }
      case 'pair': {
        const pairs = q.pairs.map((pair) => (
          pair.left === action.left ? { left: pair.left, right: action.right } : pair
        ));
        return touch(q, { pairs });
      }
      case 'delete':
        return { ...q, deleted: true, confirmed: false };
      case 'restore':
        return { ...q, deleted: false };
      case 'add-option':
        return touch(q, { options: [...q.options, ''] });
      case 'set-type':
        return touch(q, {
          type: action.value,
          answer: '',
          pairs: action.value === 'matching'
            ? (q.pairs.length ? q.pairs : q.left.map((left) => ({ left, right: '' })))
            : q.pairs,
        });
      case 'confirm':
        return canConfirm(q) ? { ...q, confirmed: true } : q;
      default:
        return q;
    }
  });
}
