/* Stage 2 · Improve a sentence by meaning
   2.1 Improve by meaning · 2.2 Make it more convincing · 2.2a Practice 1 (hedging chips, auto)
   2.3 Make it more specific · 2.3a Practice 2 (AI, 4 frames on one slide) · 2.4 Extra practice: improve a paragraph (auto, sentence by sentence) */
import React from 'react';
import type { SlideProps } from '../../../kit/slides';
import { useActivity, useDraft } from '../../../kit/activities/useActivity';
import {
  HEDGE, HEDGE_TOOLS, PARA, PARA_TOPIC, SPEC_BASE, SPECIFIC, frameAnswer, frameCheck, hedgeOk, paraModel, paraSentence, paraSlots, slotOk, slotText, type ParaSlot,
} from '../logic';
import { HEDGE_VIZ } from './Viz';
import { Frame, GradedList, Parts, Segs, Slot, SubmitBar, rv, useAiSet, useBurst, useOpenSlot, type Part } from '../runtime';

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

/* 2.1 build 3 drawings (looping): a certainty gauge whose needle backs off from 100%; a lens that brings blurry bars into focus */
const ArtGauge = () => (
  <svg viewBox="0 0 220 120" className="w6i-art2" aria-hidden="true">
    <path d="M30 100 A80 80 0 0 1 190 100" fill="none" stroke="#ebeae6" strokeWidth="16" strokeLinecap="round" />
    <path className="w6i-gfill" d="M30 100 A80 80 0 0 1 190 100" fill="none" stroke="#d63a43" strokeWidth="16" strokeLinecap="round" />
    <g transform="translate(110 100)"><g className="w6i-needle"><path d="M0 0 L74 0" stroke="#3b3d54" strokeWidth="5" strokeLinecap="round" /></g></g>
    <circle cx="110" cy="100" r="9" fill="#3b3d54" />
    <path className="w6i-gspark" d="M182 28 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3z" fill="#f5b83d" />
  </svg>
);
const ArtLens = () => (
  <svg viewBox="0 0 220 120" className="w6i-art2" aria-hidden="true">
    <defs>
      <filter id="w6i-bl" x="-10%" y="-30%" width="120%" height="160%"><feGaussianBlur stdDeviation="3" /></filter>
      <clipPath id="w6i-lc"><circle className="w6i-lclip" cx="0" cy="0" r="34" /></clipPath>
    </defs>
    <g filter="url(#w6i-bl)" opacity=".8">
      <rect x="22" y="34" width="70" height="14" rx="7" fill="#cfcdd6" /><rect x="100" y="34" width="96" height="14" rx="7" fill="#cfcdd6" />
      <rect x="22" y="64" width="110" height="14" rx="7" fill="#cfcdd6" /><rect x="140" y="64" width="56" height="14" rx="7" fill="#cfcdd6" />
    </g>
    <g clipPath="url(#w6i-lc)">
      <circle className="w6i-lclip" cx="0" cy="0" r="34" fill="#fff" />
      <rect x="22" y="34" width="70" height="14" rx="7" fill="#3b3d54" /><rect x="100" y="34" width="96" height="14" rx="7" fill="#d63a43" />
      <rect x="22" y="64" width="110" height="14" rx="7" fill="#f5b83d" /><rect x="140" y="64" width="56" height="14" rx="7" fill="#3b3d54" />
      <circle cx="47" cy="41" r="3" fill="#fff" /><circle cx="160" cy="41" r="3" fill="#fff" /><circle cx="62" cy="71" r="3" fill="#fff" />
    </g>
    <g className="w6i-lens"><circle r="34" fill="none" stroke="#d63a43" strokeWidth="6" /><path d="M24 24 L44 44" stroke="#d63a43" strokeWidth="10" strokeLinecap="round" /></g>
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
            <div className="w6i-tree2" key="t">
              <div className="w6i-tr">Task Response</div>
              <svg className="w6i-br2" viewBox="0 0 600 60" preserveAspectRatio="none" aria-hidden="true"><path d="M300 0 V24 H150 V60" /><path d="M300 0 V24 H450 V60" /></svg>
              <div className="w6i-pair">
                {([['Avoid “overgeneralization”', 'convincing', <ArtGauge key="g" />], ['Add more details', 'specific', <ArtLens key="l" />]] as const).map(([how, k, art], i) => (
                  <div key={k} className="card w6i-wcard" style={{ animationDelay: `${0.3 + i * 0.25}s` }}>
                    <div className="w6i-wart">{art}</div>
                    <span className="w6i-how">{how}</span>
                    <span className="w6i-arr">↓</span>
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
/* 2.2 — the whole picture on the warm-up sentence: first make it more convincing, then more specific.
   Build 1: the sentence (meter at 100%) · Build 2: can (hedging), meter drops · Build 3–5: university students · valuable · such as … */
const LANES = [['convincing', 'make it more convincing'], ['specific', 'make it more specific']] as const;
const OV_SPEC = ['use specific noun', 'add adj', 'add examples'];
export const SOverview: React.FC<SlideProps> = (props) => {
  const b = props.build;
  const lane = (k: string) => (k === 'convincing' ? (b === 1 ? 'cur' : b > 1 ? 'done' : '') : b >= 2 && b < 4 ? 'cur' : b >= 4 ? 'cur done' : '');
  const tag = (i: number, text: string) => <span key={'t' + i} className={`w6sp-tag ${b === i ? 'cur' : 'gone'}`}>{text}</span>;
  return (
    <Frame props={props}>
      <div className="w6ov">
        <div className="w6ov-lanes">
          {LANES.map(([k, t]) => <span key={k} className={`w6ov-lane ${lane(k)}`}>{(k === 'convincing' ? b > 1 : b >= 4) && <span className="w6ov-ok">✓</span>}{t}</span>)}
        </div>
        <div className="w6ov-art">
          {b <= 1 ? <Meter pct={b >= 1 ? 62 : 100} /> : <div className="w6sp-art"><ArtSpecific b={b - 2} /></div>}
        </div>
        <div className="card w6sp-sent w6ov-sent">
          Doing internships{' '}
          {b >= 1 && <span className="w6sp-slot"><span className="w6sp-add" key="c">can</span>{tag(1, 'hedging language')}</span>}
          {b >= 1 && ' '}allow{b >= 1 ? '' : 's'}{' '}
          <span className="w6sp-slot">{b >= 2 ? <><span className="w6sp-old">people</span><span className="w6sp-add" key="a0">university students</span></> : 'people'}{b >= 2 && tag(2, OV_SPEC[0])}</span>
          {' '}to develop{' '}
          {b >= 3 && <span className="w6sp-slot"><span className="w6sp-add" key="a1">valuable</span>{tag(3, OV_SPEC[1])}</span>}
          {b >= 3 && ' '}soft skills{b >= 4 ? '' : '.'}
          {b >= 4 && <span className="w6sp-slot"><span className="w6sp-add" key="a2">, such as time management and task organisation.</span>{tag(4, OV_SPEC[2])}</span>}
        </div>
      </div>
    </Frame>
  );
};

/* 2.3 — the 4 hedging tools, one per build, each with its own example (not the warm-up sentence).
   The absolute word is crossed out, the hedge takes its place; earlier tools fold into one line. */
export const SConvincing: React.FC<SlideProps> = (props) => {
  const b = props.build;
  const cur = HEDGE_TOOLS[Math.min(b, HEDGE_TOOLS.length - 1)];
  const Viz = HEDGE_VIZ[cur.id];
  const word = (segs: typeof cur.before) => segs.find(([, m]) => m)?.[0] || '';
  return (
    <Frame props={props}>
      <div className="w6ht2">
        <div className="card w6ht-viz" key={cur.id}>
          <Viz />
          <div className="w6ht-swap"><s>{word(cur.before)}</s><span className="w6ht-swarr">→</span><b>{word(cur.after)}</b></div>
        </div>
        <div className="w6ht">
          {HEDGE_TOOLS.map((t, i) => (
            <div key={t.id} className={`card w6ht-card ${rv(b, i)}`}>
              <div className="w6ht-h"><span className="w6-n">{i + 1}</span><span className="w6ht-tool">{t.tool}</span><span className="w6ht-use">{t.use}</span></div>
              {i === b && <div className="w6ht-before"><Segs segs={t.before} /></div>}
              <div className="w6ht-after"><span className="w6ht-arr">→</span><Segs segs={t.after} /></div>
            </div>
          ))}
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
/* 2.4 — the techniques on a new sentence (fast food), one per build; the sentence grows, the drawing changes. */
const ArtFood: React.FC<{ b: number }> = ({ b }) => (
  <svg viewBox="0 0 300 150" className="w6sp-svg" aria-hidden="true">
    {/* 0: grown-ups → children */}
    <g className={`w6sp-l ${b === 0 ? 'on' : ''}`}>
      {[0, 1, 2, 3].map((i) => (
        <g key={i} transform={`translate(${62 + i * 58} ${i % 2 ? 84 : 70})`}>
          <circle cx="0" cy="0" r={i % 2 ? 10 : 12} fill="#fff" stroke="#3b3d54" strokeWidth="2.5" />
          <path d={i % 2 ? 'M-12 40c0-14 5-22 12-22s12 8 12 22' : 'M-16 54c0-18 7-30 16-30s16 12 16 30'} fill={i % 2 ? '#fdf1f1' : '#fff'} stroke={i % 2 ? '#d63a43' : '#3b3d54'} strokeWidth="2.5" className={i % 2 ? 'w6sp-kid' : 'w6sp-adult'} />
        </g>
      ))}
    </g>
    {/* 1: a processed burger in a box; fast, easy motion lines */}
    <g className={`w6sp-l ${b === 1 ? 'on' : ''}`}>
      <g className="w6sp-ic i1">
        <path d="M100 66a50 30 0 0 1 100 0z" fill="#f5b83d" stroke="#3b3d54" strokeWidth="3" />
        <rect x="96" y="70" width="108" height="12" rx="6" fill="#2e9e46" />
        <rect x="98" y="84" width="104" height="16" rx="6" fill="#b0262e" />
        <path d="M100 104h100a6 6 0 0 1-6 12H106a6 6 0 0 1-6-12z" fill="#f5b83d" stroke="#3b3d54" strokeWidth="3" />
        <circle cx="130" cy="52" r="2.5" fill="#fff" /><circle cx="152" cy="46" r="2.5" fill="#fff" /><circle cx="172" cy="54" r="2.5" fill="#fff" />
      </g>
      <g className="w6sp-ic i2"><path d="M218 70h40M226 86h40M218 102h40" stroke="#d63a43" strokeWidth="4" strokeLinecap="round" /></g>
    </g>
    {/* 2: every day = a calendar ticked day after day */}
    <g className={`w6sp-l ${b === 2 ? 'on' : ''}`}>
      <rect x="86" y="30" width="128" height="104" rx="12" fill="#fff" stroke="#3b3d54" strokeWidth="3" />
      <rect x="86" y="30" width="128" height="24" rx="12" fill="#d63a43" />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <path key={i} className="w6sp-tick" style={{ animationDelay: `${0.2 + i * 0.12}s` }} d={`M${100 + (i % 4) * 28} ${76 + Math.floor(i / 4) * 30}l5 5 9-10`} stroke="#d63a43" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      ))}
    </g>
    {/* 3: examples = a scale (obesity) and a drop (diabetes) */}
    <g className={`w6sp-l ${b === 3 ? 'on' : ''}`}>
      <g className="w6sp-ic i1"><rect x="70" y="54" width="76" height="70" rx="14" fill="#fff" stroke="#3b3d54" strokeWidth="3" /><path d="M86 80a22 22 0 0 1 44 0" fill="none" stroke="#3b3d54" strokeWidth="3" /><path d="M108 80l10-12" stroke="#d63a43" strokeWidth="4" strokeLinecap="round" /></g>
      <g className="w6sp-ic i2"><path d="M200 46c18 26 28 42 28 56a28 28 0 0 1-56 0c0-14 10-30 28-56z" fill="#fdf1f1" stroke="#d63a43" strokeWidth="3" strokeLinejoin="round" /><path d="M188 104a12 12 0 0 0 12 12" stroke="#d63a43" strokeWidth="3" fill="none" strokeLinecap="round" /></g>
    </g>
  </svg>
);
/* 2.3 — every step on a click. 1 the base sentence + the map of where to add detail
   2 Verb: + adverb → easily · 3 before the noun: + adjective → Processed · 4 the noun itself: a specific noun → children
   5 after the noun: + relative clause → who eat it every day · 6 … or + examples → such as obesity and diabetes (pick one) */
const SPEC_ART = [-1, 1, 1, 0, 2, 3];
export const SSpecificDemo: React.FC<SlideProps> = (props) => {
  const b = props.build;
  const st = (on: number[]) => (on.includes(b) ? ' cur' : b > Math.max(...on) ? ' done' : '');
  return (
    <Frame props={props}>
      <div className="w6sp">
        <div className="w6sp-art"><ArtFood b={SPEC_ART[b] ?? 3} /></div>
        <div className="w6sx">
          <div className="w6sx-g v">
            <b className="w6sx-k">Verb</b>
            <span className={`w6sx-i${st([1])}`}>{b > 1 && <i>✓</i>}+ adverb</span>
          </div>
          <div className="w6sx-g n">
            <b className="w6sx-k">Noun</b>
            <span className={`w6sx-i${st([2])}`}>{b > 2 && <i>✓</i>}<small>trước N</small>+ adjective</span>
            <span className={`w6sx-i${st([3])}`}>{b > 3 && <i>✓</i>}<small>chính N</small>specific noun</span>
            <span className={`w6sx-i${st([4, 5])}`}><small>sau N · chọn 1</small>
              <span className={b === 4 ? 'pick' : ''}>relative clause</span><em>hoặc</em><span className={b === 5 ? 'pick' : ''}>examples</span>
            </span>
          </div>
        </div>
        <div className="w6sp-base">{SPEC_BASE}</div>
        <div className="card w6sp-sent">
          {b >= 2 && <><span className="w6sp-add" key="adj">Processed</span>{' '}</>}
          {b >= 2 ? 'fast' : 'Fast'} food can{' '}
          {b >= 1 && <><span className="w6sp-add" key="adv">easily</span>{' '}</>}
          cause health problems{b === 5 && <span className="w6sp-add" key="ex">, such as obesity and diabetes,</span>}
          {' '}in {b >= 3 ? <>{b === 3 && <span className="w6sp-old">people</span>}<span className="w6sp-add" key="n">children</span></> : 'people'}
          {b === 4 && <>{' '}<span className="w6sp-add" key="rc">who eat it every day</span></>}.
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

/* 2.1 Demo — one page, two parts: improve by meaning · one sentence, 2 ways to improve */
const DEMO_PARTS: Part[] = [
  { C: SMeaning, n: 3, kind: 'theory', pre: 'Improve a sentence by', key: 'meaning', vi: 'Câu hay không phải vì từ khó, cấu trúc khó' },
  { C: SOverview, n: 5, kind: 'theory', pre: 'One sentence,', key: '2 ways to improve', vi: 'Thuyết phục hơn, rồi cụ thể hơn' },
];
export const SDemo: React.FC<SlideProps> = (props) => <Parts props={props} parts={DEMO_PARTS} />;
