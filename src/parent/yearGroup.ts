/* Year group (P1 to P4), chosen once by the parent and kept in this browser.
   Other modules read it with getYearSettings() to pick wording and number
   ranges, for example similar practice and explanation lines. */

export const YEAR_GROUPS = ['P1', 'P2', 'P3', 'P4'] as const;
export type YearGroup = (typeof YEAR_GROUPS)[number];

export type YearSettings = {
  year: YearGroup;
  /** 1 is the simplest wording, 4 the fullest. */
  wordingLevel: 1 | 2 | 3 | 4;
  /** Longest sentence to aim for in lines written for the child. */
  maxWordsPerSentence: number;
  /** Range for numbers in made-up practice questions. */
  numberRange: { min: number; max: number };
  operations: ReadonlyArray<'+' | '-' | 'x' | '÷'>;
  /** One line shown to the parent when choosing. */
  summary: string;
};

const YEAR_KEY = 'sprout.yearGroup';
const DEFAULT_YEAR: YearGroup = 'P1';

export const YEAR_SETTINGS: Readonly<Record<YearGroup, YearSettings>> = {
  P1: {
    year: 'P1',
    wordingLevel: 1,
    maxWordsPerSentence: 8,
    numberRange: { min: 0, max: 20 },
    operations: ['+', '-'],
    summary: 'Numbers up to 20. Very short sentences.',
  },
  P2: {
    year: 'P2',
    wordingLevel: 2,
    maxWordsPerSentence: 10,
    numberRange: { min: 0, max: 100 },
    operations: ['+', '-', 'x', '÷'],
    summary: 'Numbers up to 100. Short sentences.',
  },
  P3: {
    year: 'P3',
    wordingLevel: 3,
    maxWordsPerSentence: 14,
    numberRange: { min: 0, max: 1000 },
    operations: ['+', '-', 'x', '÷'],
    summary: 'Numbers up to 1,000. Everyday sentences.',
  },
  P4: {
    year: 'P4',
    wordingLevel: 4,
    maxWordsPerSentence: 18,
    numberRange: { min: 0, max: 10000 },
    operations: ['+', '-', 'x', '÷'],
    summary: 'Numbers up to 10,000. Longer sentences.',
  },
};

const listeners = new Set<() => void>();

function isYearGroup(value: unknown): value is YearGroup {
  return typeof value === 'string' && (YEAR_GROUPS as readonly string[]).includes(value);
}

function readSaved(): YearGroup | null {
  try {
    const value = globalThis.localStorage?.getItem(YEAR_KEY);
    return isYearGroup(value) ? value : null;
  } catch {
    return null;
  }
}

export function hasChosenYearGroup(): boolean {
  return readSaved() !== null;
}

export function getYearGroup(): YearGroup {
  return readSaved() ?? DEFAULT_YEAR;
}

/** The settings other modules should read. Falls back to P1 until chosen. */
export function getYearSettings(): YearSettings {
  return YEAR_SETTINGS[getYearGroup()];
}

export function setYearGroup(year: YearGroup): void {
  if (!isYearGroup(year)) throw new Error(`Unknown year group: ${String(year)}`);
  globalThis.localStorage?.setItem(YEAR_KEY, year);
  for (const listener of listeners) listener();
}

export function subscribeYearGroup(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Picks the line written for this wording level, e.g. a say-aloud line. */
export function pickWording<T>(byLevel: Readonly<Record<YearSettings['wordingLevel'], T>>, settings = getYearSettings()): T {
  return byLevel[settings.wordingLevel];
}
