/* Try first, then a hint. The child only ever gets the follow-up question,
   and only after one wrong try. A hint that would show the answer is swapped for a plain one. */

import type { ParentQuestion, ParentScan } from '../types.ts';
import { explainNow, type ExplainCache } from './explain.ts';
import { grammarFor } from './grammar.ts';
import { mathsFor } from './mathsTemplates.ts';
import { getPick } from './picks.ts';
import { EXTRAS_DEFAULTS, type ExtrasSettings } from './settings.ts';

export const PLAIN_HINT = 'Read the question again slowly. Which words help you?';

function escape(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** True when `answer` shows up in `text` as a whole word or a whole number. */
export function containsAnswer(text: string, answer: string): boolean {
  const forms = new Set<string>();
  const plain = answer.trim();
  if (plain) forms.add(plain);
  const number = /\d+(\s*R\s*\d+)?/i.exec(plain)?.[0];
  if (number) forms.add(number);
  for (const form of forms) {
    const edge = /^\d/.test(form) ? String.raw`\d` : '[A-Za-z]';
    const pattern = form.split(/\s+/).map(escape).join(String.raw`\s*`);
    const re = new RegExp(`(?<!${edge})${pattern}(?!${edge})`, 'i');
    if (re.test(text)) return true;
  }
  return false;
}

export function safeHint(text: string, answers: string[]): string | null {
  const blocked = answers.map((answer) => answer.trim()).filter(Boolean);
  for (const candidate of [text, PLAIN_HINT]) {
    if (candidate && !blocked.some((answer) => containsAnswer(candidate, answer))) return candidate;
  }
  return null;
}

/** Every answer-like value we know for a question, so none of them can slip into a hint. */
export function answersFor(subject: string, question: ParentQuestion, extra: string[] = []): string[] {
  const values = [question.correct_answer, getPick(subject, question) ?? '', ...extra];
  const maths = mathsFor(question.stem);
  if (maths) values.push(maths.worked.answer);
  const grammar = grammarFor(question.stem, question.choices);
  if (grammar?.ruleAnswer) values.push(grammar.ruleAnswer);
  return values.filter(Boolean);
}

export type HintRequest = {
  subject: string;
  question: ParentQuestion;
  wrongTries: number;
  cache: ExplainCache;
  settings?: ExtrasSettings;
};

export function hintFor({ subject, question, wrongTries, cache, settings = EXTRAS_DEFAULTS }: HintRequest): string | null {
  if (!settings.hints || wrongTries < 1) return null;
  const pick = getPick(subject, question);
  const card = explainNow({ subject, question, pick, year: settings.year }, cache);
  return safeHint(card.followUp, answersFor(subject, question, [card.answer]));
}

export function scanHint(
  scan: ParentScan,
  questionId: string,
  wrongTries: number,
  cache: ExplainCache,
  settings?: ExtrasSettings,
): string | null {
  const question = scan.questions.find((item) => item.id === questionId);
  if (!question) return null;
  return hintFor({ subject: scan.subject, question, wrongTries, cache, settings });
}
