import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  answerCurrent,
  continueFinish,
  firstTryLine,
  startQuiz,
  type PlayableQuestion,
} from './quizMap';

function choice(id: string): PlayableQuestion {
  return {
    kind: 'multiple_choice',
    id,
    prompt: id,
    instruction: '',
    options: ['yes', 'no'],
    answer: 'yes',
  };
}

describe('scanned quiz finish', () => {
  it('counts first tries only, then Continue is what opens Today', () => {
    const part = [choice('q1'), choice('q2'), choice('q3')];
    let run = startQuiz([part]);
    run = answerCurrent(run, 'correct');
    run = answerCurrent(run, 'wrong');
    assert.equal(run.screen, 'question');
    assert.deepEqual(continueFinish(run), run);
    run = answerCurrent(run, 'almost');
    assert.equal(run.screen, 'question');
    assert.equal(run.queue.items.length, 4);
    run = answerCurrent(run, 'correct');
    assert.equal(run.screen, 'finish');
    assert.deepEqual(run.count, { right: 1, total: 3 });
    assert.equal(firstTryLine(run.count), 'You got 1 of 3 right');
    assert.equal(continueFinish(run).screen, 'today');
  });

  it('reports ten of twelve when two misses are asked again', () => {
    const part = Array.from({ length: 12 }, (_, index) => choice(`q${index + 1}`));
    const grades = [...Array.from({ length: 10 }, () => 'correct' as const), 'wrong' as const, 'wrong' as const, 'correct' as const, 'correct' as const];
    const run = grades.reduce((state, grade) => answerCurrent(state, grade), startQuiz([part]));
    assert.equal(run.screen, 'finish');
    assert.equal(firstTryLine(run.count), 'You got 10 of 12 right');
    assert.equal(continueFinish(run).screen, 'today');
  });

  it('keeps the count across parts and does not finish between them', () => {
    let run = startQuiz([[choice('a')], [choice('b')]]);
    run = answerCurrent(run, 'wrong');
    assert.equal(run.screen, 'question');
    run = answerCurrent(run, 'correct');
    assert.equal(run.screen, 'question');
    assert.equal(run.partIndex, 1);
    run = answerCurrent(run, 'correct');
    assert.equal(run.screen, 'finish');
    assert.deepEqual(run.count, { right: 1, total: 2 });
    assert.equal(firstTryLine(run.count), 'You got 1 of 2 right');
  });
});