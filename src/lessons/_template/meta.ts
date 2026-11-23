/* __TITLE__ · lesson meta (server-safe: no React here).
   1 step = 1 slide. kind: cover | divider | theory | activity.
   Add `tracking` to every activity that students submit (see docs/LESSON-SCHEMA.md). */
import type { LessonMeta } from '../../kit/types';

const meta: LessonMeta = {
  id: '__ID__',
  title: '__TITLE__',
  subtitle: 'Mô tả ngắn: các chặng của bài',
  course: 'IELTS Writing · Lesson X',
  outcomes: ['Mục tiêu 1 của bài.', 'Mục tiêu 2 của bài.'],
  stages: [
    { n: 1, name: 'Tên chặng 1', short: 'Chặng 1', sub: 'Một câu nói chặng này học gì.', topics: ['Lý thuyết mẫu', 'Bài chọn đáp án', 'Bài viết AI chấm'] },
  ],
  steps: [
    { key: 'cover', kind: 'cover', stage: 0, name: 'Mở đầu' },
    { key: 'd1', kind: 'divider', stage: 1, name: 'Chặng 1 · Tên chặng 1' },
    { key: 'idea', kind: 'theory', stage: 1, name: 'Lý thuyết mẫu', builds: 3,
      head: { chip: 'Tên chặng 1', vi: 'Dòng gợi ý tiếng Việt', pre: 'Theory', key: 'example' },
      notes: [{ title: 'Cách triển khai', text: 'Mỗi lần bấm › mở thêm một lớp. Hỏi lớp trước khi mở.' }] },
    { key: 'quiz', kind: 'activity', stage: 1, name: 'Bài chọn đáp án', short: 'Chọn đáp án',
      head: { chip: 'Tên chặng 1', vi: 'Chọn đáp án đúng cho từng câu', pre: 'Quick', key: 'check' },
      tracking: { parts: [{ id: 'all', label: '2 câu' }], grading: 'auto' },
      notes: [{ title: 'Đáp án cần chốt', text: '1 A · 2 make an effort.' }] },
    { key: 'write', kind: 'activity', stage: 1, name: 'Bài viết AI chấm', short: 'Viết · AI',
      head: { chip: 'Tên chặng 1', vi: 'Viết lại cụm, AI chấm', pre: 'Word form ·', key: 'practice' },
      tracking: { parts: [{ id: 'all', label: '2 cụm' }], grading: 'ai', passScore: 4 } },
  ],
};

export default meta;
