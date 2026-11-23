/* Slide building blocks a lesson uses. Logical slide = 1280 × 720; the body under the
   header is about 1212 × 560. One focus per slide; the sentence/question is the biggest thing. */
import React from 'react';
import type { LessonMeta, Role, StepMeta } from '../types';

export interface SlideProps {
  step: StepMeta;
  lesson: LessonMeta;
  /** Current build (0-based) of a theory slide */
  build: number;
  /** Teacher opened the answer for the class ("Mở đáp án") */
  revealed: boolean;
  view: Role;
  /** Jump to a build of this step (slides that draw their own pager or tabs). */
  setBuild?: (n: number) => void;
  /** Cover only: go to the first stage */
  onStart?: () => void;
}

export type SlideRegistry = Record<string, React.FC<SlideProps>>;

/** Shows children from build `at` on (theory slides). Keeps layout space with `keep`. */
export const Build: React.FC<{ at: number; build: number; keep?: boolean; className?: string; style?: React.CSSProperties; children: React.ReactNode }> = ({ at, build, keep, className = '', style, children }) => {
  if (build < at) return keep ? <div className={className} style={{ ...style, visibility: 'hidden' }} aria-hidden="true">{children}</div> : null;
  return <div className={`enter ${className}`} style={style}>{children}</div>;
};

/** Body area of a slide: centers its content vertically so short content never leaves a hole. */
export const SlideBody: React.FC<{ children: React.ReactNode; style?: React.CSSProperties; center?: boolean }> = ({ children, style, center = true }) => (
  <div style={{ flex: 1, minHeight: 0, padding: '18px 34px 26px', display: 'flex', flexDirection: 'column', justifyContent: center ? 'center' : 'flex-start', ...style }}>{children}</div>
);

export const Card: React.FC<{ children: React.ReactNode; style?: React.CSSProperties; className?: string }> = ({ children, style, className = '' }) => (
  <div className={`card ${className}`} style={{ padding: '22px 26px', ...style }}>{children}</div>
);

export const Label: React.FC<{ children: React.ReactNode; green?: boolean; style?: React.CSSProperties }> = ({ children, green, style }) => (
  <div className={green ? 'lblg' : 'lbl'} style={style}>{children}</div>
);

/** Default cover slide built from lesson meta. */
export const CoverSlide: React.FC<SlideProps> = ({ lesson, onStart, view }) => (
  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 48, padding: '40px 64px', position: 'relative', overflow: 'hidden' }}>
    <span className="deco" style={{ right: 70, top: 60, width: 18, height: 18, borderRadius: '50%', background: '#f3c9cb' }} />
    <span className="deco" style={{ right: 180, bottom: 70, width: 12, height: 12, borderRadius: '50%', background: '#f5b83d', animationDelay: '-2s' }} />
    <div style={{ flex: 1, minWidth: 0 }}>
      <div className="lbl enter">{lesson.course}</div>
      <h1 className="enter d1" style={{ margin: '14px 0 10px', fontSize: 58, lineHeight: 1.08, fontWeight: 800, color: '#3b3d54', letterSpacing: '-.02em' }}>
        {lesson.title.split(' ').slice(0, -1).join(' ')} <span className="hl">{lesson.title.split(' ').slice(-1)}</span>
      </h1>
      <p className="enter d2" style={{ margin: 0, fontSize: 19, color: '#6b6d82', fontWeight: 600 }}>{lesson.subtitle}</p>
      {lesson.outcomes && (
        <ul className="enter d3" style={{ margin: '26px 0 0', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {lesson.outcomes.map((o) => (
            <li key={o} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 17, color: '#3b3d54', lineHeight: 1.5 }}>
              <span style={{ width: 22, height: 22, borderRadius: 7, background: '#e8f4ea', color: '#23703a', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, flex: 'none', marginTop: 2 }}>✓</span>{o}
            </li>
          ))}
        </ul>
      )}
      {onStart && <button className="btn btn-red enter d4" style={{ marginTop: 30, height: 52, fontSize: 17, padding: '0 26px' }} onClick={onStart}>{view === 'teacher' ? 'Mở Chặng 1' : 'Bắt đầu bài học'} →</button>}
    </div>
    <div className="col enter d3" style={{ width: 400, gap: 10 }}>
      {lesson.stages.map((s, i) => (
        <div key={s.n} className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, animation: `rise .5s ${0.25 + i * 0.08}s both` }}>
          <span className="num" style={{ width: 34, height: 34, fontSize: 15 }}>{s.n}</span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 16.5, fontWeight: 800, color: '#3b3d54' }}>{s.name}</div>
            {s.sub && <div style={{ fontSize: 13.5, color: '#6b6d82', lineHeight: 1.4 }}>{s.sub}</div>}
          </div>
        </div>
      ))}
    </div>
  </div>
);

/** Default stage divider built from lesson meta. */
export const DividerSlide: React.FC<SlideProps> = ({ step, lesson }) => {
  const stage = lesson.stages.find((s) => s.n === step.stage);
  if (!stage) return null;
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18, textAlign: 'center', position: 'relative', overflow: 'hidden', padding: 40 }}>
      <span className="deco" style={{ left: 120, top: 110, width: 16, height: 16, borderRadius: '50%', background: '#f3c9cb' }} />
      <span className="deco" style={{ right: 140, bottom: 120, width: 22, height: 22, borderRadius: 7, background: '#fde7a9', animationDelay: '-2s' }} />
      <div style={{ width: 128, height: 128, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 58, fontWeight: 800, animation: 'pop .6s both', backgroundColor: '#d63a43', backgroundImage: 'radial-gradient(circle, rgba(255,255,255,.22) 1.5px, transparent 2px)', backgroundSize: '16px 16px', border: '6px solid #fff', boxShadow: '0 0 0 1.5px #f3c9cb, 0 8px 0 #b0262e' }}>{stage.n}</div>
      <div className="lbl enter d1">Chặng {stage.n}</div>
      <h1 className="enter d2" style={{ margin: 0, fontSize: 52, fontWeight: 800, color: '#3b3d54', letterSpacing: '-.02em' }}>{stage.name}</h1>
      {stage.sub && <p className="enter d3" style={{ margin: 0, fontSize: 20, color: '#6b6d82', fontWeight: 600, maxWidth: 760 }}>{stage.sub}</p>}
      {stage.topics && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginTop: 8 }}>
          {stage.topics.map((t, i) => <span key={t} className="ex" style={{ background: '#fdf1f1', color: '#b0262e', animationDelay: `${0.35 + i * 0.07}s` }}>{t}</span>)}
        </div>
      )}
    </div>
  );
};

/** Planet scene: labels orbit a planet (e.g. tools that rotate). Up to 4 labels. */
export const OrbitScene: React.FC<{ labels: { text: string; color: string; bg: string; border: string }[] }> = ({ labels }) => (
  <div className="pspace">
    {[[60, 60, 0], [560, 48, 1.2], [610, 330, 0.6], [40, 370, 1.8], [300, 26, 2.4], [520, 410, 0.3]].map(([l, t, d], i) => (
      <span key={i} className="pstar" style={{ left: l, top: t, animationDelay: `${d}s` }} />
    ))}
    <svg style={{ position: 'absolute', inset: 0, zIndex: 0 }} width="640" height="460" viewBox="0 0 640 460" aria-hidden="true"><path d="M50 230 A270 92 0 0 1 590 230" fill="none" stroke="#e6e5e1" strokeWidth="2" strokeDasharray="3 9" strokeLinecap="round" /></svg>
    <svg style={{ position: 'absolute', inset: 0, zIndex: 1 }} width="640" height="460" viewBox="0 0 640 460" aria-hidden="true"><g transform="rotate(-14 320 230)"><path d="M190 230 A130 30 0 0 1 450 230" fill="none" stroke="#f5b83d" strokeWidth="7" strokeLinecap="round" opacity=".55" /></g></svg>
    <div className="planet">
      <span className="crater" style={{ left: 34, top: 92, width: 22, height: 22 }} />
      <span className="crater" style={{ left: 104, top: 42, width: 14, height: 14 }} />
      <span className="crater" style={{ left: 112, top: 118, width: 11, height: 11 }} />
    </div>
    <svg style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none' }} width="640" height="460" viewBox="0 0 640 460" aria-hidden="true"><g transform="rotate(-14 320 230)"><path d="M450 230 A130 30 0 0 1 190 230" fill="none" stroke="#f5b83d" strokeWidth="7" strokeLinecap="round" opacity=".9" /></g></svg>
    <svg style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none' }} width="640" height="460" viewBox="0 0 640 460" aria-hidden="true"><path d="M590 230 A270 92 0 0 1 50 230" fill="none" stroke="#e9636a" strokeWidth="2" strokeDasharray="3 9" strokeLinecap="round" opacity=".7" /></svg>
    {labels.slice(0, 4).map((l, i) => (
      <span key={l.text} className="pcard" style={{ color: l.color, background: l.bg, borderColor: l.border, animationDelay: `${-4 * i}s` }}>{l.text}</span>
    ))}
  </div>
);

/** Word-by-word swap: build n replaces word n (0-based) of `from` with `to`. */
export const WordSwap: React.FC<{ from: [string, number?][]; to: [string, number?][]; build: number; size?: number }> = ({ from, to, build, size = 34 }) => (
  <p style={{ margin: 0, fontSize: size, lineHeight: 1.7, fontWeight: 700, color: '#3b3d54', textAlign: 'center' }}>
    {from.map(([text, idx], i) => {
      if (idx === undefined) return <span key={i}>{text}</span>;
      const swapped = build > idx;
      const next = to[i]?.[0] || text;
      return swapped
        ? <span key={i} className="slot on"><span className="flipw" key={`s${i}`}>{next}</span><span className="from">{text}</span></span>
        : <span key={i} className={`slot${build === idx ? ' cur' : ''}`}>{text}</span>;
    })}
  </p>
);
