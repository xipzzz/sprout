/* Child practice for the exam prototype.
   Props are the child view only: stem and choices. No answer fields. */

import { useState } from 'react';
import type { ChildView } from '../exam/types';

type Grade = 'nice' | 'almost';

interface ExamChildPracticeProps {
  view: ChildView;
  onGrade: (questionId: string, choice: string) => Grade;
  onBack: () => void;
  onExit: () => void;
}

export default function ExamChildPractice({ view, onGrade, onBack, onExit }: ExamChildPracticeProps) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [grade, setGrade] = useState<Grade | null>(null);
  const question = view.questions[index];
  const total = view.questions.length;

  for (const item of view.questions) {
    const keys = Object.keys(item).sort().join(',');
    if (keys !== 'choices,id,stem') {
      throw new Error('Child practice refused a question that is not the child shape.');
    }
  }

  function choose(choice: string) {
    if (!question) return;
    setPicked(choice);
    setGrade(onGrade(question.id, choice));
  }

  function next() {
    setPicked(null);
    setGrade(null);
    setIndex((value) => Math.min(total - 1, value + 1));
  }

  if (!question) {
    return (
      <div className="screen exam-proto" data-screen="child-practice">
        <p className="exam-proto__lead">No practice questions on this page.</p>
        <button type="button" className="exam-proto__secondary" onClick={onBack}>
          Parent page
        </button>
      </div>
    );
  }

  return (
    <div className="screen exam-proto" data-screen="child-practice">
      <header className="exam-proto__top">
        <button type="button" className="lesson__close" onClick={onExit} aria-label="Close practice">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        <h1 className="exam-proto__title">Practice</h1>
        <button type="button" className="exam-proto__text-btn" onClick={onBack}>
          Parent page
        </button>
      </header>
      <main className="screen__body exam-proto__body">
        <p className="exam-proto__kicker">
          {view.subject} · {index + 1} of {total}
        </p>
        <article className="exam-proto__sheet">
          <h2 className="exam-proto__stem">{question.stem}</h2>
          {question.choices.length > 0 ? (
            <div className="exam-proto__picks">
              {question.choices.map((choice) => {
                const selected = picked === choice;
                let tone = '';
                if (selected && grade === 'nice') tone = ' exam-proto__pick--nice';
                else if (selected && grade === 'almost') tone = ' exam-proto__pick--almost';
                else if (selected) tone = ' exam-proto__pick--picked';
                return (
                  <button
                    key={choice}
                    type="button"
                    className={`exam-proto__pick${tone}`}
                    onClick={() => choose(choice)}
                  >
                    {choice}
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="exam-proto__read">Read this sentence out loud.</p>
          )}
          {grade === 'nice' && <p className="exam-proto__result exam-proto__result--nice">Nicely done.</p>}
          {grade === 'almost' && (
            <p className="exam-proto__result exam-proto__result--almost">Almost — try another word.</p>
          )}
          {grade === 'nice' && index + 1 < total && (
            <button type="button" className="btn-primary exam-proto__cta" onClick={next}>
              Next question
            </button>
          )}
          {grade === 'nice' && index + 1 >= total && (
            <p className="exam-proto__done">That is the last question.</p>
          )}
        </article>
      </main>
    </div>
  );
}
