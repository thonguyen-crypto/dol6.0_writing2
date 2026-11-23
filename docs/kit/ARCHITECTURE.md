# Kiến trúc · DOL React Lesson Kit 1.0

Một app = một bài học. Phần dùng chung (core) không đổi giữa các bài. Mỗi bài chỉ thêm một thư mục trong `src/lessons/<id>/`.

```
app/
├─ server.ts                     Express: auth, lớp, nộp bài, live control, SSE, chấm AI, phục vụ web
├─ server/core/
│  ├─ security.mjs               cookie HttpOnly ký HMAC, 2 vai, rate limit, chặn origin lạ
│  ├─ classCodeStore.mjs         danh sách mã lớp (JSON)
│  ├─ classroomStore.mjs         học sinh, bài nộp, control từng lớp (JSON, ghi tuần tự + atomic)
│  ├─ classroomEvents.mjs        pub/sub theo lớp cho SSE
│  ├─ submissions.mjs            luật nộp bài (lượt, khóa, tạm khóa, luật đạt AI)
│  ├─ grading.mjs                prompt + kiểm tra kết quả AI dùng chung, chấm giả lập AI_FAKE
│  └─ openaiGrading.mjs          gọi OpenAI Responses (store:false, timeout, ≤4 request song song)
├─ src/
│  ├─ App.tsx                    Provider + Login / LessonPlayer
│  ├─ kit/                       CORE phía trình duyệt
│  │  ├─ types.ts                kiểu dữ liệu dùng chung (server cũng import)
│  │  ├─ api.ts                  gọi API + SSE
│  │  ├─ ClassroomProvider.tsx   phiên, lớp, bài nộp, control, demo/xem như HS
│  │  ├─ shell/                  LessonPlayer (khung 1440×900, slide 16:9, GV/HS), Login
│  │  ├─ teacher/                TeacherPanel, ProgressBoard, PageTracker (gương thần + chiếu), SubmissionDrawer
│  │  ├─ tracking/tracking.ts    luật 5 trạng thái, mã trang, dòng theo dõi (thuần, có test)
│  │  ├─ activities/             useActivity, ChoiceQuiz, ChoicePerPart, PhraseLab, AttemptBar
│  │  ├─ slides/                 Build, SlideBody, Card, Label, Cover, Divider, OrbitScene, WordSwap
│  │  ├─ checkLesson.ts          kiểm tra bài (pnpm check:lesson, test)
│  │  └─ styles/slide-ui.css     toàn bộ UI DNA (lấy từ mock-up đã duyệt)
│  └─ lessons/
│     ├─ active-meta.ts          ← bài đang chạy (3 file active-* trỏ cùng một bài)
│     ├─ active-slides.ts
│     ├─ active-server.ts
│     ├─ lesson-01-paraphrasing/ meta.ts · content.json · slides.tsx · rubrics.ts
│     └─ _template/              khung bài trống
├─ scripts/new-lesson.mjs · scripts/check-lesson.ts
└─ tests/*.test.ts               node --test qua tsx
```

`meta.ts` và `rubrics.ts` không được import React vì server cũng đọc chúng. `slides.tsx` chỉ chạy trên trình duyệt.

## Dòng dữ liệu

```
GV bấm bước/build ──PUT /control──▶ server lưu control ──SSE "control"──▶ HS GET /control ─▶ Theo giáo viên: chuyển bước/build
HS nộp bài ──PUT /submissions/:id──▶ applyAttempt() kiểm tra luật ──lưu──▶ SSE "classroom" (chỉ GV) ─▶ GV GET /classroom ─▶ tracking
HS bài AI ──POST /grade──▶ rubric của bài + prompt chung ──OpenAI──▶ kết quả ─▶ HS nộp attempt kèm ai.score (server tự tính Đạt)
```

GV poll mỗi 5 giây và HS poll control mỗi 4 giây, phòng khi SSE bị proxy cắt. HS tải lại bài của mình mỗi 20 giây để thấy nhận xét mới của GV.

## API

| Method | Route | Ai gọi | Ghi chú |
|---|---|---|---|
| GET | `/api/health`, `/api/lesson` | công khai | |
| GET | `/api/auth/session` | công khai | `{role:null}` / `{role:'teacher'}` / `{role:'student', student, submissions}` |
| POST | `/api/auth/teacher` | công khai | mật khẩu `TEACHER_PASSWORD` (≥12 ký tự), rate limit |
| POST | `/api/students/login` | công khai | họ tên + mã lớp; id học sinh = lớp + tên (không phân biệt dấu) |
| POST | `/api/auth/logout` | | |
| GET/POST | `/api/class-codes` | GV | danh sách / tạo |
| DELETE | `/api/class-codes/:code` | GV | xóa mã lớp + control của lớp (bài nộp giữ lại) |
| POST | `/api/class-codes/validate` | công khai | |
| GET | `/api/classroom/:code` | GV | students + submissions + control |
| GET | `/api/classroom/:code/control` | GV, HS của lớp | |
| PUT | `/api/classroom/:code/control` | GV | `{teacherStep?, build?, paused?, reveal?:{stepKey,on}, invite?:stepKey}` |
| GET | `/api/classroom/:code/events` | GV, HS của lớp | SSE: `control` (mọi người), `classroom` (chỉ GV) |
| PUT | `/api/students/:id/position` | HS đó | bước đang mở (GV thấy “Đang ở …”) |
| PUT | `/api/submissions/:id` | HS đó | `{stepKey, partId, attempt}`: thêm **một** lượt |
| PUT | `/api/submissions/:id/review` | GV | `{comment, privateNote, status}` |
| POST | `/api/grade` | đã đăng nhập | `{rubricId, items:[{id,prompt,answer,models}]}`, giới hạn AI theo người và toàn server |

## Luật nộp bài (server/core/submissions.mjs)

- Chỉ nhận bước có `tracking` và `partId` nằm trong `tracking.parts`.
- Lớp đang tạm khóa: trả 423, không lưu (bản nháp vẫn ở máy HS).
- Mỗi lần gọi thêm đúng **một** attempt. Đủ `maxAttempts` (mặc định 2) hoặc làm đúng thì khóa phần đó.
- Bài AI: `isCorrect = ai.score ≥ passScore` do **server** tính, không tin trình duyệt. `ai.fallback` (AI không chấm được) → “Cần GV xem”.
- Làm sạch attempt: chỉ giữ field đã biết, giới hạn độ dài.

## Bảo mật

Giữ nguyên từ app gốc:
- cookie HttpOnly, SameSite=Strict, Secure ở production;
- khóa ký lưu trong `DATA_DIR/.session-secret`;
- kiểm tra Origin với mọi request ghi;
- chỉ nhận JSON;
- rate limit đăng nhập và AI;
- không trả lỗi gốc của OpenAI ra trình duyệt;
- production không phục vụ file `.ts`, `.mjs`, `.map`, `server.*`.

Lưu ý: tên lớp + họ tên không phải xác thực danh tính. Giữ mã lớp riêng tư.

## Chuyển đáp án trắc nghiệm sang server (khi cần chống gian lận)

1. Thêm `answerKey` vào `meta.ts` của bài (server đọc được), ví dụ `{ lrdesc: { A: '6', B: '8' } }`.
2. Trong `applyAttempt`, chấm lại `attempt.answer` theo `answerKey` rồi ghi đè `lines[].correct`, `isCorrect` và `score`.
3. Ở `slides.tsx`, bỏ `answer` khỏi dữ liệu gửi xuống trình duyệt. Đáp án mẫu lúc đó lấy từ attempt mà server trả về.
