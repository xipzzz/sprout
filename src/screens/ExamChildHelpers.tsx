/* Child practice helpers: a typed answer box and the hint shown after a wrong try.
   Both only see what the child typed or the hint text. */

import { useState } from 'react';
import '../styles/exam-extras.css';

export function ExamAnswerBox({ onCheck }: { onCheck: (answer: string) => void }) {
  const [value, setValue] = useState('');
  return (
    <form
      className="exam-child__answer"
      onSubmit={(event) => {
        event.preventDefault();
        if (value.trim()) onCheck(value.trim());
      }}
    >
      <label className="exam-child__answer-label" htmlFor="exam-child-answer">
        Your answer
      </label>
      <div className="exam-child__answer-row">
        <input
          id="exam-child-answer"
          className="exam-child__answer-input"
          inputMode="numeric"
          autoComplete="off"
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
        <button type="submit" className="btn-primary exam-child__answer-btn">
          Check
        </button>
      </div>
    </form>
  );
}

export function ExamHint({ text }: { text: string }) {
  return (
    <p className="exam-child__hint" role="status">
      <span className="exam-child__hint-label">Hint from Pip</span>
      {text}
    </p>
  );
}
