/* Bottom row of an activity: one primary action + where the student stands.
   Feedback sits next to the action and never relies on colour alone. */
import React from 'react';
import type { Attempt } from '../types';

export const AttemptBar: React.FC<{
  latest?: Attempt;
  attemptsLeft: number;
  max: number;
  locked: boolean;
  paused: boolean;
  demo: boolean;
  busy: boolean;
  error: string;
  ready: boolean;
  readyHint: string;
  actionLabel: string;
  onAction: () => void;
  extra?: React.ReactNode;
  /** Teacher comment saved in the submission drawer */
  comment?: string;
}> = ({ latest, attemptsLeft, max, locked, paused, demo, busy, error, ready, readyHint, actionLabel, onAction, extra, comment }) => {
  const used = max - attemptsLeft;
  let status: { text: string; cls: string } | null = null;
  if (latest?.ai?.fallback) status = { text: 'Đã gửi. Giáo viên sẽ chấm bài này.', cls: 'info' };
  else if (latest?.isCorrect) status = { text: `Đạt · ${latest.scoreDisplay}`, cls: 'ok' };
  else if (latest && locked) status = { text: `Hết lượt · ${latest.scoreDisplay}. Xem đáp án mẫu khi giáo viên mở.`, cls: 'try' };
  else if (latest) status = { text: `${latest.scoreDisplay} · còn ${attemptsLeft} lượt làm lại. Sửa chỗ có dấu ! rồi nộp lại.`, cls: 'try' };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginTop: 14 }}>
      {!locked && (
        <button className="btn btn-red" disabled={!ready || busy || paused} onClick={onAction} style={{ minWidth: 150 }}>
          {busy ? 'Đang chấm…' : actionLabel}
        </button>
      )}
      {extra}
      {status && <span className={`fb ${status.cls}`} style={{ padding: '9px 14px', fontSize: 14.5, fontWeight: 700 }}>{status.text}</span>}
      {!status && !locked && <span style={{ fontSize: 14, color: '#6b6d82', fontWeight: 600 }}>{paused ? 'Giáo viên đang tạm khóa nộp bài.' : ready ? `Lượt ${used + 1}/${max}` : readyHint}</span>}
      {error && <span className="fb try" style={{ padding: '9px 14px', fontSize: 14 }}>{error}</span>}
      {comment && <span className="fb info" style={{ padding: '9px 14px', fontSize: 14, fontWeight: 600 }}><b>Giáo viên:</b> {comment}</span>}
      {demo && <span className="tag" style={{ background: '#f1ecfd', color: '#5631b8', marginLeft: 'auto' }}>Xem thử · không lưu</span>}
    </div>
  );
};
