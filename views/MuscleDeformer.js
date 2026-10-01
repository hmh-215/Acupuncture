import * as THREE from 'three';

/**
 * MuscleDeformer
 * Module quản lý biến dạng & co giãn cơ bắp mềm mại (Procedural Soft Skinning / Deformation)
 * cho các nhóm cơ cầu nối bắc qua 2 khớp (Bi-articular Bridge Muscles) chạy 100% trên Three.js / WebGL.
 * 
 * Không yêu cầu phần mềm máy tính (như Blender).
 * Tự động tính toán ma trận độ dời và trọng số làm mềm (smoothstep) trên từng đỉnh geometry.
 */
export class MuscleDeformer {
  constructor() {
    this.rigPivots = null;
    this.bridgeMuscles = [];
    this.isInitialized = false;

    // Tạm dùng tái sử dụng bộ nhớ (Zero Allocation trong render loop)
    this._vRest = new THREE.Vector3();
    this._vTransformed = new THREE.Vector3();
    this._matAnchorInv = new THREE.Matrix4();
    this._matDriverWorld = new THREE.Matrix4();
    this._matDelta = new THREE.Matrix4();
    this._matRestLocal = new THREE.Matrix4();
  }

  /**
   * Khởi tạo với cây phân cấp Kinematic Rig
   * @param {Object} rigPivots - Bảng tra cứu các pivot khớp trong SceneView
   */
  init(rigPivots) {
    this.rigPivots = rigPivots;
    this.isInitialized = true;
  }

  /**
   * Đăng ký một mesh cơ cầu nối cần biến dạng co giãn
   * @param {THREE.Mesh} mesh - Mesh cơ bắp
   * @param {Object} config - Cấu hình biến dạng:
   *   anchorPivot: Pivot cha đang chứa mesh (ví dụ: 'chest')
   *   driverPivot: Pivot chuyển động kéo đầu bám tận (ví dụ: 'rightUpperArm')
   *   type: 'pectoralis_major' | 'latissimus' | 'biceps' | 'custom'
   *   isRight: boolean
   */
  registerBridgeMuscle(mesh, config) {
    if (!mesh || !mesh.geometry || !mesh.geometry.attributes.position) return;

    const geom = mesh.geometry;
    const posAttr = geom.attributes.position;
    const count = posAttr.count;

    // Lưu trữ tọa độ gốc bất biến (Rest Positions)
    const restPositions = new Float32Array(posAttr.array);

    // Tính toán trước mảng trọng số làm mềm trên từng đỉnh (Precomputed Vertex Weights)
    const weights = new Float32Array(count);
    const isRight = config.isRight !== undefined ? config.isRight : (config.driverPivot && config.driverPivot.toLowerCase().includes('right'));

    const vTemp = new THREE.Vector3();

    for (let i = 0; i < count; i++) {
      vTemp.set(posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i));
      let w = 0.0;

      if (config.type === 'pectoralis_major') {
        // Cơ ngực lớn: Bám từ xương ức (|X| ~ 0.0 - 0.4) tới chỏm xương cánh tay (|X| ~ 1.85)
        const absX = Math.abs(vTemp.x);
        const t = THREE.MathUtils.clamp((absX - 0.45) / 1.35, 0.0, 1.0);
        // Đường cong Hermite Smoothstep: 3t^2 - 2t^3
        w = t * t * (3.0 - 2.0 * t);
      } else if (config.type === 'latissimus') {
        // Cơ lưng rộng: Bám từ cột sống ngực dưới / thắt lưng (|X| nhỏ, Y thấp) tới rãnh gian củ cánh tay (Y cao ~13.5, |X| lớn ~1.8)
        const absX = Math.abs(vTemp.x);
        const normY = THREE.MathUtils.clamp((vTemp.y - 10.5) / 3.2, 0.0, 1.0);
        const normX = THREE.MathUtils.clamp((absX - 0.5) / 1.25, 0.0, 1.0);
        const t = 0.5 * normX + 0.5 * normY;
        w = THREE.MathUtils.clamp(t * t * (3.0 - 2.0 * t) * 0.92, 0.0, 1.0);
      } else if (config.type === 'biceps') {
        // Cơ nhị đầu: Đầu bám tận ở lồi củ xương quay (Y thấp ~ 10.8 - 11.3)
        // Khi gập khuỷu, phần gân dưới bám theo cẳng tay
        const normY = THREE.MathUtils.clamp((11.45 - vTemp.y) / 0.85, 0.0, 1.0);
        w = normY * normY * (3.0 - 2.0 * normY);
      } else {
        // Mặc định: tỷ lệ khoảng cách trục X
        const absX = Math.abs(vTemp.x);
        const t = THREE.MathUtils.clamp((absX - 0.5) / 1.2, 0.0, 1.0);
        w = t * t * (3.0 - 2.0 * t);
      }

      weights[i] = w;
    }

    this.bridgeMuscles.push({
      mesh,
      anchorPivotName: config.anchorPivot,
      driverPivotName: config.driverPivot,
      restPositions,
      weights,
      isRight,
      isDeformed: false
    });
  }

  /**
   * Cập nhật biến dạng trong render loop khi các khớp quay
   */
  update() {
    if (!this.isInitialized || this.bridgeMuscles.length === 0) return;

    for (let b = 0; b < this.bridgeMuscles.length; b++) {
      const bridge = this.bridgeMuscles[b];
      const anchor = this.rigPivots[bridge.anchorPivotName];
      const driver = this.rigPivots[bridge.driverPivotName];

      if (!anchor || !driver) continue;

      // Kiểm tra xem driver pivot có đang quay khác 0 so với thế nghỉ không
      const rot = driver.rotation;
      const isDriverAtRest = (Math.abs(rot.x) < 0.002 && Math.abs(rot.y) < 0.002 && Math.abs(rot.z) < 0.002);

      if (isDriverAtRest) {
        if (bridge.isDeformed) {
          // Phục hồi nguyên trạng thế nghỉ (Reset to Rest)
          const posAttr = bridge.mesh.geometry.attributes.position;
          posAttr.array.set(bridge.restPositions);
          posAttr.needsUpdate = true;
          bridge.mesh.geometry.computeVertexNormals();
          bridge.isDeformed = false;
        }
        continue;
      }

      // Khi driver pivot đang quay: Tính ma trận biến đổi tương đối từ Anchor sang Driver
      // M_delta = AnchorWorld^-1 * DriverWorld
      this._matAnchorInv.copy(anchor.matrixWorld).invert();
      this._matDelta.multiplyMatrices(this._matAnchorInv, driver.matrixWorld);

      const posAttr = bridge.mesh.geometry.attributes.position;
      const posArray = posAttr.array;
      const restArray = bridge.restPositions;
      const weights = bridge.weights;
      const count = posAttr.count;

      for (let i = 0; i < count; i++) {
        const w = weights[i];
        const idx = i * 3;

        if (w < 0.001) {
          // Đỉnh neo cố định vào lồng ngực (không di chuyển)
          posArray[idx] = restArray[idx];
          posArray[idx + 1] = restArray[idx + 1];
          posArray[idx + 2] = restArray[idx + 2];
        } else {
          // Đỉnh chịu ảnh hưởng lực kéo của khớp tay
          this._vRest.set(restArray[idx], restArray[idx + 1], restArray[idx + 2]);
          this._vTransformed.copy(this._vRest).applyMatrix4(this._matDelta);

          // Nội suy mượt giữa tọa độ gốc và tọa độ kéo theo
          posArray[idx] = this._vRest.x + w * (this._vTransformed.x - this._vRest.x);
          posArray[idx + 1] = this._vRest.y + w * (this._vTransformed.y - this._vRest.y);
          posArray[idx + 2] = this._vRest.z + w * (this._vTransformed.z - this._vRest.z);
        }
      }

      posAttr.needsUpdate = true;
      bridge.isDeformed = true;
    }
  }

  /**
   * Dọn dẹp tài nguyên
   */
  dispose() {
    this.bridgeMuscles = [];
    this.rigPivots = null;
    this.isInitialized = false;
  }
}
