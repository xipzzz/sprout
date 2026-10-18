/* Proves answers never reach the child view data.
   Run: node --experimental-strip-types src/exam/childView.test.ts */

import { assertChildViewSafe, containsToken, toChildView } from './childView.ts';
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

// Whole tokens only: "8" is not inside "58", but a lone "8" is a leak.
const tokenCases: [string, string, boolean][] = [
  ['There are 58 apples.', '8', false],
  ['Add 8 more apples.', '8', true],
  ['Add 8.', '8', true],
  ['8个苹果', '8', true],
  ['Waterfall', 'water', false],
  ['Water is wet.', 'water', true],
  ['小明喝水', '水', true],
  ['Ticked ✓ here', '✓', true],
];
for (const [text, needle, expected] of tokenCases) {
  if (containsToken(text, needle) !== expected) {
    throw new Error(`containsToken(${JSON.stringify(text)}, ${JSON.stringify(needle)}) should be ${expected}`);
  }
}

function numberScan(stem: string): ParentScan {
  return {
    ...scan,
    questions: [
      {
        id: '8',
        stem,
        choices: [],
        student_answer: '',
        teacher_mark: '',
        correct_answer: '8',
        explanation: '',
        flags: [],
      },
    ],
  };
}

const partOfNumber = numberScan('There are 58 apples. How many are red?');
assertChildViewSafe(partOfNumber, toChildView(partOfNumber));

const loneNumber = numberScan('Add 8 more apples. How many now?');
let caught = false;
try {
  assertChildViewSafe(loneNumber, toChildView(loneNumber));
} catch {
  caught = true;
}
if (!caught) throw new Error('A lone 8 in the stem must count as a leaked answer');

console.log('child view test passed');
console.log(blob);
