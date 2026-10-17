/* Explain Like a Teacher, parent view only.
   Local templates per subject and question type, cached by a hash of the question.
   Other sources (for example a free local model through Ollama) can plug in through ExplainSource. */

import type { ParentQuestion } from '../types.ts';
import { normaliseAnswer } from './arithmetic.ts';
import { grammarFor } from './grammar.ts';
import { hashText } from './hash.ts';
import { causeOfError, mathsFor } from './mathsTemplates.ts';
import { EXTRAS_DEFAULTS, wordingFor, type YearGroup } from './settings.ts';

export type ExplainInput = {
  subject: string;
  question: ParentQuestion;
  /** The answer the parent picked on the card. Wins over everything else. */
  pick?: string;
  year?: YearGroup;
};

export type AnswerSource = 'parent' | 'worked-out' | 'page' | 'rule' | 'guess' | 'none';

export type ExplainDraft = {
  template: string;
  supported: boolean;
  answer: string;
  answerSource: AnswerSource;
  steps: string[];
  rule: string;
  sayAloud: string;
  followUp: string;
  notes: string[];
};

export type TeacherExplanation = ExplainDraft & {
  questionId: string;
  key: string;
  source: string;
  fromCache: boolean;
  ms: number;
};

/** One place explanations can come from. Return null to let the next source try. */
export interface ExplainSource {
  id: string;
  label: string;
  explain(input: ExplainInput): ExplainDraft | null | Promise<ExplainDraft | null>;
}

export interface ExplainCache {
  get(key: string): (ExplainDraft & { source: string }) | undefined;
  set(key: string, value: ExplainDraft & { source: string }): void;
}

const TEMPLATE_VERSION = 'v1';

function now() {
  return typeof performance !== 'undefined' ? performance.now() : Date.now();
}

/** Template version, subject and question id, plus a hash of what the card depends on,
    so question 1 on a new page never reuses question 1 from an old one. */
export function explainKey(input: ExplainInput): string {
  const { question } = input;
  const body = JSON.stringify({
    stem: question.stem,
    choices: question.choices,
    student_answer: question.student_answer,
    correct_answer: question.correct_answer,
    guessed: answerIsGuess(question),
    pick: input.pick ?? '',
    year: yearOf(input),
  });
  return `${TEMPLATE_VERSION}:${subjectSlug(input.subject)}:${question.id}:${hashText(body)}`;
}

function yearOf(input: ExplainInput): YearGroup {
  return input.year ?? EXTRAS_DEFAULTS.year;
}

export function subjectSlug(subject: string): 'math' | 'english' | 'other' {
  const text = subject.trim().toLowerCase();
  if (['math', 'maths', 'mathematics', '数学'].includes(text)) return 'math';
  if (['english', '英语'].includes(text)) return 'english';
  return 'other';
}

function answerIsGuess(question: ParentQuestion) {
  return question.flags.some((flag) => flag.field === 'correct_answer' && flag.kind === 'reconstructed');
}

function sameAnswer(a: string, b: string) {
  return normaliseAnswer(a) === normaliseAnswer(b);
}

function numberPart(text: string) {
  return /\d+(\s*R\s*\d+)?/i.exec(text)?.[0] ?? '';
}

function matchingChoice(choices: string[], answer: string) {
  return choices.find((choice) => sameAnswer(numberPart(choice), answer)) ?? null;
}

const AUTO_NOTE_PICK = 'Tap the right answer below and Pip will use it.';

function mathsDraft(input: ExplainInput): ExplainDraft | null {
  const { question, pick } = input;
  const result = mathsFor(question.stem, yearOf(input));
  if (!result) return null;
  const worked = result.worked.answer;
  const notes: string[] = [];
  let computed = worked;
  if (question.choices.length) {
    const choice = matchingChoice(question.choices, worked);
    if (choice) computed = choice;
    else notes.push(`None of the choices match ${worked}. Check the question was read right.`);
  }
  const page = question.correct_answer.trim();
  if (page && !answerIsGuess(question) && !sameAnswer(numberPart(page) || page, worked)) {
    notes.push(`The page says ${page}, but Pip worked out ${worked}.`);
  }
  let answer = computed;
  let answerSource: AnswerSource = 'worked-out';
  if (pick) {
    answer = pick;
    answerSource = 'parent';
    if (!sameAnswer(numberPart(pick) || pick, worked)) {
      notes.push(`You picked ${pick}, but Pip worked out ${worked}. The steps show Pip's working.`);
    }
  }
  const error = causeOfError(result, question.student_answer);
  if (error) notes.push(error);
  return {
    template: result.template,
    supported: true,
    answer,
    answerSource,
    steps: result.steps,
    rule: '',
    sayAloud: result.sayAloud,
    followUp: result.followUp,
    notes,
  };
}

function choiceFor(question: ParentQuestion, text: string) {
  return question.choices.find((choice) => choice.trim().toLowerCase() === text.trim().toLowerCase()) ?? '';
}

function resolveChoiceAnswer(input: ExplainInput, ruleAnswer: string | null) {
  const { question, pick } = input;
  const page = choiceFor(question, question.correct_answer) || question.correct_answer.trim();
  const guessed = answerIsGuess(question);
  const notes: string[] = [];
  let answer = '';
  let answerSource: AnswerSource = 'none';
  if (pick) {
    answer = pick;
    answerSource = 'parent';
  } else if (page && !guessed) {
    answer = page;
    answerSource = 'page';
  } else if (ruleAnswer) {
    answer = ruleAnswer;
    answerSource = 'rule';
  } else if (page) {
    answer = page;
    answerSource = 'guess';
  }
  if (ruleAnswer && answer && !sameAnswer(answer, ruleAnswer)) {
    notes.push(`Pip's rule points to "${ruleAnswer}". Check which one is right.`);
  }
  if (answerSource === 'guess' || answerSource === 'none') notes.push(AUTO_NOTE_PICK);
  return { answer, answerSource, notes };
}

function englishDraft(input: ExplainInput): ExplainDraft | null {
  const { question } = input;
  const grammar = grammarFor(question.stem, question.choices, yearOf(input));
  if (!grammar) return null;
  const { answer, answerSource, notes } = resolveChoiceAnswer(input, grammar.ruleAnswer);
  const steps = answer
    ? grammar.steps(answer)
    : ['Pip could not tell from the words alone.', 'Pick the right answer below and Pip will fill in the steps.'];
  return {
    template: `english-${grammar.kind}`,
    supported: true,
    answer,
    answerSource,
    steps,
    rule: grammar.rule(answer),
    sayAloud: grammar.sayAloud,
    followUp: grammar.followUp,
    notes,
  };
}

function fallbackDraft(input: ExplainInput): ExplainDraft {
  const { answer, answerSource, notes } = resolveChoiceAnswer(input, null);
  const short = wordingFor(yearOf(input)) === 'short';
  return {
    template: 'not-yet',
    supported: false,
    answer,
    answerSource,
    steps: [],
    rule: '',
    sayAloud: short ? 'Read it together. Which words help?' : 'Let us read the question together. Which words help you choose?',
    followUp: short ? 'Which words help you choose?' : 'Which words in the question help you choose?',
    notes: ['Pip has no template for this kind of question yet.', ...notes],
  };
}

/** Local templates: maths first, then English grammar choices. Always returns a card. */
export function explainLocal(input: ExplainInput): ExplainDraft {
  const subject = subjectSlug(input.subject);
  const order = subject === 'english' ? [englishDraft, mathsDraft] : [mathsDraft, englishDraft];
  for (const make of order) {
    const draft = make(input);
    if (draft) return draft;
  }
  return fallbackDraft(input);
}

export const localTemplates: ExplainSource = {
  id: 'local-templates',
  label: "Pip's local templates",
  explain: explainLocal,
};

export function memoryCache(): ExplainCache {
  const store = new Map<string, ExplainDraft & { source: string }>();
  return { get: (key) => store.get(key), set: (key, value) => void store.set(key, value) };
}

/** Memory first, then localStorage so a reload stays instant. */
export function browserCache(prefix = `sprout.explain.${TEMPLATE_VERSION}.`): ExplainCache {
  const memory = memoryCache();
  const storage = typeof localStorage === 'undefined' ? null : localStorage;
  return {
    get(key) {
      const hit = memory.get(key);
      if (hit || !storage) return hit;
      try {
        const raw = storage.getItem(prefix + key);
        if (!raw) return undefined;
        const value = JSON.parse(raw) as ExplainDraft & { source: string };
        memory.set(key, value);
        return value;
      } catch {
        return undefined;
      }
    },
    set(key, value) {
      memory.set(key, value);
      try {
        storage?.setItem(prefix + key, JSON.stringify(value));
      } catch {
        /* storage full or blocked: the memory copy still works */
      }
    },
  };
}

let shared: ExplainCache | null = null;

/** One cache for the whole page, so the explain step and child hints share cards. */
export function appExplainCache(): ExplainCache {
  shared ??= browserCache();
  return shared;
}

function finish(input: ExplainInput, key: string, draft: ExplainDraft & { source: string }, fromCache: boolean, t0: number) {
  return { ...draft, questionId: input.question.id, key, fromCache, ms: Math.round((now() - t0) * 10) / 10 };
}

/** Sync path for the local templates. Used for child hints so nothing waits. */
export function explainNow(input: ExplainInput, cache: ExplainCache): TeacherExplanation {
  const t0 = now();
  const key = explainKey(input);
  const hit = cache.get(key);
  if (hit) return finish(input, key, hit, true, t0);
  const value = { ...explainLocal(input), source: localTemplates.id };
  cache.set(key, value);
  return finish(input, key, value, false, t0);
}

/** Tries each source in order, then falls back to the local templates. */
export async function explainQuestion(
  input: ExplainInput,
  cache: ExplainCache,
  sources: ExplainSource[] = [localTemplates],
): Promise<TeacherExplanation> {
  const t0 = now();
  const key = explainKey(input);
  const hit = cache.get(key);
  if (hit) return finish(input, key, hit, true, t0);
  for (const source of sources) {
    try {
      const draft = await source.explain(input);
      if (draft) {
        const value = { ...draft, source: source.id };
        cache.set(key, value);
        return finish(input, key, value, false, t0);
      }
    } catch {
      /* a broken optional source should not block the local card */
    }
  }
  const value = { ...explainLocal(input), source: localTemplates.id };
  cache.set(key, value);
  return finish(input, key, value, false, t0);
}
