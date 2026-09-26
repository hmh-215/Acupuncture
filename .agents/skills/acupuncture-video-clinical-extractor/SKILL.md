---
name: acupuncture-video-clinical-extractor
description: >-
  Chuyên biệt hóa 100% việc bóc tách nội dung, hành động lâm sàng và transcript giải
  phẫu y khoa chuẩn xác từ các video bài giảng thực hành châm cứu dài. Đọc hiểu đa
  phương thức (vừa quan sát thao tác thị giác, vừa nghe âm thanh thuyết minh). Chuyển
  hóa các thao tác châm cứu sống thành hồ sơ giải phẫu chi tiết (mốc xương, cơ, mạch
  máu, thần kinh, góc châm, độ sâu, tiêu chuẩn đắc khí) và cảnh báo an toàn y khoa.
  Xuất bản file Markdown (.md) chuẩn y khoa 100% Tiếng Việt làm đầu vào cho hệ thống.
---

# Acupuncture Video Clinical Extractor (Bóc Tách Hành Động Lâm Sàng & Transcript Giải Phẫu Từ Video)

## 📌 Vai Trò Cốt Lõi
Skill này đóng vai trò là **Chuyên gia Giám định & Bóc tách Lâm sàng Đa phương thức**:
- **Tiếp nhận video thực hành dài**: Các bài giảng lâm sàng, video thị phạm châm cứu thực tế của chuyên gia.
  - ⚠️ **CHỈ CHẤP NHẬN FILE CỤC BỘ** đặt trong thư mục `TaiLieu-DauVao/` (định dạng MP4, MKV, AVI, MOV).
  - **TUYỆT ĐỐI KHÔNG tự ý tải video từ YouTube hay bất kỳ nguồn trực tuyến nào.** Người dùng sẽ tự đặt file video vào `TaiLieu-DauVao/` và gửi prompt yêu cầu xử lý kèm tên file cụ thể.
  - Khi nhận yêu cầu, kiểm tra sự tồn tại của file tại đường dẫn `D:\huong\antigravity\châm cứu\TaiLieu-DauVao\<TenFile>` trước khi xử lý.
- **Phân tích đồng thời 2 luồng dữ liệu**:
  1. **Luồng thị giác (Visual Actions)**: Quan sát thao tác sờ nắn mốc giải phẫu sống, cách căng da, hướng kim, góc châm ($15^\circ$, $45^\circ$, $90^\circ$), độ sâu kim, thao tác vê kim/bổ tả và phản ứng cơ học (co giật cơ cục bộ - local twitch response).
  2. **Luồng âm thanh (Audio Transcript)**: Nghe lời giảng giải của thầy thuốc, câu hỏi và phản hồi cảm giác của bệnh nhân (tê, tức, nặng, chướng).
- **TIÊU CHUẨN GIẢI PHẪU CHÍNH XÁC TUYỆT ĐỐI (Anatomical Precision Standard)**:
  - **Tuyệt đối không dùng từ ngữ định vị mơ hồ** (như: *"châm vào vai"*, *"châm ở lưng"*, *"chỗ cơ bắp"*).
  - **Bắt buộc định danh chính xác 100% theo giải phẫu y khoa học hiện đại kết hợp mã huyệt WHO**:
    - *Tên cơ*: Cơ thang (*M. trapezius*), cơ nâng vai (*M. levator scapulae*), cơ trám lớn (*M. rhomboideus major*), cơ trên gai (*M. supraspinatus*)...
    - *Mốc xương/khớp*: Mỏm cùng vai (*Acromion*), gai bả vai (*Spina scapulae*), rãnh gian củ (*Sulcus intertubercularis*), mỏm quạ (*Processus coracoideus*)...
    - *Mạch máu & Thần kinh lân cận*: Động mạch cổ ngang, bó mạch trên vai, rễ thần kinh gai sống C5-C6...
    - *Mã hóa huyệt quốc tế*: Tên Hán Việt + Mã WHO (ví dụ: *Kiên Tỉnh - GB-21*, *Khuyết Bồn - ST-12*, *Hợp Cốc - LI-4*).

---

## 🧭 Khung Bóc Tách Video Lâm Sàng Chuẩn (6 Thành Phần Bắt Buộc)

Mỗi video được phân tích và chuyển hóa thành tài liệu Markdown chuẩn lưu tại:
`<TenChuyenDe>/01-TongHop/VIDEO_TRICHXUAT_<TenVideo>.md`

### 1. Bảng Ma Trận Phân Đoạn Thời Gian (Timestamped Clinical Matrix)
Cấu trúc bảng chi tiết từng phân đoạn trong video:

| Mốc thời gian | Thao tác bác sĩ quan sát được | Mốc giải phẫu thực thể chính xác | Huyệt vị & Góc/Độ sâu châm | Phản ứng Đắc khí & Vận động | Transcript lời giảng chuẩn hóa (100% Tiếng Việt) | Cảnh báo an toàn y khoa |
|---|---|---|---|---|---|---|
| **MM:SS - MM:SS** | - Tư thế người bệnh <br>- Sờ nắn tìm mốc <br>- Thao tác căng da, đâm kim | Tên mốc xương, gân, lớp cơ nông - sâu tiếp cận | Tên huyệt (Mã WHO), góc châm (thẳng/xiên), độ sâu (thốn/cm) | Cảm giác bệnh nhân mô tả, hiện tượng co giật bó cơ (Twitch) | Lời thuyết minh được biên tập lại chuẩn ngữ pháp và thuật ngữ y khoa | Nguy cơ phạm màng phổi, động mạch, tạng hoặc huyệt kỵ thai |

---

### 2. Định Vị Giải Phẫu Nông — Sâu Theo Từng Lớp (Layer-by-Layer Anatomy)
Đối với từng mũi kim xuất hiện trong video, bóc tách cấu trúc giải phẫu từ ngoài vào trong:
- **Lớp 1 (Nông)**: Da, mô dưới da, mạc nông, nhánh thần kinh cảm giác nông, tĩnh mạch nông.
- **Lớp 2 (Trung gian)**: Lớp cơ vỏ (ví dụ: cơ thang, cơ lưng rộng), nhánh thần kinh vận động tương ứng.
- **Lớp 3 (Sâu - Đích đến của đắc khí)**: Lớp cơ lõi/sâu (ví dụ: cơ trám, cơ dựng sống, cơ nhiều chân), bao gân, màng xương.
- **Vùng nguy hiểm cần né tránh**: Đỉnh phổi, màng phổi đỉnh (nguy cơ tràn khí), bó mạch thần kinh lớn.

---

### 3. Phân Tích Động Học & Thao Tác Đặc Hiệu Hệ Đạo Dẫn
Nếu video thực hành theo phương pháp Hệ Đạo Dẫn:
- Xác định rõ thủ pháp trong video:
  - **Động châm (Dynamic Acupuncture)**: Bác sĩ giữ đốc kim ở huyệt nào? Người bệnh được chỉ định tự vận động khớp nào? Biên độ mở rộng bao nhiêu độ?
  - **Tỏa châm (Locking Acupuncture)**: Kim châm vào điểm neo nào để khóa ổn định giá đỡ chịu tải?
  - **Lưu châm (Needle Retention)**: Độ sâu xuyên tầng cơ lõi và thời gian lưu.
- Nhận diện 4 pha vận động của cơ trong video: Co hướng tâm, Căng giằng giữ, Mở không tán, hay Buông lỏng.

---

### 4. Transcript Lời Giảng & Khẩu Lệnh (Biên Tập Chuẩn Y Khoa)
- Chuyển toàn bộ lời giảng, hướng dẫn và khẩu lệnh trong video thành văn bản Tiếng Việt chuẩn mực.
- Loại bỏ các từ đệm, từ lặp thừa của văn nói, chuẩn hóa các từ địa phương hoặc tiếng lóng thành danh từ y khoa chính thống.
- Giữ nguyên các lưu ý lâm sàng đặc thù mà giảng viên nhắc nhở trong video.

---

### 5. Rà Soát An Toàn Lâm Sàng (Clinical Safety Verification)
- Đánh giá trực tiếp thao tác của giảng viên trong video:
  - Góc châm có đúng chuẩn sách giáo khoa không?
  - Hướng kim có hướng về phía màng phổi hoặc động mạch lớn không?
  - Thao tác sát khuẩn có đúng nguyên tắc vô khuẩn xoắn ốc từ trong ra ngoài không?
  - Đưa ra khuyến nghị an toàn bổ sung cho học viên khi thực hành theo video.

---

### 6. Cung Cấp Đầu Vào Cho Visual Studio & Google Flow
- Từ các thao tác then chốt được trích xuất trong video:
  - Gợi ý danh mục ảnh cần tạo cho `acupuncture-image-studio` (mặt cắt 3D mô phỏng lại mũi kim vừa châm).
  - Soạn sẵn ý tưởng Storyboard cho `acupuncture-flow-video-director` để dựng lại hoạt họa 3D mô phỏng góc kim an toàn.
