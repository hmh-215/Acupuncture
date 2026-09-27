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
    this.bodyOffsetY = undefined;

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

    // 5. Khớp vai phải (Right Upper Arm: chỏm cánh tay GH joint - gắn vào Chest)
    const rightUpperArmPivot = new THREE.Group();
    rightUpperArmPivot.name = 'RightUpperArmPivot';
    rightUpperArmPivot.position.set(-1.65, 1.65, 0); // world Y ~ 14.10
    chestPivot.add(rightUpperArmPivot);

    // 6. Khớp khuỷu tay phải (Right Forearm: ròng rọc khuỷu tay)
    const rightForearmPivot = new THREE.Group();
    rightForearmPivot.name = 'RightForearmPivot';
    rightForearmPivot.position.set(-0.15, -3.15, 0);
    rightUpperArmPivot.add(rightForearmPivot);

    // 7. Khớp vai trái (Left Upper Arm - gắn vào Chest)
    const leftUpperArmPivot = new THREE.Group();
    leftUpperArmPivot.name = 'LeftUpperArmPivot';
    leftUpperArmPivot.position.set(1.65, 1.65, 0); // world Y ~ 14.10
    chestPivot.add(leftUpperArmPivot);

    // 8. Khớp khuỷu tay trái (Left Forearm)
    const leftForearmPivot = new THREE.Group();
    leftForearmPivot.name = 'LeftForearmPivot';
    leftForearmPivot.position.set(0.15, -3.15, 0);
    leftUpperArmPivot.add(leftForearmPivot);

    // 9. Khớp háng phải (Right Thigh: chỏm xương đùi / ổ cối acetabulum)
    // Căn chuẩn tọa độ ổ cối: X = -0.95, Y = 0.05, Z = 0.05 (world Y ~ 8.75)
    const rightThighPivot = new THREE.Group();
    rightThighPivot.name = 'RightThighPivot';
    rightThighPivot.position.set(-0.95, 0.05, 0.05);
    pelvisPivot.add(rightThighPivot);

    // 10. Khớp đầu gối phải (Right Shin: khe khớp gối)
    const rightShinPivot = new THREE.Group();
    rightShinPivot.name = 'RightShinPivot';
    rightShinPivot.position.set(0, -3.70, 0);
    rightThighPivot.add(rightShinPivot);

    // 11. Khớp háng trái (Left Thigh)
    const leftThighPivot = new THREE.Group();
    leftThighPivot.name = 'LeftThighPivot';
    leftThighPivot.position.set(0.95, 0.05, 0.05);
    pelvisPivot.add(leftThighPivot);

    // 12. Khớp đầu gối trái (Left Shin)
    const leftShinPivot = new THREE.Group();
    leftShinPivot.name = 'LeftShinPivot';
    leftShinPivot.position.set(0, -3.70, 0);
    leftThighPivot.add(leftShinPivot);

    // Map 12 pivot khớp động học
    this.rigPivots = {
      pelvis: pelvisPivot,
      torso: torsoPivot,
      chest: chestPivot,
      neck: neckPivot,
      rightUpperArm: rightUpperArmPivot,
      rightForearm: rightForearmPivot,
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
  // PHÂN LOẠI MESH VÀO 12 PHÂN ĐOẠN ĐỘNG HỌC (CHUẨN XÁC 100% - KHÔNG TRÙNG LẶP)
  // Cách ly không gian tuyệt đối: Chi trên |X| >= 1.35; Trục thân & Chi dưới |X| < 1.35
  // ============================================================
  _classifyMeshSegment(child, boxCenter) {
    const rawName = (child.name || '').toLowerCase();
    const clean = rawName.replace(/_/g, ' ');

    const isRight = rawName.endsWith('.r') || rawName.endsWith('r') || rawName.includes('.r.') || 
                    clean.includes(' right') || (boxCenter.x < -0.15);
    const isLeft = !isRight;

    if (clean.includes('cross section')) return 'ignore';

    // 1. CHI TRÊN (UPPER LIMB) - CÁCH LY TUYỆT ĐỐI THEO TỌA ĐỘ KHÔNG GIAN
    // Cánh tay, cẳng tay, bàn tay buông xuôi luôn có |X| >= 1.35
    // Thân mình trục giữa và chi dưới KHÔNG BAO GIỜ vượt quá |X| = 1.28
    if (Math.abs(boxCenter.x) >= 1.35) {
      // Cơ thân mình lớn gắn vào ngực/lưng ở lại chest
      if (clean.includes('pectoralis major') || clean.includes('latissimus dorsi') || 
          clean.includes('trapezius') || clean.includes('serratus anterior')) {
        return 'chest';
      }

      // Khớp khuỷu tay: Y < 11.20 là Cẳng tay & Bàn tay; Y >= 11.20 là Cánh tay trên
      if (boxCenter.y < 11.20) {
        return isRight ? 'rightForearm' : 'leftForearm';
      } else {
        return isRight ? 'rightUpperArm' : 'leftUpperArm';
      }
    }

    // TỪ ĐÂY TRỞ XUỐNG, CHẮC CHẮN |X| < 1.35:
    // TUYỆT ĐỐI KHÔNG THỂ LÀ CÁNH TAY, CẲNG TAY HAY BÀN TAY!

    // 2. CẲNG CHÂN & BÀN CHÂN (SHIN & FOOT: Y < 4.75)
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

    // 3. ĐÙI (THIGH: 5.50 < Y < 8.65)
    if (boxCenter.y < 8.65) {
      // Cơ đáy chậu / hậu môn sâu ở lại pelvis
      if (clean.includes('sphincter ani') || clean.includes('levator ani') || 
          clean.includes('pubo-analis') || clean.includes('coccygeus') || clean.includes('ischiocavernosus')) {
        return 'pelvis';
      }
      return isRight ? 'rightThigh' : 'leftThigh';
    }

    // 4. KHUNG CHẬU (PELVIS: 8.65 <= Y <= 9.35)
    if (boxCenter.y <= 9.35) {
      // Các cơ đùi nguyên ủy cao bám vào gai chậu/ụ ngồi chuyển động cùng đùi
      if (clean.includes('adductor') || clean.includes('gracilis') || clean.includes('rectus femoris') || 
          clean.includes('sartorius') || clean.includes('vastus') || clean.includes('biceps femoris') || 
          clean.includes('semitendinosus') || clean.includes('semimembranosus')) {
        return isRight ? 'rightThigh' : 'leftThigh';
      }
      return 'pelvis';
    }

    // 5. ĐẦU & CỔ (HEAD & NECK: Y >= 14.80 HOẶC TỪ KHÓA CỔ GIẢI PHẪU)
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

    // 6. KHỚP TRUNG GIAN: LỒNG NGỰC (CHEST T1-T12: Y >= 11.20)
    if (boxCenter.y >= 11.20) {
      return 'chest';
    }

    // 7. THẮT LƯNG / THÂN DƯỚI (TORSO L1-L5: 9.35 < Y < 11.20)
    return 'torso';
  }

  // ============================================================
  // GẮN MÔ HÌNH VÀO CÂY ĐỘNG HỌC (ATTACH FBX TO RIG)
  // Thực hiện Pre-Pass tính toán tọa độ thế giới trước khi gán pivot
  // ============================================================
  _attachFBXToRig(fbxModel, layerType) {
    const box = new THREE.Box3().setFromObject(fbxModel);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

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

    this.scene.add(fbxModel);
    fbxModel.updateMatrixWorld(true);

    const savedRotations = this._saveCurrentPivotRotations();
    this._resetAllPivotsToNeutral();
    this.rigRoot.updateMatrixWorld(true);

    // Giai đoạn 1: Thu thập tất cả mesh và tính bounding box chuẩn xác khi ở thế nghỉ
    const meshData = [];
    const meshBox = new THREE.Box3();
    const meshCenter = new THREE.Vector3();

    fbxModel.traverse((child) => {
      if (child.isMesh) {
        meshBox.setFromObject(child);
        meshBox.getCenter(meshCenter);
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
            transparent: false,
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

  _getLocalizedName(object) {
    if (object.userData.type === 'acupoint') {
      return `🔴 Huyệt ${object.userData.name_vi} (${object.userData.code})`;
    } else if (object.userData.type === 'muscle') {
      const muscle = this.appVM.getMuscleById ? this.appVM.getMuscleById(object.userData.id) : null;
      if (muscle) return `💪 ${muscle.name_vi}`;
      return `💪 ${object.userData.meshName || object.name}`;
    } else if (object.userData.type === 'nervous') {
      return `🧠 ${object.userData.meshName || 'Dây thần kinh'}`;
    }
    return object.name;
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
      // Khớp ngực mở nhẹ ra sau, cánh tay vươn cao, cổ ngửa theo
      case 'overhead_reach':
        this.targetRotations.chest.set(-0.06, 0, -0.05);
        this.targetRotations.neck.set(-0.15, -0.10, 0);
        this.targetRotations.rightUpperArm.set(0.10, 0.15, -1.45);
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
      // Xoay khung chậu +0.68 rad, đùi phản xoay -0.68 rad giữ cẳng chân thẳng đứng 100%
      // Lưng dưới cong +0.35 rad, lồng ngực cong +0.30 rad, hai tay buông thõng tự nhiên -1.10 rad
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
        this.targetRotations.torso.set(0, 0.20, 0);
        this.targetRotations.chest.set(0, 0.28, 0);
        this.targetRotations.neck.set(0, 0.42, 0);
        this.targetRotations.leftUpperArm.set(-0.10, 0.15, 1.35);
        this.targetRotations.leftForearm.set(0, 0, 0);
        this.targetRotations.rightUpperArm.set(0.15, -0.30, -1.30);
        this.targetRotations.rightForearm.set(-1.80, 0, 0);
        this.targetRotations.rightThigh.set(0, 0, -0.15);
        this.targetRotations.leftThigh.set(0, 0, 0.15);
        break;

      // 6. GIẠNG VAI (Shoulder Abduction)
      case 'shoulder_abduction':
        this.targetRotations.chest.set(0, 0, -0.06);
        this.targetRotations.rightUpperArm.set(0, 0, -1.45);
        this.targetRotations.rightForearm.set(0, 0, 0);
        break;

      // 7. KHÉP VAI (Shoulder Adduction)
      case 'shoulder_adduction':
        this.targetRotations.rightUpperArm.set(0.20, 0.20, 0.40);
        this.targetRotations.rightForearm.set(-0.30, 0, 0);
        break;

      // 8. GẬP VAI (Shoulder Flexion)
      case 'shoulder_flexion':
        this.targetRotations.chest.set(-0.04, 0, 0);
        this.targetRotations.rightUpperArm.set(-1.40, 0, 0);
        this.targetRotations.rightForearm.set(0, 0, 0);
        break;

      // 9. DUỖI VAI (Shoulder Extension)
      case 'shoulder_extension':
        this.targetRotations.chest.set(0.04, 0, 0);
        this.targetRotations.rightUpperArm.set(0.65, 0, 0);
        this.targetRotations.rightForearm.set(0, 0, 0);
        break;

      // 10. XOAY TRONG VAI (Shoulder Internal Rotation)
      case 'shoulder_internal_rotation':
        this.targetRotations.rightUpperArm.set(-0.15, 0.85, -0.20);
        this.targetRotations.rightForearm.set(-1.57, 0, 0);
        break;

      // 11. XOAY NGOÀI VAI (Shoulder External Rotation)
      case 'shoulder_external_rotation':
        this.targetRotations.rightUpperArm.set(0.10, -0.85, -0.20);
        this.targetRotations.rightForearm.set(-1.57, 0, 0);
        break;

      // 12. NÂNG XƯƠNG BẢ VAI (Scapular Elevation)
      case 'scapular_elevation':
        this.targetPositions.chest.y = this.basePositions.chest.y + 0.15;
        this.targetPositions.rightUpperArm.y = this.basePositions.rightUpperArm.y + 0.25;
        this.targetPositions.leftUpperArm.y = this.basePositions.leftUpperArm.y + 0.25;
        this.targetRotations.neck.set(0.08, 0, 0);
        break;

      // 13. KHÉP XƯƠNG BẢ VAI (Scapular Retraction)
      case 'scapular_retraction':
        this.targetRotations.chest.set(-0.12, 0, 0);
        this.targetRotations.rightUpperArm.set(0.35, -0.20, -0.15);
        this.targetRotations.leftUpperArm.set(0.35, 0.20, 0.15);
        break;

      // 14. GẬP KHUỶU TAY (Elbow Flexion)
      case 'elbow_flexion':
        this.targetRotations.rightUpperArm.set(-0.15, 0, 0);
        this.targetRotations.rightForearm.set(-2.10, 0, 0);
        break;

      // 15. DUỖI KHUỶU TAY (Elbow Extension)
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
        mesh.material.depthWrite = true;
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
          mesh.material.opacity = 1.0;
          mesh.material.transparent = false; // Luôn đục vững chắc để quan sát rõ nét
          mesh.material.depthWrite = true;
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
        mesh.material.transparent = this.nervousOpacity < 1.0;
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
