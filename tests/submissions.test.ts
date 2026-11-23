import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applyAttempt, applyReview } from '../server/core/submissions.mjs';
import { fullLesson as lesson } from '../src/lessons/lesson-02-improve-connect/meta';

const student = { id: 'stu-1', name: 'An', classCode: 'DOL-2026' };
const attempt = (over = {}) => ({ answer: { A: '6' }, lines: [{ id: 'A', label: 'Descriptor A', value: 'Band 6', correct: true }], isCorrect: false, score: 3, maxScore: 4, scoreDisplay: '3/4 đúng', ...over });
const run = (existing: any, incoming: any, paused = false): any => applyAttempt({ existing, incoming: { id: 'sub-1', ...incoming }, lesson, student, paused });

test('rejects steps without tracking and unknown parts', () => {
  assert.equal(run(null, { stepKey: 'convincing', partId: 'all', attempt: attempt() }).status, 400);
  assert.equal(run(null, { stepKey: 'specific', partId: 'Z', attempt: attempt() }).status, 400);
});

test('paused class: 423 and nothing saved', () => {
  assert.equal(run(null, { stepKey: 'hedge', partId: 'all', attempt: attempt() }, true).status, 423);
});

test('appends attempts, locks after the last one or when correct', () => {
  const first = run(null, { stepKey: 'hedge', partId: 'all', attempt: attempt() }).submission;
  assert.equal(first.attempts.length, 1);
  assert.equal(first.locked, false);
  const second = run(first, { stepKey: 'hedge', partId: 'all', attempt: attempt() }).submission;
  assert.equal(second.attempts[1].no, 2);
  assert.equal(second.locked, true);
  assert.equal(run(second, { stepKey: 'hedge', partId: 'all', attempt: attempt() }).status, 409);
  const correct = run(null, { stepKey: 'hedge', partId: 'all', attempt: attempt({ isCorrect: true, score: 4 }) }).submission;
  assert.equal(correct.locked, true);
});

test('AI steps: the pass rule comes from the lesson, not the browser', () => {
  const low = run(null, { stepKey: 'specific', partId: 'all', attempt: attempt({ isCorrect: true, ai: { score: 3, maxScore: 5, ideas: 'x' } }) }).submission;
  assert.equal(low.attempts[0].isCorrect, false);
  const high = run(null, { stepKey: 'specific', partId: 'all', attempt: attempt({ isCorrect: false, ai: { score: 4, maxScore: 5, ideas: 'x' } }) }).submission;
  assert.equal(high.attempts[0].isCorrect, true);
  const fallback = run(null, { stepKey: 'specific', partId: 'all', attempt: attempt({ isCorrect: false, score: null, ai: { score: 0, maxScore: 5, ideas: '', fallback: true } }) }).submission;
  assert.equal(fallback.attempts[0].ai.fallback, true);
  assert.equal(fallback.locked, false);
});

test('a student cannot write into another student submission', () => {
  const other = { ...run(null, { stepKey: 'hedge', partId: 'all', attempt: attempt() }).submission, studentId: 'stu-2' };
  assert.equal(run(other, { stepKey: 'hedge', partId: 'all', attempt: attempt() }).status, 403);
});

test('malformed attempts are refused', () => {
  assert.equal(run(null, { stepKey: 'hedge', partId: 'all', attempt: { lines: 'x' } }).status, 400);
  assert.equal(run(null, { stepKey: 'hedge', partId: 'all', attempt: attempt({ lines: [{ id: 1 }] }) }).status, 400);
});

test('teacher review keeps only known fields', () => {
  const reviewed = applyReview({ id: 's' }, { comment: ' Tốt ', privateNote: 'note', status: 'reviewed', other: 1 });
  assert.equal(reviewed.review.comment, 'Tốt');
  assert.equal(reviewed.review.status, 'reviewed');
  assert.equal(reviewed.review.other, undefined);
});
