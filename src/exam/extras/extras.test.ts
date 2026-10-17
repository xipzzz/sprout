/* Explain card, similar practice and hints: answers stay parent side.
   Run: node --experimental-strip-types src/exam/extras/extras.test.ts */

import { assertChildViewSafe, toChildView } from '../childView.ts';
import fixture from '../fixture.json' with { type: 'json' };
import type { ChildView, ParentQuestion, ParentScan } from '../types.ts';
import { explainKey, explainNow, explainQuestion, memoryCache, type ExplainSource } from './explain.ts';
import { containsAnswer, hintFor, PLAIN_HINT, safeHint, scanHint } from './hints.ts';
import { mathsSampleScan } from './mathsSample.ts';
import { applyParentPick, clearPicks, getPick } from './picks.ts';
import {
  answerFits,
  assertPracticeChildSafe,
  attemptsFor,
  gradePractice,
  makeSimilar,
  practiceHint,
  recordAttempt,
  startPractice,
  toPracticeChildView,
  verifyVariant,
  type PracticeSet,
} from './practice.ts';
import { parseMath } from './arithmetic.ts';
import { EXTRAS_DEFAULTS, extrasSettings } from './settings.ts';

let passed = 0;
function check(name: string, ok: boolean, detail = '') {
  if (!ok) throw new Error(`FAIL ${name}${detail ? `: ${detail}` : ''}`);
  passed += 1;
}

function q(id: string, stem: string, choices: string[] = [], extra: Partial<ParentQuestion> = {}): ParentQuestion {
  return { id, stem, choices, student_answer: '', teacher_mark: '', correct_answer: '', explanation: '', flags: [], ...extra };
}

const PLACEHOLDER = { field: 'correct_answer' as const, kind: 'reconstructed' as const, note: 'First choice is only a placeholder.' };

/* Real Tesseract read of prototype/exam/fixtures/01-local-worksheet1.jpg, as the server parses it. */
const worksheet: ParentScan = {
  extraction: 'tesseract',
  subject: 'english',
  paper_title: 'Worksheet 2',
  source_photo: '01-local-worksheet1.jpg',
  note: '',
  deskew: { applied: true, corners: [] },
  ink_pixels_lifted: 0,
  questions: [
    q('1', 'Ali is playing with his new toy. is having fun.', ['It', 'He', 'She'], { correct_answer: 'It', flags: [PLACEHOLDER] }),
    q('2', 'Samad and Ali ____ cleaning the whiteboard.', ['is', 'are', 'was'], { correct_answer: 'is', flags: [PLACEHOLDER] }),
    q('3', 'The horse jumped the fence to get to the other side of the field.', ['in', 'on', 'over'], { correct_answer: 'in', flags: [PLACEHOLDER] }),
    q('4', '"Please pour the sugar ____ the jar” said Mrs Lim.', ['in', 'into', 'through'], { correct_answer: 'in', flags: [PLACEHOLDER] }),
    q('5', 'Fiona fell down ____ hurt her knee.', ['or', 'so', 'and'], { correct_answer: 'or', flags: [PLACEHOLDER] }),
  ],
};

const fixtureScan: ParentScan = {
  extraction: 'stub',
  subject: fixture.subject,
  paper_title: fixture.paper_title,
  source_photo: 'sample-exam-english.png',
  note: '',
  deskew: { applied: true, corners: [] },
  ink_pixels_lifted: 0,
  questions: fixture.questions as ParentQuestion[],
};

const maths = mathsSampleScan();

/* ---------- Slice 7: explain card ---------- */

const mathsCases: Array<[string, string, string, string[]]> = [
  ['What is 94 + 38?', 'maths-add', '132', ['4 + 8 = 12', '9 + 3 + 1 carried = 13']],
  ['Work out 503 - 267.', 'maths-take-away', '236', ['13 - 7 = 6', '9 - 6 = 3', '4 - 2 = 2']],
  ['What is 23 x 4?', 'maths-times', '92', ['20 x 4 = 80', '3 x 4 = 12', '80 + 12 = 92']],
  ['6 × 7 = ?', 'maths-times', '42', ['6 x 7 = 42']],
  ['56 ÷ 8 = ___', 'maths-share', '7', ['7 x 8 = 56']],
  ['17 ÷ 5 = ?', 'maths-share', '3 R 2', ['3 x 5 = 15', '17 - 15 = 2']],
  ['9 + ___ = 15', 'maths-missing', '6', ['15 - 9 = 6', '9 + 6 = 15']],
  ['___ - 4 = 10', 'maths-missing', '14', ['10 + 4 = 14']],
  ['Work out 180 - 94 - 38.', 'maths-left-to-right', '48', ['180 - 94 = 86', '86 - 38 = 48']],
  ['What is 3 + 4 x 5?', 'maths-mixed', '23', ['4 x 5 = 20', '3 + 20 = 23']],
  ['Ali has 42 stickers. He gives away 17. How many stickers does Ali have left?', 'maths-word', '25', ['"left"', '12 - 7 = 5']],
  ['There are 6 bags with 4 apples in each bag. How many apples are there altogether?', 'maths-word', '24', ['6 x 4 = 24']],
];

for (const [stem, template, answer, mustHave] of mathsCases) {
  const cache = memoryCache();
  const card = explainNow({ subject: 'math', question: q('m', stem) }, cache);
  check(`maths ${stem} template`, card.template === template, card.template);
  check(`maths ${stem} answer`, card.answer === answer, card.answer);
  check(`maths ${stem} source`, card.answerSource === 'worked-out', card.answerSource);
  const steps = card.steps.join(' ');
  for (const piece of mustHave) check(`maths ${stem} step uses "${piece}"`, steps.includes(piece), steps);
  check(`maths ${stem} has script and check question`, Boolean(card.sayAloud && card.followUp));
  check(`maths ${stem} under one second`, card.ms < 1000, `${card.ms}ms`);
  check(`maths ${stem} not from cache first`, !card.fromCache);
  const again = explainNow({ subject: 'math', question: q('m', stem) }, cache);
  check(`maths ${stem} second open uses the cache`, again.fromCache && again.key === card.key);
}

const grammarCases: Array<[string, string, string]> = [
  ['1', 'english-pronoun', 'He'],
  ['2', 'english-is-are', 'are'],
  ['3', 'english-preposition', 'over'],
  ['4', 'english-preposition', 'into'],
  ['5', 'english-conjunction', 'and'],
];
for (const [id, template, answer] of grammarCases) {
  const question = worksheet.questions.find((item) => item.id === id)!;
  const card = explainNow({ subject: 'english', question }, memoryCache());
  check(`grammar Q${id} template`, card.template === template, card.template);
  check(`grammar Q${id} rule answer beats the placeholder`, card.answer === answer && card.answerSource === 'rule', `${card.answer} ${card.answerSource}`);
  check(`grammar Q${id} has a rule line`, card.rule.length > 10);
  check(`grammar Q${id} steps quote the sentence`, card.steps.some((step) => step.includes(answer)));
}
{
  const hasCard = explainNow({ subject: 'english', question: fixtureScan.questions[1] }, memoryCache());
  check('have/has uses the page answer', hasCard.template === 'english-have-has' && hasCard.answer === 'has' && hasCard.answerSource === 'page');
  check('have/has step', hasCard.steps.some((step) => step.includes('She has a red bag')));
  const vocab = explainNow({ subject: 'english', question: fixtureScan.questions[0] }, memoryCache());
  check('unknown type still gives a card', !vocab.supported && vocab.template === 'not-yet' && Boolean(vocab.followUp));
}

/* Parent pick wins */
{
  clearPicks();
  const picked = applyParentPick(worksheet, '3', 'on');
  const question = picked.questions[2];
  check('pick stored', getPick('english', question) === 'on');
  check('pick sets the practice answer', question.correct_answer === 'on');
  check('pick clears the placeholder flag', !question.flags.some((flag) => flag.field === 'correct_answer'));
  check('pick leaves the child answer alone', question.student_answer === worksheet.questions[2].student_answer);
  const card = explainNow({ subject: 'english', question, pick: getPick('english', question) }, memoryCache());
  check('card uses the parent pick', card.answer === 'on' && card.answerSource === 'parent');
  check('card notes the rule disagrees', card.notes.some((note) => note.includes('"over"')));
  const ruleCard = explainNow({ subject: 'english', question: worksheet.questions[0] }, memoryCache());
  check('rule over a guess says practice still uses the guess', ruleCard.notes.some((note) => note.includes('"It"')));
  const mathsPick = explainNow({ subject: 'math', question: maths.questions[0], pick: '122' }, memoryCache());
  check('maths card uses the pick and flags the mismatch', mathsPick.answer === '122' && mathsPick.notes.some((n) => n.includes('132')));
  clearPicks();
}

/* Cause of error compares the child's answer, parent view only */
{
  const card = explainNow({ subject: 'math', question: maths.questions[0] }, memoryCache());
  check('cause of error for a missed carry', card.notes.some((note) => note.includes('122') && note.includes('carry')));
}

/* Cache key: template version + subject + question id + content hash */
{
  const base = { subject: 'math', question: maths.questions[0] };
  const key = explainKey(base);
  check('key starts with version, subject and id', key.startsWith('v1:math:1:'), key);
  check('same id, other page, other key', explainKey({ ...base, question: { ...maths.questions[0], stem: 'What is 5 + 6?' } }) !== key);
  check('other year, other key', explainKey({ ...base, year: 'P4' }) !== key);
}

/* Year group wording */
{
  const p1 = explainNow({ subject: 'math', question: maths.questions[0], year: 'P1' }, memoryCache());
  const p4 = explainNow({ subject: 'math', question: maths.questions[0], year: 'P4' }, memoryCache());
  check('P1 script is shorter than P4', p1.sayAloud.length < p4.sayAloud.length, `${p1.sayAloud} | ${p4.sayAloud}`);
  check('P1 check question is shorter than P4', p1.followUp.length < p4.followUp.length);
  check('steps keep the real numbers at every year', p1.steps.join() === p4.steps.join());
  check('?year=P3 is read', extrasSettings('?year=p3').year === 'P3' && extrasSettings('?year=P9').year === EXTRAS_DEFAULTS.year);
}

/* Pluggable source: a later local model can answer first; a broken one falls back */
{
  const fake: ExplainSource = {
    id: 'fake-local-model',
    label: 'Test model',
    explain: async () => ({ ...explainNow({ subject: 'math', question: maths.questions[1] }, memoryCache()), sayAloud: 'From the test model.' }),
  };
  const broken: ExplainSource = {
    id: 'broken',
    label: 'Broken',
    explain: () => {
      throw new Error('offline');
    },
  };
  const fromFake = await explainQuestion({ subject: 'math', question: maths.questions[1] }, memoryCache(), [fake]);
  check('first source wins', fromFake.source === 'fake-local-model' && fromFake.sayAloud === 'From the test model.');
  const fromBroken = await explainQuestion({ subject: 'math', question: maths.questions[1] }, memoryCache(), [broken]);
  check('broken source falls back to local templates', fromBroken.source === 'local-templates' && fromBroken.answer === '236');
}

/* ---------- Child data: nothing from the card reaches it ---------- */

function cardSecrets(scan: ParentScan): string[] {
  const cache = memoryCache();
  const secrets: string[] = [];
  for (const question of scan.questions) {
    const card = explainNow({ subject: scan.subject, question, pick: getPick(scan.subject, question) }, cache);
    secrets.push(...card.steps, card.sayAloud, card.rule, card.followUp, ...card.notes);
  }
  return secrets.filter((text) => text.length > 3);
}

for (const scan of [worksheet, fixtureScan, maths, applyParentPick(worksheet, '1', 'He')]) {
  const child = toChildView(scan);
  assertChildViewSafe(scan, child);
  const blob = JSON.stringify(child);
  for (const secret of cardSecrets(scan)) {
    check(`child view of ${scan.paper_title} has no card text`, !blob.includes(secret), secret);
  }
  scan.questions.forEach((question, index) => {
    const card = explainNow({ subject: scan.subject, question }, memoryCache());
    if (card.answer && !question.choices.includes(card.answer)) {
      check(`child view of ${scan.paper_title} Q${question.id} has no worked answer`, !containsAnswer(child.questions[index].stem, card.answer));
    }
  });
}
clearPicks();

/* ---------- Slice 8: similar practice ---------- */

function childBlob(view: ChildView) {
  return JSON.stringify(view);
}

for (const question of maths.questions) {
  for (const count of [3, 7, 10]) {
    const set = makeSimilar(question, 'math', count);
    check(`similar ${question.stem} x${count} made`, Boolean(set), 'no set');
    const made = set as PracticeSet;
    check(`similar ${question.stem} x${count} count`, made.variants.length === count, String(made.variants.length));
    check(`similar ${question.stem} x${count} all new`, new Set(made.variants.map((v) => v.stem)).size === count && !made.variants.some((v) => v.stem === question.stem));
    for (const variant of made.variants) {
      check(`variant ${variant.stem} verified`, verifyVariant(variant));
      const card = explainNow({ subject: 'math', question: { ...q(variant.id, variant.stem, variant.choices) } }, memoryCache());
      const bare = variant.answer.replace(/[^\dR ]/g, '').trim();
      check(`variant ${variant.stem} answer matches a fresh explain`, card.answer === variant.answer || card.answer.replace(/[^\dR ]/g, '').trim() === bare, `${card.answer} vs ${variant.answer}`);
      check(`variant ${variant.stem} keeps choices shape`, variant.choices.length === question.choices.length);
    }
    const run = startPractice(made);
    const blob = childBlob(run.view);
    check(`similar ${question.stem} child keys`, run.view.questions.every((item) => Object.keys(item).sort().join(',') === 'choices,id,stem'));
    check(`similar ${question.stem} child has no answer field`, !/"(answer|correct_answer|steps|followUp|sayAloud|rule)"/.test(blob));
    made.variants.forEach((variant, index) => {
      const item = run.view.questions[index];
      check(`similar ${variant.stem} stem hides answer`, !containsAnswer(item.stem, variant.answer.replace(/[^\dR ]/g, '').trim()));
      if (!variant.choices.length) check(`typed ${variant.stem} hides answer`, !containsAnswer(JSON.stringify(item), variant.answer));
    });
  }
}
check('3 to 10 is enforced', makeSimilar(maths.questions[0], 'math', 1)!.variants.length === 3 && makeSimilar(maths.questions[0], 'math', 50)!.variants.length === 10);
check('non maths gives no similar set', makeSimilar(worksheet.questions[0], 'english', 3) === null);

/* Wrong variants are dropped before the child sees them */
{
  const set = makeSimilar(maths.questions[1], 'math', 3)!;
  const tampered: PracticeSet = { ...set, variants: [...set.variants, { id: 'similar-z', stem: 'Work out 400 - 100.', choices: [], answer: '200' }] };
  check('a wrong answer fails the check', !verifyVariant(tampered.variants[3]));
  const run = startPractice(tampered);
  check('startPractice drops the wrong one', run.set.variants.length === 3 && !run.view.questions.some((item) => item.id === 'similar-z'));
  check('answer check rejects a near miss', !answerFits(parseMath('What is 94 + 38?')!.problem, '122'));
  check('answer check takes remainders', answerFits(parseMath('17 ÷ 5 = ?')!.problem, '3 R 2'));
  let threw = false;
  try {
    assertPracticeChildSafe(set, { subject: 'math', questions: [{ ...toPracticeChildView(set).questions[0], answer: '1' } as never] });
  } catch {
    threw = true;
  }
  check('practice guard rejects an extra field', threw);
}

/* Child answer, correct answer and right or wrong are separate fields */
{
  const set = makeSimilar(maths.questions[0], 'math', 3)!;
  const first = set.variants[0];
  const wrongChoice = first.choices.find((choice) => choice !== first.answer)!;
  check('wrong choice grades almost', gradePractice(set, first.id, wrongChoice) === 'almost');
  check('right choice grades nice', gradePractice(set, first.id, first.answer) === 'nice');
  const log = attemptsFor(maths.questions[0]);
  check('attempts keep separate fields', log.length === 2 && log.every((a) => Object.keys(a).sort().join(',') === 'child_answer,correct_answer,id,is_correct'));
  check('attempt values', log[0].child_answer === wrongChoice && log[0].correct_answer === first.answer && log[0].is_correct === false && log[1].is_correct === true);
  const typed = makeSimilar(maths.questions[2], 'math', 3)!;
  const attempt = recordAttempt(typed, typed.variants[0].id, ` ${typed.variants[0].answer} `);
  check('typed answer with spaces is right', attempt.is_correct);
}

/* ---------- Slice 9: try first, then a hint ---------- */

const cache = memoryCache();
const allScans = [worksheet, fixtureScan, maths];
for (const scan of allScans) {
  for (const question of scan.questions) {
    check(`no hint before a try ${question.stem}`, scanHint(scan, question.id, 0, cache) === null);
    const hint = scanHint(scan, question.id, 1, cache);
    check(`hint after one wrong try ${question.stem}`, typeof hint === 'string' && hint.length > 0);
    const card = explainNow({ subject: scan.subject, question }, cache);
    for (const answer of [card.answer, question.correct_answer]) {
      if (answer) check(`hint hides "${answer}" for ${question.stem}`, !containsAnswer(hint!, answer), hint!);
    }
    check(`hint is not a step for ${question.stem}`, !card.steps.includes(hint!));
    check(`hints off means none ${question.stem}`, scanHint(scan, question.id, 2, cache, { ...EXTRAS_DEFAULTS, hints: false }) === null);
  }
}
for (const year of ['P1', 'P4'] as const) {
  for (const question of maths.questions) {
    const set = makeSimilar(question, 'math', 10, `seed-${year}`)!;
    for (const variant of set.variants) {
      check(`practice hint gated ${variant.stem}`, practiceHint(set, variant.id, 0, cache) === null);
      const hint = practiceHint(set, variant.id, 1, cache, { ...EXTRAS_DEFAULTS, year })!;
      check(`practice hint hides answer ${variant.stem}`, Boolean(hint) && !containsAnswer(hint, variant.answer), hint);
    }
  }
}
check('leaky hint is swapped for the plain one', safeHint('The answer is 48.', ['48']) === PLAIN_HINT);
check('word edges: "he" is not in "the"', !containsAnswer('Read the line', 'He') && containsAnswer('Is it he?', 'He'));
check('number edges: 7 is not in 17', !containsAnswer('17 + 25', '7') && containsAnswer('7 + 1', '7'));
check('hintFor needs a wrong try', hintFor({ subject: 'math', question: maths.questions[0], wrongTries: 0, cache }) === null);

console.log(`explain, practice and hint tests passed (${passed} checks)`);
