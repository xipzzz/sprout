import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { interpretScanResponse } from './response';

const validQuestion = {
  id: 'q1',
  type: 'fill_blank',
  instruction: '',
  prompt: 'She ___ to school.',
  options: ['go', 'goes'],
  left: [],
  right: [],
  emphasis: [],
};

describe('interpretScanResponse', () => {
  it('returns questions only for a valid 200', () => {
    const result = interpretScanResponse(200, {
      questions: [{ ...validQuestion, suggestion: 'goes' }],
    });
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.questions.length, 1);
      assert.equal(result.suggestions.q1, 'goes');
    }
  });

  it('drops a suggestion that is not one of the printed options', () => {
    const result = interpretScanResponse(200, {
      questions: [{ ...validQuestion, suggestion: 'walks' }],
    });
    assert.equal(result.ok, true);
    if (result.ok) assert.deepEqual(result.suggestions, {});
  });

  it('ignores questions bundled with an error status', () => {
    const result = interpretScanResponse(422, {
      error: 'invalid',
      code: 'invalid',
      questions: [{ ...validQuestion, prompt: 'Made up?' }],
    });
    assert.equal(result.ok, false);
    assert.equal('questions' in result, false);
    if (!result.ok) assert.equal(result.code, 'invalid');
  });

  it('ignores questions when the model error string is set', () => {
    const result = interpretScanResponse(200, {
      error: 'unreadable photo',
      questions: [validQuestion],
    });
    assert.equal(result.ok, false);
    assert.equal('questions' in result, false);
    if (!result.ok) assert.match(result.message, /unreadable photo/);
  });

  it('does not invent a question when the body is empty', () => {
    const result = interpretScanResponse(502, null);
    assert.equal(result.ok, false);
    assert.equal('questions' in result, false);
  });

  it('maps the spending cap to the paused message', () => {
    const result = interpretScanResponse(429, { code: 'spending_cap', error: 'cap' });
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.code, 'spending_cap');
      assert.match(result.message, /paused/i);
    }
  });
});
