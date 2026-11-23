/* Writing 6.0 · Lesson 2 · runtime shared by the screens (same pattern as Lesson 1):
   - Frame: slide body + footer (page code, build dots, hint, Quay lại / Xem tiếp · Sang bước sau, or the submit bar);
   - Parts: one page made of several parts, each with its own title;
   - build = shell build (← →, ‹ ›, teacher sync); "Mở đáp án" = props.revealed;
   - auto-graded activities and AI writing record attempts with the kit's useActivity (teacher board, gương thần, hồ sơ bài làm);
   - AI writing calls /api/grade with the rubrics in ./rubrics.ts; feedback = 3 criteria per item, never the word "AI". */
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { SlideProps } from '../../kit/slides';
import { useActivity } from '../../kit/activities/useActivity';
import { useClassroom } from '../../kit/ClassroomProvider';
import type { GradeCriteria, GradeItem } from '../../kit/types';
import { RUBRIC_OF } from './meta';
import { CONFETTI, CRITERIA4, type CritId, type Seg } from './logic';

/* ---- text with marks ---------------------------------------------------------------- */
export const Segs: React.FC<{ segs: Seg[]; className?: string }> = ({ segs, className }) => (
  <span className={className}>
    {segs.map(([t, m], i) => (m ? <span key={i} className={`w6-m w6-m-${m}`}>{t}</span> : <React.Fragment key={i}>{t}</React.Fragment>))}
  </span>
);

/* ---- confetti on Đạt ---------------------------------------------------------------- */
export function useBurst(): [React.ReactNode, () => void] {
  const [n, setN] = useState(0);
  const t = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [on, setOn] = useState(false);
  const fire = () => { setN((x) => x + 1); setOn(true); clearTimeout(t.current); t.current = setTimeout(() => setOn(false), 1500); };
  const node = on ? (
    <div key={n} className="w6-conf" aria-hidden="true">
      {CONFETTI.map((c, i) => <span key={i} className={c.cls} style={{ left: c.left, background: c.color, animationDelay: c.delay }} />)}
    </div>
  ) : null;
  return [node, fire];
}

/* ---- one page made of several parts (each part keeps its own title and builds) --------------- */
const SegCtx = createContext<{ build: number; builds: number } | null>(null);
export interface Part { C: React.FC<SlideProps>; n: number; kind: 'theory' | 'activity'; pre: string; key: string; vi: string }
export const PartHead: React.FC<{ props: SlideProps; part: Part; idx: number; total: number }> = ({ props, part, idx, total }) => {
  const room = useClassroom();
  const stage = room.lesson.stages.find((s) => s.n === props.step.stage);
  return (
    <div className="w6h" key={idx}>
      <div className="w6h-row enter">
        <span className="w6h-chip"><span className="num">{props.step.stage}</span>{props.step.head?.chip || stage?.name}</span>
        <span className={`tag w6h-tag ${part.kind}`}>{part.kind === 'theory' ? 'LÝ THUYẾT' : 'THỰC HÀNH'}</span>
        <span className="w6h-part">{props.step.name} · phần {idx + 1}/{total}</span>
        {part.vi && <span className="vi w6h-vi">{part.vi}</span>}
      </div>
      <h1 className="w6h-h1 enter d1">{part.pre} <span className="hl">{part.key}</span></h1>
    </div>
  );
};
export const Parts: React.FC<{ props: SlideProps; parts: Part[] }> = ({ props, parts }) => {
  let start = 0, i = 0;
  for (; i < parts.length - 1; i++) { if (props.build < start + parts[i].n) break; start += parts[i].n; }
  const part = parts[i];
  const local = Math.min(part.n - 1, Math.max(0, props.build - start));
  const C = part.C;
  return (
    <SegCtx.Provider value={{ build: props.build, builds: props.step.builds || 1 }}>
      <PartHead props={props} part={part} idx={i} total={parts.length} />
      <C key={i} {...props} build={local} step={{ ...props.step, builds: part.n }} />
    </SegCtx.Provider>
  );
};

/* ---- footer navigation: the shell listens to ← → on window ---------------------------- */
const press = (key: 'ArrowLeft' | 'ArrowRight') => window.dispatchEvent(new KeyboardEvent('keydown', { key }));

export const Frame: React.FC<{ props: SlideProps; children: React.ReactNode; bar?: React.ReactNode; fx?: React.ReactNode; className?: string }> = ({ props, children, bar, fx, className = '' }) => {
  const room = useClassroom();
  const seg = useContext(SegCtx);
  const { step } = props;
  const build = seg ? seg.build : props.build;
  const n = Math.max(1, seg ? seg.builds : step.builds || 1);
  const code = room.codes?.[step.key];
  const last = build >= n - 1;
  const end = last && room.lesson.steps[room.lesson.steps.length - 1]?.key === step.key;
  return (
    <div className={`w6 w6-s-${step.key} ${className}`} data-w6={step.key}>
      <div className="w6-main">{children}{fx}</div>
      <div className="w6-foot">
        <span className="w6-code">{code ? `Trang ${code}` : ''}</span>
        {n > 1 && <span className="w6-dots" aria-label={`Phần ${build + 1}/${n}`}>{Array.from({ length: n }, (_, i) => <i key={i} className={i === build ? 'cur' : i < build ? 'done' : ''} />)}</span>}
        {bar ? <div className="w6-bar">{bar}</div> : <span className="w6-hint">{!last ? 'Bấm Xem tiếp (hoặc ›) để mở từng phần' : ''}</span>}
        <span className="w6-nav">
          <button className="btn btn-ghost btn-sm" onClick={() => press('ArrowLeft')}>‹ Quay lại</button>
          {!end && <button className={`btn btn-sm ${bar ? 'btn-soft' : 'btn-red'}`} onClick={() => press('ArrowRight')}>{last ? 'Sang bước sau ›' : 'Xem tiếp ›'}</button>}
          {end && <span className="w6-cap">Hết bài</span>}
        </span>
      </div>
    </div>
  );
};

/* ---- submit bar (one primary action + status, symbols not colour only) ----------------- */
type Act = ReturnType<typeof useActivity>;
export const SubmitBar: React.FC<{ act: Act; ready: boolean; hint: string; label: string; onSubmit: () => void; doneText?: string; extra?: React.ReactNode }> = ({ act, ready, hint, label, onSubmit, doneText, extra }) => {
  const l = act.latest;
  let status: { t: string; c: string } | null = null;
  if (l?.ai?.fallback) status = { t: '? Đã gửi. GV sẽ xem bài này.', c: 'info' };
  else if (l && doneText) status = { t: `✓ ${doneText}`, c: 'ok' };
  else if (l?.isCorrect) status = { t: `✓ Đạt · ${l.scoreDisplay}`, c: 'ok' };
  else if (l && act.locked) status = { t: `! ${l.scoreDisplay} · hết lượt. Xem đáp án khi GV mở.`, c: 'try' };
  else if (l) status = { t: `! ${l.scoreDisplay} · còn ${act.attemptsLeft} lượt. Sửa chỗ có dấu ! rồi nộp lại.`, c: 'try' };
  return (
    <div className="w6-sbar">
      {!act.locked && !(l && doneText) && <button className="btn btn-red" disabled={!ready || act.busy || act.paused} onClick={onSubmit}>{act.busy ? 'Đang chấm…' : label}</button>}
      {extra}
      {status && <span className={`fb ${status.c} w6-stat`}>{status.t}</span>}
      {!status && !act.locked && <span className="w6-cap">{act.paused ? 'GV đang tạm khoá nộp bài.' : ready ? `Lượt ${act.max - act.attemptsLeft + 1}/${act.max}` : hint}</span>}
      {act.error && <span className="fb try w6-stat">! {act.error}</span>}
      {act.submission?.review?.comment && <span className="fb info w6-stat"><b>GV:</b> {act.submission.review.comment}</span>}
      {act.demo && <span className="tag w6-demotag">Xem thử · không lưu</span>}
    </div>
  );
};

/* ---- tap a slot → pick one chip (hedging, improve a paragraph, linking words) ---------------- */
export type SlotState = '' | 'ok' | 'try' | 'key';
export const Slot: React.FC<{
  value?: string; empty?: string; options: string[]; open: boolean; onOpen: () => void; onPick: (o: string) => void;
  state?: SlotState; disabled?: boolean; label: string; wide?: boolean;
}> = ({ value, empty = '', options, open, onOpen, onPick, state = '', disabled, label, wide }) => (
  <span className={`w6sl${open ? ' open' : ''}${value ? ' has' : ''}${state ? ` ${state}` : ''}${wide ? ' wide' : ''}`}>
    <button className="w6sl-btn" onClick={onOpen} disabled={disabled} aria-label={label} aria-expanded={open}>
      {value || empty || <span className="w6sl-ph">chọn</span>}
      {state === 'ok' && <span className="w6sl-sym" aria-label="đúng">✓</span>}
      {state === 'try' && <span className="w6sl-sym" aria-label="chưa đúng">!</span>}
    </button>
    {open && (
      <span className="w6sl-menu" role="menu">
        {options.map((o) => <button key={o} role="menuitem" className={o === value ? 'on' : ''} onClick={() => onPick(o)}>{o}</button>)}
      </span>
    )}
  </span>
);
/** one open slot at a time; a tap outside closes it */
export function useOpenSlot(): [string | null, (id: string | null) => void] {
  const [open, setOpen] = useState<string | null>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => { if (!(e.target as HTMLElement).closest?.('.w6sl')) setOpen(null); };
    window.addEventListener('mousedown', close);
    return () => window.removeEventListener('mousedown', close);
  }, [open]);
  return [open, setOpen];
}

/* ---- AI writing: grade a set of items in one submission ------------------------------------ */
export interface AiItem { id: string; label: string; prompt: string; context: string; answer: string; models: string[]; check: string }
export function useAiSet(props: SlideProps, items: AiItem[], burst: () => void) {
  const key = props.step.key;
  const act = useActivity(key, 'all');
  const latest = act.latest;
  const graded = !!latest && !latest.ai?.fallback;
  const crit = (latest?.answer?.crit || {}) as Record<string, GradeCriteria>;
  const byLine = new Map((latest?.lines || []).map((l) => [l.id, l]));
  const firstBad = items.findIndex((it) => it.check);
  const showModels = props.revealed || act.locked;
  const send = async () => {
    const gi: GradeItem[] = items.map((it) => ({ id: it.id, prompt: it.prompt, context: it.context, answer: it.answer, models: it.models }));
    const answer: Record<string, unknown> = Object.fromEntries(items.map((it) => [it.id, it.answer]));
    const models = items.map((it) => ({ id: it.id, label: it.label, value: it.models.join(' / '), correct: true }));
    const res = await act.grade(RUBRIC_OF[key], gi);
    if (!res) {
      await act.submit({ answer, lines: items.map((it) => ({ id: it.id, label: it.label, value: it.answer || '—' })), isCorrect: false, score: null, maxScore: 5, scoreDisplay: 'Cần GV xem', ai: { score: 0, maxScore: 5, ideas: 'Bài đã gửi. GV sẽ chấm.', fallback: true }, models });
      return;
    }
    const by = new Map(res.items.map((r) => [r.id, r]));
    const pass = res.score >= (props.step.tracking?.passScore || 4);
    const a = await act.submit({
      answer: { ...answer, crit: Object.fromEntries(res.items.map((r) => [r.id, r.criteria])) },
      lines: items.map((it) => ({ id: it.id, label: it.label, value: it.answer, correct: !!by.get(it.id)?.isCorrect, feedback: by.get(it.id)?.feedback, suggestion: by.get(it.id)?.suggestion })),
      isCorrect: pass, score: res.score, maxScore: 5, scoreDisplay: `${res.score}/5`,
      ai: { score: res.score, maxScore: 5, ideas: res.ideas, grammar: res.grammar, vocabulary: res.vocabulary },
      models,
    });
    if (a && pass) burst();
  };
  const bar = <SubmitBar act={act} ready={firstBad < 0} hint={firstBad >= 0 ? `Câu ${firstBad + 1}: ${items[firstBad].check}` : ''} label={latest ? 'Nộp lại' : 'Nộp bài'} onSubmit={send} />;
  return { act, graded, crit, byLine, showModels, bar };
}

/** feedback of one item: Đạt / Chưa đạt is in the card head; here the 3 rows in the order of the steps learnt, + câu gợi ý */
export type CritOrder = [keyof GradeCriteria, string][];
export const CRIT_ORDER: CritOrder = [['meaning', 'Ý nghĩa'], ['vocabulary', 'Từ vựng'], ['grammar', 'Ngữ pháp']];
export const FbRows: React.FC<{ c?: GradeCriteria; ok?: boolean; suggestion?: string; feedback?: string; order?: CritOrder }> = ({ c, ok, suggestion, feedback, order = CRIT_ORDER }) => (
  <div className="w6p-fb">
    {c ? order.map(([k, name]) => (
      <div key={k} className={`w6p-row ${c[k].ok ? 'ok' : 'try'}`}>
        <span className="w6-sym">{c[k].ok ? '✓' : '!'}</span>
        <div><b>{name}</b> · {c[k].note}
          {!c[k].ok && c[k].wrong && <div className="w6-fix"><s>{c[k].wrong}</s> → <b>{c[k].fix || '…'}</b></div>}</div>
      </div>
    )) : feedback && <p className="w6-cap">{feedback}</p>}
    {!ok && suggestion && <div className="w6-sugg"><b>Câu gợi ý:</b> {suggestion}</div>}
  </div>
);
export const Verdict: React.FC<{ ok?: boolean }> = ({ ok }) => <span className={`w6-vd ${ok ? 'ok' : 'try'}`}>{ok ? '✓ Đạt' : '! Chưa đạt'}</span>;

/* ---- the 4 criteria tree (same shape on every page: 1.1, 1.2, 3.1, 5.1) ---------------------- */
/** done = learnt (✓, green line) · cur = today's focus (red) · ask = today's focus not named yet (skill shows “?”) */
export const CritTree: React.FC<{ done?: CritId[]; cur?: CritId[]; ask?: boolean }> = ({ done = [], cur = [], ask }) => (
  <div className="w6ct">
    <div className="w6ct-root" aria-hidden="true">
      <svg viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="54" className="w6ct-rc" /><circle cx="60" cy="60" r="54" className="w6ct-ring" />
        <path d="M38 28h34l12 12v52H38z" className="w6ct-doc" />
        {[46, 58, 70, 82].map((y, i) => <path key={y} d={`M46 ${y}h${i === 3 ? 18 : 30}`} className="w6ct-tx" style={{ animationDelay: `${0.2 + i * 0.2}s` }} />)}
        <path d="M78 84l16-26 6 4-16 26-8 3z" className="w6ct-pen" />
      </svg>
      <span>IELTS Writing</span>
    </div>
    <svg className="w6ct-br" viewBox="0 0 100 400" preserveAspectRatio="none" aria-hidden="true">
      {CRITERIA4.map((c, i) => {
        const y = 50 + i * 100;
        const st = cur.includes(c.id) ? 'cur' : done.includes(c.id) ? 'done' : '';
        return <path key={c.id} d={`M0 200 C50 200 50 ${y} 100 ${y}`} className={`w6ct-line ${st}`} />;
      })}
    </svg>
    <div className="w6ct-rows">
      {CRITERIA4.map((c, i) => {
        const st = cur.includes(c.id) ? 'cur' : done.includes(c.id) ? 'done' : 'off';
        return (
          <div key={c.id} className={`w6ct-row ${st}`} style={{ ['--i' as string]: i }}>
            <span className="w6ct-name">{st === 'done' && <span className="w6ct-ok" aria-label="đã học">✓</span>}{c.name}</span>
            <span className="w6ct-skill">{st === 'off' ? '' : st === 'cur' && ask ? <b className="w6ct-ask">?</b> : c.skill}</span>
          </div>
        );
      })}
    </div>
  </div>
);

/** Reveal state of part i at build b: hidden before, outlined while it is being talked about, dimmed after. */
export const rv = (b: number, i: number) => (b < i ? 'w6-hide' : b === i ? 'w6-on' : 'w6-past');

/** Keeps a value stable across renders (for data built once per slide). */
export const useOnce = <T,>(f: () => T) => useMemo(f, []); // eslint-disable-line react-hooks/exhaustive-deps
