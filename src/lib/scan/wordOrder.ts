/* Section instructions stay instructions. A slash line is a word-order
   rewrite, kept exactly as printed. No worksheet images. */

import type { RewriteSource, ScannedQuestion } from './types';

const INSTRUCTION_LINES = [
  'put the words in the correct order',
  'put the words in order',
  'choose the correct answer',
  'choose the right answer',
  'fill in the blanks',
  'fill in the blank',
  'fill in the missing words',
  'complete the sentences',
  'complete the sentence',
  'rewrite the sentences',
  'rewrite the sentence',
  'unscramble the words',
  'arrange the words',
  'order the words',
];

/** Strip a leading "B)" or "6." so the stem can be compared. */
export function instructionCore(prompt: string): string {
  return prompt
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/^(?:[A-Za-z]|\d{1,2})\s*[).:-]\s*/, '')
    .replace(/[.?!]+$/, '')
    .trim()
    .toLowerCase();
}

/** True when the stem is only a section instruction, not an item. */
export function isInstructionStem(prompt: string): boolean {
  if (prompt.includes('___')) return false;
  if (wordOrderTiles(prompt)) return false;
  const core = instructionCore(prompt);
  if (!core) return false;
  return INSTRUCTION_LINES.includes(core);
}

/** Words from a printed slash line, punctuation included. Null if it is not one. */
export function wordOrderTiles(prompt: string): string[] | null {
  const trimmed = prompt.trim();
  if (!trimmed.includes('/') || trimmed.includes('___')) return null;
  const parts = trimmed.split(/\s*\/\s*/).map((part) => part.trim()).filter(Boolean);
  if (parts.length < 3) return null;
  if (parts.some((part) => part.split(/\s+/).length > 2)) return null;
  return parts;
}

function bare(token: string): string {
  return token.replace(/^[^A-Za-z0-9']+|[^A-Za-z0-9']+$/g, '').toLowerCase();
}

/** Parent-facing name. Only a stored slash source. The type stays `rewrite`. */
export function wordOrderTypeLabel(question: { rewriteSource?: RewriteSource }): 'Word order' | null {
  return question.rewriteSource === 'slash' ? 'Word order' : null;
}

/** Classify once, from an explicit flag when we have one. */
export function storedRewrite(question: {
  prompt: string;
  rewriteSource?: RewriteSource;
}): { rewriteSource: RewriteSource; printedTiles: string[] } {
  if (question.rewriteSource === 'free') return { rewriteSource: 'free', printedTiles: [] };
  if (question.rewriteSource === 'slash') {
    return { rewriteSource: 'slash', printedTiles: wordOrderTiles(question.prompt) ?? [] };
  }
  const tiles = wordOrderTiles(question.prompt);
  if (tiles) return { rewriteSource: 'slash', printedTiles: tiles };
  return { rewriteSource: 'free', printedTiles: [] };
}

/**
 * True when the sentence is exactly the printed tiles, once each.
 * Comparison is case-insensitive. Punctuation stays on the tile, so "Spain."
 * matches "spain." and does not match "Spain".
 */
export function usesOnlyPrintedWords(tiles: string[], sentence: string): boolean {
  const words = sentence.trim() ? sentence.trim().split(/\s+/) : [];
  if (words.length !== tiles.length) return false;
  const pool = tiles.map((tile) => tile.toLowerCase());
  for (const word of words) {
    const index = pool.indexOf(word.toLowerCase());
    if (index < 0) return false;
    pool.splice(index, 1);
  }
  return true;
}

/** Printed tiles in the order of the answer sentence. The tile text stays as printed. */
export function orderPrintedTiles(tiles: string[], answer: string): string[] | null {
  const words = answer.trim().split(/\s+/).filter(Boolean);
  if (words.length !== tiles.length) return null;
  const pool = [...tiles];
  const ordered: string[] = [];
  for (const word of words) {
    const key = bare(word);
    const index = pool.findIndex((tile) => bare(tile) === key || tile.toLowerCase() === word.toLowerCase());
    if (index < 0) return null;
    ordered.push(pool.splice(index, 1)[0]);
  }
  return ordered;
}

/** Drop an instruction-only stem. A slash line becomes a rewrite and loses fake choices. */
export function normalizeScannedQuestion(question: ScannedQuestion): ScannedQuestion | null {
  if (isInstructionStem(question.prompt)) return null;
  const stored = storedRewrite(question);
  if (stored.rewriteSource === 'slash') {
    return {
      ...question,
      type: 'rewrite',
      options: [],
      left: [],
      right: [],
      rewriteSource: 'slash',
    };
  }
  return {
    ...question,
    rewriteSource: question.type === 'rewrite' ? 'free' : question.rewriteSource,
  };
}

export function showsPrintedChoices(question: { type: string; options: string[]; rewriteSource?: RewriteSource }): boolean {
  if (question.type === 'rewrite' || question.type === 'matching' || question.rewriteSource === 'slash') return false;
  return question.options.length > 0 || question.type === 'multiple_choice' || question.type === 'fill_blank';
}
