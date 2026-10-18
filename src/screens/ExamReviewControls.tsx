/* Right or wrong toggle and topic picker on a parent review card. Parent view only. */

import { markHint, type Mark, type QuestionReview } from '../exam/notebook';
import { topicsFor } from '../exam/topics';
import type { ParentQuestion } from '../exam/types';
import '../styles/exam-notebook.css';

interface ExamReviewControlsProps {
  question: ParentQuestion;
  subject: string;
  review: QuestionReview | undefined;
  inNotebook: boolean;
  onChange: (patch: Partial<Pick<QuestionReview, 'mark' | 'topic'>>) => void;
}

const MARKS: { value: Mark; label: string }[] = [
  { value: 'right', label: 'Right' },
  { value: 'wrong', label: 'Wrong' },
  { value: 'unmarked', label: 'Not marked' },
];

const SOURCE_NOTE: Record<QuestionReview['topicSource'], string> = {
  rule: 'Picked from key words. Change it if it looks off.',
  fallback: 'No key word matched, so this is a best guess.',
  parent: 'Set by you.',
};

export default function ExamReviewControls({ question, subject, review, inNotebook, onChange }: ExamReviewControlsProps) {
  if (!review) return null;
  const hint = markHint(question);
  const topicId = `exam-topic-${question.id}`;
  return (
    <div className="exam-mark">
      <p className="exam-mark__label" id={`exam-mark-${question.id}`}>
        Your mark
      </p>
      <div className="exam-mark__toggle" role="group" aria-labelledby={`exam-mark-${question.id}`}>
        {MARKS.map((mark) => (
          <button
            key={mark.value}
            type="button"
            className={`exam-mark__btn exam-mark__btn--${mark.value}`}
            aria-pressed={review.mark === mark.value}
            onClick={() => onChange({ mark: mark.value })}
          >
            {mark.label}
          </button>
        ))}
      </div>
      {review.mark === 'unmarked' && hint !== 'unmarked' && (
        <p className="exam-mark__hint">
          The teacher’s mark looks like a {hint === 'right' ? 'tick' : 'cross'}. Tap {hint === 'right' ? 'Right' : 'Wrong'} if
          that is right.
        </p>
      )}
      {inNotebook && <p className="exam-mark__saved">In the mistake notebook</p>}

      <label className="exam-mark__label" htmlFor={topicId}>
        Topic
      </label>
      <select
        id={topicId}
        className="exam-mark__select"
        value={review.topic}
        onChange={(event) => onChange({ topic: event.target.value })}
      >
        {topicsFor(subject).map((topic) => (
          <option key={topic.id} value={topic.id}>
            {topic.label}
          </option>
        ))}
      </select>
      <p className="exam-mark__hint">{SOURCE_NOTE[review.topicSource]}</p>
    </div>
  );
}
