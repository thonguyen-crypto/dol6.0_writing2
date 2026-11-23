/* "Tiến độ lớp" — full-screen class progress, same layout and functions as the teacher
   dashboard on main (old UI), scrollable:
   left  · Điều hướng lớp học (overview / stage / activity focus + Mời) and Quản lý lớp học
   right · class header + search, stats, "Trạng thái từng trang" matrix (or the page tracker
           with Hỏi gương thần when one activity is focused), and one collapsible card per student.
   Clicking a page of a student opens the submission drawer (hồ sơ bài làm). */
import React, { useMemo, useState } from 'react';
import { useClassroom } from '../ClassroomProvider';
import { pageStatus, STATUS_META, type TrackStatus } from '../tracking/tracking';
import type { StepMeta } from '../types';
import { Icon, initials, StatusTag } from '../ui';
import { PageTracker } from './PageTracker';

const ONLINE_MS = 2 * 60 * 1000;
const ago = (iso?: string) => {
  if (!iso) return 'chưa rõ';
  const ms = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(ms)) return 'chưa rõ';
  if (ms < 60_000) return 'Vừa xong';
  if (ms < 3_600_000) return `${Math.round(ms / 60_000)} phút trước`;
  return `${Math.round(ms / 3_600_000)} giờ trước`;
};


/** A class code that is hard to guess: DOL- + 6 characters without look-alikes (no 0/O, 1/I/L). */
function randomClassCode() {
  const A = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return 'DOL-' + Array.from(bytes, (b) => A[b % A.length]).join('');
}

export const ClassProgress: React.FC<{
  onClose: () => void;
  onOpenStudent: (studentId: string, stepKey: string | null) => void;
}> = ({ onClose, onOpenStudent }) => {
  const room = useClassroom();
  const { lesson, codes, students, index, classCode } = room;
  const [stage, setStage] = useState<number | null>(null);
  const [act, setAct] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [newCode, setNewCode] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const pages = useMemo(() => lesson.steps.filter((s) => (s.kind === 'theory' || s.kind === 'activity') && !s.teacherOnly), [lesson.steps]);
  const stages = lesson.stages.map((sg) => ({ ...sg, pages: pages.filter((p) => p.stage === sg.n) }));
  const focus = act ? pages.find((p) => p.key === act) || null : null;
  const stageInfo = stage ? stages.find((s) => s.n === stage) || null : null;
  const visiblePages = focus ? [focus] : stageInfo ? stageInfo.pages : pages;
  const visibleTracked = visiblePages.filter((p) => p.tracking);

  const q = search.trim().toLowerCase();
  const shown = students.filter((s) => !q || s.name.toLowerCase().includes(q));
  const online = students.filter((s) => s.lastSeen && Date.now() - new Date(s.lastSeen).getTime() < ONLINE_MS).length;
  const tracked = pages.filter((p) => p.tracking);
  const statusOf = (p: StepMeta, id: string): TrackStatus | 'na' => (p.tracking ? pageStatus(index, p, id) : 'na');
  let submitted = 0, review = 0;
  for (const s of students) for (const p of tracked) {
    const st = pageStatus(index, p, s.id);
    if (st !== 'none') submitted++;
    if (st === 'review') review++;
  }

  const where = (key?: string) => {
    const p = lesson.steps.find((s) => s.key === key);
    if (!p) return 'Chưa vào bài';
    const sg = lesson.stages.find((s) => s.n === p.stage);
    return `${sg ? sg.name + ' > ' : ''}${p.name}`;
  };
  const pickStage = (n: number | null) => { setStage(n); setAct(null); };
  const pickAct = (p: StepMeta) => { setStage(p.stage || null); setAct(p.key); };
  const invite = async (p: StepMeta) => {
    await room.setControl({ invite: p.key });
    setMsg(`Đã mời lớp ${classCode} đến ${codes[p.key]} · ${p.name}.`);
  };
  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = newCode.trim().toUpperCase();
    if (!code) return;
    const error = await room.createClass(code);
    if (error) { setErr(error); return; }
    setErr(''); setNewCode(''); pickStage(null);
  };
  const remove = async (code: string) => {
    if (!window.confirm(`Xóa mã lớp ${code}? Học sinh của lớp này sẽ không đăng nhập bằng mã này được nữa.`)) return;
    await room.deleteClass(code);
  };

  const cols = `170px repeat(${visiblePages.length}, minmax(40px, 1fr)) 56px`;
  const mode = focus ? `Activity focus · ${codes[focus.key]} ${focus.name}` : stageInfo ? `Stage focus · ${stageInfo.name}` : 'Tổng quan toàn bộ bài';

  return (
    <div className="cp" role="region" aria-label="Tiến độ lớp">
      <div className="cp-app">
        <div className="cp-head">
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{lesson.title} <span style={{ fontWeight: 500, color: '#8b8da1' }}>· Tiến độ lớp</span></div>
          </div>
          <span className="cp-tag" style={{ background: '#e8f4ea', color: '#23703a' }}><Icon name="check" size={13} stroke={2.6} />AI qua server</span>
          <button className="btn btn-sm btn-red" onClick={onClose}><Icon name="left" size={15} stroke={2.4} />Về màn trình chiếu</button>
        </div>

        <div className="cp-main">
          {/* LEFT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            <div className="cp-card" style={{ padding: 18 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}><Icon name="notes" size={16} style={{ color: '#6d3fd9' }} />Điều hướng lớp học</div>
                  <div style={{ fontSize: 12.5, color: '#6b6d82', marginTop: 4, lineHeight: 1.4 }}>Bấm một stage để lọc tiến độ; dùng nút Mời để điều hướng học sinh.</div>
                </div>
                <span className="cp-lop">LỚP<br />{classCode}</span>
              </div>
              <button className={`cp-overview${!stage ? ' on' : ''}`} onClick={() => pickStage(null)}>
                <Icon name="grid" size={16} /><span style={{ flex: 1, textAlign: 'left' }}>Tổng quan tất cả stage</span>{!stage && <span className="cp-pill light">ĐANG XEM</span>}
              </button>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
                {stages.map((sg) => {
                  const on = stage === sg.n;
                  return (
                    <div key={sg.n} className={`cp-stage${on ? ' on' : ''}`}>
                      <button className="cp-srow" onClick={() => pickStage(on && !act ? null : sg.n)} aria-expanded={on}>
                        <span style={{ color: '#6d3fd9' }}>{sg.n}.</span><span style={{ flex: 1 }}>{sg.name}</span>
                        {on && !act && <span className="cp-pill">ĐANG XEM</span>}
                        <Icon name={on ? 'down' : 'right'} size={15} style={{ color: '#8b8da1' }} />
                      </button>
                      {on && sg.pages.filter((p) => p.tracking).map((p) => (
                        <div key={p.key} className={`cp-act${act === p.key ? ' on' : ''}`} onClick={() => pickAct(p)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') pickAct(p); }}>
                          <span style={{ color: '#8b8da1', fontSize: 12, fontWeight: 800, width: 28 }}>{codes[p.key]}</span>
                          <span style={{ flex: 1, lineHeight: 1.35 }}>{p.name}</span>
                          {act === p.key && <span className="cp-pill">XEM</span>}
                          <button className="cp-moi" onClick={(e) => { e.stopPropagation(); void invite(p); }}><Icon name="send" size={12} stroke={2.4} />Mời</button>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
              {msg && <div className="cp-msg">{msg}</div>}
            </div>

            <div className="cp-card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 800, letterSpacing: '.04em' }}><Icon name="users" size={17} style={{ color: '#d63a43' }} />QUẢN LÝ LỚP HỌC</div>
              <div className="cp-cap" style={{ margin: '16px 0 8px' }}>Tạo mã lớp mới</div>
              <form onSubmit={create} style={{ display: 'flex', gap: 8, paddingBottom: 18, borderBottom: '1px solid #f0efeb' }}>
                <input className="cp-input" placeholder="Tự đặt mã" value={newCode} onChange={(e) => setNewCode(e.target.value)} aria-label="Mã lớp mới" />
                <button className="btn btn-sm btn-soft" type="button" title="Tạo mã ngẫu nhiên, khó đoán" aria-label="Tạo mã ngẫu nhiên" onClick={() => setNewCode(randomClassCode())}>Ngẫu nhiên</button>
                <button className="btn btn-sm btn-red" type="submit">+ Tạo</button>
              </form>
              {err && <div className="fb try" style={{ marginTop: 10, padding: '8px 12px', fontSize: 13 }}>{err}</div>}
              <div className="cp-cap" style={{ margin: '16px 0 10px' }}>Danh sách lớp hiện tại</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {room.classCodes.map((code) => (
                  <div key={code} className={`cp-class${code === classCode ? ' on' : ''}`} onClick={() => { room.selectClass(code); pickStage(null); }} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') room.selectClass(code); }}>
                    <span className="cp-dot" style={{ background: code === classCode ? '#d63a43' : '#d4d3cf' }} />
                    <span style={{ flex: 1 }}>{code}</span>
                    {room.classCodes.length > 1 && <button className="cp-del" onClick={(e) => { e.stopPropagation(); void remove(code); }} aria-label={`Xóa mã lớp ${code}`} title="Xóa mã lớp này"><Icon name="trash" size={14} /></button>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, minWidth: 0 }}>
            <div className="cp-card" style={{ padding: '22px 24px', display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 21, fontWeight: 600 }}>Lớp: <span style={{ color: '#d63a43' }}>{classCode}</span></span>
                  <span className="cp-tag" style={{ background: '#e8f4ea', color: '#23703a', border: '1px solid #c8e6cf' }}><span className="cp-dot" style={{ width: 6, height: 6, background: '#2e9e46' }} />Live Updates</span>
                </div>
                <div style={{ fontSize: 13, color: '#6b6d82', marginTop: 4 }}>Sĩ số: <b style={{ color: '#3b3d54' }}>{students.length} học sinh</b> đang hoạt động. Tự động cập nhật khi học sinh nộp bài.</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                  <span className={`cp-mode${focus ? ' act' : stageInfo ? ' stage' : ''}`}>{mode}</span>
                  {focus && <button className="cp-back" onClick={() => setAct(null)}>Quay lại stage</button>}
                  {stage && <button className="cp-back" onClick={() => pickStage(null)}>Quay lại tổng quan</button>}
                </div>
              </div>
              <div style={{ position: 'relative', width: 260 }}>
                <Icon name="search" size={15} style={{ position: 'absolute', left: 13, top: 13, color: '#8b8da1' }} />
                <input className="cp-input" style={{ width: '100%', paddingLeft: 38, textTransform: 'none', fontSize: 13, fontWeight: 500 }} placeholder="Tìm học sinh theo tên..." value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Tìm học sinh" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
              <div className="cp-card cp-stat"><b>{online}</b><span>học sinh đang online</span></div>
              <div className="cp-card cp-stat"><b style={{ color: '#2e9e46' }}>{submitted}</b><span>bài đã nộp</span></div>
              <div className="cp-card cp-stat"><b style={{ color: '#a86e08' }}>{review}</b><span>bài cần thầy cô xem</span></div>
            </div>

            {focus ? (
              <div className="cp-tracker">
                <PageTracker embedded stepKey={focus.key} onClose={() => setAct(null)} onBack={() => setAct(null)} onOpenStudent={(id, key) => onOpenStudent(id, key)} />
              </div>
            ) : shown.length > 0 && (
              <div className="cp-card" style={{ padding: '22px 22px 14px' }}>
                <div className="cp-cap">{stageInfo ? `Stage ${stageInfo.n} · ${stageInfo.name}` : 'Tổng quan'}</div>
                <div style={{ fontSize: 22, fontWeight: 500, marginTop: 4 }}>Trạng thái từng trang</div>
                <div style={{ fontSize: 14, color: '#6b6d82', marginTop: 2 }}>Bấm mã trang để mở phần theo dõi và hỏi gương thần. Ô “·” là trang lý thuyết, không có bài nộp.</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, margin: '14px 0 6px' }}>
                  <StatusTag status="done" /><StatusTag status="weak" /><StatusTag status="review" /><StatusTag status="partial" /><StatusTag status="none" /><StatusTag status="na" />
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <div className="cp-row" style={{ gridTemplateColumns: cols, borderTop: 0, fontSize: 13, fontWeight: 600, color: '#6b6d82' }}>
                    <span>Học viên</span>
                    {visiblePages.map((p) => (
                      <span key={p.key} style={{ textAlign: 'center' }}>
                        <button className={`cp-code${p.tracking ? '' : ' th'}`} onClick={() => p.tracking && pickAct(p)} disabled={!p.tracking} title={`${codes[p.key]} · ${p.name}${p.tracking ? '' : ' · lý thuyết'}`}>{codes[p.key]}</button>
                      </span>
                    ))}
                    <span style={{ textAlign: 'center' }}>Xong</span>
                  </div>
                  {shown.map((s) => (
                    <div key={s.id} className="cp-row" style={{ gridTemplateColumns: cols }}>
                      <button className="cp-name" onClick={() => onOpenStudent(s.id, null)} title="Mở hồ sơ bài làm">{s.name}</button>
                      {visiblePages.map((p) => {
                        const st = statusOf(p, s.id);
                        return (
                          <span key={p.key} style={{ textAlign: 'center' }}>
                            {st === 'na' ? <span className="cp-cell na">·</span>
                              : <button className={`cp-cell c-${st}`} onClick={() => onOpenStudent(s.id, p.key)} title={`${codes[p.key]} · ${STATUS_META[st].label}`}>{STATUS_META[st].icon}</button>}
                          </span>
                        );
                      })}
                      <span style={{ textAlign: 'center', fontSize: 14, fontWeight: 800 }}>{visibleTracked.filter((p) => pageStatus(index, p, s.id) === 'done').length}/{visibleTracked.length}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {shown.length === 0 && (
              <div className="cp-card" style={{ padding: 44, textAlign: 'center' }}>
                <div style={{ fontSize: 16, fontWeight: 800 }}>{students.length ? 'Không tìm thấy học sinh' : `Chưa có học sinh trong lớp ${classCode}`}</div>
                <div style={{ fontSize: 13, color: '#6b6d82', marginTop: 4 }}>{students.length ? 'Thử tên khác.' : <>Học sinh sẽ xuất hiện ngay khi đăng nhập bằng mã lớp <b style={{ color: '#d63a43' }}>{classCode}</b>.</>}</div>
              </div>
            )}

            {shown.map((s) => {
              const isOpen = !!open[s.id];
              const done = visibleTracked.filter((p) => pageStatus(index, p, s.id) === 'done').length;
              const pct = visibleTracked.length ? Math.round((100 * done) / visibleTracked.length) : 0;
              const fst = focus ? pageStatus(index, focus, s.id) : null;
              const isOnline = !!s.lastSeen && Date.now() - new Date(s.lastSeen).getTime() < ONLINE_MS;
              return (
                <div key={s.id} className="cp-card" style={{ overflow: 'hidden' }}>
                  <div className="cp-shead" onClick={() => setOpen({ ...open, [s.id]: !isOpen })} role="button" tabIndex={0} aria-expanded={isOpen} onKeyDown={(e) => { if (e.key === 'Enter') setOpen({ ...open, [s.id]: !isOpen }); }}>
                    <span className="cp-av">{initials(s.name)}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16.5, fontWeight: 700 }}>{s.name}<span className="cp-dot" style={{ background: isOnline ? '#2e9e46' : '#cfcad3' }} title={isOnline ? 'Online' : 'Offline'} /></div>
                      <div style={{ fontSize: 12.5, color: '#8b8da1', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Hoạt động cuối: {ago(s.lastSeen)} • <span style={{ color: '#d63a43', fontWeight: 500 }}>{where(s.stepKey)}</span></div>
                    </div>
                    <div style={{ width: 100 }} aria-label={`Tiến độ ${pct}%`}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9.5, fontWeight: 800, letterSpacing: '.08em', color: '#8b8da1' }}><span>{focus ? 'ACTIVITY' : stage ? 'STAGE' : 'TỔNG'}</span><span>{pct}%</span></div>
                      <div style={{ height: 6, borderRadius: 999, background: '#f0efeb', marginTop: 4, overflow: 'hidden' }}><div style={{ height: '100%', borderRadius: 999, width: `${pct}%`, background: 'linear-gradient(90deg,#d63a43,#7c4ad9)' }} /></div>
                    </div>
                    {fst ? <StatusTag status={fst} label={`${STATUS_META[fst].label} · ${done}/1 activity`} />
                      : <span className="cp-badge">{done}/{visibleTracked.length} bài luyện · {pct}%</span>}
                    <span className="cp-caret"><Icon name={isOpen ? 'down' : 'right'} size={15} /></span>
                  </div>
                  {isOpen && (
                    <div className="cp-sections" style={{ gridTemplateColumns: stage ? '1fr' : 'repeat(4, minmax(0, 1fr))' }}>
                      {stages.filter((sg) => !stage || sg.n === stage).map((sg) => (
                        <div key={sg.n} className="cp-sec">
                          <div className="cp-sectitle">{sg.n}. {sg.name.toUpperCase()}</div>
                          <div style={stage ? { display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8 } : { display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {sg.pages.filter((p) => !focus || p.key === focus.key).map((p) => {
                              const st = statusOf(p, s.id);
                              return (
                                <button key={p.key} className="cp-mod" onClick={() => onOpenStudent(s.id, p.key)}>
                                  <span><b style={{ color: '#8b8da1', marginRight: 6 }}>{codes[p.key]}</b>{p.short || p.name}</span>
                                  {st === 'na' ? <span className="cp-st na">Lý thuyết</span> : <span className={`cp-st c-${st}`}>{STATUS_META[st].label}</span>}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
