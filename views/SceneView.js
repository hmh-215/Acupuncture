import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';

/**
 * SceneView.js
 * Quản lý toàn bộ 3D Canvas bằng Three.js:
 * 1. Khung xương động học (Hierarchical Kinematic Rigging) 11 khớp chuẩn y khoa.
 * 2. Nạp và quản lý 2 lớp giải phẫu chính: Hệ Cơ (Muscular) & Hệ Thần Kinh (Nervous).
 * 3. Mô phỏng tư thế tượng động học (Statue Poses) chuẩn sinh lý (không bị vỡ rách khớp).
 * 4. Highlight cơ thông minh: Cơ không hoạt động màu Xám Đục (Opaque solid), cơ hoạt động phát sáng rực rỡ.
 * 5. Hệ thống Điểm Huyệt 3D (Interactive 3D Acupoint Markers) phát sáng nhịp tim phục vụ Chế độ 2.
 */
export class SceneView {
  constructor(container, sceneVM, appVM) {
    this.container = container;
    this.sceneVM = sceneVM;
    this.appVM = appVM;

    this.scene = new THREE.Scene();
    this.currentTheme = 'light';
    this.scene.background = new THREE.Color(0xf1f5f9); // Mặc định Light Mode y khoa chuẩn

    const aspect = container.clientWidth > 0 && container.clientHeight > 0 
      ? container.clientWidth / container.clientHeight 
      : 16 / 10;
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 300);
    this.camera.position.set(0, 11, 27);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.container.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.target.set(0, 9, 0);

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    // ==========================================
    // TRẠNG THÁI HIỂN THỊ 2 LỚP GIẢI PHẪU CHÍNH
    // ==========================================
    this.showMuscleLayer = true;
    this.showNervousLayer = false;

    this.isNervousLoaded = false;

    // Danh sách lưu trữ các mesh theo hệ thống
    this.allMuscleMeshes = [];
    this.allNervousMeshes = [];

    this.muscleMeshMap = new Map();
    this.hoveredObject = null;

    // Thông số căn chỉnh kích thước tỷ lệ chung
    this.uniformScaleFactor = null;
    this.bodyOffsetX = 0;
    this.bodyOffsetY = undefined;
    this.bodyOffsetZ = 0;

    // Độ mờ độc lập (MẶC ĐỊNH: Hệ Cơ 100% ĐỤC HOÀN TOÀN)
    this.muscleOpacity = 1.0;
    this.nervousOpacity = 0.90;

    // Nhóm chứa các Điểm Huyệt 3D (Interactive Acupoint Markers)
    this.acupointGroup = new THREE.Group();
    this.acupointGroup.name = 'AcupointGroup';
    this.scene.add(this.acupointGroup);
    this.activeAcupointMeshes = [];

    // ==========================================
    // KHỞI TẠO BỘ RIGGING ĐỘNG HỌC (KINEMATIC RIG)
    // ==========================================
    this._initKinematicRig();

    // Tooltip giao diện
    this.tooltip = document.getElementById('hover-tooltip');
    if (!this.tooltip) {
      this.tooltip = document.createElement('div');
      this.tooltip.id = 'hover-tooltip';
      this.tooltip.className = 'hover-tooltip';
      this.tooltip.style.display = 'none';
      this.container.appendChild(this.tooltip);
    }
  }

  /**
   * Chuyển đổi giao diện Sáng / Tối trực tiếp trên Three.js Canvas
   */
  setTheme(theme) {
    this.currentTheme = theme;
    if (theme === 'dark') {
      this.scene.background.setHex(0x090d16);
      if (this.ambientLight) this.ambientLight.intensity = 0.85;
      if (this.dirLight1) this.dirLight1.intensity = 0.95;
      if (this.dirLight2) this.dirLight2.color.setHex(0x38bdf8);
    } else {
      this.scene.background.setHex(0xf1f5f9);
      if (this.ambientLight) this.ambientLight.intensity = 0.95;
      if (this.dirLight1) this.dirLight1.intensity = 1.05;
      if (this.dirLight2) this.dirLight2.color.setHex(0x0284c7);
    }
  }

  // ============================================================
  // HỆ THỐNG RIGGING ĐỘNG HỌC 11 KHỚP (HIERARCHICAL KINEMATIC RIG)
  // Tinh chỉnh tọa độ chỏm vai, ròng rọc khuỷu, chỏm đùi và khe khớp gối
  // ============================================================
  _initKinematicRig() {
    this.rigRoot = new THREE.Group();
    this.rigRoot.name = 'RigRoot';
    this.scene.add(this.rigRoot);

    // 1. Khung chậu (Pelvis) - Gốc tọa độ Y ~ 8.70
    const pelvisPivot = new THREE.Group();
    pelvisPivot.name = 'PelvisPivot';
    pelvisPivot.position.set(0, 8.70, 0);
    this.rigRoot.add(pelvisPivot);

    // 2. Thắt lưng / Thân dưới (Torso L1-L5) - world Y ~ 9.95 (tương đối: +1.25)
    const torsoPivot = new THREE.Group();
    torsoPivot.name = 'TorsoPivot';
    torsoPivot.position.set(0, 1.25, 0);
    pelvisPivot.add(torsoPivot);

    // 3. Khớp ngực / Lồng ngực (Chest T1-T12: Điểm khớp trung gian mới) - world Y ~ 12.45 (tương đối: +2.50)
    const chestPivot = new THREE.Group();
    chestPivot.name = 'ChestPivot';
    chestPivot.position.set(0, 2.50, 0);
    torsoPivot.add(chestPivot);

    // 4. Đầu & Cổ (Neck / Head C1-C7) - world Y ~ 14.90 (tương đối: +2.45 từ Chest)
    const neckPivot = new THREE.Group();
    neckPivot.name = 'NeckPivot';
    neckPivot.position.set(0, 2.45, 0);
    chestPivot.add(neckPivot);

    // 5. Đai vai phải (Right Shoulder Girdle: Khớp ức - đòn & bả vai) - world Y ~ 13.90, X ~ -1.10, Z ~ -0.25
    const rightShoulderGirdlePivot = new THREE.Group();
    rightShoulderGirdlePivot.name = 'RightShoulderGirdlePivot';
    rightShoulderGirdlePivot.position.set(-1.10, 1.45, -0.25);
    chestPivot.add(rightShoulderGirdlePivot);

    // 6. Khớp vai phải (Right Upper Arm: Chỏm cánh tay GH joint) - world Y ~ 13.90, X ~ -1.85, Z ~ -0.30
    const rightUpperArmPivot = new THREE.Group();
    rightUpperArmPivot.name = 'RightUpperArmPivot';
    rightUpperArmPivot.position.set(-0.75, 0.00, -0.05); // relative to girdle
    rightShoulderGirdlePivot.add(rightUpperArmPivot);

    // 7. Khớp khuỷu tay phải (Right Forearm: Ròng rọc khuỷu tay) - world Y ~ 11.05, X ~ -2.30, Z ~ -0.30
    const rightForearmPivot = new THREE.Group();
    rightForearmPivot.name = 'RightForearmPivot';
    rightForearmPivot.position.set(-0.45, -2.85, 0.00); // relative to upper arm
    rightUpperArmPivot.add(rightForearmPivot);

    // 8. Đai vai trái (Left Shoulder Girdle) - world Y ~ 13.90, X ~ 1.10, Z ~ -0.25
    const leftShoulderGirdlePivot = new THREE.Group();
    leftShoulderGirdlePivot.name = 'LeftShoulderGirdlePivot';
    leftShoulderGirdlePivot.position.set(1.10, 1.45, -0.25);
    chestPivot.add(leftShoulderGirdlePivot);

    // 9. Khớp vai trái (Left Upper Arm) - world Y ~ 13.90, X ~ 1.85, Z ~ -0.30
    const leftUpperArmPivot = new THREE.Group();
    leftUpperArmPivot.name = 'LeftUpperArmPivot';
    leftUpperArmPivot.position.set(0.75, 0.00, -0.05); // relative to girdle
    leftShoulderGirdlePivot.add(leftUpperArmPivot);

    // 10. Khớp khuỷu tay trái (Left Forearm) - world Y ~ 11.05, X ~ 2.30, Z ~ -0.30
    const leftForearmPivot = new THREE.Group();
    leftForearmPivot.name = 'LeftForearmPivot';
    leftForearmPivot.position.set(0.45, -2.85, 0.00); // relative to upper arm
    leftUpperArmPivot.add(leftForearmPivot);

    // 11. Khớp háng phải (Right Thigh: chỏm xương đùi / ổ cối acetabulum) - world Y ~ 8.70, X ~ -0.85, Z ~ -0.10
    const rightThighPivot = new THREE.Group();
    rightThighPivot.name = 'RightThighPivot';
    rightThighPivot.position.set(-0.85, 0.00, -0.10);
    pelvisPivot.add(rightThighPivot);

    // 12. Khớp đầu gối phải (Right Shin: khe khớp gối) - world Y ~ 5.00, X ~ -0.85, Z ~ -0.15
    const rightShinPivot = new THREE.Group();
    rightShinPivot.name = 'RightShinPivot';
    rightShinPivot.position.set(0.00, -3.70, -0.05);
    rightThighPivot.add(rightShinPivot);

    // 13. Khớp háng trái (Left Thigh) - world Y ~ 8.70, X ~ 0.85, Z ~ -0.10
    const leftThighPivot = new THREE.Group();
    leftThighPivot.name = 'LeftThighPivot';
    leftThighPivot.position.set(0.85, 0.00, -0.10);
    pelvisPivot.add(leftThighPivot);

    // 14. Khớp đầu gối trái (Left Shin) - world Y ~ 5.00, X ~ 0.85, Z ~ -0.15
    const leftShinPivot = new THREE.Group();
    leftShinPivot.name = 'LeftShinPivot';
    leftShinPivot.position.set(0.00, -3.70, -0.05);
    leftThighPivot.add(leftShinPivot);

    // Map 14 pivot khớp động học hoàn chỉnh
    this.rigPivots = {
      pelvis: pelvisPivot,
      torso: torsoPivot,
      chest: chestPivot,
      neck: neckPivot,
      rightShoulderGirdle: rightShoulderGirdlePivot,
      rightUpperArm: rightUpperArmPivot,
      rightForearm: rightForearmPivot,
      leftShoulderGirdle: leftShoulderGirdlePivot,
      leftUpperArm: leftUpperArmPivot,
      leftForearm: leftForearmPivot,
      rightThigh: rightThighPivot,
      rightShin: rightShinPivot,
      leftThigh: leftThighPivot,
      leftShin: leftShinPivot
    };

    this.activeJointKeys = Object.keys(this.rigPivots);

    // Lưu trữ vị trí gốc (Base positions)
    this.basePositions = {};
    for (const [k, p] of Object.entries(this.rigPivots)) {
      this.basePositions[k] = p.position.clone();
    }

    // Góc quay và vị trí mục tiêu
    this.targetRotations = {};
    this.targetPositions = {};
    for (const k of Object.keys(this.rigPivots)) {
      this.targetRotations[k] = new THREE.Euler(0, 0, 0);
      this.targetPositions[k] = this.basePositions[k].clone();
    }

    this.rigRoot.updateMatrixWorld(true);
  }

  _saveCurrentPivotRotations() {
    const saved = {};
    for (const [k, p] of Object.entries(this.rigPivots)) {
      saved[k] = p.rotation.clone();
    }
    return saved;
  }

  _resetAllPivotsToNeutral() {
    for (const p of Object.values(this.rigPivots)) {
      p.rotation.set(0, 0, 0);
    }
  }

  _restorePivotRotations(saved) {
    if (!saved) return;
    for (const [k, rot] of Object.entries(saved)) {
      if (this.rigPivots[k]) {
        this.rigPivots[k].rotation.copy(rot);
      }
    }
  }

  // ============================================================
  // PHÂN LOẠI MESH VÀO 14 PHÂN ĐOẠN ĐỘNG HỌC (CHUẨN XÁC 100% Y KHOA)
  // Loại trừ sớm cấu trúc mông/đùi/cẳng chân -> Triệt tiêu 100% lỗi dính cơ mông vào cổ tay
  // Tích hợp Đai vai (Shoulder Girdle) nối liền bả vai - ngực - cánh tay
  // ============================================================
  _classifyMeshSegment(child, boxCenter) {
    const rawName = (child.name || '').toLowerCase();
    const clean = rawName.replace(/_/g, ' ');

    const isRight = rawName.endsWith('.r') || rawName.endsWith('r') || rawName.includes('.r.') || 
                    clean.includes(' right') || (boxCenter.x < -0.15);
    const isLeft = !isRight;

    if (clean.includes('cross section') || clean.includes('axis') || clean.includes('pointer')) return 'ignore';

    // 0. CHI DƯỚI & BÀN CHÂN: GIỚI HẠN CAO ĐỘ TUYỆT ĐỐI (Y < 7.60)
    // Trong tư thế đứng giải phẫu, bàn tay và các ngón tay khi buông thõng thấp nhất có Y >= 7.80.
    // Mọi cấu trúc có Y < 7.60 TUYỆT ĐỐI KHÔNG THUỘC CHI TRÊN (loại bỏ 100% lỗi kéo gân chân theo tay)!
    if (boxCenter.y < 7.60) {
      if (boxCenter.y < 5.15) {
        return isRight ? 'rightShin' : 'leftShin';
      }
      if (boxCenter.y <= 5.50) {
        if (clean.includes('poplite') || clean.includes('gastrocnemi') || clean.includes('soleus') || 
            clean.includes('tibia') || clean.includes('fibul') || clean.includes('anserine') || clean.includes('perone')) {
          return isRight ? 'rightShin' : 'leftShin';
        }
        return isRight ? 'rightThigh' : 'leftThigh';
      }
      // 5.50 <= Y < 7.60
      if (clean.includes('sphincter ani') || clean.includes('levator ani') || 
          clean.includes('pubo-analis') || clean.includes('coccygeus') || clean.includes('ischiocavernosus')) {
        return 'pelvis';
      }
      return isRight ? 'rightThigh' : 'leftThigh';
    }

    // Các từ khóa mông, đùi, chậu cho phần Y >= 7.60 (Mào chậu, cơ mông, túi hoạt dịch mấu chuyển)
    const lowerBodyKeywords = [
      'gluteus', 'glutea', 'trochanter', 'bursa of gluteus', 'trochanteric', 'tensor fascia', 
      'iliotibial', 'piriformis', 'pyriformis', 'obturator', 'gemellus', 'quadratus femoris', 
      'ischio', 'iliac', 'ilium', 'ischium', 'pubis', 'sacro', 'coccy', 'femur', 'femoral', 
      'patella', 'tibia', 'fibul', 'perone', 'gastrocnemi', 'soleus', 'plantar', 'poplite', 
      'adductor', 'gracilis', 'pectine', 'sartori', 'rectus femoris', 'vastus', 'biceps femoris', 
      'semitendin', 'semimembran', 'sciatic', 'saphen'
    ];
    const isLowerBody = lowerBodyKeywords.some(kw => clean.includes(kw));

    if (isLowerBody) {
      if (boxCenter.y < 8.65) {
        return isRight ? 'rightThigh' : 'leftThigh';
      }
      if (clean.includes('adductor') || clean.includes('gracilis') || clean.includes('rectus femoris') || 
          clean.includes('sartorius') || clean.includes('vastus') || clean.includes('biceps femoris')) {
        return isRight ? 'rightThigh' : 'leftThigh';
      }
      return 'pelvis';
    }

    // 1. ĐẦU & CỔ (HEAD & NECK: Y >= 14.80 HOẶC TỪ KHÓA CỔ GIẢI PHẪU)
    const head_neck_kw = [
      'sternocleidomastoid', 'platysma', 'scalen', 'splenius', 'hyoid', 'digastric',
      'mylohyoid', 'omohyoid', 'thyrohyoid', 'sternohyoid', 'sternothyroid',
      'longus colli', 'longus capitis', 'larynx', 'pharynx', 'tongue', 'constrictor',
      'cricothyroid', 'arytenoid', 'masseter', 'temporalis', 'pterygoid', 'buccinator',
      'orbicularis', 'zygomatic', 'nasalis', 'frontalis', 'occipitalis', 'auricular',
      'mental', 'corrugator', 'procerus', 'risorius', 'palpebrae'
    ];
    if (boxCenter.y >= 14.80) {
      if (clean.includes('trapezius') || clean.includes('levator scapulae') || 
          clean.includes('rhomboid') || clean.includes('erector spinae')) {
        return 'chest';
      }
      return 'neck';
    }
    if (head_neck_kw.some(k => clean.includes(k))) {
      return 'neck';
    }

    // 2. ĐAI VAI & CHÓP XOAY (SHOULDER GIRDLE: BẢ VAI, XƯƠNG ĐÒN & CƠ XOAY VAI)
    // Các cơ chóp xoay và bả vai bám từ lồng ngực/gai vai đến chỏm cánh tay:
    // Supraspinatus, Infraspinatus, Subscapularis, Teres minor/major, Levator scapulae, Rhomboids
    if (clean.includes('supraspinatus') || clean.includes('infraspinatus') || 
        clean.includes('subscapularis') || clean.includes('teres minor') || 
        clean.includes('teres major') || clean.includes('levator scapulae') || 
        clean.includes('rhomboid') || clean.includes('scapula') || 
        (clean.includes('clavic') && !clean.includes('deltoid') && !clean.includes('pectoralis'))) {
      return isRight ? 'rightShoulderGirdle' : 'leftShoulderGirdle';
    }

    // 3. CHI TRÊN (CÁNH TAY, CẲNG TAY, BÀN TAY: BẮT BUỘC Y >= 7.60)
    const upperLimbKeywords = [
      'deltoid', 'biceps brachii', 'triceps brachii', 'brachialis', 'coracobrachialis',
      'brachioradialis', 'pronator', 'supinator', 'flexor carpi', 'extensor carpi',
      'palmar', 'interossei dorsales manus', 'lumbrical manus', 'antebrachial',
      'digiti minimi of hand', 'pollicis', 'extensor indicis', 'thenar', 'hypothenar'
    ];
    const isUpperLimb = (boxCenter.y >= 7.60) && ((Math.abs(boxCenter.x) >= 1.35) || upperLimbKeywords.some(kw => clean.includes(kw)));

    if (isUpperLimb) {
      // Cơ thân mình lớn gắn vào ngực/lưng ở lại chest
      if (clean.includes('pectoralis major') || clean.includes('pectoralis minor') || 
          clean.includes('latissimus dorsi') || clean.includes('trapezius') || 
          clean.includes('serratus anterior') || clean.includes('subclavius') ||
          clean.includes('erector spinae') || clean.includes('intercostal') || clean.includes('serratus posterior')) {
        return 'chest';
      }
      if (clean.includes('obliquus') || clean.includes('rectus abdominis') || clean.includes('transversus abdominis') || 
          clean.includes('quadratus lumborum') || clean.includes('psoas') || clean.includes('iliopsoas')) {
        return 'torso';
      }

      // Khớp khuỷu tay: Y < 11.05 là Cẳng tay & Bàn tay; Y >= 11.05 là Cánh tay trên
      if (boxCenter.y < 11.05) {
        return isRight ? 'rightForearm' : 'leftForearm';
      } else {
        return isRight ? 'rightUpperArm' : 'leftUpperArm';
      }
    }

    // 4. CẲNG CHÂN & BÀN CHÂN (SHIN & FOOT: Y < 4.75)
    if (boxCenter.y < 4.75) {
      return isRight ? 'rightShin' : 'leftShin';
    }

    // Vùng khe khớp gối (4.75 <= Y <= 5.50)
    if (boxCenter.y <= 5.50) {
      if (clean.includes('poplite') || clean.includes('gastrocnemius') || clean.includes('soleus') || 
          clean.includes('tibia') || clean.includes('fibul') || clean.includes('anserine')) {
        return isRight ? 'rightShin' : 'leftShin';
      } else {
        return isRight ? 'rightThigh' : 'leftThigh';
      }
    }

    // 5. ĐÙI (THIGH: 5.50 < Y < 8.65)
    if (boxCenter.y < 8.65) {
      if (clean.includes('sphincter ani') || clean.includes('levator ani') || 
          clean.includes('pubo-analis') || clean.includes('coccygeus') || clean.includes('ischiocavernosus')) {
        return 'pelvis';
      }
      return isRight ? 'rightThigh' : 'leftThigh';
    }

    // 6. KHUNG CHẬU (PELVIS: 8.65 <= Y <= 9.35)
    if (boxCenter.y <= 9.35) {
      return 'pelvis';
    }

    // 7. LỒNG NGỰC (CHEST T1-T12: Y >= 11.05)
    if (boxCenter.y >= 11.05) {
      return 'chest';
    }

    // 8. THẮT LƯNG / THÂN DƯỚI (TORSO L1-L5: 9.35 < Y < 11.05)
    return 'torso';
  }

  // ============================================================
  // TÁCH CÁC DÂY THẦN KINH CHI DÀI QUA KHỚP (SPLIT SPANNING NERVES)
  // Giải quyết triệt để lỗi dây thần kinh bị văng ra sau khi gập khuỷu / đầu gối
  // ============================================================
  _splitNerveMeshAtY(mesh, splitY, upperSegment, lowerSegment, targetMeshList) {
    const geom = mesh.geometry;
    if (!geom || !geom.attributes || !geom.attributes.position) {
      targetMeshList.push({ mesh, segment: upperSegment });
      return;
    }

    const posAttr = geom.attributes.position;
    const normalAttr = geom.attributes.normal;
    const indexAttr = geom.index;

    // Kiểm tra bounding box trong không gian thế giới ở thế nghỉ
    const box = new THREE.Box3().setFromObject(mesh);
    if (box.min.y >= splitY) {
      targetMeshList.push({ mesh, segment: upperSegment });
      return;
    }
    if (box.max.y < splitY) {
      targetMeshList.push({ mesh, segment: lowerSegment });
      return;
    }

    const numTriangles = indexAttr ? indexAttr.count / 3 : posAttr.count / 3;
    const upperTriangles = [];
    const lowerTriangles = [];

    const vA = new THREE.Vector3();
    const vB = new THREE.Vector3();
    const vC = new THREE.Vector3();

    for (let i = 0; i < numTriangles; i++) {
      const i0 = indexAttr ? indexAttr.getX(i * 3) : i * 3;
      const i1 = indexAttr ? indexAttr.getX(i * 3 + 1) : i * 3 + 1;
      const i2 = indexAttr ? indexAttr.getX(i * 3 + 2) : i * 3 + 2;

      vA.fromBufferAttribute(posAttr, i0).applyMatrix4(mesh.matrixWorld);
      vB.fromBufferAttribute(posAttr, i1).applyMatrix4(mesh.matrixWorld);
      vC.fromBufferAttribute(posAttr, i2).applyMatrix4(mesh.matrixWorld);

      const midY = (vA.y + vB.y + vC.y) / 3;
      if (midY >= splitY) {
        upperTriangles.push(i0, i1, i2);
      } else {
        lowerTriangles.push(i0, i1, i2);
      }
    }

    const buildSubMesh = (triangles, suffix) => {
      if (!triangles || triangles.length === 0) return null;
      const subGeom = new THREE.BufferGeometry();
      const oldToNew = new Map();
      const newPositions = [];
      const newNormals = [];
      const newIndices = [];

      for (const idx of triangles) {
        if (!oldToNew.has(idx)) {
          const newIdx = newPositions.length / 3;
          oldToNew.set(idx, newIdx);
          newPositions.push(posAttr.getX(idx), posAttr.getY(idx), posAttr.getZ(idx));
          if (normalAttr) {
            newNormals.push(normalAttr.getX(idx), normalAttr.getY(idx), normalAttr.getZ(idx));
          }
        }
        newIndices.push(oldToNew.get(idx));
      }

      subGeom.setAttribute('position', new THREE.Float32BufferAttribute(newPositions, 3));
      if (newNormals.length > 0) {
        subGeom.setAttribute('normal', new THREE.Float32BufferAttribute(newNormals, 3));
      } else {
        subGeom.computeVertexNormals();
      }
      subGeom.setIndex(newIndices);

      const subMesh = new THREE.Mesh(subGeom, mesh.material);
      subMesh.name = (mesh.name || 'Nerve') + suffix;
      subMesh.position.copy(mesh.position);
      subMesh.rotation.copy(mesh.rotation);
      subMesh.scale.copy(mesh.scale);
      subMesh.matrixWorld.copy(mesh.matrixWorld);
      return subMesh;
    };

    const upperMesh = buildSubMesh(upperTriangles, '_upper');
    const lowerMesh = buildSubMesh(lowerTriangles, '_lower');

    if (upperMesh) targetMeshList.push({ mesh: upperMesh, segment: upperSegment });
    if (lowerMesh) targetMeshList.push({ mesh: lowerMesh, segment: lowerSegment });
  }

  // ============================================================
  // GẮN MÔ HÌNH VÀO CÂY ĐỘNG HỌC (ATTACH FBX TO RIG)
  // Thực hiện Pre-Pass tính toán tọa độ thế giới trước khi gán pivot
  // ============================================================
  _attachFBXToRig(fbxModel, layerType) {
    if (!this.uniformScaleFactor) {
      const box = new THREE.Box3().setFromObject(fbxModel);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());

      const targetHeight = 17.0;
      this.uniformScaleFactor = targetHeight / (size.y || 1);

      fbxModel.scale.set(this.uniformScaleFactor, this.uniformScaleFactor, this.uniformScaleFactor);

      box.setFromObject(fbxModel);
      box.getCenter(center);

      this.bodyOffsetX = -center.x;
      this.bodyOffsetY = -center.y + 9;
      this.bodyOffsetZ = -center.z;
    } else {
      fbxModel.scale.set(this.uniformScaleFactor, this.uniformScaleFactor, this.uniformScaleFactor);
    }

    fbxModel.position.x = this.bodyOffsetX;
    fbxModel.position.y = this.bodyOffsetY;
    fbxModel.position.z = this.bodyOffsetZ;

    // Cập nhật world matrix mà KHÔNG add fbxModel vào scene (tránh hiển thị các object rác/wireframe chưa được attach vào rig)
    fbxModel.updateMatrixWorld(true);

    const savedRotations = this._saveCurrentPivotRotations();
    this._resetAllPivotsToNeutral();
    this.rigRoot.updateMatrixWorld(true);

    // Giai đoạn 1: Thu thập tất cả mesh và tính bounding box chuẩn xác khi ở thế nghỉ
    const meshData = [];
    const meshBox = new THREE.Box3();
    const meshCenter = new THREE.Vector3();
    const meshSize = new THREE.Vector3();

    fbxModel.traverse((child) => {
      if (child.isMesh) {
        if (child.userData.isNoise) return;

        const rawName = (child.name || '').toLowerCase();
        if (layerType === 'nervous') {
          if (rawName.endsWith('j') || /j\d*$/i.test(rawName) || rawName.includes('.j') ||
              rawName.includes('cross_section') || rawName.includes('cross section') ||
              rawName.includes('axis') || rawName.includes('pointer')) {
            child.visible = false;
            child.userData.isNoise = true;
            return;
          }
        }

        meshBox.setFromObject(child);
        meshBox.getSize(meshSize);

        // Lọc triệt để tia nhiễu có độ dày = 0 hoặc kích thước dị thường (aspect ratio cực hạn)
        if (layerType === 'nervous') {
          const maxDim = Math.max(meshSize.x, meshSize.y, meshSize.z);
          const minDim = Math.min(meshSize.x, meshSize.y, meshSize.z);
          const vCount = child.geometry && child.geometry.attributes.position ? child.geometry.attributes.position.count : 0;
          if (minDim < 0.0005 || maxDim > 8.0 || (vCount <= 48 && maxDim > 5.0 * Math.max(minDim, 0.001))) {
            child.visible = false;
            child.userData.isNoise = true;
            return;
          }
        }

        meshBox.getCenter(meshCenter);
        const rawName = (child.name || '').toLowerCase();
        const isRight = rawName.endsWith('.r') || rawName.endsWith('r') || rawName.includes('.r.') || 
                        rawName.includes(' right') || (meshCenter.x < -0.15);

        // TÁCH DÂY THẦN KINH CHI DÀI: Khớp khuỷu tay (Y = 11.05) & Khớp gối (Y = 5.05)
        if (layerType === 'nervous') {
          const isArmNerve = (Math.abs(meshCenter.x) >= 1.25) || 
            ['median', 'radial', 'ulnar', 'musculocutaneous', 'brachial'].some(k => rawName.includes(k));
          const isLegNerve = ['sciatic', 'saphenous', 'tibial', 'fibular', 'femoral', 'sural', 'plantar'].some(k => rawName.includes(k));

          if (isArmNerve && meshBox.min.y < 11.05 && meshBox.max.y > 11.05) {
            this._splitNerveMeshAtY(child, 11.05, isRight ? 'rightUpperArm' : 'leftUpperArm', isRight ? 'rightForearm' : 'leftForearm', meshData);
            return;
          }
          if (isLegNerve && meshBox.min.y < 5.05 && meshBox.max.y > 5.05) {
            this._splitNerveMeshAtY(child, 5.05, isRight ? 'rightThigh' : 'leftThigh', isRight ? 'rightShin' : 'leftShin', meshData);
            return;
          }
        }

        const segment = this._classifyMeshSegment(child, meshCenter);
        meshData.push({ mesh: child, segment });
      }
    });

    // Giai đoạn 2: Gắn từng mesh vào đúng pivot động học
    meshData.forEach(({ mesh, segment }) => {
      if (segment === 'ignore') {
        mesh.visible = false;
        return;
      }

      const targetPivot = this.rigPivots[segment] || this.rigPivots.torso;

      mesh.userData.type = layerType;
      mesh.userData.segment = segment;

      if (layerType === 'muscle') {
        const mappedId = this._mapFBXNameToMuscleId(mesh.name);
        mesh.userData.id = mappedId || mesh.name;
        mesh.userData.meshName = mesh.name;
        mesh.visible = this.showMuscleLayer;
        this.allMuscleMeshes.push(mesh);

        if (mappedId) {
          if (!this.muscleMeshMap.has(mappedId)) {
            this.muscleMeshMap.set(mappedId, []);
          }
          this.muscleMeshMap.get(mappedId).push(mesh);
        }
      } else if (layerType === 'nervous') {
        mesh.userData.id = mesh.name;
        mesh.userData.meshName = mesh.name;
        mesh.visible = this.showNervousLayer;
        this.allNervousMeshes.push(mesh);
      }

      targetPivot.attach(mesh);
    });

    this.scene.remove(fbxModel);
    this._restorePivotRotations(savedRotations);
    this.rigRoot.updateMatrixWorld(true);
  }

  async init() {
    this._setupLighting();

    try {
      await this._loadMuscularSystemFBX();
    } catch (err) {
      console.error('Lỗi nạp hệ cơ FBX:', err);
    }

    this._setupInteraction();
    this._bindToViewModel();

    window.addEventListener('resize', this._onResize.bind(this));
    this._animate();
  }

  _setupLighting() {
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
    this.scene.add(this.ambientLight);

    this.dirLight1 = new THREE.DirectionalLight(0xffffff, 1.05);
    this.dirLight1.position.set(10, 25, 20);
    this.scene.add(this.dirLight1);

    this.dirLight2 = new THREE.DirectionalLight(0x0284c7, 0.45);
    this.dirLight2.position.set(-15, 15, -12);
    this.scene.add(this.dirLight2);

    const backLight = new THREE.DirectionalLight(0xffffff, 0.35);
    backLight.position.set(0, -10, -10);
    this.scene.add(backLight);
  }

  // ============================================================
  // NẠP 2 LỚP MÔ HÌNH CHÍNH (HỆ CƠ & HỆ THẦN KINH)
  // ============================================================
  async _loadMuscularSystemFBX() {
    return new Promise((resolve, reject) => {
      const loader = new FBXLoader();
      loader.load(
        'assets/models/MuscularSystem.fbx',
        (fbx) => {
          // MẶC ĐỊNH: MÀU XÁM SLATE TRUNG TÍNH Y KHOA + ĐỤC 100% (OPAQUE SOLID)
          const neutralMuscleMat = new THREE.MeshPhongMaterial({
            color: 0x94a3b8, // Xám Slate trung tính
            transparent: true,
            opacity: 1.0,
            shininess: 30,
            depthWrite: true
          });

          fbx.traverse((child) => {
            if (child.isMesh) {
              child.material = neutralMuscleMat.clone();
            }
          });

          this._attachFBXToRig(fbx, 'muscle');
          this._hideLoadingOverlay();
          console.info(`✅ Đã nạp & Rigging ${this.allMuscleMeshes.length} thớ cơ thật từ Z-Anatomy!`);
          resolve();
        },
        (xhr) => {
          if (xhr.lengthComputable) {
            const percent = Math.round((xhr.loaded / xhr.total) * 100);
            this._updateLoadingText(`Đang tải hệ cơ Z-Anatomy (${percent}%)...`);
          }
        },
        (error) => {
          this._hideLoadingOverlay();
          reject(error);
        }
      );
    });
  }

  async _loadNervousSystemFBX() {
    if (this.isNervousLoaded) return;
    this._updateLoadingText('Đang nạp & liên kết hệ thần kinh Z-Anatomy (vàng neon)...');

    return new Promise((resolve, reject) => {
      const loader = new FBXLoader();
      loader.load(
        'assets/models/NervousSystem.fbx',
        (fbx) => {
          const nervousMat = new THREE.MeshPhongMaterial({
            color: 0xfacc15,
            emissive: 0xca8a04,
            emissiveIntensity: 0.55,
            transparent: true,
            opacity: this.nervousOpacity,
            shininess: 50
          });

          fbx.traverse((child) => {
            if (child.isMesh) {
              const name = (child.name || '').toLowerCase();
              const box = new THREE.Box3().setFromObject(child);
              const size = box.getSize(new THREE.Vector3());
              const vCount = child.geometry && child.geometry.attributes.position ? child.geometry.attributes.position.count : 0;
              const maxDim = Math.max(size.x, size.y, size.z);
              const minDim = Math.min(size.x, size.y, size.z);
              const isNeedle = (vCount <= 48 && maxDim > 5.0 * Math.max(minDim, 0.001));

              const isNoise = 
                name.endsWith('j') || /j\d*$/i.test(name) || name.includes('.j') ||
                name.includes('cross_section') || name.includes('cross section') ||
                name.includes('axis') || name.includes('pointer') ||
                name.includes('optic_axis') || name.includes('sulcus_sclerae') ||
                name.includes('inferior_frontal_sulcus') ||
                isNeedle || minDim < 0.0005;

              if (isNoise) {
                child.visible = false;
                child.userData.isNoise = true;
                return;
              }
              child.material = nervousMat.clone();
            }
          });

          this._attachFBXToRig(fbx, 'nervous');
          this.isNervousLoaded = true;
          this._hideLoadingOverlay();
          console.info(`✅ Đã nạp & liên kết hệ thần kinh vào Rig!`);
          resolve();
        },
        undefined,
        (err) => {
          this._hideLoadingOverlay();
          reject(err);
        }
      );
    });
  }

  _mapFBXNameToMuscleId(name) {
    if (!name) return null;
    const n = name.toLowerCase().replace(/_/g, ' ');

    if (n.includes('acromial part of deltoid')) return 'deltoid_middle';
    if (n.includes('clavicular part of deltoid')) return 'deltoid_anterior';
    if (n.includes('spinal part of deltoid')) return 'deltoid_posterior';
    if (n.includes('deltoid')) return 'deltoid_middle';

    if (n.includes('supraspinatus')) return 'supraspinatus';
    if (n.includes('infraspinatus')) return 'infraspinatus';
    if (n.includes('teres minor')) return 'teres_minor';
    if (n.includes('teres major')) return 'teres_major';
    if (n.includes('subscapularis')) return 'subscapularis';

    if (n.includes('ascending part of trapezius')) return 'trapezius_lower';
    if (n.includes('transverse part of trapezius')) return 'trapezius_middle';
    if (n.includes('descending part of trapezius')) return 'trapezius_upper';
    if (n.includes('trapezius')) return 'trapezius_upper';

    if (n.includes('pectoralis major')) return 'pectoralis_major';
    if (n.includes('latissimus dorsi')) return 'latissimus_dorsi';
    if (n.includes('serratus anterior')) return 'serratus_anterior';
    if (n.includes('levator scapulae')) return 'levator_scapulae';
    if (n.includes('rhomboid major')) return 'rhomboid_major';
    if (n.includes('rhomboid minor')) return 'rhomboid_minor';

    if (n.includes('biceps brachii')) return 'biceps_brachii';
    if (n.includes('triceps brachii')) return 'triceps_brachii';
    if (n.includes('brachialis')) return 'brachialis';
    if (n.includes('coracobrachialis')) return 'coracobrachialis';
    if (n.includes('brachioradialis')) return 'brachioradialis';

    if (n.includes('external oblique') || (n.includes('oblique') && n.includes('extern'))) return 'oblique_externus';
    if (n.includes('internal oblique') || (n.includes('oblique') && n.includes('intern'))) return 'oblique_internus';
    if (n.includes('rectus abdominis')) return 'rectus_abdominis';
    if (n.includes('erector spinae') || n.includes('iliocostalis') || n.includes('longissimus') || n.includes('spinalis')) return 'erector_spinae';

    if (n.includes('piriformis')) return 'piriformis';
    if (n.includes('gluteus maximus')) return 'gluteus_maximus';
    if (n.includes('gluteus medius')) return 'gluteus_medius';
    if (n.includes('iliopsoas') || n.includes('psoas major') || n.includes('iliacus')) return 'iliopsoas';
    if (n.includes('rectus femoris') || n.includes('vastus')) return 'rectus_femoris';
    if (n.includes('biceps femoris') || n.includes('semitendinosus') || n.includes('semimembranosus')) return 'biceps_femoris';

    if (n.includes('tibialis anterior')) return 'tibialis_anterior';
    if (n.includes('gastrocnemius') || n.includes('soleus')) return 'gastrocnemius';

    return null;
  }

  _updateLoadingText(text) {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
      overlay.style.display = 'flex';
      const p = overlay.querySelector('p');
      if (p) p.textContent = text;
      const spinner = overlay.querySelector('.spinner');
      if (spinner) spinner.style.display = 'block';
    }
  }

  _hideLoadingOverlay() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) overlay.style.display = 'none';
  }

  // ============================================================
  // TƯƠNG TÁC RAYCASTING & TOOLTIP
  // ============================================================
  _setupInteraction() {
    const onMouseMove = (event) => {
      const rect = this.renderer.domElement.getBoundingClientRect();
      this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);
      
      const objectsToTest = [];
      if (this.activeAcupointMeshes.length > 0) objectsToTest.push(...this.activeAcupointMeshes);
      if (this.showMuscleLayer) objectsToTest.push(...this.allMuscleMeshes);
      if (this.showNervousLayer) objectsToTest.push(...this.allNervousMeshes);

      const intersects = this.raycaster.intersectObjects(objectsToTest, false);

      if (intersects.length > 0) {
        const object = intersects[0].object;
        if (this.hoveredObject !== object) {
          this.hoveredObject = object;
          this.tooltip.style.display = 'block';
          this.tooltip.textContent = this._getLocalizedName(object);
        }

        const containerRect = this.container.getBoundingClientRect();
        this.tooltip.style.left = `${event.clientX - containerRect.left + 12}px`;
        this.tooltip.style.top = `${event.clientY - containerRect.top + 12}px`;
      } else {
        if (this.hoveredObject) {
          this.hoveredObject = null;
        }
        this.tooltip.style.display = 'none';
      }
    };

    const onClick = () => {
      if (!this.hoveredObject) return;

      if (this.hoveredObject.userData.type === 'acupoint') {
        const code = this.hoveredObject.userData.code;
        if (this.appVM.acupunctureVM) {
          this.appVM.acupunctureVM.selectAcupoint(code);
        }
      } else if (this.hoveredObject.userData.type === 'muscle') {
        const muscleId = this.hoveredObject.userData.id;
        if (this.appVM.movementVM) {
          this.appVM.movementVM.selectMuscleForDetail(muscleId);
        }
      }
    };

    this.renderer.domElement.addEventListener('mousemove', onMouseMove);
    this.renderer.domElement.addEventListener('click', onClick);
  }

  _translateAnatomyNameToVi(rawName, category) {
    if (!rawName) return 'Cấu trúc giải phẫu';
    let name = rawName.replace(/_/g, ' ').replace(/\.00\d+/g, '').replace(/_upper|_lower/g, '').trim();

    const isRight = name.endsWith('.r') || name.endsWith(' r') || name.includes('.r.');
    const isLeft = name.endsWith('.l') || name.endsWith(' l') || name.includes('.l.');
    const sideSuffix = isRight ? ' (phải)' : (isLeft ? ' (trái)' : '');

    // Làm sạch hậu tố định hướng
    name = name.replace(/\.[rl](\.|$)/gi, '').replace(/\b(left|right)\b/gi, '').trim();
    const lower = name.toLowerCase();

    // 1. Thần kinh chính
    const nerveDict = {
      'median nerve': 'Dây thần kinh Giữa',
      'radial nerve': 'Dây thần kinh Quay',
      'ulnar nerve': 'Dây thần kinh Trụ',
      'musculocutaneous nerve': 'Dây thần kinh Cơ bì',
      'axillary nerve': 'Dây thần kinh Nách',
      'sciatic nerve': 'Dây thần kinh Tọa (Hông to)',
      'femoral nerve': 'Dây thần kinh Đùi',
      'tibial nerve': 'Dây thần kinh Chày',
      'common fibular nerve': 'Dây thần kinh Mác chung',
      'superficial fibular nerve': 'Dây thần kinh Mác nông',
      'deep fibular nerve': 'Dây thần kinh Mác sâu',
      'saphenous nerve': 'Dây thần kinh Hiển',
      'sural nerve': 'Dây thần kinh Bắp chân',
      'obturator nerve': 'Dây thần kinh Bịt',
      'genitofemoral nerve': 'Dây thần kinh Sinh dục đùi',
      'lateral femoral cutaneous nerve': 'Dây TK bì đùi ngoài',
      'posterior femoral cutaneous nerve': 'Dây TK bì đùi sau',
      'lateral antebrachial cutaneous nerve': 'Dây TK bì cẳng tay ngoài',
      'medial antebrachial cutaneous nerve': 'Dây TK bì cẳng tay trong',
      'posterior antebrachial cutaneous nerve': 'Dây TK bì cẳng tay sau',
      'superior lateral brachial cutaneous nerve': 'Dây TK bì cánh tay ngoài trên',
      'inferior lateral brachial cutaneous nerve': 'Dây TK bì cánh tay ngoài dưới',
      'medial brachial cutaneous nerve': 'Dây TK bì cánh tay trong',
      'proper palmar digital branches of median nerve': 'Các nhánh gan ngón tay riêng (TK Giữa)',
      'proper palmar digital branches of ulnar nerve': 'Các nhánh gan ngón tay riêng (TK Trụ)',
      'common palmar digital branches of median nerve': 'Các nhánh gan ngón tay chung (TK Giữa)',
      'common palmar digital branches of ulnar nerve': 'Các nhánh gan ngón tay chung (TK Trụ)',
      'dorsal digital branches of radial nerve': 'Các nhánh mu ngón tay (TK Quay)',
      'dorsal digital branches of ulnar nerve': 'Các nhánh mu ngón tay (TK Trụ)',
      'muscular branches of radial nerve': 'Các nhánh cơ (TK Quay)',
      'muscular branches of median nerve': 'Các nhánh cơ (TK Giữa)',
      'muscular branches of ulnar nerve': 'Các nhánh cơ (TK Trụ)',
      'palmar branch of median nerve': 'Nhánh gan tay (TK Giữa)',
      'palmar branch of ulnar nerve': 'Nhánh gan tay (TK Trụ)',
      'deep branch of radial nerve': 'Nhánh sâu (TK Quay)',
      'superficial branch of radial nerve': 'Nhánh nông (TK Quay)',
      'lateral plantar nerve': 'Dây thần kinh Gan chân ngoài',
      'medial plantar nerve': 'Dây thần kinh Gan chân trong',
      'proper plantar digital branches': 'Các nhánh gan ngón chân riêng',
      'brachial plexus': 'Đám rối thần kinh cánh tay',
      'spinal cord': 'Tủy sống',
      'spinal dura': 'Màng cứng tủy gai',
      'spinal nerves': 'Các dây thần kinh gai sống',
      'thoracic nerves': 'Các dây thần kinh ngực',
      'lumbar nerves': 'Các dây thần kinh thắt lưng',
      'sacral nerves': 'Các dây thần kinh cùng',
      'cranial nerves': 'Các dây thần kinh sọ não',
      'vagus nerve': 'Dây thần kinh Phế vị (X)',
      'accessory nerve': 'Dây thần kinh Phụ (XI)',
      'hypoglossal nerve': 'Dây thần kinh Hạ thiệt (XII)',
      'glossopharyngeal nerve': 'Dây thần kinh Thiệt hầu (IX)',
      'vestibulocochlear nerve': 'Dây thần kinh Tiền đình ốc tai (VIII)',
      'facial nerve': 'Dây thần kinh Mặt (VII)',
      'abducens nerve': 'Dây thần kinh Vận nhãn ngoài (VI)',
      'trigeminal nerve': 'Dây thần kinh Tam thoa / Sinh ba (V)',
      'trochlear nerve': 'Dây thần kinh Ròng rọc (IV)',
      'oculomotor nerve': 'Dây thần kinh Vận nhãn (III)',
      'optic nerve': 'Dây thần kinh Thị giác (II)',
      'olfactory nerve': 'Dây thần kinh Khứu giác (I)',
      'brain': 'Não bộ',
      'cerebrum': 'Đại não',
      'cerebral hemisphere': 'Bán cầu đại não',
      'cerebellum': 'Tiểu não',
      'brainstem': 'Thân não',
      'pons': 'Cầu não',
      'medulla oblongata': 'Hành não'
    };

    for (const [key, val] of Object.entries(nerveDict)) {
      if (lower.includes(key)) {
        return `${val}${sideSuffix}`;
      }
    }

    // 2. Bao hoạt dịch & Mạc gân
    const bursaDict = {
      'trochanteric bursa of gluteus medius': 'Túi thanh dịch mấu chuyển cơ mông nhỡ',
      'trochanteric bursa of gluteus minimus': 'Túi thanh dịch mấu chuyển cơ mông bé',
      'subcutaneous trochanteric bursa': 'Túi thanh dịch dưới da mấu chuyển lớn',
      'subdeltoid bursa': 'Túi thanh dịch dưới cơ delta',
      'subacromial bursa': 'Túi thanh dịch dưới mỏm cùng vai',
      'bicipitoradial bursa': 'Túi thanh dịch nhị đầu - quay',
      'subtendinous bursa of triceps brachii': 'Túi thanh dịch dưới gân cơ tam đầu',
      'subtendinous bursa of infraspinatus': 'Túi thanh dịch dưới gân cơ dưới gai',
      'subtendinous bursa of teres major': 'Túi thanh dịch dưới gân cơ tròn lớn',
      'subcutaneous prepatellar bursa': 'Túi thanh dịch dưới da trước bánh chè',
      'infrapatellar bursa': 'Túi thanh dịch dưới bánh chè',
      'suprapatellar bursa': 'Túi thanh dịch trên bánh chè',
      'antebrachial fascia': 'Cân mạc cẳng tay',
      'thoracolumbar fascia': 'Cân ngực - thắt lưng',
      'fascia lata': 'Mạc đùi (Fascia lata)',
      'deltoid fascia': 'Cân cơ delta',
      'iliotibial tract': 'Dải chậu - chày'
    };

    for (const [key, val] of Object.entries(bursaDict)) {
      if (lower.includes(key)) {
        return `${val}${sideSuffix}`;
      }
    }

    // 3. Cơ bắp
    let vi = name
      .replace(/^musculus\s+/i, '')
      .replace(/\s+muscle$/i, '')
      .replace(/clavicular part of deltoid/i, 'Cơ Delta phần đòn')
      .replace(/acromial part of deltoid/i, 'Cơ Delta phần cùng vai')
      .replace(/scapular spinal part of deltoid/i, 'Cơ Delta phần gai vai')
      .replace(/deltoid/i, 'Cơ Delta')
      .replace(/supraspinatus/i, 'Cơ Trên gai')
      .replace(/infraspinatus/i, 'Cơ Dưới gai')
      .replace(/subscapularis/i, 'Cơ Dưới vai')
      .replace(/teres minor/i, 'Cơ Tròn bé')
      .replace(/teres major/i, 'Cơ Tròn lớn')
      .replace(/pectoralis major/i, 'Cơ Ngực lớn')
      .replace(/pectoralis minor/i, 'Cơ Ngực bé')
      .replace(/latissimus dorsi/i, 'Cơ Lưng rộng')
      .replace(/trapezius/i, 'Cơ Thang')
      .replace(/serratus anterior/i, 'Cơ Răng trước')
      .replace(/levator scapulae/i, 'Cơ Nâng vai')
      .replace(/rhomboid major/i, 'Cơ Trám lớn')
      .replace(/rhomboid minor/i, 'Cơ Trám bé')
      .replace(/biceps brachii/i, 'Cơ Nhị đầu cánh tay')
      .replace(/triceps brachii/i, 'Cơ Tam đầu cánh tay')
      .replace(/brachialis/i, 'Cơ Cánh tay')
      .replace(/coracobrachialis/i, 'Cơ Quạ cánh tay')
      .replace(/brachioradialis/i, 'Cơ Cánh tay quay')
      .replace(/pronator teres/i, 'Cơ Sấp tròn')
      .replace(/pronator quadratus/i, 'Cơ Sấp vuông')
      .replace(/supinator/i, 'Cơ Ngửa')
      .replace(/gluteus maximus/i, 'Cơ Mông lớn')
      .replace(/gluteus medius/i, 'Cơ Mông nhỡ')
      .replace(/gluteus minimus/i, 'Cơ Mông bé')
      .replace(/tensor fasciae latae/i, 'Cơ Căng mạc đùi')
      .replace(/piriformis/i, 'Cơ Hình lê')
      .replace(/rectus femoris/i, 'Cơ Thẳng đùi')
      .replace(/biceps femoris/i, 'Cơ Nhị đầu đùi')
      .replace(/semitendinosus/i, 'Cơ Bán gân')
      .replace(/semimembranosus/i, 'Cơ Bán màng')
      .replace(/gastrocnemius/i, 'Cơ Bụng chân')
      .replace(/soleus/i, 'Cơ Dép')
      .replace(/tibialis anterior/i, 'Cơ Chày trước')
      .replace(/tibialis posterior/i, 'Cơ Chày sau');

    return `${vi}${sideSuffix}`;
  }

  _getLocalizedName(object) {
    if (!object || !object.userData) return '';
    const ud = object.userData;

    if (ud.type === 'acupoint') {
      return `🔴 Huyệt ${ud.name_vi} (${ud.code})`;
    } else if (ud.type === 'muscle') {
      if (this.appVM && this.appVM.muscleData) {
        const m = this.appVM.muscleData[ud.id];
        if (m && m.name_vi) return `💪 ${m.name_vi}`;
      }
      return `💪 ${this._translateAnatomyNameToVi(ud.meshName || object.name, 'muscle')}`;
    } else if (ud.type === 'nervous') {
      return `🧠 ${this._translateAnatomyNameToVi(ud.meshName || object.name, 'nervous')}`;
    }
    return this._translateAnatomyNameToVi(object.name, 'general');
  }

  _bindToViewModel() {
    if (!this.sceneVM) return;

    this.sceneVM.on('highlightedMuscles', muscles => this._updateMuscleHighlights(muscles));
    
    this.sceneVM.on('showMuscleLayer', show => {
      this.showMuscleLayer = Boolean(show);
      this.allMuscleMeshes.forEach(m => m.visible = Boolean(show));
    });

    this.sceneVM.on('showNervousLayer', show => {
      this.showNervousLayer = Boolean(show);
      if (show && !this.isNervousLoaded) {
        this._loadNervousSystemFBX();
      } else {
        this.allNervousMeshes.forEach(m => m.visible = Boolean(show));
      }
    });

    this.sceneVM.on('muscleOpacity', opacity => this.setMuscleOpacity(opacity));
    this.sceneVM.on('nervousOpacity', opacity => this.setNervousOpacity(opacity));
    this.sceneVM.on('displayedAcupoints', acupoints => this.displayAcupoints(acupoints));
    this.sceneVM.on('focusedAcupointCode', code => this.focusAcupoint(code));

    if (this.appVM.movementVM) {
      this.appVM.movementVM.on('selectedMovementId', movementId => {
        this._applyStatuePose(movementId);
      });
    }
  }

  // ============================================================
  // HỆ THỐNG TƯ THẾ TƯỢNG ĐỘNG HỌC (CHUẨN HÓA GÓC SINH LÝ Y KHOA 12 KHỚP)
  // Kết hợp khớp ngực Chest trung gian & triệt tiêu lỗi tách rời đùi - lưng
  // ============================================================
  _applyStatuePose(movementId) {
    for (const k of Object.keys(this.targetRotations)) {
      this.targetRotations[k].set(0, 0, 0);
      this.targetPositions[k].copy(this.basePositions[k]);
    }

    if (!movementId) return;

    switch (movementId) {
      // 1. NÂNG TAY LÊN CAO QUA ĐẦU (Overhead Reach)
      // Khớp ngực mở nhẹ ra sau, đai vai xoay lên trên 25°, cánh tay vươn cao 65°, cổ ngửa theo
      case 'overhead_reach':
        this.targetRotations.chest.set(-0.06, 0, -0.05);
        this.targetRotations.neck.set(-0.15, -0.10, 0);
        this.targetRotations.rightShoulderGirdle.set(0.04, 0.05, -0.40);
        this.targetRotations.rightUpperArm.set(0.06, 0.10, -1.05);
        this.targetRotations.rightForearm.set(-0.25, 0, 0);
        this.targetRotations.leftUpperArm.set(0, 0, 0.12);
        this.targetRotations.leftForearm.set(0, 0, 0);
        this.targetRotations.torso.set(0, 0, -0.03);
        break;

      // 2. XOAY NGƯỜI / XOAY THÂN MÌNH (Trunk Rotation)
      // Phân bổ xoay đa tầng: Lưng dưới 0.20 rad, Lồng ngực xoay thêm 0.28 rad
      case 'trunk_rotation':
        this.targetRotations.torso.set(0, 0.20, 0);
        this.targetRotations.chest.set(0, 0.28, 0);
        this.targetRotations.neck.set(0, 0.18, 0);
        this.targetRotations.rightShoulderGirdle.set(0, -0.10, 0);
        this.targetRotations.leftShoulderGirdle.set(0, 0.10, 0);
        this.targetRotations.rightUpperArm.set(0, -0.12, 0.10);
        this.targetRotations.leftUpperArm.set(0, 0.12, -0.10);
        break;

      // 3. BƯỚC ĐI (Gait Cycle) - Khớp háng & khe khớp gối ăn khớp sinh lý
      case 'walking_gait':
        this.targetRotations.rightThigh.set(-0.32, 0, 0.02);
        this.targetRotations.rightShin.set(0.12, 0, 0);
        this.targetRotations.leftThigh.set(0.26, 0, -0.02);
        this.targetRotations.leftShin.set(0.32, 0, 0);
        this.targetRotations.leftUpperArm.set(-0.35, 0, -0.05);
        this.targetRotations.leftForearm.set(-0.15, 0, 0);
        this.targetRotations.rightUpperArm.set(0.30, 0, 0.05);
        this.targetRotations.chest.set(0, -0.08, 0);
        this.targetRotations.torso.set(0, 0.05, 0);
        break;

      // 4. CÚI NGƯỜI GẬP LƯNG (Forward Trunk Bending) - CƠ SINH HỌC CHUẨN XÁC
      case 'forward_bending':
        this.targetRotations.pelvis.set(0.68, 0, 0);
        this.targetRotations.rightThigh.set(-0.68, 0, 0);
        this.targetRotations.leftThigh.set(-0.68, 0, 0);
        this.targetRotations.torso.set(0.35, 0, 0);
        this.targetRotations.chest.set(0.30, 0, 0);
        this.targetRotations.neck.set(0.12, 0, 0);
        this.targetRotations.rightUpperArm.set(-1.10, 0, 0);
        this.targetRotations.leftUpperArm.set(-1.10, 0, 0);
        this.targetRotations.rightForearm.set(0, 0, 0);
        this.targetRotations.leftForearm.set(0, 0, 0);
        this.targetPositions.pelvis.z = this.basePositions.pelvis.z - 0.35;
        this.targetPositions.pelvis.y = this.basePositions.pelvis.y - 0.10;
        break;

      // 5. GIƯƠNG CUNG BẮN TÊN (Archer Draw)
      case 'archer_pull':
      case 'daodan_archer_pull':
        this.targetRotations.torso.set(0, 0.20, 0);
        this.targetRotations.chest.set(0, 0.28, 0);
        this.targetRotations.neck.set(0, 0.42, 0);
        this.targetRotations.leftShoulderGirdle.set(0, 0, -0.15);
        this.targetRotations.leftUpperArm.set(-0.10, 0.15, 1.25);
        this.targetRotations.leftForearm.set(0, 0, 0);
        this.targetRotations.rightShoulderGirdle.set(0.05, -0.25, -0.30);
        this.targetRotations.rightUpperArm.set(0.10, -0.15, -1.05);
        this.targetRotations.rightForearm.set(-1.85, 0, 0);
        this.targetRotations.rightThigh.set(0, 0, -0.15);
        this.targetRotations.leftThigh.set(0, 0, 0.15);
        break;

      // 6. THẾ ĐẠO DẪN: ĐƯA TAY RA SAU LƯNG CHẠM CỔ GÁY (Hand-Behind-Back & Up)
      case 'daodan_hand_behind_back':
        this.targetRotations.torso.set(0, -0.10, 0);
        this.targetRotations.chest.set(-0.08, -0.15, 0);
        this.targetRotations.neck.set(0.08, 0.05, 0);
        this.targetRotations.rightShoulderGirdle.set(0.12, -0.20, -0.15);
        this.targetRotations.rightUpperArm.set(0.40, -0.75, 0.35);
        this.targetRotations.rightForearm.set(-1.90, -0.35, 0);
        break;

      // 7. GIẠNG VAI (Shoulder Abduction) - Phối hợp nhịp bả vai - cánh tay (2:1)
      case 'shoulder_abduction':
        this.targetRotations.chest.set(0, 0, -0.06);
        this.targetRotations.rightShoulderGirdle.set(0, 0, -0.38);
        this.targetRotations.rightUpperArm.set(0, 0, -1.15);
        this.targetRotations.rightForearm.set(0, 0, 0);
        break;

      // 8. KHÉP VAI (Shoulder Adduction)
      // Cánh tay khép đưa nhẹ ra trước bụng (anterior horizontal adduction), loại bỏ 100% clipping vào hông
      case 'shoulder_adduction':
        this.targetRotations.rightShoulderGirdle.set(0, 0.08, 0.05);
        this.targetRotations.rightUpperArm.set(-0.35, 0.22, 0.16);
        this.targetRotations.rightForearm.set(-0.45, 0.10, 0);
        break;

      // 9. GẬP VAI (Shoulder Flexion)
      case 'shoulder_flexion':
        this.targetRotations.chest.set(-0.04, 0, 0);
        this.targetRotations.rightShoulderGirdle.set(-0.35, 0, 0);
        this.targetRotations.rightUpperArm.set(-1.10, 0, 0);
        this.targetRotations.rightForearm.set(0, 0, 0);
        break;

      // 10. DUỖI VAI (Shoulder Extension)
      case 'shoulder_extension':
        this.targetRotations.chest.set(0.04, 0, 0);
        this.targetRotations.rightShoulderGirdle.set(0.15, 0, 0);
        this.targetRotations.rightUpperArm.set(0.50, 0, 0);
        this.targetRotations.rightForearm.set(0, 0, 0);
        break;

      // 11. XOAY TRONG VAI (Shoulder Internal Rotation)
      case 'shoulder_internal_rotation':
        this.targetRotations.rightShoulderGirdle.set(0, 0.15, 0);
        this.targetRotations.rightUpperArm.set(-0.15, 0.85, -0.20);
        this.targetRotations.rightForearm.set(-1.57, 0, 0);
        break;

      // 12. XOAY NGOÀI VAI (Shoulder External Rotation)
      case 'shoulder_external_rotation':
        this.targetRotations.rightShoulderGirdle.set(0, -0.15, 0);
        this.targetRotations.rightUpperArm.set(0.10, -0.85, -0.20);
        this.targetRotations.rightForearm.set(-1.57, 0, 0);
        break;

      // 13. NÂNG XƯƠNG BẢ VAI (Scapular Elevation)
      case 'scapular_elevation':
        this.targetRotations.rightShoulderGirdle.set(0, 0, -0.22);
        this.targetRotations.leftShoulderGirdle.set(0, 0, 0.22);
        this.targetPositions.rightShoulderGirdle.y = this.basePositions.rightShoulderGirdle.y + 0.22;
        this.targetPositions.leftShoulderGirdle.y = this.basePositions.leftShoulderGirdle.y + 0.22;
        this.targetPositions.chest.y = this.basePositions.chest.y + 0.15;
        this.targetRotations.neck.set(0.08, 0, 0);
        break;

      // 14. KHÉP XƯƠNG BẢ VAI (Scapular Retraction)
      case 'scapular_retraction':
        this.targetRotations.chest.set(-0.12, 0, 0);
        this.targetRotations.rightShoulderGirdle.set(0, -0.25, 0.10);
        this.targetRotations.leftShoulderGirdle.set(0, 0.25, -0.10);
        this.targetRotations.rightUpperArm.set(0.25, -0.15, -0.10);
        this.targetRotations.leftUpperArm.set(0.25, 0.15, 0.10);
        break;

      // 15. GẬP KHUỶU TAY (Elbow Flexion)
      case 'elbow_flexion':
        this.targetRotations.rightUpperArm.set(-0.10, 0, 0);
        this.targetRotations.rightForearm.set(-2.00, 0, 0);
        break;

      // 16. DUỖI KHUỶU TAY (Elbow Extension)
      case 'elbow_extension':
        this.targetRotations.rightUpperArm.set(0.10, 0, 0);
        this.targetRotations.rightForearm.set(0, 0, 0);
        break;

      default:
        break;
    }
  }

  _updatePoseInterpolation() {
    const lerpSpeed = 0.085;

    for (const key of this.activeJointKeys) {
      const pivot = this.rigPivots[key];
      const targetRot = this.targetRotations[key];
      const targetPos = this.targetPositions[key];

      if (targetRot && pivot) {
        pivot.rotation.x += (targetRot.x - pivot.rotation.x) * lerpSpeed;
        pivot.rotation.y += (targetRot.y - pivot.rotation.y) * lerpSpeed;
        pivot.rotation.z += (targetRot.z - pivot.rotation.z) * lerpSpeed;
      }

      if (targetPos && pivot) {
        pivot.position.lerp(targetPos, lerpSpeed);
      }
    }
  }

  // ============================================================
  // HIGHLIGHT CƠ THÔNG MINH (CHẾ ĐỘ X-RAY GHOST SILHOUETTE CHO CƠ SÂU)
  // Khi không chọn chuyển động: Tượng đặc 100% màu xám slate
  // Khi chọn chuyển động: Cơ nền mờ trong suốt (X-Ray), cơ tham gia sáng rực nổi bật
  // ============================================================
  _updateMuscleHighlights(muscles) {
    const hasMovement = Boolean(muscles && muscles.length > 0);
    const neutralColor = 0x94a3b8; // Xám Slate y khoa trung tính

    if (!hasMovement) {
      // Trạng thái tượng bình thường: Đục 100% (hoặc theo thanh trượt muscleOpacity)
      const isSolid = this.muscleOpacity >= 0.99;
      this.allMuscleMeshes.forEach((mesh) => {
        mesh.material.color.setHex(neutralColor);
        mesh.material.emissive.setHex(0x000000);
        mesh.material.emissiveIntensity = 0;
        mesh.material.opacity = this.muscleOpacity;
        mesh.material.transparent = !isSolid;
        mesh.material.depthWrite = isSolid;
        mesh.material.needsUpdate = true;
        mesh.renderOrder = 0;
      });
      return;
    }

    // Khi có chuyển động: Cơ nền chuyển sang hiệu ứng X-Ray bán trong suốt (Ghost Silhouette)
    // Giúp các nhóm cơ sâu bên trong (Supraspinatus, Subscapularis, Psoas...) không bị che khuất
    const ghostOpacity = 0.28 * this.muscleOpacity;
    this.allMuscleMeshes.forEach((mesh) => {
      mesh.material.color.setHex(neutralColor);
      mesh.material.emissive.setHex(0x000000);
      mesh.material.emissiveIntensity = 0;
      mesh.material.opacity = ghostOpacity;
      mesh.material.transparent = true;
      mesh.material.depthWrite = false; // Ngăn che khuất cơ sâu bên trong
      mesh.material.needsUpdate = true;
      mesh.renderOrder = 0;
    });

    const roleColorMap = {
      agonist: 0xef4444,          // Đỏ rực - Chủ vận
      antagonist: 0x0ea5e9,       // Cyan - Đối vận
      synergist: 0xf59e0b,        // Cam Amber - Hiệp đồng
      stabilizer: 0x10b981,       // Xanh lá - Ổn định
      pain: 0xdc2626,             // Đỏ Crimson - Vùng đau / Trigger Point
      chain: 0xf59e0b,            // Vàng hổ phách - Chuỗi cơ liên đới
      antagonist_tight: 0x0284c7  // Xanh dương - Cơ co rút đối ứng
    };

    muscles.forEach(m => {
      const mId = m.id || m.muscleId;
      const meshList = this.muscleMeshMap.get(mId);
      if (meshList && Array.isArray(meshList)) {
        const hex = roleColorMap[m.role] || 0xef4444;
        meshList.forEach(mesh => {
          mesh.material.color.setHex(hex);
          mesh.material.emissive.setHex(hex);
          mesh.material.emissiveIntensity = 0.75;
          mesh.material.opacity = this.muscleOpacity;
          mesh.material.transparent = this.muscleOpacity < 0.99;
          mesh.material.depthWrite = true;
          mesh.material.needsUpdate = true;
          mesh.renderOrder = 10; // Render sau các mesh mờ để luôn nổi lên trên
        });
      }
    });
  }

  // ============================================================
  // HỆ THỐNG ĐIỂM HUYỆT 3D (INTERACTIVE 3D ACUPOINT MARKERS)
  // ============================================================
  displayAcupoints(acupoints = []) {
    // Xóa các điểm huyệt cũ
    while (this.acupointGroup.children.length > 0) {
      const obj = this.acupointGroup.children[0];
      this.acupointGroup.remove(obj);
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) obj.material.dispose();
    }
    this.activeAcupointMeshes = [];

    if (!acupoints || acupoints.length === 0) return;

    acupoints.forEach(pt => {
      if (!pt.position_3d) return;

      // 1. Hình cầu huyệt vị phát sáng (Glowing Core Sphere)
      const sphereGeo = new THREE.SphereGeometry(0.18, 16, 16);
      const sphereMat = new THREE.MeshBasicMaterial({
        color: 0xef4444, // Đỏ rực châm cứu
        depthTest: false,
        transparent: true,
        opacity: 0.95
      });
      const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
      sphereMesh.position.set(pt.position_3d.x, pt.position_3d.y, pt.position_3d.z);
      sphereMesh.renderOrder = 999;
      sphereMesh.userData = {
        type: 'acupoint',
        code: pt.code,
        name_vi: pt.name_vi,
        data: pt
      };

      // 2. Vòng hào quang xung quanh (Pulsing Halo Ring)
      const ringGeo = new THREE.RingGeometry(0.24, 0.32, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xfacc15, // Vàng neon
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85,
        depthTest: false
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.lookAt(this.camera.position);
      sphereMesh.add(ringMesh);

      this.acupointGroup.add(sphereMesh);
      this.activeAcupointMeshes.push(sphereMesh);
    });
  }

  focusAcupoint(code) {
    this.activeAcupointMeshes.forEach(mesh => {
      if (mesh.userData.code === code) {
        mesh.scale.set(1.4, 1.4, 1.4);
        if (mesh.children[0]) mesh.children[0].material.color.setHex(0xffffff);

        // Hướng camera tập trung vào huyệt vị đang chọn
        if (mesh.position) {
          const targetY = mesh.position.y;
          this.controls.target.set(0, targetY, 0);
          this.controls.update();
        }
      } else {
        mesh.scale.set(1.0, 1.0, 1.0);
        if (mesh.children[0]) mesh.children[0].material.color.setHex(0xfacc15);
      }
    });
  }

  // ============================================================
  // ĐIỀU CHỈNH ĐỘ MỜ / NHẠT ĐỘC LẬP
  // ============================================================
  setMuscleOpacity(opacity) {
    this.muscleOpacity = Math.max(0.05, Math.min(1.0, opacity));
    const activeMuscles = this.sceneVM?.state.highlightedMuscles;
    this._updateMuscleHighlights(activeMuscles);
  }

  setNervousOpacity(opacity) {
    this.nervousOpacity = Math.max(0.05, Math.min(1.0, opacity));
    this.allNervousMeshes.forEach((mesh) => {
      if (mesh.material) {
        mesh.material.opacity = this.nervousOpacity;
        mesh.material.transparent = this.nervousOpacity < 0.99;
        mesh.material.depthWrite = this.nervousOpacity >= 0.99;
        mesh.material.needsUpdate = true;
      }
    });
  }

  resetView() {
    this.camera.position.set(0, 11, 27);
    this.controls.target.set(0, 9, 0);
    this.controls.update();
    this._applyStatuePose(null);
  }

  _animate() {
    this.animationId = requestAnimationFrame(() => this._animate());
    this._updatePoseInterpolation();

    // Hiệu ứng Pulsing nhịp tim cho các Điểm Huyệt 3D
    if (this.activeAcupointMeshes.length > 0) {
      const time = Date.now() * 0.005;
      const pulse = 1.0 + Math.sin(time) * 0.18;
      this.activeAcupointMeshes.forEach(mesh => {
        if (mesh.children[0]) {
          mesh.children[0].scale.set(pulse, pulse, 1.0);
          mesh.children[0].lookAt(this.camera.position);
        }
      });
    }

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  _onResize() {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    if (w === 0 || h === 0) return;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  dispose() {
    window.removeEventListener('resize', this._onResize.bind(this));
    cancelAnimationFrame(this.animationId);
    this.renderer.dispose();
  }
}
