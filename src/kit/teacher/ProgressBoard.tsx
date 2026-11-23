/* "Tiến độ lớp" (all activity steps) and "Tiến độ stage" (theory + activity of one stage).
   Click a page code → page tracker + Hỏi gương thần. Click a name → submission drawer. */
import React from 'react';
import { useClassroom } from '../ClassroomProvider';
import { pageStatus, STATUS_META } from '../tracking/tracking';
import { Icon, StatusTag } from '../ui';

export const ProgressBoard: React.FC<{
  mode: 'all' | 'stage';
  stage: number;
  currentKey: string;
  onClose: () => void;
  onOpenPage: (key: string) => void;
  onOpenStudent: (studentId: string) => void;
}> = ({ mode, stage, currentKey, onClose, onOpenPage, onOpenStudent }) => {
  const { lesson, codes, students, index, classCode } = useClassroom();
  const steps = lesson.steps.filter((s) => (mode === 'stage' ? s.stage === stage && (s.kind === 'activity' || s.kind === 'theory') : s.kind === 'activity'));
  const tracked = steps.filter((s) => s.tracking);
  const stageInfo = lesson.stages.find((s) => s.n === stage);
  const sum = { done: 0, doing: 0, notyet: 0 };
  const rows = students.map((student, i) => {
    let done = 0, any = false;
    const cells = steps.map((s, j) => {
      if (!s.tracking) return { cls: 'c-na', t: '·', delay: 0 };
      const st = pageStatus(index, s, student.id);
      if (st === 'done') done++;
      if (st !== 'none') any = true;
      return { cls: `c-${st}`, t: STATUS_META[st].icon, delay: (i + j) * 0.012 };
    });
    if (mode === 'stage') { if (tracked.length && done === tracked.length) sum.done++; else if (any) sum.doing++; else sum.notyet++; }
    return { student, cells, done };
  });
  const cols = `168px repeat(${steps.length}, minmax(0, 1fr)) ${mode === 'stage' ? '170px' : '58px'}`;
  return (
    <div className="pop" style={{ left: 24, top: 82, width: 998, height: 562, zIndex: 30, padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 20, fontWeight: 800, color: '#3b3d54', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{mode === 'stage' ? `Tiến độ Chặng ${stage} · ${stageInfo?.name || ''}` : `Bảng tiến độ lớp ${classCode}`}</span>
        <div style={{ flex: 1 }} />
        <button className="ibtn" onClick={onClose} aria-label="Đóng bảng tiến độ"><Icon name="close" stroke={2.4} /></button>
      </div>
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', alignItems: 'center' }}>
        <StatusTag status="done" /><StatusTag status="weak" /><StatusTag status="review" /><StatusTag status="partial" /><StatusTag status="none" /><StatusTag status="na" />
        <span style={{ marginLeft: 'auto', fontSize: 12, color: '#6b6d82', fontWeight: 600 }}>Bấm mã trang: gương thần · bấm tên: hồ sơ bài làm</span>
      </div>
      {mode === 'stage' && (
        <div style={{ display: 'flex', gap: 6 }}>
          <span className="tag" style={{ background: '#e8f4ea', color: '#23703a', fontSize: 12, padding: '5px 10px' }}>Xong chặng: {sum.done}/{students.length}</span>
          <span className="tag" style={{ background: '#fdf1f1', color: '#d63a43', fontSize: 12, padding: '5px 10px' }}>Đang làm: {sum.doing}</span>
          <span className="tag" style={{ background: '#f7f7f5', color: '#4b4d63', fontSize: 12, padding: '5px 10px' }}>Chưa vào chặng: {sum.notyet}</span>
        </div>
      )}
      {students.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b6d82', fontSize: 15 }}>Chưa có học sinh vào lớp {classCode}. Học sinh đăng nhập bằng họ tên + mã lớp.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: cols, alignItems: 'center', rowGap: 6, columnGap: 2, fontSize: 13, overflow: 'auto', flex: 1, minHeight: 0, alignContent: 'start', paddingRight: 4 }}>
          <span style={{ position: 'sticky', top: 0, background: '#fff', alignSelf: 'stretch', zIndex: 2 }} />
          {steps.map((s) => (
            <button key={s.key} className={`hcode${s.key === currentKey ? ' cur' : ''}${s.tracking ? '' : ' na'}`} style={{ position: 'sticky', top: 0, background: '#fff', zIndex: 2 }} onClick={() => onOpenPage(s.key)} title={`${codes[s.key]} · ${s.name}${s.tracking ? '' : ' · không có bài nộp'}`}>
              <b>{codes[s.key]}</b><span>{s.short || s.name}</span>
            </button>
          ))}
          <span style={{ position: 'sticky', top: 0, background: '#fff', zIndex: 2, alignSelf: 'stretch', display: 'flex', alignItems: 'center', fontSize: 11, fontWeight: 800, color: '#6b6d82', paddingLeft: 10, letterSpacing: '.06em', textTransform: 'uppercase' }}>Xong</span>
          {rows.map(({ student, cells, done }) => (
            <React.Fragment key={student.id}>
              <button className="nmbtn" onClick={() => onOpenStudent(student.id)} title="Mở hồ sơ bài làm">{student.name}</button>
              {cells.map((c, j) => <span key={j} style={{ display: 'flex', justifyContent: 'center' }}><span className={`cell ${c.cls}`} style={{ animationDelay: `${c.delay}s` }}>{c.t}</span></span>)}
              {mode === 'stage' ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 10 }}>
                  <span className="track" style={{ flex: 1, height: 8 }}><span className="fill" style={{ display: 'block', width: `${tracked.length ? (done / tracked.length) * 100 : 0}%`, background: done === tracked.length ? '#2e9e46' : '#e4a23a' }} /></span>
                  <span style={{ fontSize: 12.5, fontWeight: 800, color: '#3b3d54', width: 34 }}>{done}/{tracked.length}</span>
                </span>
              ) : <span style={{ fontSize: 13, fontWeight: 800, color: '#3b3d54', paddingLeft: 10 }}>{done}/{tracked.length}</span>}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
};
