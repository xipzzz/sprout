import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { buildQuiz, gradePlayable, gradeTypedWord, advanceQueue, type PlayableQuestion, type QuizQueue } from './quizMap';
import { canConfirm, createReview, reviewReducer, type ReviewQuestion } from './review';
import type { ScannedQuestion } from './types';

function scanned(over: Partial<ScannedQuestion> & Pick<ScannedQuestion, 'id' | 'type'>): ScannedQuestion {
  return {
    instruction: '',
    prompt: '',
    options: [],
    left: [],
    right: [],
    emphasis: [],
    ...over,
  };
}

function confirmAll(state: ReviewQuestion[]): ReviewQuestion[] {
  return state.reduce((acc, q) => reviewReducer(acc, { type: 'confirm', id: q.id }), state);
}

describe('parent review', () => {
  const page: ScannedQuestion[] = [
    scanned({
      id: 'q1',
      type: 'fill_blank',
      instruction: 'Find and correct the mistake.',
      prompt: 'She go to school.',
      options: [],
    }),
    scanned({
      id: 'q2',
      type: 'multiple_choice',
      prompt: 'Which word is a noun?',
      options: ['run', 'happy', 'table'],
    }),
    scanned({
      id: 'q3',
      type: 'matching',
      left: ['cat', 'dog'],
      right: ['meows', 'barks'],
    }),
    scanned({
      id: 'q4',
      type: 'rewrite',
      instruction: 'Join with and.',
      prompt: 'He is tall. He is strong.',
    }),
  ];

  it('flags mistake sheets and does not confirm a suggestion by itself', () => {
    const review = createReview(page, { q2: 'table', q4: 'He is tall and strong.' });
    assert.equal(review[0].needsExactCopy, true);
    assert.equal(review[1].needsExactCopy, false);
    assert.equal(review[1].answer, 'table');
    assert.equal(review[1].confirmed, false);
    assert.equal(review.every((q) => q.confirmed), false);
  });

  it('edits text, deletes a question, and skips anything not confirmed', () => {
    let review = createReview(page, { q2: 'table' });
    review = reviewReducer(review, { type: 'prompt', id: 'q2', value: 'Which word is a noun, please?' });
    const edited = review.find((q) => q.id === 'q2');
    assert.equal(edited?.prompt, 'Which word is a noun, please?');
    assert.equal(edited?.confirmed, false);

    review = reviewReducer(review, { type: 'confirm', id: 'q2' });
    assert.equal(review.find((q) => q.id === 'q2')?.confirmed, true);

    review = reviewReducer(review, { type: 'option', id: 'q2', index: 2, value: 'chair' });
    assert.equal(review.find((q) => q.id === 'q2')?.confirmed, false);
    assert.equal(review.find((q) => q.id === 'q2')?.options[2], 'chair');

    review = reviewReducer(review, { type: 'answer', id: 'q2', value: 'chair' });
    review = reviewReducer(review, { type: 'confirm', id: 'q2' });
    review = reviewReducer(review, { type: 'delete', id: 'q1' });
    const quiz = buildQuiz(review);
    const ids = quiz.flat().map((q) => q.id);
    assert.deepEqual(ids, ['q2']);
    assert.equal(quiz[0][0].kind, 'multiple_choice');
    if (quiz[0][0].kind === 'multiple_choice') {
      assert.deepEqual(quiz[0][0].options, ['run', 'happy', 'chair']);
      assert.equal(quiz[0][0].answer, 'chair');
    }
  });

  it('refuses to confirm an empty answer', () => {
    const review = createReview([page[1]]);
    assert.equal(canConfirm(review[0]), false);
    const next = reviewReducer(review, { type: 'confirm', id: 'q2' });
    assert.equal(next[0].confirmed, false);
    assert.equal(buildQuiz(next).length, 0);
  });

  it('maps all four types from confirmed answers only', () => {
    let review = createReview(page, {
      q2: 'table',
      q3: 'cat => meows\ndog => barks',
      q4: 'He is tall and strong.',
    });
    review = reviewReducer(review, { type: 'answer', id: 'q1', value: 'goes' });
    review = reviewReducer(review, { type: 'distractor', id: 'q1', index: 0, value: 'go' });
    review = reviewReducer(review, { type: 'distractor', id: 'q1', index: 1, value: 'went' });
    review = reviewReducer(review, { type: 'extra', id: 'q4', index: 0, value: 'very' });
    review = reviewReducer(review, { type: 'extra', id: 'q4', index: 1, value: '' });
    review = confirmAll(review);

    const plays = buildQuiz(review).flat();
    assert.deepEqual(plays.map((q) => q.kind), ['fill_bank', 'multiple_choice', 'matching', 'rewrite']);

    const bank = plays[0];
    assert.equal(bank.kind, 'fill_bank');
    if (bank.kind === 'fill_bank') {
      assert.deepEqual([...bank.bank].sort(), ['go', 'goes', 'went']);
      assert.equal(bank.answer, 'goes');
    }

    const match = plays[2];
    assert.equal(match.kind, 'matching');
    if (match.kind === 'matching') {
      assert.deepEqual(match.pairs, [
        { left: 'cat', right: 'meows' },
        { left: 'dog', right: 'barks' },
      ]);
      assert.deepEqual([...match.rightOrder].sort(), ['barks', 'meows']);
    }

    const rewrite = plays[3];
    assert.equal(rewrite.kind, 'rewrite');
    if (rewrite.kind === 'rewrite') {
      assert.deepEqual([...rewrite.tiles].sort(), ['He', 'and', 'is', 'strong', 'tall', 'very'].sort());
      assert.deepEqual(rewrite.answerTokens, ['He', 'is', 'tall', 'and', 'strong']);
    }
  });

  it('keeps printed fill-blank options in printed order', () => {
    let review = createReview([
      scanned({
        id: 'q1',
        type: 'fill_blank',
        prompt: 'She ___ to school.',
        options: ['go', 'goes'],
      }),
    ], { q1: 'goes' });
    review = confirmAll(review);
    const play = buildQuiz(review)[0][0];
    assert.equal(play.kind, 'fill_cards');
    if (play.kind === 'fill_cards') assert.deepEqual(play.options, ['go', 'goes']);
  });

  it('splits a long sheet into parts of 10 and matching sets of 5', () => {
    const many: ScannedQuestion[] = Array.from({ length: 11 }, (_, i) => scanned({
      id: `q${i + 1}`,
      type: 'multiple_choice',
      prompt: `Prompt ${i + 1}`,
      options: ['a', 'b'],
    }));
    let review = createReview(many, Object.fromEntries(many.map((q) => [q.id, 'a'])));
    review = confirmAll(review);
    const parts = buildQuiz(review);
    assert.equal(parts.length, 2);
    assert.equal(parts[0].length, 10);
    assert.equal(parts[1].length, 1);

    const left = ['a', 'b', 'c', 'd', 'e', 'f'];
    const right = ['1', '2', '3', '4', '5', '6'];
    let matching = createReview([
      scanned({ id: 'm', type: 'matching', left, right }),
    ], { m: left.map((item, i) => `${item} => ${right[i]}`).join('\n') });
    matching = confirmAll(matching);
    const screens = buildQuiz(matching).flat();
    assert.equal(screens.length, 2);
    assert.equal(screens[0].kind, 'matching');
    assert.equal(screens[1].kind, 'matching');
    if (screens[0].kind === 'matching' && screens[1].kind === 'matching') {
      assert.equal(screens[0].pairs.length, 5);
      assert.equal(screens[1].pairs.length, 1);
    }
  });
});

describe('grading', () => {
  it('scores choice questions as correct or wrong, with no almost', () => {
    const card: PlayableQuestion = {
      kind: 'fill_cards',
      id: 'q1',
      prompt: 'She ___ to school.',
      instruction: '',
      options: ['go', 'goes'],
      answer: 'goes',
    };
    assert.equal(gradePlayable(card, { kind: 'choice', value: 'goes' }), 'correct');
    assert.equal(gradePlayable(card, { kind: 'choice', value: 'go' }), 'wrong');
    const mc: PlayableQuestion = { ...card, kind: 'multiple_choice' };
    assert.equal(gradePlayable(mc, { kind: 'choice', value: 'GOES' }), 'wrong');
  });

  it('treats case and a one-letter typo as almost only when the child types', () => {
    assert.equal(gradeTypedWord('goes', 'goes'), 'correct');
    assert.equal(gradeTypedWord('goes', 'Goes'), 'almost');
    assert.equal(gradeTypedWord('goes', 'gos'), 'almost');
    assert.equal(gradeTypedWord('goes', 'went'), 'wrong');
    const bank: PlayableQuestion = {
      kind: 'fill_bank',
      id: 'q1',
      prompt: 'She ___ to school.',
      instruction: '',
      bank: ['go', 'goes', 'went'],
      answer: 'goes',
    };
    assert.equal(gradePlayable(bank, { kind: 'typed', value: 'gos' }), 'almost');
    assert.equal(gradePlayable(bank, { kind: 'choice', value: 'go' }), 'wrong');
  });

  it('allows almost for one wrong pair only on a 5-pair screen', () => {
    const pairs = [
      { left: 'a', right: '1' },
      { left: 'b', right: '2' },
      { left: 'c', right: '3' },
      { left: 'd', right: '4' },
      { left: 'e', right: '5' },
    ];
    const screen: PlayableQuestion = {
      kind: 'matching',
      id: 'q',
      prompt: '',
      instruction: 'Match.',
      pairs,
      rightOrder: ['5', '4', '3', '2', '1'],
    };
    const almost = pairs.map((p, i) => (i === 0 ? { left: 'a', right: '2' } : p));
    assert.equal(gradePlayable(screen, { kind: 'pairs', pairs }), 'correct');
    assert.equal(gradePlayable(screen, { kind: 'pairs', pairs: almost }), 'almost');
    const short: PlayableQuestion = { ...screen, pairs: pairs.slice(0, 4), rightOrder: ['1', '2', '3', '4'] };
    const shortWrong = pairs.slice(0, 4).map((p, i) => (i === 0 ? { left: 'a', right: '2' } : p));
    assert.equal(gradePlayable(short, { kind: 'pairs', pairs: shortWrong }), 'wrong');
  });

  it('treats one moved rewrite tile as almost', () => {
    const rewrite: PlayableQuestion = {
      kind: 'rewrite',
      id: 'q4',
      prompt: 'He is tall. He is strong.',
      instruction: 'Join with and.',
      tiles: ['strong', 'He', 'tall', 'and', 'is'],
      answerTokens: ['He', 'is', 'tall', 'and', 'strong'],
    };
    assert.equal(gradePlayable(rewrite, { kind: 'tiles', tokens: ['He', 'is', 'tall', 'and', 'strong'] }), 'correct');
    assert.equal(gradePlayable(rewrite, { kind: 'tiles', tokens: ['He', 'is', 'and', 'tall', 'strong'] }), 'almost');
    assert.equal(gradePlayable(rewrite, { kind: 'tiles', tokens: ['strong', 'and', 'tall', 'is', 'He'] }), 'wrong');
  });

  it('requeues a wrong answer once', () => {
    const item: PlayableQuestion = {
      kind: 'multiple_choice',
      id: 'q2',
      prompt: 'Which word is a noun?',
      instruction: '',
      options: ['run', 'table'],
      answer: 'table',
    };
    let queue: QuizQueue = { items: [item], index: 0, retried: [] };
    queue = advanceQueue(queue, 'wrong');
    assert.equal(queue.items.length, 2);
    assert.equal(queue.index, 1);
    assert.equal(queue.retried[0], 'q2');
    queue = advanceQueue(queue, 'wrong');
    assert.equal(queue.items.length, 2);
    assert.equal(queue.index, 2);
    const ok = advanceQueue({ items: [item], index: 0, retried: [] }, 'correct');
    assert.equal(ok.items.length, 1);
    const soft = advanceQueue({ items: [item], index: 0, retried: [] }, 'almost');
    assert.equal(soft.items.length, 1);
  });
});
