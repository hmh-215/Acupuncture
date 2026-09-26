---
name: acupuncture-source-collector
description: >-
  Tiếp nhận các tài liệu châm cứu & YHCT do người dùng cung cấp (sách, giáo trình,
  tài liệu chuyên khảo, PDF), tự động phân tích cấu trúc để gắn tiền tố chuẩn
  (GOC-KINHDIEN_, GOC-GIAOTRINH_, GOC-ATLAS_, QD-PHACDO_, NC-LAMSNANG_), phân bổ
  vào thư mục chuyên đề tương ứng, và hỗ trợ nạp nguồn vào NotebookLM (qua CLI nlm
  hoặc hướng dẫn nạp giao diện) khống chế an toàn 45 nguồn/notebook. Tất cả ghi chú
  và nhật ký quản lý hoàn toàn bằng Tiếng Việt. Dùng skill này khi người dùng "đưa
  tài liệu châm cứu mới vào", "phân loại sách châm cứu", hoặc "tổ chức kho tài
  liệu chuyên đề".
---

# Acupuncture Source Collector (Tiếp Nhận & Tổ Chức Tài Liệu Châm Cứu 100% Tiếng Việt)

## 📌 Vai Trò Cốt Lõi
Skill này tập trung **100% vào việc tiếp nhận và xử lý tài liệu do người dùng tự cung cấp** (không tự ý tìm kiếm ngoài phạm vi cho phép). Nhiệm vụ là chuẩn hóa, phân loại khoa học và đưa tài liệu vào đúng vị trí trong hệ thống bằng **Tiếng Việt** chuẩn mực để phục vụ cho 2 bước quan trọng phía sau: **Tổng hợp tri thức** và **Visual Studio Prompting**.

---

## 📂 1. Cấu Trúc Phân Loại Tiền Tố Chuẩn

Mọi tài liệu người dùng đưa vào (kéo thả vào thư mục `TaiLieu-DauVao/` hoặc đường dẫn chỉ định) sẽ được tự động nhận diện và gắn tiền tố phân loại:

| Tiền tố | Thể loại tài liệu | Ví dụ thực tế |
|---|---|---|
| `GOC-KINHDIEN_` | Sách kinh điển, tài liệu chuyên khảo trường phái | `GOC-KINHDIEN_DoSinhDuong_YeuLuocChamCuuHeDaoDan_NgoTienHuong.pdf` |
| `GOC-GIAOTRINH_` | Giáo trình đào tạo chính quy của các trường Y | `GOC-GIAOTRINH_DHYDTPHCM_ChamCuuHoc.pdf` |
| `GOC-ATLAS_` | Atlas huyệt vị, sơ đồ kinh lạc & mốc giải phẫu | `GOC-ATLAS_WHO_StandardAcupunctureNomenclature.pdf` |
| `QD-PHACDO_` | Quy trình kỹ thuật & Phác đồ điều trị Bộ Y tế / WHO | `QD-PHACDO_BYT_ChamCuuPhucHoiLietVII.pdf` |
| `NC-LAMSNANG_` | Báo cáo thử nghiệm, nghiên cứu cơ chế sinh học | `NC-LAMSNANG_CoCheGiamDauCuaDienCham_2023.pdf` |

---

## 🗂️ 2. Quy Trình Tiếp Nhận & Sắp Xếp Nguồn

1. **Quét tài liệu đầu vào**:
   - Đọc tiêu đề, phần giới thiệu và mục lục tài liệu người dùng đưa vào.
   - Nhận diện chuyên đề: Hệ kinh lạc cụ thể (Phế, Vị, Tỳ...), Hệ thống cơ học/trường phái (Hệ Đạo Dẫn, Kinh Cân...), hoặc Mặt bệnh lâm sàng (Liệt mặt, Đau thần kinh tọa, Thoái hóa khớp...).
2. **Tạo thư mục chuyên đề**:
   - Lưu trữ tại: `<TenChuyenDe>/00-Nguon/<TenTienTo_TenTaiLieu>.pdf`
3. **Nạp vào NotebookLM**:
   - Nếu CLI `nlm` hoạt động: Chạy `nlm source add <NotebookID> --file "<DuongDanTuyetDoi>" --wait --json`.
   - Nếu người dùng tự tải trên web: Hướng dẫn người dùng kéo file vào đúng Notebook tương ứng.
   - Quản lý hạn mức an toàn: **Tối đa 45 nguồn / Notebook**.
4. **Ghi nhật ký hệ thống bằng Tiếng Việt**:
   - Cập nhật thông tin vào `_QuanLy/nhat-ky-nguon.csv` và `_QuanLy/danh-muc-kinh-lac-benh-hoc.md`.
