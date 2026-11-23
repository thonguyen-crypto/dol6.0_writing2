/* Small shared UI pieces: icons, status tags, answer lines. */
import React from 'react';
import type { AttemptLine } from './types';
import { STATUS_META, type TrackStatus } from './tracking/tracking';

const P = { fill: 'none', stroke: 'currentColor', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
const paths: Record<string, React.ReactNode> = {
  left: <path d="M15 18l-6-6 6-6" />,
  right: <path d="M9 18l6-6-6-6" />,
  down: <path d="M6 9l6 6 6-6" />,
  close: <path d="M18 6L6 18M6 6l12 12" />,
  gear: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></>,
  grid: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
  eye: <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" /><circle cx="12" cy="12" r="3" /></>,
  send: <path d="M22 2L11 13M22 2l-7 20-4-9-9-4z" />,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  lock: <><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></>,
  pause: <><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></>,
  chart: <><path d="M3 3v18h18" /><path d="M7 15l4-4 3 3 5-6" /></>,
  shuffle: <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />,
  mirror: <><ellipse cx="12" cy="9.5" rx="6" ry="7.5" /><path d="M12 17v4M8.5 21h7" /><path d="M9.5 6.5c.8-1 1.8-1.5 3-1.5" /></>,
  screen: <><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4M9 10l3-3 3 3M12 7v6" /></>,
  refresh: <><path d="M21 12a9 9 0 1 1-2.6-6.4L21 8" /><path d="M21 3v5h-5" /></>,
  notes: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M8 13h8M8 17h6" /></>,
  play: <path d="M6 4l14 8-14 8z" />,
  expand: <path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5" />,
  shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
  logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5M21 12H9" /></>,
  bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></>,
  check: <path d="M20 6L9 17l-5-5" />,
  pen: <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />,
  hl: <><path d="m9 11-6 6v3h9l3-3" /><path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4" /></>,
  text: <path d="M4 7V4h16v3M9 20h6M12 4v16" />,
  eraser: <><path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21" /><path d="M22 21H7M5 11l9 9" /></>,
  spot: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
  trash: <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" />,
  plus: <path d="M12 5v14M5 12h14" />,
  qr: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><path d="M14 14h3v3h-3zM20 14v1M14 20h1M18 18h3v3h-3" /></>,
  download: <path d="M12 3v12M7 10l5 5 5-5M4 21h16" />,
  moon: <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
  copy: <><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
  users: <><circle cx="9" cy="7" r="4" /><path d="M2 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2M16 3.1a4 4 0 0 1 0 7.8M22 21v-2a4 4 0 0 0-3-3.9" /></>,
};

export const Icon: React.FC<{ name: keyof typeof paths | string; size?: number; stroke?: number; style?: React.CSSProperties }> = ({ name, size = 18, stroke = 2.2, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...P} strokeWidth={stroke} aria-hidden="true" style={style}>{paths[name]}</svg>
);

export const StatusTag: React.FC<{ status: TrackStatus | 'na'; label?: string; children?: React.ReactNode }> = ({ status, label, children }) => {
  if (status === 'na') return <span className="stag s-na"><i>·</i>{label || 'Không có bài nộp'}{children}</span>;
  const m = STATUS_META[status];
  return <span className={`stag s-${status}`}><i>{m.icon}</i>{label || m.label}{children}</span>;
};

export const LineView: React.FC<{ line: AttemptLine; big?: boolean; delay?: number }> = ({ line, big, delay = 0 }) => {
  const cls = line.correct === true ? 'l-ok' : line.correct === false ? 'l-err' : '';
  return (
    <div className={`${big ? 'pline' : 'line'} ${cls}`} style={big ? { animationDelay: `${delay}s` } : undefined}>
      <span className="ll">{line.label}</span>
      <span className="lv">
        {line.correct === true && <b className="tmk k-ok">✓</b>}
        {line.correct === false && <b className="tmk k-err">!</b>}
        {line.value || <i style={{ color: '#8b8da1', fontWeight: 500 }}>(trống)</i>}
        {!big && line.feedback && <span style={{ display: 'block', fontSize: 12.5, fontWeight: 500, color: '#6b6d82', marginTop: 2, whiteSpace: 'pre-line' }}>{line.feedback}{line.suggestion ? ` → ${line.suggestion}` : ''}</span>}
      </span>
    </div>
  );
};

export const initials = (name: string) => {
  const p = name.trim().split(/\s+/);
  return ((p[0]?.[0] || '') + (p.length > 1 ? p[p.length - 1][0] : '')).toUpperCase() || 'HS';
};

export const Switch: React.FC<{ on: boolean; onChange: () => void; label: string }> = ({ on, onChange, label }) => (
  <button type="button" className={`sw${on ? ' on' : ''}`} onClick={onChange} aria-pressed={on} aria-label={label} />
);
