import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';

/**
 * SceneView.js
 * Quản lý toàn bộ 3D Canvas bằng Three.js:
 * 1. Khung xương động học (Hierarchical Kinematic Rigging) phân cấp giải phẫu chuẩn y khoa.
 * 2. Nạp và gắn 4 lớp giải phẫu Z-Anatomy (Hệ cơ, Hệ xương, Hệ thần kinh, Hệ tuần hoàn).
 * 3. Mô phỏng tư thế tượng động học (Statue Poses) chuẩn xác từng chi/khớp cho 15 cử động.
 * 4. Highlight cơ tham gia vận động theo mã màu Y học lâm sàng (Chủ vận, Đối vận, Hiệp đồng, Cố định).
 * 5. Tương tác Raycasting, hiển thị Tooltip 100% Tiếng Việt y khoa.
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
    // TRẠNG THÁI HIỂN THỊ 4 LỚP GIẢI PHẪU
    // ==========================================
    this.showMuscleLayer = true;
    this.showSkeleton = false;
    this.showNervousLayer = false;
    this.showVascularLayer = false;

    this.isSkeletonLoaded = false;
    this.isNervousLoaded = false;
    this.isVascularLoaded = false;

    // Danh sách lưu trữ các mesh theo hệ thống
    this.allMuscleMeshes = [];
    this.allBoneMeshes = [];
    this.allNervousMeshes = [];
    this.allVascularMeshes = [];

    this.muscleMeshMap = new Map();
    this.boneMeshMap = new Map();
    this.hoveredObject = null;

    // Thông số căn chỉnh kích thước tỷ lệ chung cho cả 4 lớp
    this.uniformScaleFactor = null;
    this.bodyOffsetY = undefined;

    // Độ mờ độc lập cho từng hệ (0.05 - 1.0)
    this.muscleOpacity = 0.95;
    this.boneOpacity = 0.80;
    this.nervousOpacity = 0.90;
    this.vascularOpacity = 0.90;

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
  // Phân cấp cây khớp giải phẫu học chuẩn:
  // Root -> Khung chậu (Pelvis)
  //   ├── Chi dưới phải (Right Thigh: Hip Joint)
  //   │     └── Cẳng chân phải (Right Shin: Knee Joint)
  //   ├── Chi dưới trái (Left Thigh: Hip Joint)
  //   │     └── Cẳng chân trái (Left Shin: Knee Joint)
  //   └── Thân mình / Thắt lưng (Torso L3-L5)
  //         ├── Cổ & Đầu (Neck / Head C7-T1)
  //         ├── Cánh tay trên phải (Right Upper Arm: Shoulder GH Joint)
  //         │     └── Cẳng tay phải (Right Forearm: Elbow Joint)
  //         └── Cánh tay trên trái (Left Upper Arm: Shoulder GH Joint)
  //               └── Cẳng tay trái (Left Forearm: Elbow Joint)
  // ============================================================
  _initKinematicRig() {
    this.rigRoot = new THREE.Group();
    this.rigRoot.name = 'RigRoot';
    this.scene.add(this.rigRoot);

    // 1. Khung chậu (Pelvis) - Gốc tọa độ Y ~ 8.5
    const pelvisPivot = new THREE.Group();
    pelvisPivot.name = 'PelvisPivot';
    pelvisPivot.position.set(0, 8.5, 0);
    this.rigRoot.add(pelvisPivot);

    // 2. Thân mình / Thắt lưng (Torso L3-L5) - world Y ~ 9.8 (tương đối: +1.3)
    const torsoPivot = new THREE.Group();
    torsoPivot.name = 'TorsoPivot';
    torsoPivot.position.set(0, 1.3, 0);
    pelvisPivot.add(torsoPivot);

    // 3. Đầu & Cổ (Neck / Head C7-T1) - world Y ~ 14.8 (tương đối: +5.0)
    const neckPivot = new THREE.Group();
    neckPivot.name = 'NeckPivot';
    neckPivot.position.set(0, 5.0, 0);
    torsoPivot.add(neckPivot);

    // 4. Khớp vai phải (Right Upper Arm - Shoulder GH joint) - X âm (bên phải người mẫu Z-Anatomy)
    const rightUpperArmPivot = new THREE.Group();
    rightUpperArmPivot.name = 'RightUpperArmPivot';
    rightUpperArmPivot.position.set(-1.95, 4.3, 0);
    torsoPivot.add(rightUpperArmPivot);

    // 5. Khớp khuỷu tay phải (Right Forearm - Elbow Joint) - Con của Cánh tay phải
    const rightForearmPivot = new THREE.Group();
    rightForearmPivot.name = 'RightForearmPivot';
    rightForearmPivot.position.set(-0.20, -3.3, 0);
    rightUpperArmPivot.add(rightForearmPivot);

    // 6. Khớp vai trái (Left Upper Arm - Shoulder GH joint) - X dương (bên trái người mẫu Z-Anatomy)
    const leftUpperArmPivot = new THREE.Group();
    leftUpperArmPivot.name = 'LeftUpperArmPivot';
    leftUpperArmPivot.position.set(1.95, 4.3, 0);
    torsoPivot.add(leftUpperArmPivot);

    // 7. Khớp khuỷu tay trái (Left Forearm - Elbow Joint) - Con của Cánh tay trái
    const leftForearmPivot = new THREE.Group();
    leftForearmPivot.name = 'LeftForearmPivot';
    leftForearmPivot.position.set(0.20, -3.3, 0);
    leftUpperArmPivot.add(leftForearmPivot);

    // 8. Khớp háng phải (Right Thigh - Hip joint) - X âm
    const rightThighPivot = new THREE.Group();
    rightThighPivot.name = 'RightThighPivot';
    rightThighPivot.position.set(-1.15, -0.3, 0);
    pelvisPivot.add(rightThighPivot);

    // 9. Khớp đầu gối phải (Right Shin - Knee Joint) - Con của Đùi phải
    const rightShinPivot = new THREE.Group();
    rightShinPivot.name = 'RightShinPivot';
    rightShinPivot.position.set(0, -3.6, 0);
    rightThighPivot.add(rightShinPivot);

    // 10. Khớp háng trái (Left Thigh - Hip joint) - X dương
    const leftThighPivot = new THREE.Group();
    leftThighPivot.name = 'LeftThighPivot';
    leftThighPivot.position.set(1.15, -0.3, 0);
    pelvisPivot.add(leftThighPivot);

    // 11. Khớp đầu gối trái (Left Shin - Knee Joint) - Con của Đùi trái
    const leftShinPivot = new THREE.Group();
    leftShinPivot.name = 'LeftShinPivot';
    leftShinPivot.position.set(0, -3.6, 0);
    leftThighPivot.add(leftShinPivot);

    // Map các pivot khớp (11 khớp chính + aliases tương thích)
    this.rigPivots = {
      pelvis: pelvisPivot,
      torso: torsoPivot,
      neck: neckPivot,
      rightUpperArm: rightUpperArmPivot,
      rightForearm: rightForearmPivot,
      leftUpperArm: leftUpperArmPivot,
      leftForearm: leftForearmPivot,
      rightThigh: rightThighPivot,
      rightShin: rightShinPivot,
      leftThigh: leftThighPivot,
      leftShin: leftShinPivot,

      // Aliases
      rightArm: rightUpperArmPivot,
      leftArm: leftUpperArmPivot,
      rightLeg: rightThighPivot,
      leftLeg: leftThighPivot
    };

    // Danh sách 11 khớp chính thức (dùng để lặp lerp)
    this.activeJointKeys = [
      'pelvis', 'torso', 'neck',
      'rightUpperArm', 'rightForearm',
      'leftUpperArm', 'leftForearm',
      'rightThigh', 'rightShin',
      'leftThigh', 'leftShin'
    ];

    // Lưu trữ vị trí gốc (Base positions)
    this.basePositions = {};
    for (const [k, p] of Object.entries(this.rigPivots)) {
      this.basePositions[k] = p.position.clone();
    }

    // Góc quay và vị trí mục tiêu (Target Rotations & Positions)
    this.targetRotations = {};
    this.targetPositions = {};
    for (const k of Object.keys(this.rigPivots)) {
      this.targetRotations[k] = new THREE.Euler(0, 0, 0);
      this.targetPositions[k] = this.basePositions[k].clone();
    }

    this.rigRoot.updateMatrixWorld(true);
  }

  // Lưu trữ góc quay pivot hiện tại
  _saveCurrentPivotRotations() {
    const saved = {};
    for (const [k, p] of Object.entries(this.rigPivots)) {
      saved[k] = p.rotation.clone();
    }
    return saved;
  }

  // Đặt lại các pivot về tư thế trung tính (Neutral standing)
  _resetAllPivotsToNeutral() {
    for (const p of Object.values(this.rigPivots)) {
      p.rotation.set(0, 0, 0);
    }
  }

  // Khôi phục góc quay pivot đã lưu
  _restorePivotRotations(saved) {
    if (!saved) return;
    for (const [k, rot] of Object.entries(saved)) {
      if (this.rigPivots[k]) {
        this.rigPivots[k].rotation.copy(rot);
      }
    }
  }

  // ============================================================
  // PHÂN LOẠI MESH VÀO 11 PHÂN ĐOẠN ĐỘNG HỌC (ANATOMICAL CLASSIFICATION)
  // Kết hợp đối chiếu danh pháp giải phẫu (.r/.l, Latin, Anh)
  // và tọa độ bounding box không gian 3 chiều.
  // ============================================================
  _classifyMeshSegment(child, boxCenter) {
    const rawName = (child.name || '').toLowerCase();
    const name = rawName.replace(/_/g, ' ');

    // 1. Xác định bên Phải (.r) hay Trái (.l)
    const isRight = rawName.endsWith('.r') || rawName.includes('.r.') || rawName.endsWith('_r') || 
                    name.includes(' right') || (boxCenter.x < -0.15);
    const isLeft = rawName.endsWith('.l') || rawName.includes('.l.') || rawName.endsWith('_l') || 
                   name.includes(' left') || (boxCenter.x > 0.15);

    // ============================================================
    // A. ĐẦU & CỔ (HEAD & NECK)
    // ============================================================
    const headKw = [
      'cervical', 'c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'atlas', 'axis', 'cranium', 'skull',
      'frontal', 'parietal', 'occipital', 'temporal', 'sphenoid', 'ethmoid', 'mandib', 'maxill',
      'nasal', 'lacrimal', 'zygomatic', 'palatine', 'vomer', 'tooth', 'teeth', 'frontalis',
      'occipitalis', 'temporalis', 'masseter', 'orbicularis', 'nasalis', 'buccinator', 'bucinator',
      'zygomaticus', 'levator labii', 'depressor', 'mental', 'pterygoid', 'auricular', 'splenius',
      'semispinalis capitis', 'longissimus capitis', 'sternocleidomastoid', 'platysma', 'hyoid',
      'scalenus', 'scalene', 'tongue', 'pharynx', 'larynx', 'arytenoid', 'digastric'
    ];
    if (headKw.some(k => name.includes(k)) || boxCenter.y >= 14.8) {
      return 'neck';
    }

    // ============================================================
    // B. CẲNG CHÂN, BẮP CHÂN, CỔ CHÂN, BÀN CHÂN (SHIN, CALF, FOOT)
    // Kiểm tra trước chi trên để tránh xung đột từ khóa "digitorum longus", v.v.
    // ============================================================
    const shinKw = [
      'tibia', 'fibula', 'patella', 'gastrocnemius', 'soleus', 'plantaris', 'popliteus',
      'tibialis', 'fibularis', 'peroneus', 'calcane', 'achilles', 'talus', 'navicular',
      'cuboid', 'cuneiform', 'metatarsal', 'hallucis', 'flexor digitorum longus',
      'extensor digitorum longus', 'extensor digitorum brevis', 'flexor digitorum brevis',
      'quadratus plantae', 'abductor hallucis', 'adductor hallucis', 'abductor digiti minimi of foot',
      'opponens digiti minimi muscle of foot', 'dorsal interossei muscles of foot',
      'lumbrical muscles of foot', 'plantar', 'foot', 'toe', 'phalanx of foot', 'phalanx of toe',
      'anterior compartment of leg', 'posterior compartment of leg', 'lateral compartment of leg',
      'intermuscular septum of leg', 'anserine bursa'
    ];
    if (shinKw.some(k => name.includes(k)) || boxCenter.y < 4.8) {
      return isRight ? 'rightShin' : 'leftShin';
    }

    // ============================================================
    // C. ĐÙI & KHỚP HÁNG (THIGH & HIP JOINT)
    // Bao gồm Cơ tứ đầu đùi, Cơ nhị đầu đùi (Hamstrings), Cơ khép
    // ============================================================
    const thighKw = [
      'femur', 'quadriceps', 'rectus femoris', 'vastus', 'biceps femoris', 'semitendinosus',
      'semimembranosus', 'gracilis', 'sartorius', 'pectineus', 'adductor longus', 'adductor brevis',
      'adductor magnus', 'adductor minimus', 'tensor fasciae latae', 'iliotibial tract',
      'quadratus femoris', 'obturator externus', 'iliopectineal', 'trochanteric',
      'anterior compartment of thigh', 'posterior compartment of thigh', 'medial compartment of thigh'
    ];
    if (thighKw.some(k => name.includes(k)) || (boxCenter.y < 8.8 && Math.abs(boxCenter.x) > 0.25 && Math.abs(boxCenter.x) <= 1.45 && boxCenter.y >= 4.8)) {
      return isRight ? 'rightThigh' : 'leftThigh';
    }

    // ============================================================
    // D. KHUNG CHẬU & VÙNG MÔNG (PELVIS & GLUTEAL REGION)
    // Cố định vào khung chậu để không bị vặn xoắn trôi nổi khi xoay thân
    // ============================================================
    const pelvisKw = [
      'sacrum', 'coccyx', 'pelvi', 'ilium', 'ischium', 'pubis', 'gluteus', 'piriformis',
      'obturator internus', 'gemellus', 'perine', 'levator ani', 'coccygeus', 'sphincter ani',
      'ischiocavernosus', 'bulbospongiosus', 'iliopsoas', 'psoas', 'iliacus', 'acetabul'
    ];
    if (pelvisKw.some(k => name.includes(k)) || (boxCenter.y >= 7.2 && boxCenter.y <= 8.8 && Math.abs(boxCenter.x) <= 0.8)) {
      return 'pelvis';
    }

    // ============================================================
    // E. CẲNG TAY & BÀN TAY (FOREARM & HAND) - Khớp khuỷu tay
    // Gắn vào RightForearmPivot / LeftForearmPivot
    // ============================================================
    const forearmKw = [
      'radius', 'ulna', 'pronator', 'supinator', 'flexor carpi', 'extensor carpi', 'palmar',
      'brachioradialis', 'anconeus', 'carpal', 'metacarpal', 'phalanx of hand', 'phalanx of finger',
      'scaphoid', 'lunate', 'triquetrum', 'pisiform', 'trapezium', 'trapezoid', 'capitate', 'hamate',
      'lumbrical muscles of hand', 'dorsal interossei muscles of hand', 'palmar interossei',
      'abductor pollicis', 'flexor pollicis', 'extensor pollicis', 'adductor pollicis', 'opponens pollicis',
      'abductor digiti minimi of hand', 'flexor digiti minimi of hand', 'opponens digiti minimi muscle of hand',
      'flexor digitorum superficialis', 'flexor digitorum profundus', 'extensor digitorum.l', 'extensor digitorum.r',
      'extensor digiti minimi', 'extensor indicis', 'antebrachial', 'retinaculum of wrist', 'hand',
      'wrist', 'fascia of hand', 'synovial sheaths of digits of hand', 'tendon sheaths of digits of hand',
      'tendon sheath of extensor', 'tendon sheath of flexor', 'bicipitoradial'
    ];
    if (forearmKw.some(k => name.includes(k)) || (Math.abs(boxCenter.x) > 1.45 && boxCenter.y < 10.8 && boxCenter.y >= 6.0)) {
      return isRight ? 'rightForearm' : 'leftForearm';
    }

    // ============================================================
    // F. CÁNH TAY TRÊN & KHỚP VAI (UPPER ARM & SHOULDER)
    // Gắn vào RightUpperArmPivot / LeftUpperArmPivot
    // ============================================================
    const upperArmKw = [
      'humerus', 'deltoid', 'biceps brachii', 'triceps brachii', 'brachialis muscle',
      'brachial fascia', 'coracobrachialis', 'coracobrachial', 'supraspinatus',
      'infraspinatus', 'subscapularis', 'teres minor', 'teres major',
      'anterior compartment of arm', 'posterior compartment of arm', 'intermuscular septum of arm'
    ];
    // Loại trừ tuyệt đối các cơ thân mình lớn bám vào xương cánh tay (Latissimus, Pectoralis, Trapezius)
    // Các cơ này phải ở lại thân mình để tránh bị xé rách bay lên trời khi nâng tay.
    const trunkExcludeKw = ['latissimus', 'pectoralis', 'trapezius', 'serratus', 'rhomboid', 'erector spinae'];
    const isTrunkMuscle = trunkExcludeKw.some(k => name.includes(k));

    if (!isTrunkMuscle && (upperArmKw.some(k => name.includes(k)) || (Math.abs(boxCenter.x) > 1.40 && boxCenter.y >= 10.8 && boxCenter.y <= 15.2))) {
      return isRight ? 'rightUpperArm' : 'leftUpperArm';
    }

    // ============================================================
    // G. THÂN MÌNH (TORSO: Lồng ngực, Cột sống T1-L5, Bụng, Lưng)
    // ============================================================
    return 'torso';
  }

  // ============================================================
  // GẮN MÔ HÌNH VÀO CÂY ĐỘNG HỌC (ATTACH FBX TO RIG)
  // ============================================================
  _attachFBXToRig(fbxModel, layerType) {
    const box = new THREE.Box3().setFromObject(fbxModel);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    // Thiết lập hệ số tỷ lệ đồng nhất 100% cho cả 4 lớp mô hình
    if (!this.uniformScaleFactor) {
      const targetHeight = 17.0;
      this.uniformScaleFactor = targetHeight / (size.y || 1);
    }

    fbxModel.scale.set(this.uniformScaleFactor, this.uniformScaleFactor, this.uniformScaleFactor);

    box.setFromObject(fbxModel);
    box.getCenter(center);

    if (this.bodyOffsetY === undefined) {
      this.bodyOffsetY = -center.y + 9;
    }

    fbxModel.position.x = -center.x;
    fbxModel.position.y = this.bodyOffsetY;
    fbxModel.position.z = -center.z;

    // Đưa tạm vào scene để tính ma trận thế giới (World Matrix) chính xác
    this.scene.add(fbxModel);
    fbxModel.updateMatrixWorld(true);

    // Tạm thời đưa Rig về tư thế chuẩn giải phẫu khi gắn kết các mesh
    const savedRotations = this._saveCurrentPivotRotations();
    this._resetAllPivotsToNeutral();
    this.rigRoot.updateMatrixWorld(true);

    const meshes = [];
    fbxModel.traverse((child) => {
      if (child.isMesh) {
        meshes.push(child);
      }
    });

    const meshBox = new THREE.Box3();
    const meshCenter = new THREE.Vector3();

    meshes.forEach((mesh) => {
      meshBox.setFromObject(mesh);
      meshBox.getCenter(meshCenter);

      const segment = this._classifyMeshSegment(mesh, meshCenter);
      const targetPivot = this.rigPivots[segment] || this.rigPivots.torso;

      // Phân bổ thông tin lớp và trạng thái hiển thị
      mesh.userData.type = layerType;
      mesh.userData.segment = segment;

      if (layerType === 'muscle') {
        const mappedId = this._mapFBXNameToMuscleId(mesh.name);
        mesh.userData.id = mappedId || mesh.name;
        mesh.userData.meshName = mesh.name;
        mesh.userData.originalColor = 0x992222;
        mesh.visible = this.showMuscleLayer;
        this.allMuscleMeshes.push(mesh);

        if (mappedId) {
          if (!this.muscleMeshMap.has(mappedId)) {
            this.muscleMeshMap.set(mappedId, []);
          }
          this.muscleMeshMap.get(mappedId).push(mesh);
        }
      } else if (layerType === 'bone') {
        mesh.userData.id = mesh.name;
        mesh.userData.meshName = mesh.name;
        mesh.visible = this.showSkeleton;
        this.allBoneMeshes.push(mesh);
        this.boneMeshMap.set(mesh.name, mesh);
      } else if (layerType === 'nervous') {
        mesh.userData.id = mesh.name;
        mesh.userData.meshName = mesh.name;
        mesh.visible = this.showNervousLayer;
        this.allNervousMeshes.push(mesh);
      } else if (layerType === 'vascular') {
        mesh.userData.id = mesh.name;
        mesh.userData.meshName = mesh.name;
        mesh.visible = this.showVascularLayer;
        this.allVascularMeshes.push(mesh);
      }

      // Gắn mesh vào pivot tương ứng, bảo toàn tuyệt đối tọa độ thế giới
      targetPivot.attach(mesh);
    });

    // Gỡ bỏ vỏ rỗng fbxModel khỏi scene
    this.scene.remove(fbxModel);

    // Khôi phục lại tư thế hiện tại của Rig
    this._restorePivotRotations(savedRotations);
    this.rigRoot.updateMatrixWorld(true);
  }

  async init() {
    this._setupLighting();

    // 1. Tải hệ cơ thật Z-Anatomy ngay khi khởi tạo
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
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    this.scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.95);
    dirLight1.position.set(10, 25, 20);
    this.scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 0.55); // Sắc xanh viền y khoa
    dirLight2.position.set(-15, 15, -12);
    this.scene.add(dirLight2);

    const backLight = new THREE.DirectionalLight(0xffffff, 0.4);
    backLight.position.set(0, -10, -10);
    this.scene.add(backLight);
  }

  // ============================================================
  // NẠP 4 LỚP MÔ HÌNH Z-ANATOMY
  // ============================================================
  async _loadMuscularSystemFBX() {
    return new Promise((resolve, reject) => {
      const loader = new FBXLoader();
      loader.load(
        'assets/models/MuscularSystem.fbx',
        (fbx) => {
          const defaultMuscleMat = new THREE.MeshPhongMaterial({
            color: 0x992222,
            transparent: true,
            opacity: this.muscleOpacity,
            shininess: 35,
            depthWrite: true
          });

          fbx.traverse((child) => {
            if (child.isMesh) {
              child.material = defaultMuscleMat.clone();
            }
          });

          this._attachFBXToRig(fbx, 'muscle');
          console.info(`✅ Đã nạp & Rigging ${this.allMuscleMeshes.length} thớ cơ thật từ Z-Anatomy!`);
          resolve();
        },
        (xhr) => {
          if (xhr.lengthComputable) {
            const percent = Math.round((xhr.loaded / xhr.total) * 100);
            this._updateLoadingText(`Đang tải hệ cơ Z-Anatomy (${percent}%)...`);
          }
        },
        (error) => reject(error)
      );
    });
  }

  async _loadSkeletalSystemFBX() {
    if (this.isSkeletonLoaded) return;
    this._updateLoadingText('Đang nạp & liên kết hệ xương Z-Anatomy vào khung động học...');

    return new Promise((resolve, reject) => {
      const loader = new FBXLoader();
      loader.load(
        'assets/models/SkeletalSystem.fbx',
        (fbx) => {
          const defaultBoneMat = new THREE.MeshPhongMaterial({
            color: 0xe2e8f0,
            transparent: true,
            opacity: this.boneOpacity,
            shininess: 40,
            depthWrite: true
          });

          fbx.traverse((child) => {
            if (child.isMesh) {
              child.material = defaultBoneMat.clone();
            }
          });

          this._attachFBXToRig(fbx, 'bone');
          this.isSkeletonLoaded = true;
          this._hideLoadingOverlay();
          console.info(`✅ Đã nạp & liên kết ${this.allBoneMeshes.length} xương vào Rig!`);
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
            emissiveIntensity: 0.45,
            transparent: true,
            opacity: this.nervousOpacity,
            shininess: 50
          });

          fbx.traverse((child) => {
            if (child.isMesh) {
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

  async _loadVascularSystemFBX() {
    if (this.isVascularLoaded) return;
    this._updateLoadingText('Đang nạp & liên kết hệ tuần hoàn Z-Anatomy (động & tĩnh mạch)...');

    return new Promise((resolve, reject) => {
      const loader = new FBXLoader();
      loader.load(
        'assets/models/CardioVascular.fbx',
        (fbx) => {
          const vascularMat = new THREE.MeshPhongMaterial({
            color: 0xd97706,
            emissive: 0xb45309,
            emissiveIntensity: 0.35,
            transparent: true,
            opacity: this.vascularOpacity,
            shininess: 45
          });

          fbx.traverse((child) => {
            if (child.isMesh) {
              child.material = vascularMat.clone();
            }
          });

          this._attachFBXToRig(fbx, 'vascular');
          this.isVascularLoaded = true;
          this._hideLoadingOverlay();
          console.info(`✅ Đã nạp & liên kết hệ tuần hoàn vào Rig!`);
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

  // Ánh xạ tên mesh sang ID cơ tiếng Việt (bỏ qua dấu gạch dưới và khoảng trắng)
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

    if (n.includes('external oblique') || (n.includes('oblique') && n.includes('extern'))) return 'oblique_externus';
    if (n.includes('internal oblique') || (n.includes('oblique') && n.includes('intern'))) return 'oblique_internus';
    if (n.includes('rectus abdominis')) return 'rectus_abdominis';
    if (n.includes('erector spinae') || n.includes('iliocostalis') || n.includes('longissimus') || n.includes('spinalis')) return 'erector_spinae';

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
      
      // Chỉ raycast các mesh đang hiển thị (visible = true) trong cây Rig
      const objectsToTest = [];
      if (this.showMuscleLayer) objectsToTest.push(...this.allMuscleMeshes);
      if (this.showSkeleton) objectsToTest.push(...this.allBoneMeshes);
      if (this.showNervousLayer) objectsToTest.push(...this.allNervousMeshes);
      if (this.showVascularLayer) objectsToTest.push(...this.allVascularMeshes);

      const intersects = this.raycaster.intersectObjects(objectsToTest, false);

      if (intersects.length > 0) {
        const object = intersects[0].object;
        if (this.hoveredObject !== object) {
          this.hoveredObject = object;
          this.sceneVM.setHoveredObject(object.userData.id);

          this.tooltip.style.display = 'block';
          this.tooltip.textContent = this._getLocalizedName(object);
        }

        const containerRect = this.container.getBoundingClientRect();
        this.tooltip.style.left = `${event.clientX - containerRect.left}px`;
        this.tooltip.style.top = `${event.clientY - containerRect.top}px`;
      } else {
        if (this.hoveredObject) {
          this.sceneVM.setHoveredObject(null);
          this.hoveredObject = null;
        }
        this.tooltip.style.display = 'none';
      }
    };

    const onClick = () => {
      if (this.hoveredObject && this.hoveredObject.userData.type === 'muscle') {
        const muscleId = this.hoveredObject.userData.id;
        this.appVM.movementVM.selectMuscleForDetail(muscleId);
        this.sceneVM.isolateMuscle(muscleId);
      }
    };

    this.renderer.domElement.addEventListener('mousemove', onMouseMove);
    this.renderer.domElement.addEventListener('click', onClick);
  }

  _getLocalizedName(object) {
    if (object.userData.type === 'muscle') {
      const muscle = this.appVM.getMuscleById ? this.appVM.getMuscleById(object.userData.id) : null;
      if (muscle) return `💪 ${muscle.name_vi}`;
      return `💪 ${object.userData.meshName || object.name}`;
    } else if (object.userData.type === 'bone') {
      const boneVi = this.appVM.getBoneNameVi ? this.appVM.getBoneNameVi(object.name) : object.name;
      return `🦴 ${boneVi}`;
    } else if (object.userData.type === 'nervous') {
      return `🧠 ${object.userData.meshName || 'Dây thần kinh'}`;
    } else if (object.userData.type === 'vascular') {
      return `🫀 ${object.userData.meshName || 'Mạch máu tuần hoàn'}`;
    }
    return object.name;
  }

  _bindToViewModel() {
    if (!this.sceneVM) return;

    this.sceneVM.on('highlightedMuscles', muscles => this._updateMuscleHighlights(muscles));
    
    // Toggle 4 Lớp Giải Phẫu
    this.sceneVM.on('showMuscleLayer', show => {
      this.showMuscleLayer = Boolean(show);
      this.allMuscleMeshes.forEach(m => m.visible = Boolean(show));
    });
    
    this.sceneVM.on('showSkeleton', show => { 
      this.showSkeleton = Boolean(show);
      if (show && !this.isSkeletonLoaded) {
        this._loadSkeletalSystemFBX();
      } else {
        this.allBoneMeshes.forEach(m => m.visible = Boolean(show));
      }
    });

    this.sceneVM.on('showNervousLayer', show => {
      this.showNervousLayer = Boolean(show);
      if (show && !this.isNervousLoaded) {
        this._loadNervousSystemFBX();
      } else {
        this.allNervousMeshes.forEach(m => m.visible = Boolean(show));
      }
    });

    this.sceneVM.on('showVascularLayer', show => {
      this.showVascularLayer = Boolean(show);
      if (show && !this.isVascularLoaded) {
        this._loadVascularSystemFBX();
      } else {
        this.allVascularMeshes.forEach(m => m.visible = Boolean(show));
      }
    });

    this.sceneVM.on('muscleOpacity', opacity => this.setMuscleOpacity(opacity));
    this.sceneVM.on('skeletonOpacity', opacity => this.setBoneOpacity(opacity));
    this.sceneVM.on('nervousOpacity', opacity => this.setNervousOpacity(opacity));
    this.sceneVM.on('vascularOpacity', opacity => this.setVascularOpacity(opacity));
    this.sceneVM.on('hoveredObjectId', id => this._updateHover(id));
    this.sceneVM.on('isolatedMuscleId', id => this._updateIsolation(id));

    // Kích hoạt Tư Thế Tượng Động Học tương ứng với hành động được chọn
    if (this.appVM.movementVM) {
      this.appVM.movementVM.on('selectedMovementId', movementId => {
        this._applyStatuePose(movementId);
      });
    }
  }

  // ============================================================
  // HỆ THỐNG TƯ THẾ TƯỢNG ĐỘNG HỌC (STATUE POSES RIGGING)
  // Xoay chuyển thực sự từng khớp chi thể giải phẫu học
  // ============================================================
  _applyStatuePose(movementId) {
    // Đặt lại toàn bộ mục tiêu về vị trí/góc quay trung tính
    for (const k of Object.keys(this.targetRotations)) {
      this.targetRotations[k].set(0, 0, 0);
      this.targetPositions[k].copy(this.basePositions[k]);
    }

    if (!movementId) return;

    switch (movementId) {
      // 1. NÂNG TAY LÊN CAO QUA ĐẦU (Overhead Reach)
      case 'overhead_reach':
        this.targetRotations.rightUpperArm.set(0.12, 0.25, -2.65); // Nâng cánh tay phải lên cao qua đầu 155°
        this.targetRotations.rightForearm.set(0, 0, 0);            // Khớp khuỷu duỗi thẳng vươn cao
        this.targetRotations.leftUpperArm.set(0, 0, 0.08);         // Tay trái xuôi nhẹ
        this.targetRotations.leftForearm.set(0, 0, 0);
        this.targetRotations.torso.set(0, 0, -0.08);              // Thân nghiêng nhẹ theo hướng với
        this.targetRotations.neck.set(-0.25, -0.15, 0);           // Đầu ngửa nhẹ mắt dõi theo bàn tay
        break;

      // 2. XOAY NGƯỜI / XOAY THÂN MÌNH (Trunk Rotation)
      case 'trunk_rotation':
        this.targetRotations.torso.set(0, 0.65, 0);               // Thân mình xoay 37° quanh trục cột sống
        this.targetRotations.neck.set(0, 0.25, 0);                // Đầu tiếp tục xoay theo hướng nhìn
        this.targetRotations.rightUpperArm.set(0, -0.1, 0.1);     // Hai tay xoay tự nhiên theo thân
        this.targetRotations.leftUpperArm.set(0, 0.1, -0.1);
        // Khung chậu và hai chân đứng vững chãi không bị xô lệch
        break;

      // 3. BƯỚC ĐI (Chu kỳ dáng đi - Gait Cycle)
      case 'walking_gait':
        // Chân phải (chân lăng - swing phase): Gập háng đưa tới, khớp gối gập nhẹ chuẩn bị chạm gót
        this.targetRotations.rightThigh.set(-0.45, 0, 0.05);       // Háng phải gập 26° ra trước
        this.targetRotations.rightShin.set(0.20, 0, 0);            // Khớp đầu gối phải gập nhẹ 11°
        // Chân trái (chân đạp đất - push-off): Duỗi háng ra sau, khớp gối gập đẩy tới
        this.targetRotations.leftThigh.set(0.35, 0, -0.05);        // Háng trái duỗi 20° ra sau
        this.targetRotations.leftShin.set(0.52, 0, 0);             // Khớp đầu gối trái gập 30° kiễng đẩy
        // Đánh tay đối xứng sinh lý tự nhiên
        this.targetRotations.leftUpperArm.set(-0.45, 0, -0.08);    // Tay trái vung tới trước
        this.targetRotations.leftForearm.set(-0.30, 0, 0);         // Khớp khuỷu tay trái gập nhẹ
        this.targetRotations.rightUpperArm.set(0.35, 0, 0.08);      // Tay phải vung ra sau
        this.targetRotations.rightForearm.set(-0.15, 0, 0);        // Khớp khuỷu tay phải gập nhẹ
        this.targetRotations.torso.set(0, 0.12, 0);                // Thân mình xoay nhẹ cân bằng động học
        break;

      // 4. CÚI NGƯỜI GẬP LƯNG (Forward Trunk Bending)
      case 'forward_bending':
        this.targetRotations.torso.set(0.85, 0, 0);               // Thân gập ra trước 50° tại thắt lưng
        this.targetRotations.neck.set(0.25, 0, 0);                // Cổ uốn cong theo đường sinh lý
        this.targetRotations.rightUpperArm.set(-0.6, 0, 0);       // Hai tay buông thõng theo trọng lực
        this.targetRotations.leftUpperArm.set(-0.6, 0, 0);
        // Hai chân đứng thẳng
        break;

      // 5. GIƯƠNG CUNG BẮN TÊN (Đạo Dẫn Thức - Archer Draw)
      case 'archer_pull':
        this.targetRotations.torso.set(0, 0.55, 0);               // Thân xoay 32° vào thế tấn
        this.targetRotations.neck.set(0, 0.55, 0);                // Đầu quay ngắm theo hướng bắn
        this.targetRotations.leftUpperArm.set(-0.1, 0.2, 1.57);   // Tay trái giạng thẳng ngang vai cầm cung
        this.targetRotations.leftForearm.set(0, 0, 0);
        this.targetRotations.rightUpperArm.set(0.2, -0.4, -1.45); // Tay phải giạng ngang kéo dây cung
        this.targetRotations.rightForearm.set(-1.85, 0, 0);       // Khớp khuỷu tay phải gập sâu 105° kéo dây cung về gò má!
        this.targetRotations.rightThigh.set(0, 0, -0.25);         // Khớp háng mở rộng thế trung bình tấn
        this.targetRotations.rightShin.set(0.35, 0, 0);           // Khớp đầu gối phải chùng xuống vững chãi
        this.targetRotations.leftThigh.set(0, 0, 0.25);
        this.targetRotations.leftShin.set(0.35, 0, 0);            // Khớp đầu gối trái chùng xuống
        break;

      // 6. GIẠNG VAI (Shoulder Abduction)
      case 'shoulder_abduction':
        this.targetRotations.rightUpperArm.set(0, 0, -1.57);      // Giạng cánh tay phải 90° ngang vai
        this.targetRotations.rightForearm.set(0, 0, 0);
        break;

      // 7. KHÉP VAI (Shoulder Adduction)
      case 'shoulder_adduction':
        this.targetRotations.rightUpperArm.set(0.3, 0.2, 0.40);   // Khép cánh tay phải chéo qua trước ngực
        this.targetRotations.rightForearm.set(-0.25, 0, 0);
        break;

      // 8. GẬP VAI (Shoulder Flexion)
      case 'shoulder_flexion':
        this.targetRotations.rightUpperArm.set(-1.57, 0, 0);      // Đưa cánh tay phải thẳng ra trước 90°
        this.targetRotations.rightForearm.set(0, 0, 0);
        break;

      // 9. DUỖI VAI (Shoulder Extension)
      case 'shoulder_extension':
        this.targetRotations.rightUpperArm.set(0.70, 0, 0);       // Kéo cánh tay phải ra sau lưng 40°
        this.targetRotations.rightForearm.set(0, 0, 0);
        break;

      // 10. XOAY TRONG VAI (Shoulder Internal Rotation)
      case 'shoulder_internal_rotation':
        this.targetRotations.rightUpperArm.set(-0.25, 0.85, -0.2); // Xoay trong xương cánh tay
        this.targetRotations.rightForearm.set(-1.50, 0, 0);       // Khớp khuỷu gập 90° để thấy rõ cẳng tay xoay vào bụng
        break;

      // 11. XOAY NGOÀI VAI (Shoulder External Rotation)
      case 'shoulder_external_rotation':
        this.targetRotations.rightUpperArm.set(-0.25, -0.85, -0.2);// Xoay ngoài xương cánh tay
        this.targetRotations.rightForearm.set(-1.50, 0, 0);       // Khớp khuỷu gập 90° để thấy rõ cẳng tay xoay ra ngoài
        break;

      // 12. NÂNG XƯƠNG BẢ VAI / NHÚN VAI (Scapular Elevation)
      case 'scapular_elevation':
        this.targetPositions.rightUpperArm.y += 0.45;             // Nâng đai vai phải lên cao
        this.targetPositions.leftUpperArm.y += 0.45;              // Nâng đai vai trái lên cao
        this.targetRotations.neck.set(0.1, 0, 0);
        break;

      // 13. KHÉP XƯƠNG BẢ VAI / KÉO VAI RA SAU (Scapular Retraction)
      case 'scapular_retraction':
        this.targetRotations.rightUpperArm.set(0, -0.35, 0);      // Kéo vai phải ra sau
        this.targetRotations.leftUpperArm.set(0, 0.35, 0);        // Kéo vai trái ra sau
        this.targetRotations.torso.set(-0.12, 0, 0);              // Ưỡn lồng ngực
        break;

      // 14. GẬP KHUỶU TAY (Elbow Flexion)
      case 'elbow_flexion':
        this.targetRotations.rightUpperArm.set(-0.20, 0, 0);      // Cánh tay trên cố định bên sườn (gập nhẹ 11°)
        this.targetRotations.rightForearm.set(-2.00, 0, 0);       // Cẳng tay gập 115° tại KHỚP KHUỶU TAY hướng về vai!
        break;

      // 15. DUỖI KHUỶU TAY (Elbow Extension)
      case 'elbow_extension':
        this.targetRotations.rightUpperArm.set(0.15, 0, 0);       // Cánh tay trên duỗi nhẹ
        this.targetRotations.rightForearm.set(0, 0, 0);           // Cẳng tay duỗi thẳng hoàn toàn khớp khuỷu
        break;

      default:
        break;
    }
  }

  // Cập nhật nội suy mượt mà (Smooth Interpolation) giữa các tư thế tượng
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
  // HIGHLIGHT CƠ THEO MÃ MÀU VAI TRÒ (LEGEND)
  // ============================================================
  _updateMuscleHighlights(muscles) {
    this.allMuscleMeshes.forEach((mesh) => {
      mesh.material.color.setHex(0x992222);
      mesh.material.emissive.setHex(0x000000);
      mesh.material.emissiveIntensity = 0;
      mesh.material.opacity = this.muscleOpacity * 0.40;
      mesh.material.transparent = true;
    });

    if (!muscles || muscles.length === 0) {
      this.allMuscleMeshes.forEach((mesh) => {
        mesh.material.opacity = this.muscleOpacity;
        mesh.material.transparent = this.muscleOpacity < 1.0;
      });
      return;
    }

    const roleColorMap = {
      agonist: 0xef4444,    // Đỏ - Cơ chủ vận
      antagonist: 0x38bdf8, // Xanh da trời Cyan - Cơ đối vận
      synergist: 0xf59e0b,  // Vàng Amber - Cơ hiệp đồng
      stabilizer: 0x10b981  // Xanh lá Emerald - Cơ ổn định / cố định
    };

    muscles.forEach(m => {
      const mId = m.id || m.muscleId;
      const meshList = this.muscleMeshMap.get(mId);
      if (meshList && Array.isArray(meshList)) {
        const hex = roleColorMap[m.role] || 0xef4444;
        meshList.forEach(mesh => {
          mesh.material.color.setHex(hex);
          mesh.material.emissive.setHex(hex);
          mesh.material.emissiveIntensity = 0.70;
          mesh.material.opacity = Math.min(1.0, this.muscleOpacity * 1.05);
          mesh.material.transparent = mesh.material.opacity < 1.0;
        });
      }
    });
  }

  // ============================================================
  // CÁC HÀM ĐIỀU CHỈNH ĐỘ MỜ / NHẠT ĐỘC LẬP TỪNG HỆ
  // ============================================================
  setMuscleOpacity(opacity) {
    this.muscleOpacity = Math.max(0.05, Math.min(1.0, opacity));
    const isolatedId = this.sceneVM?.state.isolatedMuscleId;
    if (isolatedId) {
      this._updateIsolation(isolatedId);
    } else {
      const activeMuscles = this.appVM.movementVM?.state.activeMuscles;
      this._updateMuscleHighlights(activeMuscles);
    }
  }

  setBoneOpacity(opacity) {
    this.boneOpacity = Math.max(0.05, Math.min(1.0, opacity));
    this.allBoneMeshes.forEach((mesh) => {
      if (mesh.material) {
        mesh.material.opacity = this.boneOpacity;
        mesh.material.transparent = this.boneOpacity < 1.0;
      }
    });
  }

  setNervousOpacity(opacity) {
    this.nervousOpacity = Math.max(0.05, Math.min(1.0, opacity));
    this.allNervousMeshes.forEach((mesh) => {
      if (mesh.material) {
        mesh.material.opacity = this.nervousOpacity;
        mesh.material.transparent = this.nervousOpacity < 1.0;
      }
    });
  }

  setVascularOpacity(opacity) {
    this.vascularOpacity = Math.max(0.05, Math.min(1.0, opacity));
    this.allVascularMeshes.forEach((mesh) => {
      if (mesh.material) {
        mesh.material.opacity = this.vascularOpacity;
        mesh.material.transparent = this.vascularOpacity < 1.0;
      }
    });
  }

  _updateSecondaryLayerOpacity(opacity) {
    this.setBoneOpacity(opacity);
    this.setNervousOpacity(opacity);
    this.setVascularOpacity(opacity);
  }

  _updateHover(objectId) {
    this.allMuscleMeshes.forEach(mesh => {
      if (mesh.userData.id === objectId) {
        mesh.material.emissiveIntensity = 0.85;
      }
    });
  }

  _updateIsolation(isolatedId) {
    if (isolatedId) {
      this.allMuscleMeshes.forEach(mesh => {
        if (mesh.userData.id === isolatedId) {
          mesh.material.opacity = this.muscleOpacity;
          mesh.material.emissiveIntensity = 0.85;
          mesh.material.transparent = this.muscleOpacity < 1.0;
        } else {
          mesh.material.opacity = this.muscleOpacity * 0.12;
          mesh.material.emissiveIntensity = 0;
          mesh.material.transparent = true;
        }
      });
    } else {
      const activeMuscles = this.appVM.movementVM?.state.activeMuscles;
      this._updateMuscleHighlights(activeMuscles);
    }
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
