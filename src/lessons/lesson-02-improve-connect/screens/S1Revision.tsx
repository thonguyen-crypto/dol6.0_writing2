/* Stage 1 · Revision — 1.1 Revision (Parts: 4 criteria · DOL's 4 steps) · 1.2 Revision: build a sentence */
import React from 'react';
import type { SlideProps } from '../../../kit/slides';
import { STEPS4, WARM_KEYS } from '../logic';
import { CritTree, Frame, Parts, type Part } from '../runtime';

/* ---- 4-step drawings (same set as Lesson 1 · 4.1, so the two lessons look like one series) ---- */
const ArtMeaning = () => (
  <svg viewBox="0 0 220 140" className="w6s4-svg" aria-hidden="true">
    <circle cx="40" cy="98" r="20" className="w6s4-head" />
    <path d="M16 140c0-16 10-22 24-22s24 6 24 22" className="w6s4-head" />
    <circle cx="66" cy="78" r="4" className="w6s4-dot d1" /><circle cx="78" cy="64" r="6" className="w6s4-dot d2" />
    <g className="w6s4-cloud">
      <path d="M92 58c-14 0-18-20-4-26 0-16 22-22 30-10 8-12 30-10 32 4 16-2 22 20 8 26 6 12-8 20-18 14-6 10-26 10-32 0-10 6-24 0-16-8z" fill="#fff" stroke="#3b3d54" strokeWidth="3" strokeLinejoin="round" />
      <path d="M104 34h44M104 44h56M104 54h34" className="w6s4-line" />
    </g>
    <g className="w6s4-bulb">
      <circle cx="192" cy="26" r="20" className="w6s4-glow" />
      <path d="M192 12a11 11 0 0 1 7 19v5h-14v-5a11 11 0 0 1 7-19z" fill="#fdf5e4" stroke="#946207" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M186 40h12" stroke="#946207" strokeWidth="2.5" strokeLinecap="round" />
    </g>
  </svg>
);
const ArtSV = () => (
  <svg viewBox="0 0 220 140" className="w6s4-svg" aria-hidden="true">
    <g className="w6s4-s"><rect x="34" y="44" width="72" height="50" rx="10" fill="#fff" stroke="#3b3d54" strokeWidth="3" /><text x="70" y="78" textAnchor="middle" className="w6s4-big">S</text></g>
    <g className="w6s4-v"><rect x="114" y="44" width="72" height="50" rx="10" fill="#fdf1f1" stroke="#d63a43" strokeWidth="3" /><text x="150" y="78" textAnchor="middle" className="w6s4-big r">V</text></g>
    <path d="M34 108v8h152v-8" className="w6s4-brace" />
    <text x="110" y="134" textAnchor="middle" className="w6s4-sm w6s4-capt">1 chủ ngữ + 1 động từ chính</text>
  </svg>
);
const ArtLook = () => (
  <svg viewBox="0 0 220 140" className="w6s4-svg" aria-hidden="true">
    <path d="M110 30c-20-12-52-12-80-4v96c28-8 60-8 80 4 20-12 52-12 80-4V26c-28-8-60-8-80 4z" fill="#fff" stroke="#3b3d54" strokeWidth="3" strokeLinejoin="round" />
    <path d="M110 30v96" stroke="#3b3d54" strokeWidth="2.5" />
    {[48, 64, 80, 96].map((y, i) => <path key={y} d={`M44 ${y}h52M124 ${y}h52`} className={`w6s4-txt${i === 2 ? ' hit' : ''}`} />)}
    <rect x="120" y="73" width="60" height="14" rx="4" className="w6s4-hl" />
    <g className="w6s4-mag"><circle cx="0" cy="0" r="17" fill="rgba(255,255,255,.35)" stroke="#3b3d54" strokeWidth="4" /><path d="M12 12l16 16" stroke="#3b3d54" strokeWidth="6" strokeLinecap="round" /></g>
  </svg>
);
const ArtCombine = () => (
  <svg viewBox="0 0 220 140" className="w6s4-svg" aria-hidden="true">
    <g className="w6s4-p p1"><rect x="14" y="20" width="50" height="30" rx="8" fill="#fff" stroke="#3b3d54" strokeWidth="2.5" /><text x="39" y="40" textAnchor="middle" className="w6s4-sm b">S</text></g>
    <g className="w6s4-p p2"><rect x="84" y="8" width="50" height="30" rx="8" fill="#fdf1f1" stroke="#d63a43" strokeWidth="2.5" /><text x="109" y="28" textAnchor="middle" className="w6s4-sm b r">V</text></g>
    <g className="w6s4-p p3"><rect x="150" y="24" width="60" height="30" rx="8" fill="#fdf5e4" stroke="#946207" strokeWidth="2.5" /><text x="180" y="44" textAnchor="middle" className="w6s4-sm b">+ sth</text></g>
    <rect x="14" y="80" width="192" height="36" rx="18" className="w6s4-bar" />
    <g className="w6s4-bartxt"><text x="40" y="104" textAnchor="middle" className="w6s4-sm b">S</text><text x="74" y="104" textAnchor="middle" className="w6s4-sm b r">V</text><text x="124" y="104" textAnchor="middle" className="w6s4-sm b">+ sth</text></g>
    <g className="w6s4-ok"><circle cx="186" cy="98" r="14" fill="#2e9e46" /><path d="M179 98l5 5 9-10" stroke="#fff" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" /></g>
  </svg>
);
const S4ART = [ArtMeaning, ArtSV, ArtLook, ArtCombine];

/* 1.1 part 1: the 4 criteria — language (LR, GRA) learnt last time */
const RevCrit: React.FC<SlideProps> = (props) => (
  <Frame props={props}>
    <CritTree done={['lr', 'gra']} />
  </Frame>
);
/* 1.1 part 2: DOL's 4 steps, all at once (revision) */
const RevSteps: React.FC<SlideProps> = (props) => (
  <Frame props={props}>
    <div className="w6s4 rev">
      <div className="w6s4-track" aria-hidden="true"><i style={{ width: '100%' }} /></div>
      {STEPS4.map((s, i) => {
        const Art = S4ART[i];
        return (
          <div key={s.n} className="card w6s4-card done play" style={{ animationDelay: `${i * 0.18}s` }}>
            <div className="w6s4-art"><Art /></div>
            <div className="w6s4-h"><span className="w6-n">{s.n}</span><span className="w6s4-name">{s.name}</span></div>
            <div className="w6s4-vi">{s.vi}</div>
            {s.tool && <div className="w6s4-tools">{s.tool.split(' · ').map((t) => <span key={t}>{t}</span>)}</div>}
          </div>
        );
      })}
    </div>
  </Frame>
);
const REV_PARTS: Part[] = [
  { C: RevCrit, n: 1, kind: 'theory', pre: 'Revision:', key: '4 criteria', vi: 'Buổi trước: 2 tiêu chí ngôn ngữ' },
  { C: RevSteps, n: 1, kind: 'theory', pre: 'Revision:', key: "DOL's 4 steps", vi: 'Chiến lược viết một câu đúng' },
];
export const SRevision: React.FC<SlideProps> = (props) => <Parts props={props} parts={REV_PARTS} />;

/* 1.2 — own drawing: an intern at a desk; while working, skill bubbles (talk, clock, checklist) grow above the head */
export const InternScene: React.FC<{ small?: boolean }> = ({ small }) => (
  <svg className={`w6in${small ? ' sm' : ''}`} viewBox="0 0 360 250" aria-hidden="true">
    <rect x="0" y="0" width="360" height="226" rx="22" fill="#f6f5f2" />
    <ellipse cx="180" cy="232" rx="160" ry="10" fill="#e9e8e3" />
    {/* window + office plant */}
    <rect x="232" y="26" width="96" height="70" rx="8" fill="#eef2fb" stroke="#3b3d54" strokeWidth="3" />
    <path d="M280 26v70M232 61h96" stroke="#3b3d54" strokeWidth="2" />
    <rect x="300" y="168" width="24" height="30" rx="4" fill="#fff" stroke="#3b3d54" strokeWidth="3" />
    <path d="M312 168c-14-20-4-34 0-40 4 6 14 20 0 40zM312 168c-20-8-22-22-20-30 8 2 22 10 20 30z" fill="#cfe8d5" stroke="#23703a" strokeWidth="2.5" />
    {/* desk + laptop */}
    <rect x="92" y="170" width="190" height="12" rx="4" fill="#3b3d54" />
    <path d="M110 182v44M264 182v44" stroke="#3b3d54" strokeWidth="5" strokeLinecap="round" />
    <rect x="178" y="132" width="70" height="40" rx="5" fill="#fff" stroke="#3b3d54" strokeWidth="3" />
    <path d="M190 146h40M190 156h28" className="w6in-type" />
    {/* intern with a badge */}
    <g className="w6in-p">
      <circle cx="140" cy="110" r="18" fill="#f1dccb" stroke="#3b3d54" strokeWidth="3" />
      <path d="M122 106c2-12 10-17 18-17s16 5 18 15c-8-4-13-5-18-5s-11 2-18 7z" fill="#3b3d54" />
      <path d="M116 170c0-24 10-36 24-36s24 12 24 36z" fill="#fff" stroke="#3b3d54" strokeWidth="3" />
      <rect x="146" y="146" width="14" height="10" rx="2" fill="#d63a43" />
      <path d="M160 152l20 4" stroke="#3b3d54" strokeWidth="4" strokeLinecap="round" className="w6in-arm" />
    </g>
    {/* skill bubbles grow */}
    <g className="w6in-b b1"><circle cx="96" cy="52" r="22" fill="#fff" stroke="#3b3d54" strokeWidth="2.5" /><path d="M84 46h24M84 54h16" stroke="#8b8da1" strokeWidth="3" strokeLinecap="round" /><path d="M90 72l-6 8 12-6" fill="#fff" stroke="#3b3d54" strokeWidth="2.5" strokeLinejoin="round" /></g>
    <g className="w6in-b b2"><circle cx="150" cy="34" r="22" fill="#fff" stroke="#3b3d54" strokeWidth="2.5" /><circle cx="150" cy="34" r="12" fill="none" stroke="#d63a43" strokeWidth="2.5" /><path d="M150 27v7l5 4" stroke="#d63a43" strokeWidth="2.5" strokeLinecap="round" fill="none" /></g>
    <g className="w6in-b b3"><circle cx="204" cy="56" r="22" fill="#fff" stroke="#3b3d54" strokeWidth="2.5" /><path d="M194 50l4 4 7-8M194 62l4 4 7-8" stroke="#2e9e46" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" /><path d="M208 52h8M208 64h8" stroke="#8b8da1" strokeWidth="2.5" strokeLinecap="round" /></g>
  </svg>
);

/* 1.2 — keywords → the student's sentence (right) → "Đúng, nhưng chưa hay!" → back to the 4 criteria (TR, CC left) */
/* 1.2 Revision: build a sentence — the same moving sequence as Lesson 1 · 4.2 Demo, one screen, each finished step leaves.
   1 picture + 3 keywords · 2 Meaning · 3 S – V · 4 pattern (allow sb to do sth) · 5 collocation: ___ soft skills → develop
   6 Combine · 7 "Đúng, nhưng chưa hay!" · 8 back to the 4 criteria: LR, GRA ✓, TR and CC still "?" */
const STEP_NAMES = ['Meaning', 'S – V', 'Pattern + Collocation', 'Combine'];
const WARM_VI = ['Đi thực tập', 'giúp', 'người ta', 'phát triển', 'kỹ năng mềm.'];
export const SWarmup: React.FC<SlideProps> = (props) => {
  const b = props.build;
  const stepAt = b <= 3 ? b : b === 4 ? 3 : Math.min(b - 1, 5);
  const sc = (i: number) => `w6d-sc${b === i ? ' on' : b > i ? ' gone' : ''}`;
  const cols = [
    { vi: 'Đi thực tập', role: 'S', cls: 'rS', en: <>Doing internships</> },
    { vi: 'giúp', role: 'V', cls: 'rV', en: <>allows</> },
    { vi: '(người ta) phát triển kỹ năng mềm', role: b === 3 ? 'pattern' : '', cls: b >= 3 ? 'rP' : 'rx',
      en: b >= 4 ? <>people <i>to</i> <span className="w6wc-slot"><span className="q">?</span><span className="w">develop</span></span> soft skills</>
        : b >= 3 ? <>somebody <i>to</i> do something</> : <>…</> },
  ];
  return (
    <Frame props={props}>
      <ol className="w6d-steps">
        {STEP_NAMES.map((n, i) => (
          <li key={n} className={stepAt === i + 1 ? 'cur' : stepAt > i + 1 ? 'done' : ''}><span className="w6-n">{stepAt > i + 1 ? '✓' : i + 1}</span>{n}</li>
        ))}
      </ol>
      <div className="w6d-stage">
        {/* 0 · picture + keywords */}
        <div className={sc(0)}>
          <div className="w6d-pict big w6w-pict"><InternScene /></div>
          <div className="w6w-keys">
            {WARM_KEYS.map((k, i) => (
              <React.Fragment key={k}>
                {i > 0 && <span className="w6w-dash">–</span>}
                <span className="w6w-key" style={{ animationDelay: `${0.3 + i * 0.25}s` }}>{k}</span>
              </React.Fragment>
            ))}
          </div>
        </div>
        {/* 1 · meaning */}
        <div className={sc(1)}>
          <div className="w6d-mean">
            <div className="w6d-pict sm w6w-pict"><InternScene small /></div>
            <div className="w6d-vi">{WARM_VI.map((w, i) => <span key={w} style={{ animationDelay: `${0.25 + i * 0.22}s` }}>{w}</span>)}</div>
          </div>
        </div>
        {/* 2–3 · S – V, then the pattern of allow */}
        <div className={`w6d-sc${b >= 2 && b <= 4 ? ' on' : b > 4 ? ' gone' : ''}`}>
          <div className="w6d-sv">
            {cols.map((c, i) => (
              <div key={i} className={`w6d-col ${c.cls}`} style={{ animationDelay: `${0.15 + i * 0.25}s` }}>
                <span className="w6d-cvi">{c.vi}</span>
                <span className="w6d-arr" style={{ animationDelay: `${0.45 + i * 0.25}s` }}>↓</span>
                <span key={c.cls + (i === 2 && b >= 4 ? 'c' : '')} className="w6d-cen" style={{ animationDelay: i === 2 && b >= 3 ? '.15s' : `${0.6 + i * 0.25}s` }}>{c.en}</span>
                <span key={'r' + c.role} className="w6d-role" style={{ animationDelay: i === 2 && b >= 3 ? '.35s' : `${0.85 + i * 0.25}s`, visibility: c.role ? 'visible' : 'hidden' }}>{c.role || '·'}</span>
                {i === 2 && b === 3 && <span className="w6d-src">Oxford · allow (v)</span>}
                {i === 2 && b === 4 && <span className="w6d-src" key="oz">Ozdic · skill (n): <b>develop</b> / acquire ~ skills</span>}
              </div>
            ))}
          </div>
        </div>
        {/* 4–5 · combine, then the verdict */}
        <div className={`w6d-sc${b === 5 || b === 6 ? ' on' : b > 6 ? ' gone' : ''}`}>
          <div className="w6d-two">
            <div className="w6d-pair w6w-pair">
              <div className="w6d-big s"><span className="w6d-role">S</span><span>Doing internships</span></div>
              <div className="w6d-big v"><span className="w6d-role">V</span><span>allows people <i>to</i> <i>develop</i> soft skills</span></div>
              <span className="w6d-ok">✓</span>
              {b >= 6 && <span className="w6w-stamp" key="st">Đúng, nhưng chưa hay!</span>}
            </div>
            <div className="w6d-tag2"><b>Do → Doing</b>: V-ing làm chủ ngữ · <b>allow</b> somebody <b>to</b> do something · <b>develop</b> skills</div>
          </div>
        </div>
        {/* 6 · back to the 4 criteria */}
        <div className={sc(7)}>
          {b >= 7 && <CritTree done={['lr', 'gra']} cur={['tr', 'cc']} ask />}
        </div>
      </div>
    </Frame>
  );
};
