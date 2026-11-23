/* Short writing items graded by AI on the server (rubric in src/lessons/<id>/rubrics.ts).
   Pass rule: score ≥ passScore (meta). If AI is unavailable the student can retry or send
   the answer to the teacher: the attempt is saved as "Cần GV xem". */
import React from 'react';
import { AttemptBar } from './AttemptBar';
import { useActivity, useDraft } from './useActivity';

export interface PhraseItem {
  id: string;
  prompt: string;
  /** Extra line under the prompt (cues, frame, hint) */
  hint?: React.ReactNode;
  placeholder?: string;
  models: string[];
  multiline?: boolean;
}

export const PhraseLab: React.FC<{ stepKey: string; partId?: string; rubricId: string; items: PhraseItem[]; tip?: React.ReactNode; revealed: boolean; columns?: 1 | 2 }> = ({ stepKey, partId = 'all', rubricId, items, tip, revealed, columns = 2 }) => {
  const act = useActivity(stepKey, partId);
  const [answers, setAnswers] = useDraft<Record<string, string>>(`${stepKey}:${partId}`, {});
  const filled = items.filter((i) => (answers[i.id] || '').trim()).length;
  const last = new Map((act.latest?.lines || []).map((l) => [l.id, l]));
  const [aiDown, setAiDown] = React.useState(false);
  const models = items.map((i) => ({ id: i.id, label: i.prompt, value: i.models.join(' / '), correct: true }));

  const send = async () => {
    setAiDown(false);
    const result = await act.grade(rubricId, items.map((i) => ({ id: i.id, prompt: i.prompt, answer: (answers[i.id] || '').trim(), models: i.models })));
    if (!result) { setAiDown(true); return; }
    const byId = new Map(result.items.map((r) => [r.id, r]));
    await act.submit({
      answer: answers,
      lines: items.map((i) => ({ id: i.id, label: i.prompt, value: (answers[i.id] || '').trim(), correct: byId.get(i.id)?.isCorrect, feedback: byId.get(i.id)?.feedback, suggestion: byId.get(i.id)?.suggestion })),
      isCorrect: result.score >= (act.step?.tracking?.passScore || 4),
      score: result.score,
      maxScore: result.maxScore,
      ai: { score: result.score, maxScore: result.maxScore, ideas: result.ideas, grammar: result.grammar, vocabulary: result.vocabulary },
      models,
    });
  };

  const sendToTeacher = async () => {
    await act.submit({
      answer: answers,
      lines: items.map((i) => ({ id: i.id, label: i.prompt, value: (answers[i.id] || '').trim() })),
      isCorrect: false,
      score: null,
      maxScore: 5,
      scoreDisplay: 'Chờ GV chấm',
      ai: { score: 0, maxScore: 5, ideas: '', fallback: true },
      models,
    });
    setAiDown(false);
    act.setError('');
  };

  const showModels = revealed || act.locked;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {tip && <div className="fb info" style={{ marginBottom: 12, fontSize: 15 }}>{tip}</div>}
      <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gridAutoRows: '1fr', gap: 12 }}>
        {items.map((item, k) => {
          const r = last.get(item.id);
          return (
            <div key={item.id} className={`card enter d${k + 1}`} style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'center', borderColor: r?.correct === false ? '#f3c9cb' : r?.correct ? '#bfe0c7' : undefined }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="num" style={{ width: 24, height: 24, fontSize: 12 }}>{k + 1}</span>
                <span style={{ fontSize: 18, fontWeight: 800, color: '#3b3d54' }}>{item.prompt}</span>
              </div>
              {item.hint && <div style={{ fontSize: 14, color: '#6b6d82' }}>{item.hint}</div>}
              {item.multiline
                ? <textarea className="ta" rows={2} value={answers[item.id] || ''} placeholder={item.placeholder || 'Viết câu của bạn…'} disabled={act.locked || act.paused} onChange={(e) => setAnswers((a) => ({ ...a, [item.id]: e.target.value }))} />
                : <input className="inp" value={answers[item.id] || ''} placeholder={item.placeholder || 'Viết cụm thay thế…'} disabled={act.locked || act.paused} onChange={(e) => setAnswers((a) => ({ ...a, [item.id]: e.target.value }))} />}
              {r?.feedback && <div style={{ fontSize: 13.5, lineHeight: 1.45, color: r.correct ? '#23703a' : '#b0262e', fontWeight: 600 }}>{r.correct ? '✓ ' : '! '}{r.feedback}{r.suggestion ? ` Gợi ý: ${r.suggestion}` : ''}</div>}
              {showModels && <div style={{ fontSize: 13.5, color: '#23703a', fontWeight: 700 }}>Đáp án mẫu: {item.models.join(' / ')}</div>}
            </div>
          );
        })}
      </div>
      <AttemptBar comment={act.submission?.review?.comment} latest={act.latest} attemptsLeft={act.attemptsLeft} max={act.max} locked={act.locked} paused={act.paused} demo={act.demo} busy={act.busy} error={act.error}
        ready={filled === items.length} readyHint={`Viết đủ ${items.length} câu (${filled}/${items.length})`} actionLabel={act.latest ? 'Nộp lại' : 'Nộp bài'} onAction={send}
        extra={aiDown && !act.locked ? <button className="btn btn-soft" onClick={sendToTeacher} disabled={act.busy}>Gửi để giáo viên chấm</button> : undefined} />
    </div>
  );
};
