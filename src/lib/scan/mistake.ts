/* Sheets that ask the child to find a printed mistake must be copied
   exactly. The parent check screen flags those questions. */

const MISTAKE = /find and correct|correct the mistake|find the mistake|spot the mistake|fix the mistake|fix the error|there is a mistake|each sentence has (?:a|an) mistake|underline the mistake|circle the mistake|mistake in each/i;

export function needsExactCopy(instruction: string, prompt: string): boolean {
  return MISTAKE.test(`${instruction}\n${prompt}`);
}
