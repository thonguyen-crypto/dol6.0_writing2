/* =========================================================================
   DOL React Lesson Kit · shared types
   Server-safe: this file must not import React or browser APIs.
   ========================================================================= */

export type Role = 'student' | 'teacher';

/** cover = lesson cover · divider = stage opener · theory = slide with builds · activity = students do something */
export type StepKind = 'cover' | 'divider' | 'theory' | 'activity';

export interface StageMeta {
  n: number;
  /** Full stage name, e.g. "Lexical Resource" */
  name: string;
  /** Short name for the top bar, e.g. "LR" */
  short: string;
  /** One line under the name on the divider slide */
  sub?: string;
  /** Topic chips on the divider slide */
  topics?: string[];
}

export interface NoteSection {
  /** Mục tiêu · Cách triển khai · Đáp án cần chốt · Lưu ý khi dạy · Chuyển tiếp */
  title: string;
  text: string;
}

/** Slide header: stage chip + Vietnamese helper line + title with a highlighted keyword. */
export interface SlideHead {
  chip?: string;
  vi?: string;
  pre: string;
  key?: string;
  /** The slide draws its own header (tabs, pager, per-build title); the shell then skips the default one. */
  custom?: boolean;
}

/**
 * A step with `tracking` is a practice page: students submit, the teacher sees a status.
 * Every part is one submission (e.g. Band Detective = 4 paragraphs = 4 parts).
 * Steps without `tracking` show "·" (no submissions) on the teacher board.
 */
export interface TrackingMeta {
  parts: { id: string; label: string }[];
  grading: 'auto' | 'ai';
  /** AI steps: a part counts as Đạt when score >= passScore (default 4 of 5). */
  passScore?: number;
  /** Attempts per part (default 2). After the last attempt the part is locked. */
  maxAttempts?: number;
}

/** Live answer counter for single-choice steps (teacher column "Đếm trả lời"). */
export interface PollMeta {
  /** Key inside attempt.answer that holds the chosen option */
  field: string;
  options: string[];
  /** Correct option per part id; shown only after "Mở đáp án". */
  correct?: Record<string, string>;
}

export interface StepMeta {
  key: string;
  kind: StepKind;
  /** 0 for the cover, otherwise the stage number */
  stage: number;
  name: string;
  short?: string;
  head?: SlideHead;
  /** Theory slides: number of builds (clicks) on this slide. Default 1. */
  builds?: number;
  notes?: NoteSection[];
  tracking?: TrackingMeta;
  poll?: PollMeta;
  /** Shown only in teacher view (e.g. worked solutions). Students never see or follow to it. */
  teacherOnly?: boolean;
  /** Small practice that branches off the step before it: no page number of its own
      (code = parent code + a, b…), drawn as a branch under that step in the lesson map. */
  sub?: boolean;
}

export interface LessonMeta {
  id: string;
  title: string;
  subtitle: string;
  /** Course label shown on the cover, e.g. "IELTS Writing 7.5+" */
  course: string;
  outcomes?: string[];
  stages: StageMeta[];
  steps: StepMeta[];
}

/* ---- Classroom data ---------------------------------------------------- */

export interface Student {
  id: string;
  name: string;
  classCode: string;
  /** Step the student has open now */
  stepKey?: string;
  lastSeen?: string;
}

/** One readable row of an attempt: what was asked and what the student answered. */
export interface AttemptLine {
  id: string;
  label: string;
  value: string;
  /** true ✓ · false ! · undefined = not marked (e.g. AI could not grade) */
  correct?: boolean;
  feedback?: string;
  suggestion?: string;
}

export interface AiResult {
  score: number;
  maxScore: number;
  band?: string;
  ideas: string;
  grammar?: string;
  vocabulary?: string;
  /** AI could not grade: the attempt is kept and the teacher grades it (status "Cần GV xem"). */
  fallback?: boolean;
}

export interface Attempt {
  no: number;
  at: string;
  answer: Record<string, unknown>;
  lines: AttemptLine[];
  isCorrect: boolean;
  score: number | null;
  maxScore: number;
  scoreDisplay: string;
  ai?: AiResult;
  /** Answer key / model answers at submit time (teacher drawer "Đáp án mẫu"). */
  models?: AttemptLine[];
}

export interface TeacherReview {
  comment?: string;
  privateNote?: string;
  status?: 'reviewed' | 'needs_support';
  at: string;
}

export interface Submission {
  id: string;
  lessonId: string;
  classCode: string;
  studentId: string;
  studentName: string;
  stepKey: string;
  partId: string;
  attempts: Attempt[];
  locked: boolean;
  updatedAt: string;
  review?: TeacherReview;
}

/** Live class state the teacher controls. Stored on the server, pushed to students. */
export interface ControlState {
  teacherStep: string;
  build: number;
  paused: boolean;
  /** "Khóa bước": index (lesson.steps order) of the last step students may open; null = Tự do. */
  gate?: number | null;
  /** The gate follows the teacher's step forward. */
  gateAuto?: boolean;
  revealed: Record<string, boolean>;
  invitation: { id: string; stepKey: string; at: string } | null;
  /** When the teacher last changed step (an older invitation is no longer shown) */
  stepAt?: string;
  updatedAt: string;
}

export interface ControlPatch {
  teacherStep?: string;
  build?: number;
  paused?: boolean;
  gate?: number | null;
  gateAuto?: boolean;
  reveal?: { stepKey: string; on: boolean };
  invite?: string;
}

/* ---- AI grading -------------------------------------------------------- */

export interface GradeItem {
  id: string;
  prompt: string;
  answer: string;
  models?: string[];
  /** Frame and requirements of the item (sent to the grader with the prompt). */
  context?: string;
}

/** One of the 3 grading criteria: meaning (Ý nghĩa), vocabulary (Từ vựng), grammar (Ngữ pháp = target structure). */
export interface GradeCriterion { ok: boolean; note: string; wrong?: string; fix?: string }
export type GradeCriteria = Record<'meaning' | 'vocabulary' | 'grammar', GradeCriterion>;

export interface GradeResult {
  /** isCorrect = all 3 criteria ok (computed by the server). */
  items: { id: string; isCorrect: boolean; feedback: string; suggestion?: string; criteria?: GradeCriteria }[];
  /** 1–5 from the share of criteria passed over all items (computed by the server). */
  score: number;
  maxScore: number;
  ideas: string;
  grammar?: string;
  vocabulary?: string;
}

/** Server-side rubric. Lives in src/lessons/<id>/rubrics.ts. */
export interface Rubric {
  id: string;
  /** What the activity trains, in English, for the grader prompt. */
  task: string;
  /** Rules the answer must follow (one per line). */
  rules: string[];
  /** What each criterion checks for this activity (grammar = the structure being taught). */
  criteria?: { meaning?: string; vocabulary?: string; grammar?: string };
  /** Hard checks before the model: minimum words, and [regex, Vietnamese note] the answer must match. */
  minWords?: number;
  mustMatch?: [string, string][];
  maxItems?: number;
}

export const submissionIdFor = (studentId: string, stepKey: string, partId: string) =>
  `sub-${studentId}-${stepKey}-${partId}`.replace(/[^a-zA-Z0-9-]/g, '-');
