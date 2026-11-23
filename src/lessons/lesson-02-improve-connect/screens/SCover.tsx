/* Cover, same layout as Lesson 1 (and the 7.5W covers): course label, title with a highlighted word, subtitle, outcomes,
   "Bắt đầu Chặng 1", the stage row under the button (no Conclusion); an animated drawing of the lesson on the right:
   a plain sentence gets better (a hedge word and specific details pop in), then the next sentence hooks onto it with "This". */
import React from 'react';
import type { SlideProps } from '../../../kit/slides';

const F = 'Plus Jakarta Sans, sans-serif';

const CoverArt = () => (
  <svg width="530" height="380" viewBox="-28 -50 504 360" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="225" cy="130" r="200" fill="#f4f3f0" />
    <path className="w6c-star" d="M40 18 l3 9 9 3 -9 3 -3 9 -3 -9 -9 -3 9 -3 z" fill="#f0d49b" />
    <path className="w6c-star s2" d="M412 22 l2.4 7 7 2.4 -7 2.4 -2.4 7 -2.4 -7 -7 -2.4 7 -2.4 z" fill="#f3c9cb" />
    <path className="w6c-star s3" d="M30 250 l2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2 z" fill="#a9d6bd" />
    <ellipse cx="225" cy="296" rx="160" ry="9" fill="#e6e4de" />

    {/* sentence 1: plain → improved */}
    <g className="w6c-s1">
      <text x="40" y="-8" fontSize="14" fontWeight="800" fill="#8b8da1" letterSpacing="1.5" fontFamily={F}>IMPROVE A SENTENCE</text>
      <rect x="20" y="4" width="410" height="110" rx="24" fill="#ffffff" stroke="#3b3d54" strokeWidth="4" />
      <rect x="44" y="30" width="70" height="16" rx="8" fill="#cfcdd6" />
      <g className="w6c-pop p1"><rect x="122" y="26" width="52" height="24" rx="12" fill="#fdf1f1" stroke="#d63a43" strokeWidth="2.5" /><text x="148" y="43" textAnchor="middle" fontSize="13" fontWeight="800" fill="#b0262e" fontFamily={F}>can</text></g>
      <rect className="w6c-slide" x="182" y="30" width="60" height="16" rx="8" fill="#cfcdd6" />
      <g className="w6c-pop p2"><rect x="250" y="26" width="160" height="24" rx="12" fill="#fdf1f1" stroke="#d63a43" strokeWidth="2.5" /><text x="330" y="43" textAnchor="middle" fontSize="13" fontWeight="800" fill="#b0262e" fontFamily={F}>university students</text></g>
      <rect x="44" y="64" width="96" height="16" rx="8" fill="#cfcdd6" />
      <g className="w6c-pop p3"><rect x="148" y="60" width="200" height="24" rx="12" fill="#fdf1f1" stroke="#d63a43" strokeWidth="2.5" /><text x="248" y="77" textAnchor="middle" fontSize="13" fontWeight="800" fill="#b0262e" fontFamily={F}>such as time management</text></g>
      <g className="w6c-meter"><rect x="44" y="94" width="150" height="8" rx="4" fill="#e6e4de" /><rect className="w6c-meterv" x="44" y="94" width="150" height="8" rx="4" fill="#3b3d54" /></g>
    </g>

    {/* sentence 2 hooks on with "This" */}
    <g className="w6c-s2">
      <text x="110" y="168" fontSize="14" fontWeight="800" fill="#23703a" letterSpacing="1.5" fontFamily={F}>CONNECT SENTENCES</text>
      <rect x="20" y="180" width="410" height="78" rx="24" fill="#e8f4ea" stroke="#23703a" strokeWidth="4" />
      <g className="w6c-this"><rect x="44" y="204" width="64" height="30" rx="10" fill="#2e9e46" /><text x="76" y="224" textAnchor="middle" fontSize="15" fontWeight="800" fill="#ffffff" fontFamily={F}>This</text></g>
      <rect x="118" y="211" width="96" height="16" rx="8" fill="#a9d6bd" />
      <rect x="222" y="211" width="150" height="16" rx="8" fill="#a9d6bd" />
    </g>
    <path className="w6c-hook" d="M76 114 C 60 150, 70 170, 76 204" stroke="#2e9e46" strokeWidth="4" strokeDasharray="6 7" />
    <g className="w6c-ok"><circle cx="420" cy="186" r="17" fill="#2e9e46" stroke="#ffffff" strokeWidth="3" /><path d="M412 186l6 6 10-11" stroke="#ffffff" strokeWidth="4" /></g>
  </svg>
);

export const SCover: React.FC<SlideProps> = ({ lesson, onStart, view }) => {
  const words = lesson.title.split(' ');
  return (
    <div className="w6 w6-coverw">
      <div className="w6c">
        <div className="w6c-l enter">
          <span className="lbl">{lesson.course} · #Linearthinking</span>
          <h1 className="w6c-h">{words.slice(0, -1).join(' ')} <span className="hl">{words[words.length - 1]}</span></h1>
          <p className="w6c-sub">{lesson.subtitle}</p>
          <div className="w6c-outs">
            {lesson.outcomes?.map((o) => <div key={o} className="w6c-out"><span className="w6c-ck">✓</span>{o}</div>)}
          </div>
          <div className="w6c-go">
            <button className="btn btn-red" onClick={onStart} disabled={!onStart}>{view === 'teacher' ? 'Mở Chặng 1' : 'Bắt đầu Chặng 1'} →</button>
          </div>
          <div className="w6c-stages">
            {lesson.stages.filter((s) => s.short !== 'Conclusion').map((s, i) => (
              <React.Fragment key={s.n}>
                {i > 0 && <span className="w6c-dot">·</span>}
                <span className="w6c-st"><span className="num">{s.n}</span>{s.short}</span>
              </React.Fragment>
            ))}
          </div>
        </div>
        <div className="w6c-r">
          <div className="w6c-art"><CoverArt /></div>
        </div>
      </div>
    </div>
  );
};
