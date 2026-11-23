/* Right column in teacher mode: step card, answer counter, tools, students to watch, drawer picker. */
import React from 'react';
import { useClassroom } from '../ClassroomProvider';
import { rowView, STATUS_META, latestAttempt } from '../tracking/tracking';
import type { StepMeta } from '../types';
import { Icon, initials, StatusTag } from '../ui';

export interface TeacherTools {
  boardStageOn: boolean;
  mirrorOn: boolean;
  onToggleStageBoard: () => void;
  onPickName: () => void;
  onMirror: () => void;
  onOpenStudent: (studentId: string, stepKey: string | null) => void;
}

export const TeacherPanel: React.FC<{ step: StepMeta; stepIndex: number; build: number; builds: number; pollPart: string; setPollPart: (p: string) => void; tools: TeacherTools }> = ({ step, stepIndex, build, builds, pollPart, setPollPart, tools }) => {
  const room = useClassroom();
  const { students, index, control } = room;
  const N = students.length;
  const tracked = Boolean(step.tracking);
  const rows = tracked ? students.map((s) => rowView(index, step, s)) : [];
  const count = (s: string) => rows.filter((r) => r.status === s).length;
  const submitted = rows.filter((r) => r.status !== 'none').length;
  const revealed = Boolean(control.revealed[step.key]);
  // Khóa bước (pacing)
  const allSteps = room.lesson.steps;
  const here = allSteps.findIndex((s) => s.key === step.key);
  const gate = typeof control.gate === 'number' ? control.gate : null;
  const gateStep = gate !== null ? allSteps[Math.min(gate, allSteps.length - 1)] : null;
  const gateName = gateStep ? gateStep.short || gateStep.name : '';
  const [paceOpen, setPaceOpen] = React.useState(false);
  const setGate = (g: number | null) => {
    void room.setControl({ gate: g });
    room.showToast(g === null ? 'Đã tắt khóa bước: học sinh đi tự do' : `Học sinh mở tới: ${allSteps[g].short || allSteps[g].name}`);
  };
  // Students who finished the gate step and are waiting there.
  const waiting = gateStep && gateStep.tracking ? students.filter((s) => s.stepKey === gateStep.key && rowView(index, gateStep, s).status !== 'none').length : 0;
  const attention = rows.filter((r) => r.status === 'review' || r.status === 'weak' || r.status === 'partial')
    .sort((a, b) => ['review', 'weak', 'partial'].indexOf(a.status) - ['review', 'weak', 'partial'].indexOf(b.status));

  // Answer counter: latest answers of the chosen part, counted per option.
  const poll = step.poll;
  const parts = step.tracking?.parts || [];
  const part = parts.find((p) => p.id === pollPart) || parts[0];
  const counts = poll ? poll.options.map((opt) => students.filter((s) => {
    const a = latestAttempt(index.get(`${s.id}|${step.key}|${part?.id}`));
    return a && String(a.answer[poll.field]) === opt;
  }).length) : [];
  const maxCount = Math.max(1, ...counts);
  const correct = poll?.correct?.[part?.id || ''];

  return (
    <div className="tpanel" style={{ position: 'absolute', left: 1042, top: 82, width: 374, height: 802, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 12, zIndex: 6, paddingBottom: 4 }}>
      <div className="tcard">
        <div className="tl">{step.kind === 'cover' ? 'Mở đầu' : `Chặng ${step.stage} · Bước ${stepIndex}/${room.lesson.steps.length - 1}`}{room.codes[step.key] ? ` · trang ${room.codes[step.key]}` : ''}</div>
        <div style={{ fontSize: 19, fontWeight: 800, color: '#3b3d54', margin: '4px 0 10px' }}>{step.name}</div>
        {tracked ? (
          <>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 8 }}><span style={{ fontSize: 28, fontWeight: 800, color: '#3b3d54' }}>{submitted}</span><span style={{ fontSize: 14, fontWeight: 700, color: '#6b6d82' }}>/ {N} đã nộp</span></div>
            <div className="track"><div className="fill" style={{ width: `${N ? (submitted / N) * 100 : 0}%`, background: '#2e9e46' }} /></div>
            <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
              <StatusTag status="done" label={`Đạt ${count('done')}`} />
              <StatusTag status="weak" label={`Chưa đạt ${count('weak')}`} />
              {count('review') > 0 && <StatusTag status="review" label={`Cần GV xem ${count('review')}`} />}
              {count('partial') > 0 && <StatusTag status="partial" label={`Làm dở ${count('partial')}`} />}
              <StatusTag status="none" label={`Chưa làm ${count('none')}`} />
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 14, color: '#4b4d63', lineHeight: 1.5 }}>
              {step.kind === 'theory' ? 'Slide lý thuyết: bấm › để mở từng lớp. Học sinh bật “Theo giáo viên” sẽ thấy cùng build.'
                : step.kind === 'activity' ? 'Hoạt động trên lớp, không có bài nộp nên không gắn trạng thái.'
                : `Học sinh đã vào lớp: ${N}.`}
            </div>
            {step.kind === 'theory' && builds > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10 }}>
                {Array.from({ length: builds }, (_, i) => <span key={i} style={{ width: i === build ? 22 : 9, height: 9, borderRadius: 99, background: i <= build ? '#d63a43' : '#e6e5e1', transition: 'all .3s' }} />)}
                <span style={{ fontSize: 12.5, fontWeight: 700, color: '#6b6d82', marginLeft: 6 }}>Build {build + 1}/{builds}</span>
              </div>
            )}
          </>
        )}
        {gate !== null ? (
          <div className="pacerow"><Icon name="lock" size={15} /><b>HS mở tới: {gateName}</b>{here > gate && <button type="button" className="btn btn-sm btn-soft" style={{ height: 28 }} onClick={() => setGate(here)}>Mở tới đây</button>}</div>
        ) : <div className="pacerow free"><b>Nhịp lớp: Tự do</b></div>}
      </div>

      {poll && (
        <div className="tcard">
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10, gap: 8 }}>
            <span className="tl" style={{ flex: 1 }}>Đếm trả lời</span>
            {parts.length > 1 && <div className="seg">{parts.map((p) => <button key={p.id} className={p.id === part?.id ? 'on' : ''} onClick={() => setPollPart(p.id)}>{p.id}</button>)}</div>}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {poll.options.map((opt, i) => {
              const good = revealed && correct === opt;
              return (
                <div key={opt} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 70, fontSize: 13, fontWeight: 800, color: good ? '#23703a' : '#3b3d54' }}>{poll.field === 'band' ? `Band ${opt}` : opt}</span>
                  <div className="track" style={{ flex: 1, height: 20, borderRadius: 7 }}><div className="fill" style={{ width: `${(counts[i] / maxCount) * 100}%`, background: good ? '#2e9e46' : revealed ? '#d6d5d0' : '#d63a43', borderRadius: 7, animationDelay: `${i * 0.08}s` }} /></div>
                  <span style={{ width: 24, textAlign: 'right', fontSize: 14, fontWeight: 800, color: '#3b3d54' }}>{counts[i]}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="tcard">
        <div className="tl" style={{ marginBottom: 8 }}>Công cụ bước này</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8 }}>
          <button className="tool" disabled={!N} onClick={tools.onPickName}><Icon name="shuffle" />Gọi tên ngẫu nhiên</button>
          <button className="tool" onClick={() => { void room.setControl({ invite: step.key }); room.showToast(`Đã mời lớp ${room.classCode} tới “${step.name}”`); }}><Icon name="send" />Mời lớp tới đây</button>
          <button className={`tool${control.paused ? ' on' : ''}`} onClick={() => { void room.setControl({ paused: !control.paused }); room.showToast(control.paused ? 'Đã mở khóa, học sinh làm tiếp' : 'Đã tạm khóa: học sinh nghe giảng'); }}><Icon name="pause" />{control.paused ? 'Mở khóa lớp' : 'Tạm khóa'}</button>
          <button className={`tool${tools.boardStageOn ? ' on' : ''}`} disabled={step.stage === 0} onClick={tools.onToggleStageBoard}><Icon name="chart" />Tiến độ stage</button>
          <button className={`tool lockt${gate !== null ? ' on' : ''}${paceOpen ? ' open' : ''}`} aria-expanded={paceOpen} onClick={() => setPaceOpen(!paceOpen)}><Icon name="lock" /><span><span>Khóa bước</span><span className="lsub">{gate !== null ? `Đang bật · tới ${gateName}` : 'Đang tắt · Tự do'}</span></span></button>
          <button className={`tool${tools.mirrorOn ? ' on' : ''}`} style={{ color: '#5631b8' }} disabled={step.kind === 'cover' || step.kind === 'divider'} onClick={tools.onMirror}><Icon name="mirror" size={19} stroke={1.9} />Hỏi gương thần</button>
          {step.tracking && <button className={`tool${revealed ? ' on' : ''}`} style={{ gridColumn: '1 / -1' }} onClick={() => { void room.setControl({ reveal: { stepKey: step.key, on: !revealed } }); room.showToast(revealed ? 'Đã ẩn đáp án' : 'Đã mở đáp án cho cả lớp'); }}><Icon name={revealed ? 'eye' : 'check'} />{revealed ? 'Ẩn đáp án' : 'Mở đáp án'}</button>}
        </div>
        {paceOpen && (
          <div className="pace" role="group" aria-label="Khóa bước">
            <div className="paceh"><span>Khóa bước</span><label><input type="checkbox" checked={gate !== null} onChange={(e) => setGate(e.target.checked ? Math.max(0, here) : null)} /> Bật</label></div>
            {gate !== null ? (
              <>
                <div className="pacestp">
                  <button type="button" disabled={gate <= 0} onClick={() => setGate(Math.max(0, gate - 1))} aria-label="Thu lại 1 bước">‹</button>
                  <b>Mở tới: {gateName}<small>bước {gate + 1}/{allSteps.length} của bài</small></b>
                  <button type="button" disabled={gate >= allSteps.length - 1} onClick={() => setGate(Math.min(allSteps.length - 1, gate + 1))} aria-label="Mở thêm 1 bước">›</button>
                </div>
                <button type="button" className="pacego" disabled={here === gate} onClick={() => setGate(here)}>Mở tới bước đang chiếu</button>
                <label className="pacechk"><input type="checkbox" checked={Boolean(control.gateAuto)} onChange={(e) => void room.setControl({ gateAuto: e.target.checked })} /> Tự mở theo bước GV đang chiếu</label>
              </>
            ) : <p className="pacefree">Học sinh đi tới bất kỳ bước nào. Bật để giữ cả lớp cùng nhịp; mặc định mở tới bước đang chiếu.</p>}
          </div>
        )}
      </div>

      <div className="tcard">
        <div className="tl" style={{ marginBottom: 8 }}>Cần chú ý · {attention.length}</div>
        {waiting > 0 && <div className="pacewait"><i>{waiting}</i><div>{waiting} bạn xong, đang chờ<small>ở {gateName}</small></div></div>}
        {attention.length === 0 && <p style={{ margin: 0, fontSize: 13.5, color: '#6b6d82' }}>Không có học sinh cần chú ý ở bước này.</p>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {attention.slice(0, 4).map((r) => (
            <div key={r.student.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 4px' }}>
              <span style={{ width: 32, height: 32, borderRadius: '50%', background: '#fdf1f1', color: '#d63a43', fontSize: 12, fontWeight: 800, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>{initials(r.student.name)}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#3b3d54' }}>{r.student.name}</div>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: r.status === 'review' ? '#946207' : r.status === 'weak' ? '#b0262e' : '#3c62b8' }}>{STATUS_META[r.status].label}{r.note ? ` · ${r.note}` : ''}</div>
              </div>
              <button className="btn btn-sm btn-soft" style={{ height: 32 }} onClick={() => tools.onOpenStudent(r.student.id, step.key)}>Xem bài</button>
            </div>
          ))}
        </div>
        {attention.length > 4 && <button className="btn btn-sm btn-ghost" style={{ marginTop: 4, width: '100%', color: '#5631b8' }} onClick={tools.onMirror}>+ {attention.length - 4} em khác · mở Theo dõi trang</button>}
      </div>

      <div className="tcard">
        <label className="tl" htmlFor="viewer" style={{ display: 'block', marginBottom: 8 }}>Hồ sơ bài làm của</label>
        <select id="viewer" value="" onChange={(e) => e.target.value && tools.onOpenStudent(e.target.value, tracked ? step.key : null)}
          style={{ width: '100%', height: 42, borderRadius: 12, border: '1.5px solid #e6e5e1', padding: '0 12px', font: 'inherit', fontSize: 14, fontWeight: 600, color: '#3b3d54', background: '#fff' }}>
          <option value="">{N ? 'Chọn học sinh để mở hồ sơ…' : 'Chưa có học sinh'}</option>
          {students.map((s) => <option key={s.id} value={s.id}>{s.name}{tracked ? ` · ${STATUS_META[rows.find((r) => r.student.id === s.id)?.status || 'none'].label}` : ''}</option>)}
        </select>
      </div>
    </div>
  );
};
