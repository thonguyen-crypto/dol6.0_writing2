// Server rules for saving an attempt. Students may only append attempts to their own
// submission, within the step's attempt limit, while the class is not paused.

const str = (v, max) => typeof v === 'string' && v.length <= max;

function cleanLine(line) {
  if (!line || !str(line.id, 120) || !str(line.label, 600) || !str(line.value, 4000)) return null;
  const out = { id: line.id, label: line.label, value: line.value };
  if (typeof line.correct === 'boolean') out.correct = line.correct;
  if (str(line.feedback, 1200)) out.feedback = line.feedback;
  if (str(line.suggestion, 1200)) out.suggestion = line.suggestion;
  return out;
}

function cleanAttempt(a) {
  if (!a || typeof a !== 'object') return null;
  const lines = Array.isArray(a.lines) ? a.lines.map(cleanLine) : null;
  if (!lines || lines.length > 40 || lines.some((l) => !l)) return null;
  const models = Array.isArray(a.models) ? a.models.map(cleanLine) : [];
  if (models.length > 40 || models.some((l) => !l)) return null;
  if (typeof a.isCorrect !== 'boolean' || !Number.isFinite(a.maxScore) || !(a.score === null || Number.isFinite(a.score))) return null;
  const answer = a.answer && typeof a.answer === 'object' && !Array.isArray(a.answer) ? a.answer : {};
  if (JSON.stringify(answer).length > 20000) return null;
  const out = { answer, lines, isCorrect: a.isCorrect, score: a.score, maxScore: a.maxScore, scoreDisplay: str(a.scoreDisplay, 60) ? a.scoreDisplay : '', models };
  if (a.ai && typeof a.ai === 'object') {
    out.ai = {
      score: Number(a.ai.score) || 0,
      maxScore: Number(a.ai.maxScore) || 5,
      ideas: str(a.ai.ideas, 1200) ? a.ai.ideas : '',
      grammar: str(a.ai.grammar, 1200) ? a.ai.grammar : undefined,
      vocabulary: str(a.ai.vocabulary, 1200) ? a.ai.vocabulary : undefined,
      band: str(a.ai.band, 40) ? a.ai.band : undefined,
      fallback: a.ai.fallback === true || undefined,
    };
  }
  return out;
}

/**
 * Returns {submission} or {status, error}.
 * incoming: { id, stepKey, partId, attempt } (one new attempt)
 */
export function applyAttempt({ existing, incoming, lesson, student, paused, now = new Date() }) {
  const step = lesson.steps.find((s) => s.key === incoming?.stepKey);
  const tracking = step?.tracking;
  if (!tracking || !tracking.parts.some((p) => p.id === incoming.partId)) return { status: 400, error: 'Bước này không nhận bài nộp.' };
  if (paused) return { status: 423, error: 'Giáo viên đang tạm khóa nộp bài. Bài làm của bạn vẫn được giữ.' };
  const attempt = cleanAttempt(incoming.attempt);
  if (!attempt) return { status: 400, error: 'Bài nộp không hợp lệ.' };
  if (existing && (existing.studentId !== student.id || existing.stepKey !== incoming.stepKey || existing.partId !== incoming.partId)) return { status: 403, error: 'Access denied.' };
  const max = tracking.maxAttempts || 2;
  const attempts = existing ? existing.attempts : [];
  if (existing?.locked || attempts.length >= max) return { status: 409, error: 'Đã hết lượt làm phần này.' };
  if (tracking.grading === 'ai' && attempt.ai && !attempt.ai.fallback) {
    // AI steps: pass rule is decided by the lesson, not by the browser.
    attempt.isCorrect = attempt.ai.score >= (tracking.passScore || 4);
  }
  const nextAttempt = { ...attempt, no: attempts.length + 1, at: now.toISOString() };
  const all = [...attempts, nextAttempt];
  return {
    submission: {
      id: incoming.id,
      lessonId: lesson.id,
      classCode: student.classCode,
      studentId: student.id,
      studentName: student.name,
      stepKey: incoming.stepKey,
      partId: incoming.partId,
      attempts: all,
      locked: nextAttempt.isCorrect || all.length >= max,
      updatedAt: nextAttempt.at,
      ...(existing?.review ? { review: existing.review } : {}),
    },
  };
}

export function applyReview(existing, body, now = new Date()) {
  if (!existing) return null;
  const review = { at: now.toISOString() };
  if (str(body?.comment, 2000)) review.comment = body.comment.trim();
  if (str(body?.privateNote, 2000)) review.privateNote = body.privateNote.trim();
  if (['reviewed', 'needs_support'].includes(body?.status)) review.status = body.status;
  return { ...existing, review };
}
