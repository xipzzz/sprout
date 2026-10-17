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

/** Throws when the child payload still carries an answer, mark, or explanation. */
export function assertChildViewSafe(parent: ParentScan, child: ChildView): void {
  const leakedKeys: string[] = [];
  walkKeys(child, leakedKeys);
  if (leakedKeys.length) {
    throw new Error(`Child view leaked keys: ${leakedKeys.join(', ')}`);
  }
  for (const question of child.questions) {
    const keys = Object.keys(question).sort().join(',');
    if (keys !== 'choices,id,stem') {
      throw new Error(`Child question has unexpected fields: ${keys}`);
    }
  }

  const blob = JSON.stringify(child);
  const choiceText = new Set(parent.questions.flatMap((q) => q.choices));
  for (const question of parent.questions) {
    if (question.explanation && blob.includes(question.explanation)) {
      throw new Error(`Child view leaked the explanation for question ${question.id}`);
    }
    if (
      question.teacher_mark &&
      !choiceText.has(question.teacher_mark) &&
      blob.includes(question.teacher_mark)
    ) {
      throw new Error(`Child view leaked the teacher's mark for question ${question.id}`);
    }
    if (
      question.student_answer &&
      !choiceText.has(question.student_answer) &&
      blob.includes(question.student_answer)
    ) {
      throw new Error(`Child view leaked the handwritten answer for question ${question.id}`);
    }
    if (
      question.correct_answer &&
      !choiceText.has(question.correct_answer) &&
      blob.includes(question.correct_answer)
    ) {
      throw new Error(`Child view leaked the correct answer for question ${question.id}`);
    }
    for (const flag of question.flags) {
      if (flag.note && blob.includes(flag.note)) {
        throw new Error(`Child view leaked a reconstruction note for question ${question.id}`);
      }
    }
  }
}
