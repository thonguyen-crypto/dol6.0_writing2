/* Login: same look as the DOL lesson apps on main (DOL App Kit v1.1 · dol-* components).
   Students join with name + class code; teachers use the server password. */
import React, { useState } from 'react';

/** Class code from the QR the teacher projects (…/?code=DOL-2026). */
const codeFromLink = () => {
  try {
    const raw = new URLSearchParams(window.location.search).get('code') || '';
    return raw.toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 32);
  } catch { return ''; }
};
import { useClassroom } from '../ClassroomProvider';

export const Login: React.FC = () => {
  const { lesson, loginStudent, loginTeacher } = useClassroom();
  const [tab, setTab] = useState<'student' | 'teacher'>('student');
  const [name, setName] = useState('');
  const [linkCode] = useState(codeFromLink);
  const [code, setCode] = useState(linkCode);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // "Discuss Both Views" → Discuss + highlighted "Both Views" (as on main).
  const [first, ...rest] = lesson.title.split(' ');

  const pick = (t: 'student' | 'teacher') => { setTab(t); setError(''); };
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tab === 'student' && !name.trim()) return setError('Vui lòng nhập họ và tên của bạn.');
    if (tab === 'student' && !code.trim()) return setError('Vui lòng nhập mã lớp học.');
    setBusy(true);
    setError('');
    const err = tab === 'student' ? await loginStudent(name, code) : await loginTeacher(password);
    setBusy(false);
    if (err) setError(err);
  };

  return (
    <div className="dol-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="dol-stickers" aria-hidden="true" />
      <div className="dol-app" style={{ width: '100%', maxWidth: 460, margin: 0 }}>
        <main className="dol-main" style={{ padding: '36px 36px 32px', gap: 18 }}>
          <img className="dol-logo" src="/brand/dol-logo.svg" alt="DOL IELTS Đình Lực" width={125} height={38} />
          <div>
            <span className="dol-pill">{lesson.course}</span>
            <h1 className="dol-title is-sm" style={{ margin: '10px 0 4px' }}>
              {rest.length ? <>{first} <span className="hl">{rest.join(' ')}</span></> : <span className="hl">{first}</span>}
            </h1>
            <p className="dol-muted" style={{ margin: 0 }}>
              {tab === 'student' ? 'Nhập tên và mã lớp thầy cô đã gửi để vào bài.' : 'Đăng nhập để theo dõi lớp và mời học sinh vào bài.'}
            </p>
          </div>

          <div className="dol-seg-ctl" role="group" aria-label="Vai trò" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
            <button type="button" aria-pressed={tab === 'student'} onClick={() => pick('student')}>Học sinh</button>
            <button type="button" aria-pressed={tab === 'teacher'} onClick={() => pick('teacher')}>Giáo viên</button>
          </div>

          {error && (
            <div className="dol-feedback is-bad" role="alert">
              <span className="dol-feedback-icon">!</span>
              <span className="dol-feedback-text">{error}</span>
            </div>
          )}

          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {tab === 'student' ? (
              <>
                <label className="dol-field">
                  <span className="dol-label">Họ và tên</span>
                  <input className="dol-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ví dụ: Nguyễn Văn A" autoComplete="name" required maxLength={60} autoFocus={Boolean(linkCode)} />
                </label>
                <label className="dol-field">
                  <span className="dol-label">Mã lớp (do thầy cô cấp){linkCode && code === linkCode ? ' · đã điền từ mã QR' : ''}</span>
                  <input className="dol-input" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="Nhập mã lớp giáo viên đưa" required maxLength={32} style={{ textTransform: 'uppercase' }} />
                </label>
                <button type="submit" className="dol-btn is-primary is-block" disabled={busy}>{busy ? 'Đang vào lớp…' : 'Vào bài học →'}</button>
                <p className="dol-caption" style={{ margin: 0, textAlign: 'center' }}>Cùng tên + mã lớp sẽ mở lại đúng tiến độ của em.</p>
              </>
            ) : (
              <>
                <label className="dol-field">
                  <span className="dol-label">Mật khẩu giáo viên</span>
                  <input className="dol-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Nhập mật khẩu giáo viên..." autoComplete="current-password" required />
                </label>
                <button type="submit" className="dol-btn is-primary is-block" disabled={busy}>{busy ? 'Đang đăng nhập…' : 'Đăng nhập Chế độ Giáo viên →'}</button>
              </>
            )}
          </form>
        </main>
      </div>
    </div>
  );
};
