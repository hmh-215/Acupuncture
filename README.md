# Ứng Dụng 3D Tương Tác: Hệ Cơ Xương Khớp & Châm Cứu

Ứng dụng web 3D tương tác giúp quan sát và đối chiếu giải phẫu hệ cơ xương khớp với các chuyển động thực tế (sinh cơ học vận động) và hệ thống huyệt vị châm cứu theo chuẩn Tổ chức Y tế Thế giới (WHO).

---

## 🌟 Tính Năng Cốt Lõi

1. **Minh Họa Vận Động Đa Cơ (Multi-muscle Movement Highlighting):**
   - Chọn bất kỳ cử động khớp nào (Giạng vai, Khép vai, Gập vai, Duỗi vai, Xoay trong/ngoài, Gập/Duỗi khuỷu, v.v.).
   - Hệ thống tự động làm nổi bật các nhóm cơ tham gia theo đúng vai trò sinh cơ học:
     - 🔴 **Cơ chủ vận (*Agonist*):** Màu đỏ (`#ef4444`)
     - 🔵 **Cơ đối vận (*Antagonist*):** Màu xanh Cyan (`#38bdf8`)
     - 🟡 **Cơ hiệp đồng (*Synergist*):** Màu vàng Amber (`#f59e0b`)
     - 🟢 **Cơ ổn định (*Stabilizer*):** Màu xanh ngọc Emerald (`#10b981`)

2. **Khám Phá Tương Tác 3D Không Gian Thực (3D Raycasting & Tooltip):**
   - Di chuột lên từng cơ hoặc mỏm xương: Hiển thị nhãn tên tiếng Việt chuẩn mực y khoa.
   - Nhấp chuột vào một cơ bất kỳ: Tự động **cô lập cơ đó (*Isolate*)**, làm mờ các thành phần xung quanh và mở bảng thông tin chi tiết (Nguyên ủy, Bám tận, Động tác, Thần kinh, Mạch máu).

3. **Tích Hợp Huyệt Vị Châm Cứu Chuẩn WHO:**
   - Liên kết trực tiếp giữa cấu trúc cơ học và các huyệt vị kinh lạc nằm trên thân cơ (ví dụ: cơ Delta liên kết huyệt *Kiên Ngung - LI-15*, cơ Thang liên kết huyệt *Kiên Tỉnh - GB-21*).
   - Hiển thị vị trí giải phẫu, độ sâu châm an toàn và các cảnh báo nguy cơ (tránh tràn khí màng phổi, chống chỉ định thai kỳ).

4. **Kiến Trúc Chuẩn MVVM (Model - View - ViewModel):**
   - **Model:** Các cơ sở dữ liệu độc lập `muscles.json`, `movements.json`, `acupoints.json`, `bone-mapping.json`.
   - **ViewModel:** Quản lý logic phân vai, lọc cơ, tìm kiếm và trạng thái 3D thông qua `Observable.js` (Proxy-based reactivity).
   - **View:** `SceneView.js` (render Three.js WebGL) và `UIView.js` (điều khiển DOM giao diện).

---

## 🚀 Hướng Dẫn Khởi Chạy

Do các trình duyệt hiện đại chặn nạp tài nguyên cục bộ (CORS) khi mở trực tiếp file `file:///`, ứng dụng cần chạy qua máy chủ HTTP tĩnh:

### Cách 1: Chạy bằng file Batch (Nhanh nhất trên Windows)
- Nhấp đúp chuột vào file:  
  `03-Interactive-Web/muscle-movement-3d/start-server.bat`
- Trình duyệt sẽ tự động mở tại địa chỉ `http://localhost:8080`.

### Cách 2: Khởi chạy bằng dòng lệnh PowerShell / Terminal
```powershell
cd "d:\huong\antigravity\châm cứu\03-Interactive-Web\muscle-movement-3d"
# Dùng Python có sẵn trong máy:
python -m http.server 8080
```
Sau đó mở trình duyệt truy cập: `http://localhost:8080`.

### Cách 3: Dùng extension "Live Server" trong VS Code / Cursor
- Nhấp chuột phải vào file `index.html` -> chọn **Open with Live Server**.

---

## 📂 Cấu Trúc Thư Mục Dự Án

```text
muscle-movement-3d/
├── index.html                   # Giao diện chính 2 cột (Viewport 3D + Thẻ thông tin)
├── app.js                       # Điểm khởi tạo ứng dụng (Application Orchestrator)
├── start-server.bat             # Trình khởi chạy 1-click trên Windows
├── README.md                    # Tài liệu hướng dẫn sử dụng và kiến trúc
├── assets/
│   ├── css/
│   │   └── theme.css            # Hệ thống màu Dark Slate Studio chuẩn y khoa
│   └── models/                  # [3D ASSETS] Mô hình giải phẫu thật 100%
│       ├── MuscularSystem.fbx   # 550 thớ cơ thật từ Z-Anatomy chính thức (37.3 MB)
│       └── overview-skeleton.obj# 144 xương thật từ AnatomyTOOL (48.4 MB)
├── data/                        # [MODEL LAYER] Cơ sở dữ liệu JSON
│   ├── muscles.json             # 21 cơ đai vai và cánh tay (Nguyên ủy, bám tận, thần kinh)
│   ├── movements.json           # 10 cử động giải phẫu chuẩn với phân vai chi tiết
│   ├── acupoints.json           # 14 huyệt vị WHO liên quan
│   └── bone-mapping.json        # Ánh xạ 58 xương giải phẫu sang tiếng Việt
├── viewmodels/                  # [VIEWMODEL LAYER] Logic nghiệp vụ và phản ứng
│   ├── Observable.js            # Hệ thống quản lý trạng thái phản ứng Proxy
│   ├── AppViewModel.js          # Root ViewModel nạp dữ liệu và điều phối
│   ├── SceneViewModel.js        # Quản lý trạng thái 3D (highlight, opacity, layer)
│   └── MovementViewModel.js     # Xử lý chọn cử động, lọc vai trò, tìm kiếm
└── views/                       # [VIEW LAYER] Hiển thị và tương tác
    ├── SceneView.js             # Render Three.js WebGL (FBXLoader + OBJLoader + Raycasting)
    └── UIView.js                # Đồng bộ DOM, cập nhật danh sách và thẻ thông tin
```

---

## 🛡️ Bản Quyền Dữ Liệu
- Danh pháp giải phẫu: **Terminologia Anatomica (TA2-2019)**
- Vị trí huyệt vị: **WHO Standard Acupuncture Point Locations in the Western Pacific Region**
- Mô hình tham chiếu: **Z-Anatomy & AnatomyTOOL** (CC BY-SA 4.0)
