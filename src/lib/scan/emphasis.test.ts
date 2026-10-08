import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { emphasisParts } from './emphasis';
import { bankChip, placedChip } from './rewriteChips';

describe('emphasis', () => {
  it('marks the sheet words inside the question', () => {
    const parts = emphasisParts('Replace the happy cat.', ['happy']);
    assert.deepEqual(parts.filter((part) => part.mark).map((part) => part.text), ['happy']);
  });
});

describe('rewrite chips', () => {
  it('lowercases only a normal first word and capitalizes it when placed first', () => {
    assert.equal(bankChip('The', 'The'), 'the');
    assert.equal(placedChip('The', 0, 'The'), 'The');
    assert.equal(placedChip('The', 2, 'The'), 'the');
    assert.equal(bankChip('fox', 'The'), 'fox');
    assert.equal(bankChip('I', 'I'), 'I');
    assert.equal(bankChip('London', 'London'), 'London');
  });
});