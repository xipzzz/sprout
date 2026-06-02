/* LessonScreen — the lesson flow as a small state machine:
   answering → (check) → feedback → (continue) → next … → complete.
   Handles multiple exercise kinds (choice, arrange). Calm: a wrong answer
   teaches kindly and you move on — no lives lost. */

import { useState } from 'react';
import { lesson } from '../data/course';
import type { Exercise } from '../data/course';
import MultipleChoice from '../components/MultipleChoice';
import ArrangeWords from '../components/ArrangeWords';
import FeedbackDrawer from '../components/FeedbackDrawer';
import LessonComplete from '../components/LessonComplete';

interface LessonScreenProps {
  onExit: () => void;
  onComplete: () => void;
}

type Phase = 'answering' | 'feedback' | 'complete';
type Answer = string | string[] | null;

function isComplete(ex: Exercise, a: Answer): boolean {
  if (ex.kind === 'choice') return typeof a === 'string';
  return Array.isArray(a) && a.length === ex.answer.length;
}

function isCorrect(ex: Exercise, a: Answer): boolean {
  if (ex.kind === 'choice') return a === ex.answerId;
  return Array.isArray(a) && a.join(' ') === ex.answer.join(' ');
}

export default function LessonScreen({ onExit, onComplete }: LessonScreenProps) {
  const exercises = lesson.exercises;
  const total = exercises.length;

  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState<Answer>(null);
  const [phase, setPhase] = useState<Phase>('answering');
  const [result, setResult] = useState<'correct' | 'wrong'>('correct');
  const [correctCount, setCorrectCount] = useState(0);

  const ex = exercises[index];

  function check() {
    if (!isComplete(ex, answer)) return;
    const ok = isCorrect(ex, answer);
    setResult(ok ? 'correct' : 'wrong');
    if (ok) setCorrectCount((c) => c + 1);
    setPhase('feedback');
  }

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
        <button type="button" className="lesson__close" onClick={onExit} aria-label="Close lesson">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor"
               strokeWidth="2.4" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        <div
          className="progress"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={index}
        >
          <div className="progress__fill" style={{ width: `${(index / total) * 100}%` }} />
        </div>
      </header>

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
        ) : (
          <ArrangeWords
            key={ex.id}
            prompt={ex.prompt}
            tiles={ex.tiles}
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
