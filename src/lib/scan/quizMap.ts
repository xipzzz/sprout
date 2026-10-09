/* Map parent-confirmed questions onto Lock B plays.
   Unconfirmed and deleted questions are skipped.
   Distractors and extra tiles come only from what the parent saw. */

import type { ReviewQuestion } from './review';
import { sentenceTokens } from './review';
import type { Pair } from './suggestions';
import { orderPrintedTiles, wordOrderTiles } from './wordOrder';

export type Grade = 'correct' | 'almost' | 'wrong';

export type PlayableQuestion = (
  | {
      kind: 'fill_cards';
      id: string;
      prompt: string;
      instruction: string;
      options: string[];
      answer: string;
    }
  | {
      kind: 'fill_bank';
      id: string;
      prompt: string;
      instruction: string;
      bank: string[];
      answer: string;
    }
  | {
      kind: 'multiple_choice';
      id: string;
      prompt: string;
      instruction: string;
      options: string[];
      answer: string;
    }
  | {
      kind: 'matching';
      id: string;
      prompt: string;
      instruction: string;
      pairs: Pair[];
      rightOrder: string[];
    }
  | {
      kind: 'rewrite';
      id: string;
      prompt: string;
      instruction: string;
      tiles: string[];
      answerTokens: string[];
      /** Printed slash tiles, shown exactly, not restyled or padded. */
      exactTiles?: boolean;
    }
) & { emphasis?: string[] };

export type PlayResponse =
  | { kind: 'choice'; value: string }
  | { kind: 'typed'; value: string }
  | { kind: 'pairs'; pairs: Pair[] }
  | { kind: 'tiles'; tokens: string[] };

export interface QuizQueue {
  items: PlayableQuestion[];
  index: number;
  retried: string[];
}

export function shuffleWithSeed<T>(items: T[], seed: string): T[] {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  let s = h >>> 0;
  const rand = () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const copy = items.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  if (copy.length > 1 && copy.every((item, i) => item === items[i])) {
    const first = copy.shift();
    if (first !== undefined) copy.push(first);
  }
  return copy;
}

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

function toPlayable(q: ReviewQuestion): PlayableQuestion[] {
  if (q.deleted || !q.confirmed) return [];
  if (q.type === 'fill_blank' && q.options.length > 0) {
    if (!q.options.includes(q.answer)) return [];
    return [{
      kind: 'fill_cards',
      id: q.id,
      prompt: q.prompt,
      instruction: q.instruction,
      options: [...q.options],
      answer: q.answer,
      emphasis: q.emphasis,
    }];
  }
  if (q.type === 'fill_blank') {
    const answer = q.answer.trim();
    const distractors = q.distractors.map((d) => d.trim()).filter(Boolean);
    if (!answer || distractors.length < 2) return [];
    const bank = shuffleWithSeed([answer, distractors[0], distractors[1]], `${q.id}:bank`);
    return [{
      kind: 'fill_bank',
      id: q.id,
      prompt: q.prompt,
      instruction: q.instruction,
      bank,
      answer,
      emphasis: q.emphasis,
    }];
  }
  if (q.type === 'multiple_choice') {
    if (q.options.length < 2 || q.options.length > 8 || !q.options.includes(q.answer)) return [];
    return [{
      kind: 'multiple_choice',
      id: q.id,
      prompt: q.prompt,
      instruction: q.instruction,
      options: [...q.options],
      answer: q.answer,
      emphasis: q.emphasis,
    }];
  }
  if (q.type === 'matching') {
    const complete = q.pairs.length >= 2
      && q.pairs.every((p) => p.left && p.right && q.left.includes(p.left) && q.right.includes(p.right));
    if (!complete) return [];
    return chunk(q.pairs, 5).map((pairs, index) => ({
      kind: 'matching' as const,
      id: q.pairs.length > 5 ? `${q.id}#${index + 1}` : q.id,
      prompt: q.prompt,
      instruction: q.instruction,
      pairs,
      rightOrder: shuffleWithSeed(pairs.map((p) => p.right), `${q.id}:right:${index}`),
      emphasis: q.emphasis,
    }));
  }
  const printed = wordOrderTiles(q.prompt);
  if (printed) {
    const answerTokens = orderPrintedTiles(printed, q.answer);
    if (!answerTokens) return [];
    return [{
      kind: 'rewrite',
      id: q.id,
      prompt: q.prompt,
      instruction: q.instruction,
      tiles: shuffleWithSeed(printed, `${q.id}:tiles`),
      answerTokens,
      emphasis: q.emphasis,
      exactTiles: true,
    }];
  }
  const answerTokens = sentenceTokens(q.answer);
  if (answerTokens.length < 2) return [];
  const extras = q.extraTiles.map((t) => t.trim()).filter(Boolean).slice(0, 2);
  return [{
    kind: 'rewrite',
    id: q.id,
    prompt: q.prompt,
    instruction: q.instruction,
    tiles: shuffleWithSeed([...answerTokens, ...extras], `${q.id}:tiles`),
    answerTokens,
    emphasis: q.emphasis,
  }];
}

/** Confirmed questions only, in sheet order, split into parts of 10. */
export function buildQuiz(questions: ReviewQuestion[]): PlayableQuestion[][] {
  const plays = questions.flatMap(toPlayable);
  if (plays.length === 0) return [];
  return chunk(plays, 10);
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > 1) return 2;
  const prev = new Array<number>(b.length + 1);
  for (let j = 0; j <= b.length; j++) prev[j] = j;
  for (let i = 1; i <= a.length; i++) {
    let corner = prev[0];
    prev[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const next = a[i - 1] === b[j - 1]
        ? corner
        : Math.min(corner, prev[j - 1], prev[j]) + 1;
      corner = prev[j];
      prev[j] = next;
    }
  }
  return prev[b.length];
}

/** Case-only difference, or one letter off. Used when a child types. */
export function gradeTypedWord(expected: string, given: string): Grade {
  const answer = expected.trim();
  const typed = given.trim();
  if (!typed) return 'wrong';
  if (typed === answer) return 'correct';
  if (typed.toLowerCase() === answer.toLowerCase()) return 'almost';
  if (levenshtein(typed.toLowerCase(), answer.toLowerCase()) === 1) return 'almost';
  return 'wrong';
}

function oneTileOutOfPlace(built: string[], answer: string[]): boolean {
  if (built.length !== answer.length || built.length === 0) return false;
  for (let from = 0; from < built.length; from++) {
    const token = built[from];
    const rest = built.slice(0, from).concat(built.slice(from + 1));
    for (let to = 0; to <= rest.length; to++) {
      if (to === from) continue;
      const moved = rest.slice(0, to).concat(token, rest.slice(to));
      if (moved.length === answer.length && moved.every((t, i) => t === answer[i])) return true;
    }
  }
  return false;
}

export function gradePlayable(q: PlayableQuestion, response: PlayResponse): Grade {
  if (q.kind === 'fill_cards' || q.kind === 'multiple_choice') {
    if (response.kind !== 'choice') return 'wrong';
    return response.value === q.answer ? 'correct' : 'wrong';
  }
  if (q.kind === 'fill_bank') {
    if (response.kind === 'typed') return gradeTypedWord(q.answer, response.value);
    if (response.kind === 'choice') return response.value === q.answer ? 'correct' : 'wrong';
    return 'wrong';
  }
  if (q.kind === 'matching') {
    if (response.kind !== 'pairs') return 'wrong';
    let mismatches = 0;
    for (const pair of q.pairs) {
      const got = response.pairs.find((p) => p.left === pair.left);
      if (!got || got.right !== pair.right) mismatches += 1;
    }
    if (mismatches === 0 && response.pairs.length === q.pairs.length) return 'correct';
    if (q.pairs.length === 5 && mismatches === 1) return 'almost';
    return 'wrong';
  }
  if (response.kind !== 'tiles') return 'wrong';
  if (response.tokens.length === q.answerTokens.length && response.tokens.every((t, i) => t === q.answerTokens[i])) {
    return 'correct';
  }
  if (oneTileOutOfPlace(response.tokens, q.answerTokens)) return 'almost';
  return 'wrong';
}

/** Wrong answers are shown, then asked once more at the end of this part. */
export function advanceQueue(state: QuizQueue, grade: Grade): QuizQueue {
  const current = state.items[state.index];
  if (!current) return state;
  if (grade === 'wrong' && !state.retried.includes(current.id)) {
    return {
      items: [...state.items, current],
      index: state.index + 1,
      retried: [...state.retried, current.id],
    };
  }
  return { ...state, index: state.index + 1 };
}

export function queueFinished(state: QuizQueue): boolean {
  return state.index >= state.items.length;
}

export interface FirstTryCount {
  right: number;
  total: number;
}

/** A repeat after a wrong answer is not a new question and cannot count as right. */
export function noteFirstTry(count: FirstTryCount, grade: Grade, retried: boolean): FirstTryCount {
  if (retried) return count;
  return {
    right: count.right + (grade === 'correct' ? 1 : 0),
    total: count.total + 1,
  };
}

export function firstTryLine(count: FirstTryCount): string {
  return `You got ${count.right} of ${count.total} right`;
}

export interface QuizRun {
  parts: PlayableQuestion[][];
  partIndex: number;
  queue: QuizQueue;
  count: FirstTryCount;
  /** Finish stays up until Continue. The last answer does not open Today. */
  screen: 'question' | 'finish' | 'today';
}

export function startQuiz(parts: PlayableQuestion[][]): QuizRun {
  return {
    parts,
    partIndex: 0,
    queue: { items: parts[0] ?? [], index: 0, retried: [] },
    count: { right: 0, total: 0 },
    screen: 'question',
  };
}

/** Grade the question on screen. A finished part opens the next part, or the finish screen. */
export function answerCurrent(run: QuizRun, grade: Grade): QuizRun {
  if (run.screen !== 'question') return run;
  const current = run.queue.items[run.queue.index];
  if (!current) return run;
  const count = noteFirstTry(run.count, grade, run.queue.retried.includes(current.id));
  const queue = advanceQueue(run.queue, grade);
  if (!queueFinished(queue)) return { ...run, queue, count, screen: 'question' };
  const nextPart = run.partIndex + 1;
  if (nextPart < run.parts.length) {
    return {
      ...run,
      count,
      partIndex: nextPart,
      queue: { items: run.parts[nextPart] ?? [], index: 0, retried: [] },
      screen: 'question',
    };
  }
  return { ...run, queue, count, screen: 'finish' };
}

/** Continue on the finish screen is what returns to Today. */
export function continueFinish(run: QuizRun): QuizRun {
  if (run.screen !== 'finish') return run;
  return { ...run, screen: 'today' };
}

export function answerText(q: PlayableQuestion): string {
  if (q.kind === 'matching') return q.pairs.map((p) => `${p.left} → ${p.right}`).join(', ');
  if (q.kind === 'rewrite') return q.answerTokens.join(' ');
  return q.answer;
}
