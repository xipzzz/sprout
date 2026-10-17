/* Parent edit gate: play stays locked until every question is picked or dropped,
   and the picked answers never reach the child practice props.
   Run: node --experimental-strip-types src/exam/review.test.ts */

import { assertChildViewSafe, toChildView } from './childView.ts';
import {
  blankBefore,
  blankInstead,
  buildPractice,
  initialReview,
  parentCopy,
  reviewProgress,
  stemWords,
  type ReviewState,
} from './review.ts';
import { EXPLAIN_FLAG_NOTE, explainPick } from './explain.ts';
import type { ParentQuestion, ParentScan } from './types.ts';

function fail(message: string): never {
  throw new Error(message);
}

const assert = {
  equal(actual: unknown, expected: unknown, message = '') {
    if (actual !== expected) fail(`${message} expected ${String(expected)}, got ${String(actual)}`);
  },
  deepEqual(actual: unknown, expected: unknown, message = '') {
    const a = JSON.stringify(actual);
    const b = JSON.stringify(expected);
    if (a !== b) fail(`${message} expected ${b}, got ${a}`);
  },
  ok(value: unknown, message = '') {
    if (!value) fail(message || 'expected a truthy value');
  },
};

function ocrQuestion(id: string, stem: string, choices: string[]): ParentQuestion {
  return {
    id,
    stem,
    choices,
    student_answer: '',
    teacher_mark: '',
    correct_answer: '',
    explanation: 'Tesseract read the print.',
    flags: [{ field: 'stem', kind: 'reconstructed', note: 'Read by Tesseract.js.' }],
  };
}

const tesseract: ParentScan = {
  extraction: 'tesseract',
  subject: 'english',
  paper_title: 'Worksheet 2',
  source_photo: 'src-01.jpg',
  note: 'Read with free Tesseract.',
  deskew: { applied: true, corners: [] },
  ink_pixels_lifted: 0,
  questions: [
    ocrQuestion('1', 'Ali is playing with his new toy. is having fun.', ['It', 'He', 'She']),
    ocrQuestion('2', 'Samad and Ali ____ cleaning the whiteboard.', ['is', 'are', 'was']),
    ocrQuestion('3', 'The horse jumped ____ the fence.', ['in', 'on', 'over']),
  ],
};

{
  const review = initialReview(tesseract);
  for (const question of tesseract.questions) {
    assert.deepEqual(review[question.id], { status: 'open' }, `Q${question.id} must not default to a choice`);
  }
  const progress = reviewProgress(tesseract, review);
  assert.equal(progress.unlocked, false);
  assert.deepEqual(progress.open, ['1', '2', '3']);
  assert.equal(buildPractice(tesseract, review), null, 'Play must stay locked before any pick');
  for (const question of parentCopy(tesseract, review).questions) {
    assert.equal(question.correct_answer, '', 'No answer is saved before the parent picks');
    assert.equal(question.review, 'open');
  }
}

{
  const partly: ReviewState = {
    '1': { status: 'picked', answer: 'He' },
    '2': { status: 'picked', answer: 'are' },
    '3': { status: 'open' },
  };
  assert.equal(reviewProgress(tesseract, partly).unlocked, false);
  assert.equal(buildPractice(tesseract, partly), null, 'One open question keeps play locked');

  const notAChoice: ReviewState = { ...partly, '3': { status: 'picked', answer: 'under' } };
  assert.equal(buildPractice(tesseract, notAChoice), null, 'A pick that is not a choice does not count');
}

{
  const allDropped: ReviewState = {
    '1': { status: 'dropped' },
    '2': { status: 'dropped' },
    '3': { status: 'dropped' },
  };
  const progress = reviewProgress(tesseract, allDropped);
  assert.equal(progress.dropped, 3);
  assert.equal(progress.unlocked, false);
  assert.equal(buildPractice(tesseract, allDropped), null, 'No practice when every question is dropped');
}

{
  const review: ReviewState = {
    '1': { status: 'picked', answer: 'He' },
    '2': { status: 'picked', answer: 'are' },
    '3': { status: 'dropped' },
  };
  const practice = buildPractice(tesseract, review) ?? fail('Play unlocks once every question is picked or dropped');

  assert.deepEqual(Object.keys(practice).sort(), ['grade', 'view']);
  assert.deepEqual(
    practice.view.questions.map((question) => question.id),
    ['1', '2'],
    'Dropped questions are left out of practice',
  );
  for (const question of practice.view.questions) {
    assert.deepEqual(Object.keys(question).sort(), ['choices', 'id', 'stem']);
  }
  assert.equal(JSON.stringify(practice), JSON.stringify({ view: practice.view }));
  assert.deepEqual(Object.getOwnPropertyNames(practice.grade).sort(), ['length', 'name']);
  assert.ok(!/\bHe\b|\bare\b/.test(practice.grade.toString()), 'Grader source must not hold an answer');
  assertChildViewSafe(parentCopy(tesseract, review), practice.view);

  assert.equal(practice.grade('1', 'He'), 'nice');
  assert.equal(practice.grade('1', 'It'), 'almost', 'The first choice is not the answer');
  assert.equal(practice.grade('2', 'are'), 'nice');
  assert.equal(practice.grade('3', 'over'), 'almost', 'Dropped questions are not graded');

  const saved = parentCopy(tesseract, review);
  assert.deepEqual(
    saved.questions.map((question) => [question.id, question.review, question.correct_answer]),
    [
      ['1', 'picked', 'He'],
      ['2', 'picked', 'are'],
      ['3', 'dropped', ''],
    ],
  );
  const savedChild = toChildView(saved);
  assertChildViewSafe(saved, savedChild);
  assert.ok(!JSON.stringify(savedChild).includes('picked'), 'Review status stays in the parent copy');
}

{
  const sample: ParentScan = {
    ...tesseract,
    extraction: 'stub',
    questions: [
      { ...ocrQuestion('1', 'Which word means a baby plant?', ['bloom', 'seedling']), correct_answer: 'seedling', flags: [] },
      {
        ...ocrQuestion('3', 'The plant needs ____ to grow.', ['water', 'soil']),
        correct_answer: 'water',
        flags: [{ field: 'correct_answer', kind: 'reconstructed', note: 'Guessed.' }],
      },
      { ...ocrQuestion('4', 'Read the sentence.', []), correct_answer: '', flags: [] },
    ],
  };
  const review = initialReview(sample);
  assert.deepEqual(review['1'], { status: 'picked', answer: 'seedling' }, 'An unflagged reader answer is kept');
  assert.deepEqual(review['3'], { status: 'open' }, 'A guessed reader answer waits for the parent');
  assert.deepEqual(review['4'], { status: 'read_aloud' });
}

{
  const stem = 'Ali is playing with his new toy. is having fun.';
  const words = stemWords(stem);
  assert.equal(words[7], 'is');
  assert.equal(blankBefore(stem, 7), 'Ali is playing with his new toy. ____ is having fun.');
  assert.equal(blankInstead('Ali is playing with his new toy. He is having fun.', 7), 'Ali is playing with his new toy. ____ is having fun.');
  assert.equal(blankInstead('Pour it into the jar.', 4), 'Pour it into the ____.');
  const han = '小明每天早上七点钟去学校。';
  assert.equal(stemWords(han).length, 12, 'each Han character can be tapped');
  assert.equal(stemWords(han)[11], '校。');
  assert.equal(blankBefore(han, 10), '小明每天早上七点钟去____学校。');
  assert.equal(blankInstead(blankInstead(han, 10), 11), '小明每天早上七点钟去____。', 'two taps blank a two-character word');
}

{
  assert.equal(
    explainPick('Ali is playing with his new toy. ____ is having fun.', 'He'),
    'Ali is playing with his new toy. He is having fun. “He” is the word for one boy or man. Here it stands for Ali.',
  );
  assert.equal(
    explainPick('Samad and Ali ____ cleaning the whiteboard.', 'are'),
    'Samad and Ali are cleaning the whiteboard. “are” goes with two or more people or things, or with “you”, now. Samad and Ali are two people.',
  );
  assert.equal(
    explainPick('The horse jumped ____ the fence.', 'over'),
    'The horse jumped over the fence. “over” means going across the top of something, from one side to the other.',
  );
  assert.equal(
    explainPick('Fiona fell down ____ hurt her knee.', 'and'),
    'Fiona fell down and hurt her knee. “and” joins two things that both happen or are both true.',
  );
  assert.equal(
    explainPick('Ali is playing with his new toy. is having fun.', 'He'),
    'The answer you picked is “He”. “He” is the word for one boy or man. Here it stands for Ali.',
  );

  const review: ReviewState = {
    '1': { status: 'picked', answer: 'He' },
    '2': { status: 'open' },
    '3': { status: 'dropped' },
  };
  const blanked = {
    ...tesseract,
    questions: tesseract.questions.map((question) =>
      question.id === '1' ? { ...question, stem: 'Ali is playing with his new toy. ____ is having fun.' } : question,
    ),
  };
  const copy = parentCopy(blanked, review);
  const [one, two, three] = copy.questions;
  assert.ok(one.explanation.startsWith('Ali is playing with his new toy. He is having fun.'));
  assert.deepEqual(
    one.flags.filter((flag) => flag.field === 'explanation').map((flag) => [flag.kind, flag.note]),
    [['generated', EXPLAIN_FLAG_NOTE]],
    'The explanation is flagged as written by Sprout',
  );
  assert.equal(two.explanation, tesseract.questions[1].explanation, 'No explanation before a pick');
  assert.equal(three.explanation, tesseract.questions[2].explanation, 'No explanation for a dropped question');

  const unlocked = buildPractice(blanked, { ...review, '2': { status: 'picked', answer: 'are' } });
  const childBlob = JSON.stringify(unlocked ?? fail('practice should open'));
  assert.ok(!childBlob.includes('He is having fun'), 'The filled-in sentence stays with the parent');
  assert.ok(!childBlob.includes('stands for'), 'The explanation stays with the parent');
}

console.log('review gate test passed');
