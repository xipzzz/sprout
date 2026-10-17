/* Topic tags, mistake notebook, mistakes-only round, weak topics.
   The round checks extend the no-answers rule: the child payload has stems and choices only.
   Run: node --experimental-strip-types src/exam/mistakes.test.ts */

import { MAX_ROUND, assertRoundSafe, buildMistakesRound, gradeRoundAnswer, sessionFromTries } from './mistakesRound.ts';
import {
  groupNotebook,
  loadNotebook,
  loadReview,
  loadSessions,
  rankWeakTopics,
  recordSession,
  removeEntry,
  scanKeyOf,
  updateQuestion,
  type KeyValue,
} from './notebook.ts';
import { notebookPayload } from './notebookApi.ts';
import { TOPICS, effectiveSubject, guessTopic, topicsFor } from './topics.ts';
import type { ParentQuestion, ParentScan } from './types.ts';

let passed = 0;
function check(name: string, ok: boolean, detail = '') {
  if (!ok) throw new Error(`FAIL ${name}${detail ? `: ${detail}` : ''}`);
  passed += 1;
  console.log(`ok ${name}`);
}

function memoryStore(): KeyValue & { dump(): string } {
  const data = new Map<string, string>();
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
    dump: () => [...data.values()].join('\n'),
  };
}

function q(id: string, stem: string, choices: string[], student: string, correct: string, mark = ''): ParentQuestion {
  return {
    id,
    stem,
    choices,
    student_answer: student,
    teacher_mark: mark,
    correct_answer: correct,
    explanation: `Parent-only note for ${id}: the answer is ${correct}.`,
    flags: [{ field: 'correct_answer', kind: 'reconstructed', note: `Guessed ${correct} for ${id}.` }],
  };
}

function scanOf(subject: string, title: string, questions: ParentQuestion[]): ParentScan {
  return {
    extraction: 'stub',
    subject,
    paper_title: title,
    source_photo: `${title}.jpg`,
    note: '',
    deskew: { applied: true, corners: [] },
    ink_pixels_lifted: 0,
    questions,
  };
}

const english = scanOf('english', 'English homework', [
  q('1', 'Which word means a baby plant?', ['bloom', 'seedling', 'root', 'fence'], 'seedling', 'seedling', '✓'),
  q('2', 'She ____ a red bag.', ['have', 'has'], 'has', 'has', '✓'),
  q('3', 'The plant needs ____ to grow.', ['water', 'soil', 'light', 'wind'], 'watr-secret', 'water', '×'),
]);

const maths = scanOf('math', 'Maths worksheet', [
  q('1', '25 + 17 = ____', [], '41-secret', '42'),
  q('2', '6 x 7 = ____', [], '42', '42'),
  q('3', 'What is 3/4 of 12?', [], '8-secret', '9'),
  q('4', 'Ali has $5. He buys a pen for $2. How much change does he get?', [], '$3', '$3'),
  q('5', 'The lesson starts at 9.30 a.m. and ends at 10.15 a.m. How long is it in minutes?', [], '45', '45'),
  q('6', 'How many sides does a triangle have?', [], '3', '3'),
  q('7', 'Find the perimeter of a square with sides of 4 cm.', [], '16 cm', '16 cm'),
  q('8', 'Sam had 45 stickers. He gave 18 stickers to his friend and bought 9 more. How many stickers does he have now?', [], '30-secret', '36'),
  q('9', 'Which is the greatest number: 305, 350, 503?', ['305', '350', '503'], '503', '503'),
  q('10', 'Share 20 sweets equally among 4 children. How many does each child get?', [], '5', '5'),
]);

// Slice 4: topic tags from local keyword rules.
const expectTopics: [ParentQuestion, string, string][] = [
  [english.questions[0], 'english', 'en-vocabulary'],
  [english.questions[1], 'english', 'en-agreement'],
  [english.questions[2], 'english', 'en-vocabulary'],
  [q('w1', 'Ali is playing with his new toy. ____ is having fun.', ['It', 'He', 'She'], '', ''), 'english', 'en-pronouns'],
  [q('w3', 'The horse jumped ____ the fence.', ['in', 'on', 'over'], '', ''), 'english', 'en-prepositions'],
  [q('w5', 'Fiona fell down ____ hurt her knee.', ['or', 'so', 'and'], '', ''), 'english', 'en-conjunctions'],
  [q('w6', 'Put a full stop or a question mark at the end.', [], '', ''), 'english', 'en-punctuation'],
  [maths.questions[0], 'math', 'math-add-subtract'],
  [maths.questions[1], 'math', 'math-multiply-divide'],
  [maths.questions[2], 'math', 'math-fractions'],
  [maths.questions[3], 'math', 'math-money'],
  [maths.questions[4], 'math', 'math-time'],
  [maths.questions[5], 'math', 'math-shapes-patterns'],
  [maths.questions[6], 'math', 'math-area-perimeter'],
  [maths.questions[7], 'math', 'math-word-problems'],
  [maths.questions[8], 'math', 'math-whole-numbers'],
  [maths.questions[9], 'math', 'math-multiply-divide'],
  [q('m11', 'Measure the angle. Is it a right angle?', [], '', ''), 'math', 'math-angles'],
  [q('m12', 'The bag weighs 3 kg. The box is 2 kg heavier. What is the mass of the box?', [], '', ''), 'math', 'math-measurement'],
];
for (const [question, subject, topic] of expectTopics) {
  const guess = guessTopic(question, subject);
  check(`topic ${question.id} "${question.stem.slice(0, 30)}" -> ${topic}`, guess.topic === topic, `got ${guess.topic}`);
}
const ocrMaths = scanOf('english', 'Maths worksheet', [
  q('1', '25+17= ____', [], '', ''),
  q('2', '6xX7= ____', [], '', ''),
  q('3', 'How many sides does a triangle have?', [], '', ''),
  q('4', 'The lesson starts at 9.30 a.m. and ends at 10.15 a.m. How long is it?', [], '', ''),
]);
check('a maths page the OCR labelled English is treated as maths', effectiveSubject(ocrMaths) === 'math');
check('the English sample stays English', effectiveSubject(english) === 'english');
const ocrReview = loadReview(memoryStore(), ocrMaths);
check(
  'OCR maths topics use the maths list',
  ocrReview['1'].topic === 'math-add-subtract' && ocrReview['2'].topic === 'math-multiply-divide' && ocrReview['3'].topic === 'math-shapes-patterns' && ocrReview['4'].topic === 'math-time',
  JSON.stringify(ocrReview),
);
check('topic ids are unique', new Set(TOPICS.map((t) => t.id)).size === TOPICS.length);
check('maths list is the fixed P1 to P4 list', topicsFor('math').every((t) => t.subject === 'math') && topicsFor('math').length >= 14);
check('english list is fixed', topicsFor('english').every((t) => t.subject === 'english'));

// Slice 4: every question has a topic, and a parent change survives a reload.
const store = memoryStore();
const englishReview = loadReview(store, english);
check('every question gets a topic', english.questions.every((item) => Boolean(englishReview[item.id]?.topic)));
updateQuestion(store, english, '2', { topic: 'en-tenses' });
const reloaded = loadReview(store, english);
check('topic change persists after reload', reloaded['2'].topic === 'en-tenses' && reloaded['2'].topicSource === 'parent');
check('scan key is stable', scanKeyOf(english) === scanKeyOf(JSON.parse(JSON.stringify(english))));

// Only a parent tap saves a mistake. The teacher's cross on the photo is a hint, not a save.
check('teacher cross alone saves nothing', loadNotebook(store).length === 0 && loadReview(store, english)['3'].mark === 'unmarked');

// Slice 5: two wrong questions from two scans, grouped by subject then topic with counts.
updateQuestion(store, english, '3', { mark: 'wrong' });
updateQuestion(store, maths, '3', { mark: 'wrong' });
updateQuestion(store, maths, '6', { mark: 'right' });
let groups = groupNotebook(loadNotebook(store));
const groupText = JSON.stringify(groups.map((g) => [g.label, g.count, g.topics.map((t) => [t.label, t.entries.length])]));
check('notebook has both mistakes', loadNotebook(store).length === 2, groupText);
const firstEntry = loadNotebook(store)[0];
check(
  'child answer, practice answer and parent mark are separate fields',
  firstEntry.student_answer === 'watr-secret' && firstEntry.correct_answer === 'water' && firstEntry.parent_mark === 'wrong',
);
check(
  'grouped by subject then topic',
  groupText === JSON.stringify([
    ['English', 1, [['Word meaning (vocabulary)', 1]]],
    ['Maths', 1, [['Fractions', 1]]],
  ]),
  groupText,
);
updateQuestion(store, maths, '1', { mark: 'wrong' });
updateQuestion(store, maths, '8', { mark: 'wrong' });
updateQuestion(store, maths, '1', { mark: 'wrong' });
groups = groupNotebook(loadNotebook(store));
check('same question twice is not duplicated', loadNotebook(store).length === 4);
check('maths count updates', groups.find((g) => g.subject === 'math')?.count === 3);
const retag = updateQuestion(store, maths, '8', { topic: 'math-add-subtract' });
check('retag moves the notebook entry', retag.change.kind === 'retagged' && loadNotebook(store).find((e) => e.questionId === '8' && e.scanKey === scanKeyOf(maths))?.topic === 'math-add-subtract');
updateQuestion(store, maths, '8', { topic: 'math-word-problems' });
const right = updateQuestion(store, english, '3', { mark: 'right' });
check('marking right takes it out', right.change.kind === 'removed' && loadNotebook(store).length === 3);
updateQuestion(store, english, '3', { mark: 'wrong' });

// Slice 6: practise mistakes only. 3 of 10 wrong on the maths page gives exactly 3.
const round = buildMistakesRound(loadNotebook(store), { kind: 'scan', scanKey: scanKeyOf(maths) });
check('mistakes round has exactly the 3 wrong questions', round.view.questions.length === 3);
check(
  'round keeps notebook stems',
  JSON.stringify(round.view.questions.map((item) => item.stem).sort()) ===
    JSON.stringify([maths.questions[0].stem, maths.questions[2].stem, maths.questions[7].stem].sort()),
);
const blob = JSON.stringify(round.view);
const banned = [
  '41-secret', '8-secret', '30-secret', 'watr-secret', 'Parent-only note', 'Guessed',
  'correct_answer', 'student_answer', 'teacher_mark', 'explanation', 'flags', 'topic', 'scanKey',
  'Maths worksheet', scanKeyOf(maths), '"42"', '"9"', '"36"', 'parent_mark', 'wrong',
];
for (const secret of banned) check(`child round JSON has no ${secret}`, !blob.includes(secret), blob);
check(
  'child round questions are the child shape',
  round.view.questions.every((item) => Object.keys(item).sort().join(',') === 'choices,id,stem'),
);
check('child round ids are opaque', round.view.questions.every((item, index) => item.id === `q${index + 1}`));

let tamperCaught = false;
try {
  const leaky = { ...round, view: { ...round.view, questions: round.view.questions.map((item) => ({ ...item, correct_answer: '42' })) } };
  assertRoundSafe(leaky);
} catch {
  tamperCaught = true;
}
check('a leaked answer key makes the round refuse to open', tamperCaught);

let leakedStemCaught = false;
try {
  const leaky = { ...round, view: { ...round.view, questions: round.view.questions.map((item) => ({ ...item, stem: `${item.stem} (${scanKeyOf(maths)}:1)` })) } };
  assertRoundSafe(leaky);
} catch {
  leakedStemCaught = true;
}
check('notebook ids in the child payload are refused', leakedStemCaught);

const fullBlob = JSON.stringify(buildMistakesRound(loadNotebook(store), { kind: 'all' }).view);
check('all-mistakes round has 4 questions', JSON.parse(fullBlob).questions.length === 4);
check('all-mistakes round has no handwriting', !fullBlob.includes('watr-secret') && !fullBlob.includes('8-secret'));

const bigStore = memoryStore();
const bigScan = scanOf('math', 'Long page', Array.from({ length: 12 }, (_, i) => q(String(i + 1), `${i + 2} + ${i + 3} = ____`, [], '', String(2 * i + 5))));
for (const item of bigScan.questions) updateQuestion(bigStore, bigScan, item.id, { mark: 'wrong' });
const capped = buildMistakesRound(loadNotebook(bigStore), { kind: 'all' });
check('rounds stay short: 12 mistakes give a round of 10', loadNotebook(bigStore).length === 12 && capped.view.questions.length === MAX_ROUND && MAX_ROUND === 10);
check('a capped round starts with the oldest mistake', capped.view.questions[0].stem === '2 + 3 = ____');

const idOf = (stem: string) => round.view.questions.find((item) => item.stem === stem)!.id;
check('grading says nice for the right answer', gradeRoundAnswer(round, idOf('25 + 17 = ____'), ' 42 ') === 'nice');
check('grading says almost for a wrong answer', gradeRoundAnswer(round, idOf('What is 3/4 of 12?'), '8') === 'almost');
check('grading returns only a word', ['nice', 'almost', 'unchecked'].includes(gradeRoundAnswer(round, 'q99', 'x')));

// Slice 13: two sessions, totals, and the top weak topic links to practice.
const firstSession = sessionFromTries(
  round,
  { [idOf('25 + 17 = ____')]: 'nice', [idOf('What is 3/4 of 12?')]: 'almost', [idOf(maths.questions[7].stem)]: 'almost' },
  new Date('2026-10-17T10:00:00Z'),
);
recordSession(store, firstSession);
const topicRound = buildMistakesRound(loadNotebook(store), { kind: 'topic', topic: 'math-fractions' });
const secondSession = sessionFromTries(topicRound, { q1: 'almost' }, new Date('2026-10-17T11:00:00Z'));
recordSession(store, secondSession);
const sessions = loadSessions(store);
check('two sessions saved', sessions.length === 2);
const weak = rankWeakTopics(loadNotebook(store), sessions);
const fractions = weak.find((row) => row.topic === 'math-fractions');
check('top weak topic is fractions', weak[0]?.topic === 'math-fractions', JSON.stringify(weak));
check('fractions totals add up', fractions?.inNotebook === 1 && fractions.practiceTries === 2 && fractions.practiceMisses === 2);
const add = weak.find((row) => row.topic === 'math-add-subtract');
check('a topic got right in practice still counts its notebook entry', add?.inNotebook === 1 && add.practiceMisses === 0 && add.practiceTries === 1);
const topRound = buildMistakesRound(loadNotebook(store), { kind: 'topic', topic: weak[0].topic });
check('top weak topic links to a practice round', topRound.view.questions.length === 1 && topRound.view.subject === 'Fractions');

const payload = notebookPayload(loadNotebook(store), sessions, ['test line']);
check('note payload has groups, ranking and both sessions', payload.groups.length === 2 && payload.weak[0].label === 'Fractions' && payload.sessions.length === 2);
check('note payload lists newest session first', payload.sessions[0].right === 0 && payload.sessions[0].wrong === 1);

const removed = loadNotebook(store).find((entry) => entry.scanKey === scanKeyOf(english))!;
removeEntry(store, removed.key);
check('remove takes it out and clears the Wrong mark', loadNotebook(store).length === 3 && loadReview(store, english)['3'].mark === 'unmarked');
console.log(`mistakes test passed (${passed} checks)`);
