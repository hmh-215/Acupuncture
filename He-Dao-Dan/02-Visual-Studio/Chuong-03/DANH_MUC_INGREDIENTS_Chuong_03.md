# BỘ HÌNH ẢNH NGUYÊN LIỆU GOOGLE FLOW CHƯƠNG 3 (100% TIẾNG VIỆT)
## Hệ Thống Nguyên Liệu Độc Lập Cho Từng Micro-Shot (Shot a - Đại Thể, Shot b - Vi Thể, Shot c - Lâm Sàng)

> **Tài liệu nguồn tổng hợp**: `He-Dao-Dan/01-TongHop/CHUONG_03_NguyenLyChamCuuHeDaoDan.md` & `CHUONG_05_TongHopLuuYVaNguyenLyChamCuu_LamSang.md`  
> **Thư mục lưu trữ nguyên liệu**: `He-Dao-Dan/02-Visual-Studio/Chuong-03/ingredients/`  
> **Tiêu chuẩn thiết kế (Design System)**: Dark Slate Studio `#0f172a`, Đồ họa 3D Unreal Engine 5, Vectơ lực phát sáng neon, **100% Tiếng Việt có dấu chuẩn y khoa**.

---

### I. CƠ CHẾ PHÂN BỔ NGUYÊN LIỆU ĐỘC LẬP CHO TỪNG MICRO-SHOT

Nhằm khắc phục triệt để hiện tượng trùng lặp nguyên liệu giữa các shot con, toàn bộ **18 micro-shots** đã được trang bị **bộ ảnh nguyên liệu chuyên biệt, phân tầng thị giác rõ ràng**:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                 MA TRẬN NGUYÊN LIỆU CHUYÊN BIỆT 18 MICRO-SHOTS              │
├───────────────┬──────────────────────────┬──────────────────────────────────┤
│ PHÂN CẢNH LỚN │ SHOT ID & LOẠI HÌNH ẢNH  │ TÊN FILE NGUYÊN LIỆU CHUYÊN BIỆT │
├───────────────┼──────────────────────────┼──────────────────────────────────┤
│ PHÂN CẢNH 1   │ Shot 1a: Đại thể đối ứng │ Chuong03_Pha01a_Doi_Tuong_Dieu_  │
│ (Tư Duy Cốt   │                          │ Tri_Infographic.jpg              │
│  Lõi Lâm Sàng)│ Shot 1b: Vi thể khoang   │ Chuong03_Pha01b_ViThe_ApLuc      │
│               │          cân mạc >0.016b │ Khoang_ThieuMau.jpg              │
│               │ Shot 1c: Nạn nhân chịu   │ Chuong03_Pha01c_Nan_Nhan_Chiu_   │
│               │          tải & Nối cảnh  │ Tai_Bu_Tru.jpg                   │
├───────────────┼──────────────────────────┼──────────────────────────────────┤
│ PHÂN CẢNH 2   │ Shot 2a: Mất vững giá đỡ │ Chuong03_Pha02a_Mat_Vung_Gia_Do_ │
│ (Nguyên Tắc 1:│                          │ Infographic.jpg                  │
│  Ổn Định      │ Shot 2b: Vi thể Tỏa Châm │ Chuong03_Pha02b_ViThe_ToaCham_   │
│  Giá Đỡ)      │          giải áp cơ học  │ GiaiAp.jpg                       │
│               │ Shot 2c: Thả lỏng bù trừ │ Chuong03_Pha02c_Giai_Phong_Co_   │
│               │          thân trên       │ Siet_Bu_Tru.jpg                  │
├───────────────┼──────────────────────────┼──────────────────────────────────┤
│ PHÂN CẢNH 3   │ Shot 3a: Đại thể hụt tải │ Chuong03_Pha03a_Dong_Tac_Mang_   │
│ (Nguyên Tắc 2:│          giật cục        │ Tai_Hut_Luc.jpg                  │
│  Tiếp Lực &   │ Shot 3b: Vi thể màng cân │ Chuong03_Pha03b_ViThe_CauNoi_    │
│  Đồng Vận)    │          & Actin-Myosin  │ CanMac_ActinMyosin.jpg           │
│               │ Shot 3c: Sóng lực đất    │ Chuong03_Pha03c_Khai_Thong_      │
│               │          nảy lên ngọn    │ Tiep_Luc_Mat_Dat.jpg             │
├───────────────┼──────────────────────────┼──────────────────────────────────┤
│ PHÂN CẢNH 4   │ Shot 4a: Đại thể đối     │ Chuong03_Pha04a_Doi_Trong_Can_   │
│ (Nguyên Tắc 4:│          trọng thăng bằng│ Bang_Truc.jpg                    │
│  Đối Trọng &  │ Shot 4b: Vi thể thụ thể  │ Chuong03_Pha04b_ViThe_PhanTang_  │
│  Tầm Vận Động)│          Golgi & Phân tầng│ TamVanDong.jpg                   │
│               │ Shot 4c: Châm mở phanh   │ Chuong03_Pha04c_Mo_Giang_Giu_    │
│               │          Giằng Giữ       │ Giai_Phong_Bien_Do.jpg           │
├───────────────┼──────────────────────────┼──────────────────────────────────┤
│ PHÂN CẢNH 5   │ Shot 5a: Khớp bản lề kẹt │ Chuong03_Pha05a_Ket_Khop_Ban_Le_ │
│ (Nguyên Tắc 6:│          bó phanh đối vận│ Bo_Phanh.jpg                     │
│  Cân Bằng Động│ Shot 5b: Vi thể tủy sống │ Chuong03_Pha05b_ViThe_UcChe_     │
│  Chủ - Đối)   │          ức chế tương hỗ │ TuongHo_TuySong.jpg              │
│               │ Shot 5c: Tái lập gập duỗi│ Chuong03_Pha05c_Nha_Phanh_Tai_   │
│               │          trơn tru        │ Lap_Bien_Do.jpg                  │
├───────────────┼──────────────────────────┼──────────────────────────────────┤
│ PHÂN CẢNH 6   │ Shot 6a: Bóc tách 5 thế  │ Chuong03_Pha06a_Quy_Chieu_5_The_ │
│ (Nguyên Tắc 7:│          xoay & ngửa     │ Ca_Vai.jpg                       │
│  Quy Chiếu 5  │ Shot 6b: Vi thể mặt trượt│ Chuong03_Pha06b_ViThe_MatTruoc_  │
│  Thế Ca Mẫu)  │          cân mạc lồng ngực│ CanMac_LongNguc.jpg              │
│               │ Shot 6c: Châm gián tiếp  │ Chuong03_Pha06c_Cham_Gian_Tiep_  │
│               │          khớp vai mở toang│ Mo_Bien_Do_Vai.jpg               │
└───────────────┴──────────────────────────┴──────────────────────────────────┘
```

---

### II. MÔ TẢ CHI TIẾT CÁC TÁC PHẨM VI THỂ & ĐỘNG HỌC MỚI NÂNG CẤP

#### 1. `Chuong03_Pha01b_ViThe_ApLucKhoang_ThieuMau.jpg`
- **Chủ đề**: Cận cảnh vi thể khoang cân mạc và tắc nghẽn mao mạch do áp lực > 0.016 bar.
- **Hình ảnh**: Macro phóng đại các bó sợi cơ bị xoắn siết kẹp nén bẹp các ống vi mao mạch máu. Các thụ thể cảm thụ đau (*Nociceptors*) phát xung báo động đỏ rực do thiếu máu và ứ đọng acid lactic. Hộp thông số y khoa: `Áp lực khoang > 0.016 bar`.

#### 2. `Chuong03_Pha02b_ViThe_ToaCham_GiaiAp.jpg`
- **Chủ đề**: Cận cảnh kim Tỏa Châm mở vi lỗ giải áp cơ học tại khớp cùng chậu.
- **Hình ảnh**: Mũi kim châm cứu đâm vào ranh giới bọc mạc sâu, giải phóng áp lực nội mô (< 0.016 bar); mao mạch lập tức bung mở với dòng hồng cầu lưu chuyển tự do; các làn sóng xanh lam và xanh ngọc tỏa lan khóa chặt diện khớp lỏng lẻo.

#### 3. `Chuong03_Pha03b_ViThe_CauNoi_CanMac_ActinMyosin.jpg`
- **Chủ đề**: Cận cảnh cấu trúc mạng lưới cân mạc liên hoàn và cầu trượt Actin-Myosin.
- **Hình ảnh**: Mạng lưới sợi collagen dày đặc kết nối giữa cơ răng trước, cơ trám và cơ chéo bụng phát sáng dòng sức căng; phóng đại sarcomere với các đầu myofilament actin và myosin lướt trượt đồng nhịp dưới xung thần kinh vận động.

#### 4. `Chuong03_Pha04b_ViThe_PhanTang_TamVanDong.jpg`
- **Chủ đề**: Phân tầng tầm vận động và cấu trúc thụ thể gân Golgi (GTO).
- **Hình ảnh**: Giải phẫu mỏm quạ đai vai chỉ rõ vùng khởi động tầm gần và dải cáp hãm cơ ngực bé ở tầm xa; lát cắt hiển vi bộc lộ bó collagen được bao bọc bởi sợi thần kinh thụ thể gân Golgi phóng điện điều hòa sức căng.

#### 5. `Chuong03_Pha05b_ViThe_UcChe_TuongHo_TuySong.jpg`
- **Chủ đề**: Lát cắt 3D tủy sống mô phỏng cung phản xạ ức chế tương hỗ (Reciprocal Inhibition).
- **Hình ảnh**: Xung cảm giác từ mũi kim châm ở cơ tam đầu truyền vào sừng sau tủy sống, kích hoạt nơ-ron trung gian ức chế (màu cyan) ra lệnh cho nơ-ron vận động alpha ngắt xung co thắt, phát sóng xanh lục làm dịu cơ đối vận.

#### 6. `Chuong03_Pha06b_ViThe_MatTruoc_CanMac_LongNguc.jpg`
- **Chủ đề**: Mặt trượt màng cân mạc giữa xương bả vai và khung lồng ngực.
- **Hình ảnh**: Đối chiếu trực quan: Vùng cân mạc bị xơ dính, khô cằn thiếu chất bôi trơn kìm kẹp xương bả vai ↔ Vùng được châm cứu giải phóng với dòng dịch nhờn Hyaluronic Acid óng ánh màu cyan, tạo mặt trượt không ma sát cho xương bả vai lướt êm ái trên lồng ngực.
