/* LessonScreen — Lock B chrome lesson flow (SoT-approved design).
   Pip + bubble + continuous progress + mint/coral feedback sheets.
   Supports all course exercise types: choice, arrange, match, fill, listen.
   Calm: a wrong answer teaches kindly and you move on — no lives lost. */

import { useCallback, useEffect, useState } from 'react';
import { getLesson } from '../data/course';
import type { Exercise } from '../data/course';
import MultipleChoice from '../components/MultipleChoice';
import ArrangeWords from '../components/ArrangeWords';
import MatchPairs from '../components/MatchPairs';
import FillBlank from '../components/FillBlank';
import ListenType from '../components/ListenType';
import LessonComplete from '../components/LessonComplete';
import PipPose from '../components/PipPose';
import { playSproutFeedback } from '../utils/feedback';

interface LessonScreenProps {
  onExit: () => void;
  onComplete: () => void;
  unitId: string | null;
  firstLesson?: boolean;
}

type Phase = 'answering' | 'selected' | 'check' | 'feedback' | 'complete';
type Answer = string | string[] | null;
type Result = 'correct' | 'almost';

function isComplete(ex: Exercise, a: Answer): boolean {
  if (ex.kind === 'choice') return typeof a === 'string';
  if (ex.kind === 'arrange') return Array.isArray(a) && a.length === ex.answer.length;
  if (ex.kind === 'fill' || ex.kind === 'listen') return typeof a === 'string' && a.trim().length > 0;
  return Array.isArray(a) && a.length === ex.pairs.length; // match: all pairs found
}

function isCorrect(ex: Exercise, a: Answer): boolean {
  if (ex.kind === 'choice') return a === ex.answerId;
  if (ex.kind === 'arrange') return Array.isArray(a) && a.join(' ') === ex.answer.join(' ');
  if (ex.kind === 'fill') return typeof a === 'string' && a.trim().toLowerCase() === ex.answer.toLowerCase();
  if (ex.kind === 'listen') return typeof a === 'string' && a.trim().toLowerCase() === ex.word.toLowerCase();
  return true; // match: completing it means every pair was matched correctly
}

function getPromptForExercise(ex: Exercise): string {
  if (ex.kind === 'choice') return `Which picture shows "${ex.word}"?`;
  if (ex.kind === 'arrange') return ex.prompt;
  if (ex.kind === 'fill') return 'Fill in the blank';
  if (ex.kind === 'listen') return 'Listen and type what you hear';
  if (ex.kind === 'match') return 'Match each word to its picture';
  return '';
}

export default function LessonScreen({ onExit, onComplete, unitId, firstLesson }: LessonScreenProps) {
  const lesson = getLesson(unitId);
  const exercises = lesson.exercises;
  const total = exercises.length;

  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState<Answer>(null);
  const [phase, setPhase] = useState<Phase>('answering');
  const [result, setResult] = useState<Result>('correct');
  const [correctCount, setCorrectCount] = useState(0);
  const [confirmQuit, setConfirmQuit] = useState(false);

  const ex = exercises[index];

  function progressPct() {
    const base = (index / total) * 100;
    const bump = phase === 'feedback' ? (1 / total) * 100 : 0;
    return Math.min(100, Math.round(base + bump * 0.55 + 28));
  }

  const onSelect = useCallback((value: Answer) => {
    if (phase !== 'answering' && phase !== 'selected') return;
    setAnswer(value);
    if (isComplete(ex, value)) {
      setPhase('selected');
    } else {
      setPhase('answering');
    }
  }, [phase, ex]);

  const onCheck = useCallback(() => {
    if (phase !== 'selected') return;
    if (!isComplete(ex, answer)) return;
    setPhase('check');

    setTimeout(() => {
      const ok = isCorrect(ex, answer);
      setResult(ok ? 'correct' : 'almost');
      if (ok) {
        setCorrectCount((c) => c + 1);
        playSproutFeedback('correct');
      }
      setPhase('feedback');
    }, 180);
  }, [phase, ex, answer]);

  const onAdvance = useCallback(() => {
    if (phase !== 'feedback') return;
    if (index + 1 >= total) {
      playSproutFeedback('complete');
      setPhase('complete');
    } else {
      setIndex((i) => i + 1);
      setAnswer(null);
      setPhase('answering');
    }
  }, [phase, index, total]);

  useEffect(() => {
    function handleKeyboard(event: KeyboardEvent) {
      if (event.key === 'Enter') {
        if (phase === 'selected') onCheck();
        else if (phase === 'feedback') onAdvance();
      }
    }
    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [phase, onCheck, onAdvance]);

  const pipPose = phase === 'feedback' && result === 'correct' ? 'correct' : phase === 'feedback' && result === 'almost' ? 'almost' : 'neutral';
  const showBubble = phase !== 'feedback';

  if (phase === 'complete') {
    const accuracy = Math.round((correctCount / total) * 100);
    const learnedWords = Array.from(new Set(
      exercises.flatMap((e) => (e.kind === 'choice' ? [e.word] : []))
    )).slice(0, 8);
    return (
      <LessonComplete
        leaves={lesson.reward}
        accuracy={accuracy}
        words={learnedWords}
        firstLesson={firstLesson}
        onContinue={onComplete}
      />
    );
  }

  return (
    <div className="screen lesson lesson--sot">
      <header className="lesson__top">
        <button
          type="button"
          className="lesson__close"
          onClick={() => {
            playSproutFeedback('modalOpen');
            setConfirmQuit(true);
          }}
          aria-label="Close lesson"
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        <div
          className="lesson__progress-bar"
          role="progressbar"
          aria-valuenow={progressPct()}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <i className="lesson__progress-fill" style={{ width: `${progressPct()}%` }} />
        </div>
      </header>

      {confirmQuit && (
        <div className="quit" role="dialog" aria-label="Leave the lesson?">
          <div className="quit__sheet">
            <PipPose className="quit__pip" pose="neutral" />
            <h2 className="quit__title">Leave the lesson?</h2>
            <p className="quit__sub">Your sprout keeps what you've grown so far. 🌱</p>
            <button type="button" className="btn-primary quit__stay" onClick={() => { playSproutFeedback('modalClose'); setConfirmQuit(false); }}>Keep going</button>
            <button type="button" className="quit__leave" onClick={() => { playSproutFeedback('modalClose'); onExit(); }}>Leave for now</button>
          </div>
        </div>
      )}

      <section className="lesson__q-row">
        <div className={`lesson__pip-wrap${pipPose === 'correct' ? ' lesson__pip-wrap--proud' : pipPose === 'almost' ? ' lesson__pip-wrap--soft' : ''}`} aria-hidden="true">
          <PipPose pose={pipPose} />
        </div>
        {showBubble && (
          <div className="lesson__bubble">
            <p className="lesson__bubble-text">{getPromptForExercise(ex)}</p>
          </div>
        )}
      </section>

      <main className="screen__body">
        {ex.kind === 'choice' ? (
          <MultipleChoice
            key={ex.id}
            word={ex.word}
            choices={ex.choices}
            selectedId={typeof answer === 'string' ? answer : null}
            answerId={ex.answerId}
            revealed={phase === 'feedback'}
            onSelect={(id) => onSelect(id)}
          />
        ) : ex.kind === 'arrange' ? (
          <ArrangeWords
            key={ex.id}
            prompt={ex.prompt}
            tiles={ex.tiles}
            revealed={phase === 'feedback'}
            onChange={onSelect}
          />
        ) : ex.kind === 'fill' ? (
          <FillBlank
            key={ex.id}
            before={ex.before}
            after={ex.after}
            value={typeof answer === 'string' ? answer : ''}
            revealed={phase === 'feedback'}
            onChange={onSelect}
          />
        ) : ex.kind === 'listen' ? (
          <ListenType
            key={ex.id}
            word={ex.word}
            options={ex.options}
            value={typeof answer === 'string' ? answer : ''}
            revealed={phase === 'feedback'}
            onChange={onSelect}
          />
        ) : (
          <MatchPairs
            key={ex.id}
            pairs={ex.pairs}
            audio={ex.audio}
            revealed={phase === 'feedback'}
            onChange={onSelect}
          />
        )}
      </main>

      <footer className={`lesson__foot${phase === 'feedback' ? ' lesson__foot--has-sheet' : ''}`}>
        {phase !== 'feedback' && (
          <button
            type="button"
            className="lesson__check"
            disabled={phase !== 'selected'}
            onClick={onCheck}
          >
            Check
          </button>
        )}

        {phase === 'feedback' && (
          <div className={`lesson__sheet lesson__sheet--show lesson__sheet--${result}`} role="status">
            <div className="lesson__sheet-title-row">
              <span className="lesson__sheet-check" aria-hidden="true">
                {result === 'correct' ? '✓' : '!'}
              </span>
              <h2 className="lesson__sheet-title">
                {result === 'correct' ? 'Excellent!' : 'Almost!'}
              </h2>
            </div>
            <p className="lesson__sheet-body">
              {result === 'correct' ? 'Pip is proud of you.' : 'No hearts lost — try the next one.'}
            </p>
            <button
              type="button"
              className={`lesson__sheet-cta lesson__sheet-cta--${result === 'correct' ? 'green' : 'red'}`}
              onClick={onAdvance}
            >
              {result === 'correct' ? 'Continue' : 'Got it'}
            </button>
          </div>
        )}
      </footer>
    </div>
  );
}
