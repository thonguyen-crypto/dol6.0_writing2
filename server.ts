/* DOL React Lesson Kit · server
   One lesson per deployment. Lesson-specific input: src/lessons/active-meta.ts (steps)
   and src/lessons/active-server.ts (AI rubrics). Everything else is shared core. */
import express from 'express';
import fs from 'fs';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { createClassCodeStore } from './server/core/classCodeStore.mjs';
import { createClassroomStore } from './server/core/classroomStore.mjs';
import { createClassroomEvents } from './server/core/classroomEvents.mjs';
import { createSecurity } from './server/core/security.mjs';
import { viteServerOptions } from './server/core/viteServerOptions.mjs';
import { applyAttempt, applyReview } from './server/core/submissions.mjs';
import { applyGatePatch, stepLockedForStudent } from './server/core/gate.mjs';
import { grade, validateGradeRequest } from './server/core/grading.mjs';
import lesson from './src/lessons/active-meta';
import rubrics from './src/lessons/active-server';
import type { ControlPatch, Student } from './src/kit/types';

const app = express();
const production = process.env.NODE_ENV === 'production' || path.basename(process.argv[1] || '') === 'server.cjs';
const dataDir = process.env.DATA_DIR || path.join(process.cwd(), '.data');
const PORT = Number(process.env.PORT) || 3000;
const security = createSecurity({ production, secretFilePath: path.join(dataDir, '.session-secret'), cookieName: `dol_${lesson.id.replace(/[^a-z0-9]/gi, '_')}` });
const classCodes = createClassCodeStore({
  filePath: path.join(dataDir, 'class-codes.json'),
  defaultCodes: (process.env.DEFAULT_CLASS_CODES || 'DOL-2026,DOL-2027,DOL-2028').split(','),
});
const firstStep = lesson.steps[0]?.key || '';
const store = createClassroomStore({ filePath: path.join(dataDir, 'classroom.json'), firstStep });
const events = createClassroomEvents();
const norm = (v: unknown) => String(v || '').trim().toUpperCase();
const stepExists = (key: unknown) => lesson.steps.some((s) => s.key === key);
const stepKeys = lesson.steps.map((s) => s.key);

app.disable('x-powered-by');
// Express 4 does not catch rejected async handlers: route them to the error handler instead of crashing.
for (const method of ['get', 'post', 'put', 'delete'] as const) {
  const original = (app as any)[method].bind(app);
  (app as any)[method] = (path: any, ...handlers: any[]) => {
    if (!handlers.length) return original(path);
    return original(path, ...handlers.map((h) => (typeof h === 'function' && h.length < 4
      ? (req: any, res: any, next: any) => { try { const r = h(req, res, next); if (r && typeof r.catch === 'function') r.catch(next); } catch (e) { next(e); } }
      : h)));
  };
}
app.use(express.json({ limit: '256kb' }));
app.use('/api', security.guard);
app.use(['/api/students/login', '/api/auth/teacher', '/api/class-codes/validate'], security.loginLimit);
app.use(['/api/grade', '/api/evaluate'], security.aiLimit);

/** The signed-in student, or null. Teachers pass. */
async function canReadClass(res: express.Response, classCode: string) {
  const session = res.locals.session;
  if (session.role === 'teacher') return true;
  return session.role === 'student' && norm(session.classCode) === norm(classCode);
}

/* ---- auth ---------------------------------------------------------------- */
app.get('/api/health', (_req, res) => res.json({ status: 'ok', lesson: lesson.id, time: new Date().toISOString() }));
app.get('/api/lesson', (_req, res) => res.json({ id: lesson.id, title: lesson.title }));

app.post('/api/auth/teacher', (req, res) => {
  if (!security.configured() || !process.env.TEACHER_PASSWORD || process.env.TEACHER_PASSWORD.length < 12) {
    return res.status(503).json({ error: 'Đăng nhập giáo viên chưa được cấu hình (TEACHER_PASSWORD ≥ 12 ký tự).' });
  }
  if (!security.teacherPasswordMatches(req.body?.password)) return res.status(401).json({ error: 'Mật khẩu giáo viên không đúng.' });
  security.issue(res, { role: 'teacher' });
  res.json({ ok: true });
});

app.get('/api/auth/session', async (req, res) => {
  const session = security.read(req);
  if (!session) return res.json({ role: null });
  if (session.role === 'teacher') return res.json({ role: 'teacher' });
  const { student, submissions } = await store.getStudentProgress(session.studentId);
  if (!student) return res.json({ role: null });
  res.json({ role: 'student', student, submissions });
});

app.post('/api/auth/logout', (req, res) => {
  security.logout(req, res);
  res.json({ ok: true });
});

/* ---- class codes (teacher) ---------------------------------------------- */
app.get('/api/class-codes', async (_req, res) => res.json({ classCodes: await classCodes.list() }));
app.post('/api/class-codes/validate', async (req, res) => res.json({ valid: await classCodes.has(req.body?.code) }));
app.post('/api/class-codes', async (req, res) => {
  const code = norm(req.body?.code);
  if (!/^[A-Z0-9-]{3,32}$/.test(code)) return res.status(400).json({ error: 'Mã lớp gồm 3–32 ký tự A–Z, 0–9 hoặc dấu gạch.' });
  res.status(201).json({ classCodes: await classCodes.add(code) });
});
app.delete('/api/class-codes/:code', async (req, res) => {
  await store.removeClass(req.params.code);
  res.json({ classCodes: await classCodes.remove(req.params.code) });
});

/* ---- students -------------------------------------------------------------- */
const studentIdFor = (name: string, classCode: string) =>
  'stu-' + `${classCode}-${name}`.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'd').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

app.post('/api/students/login', async (req, res) => {
  if (!security.configured()) return res.status(503).json({ error: 'Session service is not configured.' });
  const name = String(req.body?.name || '').trim().replace(/\s+/g, ' ');
  const classCode = norm(req.body?.classCode);
  if (!name || name.length > 60) return res.status(400).json({ error: 'Nhập họ tên (tối đa 60 ký tự).' });
  if (!(await classCodes.has(classCode))) return res.status(400).json({ error: 'Mã lớp không đúng. Hỏi lại giáo viên nhé.' });
  const id = studentIdFor(name, classCode);
  const existing = await store.getStudent(id);
  const student: Student = { id, name, classCode, stepKey: existing?.stepKey || firstStep, lastSeen: new Date().toISOString() };
  await store.upsertStudent(student);
  events.publish(classCode, 'classroom');
  security.issue(res, { role: 'student', studentId: id, classCode });
  const { submissions } = await store.getStudentProgress(id);
  res.json({ student, submissions });
});

app.put('/api/students/:id/position', async (req, res) => {
  const session = res.locals.session;
  if (session.role !== 'student' || session.studentId !== req.params.id) return res.status(403).json({ error: 'Access denied.' });
  if (!stepExists(req.body?.stepKey)) return res.status(400).json({ error: 'Bước không tồn tại.' });
  const student = await store.getStudent(session.studentId);
  if (!student) return res.status(404).json({ error: 'Không tìm thấy học sinh.' });
  await store.upsertStudent({ ...student, stepKey: req.body.stepKey, lastSeen: new Date().toISOString() });
  events.publish(student.classCode, 'classroom');
  res.json({ ok: true });
});

/* ---- classroom snapshot, live control, events -------------------------- */
app.get('/api/classroom/:code', async (req, res) => {
  if (!(await classCodes.has(req.params.code))) return res.status(404).json({ error: 'Class not found' });
  res.json(await store.getClassroom(req.params.code));
});

app.get('/api/classroom/:code/control', async (req, res) => {
  if (!(await canReadClass(res, req.params.code))) return res.status(403).json({ error: 'Access denied.' });
  res.json(await store.getControl(req.params.code));
});

app.put('/api/classroom/:code/control', async (req, res) => {
  const code = norm(req.params.code);
  if (!(await classCodes.has(code))) return res.status(404).json({ error: 'Class not found' });
  const patch = (req.body || {}) as ControlPatch;
  if (patch.teacherStep !== undefined && !stepExists(patch.teacherStep)) return res.status(400).json({ error: 'Bước không tồn tại.' });
  if (patch.invite !== undefined && !stepExists(patch.invite)) return res.status(400).json({ error: 'Bước không tồn tại.' });
  if (patch.reveal !== undefined && !stepExists(patch.reveal?.stepKey)) return res.status(400).json({ error: 'Bước không tồn tại.' });
  if (patch.gate !== undefined) { const bad = applyGatePatch({}, { gate: patch.gate }, stepKeys); if (bad) return res.status(400).json({ error: bad }); }
  const control = await store.updateControl(code, (c: any) => {
    if (typeof patch.teacherStep === 'string' && patch.teacherStep !== c.teacherStep) { c.teacherStep = patch.teacherStep; c.stepAt = new Date().toISOString(); }
    if (Number.isInteger(patch.build) && (patch.build as number) >= 0 && (patch.build as number) < 50) c.build = patch.build;
    if (typeof patch.paused === 'boolean') c.paused = patch.paused;
    if (patch.reveal) c.revealed = { ...c.revealed, [patch.reveal.stepKey]: patch.reveal.on === true };
    if (typeof patch.invite === 'string') c.invitation = { id: `inv-${Date.now()}`, stepKey: patch.invite, at: new Date().toISOString() };
    applyGatePatch(c, patch, stepKeys);
  });
  events.publish(code, 'control');
  res.json(control);
});

app.get('/api/classroom/:code/events', async (req, res) => {
  if (!(await classCodes.has(req.params.code))) return res.status(404).json({ error: 'Class not found' });
  if (!(await canReadClass(res, req.params.code))) return res.status(403).json({ error: 'Access denied.' });
  const teacher = res.locals.session.role === 'teacher';
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, no-transform');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();
  res.write(': connected\n\n');
  const unsubscribe = events.subscribe(req.params.code, (type: string) => {
    // Students only hear about control changes; class data stays teacher-only.
    if (teacher || type === 'control') res.write(`event: ${type}\ndata: {}\n\n`);
  });
  const heartbeat = setInterval(() => res.write(': keep-alive\n\n'), 25000);
  const timeout = setTimeout(() => res.end(), Math.max(0, res.locals.session.expiresAt - Date.now()));
  res.on('close', () => { clearInterval(heartbeat); clearTimeout(timeout); unsubscribe(); });
});

/* ---- submissions ---------------------------------------------------------- */
app.put('/api/submissions/:id', async (req, res) => {
  const session = res.locals.session;
  if (session.role !== 'student') return res.status(403).json({ error: 'Chỉ học sinh mới nộp bài.' });
  const student = await store.getStudent(session.studentId);
  if (!student) return res.status(401).json({ error: 'Phiên đăng nhập đã hết hạn.' });
  const control = await store.getControl(student.classCode);
  // Khóa bước: no saving or submitting on steps the teacher has not opened yet.
  if (stepLockedForStudent(control, stepKeys, req.body?.stepKey)) return res.status(403).json({ error: 'Bước này chưa mở. Thầy cô sẽ mở khi cả lớp sẵn sàng.' });
  let failure: { status: number; error: string } | null = null;
  const saved = await store.updateSubmission(req.params.id, (existing: any) => {
    const result: any = applyAttempt({ existing, incoming: { ...req.body, id: req.params.id }, lesson, student, paused: control.paused });
    if (result.error) { failure = result; return existing; }
    return result.submission;
  }).catch(() => null);
  if (failure) return res.status((failure as any).status).json({ error: (failure as any).error });
  if (!saved) return res.status(400).json({ error: 'Không lưu được bài nộp.' });
  events.publish(student.classCode, 'classroom');
  res.json(saved);
});

app.put('/api/submissions/:id/review', async (req, res) => {
  const existing = await store.getSubmission(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Không tìm thấy bài nộp.' });
  const saved = await store.updateSubmission(req.params.id, (current: any) => applyReview(current, req.body));
  events.publish(existing.classCode, 'classroom');
  res.json(saved);
});

/* ---- AI grading ------------------------------------------------------------ */
app.post('/api/grade', async (req, res) => {
  const request = validateGradeRequest(req.body, rubrics);
  if (!request) return res.status(400).json({ error: 'Yêu cầu chấm không hợp lệ.' });
  try {
    res.json(await grade(request.rubric, request.items));
  } catch {
    res.status(503).json({ error: 'AI chưa chấm được lúc này. Bài làm vẫn được giữ: thử lại, hoặc gửi để giáo viên chấm.' });
  }
});

/* ---- offline copy (teacher) -------------------------------------------- */
// ⚙ Cài đặt → "Tải bản offline (HTML)": the single-file build from `vite build --mode offline`.
app.get('/api/offline-html', (_req, res) => {
  const file = path.join(process.cwd(), 'dist', 'offline', 'index.html');
  if (!fs.existsSync(file)) return res.status(404).json({ error: 'Chưa có bản offline trên máy chủ. Chạy pnpm build để tạo.' });
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="DOL-${lesson.id}-offline.html"`);
  res.sendFile(file);
});

app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found' }));
app.use((error: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (!error?.type && !(error instanceof SyntaxError)) console.warn('Request failed:', error?.message || error);
  const status = error?.type === 'entity.too.large' ? 413 : error?.type || error instanceof SyntaxError ? 400 : 500;
  if (res.headersSent) return;
  res.status(status).json({ error: status === 413 ? 'Request is too large.' : status === 500 ? 'Máy chủ gặp lỗi. Thử lại sau.' : 'Invalid request.' });
});

async function start() {
  if (!production) {
    const vite = await createViteServer(viteServerOptions as any);
    app.use(vite.middlewares);
  } else {
    const dist = path.join(process.cwd(), 'dist');
    app.use((req, res, next) => (/\.(?:cjs|mjs|map|ts|tsx|env)$|\/\.|\/server(?:\/|\.)|\/@fs\//i.test(req.path) ? res.sendStatus(404) : next()));
    app.use('/assets', express.static(path.join(dist, 'assets'), { dotfiles: 'deny' }));
    app.get(/\.(png|jpg|jpeg|svg|webp|gif|ico|woff|woff2|mp3)$/i, express.static(dist, { dotfiles: 'deny' }));
    app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')));
  }
  app.listen(PORT, '0.0.0.0', () => console.log(`${lesson.title} · http://localhost:${PORT}`));
}

start();
