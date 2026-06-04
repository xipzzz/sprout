/* LessonScreen — the lesson flow as a small state machine:
   answering → (check) → feedback → (continue) → next … → complete.
   Handles multiple exercise kinds (choice, arrange). Calm: a wrong answer
   teaches kindly and you move on — no lives lost. */

import { useCallback, useEffect, useState } from 'react';
import { getLesson } from '../data/course';
import type { Exercise } from '../data/course';
import MultipleChoice from '../components/MultipleChoice';
import ArrangeWords from '../components/ArrangeWords';
import MatchPairs from '../components/MatchPairs';
import FillBlank from '../components/FillBlank';
import ListenType from '../components/ListenType';
import FeedbackDrawer from '../components/FeedbackDrawer';
import LessonComplete from '../components/LessonComplete';
import Pip from '../components/Pip';

interface LessonScreenProps {
  onExit: () => void;
  onComplete: () => void;
  unitId: string | null;
}

type Phase = 'answering' | 'feedback' | 'complete';
type Answer = string | string[] | null;

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

export default function LessonScreen({ onExit, onComplete, unitId }: LessonScreenProps) {
  const lesson = getLesson(unitId);
  const exercises = lesson.exercises;
  const total = exercises.length;

  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState<Answer>(null);
  const [phase, setPhase] = useState<Phase>('answering');
  const [result, setResult] = useState<'correct' | 'wrong'>('correct');
  const [correctCount, setCorrectCount] = useState(0);
  const [confirmQuit, setConfirmQuit] = useState(false);

  const ex = exercises[index];

  const check = useCallback(() => {
    if (!isComplete(ex, answer)) return;
    const ok = isCorrect(ex, answer);
    setResult(ok ? 'correct' : 'wrong');
    if (ok) setCorrectCount((c) => c + 1);
    setPhase('feedback');
  }, [answer, ex]);

  useEffect(() => {
    if (phase !== 'answering' || !isComplete(ex, answer)) return;

    function submitFromKeyboard(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const tagName = target?.tagName.toLowerCase();
      const isTextInput = tagName === 'input' || tagName === 'textarea' || target?.isContentEditable;
      const isSubmitKey = event.key === 'Enter' || (event.key === ' ' && !isTextInput);
      if (!isSubmitKey) return;

      event.preventDefault();
      check();
    }

    window.addEventListener('keydown', submitFromKeyboard, { capture: true });
    return () => window.removeEventListener('keydown', submitFromKeyboard, { capture: true });
  }, [answer, check, ex, phase]);

  function next() {
    if (index + 1 >= total) {
      setPhase('complete');
    } else {
      setIndex((i) => i + 1);
      setAnswer(null);
      setPhase('answering');
    }
  }

  if (phase === 'complete') {
    const accuracy = Math.round((correctCount / total) * 100);
    return (
      <LessonComplete
        leaves={lesson.reward}
        accuracy={accuracy}
        words={total}
        onContinue={onComplete}
      />
    );
  }

  return (
    <div className="screen lesson">
      <header className="lesson__top">
        <button type="button" className="lesson__close" onClick={() => setConfirmQuit(true)} aria-label="Close lesson">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor"
               strokeWidth="2.4" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        {/* Segmented progress — one segment per exercise (per the design). */}
        <div
          className="progress"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={index}
        >
          {exercises.map((_, i) => (
            <span
              key={i}
              className={`progress__seg${i < index ? ' progress__seg--done' : i === index ? ' progress__seg--current' : ''}`}
            />
          ))}
        </div>
      </header>

      {confirmQuit && (
        <div className="quit" role="dialog" aria-label="Leave the lesson?">
          <div className="quit__sheet">
            <Pip className="quit__pip" />
            <h2 className="quit__title">Leave the lesson?</h2>
            <p className="quit__sub">Your sprout keeps what you've grown so far. 🌱</p>
            <button type="button" className="btn-primary quit__stay" onClick={() => setConfirmQuit(false)}>Keep going</button>
            <button type="button" className="quit__leave" onClick={onExit}>Leave for now</button>
          </div>
        </div>
      )}

      <main className="screen__body">
        {ex.kind === 'choice' ? (
          <MultipleChoice
            key={ex.id}
            word={ex.word}
            choices={ex.choices}
            selectedId={typeof answer === 'string' ? answer : null}
            answerId={ex.answerId}
            revealed={phase === 'feedback'}
            onSelect={setAnswer}
          />
        ) : ex.kind === 'arrange' ? (
          <ArrangeWords
            key={ex.id}
            prompt={ex.prompt}
            tiles={ex.tiles}
            revealed={phase === 'feedback'}
            onChange={setAnswer}
          />
        ) : ex.kind === 'fill' ? (
          <FillBlank
            key={ex.id}
            before={ex.before}
            after={ex.after}
            value={typeof answer === 'string' ? answer : ''}
            revealed={phase === 'feedback'}
            onChange={setAnswer}
          />
        ) : ex.kind === 'listen' ? (
          <ListenType
            key={ex.id}
            word={ex.word}
            value={typeof answer === 'string' ? answer : ''}
            revealed={phase === 'feedback'}
            onChange={setAnswer}
          />
        ) : (
          <MatchPairs
            key={ex.id}
            pairs={ex.pairs}
            revealed={phase === 'feedback'}
            onChange={setAnswer}
          />
        )}
      </main>

      {phase === 'answering' && (
        <footer className="lesson__foot">
          <button type="button" className="btn-primary" disabled={!isComplete(ex, answer)} onClick={check}>
            CHECK
          </button>
        </footer>
      )}

      {phase === 'feedback' && (
        <FeedbackDrawer result={result} ex={ex} onContinue={next} />
      )}
    </div>
  );
}
