/* LessonScreenSoT — SoT Lock B lesson chrome implementation.
   Implements the approved SoT Lock B design with:
   - Duo-row progress (X left, continuous bar right)
   - Pip + speech bubble question row
   - Tap-ready word-pick text cards
   - Full-bleed mint/coral feedback sheets
   - Check/Continue/Got it CTAs */

import { useCallback, useEffect, useState } from 'react';
import WordPick from '../components/WordPick';
import PipPose from '../components/PipPose';
import { playSproutFeedback } from '../utils/feedback';

interface Question {
  prompt: string;
  choices: string[];
  correct: string;
}

const QUESTIONS: Question[] = [
  {
    prompt: 'Which word means sprout?',
    choices: ['seedling', 'sprout', 'bloom', 'root'],
    correct: 'sprout',
  },
  {
    prompt: 'Which word means a baby plant?',
    choices: ['bloom', 'root', 'seedling', 'sprout'],
    correct: 'seedling',
  },
  {
    prompt: 'Which word means flower?',
    choices: ['root', 'bloom', 'sprout', 'seedling'],
    correct: 'bloom',
  },
  {
    prompt: 'Which word is underground?',
    choices: ['sprout', 'bloom', 'seedling', 'root'],
    correct: 'root',
  },
  {
    prompt: 'Which word means seed?',
    choices: ['leaf', 'seed', 'stem', 'petal'],
    correct: 'seed',
  },
  {
    prompt: 'Which word means leaf?',
    choices: ['seed', 'petal', 'leaf', 'stem'],
    correct: 'leaf',
  },
  {
    prompt: 'Which word means home?',
    choices: ['home', 'door', 'window', 'roof'],
    correct: 'home',
  },
  {
    prompt: 'Which word means garden?',
    choices: ['grass', 'garden', 'fence', 'path'],
    correct: 'garden',
  },
];

interface LessonScreenSoTProps {
  onExit: () => void;
  onComplete?: () => void;
  questions?: Question[];
}

type Phase = 'question' | 'selected' | 'check' | 'feedback';
type Result = 'correct' | 'almost';

export default function LessonScreenSoT({ onExit, onComplete, questions }: LessonScreenSoTProps) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>('question');
  const [result, setResult] = useState<Result>('correct');

  const activeQuestions = questions || QUESTIONS;
  const q = activeQuestions[index];
  const total = activeQuestions.length;

  function progressPct() {
    const base = (index / total) * 100;
    const bump = phase === 'feedback' ? (1 / total) * 100 : 0;
    return Math.min(100, Math.round(base + bump * 0.55 + 28));
  }

  const onSelect = useCallback((choice: string) => {
    if (phase !== 'question' && phase !== 'selected') return;
    setSelected(choice);
    setPhase('selected');
  }, [phase]);

  const onCheck = useCallback(() => {
    if (phase !== 'selected') return;
    setPhase('check');

    setTimeout(() => {
      const isCorrect = selected === q.correct;
      setResult(isCorrect ? 'correct' : 'almost');
      if (isCorrect) playSproutFeedback('correct');
      setPhase('feedback');
    }, 180);
  }, [phase, selected, q.correct]);

  const onAdvance = useCallback(() => {
    if (phase !== 'feedback') return;
    if (index + 1 >= total) {
      if (onComplete) onComplete();
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
    setPhase('question');
  }, [phase, index, total, onComplete]);

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

  return (
    <div className="screen lesson lesson--sot">
      <header className="lesson__top">
        <button
          type="button"
          className="lesson__close"
          onClick={() => {
            playSproutFeedback('modalOpen');
            onExit();
          }}
          aria-label="Close lesson"
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        <div className="lesson__progress-bar" role="progressbar" aria-valuenow={progressPct()} aria-valuemin={0} aria-valuemax={100}>
          <i className="lesson__progress-fill" style={{ width: `${progressPct()}%` }} />
        </div>
      </header>

      <section className="lesson__q-row">
        <div className={`lesson__pip-wrap${pipPose === 'correct' ? ' lesson__pip-wrap--proud' : pipPose === 'almost' ? ' lesson__pip-wrap--soft' : ''}`} aria-hidden="true">
          <PipPose pose={pipPose} />
        </div>
        {showBubble && (
          <div className="lesson__bubble">
            <p className="lesson__bubble-text">{q.prompt}</p>
          </div>
        )}
      </section>

      <main className="screen__body">
        <WordPick
          prompt={q.prompt}
          choices={q.choices}
          selected={selected}
          correct={q.correct}
          revealed={phase === 'feedback'}
          onSelect={onSelect}
        />
      </main>

      <footer className={`lesson__foot${phase === 'feedback' ? ' lesson__foot--has-sheet' : ''}`}>
        {phase !== 'feedback' && (
          <button
            type="button"
            className="lesson__check"
            disabled={!selected}
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
