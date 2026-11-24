/* Lesson 2 · animated illustrations for the stage dividers (hand-written, same pattern as 7.5W Lesson 1 @ 88fc379).
   Pictures, not word cards: one shape story per stage, in the lesson palette
   (ink #3b3d54, red #d63a43, pink #fdf1f1/#f3c9cb, yellow #f5b83d/#fde7a9). The red shape is the hero of each scene.
   Motion loops gently and stops with prefers-reduced-motion (stageArt.css). */
import React from 'react';
import { DividerSlide, type SlideProps, type SlideRegistry } from '../../../kit/slides';

const INK = '#3b3d54', INK2 = '#55577a', RED = '#d63a43', DRED = '#b0262e', LRED = '#e9636a', PINK = '#fdf1f1', PINK2 = '#f3c9cb', YEL = '#f5b83d', YEL2 = '#fde7a9', LINE = '#e6e5e1';
const svg = { width: '100%', viewBox: '0 0 600 300', role: 'img' as const };

/** n-point star centred at 0,0. */
const star = (n: number, ro: number, ri: number) =>
  Array.from({ length: n * 2 }, (_, i) => {
    const r = i % 2 ? ri : ro, a = (Math.PI * i) / n - Math.PI / 2;
    return `${i ? 'L' : 'M'}${(r * Math.cos(a)).toFixed(1)} ${(r * Math.sin(a)).toFixed(1)}`;
  }).join(' ') + 'Z';

const Sparkle: React.FC<{ x: number; y: number; s?: number; c?: string; cls: string }> = ({ x, y, s = 1, c = YEL, cls }) => (
  <g transform={`translate(${x} ${y})`}><path className={cls} d={star(4, 11 * s, 3 * s)} fill={c} /></g>
);
const Shadow: React.FC<{ x: number; y: number; w: number; cls?: string }> = ({ x, y, w, cls }) => (
  <ellipse className={cls} cx={x} cy={y} rx={w / 2} ry={6} fill={INK} opacity={0.08} />
);
/** soft highlight on a block */
const Shine: React.FC<{ x: number; y: number; r?: number }> = ({ x, y, r = 7 }) => <circle cx={x} cy={y} r={r} fill="#fff" opacity={0.35} />;

/** 1 · Revision: the foundation (correct sentence: LR + GRA) is built; the floor above is still an empty outline.
    The red block comes down, fits, the slot glows, then it lifts again: "right, but not great yet". */
const ArtRevision = () => (
  <svg {...svg} aria-label="Móng đã xong, tầng trên còn trống">
    <Shadow x={300} y={262} w={300} />
    <g className="sa-bob"><rect x={160} y={196} width={136} height={60} rx={14} fill={INK} /><Shine x={180} y={212} /></g>
    <g className="sa-bob sa-d2"><rect x={304} y={196} width={136} height={60} rx={14} fill={INK2} /><Shine x={324} y={212} /></g>
    <rect x={160} y={128} width={136} height={60} rx={14} fill={PINK} stroke={PINK2} strokeWidth={2.5} strokeDasharray="6 6" />
    <rect x={304} y={128} width={136} height={60} rx={14} fill="none" stroke={PINK2} strokeWidth={2.5} strokeDasharray="6 6" />
    <rect className="sa-rv-glow" x={154} y={122} width={148} height={72} rx={18} fill="none" stroke={YEL} strokeWidth={3} />
    <g className="sa-rv-block">
      <rect x={160} y={128} width={136} height={60} rx={14} fill={RED} stroke={DRED} strokeWidth={2} />
      <Shine x={182} y={144} r={8} />
    </g>
    <g className="sa-bob"><circle cx={96} cy={96} r={18} fill={YEL2} stroke={YEL} strokeWidth={3} /></g>
    <g className="sa-bob sa-d2"><path d={`M500 70 l20 34 h-40z`} fill={PINK2} transform="rotate(10 500 92)" /></g>
    <Sparkle x={140} y={118} cls="sa-spark sa-rvs" />
    <Sparkle x={312} y={108} s={0.8} c={RED} cls="sa-spark sa-rvs sa-d2" />
    <Sparkle x={470} y={176} s={0.7} cls="sa-spark sa-d3" />
  </svg>
);

/** 2 · Improve a sentence: a row of blurry shapes; the red magnifier sweeps across and, under the lens,
    every shape is sharp and has its details. It stops on the star, which lights up. */
const ArtImprove = () => {
  const row = (sharp: boolean) => (
    <g>
      <rect x={70} y={118} width={70} height={70} rx={16} fill={sharp ? INK : '#c9cad3'} />
      {sharp && <><path d="M86 152h38M86 166h24" stroke="#fff" strokeWidth={5} strokeLinecap="round" /><Shine x={86} y={132} /></>}
      <circle cx={225} cy={153} r={36} fill={sharp ? YEL2 : '#ecebe7'} stroke={sharp ? YEL : '#dcdbd6'} strokeWidth={3} />
      {sharp && <><circle cx={225} cy={153} r={14} fill={YEL} /><circle cx={225} cy={153} r={5} fill="#fff" /></>}
      <g transform="translate(330 153)"><path d={star(5, 42, 18)} fill={sharp ? RED : PINK2} stroke={sharp ? DRED : PINK2} strokeWidth={2} strokeLinejoin="round" />{sharp && <circle cx={-9} cy={-7} r={5} fill="#fff" opacity={0.5} />}</g>
      <path d="M408 188 l34 -70 l34 70z" fill={sharp ? INK2 : '#d9d9e0'} strokeLinejoin="round" />
      {sharp && <><circle cx={442} cy={166} r={8} fill="#fff" opacity={0.85} /><path d="M430 182h24" stroke="#fff" strokeWidth={4} strokeLinecap="round" /></>}
      <rect x={500} y={124} width={56} height={58} rx={28} fill={sharp ? PINK2 : '#efeeea'} />
      {sharp && <circle cx={528} cy={153} r={12} fill={RED} />}
    </g>
  );
  return (
    <svg {...svg} aria-label="Kính lúp làm hình rõ nét">
      <defs>
        <filter id="sa-blur" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="3.2" /></filter>
        <clipPath id="sa-lens-clip"><circle className="sa-im-clip" cx={0} cy={0} r={62} /></clipPath>
      </defs>
      <Shadow x={300} y={226} w={460} />
      <g filter="url(#sa-blur)" opacity={0.85}>{row(false)}</g>
      <g clipPath="url(#sa-lens-clip)">
        <circle className="sa-im-clip" cx={0} cy={0} r={62} fill="#fff" />
        {row(true)}
      </g>
      <g className="sa-im-lens">
        <circle cx={0} cy={0} r={62} fill="none" stroke={RED} strokeWidth={9} />
        <circle cx={0} cy={0} r={70} fill="none" stroke={DRED} strokeWidth={2} opacity={0.35} />
        <path d="M44 44 L84 84" stroke={RED} strokeWidth={16} strokeLinecap="round" />
        <path d="M44 44 L84 84" stroke={DRED} strokeWidth={4} strokeLinecap="round" opacity={0.5} />
        <path d="M-34 -30 a46 46 0 0 1 26 -18" fill="none" stroke="#fff" strokeWidth={5} strokeLinecap="round" opacity={0.7} />
      </g>
      <g transform="translate(330 153)"><path className="sa-im-glow" d={star(5, 58, 26)} fill="none" stroke={YEL} strokeWidth={3} strokeLinejoin="round" /></g>
      <Sparkle x={382} y={92} cls="sa-spark sa-ims" />
      <Sparkle x={282} y={100} s={0.7} c={RED} cls="sa-spark sa-ims sa-d2" />
      <Sparkle x={74} y={70} s={0.7} cls="sa-spark sa-d3" />
    </svg>
  );
};

/** 3 · Linking words: two ink rings stand apart; the red link drops in between, turns and locks; the chain lights up. */
const ArtLink = () => (
  <svg {...svg} aria-label="Mắt xích nối hai vòng">
    <Shadow x={300} y={248} w={420} />
    <rect className="sa-lk-glow" x={96} y={104} width={408} height={102} rx={51} fill="none" stroke={YEL} strokeWidth={3} />
    <g className="sa-bob"><rect x={110} y={122} width={150} height={66} rx={33} fill="none" stroke={INK} strokeWidth={20} /><path d="M132 136 a22 22 0 0 1 22 -6" stroke="#fff" strokeWidth={4} strokeLinecap="round" opacity={0.35} fill="none" /></g>
    <g className="sa-bob sa-d2"><rect x={340} y={122} width={150} height={66} rx={33} fill="none" stroke={INK2} strokeWidth={20} /><path d="M362 136 a22 22 0 0 1 22 -6" stroke="#fff" strokeWidth={4} strokeLinecap="round" opacity={0.35} fill="none" /></g>
    <g className="sa-lk-ring">
      <rect x={232} y={130} width={136} height={50} rx={25} fill="none" stroke={RED} strokeWidth={18} />
      <rect x={232} y={130} width={136} height={50} rx={25} fill="none" stroke={DRED} strokeWidth={2} opacity={0.4} />
      <path d="M250 140 a18 18 0 0 1 18 -4" stroke="#fff" strokeWidth={4} strokeLinecap="round" opacity={0.5} fill="none" />
    </g>
    {/* ink rings pass in front of the red link at the joints, so it looks hooked */}
    <path d="M250 135 v40" stroke={INK} strokeWidth={20} strokeLinecap="round" className="sa-lk-over" />
    <path d="M350 135 v40" stroke={INK2} strokeWidth={20} strokeLinecap="round" className="sa-lk-over" />
    <g className="sa-bob"><circle cx={86} cy={74} r={14} fill={PINK} stroke={PINK2} strokeWidth={2.5} /></g>
    <g className="sa-bob sa-d2"><rect x={500} y={226} width={22} height={22} rx={6} fill={YEL2} transform="rotate(18 511 237)" /></g>
    <Sparkle x={300} y={84} cls="sa-spark sa-lks" />
    <Sparkle x={222} y={218} s={0.8} c={RED} cls="sa-spark sa-lks sa-d2" />
    <Sparkle x={384} y={222} s={0.6} cls="sa-spark sa-lks sa-d3" />
  </svg>
);

/** 4 · Without linking words: dominoes — the red one tips first and each one knocks the next (cause → effect);
    the last one hits the star, which lights up; then the row stands up again. */
const ArtDomino = () => {
  const xs = [128, 200, 272, 344, 416];
  const fills = [RED, INK, INK2, INK, INK2];
  return (
    <svg {...svg} aria-label="Domino đổ nối tiếp nhau">
      <line x1={70} y1={236} x2={540} y2={236} stroke={LINE} strokeWidth={3} strokeLinecap="round" strokeDasharray="2 10" />
      {xs.map((x, i) => (
        <g key={i}>
          <Shadow x={x + 12} y={238} w={50} />
          <g className={`sa-dm sa-dm${i}`}>
            <rect x={x} y={130} width={28} height={104} rx={7} fill={fills[i]} stroke={i === 0 ? DRED : 'none'} strokeWidth={2} />
            <circle cx={x + 14} cy={160} r={5} fill="#fff" opacity={i === 0 ? 0.85 : 0.5} />
            <circle cx={x + 14} cy={200} r={5} fill="#fff" opacity={i === 0 ? 0.85 : 0.5} />
          </g>
        </g>
      ))}
      <g transform="translate(510 204)">
        <path className="sa-dm-glow" d={star(5, 50, 23)} fill="none" stroke={YEL} strokeWidth={3} strokeLinejoin="round" />
        <g className="sa-dm-star"><path d={star(5, 32, 14)} fill={YEL2} stroke={YEL} strokeWidth={2.5} strokeLinejoin="round" /><circle cx={-7} cy={-6} r={4} fill="#fff" opacity={0.6} /></g>
      </g>
      <g className="sa-bob"><circle cx={92} cy={86} r={16} fill={PINK} stroke={PINK2} strokeWidth={2.5} /></g>
      <g className="sa-bob sa-d2"><circle cx={300} cy={70} r={8} fill={LRED} opacity={0.6} /></g>
      <Sparkle x={540} y={136} cls="sa-spark sa-dms" />
      <Sparkle x={470} y={150} s={0.7} c={RED} cls="sa-spark sa-dms sa-d2" />
    </svg>
  );
};

const ART: Record<number, () => React.ReactElement> = { 1: ArtRevision, 2: ArtImprove, 3: ArtLink, 4: ArtDomino };

const withArt = (n: number): React.FC<SlideProps> => {
  const Art = ART[n];
  const C: React.FC<SlideProps> = (p) => <DividerSlide {...p} art={<div className="sart"><Art /></div>} />;
  C.displayName = `StageDivider${n}`;
  return C;
};

/** Divider steps of Lesson 2 (keys d1–d4 in meta.ts). */
export const stageDividers: SlideRegistry = { d1: withArt(1), d2: withArt(2), d3: withArt(3), d4: withArt(4) };
