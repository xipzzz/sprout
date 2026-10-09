/* Word-bank chips. Only the sentence's first word is lowercased, and only
   when it is a normal starter (not a proper noun, not "I"). Placing it
   first in the answer capitalizes it again. */

const STARTERS = new Set([
  'the', 'a', 'an', 'he', 'she', 'it', 'they', 'we', 'you', 'this', 'that',
  'these', 'those', 'my', 'his', 'her', 'their', 'our', 'there', 'what',
  'when', 'where', 'who', 'why', 'how', 'if', 'but', 'and', 'or', 'so',
]);

export function bankChip(token: string, sentenceStart: string): string {
  if (token !== sentenceStart) return token;
  if (token === 'I') return 'I';
  if (!STARTERS.has(token.toLowerCase())) return token;
  return token.toLowerCase();
}

export function placedChip(token: string, index: number, sentenceStart: string): string {
  const chip = bankChip(token, sentenceStart);
  if (index !== 0 || !chip) return chip;
  return chip.charAt(0).toUpperCase() + chip.slice(1);
}
