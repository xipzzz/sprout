/* Defaults for explain, similar practice and hints, pending the owner's decisions:
   local templates (decision 1A), maths and English grammar (9B, grammar only), hints on (6A).
   Year group mirrors PR #97's YearGroup names; swap yearFromSearch for getYearSettings() once it lands. */

export const YEAR_GROUPS = ['P1', 'P2', 'P3', 'P4'] as const;
export type YearGroup = (typeof YEAR_GROUPS)[number];
export type Wording = 'short' | 'full';

export type ExtrasSettings = {
  explainSource: 'local-templates';
  subjects: Array<'math' | 'english'>;
  hints: boolean;
  practiceCount: number;
  year: YearGroup;
};

export const EXTRAS_DEFAULTS: ExtrasSettings = {
  explainSource: 'local-templates',
  subjects: ['math', 'english'],
  hints: true,
  practiceCount: 3,
  year: 'P1',
};

/** P1 and P2 get short sentences; P3 and P4 get the fuller lines. */
export function wordingFor(year: YearGroup): Wording {
  return year === 'P1' || year === 'P2' ? 'short' : 'full';
}

/** `?hints=0` turns hints off and `?year=P3` sets the year group, without a settings screen. */
export function extrasSettings(search = typeof window === 'undefined' ? '' : window.location.search): ExtrasSettings {
  const params = new URLSearchParams(search);
  const year = (params.get('year') ?? '').toUpperCase();
  return {
    ...EXTRAS_DEFAULTS,
    hints: params.get('hints') !== '0',
    year: (YEAR_GROUPS as readonly string[]).includes(year) ? (year as YearGroup) : EXTRAS_DEFAULTS.year,
  };
}
