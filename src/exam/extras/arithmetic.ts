/* Read a plain maths question from its stem and work it out locally.
   Handles sums like 94 + 38, 180 - 94 - 38, 23 x 4, 56 ÷ 8, missing numbers
   like 9 + ___ = 15, and two-number word problems with a clear cue word. */

export type Op = '+' | '-' | 'x' | '÷';

export type NumberSlot = { start: number; end: number; value: number };

export type MathProblem =
  | { kind: 'expression'; numbers: number[]; ops: Op[] }
  | { kind: 'missing'; numbers: [number, number]; op: Op; gap: 0 | 1 }
  | { kind: 'word'; numbers: [number, number]; op: Op; cue: string };

export type ParsedMath = {
  problem: MathProblem;
  /** Where each problem number sits in the stem, in the same order as `problem.numbers`. */
  slots: NumberSlot[];
};

export type OpStep = { a: number; op: Op; b: number; result: number };

export type Worked = {
  value: number;
  remainder: number;
  answer: string;
  steps: OpStep[];
};

const GAP = String.raw`(?:_{2,}|\?|□)`;
const NUM = String.raw`\d+`;
const SIDE = `(${NUM}|${GAP})`;
const MISSING_RE = new RegExp(`${SIDE}\\s*([+\\-x÷])\\s*${SIDE}\\s*=\\s*${SIDE}`);
const EXPRESSION_RE = /\d+(?:\s*[+\-x÷]\s*\d+)+/;

/** Same length as the input so slot positions still point into the original stem. */
function normalise(stem: string): string {
  return stem.replace(/[×*]/g, 'x').replace(/[−–]/g, '-').replace(/\//g, '÷');
}

function isGap(text: string) {
  return new RegExp(`^${GAP}$`).test(text);
}

function apply(a: number, op: Op, b: number): number | null {
  if (op === '+') return a + b;
  if (op === '-') return a - b;
  if (op === 'x') return a * b;
  if (b === 0 || a % b !== 0) return null;
  return a / b;
}

function numberSlots(text: string, offset = 0): NumberSlot[] {
  return [...text.matchAll(/\d+/g)].map((match) => ({
    start: offset + (match.index ?? 0),
    end: offset + (match.index ?? 0) + match[0].length,
    value: Number(match[0]),
  }));
}

const DIVIDE_CUES = ['shared equally', 'share equally', 'equally', 'divided', 'how many groups'];
const MULTIPLY_CUES = ['each'];
const SUBTRACT_CUES = [
  'how many more', 'how many fewer', 'how much more', 'difference', 'left', 'remain', 'gave away',
  'gives away', 'ate', 'eats', 'lost', 'loses', 'spent', 'spends', 'fewer',
];
const ADD_CUES = ['altogether', 'in all', 'in total', 'total', 'sum', 'together', 'more'];

function hasCue(text: string, cue: string) {
  return new RegExp(`\\b${cue.replace(/ /g, '\\s+')}\\b`, 'i').test(text);
}

function wordOp(stem: string): { op: Op; cue: string } | null {
  for (const cue of DIVIDE_CUES) if (hasCue(stem, cue)) return { op: '÷', cue };
  for (const cue of MULTIPLY_CUES) {
    if (hasCue(stem, cue) && /\b(altogether|in all|in total|total)\b/i.test(stem)) return { op: 'x', cue };
  }
  for (const cue of SUBTRACT_CUES) if (hasCue(stem, cue)) return { op: '-', cue };
  for (const cue of ADD_CUES) if (hasCue(stem, cue)) return { op: '+', cue };
  return null;
}

export function parseMath(stem: string): ParsedMath | null {
  const text = normalise(stem);

  const missing = MISSING_RE.exec(text);
  if (missing) {
    const sides = [missing[1], missing[3], missing[4]];
    const op = missing[2] as Op;
    const gaps = sides.map(isGap);
    const gapCount = gaps.filter(Boolean).length;
    if (gapCount === 1) {
      const slots = numberSlots(missing[0], missing.index);
      if (gaps[2]) {
        return { problem: { kind: 'expression', numbers: [slots[0].value, slots[1].value], ops: [op] }, slots };
      }
      return {
        problem: { kind: 'missing', numbers: [slots[0].value, slots[1].value], op, gap: gaps[0] ? 0 : 1 },
        slots,
      };
    }
  }

  const expression = EXPRESSION_RE.exec(text);
  if (expression) {
    const tokens = expression[0].match(/\d+|[+\-x÷]/g) ?? [];
    const numbers: number[] = [];
    const ops: Op[] = [];
    for (const token of tokens) {
      if (/^\d+$/.test(token)) numbers.push(Number(token));
      else ops.push(token as Op);
    }
    return { problem: { kind: 'expression', numbers, ops }, slots: numberSlots(expression[0], expression.index) };
  }

  const slots = numberSlots(text);
  if (slots.length !== 2) return null;
  if (!/\?|\bhow (many|much)\b|\bfind\b|\bwhat\b/i.test(text)) return null;
  const cue = wordOp(text);
  if (!cue) return null;
  return {
    problem: { kind: 'word', numbers: [slots[0].value, slots[1].value], op: cue.op, cue: cue.cue },
    slots,
  };
}

/** Work an expression with times and share first, then add and take away, left to right. */
export function evaluate(numbers: number[], ops: Op[]): Worked | null {
  if (numbers.length !== ops.length + 1 || numbers.length < 2) return null;
  if (numbers.length === 2 && ops[0] === '÷') {
    const [a, b] = numbers;
    if (b === 0) return null;
    const value = Math.floor(a / b);
    const remainder = a % b;
    return {
      value,
      remainder,
      answer: remainder ? `${value} R ${remainder}` : String(value),
      steps: [{ a, op: '÷', b, result: value }],
    };
  }
  const values = [...numbers];
  const pending = [...ops];
  const steps: OpStep[] = [];
  for (const pass of [['x', '÷'], ['+', '-']] as Op[][]) {
    let index = pending.findIndex((op) => pass.includes(op));
    while (index >= 0) {
      const a = values[index];
      const b = values[index + 1];
      const op = pending[index];
      const result = apply(a, op, b);
      if (result === null || result < 0) return null;
      steps.push({ a, op, b, result });
      values.splice(index, 2, result);
      pending.splice(index, 1);
      index = pending.findIndex((item) => pass.includes(item));
    }
  }
  return { value: values[0], remainder: 0, answer: String(values[0]), steps };
}

/** The full sum the question stands for, with the gap filled. */
export function solve(problem: MathProblem): Worked | null {
  if (problem.kind === 'expression') return evaluate(problem.numbers, problem.ops);
  if (problem.kind === 'word') {
    const [first, second] = problem.numbers;
    const ordered = problem.op === '-' || problem.op === '÷' ? [Math.max(first, second), Math.min(first, second)] : [first, second];
    const worked = evaluate(ordered, [problem.op]);
    if (!worked || worked.remainder) return null;
    return worked;
  }
  const [known1, known2] = problem.numbers;
  const { op, gap } = problem;
  let value: number | null;
  let step: OpStep | null;
  if (gap === 0) {
    const [b, c] = [known1, known2];
    if (op === '+') value = c - b;
    else if (op === '-') value = c + b;
    else if (op === 'x') value = b && c % b === 0 ? c / b : null;
    else value = c * b;
    if (value === null) return null;
    step = { a: c, op: op === '+' ? '-' : op === '-' ? '+' : op === 'x' ? '÷' : 'x', b, result: value };
  } else {
    const [a, c] = [known1, known2];
    if (op === '+') value = c - a;
    else if (op === '-') value = a - c;
    else if (op === 'x') value = a && c % a === 0 ? c / a : null;
    else value = c && a % c === 0 ? a / c : null;
    if (value === null) return null;
    if (op === '+') step = { a: c, op: '-', b: a, result: value };
    else if (op === '-') step = { a, op: '-', b: c, result: value };
    else if (op === 'x') step = { a: c, op: '÷', b: a, result: value };
    else step = { a, op: '÷', b: c, result: value };
  }
  if (value < 0 || !Number.isInteger(value)) return null;
  return { value, remainder: 0, answer: String(value), steps: [step] };
}

/** Put new numbers into the stem at the same places as the old ones. */
export function fillStem(stem: string, slots: NumberSlot[], numbers: number[]): string {
  let out = stem;
  const ordered = slots.map((slot, index) => ({ slot, value: numbers[index] })).sort((x, y) => y.slot.start - x.slot.start);
  for (const { slot, value } of ordered) {
    out = out.slice(0, slot.start) + String(value) + out.slice(slot.end);
  }
  return out;
}

export function opWord(op: Op): string {
  return { '+': 'add', '-': 'take away', x: 'times', '÷': 'share' }[op];
}

/** Read "132", "3 R 2" or "3r2" as the same answer. */
export function normaliseAnswer(text: string): string {
  const plain = text.trim().toLowerCase().replace(/\s+/g, ' ').replace(/[°.]$/, '');
  const remainder = /^(\d+)\s*r\s*(\d+)$/.exec(plain);
  return remainder ? `${remainder[1]} r ${remainder[2]}` : plain;
}
