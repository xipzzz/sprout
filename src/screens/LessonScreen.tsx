/* LessonScreen — the lesson flow as a small state machine:
   answering → (check) → feedback → (continue) → next … → complete.
   Calm by design: a wrong answer teaches kindly and you move on — no lives lost. */

import { useState } from 'react';
import { lesson } from '../data/course';
import MultipleChoice from '../components/MultipleChoice';
import FeedbackDrawer from '../components/FeedbackDrawer';
import LessonComplete from '../components/LessonComplete';

interface LessonScreenProps {
  onExit: () => void;
  onComplete: () => void;
}

type Phase = 'answering' | 'feedback' | 'complete';

export default function LessonScreen({ onExit, onComplete }: LessonScreenProps) {
  const exercises = lesson.exercises;
  const total = exercises.length;

  const [index, setIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>('answering');
  const [result, setResult] = useState<'correct' | 'wrong'>('correct');
  const [correctCount, setCorrectCount] = useState(0);

  const ex = exercises[index];

  function check() {
    if (!selectedId) return;
    const ok = selectedId === ex.answerId;
    setResult(ok ? 'correct' : 'wrong');
    if (ok) setCorrectCount((c) => c + 1);
    setPhase('feedback');
  }

  function next() {
    if (index + 1 >= total) {
      setPhase('complete');
    } else {
      setIndex((i) => i + 1);
      setSelectedId(null);
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
        <MultipleChoice
          word={ex.word}
          choices={ex.choices}
          selectedId={selectedId}
          answerId={ex.answerId}
          revealed={phase === 'feedback'}
          onSelect={setSelectedId}
        />
      </main>

      {phase === 'answering' && (
        <footer className="lesson__foot">
          <button type="button" className="btn-primary" disabled={!selectedId} onClick={check}>
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
