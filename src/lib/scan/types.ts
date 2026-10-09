/* Shared types for a scanned worksheet page.
   Printed text only — answers are confirmed later by a parent. */

export const QUESTION_TYPES = ['fill_blank', 'multiple_choice', 'matching', 'rewrite'] as const;

export type QuestionType = (typeof QUESTION_TYPES)[number];

/** Where a rewrite's words come from. Set when the page is read, not guessed later. */
export type RewriteSource = 'slash' | 'free';

export interface ScannedQuestion {
  id: string;
  type: QuestionType;
  instruction: string;
  prompt: string;
  options: string[];
  left: string[];
  right: string[];
  emphasis: string[];
  /** Present after normalization. Slash lines are word order; everything else is free. */
  rewriteSource?: RewriteSource;
}
