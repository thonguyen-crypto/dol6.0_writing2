/* Stage 5 · Conclusion — 5.1 the 4 criteria · 5.2 Summary (Parts: Improve a sentence · Connect sentences) · 5.3 Homework */
import React from 'react';
import type { SlideProps } from '../../../kit/slides';
import { CritTree, Frame, Parts, type Part } from '../runtime';

/* 5.1 — LR, GRA from Lesson 1 (✓), TR and CC from today (red) */
export const SCriteria: React.FC<SlideProps> = (props) => (
  <Frame props={props}>
    <CritTree done={['lr', 'gra']} cur={['tr', 'cc']} />
  </Frame>
);

/* 5.2 — two mind maps, one per part: root → branches → tools */
interface Branch { name: string; tools: string[] }
const MindMap: React.FC<{ root: string; branches: Branch[] }> = ({ root, branches }) => (
  <div className="w6mm">
    <div className="w6mm-root">{root}</div>
    <svg className="w6mm-br" viewBox="0 0 100 300" preserveAspectRatio="none" aria-hidden="true">
      {branches.map((_, i) => {
        const y = branches.length === 2 ? 75 + i * 150 : 50 + i * 100;
        return <path key={i} d={`M0 150 C50 150 50 ${y} 100 ${y}`} style={{ animationDelay: `${0.15 + i * 0.2}s` }} />;
      })}
    </svg>
    <div className="w6mm-rows">
      {branches.map((b, i) => (
        <div key={b.name} className="w6mm-row" style={{ animationDelay: `${0.35 + i * 0.25}s` }}>
          <span className="w6mm-name">{b.name}</span>
          <span className="w6mm-tools">{b.tools.map((t) => <i key={t}>{t}</i>)}</span>
        </div>
      ))}
    </div>
  </div>
);
const SumImprove: React.FC<SlideProps> = (props) => (
  <Frame props={props}>
    <MindMap root="Improve a sentence" branches={[
      { name: 'make it more convincing', tools: ['hedging language'] },
      { name: 'make it more specific', tools: ['add adj, add adv', 'add examples', 'add relative clauses', 'use specific nouns'] },
    ]} />
  </Frame>
);
const SumConnect: React.FC<SlideProps> = (props) => (
  <Frame props={props}>
    <MindMap root="Connect sentences" branches={[
      { name: 'with linking words', tools: ['explanation', 'effects', 'examples'] },
      { name: 'without linking words', tools: ['This + verb pattern'] },
      { name: 'other structures', tools: [', which + V', ', meaning that S V', ', thereby V-ing', ', and thus S V'] },
    ]} />
  </Frame>
);
const SUM_PARTS: Part[] = [
  { C: SumImprove, n: 1, kind: 'theory', pre: 'Summary:', key: 'improve a sentence', vi: 'Task Response' },
  { C: SumConnect, n: 1, kind: 'theory', pre: 'Summary:', key: 'connect sentences', vi: 'Coherence & Cohesion' },
];
export const SSummary: React.FC<SlideProps> = (props) => <Parts props={props} parts={SUM_PARTS} />;

/* 5.3 — homework ticket: a laptop where a sentence gets better and the next one hooks on with "This", beside a checklist that ticks itself */
const LmsArt = () => (
  <svg viewBox="0 0 300 210" className="w6z-lms" aria-hidden="true">
    <rect x="30" y="14" width="240" height="150" rx="12" fill="#fff" stroke="#3b3d54" strokeWidth="3" />
    <rect x="30" y="14" width="240" height="26" rx="12" fill="#f4f4f2" />
    <circle cx="48" cy="27" r="4" fill="#d63a43" /><circle cx="62" cy="27" r="4" fill="#e4a23a" /><circle cx="76" cy="27" r="4" fill="#2e9e46" />
    <text x="250" y="31" textAnchor="end" className="w6z-lmst">LMS</text>
    <path d="M10 172h280l-16 18H26z" fill="#e9e8e3" stroke="#3b3d54" strokeWidth="3" strokeLinejoin="round" />
    {([['Internships', 90, 74, '#fff', '#3b3d54'], ['can', 44, 74, '#fdf1f1', '#d63a43', 148], ['allow students …', 150, 108, '#fff', '#3b3d54'], ['This', 54, 142, '#d63a43', '#d63a43'], ['enables them …', 130, 142, '#fff', '#3b3d54', 112]] as const).map(([t, w, y, f, s, x], i) => (
      <g key={String(t)} className="w6z-blk" style={{ animationDelay: `${0.3 + i * 0.45}s` }}>
        <rect x={x ?? 48} y={y - 20} width={w} height="28" rx="8" fill={f} stroke={s} strokeWidth="2" />
        <text x={(x ?? 48) + 10} y={y - 1} className="w6z-blkt" style={t === 'This' ? { fill: '#fff' } : undefined}>{t}</text>
      </g>
    ))}
    <g className="w6z-done"><circle cx="240" cy="70" r="15" fill="#2e9e46" /><path d="M233 70l5 5 9-10" stroke="#fff" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" /></g>
  </svg>
);
const HW_STEPS = [
  { name: 'Build a sentence', vi: 'Câu nào cũng đúng: đi đủ 4 bước' },
  { name: 'Improve meaning', vi: 'Thuyết phục hơn (hedging), cụ thể hơn' },
  { name: 'Connect sentences', vi: 'Linking words, This + V, which / thereby' },
];
export const SHomework: React.FC<SlideProps> = (props) => (
  <Frame props={props}>
    <div className="w6z-hw">
      <div className="card w6z-hwart enter"><LmsArt /></div>
      <div className="card w6z-hwcard enter d1">
        <span className="w6z-badge red">LMS Assignment</span>
        <div className="w6z-hwt">Build a sentence + Connect sentences</div>
        <ol className="w6z-check">
          {HW_STEPS.map((s, i) => (
            <li key={s.name} style={{ animationDelay: `${0.5 + i * 0.45}s` }}>
              <span className="w6z-box" style={{ animationDelay: `${0.9 + i * 0.45}s` }}>✓</span>
              <span><b>{s.name}</b> · {s.vi}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  </Frame>
);
