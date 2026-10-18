/* A maths page made on this device, for trying Explain and Similar practice
   without a photo. Open with ?exam=1&demo=maths. */

import type { ParentQuestion, ParentScan } from '../types.ts';

const WORKED_OUT = {
  field: 'correct_answer' as const,
  kind: 'generated' as const,
  note: 'Worked out on this device for the sample page.',
};

function question(id: string, stem: string, choices: string[], studentAnswer: string, mark: string, answer: string): ParentQuestion {
  return {
    id,
    stem,
    choices,
    student_answer: studentAnswer,
    teacher_mark: mark,
    correct_answer: answer,
    explanation: '',
    flags: [WORKED_OUT],
  };
}

export function mathsSampleScan(): ParentScan {
  return {
    extraction: 'stub',
    subject: 'math',
    paper_title: 'Maths sample',
    source_photo: 'maths-sample (made on this device)',
    note: 'Maths sample made on this device, not read from a photo. Use it to try Explain and Similar practice.',
    deskew: { applied: false, corners: [] },
    ink_pixels_lifted: 0,
    questions: [
      question('1', 'What is 94 + 38?', ['122', '132', '142', '56'], '122', '×', '132'),
      question('2', 'Work out 503 - 267.', [], '236', '✓', '236'),
      question('3', 'What is 23 x 4?', [], '', '', '92'),
      question('4', '75 ÷ 5 = ___', [], '16', '×', '15'),
      question('5', '18 + ___ = 45', [], '27', '✓', '27'),
      question('6', 'Ali has 42 stickers. He gives away 17. How many stickers does Ali have left?', [], '35', '×', '25'),
      question('7', 'Work out 180 - 94 - 38.', [], '48', '✓', '48'),
    ],
  };
}
