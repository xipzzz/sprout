/* Synthetic questions for dev screenshots only.
   These strings are not a scan result and are not used by the reader. */

import { buildQuiz, type PlayableQuestion } from '../lib/scan/quizMap';
import { createReview, reviewReducer, type ReviewQuestion } from '../lib/scan/review';
import type { ScannedQuestion } from '../lib/scan/types';

function q(partial: Partial<ScannedQuestion> & Pick<ScannedQuestion, 'id' | 'type' | 'prompt'>): ScannedQuestion {
  return {
    instruction: '',
    options: [],
    left: [],
    right: [],
    emphasis: [],
    ...partial,
  };
}

export function checkFixture(): ReviewQuestion[] {
  let review = createReview([
    q({
      id: 'q1',
      type: 'fill_blank',
      prompt: 'The synthetic fox ___ the box.',
      options: [],
      emphasis: ['fox'],
    }),
    q({
      id: 'q2',
      type: 'multiple_choice',
      prompt: 'Which shape is a box?',
      options: ['circle', 'box', 'line'],
    }),
  ], { q1: 'opens' });
  review = reviewReducer(review, { type: 'answer', id: 'q1', value: 'opens' });
  review = reviewReducer(review, { type: 'distractor', id: 'q1', index: 0, value: 'open' });
  review = reviewReducer(review, { type: 'distractor', id: 'q1', index: 1, value: 'opened' });
  review = reviewReducer(review, { type: 'confirm', id: 'q1' });
  return review;
}

function one(kind: PlayableQuestion['kind']): PlayableQuestion[][] {
  if (kind === 'fill_cards') {
    let review = createReview([
      q({ id: 'q1', type: 'fill_blank', prompt: 'The synthetic fox ___ the box.', options: ['opens', 'open', 'opened'], emphasis: ['fox'] }),
    ], { q1: 'opens' });
    review = reviewReducer(review, { type: 'confirm', id: 'q1' });
    return buildQuiz(review);
  }
  if (kind === 'multiple_choice') {
    let review = createReview([
      q({ id: 'q2', type: 'multiple_choice', prompt: 'Which shape is a box?', options: ['circle', 'box', 'line'] }),
    ], { q2: 'box' });
    review = reviewReducer(review, { type: 'confirm', id: 'q2' });
    return buildQuiz(review);
  }
  if (kind === 'matching') {
    let review = createReview([
      q({ id: 'q3', type: 'matching', prompt: '', instruction: 'Match.', left: ['fox', 'box'], right: ['runs', 'holds'] }),
    ], { q3: 'fox => runs\nbox => holds' });
    review = reviewReducer(review, { type: 'confirm', id: 'q3' });
    return buildQuiz(review);
  }
  let review = createReview([
    q({ id: 'q4', type: 'rewrite', instruction: 'Join with and.', prompt: 'The fox is quick. The fox is quiet.' }),
  ], { q4: 'The fox is quick and quiet.' });
  review = reviewReducer(review, { type: 'extra', id: 'q4', index: 0, value: 'very' });
  review = reviewReducer(review, { type: 'extra', id: 'q4', index: 1, value: '' });
  review = reviewReducer(review, { type: 'confirm', id: 'q4' });
  return buildQuiz(review);
}

export function quizFixture(which: string): PlayableQuestion[][] {
  if (which === 'fill' || which === 'selected-fill') return one('fill_cards');
  if (which === 'almost') {
    let review = createReview([
      q({ id: 'q1', type: 'fill_blank', prompt: 'The synthetic fox ___ the box.', emphasis: ['fox'] }),
    ]);
    review = reviewReducer(review, { type: 'answer', id: 'q1', value: 'opens' });
    review = reviewReducer(review, { type: 'distractor', id: 'q1', index: 0, value: 'open' });
    review = reviewReducer(review, { type: 'distractor', id: 'q1', index: 1, value: 'opened' });
    review = reviewReducer(review, { type: 'confirm', id: 'q1' });
    return buildQuiz(review);
  }
  if (which === 'choice') return one('multiple_choice');
  if (which === 'match') return one('matching');
  return one('rewrite');
}
