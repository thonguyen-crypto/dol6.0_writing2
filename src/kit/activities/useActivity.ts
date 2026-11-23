/* The one hook every activity uses to read and save attempts.
   - Student: saved on the server (attempt limit, pause and lock are enforced there too).
   - Teacher demo / "Xem như học sinh": kept in memory only. */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useClassroom } from '../ClassroomProvider';
import type { Attempt, AttemptLine, GradeItem, GradeResult } from '../types';

export interface AttemptInput {
  answer: Record<string, unknown>;
  lines: AttemptLine[];
  isCorrect: boolean;
  score: number | null;
  maxScore: number;
  scoreDisplay?: string;
  ai?: Attempt['ai'];
  models?: AttemptLine[];
}

export function useActivity(stepKey: string, partId = 'all') {
  const room = useClassroom();
  const step = room.lesson.steps.find((s) => s.key === stepKey);
  const sub = room.mySubmission(stepKey, partId);
  const attempts = sub?.attempts || [];
  const latest = attempts[attempts.length - 1];
  const max = step?.tracking?.maxAttempts || 2;
  const locked = Boolean(sub?.locked) || attempts.length >= max;
  const paused = room.control.paused && !room.demo;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = useCallback(async (input: AttemptInput) => {
    setBusy(true);
    setError('');
    const res = await room.submitAttempt(stepKey, partId, {
      ...input,
      scoreDisplay: input.scoreDisplay || (input.score == null ? 'Chờ GV chấm' : `${input.score}/${input.maxScore}${step?.tracking?.grading === 'ai' ? '' : ' đúng'}`),
    });
    setBusy(false);
    if (!res.ok) { setError(res.error); return null; }
    return res.submission.attempts[res.submission.attempts.length - 1];
  }, [room, stepKey, partId, step]);

  const grade = useCallback(async (rubricId: string, items: GradeItem[]): Promise<GradeResult | null> => {
    setBusy(true);
    setError('');
    try {
      return await room.grade(rubricId, items);
    } catch (e) {
      setError((e as Error).message);
      return null;
    } finally {
      setBusy(false);
    }
  }, [room]);

  return {
    step,
    submission: sub,
    attempts,
    latest,
    max,
    attemptsLeft: Math.max(0, max - attempts.length),
    locked,
    paused,
    demo: room.demo,
    busy,
    error,
    setError,
    submit,
    grade,
  };
}

/** Draft kept in this browser (survives reload). */
export function useDraft<T>(key: string, initial: T): [T, (next: T | ((prev: T) => T)) => void, () => void] {
  const room = useClassroom();
  const storageKey = `dol-draft:${room.lesson.id}:${room.demo ? 'demo' : room.student?.id || 'anon'}:${key}`;
  const read = (): T => {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch { return initial; }
  };
  const [value, setValue] = useState<T>(read);
  const keyRef = useRef(storageKey);
  useEffect(() => {
    if (keyRef.current !== storageKey) { keyRef.current = storageKey; setValue(read()); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);
  const set = useCallback((next: T | ((prev: T) => T)) => {
    setValue((prev) => {
      const v = typeof next === 'function' ? (next as (p: T) => T)(prev) : next;
      try { localStorage.setItem(storageKey, JSON.stringify(v)); } catch { /* storage may be blocked */ }
      return v;
    });
  }, [storageKey]);
  const clear = useCallback(() => {
    try { localStorage.removeItem(storageKey); } catch { /* ignore */ }
    setValue(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);
  return [value, set, clear];
}
