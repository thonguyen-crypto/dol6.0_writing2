/* Stage 2 · Improve a sentence by meaning
   2.1 Improve by meaning · 2.2 Make it more convincing · 2.2a Practice 1 (hedging chips, auto)
   2.3 Make it more specific · 2.3a Practice 2 (AI, 4 frames on one slide) · 2.4 Extra practice: improve a paragraph (auto, sentence by sentence) */
import React from 'react';
import type { SlideProps } from '../../../kit/slides';
import { useActivity, useDraft } from '../../../kit/activities/useActivity';
import {
  HEDGE, PARA, PARA_TOPIC, SPECIFIC, frameAnswer, frameCheck, hedgeOk, paraModel, paraSentence, paraSlots, slotOk, slotText, type ParaSlot,
} from '../logic';
import { Frame, GradedList, Slot, SubmitBar, useAiSet, useBurst, useOpenSlot } from '../runtime';

/* ---- 2.1 drawings ------------------------------------------------------------------------ */
/* "quơ đũa cả nắm": one sweep ticks every person the same way */
const ArtSweep = () => (
  <svg viewBox="0 0 260 130" className="w6i-svg" aria-hidden="true">
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <g key={i} transform={`translate(${22 + i * 40} 40)`}>
        <circle cx="0" cy="10" r="10" fill="#fff" stroke="#3b3d54" strokeWidth="2.5" />
        <path d="M-14 46c0-14 6-22 14-22s14 8 14 22" fill="#fff" stroke="#3b3d54" strokeWidth="2.5" />
        <g className="w6i-tick" style={{ animationDelay: `${0.5 + i * 0.12}s` }}><circle cx="10" cy="-6" r="8" fill="#d63a43" /><path d="M6 -6l3 3 5-6" stroke="#fff" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></g>
      </g>
    ))}
    <path className="w6i-sweep" d="M10 112 Q130 128 250 112" stroke="#d63a43" strokeWidth="5" fill="none" strokeLinecap="round" />
    <text x="130" y="20" textAnchor="middle" className="w6i-t">ALL = 100%</text>
  </svg>
);
/* "chưa chi tiết": a blurry bubble "soft skills ?" */
const ArtBlur = () => (
  <svg viewBox="0 0 260 130" className="w6i-svg" aria-hidden="true">
    <defs><filter id="w6blur"><feGaussianBlur stdDeviation="2.2" /></filter></defs>
    <g className="w6i-blur">
      <rect x="40" y="22" width="180" height="70" rx="35" fill="#fff" stroke="#3b3d54" strokeWidth="3" />
      <path d="M90 92l-10 22 30-22" fill="#fff" stroke="#3b3d54" strokeWidth="3" strokeLinejoin="round" />
      <g filter="url(#w6blur)"><rect x="66" y="44" width="70" height="12" rx="6" fill="#8b8da1" /><rect x="66" y="62" width="100" height="12" rx="6" fill="#b8b9c6" /></g>
    </g>
    <g className="w6i-q"><circle cx="210" cy="30" r="18" fill="#e4a23a" /><text x="210" y="37" textAnchor="middle" className="w6i-qt">?</text></g>
  </svg>
);

/* 2.1 — Build 1: the sentence and its 2 problems · Build 2: hard words ≠ good sentence → improve meaning · Build 3: TR → 2 ways */
export const SMeaning: React.FC<SlideProps> = (props) => {
  const b = props.build;
  return (
    <Frame props={props}>
      <div className="w6i">
        <div className={`card w6i-sent ${b === 0 ? 'w6-on' : 'w6-past'}`}>“Doing internships allows people to develop soft skills.”</div>
        <div className="w6i-stage">
          {b === 0 && (
            <div className="w6i-probs" key="p">
              <div className="card w6i-prob enter d1"><ArtSweep /><div className="w6i-pt"><span className="w6i-sos">!</span>Câu hơi “quơ đũa cả nắm”</div></div>
              <div className="card w6i-prob enter d2"><ArtBlur /><div className="w6i-pt"><span className="w6i-sos">!</span>Câu chưa chi tiết</div></div>
            </div>
          )}
          {b === 1 && (
            <div className="w6i-myth" key="m">
              <div className="w6i-old">
                <span className="w6i-chip">từ vựng khó</span><span className="w6i-plus">+</span><span className="w6i-chip">cấu trúc khó</span>
                <svg className="w6i-strike" viewBox="0 0 100 20" preserveAspectRatio="none" aria-hidden="true"><path d="M2 14 L98 6" /></svg>
              </div>
              <span className="w6i-arrow">→</span>
              <div className="w6i-new"><span className="w6i-okc">✓</span>improve <b>meaning</b></div>
            </div>
          )}
          {b === 2 && (
            <div className="w6i-tree" key="t">
              <div className="w6i-tr">Task Response</div>
              <svg className="w6i-br" viewBox="0 0 120 200" preserveAspectRatio="none" aria-hidden="true"><path d="M0 100 C60 100 60 40 120 40" /><path d="M0 100 C60 100 60 160 120 160" /></svg>
              <div className="w6i-ways">
                {[['Avoid “overgeneralization”', 'convincing'], ['Add more details', 'specific']].map(([how, k], i) => (
                  <div key={k} className="w6i-way" style={{ animationDelay: `${0.3 + i * 0.35}s` }}>
                    <span className="w6i-how">{how}</span><span className="w6i-arr">→</span>
                    <span className="w6i-goal">make it more <b>{k}</b></span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Frame>
  );
};

/* ---- 2.2 certainty meter: the needle drops from 100% when the hedge goes in --------------------- */
const Meter: React.FC<{ pct: number }> = ({ pct }) => {
  const a = Math.PI * (1 - pct / 100);
  const x = 110 + 78 * Math.cos(a), y = 110 - 78 * Math.sin(a);
  return (
    <svg viewBox="0 0 220 140" className="w6cv-meter" aria-hidden="true">
      <path d="M22 110 A88 88 0 0 1 198 110" className="w6cv-track" />
      <path d="M22 110 A88 88 0 0 1 198 110" className="w6cv-fill" style={{ strokeDashoffset: 277 * (1 - pct / 100) }} />
      <line x1="110" y1="110" x2={x} y2={y} className="w6cv-needle" />
      <circle cx="110" cy="110" r="9" fill="#3b3d54" />
      <text x="110" y="136" textAnchor="middle" className="w6cv-pct">{pct === 100 ? 'chắc chắn 100%' : 'có thể xảy ra'}</text>
    </svg>
  );
};
/* 2.2 — Build 1: the absolute sentence (meter at 100%) · Build 2: can / may / might slide in, allows → allow, meter drops */
export const SConvincing: React.FC<SlideProps> = (props) => {
  const b = props.build;
  return (
    <Frame props={props}>
      <div className="w6cv">
        <Meter pct={b >= 1 ? 62 : 100} />
        <div className={`card w6cv-sent ${b >= 1 ? 'hedged' : ''}`}>
          Doing internships{' '}
          {b >= 1 && <span className="w6cv-ins" key="ins"><span className="w6cv-hw">can / may / might</span><span className="w6cv-tag">hedging language</span></span>}
          {' '}allow<span className={b >= 1 ? 'w6cv-s' : ''}>s</span> people to develop soft skills.
        </div>
      </div>
    </Frame>
  );
};

/* ---- 2.2a Practice 1: hedging chips, auto-graded ------------------------------------------- */
export const SHedge: React.FC<SlideProps> = (props) => {
  const key = props.step.key;
  const [fx, burst] = useBurst();
  const act = useActivity(key, 'all');
  const [pick, setPick] = useDraft<Record<string, string>>(`${key}:pick`, {});
  const [open, setOpen] = useOpenSlot();
  const blanks = HEDGE.flatMap((c) => c.blanks);
  const last = new Map((act.latest?.lines || []).map((l) => [l.id, l]));
  const showKey = props.revealed || act.locked;
  const lockedUi = act.locked || act.paused;
  const done = blanks.filter((x) => pick[x.id]).length;
  const submit = async () => {
    const lines = blanks.map((x) => ({ id: x.id, label: `${x.before} ___ ${x.after}`.trim(), value: pick[x.id] || '—', correct: hedgeOk(x, pick[x.id]) }));
    const right = lines.filter((l) => l.correct).length;
    const a = await act.submit({
      answer: { ...pick }, lines, isCorrect: right === blanks.length, score: right, maxScore: blanks.length, scoreDisplay: `${right}/${blanks.length} đúng`,
      models: blanks.map((x) => ({ id: x.id, label: x.type, value: x.model, correct: true })),
    });
    if (a?.isCorrect) burst();
  };
  const bar = <SubmitBar act={act} ready={done === blanks.length} hint={`Chọn đủ ${blanks.length} chỗ trống (${done}/${blanks.length})`} label={act.latest ? 'Nộp lại' : 'Nộp bài'} onSubmit={submit} />;
  return (
    <Frame props={props} bar={bar} fx={fx}>
      <div className="w6hg">
        {HEDGE.map((c, k) => (
          <div key={c.id} className={`card w6hg-card enter d${k + 1}`}>
            <div className="w6hg-orig">
              <span className="w6-n">{k + 1}</span>
              <span className="w6hg-ot">{c.orig.map(([t, m], i) => (m ? <span key={i} className="w6hg-abs">{t}</span> : <React.Fragment key={i}>{t}</React.Fragment>))}</span>
              {(act.latest || showKey) && <span className="w6hg-types">{[...new Set(c.blanks.map((x) => x.type))].map((t) => <span key={t} className="w6hg-type">{t}</span>)}</span>}
            </div>
            {c.blanks.map((x) => {
              const r = last.get(x.id);
              const st = r ? (r.correct ? 'ok' : 'try') : showKey ? 'key' : '';
              const val = showKey && !r?.correct ? (pick[x.id] && hedgeOk(x, pick[x.id]) ? pick[x.id] : x.ok[0]) : pick[x.id];
              return (
                <div key={x.id} className="w6hg-line">
                  <span className="w6hg-arr">→</span>
                  <span className="w6hg-s">
                    {x.before && <>{x.before} </>}
                    <Slot value={val} options={c.bank} open={open === x.id} onOpen={() => !lockedUi && setOpen(open === x.id ? null : x.id)}
                      onPick={(o) => { setPick((p) => ({ ...p, [x.id]: o })); setOpen(null); }} state={st as never} disabled={lockedUi} label={`Chỗ trống: ${x.before} … ${x.after}`} />
                    {' '}{x.after}
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </Frame>
  );
};

/* ---- 2.3 make it more specific: one sentence, one detail per build ---------------------------- */
const ArtSpecific: React.FC<{ b: number }> = ({ b }) => (
  <svg viewBox="0 0 300 150" className="w6sp-svg" aria-hidden="true">
    {/* 0: a crowd → students (caps) */}
    <g className={`w6sp-l ${b === 0 ? 'on' : ''}`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i} transform={`translate(${50 + i * 50} 70)`}>
          <circle cx="0" cy="0" r="12" fill="#fff" stroke="#3b3d54" strokeWidth="2.5" />
          <path d="M-16 50c0-18 7-28 16-28s16 10 16 28" fill="#fff" stroke="#3b3d54" strokeWidth="2.5" />
          <g className={`w6sp-cap${i % 2 ? '' : ' fade'}`} style={{ animationDelay: `${0.4 + i * 0.1}s` }}><path d="M-15 -12l15-7 15 7-15 7z" fill="#3b3d54" /><path d="M11 -10v9" stroke="#d63a43" strokeWidth="2" /></g>
        </g>
      ))}
      <circle className="w6sp-lens" cx="0" cy="0" r="34" />
    </g>
    {/* 1: valuable = a gem lights up */}
    <g className={`w6sp-l ${b === 1 ? 'on' : ''}`}>
      <path d="M120 50h60l18 22-48 52-48-52z" fill="#fdf1f1" stroke="#d63a43" strokeWidth="3" strokeLinejoin="round" />
      <path d="M102 72h96M132 50l18 74 18-74" fill="none" stroke="#d63a43" strokeWidth="2" />
      {[0, 1, 2].map((i) => <path key={i} className="w6sp-spark" d={`M${210 + i * 18} ${40 + i * 22} l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3z`} fill="#e4a23a" style={{ animationDelay: `${i * 0.3}s` }} />)}
    </g>
    {/* 2: soft skills → time management (clock) + task organisation (checklist) */}
    <g className={`w6sp-l ${b === 2 ? 'on' : ''}`}>
      <g className="w6sp-ic i1"><circle cx="100" cy="76" r="36" fill="#fff" stroke="#3b3d54" strokeWidth="3" /><path d="M100 54v22l14 10" stroke="#d63a43" strokeWidth="4" strokeLinecap="round" fill="none" /></g>
      <g className="w6sp-ic i2"><rect x="168" y="38" width="66" height="78" rx="8" fill="#fff" stroke="#3b3d54" strokeWidth="3" />
        {[0, 1, 2].map((i) => <g key={i}><path d={`M180 ${58 + i * 20}l5 5 8-9`} stroke="#2e9e46" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" /><path d={`M200 ${60 + i * 20}h22`} stroke="#b8b9c6" strokeWidth="3" strokeLinecap="round" /></g>)}</g>
    </g>
  </svg>
);
const SPEC_STEPS = ['use specific noun', 'add adj', 'add examples'];
export const SSpecificDemo: React.FC<SlideProps> = (props) => {
  const b = props.build;
  const tag = (i: number) => <span key={'t' + i} className={`w6sp-tag ${b === i ? 'cur' : 'past'}`}>{SPEC_STEPS[i]}</span>;
  return (
    <Frame props={props}>
      <div className="w6sp">
        <div className="w6sp-art"><ArtSpecific b={b} /></div>
        <div className="card w6sp-sent">
          Doing internships can allow{' '}
          <span className="w6sp-slot">{b >= 0 && <span className="w6sp-old">people</span>}<span className="w6sp-add" key="a0">university students</span>{tag(0)}</span>
          {' '}to develop{' '}
          {b >= 1 && <span className="w6sp-slot"><span className="w6sp-add" key="a1">valuable</span>{tag(1)}</span>}
          {b >= 1 && ' '}soft skills{b >= 2 ? '' : '.'}
          {b >= 2 && <span className="w6sp-slot"><span className="w6sp-add" key="a2">, such as time management and task organisation.</span>{tag(2)}</span>}
        </div>
      </div>
    </Frame>
  );
};

/* ---- 2.3a Practice 2: make it more specific (4 frames, graded together) --------------------- */
export const SSpecific: React.FC<SlideProps> = (props) => {
  const key = props.step.key;
  const [fx, burst] = useBurst();
  const [v, setV] = useDraft<Record<string, string>>(`${key}:v`, {});
  const items = SPECIFIC.map((it, k) => ({ id: it.id, label: `Câu ${k + 1}`, prompt: it.orig, context: it.context, answer: frameAnswer(it, v), models: it.models, check: frameCheck(it, v) }));
  const s = useAiSet(props, items, burst);
  const lockedUi = s.act.locked || s.act.paused;
  const w = (t: string) => `calc(${Math.max(6, t.length) * 0.6}em + 20px)`;
  return (
    <Frame props={props} bar={s.bar} fx={fx}>
      {s.graded ? (
        <GradedList s={s} rows={SPECIFIC.map((it, k) => ({ id: it.id, n: k + 1, answer: items[k].answer, tool: it.tool, models: it.models }))} />
      ) : (
        <div className="w6fr">
          {SPECIFIC.map((it, k) => (
            <div key={it.id} className={`card w6fr-card enter d${k + 1}`}>
              <div className="w6fr-h"><span className="w6-n">{k + 1}</span><span className="w6fr-orig">{it.orig}</span></div>
              <div className="w6fr-frame">
                {it.frame.map((p, i) => (typeof p === 'string'
                  ? <React.Fragment key={i}>{p}</React.Fragment>
                  : <input key={i} className="w6fr-in" value={v[it.id + p.b] || ''} placeholder={p.ph} disabled={lockedUi} style={{ width: w(v[it.id + p.b] || p.ph) }}
                      onChange={(e) => setV((x) => ({ ...x, [it.id + p.b]: e.target.value }))} aria-label={`Câu ${k + 1}, chỗ trống ${p.b === 'a' ? 1 : 2}`} />))}
              </div>
              {s.showModels && <><span className="w6fr-tool">{it.tool}</span><div className="w6-model">✓ Câu mẫu: {it.models[0]}</div></>}
            </div>
          ))}
        </div>
      )}
    </Frame>
  );
};

/* ---- 2.4 Extra practice: improve a paragraph ------------------------------------------------
   Build 1–5: the teacher walks through sentence [1]–[5] (the current one is lit, the others are dimmed but can still be done);
   each underlined part is a slot: tap → pick the better wording (or keep it). One submission, auto-graded per sentence.
   Build 6: the whole improved paragraph, the added parts in red. */
export const SParaImprove: React.FC<SlideProps> = (props) => {
  const key = props.step.key;
  const b = props.build;
  const [fx, burst] = useBurst();
  const act = useActivity(key, 'all');
  const [pick, setPick] = useDraft<Record<string, string>>(`${key}:pick`, {});
  const [open, setOpen] = useOpenSlot();
  const slots = paraSlots();
  const last = new Map((act.latest?.lines || []).map((l) => [l.id, l]));
  const showKey = props.revealed || act.locked;
  const lockedUi = act.locked || act.paused;
  const done = slots.filter((s) => pick[s.id] !== undefined).length;
  const okOf = (sid: string) => PARA.find((s) => s.id === sid)!.parts.filter((p): p is ParaSlot => typeof p !== 'string').every((p) => slotOk(p, pick[p.id]));
  const submit = async () => {
    const lines = PARA.map((s) => ({ id: s.id, label: `[${s.n}]`, value: paraSentence(s, pick), correct: okOf(s.id) }));
    const right = lines.filter((l) => l.correct).length;
    const a = await act.submit({
      answer: { ...pick }, lines, isCorrect: right === PARA.length, score: right, maxScore: PARA.length, scoreDisplay: `${right}/${PARA.length} câu đúng`,
      models: PARA.map((s) => ({ id: s.id, label: `[${s.n}]`, value: paraModel(s), correct: true })),
    });
    if (a?.isCorrect) burst();
  };
  const bar = <SubmitBar act={act} ready={done === slots.length} hint={`Chọn đủ ${slots.length} chỗ (${done}/${slots.length})`} label={act.latest ? 'Nộp lại' : 'Nộp bài'} onSubmit={submit} />;

  if (b >= 5) {
    return (
      <Frame props={props} bar={bar} fx={fx}>
        <div className="card w6pi-final enter">
          <div className="w6-lab">Improved paragraph</div>
          <p className="w6pi-ptext">
            {PARA_TOPIC}*{' '}
            {PARA.map((s) => (
              <React.Fragment key={s.id}>
                {s.parts.map((p, i) => (typeof p === 'string' ? <React.Fragment key={i}>{p}</React.Fragment> : <span key={i} className="w6pi-add" style={{ animationDelay: `${0.2 + i * 0.1}s` }}>{slotText(p.ok)}</span>))}
                <sup className="w6pi-sup">[{s.n}]</sup>{' '}
              </React.Fragment>
            ))}
          </p>
          <p className="w6-cap">* Câu chủ đề giới thiệu tổng quát về đoạn nên chưa cần cụ thể.</p>
        </div>
      </Frame>
    );
  }
  return (
    <Frame props={props} bar={bar} fx={fx}>
      <div className="w6pi">
        <div className="w6pi-topic">{PARA_TOPIC}* <small>câu chủ đề, giữ nguyên</small></div>
        {PARA.map((s, k) => {
          const r = last.get(s.id);
          const cls = k === b ? 'cur' : 'dim';
          return (
            <div key={s.id} className={`card w6pi-row ${cls}${r ? (r.correct ? ' ok' : ' try') : ''}${open && s.parts.some((p) => typeof p !== 'string' && p.id === open) ? ' menu' : ''}`}>
              <span className="w6pi-n">[{s.n}]</span>
              <span className="w6pi-s">
                {s.parts.map((p, i) => {
                  if (typeof p === 'string') return <React.Fragment key={i}>{p}</React.Fragment>;
                  const chosen = pick[p.id];
                  const st = r ? (slotOk(p, chosen) ? 'ok' : 'try') : showKey ? 'key' : '';
                  const val = showKey && !(r && slotOk(p, chosen)) ? slotText(p.ok) || '(giữ nguyên)' : chosen === undefined ? undefined : slotText(chosen) || '(giữ nguyên)';
                  return (
                    <Slot key={i} value={val} empty={p.orig ? p.orig : '+'} options={p.opts} open={open === p.id}
                      onOpen={() => !lockedUi && setOpen(open === p.id ? null : p.id)} onPick={(o) => { setPick((x) => ({ ...x, [p.id]: o })); setOpen(null); }}
                      state={st as never} disabled={lockedUi} label={`Câu ${s.n}: ${p.orig || 'thêm chi tiết'}`} />
                  );
                })}
              </span>
              {r && <span className={`w6pi-vd ${r.correct ? 'ok' : 'try'}`}>{r.correct ? '✓' : '!'}</span>}
            </div>
          );
        })}
      </div>
    </Frame>
  );
};
