/* Stage 3 · Connect sentences with linking words
   3.1 Coherence & Cohesion (criteria tree) · 3.1 part 2 outline → paragraph demo · 3.2 3 functions · 3.2a Small practice (chips, auto; pattern shows once all right) */
import React from 'react';
import type { SlideProps } from '../../../kit/slides';
import { useActivity, useDraft } from '../../../kit/activities/useActivity';
import { LINKS, LINK_FNS, LINK_SEGS, LW_BANK, LW_PRACTICE, OUTLINE, OUTLINE_ITEMS, lwOk, type LinkFn } from '../logic';
import { CritTree, Frame, Parts, Slot, SubmitBar, useBurst, useOpenSlot, type Part } from '../runtime';

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

/* 3.1 part 2 — GV demo, no submission. Each build lights one outline item and writes its sentence into the
   paragraph; the linking word that opens the sentence pops in. Earlier links stay marked. */
export const SFindLinks: React.FC<SlideProps> = (props) => {
  const b = props.build;
  let prev = '';
  return (
    <Frame props={props}>
      <div className="w6fl w6fd">
        <div className="card w6ol w6fd-ol">
          <div className="w6ol-tag">Outline</div>
          {OUTLINE_ITEMS.map((it, i) => {
            const head = it.blk !== prev; prev = it.blk;
            return (
              <div key={i} className={`w6fd-item${i <= b ? ' on' : ''}${i === b ? ' cur' : ''}${head ? ' head' : ''}`}>
                <b className="w6fd-blk">{head ? it.blk : <i className="w6ol-arr">⇒</i>}</b>
                <span>{it.t}</span>
              </div>
            );
          })}
        </div>
        <div className="card w6fl-para">
          <div className="w6fl-tag">Finished paragraph</div>
          <p className="w6fl-text w6fd-text">
            {LINK_SEGS.slice(0, b + 1).map((sg, i) => {
              const link = sg.link !== undefined ? LINKS[sg.link] : null;
              return (
                <span key={i} className={`w6fd-seg${i === b ? ' cur' : ''}`}>
                  {link && <><span className="w6fd-lw">{link.text}</span>{' '}</>}
                  {sg.text}{' '}
                </span>
              );
            })}
          </p>
        </div>
      </div>
    </Frame>
  );
};

/* 3.3 drawing: the outline as three blocks; a linking word is the joint that snaps into the gap between two blocks.
   Build 1: "This is because" joins Idea → Expand · Build 2: "For example," joins Expand → Example ·
   Build 3: the ⇒ arrows inside the blocks become joints too (As a result / and thus / Therefore). A spark runs down the joints that are in. */
const FlowMap: React.FC<{ b: number }> = ({ b }) => {
  const joint = (on: boolean, cur: boolean, text: string) => (
    <div className={`w6fm-gap${on ? ' on' : ''}${cur ? ' cur' : ''}`}>
      <span className="w6fm-rail" />
      {on && <span className="w6fm-chip" key={text}>{text}</span>}
      {on && <span className="w6fm-spark" />}
    </div>
  );
  /** the ⇒ inside a block becomes these words in build 3 (as in the finished paragraph of 3.2) */
  const arrows = (parts: string[], effect: boolean, words: string[]) => parts.map((t, i) => (
    <React.Fragment key={i}>
      {i > 0 && (effect ? <span className="w6fm-arr on">{words[i - 1]}</span> : <i className="w6ol-arr"> ⇒ </i>)}
      {t}
    </React.Fragment>
  ));
  return (
    <div className="w6fm">
      <div className="card w6fm-node"><b>Idea</b><span>{OUTLINE.idea}</span></div>
      {joint(b >= 0, b === 0, 'This is because')}
      <div className={`card w6fm-node${b === 2 ? ' fx' : ''}`}><b>Expand</b><span>{arrows(OUTLINE.expand, b >= 2, ['As a result', 'and thus'])}</span></div>
      {joint(b >= 1, b === 1, 'For example,')}
      <div className={`card w6fm-node${b === 2 ? ' fx' : ''}`}><b>Example</b><span>{arrows(OUTLINE.example, b >= 2, ['Therefore'])}</span></div>
    </div>
  );
};

/* 3.3 — each build lights one part of the outline and opens the words that introduce it; earlier functions fold into chips */
export const SLinkFns: React.FC<SlideProps> = (props) => {
  const b = props.build;
  const cur = LINK_FNS[Math.min(b, 2)];
  return (
    <Frame props={props}>
      <div className="w6lf">
        <FlowMap b={b} />
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
/* drawing for 3.2a. Before: the topic — a phone in class pinging with chats while the book sits closed.
   After all three are right: one stamp prints the same "LW," block onto three sentence bars, over and over = 1 pattern only. */
const LwPhone: React.FC = () => (
  <svg className="w6la" viewBox="0 0 220 220" aria-hidden="true">
    <rect x="18" y="150" width="184" height="12" rx="6" fill="#e9e7e1" />
    <g className="w6la-book"><rect x="34" y="122" width="74" height="28" rx="5" fill="#f4f4f2" stroke="#3b3d54" strokeWidth="3" /><path d="M71 124v24" stroke="#3b3d54" strokeWidth="3" /></g>
    <g className="w6la-phone">
      <rect x="128" y="62" width="52" height="88" rx="10" fill="#3b3d54" />
      <rect className="w6la-screen" x="134" y="72" width="40" height="64" rx="4" fill="#fdf1f1" />
      <circle cx="154" cy="143" r="3" fill="#fff" />
    </g>
    {[0, 1, 2].map((i) => (
      <g key={i} className={`w6la-ping p${i}`}>
        <rect x={i === 1 ? 70 : 96} y={i === 2 ? 46 : 20} width="56" height="26" rx="13" fill="#d63a43" />
        {[0, 1, 2].map((d) => <circle key={d} cx={(i === 1 ? 86 : 112) + d * 12} cy={(i === 2 ? 59 : 33)} r="3" fill="#fff" />)}
      </g>
    ))}
  </svg>
);
/* the message drawing: one stamp prints the same "LW," block onto three sentence bars, over and over */
const LwStamp: React.FC = () => (
  <svg className="w6la w6la-st" viewBox="0 0 220 200" aria-hidden="true">
    {[0, 1, 2].map((i) => (
      <g key={i} transform={`translate(18 ${82 + i * 40})`}>
        <rect width="184" height="26" rx="8" fill="#f4f4f2" />
        <rect className={`w6la-ink i${i}`} x="4" y="4" width="56" height="18" rx="5" fill="#d63a43" />
        <rect x="70" y="10" width="100" height="6" rx="3" fill="#c9c8d2" />
      </g>
    ))}
    <g className="w6la-stamp">
      <rect x="34" y="10" width="16" height="30" rx="5" fill="#3b3d54" />
      <rect x="22" y="38" width="40" height="14" rx="4" fill="#3b3d54" />
      <rect x="22" y="50" width="40" height="6" rx="2" fill="#d63a43" />
    </g>
  </svg>
);

/* 3.2a — choose the linking word for each gap (any word of the right function). Build 2 (a click): everything else
   blurs and the message takes the centre: "Linking word, + S V" ×3 — correct, but every sentence has the same pattern. */
export const SLwPractice: React.FC<SlideProps> = (props) => {
  const key = props.step.key;
  const [fx, burst] = useBurst();
  const act = useActivity(key, 'all');
  const [pick, setPick] = useDraft<Record<string, string>>(`${key}:pick`, {});
  const [open, setOpen] = useOpenSlot();
  const gaps = LW_PRACTICE.gaps;
  const last = new Map((act.latest?.lines || []).map((l) => [l.id, l]));
  const showKey = props.revealed || act.locked;
  const lockedUi = act.locked || act.paused;
  const done = gaps.filter((g) => pick[g.id]).length;
  const pattern = props.build >= 1;
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
      <div className={`w6lp-wrap${pattern ? ' w6lp-on' : ''}`}>
      <div className="w6lp">
        <div className="w6lp-main">
          <p className="w6lp-first">{LW_PRACTICE.first}</p>
          {gaps.map((g, i) => {
            const r = last.get(g.id);
            const st = r ? (r.correct ? 'ok' : 'try') : showKey ? 'key' : '';
            const val = showKey && !r?.correct ? g.model : pick[g.id];
            return (
              <p key={g.id} className={`card w6lp-row r${i}${open === g.id ? ' menu' : ''}`}>
                <Slot value={val} options={LW_BANK} open={open === g.id} onOpen={() => !lockedUi && setOpen(open === g.id ? null : g.id)}
                  onPick={(o) => { setPick((p) => ({ ...p, [g.id]: o })); setOpen(null); }} state={st as never} disabled={lockedUi} label={`Từ nối trước: ${g.after.slice(0, 40)}…`} wide />
                {' '}<span className="w6lp-s">{g.after}</span>
              </p>
            );
          })}
        </div>
        <LwPhone />
      </div>
      {pattern && (
        <div className="w6lp-msg" role="note">
          <LwStamp />
          <div className="w6lp-formula">
            <span className="w6lp-lw">Linking word,</span><span className="w6lp-plus">+</span><span className="w6lp-sv">S V</span>
          </div>
          <div className="w6lp-x">× 3 câu · cùng 1 pattern → đơn điệu</div>
        </div>
      )}
      </div>
    </Frame>
  );
};

/* 3.1 Demo: Linking words — one page, two parts: Coherence & Cohesion · find the linking words (activity) */
const LDEMO_PARTS: Part[] = [
  { C: SCC, n: 1, kind: 'theory', pre: 'Next:', key: 'Coherence & Cohesion', vi: 'Nối các câu với nhau' },
  { C: SFindLinks, n: 6, kind: 'theory', pre: 'From outline to', key: 'paragraph', vi: 'Mỗi ý trong dàn bài thành một câu, linking word nối câu' },
];
export const SLinkDemo: React.FC<SlideProps> = (props) => <Parts props={props} parts={LDEMO_PARTS} />;
