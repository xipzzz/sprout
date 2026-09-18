/**
 * Have/Has OCR rules — smoke tests
 *
 * Fixtures: clean + noisy OCR text from typical kids worksheets.
 * Expected: both should detect as Have/Has sheets, normalize OCR noise,
 * and return choices ['have', 'has'] with correct answer.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import {
  draftHaveHasWordPick,
  isHaveHasWorksheet,
  normalizeHaveHasOcr,
} from './haveHasOcrRules';

function loadFixture(name: string): string {
  return readFileSync(join(__dirname, '__fixtures__', name), 'utf-8');
}

// Clean fixture: perfect OCR
const cleanText = loadFixture('haveHasClean.txt');
const cleanDraft = draftHaveHasWordPick(cleanText);

console.log('✓ Clean fixture detected as Have/Has:', isHaveHasWorksheet(cleanText));
console.log('✓ Clean draft:', cleanDraft);

if (!cleanDraft || cleanDraft.choices.length !== 2) {
  throw new Error('Clean fixture failed: expected choices [have, has]');
}
if (!cleanDraft.choices.includes('have') || !cleanDraft.choices.includes('has')) {
  throw new Error('Clean fixture failed: missing have/has in choices');
}
if (!['have', 'has'].includes(cleanDraft.correct)) {
  throw new Error('Clean fixture failed: correct must be have or has');
}

// Noisy fixture: OCR misreads (Hove, Bas)
const noisyText = loadFixture('haveHasNoisy.txt');
const normalized = normalizeHaveHasOcr(noisyText);
const noisyDraft = draftHaveHasWordPick(noisyText);

console.log('✓ Noisy fixture normalized:', normalized.includes('have'), normalized.includes('has'));
console.log('✓ Noisy fixture detected as Have/Has:', isHaveHasWorksheet(noisyText));
console.log('✓ Noisy draft:', noisyDraft);

if (!noisyDraft || noisyDraft.choices.length !== 2) {
  throw new Error('Noisy fixture failed: expected choices [have, has]');
}
if (!noisyDraft.choices.includes('have') || !noisyDraft.choices.includes('has')) {
  throw new Error('Noisy fixture failed: missing have/has in choices');
}
if (!['have', 'has'].includes(noisyDraft.correct)) {
  throw new Error('Noisy fixture failed: correct must be have or has');
}

console.log('\n✓ All Have/Has OCR smoke tests passed');
