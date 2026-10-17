/* The few calls the exam screens make into explain, similar practice and hints. */

import type { ParentScan } from '../types.ts';
import { appExplainCache } from './explain.ts';
import { scanHint } from './hints.ts';
import { mathsSampleScan } from './mathsSample.ts';
import { practiceHint, gradePractice, type PracticeRun } from './practice.ts';
import { extrasSettings } from './settings.ts';

export { applyParentPick } from './picks.ts';
export type { PracticeRun } from './practice.ts';

/** `?exam=1&demo=maths` opens the local maths sample straight into parent review. */
export function initialSample(search = typeof window === 'undefined' ? '' : window.location.search): ParentScan | null {
  return new URLSearchParams(search).get('demo') === 'maths' ? mathsSampleScan() : null;
}

export { mathsSampleScan };

export function childHint(scan: ParentScan) {
  return (questionId: string, wrongTries: number) =>
    scanHint(scan, questionId, wrongTries, appExplainCache(), extrasSettings());
}

export function practiceGrade(run: PracticeRun) {
  return (questionId: string, given: string) => gradePractice(run.set, questionId, given);
}

export function practiceChildHint(run: PracticeRun) {
  return (questionId: string, wrongTries: number) =>
    practiceHint(run.set, questionId, wrongTries, appExplainCache(), extrasSettings());
}
