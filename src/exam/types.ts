/* Parent vs child shapes for the exam-scan prototype.
   The child shape is a different type on purpose: it has no answer fields. */

export type ReconstructionFlag = {
  field:
    | 'stem'
    | 'choices'
    | 'student_answer'
    | 'teacher_mark'
    | 'correct_answer'
    | 'explanation'
    | 'working_steps'
    | 'is_correct'
    | 'teacher_comment'
    | 'student_marks'
    | 'question_type'
    | 'sub_questions';
  kind: 'reconstructed' | 'generated';
  note: string;
};

export type ReviewStatus = 'open' | 'picked' | 'read_aloud' | 'dropped';

export type QuestionType = 'multiple_choice' | 'fill_blank' | 'cloze' | 'editing' | 'open';

/** A part like (a) or (b) under one numbered question. Parent-only, like the rest past choices. */
export type SubQuestion = {
  label: string;
  stem: string;
  student_answer: string;
  teacher_mark: string;
  correct_answer: string;
  is_correct: boolean | null;
  working_steps: string[];
};

export type ParentQuestion = {
  id: string;
  stem: string;
  choices: string[];
  /** Printed letter or number before each choice (A, B or 1, 2), same order as choices. */
  choice_labels?: string[];
  question_type?: QuestionType;
  student_answer: string;
  working_steps?: string[];
  teacher_mark: string;
  is_correct?: boolean | null;
  teacher_comment?: string;
  student_marks?: string;
  correct_answer: string;
  explanation: string;
  sub_questions?: SubQuestion[];
  flags: ReconstructionFlag[];
  review?: ReviewStatus;
  stem_edited?: boolean;
};

export type ParentScan = {
  extraction: 'stub' | 'zhipu' | 'tesseract' | 'paddle';
  subject: string;
  paper_title: string;
  source_photo: string;
  note: string;
  deskew: {
    applied: boolean;
    corners: number[][];
    /** Camera EXIF orientation the photo carried (1 = already upright). */
    exif_orientation?: number;
    upright_turn?: string;
  };
  ink_pixels_lifted: number;
  questions: ParentQuestion[];
  /** Whole-page notes for the parent: pencil seen, passage blanks, Chinese read. */
  page_flags?: PageFlag[];
  ocr_lang?: OcrLang;
  ocr_engine?: OcrEngine;
  previews?: {
    deskew_jpeg?: string;
    clean_jpeg?: string;
  };
};

export type OcrLang = 'eng' | 'chi_sim';

export type OcrEngine = 'tesseract' | 'paddle';

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
