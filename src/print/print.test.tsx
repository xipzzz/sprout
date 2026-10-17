/* Proves the printed child pages carry no answers, and the answer key only
   prints from the parent side with the PIN.
   Run: node --import ./scripts/register-tsx.mjs src/print/print.test.tsx */

import { renderToStaticMarkup } from 'react-dom/server';
import { assertChildViewSafe, toChildView } from '../exam/childView.ts';
import type { ChildView, ParentScan } from '../exam/types.ts';
import { lockParent, setParentPin, unlockParent } from '../parent/pin.ts';
import { check, installMemoryStorage, throws } from '../parent/testing.ts';
import { YEAR_GROUPS, YEAR_SETTINGS } from '../parent/yearGroup.ts';
import ExamChildPractice from '../screens/ExamChildPractice.tsx';
import { AnswerKeyPage, ChildWorksheetPage, PrintPages } from './PrintSheets.tsx';
import { buildAnswerKey } from './worksheet.ts';

installMemoryStorage();

const scan: ParentScan = {
  extraction: 'stub',
  subject: 'math',
  paper_title: 'Maths homework',
  source_photo: 'sample.png',
  note: 'stub',
  deskew: { applied: true, corners: [] },
  ink_pixels_lifted: 0,
  questions: [
    {
      id: '1',
      stem: 'Which word means a baby plant?',
      choices: ['bloom', 'seedling', 'root', 'fence'],
      student_answer: 'bloom',
      teacher_mark: '×',
      correct_answer: 'seedling',
      explanation: 'A seedling is a baby plant that has just started to grow.',
      flags: [{ field: 'explanation', kind: 'generated', note: 'Parent-only note about seedling.' }],
    },
    {
      id: '2',
      stem: 'A triangle has angles 94 and 38. What is the third angle?',
      choices: [],
      student_answer: '52 degrees',
      teacher_mark: '1/2',
      correct_answer: '48 degrees',
      explanation: 'Angles in a triangle add to 180, so 180 - 94 - 38 = 48.',
      flags: [{ field: 'correct_answer', kind: 'generated', note: 'Worked out by Sprout from the sum rule.' }],
    },
    {
      id: '3',
      stem: 'She ____ a red bag.',
      choices: ['have', 'has'],
      student_answer: 'has',
      teacher_mark: '✓',
      correct_answer: 'has',
      explanation: 'She is one person, so the matching word is has.',
      flags: [],
    },
  ],
};

const childOnlyChoices = new Set(scan.questions.flatMap((q) => q.choices));
const secrets = [
  ...scan.questions.flatMap((q) => [q.correct_answer, q.student_answer, q.teacher_mark, q.explanation]),
  ...scan.questions.flatMap((q) => q.flags.map((flag) => flag.note)),
].filter((text) => text && !childOnlyChoices.has(text));
const parentWords = ['Answer key', 'For the parent', 'Child wrote', 'answer-key', 'print-key'];

function assertNoAnswers(html: string, where: string) {
  for (const secret of [...secrets, ...parentWords]) {
    check(!html.includes(secret), `${where} leaked "${secret}"`);
  }
  for (const question of scan.questions) {
    for (const choice of question.choices) {
      const plain = `<li><span class="print-q__circle" aria-hidden="true"></span>${choice}</li>`;
      if (html.includes('print-q__circle')) {
        check(html.includes(plain), `${where} styled choice "${choice}" differently from the others`);
      }
    }
  }
}

const view = toChildView(scan);
assertChildViewSafe(scan, view);

let lastInstructions = '';
for (const year of YEAR_GROUPS) {
  const html = renderToStaticMarkup(<ChildWorksheetPage view={view} settings={YEAR_SETTINGS[year]} />);
  assertNoAnswers(html, `child print page (${year})`);
  check(html.includes('data-print="child-page"'), 'child page marker');
  check(html.includes(year), `child page shows ${year}`);
  for (const question of scan.questions) check(html.includes(question.stem), `stem ${question.id} printed`);
  const instructions = html.match(/print-sheet__instructions">([^<]+)</)?.[1] ?? '';
  check(instructions !== lastInstructions, `${year} wording differs from the year before`);
  lastInstructions = instructions;
}

const childJobHtml = renderToStaticMarkup(<PrintPages job={{ kind: 'child', view }} settings={YEAR_SETTINGS.P2} />);
assertNoAnswers(childJobHtml, 'child print job');

throws(
  () => renderToStaticMarkup(<ChildWorksheetPage view={scan as unknown as ChildView} settings={YEAR_SETTINGS.P1} />),
  /refused/,
  'child print page refuses the parent scan',
);
const sneaky = { ...view, questions: view.questions.map((q) => ({ ...q, correct_answer: 'x' })) };
throws(
  () => renderToStaticMarkup(<ChildWorksheetPage view={sneaky as ChildView} settings={YEAR_SETTINGS.P1} />),
  /refused/,
  'child print page refuses a question with an answer field',
);

const childScreenHtml = renderToStaticMarkup(
  <ExamChildPractice view={view} onGrade={() => 'almost'} onBack={() => {}} onExit={() => {}} />,
);
assertNoAnswers(childScreenHtml, 'child practice screen');
check(childScreenHtml.includes('Print this worksheet'), 'child screen has a print button');

lockParent();
throws(() => buildAnswerKey(scan), /parent page/, 'answer key data refuses to build while locked');
const lockedKey = renderToStaticMarkup(<AnswerKeyPage scan={scan} />);
assertNoAnswers(lockedKey, 'answer key while locked');
const lockedJob = renderToStaticMarkup(
  <PrintPages job={{ kind: 'parent', scan, withKey: true }} settings={YEAR_SETTINGS.P2} />,
);
assertNoAnswers(lockedJob, 'parent print while locked');

setParentPin('2580');
check(unlockParent('2580'), 'right PIN unlocks');
const parentJob = renderToStaticMarkup(
  <PrintPages job={{ kind: 'parent', scan, withKey: true }} settings={YEAR_SETTINGS.P2} />,
);
const keyAt = parentJob.indexOf('data-print="answer-key"');
const childAt = parentJob.indexOf('data-print="child-page"');
check(childAt >= 0 && keyAt > childAt, 'question pages come first, the answer key last');
assertNoAnswers(parentJob.slice(0, keyAt), 'child pages inside the parent print');
throws(() => assertNoAnswers(parentJob, 'full parent print'), /leaked/, 'leak check catches the answer key');
const keyHtml = parentJob.slice(keyAt);
for (const question of scan.questions) {
  check(keyHtml.includes(question.correct_answer), `answer key has the answer for Q${question.id}`);
}

const worksheetOnly = renderToStaticMarkup(
  <PrintPages job={{ kind: 'parent', scan, withKey: false }} settings={YEAR_SETTINGS.P2} />,
);
assertNoAnswers(worksheetOnly, 'parent worksheet without key');
lockParent();

console.log('print test passed: child pages have no answers, answer key is parent only');
