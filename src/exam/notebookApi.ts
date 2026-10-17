/* Send the notebook and parent review to the local saver, which writes Obsidian Markdown. */

import {
  groupNotebook,
  missedByTopic,
  rankWeakTopics,
  scoreSession,
  type NotebookEntry,
  type PracticeSession,
  type ScanReview,
} from './notebook.ts';
import { topicLabel } from './topics.ts';
import type { ParentScan } from './types.ts';

export type SaveResult = { paths: string[]; skipped: string[] };

function when(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function notebookPayload(entries: NotebookEntry[], sessions: PracticeSession[], log: string[]) {
  return {
    groups: groupNotebook(entries).map((group) => ({
      label: group.label,
      count: group.count,
      topics: group.topics.map((topic) => ({
        label: topic.label,
        entries: topic.entries.map((entry) => ({
          stem: entry.stem,
          choices: entry.choices,
          student_answer: entry.student_answer,
          correct_answer: entry.correct_answer,
          parent_mark: entry.parent_mark,
          paper_title: entry.paper_title,
          added: when(entry.addedAt).slice(0, 10),
        })),
      })),
    })),
    weak: rankWeakTopics(entries, sessions).map((row) => ({
      label: row.label,
      subject_label: row.subjectLabel,
      in_notebook: row.inNotebook,
      practice_tries: row.practiceTries,
      practice_misses: row.practiceMisses,
    })),
    sessions: [...sessions]
      .reverse()
      .slice(0, 20)
      .map((session) => ({
        at: when(session.at),
        scope: session.scope,
        ...scoreSession(session),
        missed: missedByTopic(session),
      })),
    log,
  };
}

export function reviewPayload(scan: ParentScan, review: ScanReview, paths: string[]) {
  return {
    paths,
    questions: scan.questions.map((question) => ({
      id: question.id,
      stem: question.stem,
      topic: topicLabel(review[question.id]?.topic ?? ''),
      topic_source: review[question.id]?.topicSource ?? 'rule',
      mark: review[question.id]?.mark ?? 'unmarked',
    })),
  };
}

async function post(url: string, body: unknown): Promise<SaveResult> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error((await res.text()) || `Save failed (${res.status})`);
  const data = (await res.json()) as { ok: boolean; paths?: string[]; skipped?: string[]; message?: string };
  if (!data.ok) throw new Error(data.message || 'Save failed');
  return { paths: data.paths || [], skipped: data.skipped || [] };
}

export function saveNotebookNote(entries: NotebookEntry[], sessions: PracticeSession[], log: string[]) {
  return post('/api/notebook', notebookPayload(entries, sessions, log));
}

export function saveReviewNote(scan: ParentScan, review: ScanReview, paths: string[]) {
  return post('/api/review', reviewPayload(scan, review, paths));
}
