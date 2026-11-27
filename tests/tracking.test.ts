import { test } from 'node:test';
import assert from 'node:assert/strict';
import { combine, indexSubmissions, pageCodes, pageStatus, rowView, statusOfSubmission } from '../src/kit/tracking/tracking';
import type { Attempt, StepMeta, Submission } from '../src/kit/types';
import { fullLesson as lesson } from '../src/lessons/lesson-02-improve-connect/meta';

const attempt = (over: Partial<Attempt> = {}): Attempt => ({ no: 1, at: '2026-01-01T10:00:00Z', answer: {}, lines: [], isCorrect: true, score: 4, maxScore: 4, scoreDisplay: '4/4 đúng', ...over });
const sub = (studentId: string, stepKey: string, partId: string, attempts: Attempt[], locked = false): Submission => ({ id: `${studentId}-${stepKey}-${partId}`, lessonId: 'x', classCode: 'C', studentId, studentName: studentId, stepKey, partId, attempts, locked, updatedAt: '' });
const single: StepMeta = { key: 's', kind: 'activity', stage: 1, name: 'S', tracking: { parts: [{ id: 'all', label: 'all' }], grading: 'auto' } };
const multi: StepMeta = { key: 'm', kind: 'activity', stage: 1, name: 'M', tracking: { parts: ['A', 'B', 'C'].map((id) => ({ id, label: id })), grading: 'auto' } };

test('status of one submission', () => {
  assert.equal(statusOfSubmission(undefined), 'none');
  assert.equal(statusOfSubmission(sub('a', 's', 'all', [attempt()])), 'done');
  assert.equal(statusOfSubmission(sub('a', 's', 'all', [attempt({ isCorrect: false })])), 'weak');
  assert.equal(statusOfSubmission(sub('a', 's', 'all', [attempt({ isCorrect: false, ai: { score: 0, maxScore: 5, ideas: '', fallback: true } })])), 'review');
  // the latest attempt decides
  assert.equal(statusOfSubmission(sub('a', 's', 'all', [attempt({ isCorrect: false }), attempt({ no: 2 })])), 'done');
});

test('combine parts like main (review > weak > partial)', () => {
  assert.equal(combine(['none', 'none']), 'none');
  assert.equal(combine(['done', 'done']), 'done');
  assert.equal(combine(['done', 'none']), 'partial');
  assert.equal(combine(['done', 'weak', 'none']), 'weak');
  assert.equal(combine(['weak', 'review']), 'review');
});

test('multi-part page: Làm dở until every part is in', () => {
  const index = indexSubmissions([sub('a', 'm', 'A', [attempt()]), sub('a', 'm', 'B', [attempt()])]);
  assert.equal(pageStatus(index, multi, 'a'), 'partial');
  const r = rowView(index, multi, { id: 'a', name: 'A', classCode: 'C' });
  assert.equal(r.note, 'Chưa xong mọi phần');
  assert.equal(r.score, '2 phần');
  assert.equal(r.pickScore, '2/2 phần đúng');
});

test('row notes: attempts left, out of attempts, AI could not grade', () => {
  const one = indexSubmissions([sub('a', 's', 'all', [attempt({ isCorrect: false, scoreDisplay: '2/4 đúng' })])]);
  assert.equal(rowView(one, single, { id: 'a', name: 'A', classCode: 'C' }).note, 'Còn 1 lượt làm lại');
  const two = indexSubmissions([sub('a', 's', 'all', [attempt({ isCorrect: false }), attempt({ no: 2, isCorrect: false })], true)]);
  assert.equal(rowView(two, single, { id: 'a', name: 'A', classCode: 'C' }).note, 'Hết lượt');
  const ai = indexSubmissions([sub('a', 's', 'all', [attempt({ isCorrect: false, ai: { score: 0, maxScore: 5, ideas: '', fallback: true } })])]);
  assert.equal(rowView(ai, single, { id: 'a', name: 'A', classCode: 'C' }).note, 'AI chưa chấm được');
});

test('page codes follow stage order and skip covers/dividers', () => {
  const codes = pageCodes(lesson);
  assert.equal(codes.cover, undefined);
  assert.equal(codes.revision, '1.1');
  assert.equal(codes.warmup, '1.2');
  assert.equal(codes.demo, '2.1'); // 2 parts on one page
  assert.equal(codes.convincing, '2.2');
  assert.equal(codes.hedge, '2.2a'); // each practice hangs off the theory page before it
  assert.equal(codes.specificdemo, '2.3');
  assert.equal(codes.specific, '2.3a');
  assert.equal(codes.paraimprove, '2.4');
  assert.equal(codes.lwdemo, '3.1'); // CC + outline → paragraph demo on one page
  assert.equal(codes.linkfns, '3.2');
  assert.equal(codes.lwpractice, '3.2a');
  assert.equal(codes.thisverb, '4.1'); // mindset + This + verb + effects on one page
  assert.equal(codes.thispos, '4.1a');
  assert.equal(codes.thiswrite, '4.1c');
  assert.equal(codes.structs, '4.2');
  assert.equal(codes.thereby, '4.2a');
  assert.equal(codes.structwrite, '4.2b');
  assert.equal(codes.para2, '4.4');
  assert.equal(codes.homework, '5.3');
});
