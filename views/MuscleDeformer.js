import * as THREE from 'three';

/**
 * MuscleDeformer
 * Module quản lý biến dạng & co giãn cơ bắp mềm mại (Procedural Soft Skinning / Linear Blend Skinning)
 * cho các nhóm cơ cầu nối bắc qua 2 khớp (Bi-articular Bridge Muscles) chạy 100% trên Three.js / WebGL.
 * 
 * Sử dụng giải thuật Linear Blend Skinning (LBS) dựa trên ma trận không gian Anchor/Driver chuẩn:
 * T_deform = inv(M_anchor_curr) * M_driver_curr * inv(M_driver_rest) * M_anchor_rest
 */
export class MuscleDeformer {
  constructor() {
    this.rigPivots = null;
    this.bridgeMuscles = [];
    this.isInitialized = false;

    // Bộ nhớ đệm tái sử dụng (Zero Allocation trong render loop)
    this._vRest = new THREE.Vector3();
    this._vTransformed = new THREE.Vector3();
    this._matAnchorInv = new THREE.Matrix4();
    this._matDelta = new THREE.Matrix4();
    this._stepMat = new THREE.Matrix4();
  }

  /**
   * Khởi tạo với danh sách các Pivot khớp của Rig
   */
  init(rigPivots) {
    this.rigPivots = rigPivots;
    this.isInitialized = true;
  }

  /**
   * Đăng ký một mesh cơ cầu nối cần biến dạng co giãn
   * LƯU Ý: Hàm này PHẢI được gọi sau khi mesh đã được attach vào anchorPivot!
   * 
   * @param {THREE.Mesh} mesh - Mesh cơ bắp
   * @param {THREE.Group} anchorPivot - Pivot cha chứa mesh (ví dụ: chest)
   * @param {THREE.Group} driverPivot - Pivot chuyển động kéo đầu bám tận (ví dụ: rightUpperArm)
   * @param {string} type - 'pectoralis_major' | 'latissimus' | 'biceps'
   * @param {boolean} isRight - true nếu bên phải, false nếu bên trái
   */
  registerBridgeMuscle(mesh, anchorPivot, driverPivot, type, isRight) {
    if (!mesh || !mesh.geometry || !mesh.geometry.attributes.position) return;
    if (!anchorPivot || !driverPivot) return;

    // 1. Chuyển đổi geometry về hệ tọa độ cục bộ của anchorPivot
    // Giúp loại bỏ hoàn toàn sai lệch tọa độ giữa các file FBX xuất từ Blender
    if (mesh.matrix && (mesh.position.lengthSq() > 0.0001 || mesh.rotation.x !== 0 || mesh.scale.x !== 1)) {
      mesh.geometry.applyMatrix4(mesh.matrix);
      mesh.position.set(0, 0, 0);
      mesh.rotation.set(0, 0, 0);
      mesh.quaternion.identity();
      mesh.scale.set(1, 1, 1);
      mesh.updateMatrix();
    }
    mesh.frustumCulled = false; // Ngăn Three.js culling mesh khi cơ kéo giãn vượt khỏi bounding ban đầu
    mesh.updateMatrixWorld(true);

    const geom = mesh.geometry;
    const posAttr = geom.attributes.position;
    if (posAttr.setUsage) {
      posAttr.setUsage(THREE.DynamicDrawUsage);
    }
    const count = posAttr.count;

    // Lưu trữ tọa độ gốc ở thế nghỉ trong không gian của anchorPivot
    const restPositions = new Float32Array(posAttr.array);

    // 2. Lưu trữ ma trận thế nghỉ của Anchor và Driver
    anchorPivot.updateMatrixWorld(true);
    driverPivot.updateMatrixWorld(true);

    const anchorRestWorld = anchorPivot.matrixWorld.clone();
    const invDriverRestWorld = driverPivot.matrixWorld.clone().invert();

    // 3. Tính toán trọng số da (Skinning Weights) cho từng đỉnh trong không gian lồng ngực
    // X = 0.0 là đường giữa xương ức; |X| >= 1.75 là chỏm xương cánh tay (khớp vai)
    const weights = new Float32Array(count);
    const vTemp = new THREE.Vector3();

    for (let i = 0; i < count; i++) {
      vTemp.set(posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i));
      let w = 0.0;
      const absX = Math.abs(vTemp.x);

      if (type === 'pectoralis_major') {
        // Cơ ngực lớn: Bám từ xương ức (|X| ~ 0.20 - 0.40) ra chỏm xương cánh tay (|X| ~ 1.85)
        const t = THREE.MathUtils.clamp((absX - 0.35) / 1.45, 0.0, 1.0);
        // Đường cong Hermite Smoothstep 3t^2 - 2t^3 để chuyển tiếp mượt mà
        w = t * t * (3.0 - 2.0 * t);
      } else if (type === 'latissimus') {
        // Cơ lưng rộng: Bám từ cột sống ngực dưới / thắt lưng (|X| nhỏ, Y thấp) tới rãnh gian củ (Y cao ~1.5, |X| lớn ~1.85)
        const normX = THREE.MathUtils.clamp((absX - 0.40) / 1.40, 0.0, 1.0);
        const normY = THREE.MathUtils.clamp((vTemp.y - (-1.5)) / 3.0, 0.0, 1.0);
        const t = 0.5 * normX + 0.5 * normY;
        w = t * t * (3.0 - 2.0 * t) * 0.95;
      } else if (type === 'pectoralis_minor') {
        // Cơ ngực bé: Bám từ xương sườn 3-5 (|X| ~ 0.50) lên mỏm quạ (|X| ~ 1.10)
        const t = THREE.MathUtils.clamp((absX - 0.50) / 0.60, 0.0, 1.0);
        w = t * t * (3.0 - 2.0 * t);
      } else {
        const t = THREE.MathUtils.clamp((absX - 0.40) / 1.40, 0.0, 1.0);
        w = t * t * (3.0 - 2.0 * t);
      }

      weights[i] = w;
    }

    this.bridgeMuscles.push({
      mesh,
      anchorPivot,
      driverPivot,
      anchorRestWorld,
      invDriverRestWorld,
      restPositions,
      weights,
      isDeformed: false
    });

    console.info(`[MuscleDeformer] Đã đăng ký cơ co giãn mềm: ${mesh.name} (${count} đỉnh, loại: ${type})`);
  }

  /**
   * Cập nhật biến dạng cơ bắp trong Render Loop
   */
  update() {
    if (!this.isInitialized || this.bridgeMuscles.length === 0) return;

    for (let b = 0; b < this.bridgeMuscles.length; b++) {
      const bridge = this.bridgeMuscles[b];
      const anchor = bridge.anchorPivot;
      const driver = bridge.driverPivot;

      // T_deform = inv(M_anchor_curr) * M_driver_curr * inv(M_driver_rest) * M_anchor_rest
      this._matAnchorInv.copy(anchor.matrixWorld).invert();
      this._matDelta.multiplyMatrices(this._matAnchorInv, driver.matrixWorld);
      this._matDelta.multiply(bridge.invDriverRestWorld);
      this._matDelta.multiply(bridge.anchorRestWorld);

      const el = this._matDelta.elements;
      // Kiểm tra ma trận tương đối có ở trạng thái nghỉ (Identity matrix) hay không
      const isDeltaAtRest = (
        Math.abs(el[0] - 1.0) < 0.0005 &&
        Math.abs(el[5] - 1.0) < 0.0005 &&
        Math.abs(el[10] - 1.0) < 0.0005 &&
        Math.abs(el[12]) < 0.0005 &&
        Math.abs(el[13]) < 0.0005 &&
        Math.abs(el[14]) < 0.0005
      );

      if (isDeltaAtRest) {
        if (bridge.isDeformed) {
          // Phục hồi nguyên trạng thế nghỉ (Reset to Rest)
          const posAttr = bridge.mesh.geometry.attributes.position;
          posAttr.array.set(bridge.restPositions);
          posAttr.needsUpdate = true;
          bridge.mesh.geometry.computeVertexNormals();
          bridge.mesh.geometry.computeBoundingSphere();
          bridge.isDeformed = false;
        }
        continue;
      }

      const posAttr = bridge.mesh.geometry.attributes.position;
      const posArray = posAttr.array;
      const restArray = bridge.restPositions;
      const weights = bridge.weights;
      const count = posAttr.count;

      for (let i = 0; i < count; i++) {
        const w = weights[i];
        const idx = i * 3;

        if (w < 0.002) {
          // Điểm neo cố định trên xương ức / cột sống
          posArray[idx] = restArray[idx];
          posArray[idx + 1] = restArray[idx + 1];
          posArray[idx + 2] = restArray[idx + 2];
        } else {
          this._vRest.set(restArray[idx], restArray[idx + 1], restArray[idx + 2]);
          this._vTransformed.copy(this._vRest).applyMatrix4(this._matDelta);

          // Nội suy mượt mà (Linear Blend Skinning)
          posArray[idx] = this._vRest.x + w * (this._vTransformed.x - this._vRest.x);
          posArray[idx + 1] = this._vRest.y + w * (this._vTransformed.y - this._vRest.y);
          posArray[idx + 2] = this._vRest.z + w * (this._vTransformed.z - this._vRest.z);
        }
      }

      posAttr.needsUpdate = true;
      bridge.mesh.geometry.computeVertexNormals();
      bridge.mesh.geometry.computeBoundingSphere();
      bridge.isDeformed = true;
    }
  }

  /**
   * Giải phóng tài nguyên
   */
  dispose() {
    this.bridgeMuscles = [];
    this.rigPivots = null;
    this.isInitialized = false;
  }
}
