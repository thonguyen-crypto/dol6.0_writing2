/* Session, class data and live control for one lesson app.
   Students: own submissions + live control (pause, reveal, invite, teacher step).
   Teachers: whole-class snapshot (students, submissions, control) kept fresh by SSE + polling.
   Teacher demo / "Xem như học sinh": activities run locally and nothing is saved. */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { applyGatePatch } from '../../server/core/gate.mjs';
import { api, ApiError, subscribeClass } from './api';
import { OFFLINE, OFFLINE_AI_MSG, OFFLINE_CLASS } from './offline';
import { indexSubmissions, pageCodes, type SubIndex } from './tracking/tracking';
import { submissionIdFor, type Attempt, type ControlPatch, type ControlState, type GradeItem, type GradeResult, type LessonMeta, type Role, type Student, type Submission, type TeacherReview } from './types';

export type SubmitResult = { ok: true; submission: Submission } | { ok: false; error: string };

interface ClassroomValue {
  lesson: LessonMeta;
  codes: Record<string, string>;
  phase: 'loading' | 'login' | 'ready';
  role: Role;
  /** Teacher is looking at the student screen (nothing is saved). */
  viewAsStudent: boolean;
  setViewAsStudent: (on: boolean) => void;
  /** The screen in use: teacher chrome or student chrome. */
  view: Role;
  /** Activities do not save (teacher demo or preview). */
  demo: boolean;
  student: Student | null;
  classCode: string;
  classCodes: string[];
  selectClass: (code: string) => void;
  createClass: (code: string) => Promise<string | null>;
  deleteClass: (code: string) => Promise<void>;
  students: Student[];
  submissions: Submission[];
  index: SubIndex;
  control: ControlState;
  loginStudent: (name: string, classCode: string) => Promise<string | null>;
  loginTeacher: (password: string) => Promise<string | null>;
  logout: () => void;
  setControl: (patch: ControlPatch) => Promise<void>;
  reportPosition: (stepKey: string) => void;
  mySubmission: (stepKey: string, partId: string) => Submission | undefined;
  submitAttempt: (stepKey: string, partId: string, attempt: Omit<Attempt, 'no' | 'at'>) => Promise<SubmitResult>;
  saveReview: (submissionId: string, review: Omit<TeacherReview, 'at'>) => Promise<string | null>;
  grade: (rubricId: string, items: GradeItem[]) => Promise<GradeResult>;
  toast: string;
  showToast: (text: string) => void;
}

const Ctx = createContext<ClassroomValue | null>(null);
export const useClassroom = () => {
  const value = useContext(Ctx);
  if (!value) throw new Error('useClassroom must be used inside <ClassroomProvider>');
  return value;
};

const emptyControl = (first: string): ControlState => ({ teacherStep: first, build: 0, paused: false, gate: null, gateAuto: false, revealed: {}, invitation: null, updatedAt: '' });
const LS_CLASS = 'dol-kit-teacher-class';

export const ClassroomProvider: React.FC<{ lesson: LessonMeta; children: React.ReactNode }> = ({ lesson, children }) => {
  const first = lesson.steps[0]?.key || '';
  const codes = useMemo(() => pageCodes(lesson), [lesson]);
  // Offline single-file build: straight into the teacher screen, everything stays local.
  const [phase, setPhase] = useState<'loading' | 'login' | 'ready'>(OFFLINE ? 'ready' : 'loading');
  const [role, setRole] = useState<Role>(OFFLINE ? 'teacher' : 'student');
  const [viewAsStudent, setViewAsStudent] = useState(false);
  const [student, setStudent] = useState<Student | null>(null);
  const [classCodes, setClassCodes] = useState<string[]>([]);
  const [classCode, setClassCode] = useState(OFFLINE ? OFFLINE_CLASS : '');
  const [students, setStudents] = useState<Student[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [demoSubs, setDemoSubs] = useState<Submission[]>([]);
  const [control, setControlState] = useState<ControlState>(() => (OFFLINE ? { ...emptyControl(first), updatedAt: new Date().toISOString() } : emptyControl(first)));
  const [toast, setToast] = useState('');
  const toastTimer = useRef<number | undefined>(undefined);

  const showToast = useCallback((text: string) => {
    setToast(text);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(''), 2800);
  }, []);

  const toLogin = useCallback(() => {
    setPhase('login');
    setStudent(null);
    setSubmissions([]);
  }, []);

  /* ---- restore session ---- */
  useEffect(() => {
    if (OFFLINE) return;
    api.session().then((info) => {
      if (info.role === null) {
        setPhase('login');
      } else if (info.role === 'teacher') {
        setRole('teacher');
        setPhase('ready');
      } else {
        setRole('student');
        setStudent(info.student);
        setClassCode(info.student.classCode);
        setSubmissions(info.submissions);
        setPhase('ready');
      }
    }).catch(() => setPhase('login'));
  }, []);

  /* ---- teacher: class list ---- */
  useEffect(() => {
    if (OFFLINE || phase !== 'ready' || role !== 'teacher') return;
    api.classCodes().then((list) => {
      setClassCodes(list);
      let saved = '';
      try { saved = localStorage.getItem(LS_CLASS) || ''; } catch { /* storage may be blocked */ }
      setClassCode((current) => (list.includes(current) ? current : list.includes(saved) ? saved : list[0] || ''));
    }).catch((e) => (e instanceof ApiError && e.status === 401 ? toLogin() : undefined));
  }, [phase, role, toLogin]);

  /* ---- live data ---- */
  useEffect(() => {
    if (OFFLINE || phase !== 'ready' || !classCode) return;
    let alive = true;
    const refreshControl = () => api.control(classCode).then((c) => alive && setControlState(c)).catch((e) => {
      if (e instanceof ApiError && e.status === 401) toLogin();
    });
    const refreshClass = () => api.classroom(classCode).then((d) => {
      if (!alive) return;
      setStudents(d.students);
      setSubmissions(d.submissions);
      setControlState(d.control);
    }).catch((e) => { if (e instanceof ApiError && e.status === 401) toLogin(); });
    const teacher = role === 'teacher';
    void (teacher ? refreshClass() : refreshControl());
    const unsubscribe = subscribeClass(classCode, (type) => {
      if (type === 'control') void refreshControl();
      else if (teacher) void refreshClass();
    });
    const timer = window.setInterval(() => void (teacher ? refreshClass() : refreshControl()), teacher ? 5000 : 4000);
    // Students: pick up teacher comments on their own work every 20 s.
    const own = teacher ? 0 : window.setInterval(() => api.session().then((info) => {
      if (alive && info.role === 'student') setSubmissions(info.submissions);
    }).catch(() => undefined), 20000);
    return () => { alive = false; unsubscribe(); window.clearInterval(timer); window.clearInterval(own); };
  }, [phase, role, classCode, toLogin]);

  const index = useMemo(() => indexSubmissions(submissions), [submissions]);
  const demoIndex = useMemo(() => indexSubmissions(demoSubs), [demoSubs]);
  const demo = role === 'teacher';
  const view: Role = role === 'teacher' && !viewAsStudent ? 'teacher' : 'student';

  const value: ClassroomValue = {
    lesson,
    codes,
    phase,
    role,
    viewAsStudent,
    setViewAsStudent: (on) => { setViewAsStudent(on); setDemoSubs([]); },
    view,
    demo,
    student,
    classCode,
    classCodes,
    selectClass: (code) => {
      setClassCode(code);
      setStudents([]);
      setSubmissions([]);
      try { localStorage.setItem(LS_CLASS, code); } catch { /* ignore */ }
    },
    createClass: async (code) => {
      try {
        const list = await api.addClassCode(code.trim().toUpperCase());
        setClassCodes(list);
        setClassCode(code.trim().toUpperCase());
        return null;
      } catch (e) { return (e as Error).message; }
    },
    deleteClass: async (code) => {
      const list = await api.removeClassCode(code);
      setClassCodes(list);
      if (code === classCode) setClassCode(list[0] || '');
    },
    students,
    submissions,
    index,
    control,
    loginStudent: async (name, code) => {
      try {
        const res = await api.loginStudent(name, code);
        setRole('student');
        setStudent(res.student);
        setClassCode(res.student.classCode);
        setSubmissions(res.submissions);
        setPhase('ready');
        return null;
      } catch (e) { return (e as Error).message; }
    },
    loginTeacher: async (password) => {
      try {
        await api.loginTeacher(password);
        setRole('teacher');
        setViewAsStudent(false);
        setPhase('ready');
        return null;
      } catch (e) { return (e as Error).message; }
    },
    logout: () => {
      if (OFFLINE) return;
      void api.logout(role).catch(() => undefined);
      setViewAsStudent(false);
      setDemoSubs([]);
      setClassCode('');
      toLogin();
    },
    setControl: async (patch) => {
      if (role !== 'teacher' || !classCode) return;
      // Optimistic: the teacher's own screen reacts at once.
      setControlState((c) => ({
        ...c,
        ...(patch.teacherStep !== undefined ? { teacherStep: patch.teacherStep } : {}),
        ...(patch.build !== undefined ? { build: patch.build } : {}),
        ...(patch.paused !== undefined ? { paused: patch.paused } : {}),
        ...(patch.gate !== undefined ? { gate: patch.gate } : {}),
        ...(patch.gateAuto !== undefined ? { gateAuto: patch.gateAuto } : {}),
        ...(patch.reveal ? { revealed: { ...c.revealed, [patch.reveal.stepKey]: patch.reveal.on } } : {}),
      }));
      if (OFFLINE) {
        // No server: apply what the server would (Khóa bước rules, invitation) on this screen only.
        setControlState((c) => {
          const next: ControlState = { ...c, updatedAt: new Date().toISOString() };
          if (patch.teacherStep !== undefined && patch.teacherStep !== c.teacherStep) next.stepAt = next.updatedAt;
          if (patch.invite) next.invitation = { id: `inv-${Date.now()}`, stepKey: patch.invite, at: next.updatedAt };
          applyGatePatch(next, patch, lesson.steps.map((s) => s.key));
          return next;
        });
        return;
      }
      try { setControlState(await api.setControl(classCode, patch)); } catch (e) { showToast((e as Error).message); }
    },
    reportPosition: (stepKey) => {
      if (role !== 'student' || !student) return;
      void api.position(student.id, stepKey).catch(() => undefined);
    },
    mySubmission: (stepKey, partId) => {
      if (demo) return demoIndex.get(`demo|${stepKey}|${partId}`);
      return student ? index.get(`${student.id}|${stepKey}|${partId}`) : undefined;
    },
    submitAttempt: async (stepKey, partId, attempt) => {
      const step = lesson.steps.find((s) => s.key === stepKey);
      const max = step?.tracking?.maxAttempts || 2;
      if (demo) {
        const id = `demo-${stepKey}-${partId}`;
        const existing = demoSubs.find((s) => s.id === id);
        if (existing && (existing.locked || existing.attempts.length >= max)) return { ok: false, error: 'Đã hết lượt (bản xem thử).' };
        const isCorrect = step?.tracking?.grading === 'ai' && attempt.ai && !attempt.ai.fallback ? attempt.ai.score >= (step.tracking.passScore || 4) : attempt.isCorrect;
        const next: Attempt = { ...attempt, isCorrect, no: (existing?.attempts.length || 0) + 1, at: new Date().toISOString() };
        const attempts = [...(existing?.attempts || []), next];
        const sub: Submission = { id, lessonId: lesson.id, classCode, studentId: 'demo', studentName: 'Xem thử', stepKey, partId, attempts, locked: isCorrect || attempts.length >= max, updatedAt: next.at };
        setDemoSubs((list) => [...list.filter((s) => s.id !== id), sub]);
        return { ok: true, submission: sub };
      }
      if (!student) return { ok: false, error: 'Bạn cần đăng nhập lại.' };
      if (control.paused) return { ok: false, error: 'Giáo viên đang tạm khóa nộp bài. Bài làm của bạn vẫn được giữ.' };
      try {
        const saved = await api.submit(submissionIdFor(student.id, stepKey, partId), stepKey, partId, attempt);
        setSubmissions((list) => [...list.filter((s) => s.id !== saved.id), saved]);
        return { ok: true, submission: saved };
      } catch (e) {
        if (e instanceof ApiError && e.status === 401) toLogin();
        return { ok: false, error: (e as Error).message };
      }
    },
    saveReview: async (id, review) => {
      try {
        const saved = await api.review(id, review);
        setSubmissions((list) => list.map((s) => (s.id === saved.id ? saved : s)));
        return null;
      } catch (e) { return (e as Error).message; }
    },
    grade: (rubricId, items) => (OFFLINE ? Promise.reject(new Error(OFFLINE_AI_MSG)) : api.grade(rubricId, items)),
    toast,
    showToast,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};
