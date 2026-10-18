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
  'choice_labels',
  'question_type',
  'working',
  'is_correct',
  'teacher_comment',
  'marks',
  'sub_questions',
]);

const WORD_CHAR = /[\p{L}\p{N}]/u;
const HAN_CHAR = /\p{Script=Han}/u;

/** A letter or digit that joins its neighbours into one word. Each Han character is a token on its own. */
function isWordChar(char: string | undefined): boolean {
  return !!char && WORD_CHAR.test(char) && !HAN_CHAR.test(char);
}

/** True when needle sits in text as whole tokens, ignoring case. "8" is in "Add 8 more" but not in "58". */
export function containsToken(text: string, needle: string): boolean {
  const hay = text.toLowerCase();
  const target = needle.trim().toLowerCase();
  if (!target) return false;
  const chars = Array.from(target);
  const guardStart = isWordChar(chars[0]);
  const guardEnd = isWordChar(chars[chars.length - 1]);
  for (let at = hay.indexOf(target); at !== -1; at = hay.indexOf(target, at + 1)) {
    const before = Array.from(hay.slice(0, at)).pop();
    const after = Array.from(hay.slice(at + target.length))[0];
    if (guardStart && isWordChar(before)) continue;
    if (guardEnd && isWordChar(after)) continue;
    return true;
  }
  return false;
}

/** Only the text the child can read: subject, stems and choices. Ids are question numbers, not answers. */
function childText(child: ChildView): string {
  return [child.subject, ...child.questions.flatMap((q) => [q.stem, ...q.choices])].join('\n');
}

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

  const blob = childText(child);
  const choiceText = new Set(parent.questions.flatMap((q) => q.choices));
  for (const question of withSubQuestions(parent.questions)) {
    assertNoSecretText(question, blob, choiceText);
  }
}

function withSubQuestions(questions: ParentQuestion[]): ParentQuestion[] {
  return questions.flatMap((q) => [q, ...withSubQuestions(q.sub_questions ?? [])]);
}

function assertNoSecretText(question: ParentQuestion, blob: string, choiceText: Set<string>): void {
  const id = question.id;
  if (question.explanation && containsToken(blob, question.explanation)) {
    throw new Error(`Child view leaked the explanation for question ${id}`);
  }
  if (question.teacher_comment && containsToken(blob, question.teacher_comment)) {
    throw new Error(`Child view leaked the teacher's comment for question ${id}`);
  }
  for (const step of question.working ?? []) {
    if (step && !choiceText.has(step) && containsToken(blob, step)) {
      throw new Error(`Child view leaked the child's working for question ${id}`);
    }
  }
  const answers: [string, string][] = [
    [question.teacher_mark, "teacher's mark"],
    [question.student_answer, 'handwritten answer'],
    [question.correct_answer, 'correct answer'],
  ];
  for (const [value, label] of answers) {
    if (value && !choiceText.has(value) && containsToken(blob, value)) {
      throw new Error(`Child view leaked the ${label} for question ${id}`);
    }
  }
  for (const flag of question.flags) {
    if (flag.note && containsToken(blob, flag.note)) {
      throw new Error(`Child view leaked a reconstruction note for question ${id}`);
    }
  }
}
