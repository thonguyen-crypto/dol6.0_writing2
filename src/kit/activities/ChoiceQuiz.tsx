/* Auto-graded choice set: every item has options and one answer.
   layout "grid": all items at once (2 columns) · "pager": one item per screen (long sentences).
   One submission for the whole set (partId), checked against the answer key here. */
import React, { useState } from 'react';
import { AttemptBar } from './AttemptBar';
import { useActivity, useDraft } from './useActivity';

export interface ChoiceItem {
  id: string;
  label: string;
  /** Main text of the item (descriptor, sentence…) */
  text?: React.ReactNode;
  /** Plain-text version for the teacher report (defaults to label) */
  reportLabel?: string;
  options: string[];
  answer: string;
  explain?: string;
}

export const ChoiceQuiz: React.FC<{
  stepKey: string;
  partId?: string;
  items: ChoiceItem[];
  layout?: 'grid' | 'pager';
  optionStyle?: 'tiles' | 'list' | 'verdict';
  optionPrefix?: string;
  revealed: boolean;
}> = ({ stepKey, partId = 'all', items, layout = 'grid', optionStyle = 'tiles', optionPrefix = '', revealed }) => {
  const act = useActivity(stepKey, partId);
  const [picks, setPicks] = useDraft<Record<string, string>>(`${stepKey}:${partId}`, {});
  const [page, setPage] = useState(0);
  const lastLines = new Map((act.latest?.lines || []).map((l) => [l.id, l]));
  const answered = items.filter((i) => picks[i.id]).length;
  const done = act.locked;
  const showKey = revealed || done;

  const check = async () => {
    const lines = items.map((i) => ({ id: i.id, label: i.reportLabel || i.label, value: `${optionPrefix}${picks[i.id] || ''}`, correct: picks[i.id] === i.answer }));
    const score = lines.filter((l) => l.correct).length;
    await act.submit({
      answer: picks,
      lines,
      isCorrect: score === items.length,
      score,
      maxScore: items.length,
      models: items.map((i) => ({ id: i.id, label: i.reportLabel || i.label, value: `${optionPrefix}${i.answer}`, correct: true })),
    });
  };

  const optionState = (item: ChoiceItem, opt: string) => {
    const picked = picks[item.id] === opt;
    const result = lastLines.get(item.id);
    if (showKey && opt === item.answer) return 'ok';
    if (picked && result && result.value === `${optionPrefix}${opt}` && result.correct === false) return 'bad';
    if (picked) return 'sel';
    if (showKey) return 'dim';
    return '';
  };

  const renderOptions = (item: ChoiceItem) => {
    const disabled = done || act.paused;
    const pick = (opt: string) => !disabled && setPicks((p) => ({ ...p, [item.id]: opt }));
    if (optionStyle === 'verdict') {
      return (
        <div style={{ display: 'flex', gap: 14 }}>
          {item.options.map((opt) => {
            const s = optionState(item, opt);
            return <button key={opt} className={`verdict ${opt.toLowerCase().startsWith('y') ? 'y' : 'n'} ${s === 'ok' ? 'ok' : s === 'bad' ? 'bad' : s === 'dim' ? 'dim' : ''}`} style={s === 'sel' ? { borderColor: '#d63a43', background: '#fdf6f6' } : undefined} onClick={() => pick(opt)} aria-pressed={picks[item.id] === opt}>{opt}</button>;
          })}
        </div>
      );
    }
    if (optionStyle === 'list') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {item.options.map((opt, k) => {
            const s = optionState(item, opt);
            return (
              <button key={opt} className={`opt ${s === 'bad' ? 'bad' : ''}`} onClick={() => pick(opt)} aria-pressed={picks[item.id] === opt}
                style={s === 'ok' ? { borderColor: '#2e9e46', background: '#e8f4ea', color: '#23703a' } : s === 'sel' ? { borderColor: '#d63a43', background: '#fdf6f6' } : s === 'dim' ? { opacity: 0.5 } : undefined}>
                <span className="k">{'ABCDEFG'[k]}</span>{opt}
              </button>
            );
          })}
        </div>
      );
    }
    return (
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${item.options.length}, minmax(0, 1fr))`, gap: 10 }}>
        {item.options.map((opt) => {
          const s = optionState(item, opt);
          return (
            <button key={opt} className={`tile ${s}`} style={{ height: 70 }} onClick={() => pick(opt)} aria-pressed={picks[item.id] === opt}>
              {optionPrefix && <span className="cap">{optionPrefix.trim()}</span>}<span className="big" style={{ fontSize: 28 }}>{opt}</span>
            </button>
          );
        })}
      </div>
    );
  };

  const explain = (item: ChoiceItem) => showKey && item.explain ? <div className="fb info" style={{ fontSize: 14, padding: '8px 12px' }}>{item.explain}</div> : null;

  const bar = (
    <AttemptBar comment={act.submission?.review?.comment} latest={act.latest} attemptsLeft={act.attemptsLeft} max={act.max} locked={act.locked} paused={act.paused} demo={act.demo} busy={act.busy} error={act.error}
      ready={answered === items.length} readyHint={`Chọn đủ ${items.length} câu (${answered}/${items.length})`} actionLabel={act.latest ? 'Nộp lại' : 'Kiểm tra'} onAction={check} />
  );

  if (layout === 'pager') {
    const item = items[Math.min(page, items.length - 1)];
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div className="card" style={{ flex: 1, minHeight: 0, padding: '22px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className="lbl">{item.label}</span>
            <div style={{ flex: 1 }} />
            <button className="ibtn" disabled={page === 0} onClick={() => setPage(page - 1)} aria-label="Câu trước">‹</button>
            <span className="pager">{items.map((it, k) => {
              const r = lastLines.get(it.id);
              return <button key={it.id} className={`pd${k === page ? ' on' : r ? (r.correct ? ' ok' : ' bad') : ''}`} onClick={() => setPage(k)} aria-label={`Câu ${k + 1}`} />;
            })}</span>
            <button className="ibtn" disabled={page >= items.length - 1} onClick={() => setPage(page + 1)} aria-label="Câu sau">›</button>
          </div>
          <div key={item.id} className="enter" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 18 }}>
            {item.text}
            {renderOptions(item)}
            {explain(item)}
          </div>
        </div>
        {bar}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gridAutoRows: '1fr', gap: 14 }}>
        {items.map((item, k) => (
          <div key={item.id} className={`card enter d${k + 1}`} style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10, justifyContent: 'center' }}>
            <div className="lbl">{item.label}</div>
            {item.text && <div style={{ fontSize: 16, lineHeight: 1.5, color: '#3b3d54' }}>{item.text}</div>}
            {renderOptions(item)}
            {explain(item)}
          </div>
        ))}
      </div>
      {bar}
    </div>
  );
};
