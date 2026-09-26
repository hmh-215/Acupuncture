---
name: acupuncture-interactive-web-studio
description: >-
  Chuyên biệt hóa 100% việc thiết kế, hệ thống và tổ chức các trang web tương tác
  (HTML/CSS/JavaScript) phục vụ giáo dục nội dung châm cứu & cơ sinh học. Đọc tài liệu
  chương tổng hợp (.md), sử dụng ảnh ingredient từ acupuncture-image-studio và video
  từ acupuncture-flow-video-director để xây dựng giao diện tương tác giáo dục y khoa.
  100% nội dung hiển thị bằng Tiếng Việt có dấu. Claude (hoặc model lớn) đảm nhận
  kiến trúc hệ thống & phân chia module; Gemini (hoặc model nhỏ) thực thi coding
  từng module con HTML/CSS/JS.
---

# Acupuncture Interactive Web Studio (Xưởng Giao Diện Tương Tác Y Khoa)

## 📌 Vai Trò Cốt Lõi

Skill này đóng vai trò là **Kiến Trúc Sư & Nhà Phát Triển Giao Diện Tương Tác Y Khoa**:
- **Đọc hiểu** tài liệu chương tổng hợp `01-TongHop/CHUONG_xx_...md` để nắm nội dung y khoa.
- **Tham chiếu** ảnh ingredient từ `02-Visual-Studio/Chuong-XX/ingredients/` và video từ `Chuong-XX/videos/`.
- **Thiết kế & phát triển** các trang web tương tác (HTML5 Canvas, CSS3, JavaScript) để trình bày nội dung giáo dục châm cứu một cách trực quan, sinh động.
- **Hệ thống hóa** toàn bộ module web theo cấu trúc chương, đảm bảo tính nhất quán về Design System.

---

## 🎨 DESIGN SYSTEM BẮT BUỘC (Kế Thừa Từ Template Chuẩn)

Tất cả giao diện web BẮT BUỘC tuân thủ hệ thống thiết kế đã xác lập tại file mẫu:
`He-Dao-Dan/02-Visual-Studio/Chuong-01/videos/hoat_hoa_pha1_co_huong_tam.html`

### Bảng Biến CSS (CSS Custom Properties)

```css
:root {
  --bg: #0f172a;        /* Nền chính Dark Slate */
  --card: #1e293b;      /* Nền thẻ card */
  --border: #334155;    /* Viền phân cách */
  --text: #f8fafc;      /* Chữ chính trắng */
  --muted: #94a3b8;     /* Chữ phụ xám nhạt */
  --cyan: #38bdf8;      /* Nhấn mạnh Cyan - tiêu đề phụ, đường viền, sợi Actin */
  --amber: #f59e0b;     /* Nhấn mạnh Amber - vectơ lực hãm, cầu Myosin */
  --red: #ef4444;       /* Nhấn mạnh Đỏ - cơ co, vectơ lực chủ động, cảnh báo */
  --green: #10b981;     /* Nhấn mạnh Xanh lá - trạng thái an toàn, dẫn lực thành công */
}
```

### Quy Tắc Typography & Layout

1. **Font chính**: `'Segoe UI', system-ui, -apple-system, sans-serif`
2. **Bố cục chính**: CSS Grid 2 cột (`grid-template-columns: 1fr 380px`) — viewport bên trái, panel thông tin bên phải.
3. **Responsive**: Chuyển 1 cột khi `max-width: 900px`.
4. **Card style**: Bo góc `border-radius: 12px`, viền `1px solid var(--border)`, đổ bóng `box-shadow: 0 10px 30px rgba(0,0,0,0.5)`.
5. **Badge phân loại**: Viền tròn `border-radius: 9999px`, nền trong suốt có màu nhấn.
6. **Canvas viewport**: Nền đen sâu `#090d16`, tỷ lệ `aspect-ratio: 16/10`.

### Thành Phần Giao Diện Bắt Buộc

Mỗi trang web tương tác PHẢI CÓ đầy đủ các thành phần sau:

| # | Thành phần | Mô tả | Vị trí |
|---|---|---|---|
| 1 | **Badge phân loại** | Nhãn phân loại chủ đề (ví dụ: `CHUYÊN ĐỀ Y KHOA HOẠT HỌA • HỆ ĐẠO DẪN`) | Đầu trang, trên tiêu đề |
| 2 | **Tiêu đề chính (H1)** | Tên pha/chủ đề bằng Tiếng Việt có dấu | Đầu trang |
| 3 | **Mô tả phụ** | Giải thích ngắn gọn bằng Tiếng Việt | Dưới tiêu đề |
| 4 | **Viewport Canvas/Media** | Vùng hiển thị hoạt họa Canvas hoặc video nhúng | Cột trái |
| 5 | **Bảng điều khiển** | Thanh trượt (slider), nút phát/dừng, nút xuất video | Dưới viewport |
| 6 | **Bảng Chú Giải Ký Hiệu (Legend)** | Giải thích màu sắc và biểu tượng — tiêu đề `📌 CHÚ GIẢI KÝ HIỆU` | Cột phải, card trên |
| 7 | **Lưu đồ quy trình (Mermaid)** | Sơ đồ luồng dẫn lực hoặc quy trình y khoa | Cột phải, card dưới |
| 8 | **Callout ứng dụng lâm sàng** | Hộp nhấn mạnh ứng dụng châm cứu Đạo Dẫn | Dưới lưu đồ |

---

## 🏗️ CẤU TRÚC THƯ MỤC ĐẦU RA

```text
He-Dao-Dan/
└── 03-Interactive-Web/
    ├── Chuong-01/
    │   ├── index.html                    (Trang tổng quan chương - liên kết các module)
    │   ├── modules/
    │   │   ├── pha1_co_huong_tam.html    (Module tương tác Pha 1)
    │   │   ├── pha2_cang_giang_giu.html  (Module tương tác Pha 2)
    │   │   ├── pha3_mo_khong_tan.html    (Module tương tác Pha 3)
    │   │   └── pha4_buong_long.html      (Module tương tác Pha 4)
    │   └── assets/
    │       ├── css/
    │       │   └── theme.css             (CSS Design System dùng chung)
    │       ├── js/
    │       │   └── common.js             (Utilities dùng chung: drawArrow, animation loop...)
    │       └── media/                    (Ảnh/video nhúng, symlink hoặc copy từ ingredients/)
    ├── Chuong-02/
    │   └── ... (cấu trúc tương tự)
    ├── Chuong-03/
    ├── Chuong-04/
    └── shared/
        ├── css/
        │   └── base-theme.css            (CSS nền tảng dùng chung toàn bộ chương)
        ├── js/
        │   ├── anatomy-renderer.js       (Engine render giải phẫu Canvas dùng chung)
        │   ├── mermaid-init.js           (Khởi tạo Mermaid với theme dark)
        │   └── voice-narration.js        (Module SpeechSynthesis Tiếng Việt)
        └── components/
            ├── legend-box.js             (Component Bảng Chú Giải tái sử dụng)
            ├── control-panel.js          (Component Bảng Điều Khiển slider/nút)
            └── callout-box.js            (Component Callout ứng dụng lâm sàng)
```

---

## 🔄 MÔ HÌNH PHÂN CÔNG TÁC VỤ (TASK DELEGATION MODEL)

### Claude (Model Lớn) — Kiến Trúc Sư Hệ Thống
Đảm nhận các tác vụ ở cấp độ **hệ thống & tổ chức**:
1. **Phân tích yêu cầu**: Đọc tài liệu chương `.md`, xác định các module tương tác cần xây dựng.
2. **Thiết kế kiến trúc**: Phân chia component, xác định shared modules, quy hoạch cấu trúc thư mục.
3. **Viết đặc tả module (Module Spec)**: Cho mỗi module cần tạo, soạn đặc tả chi tiết gồm:
   - Tên file và vị trí lưu trữ
   - Nội dung y khoa cần hiển thị (trích từ tài liệu chương)
   - Loại hoạt họa Canvas cần render (cơ co/giãn, cầu trượt vi thể, vectơ lực...)
   - Danh sách thành phần giao diện bắt buộc (Legend, Mermaid, Callout...)
   - Ảnh ingredient và video cần nhúng (đường dẫn tuyệt đối)
   - Nội dung voice-over script (Tiếng Việt)
4. **Rà soát & kiểm tra chất lượng**: Kiểm tra code hoàn thiện từ Gemini, đảm bảo tuân thủ Design System và chuẩn y khoa.

### Gemini (Model Nhỏ/Nhanh) — Lập Trình Viên Module
Đảm nhận các tác vụ ở cấp độ **coding từng module**:
1. **Nhận đặc tả module** từ Claude.
2. **Viết mã HTML/CSS/JS** cho từng module theo đúng Design System.
3. **Tạo hoạt họa Canvas**: Vẽ cơ, xương, vectơ lực, cầu trượt vi thể bằng Canvas 2D API.
4. **Tích hợp Mermaid**: Nhúng sơ đồ luồng với `mermaid.initialize({ startOnLoad: true, theme: 'dark' })`.
5. **Tích hợp SpeechSynthesis**: Thuyết minh Tiếng Việt với `lang: 'vi-VN'`.
6. **Tích hợp MediaRecorder**: Xuất video WebM từ Canvas animation.

---

## 📋 QUY TRÌNH LÀM VIỆC CHUẨN (WORKFLOW)

### Bước 1: Phân Tích Tài Liệu Chương
```text
ĐẦU VÀO: 01-TongHop/CHUONG_xx_...md
         + 02-Visual-Studio/Chuong-XX/ingredients/*.jpg
         + 02-Visual-Studio/Chuong-XX/videos/*.mp4

ĐẦU RA:  Danh sách module cần xây dựng + Đặc tả từng module
```

### Bước 2: Tạo Shared Components (1 lần duy nhất)
- Trích xuất CSS Design System thành `shared/css/base-theme.css`
- Trích xuất các hàm Canvas dùng chung thành `shared/js/anatomy-renderer.js`
- Tạo các Web Component tái sử dụng (Legend Box, Control Panel, Callout)

### Bước 3: Phát Triển Từng Module
Với mỗi module (ví dụ `pha1_co_huong_tam.html`):
1. Claude soạn đặc tả module → giao cho Gemini
2. Gemini coding HTML/CSS/JS theo đặc tả
3. Claude review code, kiểm tra:
   - ✅ Tuân thủ CSS variables (không hardcode màu)
   - ✅ 100% nội dung chữ bằng Tiếng Việt có dấu
   - ✅ Có đầy đủ 8 thành phần giao diện bắt buộc
   - ✅ Canvas animation mượt 60fps
   - ✅ Responsive trên mobile
   - ✅ Nội dung y khoa chính xác theo tài liệu chương

### Bước 4: Tích Hợp & Liên Kết
- Tạo `index.html` cho mỗi chương — liên kết đến tất cả module trong chương
- Nhúng video .mp4 từ `Chuong-XX/videos/` vào trang (thẻ `<video>`)
- Nhúng ảnh ingredient vào các phần minh họa tĩnh

### Bước 5: Kiểm Tra & Báo Cáo
- Mở file HTML trên trình duyệt Edge kiểm tra hiển thị
- Báo cáo cho người dùng kèm screenshot/hướng dẫn mở file

---

## 🎯 CÁC LOẠI MODULE TƯƠNG TÁC HỖ TRỢ

### Loại 1: Hoạt Họa Canvas Sinh Cơ Học
Mô phỏng động học cơ: co/giãn, cầu trượt Actin-Myosin, vectơ lực.
- Slider điều khiển mức co cơ (0%-100%)
- Điểm Cân Kết (Trigger Point) nhấp nháy
- Inset kính lúp vi thể

### Loại 2: Trình Khám Phá Giải Phẫu Tương Tác
Click vào vùng cơ thể → hiện thông tin lớp giải phẫu nông-sâu, huyệt vị WHO, cảnh báo an toàn.

### Loại 3: Trình Chiếu Phân Cảnh (Phase Navigator)
Gallery ảnh ingredient + video kèm mô tả từng pha, điều hướng Trước/Sau.

### Loại 4: Sơ Đồ Luồng Tương Tác (Interactive Flowchart)
Mermaid diagram với node có thể click → mở popup giải thích chi tiết.

### Loại 5: Quiz & Tự Đánh Giá
Câu hỏi trắc nghiệm kiểm tra kiến thức (Pha nào? Cơ nào? Huyệt nào?).

---

## ⚠️ QUY TẮC BẮT BUỘC

1. **100% TIẾNG VIỆT CÓ DẤU**: Mọi nội dung hiển thị (tiêu đề, nhãn, legend, tooltip, placeholder, alert, confirm) phải bằng Tiếng Việt chuẩn xác.
2. **KHÔNG HARDCODE MÀU**: Luôn dùng CSS Custom Properties (`var(--bg)`, `var(--red)`...).
3. **TUÂN THỦ GIẢI PHẪU CHÍNH XÁC**: Mọi tên cơ, xương, huyệt vị phải theo tiêu chuẩn quy định tại `AGENTS.md` mục 2.
4. **GỌN NHẸ**: Không dùng framework nặng (React, Vue...). Chỉ dùng Vanilla JS, HTML5 Canvas, CSS3, Mermaid CDN.
5. **OFFLINE-FIRST**: Ngoài Mermaid CDN, toàn bộ trang phải hoạt động offline (không phụ thuộc API bên ngoài).
6. **MÃ HÓA UTF-8**: Luôn khai báo `<meta charset="UTF-8">` và `<html lang="vi">`.
