/* Fixed topic list and local keyword rules for tagging a question.
   Maths follows the Singapore P1 to P4 syllabus strands; English covers basic grammar.
   No model and no network: the parent can change any guess in review. */

export type TopicSubject = 'math' | 'english';

export type Topic = {
  id: string;
  label: string;
  subject: TopicSubject;
};

export const TOPICS: Topic[] = [
  { id: 'math-whole-numbers', label: 'Whole numbers and place value', subject: 'math' },
  { id: 'math-add-subtract', label: 'Addition and subtraction', subject: 'math' },
  { id: 'math-multiply-divide', label: 'Multiplication and division', subject: 'math' },
  { id: 'math-fractions', label: 'Fractions', subject: 'math' },
  { id: 'math-decimals', label: 'Decimals', subject: 'math' },
  { id: 'math-money', label: 'Money', subject: 'math' },
  { id: 'math-measurement', label: 'Length, mass and volume', subject: 'math' },
  { id: 'math-time', label: 'Time', subject: 'math' },
  { id: 'math-shapes-patterns', label: 'Shapes and patterns', subject: 'math' },
  { id: 'math-angles', label: 'Angles', subject: 'math' },
  { id: 'math-area-perimeter', label: 'Area and perimeter', subject: 'math' },
  { id: 'math-symmetry', label: 'Symmetry', subject: 'math' },
  { id: 'math-graphs', label: 'Picture graphs and bar graphs', subject: 'math' },
  { id: 'math-word-problems', label: 'Word problems', subject: 'math' },
  { id: 'math-other', label: 'Other maths', subject: 'math' },
  { id: 'en-pronouns', label: 'Pronouns', subject: 'english' },
  { id: 'en-agreement', label: 'Is, are, has, have (verb agreement)', subject: 'english' },
  { id: 'en-tenses', label: 'Verb tenses', subject: 'english' },
  { id: 'en-prepositions', label: 'Prepositions', subject: 'english' },
  { id: 'en-conjunctions', label: 'Joining words (conjunctions)', subject: 'english' },
  { id: 'en-articles', label: 'A, an, the (articles)', subject: 'english' },
  { id: 'en-plurals', label: 'Plurals', subject: 'english' },
  { id: 'en-adjectives', label: 'Describing words (adjectives)', subject: 'english' },
  { id: 'en-punctuation', label: 'Punctuation and capitals', subject: 'english' },
  { id: 'en-spelling', label: 'Spelling', subject: 'english' },
  { id: 'en-vocabulary', label: 'Word meaning (vocabulary)', subject: 'english' },
  { id: 'en-reading', label: 'Reading', subject: 'english' },
  { id: 'en-other', label: 'Other English', subject: 'english' },
];

const BY_ID = new Map(TOPICS.map((topic) => [topic.id, topic]));

export function topicById(id: string): Topic | undefined {
  return BY_ID.get(id);
}

export function topicLabel(id: string): string {
  return BY_ID.get(id)?.label ?? 'Other';
}

/** "math" | "english" | "" for anything else (both lists are offered then). */
export function topicSubject(subject: string): TopicSubject | '' {
  const text = (subject || '').trim().toLowerCase();
  if (['math', 'maths', 'mathematics', '数学'].includes(text)) return 'math';
  if (['english', 'en', '英语'].includes(text)) return 'english';
  return '';
}

export function subjectLabel(subject: string): string {
  const kind = topicSubject(subject);
  if (kind === 'math') return 'Maths';
  if (kind === 'english') return 'English';
  const text = (subject || '').trim();
  return text ? text[0].toUpperCase() + text.slice(1) : 'Other';
}

export function topicsFor(subject: string): Topic[] {
  const kind = topicSubject(subject);
  return kind ? TOPICS.filter((topic) => topic.subject === kind) : TOPICS;
}

type Rule = { topic: string; test: (text: string, words: Set<string>) => boolean };

function has(pattern: RegExp) {
  return (text: string) => pattern.test(text);
}

/* Order matters: the first rule that matches wins, so specific strands come
   before the plain operations they often contain. */
const MATH_RULES: Rule[] = [
  { topic: 'math-symmetry', test: has(/\bsymmetr/) },
  { topic: 'math-graphs', test: has(/\b(graph|bar chart|tally|pictogram|picture graph)\b/) },
  { topic: 'math-area-perimeter', test: has(/\b(area|perimeter|square units?)\b|cm²|m²|cm2\b/) },
  { topic: 'math-angles', test: has(/\b(angles?|right angle|degrees?)\b|°/) },
  { topic: 'math-money', test: has(/\$\s?\d|\d\s?¢|\b(cents?|dollars?|price|costs?|cost|change|spent|spend|paid|pay)\b/) },
  {
    topic: 'math-time',
    test: has(/\b(o'clock|minutes?|hours?|a\.m\.|p\.m\.|clock|half past|quarter (past|to)|seconds?|days?|weeks?|months?)\b|\d{1,2}[:.]\d{2}\s?(am|pm)/),
  },
  {
    topic: 'math-measurement',
    test: has(/\d\s?(cm|km|kg|ml|mm|g|m|l|ℓ)\b|\b(length|mass|volume|weighs?|heavier|lighter|litres?|liters?|metres?|meters?|centimetres?|kilograms?|grams?|taller|shorter|longer)\b/),
  },
  { topic: 'math-fractions', test: has(/\b(fractions?|numerator|denominator|halves|half|quarters?|thirds?|eighths?)\b|\b\d+\s?\/\s?\d+\b|[½¼¾⅓⅔⅛]/) },
  { topic: 'math-decimals', test: has(/\b(decimals?|tenths?|hundredths?)\b|\b\d+\.\d+\b/) },
  {
    topic: 'math-shapes-patterns',
    test: has(/\b(shapes?|triangles?|squares?|rectangles?|circles?|semicircles?|cubes?|cuboids?|cones?|cylinders?|spheres?|patterns?|sides?|corners?|straight lines?|curved)\b/),
  },
  { topic: 'math-whole-numbers', test: has(/\b(place value|digits?|tens|ones|hundreds|thousands|greatest|smallest|largest|biggest|in words|in numerals|odd|even|order the numbers|count on|count back|number line)\b/) },
];

const OPERATION_RULES: Rule[] = [
  { topic: 'math-multiply-divide', test: has(/\d\s*[×x*÷]\s*\d|\b(times|multiply|multiplied|divide|divided|share[sd]? equally|groups? of|product|quotient|remainder|each|every)\b/) },
  { topic: 'math-add-subtract', test: has(/\d\s*[+\-−]\s*\d|\b(add|added|plus|sum|total|altogether|in all|subtract|minus|take away|difference|left|more than|less than|fewer than)\b/) },
];

const ENGLISH_RULES: Rule[] = [
  { topic: 'en-punctuation', test: has(/\b(punctuation|full stop|comma|question mark|exclamation|capital letters?|apostrophe)\b/) },
  { topic: 'en-spelling', test: has(/\b(spell|spelling|spelt|correct the word)\b/) },
  { topic: 'en-plurals', test: has(/\b(plural|plurals|singular)\b/) },
  { topic: 'en-reading', test: has(/\b(passage|read the story|comprehension|according to the)\b/) },
  { topic: 'en-vocabulary', test: has(/\b(means?|meaning|opposite|similar|synonym|antonym)\b/) },
  {
    topic: 'en-pronouns',
    test: (_text, words) => countWords(words, ['he', 'she', 'it', 'they', 'we', 'him', 'her', 'them', 'his', 'its', 'their', 'i', 'you', 'us', 'me']) >= 2,
  },
  {
    topic: 'en-agreement',
    test: (_text, words) => countWords(words, ['is', 'are', 'am', 'has', 'have', 'does', 'do']) >= 2,
  },
  {
    topic: 'en-tenses',
    test: (text, words) =>
      countWords(words, ['was', 'were', 'is', 'are', 'went', 'go', 'goes', 'going', 'did', 'played', 'plays', 'play']) >= 2 ||
      /\b(yesterday|last week|tomorrow|past tense|future tense)\b/.test(text),
  },
  {
    topic: 'en-prepositions',
    test: (_text, words) => countWords(words, ['in', 'on', 'at', 'over', 'under', 'into', 'through', 'behind', 'between', 'across', 'beside', 'onto', 'from']) >= 2,
  },
  {
    topic: 'en-conjunctions',
    test: (_text, words) => countWords(words, ['and', 'but', 'or', 'so', 'because', 'although', 'while', 'when', 'if']) >= 2,
  },
  { topic: 'en-articles', test: (_text, words) => countWords(words, ['a', 'an', 'the']) >= 2 },
  { topic: 'en-adjectives', test: has(/\b(describing word|adjectives?|describes?)\b/) },
];

/* Without choices, word counts would fire on any ordinary sentence. */
const STEM_ONLY_RULES = ENGLISH_RULES.filter((rule) =>
  ['en-punctuation', 'en-spelling', 'en-plurals', 'en-reading', 'en-vocabulary', 'en-adjectives'].includes(rule.topic),
);

function countWords(words: Set<string>, list: string[]): number {
  return list.filter((word) => words.has(word)).length;
}

export type TopicGuess = { topic: string; matched: boolean };

export type TaggableQuestion = { stem: string; choices: string[] };

/** Local keyword rules. `matched` is false when nothing fired and a fallback was used. */
export function guessTopic(question: TaggableQuestion, subject: string): TopicGuess {
  const stem = (question.stem || '').toLowerCase();
  const choices = (question.choices || []).map((choice) => choice.toLowerCase().trim());
  const all = `${stem} ${choices.join(' ')}`;
  const choiceWords = new Set(choices.flatMap((choice) => choice.split(/[^a-z']+/).filter(Boolean)));
  const kind = topicSubject(subject) || (/\d/.test(all) ? 'math' : 'english');

  if (kind === 'math') {
    for (const rule of MATH_RULES) if (rule.test(all, choiceWords)) return { topic: rule.topic, matched: true };
    const operations = OPERATION_RULES.filter((rule) => rule.test(all, choiceWords));
    const story = /\bhow (many|much)\b/.test(stem) && stem.split(/\s+/).length >= 12;
    const numbers = stem.match(/\d+/g)?.length ?? 0;
    if (story && (numbers >= 3 || operations.length >= 2)) return { topic: 'math-word-problems', matched: true };
    if (operations.length) return { topic: operations[0].topic, matched: true };
    return { topic: 'math-other', matched: false };
  }

  if (choices.length === 0) {
    const stemWords = new Set(stem.split(/[^a-z']+/).filter(Boolean));
    for (const rule of STEM_ONLY_RULES) if (rule.test(stem, stemWords)) return { topic: rule.topic, matched: true };
    return { topic: 'en-other', matched: false };
  }
  for (const rule of ENGLISH_RULES) if (rule.test(all, choiceWords)) return { topic: rule.topic, matched: true };
  return { topic: 'en-vocabulary', matched: false };
}
