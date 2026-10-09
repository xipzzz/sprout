import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { buildQuiz } from './quizMap';
import { createReview, reviewReducer } from './review';
import { validateModelPayload } from './schema';
import type { ScannedQuestion } from './types';
import { isInstructionStem, showsPrintedChoices, wordOrderTiles } from './wordOrder';

const ORDER = "aren't / They / Spain. / from";
const ANSWER = "They aren't from Spain.";

function item(over: Partial<ScannedQuestion> & Pick<ScannedQuestion, 'id' | 'prompt'>): ScannedQuestion {
  return {
    type: 'multiple_choice',
    instruction: '',
    options: [],
    left: [],
    right: [],
    emphasis: [],
    ...over,
  };
}

describe('section instructions and word order', () => {
  it('drops an instruction line and keeps the slash words as a rewrite', () => {
    const result = validateModelPayload({
      error: '',
      questions: [
        item({
          id: 'q0',
          prompt: 'B) Put the words in the correct order.',
          options: ['Write', 'Put', 'Choose'],
        }),
        item({
          id: 'q1',
          instruction: 'Put the words in the correct order.',
          prompt: ORDER,
          options: ['Write', 'Put', 'Choose'],
        }),
        item({
          id: 'q2',
          type: 'fill_blank',
          instruction: 'Fill in the blanks.',
          prompt: 'She ___ American.',
          options: [],
        }),
      ],
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.deepEqual(result.questions.map((q) => q.id), ['q1', 'q2']);
    assert.equal(result.questions[0].type, 'rewrite');
    assert.equal(result.questions[0].prompt, ORDER);
    assert.deepEqual(result.questions[0].options, []);
    assert.equal(result.questions[1].prompt, 'She ___ American.');
    assert.equal(showsPrintedChoices(result.questions[0]), false);
    assert.equal(isInstructionStem('Choose the correct answer'), true);
    assert.equal(isInstructionStem('Fill in the blanks'), true);
    assert.equal(wordOrderTiles('She can ( eat / eats ) lunch.'), null);
  });

  it('builds the sentence from the printed tiles, in the answer order', () => {
    let review = createReview([
      item({
        id: 'q1',
        type: 'rewrite',
        instruction: 'Put the words in the correct order.',
        prompt: ORDER,
      }),
    ], { q1: ANSWER });
    review = reviewReducer(review, { type: 'answer', id: 'q1', value: ANSWER });
    review = reviewReducer(review, { type: 'confirm', id: 'q1' });
    const play = buildQuiz(review)[0][0];
    assert.equal(play.kind, 'rewrite');
    if (play.kind !== 'rewrite') return;
    assert.deepEqual([...play.tiles].sort(), ["aren't", 'They', 'Spain.', 'from'].sort());
    assert.equal(play.answerTokens.join(' '), ANSWER);
    assert.equal(play.exactTiles, true);
    assert.equal(play.prompt, ORDER);
    const edited = reviewReducer(review, { type: 'answer', id: 'q1', value: 'They are from Spain.' });
    assert.equal(edited[0].answer, 'They are from Spain.');
    assert.equal(edited[0].confirmed, false);
  });
});