# HƯỚNG DẪN TIẾP NHẬN & BÓC TÁCH VIDEO BÀI GIẢNG THỰC HÀNH LÂM SÀNG
## Vận Hành Bởi Skill `acupuncture-video-clinical-extractor`

Tài liệu này hướng dẫn cách đưa video thực hành châm cứu vào dự án để AI bóc tách hành động thao tác và trích xuất transcript giải phẫu chuẩn xác 100% Tiếng Việt.

---

### 📥 1. Cách Đưa Video Vào Dự Án
Bạn có thể cung cấp video theo 2 cách:
1. **Cách 1: File video trực tiếp**: Kéo thả file video (`.mp4`, `.mkv`, `.mov`) vào thư mục `TaiLieu-DauVao/`.
2. **Cách 2: Đường link video**: Cung cấp đường dẫn link video (YouTube, Google Drive, bài giảng trực tuyến).

---

### ⚙️ 2. Quy Trình Xử Lý Đa Phương Thức (Multimodal Processing)
Khi nhận video, skill `acupuncture-video-clinical-extractor` sẽ kích hoạt mô hình Gemini Multimodal để:
1. **Quan sát luồng hình ảnh**: Từng khung hình thị giác về vị trí đặt tay sờ nắn, góc đâm kim, độ sâu, phản ứng co cơ.
2. **Lắng nghe luồng âm thanh**: Chuyển giọng nói của giảng viên thành văn bản, chuẩn hóa chính tả và thuật ngữ y khoa.
3. **Đối chiếu mốc giải phẫu chuẩn y khoa**: Quy đổi các vị trí châm thành tên cơ, mốc xương, mạch máu, thần kinh và mã huyệt chuẩn WHO.

---

### 📄 3. Cấu Trúc File Đầu Ra Mẫu (`VIDEO_TRICHXUAT_<TenVideo>.md`)

```markdown
# HỒ SƠ BÓC TÁCH LÂM SÀNG TỪ VIDEO: [TÊN BÀI GIẢNG]

## 1. THÔNG TIN CHUNG
- **Thời lượng video**: 45 phút 20 giây
- **Giảng viên / Bác sĩ thị phạm**: ...
- **Chuyên đề**: Điều trị hội chứng đau cổ vai gáy theo Hệ Đạo Dẫn

## 2. MA TRẬN PHÂN ĐOẠN THAO TÁC & TRANSCRIPT CHUẨN GIẢI PHẪU

| Mốc thời gian | Thao tác bác sĩ quan sát được | Mốc giải phẫu thực thể chính xác | Huyệt vị & Góc/Độ sâu châm | Phản ứng Đắc khí & Vận động | Transcript lời giảng chuẩn hóa (100% Tiếng Việt) | Cảnh báo an toàn y khoa |
|---|---|---|---|---|---|---|
| **04:15 - 05:30** | - Bác sĩ dùng ngón cái tay trái miết dọc bờ trên cơ thang tìm dải căng cứng (taut band). <br>- Tay phải cầm kim số 5, sát khuẩn cồn 70 độ. | - Bờ trên cơ thang (*M. trapezius*). <br>- Cơ nâng vai (*M. levator scapulae*). <br>- Điểm giữa đoạn nối mỏm gai đốt sống C7 và mỏm cùng vai (*Acromion*). | - Huyệt: Kiên Tỉnh (GB-21). <br>- Góc châm: Châm xiên 45 độ ra phía sau/ngoài. <br>- Độ sâu: 0.8 thốn (khoảng 2 cm). | - Bệnh nhân cảm giác căng tức nặng lan xuống đai vai. <br>- Xuất hiện đáp ứng co giật cục bộ (Local Twitch Response). | *"Các đồng nghiệp lưu ý: tại điểm Kiên tỉnh, chúng ta tuyệt đối không châm thẳng góc 90 độ vì bên dưới là đỉnh màng phổi. Hãy hướng mũi kim chếch ra sau 45 độ vào khối cơ nâng vai..."* | ⚠️ **CẢNH BÁO CỰC KỲ NGUY HIỂM**: <br>- Nguy cơ tràn khí màng phổi nếu châm thẳng quá sâu. <br>- Chống chỉ định tuyệt đối cho phụ nữ có thai (kích thích co bóp tử cung). |

## 3. PHÂN TÍCH ĐỘNG HỌC HỆ ĐẠO DẪN
- **Thủ pháp áp dụng**: Động châm (Dynamic Acupuncture).
- **Vận động kết hợp**: Sau khi đắc khí ở Kiên Tỉnh, bác sĩ giữ nhẹ đốc kim và yêu cầu bệnh nhân chủ động xoay khớp vai mở góc 60 độ để giải phóng điểm Cân Kết.

## 4. ĐỀ XUẤT TƯ LIỆU CHO VISUAL STUDIO
- **Ảnh Ingredient đề xuất**: Mặt cắt lát ngang 3D vùng cổ - vai trên mô tả góc kim 45 độ tránh đỉnh màng phổi (giao cho `acupuncture-image-studio`).
- **Prompt Google Flow đề xuất**: Video 3D mô phỏng kim đi qua cơ thang vào cơ nâng vai mà không chạm màng phổi (giao cho `acupuncture-flow-video-director`).
```
