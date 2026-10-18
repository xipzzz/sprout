/* Maths explain templates. Every step uses the numbers from the question. */

import { opWord, parseMath, solve, type MathProblem, type Op, type Worked } from './arithmetic.ts';
import { EXTRAS_DEFAULTS, wordingFor, type Wording, type YearGroup } from './settings.ts';

export type MathsResult = {
  template: string;
  problem: MathProblem;
  worked: Worked;
  steps: string[];
  sayAloud: string;
  followUp: string;
};

const PLACES = ['ones', 'tens', 'hundreds', 'thousands', 'ten thousands', 'hundred thousands'];

function digit(n: number, place: number) {
  return Math.floor(n / 10 ** place) % 10;
}

function length(n: number) {
  return String(n).length;
}

function addSteps(a: number, b: number): string[] {
  const sum = a + b;
  if (a < 10 && b < 10) {
    return [`Start at ${Math.max(a, b)} and count on ${Math.min(a, b)}.`, `${a} + ${b} = ${sum}.`];
  }
  const places = Math.max(length(a), length(b));
  const lines: string[] = [];
  let carry = 0;
  for (let i = 0; i < places; i += 1) {
    const da = digit(a, i);
    const db = digit(b, i);
    const total = da + db + carry;
    let line = `Add the ${PLACES[i]}: ${da} + ${db}${carry ? ' + 1 carried' : ''} = ${total}.`;
    if (i < places - 1) line += total >= 10 ? ` Write ${total % 10} and carry 1.` : ` Write ${total}.`;
    carry = total >= 10 ? 1 : 0;
    lines.push(line);
  }
  lines.push(`So ${a} + ${b} = ${sum}.`);
  return lines;
}

function subtractSteps(a: number, b: number): string[] {
  const result = a - b;
  if (a < 20 && b < 10) {
    return [`Start at ${a} and count back ${b}.`, `${a} - ${b} = ${result}.`];
  }
  const places = length(a);
  const lines: string[] = [];
  let lent = 0;
  for (let i = 0; i < places; i += 1) {
    const top = digit(a, i);
    const low = digit(b, i);
    const left = top - lent;
    const name = PLACES[i];
    if (i === places - 1 && left === 0 && low === 0) break;
    if (left < low) {
      const topText = lent ? `${top}, after lending 1,` : `${top}`;
      lines.push(
        `Take away the ${name}: ${topText} is less than ${low}, so borrow 1 from the ${PLACES[i + 1]}. ${left + 10} - ${low} = ${left + 10 - low}.`,
      );
      lent = 1;
    } else {
      lines.push(
        lent
          ? `Take away the ${name}: ${top} becomes ${left} after lending 1. ${left} - ${low} = ${left - low}.`
          : `Take away the ${name}: ${top} - ${low} = ${top - low}.`,
      );
      lent = 0;
    }
  }
  lines.push(`So ${a} - ${b} = ${result}.`);
  return lines;
}

function placeParts(n: number): number[] {
  const parts: number[] = [];
  const text = String(n);
  for (let i = 0; i < text.length; i += 1) {
    const value = Number(text[i]) * 10 ** (text.length - 1 - i);
    if (value) parts.push(value);
  }
  return parts;
}

function timesSteps(a: number, b: number): string[] {
  const result = a * b;
  if (a < 10 && b < 10) return [`Count in ${a}s, ${b} times.`, `${a} x ${b} = ${result}.`];
  const [keep, split] = b < 10 ? [b, a] : [a, b];
  const parts = placeParts(split);
  if (parts.length < 2) return [`${a} x ${b} = ${result}.`];
  const products = parts.map((part) => part * keep);
  return [
    `Split ${split} into ${parts.join(' and ')}.`,
    ...parts.map((part, i) => `${part} x ${keep} = ${products[i]}.`),
    `Add the parts: ${products.join(' + ')} = ${result}.`,
    `So ${a} x ${b} = ${result}.`,
  ];
}

function shareSteps(a: number, b: number, worked: Worked): string[] {
  const q = worked.value;
  if (!worked.remainder) {
    return [`Ask: how many ${b}s make ${a}?`, `${q} x ${b} = ${a}.`, `So ${a} ÷ ${b} = ${q}.`];
  }
  return [
    `Ask: how many ${b}s fit into ${a}?`,
    `${q} x ${b} = ${q * b}. One more ${b} would make ${(q + 1) * b}, which is too many.`,
    `${a} - ${q * b} = ${worked.remainder} left over.`,
    `So ${a} ÷ ${b} = ${q} R ${worked.remainder}.`,
  ];
}

function opSteps(a: number, op: Op, b: number, worked: Worked): string[] {
  if (op === '+') return addSteps(a, b);
  if (op === '-') return subtractSteps(a, b);
  if (op === 'x') return timesSteps(a, b);
  return shareSteps(a, b, worked);
}

const OP_TEMPLATE: Record<Op, string> = { '+': 'maths-add', '-': 'maths-take-away', x: 'maths-times', '÷': 'maths-share' };

const SAY_ALOUD: Record<string, Record<Wording, string>> = {
  'maths-add': {
    short: 'Add the ones first. Then add the tens.',
    full: 'Let us add the ones first, then the tens. Tell me when you need to carry.',
  },
  'maths-take-away': {
    short: 'Start with the ones. Borrow a ten if you need to.',
    full: 'Start with the ones. If the top number is smaller, we borrow a ten.',
  },
  'maths-times': {
    short: 'Break the big number into parts. Times each part.',
    full: 'Let us break the big number into tens and ones, then times each part.',
  },
  'maths-share': {
    short: 'Make equal groups. Count how many.',
    full: 'How many equal groups can we make? Let us count in jumps.',
  },
  'maths-mixed': {
    short: 'Times and share first. Then add and take away.',
    full: 'We do times and share first, then add and take away from left to right.',
  },
  'maths-left-to-right': {
    short: 'Go from left to right. One step at a time.',
    full: 'Let us work from left to right, one step at a time.',
  },
  'maths-missing': {
    short: 'What number fills the gap?',
    full: 'This is a puzzle. What number fills the gap so both sides match?',
  },
  'maths-word': {
    short: 'Read it together. Find the two numbers.',
    full: 'Let us read it together and find the two numbers. What is the question asking?',
  },
};

const MEANS: Record<Op, string> = {
  '+': 'add the numbers',
  '-': 'take away',
  x: 'times, because there are equal groups',
  '÷': 'share into equal groups',
};

function followUp(template: string, problem: MathProblem, wording: Wording): string {
  const short = wording === 'short';
  const [a, b] = problem.numbers;
  if (template === 'maths-add') {
    const [big, small] = [Math.max(a, b), Math.min(a, b)];
    if (a < 10 && b < 10) return short ? `Start at ${big}. Count on ${small}.` : `Start at ${big}. Count on ${small} more. Where do you land?`;
    const [da, db] = [digit(a, 0), digit(b, 0)];
    return short ? `What is ${da} + ${db}?` : `What do the ones make, ${da} + ${db}? Do you need to carry?`;
  }
  if (template === 'maths-take-away') {
    if (a < 20 && b < 10) return short ? `Start at ${a}. Count back ${b}.` : `Start at ${a} and count back ${b}. Where do you land?`;
    const [da, db] = [digit(a, 0), digit(b, 0)];
    return short ? `Look at the ones. Is ${da} less than ${db}?` : `Look at the ones, ${da} take away ${db}. Do you need to borrow first?`;
  }
  if (template === 'maths-times') {
    if (a < 10 && b < 10) return short ? `Count in ${a}s. Do it ${b} times.` : `Can you count in ${a}s, ${b} times?`;
    const split = b < 10 ? a : b;
    return short ? `Split ${split} into tens and ones.` : `Can you split ${split} into tens and ones first?`;
  }
  if (template === 'maths-share') return short ? `How many ${b}s make ${a}?` : `How many groups of ${b} can you make from ${a}?`;
  if (template === 'maths-mixed' || template === 'maths-left-to-right') {
    return short ? 'What do you work out first?' : 'Which part of the sum do you work out first?';
  }
  if (template === 'maths-missing' && problem.kind === 'missing') {
    if (problem.op === '+' && problem.gap === 1) return short ? `${a} and what make ${b}?` : `What do you add to ${a} to make ${b}?`;
    return short ? 'Try the opposite sum.' : 'Which number makes both sides match? Try the opposite sum.';
  }
  if (problem.kind === 'word') {
    return short
      ? `Find the word "${problem.cue}". What does it tell you to do?`
      : `Find the word "${problem.cue}". Does it tell you to add, take away, times or share?`;
  }
  return 'Which numbers do you need, and what do you do with them?';
}

function gapSentence(problem: Extract<MathProblem, { kind: 'missing' }>) {
  const [first, second] = problem.numbers;
  return problem.gap === 0 ? `___ ${problem.op} ${first} = ${second}` : `${first} ${problem.op} ___ = ${second}`;
}

export function mathsFor(stem: string, year: YearGroup = EXTRAS_DEFAULTS.year): MathsResult | null {
  const parsed = parseMath(stem);
  if (!parsed) return null;
  const { problem } = parsed;
  const worked = solve(problem);
  if (!worked) return null;
  let template: string;
  let steps: string[];
  if (problem.kind === 'expression' && problem.ops.length === 1) {
    const [a, b] = problem.numbers;
    template = OP_TEMPLATE[problem.ops[0]];
    steps = opSteps(a, problem.ops[0], b, worked);
  } else if (problem.kind === 'expression') {
    template = 'maths-mixed';
    const mixed = problem.ops.some((op) => op === 'x' || op === '÷') && problem.ops.some((op) => op === '+' || op === '-');
    steps = [
      mixed ? 'Do times and share first, then add and take away from left to right.' : 'Work from left to right.',
      ...worked.steps.map((step) => `${step.a} ${step.op} ${step.b} = ${step.result}.`),
      `So the answer is ${worked.answer}.`,
    ];
    if (!mixed) template = 'maths-left-to-right';
  } else if (problem.kind === 'missing') {
    template = 'maths-missing';
    const step = worked.steps[0];
    steps = [
      `Read it as a puzzle: ${gapSentence(problem)}.`,
      `Do the opposite sum: ${step.a} ${step.op} ${step.b} = ${step.result}.`,
      `Check: ${gapSentence(problem).replace('___', String(worked.value))}.`,
    ];
  } else {
    template = 'maths-word';
    const step = worked.steps[0];
    steps = [
      `Find the numbers: ${problem.numbers[0]} and ${problem.numbers[1]}.`,
      `The word "${problem.cue}" means ${MEANS[problem.op]}.`,
      ...opSteps(step.a, step.op, step.b, worked),
    ];
  }
  const wording = wordingFor(year);
  return { template, problem, worked, steps, sayAloud: SAY_ALOUD[template][wording], followUp: followUp(template, problem, wording) };
}

/** Compare what the child wrote with the worked answer. Parent view only. */
export function causeOfError(result: MathsResult, studentAnswer: string): string {
  const written = studentAnswer.trim();
  if (!written || !/^\d+$/.test(written)) return '';
  const wrote = Number(written);
  const { worked, problem } = result;
  if (worked.remainder === 0 && wrote === worked.value) return `Your child wrote ${wrote}, which matches.`;
  const gap = Math.abs(wrote - worked.value);
  const plainOps = problem.kind === 'expression' ? problem.ops : [problem.op];
  if ([10, 100, 1000].includes(gap) && plainOps.every((op) => op === '+' || op === '-')) {
    return `Your child wrote ${wrote}. That is ${gap} ${wrote > worked.value ? 'more' : 'less'}, so a carry or a borrow may have slipped.`;
  }
  if (problem.numbers.length === 2) {
    const [a, b] = problem.numbers;
    const others: Array<[Op, number]> = [
      ['+', a + b],
      ['-', Math.abs(a - b)],
      ['x', a * b],
    ];
    const op = plainOps[0];
    const swap = others.find(([other, value]) => other !== op && value === wrote);
    if (swap) return `Your child wrote ${wrote}. That is what you get if you ${opWord(swap[0])}, so the sign may have been misread.`;
  }
  return `Your child wrote ${wrote}. Go through the steps together to find where it changed.`;
}
