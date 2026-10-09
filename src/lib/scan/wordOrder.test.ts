import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { buildQuiz, freeRewriteTiles } from './quizMap';
import { canConfirm, createReview, reviewReducer } from './review';
import { validateModelPayload } from './schema';
import type { ScannedQuestion } from './types';
import { isInstructionStem, normalizeScannedQuestion, showsPrintedChoices, usesOnlyPrintedWords, wordOrderTiles, wordOrderTypeLabel } from './wordOrder';

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
    assert.equal(canConfirm(edited[0]), false);
    assert.equal(reviewReducer(edited, { type: 'confirm', id: 'q1' })[0].confirmed, false);
  });

  it('warns unless the sentence is the printed tiles, and labels the type Word order', () => {
    const tiles = wordOrderTiles(ORDER);
    assert.ok(tiles);
    if (!tiles) return;
    assert.equal(usesOnlyPrintedWords(tiles, ANSWER), true);
    assert.equal(usesOnlyPrintedWords(tiles, "they aren't from spain."), true);
    assert.equal(usesOnlyPrintedWords(tiles, 'They are from Spain.'), false);
    assert.equal(usesOnlyPrintedWords(tiles, "They aren't from"), false);
    assert.equal(usesOnlyPrintedWords(tiles, "They aren't from Spain"), false);
    assert.equal(wordOrderTypeLabel({ rewriteSource: 'slash' }), 'Word order');
    assert.equal(wordOrderTypeLabel({ rewriteSource: 'free' }), null);
  });

  it('confirms a past-tense rewrite that uses a word which was not printed', () => {
    const scanned = normalizeScannedQuestion(item({
      id: 'q1',
      type: 'rewrite',
      instruction: 'Change to past tense.',
      prompt: 'She walks home.',
    }));
    assert.ok(scanned);
    if (!scanned) return;
    assert.equal(scanned.rewriteSource, 'free');
    let review = createReview([scanned], { q1: 'She walked home.' });
    review = review.map((q) => ({ ...q, extraTiles: ['', ''] as [string, string] }));
    assert.equal(review[0].rewriteSource, 'free');
    assert.equal(canConfirm(review[0]), true);
    assert.equal(wordOrderTypeLabel(review[0]), null);
    assert.deepEqual(freeRewriteTiles(review[0]), ['She', 'walked', 'home']);
    review = reviewReducer(review, { type: 'prompt', id: 'q1', value: ORDER });
    assert.equal(review[0].rewriteSource, 'free');
    assert.equal(canConfirm(review[0]), true);
    review = reviewReducer(review, { type: 'confirm', id: 'q1' });
    assert.equal(review[0].confirmed, true);
    const play = buildQuiz(review)[0][0];
    assert.equal(play.kind, 'rewrite');
    if (play.kind !== 'rewrite') return;
    assert.equal(play.exactTiles, undefined);
    assert.ok(play.tiles.includes('walked'));
    assert.deepEqual(play.answerTokens, ['She', 'walked', 'home']);
  });
});