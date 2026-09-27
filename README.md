# Ứng Dụng 3D Hệ Cơ Bắp & Huyệt Vị Châm Cứu
### (3D Muscular System & Acupuncture Interactive Web Suite)

Ứng dụng web 3D tương tác chuyên sâu kết hợp giữa **Y học cổ truyền** (Học thuyết 12 Kinh Cân, Điểm Cân Kết & Tiêu chuẩn định vị huyệt WHO) và **Giải phẫu học — Cơ sinh học hiện đại** (Chuỗi cơ cân Myofascial Chains, Động lực học cử động & Phân vai cơ bắp).

---

## 🌟 TÍNH NĂNG NỔI BẬT

### 1. Hai Chế Độ Tương Tác Y Khoa Độc Lập
- **🏃 Chế Độ 1: Động Học Cử Động (Kinematic Movement Analysis)**:
  - Mô phỏng các cử động giải phẫu và tư thế tượng động học (*Statue Poses*) chuẩn sinh lý: *Nâng tay qua đầu (Overhead Reach), Xoay người (Trunk Rotation), Dáng đi (Walking Gait), Cúi gập lưng (Forward Bending), Thế bắn cung Đạo dẫn (Archer Pull), Gập khuỷu tay...*
  - Tự động phân tích và highlight các nhóm cơ tham gia theo 4 vai trò y khoa chuẩn mực:
    - 🔴 **Chủ vận (Agonist)**: Phát lực chính sinh công.
    - 🔵 **Đối vận (Antagonist)**: Co ly tâm kiểm soát và hãm lực.
    - 🟠 **Hiệp đồng (Synergist)**: Trợ lực và hiệp đồng cử động.
    - 🟢 **Ổn định (Stabilizer)**: Khóa gốc chi và giữ vững trục khớp.
  - Các cơ không tham gia cử động được thể hiện bằng **Màu Xám Slate Trung Tính** đục 100% (*Opaque Solid*), giúp các nhóm cơ chủ vận và đối vận nổi bật rõ ràng, không bị chìm hay lẫn màu.

- **⚡ Chế Độ 2: Trị Liệu & Chuỗi Kinh Cân (Myofascial Pain & Acupuncture Chain)**:
  - Khảo sát các hội chứng cơ đau và điểm kích hoạt (*Trigger Points / Điểm Cân Kết*) phổ biến trên lâm sàng:
    1. *Hội chứng Cổ Vai Gáy (Co cứng Cơ Thang trên & Cơ Nâng vai)*.
    2. *Hội chứng Chóp Xoay & Viêm Gân Vai (Cơ Trên gai & Dưới gai)*.
    3. *Hội chứng Cơ Hình Lê & Đau Thần Kinh Tọa (Chèn ép dây thần kinh tọa)*.
    4. *Đau Thắt Lưng Cấp & Co Cứng Cơ Dựng Sống*.
    5. *Hội chứng Ống Cổ Tay & Co Cứng Gân Gập Cẳng Tay*.
    6. *Đau Mặt Trước Gối & Co Rút Cơ Tứ Đầu Đùi*.
  - Tự động nhận diện và highlight:
    - 🔴 **Vùng cơ đau đích / Trigger Point** (Màu đỏ Crimson cảnh báo).
    - 🟡 **Chuỗi cơ cân liên đới** theo đường truyền lực giải phẫu (*Myofascial Chains*) & Kinh Cân YHCT.
  - **Hệ thống Điểm Huyệt 3D (Interactive 3D Acupoint Markers)**:
    - Hiển thị các điểm cầu phát sáng nhịp tim trực tiếp trên tọa độ 3D của cơ thể (*Kiên Tỉnh GB-21, Phong Trì GB-20, Thiên Tông SI-11, Hoàn Khiêu GB-30, Thận Du BL-23, Hợp Cốc LI-4, Ủy Trung BL-40, Túc Tam Lý ST-36...*).
    - Xem chi tiết: Mốc xương giải phẫu, Độ sâu châm an toàn (mm), Hướng đâm kim, Cảm giác Đắc Khí mong muốn và **Cảnh báo an toàn y khoa** (nguy cơ tràn khí màng phổi, chọc tạng, huyệt kỵ thai phụ).

---

### 2. Hai Hệ Thống Giải Phẫu Cốt Lõi
- 💪 **Hệ Cơ Thật (Muscular System)**: Dựng từ dữ liệu giải phẫu thực tế Z-Anatomy với hàng trăm thớ cơ riêng biệt. Thanh trượt Opacity điều chỉnh độ mờ linh hoạt từ 5% đến 100% (ở mức 100% mô hình hoàn toàn đục, người dùng có thể xoay 360° quan sát khối cơ chân thực).
- 🧠 **Hệ Thần Kinh (Nervous System)**: Toggle bật/tắt độc lập, hiển thị mạng lưới thần kinh tủy sống và ngoại biên màu vàng neon phát sáng.

---

## 🚀 HƯỚNG DẪN CHẠY ỨNG DỤNG LOCAL

Do trình duyệt bảo mật chặn tính năng tải file mô hình 3D (`.fbx`) và dữ liệu (`.json`) qua giao thức `file://`, bạn chỉ cần khởi chạy một máy chủ cục bộ bằng **1 trong các cách cực kỳ đơn giản sau**:

### Cách 1: Nhấp đúp chuột (Dễ nhất trên Windows)
- Nhấp đúp chuột vào file **`start-server.bat`** tại thư mục gốc.
- Hệ thống sẽ tự động khởi tạo máy chủ HTTP và mở sẵn trình duyệt tại: `http://localhost:8080/`.

### Cách 2: Khởi chạy bằng PowerShell
Mở PowerShell tại thư mục dự án và chạy:
```powershell
.\start-server.bat
# hoặc vào thư mục webapp:
cd 03-Interactive-Web\muscle-movement-3d
powershell -ExecutionPolicy Bypass -File .\run.ps1
```

### Cách 3: Sử dụng Python
```bash
cd 03-Interactive-Web/muscle-movement-3d
python -m http.server 8080
```
Sau đó mở trình duyệt truy cập: `http://localhost:8080/`

### Cách 4: Sử dụng Node.js (npx serve)
```bash
cd 03-Interactive-Web/muscle-movement-3d
npx serve .
```

---

## 📁 CẤU TRÚC MÃ NGUỒN WEB APP

```text
Acupuncture/
├── start-server.bat                             # Script chạy nhanh ứng dụng 1-click
├── index.html                                   # File điều hướng gốc
├── 03-Interactive-Web/
│   └── muscle-movement-3d/
│       ├── index.html                           # Giao diện chính của ứng dụng 3D
│       ├── app.js                               # Điểm khởi chạy (Entry point)
│       ├── start-server.bat                     # Script chạy local riêng cho webapp
│       ├── run.ps1 / server.ps1                 # Máy chủ HTTP cục bộ tự động
│       ├── assets/
│       │   ├── css/theme.css                    # Design System Dark Slate / Light Mode
│       │   └── models/
│       │       ├── MuscularSystem.fbx           # Mô hình Hệ Cơ thật Z-Anatomy
│       │       └── NervousSystem.fbx            # Mô hình Hệ Thần Kinh Z-Anatomy
│       ├── data/
│       │   ├── muscles.json                     # Cơ sở dữ liệu nguyên ủy, bám tận, thần kinh
│       │   ├── movements.json                   # 15 cử động động học & phân vai cơ
│       │   ├── acupuncture-chains.json          # 6 hội chứng cân cơ & điểm huyệt 3D
│       │   └── acupoints.json                   # Danh mục huyệt vị chuẩn WHO
│       ├── viewmodels/
│       │   ├── Observable.js                    # Reactive State Proxy
│       │   ├── AppViewModel.js                  # Điều phối dữ liệu & 2 Chế độ
│       │   ├── MovementViewModel.js             # Quản lý Chế độ 1 (Cử động)
│       │   ├── AcupunctureViewModel.js          # Quản lý Chế độ 2 (Trị liệu & Huyệt vị)
│       │   └── SceneViewModel.js                # Quản lý logic Three.js Scene
│       └── views/
│           ├── SceneView.js                     # Render 3D Canvas, Rigging & Điểm huyệt
│           └── UIView.js                        # Điều khiển DOM, Tab switcher & Panels
```

---

## 📜 BẢN QUYỀN & TÀI LIỆU THAM KHẢO
- **Mô hình 3D**: Được xây dựng và tối ưu hóa từ dự án nguồn mở [Z-Anatomy](https://z-anatomy.com/) theo giấy phép Creative Commons (CC BY-SA 4.0).
- **Thuật ngữ & Giải phẫu**: *Terminologia Anatomica (TA2-2019)*, Giáo trình Giải Phẫu Người — PGS. TS. Nguyễn Văn Huy (Đại Học Y Hà Nội), Atlas Giải Phẫu Người Frank H. Netter.
- **Huyệt vị & Cơ sinh học**: *WHO Standard Acupuncture Point Locations in the Western Pacific Region*, Học thuyết 12 Kinh Cân & Anatomy Trains (Thomas Myers).
