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
  previews?: {
    deskew_jpeg?: string;
    clean_jpeg?: string;
  };
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
