/* Lesson 2 · drawings that act out the idea of a theory page (looping, no words; styles in ../viz.css).
   Each loop shows the "before" state, then the "after" state, so the picture says what the rule does. */
import React from 'react';

const INK = '#3b3d54', RED = '#d63a43', DRED = '#b0262e', YEL = '#f5b83d', YEL2 = '#fde7a9', PINK = '#fdf1f1', PINK2 = '#f3c9cb', GREY = '#cfcdd6';

/* ---------------------------------------------------------------- 2.3 hedging tools */
/** quantifier: All → Many. Ten people are all ticked, then three of them drop out. */
const VizQuantifier = () => {
  const out = new Set([2, 6, 9]);
  return (
    <svg viewBox="0 0 320 220" className="w6v" aria-hidden="true">
      {Array.from({ length: 10 }, (_, i) => {
        const x = 40 + (i % 5) * 60, y = 50 + Math.floor(i / 5) * 92;
        return (
          <g key={i} transform={`translate(${x} ${y})`}>
            <g className={`w6v-p${out.has(i) ? ' out' : ''}`}>
              <circle cx="0" cy="0" r="13" />
              <path d="M-20 56c0-22 9-34 20-34s20 12 20 34z" />
              <g className="w6v-tk"><circle cx="16" cy="-12" r="9" fill="#fff" /><path d="M11 -12l4 4 7-8" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></g>
            </g>
          </g>
        );
      })}
    </svg>
  );
};
/** modal verb: a certainty gauge, the needle backs off from 100% */
const VizModal = () => (
  <svg viewBox="0 0 320 220" className="w6v" aria-hidden="true">
    <path d="M50 170 A110 110 0 0 1 270 170" fill="none" stroke="#ebeae6" strokeWidth="22" strokeLinecap="round" />
    <path className="w6v-gfill" d="M50 170 A110 110 0 0 1 270 170" fill="none" stroke={RED} strokeWidth="22" strokeLinecap="round" />
    <g transform="translate(160 170)"><g className="w6v-needle"><path d="M0 0 L100 0" stroke={INK} strokeWidth="7" strokeLinecap="round" /></g></g>
    <circle cx="160" cy="170" r="13" fill={INK} />
    {[0, 45, 90, 135, 180].map((a) => { const r = Math.PI * a / 180; return <circle key={a} cx={160 - 134 * Math.cos(r)} cy={170 - 134 * Math.sin(r)} r="3" fill={GREY} />; })}
  </svg>
);
/** adverb of frequency: always → often. A week of ticked days, then some days lose their tick. */
const VizFreq = () => {
  const off = new Set([1, 3, 6]);
  return (
    <svg viewBox="0 0 320 220" className="w6v" aria-hidden="true">
      <rect x="18" y="50" width="284" height="130" rx="18" fill="#fff" stroke={INK} strokeWidth="3" />
      <rect x="18" y="50" width="284" height="30" rx="18" fill={RED} /><rect x="18" y="66" width="284" height="14" fill={RED} />
      <circle cx="80" cy="44" r="6" fill={INK} /><circle cx="240" cy="44" r="6" fill={INK} />
      {Array.from({ length: 7 }, (_, i) => (
        <g key={i} transform={`translate(${46 + i * 38} 128)`}>
          <rect x="-15" y="-24" width="30" height="48" rx="8" fill={PINK} />
          <path className={`w6v-dt${off.has(i) ? ' off' : ''}`} d="M-8 0l6 6 11-12" fill="none" stroke={RED} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" style={{ animationDelay: `${i * 0.08}s` }} />
        </g>
      ))}
    </svg>
  );
};
/** language of probability: will definitely → are likely to. Ten arrows all hit the centre, then three miss. */
const VizProb = () => {
  const hits = [[0, -18], [16, -8], [-14, 6], [8, 14], [-4, -4], [20, 10], [-18, -10]];
  const miss = [[-86, -64], [84, 58], [70, -74]];
  return (
    <svg viewBox="0 0 320 220" className="w6v" aria-hidden="true">
      {[86, 62, 38, 16].map((r, i) => <circle key={r} cx="160" cy="112" r={r} fill={i % 2 ? '#fff' : PINK} stroke={i === 3 ? RED : PINK2} strokeWidth="3" />)}
      <circle cx="160" cy="112" r="8" fill={RED} />
      {[...hits, ...miss].map(([dx, dy], i) => (
        <g key={i} className={`w6v-ar${i >= hits.length ? ' miss' : ''}`} style={{ ['--mx' as string]: `${i >= hits.length ? -dx * 0.82 : 0}px`, ['--my' as string]: `${i >= hits.length ? -dy * 0.82 : 0}px`, animationDelay: `${i * 0.06}s` }}>
          <g transform={`translate(${160 + dx} ${112 + dy})`}>
            <path d="M0 0 L26 -20" stroke={INK} strokeWidth="3.5" strokeLinecap="round" /><path d="M22 -24 l8 -2 M26 -18 l8 -2" stroke={YEL} strokeWidth="3.5" strokeLinecap="round" /><circle r="4.5" fill={INK} />
          </g>
        </g>
      ))}
    </svg>
  );
};
export const HEDGE_VIZ: Record<string, () => React.ReactElement> = { q: VizQuantifier, m: VizModal, f: VizFreq, p: VizProb };

/* ---------------------------------------------------------------- 4.3 effect groups */
/** allow: a door swings open and a figure walks through */
const IcAllow = () => (
  <svg viewBox="0 0 80 64" className="w6v-ic" aria-hidden="true">
    <rect x="10" y="6" width="34" height="52" rx="3" fill="#fff" stroke={INK} strokeWidth="3" />
    <path className="w6v-door" d="M10 6 h34 v52 h-34z" fill={PINK2} stroke={INK} strokeWidth="2" />
    <g className="w6v-walker"><circle cx="0" cy="22" r="5" fill={INK} /><path d="M-6 44c0-10 3-15 6-15s6 5 6 15" fill={INK} /></g>
  </svg>
);
/** provide: a gift box opens, a star pops out */
const IcProvide = () => (
  <svg viewBox="0 0 80 64" className="w6v-ic" aria-hidden="true">
    <path className="w6v-star" d="M40 4l4 9 10 1-7 7 2 10-9-5-9 5 2-10-7-7 10-1z" fill={YEL} />
    <rect x="18" y="32" width="44" height="28" rx="4" fill={RED} /><rect x="37" y="32" width="6" height="28" fill={YEL2} />
    <g className="w6v-lid"><rect x="14" y="24" width="52" height="10" rx="3" fill={DRED} /><rect x="37" y="24" width="6" height="10" fill={YEL2} /></g>
  </svg>
);
/** beneficial: a plant grows */
const IcBeneficial = () => (
  <svg viewBox="0 0 80 64" className="w6v-ic" aria-hidden="true">
    <path d="M24 48h32l-4 14H28z" fill={INK} />
    <g className="w6v-grow"><path d="M40 48V18" stroke="#2e9e46" strokeWidth="4" strokeLinecap="round" /><path d="M40 30c-14 0-18-10-16-16 10 0 16 6 16 16zM40 24c12 0 16-8 14-14-9 0-14 5-14 14z" fill="#a9d6bd" stroke="#2e9e46" strokeWidth="2" /></g>
  </svg>
);
/** make: a hand pushes a figure forward */
const IcMake = () => (
  <svg viewBox="0 0 80 64" className="w6v-ic" aria-hidden="true">
    <g className="w6v-push"><path d="M6 30h18a6 6 0 0 1 0 12H6z" fill={RED} /></g>
    <g className="w6v-pushed"><circle cx="46" cy="16" r="7" fill={INK} /><path d="M37 58c0-18 4-28 9-28s9 10 9 28" fill={INK} /></g>
  </svg>
);
/** prevent: a figure runs into a barrier and stops */
const IcPrevent = () => (
  <svg viewBox="0 0 80 64" className="w6v-ic" aria-hidden="true">
    <rect x="50" y="10" width="10" height="50" rx="3" fill={RED} /><rect x="46" y="20" width="18" height="8" rx="2" fill="#fff" stroke={RED} strokeWidth="2" />
    <g className="w6v-runner"><circle cx="16" cy="18" r="6" fill={INK} /><path d="M8 58c0-16 4-26 8-26s8 10 8 26" fill={INK} /></g>
  </svg>
);
/** harmful: a crack runs across a tile */
const IcHarmful = () => (
  <svg viewBox="0 0 80 64" className="w6v-ic" aria-hidden="true">
    <rect x="12" y="8" width="56" height="48" rx="8" fill={PINK} stroke={INK} strokeWidth="3" />
    <path className="w6v-crack" d="M14 22 L30 30 L26 40 L44 38 L48 50 L66 44" fill="none" stroke={RED} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
export const EFFECT_ICON: Record<string, () => React.ReactElement> = { allow: IcAllow, provide: IcProvide, beneficial: IcBeneficial, make: IcMake, prevent: IcPrevent, harmful: IcHarmful };

/* ---------------------------------------------------------------- 5.2 summary branch icons */
export const SumIcon: React.FC<{ id: 'gauge' | 'lens' | 'link' | 'this' | 'struct' }> = ({ id }) => {
  if (id === 'gauge') return <svg viewBox="0 0 64 44" className="w6v-si" aria-hidden="true"><path d="M8 38a24 24 0 0 1 48 0" fill="none" stroke="#ebeae6" strokeWidth="7" strokeLinecap="round" /><path className="w6v-sgf" d="M8 38a24 24 0 0 1 48 0" fill="none" stroke={RED} strokeWidth="7" strokeLinecap="round" /><g transform="translate(32 38)"><g className="w6v-sneedle"><path d="M0 0 L22 0" stroke={INK} strokeWidth="3" strokeLinecap="round" /></g></g><circle cx="32" cy="38" r="4" fill={INK} /></svg>;
  if (id === 'lens') return <svg viewBox="0 0 64 44" className="w6v-si" aria-hidden="true"><rect x="4" y="12" width="26" height="6" rx="3" fill={GREY} /><rect x="4" y="26" width="38" height="6" rx="3" fill={GREY} /><g className="w6v-slens"><circle cx="0" cy="0" r="11" fill="rgba(253,241,241,.7)" stroke={RED} strokeWidth="3.5" /><path d="M8 8 L15 15" stroke={RED} strokeWidth="5" strokeLinecap="round" /></g></svg>;
  if (id === 'link') return <svg viewBox="0 0 64 44" className="w6v-si" aria-hidden="true"><rect x="4" y="15" width="24" height="14" rx="7" fill="none" stroke={INK} strokeWidth="5" /><rect x="36" y="15" width="24" height="14" rx="7" fill="none" stroke={INK} strokeWidth="5" /><rect className="w6v-slink" x="20" y="17" width="24" height="10" rx="5" fill="none" stroke={RED} strokeWidth="5" /></svg>;
  if (id === 'this') return <svg viewBox="0 0 64 44" className="w6v-si" aria-hidden="true"><rect x="4" y="6" width="56" height="12" rx="6" fill={GREY} /><g className="w6v-sthis"><rect x="4" y="26" width="22" height="12" rx="6" fill={RED} /></g><rect x="30" y="26" width="30" height="12" rx="6" fill={INK} /></svg>;
  return <svg viewBox="0 0 64 44" className="w6v-si" aria-hidden="true">{[10, 32, 54].map((x, i) => <circle key={x} cx={x} cy="22" r="8" fill={i === 1 ? RED : '#fff'} stroke={i === 1 ? DRED : INK} strokeWidth="3" />)}<path d="M18 22h6M40 22h6" stroke={INK} strokeWidth="3" /><circle className="w6v-spulse" cx="10" cy="22" r="3" fill={YEL} /></svg>;
};
