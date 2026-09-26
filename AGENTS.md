# QUY ĐỊNH HỆ THỐNG AGENT & BỘ SKILLS CHUYÊN NGÀNH DỰ ÁN CHÂM CỨU

## 🇻🇳 1. NGUYÊN TẮC NGÔN NGỮ TUYỆT ĐỐI: 100% TIẾNG VIỆT

1. **Ngôn ngữ phản hồi & Toàn bộ tài liệu**:
   - Tất cả tài liệu tổng hợp (`.md`), báo cáo, phân tích cơ sinh học, giáo trình, kịch bản video storyboard, audio script BẮT BUỘC viết hoàn toàn bằng **Tiếng Việt** chuẩn y khoa (có dấu đầy đủ, chuẩn mực ngữ pháp và từ vựng chuyên ngành Y học cổ truyền & Y học hiện đại).
   - Thuật ngữ quốc tế/tiếng Anh (như *Myofascial Chains, Trigger Point, Eccentric contraction...*) chỉ được để trong ngoặc đơn đi kèm sau thuật ngữ Tiếng Việt chuẩn (*Chuỗi cơ cân, Điểm Cân Kết, Co cơ lệch tâm...*).

2. **Chỉ thị tạo ảnh & Chữ trên ảnh (AI Image Generation & Infographics)**:
   - Khi sử dụng công cụ sinh ảnh (`generate_image`, Google Imagen 3, Midjourney...):
   - **Tất cả các nhãn chữ, tiêu đề, chú thích giải phẫu, mũi tên chỉ dẫn, thông số hiển thị trực tiếp trên hình ảnh (Text Labels, Infographics, Headers, Annotations, Callouts, Legend) BẮT BUỘC PHẢI BẰNG TIẾNG VIỆT CÓ DẤU CHUẨN XÁC.**
   - Trong câu prompt gửi cho mô hình sinh ảnh, phải luôn có chỉ thị nghiêm ngặt:
     `"All text, title, labels, annotations, callouts, and medical diagrams MUST be rendered strictly in VIETNAMESE language with proper diacritics/accents: e.g. [Liệt kê chính xác các cụm từ tiếng Việt cần hiển thị]. Absolutely no English text on the graphic labels."`

---

## 🎯 2. TIÊU CHUẨN ĐỊNH VỊ GIẢI PHẪU CHÍNH XÁC TUYỆT ĐỐI (ANATOMICAL PRECISION)

1. **Tuyệt đối cấm sử dụng mô tả mơ hồ**: Không được dùng các cụm từ chung chung như: *"châm vào vai"*, *"châm ở lưng"*, *"chỗ bắp thịt"*, *"vùng cổ"*.
2. **Bắt buộc định danh chính xác 100% theo giải phẫu y khoa học hiện đại kết hợp mã huyệt WHO**:
   - **Tên cơ cụ thể**: Cơ thang (*M. trapezius*), cơ nâng vai (*M. levator scapulae*), cơ trám lớn/bé (*M. rhomboideus major/minor*), cơ dựng sống (*M. erector spinae*), cơ nhị đầu cánh tay (*M. biceps brachii*)...
   - **Mốc xương & khớp định vị sống**: Mỏm cùng vai (*Acromion*), gai xương bả vai (*Spina scapulae*), mỏm quạ (*Processus coracoideus*), rãnh gian củ (*Sulcus intertubercularis*), góc trên/dưới xương bả vai, mỏm gai đốt sống C7/D1-D12/L1-L5...
   - **Mạch máu & Thần kinh liên quan**: Động mạch cổ ngang, động mạch trên vai, rễ thần kinh gai sống, chuỗi hạch giao cảm, đỉnh màng phổi...
   - **Mã hóa quốc tế**: Tên Hán Việt + Mã chuẩn WHO (ví dụ: *Kiên Tỉnh - GB-21*, *Phế Du - BL-13*, *Hợp Cốc - LI-4*).

---

## 🏗️ 3. KIẾN TRÚC BỘ 6 SKILLS CHUYÊN BIỆT CỦA DỰ ÁN

Hệ thống được tổ chức thành một chuỗi dây chuyền xử lý tri thức y khoa hoàn chỉnh:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                 CHUỖI DÂY CHUYỀN XỬ LÝ TRI THỨC DỰ ÁN CHÂM CỨU               │
└─────────────────────────────────────────────────────────────────────────────┘
                                  │
       ┌──────────────────────────┴──────────────────────────┐
       ▼                                                     ▼
 [ ĐẦU VÀO SÁCH / PDF ]                                [ ĐẦU VÀO VIDEO LÂM SÀNG ]
       │                                                     │
       ▼                                                     ▼
 1. acupuncture-source-collector                       2. acupuncture-video-clinical-extractor
 (Phân loại, gắn tiền tố, nạp NLM)                     (Bóc tách hành động, mốc giải phẫu, transcript)
       │                                                     │  ⚠️ CHỈ nhận file từ TaiLieu-DauVao/
       └──────────────────────────┬──────────────────────────┘
                                  │
                                  ▼
                    3. acupuncture-knowledge-synthesizer
                    (Tổng hợp tri thức, kiểm chứng cơ sinh học & an toàn lâm sàng)
                                  │
                   ┌──────────────┴──────────────┐
                   ▼                              ▼
     4. acupuncture-image-studio    5. acupuncture-flow-video-director
     (Xưởng Ingredients 3D         (Đạo diễn Storyboard & Prompts
      100% Tiếng Việt)              Voice-over trên Google Flow)
                   │                              │
                   └──────────────┬──────────────┘
                                  │
                                  ▼
                    6. acupuncture-interactive-web-studio
                    (Giao diện tương tác HTML/CSS/JS giáo dục y khoa)
                    Claude → Kiến trúc hệ thống | Gemini → Coding module
```

1. **`acupuncture-source-collector`**:
   - Tiếp nhận, phân loại và gắn tiền tố nguồn tài liệu dạng văn bản/sách (`GOC-KINHDIEN_`, `GOC-GIAOTRINH_`, `GOC-ATLAS_`, `QD-PHACDO_`, `NC-LAMSNANG_`). Quản lý nạp vào NotebookLM (tối đa 45 nguồn/notebook).

2. **`acupuncture-video-clinical-extractor` (CHUYÊN BIỆT BÓC TÁCH VIDEO)**:
   - Tiếp nhận các video bài giảng, video thị phạm lâm sàng dài (file MP4/MKV/AVI/MOV đặt trong `TaiLieu-DauVao/`). **TUYỆT ĐỐI KHÔNG tự ý tải video từ YouTube hay nguồn trực tuyến.**
   - Bóc tách đồng thời: Hành động thao tác lâm sàng thị giác + Transcript lời giảng âm thanh.
   - Định danh chính xác 100% mốc giải phẫu nông - sâu, góc châm, độ sâu, phản ứng đắc khí và cảnh báo an toàn y khoa. Xuất bản file `01-TongHop/VIDEO_TRICHXUAT_<TenVideo>.md`.

3. **`acupuncture-knowledge-synthesizer`**:
   - Bộ não phân tích y khoa: Kết hợp tri thức từ sách và dữ liệu bóc tách từ video để tổng hợp thành chuyên luận chuyên sâu `01-TongHop/CHUONG_xx_...md`.

4. **`acupuncture-image-studio`**:
   - Xưởng sản xuất ảnh giải phẫu 3D, infographic cơ sinh học, mặt cắt an toàn, khung vi thể có nhãn Tiếng Việt. Sản xuất tài sản nguyên liệu (**Ingredients**) lưu vào `Chuong-XX/ingredients/`.
   - **BẮT BUỘC TUÂN THỦ QUY CHUẨN ĐẶT TÊN FILE VỚI TIỀN TỐ**:
     `Chuong<XX>_Pha<YY><shot>_<MoTaNgan>.jpg`  
     *Ví dụ*: `Chuong01_Pha01a_Chuoi_Dong_Hoc_Infographic.jpg`, `Chuong01_Pha02b_ViThe_Actin_Myosin_NenMach.jpg`.

5. **`acupuncture-flow-video-director`**:
   - Đạo diễn video y khoa: Xây dựng Storyboard chi tiết từng giây theo **Quy ước Hệ Thống Micro-Shots (Shot a, Shot b, Shot c)**, soạn thảo Prompts Tiếng Việt có Voice-over tốc độ chậm cho Google Flow (`labs.google/fx/tools/flow`), thiết kế **Shot Nối chuyển tiếp (Transition Prompts)**, quản lý video tại `Chuong-XX/videos/` và vận hành vòng lặp phản hồi.

6. **`acupuncture-interactive-web-studio` (GIAO DIỆN TƯƠNG TÁC WEB)**:
   - Thiết kế, hệ thống và tổ chức các trang web tương tác (HTML/CSS/JavaScript) phục vụ giáo dục nội dung châm cứu & cơ sinh học.
   - Kế thừa Design System từ template chuẩn `hoat_hoa_pha1_co_huong_tam.html` (Dark Slate, CSS variables, Canvas 2D, Mermaid, SpeechSynthesis).
   - Sản phẩm lưu tại `03-Interactive-Web/Chuong-XX/`.

---

## 🎨 4. TIÊU CHUẨN THIẾT KẾ INGREDIENT & QUY CHUẨN ĐẶT TÊN FILE

### A. Quy chuẩn đặt tên file nguyên liệu (Ingredients Naming Convention):
Tất cả các file ảnh nguyên liệu lưu trữ tại `He-Dao-Dan/02-Visual-Studio/Chuong-XX/ingredients/` bắt buộc phải có tiền tố đồng nhất để quản lý dự án trên Google Flow:
```text
Chuong<XX>_Pha<YY><shot>_<MoTaNganGiaiPhau>.jpg
```
- `<XX>`: Số thứ tự chương (ví dụ: `01`, `02`, `03`...).
- `<YY>`: Số thứ tự pha hoặc phân cảnh lớn (ví dụ: `01`, `02`, `03`...).
- `<shot>`: Phân đoạn con (`a` = Đại thể/Động học, `b` = Cận cảnh vi thể tế bào, `c` = Lâm sàng & Shot nối).
- `<MoTaNganGiaiPhau>`: Tên mô tả ngắn gọn, không dấu, ngăn cách bằng gạch dưới.
- *Ví dụ mẫu*:
  - `Chuong01_Pha01a_Chuoi_Dong_Hoc_Infographic.jpg`
  - `Chuong01_Pha02a_Co_Huong_Tam_Infographic.jpg`
  - `Chuong01_Pha02b_ViThe_Actin_Myosin_NenMach.jpg`
  - `Chuong01_Pha03b_ViThe_ThuThe_Golgi_GTO.jpg`

### B. Tiêu chuẩn thiết kế (Design System):
1. **Nền tối Dark Slate Studio y khoa**: `#0f172a` tạo độ tương phản cao, làm nổi bật cấu trúc giải phẫu.
2. **Tiêu đề phân cảnh đỉnh**: In hoa, đậm nét, Tiếng Việt có dấu.
3. **Giải phẫu 3D cơ sinh học**: Render chân thực (Unreal Engine 5, 8k), mô tả rõ chuỗi cơ đối ứng, cơ co ngắn, phình to, kéo dài hoặc khóa trục.
4. **Vectơ lực phát sáng**: Mũi tên đỏ (`#ef4444`) và vàng (`#f59e0b`) chỉ rõ hướng phát lực hoặc hãm lực.
5. **Khung tròn kính lúp vi thể (Circular Inset)** hoặc **Ảnh vi thể chuyên biệt**: Phóng đại cấu trúc sợi Actin-Myosin, mao mạch máu, áp lực khoang cân mạc hoặc thụ thể Golgi.
6. **Bảng Chú giải Ký hiệu (Legend Box)**: Nằm bên phải với tiêu đề `CHÚ GIẢI KÝ HIỆU` gồm các icon màu và định nghĩa 100% Tiếng Việt có dấu.

---

## 🎞️ 5. QUY ƯỚC HỆ THỐNG MICRO-SHOTS & SHOT NỐI GOOGLE FLOW

Nhằm khắc phục giới hạn clip ngắn 8s của Google Flow và đảm bảo tốc độ bài giảng chậm rãi, sư phạm, chuyên sâu:

1. **Quy tắc chia 3 Shot con cho mỗi Phân cảnh lớn (Mỗi shot 8 – 10s, tổng ~25 – 30s/cảnh)**:
   - **Shot a (Đại thể & Chuỗi động học)**: Cử động đại thể của khớp và tương tác đa cơ (Chủ vận ↔ Đối vận).
   - **Shot b (Cận cảnh Vi thể tế bào)**: Phóng đại hiển vi cấu trúc vi mô (cầu trượt Actin-Myosin, thụ thể Golgi, áp lực khoang cân mạc 0.016 bar, lòng mao mạch).
   - **Shot c (Hệ quả Lâm sàng & Shot Nối Chuyển Tiếp)**: Điểm Cân Kết, dòng lực, thao tác châm và chuyển động camera tiếp nối.

2. **Kỹ thuật Shot Nối Liền Mạch (Seamless Transition)**:
   - Trong mỗi prompt, bắt buộc phải có chỉ thị camera nối cảnh:
     - *Shot a ➔ Shot b*: Máy quay đẩy tới gần (Push-in) từ đại thể vào khung vi thể.
     - *Shot b ➔ Shot c*: Máy quay lùi nhẹ (Pull-out) trở lại cơ thể để thấy điểm bệnh lý hoặc chuyển động chuẩn bị.
     - *Shot c ➔ Shot a của cảnh sau*: Sử dụng **Match-Cut** (tư thế cuối của shot trước khớp với tư thế đầu của shot sau) hoặc **Camera Continuity** (cùng hướng lia máy) để khi người dùng ghép file `.mp4` con lại với nhau, video sẽ tạo thành một mạch phim duy nhất chuyển động mượt mà, không giật hình.
---

## 📜 6. QUY CHUẨN SOẠN THẢO PROMPT GOOGLE FLOW DẠNG VĂN BẢN LIỀN MẠCH

Nhằm tối ưu hóa trải nghiệm người dùng trên [Google Flow](https://labs.google/fx/tools/flow), file tài liệu kịch bản câu lệnh `PROMPTS_FLOW_Chuong_XX.md` **BẮT BUỘC TUÂN THỦ**:

1. **Khung trình bày chuẩn từng shot**:
   - `### 📌 Shot <YY><shot>: <Tên Phân Đoạn>`
   - `- **Ảnh Ingredient nạp vào**: Chuong<XX>_Pha<YY><shot>_<MoTa>.jpg`
   - `- **Gán Tag trong Flow**: @Ingredient1`
   - Khối mã code ` ```text ` chứa đoạn Prompt.

2. **Tiêu chuẩn đoạn Prompt liền mạch (Full Continuous Paragraph)**:
   - **TUYỆT ĐỐI KHÔNG DÙNG BULLET POINTS** (`-`, `*`, `1.`, `2.`, `Hành động:`, `Góc máy:`, `Lời bình:`) bên trong khối code prompt.
   - Toàn bộ nội dung phải được viết thành **MỘT ĐOẠN VĂN DUY NHẤT, LIỀN MẠCH**, sẵn sàng để người dùng nhấn Copy và dán thẳng vào ô câu lệnh của Flow.
   - Cấu trúc đoạn văn: Mở đầu bằng `Bắt đầu từ hình ảnh nguyên liệu @Ingredient1, [chuyển động giải phẫu và thớ cơ]...` ➔ Mũi tên lực phát sáng ➔ Chuyển động camera có tính nối cảnh (Match-cut, Push-in, Pan) ➔ Đồ họa y khoa 3D trên nền Dark Slate (#0f172a) ➔ Kết thúc bằng lời bình Voice-over: `Lời bình thuyết minh Voice-over bằng Tiếng Việt đọc giọng [trầm ấm/y khoa/điềm tĩnh], chậm rãi: "[Câu thoại ngắn gọn 15 - 25 từ]."`.
