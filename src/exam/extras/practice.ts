/* Similar practice ("one example, three more", as in Zuoyebang). Number-swapped maths variants
   with answers worked out on this device. Answers stay in the PracticeSet (parent data).
   The child only gets stem and choices through toPracticeChildView. */

import type { ChildView, ParentQuestion } from '../types.ts';
import { fillStem, normaliseAnswer, parseMath, solve, type MathProblem, type Op, type ParsedMath } from './arithmetic.ts';
import type { ExplainCache } from './explain.ts';
import { seededRandom } from './hash.ts';
import { containsAnswer, hintFor } from './hints.ts';
import type { ExtrasSettings } from './settings.ts';

export const MIN_SIMILAR = 3;
export const MAX_SIMILAR = 10;

export type PracticeVariant = { id: string; stem: string; choices: string[]; answer: string };

export type PracticeSet = {
  sourceId: string;
  sourceStem: string;
  subject: string;
  variants: PracticeVariant[];
};

export type PracticeRun = { set: PracticeSet; view: ChildView };

/** One child try. What the child gave, the right answer and the result stay in separate fields. */
export type PracticeAttempt = {
  id: string;
  child_answer: string;
  correct_answer: string;
  is_correct: boolean;
};

const LETTERS = 'abcdefghij';

type Rng = () => number;

function between(rng: Rng, low: number, high: number) {
  return low + Math.floor(rng() * (high - low + 1));
}

/** A new number with the same number of digits, kept round if the old one was round. */
function like(n: number, rng: Rng): number {
  if (n < 10) return between(rng, 2, 9);
  const digits = String(n).length;
  const low = 10 ** (digits - 1);
  const high = 10 ** digits - 1;
  if (n % 10 === 0) return between(rng, low / 10, Math.floor(high / 10)) * 10;
  return between(rng, low, high);
}

function swapPair(op: Op, a: number, b: number, rng: Rng): [number, number] {
  if (op === '-') {
    const x = like(a, rng);
    const y = like(b, rng);
    return x >= y ? [x, y] : [y, x];
  }
  if (op === '÷') {
    const divisor = like(b, rng);
    const quotient = Math.max(2, like(Math.max(2, Math.floor(a / Math.max(1, b))), rng));
    return [divisor * quotient, divisor];
  }
  return [like(a, rng), like(b, rng)];
}

function newNumbers(parsed: ParsedMath, rng: Rng): number[] | null {
  const problem: MathProblem = parsed.problem;
  if (problem.kind === 'expression') {
    if (problem.ops.length === 1) {
      const [a, b] = problem.numbers;
      const worked = solve(problem);
      if (problem.ops[0] === '÷' && worked?.remainder) {
        const divisor = like(b, rng);
        const top = like(a, rng);
        return top > divisor ? [top, divisor] : null;
      }
      return swapPair(problem.ops[0], a, b, rng);
    }
    return problem.numbers.map((n) => like(n, rng));
  }
  if (problem.kind === 'word') {
    const [first, second] = problem.numbers;
    const big = Math.max(first, second);
    const small = Math.min(first, second);
    const [x, y] = swapPair(problem.op, big, small, rng);
    if (problem.op === '-' || problem.op === '÷') return first >= second ? [x, y] : [y, x];
    return [x, y];
  }
  const worked = solve(problem);
  if (!worked) return null;
  const [known] = problem.numbers;
  const left = problem.gap === 0 ? worked.value : known;
  const right = problem.gap === 0 ? known : worked.value;
  const [l, r] = swapPair(problem.op, left, right, rng);
  const sum = { '+': l + r, '-': l - r, x: l * r, '÷': l / r }[problem.op];
  if (!Number.isInteger(sum) || sum < 0) return null;
  return problem.gap === 0 ? [r, sum] : [l, sum];
}

function unitSuffix(choices: string[]): string {
  const suffixes = choices.map((choice) => /^\s*\d+\s*(\D*)$/.exec(choice)?.[1] ?? null);
  if (!suffixes.length || suffixes.some((s) => s === null)) return '';
  return suffixes.every((s) => s === suffixes[0]) ? (suffixes[0] ?? '').trim() : '';
}

function shuffle<T>(items: T[], rng: Rng): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function makeChoices(answer: string, count: number, suffix: string, rng: Rng): string[] {
  const remainder = /^(\d+) R (\d+)$/.exec(answer);
  let wrong: string[];
  if (remainder) {
    const q = Number(remainder[1]);
    const r = Number(remainder[2]);
    wrong = [`${q} R ${r + 1}`, `${q + 1} R ${r}`, `${q} R ${Math.max(0, r - 1)}`, `${Math.max(0, q - 1)} R ${r}`];
  } else {
    const v = Number(answer);
    wrong = [v + 1, v - 1, v + 10, v - 10, v + 2, v - 2, ...(v >= 100 ? [v + 100, v - 100] : [])].filter((n) => n >= 0).map(String);
  }
  const unique = [...new Set(wrong.filter((item) => item !== answer && !/ R 0$/.test(item)))];
  const picked = shuffle(unique, rng).slice(0, Math.max(1, count - 1));
  const withUnit = (item: string) => (suffix ? `${item}${suffix}` : item);
  return shuffle([answer, ...picked], rng).map(withUnit);
}

/** Works a sum a second way: split into + and - terms, each a chain of x and ÷. */
function termsValue(numbers: number[], ops: Op[]): number | null {
  let total = 0;
  let sign = 1;
  let term = numbers[0];
  for (let i = 0; i < ops.length; i += 1) {
    const op = ops[i];
    const next = numbers[i + 1];
    if (op === 'x') term *= next;
    else if (op === '÷') {
      if (!next || term % next) return null;
      term /= next;
    } else {
      total += sign * term;
      sign = op === '+' ? 1 : -1;
      term = next;
    }
  }
  return total + sign * term;
}

/** Puts the answer back into the question and checks that it fits. */
export function answerFits(problem: MathProblem, answer: string): boolean {
  const parts = /^(\d+)(?: R (\d+))?$/.exec(answer.trim());
  if (!parts) return false;
  const value = Number(parts[1]);
  const remainder = Number(parts[2] ?? 0);
  if (problem.kind === 'missing') {
    const [known, total] = problem.numbers;
    const [left, right] = problem.gap === 0 ? [value, known] : [known, value];
    const back = { '+': left + right, '-': left - right, x: left * right, '÷': right ? left / right : NaN }[problem.op];
    return !remainder && back === total;
  }
  const [first, second] = problem.numbers;
  const ordered =
    problem.kind === 'word' && (problem.op === '-' || problem.op === '÷')
      ? [Math.max(first, second), Math.min(first, second)]
      : problem.numbers;
  const ops = problem.kind === 'word' ? [problem.op] : problem.ops;
  if (ops.length === 1 && ops[0] === '÷') {
    const [a, b] = ordered;
    return b > 0 && remainder < b && value * b + remainder === a;
  }
  return !remainder && termsValue(ordered, ops) === value;
}

/** A variant is kept only if the answer fits, the stem does not show it, and the choices hold it once. */
export function verifyVariant(variant: PracticeVariant): boolean {
  const parsed = parseMath(variant.stem);
  if (!parsed) return false;
  const bare = variant.choices.length ? variant.answer.replace(/[^\dR ]/g, '').trim() : variant.answer;
  if (!answerFits(parsed.problem, bare)) return false;
  if (containsAnswer(variant.stem, bare)) return false;
  if (variant.choices.length) {
    if (new Set(variant.choices).size !== variant.choices.length) return false;
    const matches = variant.choices.filter((choice) => normaliseAnswer(choice.replace(/[^\dR ]/g, '')) === normaliseAnswer(bare));
    if (matches.length !== 1 || matches[0] !== variant.answer) return false;
  }
  return true;
}

export function canMakeSimilar(question: ParentQuestion): boolean {
  const parsed = parseMath(question.stem);
  return Boolean(parsed && solve(parsed.problem));
}

/** From one maths question, make `count` (3 to 10) new ones with worked answers. */
export function makeSimilar(question: ParentQuestion, subject: string, count: number, seed = ''): PracticeSet | null {
  const parsed = parseMath(question.stem);
  if (!parsed || !solve(parsed.problem)) return null;
  const want = Math.min(MAX_SIMILAR, Math.max(MIN_SIMILAR, Math.round(count)));
  const rng = seededRandom(`${question.stem}|${seed}|similar`);
  const suffix = unitSuffix(question.choices);
  const seen = new Set([question.stem]);
  const variants: PracticeVariant[] = [];
  for (let attempt = 0; attempt < want * 80 && variants.length < want; attempt += 1) {
    const numbers = newNumbers(parsed, rng);
    if (!numbers) continue;
    const stem = fillStem(question.stem, parsed.slots, numbers);
    if (seen.has(stem)) continue;
    const check = parseMath(stem);
    const worked = check ? solve(check.problem) : null;
    if (!worked) continue;
    const choices = question.choices.length ? makeChoices(worked.answer, question.choices.length, suffix, rng) : [];
    const answer = choices.length
      ? (choices.find((choice) => normaliseAnswer(choice.replace(suffix, '')) === normaliseAnswer(worked.answer)) ?? '')
      : worked.answer;
    const variant = { id: `similar-${LETTERS[variants.length]}`, stem, choices, answer };
    if (!verifyVariant(variant)) continue;
    seen.add(stem);
    variants.push(variant);
  }
  if (variants.length < want) return null;
  return { sourceId: question.id, sourceStem: question.stem, subject, variants };
}

export function toPracticeChildView(set: PracticeSet): ChildView {
  return {
    subject: set.subject,
    questions: set.variants.map((variant) => ({ id: variant.id, stem: variant.stem, choices: [...variant.choices] })),
  };
}

const FORBIDDEN = ['answer', 'correct_answer', 'steps', 'explanation', 'rule', 'sayAloud', 'say_aloud', 'followUp', 'follow_up', 'hint', 'notes', 'variants'];

/** Throws if the child practice payload carries anything but stem and choices, or shows an answer. */
export function assertPracticeChildSafe(set: PracticeSet, view: ChildView): void {
  const top = Object.keys(view).sort().join(',');
  if (top !== 'questions,subject') throw new Error(`Practice view has unexpected fields: ${top}`);
  const blob = JSON.stringify(view);
  for (const key of FORBIDDEN) {
    if (blob.includes(`"${key}"`)) throw new Error(`Practice view leaked the ${key} field`);
  }
  if (view.questions.length !== set.variants.length) throw new Error('Practice view and set do not line up');
  set.variants.forEach((variant, index) => {
    const item = view.questions[index];
    const keys = Object.keys(item).sort().join(',');
    if (keys !== 'choices,id,stem') throw new Error(`Practice question has unexpected fields: ${keys}`);
    if (containsAnswer(item.stem, variant.answer)) throw new Error(`Practice stem ${variant.id} shows its answer`);
    if (!item.choices.length && containsAnswer(JSON.stringify(item), variant.answer)) {
      throw new Error(`Practice question ${variant.id} shows its answer`);
    }
  });
}

/** Checks every variant again just before play and drops any that fail. */
export function startPractice(set: PracticeSet): PracticeRun {
  const checked = { ...set, variants: set.variants.filter(verifyVariant) };
  if (!checked.variants.length) throw new Error('No similar questions passed the answer check.');
  const view = toPracticeChildView(checked);
  assertPracticeChildSafe(checked, view);
  return { set: checked, view };
}

function isRight(variant: PracticeVariant, given: string) {
  if (variant.choices.length) return given === variant.answer;
  const strip = (text: string) => normaliseAnswer(text.replace(/[^\dRr ]/g, ''));
  return Boolean(strip(given)) && strip(given) === strip(variant.answer);
}

const attemptLog = new Map<string, PracticeAttempt[]>();

/** Grades one try and keeps it in parent data for this session. */
export function recordAttempt(set: PracticeSet, id: string, given: string): PracticeAttempt {
  const variant = set.variants.find((item) => item.id === id);
  const attempt: PracticeAttempt = {
    id,
    child_answer: given,
    correct_answer: variant?.answer ?? '',
    is_correct: variant ? isRight(variant, given) : false,
  };
  const key = logKey(set.sourceId, set.sourceStem);
  attemptLog.set(key, [...(attemptLog.get(key) ?? []), attempt]);
  return attempt;
}

function logKey(sourceId: string, sourceStem: string) {
  return `${sourceId}|${sourceStem}`;
}

export function attemptsFor(question: Pick<ParentQuestion, 'id' | 'stem'>): PracticeAttempt[] {
  return attemptLog.get(logKey(question.id, question.stem)) ?? [];
}

export function gradePractice(set: PracticeSet, id: string, given: string): 'nice' | 'almost' {
  return recordAttempt(set, id, given).is_correct ? 'nice' : 'almost';
}

export function variantQuestion(variant: PracticeVariant): ParentQuestion {
  return {
    id: variant.id,
    stem: variant.stem,
    choices: variant.choices,
    student_answer: '',
    teacher_mark: '',
    correct_answer: variant.answer,
    explanation: '',
    flags: [],
  };
}

export function practiceHint(
  set: PracticeSet,
  id: string,
  wrongTries: number,
  cache: ExplainCache,
  settings?: ExtrasSettings,
): string | null {
  const variant = set.variants.find((item) => item.id === id);
  if (!variant) return null;
  return hintFor({ subject: set.subject, question: variantQuestion(variant), wrongTries, cache, settings });
}
