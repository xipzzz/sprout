/* Parent vs child shapes for the exam-scan prototype.
   The child shape is a different type on purpose: it has no answer fields. */

export type ReconstructionFlag = {
  field: 'stem' | 'choices' | 'student_answer' | 'teacher_mark' | 'correct_answer' | 'explanation';
  kind: 'reconstructed' | 'generated';
  note: string;
};

export type ReviewStatus = 'open' | 'picked' | 'read_aloud' | 'dropped';

export type ParentQuestion = {
  id: string;
  stem: string;
  choices: string[];
  student_answer: string;
  teacher_mark: string;
  correct_answer: string;
  explanation: string;
  flags: ReconstructionFlag[];
  choice_letters?: string[];
  working?: { expression: string; result: string; steps: string[] }[];
  is_correct?: boolean | null;
  teacher_comment?: string;
  marks?: { selected: string[]; crossed: boolean; note: string; symbols: string[]; score: string };
  question_type?: string;
  sub_questions?: ParentQuestion[];
  review?: ReviewStatus;
  stem_edited?: boolean;
};

export type ParentScan = {
  extraction: 'stub' | 'zhipu' | 'tesseract';
  subject: string;
  paper_title: string;
  source_photo: string;
  note: string;
  deskew: { applied: boolean; corners: number[][] };
  ink_pixels_lifted: number;
  questions: ParentQuestion[];
  /** Whole-page notes for the parent: pencil seen, passage blanks, Chinese read. */
  page_flags?: PageFlag[];
  ocr_lang?: OcrLang;
  previews?: {
    deskew_jpeg?: string;
    clean_jpeg?: string;
  };
};

export type OcrLang = 'eng' | 'chi_sim';

export type PageFlag = {
  kind: 'pencil' | 'cloze' | 'editing' | 'chinese';
  note: string;
};

/** What the child practice screen is allowed to receive. */
export type ChildQuestion = {
  id: string;
  stem: string;
  choices: string[];
};

export type ChildView = {
  subject: string;
  questions: ChildQuestion[];
};
