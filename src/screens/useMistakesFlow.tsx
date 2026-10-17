/* Routes the exam screen into the mistake notebook, weak topics, and the child mistakes round. */

import { useState } from 'react';
import { buildMistakesRound, gradeRoundAnswer, sessionFromTries, type MistakesRound, type RoundGrade, type RoundScope } from '../exam/mistakesRound';
import { loadNotebook, missedByTopic, recordSession, scoreSession, type PracticeSession } from '../exam/notebook';
import { syncNotebook } from '../exam/useExamReview';
import ExamMistakesRound from './ExamMistakesRound';
import ExamNotebookScreen, { type NotebookTab } from './ExamNotebookScreen';

function sessionLogLine(session: PracticeSession): string {
  const score = scoreSession(session);
  const missed = missedByTopic(session).map((item) => `${item.label} ${item.count}`);
  return (
    `Practice, ${session.scope}: ${score.right} of ${score.right + score.wrong} right on the first try` +
    (score.unchecked ? `, ${score.unchecked} to check` : '') +
    `. Missed: ${missed.length ? missed.join(', ') : 'none'}.`
  );
}

export function useMistakesFlow() {
  const [tab, setTab] = useState<NotebookTab | null>(null);
  const [round, setRound] = useState<MistakesRound | null>(null);
  const [lastSession, setLastSession] = useState<PracticeSession | null>(null);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  function practise(scope: RoundScope) {
    try {
      const next = buildMistakesRound(loadNotebook(localStorage), scope);
      if (!next.view.questions.length) {
        setError('No mistakes to practise yet. Mark a question Wrong first.');
        return;
      }
      setError('');
      setRound(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The mistakes round was not safe to open.');
    }
  }

  function finish(active: MistakesRound, firstTries: Record<string, RoundGrade>) {
    setRound(null);
    const session = sessionFromTries(active, firstTries);
    if (session.results.length) {
      recordSession(localStorage, session);
      setLastSession(session);
      setStatus('');
      void syncNotebook([sessionLogLine(session)]).then(setStatus);
    }
    setTab('weak');
  }

  let screen = null;
  if (round) {
    screen = (
      <ExamMistakesRound
        view={round.view}
        onAnswer={(id, answer) => gradeRoundAnswer(round, id, answer)}
        onFinish={(firstTries) => finish(round, firstTries)}
      />
    );
  } else if (tab) {
    screen = (
      <ExamNotebookScreen
        initialTab={tab}
        lastSession={lastSession}
        noteStatus={status}
        onPractise={practise}
        onBack={() => setTab(null)}
      />
    );
  }

  return {
    screen,
    error,
    openNotebook: (next: NotebookTab = 'notebook') => setTab(next),
    practise,
  };
}
