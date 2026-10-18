/* One summary row per question for the parent page: which fields the reader filled in or wrote. */

import type { ParentQuestion, ReconstructionFlag } from './types.ts';

export type FlagChip = { kind: ReconstructionFlag['kind']; label: string; fields: string[] };

export type FlagRow = { id: string; chips: FlagChip[] };

const KIND_LABEL: Record<ReconstructionFlag['kind'], string> = {
  reconstructed: 'AI filled this in',
  generated: 'AI wrote this',
};

const FIELD_LABEL: Partial<Record<ReconstructionFlag['field'], string>> = {
  student_answer: 'handwritten answer',
};

export function fieldLabel(field: ReconstructionFlag['field']): string {
  return FIELD_LABEL[field] ?? field.replaceAll('_', ' ');
}

/** Questions with no flags get no row. Within a row, filled-in comes before written, fields in first-seen order. */
export function flagRows(questions: ParentQuestion[]): FlagRow[] {
  const rows: FlagRow[] = [];
  for (const question of questions) {
    const chips: FlagChip[] = [];
    for (const kind of ['reconstructed', 'generated'] as const) {
      const fields = [
        ...new Set(question.flags.filter((flag) => flag.kind === kind).map((flag) => fieldLabel(flag.field))),
      ];
      if (fields.length) chips.push({ kind, label: KIND_LABEL[kind], fields });
    }
    if (chips.length) rows.push({ id: question.id, chips });
  }
  return rows;
}
