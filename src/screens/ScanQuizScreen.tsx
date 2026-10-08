/* Lock B quiz for a scanned homework sheet.
   Chrome matches the lesson screen: progress and close on one row, Pip and
   the sheet's own prompt, answer cards, then Check / the feedback sheet. */

import { useState } from 'react';
import ArrangeWords from '../components/ArrangeWords';
import EmphasisText from '../components/EmphasisText';
import PipPose from '../components/PipPose';
import {
  answerCurrent,
  answerText,
  firstTryLine,
  gradePlayable,
  type FirstTryCount,
  type Grade,
  type PlayableQuestion,
  type QuizQueue,
} from '../lib/scan/quizMap';
import { bankChip, placedChip } from '../lib/scan/rewriteChips';
import type { Pair } from '../lib/scan/suggestions';
import { playSproutFeedback } from '../utils/feedback';

interface ScanQuizScreenProps {
  parts: PlayableQuestion[][];
  onExit: () => void;
  onComplete: () => void;
  markAnswers?: boolean;
}

export function ScanQuizFinish({
  count,
  onContinue,
  mark = false,
}: {
  count: FirstTryCount;
  onContinue: () => void;
  mark?: boolean;
}) {
  return (
    <div className="screen lesson lesson--sot lesson--scan scan-finish" data-scan-shot-ready="">
      <div className="scan-finish__stage">
        <div className={`scan-finish__copy${mark ? ' scan-shot-mark' : ''}`}>
          <div className="scan-finish__pip">
            <PipPose pose="correct" />
          </div>
          <h1 className="scan-finish__title">Nice work!</h1>
          <p className="scan-finish__count">{firstTryLine(count)}</p>
        </div>
      </div>
      <footer className="lesson__foot">
        <button type="button" className={`lesson__check${mark ? ' scan-shot-mark' : ''}`} onClick={onContinue}>
          Continue
        </button>
      </footer>
    </div>
  );
}

function progressPct(index: number, total: number, phase: 'ask' | 'feedback') {
  const base = (index / Math.max(total, 1)) * 100;
  const bump = phase === 'feedback' ? (1 / Math.max(total, 1)) * 100 : 0;
  return Math.min(100, Math.round(base + bump * 0.55 + 28));
}

function BubbleText({ prompt, filled, emphasis }: { prompt: string; filled: string | null; emphasis?: string[] }) {
  const parts = prompt.split('___');
  if (parts.length < 2) return <EmphasisText text={prompt} emphasis={emphasis} />;
  return (
    <>
      <EmphasisText text={parts[0]} emphasis={emphasis} />
      <span className={`scanq__blank${filled ? ' scanq__blank--filled' : ''}`}>{filled || ''}</span>
      <EmphasisText text={parts.slice(1).join('___')} emphasis={emphasis} />
    </>
  );
}

export default function ScanQuizScreen({ parts, onExit, onComplete, markAnswers = false }: ScanQuizScreenProps) {
  const [partIndex, setPartIndex] = useState(0);
  const [queue, setQueue] = useState<QuizQueue>({ items: parts[0] ?? [], index: 0, retried: [] });
  const [phase, setPhase] = useState<'ask' | 'feedback'>('ask');
  const [grade, setGrade] = useState<Grade>('correct');
  const [choice, setChoice] = useState<string | null>(null);
  const [typed, setTyped] = useState('');
  const [pickedLeft, setPickedLeft] = useState<string | null>(null);
  const [pairs, setPairs] = useState<Pair[]>([]);
  const [pairFlash, setPairFlash] = useState<Pair | null>(null);
  const [tiles, setTiles] = useState<string[]>([]);
  const [tally, setTally] = useState<FirstTryCount>({ right: 0, total: 0 });
  const [finished, setFinished] = useState<FirstTryCount | null>(null);

  const q = queue.items[queue.index];
  if (finished) {
    return <ScanQuizFinish count={finished} onContinue={onComplete} />;
  }
  if (!q) {
    return null;
  }

  const total = queue.items.length;
  const pipPose = phase === 'feedback' ? (grade === 'correct' ? 'correct' : 'almost') : 'neutral';
  const filled = q.kind === 'fill_cards' || q.kind === 'fill_bank' ? (typed || choice) : null;

  function resetInputs() {
    setChoice(null);
    setTyped('');
    setPickedLeft(null);
    setPairs([]);
    setPairFlash(null);
    setTiles([]);
  }

  function canCheck(): boolean {
    if (q.kind === 'fill_cards' || q.kind === 'multiple_choice') return Boolean(choice);
    if (q.kind === 'fill_bank') return Boolean(choice || typed.trim());
    if (q.kind === 'matching') return pairs.length === q.pairs.length;
    return tiles.length >= 2;
  }

  function onCheck() {
    if (!canCheck()) return;
    const result = q.kind === 'fill_bank' && typed.trim()
      ? gradePlayable(q, { kind: 'typed', value: typed })
      : q.kind === 'fill_cards' || q.kind === 'fill_bank' || q.kind === 'multiple_choice'
        ? gradePlayable(q, { kind: 'choice', value: choice || '' })
        : q.kind === 'matching'
          ? gradePlayable(q, { kind: 'pairs', pairs })
          : gradePlayable(q, { kind: 'tiles', tokens: tiles });
    setGrade(result);
    setPhase('feedback');
    if (result === 'correct') playSproutFeedback('correct');
  }

  function go(nextQueue: QuizQueue, nextPart: number) {
    setQueue(nextQueue);
    setPartIndex(nextPart);
    setPhase('ask');
    resetInputs();
  }

  function onAdvance(override?: Grade) {
    const next = answerCurrent({
      parts,
      partIndex,
      queue,
      count: tally,
      screen: 'question',
    }, override ?? grade);
    setTally(next.count);
    if (next.screen === 'finish') {
      setFinished(next.count);
      return;
    }
    go(next.queue, next.partIndex);
  }

  function tapPair(side: 'left' | 'right', value: string) {
    if (phase !== 'ask' || q.kind !== 'matching') return;
    if (side === 'left') {
      if (pairs.some((pair) => pair.left === value)) return;
      setPickedLeft(value);
      return;
    }
    if (!pickedLeft || pairs.some((pair) => pair.right === value)) return;
    const correct = q.pairs.some((pair) => pair.left === pickedLeft && pair.right === value);
    if (correct) {
      setPairs([...pairs, { left: pickedLeft, right: value }]);
      setPairFlash(null);
    } else {
      setPairFlash({ left: pickedLeft, right: value });
      window.setTimeout(() => setPairFlash(null), 450);
    }
    setPickedLeft(null);
  }

  const sheetTitle = grade === 'correct' ? 'Excellent!' : grade === 'almost' ? 'Almost!' : 'Here is the answer';
  const sheetBody = grade === 'correct'
    ? 'Pip is proud of you.'
    : grade === 'almost'
      ? 'So close. Try the next one.'
      : answerText(q);

  const choices = q.kind === 'fill_cards' || q.kind === 'multiple_choice'
    ? q.options
    : q.kind === 'fill_bank'
      ? q.bank
      : [];
  const bubbleText = q.kind === 'matching'
    ? 'Tap the matching pairs'
    : q.kind === 'rewrite'
      ? (q.instruction || q.prompt)
      : (q.prompt || 'Read the card.');
  const matchingDone = q.kind === 'matching' && pairs.length === q.pairs.length;

  return (
    <div className="screen lesson lesson--sot lesson--scan" data-scan-shot-ready="">
      <header className="lesson__top">
        <button
          type="button"
          className="lesson__close"
          onClick={() => {
            playSproutFeedback('modalClose');
            onExit();
          }}
          aria-label="Close lesson"
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        <div className="lesson__progress-bar" role="progressbar" aria-valuenow={progressPct(queue.index, total, phase)} aria-valuemin={0} aria-valuemax={100}>
          <i className="lesson__progress-fill" style={{ width: `${progressPct(queue.index, total, phase)}%` }} />
        </div>
      </header>

      {parts.length > 1 && <p className="scanq__part">Part {partIndex + 1} of {parts.length}</p>}

      <section className="lesson__q-row">
        <div className={`lesson__pip-wrap${pipPose === 'correct' ? ' lesson__pip-wrap--proud' : pipPose === 'almost' ? ' lesson__pip-wrap--soft' : ''}`} aria-hidden="true">
          <PipPose pose={pipPose} />
        </div>
        {(
          <div className="lesson__bubble">
            <p className="lesson__bubble-text">
              {q.kind === 'fill_cards' || q.kind === 'fill_bank'
                ? <BubbleText prompt={q.prompt} filled={filled} emphasis={q.emphasis} />
                : <EmphasisText text={bubbleText} emphasis={q.emphasis} />}
            </p>
          </div>
        )}
      </section>

      <main className="screen__body scanq__play">
        <div className={markAnswers ? 'scan-shot-mark' : undefined}>
        {choices.length > 0 && (
          <div className="word-pick">
            <div className="word-pick__answers">
              {choices.map((option) => {
                let cls = 'word-pick__answer';
                const revealed = phase === 'feedback';
                const answer = 'answer' in q ? q.answer : '';
                if (revealed && option === answer) cls += ' word-pick__answer--correct';
                else if (revealed && option === choice && option !== answer) cls += ' word-pick__answer--wrong';
                else if (option === choice && !typed) cls += ' word-pick__answer--selected';
                return (
                  <button
                    key={option}
                    type="button"
                    className={cls}
                    disabled={revealed}
                    onClick={() => {
                      setChoice(option);
                      setTyped('');
                    }}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
            {q.kind === 'fill_bank' && phase === 'ask' && (
              <label className="scanq__type">
                <span>Or type the word</span>
                <input
                  value={typed}
                  onChange={(e) => {
                    setTyped(e.target.value);
                    setChoice(null);
                  }}
                  autoComplete="off"
                  autoCapitalize="off"
                  spellCheck={false}
                />
              </label>
            )}
          </div>
        )}

        {q.kind === 'rewrite' && q.prompt && (
          <blockquote className="scanq__quote">{q.prompt}</blockquote>
        )}

        {q.kind === 'matching' && (
          <div className="scanq__pairs">
            <div className="scanq__pair-col">
              {q.pairs.map((pair) => {
                const done = pairs.some((item) => item.left === pair.left);
                const selected = pickedLeft === pair.left;
                const wrong = pairFlash?.left === pair.left;
                return (
                  <button
                    key={pair.left}
                    type="button"
                    className={`word-pick__answer${selected ? ' word-pick__answer--selected' : ''}${done ? ' scanq__matched' : ''}${wrong ? ' word-pick__answer--wrong' : ''}`}
                    disabled={phase === 'feedback' || done}
                    onClick={() => tapPair('left', pair.left)}
                  >
                    {pair.left}
                  </button>
                );
              })}
            </div>
            <div className="scanq__pair-col">
              {q.rightOrder.map((right) => {
                const done = pairs.some((item) => item.right === right);
                const wrong = pairFlash?.right === right;
                return (
                  <button
                    key={right}
                    type="button"
                    className={`word-pick__answer${done ? ' scanq__matched' : ''}${wrong ? ' word-pick__answer--wrong' : ''}`}
                    disabled={phase === 'feedback' || done || !pickedLeft}
                    onClick={() => tapPair('right', right)}
                  >
                    {right}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {q.kind === 'rewrite' && (
          <ArrangeWords
            key={`${q.id}:${queue.index}`}
            prompt="Tap the words in order"
            tiles={q.tiles}
            revealed={phase === 'feedback'}
            onChange={setTiles}
            bankLabel={(word) => bankChip(word, q.answerTokens[0] || '')}
            placedLabel={(word, index) => placedChip(word, index, q.answerTokens[0] || '')}
          />
        )}
        </div>
      </main>

      <footer className={`lesson__foot${phase === 'feedback' ? ' lesson__foot--has-sheet' : ''}`}>
        {phase === 'ask' && q.kind === 'matching' && (
          <button type="button" className="lesson__check" disabled={!matchingDone} onClick={() => { onAdvance('correct'); }}>
            Continue
          </button>
        )}
        {phase === 'ask' && q.kind !== 'matching' && (
          <button type="button" className="lesson__check" disabled={!canCheck()} onClick={onCheck}>
            Check
          </button>
        )}
        {phase === 'feedback' && (
          <div className={`lesson__sheet lesson__sheet--show lesson__sheet--${grade === 'correct' ? 'correct' : 'almost'}`} role="status">
            <div className="lesson__sheet-title-row">
              <span className="lesson__sheet-check" aria-hidden="true">{grade === 'correct' ? '✓' : '!'}</span>
              <h2 className="lesson__sheet-title">{sheetTitle}</h2>
            </div>
            {grade !== 'wrong' && <p className="lesson__sheet-body">{sheetBody}</p>}
            {(grade === 'wrong' || grade === 'almost') && (
              <p className="lesson__sheet-answer">{answerText(q)}</p>
            )}
            <button
              type="button"
              className={`lesson__sheet-cta lesson__sheet-cta--${grade === 'correct' ? 'green' : 'red'}`}
              onClick={() => onAdvance()}
            >
              {grade === 'correct' ? 'Continue' : 'Got it'}
            </button>
          </div>
        )}
      </footer>
    </div>
  );
}
