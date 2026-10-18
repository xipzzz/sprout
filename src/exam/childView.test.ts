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

// Extra page fields stay on the parent question.
const rich: ParentScan = {
  ...scan,
  questions: [
    {
      id: '4',
      stem: 'Mei has 12 stickers. She gives away some.',
      choices: ['5', '7'],
      student_answer: '7',
      teacher_mark: '✓ 2',
      correct_answer: '7',
      explanation: '',
      flags: [],
      choice_labels: ['A', 'B'],
      question_type: 'word problem',
      working: ['12 - 5 = 7'],
      is_correct: true,
      teacher_comment: 'Neat working!',
      marks: '2',
      sub_questions: [
        {
          id: '4a',
          stem: 'How many are left?',
          choices: [],
          student_answer: 'seven',
          teacher_mark: '',
          correct_answer: 'seven',
          explanation: '',
          flags: [],
        },
      ],
    },
  ],
};
const richChild = toChildView(rich);
assertChildViewSafe(rich, richChild);
if (JSON.stringify(richChild.questions) !== JSON.stringify([{ id: '4', stem: rich.questions[0].stem, choices: ['5', '7'] }])) {
  throw new Error(`Child payload must be id, stem and choices only: ${JSON.stringify(richChild)}`);
}
for (const leak of [
  (c: typeof richChild) => { c.questions[0].stem += ' Hint: seven.'; },
  (c: typeof richChild) => { c.questions[0].stem = 'Neat working!'; },
  (c: typeof richChild) => { (c.questions[0] as Record<string, unknown>).choice_labels = ['A', 'B']; },
]) {
  const tampered = structuredClone(richChild);
  leak(tampered);
  let failed = false;
  try {
    assertChildViewSafe(rich, tampered);
  } catch {
    failed = true;
  }
  if (!failed) throw new Error(`Tampered child payload passed: ${JSON.stringify(tampered)}`);
}

console.log('child view test passed');
console.log(blob);
