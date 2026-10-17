/* Mistake notebook and weak topics. Parent screen: shows the child's answers and practice answers. */

import { useState } from 'react';
import { syncNotebook } from '../exam/useExamReview';
import {
  groupNotebook,
  loadNotebook,
  loadSessions,
  missedByTopic,
  rankWeakTopics,
  removeEntry,
  scoreSession,
  type PracticeSession,
} from '../exam/notebook';
import type { RoundScope } from '../exam/mistakesRound';
import '../styles/exam-notebook.css';

export type NotebookTab = 'notebook' | 'weak';

interface ExamNotebookScreenProps {
  initialTab?: NotebookTab;
  lastSession?: PracticeSession | null;
  noteStatus?: string;
  onPractise: (scope: RoundScope) => void;
  onBack: () => void;
}

function sessionLine(session: PracticeSession): string {
  const score = scoreSession(session);
  const checked = score.right + score.wrong;
  let line = `${score.right} of ${checked} right on the first try`;
  if (score.unchecked) line += `, ${score.unchecked} for you to check`;
  return line;
}

function shortDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString(undefined, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
}

export default function ExamNotebookScreen({
  initialTab = 'notebook',
  lastSession,
  noteStatus,
  onPractise,
  onBack,
}: ExamNotebookScreenProps) {
  const [tab, setTab] = useState<NotebookTab>(initialTab);
  const [, setVersion] = useState(0);
  const [removeStatus, setStatus] = useState('');
  const status = removeStatus || noteStatus;
  const entries = loadNotebook(localStorage);
  const sessions = loadSessions(localStorage);
  const groups = groupNotebook(entries);
  const weak = rankWeakTopics(entries, sessions);
  const notebookTopics = new Set(entries.map((entry) => entry.topic));

  function remove(key: string) {
    const entry = removeEntry(localStorage, key);
    setVersion((value) => value + 1);
    if (entry) void syncNotebook([`Took "${entry.stem}" out of the notebook.`]).then(setStatus);
  }

  return (
    <div className="screen exam-proto exam-book" data-screen={tab === 'weak' ? 'weak-topics' : 'mistake-notebook'}>
      <header className="exam-proto__top">
        <button type="button" className="lesson__close" onClick={onBack} aria-label="Back to the scan">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </button>
        <h1 className="exam-proto__title">{tab === 'weak' ? 'Weak topics' : 'Mistake notebook'}</h1>
      </header>

      <main className="screen__body exam-proto__body">
        <div className="exam-book__tabs" role="tablist" aria-label="Notebook views">
          <button type="button" role="tab" aria-selected={tab === 'notebook'} onClick={() => setTab('notebook')}>
            Notebook ({entries.length})
          </button>
          <button type="button" role="tab" aria-selected={tab === 'weak'} onClick={() => setTab('weak')}>
            Weak topics
          </button>
        </div>
        {status && (
          <p className="exam-proto__save" role="status">
            {status}
          </p>
        )}

        {tab === 'notebook' && (
          <section className="exam-book__section" aria-label="Mistakes by subject and topic">
            {entries.length === 0 ? (
              <p className="exam-proto__lead">
                No mistakes saved yet. Mark a question Wrong on the review page and it lands here.
              </p>
            ) : (
              <>
                <p className="exam-proto__hint">
                  For you only. Pip never shows the child these answers. Also saved to Mistakes.md in Obsidian.
                </p>
                <button
                  type="button"
                  className="btn-primary exam-proto__cta"
                  onClick={() => onPractise({ kind: 'all' })}
                >
                  Practise all mistakes ({entries.length})
                </button>
              </>
            )}
            {groups.map((group) => (
              <div key={group.subject} className="exam-book__subject">
                <h2 className="exam-book__subject-title">
                  {group.label} <span className="exam-book__count">{group.count}</span>
                </h2>
                {group.topics.map((topic) => (
                  <article key={topic.topic} className="exam-proto__card exam-book__topic">
                    <div className="exam-book__topic-head">
                      <h3 className="exam-book__topic-title">
                        {topic.label} <span className="exam-book__count">{topic.entries.length}</span>
                      </h3>
                      <button
                        type="button"
                        className="exam-book__link"
                        onClick={() => onPractise({ kind: 'topic', topic: topic.topic })}
                      >
                        Practise
                      </button>
                    </div>
                    <ul className="exam-book__list">
                      {topic.entries.map((entry) => (
                        <li key={entry.key} className="exam-book__item">
                          <p className="exam-book__stem">{entry.stem}</p>
                          {entry.choices.length > 0 && (
                            <p className="exam-book__meta">Choices: {entry.choices.join(', ')}</p>
                          )}
                          <p className="exam-book__meta">
                            Child wrote <strong>{entry.student_answer || 'nothing'}</strong> · Practice answer{' '}
                            <strong>{entry.correct_answer || 'unknown'}</strong>
                          </p>
                          <p className="exam-book__meta exam-book__meta--soft">
                            {entry.paper_title || 'Scan'} · {shortDate(entry.addedAt)}
                          </p>
                          <button type="button" className="exam-book__remove" onClick={() => remove(entry.key)}>
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            ))}
          </section>
        )}

        {tab === 'weak' && (
          <section className="exam-book__section" aria-label="Weak topics">
            {lastSession && (
              <p className="exam-book__result" role="status">
                Just now: {sessionLine(lastSession)}.
              </p>
            )}
            <p className="exam-proto__hint">
              Ranked by questions in the notebook plus wrong first tries in practice. Also saved to Mistakes.md.
            </p>
            {weak.length === 0 && <p className="exam-proto__lead">No weak topics yet.</p>}
            <ol className="exam-book__rank">
              {weak.map((row, index) => (
                <li key={row.topic} className={`exam-proto__card exam-book__rank-row${index === 0 ? ' is-top' : ''}`}>
                  <span className="exam-book__rank-num">{index + 1}</span>
                  <div className="exam-book__rank-body">
                    {index === 0 && <p className="exam-proto__kicker">Weakest topic</p>}
                    <p className="exam-book__rank-title">{row.label}</p>
                    <p className="exam-book__meta">
                      {row.subjectLabel} · {row.inNotebook} in the notebook ·{' '}
                      {row.practiceTries
                        ? `missed ${row.practiceMisses} of ${row.practiceTries} in practice`
                        : 'not practised yet'}
                    </p>
                    {notebookTopics.has(row.topic) && (
                      <button
                        type="button"
                        className="exam-book__link"
                        onClick={() => onPractise({ kind: 'topic', topic: row.topic })}
                      >
                        Practise this topic
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ol>

            <h2 className="exam-book__subject-title">Practice sessions</h2>
            {sessions.length === 0 && <p className="exam-proto__hint">No practice yet.</p>}
            <ul className="exam-book__sessions">
              {[...sessions].reverse().map((session) => {
                const missed = missedByTopic(session);
                return (
                  <li key={session.id} className="exam-book__session">
                    <p className="exam-book__stem">
                      {session.scope} · {sessionLine(session)}
                    </p>
                    <p className="exam-book__meta exam-book__meta--soft">
                      {shortDate(session.at)}
                      {missed.length > 0 &&
                        ` · Missed: ${missed.map((item) => `${item.label} ${item.count}`).join(', ')}`}
                    </p>
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}
