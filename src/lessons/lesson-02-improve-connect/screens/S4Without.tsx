/* Stage 4 · Connect sentences without linking words
   4.1 Mindset A → B, B → C · 4.2 This + verb pattern · 4.3 Effects (verb patterns)
   4.3a / 4.3b This + verb pattern, typed (auto) · 4.3c write This + V (AI)
   4.4 Structures · 4.4a Common mistake: thereby V-ing · 4.4b write with structures (AI) · 4.5 / 4.6 write a paragraph (AI) */
import React, { useEffect, useState } from 'react';
import type { SlideProps } from '../../../kit/slides';
import { useActivity, useDraft } from '../../../kit/activities/useActivity';
import { precheck } from '../checks';
import {
  EFFECT_TOP, PARA_WRITE, STRUCTS, STRUCT_A, STRUCT_WRITE, THEREBY, THIS_DEMO, THIS_WRITE, TYPE_NEG, TYPE_POS, VGROUPS,
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

/* 4.2 — Build 1: sentence + "As a result," · Build 2: the linking word leaves, "This" + verb pattern takes its place · Build 3: the verb card flips; formula */
export const SThisVerb: React.FC<SlideProps> = (props) => {
  const b = props.build;
  return (
    <Frame props={props}>
      <div className="w6tv">
        <div className="card w6tv-a"><span className="w6ch-dot c-a sm">A</span>{THIS_DEMO.a}</div>
        <div className="w6tv-b">
          {b === 0 ? (
            <><span className="w6tv-lw">{THIS_DEMO.lw}</span><span className="w6tv-rest">{THIS_DEMO.lwRest}</span></>
          ) : (
            <>
              <span className="w6tv-lw out" aria-hidden="true">{THIS_DEMO.lw}</span>
              <span className="w6tv-thisw"><span className="w6tv-ghost" aria-hidden="true" /><span className="w6tv-this">This</span><span className="w6tv-eq">= ý câu A</span></span>
              <span key={b >= 2 ? 'v2' : 'v1'} className={`w6tv-rest v${b >= 2 ? ' flip' : ''}`}>{b >= 2 ? THIS_DEMO.v2 : THIS_DEMO.v1}</span>
            </>
          )}
        </div>
        {b >= 2 && (
          <div className="w6tv-formula enter">
            <span className="w6tv-f this">this</span><span className="w6tv-plus">+</span><span className="w6tv-f vp">verb pattern</span><span className="w6tv-plus">→</span><span className="w6tv-f eff">Effects</span>
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
        <div className={`w6ef-top ${b === 0 ? 'cur' : ''}`}><span className="w6ef-tlab">Effects</span>{EFFECT_TOP.map((t) => <span key={t} className="w6ef-tp">{t}</span>)}</div>
        <svg className="w6ef-br" viewBox="0 0 1000 40" preserveAspectRatio="none" aria-hidden="true">
          <path d="M500 0v14H250v26" className={b >= 1 ? 'on' : ''} /><path d="M500 0v14H750v26" className={b >= 2 ? 'on' : ''} />
        </svg>
        <div className="w6ef-cols">{side('+', 1)}{side('-', 2)}</div>
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

/* ---- 4.3c write This + verb pattern (AI, 3 flows) ------------------------------------------------ */
export const SThisWrite: React.FC<SlideProps> = (props) => {
  const key = props.step.key;
  const [fx, burst] = useBurst();
  const [txt, setTxt] = useDraft<Record<string, string>>(`${key}:txt`, {});
  const items = THIS_WRITE.map((w, k) => ({ id: w.id, label: `Flow ${k + 1}`, prompt: w.flow!, context: w.context, answer: (txt[w.id] || '').trim(), models: w.models, check: precheck(txt[w.id] || '', w.flow!, w.rule) }));
  const s = useAiSet(props, items, burst);
  const lockedUi = s.act.locked || s.act.paused;
  return (
    <Frame props={props} bar={s.bar} fx={fx}>
      {s.graded ? (
        <GradedList s={s} rows={THIS_WRITE.map((w, k) => ({ id: w.id, n: k + 1, answer: items[k].answer, models: w.models }))} modelLabel="Đáp án tham khảo" />
      ) : (
        <div className="w6fw three">
          {THIS_WRITE.map((w, k) => (
            <div key={w.id} className={`card w6fw-card enter d${k + 1}`}>
              <div className="w6fw-h"><span className="w6-n">{k + 1}</span><span className="w6fw-need">{w.need}</span></div>
              <div className="w6fw-flow"><Flow text={w.flow!} /></div>
              <textarea className="ta w6fw-in" rows={w.rows || 3} value={txt[w.id] || ''} placeholder={w.placeholder} disabled={lockedUi}
                onChange={(e) => setTxt((t) => ({ ...t, [w.id]: e.target.value }))} aria-label={`Flow ${k + 1}`} />
              {s.showModels && <div className="w6-model">✓ {w.models[0]}</div>}
            </div>
          ))}
        </div>
      )}
    </Frame>
  );
};

/* ---- 4.4 structures ------------------------------------------------------------------------- */
/* Build 1: LW / this between two sentences → "limited range of structures" · Build 2: A → B → C in one sentence
   Build 3: the which group · Build 4: the thus group; the running example changes its ending */
/** the running example with a "joint" that keeps switching through the connectors of the group being taught */
const LiveStruct: React.FC<{ grp: 'which' | 'thus' }> = ({ grp }) => {
  const items = STRUCTS.filter((x) => x.group === grp);
  const [k, setK] = useState(0);
  useEffect(() => {
    setK(0);
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => setK((x) => (x + 1) % items.length), 2600);
    return () => clearInterval(t);
  }, [grp, items.length]);
  const x = items[k];
  return (
    <div className="card w6st-live">
      <span className="w6st-livepat" key={'p' + x.id}>{x.pat}</span>
      <span className="w6st-livesent">{STRUCT_A}<span className="w6st-joint" key={x.id}><Segs segs={x.end} /></span></span>
      <span className="w6st-dots">{items.map((it, i) => <i key={it.id} className={i === k ? 'on' : ''} />)}</span>
    </div>
  );
};
export const SStructs: React.FC<SlideProps> = (props) => {
  const b = props.build;
  return (
    <Frame props={props}>
      <div className="w6st">
        {b === 0 ? (
          <div className="w6ch" key="two">
            <div className="w6ch-row"><Dot n="A" /><Arr /><Dot n="B" /><Stop /><span className="w6ch-tool lw">LW</span><Arr /><Dot n="D" /></div>
            <div className="w6ch-row"><Dot n="A" /><Arr /><Dot n="B" /><Stop /><span className="w6ch-tool this">this</span><Arr /><Dot n="C" /></div>
            <div className="w6st-limited">Limited range of structures</div>
          </div>
        ) : (
          <>
            <div className={`w6ch-row one ${b === 1 ? 'cur' : 'small'}`} key="one">
              <Dot n="A" /><Arr delay={0.1} /><Dot n="B" delay={0.2} /><Arr delay={0.3} /><Dot n="C" delay={0.4} /><Stop />
              <span className="w6ch-note ok">1 câu</span>
            </div>
            {b >= 2 && <LiveStruct grp={b >= 3 ? 'thus' : 'which'} />}
            {b >= 2 && (
              <div className="w6st-groups">
                {(['which', 'thus'] as const).map((grp, gi) => (
                  <div key={grp} className={`card w6st-g ${b < 2 + gi ? 'w6-hide' : b === 2 + gi ? 'cur' : 'w6-past'}`}>
                    {STRUCTS.filter((x) => x.group === grp).map((x, i) => (
                      <div key={x.id} className="w6st-row" style={{ animationDelay: `${0.15 + i * 0.2}s` }}>
                        <span className="w6st-pat">{x.pat}</span>
                        <span className="w6st-ex">{STRUCT_A}<Segs segs={x.end} /></span>
                      </div>
                    ))}
                  </div>
                ))}
                {b >= 3 && <div className="w6st-eff enter">→ Effects</div>}
              </div>
            )}
          </>
        )}
      </div>
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
  { C: SThisVerb, n: 3, kind: 'theory', pre: 'Without linking words:', key: 'This + verb', vi: 'Thay linking word bằng This + động từ' },
  { C: SEffects, n: 3, kind: 'theory', pre: 'Effects:', key: 'verb patterns', vi: 'Những pattern diễn tả hệ quả hay dùng nhất trong IELTS' },
];
export const SThisVerbPage: React.FC<SlideProps> = (props) => <Parts props={props} parts={TV_PARTS} />;
