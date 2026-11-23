/* The slide shell: one 1440 × 900 canvas scaled to the window.
   Student: top bar (stage menu, steps, ‹ ›, "GV đang ở"), 16:9 slide, invite + pause overlays. On a phone (≤ 760px) students get a one-column layout instead (see "phone" below, styles/phone.css).
   Teacher: same slide at 78 %, right column, dock (‹ n/N › Notes Present), film strip,
   Tiến độ lớp / stage, theo dõi trang + gương thần, hồ sơ bài làm, Present (Spotlight, Bút vẽ). */
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useClassroom } from '../ClassroomProvider';
import { CoverSlide, DividerSlide, type SlideRegistry } from '../slides';
import { indexSubmissions, pageStatus, STATUS_META } from '../tracking/tracking';
import { TeacherPanel } from '../teacher/TeacherPanel';
import { ProgressBoard } from '../teacher/ProgressBoard';
import { ClassProgress } from '../teacher/ClassProgress';
import { PageTracker } from '../teacher/PageTracker';
import { SubmissionDrawer, type DrawerScope } from '../teacher/SubmissionDrawer';
import { ClassQR } from '../teacher/ClassQR';
import { OFFLINE } from '../offline';
import { Icon, Switch } from '../ui';

const W = 1440, H = 900;

/** Scales the fixed 1440 × 900 design to the window, letterboxed. */
const FitCanvas: React.FC<{ children: React.ReactNode; rootRef: React.RefObject<HTMLDivElement | null>; className: string; dark?: boolean; onMouseMove?: React.MouseEventHandler; onMouseUp?: React.MouseEventHandler }> = ({ children, rootRef, className, dark, onMouseMove, onMouseUp }) => {
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    const fit = () => setScale(Math.min(window.innerWidth / W, window.innerHeight / H));
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);
  return (
    <div style={{ position: 'fixed', inset: 0, background: dark ? '#14151c' : '#f4f4f2', transition: 'background .3s', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <div style={{ width: W * scale, height: H * scale, position: 'relative' }}>
        <div ref={rootRef} className={`app ${className}`} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
          style={{ width: W, height: H, transform: `scale(${scale})`, transformOrigin: '0 0', position: 'absolute', left: 0, top: 0, overflow: 'hidden', fontFamily: "'Plus Jakarta Sans', 'Segoe UI', system-ui, sans-serif", color: '#4b4d63', backgroundColor: dark ? '#191a22' : '#f4f4f2', backgroundImage: `radial-gradient(circle, ${dark ? '#2c2d3a' : '#d9d8d2'} 1px, transparent 1.3px)`, backgroundSize: '22px 22px' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

/** Phone (portrait, narrow): students get a one-column layout instead of the scaled 16:9 canvas. */
const PHONE_MQ = '(max-width: 760px)';
function usePhone() {
  const [phone, setPhone] = useState(() => typeof window !== 'undefined' && !!window.matchMedia?.(PHONE_MQ).matches);
  useEffect(() => {
    const mq = window.matchMedia?.(PHONE_MQ);
    if (!mq) return;
    const on = () => setPhone(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return phone;
}

const LS_DISMISSED = 'dol-kit-invites-dismissed';
const LS_THEME = 'dol-kit-teacher-theme';
const readTheme = (): 'light' | 'dark' => { try { return localStorage.getItem(LS_THEME) === 'dark' ? 'dark' : 'light'; } catch { return 'light'; } };

/** "Tải bản offline (HTML)": the single-file build the server keeps at dist/offline/index.html. */
async function downloadOffline(lessonId: string): Promise<string | null> {
  try {
    const res = await fetch('/api/offline-html');
    if (!res.ok) return (await res.json().catch(() => ({}))).error || 'Chưa tải được bản offline. Thử lại sau.';
    const url = URL.createObjectURL(await res.blob());
    const a = document.createElement('a');
    a.href = url;
    a.download = `DOL-${lessonId}-offline.html`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 4000);
    return null;
  } catch { return 'Mất kết nối tới máy chủ. Thử lại sau.'; }
}

/** One row of the settings pop: title, caption, control on the right. */
const SetRow: React.FC<{ title: string; sub?: string; children: React.ReactNode }> = ({ title, sub, children }) => (
  <div className="setrow"><div style={{ flex: 1, minWidth: 0 }}><div className="sett">{title}</div>{sub && <div className="sets">{sub}</div>}</div>{children}</div>
);
const readDismissed = (): string[] => { try { return JSON.parse(localStorage.getItem(LS_DISMISSED) || '[]'); } catch { return []; } };

export const LessonPlayer: React.FC<{ slides: SlideRegistry }> = ({ slides }) => {
  const room = useClassroom();
  const { lesson, control, view, codes } = room;
  const isT = view === 'teacher';
  // Teacher-only steps (solutions…) exist only in teacher view.
  const steps = React.useMemo(() => (isT ? lesson.steps : lesson.steps.filter((s) => !s.teacherOnly)), [isT, lesson.steps]);
  const idxOf = useCallback((key?: string) => Math.max(0, steps.findIndex((s) => s.key === key)), [steps]);
  const hasStep = useCallback((key?: string) => steps.some((s) => s.key === key), [steps]);

  const [stepIdx, setStepIdx] = useState(() => idxOf(room.role === 'student' ? room.student?.stepKey : undefined));
  const [builds, setBuilds] = useState<Record<string, number>>({});
  const [follow, setFollow] = useState(true);
  const [big, setBig] = useState(false);
  const [vi, setVi] = useState(true);
  const [rm, setRm] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [gearOpen, setGearOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [board, setBoard] = useState<null | 'all' | 'stage'>(null);
  const [tracker, setTracker] = useState<{ key: string; from: 'all' | 'stage' | null } | null>(null);
  const [drawer, setDrawer] = useState<{ id: string; key: string | null; scope: DrawerScope } | null>(null);
  const [picker, setPicker] = useState<{ rolling: boolean; name: string } | null>(null);
  const [present, setPresent] = useState(false);
  // Students: full screen keeps the top bar (stage map, step dots, ‹ ›, settings); only the slide grows.
  const [full, setFull] = useState(false);
  const [tool, setTool] = useState<Tool>('none');
  const [spot, setSpot] = useState({ x: 720, y: 405 });
  // Present annotations, kept per step: pen / highlighter strokes and text boxes (Chữ). Tẩy removes one mark at a time.
  const [ink, setInk] = useState<Mark[]>([]);
  const [drawing, setDrawing] = useState<{ kind: 'pen' | 'hl'; d: string } | null>(null);
  const [editing, setEditing] = useState<{ id: number; x: number; y: number; text: string; size: number } | null>(null);
  const [textSize, setTextSize] = useState(34); // Chữ: size of new boxes; changing it while a box is open resizes that box
  const [erasing, setErasing] = useState(false);
  const markId = useRef(1);
  const bumpSize = (dir: 1 | -1) => {
    const i = TEXT_SIZES.indexOf(textSize);
    const next = TEXT_SIZES[Math.max(0, Math.min(TEXT_SIZES.length - 1, (i < 0 ? 2 : i) + dir))];
    setTextSize(next);
    setEditing((cur) => (cur ? { ...cur, size: next } : cur));
  };
  const eraseMark = (id: number) => setInk((k) => k.filter((m) => m.id !== id));
  // Idempotent (blur and a new click can both commit the same box): empty text removes the box.
  const commitText = (t: { id: number; x: number; y: number; text: string; size: number }, stepKey: string) => {
    setInk((k) => {
      const rest = k.filter((m) => m.id !== t.id);
      return t.text.trim() ? [...rest, { id: t.id, step: stepKey, kind: 'text', x: t.x, y: t.y, text: t.text.trim(), size: t.size }] : rest;
    });
    setEditing((cur) => (cur && cur.id === t.id ? null : cur));
  };
  const [pollPart, setPollPart] = useState('');
  const [dismissed, setDismissed] = useState<string[]>(readDismissed);
  const [newClass, setNewClass] = useState('');
  const [classMsg, setClassMsg] = useState('');
  const [qrOpen, setQrOpen] = useState(false);
  const [theme, setThemeState] = useState<'light' | 'dark'>(readTheme);
  const [offBusy, setOffBusy] = useState(false);
  const setTheme = (t: 'light' | 'dark') => { setThemeState(t); try { localStorage.setItem(LS_THEME, t); } catch { /* ignore */ } };
  const canQR = room.role === 'teacher' && !OFFLINE;
  const rootRef = useRef<HTMLDivElement>(null);
  const phone = usePhone();
  const phoneBody = useRef<HTMLElement>(null);
  const [mapStage, setMapStage] = useState<number | null>(null);
  const filmRef = useRef<HTMLDivElement>(null);
  const teacherSynced = useRef(false);

  const step = steps[Math.min(stepIdx, steps.length - 1)];
  // Switching teacher ⇄ "xem như học sinh" changes the step list: stay on the same step key.
  const lastKey = useRef(step.key);
  useEffect(() => {
    const i = steps.findIndex((s) => s.key === lastKey.current);
    setStepIdx(i >= 0 ? i : Math.max(0, steps.findIndex((s, k) => k >= stepIdx && !s.teacherOnly)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [steps]);
  useEffect(() => { lastKey.current = step.key; }, [step.key]);
  const nB = step.builds || 1;
  const build = Math.min(builds[step.key] || 0, nB - 1);
  const revealed = Boolean(control.revealed[step.key]);

  /* ---- navigation ---- */
  // "Khóa bước" (pacing): control.gate = index in lesson.steps of the last step students may open (null = Tự do).
  const gate = typeof control.gate === 'number' && Number.isInteger(control.gate) ? control.gate : null;
  const allIdx = (key: string) => lesson.steps.findIndex((s) => s.key === key);
  const lockedMark = (key: string) => gate !== null && allIdx(key) > gate; // shown to everyone
  const blocked = (key: string) => !isT && lockedMark(key); // teachers are never locked
  const gateStep = gate !== null ? lesson.steps[Math.min(gate, lesson.steps.length - 1)] : null;
  // Last step of the visible list that students may open.
  const gateLocal = gate === null ? steps.length - 1 : steps.reduce((m, s, k) => (allIdx(s.key) <= gate ? k : m), 0);
  const go = useCallback((i: number, atEnd = false) => {
    const j = Math.max(0, Math.min(steps.length - 1, i));
    if (blocked(steps[j].key)) { room.showToast('Bước này chưa mở. Thầy cô sẽ mở khi cả lớp sẵn sàng.'); setMapOpen(false); return; }
    const target = steps[j];
    setStepIdx(steps.indexOf(target));
    setBuilds((b) => ({ ...b, [target.key]: atEnd ? (target.builds || 1) - 1 : 0 }));
    setMapOpen(false); setGearOpen(false); setNotesOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [steps, gate, isT]);
  const advance = useCallback(() => {
    if (build < nB - 1) setBuilds((b) => ({ ...b, [step.key]: build + 1 }));
    else if (stepIdx < steps.length - 1) go(stepIdx + 1);
  }, [build, nB, step.key, stepIdx, steps.length, go]);
  const setStepBuild = useCallback((n: number) => {
    setBuilds((b) => ({ ...b, [step.key]: Math.max(0, Math.min(nB - 1, Math.round(n) || 0)) }));
  }, [step.key, nB]);
  const retreat = useCallback(() => {
    if (build > 0) setBuilds((b) => ({ ...b, [step.key]: build - 1 }));
    else if (stepIdx > 0) go(stepIdx - 1, true);
  }, [build, step.key, stepIdx, go]);

  // Teacher: start where the class is; then every move is pushed to the class.
  useEffect(() => {
    if (!isT || teacherSynced.current || !control.updatedAt) return;
    teacherSynced.current = true;
    if (control.teacherStep) { setStepIdx(idxOf(control.teacherStep)); setBuilds((b) => ({ ...b, [control.teacherStep]: control.build || 0 })); }
  }, [isT, control.updatedAt, control.teacherStep, control.build, idxOf]);
  useEffect(() => {
    if (!isT || room.role !== 'teacher' || !teacherSynced.current) return;
    if (control.teacherStep === step.key && control.build === build) return;
    const t = window.setTimeout(() => void room.setControl({ teacherStep: step.key, build }), 120);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isT, step.key, build]);
  useEffect(() => { teacherSynced.current = false; }, [room.classCode]);

  // Student: follow the teacher (step and theory builds), report position.
  useEffect(() => {
    if (isT || !follow || !control.teacherStep || !hasStep(control.teacherStep)) return;
    if (blocked(control.teacherStep)) return; // the teacher is ahead of what is open: stay put
    const i = idxOf(control.teacherStep);
    setStepIdx(i);
    setBuilds((b) => ({ ...b, [control.teacherStep]: control.build || 0 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isT, follow, control.teacherStep, control.build]);
  useEffect(() => { if (!isT) room.reportPosition(step.key); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [isT, step.key]);
  // Student: the teacher opened more steps → toast, and with "Theo giáo viên" move to the newly opened step.
  // A student sitting on a step that is (now) locked — late join, reload, gate moved back — goes to the gate step.
  const prevGate = useRef<number | null | undefined>(undefined);
  useEffect(() => {
    if (isT || !control.updatedAt) return;
    const before = prevGate.current;
    prevGate.current = gate;
    if (gate !== null && blocked(step.key)) { setStepIdx(gateLocal); return; }
    if (before === undefined || gate === null) return;
    if (before !== null && gate > before) {
      room.showToast(`Thầy cô vừa mở: ${gateStep?.name || ''}`);
      if (follow) { setStepIdx(gateLocal); setBuilds((b) => ({ ...b, [steps[gateLocal].key]: 0 })); }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isT, gate, control.updatedAt, step.key]);

  // Invitation (students)
  const inv = control.invitation;
  const inviteFresh = inv && (!control.stepAt || inv.at >= control.stepAt || control.teacherStep === inv.stepKey);
  const inviteShown = !isT && !present && inv && inviteFresh && !dismissed.includes(inv.id) && inv.stepKey !== step.key;
  const dismiss = (id: string) => {
    const next = [...dismissed.slice(-20), id];
    setDismissed(next);
    try { localStorage.setItem(LS_DISMISSED, JSON.stringify(next)); } catch { /* ignore */ }
  };
  useEffect(() => { if (inv && inv.stepKey === step.key && !dismissed.includes(inv.id)) dismiss(inv.id); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [inv?.id, step.key]);

  // Keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented) return; // a slide stepped its own builds first
      const el = e.target as HTMLElement | null;
      const tag = el?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el?.isContentEditable) return;
      if (canQR && isT && !e.ctrlKey && !e.metaKey && !e.altKey && (e.key === 'q' || e.key === 'Q')) { setQrOpen((v) => !v); setGearOpen(false); return; }
      if (qrOpen) { if (e.key === 'Escape') setQrOpen(false); return; } // QR on the projector: no slide keys
      if (board === 'all') { if (e.key === 'Escape') { if (drawer) setDrawer(null); else setBoard(null); } return; } // full-screen class progress: no slide keys
      if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); advance(); }
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); retreat(); }
      else if (!isT && (e.key === 'f' || e.key === 'F')) setFull((f) => !f);
      else if (e.key === 'Escape') { setPresent(false); setFull(false); setTool('none'); setMapOpen(false); setGearOpen(false); setNotesOpen(false); setPicker(null); }
      else if (isT && (e.key === 'n' || e.key === 'N')) setNotesOpen((v) => !v);
      else if (isT && present && (e.key === 's' || e.key === 'S')) setTool((t) => (t === 'spot' ? 'none' : 'spot'));
      else if (isT && present && (e.key === 'p' || e.key === 'P')) setTool((t) => (t === 'pen' ? 'none' : 'pen'));
      else if (isT && present && (e.key === 'h' || e.key === 'H')) setTool((t) => (t === 'hl' ? 'none' : 'hl'));
      else if (isT && present && (e.key === 't' || e.key === 'T')) setTool((t) => (t === 'text' ? 'none' : 'text'));
      else if (isT && present && tool === 'text' && (e.key === '[' || e.key === ']')) bumpSize(e.key === '[' ? -1 : 1);
      else if (isT && present && (e.key === 'e' || e.key === 'E')) setTool((t) => (t === 'erase' ? 'none' : 'erase'));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [advance, retreat, isT, present, board, drawer, qrOpen, canQR, tool, textSize]);
  useEffect(() => { if (!isT) setQrOpen(false); }, [isT]);

  // Phone: a new step starts at the top of the page
  useEffect(() => { phoneBody.current?.scrollTo({ top: 0 }); }, [step.key]);

  // Keep the current step visible in the film strip
  useEffect(() => { if (filmRef.current) filmRef.current.scrollLeft = Math.max(0, Math.floor(stepIdx / 2) * 135 - 435); }, [stepIdx, isT]);

  // Student full screen: real browser fullscreen, top bar stays
  useEffect(() => {
    if (isT) return;
    if (!full) { if (document.fullscreenElement) void document.exitFullscreen().catch(() => undefined); return; }
    void document.documentElement.requestFullscreen?.().catch(() => undefined);
    const onFs = () => { if (!document.fullscreenElement) setFull(false); };
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, [full, isT]);
  // Present: real fullscreen when the browser allows it
  useEffect(() => {
    if (!present) { if (document.fullscreenElement) void document.exitFullscreen().catch(() => undefined); return; }
    void document.documentElement.requestFullscreen?.().catch(() => undefined);
    const onFs = () => { if (!document.fullscreenElement) setPresent(false); };
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, [present]);

  const point = (e: React.MouseEvent) => {
    const r = rootRef.current!.getBoundingClientRect();
    const k = W / r.width;
    return { x: (e.clientX - r.left) * k, y: (e.clientY - r.top) * k - 45 };
  };

  /* ---- data for the chrome ---- */
  const stage = lesson.stages.find((s) => s.n === step.stage);
  const stageSteps = steps.map((s, i) => ({ s, i })).filter(({ s }) => s.stage === step.stage && step.stage > 0);
  const myStatus = (key: string) => {
    const s = steps.find((x) => x.key === key)!;
    if (!s.tracking) return null;
    if (!room.demo) return pageStatus(room.index, s, room.student?.id || '');
    const own = s.tracking.parts.map((p) => room.mySubmission(key, p.id)).filter((x): x is NonNullable<typeof x> => Boolean(x));
    return pageStatus(indexSubmissions(own), s, 'demo');
  };
  const teacherStepName = lesson.steps.find((s) => s.key === control.teacherStep)?.name || '';
  const notes = step.notes || [];
  const SlideComp = slides[step.key] || (step.kind === 'cover' ? CoverSlide : step.kind === 'divider' ? DividerSlide : null);
  const firstStageStep = steps.findIndex((s) => s.stage === 1);

  // Cỡ chữ Lớn only enlarges the text inside the slide (CSS var --fs on the canvas); the slide keeps its size and layout.
  const sl = present ? { left: 0, top: 45, scale: 1.125, z: 45 } : !isT && full ? { left: 0, top: 70, scale: 1.12, z: 30 } : isT && OFFLINE ? { left: 54, top: 78, scale: 1.04, z: 5 } : isT ? { left: 24, top: 82, scale: 0.78, z: 5 } : { left: 80, top: 122, scale: 1, z: 5 };
  const showHead = step.kind === 'theory' || step.kind === 'activity';

  const pickName = () => {
    if (!room.students.length) return;
    setPicker({ rolling: true, name: '' });
    window.setTimeout(() => setPicker({ rolling: false, name: room.students[Math.floor(Math.random() * room.students.length)].name }), 1400);
  };
  const openStudent = (id: string, key: string | null) => setDrawer({ id, key, scope: key ? 'page' : 'all' });
  // "Giao diện Tối": only the teacher's control frame; the slide itself stays white (it is what the class sees).
  const tdark = isT && theme === 'dark';

  /* ---------------- phone (students): one column, nav at the thumb ---------------- */
  if (phone && !isT) {
    const code = codes[step.key];
    const tStep = control.teacherStep && hasStep(control.teacherStep) ? control.teacherStep : null;
    const tHere = tStep === step.key;
    const nextS = steps[stepIdx + 1];
    const nextBlocked = build >= nB - 1 && (!nextS || blocked(nextS.key));
    const mainLabel = build < nB - 1 ? `Xem tiếp · ${build + 1}/${nB}` : !nextS ? 'Hết bài' : blocked(nextS.key) ? 'Chờ cô mở bước sau' : `Tiếp: ${codes[nextS.key] ? `${codes[nextS.key]} · ` : ''}${nextS.short || nextS.name}`;
    const openStage = mapStage ?? step.stage;
    const waitDone = gateStep && step.key === gateStep.key && gate !== null && gate < lesson.steps.length - 1 && (myStatus(step.key) || 'none') !== 'none';
    const kico = (th: boolean) => th
      ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2z" /><path d="M22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z" /></svg>
      : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>;
    return (
      <div ref={rootRef} className={`app phone${vi ? '' : ' novi'}${big ? ' big' : ''}${rm ? ' rm' : ''}`}>
        <header className="ph-bar">
          <button className="ph-stg" onClick={() => { setMapStage(null); setMapOpen(true); setGearOpen(false); }} aria-label="Mở bản đồ bài học">
            <span className="num" style={step.stage === 4 ? { background: '#3b3d54' } : undefined}>{step.stage}</span>
            <span className="ph-lbl"><b>{step.kind === 'cover' ? 'Mở đầu' : stage?.name}</b><small>{code ? `Trang ${code} · ` : ''}bước {stepIdx}/{steps.length - 1}</small></span>
            <Icon name="down" size={16} stroke={2.4} />
          </button>
          <button className={`ph-ib${big ? ' on' : ''}`} aria-pressed={big} aria-label="Chữ lớn" title="Cỡ chữ Vừa / Lớn" onClick={() => setBig(!big)}>Aa</button>
          <button className="ph-ib" aria-label="Cài đặt" onClick={() => { setGearOpen(true); setMapOpen(false); }}><Icon name="gear" size={20} /></button>
        </header>
        {stageSteps.length > 1 && (
          <div className="ph-prog" aria-label={`Chặng ${step.stage}: trang ${stageSteps.findIndex(({ i }) => i === stepIdx) + 1} trên ${stageSteps.length}`}>
            {stageSteps.map(({ s, i }) => <span key={s.key} className={i === stepIdx ? 'cur' : i < stepIdx || myStatus(s.key) === 'done' ? 'done' : ''} />)}
          </div>
        )}
        {room.role === 'teacher'
          ? <div className="ph-band vio" role="status"><span style={{ flex: 1 }}>Đang xem như học sinh</span><button onClick={() => room.setViewAsStudent(false)}>Về giáo viên</button></div>
          : tStep && (tHere
            ? (follow && <div className="ph-band ok" role="status"><span className="dot" /><span style={{ flex: 1 }}>Đang theo cô · slide tự chuyển</span></div>)
            : !blocked(tStep) && <div className="ph-band warn" role="status"><Icon name="clock" size={17} /><span style={{ flex: 1, minWidth: 0 }}>GV đang ở {codes[tStep] ? `${codes[tStep]} · ` : ''}{teacherStepName}</span><button onClick={() => { setFollow(true); go(idxOf(tStep)); }}>Theo GV</button></div>)}
        <main className="ph-body" ref={phoneBody}>
          {waitDone && <div className="sl-wait ph-wait" role="status"><span className="sl-waitic"><Icon name="lock" size={18} stroke={2.4} /></span><div><b>Em đã xong phần được mở!</b><small>Thầy cô sẽ mở bước tiếp theo khi cả lớp sẵn sàng.</small></div></div>}
          <div className="slide" key={step.key} data-step={step.key}>
            {showHead && step.head && !step.head.custom && (
              <div className="ph-head">
                <div className="ph-chips">
                  <span className="ph-chip"><span className="num">{step.stage}</span>{step.head.chip || stage?.name}</span>
                  {step.kind === 'theory' && <span className="tag" style={{ background: '#eef2fb', color: '#3c62b8' }}>LÝ THUYẾT</span>}
                  {step.kind === 'activity' && <span className="tag" style={{ background: '#fdf1f1', color: '#b0262e' }}>THỰC HÀNH</span>}
                </div>
                {step.head.vi && <p className="vi ph-vi">{step.head.vi}</p>}
                <h1 className="ph-h1">{step.head.pre} {step.head.key && <span className="hl">{step.head.key}</span>}</h1>
              </div>
            )}
            {SlideComp
              ? <SlideComp step={step} lesson={lesson} build={build} setBuild={setStepBuild} revealed={revealed} view={view} onStart={firstStageStep >= 0 ? () => go(firstStageStep) : undefined} />
              : <div style={{ padding: 24, color: '#6b6d82' }}>Bước “{step.key}” chưa có slide.</div>}
          </div>
        </main>
        <footer className="ph-foot">
          {nB > 1 && <div className="ph-bdots" aria-hidden="true">{Array.from({ length: nB }, (_, i) => <span key={i} className={i === build ? 'cur' : i < build ? 'done' : ''} />)}</div>}
          <div className="ph-row">
            <button className="ph-nav" onClick={retreat} disabled={stepIdx === 0 && build === 0} aria-label="Lùi"><Icon name="left" size={20} stroke={2.4} /></button>
            <button className={`ph-main${build >= nB - 1 && step.kind === 'activity' ? ' soft' : ''}`} onClick={advance} disabled={nextBlocked}>{mainLabel}</button>
            <button className="ph-nav" onClick={() => go(stepIdx + 1)} disabled={!nextS || blocked(nextS.key)} aria-label="Trang sau"><Icon name="right" size={20} stroke={2.4} /></button>
          </div>
        </footer>

        {mapOpen && (
          <>
            <div className="ph-scrim" onClick={() => setMapOpen(false)} aria-hidden="true" />
            <div className="ph-sheet" role="dialog" aria-modal="true" aria-label="Bản đồ bài học">
              <div className="ph-handle" />
              <div className="ph-shead"><div style={{ flex: 1 }}><b>Bản đồ bài học</b><small>{lesson.title} · {steps.length} trang</small></div><button className="ph-ib" onClick={() => setMapOpen(false)} aria-label="Đóng"><Icon name="close" size={20} stroke={2.4} /></button></div>
              <div className="ph-list">
                {steps.filter((s) => s.kind === 'cover').map((s) => <button key={s.key} className={`ph-rw${s === step ? ' cur' : ''}`} onClick={() => go(steps.indexOf(s))}><span className="code">0</span><span className="ico">{kico(true)}</span><span className="nm">Mở đầu</span></button>)}
                {lesson.stages.map((sg) => {
                  const list = steps.map((s, i) => ({ s, i })).filter(({ s }) => s.stage === sg.n && s.kind !== 'divider');
                  const open = openStage === sg.n;
                  const done = list.filter(({ s }) => myStatus(s.key) === 'done').length;
                  const tracked = list.filter(({ s }) => s.tracking).length;
                  const allLocked = list.every(({ s }) => lockedMark(s.key));
                  return (
                    <div key={sg.n}>
                      <button className="ph-sg" aria-expanded={open} onClick={() => setMapStage(open ? -1 : sg.n)}>
                        <span className="num" style={sg.n === step.stage ? undefined : { background: allLocked ? '#c9c8c3' : '#8b8da1' }}>{sg.n}</span>
                        <span className="t"><b>{sg.name}</b><small>{list.length} trang{allLocked ? ' · cô chưa mở' : tracked ? ` · ${done}/${tracked} bài tập xong` : ''}</small></span>
                        <span style={{ display: 'grid', transform: open ? 'rotate(180deg)' : undefined, transition: 'transform .25s', color: '#6b6d82' }}><Icon name="down" size={18} stroke={2.4} /></span>
                      </button>
                      {open && list.map(({ s, i }) => {
                        const st = myStatus(s.key);
                        const lk = lockedMark(s.key);
                        return (
                          <button key={s.key} className={`ph-rw${i === stepIdx ? ' cur' : ''}${lk ? ' lock' : ''}${s.sub ? ' sub' : ''}`} onClick={() => go(i)} aria-disabled={lk}>
                            {s.sub ? <svg className="br" width="16" height="22" viewBox="0 0 16 22" fill="none" stroke="#c9c8c3" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="M2 0v11a4 4 0 0 0 4 4h8" /></svg> : <span className="code">{codes[s.key]}</span>}
                            <span className="ico">{kico(s.kind === 'theory')}</span>
                            <span className="nm">{s.sub ? `${codes[s.key]} · ` : ''}{s.name}</span>
                            {st && st !== 'none' && <span className="stt" style={{ color: STATUS_META[st].color }} aria-label={STATUS_META[st].label}>{STATUS_META[st].icon}</span>}
                            {tStep === s.key && <span className="pill">{i === stepIdx ? 'Bạn + cô' : 'Cô'}</span>}
                            {lk && <Icon name="lock" size={15} stroke={2.2} />}
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {gearOpen && (
          <>
            <div className="ph-scrim" onClick={() => setGearOpen(false)} aria-hidden="true" />
            <div className="ph-sheet short" role="dialog" aria-modal="true" aria-label="Cài đặt">
              <div className="ph-handle" />
              <div className="ph-shead"><div style={{ flex: 1 }}><b>Cài đặt</b>{room.student && <small>{room.student.name} · lớp {room.classCode}</small>}</div><button className="ph-ib" onClick={() => setGearOpen(false)} aria-label="Đóng"><Icon name="close" size={20} stroke={2.4} /></button></div>
              <div className="ph-list">
                <div className="ph-set"><div><b>Theo giáo viên</b><small>Tự chuyển khi cô mở trang mới</small></div><Switch on={follow} onChange={() => setFollow(!follow)} label="Theo giáo viên" /></div>
                <div className="ph-set"><div><b>Cỡ chữ</b><small>Chữ trong bài to hơn</small></div><div className="seg"><button className={big ? '' : 'on'} onClick={() => setBig(false)}>Vừa</button><button className={big ? 'on' : ''} onClick={() => setBig(true)}>Lớn</button></div></div>
                <div className="ph-set"><div><b>Gợi ý tiếng Việt</b></div><Switch on={vi} onChange={() => setVi(!vi)} label="Gợi ý tiếng Việt" /></div>
                <div className="ph-set"><div><b>Giảm hiệu ứng chuyển động</b></div><Switch on={rm} onChange={() => setRm(!rm)} label="Giảm hiệu ứng chuyển động" /></div>
                {room.role === 'teacher' && <button className="ph-set btnrow" onClick={() => { room.setViewAsStudent(false); setGearOpen(false); }}><Icon name="shield" size={18} />Về giáo viên</button>}
                {!OFFLINE && <button className="ph-set btnrow" onClick={room.logout}><Icon name="logout" size={18} />Đăng xuất{room.student ? ` (${room.student.name})` : ''}</button>}
              </div>
            </div>
          </>
        )}

        {control.paused && (
          <div className="ph-over" role="alertdialog" aria-label="Cả lớp cùng nghe giảng">
            <div className="ph-card"><div className="ph-ring" style={{ background: '#fdf5e4', color: '#946207' }}><Icon name="pause" size={30} /></div><b>Cả lớp cùng nghe giảng</b><span>Giáo viên đang tạm khóa nộp bài. Bài làm dở của bạn vẫn được giữ.</span></div>
          </div>
        )}
        {inviteShown && inv && (
          <div className="ph-over" role="dialog" aria-modal="true" aria-label="Giáo viên mời bạn đến">
            <div className="ph-card">
              <div className="ph-ring"><Icon name="bell" size={30} /></div>
              <span className="tl" style={{ color: '#d63a43' }}>Giáo viên mời bạn đến</span>
              <b>{steps[idxOf(inv.stepKey)]?.name}</b>
              <div style={{ display: 'flex', gap: 8, width: '100%', marginTop: 6 }}>
                <button className="btn btn-soft" style={{ flex: 1 }} onClick={() => dismiss(inv.id)}>Để sau</button>
                <button className="btn btn-red" style={{ flex: 1 }} onClick={() => { dismiss(inv.id); go(idxOf(inv.stepKey)); }}>Đến ngay</button>
              </div>
            </div>
          </div>
        )}
        {room.toast && <div className="ph-toast" role="status"><Icon name="check" size={16} stroke={2.6} />{room.toast}</div>}
      </div>
    );
  }

  return (
    <FitCanvas rootRef={rootRef} dark={tdark} className={`${vi ? '' : 'novi'}${big ? ' big' : ''}${rm ? ' rm' : ''}${tdark ? ' tdark' : ''}`}
      onMouseMove={(e) => {
        if (!present) return;
        const p = point(e);
        if (tool === 'spot') setSpot(p);
        if (drawing) setDrawing({ ...drawing, d: `${drawing.d} L${p.x.toFixed(1)} ${p.y.toFixed(1)}` });
      }}
      onMouseUp={() => {
        setErasing(false);
        if (drawing) { const id = markId.current++; setInk((k) => [...k, { id, step: step.key, kind: drawing.kind, d: drawing.d }]); setDrawing(null); }
      }}>

      {/* ---------------- top bar ---------------- */}
      <header className="topbar" style={{ position: 'absolute', left: 0, top: 0, width: W, height: 64, background: '#fff', borderBottom: '1px solid #ebeae6', display: 'flex', alignItems: 'center', gap: 12, padding: '0 20px', zIndex: 20 }}>
        <img src="/brand/dol-logo.svg" alt="DOL IELTS Đình Lực" style={{ height: 30, width: 'auto', display: 'block' }} />
        <div style={{ width: 1, height: 28, background: '#ebeae6' }} />
        <button className={`stagebtn${mapOpen ? ' on' : ''}`} onClick={() => { setMapOpen(!mapOpen); setGearOpen(false); }} aria-expanded={mapOpen} aria-label="Mở bản đồ bài học">
          <span className="num">{step.stage}</span><span>{step.kind === 'cover' ? 'Mở đầu' : stage?.short}</span><Icon name="down" size={16} stroke={2.4} />
        </button>
        <nav aria-label="Các bước trong chặng" style={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0, overflow: 'hidden', flex: '0 1 auto' }}>
          {(step.kind === 'cover' ? lesson.stages.map((sg) => ({ key: `st${sg.n}`, num: sg.n, label: sg.short, cur: false, done: false, th: false, i: steps.findIndex((s) => s.stage === sg.n) })) :
            stageSteps.map(({ s, i }, k) => ({ key: s.key, num: k + 1, label: s.short || s.name, cur: i === stepIdx, done: myStatus(s.key) === 'done', th: s.kind === 'theory', i }))
          ).map((it, k) => {
            const lk = step.kind !== 'cover' && lockedMark(it.key);
            const first = lk && gate !== null && allIdx(it.key) === gate + 1;
            return (
            <React.Fragment key={it.key}>
              {k > 0 && <span className={`sline${it.i <= stepIdx ? ' on' : ''}${first ? ' gate-after' : ''}`} />}
              <button className={`sdot${it.cur ? ' cur' : it.done ? ' done' : ''}${it.th ? ' th' : ''}${lk ? ' locked' : ''}`} onClick={() => go(it.i)} title={lk ? `${it.label} · chưa mở` : it.label}>
                <span className="n">{it.done && !it.cur ? '✓' : it.num}{lk && <span className="lockb"><Icon name="lock" size={10} stroke={2.6} /></span>}</span>{it.cur && <span className="lbl">{it.label}</span>}
              </button>
            </React.Fragment>
            );
          })}
        </nav>
        <div style={{ flex: 1 }} />
        {!isT && (
          <>
            {room.role === 'teacher' && <span className="gvpill" style={{ background: '#f1ecfd', color: '#5631b8' }}>Đang xem như học sinh</span>}
            {room.role !== 'teacher' && control.teacherStep && hasStep(control.teacherStep) && <button className="gvpill" style={{ border: 0 }} onClick={() => go(idxOf(control.teacherStep))} title="Đi tới bước giáo viên đang mở"><span className="pdot" />GV đang ở: {teacherStepName}</button>}
            <button className="ibtn" onClick={retreat} disabled={stepIdx === 0 && build === 0} aria-label="Lùi"><Icon name="left" stroke={2.4} /></button>
            <button className="ibtn" onClick={advance} disabled={build >= nB - 1 && (stepIdx === steps.length - 1 || blocked(steps[stepIdx + 1].key))} aria-label="Tiếp"><Icon name="right" stroke={2.4} /></button>
            {room.role === 'teacher' && <button className="btn btn-sm btn-soft" onClick={() => room.setViewAsStudent(false)}><Icon name="shield" size={16} />Về giáo viên</button>}
          </>
        )}
        {isT && (
          <>
            {!OFFLINE && control.paused && <span className="gvpill" style={{ background: '#fdf1f1', color: '#b0262e' }}><span className="rdot" />Lớp đang tạm khóa</span>}
            {!OFFLINE && gateStep && <span className="gvpill" style={{ background: '#fdf5e4', color: '#946207' }}><Icon name="lock" size={15} />HS mở tới: {gateStep.short || gateStep.name}</span>}
            <span className="gvpill" style={{ background: '#eef2fb', color: '#3c62b8' }}>{OFFLINE ? 'Bản offline' : `Lớp ${room.classCode || '—'} · ${room.students.length} HS`}</span>
            {!OFFLINE && <button className={`btn btn-sm${board === 'all' ? ' btn-red' : ''}`} onClick={() => { setBoard(board === 'all' ? null : 'all'); setTracker(null); setNotesOpen(false); }}><Icon name="grid" size={16} />Tiến độ lớp</button>}
            {!OFFLINE && <button className="btn btn-sm btn-soft" onClick={() => { room.setViewAsStudent(true); setBoard(null); setTracker(null); setDrawer(null); }}><Icon name="eye" size={16} />Xem như học sinh</button>}
          </>
        )}
        {!isT && <button className={`btn btn-sm${full ? ' btn-red' : ' btn-soft'}`} onClick={() => { setFull(!full); setMapOpen(false); setGearOpen(false); }} title="Toàn màn hình (F)"><Icon name="expand" size={16} />{full ? 'Thoát toàn màn hình' : 'Toàn màn hình'}</button>}
        <button className={`ibtn${gearOpen ? ' on' : ''}`} onClick={() => { setGearOpen(!gearOpen); setMapOpen(false); }} aria-label="Cài đặt" aria-expanded={gearOpen}><Icon name="gear" /></button>
      </header>

      {/* ---------------- lesson map ---------------- */}
      {mapOpen && (
        <div className="pop" style={{ left: 150, top: 72, width: 470, padding: 14, zIndex: 40, maxHeight: 812, overflow: 'auto' }}>
          {steps.filter((s) => s.kind === 'cover').map((s) => <button key={s.key} className={`mrow${s === step ? ' cur' : ''}`} onClick={() => go(steps.indexOf(s))}><span className="num" style={{ background: '#3b3d54' }}>0</span>Mở đầu bài học</button>)}
          {lesson.stages.map((sg) => {
            const list = steps.map((s, i) => ({ s, i })).filter(({ s }) => s.stage === sg.n && s.kind !== 'divider');
            const div = steps.findIndex((s) => s.stage === sg.n);
            return (
              <div key={sg.n} style={{ marginTop: 6, paddingTop: 6, borderTop: '1px solid #efeeea' }}>
                <button className="mrow" onClick={() => go(div)} style={{ padding: '6px 10px' }}><span className="num">{sg.n}</span><span style={{ fontSize: 15, fontWeight: 800, color: '#3b3d54', flex: 1 }}>{sg.name}</span><span style={{ fontSize: 12, fontWeight: 700, color: '#6b6d82' }}>{list.filter(({ s }) => !s.sub).length} màn{list.some(({ s }) => s.sub) ? ' + practice' : ''}</span></button>
                {list.map(({ s, i }, j) => {
                  const st = myStatus(s.key);
                  const last = s.sub && !list[j + 1]?.s.sub;
                  return (
                    <button key={s.key} className={`mrow${i === stepIdx ? ' cur' : ''}${lockedMark(s.key) ? ' locked' : ''}${s.sub ? ' msub' : ''}${last ? ' mlast' : ''}`} onClick={() => go(i)} style={s.sub ? undefined : { paddingLeft: 46 }}>
                      {!s.sub && <span style={{ width: 18, display: 'inline-flex', justifyContent: 'center', fontWeight: 800, color: st ? STATUS_META[st].color : '#b9b8c6' }}>{st ? (st === 'none' ? '○' : STATUS_META[st].icon) : '·'}</span>}
                      {!s.sub && <span className="mcode">{codes[s.key]}</span>}
                      <span className="mname" style={{ flex: 1 }}>{s.name}</span>
                      {s.sub && st && st !== 'none' && <span style={{ fontWeight: 800, color: STATUS_META[st].color }}>{STATUS_META[st].icon}</span>}
                      {lockedMark(s.key) && <span className="maplock"><Icon name="lock" size={12} stroke={2.4} />Chưa mở</span>}
                      {control.teacherStep === s.key && !isT && <span className="tag" style={{ background: '#fdf5e4', color: '#946207' }}>GV đang ở đây</span>}
                      <span className={`kico ${s.kind === 'theory' ? 'th' : 'wr'}`} title={s.kind === 'theory' ? 'Lý thuyết' : 'Có bài tập'} aria-label={s.kind === 'theory' ? 'Lý thuyết' : 'Có bài tập'}>
                        {s.kind === 'theory'
                          ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2z" /><path d="M22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z" /></svg>
                          : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>}
                      </span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}

      {/* ---------------- settings ---------------- */}
      {gearOpen && (
        <div className="pop setpop" style={{ right: 20, top: 72, width: 384, maxHeight: 812, overflow: 'auto', padding: 16, zIndex: 40, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div className="tl" style={{ padding: '0 6px 8px' }}>{isT ? 'Cài đặt giáo viên' : 'Cài đặt học sinh'}</div>
          {!isT && <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 6px' }}><div style={{ flex: 1 }}><div style={{ fontSize: 14.5, fontWeight: 700, color: '#3b3d54' }}>Theo giáo viên</div><div style={{ fontSize: 12.5, color: '#6b6d82' }}>Tự chuyển khi GV mở bước mới</div></div><Switch on={follow} onChange={() => setFollow(!follow)} label="Theo giáo viên" /></div>}
          {isT && room.role === 'teacher' && !OFFLINE && (
            <div style={{ padding: '4px 6px 8px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ fontSize: 14.5, fontWeight: 700, color: '#3b3d54' }} htmlFor="classSel">Lớp đang dạy</label>
              <div style={{ display: 'flex', gap: 6 }}>
                <select id="classSel" value={room.classCode} onChange={(e) => room.selectClass(e.target.value)} style={{ flex: 1, height: 38, borderRadius: 10, border: '1.5px solid #e6e5e1', font: 'inherit', fontSize: 14, fontWeight: 700, padding: '0 10px' }}>
                  {room.classCodes.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <button className="ibtn" style={{ width: 38, height: 38 }} title="Xóa lớp này" aria-label="Xóa lớp này" onClick={() => { if (room.classCode && window.confirm(`Xóa mã lớp ${room.classCode}? Học sinh sẽ không vào lớp này được nữa.`)) void room.deleteClass(room.classCode); }}><Icon name="trash" size={16} /></button>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <input className="inp" style={{ height: 38, fontSize: 14 }} placeholder="Mã lớp mới, VD: DOL-2029" value={newClass} onChange={(e) => setNewClass(e.target.value.toUpperCase())} />
                <button className="btn btn-sm" onClick={async () => { const err = await room.createClass(newClass); setClassMsg(err || `Đã tạo lớp ${newClass}`); if (!err) setNewClass(''); }} disabled={!newClass.trim()}><Icon name="plus" size={15} />Tạo</button>
              </div>
              {classMsg && <span style={{ fontSize: 12.5, color: '#6b6d82' }}>{classMsg}</span>}
            </div>
          )}
          {isT && room.role === 'teacher' && (
            <>
              {canQR && <SetRow title="Mã QR vào lớp" sub="Phím Q · chiếu mã để học sinh quét"><button className="btn btn-sm btn-soft" onClick={() => { setQrOpen(true); setGearOpen(false); }}><Icon name="qr" size={16} />Hiện mã</button></SetRow>}
              <SetRow title="Giao diện" sub="Khung điều khiển của giáo viên"><div className="seg"><button className={theme === 'dark' ? 'on' : ''} onClick={() => setTheme('dark')}><Icon name="moon" size={14} />Tối</button><button className={theme === 'dark' ? '' : 'on'} onClick={() => setTheme('light')}><Icon name="sun" size={14} />Sáng</button></div></SetRow>
              {!OFFLINE && <SetRow title="Tải bản offline (HTML)" sub="Dạy & trình chiếu không cần mạng"><button className="btn btn-sm btn-soft" disabled={offBusy} onClick={async () => { setOffBusy(true); const err = await downloadOffline(lesson.id); setOffBusy(false); room.showToast(err || 'Đã tải bản offline. Mở file .html bằng trình duyệt để dạy không cần mạng.'); }}><Icon name="download" size={16} />{offBusy ? 'Đang tải…' : 'Tải'}</button></SetRow>}
              {OFFLINE && <div className="offnote"><b>Bản offline</b> · chỉ có slide và Present. Bài tập làm thử ngay trên slide nhưng không lưu; không chấm bài, không theo dõi và quản lý lớp.</div>}
              <div style={{ height: 1, background: '#efeeea', margin: '6px 0' }} />
            </>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 6px' }}><div style={{ flex: 1, fontSize: 14.5, fontWeight: 700, color: '#3b3d54' }}>Cỡ chữ<div style={{ fontSize: 12.5, fontWeight: 600, color: '#8b8da1' }}>Chữ trong slide to hơn, slide giữ nguyên</div></div><div className="seg"><button className={big ? '' : 'on'} onClick={() => setBig(false)}>Vừa</button><button className={big ? 'on' : ''} onClick={() => setBig(true)}>Lớn</button></div></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 6px' }}><div style={{ flex: 1, fontSize: 14.5, fontWeight: 700, color: '#3b3d54' }}>Gợi ý tiếng Việt</div><Switch on={vi} onChange={() => setVi(!vi)} label="Gợi ý tiếng Việt" /></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 6px' }}><div style={{ flex: 1, fontSize: 14.5, fontWeight: 700, color: '#3b3d54' }}>Giảm hiệu ứng chuyển động</div><Switch on={rm} onChange={() => setRm(!rm)} label="Giảm hiệu ứng chuyển động" /></div>
          <div style={{ height: 1, background: '#efeeea', margin: '6px 0' }} />
          {room.role === 'teacher' && !OFFLINE && <button className="mrow" onClick={() => { room.setViewAsStudent(!room.viewAsStudent); setGearOpen(false); }}><Icon name={room.viewAsStudent ? 'shield' : 'eye'} size={16} />{room.viewAsStudent ? 'Về giáo viên' : 'Xem như học sinh'}</button>}
          {!OFFLINE && <button className="mrow" onClick={room.logout}><Icon name="logout" size={16} />Đăng xuất{room.student ? ` (${room.student.name})` : ''}</button>}
        </div>
      )}

      {/* ---------------- slide ---------------- */}
      <div style={{ position: 'absolute', left: sl.left, top: sl.top, width: 1280, height: 720, transform: `scale(${sl.scale})`, transformOrigin: '0 0', zIndex: sl.z, transition: 'left .45s cubic-bezier(.2,.8,.2,1), top .45s cubic-bezier(.2,.8,.2,1), transform .45s cubic-bezier(.2,.8,.2,1)' }}>
        <div className="slide" key={step.key}>
          {!isT && gateStep && step.key === gateStep.key && gate !== null && gate < lesson.steps.length - 1 && (myStatus(step.key) || 'none') !== 'none' && (
            <div className="sl-wait" role="status"><span className="sl-waitic"><Icon name="lock" size={18} stroke={2.4} /></span><div><b>Em đã xong phần được mở!</b><small>Thầy cô sẽ mở bước tiếp theo khi cả lớp sẵn sàng. Trong lúc chờ, em có thể xem lại và sửa các bước trước.</small></div></div>
          )}
          {showHead && step.head && !step.head.custom && (
            <div style={{ padding: '24px 34px 0', display: 'flex', alignItems: 'flex-start', gap: 20, flex: 'none' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="enter" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, height: 26, padding: '0 10px 0 3px', borderRadius: 999, background: '#fdf1f1' }}><span className="num" style={{ width: 20, height: 20, fontSize: 11 }}>{step.stage}</span><span style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: '#b0262e' }}>{step.head.chip || stage?.name}</span></span>
                  {step.kind === 'theory' && <span className="tag" style={{ background: '#eef2fb', color: '#3c62b8', fontSize: 11.5 }}>LÝ THUYẾT</span>}
                  {step.kind === 'activity' && <span className="tag" style={{ background: '#fdf1f1', color: '#b0262e', fontSize: 11.5 }}>THỰC HÀNH</span>}
                  {step.head.vi && <span className="vi" style={{ fontSize: 15 }}>{step.head.vi}</span>}
                </div>
                <h1 className="enter d1" style={{ margin: '8px 0 0', fontSize: 34, lineHeight: 1.2, fontWeight: 800, color: '#3b3d54', letterSpacing: '-.01em' }}>{step.head.pre} {step.head.key && <span className="hl">{step.head.key}</span>}</h1>
              </div>
              {step.kind === 'theory' && nB > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#6b6d82' }}>{build + 1}/{nB}</span>
                  {(!isT || present) && <button className="btn btn-sm btn-red" onClick={advance} disabled={build >= nB - 1 && (stepIdx >= steps.length - 1 || blocked(steps[stepIdx + 1].key))}>{build < nB - 1 ? 'Xem tiếp' : 'Sang bước sau'} →</button>}
                </div>
              )}
            </div>
          )}
          {SlideComp ? (
            <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
              <SlideComp step={step} lesson={lesson} build={build} setBuild={setStepBuild} revealed={revealed} view={view} onStart={firstStageStep >= 0 ? () => go(firstStageStep) : undefined} />
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b6d82', fontSize: 18 }}>Bước “{step.key}” chưa có slide trong slides.tsx.</div>
          )}
        </div>
      </div>

      {/* ---------------- teacher chrome ---------------- */}
      {isT && !present && (
        <>
          {/* Offline: no class tools, the slide takes the space; only this bar (‹ step › Notes Present) stays under it. */}
          <div className="tdock" style={{ position: 'absolute', ...(OFFLINE ? { left: 54, top: 840, width: 1331 } : { left: 24, top: 656, width: 998 }), height: 46, display: 'flex', alignItems: 'center', gap: 10, zIndex: 6 }}>
            <button className="ibtn" onClick={retreat} disabled={stepIdx === 0 && build === 0} aria-label="Lùi"><Icon name="left" stroke={2.4} /></button>
            <div className="card" style={{ height: 44, padding: '0 16px', display: 'flex', alignItems: 'center', gap: 8, borderRadius: 14, minWidth: 0 }}>
              <span style={{ fontSize: 15, fontWeight: 800, color: '#d63a43' }}>{stepIdx}/{steps.length - 1}</span>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#3b3d54', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{step.name}</span>
              {nB > 1 && <span className="tag" style={{ background: '#eef2fb', color: '#3c62b8' }}>build {build + 1}/{nB}</span>}
            </div>
            <button className="ibtn" onClick={advance} disabled={build >= nB - 1 && (stepIdx === steps.length - 1 || blocked(steps[stepIdx + 1].key))} aria-label="Tiếp"><Icon name="right" stroke={2.4} /></button>
            <div style={{ flex: 1 }} />
            <button className={`btn btn-sm${notesOpen ? ' btn-red' : ''}`} style={{ height: 44 }} onClick={() => { setNotesOpen(!notesOpen); setBoard(null); setTracker(null); }}><Icon name="notes" size={16} />Notes</button>
            <button className="btn btn-red" style={{ height: 44 }} onClick={() => { setPresent(true); setNotesOpen(false); setBoard(null); setTracker(null); setDrawer(null); setTool('none'); }}><Icon name="play" size={15} />Present</button>
          </div>
          {!OFFLINE && <div className="tdock" style={{ position: 'absolute', left: 24, top: 712, width: 998, zIndex: 6 }}>
            <div className="tl" style={{ marginBottom: 6 }}>Các bước của bài · chạm để mở trên màn chiếu</div>
            <div ref={filmRef} style={{ display: 'grid', gridAutoFlow: 'column', gridTemplateRows: 'repeat(2, 62px)', gridAutoColumns: 128, gap: 7, overflowX: 'auto', padding: '2px 2px 8px' }}>
              {steps.map((s, j) => {
                const subs = s.tracking ? room.students.filter((st) => pageStatus(room.index, s, st.id) !== 'none').length : 0;
                const sub = s.kind === 'activity' ? (s.tracking ? `${subs}/${room.students.length} nộp` : 'Không nộp bài') : s.kind === 'theory' ? `Lý thuyết · ${s.builds || 1}` : s.kind === 'divider' ? 'Mở chặng' : 'Bìa';
                return (
                  <button key={s.key} className={`film${j === stepIdx ? ' cur' : ''}${s.kind === 'divider' && j !== stepIdx ? ' dv' : ''}`} onClick={() => go(j)} title={s.name}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, width: '100%', minWidth: 0 }}><span className="num" style={{ width: 19, height: 19, fontSize: 10, background: j === stepIdx ? '#d63a43' : '#8b8da1' }}>{j}</span><span style={{ fontSize: 11.5, fontWeight: 800, color: '#3b3d54', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</span></span>
                    <span style={{ fontSize: 10.5, fontWeight: 700, color: s.kind === 'theory' ? '#3c62b8' : s.kind === 'divider' ? '#b0262e' : '#6b6d82', whiteSpace: 'nowrap' }}>{sub}</span>
                  </button>
                );
              })}
            </div>
          </div>}
          {!OFFLINE && <TeacherPanel step={step} stepIndex={stepIdx} build={build} builds={nB} pollPart={pollPart} setPollPart={setPollPart}
            tools={{
              boardStageOn: board === 'stage',
              mirrorOn: tracker?.key === step.key,
              onToggleStageBoard: () => { setBoard(board === 'stage' ? null : 'stage'); setTracker(null); setNotesOpen(false); },
              onPickName: pickName,
              onMirror: () => { if (tracker?.key === step.key) setTracker(null); else { setTracker({ key: step.key, from: null }); setBoard(null); setNotesOpen(false); } },
              onOpenStudent: openStudent,
            }} />}
          {board === 'all' && <ClassProgress onClose={() => setBoard(null)} onOpenStudent={(id, key) => openStudent(id, key)} />}
          {board === 'stage' && <ProgressBoard mode={board} stage={step.stage || 1} currentKey={step.key} onClose={() => setBoard(null)}
            onOpenPage={(key) => { setTracker({ key, from: board }); setBoard(null); }} onOpenStudent={(id) => openStudent(id, null)} />}
          {tracker && <PageTracker stepKey={tracker.key} onClose={() => setTracker(null)} onBack={() => { setBoard(tracker.from || 'all'); setTracker(null); }} onOpenStudent={(id, key) => openStudent(id, key)} />}
          {notesOpen && (
            <div className="pop" style={{ left: OFFLINE ? 785 : 300, bottom: OFFLINE ? 72 : 252, width: 600, zIndex: 35, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><span style={{ fontSize: 18, fontWeight: 800, color: '#3b3d54', flex: 1 }}>Notes · {step.name}</span><span className="tag" style={{ background: '#f7f7f5', color: '#6b6d82' }}>phím N</span><button className="ibtn" onClick={() => setNotesOpen(false)} aria-label="Đóng notes"><Icon name="close" stroke={2.4} /></button></div>
              {notes.length === 0 && <div style={{ fontSize: 15, color: '#6b6d82' }}>Bước này chưa có ghi chú. Thêm `notes` cho bước trong meta.ts.</div>}
              {notes.map((n) => <div key={n.title}><div className="tl" style={{ color: '#d63a43', marginBottom: 3 }}>{n.title}</div><div style={{ fontSize: 15, lineHeight: 1.55, color: '#3b3d54' }}>{n.text}</div></div>)}
            </div>
          )}
          {picker && (
            <div className="pop" style={{ left: 313, top: 190, width: 420, zIndex: 36, padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, animation: 'zoomIn .3s both' }}>
              <div className="tl">Gọi tên ngẫu nhiên</div>
              <div style={{ height: 80, width: '100%', overflow: 'hidden', borderRadius: 16, background: '#fdf6f6', position: 'relative' }}>
                {picker.rolling ? (
                  <div className="roller" style={{ display: 'flex', flexDirection: 'column' }}>{Array.from({ length: 8 }, (_, i) => room.students[(i * 3) % room.students.length]).map((s, i) => <div key={i} style={{ height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800, color: '#b0262e', opacity: 0.5 }}>{s?.name}</div>)}</div>
                ) : <div style={{ height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34, fontWeight: 800, color: '#d63a43', animation: 'pop .45s both' }}>{picker.name}</div>}
              </div>
              <div style={{ display: 'flex', gap: 10 }}><button className="btn btn-sm btn-soft" onClick={pickName}>Gọi lại</button><button className="btn btn-sm" onClick={() => setPicker(null)}>Đóng</button></div>
            </div>
          )}
          {drawer && <SubmissionDrawer studentId={drawer.id} stepKey={drawer.key} scope={drawer.scope} stage={step.stage || 1} onScope={(scope) => setDrawer({ ...drawer, scope })} onClose={() => setDrawer(null)} />}
        </>
      )}

      {/* ---------------- present ---------------- */}
      {present && (
        <>
          <div style={{ position: 'absolute', inset: 0, background: '#17181f', zIndex: 44, animation: 'fadeIn .35s both' }} />
          <div style={{ position: 'absolute', left: 0, top: 0, width: W, height: 45, zIndex: 48, display: 'flex', alignItems: 'center', gap: 8, padding: '0 14px', color: '#fff' }}>
            <span style={{ fontSize: 14, fontWeight: 700, flex: 1, minWidth: 0, opacity: 0.85, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{stepIdx}/{steps.length - 1} · {step.name}{!isT && room.student ? ` · ${room.student.name}` : ''}</span>
            <button className="ibtn" style={{ width: 34, height: 34, background: '#2a2b36', borderColor: '#3a3b48', color: '#fff' }} onClick={retreat} aria-label="Lùi"><Icon name="left" size={16} stroke={2.4} /></button>
            <button className="ibtn" style={{ width: 34, height: 34, background: '#2a2b36', borderColor: '#3a3b48', color: '#fff' }} onClick={advance} disabled={!isT && build >= nB - 1 && (stepIdx >= steps.length - 1 || blocked(steps[stepIdx + 1].key))} aria-label="Tiếp"><Icon name="right" size={16} stroke={2.4} /></button>
            <div className="seg fs-seg" role="group" aria-label="Cỡ chữ"><button className={big ? '' : 'on'} onClick={() => setBig(false)}>Chữ vừa</button><button className={big ? 'on' : ''} onClick={() => setBig(true)}>Chữ lớn</button></div>
            {isT && <>
            <div className="ptools" role="toolbar" aria-label="Công cụ trình chiếu">
              {PRESENT_TOOLS.map((t) => (
                <React.Fragment key={t.id}>
                  <button className={tool === t.id ? 'on' : ''} title={`${t.label} (${t.key})`} aria-pressed={tool === t.id} onClick={() => setTool(tool === t.id ? 'none' : t.id)}><Icon name={t.icon} size={16} />{t.label}</button>
                  {t.id === 'text' && tool === 'text' && (
                    <span className="psize" role="group" aria-label="Cỡ chữ ghi chú">
                      <button aria-label="Chữ nhỏ hơn" title="Nhỏ hơn ( [ )" disabled={textSize <= TEXT_SIZES[0]} onMouseDown={(e) => e.preventDefault()} onClick={() => bumpSize(-1)}>A−</button>
                      <b>{textSize}</b>
                      <button aria-label="Chữ to hơn" title="To hơn ( ] )" disabled={textSize >= TEXT_SIZES[TEXT_SIZES.length - 1]} onMouseDown={(e) => e.preventDefault()} onClick={() => bumpSize(1)}>A+</button>
                    </span>
                  )}
                </React.Fragment>
              ))}
              <span className="psep" />
              <button title="Xóa hết ghi chú trên slide này" onClick={() => { setInk((k) => k.filter((x) => x.step !== step.key)); setEditing(null); }}><Icon name="trash" size={15} />Xóa hết</button>
            </div>
            </>}
            <button className="btn btn-sm btn-red" style={{ height: 34 }} onClick={() => { setPresent(false); setTool('none'); }}>Thoát (Esc)</button>
          </div>
          {tool === 'spot' && <div style={{ position: 'absolute', left: 0, top: 45, width: W, height: 810, zIndex: 46, pointerEvents: 'none', background: `radial-gradient(circle 170px at ${spot.x}px ${spot.y}px, transparent 0, transparent 165px, rgba(10,10,16,.72) 172px)` }} />}
          <svg className={`pink t-${tool}`} style={{ position: 'absolute', left: 0, top: 45, zIndex: 47, pointerEvents: tool === 'pen' || tool === 'hl' || tool === 'text' || tool === 'erase' ? 'auto' : 'none' }} width={W} height={810} viewBox={`0 0 ${W} 810`} aria-hidden="true"
            onMouseDown={(e) => {
              const p = point(e);
              if (tool === 'pen' || tool === 'hl') setDrawing({ kind: tool, d: `M${p.x.toFixed(1)} ${p.y.toFixed(1)}` });
              else if (tool === 'erase') setErasing(true);
              else if (tool === 'text') {
                e.preventDefault();
                if (editing) commitText(editing, step.key);
                setEditing({ id: markId.current++, x: p.x, y: p.y - textSize * 0.9, text: '', size: textSize });
              }
            }}>
            {[...ink.filter((m) => m.step === step.key && m.kind !== 'text'), ...(drawing ? [{ id: 0, step: step.key, ...drawing }] : [])].map((m) => m.kind === 'text' ? null : (
              <g key={m.id}>
                <path d={m.d} fill="none" stroke={m.kind === 'hl' ? '#ffe14d' : '#e9505a'} strokeOpacity={m.kind === 'hl' ? 0.45 : 1} strokeWidth={m.kind === 'hl' ? 26 : 5} strokeLinecap="round" strokeLinejoin="round" style={m.kind === 'hl' ? { mixBlendMode: 'multiply' } : undefined} />
                {tool === 'erase' && m.id > 0 && <path d={m.d} fill="none" stroke="transparent" strokeWidth={m.kind === 'hl' ? 30 : 22} strokeLinecap="round" strokeLinejoin="round" pointerEvents="stroke"
                  onMouseDown={(e) => { e.stopPropagation(); setErasing(true); eraseMark(m.id); }} onMouseEnter={(e) => { if (erasing && e.buttons & 1) eraseMark(m.id); }} />}
              </g>
            ))}
          </svg>
          <div style={{ position: 'absolute', left: 0, top: 45, width: W, height: 810, zIndex: 48, pointerEvents: 'none' }}>
            {ink.filter((m): m is TextMark => m.step === step.key && m.kind === 'text' && m.id !== editing?.id).map((m) => (
              <div key={m.id} className={`ptext${tool === 'text' || tool === 'erase' ? ' live' : ''}${tool === 'text' ? ' edit' : ''}${tool === 'erase' ? ' del' : ''}`} style={{ left: m.x, top: m.y, fontSize: m.size }}
                onMouseDown={(e) => {
                  if (tool === 'erase') { e.preventDefault(); setErasing(true); eraseMark(m.id); }
                  else if (tool === 'text') { e.preventDefault(); if (editing) commitText(editing, step.key); setEditing({ id: m.id, x: m.x, y: m.y, text: m.text, size: m.size }); setTextSize(m.size); }
                }}
                onMouseEnter={(e) => { if (tool === 'erase' && erasing && e.buttons & 1) eraseMark(m.id); }}>{m.text}</div>
            ))}
            {editing && (
              <input className="ptext ptext-in" autoFocus value={editing.text} placeholder="Gõ chữ…" aria-label="Gõ chữ lên slide"
                style={{ left: editing.x, top: editing.y, fontSize: editing.size, width: `${Math.max(4, editing.text.length + 1.5)}ch` }}
                onChange={(e) => setEditing({ ...editing, text: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === 'Escape') { e.preventDefault(); commitText(editing, step.key); }
                  else if ((e.ctrlKey || e.metaKey) && (e.key === '=' || e.key === '+' || e.key === '-')) { e.preventDefault(); bumpSize(e.key === '-' ? -1 : 1); }
                }}
                onBlur={() => commitText(editing, step.key)} />
            )}
          </div>
        </>
      )}

      {/* ---------------- student overlays ---------------- */}
      {!isT && control.paused && (
        <div style={{ position: 'absolute', inset: '64px 0 0 0', zIndex: 60, background: 'rgba(40,42,60,.28)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn .3s both' }}>
          <div style={{ width: 520, background: '#fff', borderRadius: 26, padding: '34px 32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, boxShadow: '0 30px 80px -30px rgba(40,42,60,.5)', animation: 'zoomIn .35s both' }}>
            <div style={{ width: 76, height: 76, borderRadius: '50%', background: '#fdf5e4', color: '#946207', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'ring 1.6s infinite' }}><Icon name="pause" size={34} /></div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#3b3d54' }}>Cả lớp cùng nghe giảng</div>
            <div style={{ fontSize: 16, color: '#4b4d63', lineHeight: 1.5 }}>Giáo viên đang tạm khóa nộp bài. Bài làm dở của bạn vẫn được giữ.<span className="vi" style={{ display: 'block', fontSize: 14.5, marginTop: 4 }}>Please listen to your teacher. Your draft is saved.</span></div>
          </div>
        </div>
      )}
      {inviteShown && inv && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 70, background: 'rgba(40,42,60,.32)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn .3s both' }}>
          <div role="dialog" aria-modal="true" aria-label="Giáo viên mời bạn đến" style={{ width: 480, background: '#fff', borderRadius: 26, padding: '34px 32px 28px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, textAlign: 'center', boxShadow: '0 30px 80px -30px rgba(40,42,60,.5)', animation: 'zoomIn .35s both' }}>
            <div style={{ width: 76, height: 76, borderRadius: '50%', background: '#fdf1f1', color: '#d63a43', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'ring 1.6s infinite' }}><Icon name="bell" size={34} /></div>
            <div className="tl" style={{ color: '#d63a43' }}>Giáo viên mời bạn đến</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#3b3d54', lineHeight: 1.2 }}>{steps[idxOf(inv.stepKey)]?.name}</div>
            <div className="vi" style={{ fontSize: 15.5 }}>Thầy cô muốn cả lớp cùng mở hoạt động này.</div>
            <div style={{ display: 'flex', gap: 10, marginTop: 10, width: '100%' }}>
              <button className="btn btn-soft" style={{ flex: 1 }} onClick={() => dismiss(inv.id)}>Để sau</button>
              <button className="btn btn-red" style={{ flex: 1 }} onClick={() => { dismiss(inv.id); go(idxOf(inv.stepKey)); }}>Đến ngay</button>
            </div>
          </div>
        </div>
      )}

      {qrOpen && isT && <ClassQR onClose={() => setQrOpen(false)} />}

      {room.toast && (
        <div style={{ position: 'absolute', left: '50%', top: 76, zIndex: 90, background: '#3b3d54', color: '#fff', borderRadius: 14, padding: '12px 18px', fontSize: 14.5, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10, animation: 'toastIn .3s both', transform: 'translateX(-50%)', boxShadow: '0 18px 40px -18px rgba(40,42,60,.6)' }}>
          <Icon name="check" size={16} stroke={2.6} />{room.toast}
        </div>
      )}
    </FitCanvas>
  );
};


type Tool = 'none' | 'spot' | 'pen' | 'hl' | 'text' | 'erase';
type TextMark = { id: number; step: string; kind: 'text'; x: number; y: number; text: string; size: number };
const TEXT_SIZES = [20, 26, 34, 44, 56, 72];
type Mark = { id: number; step: string; kind: 'pen' | 'hl'; d: string } | TextMark;
const PRESENT_TOOLS: { id: Exclude<Tool, 'none'>; label: string; key: string; icon: string }[] = [
  { id: 'spot', label: 'Spotlight', key: 'S', icon: 'spot' },
  { id: 'pen', label: 'Bút', key: 'P', icon: 'pen' },
  { id: 'hl', label: 'Dạ quang', key: 'H', icon: 'hl' },
  { id: 'text', label: 'Chữ', key: 'T', icon: 'text' },
  { id: 'erase', label: 'Tẩy', key: 'E', icon: 'eraser' },
];
