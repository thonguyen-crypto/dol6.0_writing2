/* Page tracker + "Hỏi gương thần" + "Chiếu lên lớp" (same behaviour as TeacherTracking v1.2 on main).
   Left: status bar, filters, Học viên / Trạng thái / Điểm / Ghi chú.
   Right: 4 questions answered from submitted work; anonymous projection (Esc closes, → next). */
import React, { useEffect, useMemo, useState } from 'react';
import { useClassroom } from '../ClassroomProvider';
import { latestLines, rowView, STATUS_META, STATUS_ORDER, UNTRACKED_NOTE, type RowView, type TrackStatus } from '../tracking/tracking';
import { Icon, LineView, StatusTag } from '../ui';

type Ask = 'missing' | 'good' | 'weak' | 'random';
const ASKS: { id: Ask; text: string }[] = [
  { id: 'missing', text: 'Ai chưa làm phần này?' },
  { id: 'good', text: 'Cho tôi một bài làm tốt' },
  { id: 'weak', text: 'Cho tôi một bài làm chưa tốt' },
  { id: 'random', text: 'Hiện ngẫu nhiên 1 bài' },
];
const shuffle = <T,>(list: T[]) => {
  const c = list.slice();
  for (let i = c.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [c[i], c[j]] = [c[j], c[i]]; }
  return c;
};

export const PageTracker: React.FC<{
  stepKey: string;
  onClose: () => void;
  onBack: () => void;
  onOpenStudent: (id: string, stepKey: string) => void;
  /** Render in the page flow (Tiến độ lớp) instead of as a pop-up over the slide. */
  embedded?: boolean;
}> = ({ stepKey, onClose, onBack, onOpenStudent, embedded }) => {
  const room = useClassroom();
  const step = room.lesson.steps.find((s) => s.key === stepKey)!;
  const tracking = step.tracking;
  const [filter, setFilter] = useState<TrackStatus | 'all'>('all');
  const [ask, setAsk] = useState<Ask | null>(null);
  const [order, setOrder] = useState<string[]>([]);
  const [idx, setIdx] = useState(0);
  const [hideNames, setHideNames] = useState(true);
  const [projecting, setProjecting] = useState(false);
  const [inviteMsg, setInviteMsg] = useState('');

  useEffect(() => { setFilter('all'); setAsk(null); setProjecting(false); setInviteMsg(''); }, [stepKey]);

  const rows: RowView[] = useMemo(() => (tracking ? room.students.map((s) => rowView(room.index, step, s)) : []), [room.students, room.index, step, tracking]);
  const count = (s: TrackStatus) => rows.filter((r) => r.status === s).length;
  const statuses = STATUS_ORDER.filter((s) => (s !== 'partial' || count('partial') > 0 || (tracking?.parts.length || 0) > 1) && (s !== 'review' || tracking?.grading === 'ai' || count('review') > 0));
  const visible = rows.filter((r) => filter === 'all' || r.status === filter);
  const missing = rows.filter((r) => r.status === 'none');

  const choose = (next: Ask) => {
    setAsk(next);
    setIdx(0);
    setInviteMsg('');
    if (next === 'missing') return;
    const pool = next === 'good' ? rows.filter((r) => r.status === 'done').sort((a, b) => b.ratio - a.ratio)
      : next === 'weak' ? shuffle(rows.filter((r) => r.status === 'weak'))
      : shuffle(rows.filter((r) => r.latest));
    setOrder(pool.map((r) => r.student.id));
  };
  const picked = order.map((id) => rows.find((r) => r.student.id === id)).filter((r): r is RowView => Boolean(r?.latest));
  const pos = picked.length ? idx % picked.length : 0;
  const pick = picked[pos];
  const shownName = pick ? (hideNames ? `Học viên ${String.fromCharCode(65 + (pos % 26))}` : pick.student.name) : '';
  const body = pick ? latestLines(room.index, step, pick.student.id) : { lines: [], feedback: '' };
  const kind = ask === 'good' ? 'Bài làm tốt' : ask === 'weak' ? 'Bài làm chưa tốt' : 'Bài ngẫu nhiên';

  useEffect(() => {
    if (!projecting) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.stopPropagation(); setProjecting(false); }
      if (e.key === 'ArrowRight' && picked.length > 1) { e.stopPropagation(); setIdx((v) => v + 1); }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [projecting, picked.length]);

  const invite = async () => {
    await room.setControl({ invite: stepKey });
    setInviteMsg(`Đã gửi lời mời. Học sinh thấy thông báo “Giáo viên mời bạn đến” trang ${room.codes[stepKey]}.`);
  };
  const copy = () => {
    const text = missing.map((r) => r.student.name).join('\n');
    try { void navigator.clipboard?.writeText(text); } catch { /* clipboard may be blocked */ }
    room.showToast(`Đã sao chép danh sách ${missing.length} học sinh chưa làm`);
  };

  return (
    <>
      <div className={embedded ? 'tp-embed' : 'pop'} style={{ ...(embedded ? { position: 'relative', width: '100%', height: 600 } : { left: 24, top: 82, width: 998, height: 562, zIndex: 31 }), padding: 18, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 316px', gap: 14 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <button className="ibtn" style={{ width: 38, height: 38 }} onClick={onBack} aria-label="Về bảng tiến độ lớp" title="Về bảng tiến độ lớp"><Icon name="left" stroke={2.4} /></button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="tl">Theo dõi trang {room.codes[stepKey]}</div>
              <div style={{ fontSize: 21, fontWeight: 800, color: '#3b3d54', lineHeight: 1.25 }}>{step.name}</div>
              <div style={{ fontSize: 13, color: '#6b6d82', fontWeight: 600, marginTop: 2 }}>
                {!tracking ? 'Trang đọc · không có bài nộp' : `${tracking.grading === 'ai' ? `AI chấm /5 · đạt khi từ ${tracking.passScore || 4} điểm` : 'Chấm tự động theo đáp án'}${tracking.parts.length > 1 ? ` · ${tracking.parts.length} phần` : ''}`}
              </div>
            </div>
            <button className="ibtn" style={{ width: 38, height: 38 }} onClick={onClose} aria-label="Đóng theo dõi trang"><Icon name="close" stroke={2.4} /></button>
          </div>
          {!tracking ? <p style={{ margin: 0, padding: '14px 16px', borderRadius: 14, background: '#f7f7f5', fontSize: 14.5, lineHeight: 1.55, color: '#4b4d63' }}>{UNTRACKED_NOTE}</p> : (
            <>
              <div className="ttbar">{STATUS_ORDER.map((s) => <span key={s} style={{ width: `${rows.length ? (count(s) / rows.length) * 100 : 0}%`, background: STATUS_META[s].color }} />)}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }} role="group" aria-label="Lọc theo trạng thái">
                <button className={`tfilter all${filter === 'all' ? ' on' : ''}`} onClick={() => setFilter('all')}>Tất cả <b>{rows.length}</b></button>
                {statuses.map((s) => <button key={s} className={`tfilter${filter === s ? ' on' : ''}`} onClick={() => setFilter(s)}><StatusTag status={s} /><b>{count(s)}</b></button>)}
              </div>
              <div className="ttable" aria-label="Trạng thái từng học viên">
                <div className="trow head" aria-hidden="true"><span>Học viên</span><span>Trạng thái</span><span>Điểm</span><span>Ghi chú</span></div>
                {visible.length === 0 && <div style={{ padding: '14px 16px', fontSize: 14, color: '#6b6d82' }}>{rows.length ? 'Không có học viên nào ở nhóm này.' : 'Chưa có học sinh trong lớp.'}</div>}
                {visible.map((r) => (
                  <button key={r.student.id} className="trow" onClick={() => onOpenStudent(r.student.id, stepKey)} title="Mở hồ sơ bài làm">
                    <span style={{ fontWeight: 700, color: '#3b3d54', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.student.name}</span>
                    <span><StatusTag status={r.status} /></span>
                    <span style={{ fontWeight: 700, color: '#3b3d54', whiteSpace: 'nowrap' }}>{r.score}</span>
                    <span style={{ fontSize: 13, color: '#6b6d82' }}>{r.note}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <aside className="mirror" aria-label="Hỏi gương thần">
          <svg className="spk" style={{ right: 18, top: 14 }} width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l2.2 7.8L22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2z" /></svg>
          <svg className="spk" style={{ right: 46, top: 34, animationDelay: '.9s' }} width="9" height="9" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l2.2 7.8L22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2z" /></svg>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#6a3fd6' }}>
            <span style={{ width: 44, height: 44, borderRadius: 14, background: '#f1ecfd', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon name="mirror" size={26} stroke={1.9} /></span>
            <div><div style={{ fontSize: 18, fontWeight: 800, color: '#3b3d54' }}>Hỏi gương thần</div><div style={{ fontSize: 12.5, color: '#6b6d82', fontWeight: 600 }}>Trả lời ngay từ bài đã nộp</div></div>
          </div>
          {!tracking ? <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: '#4b4d63' }}>Trang này không có bài nộp nên gương thần chưa trả lời được.</p> : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {ASKS.map((a, n) => <button key={a.id} className={`ask${ask === a.id ? ' on' : ''}`} aria-pressed={ask === a.id} onClick={() => choose(a.id)}><i>{n + 1}</i>{a.text}</button>)}
              </div>
              {!ask && (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, textAlign: 'center', color: '#6a3fd6', padding: '6px 10px' }}>
                  <div style={{ width: 92, height: 92, borderRadius: '50%', background: 'radial-gradient(circle at 35% 30%, #ffffff 0, #f1ecfd 55%, #e2d8f8 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'float 3.4s ease-in-out infinite' }}><Icon name="mirror" size={46} stroke={1.9} /></div>
                  <div style={{ fontSize: 14, color: '#4b4d63', lineHeight: 1.5, fontWeight: 600 }}>Chọn một câu hỏi. Gương thần đọc bài học viên đã nộp ở trang này.</div>
                </div>
              )}
              {ask === 'missing' && (
                <div className="answer">
                  {missing.length === 0 ? <b style={{ color: '#23703a', fontSize: 15 }}>Cả lớp đã làm trang này.</b> : (
                    <>
                      <b style={{ color: '#3b3d54', fontSize: 15 }}>{missing.length} em chưa nộp bài trang này</b>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, overflow: 'auto', minHeight: 0, maxHeight: 190, alignContent: 'flex-start' }}>
                        {missing.map((r) => <StatusTag key={r.student.id} status="none" label={r.student.name} />)}
                      </div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <button className="btn btn-sm btn-purple" onClick={() => void invite()}><Icon name="send" size={15} stroke={2.3} />Mời cả lớp vào trang này</button>
                        <button className="btn btn-sm" onClick={copy}>Sao chép danh sách</button>
                      </div>
                      {inviteMsg && <span style={{ fontSize: 12.5, color: '#23703a', fontWeight: 700 }}>{inviteMsg}</span>}
                    </>
                  )}
                  {count('partial') > 0 && <span style={{ fontSize: 12.5, color: '#6b6d82' }}>Ngoài ra {count('partial')} em đang làm dở (chưa xong mọi phần).</span>}
                </div>
              )}
              {ask && ask !== 'missing' && (
                <div className="answer">
                  {pick ? (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <b style={{ fontSize: 15, color: '#3b3d54' }}>{shownName}</b><StatusTag status={pick.status} />
                        <span style={{ marginLeft: 'auto', fontSize: 12, color: '#6b6d82', fontWeight: 700 }}>{pick.pickScore} · bài {pos + 1}/{picked.length}</span>
                      </div>
                      <div className="lines" style={{ overflow: 'auto', minHeight: 0, flex: 1 }}>
                        {body.lines.map((l) => <LineView key={l.id} line={l} />)}
                        {body.feedback && <p className="fbp"><b>Nhận xét AI:</b> {body.feedback}</p>}
                      </div>
                      <label className="chk"><input type="checkbox" checked={hideNames} onChange={() => setHideNames(!hideNames)} />Ẩn tên khi chiếu lên lớp</label>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <button className="btn btn-sm btn-purple" onClick={() => setProjecting(true)}><Icon name="screen" size={15} stroke={2.3} />Chiếu lên lớp</button>
                        {picked.length > 1 && <button className="btn btn-sm" onClick={() => setIdx(idx + 1)}><Icon name="refresh" size={15} stroke={2.3} />Đổi bài khác</button>}
                      </div>
                    </>
                  ) : <span style={{ fontSize: 14, color: '#6b6d82' }}>{ask === 'good' ? 'Chưa có bài nào đạt.' : ask === 'weak' ? 'Chưa có bài nào chưa đạt.' : 'Chưa có bài nào được nộp.'}</span>}
                </div>
              )}
            </>
          )}
        </aside>
      </div>

      {projecting && pick && (
        <div className="proj" role="dialog" aria-modal="true" aria-label="Chiếu bài lên lớp">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <img src="/brand/dol-logo.svg" alt="DOL" style={{ height: 28, width: 'auto' }} />
            <span style={{ width: 1, height: 26, background: '#ebeae6' }} />
            <span className="kindpill">{kind}</span>
            <span style={{ fontSize: 17, color: '#6b6d82', fontWeight: 700, flex: 1, minWidth: 0 }}>{room.codes[stepKey]} · {step.name} · <span style={{ color: '#3b3d54' }}>{shownName}</span></span>
            <span className="spill" style={{ fontSize: 18, padding: '6px 16px' }}>{pick.pickScore}</span>
            <button className="ibtn" onClick={() => setProjecting(false)} aria-label="Đóng chế độ chiếu"><Icon name="close" stroke={2.4} /></button>
          </div>
          <div style={{ flex: 1, minHeight: 0, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 12, justifyContent: 'center' }}>
            {body.lines.map((l, i) => <LineView key={`${pick.student.id}-${l.id}`} line={l} big delay={i * 0.05} />)}
            {body.feedback && <p style={{ margin: '6px 0 0', fontSize: 19, lineHeight: 1.55, color: '#3b3d54', padding: '0 6px' }}><b style={{ color: '#6a3fd6' }}>Nhận xét AI:</b> {body.feedback}</p>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 14, color: '#6b6d82', fontWeight: 600 }}>Esc để đóng{picked.length > 1 ? ' · → để đổi bài' : ''}</span>
            <div style={{ flex: 1 }} />
            {picked.length > 1 && <button className="btn" onClick={() => setIdx(idx + 1)}><Icon name="refresh" size={15} stroke={2.3} />Đổi bài khác</button>}
          </div>
        </div>
      )}
    </>
  );
};
