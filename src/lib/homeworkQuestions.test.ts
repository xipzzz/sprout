/**
 * Worksheet OCR drafts — questions come from the sheet, never a canned bank.
 * Run: npx tsx src/lib/homeworkQuestions.test.ts
 */
import {
  assessAcceptance,
  canStartPractice,
  parseWorksheetOcr,
} from './homeworkQuestions';

function assert(cond: boolean, message: string) {
  if (!cond) throw new Error(message);
}

const sheet = `Possessive adjectives
Choose the correct word.

1. This is _____ book. (I)
(1) my
(2) mine
(3) me

2. The cat licked _____ paw.
(1) it
(2) its
(3) it's

3. Those toys are _____. (they)
(1) their
(2) theirs
(3) them

4. _____ sister is kind. (she)
(1) Her
(2) Hers
(3) She

5. She _____ a red bag.
(1) have
(2) has

6. They _____ two cats.
(1) have
(2) has

Answers
1. my
2. its
3. theirs
4. Her
5. has
6. have
`;

const drafts = parseWorksheetOcr(sheet, undefined, 88);
assert(drafts.length === 6, `expected 6 questions, got ${drafts.length}`);
const banned = ['seedling', 'bloom', 'fence', 'sprout', 'root'];
for (const draft of drafts) {
  assert(!banned.includes(draft.stem.toLowerCase()), 'stem must come from the sheet');
  for (const choice of draft.choices) {
    assert(!banned.includes(choice.toLowerCase()), `bank choice leaked: ${choice}`);
  }
}
assert(drafts[0].choices.join(',') === 'my,mine,me', 'first choices');
assert(drafts[0].correct === 'my', 'answer key my');
assert(drafts[1].correct === 'its', 'answer key its');
assert(drafts[2].correct === 'theirs', 'answer key theirs');
assert(drafts[3].correct === 'Her', 'answer key Her');
assert(drafts[4].correct === 'has', 'she → has');
assert(drafts[5].correct === 'have', 'they → have');

const missingPeriod = parseWorksheetOcr(`6 They _____ two cats.
(1) have
(2) has`, undefined, 90);
assert(missingPeriod.length === 1 && missingPeriod[0].correct === 'have', 'question number without a period still parses');
assert(drafts[0].stem.includes('(1)') === false, 'option marks are choices, not the stem');

const grammar = parseWorksheetOcr(`1. This is _____ book. (I)
(1) my
(2) mine
(3) me`, undefined, 90);
assert(grammar.length === 1 && grammar[0].correct === 'my', 'possessive grammar only picks an OCR choice');

const ready = assessAcceptance({ ...drafts[0], parentEdited: false });
assert(ready.canAccept && !ready.garbage && !ready.lowConfidence, 'clear high-confidence draft can be accepted');

const low = assessAcceptance({ ...drafts[0], confidence: 40, parentEdited: false });
assert(!low.canAccept && low.lowConfidence, 'low confidence cannot accept');
const edited = assessAcceptance({ ...drafts[0], confidence: 40, parentEdited: true });
assert(edited.canAccept, 'parent edit unlocks a low-confidence draft');

const garbage = assessAcceptance({
  stem: '??? xkqrtp zzwq',
  choices: ['???', 'xx'],
  correct: '???',
  confidence: 95,
  parentEdited: true,
});
assert(garbage.garbage && !garbage.canAccept, 'garbage cannot be accepted');

assert(!canStartPractice(3) && canStartPractice(4), 'play unlocks at 4 accepted questions');

console.log('homework question tests passed');
