import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applyGatePatch, stepLockedForStudent } from '../server/core/gate.mjs';

const keys = ['cover', 's1', 's2', 's3', 's4', 's5', 's6'];
const fresh = () => ({ teacherStep: 'cover', gate: null, gateAuto: false });

test('Khóa bước: gate is validated', () => {
  for (const bad of [99, -1, 1.5, '2', true]) assert.equal(applyGatePatch(fresh(), { gate: bad }, keys), 'Bước mở không hợp lệ.');
  const c = fresh();
  assert.equal(applyGatePatch(c, { gate: 2, gateAuto: true }, keys), null);
  assert.equal(c.gate, 2); assert.equal(c.gateAuto, true);
  assert.equal(applyGatePatch(c, { gate: null }, keys), null);
  assert.equal(c.gate, null);
});

test('Khóa bước: invite opens up to the invited step', () => {
  const c = { ...fresh(), gate: 1 };
  applyGatePatch(c, { invite: 's5' }, keys);
  assert.equal(c.gate, 5);
  applyGatePatch(c, { invite: 's2' }, keys); // never closes steps
  assert.equal(c.gate, 5);
  const free = fresh();
  applyGatePatch(free, { invite: 's5' }, keys); // Tự do stays Tự do
  assert.equal(free.gate, null);
});

test('Khóa bước: gateAuto follows the teacher forward only', () => {
  const c = { ...fresh(), gate: 2, gateAuto: true };
  c.teacherStep = 's4'; applyGatePatch(c, { teacherStep: 's4' }, keys);
  assert.equal(c.gate, 4);
  c.teacherStep = 's1'; applyGatePatch(c, { teacherStep: 's1' }, keys);
  assert.equal(c.gate, 4);
  const off = { ...fresh(), gate: 2, teacherStep: 's5' };
  applyGatePatch(off, { teacherStep: 's5' }, keys);
  assert.equal(off.gate, 2, 'without gateAuto the gate stays');
  applyGatePatch(off, { gateAuto: true }, keys);
  assert.equal(off.gate, 5, 'switching gateAuto on while ahead opens up to the teacher');
});

test('Khóa bước: which steps are locked for students', () => {
  assert.equal(stepLockedForStudent({ gate: null }, keys, 's6'), false);
  assert.equal(stepLockedForStudent({}, keys, 's6'), false);
  assert.equal(stepLockedForStudent({ gate: 3 }, keys, 's3'), false);
  assert.equal(stepLockedForStudent({ gate: 3 }, keys, 's4'), true);
});
