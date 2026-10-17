/* Parent review state for one scan: marks, topics, notebook sync to browser storage and Obsidian. */

import { useCallback, useEffect, useState } from 'react';
import {
  loadNotebook,
  loadReview,
  loadSessions,
  scanKeyOf,
  updateQuestion,
  type QuestionReview,
  type ReviewChange,
} from './notebook.ts';
import { saveNotebookNote, saveReviewNote } from './notebookApi.ts';
import { effectiveSubject, subjectLabel, topicLabel } from './topics.ts';
import type { ParentScan } from './types.ts';

function short(stem: string) {
  const text = stem.replace(/\s+/g, ' ').trim();
  return text.length > 60 ? `${text.slice(0, 57)}...` : text;
}

export function changeLogLine(change: ReviewChange): string {
  if (change.kind === 'none') return '';
  const { entry } = change;
  const where = `${subjectLabel(entry.subject)}, ${topicLabel(entry.topic)}`;
  if (change.kind === 'added') return `Added "${short(entry.stem)}" (${where}) from ${entry.paper_title || 'a scan'}.`;
  if (change.kind === 'removed') return `Took "${short(entry.stem)}" out of the notebook.`;
  return `Moved "${short(entry.stem)}" from ${topicLabel(change.from)} to ${topicLabel(entry.topic)}.`;
}

/** Push the whole notebook to Obsidian, appending `log` lines. Resolves to a short status line. */
export async function syncNotebook(log: string[]): Promise<string> {
  try {
    const result = await saveNotebookNote(loadNotebook(localStorage), loadSessions(localStorage), log.filter(Boolean));
    return result.paths.length ? `Notebook saved: ${result.paths.join(' · ')}` : '';
  } catch (err) {
    return `Could not save the notebook note. ${err instanceof Error ? err.message : ''}`.trim();
  }
}

export function useExamReview(scan: ParentScan | null, notePaths: string[]) {
  const [version, setVersion] = useState(0);
  const [status, setStatus] = useState('');

  const review = scan ? loadReview(localStorage, scan) : {};
  const notebook = loadNotebook(localStorage);
  const scanKey = scan ? scanKeyOf(scan) : '';
  const inNotebook = new Set(notebook.filter((entry) => entry.scanKey === scanKey).map((entry) => entry.questionId));

  useEffect(() => {
    if (!scan || !notePaths.length) return;
    void saveReviewNote(scan, loadReview(localStorage, scan), notePaths).catch(() => undefined);
  }, [scan, notePaths, version]);

  const update = useCallback(
    (questionId: string, patch: Partial<Pick<QuestionReview, 'mark' | 'topic'>>) => {
      if (!scan) return;
      const { change } = updateQuestion(localStorage, scan, questionId, patch);
      setVersion((value) => value + 1);
      if (change.kind === 'none') return;
      void syncNotebook([changeLogLine(change)]).then(setStatus);
    },
    [scan],
  );

  return {
    review,
    update,
    inNotebook,
    notebookCount: notebook.length,
    wrongHere: inNotebook.size,
    scanKey,
    subject: scan ? effectiveSubject(scan) : '',
    status,
  };
}
