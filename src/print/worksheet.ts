/* Data for the printed pages.
   The child worksheet is built from the child view only (stem and choices).
   The answer key is built from the parent scan and only while the parent
   area is open, so it cannot be made from the child side. */

import type { ChildView, ParentScan } from '../exam/types.ts';
import { isParentUnlocked } from '../parent/pin.ts';
import { pickWording, type YearGroup, type YearSettings } from '../parent/yearGroup.ts';

export type WorksheetQuestion = {
  number: number;
  stem: string;
  choices: string[];
  writeLines: number;
};

export type ChildWorksheet = {
  title: string;
  year: YearGroup;
  instructions: string;
  questions: WorksheetQuestion[];
};

export type AnswerKeyRow = {
  number: number;
  stem: string;
  answer: string;
  childWrote: string;
  mark: string;
};

const CHILD_VIEW_KEYS = 'questions,subject';
const CHILD_QUESTION_KEYS = 'choices,id,stem';

/** Throws unless the value is exactly the child shape, with no extra fields. */
export function assertChildShape(view: ChildView): void {
  if (Object.keys(view).sort().join(',') !== CHILD_VIEW_KEYS) {
    throw new Error('Child worksheet refused data that is not the child view.');
  }
  for (const question of view.questions) {
    if (Object.keys(question).sort().join(',') !== CHILD_QUESTION_KEYS) {
      throw new Error('Child worksheet refused a question that is not the child shape.');
    }
  }
}

export function subjectTitle(subject: string): string {
  const clean = subject && subject !== 'auto' ? subject : 'homework';
  return `${clean.charAt(0).toUpperCase()}${clean.slice(1)} practice`;
}

export function buildChildWorksheet(view: ChildView, settings: YearSettings): ChildWorksheet {
  assertChildShape(view);
  return {
    title: subjectTitle(view.subject),
    year: settings.year,
    instructions: pickWording(
      {
        1: 'Circle one. Or write on the line.',
        2: 'Circle one answer, or write it on the line.',
        3: 'Circle the best answer, or write your answer on the line.',
        4: 'Read each question carefully. Circle the best answer, or write your answer on the line.',
      },
      settings,
    ),
    questions: view.questions.map((question, index) => ({
      number: index + 1,
      stem: question.stem,
      choices: [...question.choices],
      writeLines: question.choices.length ? 0 : 2,
    })),
  };
}

export function buildAnswerKey(scan: ParentScan): AnswerKeyRow[] {
  if (!isParentUnlocked()) {
    throw new Error('The answer key only opens from the parent page.');
  }
  return scan.questions.map((question, index) => ({
    number: index + 1,
    stem: question.stem,
    answer: question.correct_answer || 'Not known',
    childWrote: question.student_answer || 'Blank',
    mark: question.teacher_mark || 'None',
  }));
}
