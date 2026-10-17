/* Parent edit gate before play.
   Every question needs a parent-picked answer, a read-aloud keep, or a drop
   before practice opens. Picks live here and in the parent note, never in the child view. */

import { assertChildViewSafe, toChildView } from './childView.ts';
import { BLANK, EXPLAIN_FLAG_NOTE, explainPick } from './explain.ts';
import type { ChildView, ParentQuestion, ParentScan, ReviewStatus } from './types.ts';

export type QuestionReview =
  | { status: 'open' }
  | { status: 'picked'; answer: string }
  | { status: 'read_aloud' }
  | { status: 'dropped' };

export type ReviewState = Record<string, QuestionReview>;

export type Grade = 'nice' | 'almost';

export type Practice = {
  view: ChildView;
  grade: (questionId: string, choice: string) => Grade;
};

function readerAnswer(scan: ParentScan, question: ParentQuestion): string {
  if (scan.extraction === 'tesseract') return '';
  if (question.flags.some((flag) => flag.field === 'correct_answer')) return '';
  return question.choices.includes(question.correct_answer) ? question.correct_answer : '';
}

/** Tesseract answers always start open. A reader answer is kept only when it is a choice and was not guessed. */
export function initialReview(scan: ParentScan): ReviewState {
  const review: ReviewState = {};
  for (const question of scan.questions) {
    const answer = readerAnswer(scan, question);
    if (answer) review[question.id] = { status: 'picked', answer };
    else if (!question.choices.length && scan.extraction !== 'tesseract') review[question.id] = { status: 'read_aloud' };
    else review[question.id] = { status: 'open' };
  }
  return review;
}

function reviewFor(review: ReviewState, id: string): QuestionReview {
  return review[id] ?? { status: 'open' };
}

function isReady(question: ParentQuestion, entry: QuestionReview): boolean {
  if (entry.status === 'picked') return question.choices.includes(entry.answer);
  return entry.status === 'read_aloud' && question.choices.length === 0;
}

export function reviewProgress(scan: ParentScan, review: ReviewState) {
  const open: string[] = [];
  let ready = 0;
  let dropped = 0;
  for (const question of scan.questions) {
    const entry = reviewFor(review, question.id);
    if (entry.status === 'dropped') dropped += 1;
    else if (isReady(question, entry)) ready += 1;
    else open.push(question.id);
  }
  return { open, ready, dropped, unlocked: open.length === 0 && ready > 0 };
}

function withExplanation(question: ParentQuestion, answer: string): ParentQuestion {
  if (question.explanation && answer === question.correct_answer) return question;
  return {
    ...question,
    explanation: explainPick(question.stem, answer),
    flags: [
      ...question.flags.filter((flag) => flag.field !== 'explanation'),
      { field: 'explanation', kind: 'generated', note: EXPLAIN_FLAG_NOTE },
    ],
  };
}

/** The parent copy that is saved to the note: picks become the practice answer and get an explanation. */
export function parentCopy(scan: ParentScan, review: ReviewState): ParentScan {
  return {
    ...scan,
    questions: scan.questions.map((question) => {
      const entry = reviewFor(review, question.id);
      const kept = entry.status === 'dropped' || isReady(question, entry);
      const status: ReviewStatus = kept ? entry.status : 'open';
      const base = kept && entry.status === 'picked' ? withExplanation(question, entry.answer) : question;
      return {
        ...base,
        correct_answer: kept && entry.status === 'picked' ? entry.answer : '',
        review: status,
      };
    }),
  };
}

/** Null while the gate is locked. The answers are only reachable by calling grade. */
export function buildPractice(scan: ParentScan, review: ReviewState): Practice | null {
  if (!reviewProgress(scan, review).unlocked) return null;
  const kept = scan.questions.filter((question) => isReady(question, reviewFor(review, question.id)));
  const answers = new Map<string, string>();
  for (const question of kept) {
    const entry = reviewFor(review, question.id);
    if (entry.status === 'picked') answers.set(question.id, entry.answer);
  }
  const parent = parentCopy({ ...scan, questions: kept }, review);
  const view = toChildView(parent);
  assertChildViewSafe(parent, view);
  return {
    view,
    grade: (questionId, choice) => (answers.get(questionId) === choice ? 'nice' : 'almost'),
  };
}

export { BLANK };

/** Tappable words. Chinese has no spaces, so each Han character is its own word. */
export function stemWords(stem: string): string[] {
  return stem.match(/\p{Script=Han}[。，！？、；：]*|[^\s\p{Script=Han}]+/gu) ?? [];
}

function joinWords(words: string[]): string {
  return words
    .join(' ')
    .replace(/(?<=\p{Script=Han}[。，！？、；：]*)\s+|\s+(?=\p{Script=Han})/gu, '')
    .replace(new RegExp(`${BLANK}(?:\\s*${BLANK})+`, 'g'), BLANK);
}

export function blankBefore(stem: string, index: number): string {
  const words = stemWords(stem);
  words.splice(index, 0, BLANK);
  return joinWords(words);
}

export function blankInstead(stem: string, index: number): string {
  const words = stemWords(stem);
  const match = /^([^\p{L}\p{N}]*)(.*?)([^\p{L}\p{N}]*)$/u.exec(words[index] ?? '');
  words[index] = `${match?.[1] ?? ''}${BLANK}${match?.[3] ?? ''}`;
  return joinWords(words);
}
