/* Shared types for a scanned worksheet page.
   Printed text only — answers are confirmed later by a parent. */

export const QUESTION_TYPES = ['fill_blank', 'multiple_choice', 'matching', 'rewrite'] as const;

export type QuestionType = (typeof QUESTION_TYPES)[number];

export interface ScannedQuestion {
  id: string;
  type: QuestionType;
  instruction: string;
  prompt: string;
  options: string[];
  left: string[];
  right: string[];
  emphasis: string[];
}
