# Writing 6.0 – Lesson 2 · Improve and connect sentences (interactive slides)

Bài 2 khoá IELTS Writing 6.0 dựng thành web app slide tương tác, dùng lại hạ tầng của Lesson 1 (`dol6.0_writing1`, branch `feature/interactive-slides-kit`): kit, server, cách chấm, giao diện.
Nguồn nội dung: `[2023]Writing6.0_Session02.pptx` (66 slide). Đã dùng chữ trên slide, speaker notes và ảnh từng slide. Lesson Map đã duyệt nằm trong project “6.0W Web App” (`claude/lesson-02-map.md`).

## Tiến độ

| Chặng | Trạng thái |
|---|---|
| 1 · Revision | xong |
| 2 · Improve a sentence | xong |
| 3 · Linking words | xong |
| 4 · Without linking words | xong |
| 5 · Conclusion | xong |

Có 32 bước: 1 bìa, 4 slide mở chặng và 27 trang. `BUILT_TO` trong `meta.ts` (hiện = 5, cả bài) dùng lúc dựng từng chặng; test dùng cả bài (`fullLesson`).

## Các bước theo chặng

| Chặng | Trang |
|---|---|
| 0 | Bìa: mục tiêu bài + dòng chặng 1–4 (gộp slide agenda), hình động: câu thường → thêm hedge + chi tiết → câu sau móc vào bằng This |
| 1 · Revision | **1.1 Revision** (Parts: 4 tiêu chí, LR + GRA ✓ · DOL's 4 steps, dùng lại bộ hình của Lesson 1) · **1.2 Đúng, nhưng chưa hay** (hình thực tập sinh → 3 từ khoá, GV hỏi miệng → câu mẫu → dấu “Đúng, nhưng chưa hay!” → cây 4 tiêu chí, TR + CC còn “?”) |
| 2 · Improve a sentence | 2.1 Improve by meaning · **2.2 One sentence, 2 ways** (câu internships: convincing → specific, toàn cảnh) · 2.3 Make it more convincing (4 công cụ hedging, ví dụ smartphones) · 2.3a Practice 1 (chip, chấm tự động) · 2.4 Make it more specific (4 kỹ thuật trên câu fast food) · 2.4a Practice 2 (AI, 4 câu một màn) · 2.5 Extra practice: improve a paragraph (chấm tự động từng câu, build cuối hiện cả đoạn) |
| 3 · Linking words | 3.1 Coherence & Cohesion · 3.2 Find the linking words (chạm, chấm tự động) · 3.3 3 chức năng · 3.3a Small practice (chip) |
| 4 · Without linking words | 4.1 Mindset A → B, B → C · 4.2 This + verb pattern · 4.3 Effects (6 nhóm +/−) · 4.3a/b gõ pattern (chấm tự động) · 4.3c viết This + V (AI) · 4.4 Structures · 4.4a Common mistake: thereby V-ing · 4.4b viết theo cấu trúc (AI) · 4.5, 4.6 viết đoạn từ outline (AI, 1 ô cả đoạn) |
| 5 · Conclusion | 5.1 4 tiêu chí (LR, GRA ✓ buổi trước; TR, CC hôm nay) · 5.2 Summary (Parts: improve a sentence · connect sentences) · 5.3 Homework (LMS: Build a sentence + Connect sentences, checklist 3 bước) |

**Slide mở chặng (d1–d4):** chỉ có số chặng (vòng đỏ), tên chặng và hình động (`screens/StageArt.tsx`, `stageArt.css`), theo mẫu 7.5W Lesson 1 @ 88fc379. `DividerSlide` trong kit lấy y nguyên bản mới (prop `art`, không hiện `sub` / `topics`). Ẩn dụ: 1 Revision = móng đã xong, tầng trên còn trống · 2 Improve = kính lúp làm hình rõ nét · 3 Linking words = mắt xích · 4 Without linking words = domino. Chặng Conclusion không có slide mở chặng.

**Hình mô phỏng kiến thức (`screens/Viz.tsx`, `viz.css`, lặp 4–6 giây, dừng khi bật giảm chuyển động):** 2.3 mỗi công cụ hedging một hình (10 người → 7 người · đồng hồ chắc chắn lùi kim · lịch 7 ngày bớt tick · bia: 3 mũi tên trượt) · 3.3 outline thành 3 khối, linking word là khớp nối trượt vào khe, tia sáng chạy qua · 4.1 tia sáng chạy dọc chuỗi A → B → B → C, “As a result” lỏng thì rơi · 4.2 câu A co lại thành viên nang This · 4.3 icon động cho 6 nhóm Effects · 4.4 câu ví dụ có khớp nối tự đổi qua các cấu trúc của nhóm đang học · 5.2 icon động trên từng nhánh.

Notes cho GV (phím N) được viết lại từ speaker notes của bản gốc.

## Cấu trúc

```
src/kit/                                    hạ tầng dùng chung, giữ nguyên như Lesson 1
src/lessons/lesson-02-improve-connect/
  meta.ts        chặng, bước, build, tiêu đề, notes GV, tracking, RUBRIC_OF, BUILT_TO
  logic.ts       dữ liệu từng màn (câu, đáp án, chip, khung) + hàm chấm tự động (dùng chung cho slide và test)
  checks.ts      pre-check trước khi nộp + luật level 6.0
  rubrics.ts     4 rubric AI chấm (server): improve-specific · this-verb · structures · paragraph
  runtime.tsx    Frame, Parts, SubmitBar, Slot (chạm → chọn chip), useAiSet + FbRows (3 tiêu chí), CritTree (cây 4 tiêu chí)
  slides.tsx     step key → màn
  screens/       SCover + S1Revision · S2Improve · S3Linking · S4Without · S5Conclusion
  w6.css         style, scope dưới .w6, class tiền tố w6-. Cỡ chữ: --w6-t 26px, --w6-s 19px, --w6-ui 15px
  w6.phone.css   bố cục điện thoại (≤ 760px, một cột)
```

## Chạy

```bash
pnpm install
TEACHER_PASSWORD=dolteacher-2026 AI_FAKE=1 pnpm dev   # http://localhost:3000
pnpm check:lesson && pnpm lint && pnpm test && pnpm build
```

- Học sinh: tên + mã lớp `DOL-2026`. Giáo viên: tab Giáo viên + `TEACHER_PASSWORD`.
- `AI_FAKE=1` chấm giả lập khi chạy local; đặt `OPENAI_API_KEY` để chấm thật. Bản offline: `dist/offline/index.html`.

## Chấm bài

- **Chấm tự động (không AI, không hiện tiêu chí):** 2.2a hedging, 2.4 improve a paragraph, 3.2 tìm linking words, 3.3a linking words, 4.3a/b This + verb pattern. Đáp án và hàm chấm ở `logic.ts`, có test.
- **AI chấm 3 tiêu chí** (Ý nghĩa / Từ vựng / Ngữ pháp, server quyết định kết quả): 2.3a, 4.3c, 4.4b, 4.5, 4.6. hardCheck + pre-check: bỏ trống, chép đề, quá ngắn, thiếu cấu trúc / động từ bắt buộc. Test các ca thật: chép đề → 1/5, đúng cấu trúc nhưng vô nghĩa → Chưa đạt, câu tốt → Đạt, thiếu viết hoa vẫn Đạt.
- Học sinh không thấy chữ “AI”: nút “Nộp bài / Nộp lại”, ô phản hồi “Nhận xét”.

## Lệch so với slide gốc và lý do

- **Gộp slide nhân bản thành 1 màn nhiều build**; bỏ 5 slide chia chặng (3, 10, 34, 42, 62), slide agenda (2) gộp vào bìa.
- **Revision (4, 5) gộp thành 1 trang 2 phần; slide 9 (TR, CC) thành build cuối của 1.2** để cây 4 tiêu chí giữ nguyên hình dạng giữa các trang.
- **1.2: HS không gõ câu**, GV hỏi miệng (đã chốt).
- **Chặng 2 đổi flow (theo yêu cầu 24/11):** 2.2 dùng câu internships để show toàn cảnh 2 hướng (convincing rồi specific, slide 13–15); 2.3 và 2.4 dạy lý thuyết từng hướng bằng ví dụ mới do DOL soạn (smartphones, fast food), không dùng lại câu internships; practice nằm ngay sau lý thuyết của nó.
- **2.3a chọn chip** (có chip nhiễu All, will, always, definitely); chấm xong mỗi thẻ hiện tên công cụ (quantifier, modal verb, adverb of frequency, language of probability). Chỗ trống adverb nhận cả usually và often (notes slide 18).
- **2.4a:** nhãn kỹ thuật (add examples…) chỉ hiện sau khi chấm hoặc khi GV mở đáp án, để HS tự nhận ra. Chấm xong, 4 câu thành danh sách: câu nào chưa đạt mở nhận xét trước.
- **3.2 tìm linking words:** chạm vào từ nào của một công cụ cũng tính là tìm ra công cụ đó; chạm nhầm từ không nối câu thì trừ điểm. Chấm xong mỗi công cụ có nhãn chức năng (giải thích / kết quả / ví dụ).
- **3.3a nhận mọi từ nối cùng chức năng** như bảng ở 3.3 (giữ giống slide, kể cả In fact ở nhóm Expand); đáp án mẫu là đáp án slide 40.
- **4.3a/b gõ phần còn thiếu, chấm tự động** theo pattern của từng nhóm (có / không có can, may, might); sai pattern (allows them to, makes them to, provides them the opportunity) là sai.
- **4.4: câu ví dụ chạy suốt trang do DOL soạn thêm** (bản gốc chỉ có tên cấu trúc). 4.4a: phần giải thích “ai làm V-ing” do DOL soạn thêm.
- **4.3c, 4.4b:** đáp án tham khảo do DOL soạn (bản gốc không có). 4.5, 4.6: đoạn mẫu lấy từ notes, đã sửa lỗi discourage.
- **2.5 chấm tự động từng câu (đã chốt):** mỗi chỗ cần improve là 1 thẻ chọn (cách hay hơn / giữ nguyên / cách chung chung). Build 1–5 GV dẫn từng câu, build 6 hiện cả đoạn đã improve.
- Notes slide bìa của bản gốc là bản chép từ Lesson 1, không dùng.
- Sửa lỗi bản gốc: “cycling infrastructure have led” → has led; “students spent time” → spend; đoạn mẫu notes 61 “thereby discouraging engage in” → “thereby discouraging them from engaging in”.
