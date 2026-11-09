# KẾ HOẠCH & ĐẶC TẢ KỸ THUẬT TỐI ƯU HÓA ỨNG DỤNG 3D GIẢI PHẪU & CHÂM CỨU
**(Actionable Implementation Blueprint cho Agent / Model Thực Thi)**

- **Thư mục gốc ứng dụng**: `03-Interactive-Web/muscle-movement-3d/`
- **Mục đích tài liệu**: Cung cấp bản thiết kế kỹ thuật chi tiết đến từng hàm, biến và dòng lệnh để Agent/Model tiếp theo có thể triển khai tối ưu hóa hiệu năng (Runtime, GPU/VRAM, 3D Asset Pipeline & Code Architecture) một cách chính xác 100%, không gây hồi quy (regression).

---

## ⚠️ 0. CÁC RÀNG BUỘC BẤT KHẢ XÂM PHẠM (CRITICAL GUARDRAILS)

Trước khi sửa bất kỳ dòng code nào, Model thực thi **BẮT BUỘC** phải tuân thủ 5 quy tắc sau:

1. **Ngôn ngữ & Mã hóa UTF-8 (Without BOM)**:
   - Toàn bộ văn bản hiển thị, chú thích, nhãn giải phẫu phải bằng **100% Tiếng Việt có dấu chuẩn y khoa**.
   - **TUYỆT ĐỐI KHÔNG** dùng lệnh `Get-Content` / `Set-Content` mặc định của Windows PowerShell 5.1 để sửa file `.js`, `.html`, `.css`, `.json` (vì sẽ gây lỗi mã hóa ANSI / Mojibake và chèn BOM). Chỉ sử dụng công cụ chỉnh sửa file chuẩn UTF-8 hoặc Python với `encoding='utf-8'`.
2. **Bảo toàn Hệ quy chiếu Không gian 3D & 90 Huyệt đạo**:
   - Tuyệt đối giữ nguyên bộ hằng số chuẩn hóa không gian trong `views/SceneView.js`:
     - `this.uniformScaleFactor = 0.09993381217765253;`
     - `this.bodyOffsetX = 0.0;`
     - `this.bodyOffsetY = 0.4355495;`
     - `this.bodyOffsetZ = -0.0315754;`
   - Không làm thay đổi tọa độ `position_3d` của 90 huyệt vị đã được hiệu chuẩn trên bề mặt da/cơ trong `data/acupoints.json` và `data/acupuncture-chains.json`.
3. **Bảo toàn cơ chế Che khuất Huyệt đạo (Depth Occlusion) & Bù trừ Khoảng cách (Screen-Space Distance Scaling)**:
   - Các cơ ở trạng thái mờ (Chế độ 2: 10%, Chế độ 3: 28%) **vẫn phải giữ `depthWrite: true`** để hình nhân che khuất các huyệt nằm ở mặt đối diện (nhìn mặt trước không bị xuyên thấu thấy huyệt sau lưng).
   - Các điểm huyệt phải giữ cơ chế thu nhỏ tỷ lệ `distScale = Math.min(1.2, Math.max(0.10, dist / 22.0))` khi zoom cận cảnh mặt/cổ/bàn tay/bàn chân.
4. **Bảo toàn tính năng Cô lập Huyệt đạo (Single Acupoint Isolation)**:
   - Khi người dùng chọn 1 huyệt (`focusAcupoint(code)`), chỉ hiển thị duy nhất huyệt đó (`visible = true`), các huyệt khác ẩn đi (`visible = false`), và khôi phục toàn bộ khi bỏ chọn (`focusAcupoint(null)`).
5. **Quy tắc Git**:
   - **TUYỆT ĐỐI KHÔNG tự ý chạy lệnh `git push`** lên kho lưu trữ từ xa khi chưa có sự đồng thuận trực tiếp từ người dùng.

---

## 📊 1. HỒ SƠ ĐO ĐẠC HIỆN TRẠNG & 6 ĐIỂM NGHẼN CỐT LÕI

| STT | Điểm Nghẽn Hiệu Năng | Vị Trí File & Dòng Code | Hiện Trạng Đo Đạc |
| :-: | :--- | :--- | :--- |
| **1** | **Raycasting 683 `SkinnedMesh` không điều tiết** | `views/SceneView.js` (dòng `1110–1191`) | Bắn tia raycast 60–250 lần/giây trên 683 `SkinnedMesh` (tính ma trận xương trên CPU) ngay cả khi đang nhấn giữ chuột xoay Camera |
| **2** | **Nhân bản 1,180+ `Material` & bật `DoubleSide` + `transparent`** | `views/SceneView.js` (dòng `882–900`, `986–1022`, `1909–1971`) | `neutralMuscleMat.clone()` 683 lần, `nervousMat.clone()` ~500 lần; bật `DoubleSide` (gấp đôi tải shader) và `transparent: true` khi `opacity = 1.0` |
| **3** | **Rò rỉ VRAM (Memory Leak) & tái tạo Mesh trong `displayAcupoints`** | `views/SceneView.js` (dòng `1976–2037`) | Mỗi lần lọc/tìm kiếm lại tạo mới 90 `SphereGeometry` + 90 `RingGeometry` + 180 `Material`; quên `dispose()` hình học của `ringMesh` con (`obj.children[0]`) |
| **4** | **Khởi tạo lại từ điển 270 phần tử trên mỗi lần di chuột** | `views/SceneView.js` (dòng `1193–1588`) | Khai báo lại mảng `nerveDict` (110 mục) và `muscleDict` (160 mục) bên trong hàm `_translateAnatomyNameToVi` mỗi khi trỏ chuột |
| **5** | **Render Loop vẫn tính nội suy xương khi hình nhân đứng yên** | `views/SceneView.js` (dòng `1873–1902`, `2136–2195`) | `_updatePoseInterpolation()` và `rigRoot.updateMatrixWorld(true)` chạy mãi mãi ở 20 FPS ngay cả khi tư thế đã hội tụ và không ai chạm chuột |
| **6** | **Tài sản `NervousSystem.fbx` nặng 51.39 MB & cắt lưới trên trình duyệt** | `assets/models/NervousSystem.fbx` & `views/SceneView.js` (`545–752`, `977–1038`) | File FBX nặng 51.39 MB; khi mở Chế độ 2 phải tải lâu và cắt lưới `_splitNerveMeshAtY` trên Main Thread làm khựng giao diện 2–4 giây |

---

## 🛠️ 2. ĐẶC TẢ TRIỂN KHAI CHI TIẾT THEO 4 GIAI ĐOẠN

---

### ⚡ GIAI ĐOẠN 1: TỐI ƯU RUNTIME, RAYCASTING, OBJECT POOLING & BỘ NHỚ GPU
*(Chỉ chỉnh sửa JavaScript trong `views/SceneView.js` — Độ an toàn 100%, hiệu quả tức thì)*

#### Task 1.1: Tối ưu hóa Raycasting 3 lớp (Drag Guard + Throttle 80ms + Two-Pass Priority)
- **File mục tiêu**: `views/SceneView.js` (Hàm `_setupInteraction`, khoảng dòng `1110–1191`).
- **Yêu cầu kỹ thuật**:
  1. Theo dõi trạng thái đang kéo/xoay của `OrbitControls` (`this.isCameraDragging = false`). Khi `start` $\rightarrow$ `true` (ẩn luôn tooltip), khi `end` $\rightarrow$ `false`. Nếu `this.isCameraDragging === true` hoặc `this.isPaused === true`, thoát ngay khỏi `onMouseMove`!
  2. Throttle hàm raycast trong `onMouseMove` sao cho khoảng cách giữa 2 lần raycast tối thiểu là `75ms` (~13 lần/giây), nhưng vẫn cập nhật tọa độ `left`/`top` của tooltip mượt mà nếu đang có `this.hoveredObject`.
  3. **Raycast 2 bước (Two-Pass)**:
     - Bước 1: Chỉ raycast mảng `visiblePoints` (tối đa 90 hình cầu huyệt vị). Nếu `intersects.length > 0`, lấy luôn kết quả đó và **không raycast vào 683 cơ hay hệ thần kinh**!
     - Bước 2: Chỉ khi không trúng huyệt đạo nào mới raycast vào `allMuscleMeshes` (nếu `showMuscleLayer`) và `allNervousMeshes` (nếu `showNervousLayer`).

- **Mẫu Code Triển Khai (`views/SceneView.js`)**:
```javascript
  _setupInteraction() {
    this.isCameraDragging = false;
    this._lastRaycastTime = 0;
    const RAYCAST_INTERVAL_MS = 75; // Tối đa ~13 lần raycast/giây

    this.controls.addEventListener('start', () => {
      this.isCameraDragging = true;
      if (this.tooltip) this.tooltip.style.display = 'none';
    });
    this.controls.addEventListener('end', () => {
      this.isCameraDragging = false;
    });

    const onMouseMove = (event) => {
      if (this.isPaused || this.isCameraDragging) return;

      const containerRect = this.container.getBoundingClientRect();
      // Cập nhật vị trí tooltip mượt theo chuột nếu đang hover
      if (this.hoveredObject && this.tooltip.style.display === 'block') {
        this.tooltip.style.left = `${event.clientX - containerRect.left + 12}px`;
        this.tooltip.style.top = `${event.clientY - containerRect.top + 12}px`;
      }

      const now = performance.now();
      if (now - this._lastRaycastTime < RAYCAST_INTERVAL_MS) return;
      this._lastRaycastTime = now;

      const rect = this.renderer.domElement.getBoundingClientRect();
      this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);

      let hitObject = null;

      // PASS 1: Ưu tiên kiểm tra các Điểm Huyệt 3D đang hiển thị trước (siêu nhẹ)
      if (this.activeAcupointMeshes.length > 0) {
        const visiblePoints = this.activeAcupointMeshes.filter(m => m.visible);
        if (visiblePoints.length > 0) {
          const ptHits = this.raycaster.intersectObjects(visiblePoints, false);
          if (ptHits.length > 0) {
            hitObject = ptHits[0].object;
          }
        }
      }

      // PASS 2: Chỉ khi không trúng điểm huyệt mới kiểm tra lớp Cơ và Thần Kinh
      if (!hitObject) {
        const anatomyToTest = [];
        if (this.showMuscleLayer) anatomyToTest.push(...this.allMuscleMeshes);
        if (this.showNervousLayer) anatomyToTest.push(...this.allNervousMeshes);

        if (anatomyToTest.length > 0) {
          const anatomyHits = this.raycaster.intersectObjects(anatomyToTest, false);
          if (anatomyHits.length > 0) {
            hitObject = anatomyHits[0].object;
          }
        }
      }

      if (hitObject) {
        if (this.hoveredObject !== hitObject) {
          this.hoveredObject = hitObject;
          this.tooltip.style.display = 'block';
          this.tooltip.textContent = this._getLocalizedName(hitObject);
        }
        this.tooltip.style.left = `${event.clientX - containerRect.left + 12}px`;
        this.tooltip.style.top = `${event.clientY - containerRect.top + 12}px`;
      } else {
        this.hoveredObject = null;
        this.tooltip.style.display = 'none';
      }
    };
    // Giữ nguyên logic onClick bên dưới...
```

---

#### Task 1.2: Dùng Chung Geometry & Material cho Điểm Huyệt 3D + Vá Lỗi Rò Rỉ VRAM (`displayAcupoints`)
- **File mục tiêu**: `views/SceneView.js` (Hàm `displayAcupoints` & `focusAcupoint`, dòng `1976–2080`).
- **Yêu cầu kỹ thuật**:
  1. Khởi tạo **1 lần duy nhất** bộ Geometry & Material dùng chung cho toàn bộ các điểm huyệt:
     - `this._sharedAcupointSphereGeo = new THREE.SphereGeometry(0.11, 16, 16);`
     - `this._sharedAcupointRingGeo = new THREE.RingGeometry(0.15, 0.21, 24);`
     - `this._sharedAcupointSphereMat` (màu đỏ `0xef4444`)
     - `this._sharedRingNormalMat` (màu vàng `0xfacc15`)
     - `this._sharedRingFocusedMat` (màu trắng `0xffffff`)
  2. Khi xóa các mesh cũ trong `this.acupointGroup`, chỉ cần `this.acupointGroup.clear()` mà **không cần `dispose()` geometry/material dùng chung** (hoặc dùng `Map` lưu trữ các mesh theo `pt.code` để tái sử dụng lại 100% `Mesh` instances).
  3. Khi `focusAcupoint(code)` đổi màu vòng hào quang của huyệt được chọn, chỉ cần gán `mesh.children[0].material = this._sharedRingFocusedMat` (hoặc `this._sharedRingNormalMat`), không cần tạo/sửa material riêng cho từng vòng!

- **Mẫu Code Triển Khai (`views/SceneView.js`)**:
```javascript
  _ensureAcupointSharedResources() {
    if (this._sharedAcupointSphereGeo) return;

    this._sharedAcupointSphereGeo = new THREE.SphereGeometry(0.11, 16, 16);
    this._sharedAcupointRingGeo = new THREE.RingGeometry(0.15, 0.21, 24);

    this._sharedAcupointSphereMat = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      depthTest: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -4,
      transparent: true,
      opacity: 0.95
    });

    this._sharedRingNormalMat = new THREE.MeshBasicMaterial({
      color: 0xfacc15,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
      depthTest: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -4
    });

    this._sharedRingFocusedMat = this._sharedRingNormalMat.clone();
    this._sharedRingFocusedMat.color.setHex(0xffffff);

    this._acupointMeshCache = new Map(); // code -> sphereMesh
  }
```
Khi `displayAcupoints(acupoints = [])` được gọi:
- Lấy hoặc tạo `sphereMesh` từ `this._acupointMeshCache.get(pt.code)`.
- Cập nhật tọa độ `sphereMesh.position.set(pt.position_3d.x, pt.position_3d.y, pt.position_3d.z)`.
- Kết quả: **0 lần cấp phát bộ nhớ mới, 0% rò rỉ VRAM**, chuyển đổi bộ lọc vùng mất `< 0.1ms`!

---

#### Task 1.3: Dùng Chung 1 Material Duy Nhất Cho Toàn Bộ Hệ Thần Kinh & Tối Ưu Material Hệ Cơ
- **File mục tiêu**: `views/SceneView.js` (dòng `882–900`, `986–1023`, `2091–2102`).
- **Yêu cầu kỹ thuật**:
  1. **Hệ Thần Kinh (`_loadNervousSystemFBX` / GLB)**:
     - Thay vì `child.material = nervousMat.clone()` cho ~500 nhánh thần kinh, lưu `this.sharedNervousMat = nervousMat;` và gán trực tiếp `child.material = this.sharedNervousMat;` cho toàn bộ nhánh thần kinh!
     - Trong hàm `setNervousOpacity(opacity)`: Chỉ cần cập nhật trực tiếp trên `this.sharedNervousMat` (1 thao tác duy nhất thay vì duyệt vòng lặp 500 meshes).
  2. **Hệ Cơ (`_loadMuscularSystemGLB`)**:
     - Khi khởi tạo `neutralMuscleMat`: Đặt `transparent: false` (vì mặc định `opacity: 1.0` là đục hoàn toàn) và `side: THREE.FrontSide` (chỉ bật `DoubleSide` nếu thực sự cần thiết, hoặc giữ `FrontSide` vì các khối cơ Z-Anatomy là lưới kín Manifold).

---

#### Task 1.4: Đưa Từ Điển Giải Phẫu Ra Hằng Số Cấp Module & Tiền Tính Toán Nhãn Tiếng Việt $O(1)$
- **File mục tiêu**: `views/SceneView.js` (dòng `1193–1588`).
- **Yêu cầu kỹ thuật**:
  1. Đưa 2 mảng `NERVE_DICT` và `MUSCLE_DICT` ra ngoài class (hoặc tách sang file `data/anatomy-dictionary.js` và import vào) để **chỉ khởi tạo đúng 1 lần khi tải trang**, không bao giờ cấp phát lại khi gọi `_translateAnatomyNameToVi`.
  2. Trong `_getLocalizedName(object)`:
     - Kiểm tra nếu `object.userData.cachedLocalizedLabel` đã có sẵn thì trả về ngay lập tức ($O(1)$).
     - Nếu chưa có, tính toán 1 lần rồi lưu vào `object.userData.cachedLocalizedLabel` để các lần hover sau đọc tức thì.

---

### 🧠 GIAI ĐOẠN 2: CƠ CHẾ RENDER THEO YÊU CẦU (SMART ON-DEMAND & ADAPTIVE IDLE RENDERING)

#### Task 2.1: Cờ Hội Tụ Tư Thế Tượng (`isPoseAnimating`)
- **File mục tiêu**: `views/SceneView.js` (`_applyStatuePose` dòng `1643` và `_updatePoseInterpolation` dòng `1873`).
- **Yêu cầu kỹ thuật**:
  1. Trong `constructor`, thêm `this.isPoseAnimating = false;`.
  2. Trong `_applyStatuePose(movementId)`, đặt `this.isPoseAnimating = true;` và đánh thức render nếu đang idle.
  3. Trong `_updatePoseInterpolation()`:
     - Nếu `!this.isPoseAnimating`, thoát ngay (`return false;`), không duyệt vòng lặp khớp xương và không gọi `rigRoot.updateMatrixWorld(true)`!
     - Trong vòng lặp `for (const key of this.activeJointKeys)`, tính tổng sai số `maxDelta = Math.max(maxDelta, Math.abs(targetRot.x - pivot.rotation.x), ...)`.
     - Nếu sau vòng lặp mà `maxDelta < 0.0008`, gán thẳng `pivot.rotation.copy(targetRot)` và đặt `this.isPoseAnimating = false;` (đã hội tụ xong!).

#### Task 2.2: Tự Động Hạ FPS Về Chế Độ Nghỉ Khi Người Dùng Đang Đọc Bài (Idle Detection)
- **File mục tiêu**: `views/SceneView.js` (`_animate`).
- **Yêu cầu kỹ thuật**:
  1. Ghi nhận mốc thời gian tương tác cuối cùng `this._lastInteractionTime = performance.now();` mỗi khi:
     - `this.controls` phát sự kiện `'change'`
     - Người dùng đổi cử động, đổi chế độ, đổi độ mờ, lọc huyệt vị, hoặc resize cửa sổ.
  2. Trong `_animate()`:
     - Kiểm tra `const isIdle = !this.isPoseAnimating && (now - this._lastInteractionTime > 2000);` (đã ngừng thao tác quá 2 giây).
     - Nếu `isIdle`:
       - Nếu đang ở **Chế độ 1 (`activeAcupointMeshes.length === 0`)**: **Bỏ qua `renderer.render()` hoàn toàn (0 FPS)**! GPU nghỉ 100% trong lúc người dùng đọc lý thuyết cơ sinh học.
       - Nếu đang ở **Chế độ 2 hoặc Chế độ 3 (`activeAcupointMeshes.length > 0`)**: Hạ tần số cập nhật nhịp đập hào quang huyệt vị xuống **10 FPS (`frameInterval = 100ms`)**, vừa giữ được vòng sáng nhịp nhàng vừa giảm một nửa tải GPU lúc rảnh.

---

### 📦 GIAI ĐOẠN 3: TỐI ƯU HÓA TÀI SẢN 3D (3D ASSET PIPELINE — GIẢM ~85% DUNG LƯỢNG MẠNG)

#### Task 3.1: Tiền xử lý Offline `NervousSystem.fbx` (51.39 MB) sang `NervousSystem_Rigged.glb` (~3–4 MB)
- **Vấn đề hiện tại**: `assets/models/NervousSystem.fbx` nặng **51.39 MB**, chứa hàng trăm mesh rời rạc và các mesh nhiễu (`isNoise`), mỗi lần bật Chế độ 2 phải tải 51.39 MB và chạy thuật toán cắt tam giác `_splitNerveMeshAtY` trên CPU trình duyệt.
- **Giải pháp thực thi**:
  1. Viết một script tiền xử lý offline (bằng Node.js hoặc Python `trimesh` / `pygltflib` / Blender headless) áp dụng y hệt bộ quy tắc trong `_loadNervousSystemFBX` và `_attachFBXToRig`:
     - Loại bỏ toàn bộ các mesh nhiễu (`isNoise`: tên kết thúc bằng `j`, `cross_section`, `axis`, `pointer`, `minDim < 0.0005`...).
     - Cắt sẵn các dây thần kinh cánh tay tại $Y = 11.05$ và dây thần kinh chân tại $Y = 5.05$.
     - Phân loại từng nhánh thần kinh vào đúng 14 đốt xương (`segment`).
     - Xuất ra file nhị phân `assets/models/NervousSystem_Rigged.glb` (đã gắn sẵn `userData.segment` và `userData.localizedLabel` hoặc gộp theo từng nhóm).
  2. Cập nhật `_loadNervousSystemFBX()` trong `views/SceneView.js` để ưu tiên nạp `NervousSystem_Rigged.glb` bằng `GLTFLoader` (giống như `_loadMuscularSystemGLB`), chỉ giữ FBX làm fallback nếu không tìm thấy file GLB.

#### Task 3.2: Nén `MuscularSystem_Skinned.glb` & Dọn Dẹp File Thừa
- **Yêu cầu kỹ thuật**:
  1. Sử dụng `gltfpack` hoặc `gltf-transform` (quantize / meshopt / weld) để tối ưu hóa `assets/models/MuscularSystem_Skinned.glb` từ **20.70 MB xuống ~5–6 MB** (lưu ý: kiểm tra kỹ không làm lệch ma trận `skeletonBones` và tọa độ bề mặt).
  2. Di chuyển các file nhị phân thô không sử dụng trong `assets/models/` (`muscles_raw_dump.bin` 186 MB, `overview-skeleton.obj` 46 MB, `CardioVascular.fbx` 44 MB, `SkeletalSystem.fbx` 39 MB, `MuscularSystem.fbx` 35.6 MB) sang thư mục lưu trữ ngoài Web Root (ví dụ `3D-models/archive_raw/`) và xóa `MuscularSystem.fbx` khỏi Git tracking (`git rm --cached`) để kho GitHub nhẹ đi gần 90 MB.

---

### 🧩 GIAI ĐOẠN 4: TÁI CẤU TRÚC MÃ NGUỒN & TỐI ƯU GIAO DIỆN DOM (`UIView.js` & `AppViewModel.js`)

#### Task 4.1: Tách Module Từ Điển & Tư Thế Tượng Khỏi `views/SceneView.js`
- Tạo file `data/anatomy-dictionary.js`: Chứa `NERVE_DICT`, `MUSCLE_DICT` và hàm `translateAnatomyNameToVi(rawName, category)`.
- Tạo file `data/statue-poses.js`: Chứa cấu hình góc xoay của 12 tư thế cử động mẫu (từ dòng `1643–1871` của `SceneView.js`).
- Giúp `views/SceneView.js` giảm từ **2,208 dòng xuống còn ~1,400 dòng**, cực kỳ sạch sẽ và dễ bảo trì.

#### Task 4.2: Loại Bỏ Request JSON Dư Thừa Lúc Khởi Động (`viewmodels/AppViewModel.js`)
- **Vị trí**: `viewmodels/AppViewModel.js` (dòng `44–51`).
- **Hiện trạng**: Đang tải đồng thời 6 file JSON, trong đó `bone-mapping.json` và `mesh-joint-registry.json` chỉ phục vụ cho cơ chế rigging FBX cũ.
- **Tối ưu**: Chỉ tải 4 file cốt lõi lúc khởi động (`muscles.json`, `movements.json`, `acupoints.json`, `acupuncture-chains.json`); chỉ tải lazy-load `mesh-joint-registry.json` trong khối `catch` nếu nạp GLB thất bại và phải dùng FBX fallback.

#### Task 4.3: Bổ Sung Debounce `150ms` Cho Các Ô Tìm Kiếm (`views/UIView.js`)
- **Vị trí**: `views/UIView.js` (dòng `278–306` cho `searchInput` và dòng `319–325` cho `searchAcupointInput`, dòng `566–572` cho `rtSearchInput`).
- **Tối ưu**: Thêm hàm tiện ích `_debounce(fn, delay = 150)` bọc quanh sự kiện `'input'` của cả 3 ô tìm kiếm để tránh việc gõ nhanh tiếng Việt (Telex/VNI) kích hoạt render lại danh sách DOM liên tục trên từng phím bấm.

---

## ✅ 3. DANH SÁCH KIỂM THỬ NGHIỆM THU (VERIFICATION CHECKLIST)

Sau khi hoàn tất từng giai đoạn, Model thực thi cần chạy kiểm tra các tiêu chí sau trên `http://localhost:8081/index.html`:

- [ ] **Kiểm tra hiển thị Tiếng Việt**: Toàn bộ tiêu đề, danh sách cơ, 90 huyệt vị, tooltip khi di chuột và phụ đề video hiển thị chuẩn font `Be Vietnam Pro`, không có bất kỳ ký tự lỗi encoding nào.
- [ ] **Kiểm tra Chế độ 1 (Động học cử động)**:
  - Chọn lần lượt các cử động (Nâng tay qua đầu, Gập khuỷu, Squat...): Hình nhân chuyển thế mượt mà; sau ~1.5 giây khi tượng dừng chuyển động và không di chuột, `isPoseAnimating` chuyển về `false` và GPU về trạng thái nghỉ (0 FPS).
  - Nhấn giữ chuột xoay Camera: Xoay cực mượt, không phát sinh raycast trong lúc đang kéo chuột.
- [ ] **Kiểm tra Chế độ 2 (Bản đồ 90 Huyệt đạo)**:
  - Mặc định hệ cơ mờ 10%, hệ thần kinh hiện 90% màu hồng y khoa, 90 điểm huyệt nằm sát bề mặt cơ thể (đặc biệt vùng mặt, cổ, lòng bàn tay, lòng bàn chân).
  - Xoay hình nhân mặt trước/mặt sau: Các huyệt ở mặt đối diện bị che khuất đúng chuẩn, không bị nhìn xuyên thấu.
  - Phóng to cận cảnh (Zoom in) vào vùng mặt, bàn tay, bàn chân: Kích thước điểm huyệt tự động thu nhỏ tương ứng, không bị phình to đè lên nhau.
  - Click chọn 1 huyệt: Tất cả 89 huyệt còn lại ẩn đi; click vào nền trống hoặc nút đóng: cả 90 huyệt hiện lại đầy đủ.
- [ ] **Kiểm tra Chế độ 3 (Trị liệu Chuỗi kinh cân)**:
  - Hộp chú giải (Legend) 4 nhóm màu cơ hiển thị rõ ràng ở góc màn hình.
  - Chọn chuỗi kinh cân hiển thị đúng màu cơ đau, cơ chuỗi liên đới và các huyệt vị đặc hiệu.
- [ ] **Kiểm tra Tab Video Bài giảng**:
  - Khi chuyển sang tab Video: Render 3D ngắt hoàn toàn (`isPaused = true`), video 480p phát ngay tức thì trong ~1 giây, phụ đề chạy đồng bộ theo từng câu thoại.
  - Khi chuyển ngược về tab 3D: Video tự động tạm dừng, mô hình 3D kích hoạt lại bình thường.
