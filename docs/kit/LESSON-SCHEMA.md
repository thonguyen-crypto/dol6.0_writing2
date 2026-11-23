# Viết một bài học · schema + thành phần

Một bài nằm trong `src/lessons/<id>/` và gồm 4 file:

| File | Chạy ở | Nội dung |
|---|---|---|
| `meta.ts` | server + trình duyệt | các chặng, các bước theo thứ tự, tiêu đề slide, notes GV, tracking |
| `content.json` | cả hai | chữ, câu, đoạn văn, đáp án |
| `slides.tsx` | trình duyệt | mỗi bước theory/activity một component |
| `rubrics.ts` | server | tiêu chí cho AI chấm |

Chạy bài nào thì 3 file `src/lessons/active-*.ts` trỏ tới bài đó. `pnpm new-lesson <id> --activate` làm việc này.

## meta.ts

```ts
const meta: LessonMeta = {
  id: 'writing-2-cohesion',            // a-z 0-9 -, dùng cho cookie và dữ liệu
  title: 'Cohesion & Coherence',
  subtitle: '…', course: 'IELTS Writing 7.5+ · Lesson 2',
  outcomes: ['…'],                     // hiện trên bìa
  stages: [{ n: 1, name: 'Lexical Resource', short: 'LR', sub: '…', topics: ['…'] }],
  steps: [
    { key: 'cover', kind: 'cover', stage: 0, name: 'Mở đầu' },
    { key: 'd1', kind: 'divider', stage: 1, name: 'Chặng 1 · …' },
    { key: 'idea', kind: 'theory', stage: 1, name: '…', builds: 3,
      head: { chip: 'Lexical Resource', vi: 'gợi ý tiếng Việt', pre: 'Tiêu đề', key: 'từ tô đỏ' },
      notes: [{ title: 'Cách triển khai', text: '…' }] },
    { key: 'band', kind: 'activity', stage: 1, name: 'Band Detective', short: 'Band Detective',
      head: { … },
      tracking: { parts: [{ id: 'A', label: 'Đoạn A' }, { id: 'B', label: 'Đoạn B' }], grading: 'auto' },
      poll: { field: 'band', options: ['5','6','7','8'], correct: { A: '6', B: '5' } } },
    { key: 'synp', kind: 'activity', stage: 1, name: '…',
      tracking: { parts: [{ id: 'all', label: '4 cụm' }], grading: 'ai', passScore: 4, maxAttempts: 2 } },
  ],
};
```

- **kind**:
  - `cover`: bìa tự dựng từ meta.
  - `divider`: slide mở chặng, tự dựng.
  - `theory`: slide có `builds`, mỗi lần bấm › mở một lớp.
  - `activity`: học sinh làm bài.
- **head**: dòng chip chặng + dòng gợi ý tiếng Việt (ẩn được) + tiêu đề `pre` + từ khóa `key` tô đỏ có gạch dạ quang.
- **tracking**: chỉ khai báo cho bước có nộp bài.
  - Mỗi `part` là một bài nộp riêng. Nhiều part thì GV thấy “Làm dở” cho tới khi đủ.
  - Không có tracking thì GV thấy “·”.
- **grading**:
  - `auto`: trình duyệt so đáp án.
  - `ai`: gọi `/api/grade` với một rubric. Đạt khi điểm ≥ `passScore` (mặc định 4/5).
- **poll**: bảng “Đếm trả lời” ở cột GV. Đếm `attempt.answer[field]` của lần làm mới nhất. Đáp án đúng chỉ tô xanh sau khi GV “Mở đáp án”.
- **notes**: popup Notes (phím N). Mục gợi ý: Mục tiêu · Cách triển khai · Đáp án cần chốt · Lưu ý khi dạy · Chuyển tiếp.

Mã trang (1.1, 1.2…) tự đánh theo chặng và thứ tự các bước theory/activity.

## slides.tsx

```tsx
const slides: SlideRegistry = { idea: Idea, band: BandDetective, synp: SynonymPractice };
export default slides;
```

Mỗi component nhận `SlideProps`:

| Prop | Ý nghĩa |
|---|---|
| `step`, `lesson` | meta của bước và của bài |
| `build` | build hiện tại (0…builds-1) của slide lý thuyết. Học sinh bật Theo giáo viên sẽ nhận cùng build |
| `revealed` | GV đã bấm “Mở đáp án” cho bước này |
| `view` | `'teacher'` hoặc `'student'` |

Shell tự vẽ khung slide (1280 × 720) và phần đầu slide. Component chỉ vẽ phần thân, khoảng 1212 × 560.

### Slide primitives (`src/kit/slides`)

| Thành phần | Dùng để |
|---|---|
| `<SlideBody>` | thân slide; tự căn nội dung giữa theo chiều dọc, không để khoảng trống lạ |
| `<Build at={n} build={build} keep?>` | hiện từ build n. `keep` giữ chỗ trước khi hiện để bố cục không nhảy |
| `<Card>`, `<Label green?>` | thẻ trắng bo 22px, nhãn chữ hoa đỏ/xanh |
| `<OrbitScene labels=[…]>` | cảnh hành tinh, các thẻ xoay quanh (≤4 nhãn) |
| `<WordSwap from to build>` | đổi từng từ theo build (minh họa thay 1-1) |
| class CSS | `enter d1…d7` (xuất hiện lần lượt), `hl` (gạch dạ quang), `fb ok/try/info`, `tile`, `opt`, `verdict`, `pager`/`pd`, `ex`, `wdot`, `titem`, `panel`… xem `docs/UI-DNA.md` |

### Activities có sẵn (`src/kit/activities`)

Dùng các component này thì tracking, bảng tiến độ, gương thần, chiếu lên lớp và hồ sơ bài làm chạy luôn, không phải viết thêm.

| Component | Hợp với | Ghi chú |
|---|---|---|
| `ChoiceQuiz` | nhiều câu, mỗi câu 1 đáp án, nộp một lần | `layout="grid"` (2 cột) hoặc `"pager"` (một câu mỗi màn). `optionStyle="tiles"`, `"list"` hoặc `"verdict"` (Yes/No) |
| `ChoicePerPart` | nhiều phần, mỗi phần nộp riêng | ví dụ Band Detective. `parts[].id` phải trùng `tracking.parts` |
| `PhraseLab` | viết cụm/câu, AI chấm | `rubricId` phải có trong `rubrics.ts`. AI lỗi thì học sinh bấm “Gửi để giáo viên chấm” và bài thành “Cần GV xem” |

Cần kiểu bài khác thì viết component riêng với hook `useActivity`:

```tsx
const act = useActivity(step.key, 'all');          // { latest, attemptsLeft, locked, paused, demo, busy, error, submit, grade }
const [draft, setDraft] = useDraft('my-key', {});  // nháp lưu trên máy học sinh
await act.submit({
  answer: draft,                                   // dữ liệu thô (poll đọc từ đây)
  lines: [{ id: 'q1', label: 'Câu 1', value: 'Band 6', correct: true }],  // GV đọc phần này
  isCorrect: true, score: 1, maxScore: 1,
  models: [{ id: 'q1', label: 'Câu 1', value: 'Band 6', correct: true }], // “Đáp án mẫu” trong hồ sơ
});
```

`lines` là thứ giáo viên thấy ở gương thần, màn chiếu và hồ sơ bài làm. Hãy ghi `label` là câu hỏi và `value` là câu trả lời đọc được, không phải id.

Vẽ thanh nộp bài bằng `<AttemptBar …/>` để giống mọi activity khác: nút chính, lượt, phản hồi, nhận xét GV, tag “Xem thử · không lưu”.

## rubrics.ts

```ts
const rubrics: Record<string, Rubric> = {
  'synonym-phrase': {
    id: 'synonym-phrase',
    task: 'Paraphrase a short phrase with controlled synonyms…',
    rules: ['Keep the core noun…', 'An unchanged phrase … is incorrect.'],
    maxItems: 6,
  },
};
```

Prompt chung đã có sẵn các luật: đáp án mẫu không phải đáp án duy nhất, trả lời trống hoặc chép lại đề là sai, phản hồi tiếng Việt, coi bài học sinh là dữ liệu. Kết quả AI được kiểm tra chặt: đủ item, đúng kiểu, điểm 1–5.

## Kiểm tra

`pnpm check:lesson` báo lỗi khi:
- key trùng hoặc stage không tồn tại;
- bước theory/activity chưa có slide;
- part trùng id;
- poll trỏ sai part;
- bước AI mà rubric trống.

Nó cũng cảnh báo khi thiếu `head` hoặc `notes`, hoặc activity không có tracking.
