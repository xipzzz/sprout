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

const dropped = parseWorksheetOcr(`Possessive Determiners
Choose the correct word.

1. This is book. (I)
(1) my
(2) mine
(3) me

2. The cat licked paw.
(1) it
(2) its
(3) it's

3. Those toys are. (they)
(1) their
(2) theirs
(3) them

4. sister is kind. (she)
(1) Her
(2) Hers
(3) She

5. She a red bag.
(1) have
(2) has

6. They two cats.
(1) have
(2) has
`, undefined, 90);

assert(dropped.length === 6, `expected 6 restored drafts, got ${dropped.length}`);
assert(/This is _____ book/i.test(dropped[0].stem), `blank missing: ${dropped[0].stem}`);
assert(dropped[0].correct === 'my', 'dropped blank still picks my from (I)');
assert(/licked _____ paw/i.test(dropped[1].stem), `blank missing: ${dropped[1].stem}`);
assert(dropped[1].correct === 'its', 'the cat → its when its is a choice');
assert(/are _____/i.test(dropped[2].stem), `blank missing: ${dropped[2].stem}`);
assert(dropped[2].correct === 'theirs', 'blank at the end picks theirs');
assert(dropped[3].stem.startsWith('_____'), `leading blank missing: ${dropped[3].stem}`);
assert(dropped[3].correct === 'Her', 'she → Her from the OCR choices');
assert(/She _____ a red bag/i.test(dropped[4].stem), `blank missing: ${dropped[4].stem}`);
assert(dropped[4].correct === 'has', 'she → has');
assert(/They _____ two cats/i.test(dropped[5].stem), `blank missing: ${dropped[5].stem}`);
assert(dropped[5].correct === 'have', 'they → have');

const missingWord = parseWorksheetOcr(`1. This is book. (I)
(1) your
(2) yours
(3) you`, undefined, 90);
assert(missingWord.length === 1 && /_____/.test(missingWord[0].stem), 'blank is restored even when my was not read');
assert(missingWord[0].correct === null, 'do not invent a correct word that OCR never saw');
const locked = assessAcceptance({ ...missingWord[0], parentEdited: false });
assert(!locked.canAccept, 'parent gate stays locked until a real correct choice is marked');

const intact = parseWorksheetOcr(`1. This is a book.
(1) my
(2) mine`, undefined, 90);
assert(intact.length === 1 && !/_____/.test(intact[0].stem), `complete sentence stayed intact: ${intact[0]?.stem}`);

const named = parseWorksheetOcr(`Have or Has
1. Tom a bike.
(1) have
(2) has`, undefined, 88);
assert(named.length === 1 && /Tom _____ a bike/i.test(named[0].stem), `name blank missing: ${named[0]?.stem}`);
assert(named[0].correct === 'has', 'a name takes has when has is a choice');

const twoSentences = parseWorksheetOcr(`Possessive Determiners
1. I have a brother. name is Tom.
(1) My
(2) Mine
(3) Me`, undefined, 90);
assert(twoSentences.length === 1 && /_____ name is Tom/i.test(twoSentences[0].stem), `two-sentence blank missing: ${twoSentences[0]?.stem}`);
assert(twoSentences[0].correct === 'My', 'I → My on a possessive determiners sheet');

const dashes = parseWorksheetOcr(`1. This is --- book. (I)
(1) my
(2) mine`, undefined, 90);
assert(dashes.length === 1 && /This is _____ book/i.test(dashes[0].stem), `dash blank not normalized: ${dashes[0]?.stem}`);
assert(dashes[0].correct === 'my', 'a dash blank still picks my');

const keyWins = parseWorksheetOcr(`1. She _____ a red bag.
(1) have
(2) has
Answers
1. have`, undefined, 90);
assert(keyWins.length === 1 && keyWins[0].correct === 'have', 'printed answer key beats the have/has rule');

const readyDropped = assessAcceptance({ ...dropped[0], parentEdited: false });
assert(readyDropped.canAccept && !readyDropped.garbage, 'a restored high-confidence draft can be accepted');

const gluedNumber = parseWorksheetOcr(`6They _____ two cats.
(1) have
(2) has`, undefined, 90);
assert(gluedNumber.length === 1 && gluedNumber[0].correct === 'have', 'glued question number 6They still parses');

const tightPeriod = parseWorksheetOcr(`6.They _____ two cats.
(1) have
(2) has`, undefined, 90);
assert(tightPeriod.length === 1 && tightPeriod[0].correct === 'have', 'missing space after the number period still parses');

const ellipsis = parseWorksheetOcr(`1. This is … book. (I)
(1) my
(2) mine`, undefined, 90);
assert(ellipsis.length === 1 && /This is _____ book/i.test(ellipsis[0].stem), `ellipsis blank missing: ${ellipsis[0]?.stem}`);
assert(ellipsis[0].correct === 'my', 'ellipsis blank still picks my');

const unlabeled = parseWorksheetOcr(`1. This is _____ book. (I)
my
mine
me`, undefined, 90);
assert(unlabeled.length === 1 && unlabeled[0].choices.join(',') === 'my,mine,me', 'unlabeled choice lines are still choices');
assert(unlabeled[0].correct === 'my', 'unlabeled possessives still pick my');

const inlineChoices = parseWorksheetOcr(`1. This is book. (I)
my mine me`, undefined, 90);
assert(inlineChoices.length === 1 && /_____/.test(inlineChoices[0].stem), `inline choices left the blank out: ${inlineChoices[0]?.stem}`);
assert(inlineChoices[0].choices.join(',') === 'my,mine,me', 'inline unlabeled choices');

const labelL = parseWorksheetOcr(`1. This is _____ book. (I)
(l) my
(2) mine
(3) me`, undefined, 90);
assert(labelL.length === 1 && labelL[0].choices[0] === 'my', `label (l) was not read as (1): ${labelL[0]?.choices}`);
assert(labelL[0].correct === 'my', 'label (l) still picks my');
assert(!labelL[0].stem.includes(' my'), `choice leaked into the stem: ${labelL[0].stem}`);

const boys = parseWorksheetOcr(`1. The boys _____ two dogs.
(1) have
(2) has`, undefined, 90);
assert(boys.length === 1 && boys[0].correct === 'have', 'plural the boys takes have');

const compound = parseWorksheetOcr(`1. Sam and Ben _____ a dog.
(1) have
(2) has`, undefined, 90);
assert(compound.length === 1 && compound[0].correct === 'have', 'a compound subject takes have');

const instruction = parseWorksheetOcr(`1. Choose a word.
(1) have
(2) has`, undefined, 90);
assert(instruction.length === 1 && instruction[0].correct === null, 'an instruction line is not a have/has answer');

const shortStem = parseWorksheetOcr(`1. I _____ a dog.
(1) have
(2) has`, undefined, 92);
assert(shortStem.length === 1 && shortStem[0].correct === 'have', 'I takes have');
const shortGate = assessAcceptance({ ...shortStem[0], parentEdited: false });
assert(!shortGate.garbage && shortGate.canAccept, 'a short real cloze is not garbage');

const trailingCue = parseWorksheetOcr(`1. This is _____ book. I
(1) my
(2) mine`, undefined, 90);
assert(trailingCue.length === 1 && trailingCue[0].correct === 'my', 'a bare subject after the blank still picks my');

const keyParen = parseWorksheetOcr(`1. She _____ a red bag.
(1) have
(2) has
Answers
1) have`, undefined, 90);
assert(keyParen.length === 1 && keyParen[0].correct === 'have', 'answer key 1) have beats the grammar rule');

const obviousGarbage = assessAcceptance({
  stem: 'xqz krtp zzwq',
  choices: ['xqz', 'krtp'],
  correct: 'xqz',
  confidence: 95,
  parentEdited: true,
});
assert(obviousGarbage.garbage && !obviousGarbage.canAccept, 'vowel-free garbage stays locked');

const emdash = parseWorksheetOcr(`1. This is — book. (I)
(1) my
(2) mine`, undefined, 90);
assert(emdash.length === 1 && /This is _____ book/i.test(emdash[0].stem), `em dash not normalized: ${emdash[0]?.stem}`);
assert(emdash[0].correct === 'my', 'em dash blank still picks the determiner my');

const spacedUnderscore = parseWorksheetOcr(`1. This is _ book. (I)
(1) my
(2) mine`, undefined, 90);
assert(spacedUnderscore.length === 1 && /This is _____ book/i.test(spacedUnderscore[0].stem), `spaced underscore not normalized: ${spacedUnderscore[0]?.stem}`);

const dotted = parseWorksheetOcr(`1. This is ... book. (I)
(1) my
(2) mine`, undefined, 90);
assert(dotted.length === 1 && /This is _____ book/i.test(dotted[0].stem), `dot ellipsis not normalized: ${dotted[0]?.stem}`);
assert(dotted[0].correct === 'my', 'dot ellipsis still picks my');

const gluedBlank = parseWorksheetOcr(`1. She____a red bag.
(1) have
(2) has`, undefined, 90);
assert(gluedBlank.length === 1 && /She _____ a red bag/i.test(gluedBlank[0].stem), `glued blank missing: ${gluedBlank[0]?.stem}`);
assert(gluedBlank[0].correct === 'has', 'glued She____a still picks has');

const heHas = parseWorksheetOcr(`1. He a hat.
(1) have
(2) has`, undefined, 90);
assert(heHas.length === 1 && heHas[0].correct === 'has' && /He _____ a hat/i.test(heHas[0].stem), 'he takes has');

const weHave = parseWorksheetOcr(`1. We two dogs.
(1) have
(2) has`, undefined, 90);
assert(weHave.length === 1 && weHave[0].correct === 'have' && /We _____ two dogs/i.test(weHave[0].stem), 'we takes have');

const theBoy = parseWorksheetOcr(`1. The boy a bike.
(1) have
(2) has`, undefined, 90);
assert(theBoy.length === 1 && theBoy[0].correct === 'has', 'singular the boy takes has');

const pronounEnd = parseWorksheetOcr(`1. The bag is _____. (she)
(1) her
(2) hers
(3) she`, undefined, 90);
assert(pronounEnd.length === 1 && pronounEnd[0].correct === 'hers', 'blank at the end picks the pronoun hers');

const determinerFront = parseWorksheetOcr(`1. _____ sister is kind. (she)
(1) Her
(2) Hers
(3) She`, undefined, 90);
assert(determinerFront.length === 1 && determinerFront[0].correct === 'Her', 'blank before a noun picks the determiner Her');

const ambiguousCue = parseWorksheetOcr(`Possessive Determiners
1. _____ is on the desk.
(1) my
(2) mine
(3) me`, undefined, 90);
assert(ambiguousCue.length === 1 && ambiguousCue[0].correct === null, 'both my and mine with no subject cue stays unset');
const ambiguousGate = assessAcceptance({ ...ambiguousCue[0], parentEdited: false });
assert(!ambiguousGate.canAccept, 'an unset possessive cannot be accepted');

const verbs = parseWorksheetOcr(`Exercise 33: Verbs (Subject-verb Agreement)
1. The sun (rise, rises) in the east.
2. My mother (go, goes) to the market every day.
3. Uncle Tan (drive, drives) to work every morning.
4. Rabbits (eat, eats) carrots.
5. The children (play, plays) in the park.
6. Many birds (build, builds) their nests in trees.`, undefined, 80);
assert(verbs.length === 6, `expected 6 verb questions, got ${verbs.length}`);
assert(/The sun _____ in the east/i.test(verbs[0].stem), `Q1 stem: ${verbs[0]?.stem}`);
assert(verbs[0].choices.join(',') === 'rise,rises', `Q1 choices: ${verbs[0]?.choices}`);
assert(!verbs[0].choices.some((choice) => /^(the|my|uncle|rabbits)$/i.test(choice)), 'sentence starters are not Q1 choices');
assert(/Many birds _____ their nests/i.test(verbs[5].stem), `Q6 stem: ${verbs[5]?.stem}`);
assert(verbs[5].choices.join(',') === 'build,builds', `Q6 choices: ${verbs[5]?.choices}`);
assert(!/Many birds/i.test(verbs[0].stem), 'Q6 text must not join Q1');

assert(parseWorksheetOcr('', undefined, 90).length === 0, 'empty OCR text produces no drafts');
assert(parseWorksheetOcr('   \n\n  ', undefined, 40).length === 0, 'blank OCR text produces no drafts');

console.log('homework question tests passed');
