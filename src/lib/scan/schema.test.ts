import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { extractJsonObject, validateModelPayload } from './schema';
import type { ScannedQuestion } from './types';

function fill(over: Partial<ScannedQuestion> = {}): ScannedQuestion {
  return {
    id: 'q1',
    type: 'fill_blank',
    instruction: 'Fill in the verb.',
    prompt: 'She ___ to school.',
    options: ['go', 'goes'],
    left: [],
    right: [],
    emphasis: [],
    ...over,
  };
}

describe('validateModelPayload', () => {
  it('accepts a schema-shaped page', () => {
    const result = validateModelPayload({ error: '', questions: [fill()] });
    assert.equal(result.ok, true);
    if (result.ok) assert.equal(result.questions[0].prompt, 'She ___ to school.');
  });

  it('rejects extra fields', () => {
    const result = validateModelPayload({ error: '', questions: [fill()], note: 'hello' });
    assert.equal(result.ok, false);
    assert.equal('questions' in result, false);
  });

  it('rejects a question with an extra field', () => {
    const result = validateModelPayload({
      error: '',
      questions: [{ ...fill(), handwritten: 'goes' }],
    });
    assert.equal(result.ok, false);
  });

  it('rejects a bad type and a non-string option', () => {
    assert.equal(validateModelPayload({ error: '', questions: [fill({ type: 'essay' as 'fill_blank' })] }).ok, false);
    assert.equal(validateModelPayload({
      error: '',
      questions: [{ ...fill(), options: ['go', 1] }],
    }).ok, false);
  });

  it('drops questions when the model reports an error', () => {
    const result = validateModelPayload({
      error: 'page is blank',
      questions: [fill({ prompt: 'Invented question?' })],
    });
    assert.equal(result.ok, false);
    assert.equal('questions' in result, false);
    if (!result.ok) assert.match(result.reason, /blank/);
  });

  it('fails closed when nothing was read', () => {
    const result = validateModelPayload({ error: '', questions: [] });
    assert.equal(result.ok, false);
    assert.equal('questions' in result, false);
  });

  it('rejects a multiple choice that does not have real options', () => {
    const result = validateModelPayload({
      error: '',
      questions: [fill({ type: 'multiple_choice', options: ['only one'] })],
    });
    assert.equal(result.ok, false);
  });
});

describe('extractJsonObject', () => {
  it('reads fenced JSON', () => {
    const value = extractJsonObject('```json\n{"error":"","questions":[]}\n```');
    assert.deepEqual(value, { error: '', questions: [] });
  });
});
