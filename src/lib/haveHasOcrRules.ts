/**
 * Sprout — Have/Has OCR rules (tiny ship)
 *
 * Problem: draftWordPickFromOcrText in src/lib/homeworkParse.ts puts
 * "have" and "has" in STOPWORDS, so Have/Has worksheets lose the answer
 * words and drafts become junk.
 *
 * This module: detect Have/Has worksheets, normalize OCR misreads,
 * emit a real word-pick { prompt, choices: ['have','has'], correct },
 * and leave parent edit to ScanHomeworkScreen (already live).
 *
 * Merge target: call from draftWordPickFromOcrText BEFORE generic token path;
 * remove 'have'/'has' from STOPWORDS (or keep them only outside this path).
 */

export type WordPickJson = {
  prompt: string;
  choices: string[];
  correct: string;
};

/** Common Tesseract misreads for have/has on kids worksheets. */
const HAVE_MISREADS = /\b(hove|nave|harve|havc|havc|havc|havc|hae|hav|havc)\b/gi;
const HAS_MISREADS = /\b(bas|lias|hass|haz|hss|has\.|bas)\b/gi;

export function normalizeHaveHasOcr(text: string): string {
  return (text || '')
    .split('\0').join('')
    .replace(HAVE_MISREADS, 'have')
    .replace(HAS_MISREADS, 'has')
    .replace(/\bhavc\b/gi, 'have')
    .replace(/\bhove\b/gi, 'have')
    .replace(/\bnave\b/gi, 'have')
    .replace(/\blias\b/gi, 'has')
    .replace(/\bbas\b/gi, 'has');
}

/** True when OCR text looks like a Have/Has worksheet. */
export function isHaveHasWorksheet(text: string): boolean {
  const t = normalizeHaveHasOcr(text).toLowerCase();
  if (!t.trim()) return false;

  const mentionsHave = /\bhave\b/.test(t);
  const mentionsHas = /\bhas\b/.test(t);
  const blankLine =
    /\b(he|she|it|they|we|i|you|tom|sam|ann|the\s+\w+)\b[^\n]{0,40}(_{2,}|\.{3,}|\(\s*\)|\[\s*\]|\/\s*\/)/i.test(
      t,
    ) || /\b(fill|choose|circle|pick|write)\b[^\n]{0,40}\b(have|has)\b/i.test(t);
  const title =
    /\bhave\s*(or|\/)\s*has\b/.test(t) ||
    /\bhas\s*(or|\/)\s*have\b/.test(t) ||
    /\b(have|has)\s+and\s+(have|has)\b/.test(t);

  return title || blankLine || (mentionsHave && mentionsHas);
}

/**
 * Subject → correct Have/Has (simple kids rule).
 * Singular (he/she/it/name) → has; plural/I/you/we/they → have.
 */
export function correctHaveHasForSubject(subject: string): 'have' | 'has' {
  const s = subject.trim().toLowerCase();
  if (/^(he|she|it)$/.test(s)) return 'has';
  if (/^(i|you|we|they)$/.test(s)) return 'have';
  if (/^[A-Z][a-z]+$/.test(subject.trim())) return 'has';
  if (/^(the|a|an)\s+\w+$/i.test(subject.trim())) return 'has';
  return 'have';
}

function firstSubjectHint(text: string): string | null {
  const m =
    text.match(
      /\b(He|She|It|They|We|I|You|Tom|Sam|Ann|Mia|Ben|the\s+\w+)\b[^\n]{0,48}(_{2,}|\.{3,}|\(\s*\)|have|has)/i,
    ) || text.match(/\b(He|She|It|They|We|I|You)\b/i);
  return m ? m[1].replace(/\s+/g, ' ').trim() : null;
}

function questionPromptFromText(text: string, subject: string | null): string {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
  const q =
    lines.find((l) => /\?/.test(l)) ||
    lines.find((l) => /^(choose|circle|pick|fill|write|select)\b/i.test(l));
  if (q && q.length >= 8) {
    let p = q.replace(/^(?:[[(]?[A-Da-d1-4][)\].:]|\u2022|-|\*)\s+/, '').trim();
    if (!/[?.!]$/.test(p)) p = `${p}?`;
    return p;
  }
  if (subject) return `Pick the right word: ${subject} ____ … (have or has)?`;
  return 'Choose have or has for this sentence.';
}

/**
 * If worksheet is Have/Has, return a real word-pick.
 * Otherwise return null (caller keeps generic OCR draft path).
 */
export function draftHaveHasWordPick(ocrText: string): WordPickJson | null {
  const text = normalizeHaveHasOcr(ocrText);
  if (!isHaveHasWorksheet(text)) return null;

  const subject = firstSubjectHint(text);
  const correct = subject ? correctHaveHasForSubject(subject) : 'have';
  const prompt = questionPromptFromText(text, subject);

  return {
    prompt,
    choices: ['have', 'has'],
    correct,
  };
}

/** STOPWORDS edit for homeworkParse.ts — remove these two entries. */
export const STOPWORDS_TO_REMOVE = ['have', 'has'] as const;
