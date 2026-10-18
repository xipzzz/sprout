/* Answers the parent picked on an explain card. Parent data only, kept for this session. */

import type { ParentQuestion, ParentScan } from '../types.ts';
import { hashText } from './hash.ts';

const picks = new Map<string, string>();

export function pickKey(subject: string, question: ParentQuestion): string {
  return hashText(`${subject}|${question.id}|${question.stem}|${question.choices.join('|')}`);
}

export function getPick(subject: string, question: ParentQuestion): string | undefined {
  return picks.get(pickKey(subject, question));
}

export function setPick(subject: string, question: ParentQuestion, answer: string): void {
  picks.set(pickKey(subject, question), answer);
}

export function clearPicks(): void {
  picks.clear();
}

/** Store the parent's answer on the scan so grading and notes use it, and drop the placeholder flag. */
export function applyParentPick(scan: ParentScan, questionId: string, answer: string): ParentScan {
  return {
    ...scan,
    questions: scan.questions.map((question) => {
      if (question.id !== questionId) return question;
      setPick(scan.subject, question, answer);
      return {
        ...question,
        correct_answer: answer,
        flags: question.flags.filter((flag) => !(flag.field === 'correct_answer' && flag.kind === 'reconstructed')),
      };
    }),
  };
}
