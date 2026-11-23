/* Pre-check before an AI submission (browser), same rules as hardCheck in server/core/grading.mjs
   plus one requirement per item. A half-done answer never reaches the grader and never costs an attempt.
   Server-safe: no React here (rubrics.ts reads LEVEL_60 from this file). */

/** Level 6.0 rules added to every rubric of this lesson. */
export const LEVEL_60 = [
  'Level: IELTS Writing 6.0 students. Judge the structure being taught, not style.',
  'Small slips in capitalisation, spacing or a missing final full stop are mentioned in the grammar note but never fail a criterion on their own.',
  'Notes are short, simple Vietnamese with the corrected words (wrong → fix), e.g. "jealous with → jealous of".',
];

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;

export interface CheckRule {
  minWords?: number;
  /** [regex, Vietnamese note]: the answer must match */
  need?: [string, string][];
}

/** '' when the answer can be sent, else the reason (Vietnamese). */
export function precheck(answer: string, prompt: string, rule: CheckRule = {}): string {
  const a = answer.trim();
  if (!a) return 'Chưa viết.';
  if (/_{2,}|\.{3}|…/.test(a)) return 'Còn chỗ trống chưa điền.';
  if (norm(a) === norm(prompt)) return 'Chưa thay đổi so với đề.';
  if (rule.minWords && words(a) < rule.minWords) return `Quá ngắn (ít nhất ${rule.minWords} từ).`;
  for (const [re, note] of rule.need || []) if (!new RegExp(re, 'i').test(a)) return note;
  return '';
}
