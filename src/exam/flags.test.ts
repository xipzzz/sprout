/* One flag row per question on the parent page.
   Run: node --experimental-strip-types src/exam/flags.test.ts */

import { flagRows } from './flags.ts';
import type { ParentQuestion, ReconstructionFlag } from './types.ts';

function question(id: string, flags: [ReconstructionFlag['field'], ReconstructionFlag['kind']][]): ParentQuestion {
  return {
    id,
    stem: `Stem ${id}`,
    choices: ['a', 'b'],
    student_answer: '',
    teacher_mark: '',
    correct_answer: '',
    explanation: '',
    flags: flags.map(([field, kind]) => ({ field, kind, note: `${field} note` })),
  };
}

function assertEqual(actual: unknown, expected: unknown, message: string) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) throw new Error(`${message}\n  expected ${e}\n  actual   ${a}`);
}

const rows = flagRows([
  question('1', [
    ['stem', 'reconstructed'],
    ['stem', 'reconstructed'],
    ['choices', 'reconstructed'],
  ]),
  question('2', []),
  question('3', [
    ['explanation', 'generated'],
    ['stem', 'reconstructed'],
    ['student_answer', 'reconstructed'],
    ['teacher_mark', 'reconstructed'],
  ]),
]);

assertEqual(rows.map((row) => row.id), ['1', '3'], 'questions without flags get no row');
assertEqual(rows[0].chips, [{ kind: 'reconstructed', label: 'AI filled this in', fields: ['stem', 'choices'] }], 'one chip per kind, fields deduped');
assertEqual(
  rows[1].chips.map((chip) => [chip.label, chip.fields]),
  [
    ['AI filled this in', ['stem', 'handwritten answer', 'teacher mark']],
    ['AI wrote this', ['explanation']],
  ],
  'filled-in first, then written',
);
const chips = rows.reduce((sum, row) => sum + row.chips.length, 0);
if (chips !== 3) throw new Error(`expected 3 chips for 7 flags, got ${chips}`);

console.log('flag rows test passed');
