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

const detailed = { ...scan, questions: [{ ...scan.questions[0],
  choice_letters: ['B', 'D'],
  working: [{ expression: 'private-work', result: 'private-result', steps: ['private-step'] }],
  is_correct: false, teacher_comment: 'private-comment', question_type: 'single choice',
  marks: { selected: ['D'], crossed: true, note: 'private-mark', score: 'private-score', symbols: ['×'] },
  sub_questions: [{ ...scan.questions[2], id: '1a', student_answer: 'private-sub-answer' }],
}] } satisfies ParentScan;
const detailedChild = toChildView(detailed);
assertChildViewSafe(detailed, detailedChild);
if (Object.keys(detailedChild.questions[0]).sort().join(',') !== 'choices,id,stem') throw new Error('Parent details reached child');
for (const secret of ['private-work', 'private-result', 'private-step', 'private-comment', 'private-mark', 'private-score', 'private-sub-answer']) {
  let rejected = false;
  try { assertChildViewSafe(detailed, { ...detailedChild, questions: [{ ...detailedChild.questions[0], stem: secret }] }); } catch { rejected = true; }
  if (!rejected) throw new Error(`Parent detail was allowed in child text: ${secret}`);
}

for (const [answer, stem] of [['e', 'Read é.'], ['水', '开水'], ['C++', 'Try C++17.']]) {
  const unicode = { ...numeric, questions: [{ ...numeric.questions[0], stem, correct_answer: answer }] };
  assertChildViewSafe(unicode, toChildView(unicode));
}

const separateContexts = { ...numeric, subject: 'english', questions: [
  { ...numeric.questions[0], id: '1', stem: 'Ali is playing.', choices: ['He', 'She'], correct_answer: 'He' },
  { ...numeric.questions[0], id: '2', stem: 'The cat ____ sleeping.', choices: ['is', 'are'], correct_answer: 'is' },
] };
assertChildViewSafe(separateContexts, toChildView(separateContexts));

for (const field of ['choice_letters', 'working', 'is_correct', 'teacher_comment', 'marks', 'question_type', 'sub_questions']) {
  const invalid = { ...detailedChild, questions: [{ ...detailedChild.questions[0], [field]: 'private-detail' }] };
  let rejected = false;
  try { assertChildViewSafe(detailed, invalid); } catch { rejected = true; }
  if (!rejected) throw new Error(`Child accepted parent field: ${field}`);
}
const duplicatedChild = { ...toChildView(numeric), questions: [
  { ...toChildView(numeric).questions[0], stem: 'Answer: 8.' },
  toChildView(numeric).questions[0],
] };
let rejectedDuplicate = false;
try { assertChildViewSafe(numeric, duplicatedChild); } catch { rejectedDuplicate = true; }
if (!rejectedDuplicate) throw new Error('A duplicate question ID hid a leaked answer');
console.log('child view test passed');
