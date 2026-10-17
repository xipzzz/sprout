/* English grammar choice templates: have/has, is/are, pronouns, prepositions, conjunctions.
   Each one gives a simple rule line, a local guess at the answer when the words make it clear,
   and steps that use the real sentence. */

import { EXTRAS_DEFAULTS, wordingFor, type Wording, type YearGroup } from './settings.ts';

export type GrammarKind = 'have-has' | 'is-are' | 'pronoun' | 'preposition' | 'conjunction';

export type GrammarResult = {
  kind: GrammarKind;
  /** The rule's own pick, or null when the words do not make it clear. */
  ruleAnswer: string | null;
  rule: (answer: string) => string;
  steps: (answer: string) => string[];
  sayAloud: string;
  followUp: string;
};

const HAVE = new Set(['have', 'has', 'had']);
const BE = new Set(['is', 'are', 'was', 'were', 'am']);
type Who = 'boy' | 'girl' | 'thing' | 'group' | 'me' | 'you' | 'us';
type Role = 'subject' | 'object' | 'owner';
const PRONOUNS: Record<string, { who: Who; role: Role }> = {
  he: { who: 'boy', role: 'subject' },
  him: { who: 'boy', role: 'object' },
  his: { who: 'boy', role: 'owner' },
  she: { who: 'girl', role: 'subject' },
  her: { who: 'girl', role: 'object' },
  hers: { who: 'girl', role: 'owner' },
  it: { who: 'thing', role: 'subject' },
  its: { who: 'thing', role: 'owner' },
  they: { who: 'group', role: 'subject' },
  them: { who: 'group', role: 'object' },
  their: { who: 'group', role: 'owner' },
  i: { who: 'me', role: 'subject' },
  me: { who: 'me', role: 'object' },
  my: { who: 'me', role: 'owner' },
  we: { who: 'us', role: 'subject' },
  us: { who: 'us', role: 'object' },
  our: { who: 'us', role: 'owner' },
  you: { who: 'you', role: 'subject' },
  your: { who: 'you', role: 'owner' },
};
const PREPOSITIONS: Record<string, string> = {
  in: 'inside something',
  on: 'on top of something, or touching it',
  at: 'at one spot, or at a time on the clock',
  into: 'moving from outside to inside',
  onto: 'moving up on top of something',
  over: 'going above something, from one side to the other',
  under: 'below something',
  through: 'going in one side and out the other',
  across: 'from one side to the other side',
  between: 'in the middle of two things',
  behind: 'at the back of something',
  beside: 'next to something',
  from: 'where something starts',
  to: 'where something is going',
  above: 'higher than something',
  below: 'lower than something',
  near: 'close to something',
  along: 'following the length of something',
  around: 'going round something',
  off: 'away from the top of something',
  past: 'going by something',
  towards: 'moving in the direction of something',
  up: 'moving higher',
  down: 'moving lower',
  by: 'next to something',
  with: 'together with someone or something',
  inside: 'in the inner part of something',
  outside: 'not inside something',
};
const CONJUNCTIONS: Record<string, string> = {
  and: 'joins two things that both happen',
  but: 'shows a change or a surprise',
  or: 'gives a choice',
  so: 'shows what happens because of the first part',
  because: 'gives the reason for the first part',
  then: 'shows what happens next',
  when: 'shows the time something happens',
  if: 'shows that one thing depends on another',
};
const CORE_CONJUNCTIONS = ['and', 'but', 'or', 'so', 'because'];

const MALE_NAMES = ['ali', 'samad', 'ravi', 'ben', 'jun', 'ahmad', 'tom', 'john', 'raju', 'wei', 'sam', 'david', 'peter', 'adam', 'hassan', 'kumar', 'jack', 'daniel', 'ryan', 'arjun'];
const FEMALE_NAMES = ['siti', 'mei', 'fiona', 'priya', 'mary', 'lily', 'aisha', 'sarah', 'anna', 'emma', 'nurul', 'jane', 'ling', 'amy', 'grace', 'hannah', 'zara', 'chloe'];
const MALE_WORDS = ['boy', 'man', 'father', 'dad', 'brother', 'uncle', 'grandfather', 'grandpa', 'king', 'mr', 'son', 'prince', 'his', 'him'];
const FEMALE_WORDS = ['girl', 'woman', 'mother', 'mum', 'mom', 'sister', 'aunt', 'grandmother', 'grandma', 'queen', 'mrs', 'ms', 'miss', 'daughter', 'princess', 'her'];
const PLURAL_WORDS = new Set(['children', 'people', 'men', 'women', 'mice', 'feet', 'teeth', 'geese', 'sheep', 'we', 'they', 'you']);
const SINGLE_WORDS = new Set(['everyone', 'everybody', 'each', 'nobody', 'someone', 'somebody', 'anyone', 'he', 'she', 'it']);
const SUBJECT_STARTERS = new Set(['i', 'you', 'he', 'she', 'it', 'we', 'they', 'the', 'a', 'an', 'my', 'his', 'her', 'our', 'their', 'this', 'that']);
const PAST_CUES = /\b(yesterday|last (night|week|month|year|monday|tuesday|wednesday|thursday|friday|saturday|sunday)|ago|just now)\b/i;

type Gap = { before: string; after: string; atSentenceStart: boolean };

function clean(word: string) {
  return word.toLowerCase().replace(/[^a-z' ]/g, '').trim();
}

function capital(text: string) {
  return text ? text[0].toUpperCase() + text.slice(1) : text;
}

/** Find the blank. OCR sometimes drops it, so a sentence that starts in lower case marks it too. */
export function findGap(stem: string): Gap | null {
  const blank = /_{2,}/.exec(stem);
  if (blank) {
    const before = stem.slice(0, blank.index);
    const after = stem.slice(blank.index + blank[0].length);
    return { before, after, atSentenceStart: /(^|[.!?]["”']?)\s*["“']?\s*$/.test(before) };
  }
  const lower = /[.!?]["”']?\s+(?=[a-z])/.exec(stem);
  if (lower) {
    const cut = lower.index + lower[0].length;
    return { before: stem.slice(0, cut), after: ` ${stem.slice(cut)}`, atSentenceStart: true };
  }
  return null;
}

function sentenceBefore(gap: Gap) {
  const parts = gap.before.split(/[.!?]["”']?\s+/);
  return parts[parts.length - 1].replace(/^["“'\s]+/, '').trim();
}

function sentenceAfter(gap: Gap) {
  return gap.after.split(/[.!?]/)[0].replace(/["”']+$/, '').trim();
}

export function fillGap(stem: string, answer: string): string | null {
  const gap = findGap(stem);
  if (!gap) return null;
  const word = gap.atSentenceStart ? capital(answer) : answer;
  const before = gap.before.replace(/\s*$/, gap.before.trim() ? ' ' : '');
  const after = gap.after.replace(/^\s*/, ' ');
  return `${before}${word}${after}`.replace(/\s+([,.!?”"])/g, '$1').trim();
}

function filledLine(stem: string, answer: string) {
  const filled = fillGap(stem, answer);
  return filled ? `Read it with the word in place: ${filled}` : `Put "${answer}" in the gap and read the sentence aloud.`;
}

export function grammarKind(choices: string[]): GrammarKind | null {
  const words = choices.map(clean).filter(Boolean);
  if (words.length < 2) return null;
  const all = (set: { has(word: string): boolean }) => words.every((word) => set.has(word));
  if (all(HAVE) && words.includes('have') && words.includes('has')) return 'have-has';
  if (all(BE) && words.some((w) => w === 'is' || w === 'was') && words.some((w) => w === 'are' || w === 'were')) return 'is-are';
  if (words.every((word) => word in PRONOUNS)) return 'pronoun';
  if (words.every((word) => word in CONJUNCTIONS) && words.some((word) => CORE_CONJUNCTIONS.includes(word))) {
    return 'conjunction';
  }
  if (words.every((word) => word in PREPOSITIONS)) return 'preposition';
  return null;
}

function pickChoice(choices: string[], word: string | null): string | null {
  if (!word) return null;
  return choices.find((choice) => clean(choice) === word) ?? null;
}

type Count = { phrase: string; many: boolean; person: 'I' | 'you' | null };

function subjectCount(gap: Gap): Count | null {
  let phrase = sentenceBefore(gap);
  if (!phrase) phrase = sentenceAfter(gap).split(/\s+/)[0] ?? '';
  if (!phrase) return null;
  const words = phrase.split(/\s+/);
  if (words.length > 5) phrase = words.slice(-3).join(' ');
  const last = clean(words[words.length - 1]);
  if (/\band\b/i.test(phrase)) return { phrase, many: true, person: null };
  if (last === 'i') return { phrase, many: false, person: 'I' };
  if (last === 'you') return { phrase, many: true, person: 'you' };
  if (PLURAL_WORDS.has(last)) return { phrase, many: true, person: null };
  if (SINGLE_WORDS.has(last)) return { phrase, many: false, person: null };
  const rawLast = words[words.length - 1].replace(/[^A-Za-z]/g, '');
  const knownName = [...MALE_NAMES, ...FEMALE_NAMES].includes(last);
  const isName = knownName || (/^[A-Z]/.test(rawLast) && (words.length > 1 || !/s$/.test(last)));
  if (!isName && /s$/.test(last) && !/(ss|us|is)$/.test(last)) return { phrase, many: true, person: null };
  return { phrase, many: false, person: null };
}

function countWords(count: Count) {
  if (count.person === 'I') return 'I, the person talking';
  if (count.person === 'you') return 'you';
  return count.many ? 'more than one' : 'one person or thing';
}

function haveHas(stem: string, choices: string[], wording: Wording): GrammarResult {
  const gap = findGap(stem);
  const count = gap ? subjectCount(gap) : null;
  let word: string | null = null;
  if (count) {
    if (PAST_CUES.test(stem) && choices.some((c) => clean(c) === 'had')) word = 'had';
    else word = count.many || count.person ? 'have' : 'has';
  }
  const ruleAnswer = pickChoice(choices, word);
  return {
    kind: 'have-has',
    ruleAnswer,
    rule: () => 'Use has with he, she, it or one person. Use have with I, you, we, they or more than one.',
    steps: (answer) => {
      if (count && answer === ruleAnswer) {
        return [
          `Find who the sentence is about: ${count.phrase}.`,
          `That is ${countWords(count)}, so the word is "${answer}".`,
          filledLine(stem, answer),
        ];
      }
      return [filledLine(stem, answer), `Check who the sentence is about, then match it to "${answer}".`];
    },
    sayAloud: wording === 'short' ? 'One person has. More than one have.' : 'Let us read it with each word. Remember, one person has, and more than one have.',
    followUp: wording === 'short' ? 'One person, or more than one?' : 'Does the sentence talk about one person or thing, or more than one?',
  };
}

function isAre(stem: string, choices: string[], wording: Wording): GrammarResult {
  const gap = findGap(stem);
  const count = gap ? subjectCount(gap) : null;
  let word: string | null = null;
  if (count) {
    const past = PAST_CUES.test(stem);
    if (count.person === 'I') word = past ? 'was' : 'am';
    else if (count.many) word = past ? 'were' : 'are';
    else word = past ? 'was' : 'is';
  }
  const ruleAnswer = pickChoice(choices, word);
  return {
    kind: 'is-are',
    ruleAnswer,
    rule: () => 'Use is or was for one person or thing. Use are or were for more than one, and with you, we, they. Use am with I.',
    steps: (answer) => {
      if (count && answer === ruleAnswer) {
        return [
          `Find who is doing it: ${count.phrase}.`,
          `That is ${countWords(count)}, so the word is "${answer}".`,
          filledLine(stem, answer),
        ];
      }
      return [filledLine(stem, answer), `Count who is doing it, then check that "${answer}" matches.`];
    },
    sayAloud: wording === 'short' ? 'One person is. Two or more are.' : 'Let us count who is doing it. One person is, and two or more are.',
    followUp: wording === 'short' ? 'One, or more than one?' : 'How many people or things does the sentence talk about, one or more than one?',
  };
}

type Clue = { who: Who; clue: string; referent: string };

function findWho(stem: string, gap: Gap | null): Clue | null {
  const text = gap ? `${gap.before} ${gap.after}` : stem;
  const lower = text.toLowerCase();
  const names = [...text.matchAll(/\b(Mrs|Mr|Ms|Miss)?\s?([A-Z][a-z]+)\b/g)]
    .map((match) => {
      const lead = text.slice(0, match.index ?? 0);
      return {
        title: (match[1] ?? '').toLowerCase(),
        name: match[2],
        full: match[0].trim(),
        known: Boolean(match[1]) || [...MALE_NAMES, ...FEMALE_NAMES].includes(match[2].toLowerCase()),
        sentenceStart: /(^|[.!?]["”']?)\s*["“']?\s*$/.test(lead),
      };
    })
    .filter((item) => !SUBJECT_STARTERS.has(item.name.toLowerCase()) && !(item.name.toLowerCase() in PRONOUNS));
  if (/\b[A-Z][a-z]+ and [A-Z][a-z]+\b/.test(text)) {
    const pair = /\b[A-Z][a-z]+ and [A-Z][a-z]+\b/.exec(text)?.[0] ?? '';
    return { who: 'group', clue: 'and', referent: pair };
  }
  const referent = (names.find((item) => item.known) ?? names.find((item) => !item.sentenceStart))?.full ?? '';
  const owner = /\b(his|her|their)\b/.exec(lower)?.[1];
  if (owner === 'their') return { who: 'group', clue: owner, referent: referent || 'the group' };
  if (owner) return { who: owner === 'his' ? 'boy' : 'girl', clue: owner, referent: referent || 'the person' };
  for (const item of names) {
    if (item.title === 'mr' || MALE_NAMES.includes(item.name.toLowerCase())) return { who: 'boy', clue: item.full, referent: item.full };
    if (['mrs', 'ms', 'miss'].includes(item.title) || FEMALE_NAMES.includes(item.name.toLowerCase())) {
      return { who: 'girl', clue: item.full, referent: item.full };
    }
  }
  const male = MALE_WORDS.find((word) => new RegExp(`\\b${word}\\b`).test(lower));
  if (male) return { who: 'boy', clue: male, referent: `the ${male}` };
  const female = FEMALE_WORDS.find((word) => new RegExp(`\\b${word}\\b`).test(lower));
  if (female) return { who: 'girl', clue: female, referent: `the ${female}` };
  return null;
}

const WHO_WORDS: Record<Who, string> = {
  boy: 'a boy or a man',
  girl: 'a girl or a woman',
  thing: 'a thing',
  group: 'more than one person',
  me: 'the person talking',
  you: 'the person being spoken to',
  us: 'a group that includes the person talking',
};

function pronoun(stem: string, choices: string[], wording: Wording): GrammarResult {
  const gap = findGap(stem);
  const who = findWho(stem, gap);
  let ruleAnswer: string | null = null;
  if (who) {
    const matches = choices.filter((choice) => PRONOUNS[clean(choice)]?.who === who.who);
    if (matches.length === 1) ruleAnswer = matches[0];
    else if (matches.length > 1 && gap) {
      const role: Role = gap.atSentenceStart ? 'subject' : 'object';
      ruleAnswer = matches.find((choice) => PRONOUNS[clean(choice)].role === role) ?? null;
    }
  }
  return {
    kind: 'pronoun',
    ruleAnswer,
    rule: () => 'He is for a boy or man. She is for a girl or woman. It is for a thing. They is for more than one.',
    steps: (answer) => {
      if (who && answer === ruleAnswer) {
        const clue = who.clue === who.referent ? '' : ` The word "${who.clue}" tells us.`;
        return [
          `Find who the gap stands for: ${who.referent}.`,
          `${capital(who.referent)} is ${WHO_WORDS[who.who]}.${clue}`,
          filledLine(stem, answer),
        ];
      }
      return [filledLine(stem, answer), `Check who the gap stands for, then match it to "${answer}".`];
    },
    sayAloud: wording === 'short' ? 'Who is it about? Point to the word.' : 'Who is this sentence about? Point to the word that tells you.',
    followUp: wording === 'short' ? 'A boy, a girl, a thing, or a group?' : 'Who does the gap stand for? A boy, a girl, a thing, or a group?',
  };
}

const PREP_CUES: Array<{ answer: string; when: RegExp[] }> = [
  {
    answer: 'over',
    when: [
      /\b(jump|jumped|jumps|leap|leapt|leaped|climb|climbed|hop|hopped|fly|flew|kick|kicked)\b/,
      /\b(fence|wall|gate|log|puddle|rope|hedge|net|bar|stream)\b/,
    ],
  },
  {
    answer: 'into',
    when: [
      /\b(pour|poured|pours|put|puts|drop|dropped|throw|threw|jump|jumped|dive|dived|fell|fall|walk|walked|ran|run|went|go|came|come|step|stepped)\b/,
      /\b(jar|box|bag|cup|bottle|pool|room|house|water|bowl|basket|pot|car|bus|classroom|sea|pond|drawer|tank)\b/,
    ],
  },
  { answer: 'through', when: [/\b(tunnel|window|doorway|forest|hole|keyhole|crowd|jungle)\b/] },
  {
    answer: 'across',
    when: [/\b(road|street|river|bridge|playground)\b/, /\b(walk|walked|ran|run|swam|swim|cross|crossed|went|go)\b/],
  },
  { answer: 'under', when: [/\b(hid|hide|hiding|crawled|crawl|sleeps|slept)\b/, /\b(table|bed|chair|tree|umbrella|blanket)\b/] },
  { answer: 'on', when: [/\b(sat|sit|lay|lies|placed|put|stood|stand)\b/, /\b(table|shelf|roof|floor|bed|chair|sofa|grass|desk)\b/] },
  { answer: 'at', when: [/\b(o'clock|noon|midnight|night)\b/] },
  { answer: 'on', when: [/\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday|birthday)\b/] },
  { answer: 'in', when: [/\b(morning|afternoon|evening|january|february|march|april|june|july|august|september|october|november|december)\b/] },
];

function preposition(stem: string, choices: string[], wording: Wording): GrammarResult {
  const lower = stem.toLowerCase();
  const words = choices.map(clean);
  let ruleAnswer: string | null = null;
  let cueWords: string[] = [];
  for (const cue of PREP_CUES) {
    if (!words.includes(cue.answer)) continue;
    const hits = cue.when.map((re) => re.exec(lower)?.[0]);
    if (hits.every(Boolean)) {
      ruleAnswer = pickChoice(choices, cue.answer);
      cueWords = hits as string[];
      break;
    }
  }
  const contrast =
    words.includes('in') && words.includes('into')
      ? 'In tells where something is. Into tells where something moves to.'
      : words.includes('on') && words.includes('onto')
        ? 'On tells where something is. Onto tells where something moves to.'
        : '';
  return {
    kind: 'preposition',
    ruleAnswer,
    rule: (answer) => {
      const meaning = PREPOSITIONS[clean(answer)];
      const base = 'A preposition tells where something is, or which way it moves.';
      return [base, meaning ? `${capital(clean(answer))} means ${meaning}.` : '', contrast].filter(Boolean).join(' ');
    },
    steps: (answer) => {
      const meaning = PREPOSITIONS[clean(answer)];
      const lines: string[] = [];
      if (answer === ruleAnswer && cueWords.length) lines.push(`Look at what happens: ${cueWords.map((w) => `"${w}"`).join(' and ')}.`);
      if (meaning) lines.push(`"${answer}" means ${meaning}.`);
      if (contrast) lines.push(contrast);
      lines.push(filledLine(stem, answer));
      return lines;
    },
    sayAloud: wording === 'short' ? 'Show it with your hands.' : 'Let us act it out with our hands. Which way does it go?',
    followUp: wording === 'short' ? 'Which way does it move?' : 'Picture it happening. Which way does it move?',
  };
}

function startsWithSubject(text: string) {
  const first = text.trim().split(/\s+/)[0] ?? '';
  return SUBJECT_STARTERS.has(clean(first)) || /^[A-Z]/.test(first);
}

function conjunction(stem: string, choices: string[], wording: Wording): GrammarResult {
  const gap = findGap(stem);
  const words = choices.map(clean);
  let word: string | null = null;
  let why = '';
  if (gap) {
    const before = sentenceBefore(gap);
    const after = sentenceAfter(gap);
    const subjectAfter = startsWithSubject(after);
    if (/\b(not|n't|never|still|however)\b/i.test(after) || /\b(wanted|tried|hoped|wished)\b/i.test(before)) {
      word = 'but';
      why = 'The second part is a change or a surprise.';
    } else if (/\?/.test(stem) && /\b(do you|would you|shall|can|which|want|like)\b/i.test(stem)) {
      word = 'or';
      why = 'The sentence asks you to choose.';
    } else if (subjectAfter && /\b(rain|raining|rained|hungry|tired|late|cold|hot|sick|ill|thirsty|dark|sleepy)\b/i.test(before)) {
      word = 'so';
      why = 'The second part happens because of the first part.';
    } else if (!subjectAfter) {
      word = 'and';
      const verb = after.split(/\s+/)[0];
      why = `"${verb}" has no new person in front of it, so the same person does both things.`;
    }
    if (word && !words.includes(word)) word = null;
  }
  const ruleAnswer = pickChoice(choices, word);
  return {
    kind: 'conjunction',
    ruleAnswer,
    rule: (answer) => {
      const meaning = CONJUNCTIONS[clean(answer)];
      const base = 'A joining word links two parts of a sentence.';
      return meaning ? `${base} ${capital(clean(answer))} ${meaning}.` : base;
    },
    steps: (answer) => {
      const lines: string[] = [];
      if (gap) lines.push(`Read the two parts: "${sentenceBefore(gap)}" and "${sentenceAfter(gap)}".`);
      if (answer === ruleAnswer && why) lines.push(why);
      const meaning = CONJUNCTIONS[clean(answer)];
      if (meaning) lines.push(`"${answer}" ${meaning}.`);
      lines.push(filledLine(stem, answer));
      return lines;
    },
    sayAloud: wording === 'short' ? 'Read both parts. How do they join?' : 'Let us read both parts. How do they join together?',
    followUp: wording === 'short' ? 'Do both things happen? Is there a reason? A surprise?' : 'Read both parts. Do they both happen? Does one cause the other? Is there a surprise?',
  };
}

export function grammarFor(stem: string, choices: string[], year: YearGroup = EXTRAS_DEFAULTS.year): GrammarResult | null {
  const kind = grammarKind(choices);
  const wording = wordingFor(year);
  if (kind === 'have-has') return haveHas(stem, choices, wording);
  if (kind === 'is-are') return isAre(stem, choices, wording);
  if (kind === 'pronoun') return pronoun(stem, choices, wording);
  if (kind === 'preposition') return preposition(stem, choices, wording);
  if (kind === 'conjunction') return conjunction(stem, choices, wording);
  return null;
}
