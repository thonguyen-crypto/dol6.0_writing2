/* Browser API client. All calls use the HttpOnly session cookie set by the server. */
import type { Attempt, ControlPatch, ControlState, GradeItem, GradeResult, Student, Submission, TeacherReview } from './types';

export class ApiError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

async function call<T>(url: string, init?: RequestInit & { json?: unknown }): Promise<T> {
  const { json, ...rest } = init || {};
  let res: Response;
  try {
    res = await fetch(url, {
      ...rest,
      headers: json !== undefined ? { 'Content-Type': 'application/json' } : rest.headers,
      body: json !== undefined ? JSON.stringify(json) : rest.body,
    });
  } catch {
    throw new ApiError('Mất kết nối tới máy chủ. Bài làm vẫn được giữ trên máy; thử lại sau.', 0);
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.error || 'Có lỗi xảy ra. Thử lại sau.', res.status);
  return data as T;
}

export type SessionInfo = { role: null } | { role: 'teacher' } | { role: 'student'; student: Student; submissions: Submission[] };

export const api = {
  session: () => call<SessionInfo>('/api/auth/session'),
  loginStudent: (name: string, classCode: string) => call<{ student: Student; submissions: Submission[] }>('/api/students/login', { method: 'POST', json: { name, classCode } }),
  loginTeacher: (password: string) => call<{ ok: true }>('/api/auth/teacher', { method: 'POST', json: { password } }),
  logout: (role: 'student' | 'teacher') => call<{ ok: true }>('/api/auth/logout', { method: 'POST', json: { role } }),

  classCodes: () => call<{ classCodes: string[] }>('/api/class-codes').then((d) => d.classCodes),
  addClassCode: (code: string) => call<{ classCodes: string[] }>('/api/class-codes', { method: 'POST', json: { code } }).then((d) => d.classCodes),
  removeClassCode: (code: string) => call<{ classCodes: string[] }>(`/api/class-codes/${encodeURIComponent(code)}`, { method: 'DELETE' }).then((d) => d.classCodes),

  classroom: (code: string) => call<{ students: Student[]; submissions: Submission[]; control: ControlState }>(`/api/classroom/${encodeURIComponent(code)}`),
  control: (code: string) => call<ControlState>(`/api/classroom/${encodeURIComponent(code)}/control`),
  setControl: (code: string, patch: ControlPatch) => call<ControlState>(`/api/classroom/${encodeURIComponent(code)}/control`, { method: 'PUT', json: patch }),
  position: (studentId: string, stepKey: string) => call<{ ok: true }>(`/api/students/${encodeURIComponent(studentId)}/position`, { method: 'PUT', json: { stepKey } }),

  submit: (id: string, stepKey: string, partId: string, attempt: Omit<Attempt, 'no' | 'at'>) =>
    call<Submission>(`/api/submissions/${encodeURIComponent(id)}`, { method: 'PUT', json: { stepKey, partId, attempt } }),
  review: (id: string, review: Omit<TeacherReview, 'at'>) => call<Submission>(`/api/submissions/${encodeURIComponent(id)}/review`, { method: 'PUT', json: review }),

  grade: (rubricId: string, items: GradeItem[]) => call<GradeResult>('/api/grade', { method: 'POST', json: { rubricId, items } }),
};

/** Server-sent events for one class. Returns an unsubscribe function. */
export function subscribeClass(code: string, on: (type: 'classroom' | 'control') => void): () => void {
  if (typeof EventSource === 'undefined') return () => undefined;
  const stream = new EventSource(`/api/classroom/${encodeURIComponent(code)}/events`);
  stream.addEventListener('classroom', () => on('classroom'));
  stream.addEventListener('control', () => on('control'));
  stream.addEventListener('open', () => { on('control'); on('classroom'); });
  return () => stream.close();
}
