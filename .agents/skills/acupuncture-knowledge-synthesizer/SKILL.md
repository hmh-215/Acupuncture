---
name: acupuncture-knowledge-synthesizer
description: >-
  Đọc sâu, bóc tách cấu trúc và tổng hợp tri thức y khoa toàn diện 100% TIẾNG VIỆT
  từ tài liệu châm cứu do người dùng cung cấp (đọc từ NotebookLM hoặc trực tiếp từ
  nguồn tài liệu dự án). Áp dụng quy trình kiểm chứng lâm sàng (Clinical Verification)
  về cơ sinh học, mốc giải phẫu nông - sâu, kỹ thuật đắc khí, phân vai vận động và
  đặc biệt là CẢNH BÁO AN TOÀN Y KHOA (nguy cơ tràn khí màng phổi, tổn thương tạng,
  huyệt kỵ thai phụ). Xuất bản thành file Markdown tổng hợp chuẩn y khoa làm nền
  tảng cho Visual Studio. Dùng skill này khi người dùng muốn "tổng hợp tài liệu",
  "bóc tách kiến thức châm cứu", "lập hồ sơ huyệt vị/phác đồ", hoặc "kiểm tra an
  toàn lâm sàng".
---

# Acupuncture Knowledge Synthesizer (Tổng Hợp & Kiểm Chứng Tri Thức Châm Cứu 100% Tiếng Việt)

## 📌 Vai Trò Cốt Lõi
Skill này đóng vai trò là **Bộ não phân tích y khoa chuẩn mực bằng Tiếng Việt**:
- Đọc toàn văn tài liệu do người dùng đưa vào (thông qua hỏi đáp có trích dẫn từ NotebookLM hoặc đọc trực tiếp từ tài liệu đã giải nén).
- Toàn bộ kết quả tổng hợp, tài liệu xuất bản, bảng thuật ngữ, phân tích cơ sinh học và cảnh báo an toàn **BẮT BUỘC PHẢI VIẾT 100% BẰNG TIẾNG VIỆT** chuẩn y khoa.
- Thuật ngữ quốc tế/tiếng Anh (nếu có) chỉ được để trong ngoặc đơn đi kèm sau thuật ngữ Tiếng Việt chuẩn.
- Đảm bảo đầu ra có đầy đủ chi tiết kỹ thuật làm tiền đề trực tiếp cho bước tạo hình ảnh và video ở **`acupuncture-visual-studio-planner`**.

---

## 🧭 3 Khung Tổng Hợp Linh Hoạt Tùy Theo Loại Tài Liệu

Tùy thuộc vào nội dung tài liệu người dùng cung cấp, skill sẽ kích hoạt khung tổng hợp phù hợp:

### Khung A: Cơ Sinh Học Chuỗi Vận Động & Châm Cứu Chức Năng (như Hệ Đạo Dẫn, Kinh Cân)
Dành cho các tài liệu phân tích vận động, giải phóng điểm Cân Kết (Trigger Points) và chuỗi myofascial kinetic chains:
1. **Sinh lý học chuỗi cơ cân**: 4 trạng thái (Co hướng tâm, Căng giằng giữ hãm lực, Giữ siết nền mở cực đại, Buông lỏng hồi phục). Cơ chế hình thành điểm nghẽn lực.
2. **Phân vai động học 7 thành phần**: Xác định rõ trong từng tư thế đâu là *Giá đỡ*, *Chủ vận*, *Đối vận*, *Đồng vận*, *Đối trọng*, *Giằng giữ*, *Tiếp lực*.
3. **Nguyên lý trị liệu**: Trục thế ("Đạo") & Hướng dẫn lực ("Dẫn"), ổn định giá đỡ trước khi trị đau, tái lập liên kết tiếp lực toàn thân.
4. **Kỹ thuật châm đặc hiệu**: Chi tiết thủ pháp *Động châm* (vừa châm vừa vận động), *Tỏa châm* (tạo điểm neo khóa trục), *Lưu châm* (xuyên tầng cơ sâu tự điều hòa).

### Khung B: Hệ Thống Huyệt Đạo & Mốc Giải Phẫu Chuẩn (Atlas / Giáo Trình)
Dành cho tài liệu về hệ thống kinh lạc và huyệt vị:
1. **Mã hóa quốc tế**: Tên Hán Việt + Mã chuẩn WHO (ví dụ: *Hợp Cốc - LI-4*, *Liệt Khuyết - LU-7*).
2. **Mốc giải phẫu xác định trên cơ thể sống**:
   - Mốc xương, mỏm trâm, rãnh gân, khe khớp dễ sờ nắn.
   - Khoảng cách thốn đo (F-cun hoặc B-cun).
   - Giải phẫu lớp nông (da, nhánh thần kinh cảm giác nông, tĩnh mạch nông).
   - Giải phẫu lớp sâu (bó cơ, bao gân, động mạch sâu, thần kinh vận động).
3. **Kỹ thuật châm kim chuẩn xác**:
   - Hướng kim: Thẳng (90°), Xiên (45°), Luồn dưới da (15°).
   - Độ sâu an toàn: Min - Max theo thốn / mm.
   - Tiêu chuẩn Đắc Khí (*De Qi*): Căng, tức, nặng, chướng, cảm giác tê lan truyền.
   - Thông số điện châm / cứu ngải: Tần số xung kích thích (giảm đau hay trợ trương lực).

### Khung C: Phác Đồ Bệnh Học Lâm Sàng (Clinical Treatment Protocols)
Dành cho hướng dẫn điều trị bệnh lý (Liệt mặt, đau vai gáy, đau thần kinh tọa...):
1. **Chẩn đoán & Phân thể YHCT kết hợp YHHĐ**.
2. **Công thức phối huyệt**: Huyệt chủ đạo (Chính) + Huyệt bổ trợ + Huyệt dẫn đường.
3. **Thủ thuật bổ tả & Liệu trình**: Thời gian lưu kim, số lần châm/tuần, bài tập vận động phối hợp.

---

## ⚠️ Nguyên Tắc Kiểm Chứng An Toàn Bắt Buộc (Clinical Safety Check)

Mọi file tổng hợp đều phải trải qua bước rà soát an toàn y khoa:
- **Nguy cơ tràn khí màng phổi**: Bắt buộc cảnh báo ở mọi huyệt vùng ngực, vai trên (Kiên tỉnh, Khuyết bồn) và lưng trên (Phế du, Đốc du...). Ghi rõ góc châm cấm châm thẳng góc quá sâu.
- **Tổn thương tạng & mạch máu lớn**: Vùng bụng dưới (bàng quang đầy), vùng hạ sườn (gan, lách to), vùng động mạch cảnh, hố mắt.
- **Chống chỉ định phụ nữ có thai**: Bắt buộc bôi đậm các huyệt kích thích co thắt tử cung mạnh (*Hợp cốc, Tam âm giao, Côn lôn, Chí âm, Kiên tỉnh*).
- **Phòng ngừa & Xử trí Vựng Châm (Kim暈)**: Triệu chứng hoa mắt, chóng mặt, vã mồ hôi và các bước sơ cứu.

---

## 📄 File Đầu Ra Chuẩn

Lưu tại `<TenChuyenDe>/01-TongHop/`:
- `MUCLUC_<TenChuyenDe>.md`: Bảng tra cứu tóm tắt ma trận các khái niệm/huyệt vị/thủ thuật (100% Tiếng Việt).
- `TH-CHAMCUU_<TenChuyenDe>.md`: Tài liệu tổng hợp hoàn chỉnh, chi tiết từng mục theo đúng các khung A, B, C ở trên (100% Tiếng Việt).
