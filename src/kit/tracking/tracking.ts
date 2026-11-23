/* Teacher tracking rules (same as DOL App Kit · TeacherTracking v1.2 on main).
   Status is computed only from what students submitted:
     done     Đạt / Đã học   latest attempt correct (AI: score ≥ passScore)
     weak     Chưa đạt       latest attempt not correct
     review   Cần GV xem     AI could not grade (attempt kept for the teacher)
     partial  Làm dở         several parts, some submitted, none weak/review
     none     Chưa làm       nothing submitted
   Steps without `tracking` are "na" (·): nothing is saved there. */
import type { Attempt, LessonMeta, StepMeta, Student, Submission } from '../types';

export type TrackStatus = 'done' | 'weak' | 'review' | 'partial' | 'none';

export const STATUS_META: Record<TrackStatus, { icon: string; label: string; color: string }> = {
  done: { icon: '✓', label: 'Đạt', color: '#2e9e46' },
  weak: { icon: '!', label: 'Chưa đạt', color: '#d63a43' },
  review: { icon: '?', label: 'Cần GV xem', color: '#e4a23a' },
  partial: { icon: '…', label: 'Làm dở', color: '#3c62b8' },
  none: { icon: '–', label: 'Chưa làm', color: 'transparent' },
};
export const STATUS_ORDER: TrackStatus[] = ['done', 'weak', 'review', 'partial', 'none'];
export const UNTRACKED_NOTE = 'Trang này chỉ có nội dung đọc hoặc tương tác không nộp bài; chưa có dữ liệu để gắn trạng thái.';

export const latestAttempt = (sub?: Submission): Attempt | undefined => sub?.attempts[sub.attempts.length - 1];

export function statusOfSubmission(sub?: Submission): TrackStatus {
  const latest = latestAttempt(sub);
  if (!latest) return 'none';
  if (latest.ai?.fallback) return 'review';
  return latest.isCorrect ? 'done' : 'weak';
}

export function combine(list: TrackStatus[]): TrackStatus {
  if (!list.length || list.every((s) => s === 'none')) return 'none';
  if (list.every((s) => s === 'done')) return 'done';
  if (list.includes('review')) return 'review';
  if (list.includes('weak')) return 'weak';
  return 'partial';
}

/** Page codes like "1.2": stage number + position among theory/activity steps of that stage. */
export function pageCodes(lesson: LessonMeta): Record<string, string> {
  const count: Record<number, number> = {};
  const codes: Record<string, string> = {};
  let parent = '', branch = 0;
  for (const step of lesson.steps) {
    if (step.kind !== 'theory' && step.kind !== 'activity') continue;
    if (step.teacherOnly) { codes[step.key] = 'GV'; continue; }
    if (step.sub && parent.startsWith(`${step.stage}.`)) {
      branch += 1;
      codes[step.key] = `${parent}${String.fromCharCode(96 + branch)}`;
      continue;
    }
    count[step.stage] = (count[step.stage] || 0) + 1;
    codes[step.key] = `${step.stage}.${count[step.stage]}`;
    parent = codes[step.key]; branch = 0;
  }
  return codes;
}

export type SubIndex = Map<string, Submission>;
const subKey = (studentId: string, stepKey: string, partId: string) => `${studentId}|${stepKey}|${partId}`;
export function indexSubmissions(subs: Submission[]): SubIndex {
  const map: SubIndex = new Map();
  for (const s of subs) map.set(subKey(s.studentId, s.stepKey, s.partId), s);
  return map;
}
export const findSub = (index: SubIndex, studentId: string, stepKey: string, partId: string) => index.get(subKey(studentId, stepKey, partId));

export function partSubs(index: SubIndex, step: StepMeta, studentId: string) {
  return (step.tracking?.parts || []).map((part) => ({ part, sub: findSub(index, studentId, step.key, part.id) }));
}

export function pageStatus(index: SubIndex, step: StepMeta, studentId: string): TrackStatus {
  return combine(partSubs(index, step, studentId).map(({ sub }) => statusOfSubmission(sub)));
}

export interface RowView {
  student: Student;
  status: TrackStatus;
  /** Newest attempt across parts */
  latest?: Attempt;
  submittedParts: number;
  correctParts: number;
  score: string;
  /** Score for the mirror / projector (multi-part: "3/4 phần đúng") */
  pickScore: string;
  note: string;
  ratio: number;
  locked: boolean;
}

export function rowView(index: SubIndex, step: StepMeta, student: Student): RowView {
  const parts = partSubs(index, step, student.id);
  const status = combine(parts.map(({ sub }) => statusOfSubmission(sub)));
  let latest: Attempt | undefined;
  let latestSub: Submission | undefined;
  let ratio = 0, counted = 0, correctParts = 0;
  for (const { sub } of parts) {
    const a = latestAttempt(sub);
    if (!a) continue;
    if (!latest || a.at > latest.at) { latest = a; latestSub = sub; }
    ratio += a.score == null ? 0 : a.score / (a.maxScore || 1);
    counted++;
    if (a.isCorrect) correctParts++;
  }
  const max = step.tracking?.maxAttempts || 2;
  const locked = parts.some(({ sub }) => statusOfSubmission(sub) === 'weak' && (sub!.locked || sub!.attempts.length >= max));
  const note = !latest ? ''
    : status === 'weak' ? (locked ? 'Hết lượt' : 'Còn 1 lượt làm lại')
    : status === 'review' ? 'AI chưa chấm được'
    : status === 'partial' ? 'Chưa xong mọi phần'
    : `Lượt ${latest.no}`;
  return {
    student,
    status,
    latest,
    submittedParts: counted,
    correctParts,
    score: latest ? (counted > 1 ? `${counted} phần` : latest.scoreDisplay) : '—',
    pickScore: latest ? (counted > 1 ? `${correctParts}/${counted} phần đúng` : latest.scoreDisplay) : '—',
    note,
    ratio: counted ? ratio / counted : 0,
    locked: Boolean(latestSub?.locked),
  };
}

/** Readable lines of a student's latest attempts on a page (all submitted parts). */
export function latestLines(index: SubIndex, step: StepMeta, studentId: string) {
  const lines: Attempt['lines'] = [];
  let feedback = '';
  for (const { sub } of partSubs(index, step, studentId)) {
    const a = latestAttempt(sub);
    if (!a) continue;
    lines.push(...a.lines);
    if (a.ai && !a.ai.fallback && a.ai.ideas) feedback = a.ai.ideas;
  }
  return { lines, feedback };
}

export const trackedSteps = (lesson: LessonMeta) => lesson.steps.filter((s) => s.tracking);
