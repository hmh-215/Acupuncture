---
name: acupuncture-image-studio
description: >-
  Chuyên biệt hóa 100% việc tạo hình ảnh giải phẫu y khoa 3D, infographic cơ sinh
  học và tài sản hình ảnh "Nguyên liệu gốc" (Ingredients) chuẩn mực cho Google Flow.
  BẮT BUỘC tuân thủ Theme chuẩn (Dark Slate Studio + Mũi tên lực + Kính lúp vi thể
  + Bảng Chú giải Ký hiệu) với 100% NHÃN CHỮ TIẾNG VIỆT CÓ DẤU. Tự động lưu trữ theo
  tiền tố chuẩn: ChuongXX_PhaYY<shot>_<MoTa>.jpg tại 02-Visual-Studio/Chuong-XX/ingredients/.
---

# Acupuncture Image Studio (Xưởng Thiết Kế Nguyên Liệu Hình Ảnh Cho Google Flow)

## 📌 Vai Trò Cốt Lõi
Skill này đóng vai trò là **Xưởng sản xuất nguyên liệu hình ảnh (Ingredients Provider) cho Google Flow**:
- Nghiên cứu nội dung chương tổng hợp (`01-TongHop/CHUONG_xx_...md`).
- Sản xuất các hình ảnh giải phẫu 3D, infographic cơ sinh học làm khung hình xuất phát (**First-Frame Assets**) đưa vào Google Flow.
- **QUY CHUẨN ĐẶT TÊN FILE INGREDIENT BẮT BUỘC (NAMING CONVENTION)**:
  Mọi ảnh tạo ra bắt buộc phải lưu với tiền tố chuẩn xác:
  ```text
  He-Dao-Dan/02-Visual-Studio/Chuong-XX/ingredients/Chuong<XX>_Pha<YY><shot>_<MoTaNgan>.jpg
  ```
  - `<XX>`: Số thứ tự chương (`01`, `02`...).
  - `<YY>`: Số thứ tự pha hoặc phân cảnh lớn (`01`, `02`...).
  - `<shot>`: Phân đoạn micro-shot (`a` = Đại thể chuỗi động học, `b` = Cận cảnh vi thể tế bào, `c` = Lâm sàng & Shot nối).
  - `<MoTaNgan>`: Mô tả ngắn gọn không dấu ngăn cách bằng gạch dưới.
  - *Ví dụ*:
    - `Chuong01_Pha01a_Chuoi_Dong_Hoc_Infographic.jpg`
    - `Chuong01_Pha02b_ViThe_Actin_Myosin_NenMach.jpg`
    - `Chuong01_Pha03b_ViThe_ThuThe_Golgi_GTO.jpg`

---

## 🎨 TIÊU CHUẨN THIẾT KẾ INGREDIENT (DESIGN SYSTEM CHUẨN MẪU)

Mọi hình ảnh Ingredient tạo ra cho các phân cảnh BẮT BUỘC phải kế thừa đúng **Theme và Format mẫu chuẩn**:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│               TIÊU ĐỀ PHÂN CẢNH IN HOA BẰNG TIẾNG VIỆT (TOP)                │
├──────────────────────────────────────────────────────┬──────────────────────┤
│                                                      │  CHÚ GIẢI KÝ HIỆU    │
│   HÌNH ẢNH GIẢI PHẪU 3D CHUYỂN ĐỘNG SINH HỌC        │  (LEGEND BOX)        │
│   - Nền tối Dark Slate Studio sang trọng             │                      │
│   - Bó cơ co ngắn / duỗi dài / giữ trục / buông lỏng │  [Icon 1] Định nghĩa │
│   - Vectơ lực phát sáng (Mũi tên đỏ / vàng neon)     │  [Icon 2] Định nghĩa │
│     chỉ rõ hướng dẫn truyền hoặc nén ép              │  [Icon 3] Định nghĩa │
│   - Điểm bệnh lý hoặc mốc huyệt phát sáng            │  [Icon 4] Định nghĩa │
│                                                      │                      │
│   ┌─────────────────────────────┐                    │  100% TIẾNG VIỆT     │
│   │ VÒNG TRÒN PHÓNG ĐẠI VI THỂ  │                    │  CÓ DẤU CHUẨN XÁC    │
│   │ (Microscopic Inset)         │                    │                      │
│   │ Actin-Myosin / Vi mạch      │                    │                      │
│   └─────────────────────────────┘                    │                      │
└──────────────────────────────────────────────────────┴──────────────────────┘
```

### 5 Yếu Tố Bắt Buộc Trong Câu Prompt Tạo Ingredient:
1. **Bối cảnh (Backdrop)**: Nền tối phòng thí nghiệm y khoa y sinh học (`clean dark slate medical laboratory background, #0f172a`).
2. **Giải phẫu 3D (Anatomy)**: Khối cơ, xương, dây chằng render 3D siêu thực tế (Unreal Engine 5 quality, 8k resolution). Thể hiện rõ sự tương tác giữa cơ chủ vận và đối vận.
3. **Mũi tên vectơ lực (Dynamic Force Vectors)**: Mũi tên phát sáng màu đỏ (`#ef4444`) hoặc vàng hổ phách (`#f59e0b`) chỉ rõ hướng phát lực hoặc hãm lực.
4. **Khung tròn vi thể (Circular Microscopic Inset)** hoặc **Ảnh vi thể chuyên biệt (Macro Cellular Insets)**: Phóng đại cơ chế sinh học tế bào (cầu trượt actin-myosin, dòng chảy mao mạch máu, áp lực khoang dưới 0.016 bar, thụ thể Golgi).
5. **Bảng Chú giải (Legend Box)**: Nằm bên phải với tiêu đề `CHÚ GIẢI KÝ HIỆU`, liệt kê các icon kèm mô tả ngắn gọn bằng **100% Tiếng Việt có dấu**.

---

## 📋 Mẫu Prompt Tạo Ingredient Chuẩn

```text
A 3D biomechanical medical scientific animation style infographic of [Tên phân cảnh: ví dụ Pha 2 - Căng Giằng Giữ]. The illustration shows [mô tả cơ và khớp chuyển động, sự phối hợp giữa cơ chủ vận và đối vận]. Bright red and amber glowing arrows point [hướng vectơ lực]. A magnified circular cutaway inset at the bottom reveals [cấu trúc vi thể]. At the critical area, [điểm giải phẫu hoặc mốc huyệt]. A clear medical legend box on the right side. CRITICAL: All titles, annotations, and legend text MUST be written strictly in VIETNAMESE language with correct diacritics: Top Title: '[TIÊU ĐỀ PHA]'. Labeled callouts: '[Nhãn 1]', '[Nhãn 2]'. Legend box titled: 'CHÚ GIẢI KÝ HIỆU'. Crisp modern medical animation render, Unreal Engine 5 style, clean dark slate background (#0f172a), 8k resolution. Absolutely no English text on graphic labels.
```