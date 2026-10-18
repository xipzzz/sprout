/* Build the child practice payload from a parent scan.
   Answers stay in the parent object. This function is the only bridge. */

import type { ChildView, ParentScan } from './types.ts';

const FORBIDDEN_KEYS = new Set([
  'student_answer',
  'teacher_mark',
  'correct_answer',
  'correct',
  'explanation',
  'teacher_feedback',
  'student_marks',
  'score',
  'flags',
  'reconstructions',
  'previews',
  'review',
  'stem_edited',
  'page_flags',
]);

export function toChildView(scan: ParentScan): ChildView {
  return {
    subject: scan.subject,
    questions: scan.questions.map((q) => ({
      id: q.id,
      stem: q.stem,
      choices: q.choices.map((choice) => choice),
    })),
  };
}

function walkKeys(value: unknown, found: string[]) {
  if (Array.isArray(value)) {
    for (const item of value) walkKeys(item, found);
    return;
  }
  if (!value || typeof value !== 'object') return;
  for (const [key, inner] of Object.entries(value)) {
    if (FORBIDDEN_KEYS.has(key)) found.push(key);
    walkKeys(inner, found);
  }
}

function containsToken(text: string, secret: string): boolean {
  if (!secret) return false;
  const escaped = secret.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(?<![\\p{L}\\p{M}\\p{N}_])${escaped}(?![\\p{L}\\p{M}\\p{N}_])`, 'u').test(text);
}

/** Throws when the child payload still carries an answer, mark, or explanation. */
export function assertChildViewSafe(parent: ParentScan, child: ChildView): void {
  const leakedKeys: string[] = [];
  walkKeys(child, leakedKeys);
  if (leakedKeys.length) throw new Error(`Child view leaked keys: ${leakedKeys.join(', ')}`);
  if (Object.keys(child).sort().join(',') !== 'questions,subject') {
    throw new Error('Child view has unexpected fields');
  }
  const visible = [{ text: child.subject, printedChoice: false }];
  for (const question of child.questions) {
    const keys = Object.keys(question).sort().join(',');
    if (keys !== 'choices,id,stem') throw new Error(`Child question has unexpected fields: ${keys}`);
    const original = parent.questions.find((item) => item.id === question.id);
    if (!original) throw new Error(`Unknown child question: ${question.id}`);
    visible.push({ text: question.stem, printedChoice: false });
    for (const choice of question.choices) {
      visible.push({ text: choice, printedChoice: original.choices.includes(choice) });
    }
  }
  for (const question of parent.questions) {
    const secrets: [string, string, boolean][] = [
      ['explanation', question.explanation, false],
      ['teacher mark', question.teacher_mark, false],
      ['handwritten answer', question.student_answer, true],
      ['correct answer', question.correct_answer, true],
      ...question.flags.map((flag): [string, string, boolean] => ['reconstruction note', flag.note, false]),
    ];
    for (const [label, secret, allowChoice] of secrets) {
      if (visible.some(({ text, printedChoice }) =>
        !(allowChoice && printedChoice && text === secret) && containsToken(text, secret))) {
        throw new Error(`Child view leaked the ${label} for question ${question.id}`);
      }
    }
  }
}
