/* Stage 3 · Connect sentences with linking words
   3.1 Coherence & Cohesion (criteria tree) · 3.2 Find the linking words (tap, auto) · 3.3 3 functions · 3.3a Small practice (chips, auto) */
import React from 'react';
import type { SlideProps } from '../../../kit/slides';
import { useActivity, useDraft } from '../../../kit/activities/useActivity';
import { LINKS, LINK_FNS, LW_BANK, LW_PRACTICE, OUTLINE, PARA_LINK, lwOk, type LinkFn } from '../logic';
import { CritTree, Frame, Slot, SubmitBar, useBurst, useOpenSlot } from '../runtime';

/* 3.1 */
export const SCC: React.FC<SlideProps> = (props) => (
  <Frame props={props}>
    <CritTree done={['tr', 'lr', 'gra']} cur={['cc']} />
  </Frame>
);

/* the outline card (3.2, 3.3); `lit` = which part of the outline the current function connects */
const FN_VI: Record<LinkFn, string> = { explain: 'giải thích', example: 'ví dụ', effect: 'kết quả' };
const Outline: React.FC<{ lit?: LinkFn | null; compact?: boolean }> = ({ lit, compact }) => (
  <div className={`card w6ol${compact ? ' compact' : ''}`}>
    <div className="w6ol-tag">Outline</div>
    <div className={`w6ol-row${lit === 'explain' ? ' lit' : ''}`}><b>Idea</b><span>{OUTLINE.idea}</span></div>
    <div className={`w6ol-row${lit === 'explain' ? ' lit' : ''}${lit === 'effect' ? ' arrows' : ''}`}><b>Expand</b>
      <span>{OUTLINE.expand.map((t, i) => <React.Fragment key={i}>{i > 0 && <i className="w6ol-arr"> ⇒ </i>}{t}</React.Fragment>)}</span></div>
    <div className={`w6ol-row${lit === 'example' ? ' lit' : ''}${lit === 'effect' ? ' arrows' : ''}`}><b>Example</b>
      <span>{OUTLINE.example.map((t, i) => <React.Fragment key={i}>{i > 0 && <i className="w6ol-arr"> ⇒ </i>}{t}</React.Fragment>)}</span></div>
  </div>
);

/* 3.2 — tap the words that link the sentences; a device counts as found when any of its words is tapped */
export const SFindLinks: React.FC<SlideProps> = (props) => {
  const key = props.step.key;
  const [fx, burst] = useBurst();
  const act = useActivity(key, 'all');
  const [sel, setSel] = useDraft<number[]>(`${key}:sel`, []);
  const graded = !!act.latest;
  const showKey = props.revealed || act.locked;
  const lockedUi = act.locked || act.paused;
  const found = (id: number) => sel.some((i) => PARA_LINK[i].link === id);
  const wrong = sel.filter((i) => PARA_LINK[i].link === undefined);
  const toggle = (i: number) => { if (!lockedUi) setSel((s) => (s.includes(i) ? s.filter((x) => x !== i) : [...s, i])); };
  const submit = async () => {
    const lines = LINKS.map((l) => ({ id: String(l.id), label: l.text, value: found(l.id) ? l.text : '—', correct: found(l.id) }));
    const right = lines.filter((l) => l.correct).length;
    const ok = right === LINKS.length && !wrong.length;
    const a = await act.submit({
      answer: { picked: sel.map((i) => PARA_LINK[i].t).join(' · ') },
      lines: [...lines, ...(wrong.length ? [{ id: 'x', label: 'Chạm nhầm', value: wrong.map((i) => PARA_LINK[i].t).join(', '), correct: false }] : [])],
      isCorrect: ok, score: Math.max(0, right - wrong.length), maxScore: LINKS.length,
      scoreDisplay: `${right}/${LINKS.length} công cụ${wrong.length ? ` · ${wrong.length} chỗ chạm nhầm` : ''}`,
      models: LINKS.map((l) => ({ id: String(l.id), label: FN_VI[l.fn], value: l.text, correct: true })),
    });
    if (a?.isCorrect) burst();
  };
  const bar = <SubmitBar act={act} ready={sel.length > 0} hint="Chạm vào các từ dùng để nối câu" label={act.latest ? 'Nộp lại' : 'Nộp bài'} onSubmit={submit} />;
  return (
    <Frame props={props} bar={bar} fx={fx}>
      <div className="w6fl">
        <Outline compact />
        <div className="card w6fl-para">
          <div className="w6fl-tag">Finished paragraph</div>
          <p className="w6fl-text">
            {PARA_LINK.map((t, i) => {
              const on = sel.includes(i);
              const link = t.link !== undefined ? LINKS[t.link] : null;
              let st = on ? 'sel' : '';
              if (graded || showKey) {
                if (link && (found(link.id) || showKey)) st = 'ok';
                else if (on && !link) st = 'bad';
              }
              const lastTok = link && PARA_LINK[i + 1]?.link !== t.link;
              return (
                <React.Fragment key={i}>
                  <button className={`w6fl-w ${st}`} onClick={() => toggle(i)} disabled={lockedUi}>{t.t}</button>
                  {lastTok && st.startsWith('ok') && <span className="w6fl-fn">{FN_VI[link.fn]}</span>}{' '}
                </React.Fragment>
              );
            })}
          </p>
        </div>
      </div>
    </Frame>
  );
};

/* 3.3 — each build lights one part of the outline and opens the words that introduce it; earlier functions fold into chips */
export const SLinkFns: React.FC<SlideProps> = (props) => {
  const b = props.build;
  const cur = LINK_FNS[Math.min(b, 2)];
  return (
    <Frame props={props}>
      <div className="w6lf">
        <Outline lit={cur.fn} />
        <div className="w6lf-r">
          {LINK_FNS.map((f, i) => (
            <div key={f.fn} className={`card w6lf-card fn-${f.fn} ${i < b ? 'past' : i === b ? 'cur' : 'w6-hide'}`}>
              <div className="w6lf-h"><span className="w6lf-name">{f.name}</span>{i === b && <span className="w6lf-vi">{f.vi}</span>}</div>
              <div className="w6lf-words">
                {f.words.map((w, k) => <span key={w} className="w6lf-w" style={{ animationDelay: `${0.2 + k * 0.15}s` }}><b>{w.replace(/ S V\.$/, '')}</b> S V.</span>)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
};

/* 3.3a — choose a linking word for each gap (any word of the right function, as on the previous page) */
export const SLwPractice: React.FC<SlideProps> = (props) => {
  const key = props.step.key;
  const b = props.build;
  const [fx, burst] = useBurst();
  const act = useActivity(key, 'all');
  const [pick, setPick] = useDraft<Record<string, string>>(`${key}:pick`, {});
  const [open, setOpen] = useOpenSlot();
  const gaps = LW_PRACTICE.gaps;
  const last = new Map((act.latest?.lines || []).map((l) => [l.id, l]));
  const showKey = props.revealed || act.locked;
  const lockedUi = act.locked || act.paused;
  const done = gaps.filter((g) => pick[g.id]).length;
  const submit = async () => {
    const lines = gaps.map((g) => ({ id: g.id, label: FN_VI[g.fn], value: pick[g.id] || '—', correct: lwOk(g.fn, pick[g.id]) }));
    const right = lines.filter((l) => l.correct).length;
    const a = await act.submit({
      answer: { ...pick }, lines, isCorrect: right === gaps.length, score: right, maxScore: gaps.length, scoreDisplay: `${right}/${gaps.length} đúng`,
      models: gaps.map((g) => ({ id: g.id, label: FN_VI[g.fn], value: g.model, correct: true })),
    });
    if (a?.isCorrect) burst();
  };
  const bar = <SubmitBar act={act} ready={done === gaps.length} hint={`Chọn đủ ${gaps.length} chỗ trống (${done}/${gaps.length})`} label={act.latest ? 'Nộp lại' : 'Nộp bài'} onSubmit={submit} />;
  return (
    <Frame props={props} bar={bar} fx={fx}>
      <div className="w6lp">
        <div className={`w6lp-first ${b >= 1 ? 'w6-past' : ''}`}>{LW_PRACTICE.first}</div>
        {gaps.map((g) => {
          const r = last.get(g.id);
          const st = r ? (r.correct ? 'ok' : 'try') : showKey ? 'key' : '';
          const val = showKey && !r?.correct ? g.model : pick[g.id];
          return (
            <div key={g.id} className={`card w6lp-row${open === g.id ? ' menu' : ''}${b >= 1 ? ' w6-past' : ''}`}>
              <Slot value={val} options={LW_BANK} open={open === g.id} onOpen={() => !lockedUi && setOpen(open === g.id ? null : g.id)}
                onPick={(o) => { setPick((p) => ({ ...p, [g.id]: o })); setOpen(null); }} state={st as never} disabled={lockedUi} label={`Từ nối trước: ${g.after.slice(0, 40)}…`} wide />
              <span className="w6lp-s">{g.after}</span>
              {(r || showKey) && <span className="w6fl-fn need">cần: {FN_VI[g.fn]}</span>}
            </div>
          );
        })}
        {b >= 1 && (
          <div className="w6lp-formula enter">
            <span className="w6lp-lw">Linking word,</span><span className="w6lp-plus">+</span><span className="w6lp-sv">S – V</span>
          </div>
        )}
      </div>
    </Frame>
  );
};
