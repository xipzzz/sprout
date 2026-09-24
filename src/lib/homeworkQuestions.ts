/* Turn one worksheet's OCR into draft questions.
   Nothing here is a canned bank: stems, choices, and answers come from the text
   (or a parent edit). Possessive / have-has grammar only picks a correct choice
   when that word is already one of the OCR choices. */

import { correctHaveHasForSubject, normalizeHaveHasOcr } from './haveHasOcrRules';

export interface OcrWord {
  text: string;
  confidence: number;
}

export interface DraftQuestion {
  id: string;
  stem: string;
  choices: string[];
  /** Null when the sheet did not show a detectable correct choice. */
  correct: string | null;
  confidence: number;
}

export interface PlayableQuestion {
  prompt: string;
  choices: string[];
  correct: string;
}

export interface AcceptAssessment {
  garbage: boolean;
  lowConfidence: boolean;
  canAccept: boolean;
  reason: string;
}

export const MIN_ACCEPTED_TO_PLAY = 4;
export const LOW_CONFIDENCE_BELOW = 62;

const ADJECTIVE: Record<string, string> = {
  i: 'my',
  you: 'your',
  he: 'his',
  she: 'her',
  it: 'its',
  we: 'our',
  they: 'their',
};

const PRONOUN: Record<string, string> = {
  i: 'mine',
  you: 'yours',
  he: 'his',
  she: 'hers',
  it: 'its',
  we: 'ours',
  they: 'theirs',
};

export function canStartPractice(acceptedCount: number): boolean {
  return acceptedCount >= MIN_ACCEPTED_TO_PLAY;
}

export function isGarbageStem(stem: string): boolean {
  const text = stem.trim();
  const letters = text.match(/[A-Za-z]/g)?.length ?? 0;
  if (letters < 8) return true;
  if (letters / Math.max(1, text.length) < 0.4) return true;
  const marks = text.match(/\?/g)?.length ?? 0;
  if (marks >= 3 && letters < 12) return true;
  const tokens = text.toLowerCase().match(/[a-z']{2,}/g) ?? [];
  if (tokens.length < 2) return true;
  const weird = tokens.filter((word) => word.length >= 4 && !/[aeiouy]/.test(word));
  return tokens.length >= 3 && weird.length / tokens.length > 0.45;
}

export function isGarbageChoice(choice: string): boolean {
  return !/^[A-Za-z][A-Za-z'’-]{0,22}$/.test(choice.trim());
}

export function assessAcceptance(draft: {
  stem: string;
  choices: string[];
  correct: string | null;
  confidence: number;
  parentEdited: boolean;
}): AcceptAssessment {
  const choices = draft.choices.map((choice) => choice.trim()).filter(Boolean);
  const distinct = new Set(choices.map((choice) => choice.toLowerCase()));
  const garbage =
    isGarbageStem(draft.stem) ||
    choices.length < 2 ||
    distinct.size < 2 ||
    choices.some(isGarbageChoice);
  const lowConfidence = draft.confidence < LOW_CONFIDENCE_BELOW;
  const correctOk = Boolean(
    draft.correct && choices.some((choice) => choice.toLowerCase() === draft.correct!.trim().toLowerCase()),
  );

  let reason = 'Ready to accept.';
  if (garbage) reason = 'This draft looks garbled. Edit it or drop it.';
  else if (!correctOk) reason = 'Choose the correct answer before accepting.';
  else if (lowConfidence && !draft.parentEdited) reason = 'Low confidence — edit or drop. Accept stays locked.';

  return {
    garbage,
    lowConfidence,
    canAccept: !garbage && correctOk && (!lowConfidence || draft.parentEdited),
    reason,
  };
}

export function toPlayable(draft: {
  stem: string;
  choices: string[];
  correct: string | null;
}): PlayableQuestion | null {
  const choices = draft.choices.map((choice) => choice.trim()).filter(Boolean).slice(0, 4);
  const correct = draft.correct?.trim() ?? '';
  if (!correct || choices.length < 2) return null;
  const match = choices.find((choice) => choice.toLowerCase() === correct.toLowerCase());
  if (!match) return null;
  return { prompt: draft.stem.trim(), choices, correct: match };
}

export function parseWorksheetOcr(
  ocrText: string,
  words?: OcrWord[],
  pageConfidence = 50,
): DraftQuestion[] {
  const text = normalizeHaveHasOcr(ocrText || '');
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean);

  const blocks: { n: number; lines: string[] }[] = [];
  const keyRefs: { n: number; raw: string }[] = [];
  const preamble: string[] = [];
  let mode: 'body' | 'key' = 'body';

  for (const line of lines) {
    if (/^(answers?|answer\s*key|key)\b[:\s]*$/i.test(line)) {
      mode = 'key';
      continue;
    }
    if (mode === 'key') {
      const key = line.match(/^(\d{1,2})\s*[.)\-:]+\s*(.+)$/);
      if (key) keyRefs.push({ n: Number(key[1]), raw: key[2].trim() });
      continue;
    }
    const start = questionStart(line);
    if (start) {
      blocks.push({ n: start.n, lines: [line] });
      continue;
    }
    if (blocks.length === 0) preamble.push(line);
    else blocks[blocks.length - 1].lines.push(line);
  }

  const shared = extractChoices(preamble.join(' '));

  return blocks.flatMap((block, index) => {
    const raw = block.lines.join(' ');
    const local = extractChoices(raw.replace(/^\d{1,2}(?:\s*[.)]\s+|\s+)/, ''));
    const picked = local.length >= 2 ? local : shared;
    if (picked.length < 2) return [];
    const stem = cleanStem(block.lines[0], block.lines.slice(1));
    if (!stem) return [];
    const key = keyRefs.find((item) => item.n === block.n);
    const fromKey = key ? resolveKey(key.raw, picked) : null;
    const marked = picked.find((choice) => choice.marked)?.text ?? null;
    const correct = fromKey || marked || guessCorrect(stem, picked.map((choice) => choice.text));
    const confidence = confidenceForBlock(raw, words, pageConfidence);
    return [{
      id: `q${block.n || index + 1}`,
      stem,
      choices: picked.map((choice) => choice.text).slice(0, 4),
      correct,
      confidence,
    }];
  });
}

function questionStart(line: string): { n: number } | null {
  // OCR often drops the period after the question number: "6 They _____ two cats."
  const match = line.match(/^(\d{1,2})(?:\s*[.)]\s+|\s+)(\S.*)$/);
  if (!match) return null;
  const rest = match[2].trim();
  const words = rest.split(/\s+/);
  const singleChoice = words.length <= 2 && /^[A-Za-z'’*-]+$/.test(words[0] || '') && !/_/.test(rest);
  if (singleChoice && !/[?]/.test(rest)) return null;
  return { n: Number(match[1]) };
}

interface ParsedChoice {
  label: string;
  text: string;
  marked: boolean;
}

function extractChoices(chunk: string): ParsedChoice[] {
  const found: ParsedChoice[] = [];
  const labeled = /(?:^|\s)[([]?\s*([1-4A-Da-d])\s*[)\].:]\s*(\*?[A-Za-z][A-Za-z'’*-]{0,20}\*?)/g;
  for (const match of chunk.matchAll(labeled)) {
    pushChoice(found, match[1], match[2]);
  }
  if (found.length >= 2) return found;

  const slash = chunk.match(/\(([^)]{2,80})\)/);
  const slashSource = slash?.[1] && slash[1].includes('/') ? slash[1] : bareSlash(chunk);
  if (!slashSource) return found;
  for (const part of slashSource.split(/\s*\/\s*/)) {
    pushChoice(found, String(found.length + 1), part);
  }
  return found;
}

function bareSlash(chunk: string): string | null {
  const line = chunk.trim();
  if (!line.includes('/')) return null;
  const parts = line.split(/\s*\/\s*/);
  if (parts.length < 2 || parts.length > 4) return null;
  if (!parts.every((part) => /^\*?[A-Za-z][A-Za-z'’*-]{0,20}\*?$/.test(part.trim()))) return null;
  return line;
}

function pushChoice(found: ParsedChoice[], label: string, raw: string) {
  const marked = raw.includes('*');
  const text = raw.replace(/\*/g, '').replace(/^'+|'+$/g, '').trim();
  if (!text || isGarbageChoice(text)) return;
  if (found.some((choice) => choice.text.toLowerCase() === text.toLowerCase())) return;
  found.push({ label, text, marked });
}

function cleanStem(first: string, rest: string[]): string {
  const body = [first.replace(/^\d{1,2}(?:\s*[.)]\s+|\s+)/, ''), ...rest.filter((line) => extractChoices(line).length < 2)];
  let stem = body.join(' ');
  stem = stem.replace(/(?:^|\s)[([]?\s*[1-4A-Da-d]\s*[)\].:]\s*\*?[A-Za-z][A-Za-z'’*-]{0,20}\*?/g, ' ');
  stem = stem.replace(/\(([^)]+)\)/g, (full, inner: string) => {
    if (/^\s*(i|you|he|she|it|we|they)\s*$/i.test(inner)) return full;
    const parts = inner.split(/\s*\/\s*/).map((part) => part.trim());
    if (parts.length >= 2 && parts.every((part) => /^[A-Za-z'’-]+$/.test(part))) return '_____';
    return ' ';
  });
  stem = stem.replace(/\s+/g, ' ').trim();
  if (!/[?.!]$/.test(stem) && stem.length > 0) stem = `${stem}.`;
  return stem;
}

function resolveKey(raw: string, choices: ParsedChoice[]): string | null {
  const cleaned = raw.replace(/[()[\].]/g, '').trim();
  const word = cleaned.match(/^([A-Za-z][A-Za-z'’-]*)$/);
  if (word && word[1].length > 1) {
    return choices.find((choice) => choice.text.toLowerCase() === word[1].toLowerCase())?.text ?? null;
  }
  const label = cleaned.match(/^([1-4A-Da-d])$/i);
  if (!label) return null;
  const byLabel = choices.find((choice) => choice.label.toLowerCase() === label[1].toLowerCase());
  if (byLabel) return byLabel.text;
  const index = '1234'.includes(label[1])
    ? Number(label[1]) - 1
    : 'abcd'.indexOf(label[1].toLowerCase());
  return choices[index]?.text ?? null;
}

function guessCorrect(stem: string, choices: string[]): string | null {
  const lower = choices.map((choice) => choice.toLowerCase());
  if (lower.every((choice) => choice === 'have' || choice === 'has')) {
    const subject = stem.match(/\b(I|you|he|she|it|we|they|[A-Z][a-z]+)\b/);
    if (!subject) return null;
    const which = correctHaveHasForSubject(subject[1]);
    return choices.find((choice) => choice.toLowerCase() === which) ?? null;
  }
  const cue = stem.match(/\(\s*(I|you|he|she|it|we|they)\s*\)/i)?.[1]?.toLowerCase();
  if (!cue) return null;
  const form = blankForm(stem);
  const expected = form === 'pro' ? PRONOUN[cue] : ADJECTIVE[cue];
  if (!expected) return null;
  const hits = choices.filter((choice) => choice.toLowerCase() === expected);
  return hits.length === 1 ? hits[0] : null;
}

function blankForm(stem: string): 'adj' | 'pro' | 'unknown' {
  const match = stem.match(/_{2,}|\.{3,}|\[\s*\]|\(\s*\)/);
  if (!match || match.index == null) return 'unknown';
  const after = stem.slice(match.index + match[0].length).trim();
  if (/^[A-Za-z]{2,}/.test(after)) return 'adj';
  return 'pro';
}

function confidenceForBlock(blockText: string, words: OcrWord[] | undefined, pageConfidence: number): number {
  if (!words || words.length === 0) return clampConfidence(pageConfidence);
  const hay = blockText.toLowerCase();
  const matched = words.filter((word) => {
    const token = word.text.toLowerCase().replace(/[^a-z']/g, '');
    return token.length >= 2 && hay.includes(token);
  });
  if (matched.length < 2) return clampConfidence(pageConfidence);
  const average = matched.reduce((sum, word) => sum + word.confidence, 0) / matched.length;
  return clampConfidence(average);
}

function clampConfidence(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}
