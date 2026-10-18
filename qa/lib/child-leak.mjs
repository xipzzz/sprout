/** Child-payload leak check. Mirrors src/exam/childView.ts so the harness
 *  stays valid after later PRs without importing app TypeScript. */

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

export function toChildView(scan) {
  return {
    subject: scan?.subject || '',
    questions: (scan?.questions || []).map((q) => ({
      id: q.id,
      stem: q.stem,
      choices: (q.choices || []).map((choice) => choice),
    })),
  };
}

function walkKeys(value, found) {
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

export function checkChildPayload(scan) {
  if (!scan || typeof scan !== 'object') {
    return { ok: false, leak: 'no scan object', child: null };
  }
  const child = toChildView(scan);
  const leakedKeys = [];
  walkKeys(child, leakedKeys);
  if (leakedKeys.length) {
    return { ok: false, leak: `keys:${leakedKeys.join('|')}`, child };
  }
  for (const question of child.questions) {
    const keys = Object.keys(question).sort().join(',');
    if (keys !== 'choices,id,stem') {
      return { ok: false, leak: `fields:${keys}`, child };
    }
  }

  const blob = JSON.stringify(child);
  const choiceText = new Set((scan.questions || []).flatMap((q) => q.choices || []));
  for (const question of scan.questions || []) {
    if (question.explanation && blob.includes(question.explanation)) {
      return { ok: false, leak: `explanation:${question.id}`, child };
    }
    for (const [label, value] of [
      ['teacher_mark', question.teacher_mark],
      ['student_answer', question.student_answer],
      ['correct_answer', question.correct_answer],
    ]) {
      if (value && !choiceText.has(value) && blob.includes(value)) {
        return { ok: false, leak: `${label}:${question.id}`, child };
      }
    }
    for (const flag of question.flags || []) {
      if (flag.note && blob.includes(flag.note)) {
        return { ok: false, leak: `flag:${question.id}`, child };
      }
    }
  }
  return { ok: true, leak: '', child };
}

export function parentSecrets(scan) {
  const choiceText = new Set((scan?.questions || []).flatMap((q) => q.choices || []));
  const secrets = [];
  for (const question of scan?.questions || []) {
    if (question.explanation) secrets.push(question.explanation);
    for (const value of [question.teacher_mark, question.student_answer, question.correct_answer]) {
      if (value && !choiceText.has(value) && value.length > 1) secrets.push(value);
    }
    for (const flag of question.flags || []) {
      if (flag.note) secrets.push(flag.note);
    }
  }
  return [...new Set(secrets.filter(Boolean))];
}

/** Labels that must never appear on a child screen. Choices may repeat a
 *  correct word; that is allowed. These phrases are parent-only chrome. */
export const CHILD_SCREEN_BANNED = [
  'Handwritten answer',
  'Teacher’s mark',
  "Teacher's mark",
  'For you',
  'hidden from the child',
  'Pick the right answer, hidden',
  'Practice answer',
  'Answer key',
  'AI wrote this',
  'AI filled this in',
];
