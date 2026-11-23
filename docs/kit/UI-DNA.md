# UI DNA · Slide UI (Paraphrasing Lab)

Lấy từ mock-up Lesson 1 đã duyệt. Toàn bộ nằm trong `src/kit/styles/slide-ui.css`. Bài mới dùng lại class, không tự đặt màu mới.

## Nền tảng

- **Font**: Plus Jakarta Sans 400–800.
- **Trang**: `#f4f4f2` có chấm 22px. **Slide**: trắng `#ffffff`, bo 28px, viền `#ebeae6`, bóng dưới.
- **Màu chữ**: tiêu đề `#3b3d54` · nội dung `#4b4d63` · phụ `#6b6d82` · mờ `#8b8da1`.
- **Đỏ DOL** `#d63a43` (đậm `#b0262e`, nhạt `#fdf1f1`, viền `#f3c9cb`) cho nút chính, bước hiện tại, từ khóa tiêu đề.
- **Xanh lá** `#2e9e46` / `#e8f4ea` / `#23703a`: đúng, đạt.
- **Vàng** `#e4a23a` / `#fdf5e4` / `#946207`: cần xem, GV đang ở.
- **Xanh dương** `#3c62b8` / `#eef2fb`: lý thuyết, thông tin, Làm dở.
- **Tím** `#6a3fd6` / `#f1ecfd`: gương thần, chiếu lên lớp.
- Phản hồi luôn có ký hiệu (✓ ! ? … –), **không chỉ dựa vào màu**. Chiếu bằng máy chiếu mờ vẫn đọc được.

## Kích thước

- Khung app 1440 × 900, tự co theo cửa sổ.
- Slide logic 1280 × 720. Học sinh xem 100 %, giáo viên xem 78 % (998 × 562). Present xem 112,5 % trên nền tối.
- Thân slide khoảng 1212 × 560. Mỗi slide một trọng tâm. Câu/đoạn đang học là chữ lớn nhất (18–34px).
- Chữ ≥ 14px trong slide, ≥ 12px ở chrome GV.

## Class hay dùng

| Class | Dùng cho |
|---|---|
| `btn`, `btn-red`, `btn-green`, `btn-soft`, `btn-ghost`, `btn-purple`, `btn-sm`, `ibtn` | nút (nút chính có bóng 3D) |
| `card`, `panel`, `tcard` | thẻ trong slide, khung lớn, thẻ cột GV |
| `lbl`, `lblg`, `tl`, `pl` | nhãn chữ hoa (đỏ, xanh, xám) |
| `hl` | từ khóa tiêu đề: chữ đỏ + vệt dạ quang chạy |
| `enter` + `d1…d7` | xuất hiện lần lượt |
| `fb ok` / `fb try` / `fb info` | hộp phản hồi |
| `tile` (`sel`, `ok`, `bad`, `dim`), `opt`, `verdict` | lựa chọn: ô số, dòng A/B/C, Yes/No |
| `pager` + `pd` (`on`, `ok`, `bad`) | chấm chuyển câu |
| `inp`, `ta` | ô nhập |
| `ex`, `tag`, `stag s-done…` | chip, tag, tag trạng thái |
| `slot`, `from`, `flipw` | đổi từ (WordSwap) |
| `wdot`, `titem`, `rseg`, `rbadge` | chấm từ, mục danh sách, đoạn tô màu |
| `pspace`, `planet`, `pcard`, `pstar` | cảnh hành tinh (OrbitScene) |
| `deco` | chấm/hình trang trí trôi nhẹ |

Hiệu ứng có sẵn: `rise`, `pop`, `popIn`, `zoomIn`, `shake`, `sweep`, `stamp`, `chipIn`, `fallIn`, `float`, `twinkle`, `ring`, `pulse`…
⚙ “Giảm hiệu ứng chuyển động” và cài đặt giảm chuyển động của hệ điều hành đều tắt chúng.

## Bố cục

- Nội dung luôn căn giữa và cân đối, không để khoảng trắng lớn một phía (`SlideBody` tự căn giữa theo chiều dọc).
- Hai cột: phần làm bài bên trái (flex 1), phần chọn/phản hồi bên phải (rộng 360–400px).
- Phản hồi nằm ngay cạnh thứ nó nói tới. Mỗi activity chỉ có một nút chính.
- Dòng gợi ý tiếng Việt đặt class `vi`, để ⚙ “Gợi ý tiếng Việt” ẩn được.
