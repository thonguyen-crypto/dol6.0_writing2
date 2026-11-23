import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkLesson } from '../src/kit/checkLesson';
import lesson from '../src/lessons/lesson-02-improve-connect/meta';
import slides from '../src/lessons/lesson-02-improve-connect/slides';
import rubrics from '../src/lessons/lesson-02-improve-connect/rubrics';
import template from '../src/lessons/_template/meta';
import templateSlides from '../src/lessons/_template/slides';
import templateRubrics from '../src/lessons/_template/rubrics';

test('Writing 6.0 Lesson 2 passes the lesson checks', () => {
  const report = checkLesson(lesson, Object.keys(slides), rubrics);
  assert.deepEqual(report.errors, []);
});

test('the blank template passes the lesson checks', () => {
  const report = checkLesson({ ...template, id: 'template-check' }, Object.keys(templateSlides), templateRubrics);
  assert.deepEqual(report.errors, []);
});

test('checks catch common mistakes', () => {
  const broken = { ...lesson, steps: [...lesson.steps, { key: 'warmup', kind: 'activity' as const, stage: 9, name: 'dup' }] };
  const report = checkLesson(broken, Object.keys(slides), rubrics);
  assert.ok(report.errors.some((e) => e.includes('trùng')));
  assert.ok(report.errors.some((e) => e.includes('stage 9')));
});
