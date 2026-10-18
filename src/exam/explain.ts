/* Short plain-English explanation for the parent, from the stem and the parent's pick.
   Local rules only, no model call. Always flagged as written by Sprout. */

export const BLANK = '____';

const PRONOUNS: Record<string, string> = {
  he: 'one boy or man',
  she: 'one girl or woman',
  it: 'one thing or animal',
  they: 'more than one person or thing',
  we: 'the speaker and other people',
  i: 'the person speaking',
  you: 'the person being spoken to',
};

const BE_VERBS: Record<string, string> = {
  is: 'goes with one person or thing, now',
  are: 'goes with two or more people or things, or with “you”, now',
  am: 'goes with “I”, now',
  was: 'goes with one person or thing, in the past',
  were: 'goes with two or more people or things, in the past',
};

const LINKERS: Record<string, string> = {
  in: 'means inside something',
  on: 'means touching the top or surface of something',
  over: 'means going across the top of something, from one side to the other',
  under: 'means below something',
  into: 'means moving from outside to inside something',
  through: 'means going in one side and out the other',
  at: 'points to an exact place or time',
  to: 'shows where something is going',
  from: 'shows where something started',
  and: 'joins two things that both happen or are both true',
  so: 'shows a result: the second part happens because of the first',
  or: 'gives a choice between two things',
  but: 'joins two ideas that are different',
  because: 'gives the reason for something',
};

const NOT_NAMES = new Set(['The', 'A', 'An', 'This', 'That', 'Please', 'Mr', 'Mrs', 'Ms', 'Miss', 'Dr']);

function quote(word: string) {
  return `“${word}”`;
}

function fill(stem: string, answer: string) {
  const parts = stem.split(BLANK);
  if (parts.length < 2) return '';
  let sentence = parts[0] + answer + parts.slice(1).join(BLANK);
  sentence = sentence.replace(/(^|[.!?]\s+)([a-z])/g, (_, lead: string, first: string) => lead + first.toUpperCase());
  return sentence.replace(/\s+/g, ' ').trim();
}

function namesBefore(stem: string) {
  const before = stem.split(BLANK)[0] ?? stem;
  const names = [...before.matchAll(/\b[A-Z][a-z]+\b/g)].map((match) => match[0]);
  return names.filter((name) => !NOT_NAMES.has(name) && !(name.toLowerCase() in PRONOUNS));
}

function reason(stem: string, answer: string): string {
  const word = answer.toLowerCase();
  if (word in PRONOUNS) {
    const names = namesBefore(stem);
    const who = (word === 'he' || word === 'she') && names.length === 1 ? ` Here it stands for ${names[0]}.` : '';
    return `${quote(answer)} is the word for ${PRONOUNS[word]}.${who}`;
  }
  if (word in BE_VERBS) {
    const pair = /\b([A-Z][a-z]+) and ([A-Z][a-z]+)\s+____/.exec(stem);
    const who = pair ? ` ${pair[1]} and ${pair[2]} are two people.` : '';
    return `${quote(answer)} ${BE_VERBS[word]}.${who}`;
  }
  if (word in LINKERS) return `${quote(answer)} ${LINKERS[word]}.`;
  return `${quote(answer)} is the answer you picked for the blank.`;
}

export function explainPick(stem: string, answer: string): string {
  const sentence = fill(stem, answer);
  const why = reason(stem, answer);
  if (!sentence) return `The answer you picked is ${quote(answer)}. ${why}`;
  return `${sentence} ${why}`;
}

export const EXPLAIN_FLAG_NOTE =
  'Written by Sprout’s local rules from the question and your picked answer. The child does not see this.';
