/* Stage 4 · Connect sentences without linking words
   4.1 Mindset A → B, B → C · 4.2 This + verb pattern · 4.3 Effects (verb patterns)
   4.3a / 4.3b This + verb pattern, typed (auto) · 4.3c write This + V (AI)
   4.4 Structures · 4.4a Common mistake: thereby V-ing · 4.4b write with structures (AI) · 4.5 / 4.6 write a paragraph (AI) */
import React, { useEffect, useState } from 'react';
import type { SlideProps } from '../../../kit/slides';
import { useActivity, useDraft } from '../../../kit/activities/useActivity';
import { precheck } from '../checks';
import {
  EFFECT_TOP, LIMITED_PARA, THIS_AIDS, joinThis, type Chip, PARA_WRITE, STRUCTS, STRUCT_A, STRUCT_WRITE, THEREBY, THIS_DEMO, THIS_WRITE, TYPE_NEG, TYPE_POS, VGROUPS,
  gapOk, type TypeSet, type VGroup,
} from '../logic';
import { EFFECT_ICON } from './Viz';
import { FbRows, Frame, GradedList, Parts, Segs, SubmitBar, Verdict, useAiSet, useBurst, type Part } from '../runtime';

/* ---- circles chain (4.1, 4.4) -------------------------------------------------------------- */
type Node = string;
const Dot: React.FC<{ n: Node; cls?: string; delay?: number }> = ({ n, cls = '', delay = 0 }) => (
  <span className={`w6ch-dot c-${n.toLowerCase()} ${cls}`} style={{ animationDelay: `${delay}s` }}>{n}</span>
);
const Arr: React.FC<{ delay?: number }> = ({ delay = 0 }) => <span className="w6ch-arr" style={{ animationDelay: `${delay}s` }}>→</span>;
const Stop = () => <span className="w6ch-stop">.</span>;

/* 4.1 — Build 1: A → B. C → D (the second sentence starts somewhere else) · Build 2: A → B. B → C, the repeated B becomes "this" */
export const SMindset: React.FC<SlideProps> = (props) => {
  const b = props.build;
  return (
    <Frame props={props}>
      <div className="w6ch">
        <div className={`w6ch-row ${b === 0 ? 'cur' : 'w6-past'}`}>
          <Dot n="A" /><Arr delay={0.2} /><Dot n="B" delay={0.3} /><Stop />
          <span className="w6ch-gap"><span className="w6ch-lw">As a result,</span><span className="w6ch-x">✗</span></span>
          <Dot n="C" delay={0.6} /><Arr delay={0.8} /><Dot n="D" delay={0.9} />
          <span className="w6ch-note bad">không liên quan</span>
        </div>
        {b >= 1 && (
          <div className="w6ch-row cur enter">
            <Dot n="A" /><Arr delay={0.2} /><Dot n="B" cls="hook" delay={0.3} /><Stop />
            <span className="w6ch-pair">
              <Dot n="B" cls="again" delay={0.6} />
              <span className="w6ch-this">this</span>
            </span>
            <Arr delay={0.9} /><Dot n="C" delay={1} /><Arr delay={1.1} /><Dot n="D" delay={1.2} />
            <svg className="w6ch-link" viewBox="0 0 200 40" preserveAspectRatio="none" aria-hidden="true"><path d="M10 4 C 60 40, 140 40, 190 4" /></svg>
            <span className="w6ch-note ok">connected</span>
          </div>
        )}
      </div>
    </Frame>
  );
};

/* 4.1 part 2 — a sheet of paper; every step waits for a click. 1 sentence A + "As a result, they …" · 2 the eraser rubs out
   "As a result," · 3 the pen writes "This" · 4 the eraser rubs out the rest · 5 the pen writes "can help them to find …" ·
   6 "This" and "help" light up, then the paper blurs and "this + verb pattern" slams into the centre (Effects tag on the verb pattern). */
const reduceMotion = () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
/** ms since this build started (ticks until `until`); jumps to the end when motion is reduced */
function useClock(build: number, until = 7000): number {
  const [t, setT] = useState(() => (reduceMotion() ? 1e9 : 0));
  useEffect(() => {
    if (reduceMotion()) { setT(1e9); return; }
    setT(0);
    const t0 = performance.now();
    const id = window.setInterval(() => { const d = performance.now() - t0; setT(d); if (d > until) window.clearInterval(id); }, 40);
    return () => window.clearInterval(id);
  }, [build, until]);
  return t;
}
const ERASE_MS = 1300;
const CHAR_MS = 32;
/** text being rubbed out: a paper-coloured cover follows the eraser left → right */
const Erase: React.FC<{ text: string; t: number; cls?: string }> = ({ text, t, cls = '' }) => {
  const p = Math.min(1, Math.max(0, t / ERASE_MS));
  return (
    <span className={`w6tv-er ${cls}`}>
      {text}
      <span className="w6tv-cover" style={{ width: `${p * 100}%` }} />
      {p < 1 && (
        <span className="w6tv-eraser" style={{ left: `${p * 100}%` }} aria-hidden="true">
          <svg viewBox="0 0 60 40"><rect x="4" y="6" width="52" height="28" rx="6" fill="#f3c9cb" stroke="#3b3d54" strokeWidth="3" /><rect x="4" y="6" width="20" height="28" rx="6" fill="#d63a43" stroke="#3b3d54" strokeWidth="3" /></svg>
          <i className="w6tv-crumb c0" /><i className="w6tv-crumb c1" /><i className="w6tv-crumb c2" />
        </span>
      )}
    </span>
  );
};
/** text being written: revealed character by character, the pen tip sits at the caret */
const Write: React.FC<{ parts: { t: string; cls?: string }[]; t: number }> = ({ parts, t }) => {
  let n = Math.max(0, Math.floor(t / CHAR_MS));
  const total = parts.reduce((k, p) => k + p.t.length, 0);
  const writing = n < total;
  let penAt = -1;
  let used = 0;
  const out = parts.map((p, i) => {
    const k = Math.min(p.t.length, n);
    n -= k;
    if (writing && penAt < 0 && (k < p.t.length || used + k === total)) penAt = i;
    used += k;
    return (
      <span key={i} className={p.cls}>
        <span className="w6tv-ink">{p.t.slice(0, k)}</span>
        {penAt === i && (
          <span className="w6tv-pen" aria-hidden="true">
            <svg viewBox="0 0 40 60"><path d="M6 58 L2 44 L28 4 L38 10 L12 50 Z" fill="#3b3d54" /><path d="M28 4 L38 10 L34 16 L24 10 Z" fill="#d63a43" /><path d="M2 44 L12 50 L6 58 Z" fill="#f4f4f2" stroke="#3b3d54" strokeWidth="2" /></svg>
          </span>
        )}
        <span className="w6tv-todo">{p.t.slice(k)}</span>
      </span>
    );
  });
  return <>{out}</>;
};
export const SThisVerb: React.FC<SlideProps> = (props) => {
  const b = props.build;
  const t = useClock(b);
  const gone = t > ERASE_MS + 100; // this build's eraser is done
  const rest = THIS_DEMO.lwRest;
  const [vHead, vTail] = [THIS_DEMO.v1.slice(0, THIS_DEMO.v1.indexOf('help')), THIS_DEMO.v1.slice(THIS_DEMO.v1.indexOf('help') + 4)];
  let lineB: React.ReactNode;
  if (b === 0) lineB = <span className="w6tv-old"><b>{THIS_DEMO.lw}</b> {rest}</span>;
  else if (b === 1) lineB = <>{!gone && <><Erase text={THIS_DEMO.lw} t={t} cls="w6tv-old" />{' '}</>}{rest}</>;
  else if (b === 2) lineB = <><Write t={t} parts={[{ t: 'This', cls: 'w6tv-this' }]} />{' '}{rest}</>;
  else if (b === 3) lineB = <><span className="w6tv-this">This</span>{' '}{!gone && <Erase text={rest} t={t} />}</>;
  else if (b === 4) lineB = <><span className="w6tv-this">This</span>{' '}<Write t={t} parts={[{ t: THIS_DEMO.v1 }]} /></>;
  else lineB = (
    <>
      <span className="w6tv-mark this">This</span>{' '}{vHead}
      <span className="w6tv-mark vp">help</span>{vTail}
    </>
  );
  return (
    <Frame props={props}>
      <div className={`w6tv${b >= 5 ? ' focus' : ''}`}>
        <div className={`w6tv-paper${b >= 5 ? ' done' : ''}`}>
          <i className="w6tv-hole h0" /><i className="w6tv-hole h1" /><i className="w6tv-hole h2" />
          {b >= 2 && <span className="w6tv-eqtag">This = ý câu A</span>}
          <p className={`w6tv-line a${b >= 2 ? ' lit' : ''}`}><span className="w6ch-dot c-a sm">A</span><span className="w6tv-atext">{THIS_DEMO.a}</span></p>
          <p className="w6tv-line">{lineB}</p>
        </div>
        {b >= 5 && (
          <div className="w6tv-slam" role="note">
            <div className="w6tv-formula">
              <span className="w6tv-f this">this</span><span className="w6tv-plus">+</span>
              <span className="w6tv-f vp">verb pattern<span className="w6tv-efftag">Effects</span></span>
            </div>
          </div>
        )}
      </div>
    </Frame>
  );
};

/* ---- 4.3 effects ---------------------------------------------------------------------------- */
const GroupCard: React.FC<{ g: VGroup; delay?: number; compact?: boolean }> = ({ g, delay = 0, compact }) => (
  <div className={`card w6ef-g s-${g.sign === '+' ? 'pos' : 'neg'}${compact ? ' compact' : ''}`} style={{ animationDelay: `${delay}s` }}>
    {!compact && EFFECT_ICON[g.id] ? (
      <div className="w6ef-gi">{React.createElement(EFFECT_ICON[g.id])}<div><div className="w6ef-gn">{g.name}</div><ul>{g.pats.map((p) => <li key={p}>{p}</li>)}</ul></div></div>
    ) : (<><div className="w6ef-gn">{g.name}</div><ul>{g.pats.map((p) => <li key={p}>{p}</li>)}</ul></>)}
  </div>
);
/* the neutral group first: one verb, two ways to finish it. Big and centred on build 1, a compact header after. */
const Neutral: React.FC<{ big: boolean }> = ({ big }) => (
  <div className={`w6nf${big ? ' big' : ''}`}>
    <span className="w6nf-tag"><b>±</b>Trung tính</span>
    <div className="w6nf-row">
      <div className="w6nf-verbs">{EFFECT_TOP.map((v) => <span key={v}>{v}</span>)}</div>
      <svg className="w6nf-fork" viewBox="0 0 80 100" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 50 C 40 50, 40 18, 80 18" /><path d="M0 50 C 40 50, 40 82, 80 82" />
      </svg>
      <span className="w6nf-plus">+</span>
      <div className="w6nf-objs">
        <span className="w6nf-o n">N</span><span className="w6nf-or">/</span>
        <span className="w6nf-o sv">the fact that <b>S V</b></span>
      </div>
    </div>
  </div>
);
export const SEffects: React.FC<SlideProps> = (props) => {
  const b = props.build;
  const side = (sign: '+' | '-', at: number) => (
    <div className={`w6ef-col s-${sign === '+' ? 'pos' : 'neg'} ${b < at ? 'w6-hide' : b === at ? 'cur' : ''}`}>
      <div className="w6ef-sign">{sign === '+' ? '+' : '−'}<span>{sign === '+' ? 'Effects tốt' : 'Effects xấu'}</span></div>
      {b >= at && VGROUPS.filter((g) => g.sign === sign).map((g, i) => <GroupCard key={g.id} g={g} delay={0.2 + i * 0.18} />)}
    </div>
  );
  return (
    <Frame props={props}>
      <div className="w6ef">
        <Neutral big={b === 0} />
        {b >= 1 && <div className="w6ef-cols">{side('+', 1)}{side('-', 2)}</div>}
      </div>
    </Frame>
  );
};

/* ---- 4.3a / 4.3b type the verb pattern (auto) ------------------------------------------------ */
const TypeScreen: React.FC<{ props: SlideProps; set: TypeSet }> = ({ props, set }) => {
  const key = props.step.key;
  const [fx, burst] = useBurst();
  const act = useActivity(key, 'all');
  const [v, setV] = useDraft<Record<string, string>>(`${key}:v`, {});
  const last = new Map((act.latest?.lines || []).map((l) => [l.id, l]));
  const showKey = props.revealed || act.locked;
  const lockedUi = act.locked || act.paused;
  const done = set.gaps.filter((g) => (v[g.id] || '').trim()).length;
  const submit = async () => {
    const lines = set.gaps.map((g) => ({ id: g.id, label: `${g.before} ___ ${g.after}`, value: `${g.before} ${(v[g.id] || '').trim()} ${g.after}`, correct: gapOk(g, v[g.id] || '') }));
    const right = lines.filter((l) => l.correct).length;
    const a = await act.submit({
      answer: { ...v }, lines, isCorrect: right === set.gaps.length, score: right, maxScore: set.gaps.length, scoreDisplay: `${right}/${set.gaps.length} đúng`,
      models: set.gaps.map((g) => ({ id: g.id, label: g.group, value: `${g.before} ${g.model} ${g.after}`, correct: true })),
    });
    if (a?.isCorrect) burst();
  };
  const bar = <SubmitBar act={act} ready={done === set.gaps.length} hint={`Điền đủ ${set.gaps.length} câu (${done}/${set.gaps.length})`} label={act.latest ? 'Nộp lại' : 'Nộp bài'} onSubmit={submit} />;
  const groups = VGROUPS.filter((g) => g.sign === set.sign);
  return (
    <Frame props={props} bar={bar} fx={fx}>
      <div className="w6ty">
        <div className="w6ty-l">
          <div className="card w6ty-given"><span className="w6ch-dot c-a sm">A</span>{set.given}</div>
          <div className="w6ty-lw"><span className="w6ty-tag">with linking words</span>{set.withLw}</div>
          <div className="w6ty-tag2">without linking words</div>
          {set.gaps.map((g, k) => {
            const r = last.get(g.id);
            const st = r ? (r.correct ? 'ok' : 'try') : '';
            return (
              <div key={g.id} className={`card w6ty-row ${st}`}>
                <span className="w6ty-g">{g.group}</span>
                <span className="w6ty-s">
                  <b>{g.before}</b>{' '}
                  <input className="w6fr-in w6ty-in" value={v[g.id] || ''} disabled={lockedUi} placeholder="…" style={{ width: `calc(${Math.max(9, (v[g.id] || '').length) * 0.6}em + 20px)` }}
                    onChange={(e) => setV((x) => ({ ...x, [g.id]: e.target.value }))} aria-label={`Câu ${k + 1}: ${g.before} … ${g.after}`} />
                  {' '}{g.after}
                </span>
                {r && <span className={`w6pi-vd ${st}`}>{r.correct ? '✓' : '!'}</span>}
                {showKey && !r?.correct && <div className="w6ty-model">✓ {g.before} <b>{g.model}</b> {g.after}</div>}
              </div>
            );
          })}
        </div>
        <div className="w6ty-r">{groups.map((g) => <GroupCard key={g.id} g={g} compact />)}</div>
      </div>
    </Frame>
  );
};
export const SThisPos: React.FC<SlideProps> = (props) => <TypeScreen props={props} set={TYPE_POS} />;
export const SThisNeg: React.FC<SlideProps> = (props) => <TypeScreen props={props} set={TYPE_NEG} />;

/* flow text: ⇒ and ⫽ styled */
const Flow: React.FC<{ text: string }> = ({ text }) => (
  <>{text.split(/(⇒|⫽)/).map((t, i) => (t === '⇒' ? <i key={i} className="w6ol-arr"> ⇒ </i> : t === '⫽' ? <b key={i} className="w6fw-cut" title="tách câu">⫽</b> : <React.Fragment key={i}>{t}</React.Fragment>))}</>
);

/* ---- 4.1c write This + verb pattern (AI, 3 flows) ------------------------------------------------
   One flow at a time. Sentence 1 and sentence 2 have their own box; box 2 already starts with "This".
   Tap a chip to drop that phrase in at the cursor (red chips = verb patterns). A drawing acts out each flow. */
const ThisArt: React.FC<{ k: number }> = ({ k }) => (
  <svg className={`w6tw-art f${k}`} viewBox="0 0 200 180" aria-hidden="true">
    {k === 0 && (<g>
      <rect x="80" y="70" width="40" height="70" rx="8" fill="#3b3d54" /><rect x="85" y="78" width="30" height="50" rx="3" fill="#fdf1f1" />
      <path className="w6tw-sw" d="M93 103h14m-4-5 5 5-5 5" stroke="#d63a43" strokeWidth="3" fill="none" strokeLinecap="round" />
      <g className="w6tw-bub l"><rect x="10" y="22" width="56" height="38" rx="12" fill="#fff" stroke="#3b3d54" strokeWidth="3" /><text x="38" y="48" textAnchor="middle" className="w6tw-t">Hi</text></g>
      <g className="w6tw-bub r"><rect x="134" y="22" width="56" height="38" rx="12" fill="#d63a43" /><text x="162" y="49" textAnchor="middle" className="w6tw-t w">你好</text></g>
      <circle cx="30" cy="150" r="12" fill="#3b3d54" /><circle cx="170" cy="150" r="12" fill="#d63a43" />
    </g>)}
    {k === 1 && (<g>
      <rect x="22" y="96" width="92" height="58" rx="6" fill="#3b3d54" /><rect x="28" y="102" width="80" height="44" rx="3" fill="#fdf1f1" /><rect x="12" y="154" width="112" height="8" rx="4" fill="#3b3d54" />
      {[0, 1, 2].map((i) => <rect key={i} className={`w6tw-doc d${i}`} x="56" y="112" width="20" height="24" rx="3" fill="#fff" stroke="#d63a43" strokeWidth="2.5" />)}
      <circle cx="160" cy="62" r="30" fill="#fff" stroke="#3b3d54" strokeWidth="3" /><path className="w6tw-glow" d="M146 64c4-12 24-12 28 0" stroke="#d63a43" strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle className="w6tw-bulb" cx="160" cy="62" r="40" fill="none" stroke="#f3c9cb" strokeWidth="3" />
    </g>)}
    {k === 2 && (<g>
      <path d="M100 150 L30 134 V60 L100 76 Z" fill="#fff" stroke="#3b3d54" strokeWidth="3" /><path d="M100 150 L170 134 V60 L100 76 Z" fill="#fdf1f1" stroke="#3b3d54" strokeWidth="3" />
      {['a', 'b', 'c'].map((c, i) => <text key={c} className={`w6tw-ab l${i}`} x={60 + i * 34} y="70" textAnchor="middle">{['A', 'b', 'C'][i]}</text>)}
      <g className="w6tw-pencil"><path d="M150 20 l20 12 -40 66 -18 6 -2 -18 z" fill="#3b3d54" /><path d="M150 20 l20 12 -6 10 -20 -12 z" fill="#d63a43" /></g>
      <path className="w6tw-line" d="M40 98 L92 110" stroke="#d63a43" strokeWidth="3" strokeLinecap="round" />
    </g>)}
  </svg>
);
const ChipRow: React.FC<{ chips: Chip[]; onPick: (t: string) => void; disabled?: boolean }> = ({ chips, onPick, disabled }) => (
  <div className="w6tw-chips">{chips.map((c) => (
    <button key={c.t} className={`w6tw-chip${c.p ? ' p' : ''}`} disabled={disabled} onMouseDown={(e) => e.preventDefault()} onClick={() => onPick(c.t)}>+ {c.t}</button>
  ))}</div>
);
export const SThisWrite: React.FC<SlideProps> = (props) => {
  const key = props.step.key;
  const [fx, burst] = useBurst();
  const [txt, setTxt] = useDraft<Record<string, string>>(`${key}:txt`, {});
  const [k, setK] = useState(0);
  const refs = React.useRef<Record<string, HTMLTextAreaElement | null>>({});
  const get = (id: string, n: 1 | 2) => txt[`${id}:${n}`] || '';
  const answerOf = (id: string) => joinThis(get(id, 1), get(id, 2));
  const items = THIS_WRITE.map((w, i) => ({ id: w.id, label: `Flow ${i + 1}`, prompt: w.flow!, context: w.context, answer: answerOf(w.id), models: w.models,
    check: precheck(answerOf(w.id), w.flow!, w.rule) }));
  const s = useAiSet(props, items, burst);
  const lockedUi = s.act.locked || s.act.paused;
  const w = THIS_WRITE[k];
  const aids = THIS_AIDS[w.id];
  const [f1, f2] = w.flow!.split('⫽');
  /** drop a phrase in at the caret of box n (adds the spaces it needs) */
  const insert = (n: 1 | 2, piece: string) => {
    const field = `${w.id}:${n}`;
    const el = refs.current[field];
    const cur = txt[field] || '';
    const at = el && document.activeElement === el ? el.selectionStart ?? cur.length : cur.length;
    const before = cur.slice(0, at); const after = cur.slice(at);
    const add = `${before && !/\s$/.test(before) ? ' ' : ''}${piece}${after && !/^\s/.test(after) ? ' ' : ''}`;
    const next = before + add + after;
    setTxt((t) => ({ ...t, [field]: next }));
    requestAnimationFrame(() => { if (el) { el.focus(); const pos = (before + add).length; el.setSelectionRange(pos, pos); } });
  };
  const verbRule = w.rule?.need?.[1];
  const checks = [
    { ok: get(w.id, 1).trim().split(/\s+/).filter(Boolean).length >= 5, t: 'Câu 1 đủ ý' },
    { ok: !!verbRule && new RegExp(verbRule[0], 'i').test(get(w.id, 2)), t: `Câu 2: This + ${w.need}` },
    { ok: !items[k].check, t: 'Sẵn sàng nộp' },
  ];
  return (
    <Frame props={props} bar={s.bar} fx={fx}>
      {s.graded ? (
        <GradedList s={s} rows={THIS_WRITE.map((x, i) => ({ id: x.id, n: i + 1, answer: items[i].answer, models: x.models }))} modelLabel="Đáp án tham khảo" />
      ) : (
        <div className="w6tw">
          <div className="w6tw-steps" role="tablist">
            {THIS_WRITE.map((x, i) => (
              <button key={x.id} role="tab" aria-selected={i === k} className={`w6tw-step${i === k ? ' on' : ''}${!items[i].check ? ' done' : ''}`} onClick={() => setK(i)}>
                <span>{!items[i].check ? '✓' : i + 1}</span>Flow {i + 1}
              </button>
            ))}
          </div>
          <div className="card w6tw-card" key={w.id}>
            <ThisArt k={k} />
            <div className="w6tw-main">
              <div className="w6tw-sent">
                <div className="w6tw-lab"><b>Câu 1</b><span className="w6tw-flow"><Flow text={f1.trim()} /></span></div>
                <textarea ref={(el) => { refs.current[`${w.id}:1`] = el; }} className="ta w6tw-in" rows={2} value={get(w.id, 1)} disabled={lockedUi}
                  placeholder={`${aids.s1[0].t} …`} aria-label={`Flow ${k + 1}, câu 1`} onChange={(e) => setTxt((t) => ({ ...t, [`${w.id}:1`]: e.target.value }))} />
                <ChipRow chips={aids.s1} onPick={(t) => insert(1, t)} disabled={lockedUi} />
              </div>
              <div className="w6tw-sent">
                <div className="w6tw-lab"><b>Câu 2</b><span className="w6tw-flow"><Flow text={(f2 || '').trim()} /></span></div>
                <div className="w6tw-two">
                  <span className="w6tw-this">This</span>
                  <textarea ref={(el) => { refs.current[`${w.id}:2`] = el; }} className="ta w6tw-in" rows={2} value={get(w.id, 2)} disabled={lockedUi}
                    placeholder={`${aids.s2[0].t} …`} aria-label={`Flow ${k + 1}, câu 2 sau This`} onChange={(e) => setTxt((t) => ({ ...t, [`${w.id}:2`]: e.target.value }))} />
                </div>
                <ChipRow chips={aids.s2} onPick={(t) => insert(2, t)} disabled={lockedUi} />
              </div>
              <div className="w6tw-foot">
                <ul className="w6tw-checks">{checks.map((c) => <li key={c.t} className={c.ok ? 'ok' : ''}><i>{c.ok ? '✓' : ''}</i>{c.t}</li>)}</ul>
                <div className="w6tw-nav">
                  <button className="w6tw-navb" disabled={k === 0} onClick={() => setK(k - 1)} aria-label="Flow trước">‹</button>
                  {k < THIS_WRITE.length - 1 && <button className="w6tw-navb next" onClick={() => setK(k + 1)}>Flow {k + 2} ›</button>}
                </div>
              </div>
              {s.showModels && <div className="w6-model">✓ {w.models[0]}</div>}
            </div>
          </div>
        </div>
      )}
    </Frame>
  );
};

/* ---- 4.4 structures ------------------------------------------------------------------------- */
/** B → C joined by a structure: the plank between B and C keeps swapping through the connectors */
const StructBridge: React.FC<{ small?: boolean }> = ({ small }) => {
  const joints = STRUCTS.map((x) => x.end[0][0].trim());
  const [k, setK] = useState(0);
  useEffect(() => {
    if (small || reduceMotion()) return;
    const t = setInterval(() => setK((x) => (x + 1) % joints.length), 1800);
    return () => clearInterval(t);
  }, [small, joints.length]);
  return (
    <div className={`w6ch-row one w6sb${small ? ' small' : ' cur'}`}>
      <Dot n="A" /><Arr delay={0.1} /><Dot n="B" delay={0.2} />
      <span className="w6sb-bridge">
        <i className="w6sb-rail" aria-hidden="true" />
        <span className="w6sb-plank" key={k}>{small ? 'structure' : joints[k]}</span>
        {small && <svg className="w6sb-down" viewBox="0 0 20 60" preserveAspectRatio="none" aria-hidden="true"><path d="M10 0 V52" /><path d="M3 46 L10 56 L17 46" /></svg>}
      </span>
      <Dot n="C" delay={0.4} /><Stop />
      <span className="w6ch-note ok">1 câu</span>
    </div>
  );
};
/* 4.2 — every step on a click. 1 a paragraph linked only with This + V · 2 the This sentences light up, S V · This + V ×3
   3 everything blurs, "Cấu trúc bị giới hạn" slams into the centre · 4 the two ways so far: LW (A → B. LW C → D), A → B. B → C
   5 the new way: A → B → C in ONE sentence, a structure is the bridge from B to C (it keeps swapping)
   6–10 one structure per click (which, which means that · and thus S V, thereby V-ing, and thus V): the ending of the
   same example flips to the next structure */
export const SStructs: React.FC<SlideProps> = (props) => {
  const b = props.build;
  let body: React.ReactNode;
  if (b <= 2) body = (
    <div className={`w6lim${b >= 1 ? ' lit' : ''}${b >= 2 ? ' focus' : ''}`} key="lim">
      <div className="w6lim-content">
        <p className="card w6lim-para">
          <span className="w6lim-s">{LIMITED_PARA.first}</span>{' '}
          {LIMITED_PARA.next.map((x, i) => (
            <React.Fragment key={i}>
              <span className={`w6lim-s t d${i}`}><b className="w6lim-this">This</b> <b className="w6lim-v">{x.v}</b>{x.rest}</span>{' '}
            </React.Fragment>
          ))}
        </p>
        {b >= 1 && (
          <div className="w6lim-strip" aria-hidden="true">
            <span className="w6lim-blk sv">S V.</span>
            {LIMITED_PARA.next.map((_, i) => <span key={i} className={`w6lim-blk tv d${i}`}>This + V.</span>)}
          </div>
        )}
      </div>
      {b >= 2 && <div className="w6lim-slam" role="note"><span className="w6lim-tag">Cấu trúc bị giới hạn</span></div>}
    </div>
  );
  else if (b <= 4) body = (
    <div className="w6ch w6ways" key="ways">
      <div className={`w6ch-row w6way${b === 4 ? ' w6-past' : ''}`}><span className="w6way-n">1</span><Dot n="A" /><Arr /><Dot n="B" /><Stop /><span className="w6ch-tool lw">Linking word,</span><Dot n="C" /><Arr /><Dot n="D" /></div>
      <div className={`w6ch-row w6way${b === 4 ? ' w6-past' : ''}`} style={{ animationDelay: '.25s' }}><span className="w6way-n">2</span><Dot n="A" /><Arr /><Dot n="B" /><Stop /><Dot n="B" cls="again" /><Arr /><Dot n="C" /></div>
      {b === 4 && <><div className="w6way-new">Cách mới</div><StructBridge /></>}
    </div>
  );
  else {
    const k = Math.min(b - 5, STRUCTS.length - 1);
    const x = STRUCTS[k];
    body = (
      <>
        <StructBridge small />
        <div className={`w6s1 g-${x.group}`}>
          <div className="w6s1-pat" key={'p' + x.id}>{x.pat}</div>
          <p className="card w6s1-sent">
            {STRUCT_A}<span className="w6s1-joint" key={x.id}><Segs segs={x.end} /></span>
          </p>
          {k === STRUCTS.length - 1 && <div className="w6st-eff enter">Cả 5 cấu trúc → Effects</div>}
        </div>
      </>
    );
  }
  return (
    <Frame props={props}>
      <div className="w6st">{body}</div>
    </Frame>
  );
};

/* 4.4a — Build 1: the wrong sentence; a bracket shows who the V-ing belongs to · Build 2: two fixes */
export const SThereby: React.FC<SlideProps> = (props) => {
  const b = props.build;
  const Row: React.FC<{ end: string; ok: boolean; cls?: string; delay?: number }> = ({ end, ok, cls = '', delay = 0 }) => (
    <div className={`w6tb-row ${ok ? 'ok' : 'bad'} ${cls}`} style={{ animationDelay: `${delay}s` }}>
      <span className="w6tb-b s">{THEREBY.a}</span>
      <span className="w6tb-b">{THEREBY.b}</span>
      <span className="w6tb-b link">{THEREBY.link}</span>
      <span className="w6tb-b end">{end}</span>
      <span className={`w6tb-sym ${ok ? 'ok' : 'bad'}`}>{ok ? '✓' : '✗'}</span>
      <svg className="w6tb-arc" viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true"><path d="M4 2 C 4 26, 96 26, 96 2" /></svg>
      <span className="w6tb-who">{ok ? <><b>Online courses</b> give learners flexibility</> : <><b>Online courses</b> … having flexibility?</>}</span>
    </div>
  );
  return (
    <Frame props={props}>
      <div className="w6tb">
        <Row end={THEREBY.wrong} ok={false} cls={b === 0 ? 'cur' : 'w6-past'} />
        {b >= 1 && THEREBY.fixes.map((f, i) => <Row key={f} end={f} ok cls="enter cur" delay={0.15 + i * 0.3} />)}
      </div>
    </Frame>
  );
};

/* ---- 4.4b write with structures (AI, 2 flows × 2 structures) -------------------------------- */
export const SStructWrite: React.FC<SlideProps> = (props) => {
  const key = props.step.key;
  const [fx, burst] = useBurst();
  const [txt, setTxt] = useDraft<Record<string, string>>(`${key}:txt`, {});
  const flowOf = (n: number) => STRUCT_WRITE.find((w) => w.flowN === n && w.flow)!;
  const items = STRUCT_WRITE.map((w, k) => ({ id: w.id, label: `Câu ${k + 1} · ${w.prompt}`, prompt: `${flowOf(w.flowN).flow} — ${w.prompt}`, context: w.context, answer: (txt[w.id] || '').trim(), models: w.models, check: precheck(txt[w.id] || '', w.prompt, w.rule) }));
  const s = useAiSet(props, items, burst);
  const lockedUi = s.act.locked || s.act.paused;
  return (
    <Frame props={props} bar={s.bar} fx={fx}>
      {s.graded ? (
        <GradedList s={s} rows={STRUCT_WRITE.map((w, k) => ({ id: w.id, n: k + 1, head: `Flow ${w.flowN} · ${w.prompt}`, answer: items[k].answer, models: w.models }))} modelLabel="Đáp án tham khảo" />
      ) : (
        <div className="w6fw">
          {[1, 2].map((n) => {
            const f = flowOf(n);
            return (
              <div key={n} className={`card w6fw-card enter d${n}`}>
                <div className="w6fw-h"><span className="w6-n">{n}</span><span className="w6fw-need">{f.need}</span></div>
                <div className="w6fw-flow"><Flow text={f.flow!} /></div>
                {STRUCT_WRITE.filter((w) => w.flowN === n).map((w) => (
                  <div key={w.id} className="w6fw-slot">
                    <span className="w6fw-pat">{w.prompt}</span>
                    <textarea className="ta w6fw-in" rows={2} value={txt[w.id] || ''} placeholder={w.placeholder} disabled={lockedUi}
                      onChange={(e) => setTxt((t) => ({ ...t, [w.id]: e.target.value }))} aria-label={`Flow ${n}: ${w.prompt}`} />
                    {s.showModels && <div className="w6-model">✓ {w.models[0]}</div>}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </Frame>
  );
};

/* ---- 4.5 / 4.6 write a paragraph (AI, 1 box) --------------------------------------------- */
const Verbs: React.FC<{ text: string }> = ({ text }) => (
  <>{text.split(/(\([^)]+\))/).map((t, i) => (t.startsWith('(') ? <b key={i} className="w6pw-verb">{t}</b> : <Flow key={i} text={t} />))}</>
);
const ParaScreen: React.FC<{ props: SlideProps; idx: number }> = ({ props, idx }) => {
  const w = PARA_WRITE[idx];
  const key = props.step.key;
  const [fx, burst] = useBurst();
  const [txt, setTxt] = useDraft<string>(`${key}:txt`, '');
  const items = [{ id: w.id, label: w.prompt, prompt: `Idea: ${w.outline.idea} | Expand: ${w.outline.expand} | Example: ${w.outline.example}`, context: w.context, answer: txt.trim(), models: w.models, check: precheck(txt, w.outline.idea, w.rule) }];
  const s = useAiSet(props, items, burst);
  const r = s.byLine.get(w.id);
  return (
    <Frame props={props} bar={s.bar} fx={fx}>
      <div className={`w6pw${s.graded ? ' graded' : ''}`}>
        <div className="card w6ol w6pw-ol">
          <div className="w6ol-tag">Outline</div>
          <div className="w6ol-row"><b>Idea</b><span><Verbs text={w.outline.idea} /></span></div>
          <div className="w6ol-row"><b>Expand</b><span><Verbs text={w.outline.expand} /></span></div>
          <div className="w6ol-row"><b>Example</b><span><Verbs text={w.outline.example} /></span></div>
        </div>
        <div className="w6pw-r">
          <textarea className="ta w6pw-in" rows={s.graded ? 5 : 9} value={txt} placeholder={w.placeholder} disabled={s.act.locked || s.act.paused}
            onChange={(e) => setTxt(e.target.value)} aria-label={w.prompt} />
          {s.graded && r && (
            <div className="card w6pw-fb enter">
              <div className="w6pw-fh"><span className="w6-lab">Nhận xét</span><Verdict ok={r.correct} /></div>
              <FbRows c={s.crit[w.id]} ok={r.correct} suggestion={r.suggestion} feedback={r.feedback} />
            </div>
          )}
          {s.showModels && <div className="w6-model w6pw-model">✓ Đoạn tham khảo: {w.models[0]}</div>}
        </div>
      </div>
    </Frame>
  );
};
export const SPara1: React.FC<SlideProps> = (props) => <ParaScreen props={props} idx={0} />;
export const SPara2: React.FC<SlideProps> = (props) => <ParaScreen props={props} idx={1} />;

/* 4.1 This + verb pattern — one page, three parts: mindset · This + verb · effects verb patterns */
const TV_PARTS: Part[] = [
  { C: SMindset, n: 2, kind: 'theory', pre: 'Mindset:', key: 'A → B, B → C', vi: 'Câu sau phải nối tiếp ý câu trước' },
  { C: SThisVerb, n: 6, kind: 'theory', pre: 'Without linking words:', key: 'This + verb', vi: 'Thay linking word bằng This + động từ' },
  { C: SEffects, n: 3, kind: 'theory', pre: 'Effects:', key: 'verb patterns', vi: 'Những pattern diễn tả hệ quả hay dùng nhất trong IELTS' },
];
export const SThisVerbPage: React.FC<SlideProps> = (props) => <Parts props={props} parts={TV_PARTS} />;
