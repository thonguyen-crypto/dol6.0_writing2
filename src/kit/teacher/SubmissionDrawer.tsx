/* "Hồ sơ bài làm": everything one student submitted, by scope (cả bài / chặng / trang).
   Every attempt with time, answers marked ✓ / !, AI criteria, sentence feedback,
   parts not done yet, model answers, and the teacher's comment / private note. */
import React, { useState } from 'react';
import { useClassroom } from '../ClassroomProvider';
import { findSub, pageStatus, UNTRACKED_NOTE } from '../tracking/tracking';
import type { Attempt, StepMeta, Submission } from '../types';
import { Icon, initials, LineView, StatusTag } from '../ui';

const time = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
};

const AttemptView: React.FC<{ a: Attempt; part: string }> = ({ a, part }) => {
  const res = a.ai?.fallback ? ['AI chưa chấm được', '#fdf5e4', '#946207'] : a.isCorrect ? ['Đạt', '#e8f4ea', '#23703a'] : ['Chưa đạt', '#fdf1f1', '#b0262e'];
  return (
    <div className="att">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13.5, fontWeight: 800, color: '#3b3d54' }}>{part}Lần làm {a.no}</span>
        <span style={{ fontSize: 12.5, color: '#6b6d82', fontWeight: 600 }}>{time(a.at)}</span>
        <span className="tag" style={{ background: res[1], color: res[2], marginLeft: 'auto', fontSize: 12, padding: '4px 10px' }}>{res[0]}</span>
        <span className="spill">{a.scoreDisplay}</span>
      </div>
      <div className="lines">{a.lines.map((l) => <LineView key={l.id} line={l} />)}</div>
      {a.ai && !a.ai.fallback && (
        <div className="crit">
          <b>Ideas / accuracy</b><span>{a.ai.ideas || '—'}</span>
          {a.ai.grammar && <><b>Grammar</b><span>{a.ai.grammar}</span></>}
          {a.ai.vocabulary && <><b>Vocabulary</b><span>{a.ai.vocabulary}</span></>}
        </div>
      )}
      {a.ai?.fallback && <p style={{ margin: 0, padding: '8px 12px', borderRadius: 10, background: '#fdf5e4', color: '#946207', fontSize: 13, fontWeight: 600 }}>AI chưa chấm được bài này. GV đọc và chấm tay.</p>}
    </div>
  );
};

const ReviewBox: React.FC<{ sub: Submission }> = ({ sub }) => {
  const room = useClassroom();
  const [comment, setComment] = useState(sub.review?.comment || '');
  const [note, setNote] = useState(sub.review?.privateNote || '');
  const [msg, setMsg] = useState('');
  const save = async (status?: 'reviewed' | 'needs_support') => {
    const error = await room.saveReview(sub.id, { comment, privateNote: note, status });
    setMsg(error || 'Đã lưu nhận xét.');
  };
  return (
    <details className="dsum">
      <summary>Nhận xét của giáo viên{sub.review?.status === 'needs_support' ? ' · cần hỗ trợ' : sub.review?.status === 'reviewed' ? ' · đã xem' : ''}</summary>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 6 }}>
        <textarea className="ta" rows={2} style={{ fontSize: 14 }} placeholder="Nhận xét gửi học sinh" value={comment} onChange={(e) => setComment(e.target.value)} />
        <textarea className="ta" rows={2} style={{ fontSize: 14, background: '#fbfbfa' }} placeholder="Ghi chú riêng (học sinh không thấy)" value={note} onChange={(e) => setNote(e.target.value)} />
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-sm btn-green" onClick={() => void save('reviewed')}>Lưu · đã xem</button>
          <button className="btn btn-sm" onClick={() => void save('needs_support')}>Cần hỗ trợ</button>
          {msg && <span style={{ fontSize: 12.5, color: '#23703a', fontWeight: 700 }}>{msg}</span>}
        </div>
      </div>
    </details>
  );
};

const PageWork: React.FC<{ step: StepMeta; studentId: string }> = ({ step, studentId }) => {
  const room = useClassroom();
  const code = room.codes[step.key];
  if (!step.tracking) {
    return (
      <section className="wk">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><span className="pcode">{code}</span><span style={{ fontSize: 16, fontWeight: 800, color: '#3b3d54', flex: 1 }}>{step.name}</span><StatusTag status="na" /></div>
        <p style={{ margin: 0, fontSize: 13.5, color: '#6b6d82', lineHeight: 1.5 }}>{UNTRACKED_NOTE}</p>
      </section>
    );
  }
  const multi = step.tracking.parts.length > 1;
  const parts = step.tracking.parts.map((p) => ({ part: p, sub: findSub(room.index, studentId, step.key, p.id) }));
  const status = pageStatus(room.index, step, studentId);
  const unsent = parts.filter((p) => !p.sub?.attempts.length);
  const models = parts.flatMap((p) => p.sub?.attempts[p.sub.attempts.length - 1]?.models || []);
  return (
    <section className="wk">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><span className="pcode">{code}</span><span style={{ fontSize: 16, fontWeight: 800, color: '#3b3d54', flex: 1, minWidth: 0 }}>{step.name}</span><StatusTag status={status} /></div>
      {parts.map(({ part, sub }) => {
        if (!sub?.attempts.length) return null;
        const label = multi ? `${part.label} · ` : '';
        const latest = sub.attempts[sub.attempts.length - 1];
        const older = sub.attempts.slice(0, -1).reverse();
        return (
          <React.Fragment key={part.id}>
            <AttemptView a={latest} part={label} />
            {older.length > 0 && (
              <details className="dsum"><summary>Xem {older.length} lượt làm trước{multi ? ` · ${part.label}` : ''}</summary>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 6 }}>{older.map((a) => <AttemptView key={a.no} a={a} part={label} />)}</div>
              </details>
            )}
            <ReviewBox sub={sub} />
          </React.Fragment>
        );
      })}
      {unsent.length > 0 && (
        <div className="emptyws">
          <b style={{ fontSize: 12.5, color: '#6b6d82' }}>{unsent.length === parts.length ? 'Chưa làm' : 'Phần chưa làm'}</b>
          {unsent.map(({ part }) => <span key={part.id}>{part.label}</span>)}
        </div>
      )}
      {models.length > 0 && (
        <details className="dsum"><summary>Đáp án mẫu</summary>
          <div className="lines" style={{ marginTop: 6 }}>{models.map((m, i) => <LineView key={`${m.id}-${i}`} line={m} />)}</div>
        </details>
      )}
    </section>
  );
};

export type DrawerScope = 'all' | 'stage' | 'page';

export const SubmissionDrawer: React.FC<{ studentId: string; stepKey: string | null; scope: DrawerScope; stage: number; onScope: (s: DrawerScope) => void; onClose: () => void }> = ({ studentId, stepKey, scope, stage, onScope, onClose }) => {
  const room = useClassroom();
  const student = room.students.find((s) => s.id === studentId);
  if (!student) return null;
  const tracked = room.lesson.steps.filter((s) => s.tracking);
  const done = tracked.filter((s) => pageStatus(room.index, s, studentId) === 'done').length;
  const at = room.lesson.steps.find((s) => s.key === student.stepKey);
  const theStage = stepKey ? room.lesson.steps.find((s) => s.key === stepKey)?.stage || stage : stage;
  const steps = scope === 'page' && stepKey ? room.lesson.steps.filter((s) => s.key === stepKey)
    : scope === 'stage' ? tracked.filter((s) => s.stage === theStage) : tracked;
  const pct = tracked.length ? Math.round((done / tracked.length) * 100) : 0;
  const scopes: { id: DrawerScope; t: string }[] = [{ id: 'all', t: 'Cả bài' }, { id: 'stage', t: `Chặng ${theStage}` }];
  if (stepKey) scopes.push({ id: 'page', t: `Trang ${room.codes[stepKey]}` });
  return (
    <div className="drawer" role="dialog" aria-label={`Hồ sơ bài làm của ${student.name}`}>
      <div style={{ padding: '16px 22px 14px', borderBottom: '1px solid #ebeae6', display: 'flex', flexDirection: 'column', gap: 11, flex: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ width: 46, height: 46, borderRadius: '50%', background: '#fdf1f1', color: '#d63a43', fontSize: 16, fontWeight: 800, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>{initials(student.name)}</span>
          <div style={{ flex: 1, minWidth: 0 }}><div className="tl">Hồ sơ bài làm</div><div style={{ fontSize: 21, fontWeight: 800, color: '#3b3d54', lineHeight: 1.2 }}>{student.name}</div></div>
          <button className="ibtn" onClick={onClose} aria-label="Đóng hồ sơ"><Icon name="close" stroke={2.4} /></button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="tag" style={{ background: '#eef2fb', color: '#3c62b8', fontSize: 12, padding: '4px 10px' }}>{at ? `Đang ở ${room.codes[at.key] || ''} · ${at.name}` : 'Chưa mở bài'}</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#3b3d54', marginLeft: 'auto' }}>Đạt {done}/{tracked.length} trang</span>
          <div className="track" style={{ width: 140, height: 8 }}><div className="fill" style={{ width: `${pct}%`, background: '#2e9e46' }} /></div>
          <span style={{ fontSize: 13, fontWeight: 800, color: '#23703a', width: 38 }}>{pct}%</span>
        </div>
        <div style={{ display: 'flex', gap: 6 }} role="group" aria-label="Xem hồ sơ theo phạm vi">
          {scopes.map((s) => <button key={s.id} className={`tfilter all${scope === s.id ? ' on' : ''}`} onClick={() => onScope(s.id)}>{s.t}</button>)}
        </div>
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: '16px 22px 26px', display: 'flex', flexDirection: 'column', gap: 14, background: '#fbfbfa' }}>
        {steps.map((s) => <PageWork key={s.key} step={s} studentId={studentId} />)}
      </div>
    </div>
  );
};
