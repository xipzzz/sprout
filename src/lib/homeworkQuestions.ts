/* Turn one worksheet's OCR into draft questions.
   Nothing here is a canned bank: stems, choices, and answers come from the text
   (or a parent edit). If OCR drops a fill-in underline, the blank is restored.
   Possessive / have-has grammar only picks a correct choice when that word is
   already one of the OCR choices. */

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

  const preambleText = preamble.join(' ');
  const shared = extractChoices(preambleText);

  return blocks.flatMap((block, index) => {
    const raw = block.lines.join(' ');
    const local = extractChoices(raw.replace(/^\d{1,2}(?:\s*[.)]\s+|\s+)/, ''));
    const picked = local.length >= 2 ? local : shared;
    if (picked.length < 2) return [];
    const choiceText = picked.map((choice) => choice.text);
    const stem = restoreFillBlank(cleanStem(block.lines[0], block.lines.slice(1)), choiceText, preambleText);
    if (!stem) return [];
    const key = keyRefs.find((item) => item.n === block.n);
    const fromKey = key ? resolveKey(key.raw, picked) : null;
    const marked = picked.find((choice) => choice.marked)?.text ?? null;
    const correct = fromKey || marked || guessCorrect(stem, choiceText, preambleText);
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
  return finishStem(stem);
}

const BLANK = '_____';

const POSSESSIVE_WORDS = new Set([
  'my', 'your', 'his', 'her', 'its', 'our', 'their',
  'mine', 'yours', 'hers', 'ours', 'theirs', "it's",
]);

const CLOSED = new Set([
  'a', 'an', 'the', 'my', 'your', 'his', 'her', 'its', 'our', 'their',
  'mine', 'yours', 'hers', 'ours', 'theirs',
  'this', 'that', 'these', 'those', 'some', 'any', 'no', 'every', 'each',
  'me', 'you', 'him', 'us', 'them', 'it', 'she', 'he', 'we', 'they', 'i',
  'nice', 'good', 'bad', 'big', 'small', 'red', 'blue', 'green', 'yellow',
  'happy', 'sad', 'kind', 'old', 'new', 'tall', 'short', 'long', 'ready',
  'here', 'there', 'fine', 'ok', 'okay', 'great', 'fun', 'easy', 'hard',
  'right', 'wrong', 'true', 'false', 'very', 'so', 'too', 'not', 'also',
  'just', 'still', 'already', 'pretty', 'really', 'quite', 'more', 'most',
  'little', 'much', 'many', 'few', 'hot', 'cold', 'warm', 'fast', 'slow',
  'young', 'clean', 'dirty', 'open', 'closed', 'full', 'empty', 'late',
  'early', 'busy', 'free', 'sick', 'well', 'angry', 'afraid', 'tired',
  'hungry', 'thirsty', 'beautiful', 'cute', 'smart', 'black', 'white',
  'brown', 'pink', 'orange', 'purple', 'grey', 'gray',
  'in', 'on', 'at', 'to', 'for', 'with', 'from', 'of', 'by', 'up', 'out',
  'off', 'over', 'under', 'about', 'into', 'onto', 'outside', 'inside',
  'away', 'back', 'home', 'now', 'then',
]);

const INSTRUCTION = new Set([
  'choose', 'circle', 'pick', 'fill', 'write', 'select', 'match', 'read',
  'look', 'answer', 'question', 'complete', 'underline', 'put', 'use',
]);

function finishStem(stem: string): string {
  const trimmed = stem.replace(/\s+/g, ' ').trim();
  const cue = trimmed.match(/^(.*?)(\s+\([^)]*\))\s*$/);
  if (cue) {
    let body = cue[1].trim();
    if (body && !/[?.!]$/.test(body)) body = `${body}.`;
    return `${body}${cue[2]}`.trim();
  }
  if (trimmed && !/[?.!]$/.test(trimmed)) return `${trimmed}.`;
  return trimmed;
}

function hasBlank(stem: string): boolean {
  return /_{2,}/.test(stem);
}

function normalizeBlankMarks(stem: string): string {
  let next = stem;
  next = next.replace(/([A-Za-z])_{1,}([A-Za-z])/g, `$1 ${BLANK} $2`);
  next = next.replace(/(?:\s*[_\-—–]\s*){2,}/g, ` ${BLANK} `);
  next = next.replace(/(?:\s*\.\s*){3,}/g, ` ${BLANK} `);
  next = next.replace(/_{2,}/g, ` ${BLANK} `);
  next = next.replace(/(?:^|\s)[-—–_](?=\s|$)/g, ` ${BLANK} `);
  next = next.replace(/\.{3,}/g, ` ${BLANK} `);
  next = next.replace(/-{2,}/g, ` ${BLANK} `);
  next = next.replace(/[—–]+/g, ` ${BLANK} `);
  next = next.replace(/\[\s*\]/g, ` ${BLANK} `);
  next = next.replace(/\(\s*\)/g, ` ${BLANK} `);
  next = next.replace(new RegExp(`(?:${BLANK}\\s*){2,}`, 'g'), `${BLANK} `);
  return next.replace(/\s+/g, ' ').trim();
}

function possessiveSignal(stem: string, choices: string[], preamble: string): boolean {
  if (/\(\s*(?:i|you|he|she|it|we|they)\s*\)/i.test(stem)) return true;
  if (/possessive/i.test(preamble)) return true;
  const hits = choices.filter((choice) => POSSESSIVE_WORDS.has(choice.toLowerCase().replace(/[^a-z']/g, '')));
  return hits.length >= 2;
}

function haveHasSignal(choices: string[]): boolean {
  const lower = new Set(choices.map((choice) => choice.toLowerCase()));
  return lower.has('have') && lower.has('has');
}

/** Put a blank back when OCR swallowed the underline on a fill-in line. */
function restoreFillBlank(stem: string, choices: string[], preamble: string): string {
  const normalized = finishStem(normalizeBlankMarks(stem));
  if (hasBlank(normalized)) return normalized;
  if (haveHasSignal(choices)) {
    const filled = finishStem(restoreHaveHasGap(normalized));
    if (hasBlank(filled)) return filled;
  }
  if (possessiveSignal(normalized, choices, preamble)) {
    return finishStem(restorePossessiveGaps(normalized));
  }
  return normalized;
}

function restoreHaveHasGap(stem: string): string {
  const re = /\b(I|You|He|She|It|We|They|[A-Z][a-z]+|[Tt]he\s+[a-z]+)\s+(?=(?:a|an|the|some|two|three|four|five|six|seven|eight|nine|ten|\d+)\b)/g;
  return stem.replace(re, (full, subject: string) => {
    const head = subject.split(/\s+/)[0]?.toLowerCase() ?? '';
    if (INSTRUCTION.has(head)) return full;
    return `${subject} ${BLANK} `;
  });
}

function restorePossessiveGaps(stem: string): string {
  let next = stem.replace(/(^|[.?!]\s+)([a-z][a-z']*)\s+(is|are|am|was|were)\b/g, (full, prefix: string, noun: string, verb: string) => {
    if (CLOSED.has(noun.toLowerCase())) return full;
    return `${prefix}${BLANK} ${noun} ${verb}`;
  });
  if (hasBlank(next)) return next;

  next = next.replace(/\b(is|are|am|was|were)\s+((?:[a-z][a-z']*\s+){0,2}[a-z][a-z']*)\b/gi, (full, copula: string, rest: string) => {
    const words = rest.split(/\s+/);
    if (CLOSED.has(words[0]?.toLowerCase() ?? '')) return full;
    if (words.every((word) => CLOSED.has(word.toLowerCase()))) return full;
    return `${copula} ${BLANK} ${rest}`;
  });
  if (hasBlank(next)) return next;

  next = next.replace(/\b(is|are|am|was|were)\s*([.?!])/gi, `$1 ${BLANK}$2`);
  if (hasBlank(next)) return next;

  next = next.replace(/\b([A-Za-z]+(?:ed|ing)|love|loves|like|likes|want|wants|need|needs|see|sees|saw|wash|washes|clean|cleans|open|opens|lose|loses|lost|wag|wags|brush|brushes|feed|feeds|wear|wears|read|reads|play|plays|keep|keeps|hold|holds|make|makes|use|uses|found|took|takes|take|bought|buy|buys|broke|break|breaks)\s+([a-z][a-z']*)\b/g, (full, verb: string, word: string) => {
    if (CLOSED.has(word.toLowerCase())) return full;
    if (/^(?:is|are|am|was|were|be|been|being)$/i.test(verb)) return full;
    return `${verb} ${BLANK} ${word}`;
  });
  return next;
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

function guessCorrect(stem: string, choices: string[], preamble = ''): string | null {
  const haveHas = guessHaveHas(stem, choices);
  if (haveHas) return haveHas;
  return guessPossessive(stem, choices, preamble);
}

function guessHaveHas(stem: string, choices: string[]): string | null {
  if (!haveHasSignal(choices)) return null;
  const subject = findHaveHasSubject(stem);
  if (!subject) return null;
  const which = correctHaveHasForSubject(subject);
  return choices.find((choice) => choice.toLowerCase() === which) ?? null;
}

function findHaveHasSubject(stem: string): string | null {
  const pattern = /\b(I|You|He|She|It|We|They|[A-Z][a-z]+|[Tt]he\s+[A-Za-z]+)\b/;
  if (/_{2,}/.test(stem)) {
    const before = stem.split(/_{2,}/)[0] ?? '';
    const trailing = before.match(new RegExp(`${pattern.source}\\s*$`, 'i'));
    return trailing?.[1] ?? null;
  }
  const lead = stem.match(new RegExp(`^${pattern.source}`, 'i'));
  return lead?.[1] ?? null;
}

function guessPossessive(stem: string, choices: string[], preamble: string): string | null {
  if (!possessiveSignal(stem, choices, preamble)) return null;
  const cue = possessiveCue(stem);
  if (!cue) return null;
  const adjective = ADJECTIVE[cue];
  const pronoun = PRONOUN[cue];
  const form = blankForm(stem);
  const preferAdj = /possessive\s+(?:determiners?|adjectives?)/i.test(preamble);
  let expected: string | undefined;
  if (form === 'pro') expected = pronoun;
  else if (form === 'adj') expected = adjective;
  else if (preferAdj) expected = adjective;
  else {
    const adjHit = Boolean(adjective && choices.some((choice) => choice.toLowerCase() === adjective));
    const proHit = Boolean(pronoun && choices.some((choice) => choice.toLowerCase() === pronoun));
    if (adjHit && proHit) return null;
    expected = adjHit ? adjective : pronoun;
  }
  if (!expected) return null;
  const hits = choices.filter((choice) => choice.toLowerCase() === expected);
  return hits.length === 1 ? hits[0] : null;
}

function possessiveCue(stem: string): string | null {
  const paren = stem.match(/\(\s*(I|you|he|she|it|we|they)\s*\)/i);
  if (paren) return paren[1].toLowerCase();
  const before = stem.split(/_{2,}/)[0] ?? stem;
  const pronouns = [...before.matchAll(/\b(I|you|he|she|it|we|they)\b/gi)];
  if (pronouns.length > 0) return pronouns[pronouns.length - 1][1].toLowerCase();
  if (/\b(these|those)\b/i.test(before) || /\b(?:the|these|those)\s+[a-z]+s\b/i.test(before)) return 'they';
  if (/\b(?:the|this|that)\s+(?!is\b|are\b|am\b|was\b|were\b|has\b|have\b)[a-z]+\b/i.test(before)) return 'it';
  return null;
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
