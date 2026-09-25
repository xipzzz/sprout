/**
 * Worksheet OCR drafts — questions come from the sheet, never a canned bank.
 * Run: npx tsx src/lib/homeworkQuestions.test.ts
 */
import {
  assessAcceptance,
  canStartPractice,
  isHandwritingToken,
  mergeWorksheetReads,
  textFromPrintedGlyphs,
  textWithoutHandwriting,
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
assert(/This is _____ book/i.test(drafts[0].stem), `Q1 stem: ${drafts[0].stem}`);
assert(!/they _____ two cats|the cat licked|sister is kind/i.test(drafts[0].stem), `later stem leaked into Q1: ${drafts[0].stem}`);
assert(!drafts[0].choices.some((choice) => /^(the|my mother|uncle|rabbits|cat)$/i.test(choice)), 'sentence starters are not Q1 choices');
assert(/They _____ two cats/i.test(drafts[5].stem), `Q6 stem: ${drafts[5].stem}`);
assert(drafts[5].choices.join(',') === 'have,has', `Q6 choices: ${drafts[5].choices}`);
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

const exercise39 = `Exercise 39: Verbs (Subject-verb Agreement)
1. James (find, finds) a wallet on the street.
2. My parents (buy, buys) fruit at the market.
3. My father (watch, watches) the news.
4. Tim (meet, meets) his class.
5. My mother (mop, mops) the floor.
6. The puppy (bark, barks) at night.
7. The men (carry, carries) the boxes.
8. The pilot (fly, flies) the plane.
9. I (save, saves) coins.
10. We (sing, sings) a song.`;
const ex39 = parseWorksheetOcr(exercise39, undefined, 80);
assert(ex39.length >= 4, `Exercise 39 yielded ${ex39.length} questions`);
assert(ex39.length === 10, `expected 10 Exercise 39 questions, got ${ex39.length}`);
assert(/James _____ a wallet/i.test(ex39[0].stem), `Ex39 Q1 stem: ${ex39[0]?.stem}`);
assert(ex39[0].choices.join(',') === 'find,finds', `Ex39 Q1 choices: ${ex39[0]?.choices}`);
assert(!/My parents|We \(sing/i.test(ex39[0].stem), `later Ex39 text leaked into Q1: ${ex39[0].stem}`);

const exercise39Noisy = parseWorksheetOcr(`l. James (find finds) a wallet on the street.2.My parents (buy buys) fruit.
3 My father (watch watches) the news
4.Tim (meet meets) his class
I. We (sing sings) a song`, undefined, 70);
assert(exercise39Noisy.length >= 4, `noisy Exercise 39 yielded ${exercise39Noisy.length}`);
assert(/James _____ a wallet/i.test(exercise39Noisy[0].stem), `noisy Q1 stem: ${exercise39Noisy[0]?.stem}`);
assert(exercise39Noisy[0].choices.join(',') === 'find,finds', `noisy Q1 choices: ${exercise39Noisy[0]?.choices}`);
assert(!exercise39Noisy[0].choices.some((choice) => /^(james|my|the|tim)$/i.test(choice)), 'noisy Q1 choices are the verbs');

const marginNumbers = parseWorksheetOcr(`1.
James (find finds) a wallet on the street.
2.
My parents (buy buys) fruit at the market.
3.
My father (watch watches) the news.
4.
Tim (meet meets) his class.
5.
My mother (mop mops) the floor.`, undefined, 66);
assert(marginNumbers.length >= 4, `margin numbers yielded ${marginNumbers.length}`);
assert(/James _____ a wallet/i.test(marginNumbers[0].stem), `margin Q1: ${marginNumbers[0]?.stem}`);
assert(marginNumbers[0].choices.join(',') === 'find,finds', `margin choices: ${marginNumbers[0]?.choices}`);

const partialPage = parseWorksheetOcr(`3. Uncle Tan (drive drives) to work every morning.
4. Rabbits
(eat, eats) carrots.
5. The children (make makes) a lot of noise when they play.
6. Many birds (build, builds) their nests in trees.
9. My aunt (sweep sweeps) the floor. 1 0. The doctors (discuss, discusses) their findings.
© Educational Publishing House Pte Ltd`, undefined, 71);
assert(partialPage.length >= 4, `partial page yielded ${partialPage.length}`);
assert(/Uncle Tan _____/i.test(partialPage[0].stem), `partial first stem: ${partialPage[0]?.stem}`);
assert(partialPage[0].choices.join(',') === 'drive,drives', `partial first choices: ${partialPage[0]?.choices}`);
const children = partialPage.find((item) => /children/i.test(item.stem));
assert(Boolean(children) && children!.choices.join(',') === 'make,makes', `children choices: ${children?.choices} stem ${children?.stem}`);
const aunt = partialPage.find((item) => /aunt/i.test(item.stem));
assert(Boolean(aunt) && /My aunt _____ the floor/i.test(aunt!.stem), `aunt stem: ${aunt?.stem}`);
assert(aunt!.choices.join(',') === 'sweep,sweeps', `aunt choices: ${aunt?.choices}`);
assert(!/Educational Publishing|Pte Ltd|©|1 0\./i.test(aunt!.stem), `footer bled into aunt: ${aunt?.stem}`);
const doctors = partialPage.find((item) => /doctors/i.test(item.stem));
assert(Boolean(doctors) && doctors!.choices.join(',') === 'discuss,discusses', `Q10 choices: ${doctors?.choices}`);

const scribble = parseWorksheetOcr(`6. He (writes, write) with a pen. 7d & po.`, undefined, 61);
assert(scribble.length === 1 && scribble[0].id === 'q6', 'scribble item keeps printed number 6');
assert(/He _____ with a pen/i.test(scribble[0].stem), `scribble stem: ${scribble[0]?.stem}`);
assert(!/7d|&|\bpo\b/i.test(scribble[0].stem), `scribble leaked: ${scribble[0]?.stem}`);
assert(scribble[0].choices.join(',') === 'writes,write', `scribble choices: ${scribble[0]?.choices}`);

const merged = mergeWorksheetReads(
  `6. He (writes, write) with a pen.`,
  `1. We (paint, paints) the house.
2. This blue shirt (belongs, belong) to my father.`,
);
assert(merged[0].id === 'q1' && /We _____ the house/i.test(merged[0].stem), `top read should lead: ${merged[0]?.stem}`);
assert(merged.some((item) => item.id === 'q6'), 'mid-page item stays item 6');
assert(merged[0].choices.join(',') === 'paint,paints', `top choices: ${merged[0]?.choices}`);

const circledGlyphs = [
  { text: '6.', confidence: 91, bbox: { x0: 4, y0: 12, x1: 22, y1: 30 } },
  { text: 'He', confidence: 90, bbox: { x0: 28, y0: 12, x1: 52, y1: 30 } },
  { text: '(writes,', confidence: 86, bbox: { x0: 58, y0: 12, x1: 130, y1: 30 } },
  { text: 'write)', confidence: 84, bbox: { x0: 136, y0: 12, x1: 190, y1: 30 } },
  { text: 'with', confidence: 90, bbox: { x0: 196, y0: 12, x1: 230, y1: 30 } },
  { text: 'a', confidence: 88, bbox: { x0: 236, y0: 12, x1: 248, y1: 30 } },
  { text: 'pen.', confidence: 90, bbox: { x0: 254, y0: 12, x1: 292, y1: 30 } },
  { text: 'O', confidence: 41, bbox: { x0: 70, y0: 4, x1: 118, y1: 52 } },
  { text: '7d', confidence: 44, bbox: { x0: 300, y0: 14, x1: 332, y1: 32 } },
  { text: '&', confidence: 22, bbox: { x0: 336, y0: 16, x1: 352, y1: 34 } },
  { text: 'po.', confidence: 28, bbox: { x0: 360, y0: 18, x1: 388, y1: 36 } },
];
assert(isHandwritingToken(circledGlyphs[7]), 'a squarish circle read is handwriting');
assert(isHandwritingToken(circledGlyphs[8]), '7d is handwriting');
assert(!isHandwritingToken(circledGlyphs[1]), 'printed He stays');
const printedOnly = textFromPrintedGlyphs(circledGlyphs);
assert(!/7d|&|\bpo\b|\bO\b/.test(printedOnly), `handwriting glyphs stayed: ${printedOnly}`);
const fromInk = textWithoutHandwriting(
  circledGlyphs,
  '6. He (writes, write) with a pen. O 7d & po.',
);
const inkDraft = parseWorksheetOcr(fromInk, circledGlyphs, 70);
assert(inkDraft.length === 1 && /He _____ with a pen/i.test(inkDraft[0].stem), `ink-filtered stem: ${inkDraft[0]?.stem}`);
assert(!/7d|&|\bpo\b|\bO\b/.test(inkDraft[0].stem), `ink leaked into stem: ${inkDraft[0]?.stem}`);
assert(inkDraft[0].choices.join(',') === 'writes,write', `ink choices: ${inkDraft[0]?.choices}`);

const warpedFull = `6. He (writes, write) with a pen. 7d & po.
7. The baby (cry cries) loudly.`;
const warpedTop = `l. The sun (rise rises) in the east.
2.My mother (go goes) to the market every day.
3. Uncle Tan (drive drives) to work every morning.
4. Rabbits (eat eats) carrots.
5. The children (play plays) in the park.`;
const warpedGlyphs = [
  { text: '6.', confidence: 80, bbox: { x0: 2, y0: 80, x1: 20, y1: 98 } },
  { text: 'He', confidence: 86, bbox: { x0: 24, y0: 80, x1: 48, y1: 98 } },
  { text: '(writes,', confidence: 70, bbox: { x0: 52, y0: 80, x1: 120, y1: 98 } },
  { text: 'write)', confidence: 68, bbox: { x0: 124, y0: 80, x1: 176, y1: 98 } },
  { text: 'with', confidence: 84, bbox: { x0: 180, y0: 80, x1: 214, y1: 98 } },
  { text: 'a', confidence: 80, bbox: { x0: 218, y0: 80, x1: 230, y1: 98 } },
  { text: 'pen.', confidence: 82, bbox: { x0: 234, y0: 80, x1: 270, y1: 98 } },
  { text: '7d', confidence: 33, bbox: { x0: 278, y0: 82, x1: 304, y1: 100 } },
  { text: '&', confidence: 20, bbox: { x0: 308, y0: 84, x1: 322, y1: 100 } },
  { text: 'po.', confidence: 24, bbox: { x0: 326, y0: 84, x1: 350, y1: 102 } },
];
const warpedClean = textWithoutHandwriting(warpedGlyphs, warpedFull);
const warpedPhone = mergeWorksheetReads(warpedClean, warpedTop);
assert(warpedPhone.length >= 4, `warped phone yielded ${warpedPhone.length}`);
assert(warpedPhone[0].id === 'q1', `warped phone must not renumber mid-page as Q1: ${warpedPhone[0]?.id}`);
assert(/The sun _____ in the east/i.test(warpedPhone[0].stem), `warped Q1: ${warpedPhone[0]?.stem}`);
assert(warpedPhone[0].choices.join(',') === 'rise,rises', `warped Q1 choices: ${warpedPhone[0]?.choices}`);
const warpedSix = warpedPhone.find((item) => item.id === 'q6');
assert(Boolean(warpedSix), 'printed item 6 stays item 6');
assert(/He _____ with a pen/i.test(warpedSix!.stem), `warped item 6 stem: ${warpedSix?.stem}`);
assert(!/7d|&|\bpo\b/i.test(warpedSix!.stem), `scribble still in item 6: ${warpedSix?.stem}`);
assert(warpedSix!.choices.join(',') === 'writes,write', `warped item 6 choices: ${warpedSix?.choices}`);
assert(warpedPhone.some((item) => item.id === 'q5'), 'top-of-page item 5 is kept');

assert(parseWorksheetOcr('', undefined, 90).length === 0, 'empty OCR text produces no drafts');
assert(parseWorksheetOcr('   \n\n  ', undefined, 40).length === 0, 'blank OCR text produces no drafts');

console.log('homework question tests passed');
