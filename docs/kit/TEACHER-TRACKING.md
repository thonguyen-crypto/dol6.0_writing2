# Theo dõi lớp · trạng thái, gương thần, hồ sơ bài làm

Luật giống `src/dol-kit/teacher-tracking/TeacherTracking.tsx` (v1.2) trên branch main của dol_7.5_lesson1. Code nằm ở `src/kit/tracking/tracking.ts` và có test.

## 5 trạng thái (+ “·”)

| Tag | Khi nào |
|---|---|
| ✓ **Đạt** | lần làm mới nhất đúng (bài AI: điểm ≥ passScore, mặc định 4/5) |
| ! **Chưa đạt** | lần làm mới nhất chưa đúng |
| ? **Cần GV xem** | AI không chấm được, học sinh gửi để GV chấm (`ai.fallback`) |
| … **Làm dở** | trang có nhiều phần, đã nộp một số phần, không phần nào Chưa đạt/Cần GV xem |
| – **Chưa làm** | chưa nộp gì |
| · | trang không có bài nộp (lý thuyết, tương tác không lưu) |

Gộp nhiều phần của một trang theo thứ tự: tất cả Đạt → Đạt, có Cần GV xem → Cần GV xem, có Chưa đạt → Chưa đạt, còn lại → Làm dở.

Cột **Ghi chú**:
- Chưa đạt: “Còn 1 lượt làm lại” hoặc “Hết lượt”;
- Cần GV xem: “AI chưa chấm được”;
- Làm dở: “Chưa xong mọi phần”;
- Đạt: “Lượt n”.

Cột **Điểm**: điểm của lần mới nhất, hoặc “n phần” với trang nhiều phần.

## Các màn của giáo viên

- **Tiến độ lớp** (nút trên thanh đầu): bảng học sinh × các activity.
  - Cột “Xong x/y” đếm số trang Đạt trên số trang có tracking.
  - Bấm **mã trang** để mở Theo dõi trang. Bấm **tên** để mở Hồ sơ bài làm.
- **Tiến độ stage** (cột phải): như trên nhưng chỉ cho chặng đang chiếu, gồm cả slide lý thuyết (“·”). Có thanh tiến độ từng em và các chip Xong chặng / Đang làm / Chưa vào chặng.
- **Theo dõi trang**:
  - dòng mô tả cách chấm (“AI chấm /5 · đạt khi từ 4 điểm” hoặc “Chấm tự động theo đáp án”);
  - thanh tỉ lệ trạng thái và chip lọc có số đếm;
  - bảng Học viên / Trạng thái / Điểm / Ghi chú, bấm một dòng để mở hồ sơ.
- **Hỏi gương thần** (bên phải Theo dõi trang):
  1. *Ai chưa làm phần này?* Có danh sách, nút “Mời cả lớp vào trang này”, “Sao chép danh sách” và số em đang làm dở.
  2. *Cho tôi một bài làm tốt*: lấy từ điểm cao xuống.
  3. *Cho tôi một bài làm chưa tốt*: lấy ngẫu nhiên.
  4. *Hiện ngẫu nhiên 1 bài*.
  - Mỗi câu trả lời có “Ẩn tên khi chiếu lên lớp” (Học viên A, B…), “Đổi bài khác” và **Chiếu lên lớp**: màn trắng toàn khung, chữ lớn, Esc để đóng, → để đổi bài.
- **Hồ sơ bài làm** (ngăn kéo phải):
  - đang ở bước nào, số trang Đạt và %;
  - xem theo Cả bài / Chặng / Trang;
  - mỗi trang có lượt mới nhất (giờ, Đạt/Chưa đạt, điểm, từng câu ✓/!, nhận xét AI Ideas / Grammar / Vocabulary), lượt trước thu gọn, phần chưa làm và đáp án mẫu;
  - **Nhận xét của giáo viên**: nhận xét gửi học sinh, ghi chú riêng, “Lưu · đã xem” hoặc “Cần hỗ trợ”.
- **Cột phải**:
  - thẻ bước (x/N đã nộp và các tag);
  - Đếm trả lời (bước có poll, chọn từng phần);
  - Cần chú ý: Cần GV xem trước, rồi Chưa đạt, rồi Làm dở, nút “Xem bài”;
  - ô chọn Hồ sơ bài làm.

## Điều khiển lớp (live control)

| Công cụ | Học sinh thấy |
|---|---|
| Chuyển bước / build | bật “Theo giáo viên” (mặc định) thì tự chuyển. Thanh trên luôn có “GV đang ở: …” |
| Mời lớp tới đây | popup “Giáo viên mời bạn đến”. Popup cũ tự hết khi GV đã sang bước khác |
| Tạm khóa | màn “Cả lớp cùng nghe giảng”. Server từ chối nộp bài (423), nháp vẫn giữ |
| Mở đáp án | activity hiện đáp án và giải thích, Đếm trả lời tô xanh đáp án đúng |
| Gọi tên ngẫu nhiên | chỉ trên máy GV |
| Present | chỉ trên máy GV: toàn màn hình, Spotlight, Bút vẽ (nét vẽ theo từng bước) |

“Xem như học sinh” và mọi thao tác GV làm trên activity đều là **xem thử**: không lưu, không ảnh hưởng số liệu lớp.
