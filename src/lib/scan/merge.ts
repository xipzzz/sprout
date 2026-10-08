/* Join several scanned pages into one ordered list.
   Ids are rewritten so page 2's q1 cannot collide with page 1's q1. */

import type { ScannedQuestion } from './types';

export function mergeScannedPages(
  pages: { questions: ScannedQuestion[]; suggestions: Record<string, string> }[],
): { questions: ScannedQuestion[]; suggestions: Record<string, string> } {
  const questions: ScannedQuestion[] = [];
  const suggestions: Record<string, string> = {};
  let n = 1;
  for (const page of pages) {
    for (const question of page.questions) {
      const id = `q${n}`;
      n += 1;
      questions.push({ ...question, id });
      const suggestion = page.suggestions[question.id];
      if (suggestion) suggestions[id] = suggestion;
    }
  }
  return { questions, suggestions };
}
