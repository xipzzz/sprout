/* Build the child practice payload from a parent scan.
   Answers stay in the parent object. This function is the only bridge. */

import type { ChildView, ParentQuestion, ParentScan } from './types.ts';

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
  'choice_letters', 'working', 'is_correct', 'teacher_comment', 'marks', 'question_type', 'sub_questions',
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

function parentQuestions(questions: ParentQuestion[]): ParentQuestion[] {
  return questions.flatMap((question) => [question, ...parentQuestions(question.sub_questions ?? [])]);
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
  const visibleById = new Map<string, { text: string; printedChoice: boolean }[]>();
  for (const question of child.questions) {
    const keys = Object.keys(question).sort().join(',');
    if (keys !== 'choices,id,stem') throw new Error(`Child question has unexpected fields: ${keys}`);
    const original = parent.questions.find((item) => item.id === question.id);
    if (!original) throw new Error(`Unknown child question: ${question.id}`);
    const visible = [{ text: question.stem, printedChoice: false }];
    for (const choice of question.choices) {
      visible.push({ text: choice, printedChoice: original.choices.includes(choice) });
    }
    if (visibleById.has(question.id)) throw new Error(`Duplicate child question: ${question.id}`);
    visibleById.set(question.id, visible);
  }
  // Repeated words in other questions are printed context, not this question’s answer.
  for (const root of parent.questions) {
    const visible = [{ text: child.subject, printedChoice: false }, ...(visibleById.get(root.id) ?? [])];
    for (const question of parentQuestions([root])) {
      const secrets: [string, string, boolean][] = [
        ['explanation', question.explanation, false],
        ['teacher mark', question.teacher_mark, false],
        ['handwritten answer', question.student_answer, true],
        ['correct answer', question.correct_answer, true],
        ['teacher comment', question.teacher_comment ?? '', false],
        ['mark note', question.marks?.note ?? '', false],
        ['score', question.marks?.score ?? '', false],
        ...(question.working ?? []).flatMap((step): [string, string, boolean][] =>
          [step.expression, step.result, ...step.steps].map((text) => ['working', text, false])),
        ...(question.marks?.symbols ?? []).map((text): [string, string, boolean] => ['teacher symbol', text, false]),
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
}
