/* Child round of notebook questions. Props are the child view only: ids, stems, choices.
   Grading happens in the parent screen through onAnswer, which returns a word, never the answer. */

import { useState } from 'react';
import type { RoundGrade } from '../exam/mistakesRound';
import type { ChildView } from '../exam/types';
import '../styles/exam-notebook.css';

interface ExamMistakesRoundProps {
  view: ChildView;
  onAnswer: (questionId: string, answer: string) => RoundGrade;
  onFinish: (firstTries: Record<string, RoundGrade>) => void;
}

const FEEDBACK: Record<RoundGrade, string> = {
  nice: 'Nicely done.',
  almost: 'Almost. Have another go, or move on.',
  unchecked: 'Pip will ask a grown-up to check this one.',
};

export default function ExamMistakesRound({ view, onAnswer, onFinish }: ExamMistakesRoundProps) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [typed, setTyped] = useState('');
  const [grade, setGrade] = useState<RoundGrade | null>(null);
  const [firstTries, setFirstTries] = useState<Record<string, RoundGrade>>({});
  const [done, setDone] = useState(false);
  const question = view.questions[index];
  const total = view.questions.length;

  for (const item of view.questions) {
    if (Object.keys(item).sort().join(',') !== 'choices,id,stem') {
      throw new Error('Mistakes round refused a question that is not the child shape.');
    }
  }

  function check(answer: string) {
    if (!question || !answer.trim() || grade === 'nice' || grade === 'unchecked') return;
    const result = onAnswer(question.id, answer);
    setPicked(answer);
    setGrade(result);
    setFirstTries((tries) => (tries[question.id] ? tries : { ...tries, [question.id]: result }));
  }

  function next() {
    setPicked(null);
    setTyped('');
    setGrade(null);
    if (index + 1 >= total) setDone(true);
    else setIndex(index + 1);
  }

  function finish() {
    onFinish(firstTries);
  }

  if (!question || done) {
    return (
      <div className="screen exam-proto" data-screen="mistakes-round-done">
        <main className="screen__body exam-proto__body exam-round__done">
          <p className="exam-round__big">All done</p>
          <p className="exam-proto__lead">
            {total ? `You practised ${total} ${total === 1 ? 'question' : 'questions'}. Well done for trying.` : 'Nothing to practise right now.'}
          </p>
          <button type="button" className="btn-primary exam-proto__cta" onClick={finish}>
            Hand back to a grown-up
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="screen exam-proto" data-screen="mistakes-round">
      <header className="exam-proto__top">
        <h1 className="exam-proto__title">Practise again</h1>
        <button type="button" className="exam-proto__text-btn" onClick={finish}>
          Stop
        </button>
      </header>
      <main className="screen__body exam-proto__body">
        <div className="exam-round__progress" aria-hidden="true">
          <span style={{ width: `${((index + (grade ? 1 : 0)) / total) * 100}%` }} />
        </div>
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
                    onClick={() => check(choice)}
                  >
                    {choice}
                  </button>
                );
              })}
            </div>
          ) : (
            <form
              className="exam-round__typed"
              onSubmit={(event) => {
                event.preventDefault();
                check(typed);
              }}
            >
              <label className="exam-mark__label" htmlFor="exam-round-answer">
                Your answer
              </label>
              <input
                id="exam-round-answer"
                className="exam-round__input"
                value={typed}
                autoComplete="off"
                onChange={(event) => setTyped(event.target.value)}
              />
              <button type="submit" className="exam-proto__secondary">
                Check
              </button>
            </form>
          )}
          {grade && <p className={`exam-proto__result exam-proto__result--${grade === 'nice' ? 'nice' : 'almost'}`}>{FEEDBACK[grade]}</p>}
          {grade && (
            <button type="button" className="btn-primary exam-proto__cta exam-round__next" onClick={next}>
              {index + 1 < total ? 'Next question' : 'Finish'}
            </button>
          )}
        </article>
      </main>
    </div>
  );
}
