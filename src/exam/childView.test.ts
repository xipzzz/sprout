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
    {
      id: '5',
      stem: 'Sam has 3 bags of 6 apples. How many apples?',
      choices: [],
      choice_labels: [],
      question_type: 'open',
      student_answer: '18 apples',
      working_steps: ['secret-step 3 x 6 = 18'],
      teacher_mark: '✓',
      is_correct: true,
      teacher_comment: 'secret-comment Well done',
      student_marks: '2/2',
      correct_answer: '18',
      explanation: '',
      sub_questions: [
        {
          label: 'a',
          stem: 'How many bags?',
          student_answer: 'secret-sub-answer',
          teacher_mark: '✗',
          correct_answer: 'secret-sub-key',
          is_correct: false,
          working_steps: ['secret-sub-step'],
        },
      ],
      flags: [],
    },
  ],
};

const child = toChildView(scan);
assertChildViewSafe(scan, child);

const leaky = { ...scan, questions: scan.questions.map((q) => ({ ...q })) };
const leakyChild = toChildView(leaky);
leakyChild.questions[3] = { ...leakyChild.questions[3], stem: `${leaky.questions[3].stem} secret-comment Well done` };
let caught = false;
try {
  assertChildViewSafe(leaky, leakyChild);
} catch {
  caught = true;
}
if (!caught) throw new Error('A teacher comment pasted into a child stem was not caught');
for (const key of ['working_steps', 'sub_questions', 'teacher_comment', 'is_correct', 'question_type', 'choice_labels']) {
  caught = false;
  try {
    assertChildViewSafe(scan, {
      ...child,
      questions: [{ ...child.questions[0], [key]: 'x' } as (typeof child.questions)[number]],
    });
  } catch {
    caught = true;
  }
  if (!caught) throw new Error(`Child guard missed the parent-only key ${key}`);
}

const blob = JSON.stringify(child);
const banned = [
  'secret-handwriting',
  'hidden-key',
  '2分',
  '✓',
  '×',
  'watr',
  'Parent-only note',
  'The answer is hidden-key',
  'secret-step',
  'secret-comment',
  'secret-sub',
  '2/2',
  'open',
];
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
