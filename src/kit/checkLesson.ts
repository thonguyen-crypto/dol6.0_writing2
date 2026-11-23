/* Lesson checks run by `pnpm check:lesson` and the test suite.
   Errors break the app or the teacher tracking; warnings are things a teacher will miss. */
import type { LessonMeta, Rubric } from './types';

export interface LessonReport { errors: string[]; warnings: string[] }

export function checkLesson(lesson: LessonMeta, slideKeys: string[], rubrics: Record<string, Rubric>): LessonReport {
  const errors: string[] = [];
  const warnings: string[] = [];
  const keys = new Set<string>();
  if (!/^[a-z0-9-]+$/.test(lesson.id)) errors.push(`id "${lesson.id}" chỉ dùng a-z, 0-9 và dấu gạch.`);
  if (!lesson.steps.length) errors.push('Bài chưa có bước nào.');
  if (lesson.steps[0]?.kind !== 'cover') warnings.push('Bước đầu tiên nên là cover (bìa bài học).');
  const stageNums = new Set(lesson.stages.map((s) => s.n));
  for (const step of lesson.steps) {
    const at = `Bước "${step.key}"`;
    if (!/^[a-z0-9-]+$/i.test(step.key)) errors.push(`${at}: key chỉ dùng chữ, số, dấu gạch.`);
    if (keys.has(step.key)) errors.push(`${at}: key bị trùng.`);
    keys.add(step.key);
    if (step.kind !== 'cover' && !stageNums.has(step.stage)) errors.push(`${at}: stage ${step.stage} không có trong stages.`);
    if ((step.kind === 'theory' || step.kind === 'activity') && !slideKeys.includes(step.key)) errors.push(`${at}: chưa có slide trong slides.tsx.`);
    if ((step.kind === 'theory' || step.kind === 'activity') && !step.head) warnings.push(`${at}: thiếu head (chip, vi, pre, key) nên slide không có tiêu đề.`);
    if (step.kind === 'theory' && step.tracking) errors.push(`${at}: slide lý thuyết không có tracking.`);
    if (step.teacherOnly && step.tracking) errors.push(`${at}: bước chỉ dành cho giáo viên không có tracking.`);
    if (!step.notes?.length && step.kind !== 'cover') warnings.push(`${at}: chưa có notes cho giáo viên.`);
    if (step.tracking) {
      const ids = step.tracking.parts.map((p) => p.id);
      if (!ids.length) errors.push(`${at}: tracking.parts trống.`);
      if (new Set(ids).size !== ids.length) errors.push(`${at}: tracking.parts có id trùng.`);
      if (step.tracking.grading === 'ai' && !Object.keys(rubrics).length) errors.push(`${at}: bước AI chấm nhưng rubrics.ts trống.`);
      if ((step.tracking.maxAttempts ?? 2) < 1) errors.push(`${at}: maxAttempts phải ≥ 1.`);
    } else if (step.kind === 'activity') {
      warnings.push(`${at}: activity không có tracking → giáo viên thấy "·" (không có bài nộp).`);
    }
    if (step.poll) {
      if (!step.tracking) errors.push(`${at}: poll cần tracking để đếm bài nộp.`);
      for (const part of Object.keys(step.poll.correct || {})) if (!step.tracking?.parts.some((p) => p.id === part)) errors.push(`${at}: poll.correct có phần "${part}" không nằm trong tracking.parts.`);
    }
  }
  for (const key of slideKeys) if (!keys.has(key)) warnings.push(`slides.tsx có "${key}" nhưng meta không có bước này.`);
  for (const [id, r] of Object.entries(rubrics)) if (r.id !== id) errors.push(`Rubric "${id}": id bên trong là "${r.id}".`);
  return { errors, warnings };
}
