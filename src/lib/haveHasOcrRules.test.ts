/**
 * Have/Has OCR rules — smoke tests
 *
 * Manual test: verify these samples produce correct Have/Has word-picks.
 *
 * Expected for both clean & noisy fixtures:
 * - isHaveHasWorksheet(text) === true
 * - draftHaveHasWordPick(text).choices === ['have', 'has']
 * - draftHaveHasWordPick(text).correct is 'have' or 'has'
 *
 * Run with: tsx src/lib/haveHasOcrRules.test.ts
 * (or manually verify by importing the module in the app)
 */

import {
  correctHaveHasForSubject,
  draftHaveHasWordPick,
  isHaveHasWorksheet,
  normalizeHaveHasOcr,
} from './haveHasOcrRules';

// Test 1: Clean OCR input
const cleanText = `Have or Has

Pick the right word: She ____ … (have or has)?

1. She _____ a red bag.
2. They _____ two cats.
3. Tom _____ a bike.`;

console.log('Test 1: Clean OCR');
console.log('  Is Have/Has worksheet?', isHaveHasWorksheet(cleanText));
const cleanDraft = draftHaveHasWordPick(cleanText);
console.log('  Draft:', cleanDraft);

if (!cleanDraft || cleanDraft.choices.length !== 2) {
  throw new Error('Clean fixture failed: expected choices [have, has]');
}
if (!cleanDraft.choices.includes('have') || !cleanDraft.choices.includes('has')) {
  throw new Error('Clean fixture failed: missing have/has in choices');
}
if (!['have', 'has'].includes(cleanDraft.correct)) {
  throw new Error('Clean fixture failed: correct must be have or has');
}

// Test 2: Noisy OCR input (common misreads: Hove, Bas)
const noisyText = `Hove or Bas

Pick the right word: She ____ ... (hove or bas)?

1. She _____ a red bag.
2. They _____ two cats.
3. Tom _____ a bike.`;

console.log('\nTest 2: Noisy OCR');
const normalized = normalizeHaveHasOcr(noisyText);
console.log('  Normalized contains "have"?', normalized.includes('have'));
console.log('  Normalized contains "has"?', normalized.includes('has'));
console.log('  Is Have/Has worksheet?', isHaveHasWorksheet(noisyText));
const noisyDraft = draftHaveHasWordPick(noisyText);
console.log('  Draft:', noisyDraft);

if (!noisyDraft || noisyDraft.choices.length !== 2) {
  throw new Error('Noisy fixture failed: expected choices [have, has]');
}
if (!noisyDraft.choices.includes('have') || !noisyDraft.choices.includes('has')) {
  throw new Error('Noisy fixture failed: missing have/has in choices');
}
if (!['have', 'has'].includes(noisyDraft.correct)) {
  throw new Error('Noisy fixture failed: correct must be have or has');
}

const agreement: Array<[string, 'have' | 'has']> = [
  ['he', 'has'],
  ['she', 'has'],
  ['it', 'has'],
  ['I', 'have'],
  ['you', 'have'],
  ['we', 'have'],
  ['they', 'have'],
  ['Tom', 'has'],
  ['The boy', 'has'],
  ['The boys', 'have'],
  ['Sam and Ben', 'have'],
  ['The bus', 'has'],
];
for (const [subject, expected] of agreement) {
  const got = correctHaveHasForSubject(subject);
  if (got !== expected) {
    throw new Error(`${subject} should take ${expected}, got ${got}`);
  }
}

console.log('\n✓ All Have/Has OCR smoke tests passed');
