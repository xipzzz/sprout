/* Proves answers never reach the child view data.
   Run: node --experimental-strip-types src/exam/childView.test.ts */

import { assertChildViewSafe, toChildView } from './childView.ts';
import type { ParentScan } from './types.ts';

const scan: ParentScan = {
  extraction: 'stub',
  subject: 'english',
  paper_title: 'English homework',
  source_photo: 'sample-exam-english.png',
  note: 'stub',
  deskew: { applied: true, corners: [] },
  ink_pixels_lifted: 0,
  questions: [
    {
      id: '1',
      stem: 'Which word means a baby plant?',
      choices: ['bloom', 'seedling', 'root', 'fence'],
      student_answer: 'seedling',
      teacher_mark: '✓',
      correct_answer: 'seedling',
      explanation: 'A seedling is a baby plant that has just started to grow.',
      flags: [
        { field: 'explanation', kind: 'generated', note: 'Parent-only note about seedling.' },
      ],
    },
    {
      id: '3',
      stem: 'The plant needs ____ to grow.',
      choices: ['water', 'soil', 'light', 'wind'],
      student_answer: 'watr',
      teacher_mark: '×',
      correct_answer: 'water',
      explanation: 'The missing word is water. Handwriting looked like watr.',
      flags: [
        { field: 'student_answer', kind: 'reconstructed', note: 'Saw watr on the page.' },
      ],
    },
    {
      id: '4',
      stem: 'Read the sentence.',
      choices: [],
      student_answer: 'secret-handwriting',
      teacher_mark: '2分',
      correct_answer: 'hidden-key',
      explanation: 'The answer is hidden-key, kept for the parent only.',
      flags: [
        { field: 'correct_answer', kind: 'reconstructed', note: 'Guessed hidden-key.' },
      ],
    },
  ],
};

const child = toChildView(scan);
assertChildViewSafe(scan, child);

const blob = JSON.stringify(child);
const banned = ['secret-handwriting', 'hidden-key', '2分', '✓', '×', 'watr', 'Parent-only note', 'The answer is hidden-key'];
for (const secret of banned) {
  if (blob.includes(secret)) {
    throw new Error(`Child JSON still contains ${secret}: ${blob}`);
  }
}

if (child.questions.some((q) => 'correct_answer' in q || 'student_answer' in q || 'teacher_mark' in q)) {
  throw new Error('Child questions still have answer fields');
}

console.log('child view test passed');
console.log(blob);

// Numeric secrets are tokens. Question IDs and longer numbers are not answer text.
const numeric = { ...scan, questions: [{ ...scan.questions[0], id: '8', stem: 'Count 58 seeds.', choices: [], student_answer: '', teacher_mark: '', correct_answer: '8', explanation: '', flags: [] }] } satisfies ParentScan;
assertChildViewSafe(numeric, toChildView(numeric));
for (const stem of ['Count 8 seeds.', 'Count (8).', 'Answer: 8!']) {
  const leaked = { ...numeric, questions: [{ ...numeric.questions[0], stem }] };
  let rejected = false;
  try { assertChildViewSafe(leaked, toChildView(leaked)); } catch { rejected = true; }
  if (!rejected) throw new Error(`Whole answer token was allowed: ${stem}`);
}
for (const answer of ['8', 'seed']) {
  const longer = { ...numeric, questions: [{ ...numeric.questions[0], stem: 'Count 58 seedlings.', correct_answer: answer }] };
  assertChildViewSafe(longer, toChildView(longer));
}
const crossQuestion = { ...numeric, questions: [
  { ...numeric.questions[0], stem: 'Answer: 8.' },
  { ...numeric.questions[0], id: '2', stem: 'Pick a number.', choices: ['8', '9'], correct_answer: '' },
] };
let rejectedCrossQuestion = false;
try { assertChildViewSafe(crossQuestion, toChildView(crossQuestion)); } catch { rejectedCrossQuestion = true; }
if (!rejectedCrossQuestion) throw new Error('Another question’s choice hid an answer in the stem');
