/* Build a child round from notebook questions only.
   The child screen gets `view` (ids, stems, choices). The answer key stays in this
   parent-side object and is only read by gradeRoundAnswer. */

import { assertChildViewSafe, toChildView } from './childView.ts';
import type { FirstTry, NotebookEntry, PracticeSession } from './notebook.ts';
import { topicLabel } from './topics.ts';
import type { ChildView, ParentScan } from './types.ts';

export type RoundScope = { kind: 'all' } | { kind: 'scan'; scanKey: string } | { kind: 'topic'; topic: string };

export type MistakesRound = {
  view: ChildView;
  scope: RoundScope;
  answerKey: Map<string, NotebookEntry>;
};

export type RoundGrade = 'nice' | 'almost' | 'unchecked';

export function entriesInScope(entries: NotebookEntry[], scope: RoundScope): NotebookEntry[] {
  if (scope.kind === 'scan') return entries.filter((entry) => entry.scanKey === scope.scanKey);
  if (scope.kind === 'topic') return entries.filter((entry) => entry.topic === scope.topic);
  return entries;
}

export function scopeLabel(scope: RoundScope): string {
  if (scope.kind === 'topic') return topicLabel(scope.topic);
  if (scope.kind === 'scan') return 'This page';
  return 'All mistakes';
}

function stemsOnly(subject: string, answerKey: Map<string, NotebookEntry>): ParentScan {
  return {
    extraction: 'stub',
    subject,
    paper_title: '',
    source_photo: '',
    note: '',
    deskew: { applied: false, corners: [] },
    ink_pixels_lifted: 0,
    questions: [...answerKey.entries()].map(([id, entry]) => ({
      id,
      stem: entry.stem,
      choices: [...entry.choices],
      student_answer: '',
      teacher_mark: '',
      correct_answer: '',
      explanation: '',
      flags: [],
    })),
  };
}

/** Throws if the child payload is anything other than the notebook stems and choices.
   An exact match is checked instead of searching for answer text, because short maths
   answers like "9" often appear inside other stems. */
export function assertRoundSafe(round: MistakesRound): void {
  const expected = toChildView(stemsOnly(scopeLabel(round.scope), round.answerKey));
  assertChildViewSafe(stemsOnly(expected.subject, round.answerKey), round.view);
  if (JSON.stringify(round.view) !== JSON.stringify(expected)) {
    throw new Error('Child round has something other than question stems and choices');
  }
  const visible = round.view.questions.map((item) => [item.stem, ...item.choices].join('\n')).join('\n');
  const blob = JSON.stringify(round.view);
  for (const entry of round.answerKey.values()) {
    for (const secret of [entry.key, entry.scanKey, entry.paper_title, entry.addedAt, entry.student_answer, entry.correct_answer]) {
      if (secret && blob.includes(secret) && !visible.includes(secret)) {
        throw new Error('Child round leaked notebook details');
      }
    }
  }
}

export function buildMistakesRound(entries: NotebookEntry[], scope: RoundScope): MistakesRound {
  const answerKey = new Map<string, NotebookEntry>();
  entriesInScope(entries, scope).forEach((entry, index) => answerKey.set(`q${index + 1}`, entry));
  const round = { view: toChildView(stemsOnly(scopeLabel(scope), answerKey)), scope, answerKey };
  assertRoundSafe(round);
  return round;
}

function normalise(text: string): string {
  return (text || '')
    .toLowerCase()
    .replace(/^\s*(\(?[a-d1-4]\)|[a-d1-4][.)])\s+/, '')
    .replace(/[\s.,!?]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function gradeRoundAnswer(round: MistakesRound, id: string, answer: string): RoundGrade {
  const entry = round.answerKey.get(id);
  if (!entry || !normalise(entry.correct_answer)) return 'unchecked';
  return normalise(answer) === normalise(entry.correct_answer) ? 'nice' : 'almost';
}

export function sessionFromTries(
  round: MistakesRound,
  firstTries: Record<string, RoundGrade>,
  now = new Date(),
): PracticeSession {
  const results = [...round.answerKey.entries()]
    .filter(([id]) => firstTries[id])
    .map(([id, entry]) => {
      const grade = firstTries[id];
      const firstTry: FirstTry = grade === 'nice' ? 'right' : grade === 'almost' ? 'wrong' : 'unchecked';
      return { entryKey: entry.key, subject: entry.subject, topic: entry.topic, firstTry };
    });
  return { id: `s${now.getTime()}`, at: now.toISOString(), scope: scopeLabel(round.scope), results };
}
