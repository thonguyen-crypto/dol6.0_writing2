/* App entry: the active lesson (src/lessons/active-*.ts) inside the shared kit shell. */
import React, { useEffect } from 'react';
import { ClassroomProvider, useClassroom } from './kit/ClassroomProvider';
import { LessonPlayer } from './kit/shell/LessonPlayer';
import { Login } from './kit/shell/Login';
import lesson from './lessons/active-meta';
import slides from './lessons/active-slides';

const Screen: React.FC = () => {
  const { phase, view, role } = useClassroom();
  useEffect(() => {
    document.title = `${phase !== 'ready' ? 'Đăng nhập' : role === 'teacher' ? (view === 'teacher' ? 'Giáo viên' : 'Xem như học sinh') : 'Học sinh'} · ${lesson.title} | DOL`;
  }, [phase, view, role]);
  if (phase === 'loading') return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b6d82', fontFamily: 'Plus Jakarta Sans, system-ui' }}>Đang tải bài học…</div>;
  if (phase === 'login') return <Login />;
  return <LessonPlayer slides={slides} />;
};

export default function App() {
  return (
    <ClassroomProvider lesson={lesson}>
      <Screen />
    </ClassroomProvider>
  );
}
