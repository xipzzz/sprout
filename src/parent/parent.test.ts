/* Parent PIN and year group.
   Run: node --import ./scripts/register-tsx.mjs src/parent/parent.test.ts */

import {
  checkParentPin,
  hasParentPin,
  isParentUnlocked,
  lockParent,
  MAX_TRIES,
  parentStorageKey,
  resetParentData,
  setParentPin,
  unlockParent,
  WAIT_MS,
} from './pin.ts';
import { sha256Hex } from './sha256.ts';
import { check, installMemoryStorage, same, throws } from './testing.ts';
import {
  getYearGroup,
  getYearSettings,
  hasChosenYearGroup,
  pickWording,
  setYearGroup,
  YEAR_GROUPS,
  YEAR_SETTINGS,
  type YearGroup,
} from './yearGroup.ts';

const vectors: [string, string][] = [
  ['', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'],
  ['abc', 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'],
  ['a'.repeat(55), '9f4390f8d30c2dd92ec9f095b65e2b9ae9b0a925a5258e241c9f1e910f734318'],
  ['b'.repeat(56), 'a5fc6e203a4c2b657d0d153885932414b2ffc6a93f0f8bf8b3183315e5a7212c'],
  ['c'.repeat(64), '52b6419d27bd7f547cee3b92f8c17a908b8a49601ecbec161e5030de1dfe9e0a'],
  ['d'.repeat(1000), 'e8cec134fe59530e102e14869a9b0b3796129eb410a827b81d5b38cc80f334ab'],
  ['Pip 你好 ✓', 'a96702a8df00e70ec3560dba5659cca58021cd00572539e67d1d5053a5a0a471'],
];
for (const [text, hex] of vectors) same(sha256Hex(text), hex, `sha256 of ${text.length} chars`);

const { local, session } = installMemoryStorage();

same(hasParentPin(), false, 'no PIN on first use');
same(isParentUnlocked(), false, 'parent area starts locked');
throws(() => setParentPin('12a4'), /4 numbers/, 'letters are not a PIN');
throws(() => setParentPin('123'), /4 numbers/, 'three digits are not a PIN');

setParentPin('2580');
same(hasParentPin(), true, 'PIN saved');
const raw = local.getItem(parentStorageKey('pin')) ?? '';
const stored = JSON.parse(raw) as Record<string, unknown>;
same(Object.keys(stored).sort().join(','), 'hash,salt,v', 'only salt and hash are stored');
check(!raw.includes('"2580"'), 'PIN must not be stored as plain text');
check(stored.hash !== sha256Hex('2580'), 'PIN hash must be salted');

same(unlockParent('0000'), false, 'wrong PIN does not unlock');
same(isParentUnlocked(), false, 'still locked after a wrong PIN');
same(unlockParent('2580'), true, 'right PIN unlocks');
same(isParentUnlocked(), true, 'unlocked');
lockParent();
same(isParentUnlocked(), false, 'Lock closes the parent area');

const now = 1_000_000;
for (let i = 1; i < MAX_TRIES; i++) same(checkParentPin('1111', now), 'wrong', `wrong try ${i}`);
same(checkParentPin('1111', now), 'wait', 'too many tries means wait');
same(checkParentPin('2580', now + 1000), 'wait', 'right PIN still waits during the cool-down');
same(checkParentPin('2580', now + WAIT_MS + 1), 'ok', 'right PIN works after the wait');
same(checkParentPin('1111', now + WAIT_MS + 2), 'wrong', 'tries start again after a right PIN');

local.setItem(parentStorageKey('notebook'), '[{"q":"secret"}]');
session.setItem(parentStorageKey('scan'), '{"answers":true}');
local.setItem('sprout.onboarded', '1');
unlockParent('2580');
const removed = resetParentData();
for (const name of ['pin', 'notebook', 'scan']) {
  check(removed.includes(parentStorageKey(name)), `reset removed ${name}`);
}
same(hasParentPin(), false, 'reset removes the PIN');
same(isParentUnlocked(), false, 'reset locks the parent area');
same(local.getItem(parentStorageKey('notebook')), null, 'reset removes the notebook');
same(session.getItem(parentStorageKey('scan')), null, 'reset removes session parent data');
same(local.getItem('sprout.onboarded'), '1', 'reset keeps non-parent keys');
same(checkParentPin('2580'), 'no-pin', 'old PIN is gone');

same(hasChosenYearGroup(), false, 'year group not chosen yet');
same(getYearGroup(), 'P1', 'default year group');
same(getYearSettings().year, 'P1', 'default settings');
throws(() => setYearGroup('P5' as YearGroup), /Unknown year group/, 'P5 is refused');
setYearGroup('P4');
same(hasChosenYearGroup(), true, 'year group chosen');
same(getYearSettings().year, 'P4', 'getter returns the saved year');
local.setItem('sprout.yearGroup', 'banana');
same(getYearGroup(), 'P1', 'bad stored value falls back to P1');

for (let i = 1; i < YEAR_GROUPS.length; i++) {
  const lower = YEAR_SETTINGS[YEAR_GROUPS[i - 1]];
  const higher = YEAR_SETTINGS[YEAR_GROUPS[i]];
  check(higher.numberRange.max > lower.numberRange.max, `${higher.year} numbers go higher than ${lower.year}`);
  check(higher.wordingLevel > lower.wordingLevel, `${higher.year} wording level is higher`);
  check(higher.maxWordsPerSentence > lower.maxWordsPerSentence, `${higher.year} allows longer sentences`);
}
const say = {
  1: 'Count on.',
  2: 'Count on from 8.',
  3: 'Start at 8 and count on 5.',
  4: 'Start at the bigger number, 8, and count on 5.',
} as const;
same(pickWording(say, YEAR_SETTINGS.P1), say[1], 'P1 gets the simplest line');
same(pickWording(say, YEAR_SETTINGS.P4), say[4], 'P4 gets the fullest line');

console.log('parent PIN and year group test passed');
