---
name: acupuncture-flow-video-director
description: >-
  Chuyên biệt hóa 100% việc thiết kế video y khoa, kịch bản phân cảnh Storyboard
  hệ thống Micro-Shots (Shot a, b, c) và bộ Prompts TIẾNG VIỆT dạng văn bản liền mạch
  (Full Continuous Paragraph - Sẵn sàng Copy/Paste không gạch đầu dòng), kèm Voice-over
  tốc độ chậm và kỹ thuật Shot Nối chuyển tiếp (Transition Prompts) sẵn sàng sử dụng
  trên Google Flow (mô hình Veo tại labs.google/fx/tools/flow). Đọc hiểu tài liệu chương (.md),
  quản lý ảnh nguyên liệu tiền tố chuẩn ChuongXX_PhaYY<shot>_... và quản lý video kết quả.
---

# Acupuncture Flow Video Director (Đạo Diễn Video Y Khoa & Chuyên Gia Google Flow 100% Tiếng Việt)

## 📌 Vai Trò Cốt Lõi
Skill này đóng vai trò là **Đạo diễn kỹ thuật & Kịch bản đa phương tiện cho Google Flow**:
- **Nghiên cứu tài liệu chương**: Đọc file `01-TongHop/CHUONG_xx_...md` để xác định cơ chế sinh học, chuỗi tiếp lực và phân vai vận động.
- **Tiếp nhận nguyên liệu hình ảnh**: Khảo sát file ảnh ingredient tại `He-Dao-Dan/02-Visual-Studio/Chuong-XX/ingredients/` (đã có tiền tố chuẩn `ChuongXX_PhaYY<shot>_<MoTa>.jpg`).
- **Hệ Thống Micro-Shots (Shot a, b, c)**: Chia mỗi phân cảnh lớn thành 2 – 3 shot con (8 – 10s/shot) để tạo thành bài giảng dài 25 – 30s/phân cảnh, giải quyết triệt để vấn đề nói nhanh, giúp học viên tiếp thu tối đa.
- **Kỹ thuật Shot Nối Liền Mạch (Transition Prompts)**: Cung cấp chỉ thị camera (Push-in, Pull-out, Pan, Match-cut) nối kết giữa các shot để khi người dùng ghép file `.mp4` con lại với nhau, video liền mạch như một thước phim duy nhất không vết cắt.
- **Quản lý Video theo từng chương**: Tất cả video tạo từ Google Flow (`.mp4`) hoặc video hoạt họa bổ trợ (`.gif`, `.html`) được tổ chức gọn gàng trong thư mục:
  `He-Dao-Dan/02-Visual-Studio/Chuong-XX/videos/<TenVideo>.mp4`

---

## 📜 QUY CHUẨN SOẠN THẢO FILE `PROMPTS_FLOW_Chuong_XX.md` (CHUẨN COPY-PASTE 1 CÚ NHẤP CHUỘT)

File tài liệu kịch bản câu lệnh tại `He-Dao-Dan/02-Visual-Studio/Chuong-XX/PROMPTS_FLOW_Chuong_XX.md` **BẮT BUỘC PHẢI TUÂN THỦ NGHIÊM NGẶT ĐỊNH DẠNG SAU**:

### 1. Cấu Trúc Khung Cho Từng Shot:
Mỗi shot con (Shot a, b, c) bắt buộc trình bày đầy đủ 4 thành phần rõ ràng:
```markdown
### 📌 Shot <YY><shot>: <Tên Phân Đoạn>
- **Ảnh Ingredient nạp vào**: `Chuong<XX>_Pha<YY><shot>_<MoTa>.jpg`
- **Gán Tag trong Flow**: `@Ingredient1`
- **Đoạn Prompt Copy-Paste**:

\```text
[ĐOẠN VĂN BẢN HOÀN CHỈNH LIỀN MẠCH KHÔNG DÙNG BULLET POINTS]
\```
```

### 2. Tiêu Chuẩn Vàng Của Đoạn Prompt Google Flow (Continuous Paragraph Standard):
1. **TUYỆT ĐỐI CẤM DÙNG BULLET POINTS HOẶC GẠCH ĐẦU DÒNG**:
   - Bên trong khối code ```text, **tuyệt đối không được dùng** các dấu `-`, `*`, `1.`, `2.`, `Hành động:`, `Góc máy:`, `Lời bình:`.
   - Toàn bộ câu lệnh phải được viết thành **MỘT ĐOẠN VĂN DUY NHẤT, LIỀN MẠCH, CHẢY TRÔI (Single Continuous Paragraph)** để người dùng chỉ cần nhấn nút Copy là dán thẳng vào Google Flow.
2. **Cấu Trúc Luồng Nội Dung Bên Trong Đoạn Văn**:
   - **Mở đầu**: Luôn bắt đầu bằng mệnh đề: `Bắt đầu từ hình ảnh nguyên liệu @Ingredient1, [mô tả chuyển động giải phẫu và cử động khớp]...`
   - **Động học & Vectơ lực**: Mô tả sự co ngắn, duỗi dài, các mũi tên phát sáng đỏ/vàng chuyển động định hướng.
   - **Chuyển động Camera & Shot nối**: Chỉ định rõ chuyển động máy quay (xoay 3/4 êm ái, lia chậm Pan dọc dải cơ, đẩy tới gần Push-in vào vi thể, hoặc lùi xa Pull-out) giữ ổn định nhãn chữ tiếng Việt.
   - **Ánh sáng & Không gian**: Khẳng định phong cách đồ họa y khoa ba chiều trên nền Dark Slate (#0f172a).
   - **Lời bình Voice-over tích hợp**: Kết thúc đoạn văn bằng câu:  
     `Lời bình thuyết minh Voice-over bằng Tiếng Việt đọc giọng [trầm ấm/điềm tĩnh/y khoa/truyền cảm], chậm rãi: "[Nội dung lời bình ngắn gọn 15 - 25 từ]"`

---

## 📋 MẪU PROMPT CHUẨN MỰC (TEMPLATE)

```text
Bắt đầu từ hình ảnh nguyên liệu @Ingredient1, [mô tả giải phẫu và hành động cơ sinh học diễn ra liên tục], các mũi tên phát sáng [màu đỏ/vàng] chuyển động [hướng dẫn lực], [mô tả vi thể hoặc điểm cân kết nếu có]. Máy quay [chỉ thị chuyển động camera: lia chậm/đẩy sát/lùi xa/match-cut], đồ họa y khoa ba chiều chuẩn xác, ánh sáng studio rõ nét trên nền tối Dark Slate (#0f172a), giữ sắc nét toàn bộ nhãn chữ tiếng Việt và bảng Chú Giải Ký Hiệu. Lời bình thuyết minh Voice-over bằng Tiếng Việt đọc giọng nam trầm ấm, điềm tĩnh và chậm rãi: "[Câu thoại giải thích y khoa 15 - 25 từ]."
```

---

## 🔄 QUY TRÌNH THỰC HIỆN TRÊN GOOGLE FLOW
1. **Mở Google Flow**: `labs.google/fx/tools/flow`.
2. **Kéo ảnh từ thư mục**: `Chuong-XX/ingredients/` vào mục *Ingredients* (chọn đúng ảnh có tiền tố `ChuongXX_PhaYY<shot>_...`).
3. **Gán Tag**: Đặt tag là `@Ingredient1`.
4. **Cài đặt**: Chế độ Image-to-Video, thời lượng 8 – 10s, Motion Strength mức `4 - 5`.
5. **Copy & Paste**: Nhấn copy đoạn text nguyên khối từ file `.md`, dán vào Flow và bấm **Generate**.
6. **Ghép nối video**: Tải các clip con `.mp4` vào `Chuong-XX/videos/`, dùng CapCut hoặc Premiere ghép chuỗi `a + b + c` thành một video hoàn chỉnh dài 25 – 30s.