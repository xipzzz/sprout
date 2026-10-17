/* Parent-only store for review marks, topics, the mistake notebook and practice sessions.
   Lives in browser storage. Nothing here is passed to the child screens; the child
   round goes through mistakesRound.ts, which strips it down to stems and choices. */

import { effectiveSubject, guessTopic, subjectLabel, topicById, topicLabel } from './topics.ts';
import type { ParentQuestion, ParentScan } from './types.ts';

export type Mark = 'right' | 'wrong' | 'unmarked';

export type QuestionReview = {
  topic: string;
  topicSource: 'rule' | 'fallback' | 'parent';
  mark: Mark;
};

export type ScanReview = Record<string, QuestionReview>;

export type NotebookEntry = {
  key: string;
  scanKey: string;
  questionId: string;
  subject: string;
  topic: string;
  stem: string;
  choices: string[];
  student_answer: string;
  correct_answer: string;
  parent_mark: 'wrong';
  paper_title: string;
  addedAt: string;
};

export type FirstTry = 'right' | 'wrong' | 'unchecked';

export type SessionResult = {
  entryKey: string;
  subject: string;
  topic: string;
  firstTry: FirstTry;
};

export type PracticeSession = {
  id: string;
  at: string;
  scope: string;
  results: SessionResult[];
};

export interface KeyValue {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

const REVIEW_KEY = 'sprout.exam.review.v1';
const NOTEBOOK_KEY = 'sprout.exam.notebook.v1';
const SESSIONS_KEY = 'sprout.exam.sessions.v1';
const MAX_SESSIONS = 50;

function read<T>(store: KeyValue, key: string, fallback: T): T {
  try {
    const raw = store.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(store: KeyValue, key: string, value: unknown) {
  store.setItem(key, JSON.stringify(value));
}

/** Stable id for a scan, so a reload of the same page finds its marks again. */
export function scanKeyOf(scan: Pick<ParentScan, 'subject' | 'paper_title' | 'questions'>): string {
  const text = [scan.subject, scan.paper_title, ...scan.questions.map((q) => `${q.id}:${q.stem}`)].join('\n');
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

function suggestedMark(teacherMark: string): Mark {
  const text = (teacherMark || '').trim();
  if (/[✓✔√]/.test(text)) return 'right';
  if (/[×✗✘]/.test(text) || /^x$/i.test(text)) return 'wrong';
  return 'unmarked';
}

/** True when the teacher's mark on the photo hints at Right or Wrong. */
export function markHint(question: ParentQuestion): Mark {
  return suggestedMark(question.teacher_mark);
}

function freshReview(question: ParentQuestion, subject: string): QuestionReview {
  const guess = guessTopic(question, subject);
  return { topic: guess.topic, topicSource: guess.matched ? 'rule' : 'fallback', mark: 'unmarked' };
}

/** Saved review for a scan, with a topic guess filled in for any question not seen before. */
export function loadReview(store: KeyValue, scan: ParentScan): ScanReview {
  const all = read<Record<string, ScanReview>>(store, REVIEW_KEY, {});
  const saved = all[scanKeyOf(scan)] || {};
  const review: ScanReview = {};
  for (const question of scan.questions) {
    const prior = saved[question.id];
    review[question.id] = prior && topicById(prior.topic) ? prior : freshReview(question, effectiveSubject(scan));
  }
  return review;
}

function saveReview(store: KeyValue, scan: ParentScan, review: ScanReview) {
  const all = read<Record<string, ScanReview>>(store, REVIEW_KEY, {});
  all[scanKeyOf(scan)] = review;
  write(store, REVIEW_KEY, all);
}

export function loadNotebook(store: KeyValue): NotebookEntry[] {
  return read<NotebookEntry[]>(store, NOTEBOOK_KEY, []);
}

function saveNotebook(store: KeyValue, entries: NotebookEntry[]) {
  write(store, NOTEBOOK_KEY, entries);
}

export function entryKeyOf(scanKey: string, questionId: string) {
  return `${scanKey}:${questionId}`;
}

function toEntry(scan: ParentScan, question: ParentQuestion, topic: string, now: Date): NotebookEntry {
  const scanKey = scanKeyOf(scan);
  return {
    key: entryKeyOf(scanKey, question.id),
    scanKey,
    questionId: question.id,
    subject: effectiveSubject(scan) || 'other',
    topic,
    stem: question.stem,
    choices: [...question.choices],
    student_answer: question.student_answer,
    correct_answer: question.correct_answer,
    parent_mark: 'wrong',
    paper_title: scan.paper_title,
    addedAt: now.toISOString(),
  };
}

export type ReviewChange =
  | { kind: 'added'; entry: NotebookEntry }
  | { kind: 'removed'; entry: NotebookEntry }
  | { kind: 'retagged'; entry: NotebookEntry; from: string }
  | { kind: 'none' };

/** Apply a parent edit. Wrong puts the question in the notebook; Right or Not marked takes it out. */
export function updateQuestion(
  store: KeyValue,
  scan: ParentScan,
  questionId: string,
  patch: Partial<Pick<QuestionReview, 'mark' | 'topic'>>,
  now = new Date(),
): { review: ScanReview; change: ReviewChange } {
  const review = loadReview(store, scan);
  const question = scan.questions.find((item) => item.id === questionId);
  const current = review[questionId];
  if (!question || !current) return { review, change: { kind: 'none' } };
  const next: QuestionReview = { ...current };
  if (patch.topic && patch.topic !== current.topic && topicById(patch.topic)) {
    next.topic = patch.topic;
    next.topicSource = 'parent';
  }
  if (patch.mark) next.mark = patch.mark;
  review[questionId] = next;
  saveReview(store, scan, review);

  const entries = loadNotebook(store);
  const key = entryKeyOf(scanKeyOf(scan), questionId);
  const index = entries.findIndex((entry) => entry.key === key);
  let change: ReviewChange = { kind: 'none' };
  if (next.mark === 'wrong' && index < 0) {
    const entry = toEntry(scan, question, next.topic, now);
    entries.push(entry);
    change = { kind: 'added', entry };
  } else if (next.mark !== 'wrong' && index >= 0) {
    const [entry] = entries.splice(index, 1);
    change = { kind: 'removed', entry };
  } else if (index >= 0 && entries[index].topic !== next.topic) {
    const from = entries[index].topic;
    entries[index] = { ...entries[index], topic: next.topic };
    change = { kind: 'retagged', entry: entries[index], from };
  }
  saveNotebook(store, entries);
  return { review, change };
}

export function removeEntry(store: KeyValue, key: string): NotebookEntry | undefined {
  const entries = loadNotebook(store);
  const index = entries.findIndex((entry) => entry.key === key);
  if (index < 0) return undefined;
  const [entry] = entries.splice(index, 1);
  saveNotebook(store, entries);
  const all = read<Record<string, ScanReview>>(store, REVIEW_KEY, {});
  const saved = all[entry.scanKey]?.[entry.questionId];
  if (saved && saved.mark === 'wrong') {
    all[entry.scanKey][entry.questionId] = { ...saved, mark: 'unmarked' };
    write(store, REVIEW_KEY, all);
  }
  return entry;
}

export type TopicGroup = { topic: string; label: string; entries: NotebookEntry[] };
export type SubjectGroup = { subject: string; label: string; count: number; topics: TopicGroup[] };

/** Subject, then topic, with counts. Biggest groups first. */
export function groupNotebook(entries: NotebookEntry[]): SubjectGroup[] {
  const subjects = new Map<string, Map<string, NotebookEntry[]>>();
  for (const entry of entries) {
    const topics = subjects.get(entry.subject) ?? new Map<string, NotebookEntry[]>();
    const list = topics.get(entry.topic) ?? [];
    list.push(entry);
    topics.set(entry.topic, list);
    subjects.set(entry.subject, topics);
  }
  return [...subjects.entries()]
    .map(([subject, topics]) => ({
      subject,
      label: subjectLabel(subject),
      count: [...topics.values()].reduce((sum, list) => sum + list.length, 0),
      topics: [...topics.entries()]
        .map(([topic, list]) => ({ topic, label: topicLabel(topic), entries: list }))
        .sort((a, b) => b.entries.length - a.entries.length || a.label.localeCompare(b.label)),
    }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

export function loadSessions(store: KeyValue): PracticeSession[] {
  return read<PracticeSession[]>(store, SESSIONS_KEY, []);
}

export function recordSession(store: KeyValue, session: PracticeSession): PracticeSession[] {
  const sessions = [...loadSessions(store), session].slice(-MAX_SESSIONS);
  write(store, SESSIONS_KEY, sessions);
  return sessions;
}

export type SessionScore = { right: number; wrong: number; unchecked: number; total: number };

export function scoreSession(session: PracticeSession): SessionScore {
  const score = { right: 0, wrong: 0, unchecked: 0, total: session.results.length };
  for (const result of session.results) score[result.firstTry] += 1;
  return score;
}

/** Wrong first tries per topic in one session, most first. */
export function missedByTopic(session: PracticeSession): { topic: string; label: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const result of session.results) {
    if (result.firstTry === 'wrong') counts.set(result.topic, (counts.get(result.topic) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([topic, count]) => ({ topic, label: topicLabel(topic), count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

export type WeakTopic = {
  topic: string;
  label: string;
  subject: string;
  subjectLabel: string;
  inNotebook: number;
  practiceTries: number;
  practiceMisses: number;
  weight: number;
};

/** Rank topics by notebook mistakes plus wrong first tries in practice. */
export function rankWeakTopics(entries: NotebookEntry[], sessions: PracticeSession[]): WeakTopic[] {
  const rows = new Map<string, WeakTopic>();
  function row(subject: string, topic: string): WeakTopic {
    let found = rows.get(topic);
    if (!found) {
      found = {
        topic,
        label: topicLabel(topic),
        subject,
        subjectLabel: subjectLabel(subject),
        inNotebook: 0,
        practiceTries: 0,
        practiceMisses: 0,
        weight: 0,
      };
      rows.set(topic, found);
    }
    return found;
  }
  for (const entry of entries) row(entry.subject, entry.topic).inNotebook += 1;
  for (const session of sessions) {
    for (const result of session.results) {
      if (result.firstTry === 'unchecked') continue;
      const target = row(result.subject, result.topic);
      target.practiceTries += 1;
      if (result.firstTry === 'wrong') target.practiceMisses += 1;
    }
  }
  const ranked = [...rows.values()].map((item) => ({ ...item, weight: item.inNotebook + item.practiceMisses }));
  return ranked
    .filter((item) => item.weight > 0)
    .sort((a, b) => {
      if (b.weight !== a.weight) return b.weight - a.weight;
      const rateA = a.practiceTries ? a.practiceMisses / a.practiceTries : 0;
      const rateB = b.practiceTries ? b.practiceMisses / b.practiceTries : 0;
      return rateB - rateA || a.label.localeCompare(b.label);
    });
}
