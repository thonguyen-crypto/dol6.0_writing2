/* Several parts, one choice each, each part saved as its own submission
   (e.g. Band Detective: paragraph A–D, choose a band). Tracking shows "Làm dở" until all parts are in.
   The part ids must match step.tracking.parts in the lesson meta. */
import React, { useState } from 'react';
import { AttemptBar } from './AttemptBar';
import { useActivity, useDraft } from './useActivity';
import { useClassroom } from '../ClassroomProvider';

export interface ChoicePart {
  id: string;
  label: string;
  body: React.ReactNode;
  question: string;
  options: string[];
  answer: string;
  /** Shown after the part is finished or the teacher opens the answer */
  after?: React.ReactNode;
}

const PartCard: React.FC<{ stepKey: string; part: ChoicePart; optionPrefix: string; revealed: boolean; nav: React.ReactNode }> = ({ stepKey, part, optionPrefix, revealed, nav }) => {
  const act = useActivity(stepKey, part.id);
  const [pick, setPick] = useDraft<string>(`${stepKey}:${part.id}`, '');
  const done = act.locked;
  const showKey = revealed || done;
  const lastWrong = act.latest && !act.latest.isCorrect ? act.latest.answer.choice : undefined;
  const check = () => act.submit({
    // `choice` always; also under the poll field so "Đếm trả lời" can count it.
    answer: { choice: pick, ...(act.step?.poll ? { [act.step.poll.field]: pick } : {}) },
    lines: [{ id: part.id, label: part.question, value: `${optionPrefix}${pick}`, correct: pick === part.answer }],
    isCorrect: pick === part.answer,
    score: pick === part.answer ? 1 : 0,
    maxScore: 1,
    models: [{ id: part.id, label: part.question, value: `${optionPrefix}${part.answer}`, correct: true }],
  });
  return (
    <div style={{ display: 'flex', gap: 18, height: '100%' }}>
      <div className="card" style={{ flex: 1, minWidth: 0, padding: '18px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><span className="lbl">{part.label}</span><div style={{ flex: 1 }} />{nav}</div>
        <div key={part.id} className="enter tx" style={{ flex: 1, minHeight: 0, overflow: 'auto', fontSize: 18, lineHeight: 1.75, color: '#3b3d54' }}>{part.body}</div>
      </div>
      <div className="col" style={{ width: 360, gap: 12 }}>
        <div className="card" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 17, fontWeight: 800, color: '#3b3d54' }}>{part.question}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
            {part.options.map((opt) => {
              const cls = showKey && opt === part.answer ? 'ok' : opt === lastWrong && pick === opt ? 'bad' : pick === opt ? 'sel' : showKey ? 'dim' : '';
              return (
                <button key={opt} className={`tile ${cls}`} style={{ height: 86 }} disabled={done || act.paused} onClick={() => setPick(opt)} aria-pressed={pick === opt}>
                  <span className="cap">{optionPrefix.trim() || 'Chọn'}</span><span className="big" style={{ fontSize: 34 }}>{opt}</span>
                </button>
              );
            })}
          </div>
          <AttemptBar comment={act.submission?.review?.comment} latest={act.latest} attemptsLeft={act.attemptsLeft} max={act.max} locked={act.locked} paused={act.paused} demo={act.demo} busy={act.busy} error={act.error}
            ready={Boolean(pick)} readyHint="Chọn một đáp án" actionLabel={act.latest ? 'Nộp lại' : 'Chốt đáp án'} onAction={check} />
        </div>
        {showKey && part.after}
      </div>
    </div>
  );
};

export const ChoicePerPart: React.FC<{ stepKey: string; parts: ChoicePart[]; optionPrefix?: string; revealed: boolean }> = ({ stepKey, parts, optionPrefix = '', revealed }) => {
  const [i, setI] = useState(0);
  const room = useClassroom();
  const nav = (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      <button className="ibtn" style={{ width: 44, height: 44 }} disabled={i === 0} onClick={() => setI(i - 1)} aria-label="Phần trước">‹</button>
      <span className="pager">{parts.map((p, k) => {
        const sub = room.mySubmission(stepKey, p.id);
        const last = sub?.attempts[sub.attempts.length - 1];
        return <button key={p.id} className={`pd${k === i ? ' on' : last ? (last.isCorrect ? ' ok' : ' bad') : ''}`} onClick={() => setI(k)} aria-label={p.label} />;
      })}</span>
      <button className="ibtn" style={{ width: 44, height: 44 }} disabled={i >= parts.length - 1} onClick={() => setI(i + 1)} aria-label="Phần sau">›</button>
    </span>
  );
  return <PartCard key={parts[i].id} stepKey={stepKey} part={parts[i]} optionPrefix={optionPrefix} revealed={revealed} nav={nav} />;
};
