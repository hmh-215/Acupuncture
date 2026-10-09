import { Observable } from './Observable.js?v=12.0';
import { SceneViewModel } from './SceneViewModel.js?v=12.0';
import { MovementViewModel } from './MovementViewModel.js?v=12.0';
import { AcupointMapViewModel } from './AcupointMapViewModel.js?v=12.0';
import { AcupunctureViewModel } from './AcupunctureViewModel.js?v=12.0';

/**
 * AppViewModel
 * ViewModel gốc quản lý trạng thái toàn ứng dụng, nạp dữ liệu JSON,
 * điều phối 3 chế độ chuyên biệt:
 * - Chế độ 1 ('kinematics'): Động học cử động & phân vai cơ (không hiển thị hệ thần kinh).
 * - Chế độ 2 ('acupoints'): Bản đồ các huyệt đạo trên cơ thể người (Hệ Cơ 10% + Hệ Thần Kinh + 90 Điểm Huyệt 3D).
 * - Chế độ 3 ('therapy'): Các vị trí châm cứu trị liệu (Hội chứng đau cơ, Chuỗi kinh cân lâm sàng).
 */
export class AppViewModel extends Observable {
  constructor() {
    super({
      isLoading: true,
      error: null,
      dataLoaded: false,
      activeMode: 'kinematics' // 'kinematics' (Chế độ 1) | 'acupoints' (Chế độ 2) | 'therapy' (Chế độ 3)
    });
    
    this.muscleData = null;
    this.movementData = null;
    this.acupointData = null;
    this.boneMapping = null;
    this.chainsData = null;
    
    this.sceneVM = new SceneViewModel(this);
    this.movementVM = new MovementViewModel(this);
    this.acupointMapVM = new AcupointMapViewModel(this);
    this.acupunctureVM = new AcupunctureViewModel(this);
  }
  
  /**
   * Nạp toàn bộ dữ liệu JSON của ứng dụng
   */
  async initialize() {
    this.state.isLoading = true;
    this.state.error = null;
    
    try {
      const [muscles, movements, acupoints, bones, chains, registry] = await Promise.all([
        fetch('./data/muscles.json?v=12.0').then(r => r.json()),
        fetch('./data/movements.json?v=12.0').then(r => r.json()),
        fetch('./data/acupoints.json?v=12.0').then(r => r.json()),
        fetch('./data/bone-mapping.json?v=12.0').then(r => r.json()),
        fetch('./data/acupuncture-chains.json?v=12.0').then(r => r.json()),
        fetch('./data/mesh-joint-registry.json?v=12.0').then(r => r.json()).catch(() => ({}))
      ]);
      
      this.muscleData = muscles;
      this.movementData = movements;
      this.acupointData = acupoints;
      this.boneMapping = bones;
      this.chainsData = chains;
      this.meshJointRegistry = registry || {};
      
      this.acupointMapVM.initPoints();

      this.batch(() => {
        this.state.isLoading = false;
        this.state.dataLoaded = true;
      });
      
    } catch (err) {
      this.batch(() => {
        this.state.error = 'Lỗi tải dữ liệu y khoa: ' + err.message;
        this.state.isLoading = false;
      });
    }
  }

  /**
   * Chuyển đổi giữa 3 chế độ ứng dụng
   * @param {'kinematics' | 'acupoints' | 'therapy' | 'movement' | 'acupuncture'} rawMode 
   */
  setMode(rawMode) {
    let mode = rawMode;
    if (mode === 'movement') mode = 'kinematics';
    if (mode === 'acupuncture') mode = 'therapy';

    if (this.state.activeMode === mode) return;
    this.state.activeMode = mode;

    if (mode === 'kinematics') {
      // Chế độ 1: Động học cử động
      // Ẩn hệ thần kinh, xóa điểm huyệt, phục hồi cơ đục 100%
      if (this.sceneVM) {
        this.sceneVM.setShowNervousLayer(false);
        this.sceneVM.setShowMuscleLayer(true);
        this.sceneVM.setMuscleOpacity(1.0);
        this.sceneVM.displayAcupoints([]);
      }
      this.acupunctureVM.reset();
      this.acupointMapVM.reset();

      const currentMovId = this.movementVM.state.selectedMovementId;
      if (currentMovId) {
        this.movementVM.selectMovement(currentMovId);
      } else {
        this.sceneVM.highlightMusclesForMovement([]);
      }

    } else if (mode === 'acupoints') {
      // Chế độ 2: Bản đồ các huyệt đạo trên cơ thể người
      // Trả về tư thế đứng thẳng, hiển thị Hệ Cơ (mặc định mờ 10% khởi điểm) + Hệ Thần Kinh (bật) + Huyệt Vị 3D
      this.movementVM.selectMovement(null);
      this.acupunctureVM.reset();
      if (this.sceneVM) {
        this.sceneVM.resetView();
        this.sceneVM.setShowMuscleLayer(true);
        this.sceneVM.setShowNervousLayer(true);
        this.sceneVM.setMuscleOpacity(0.10);
        this.sceneVM.setNervousOpacity(0.90);
      }
      this.acupointMapVM.initPoints();

    } else if (mode === 'therapy') {
      // Chế độ 3: Các vị trí châm cứu trị liệu & Chuỗi kinh cân
      this.movementVM.selectMovement(null);
      this.acupointMapVM.reset();
      if (this.sceneVM) {
        this.sceneVM.resetView();
        this.sceneVM.setShowMuscleLayer(true);
        this.sceneVM.setShowNervousLayer(false);
        this.sceneVM.setMuscleOpacity(1.0);
      }
      const currentChainId = this.acupunctureVM.state.selectedChainId;
      if (currentChainId) {
        this.acupunctureVM.selectChain(currentChainId);
      } else {
        const chains = this.getChains();
        if (chains && chains.length > 0) {
          this.acupunctureVM.selectChain(chains[0].id);
        }
      }
    }
  }

  getMuscles() {
    if (!this.muscleData) return [];
    return Object.values(this.muscleData);
  }

  getMuscleById(id) {
    if (!this.muscleData) return null;
    return this.muscleData[id] || null;
  }

  getBoneNameVi(meshName) {
    if (!this.boneMapping || !this.boneMapping[meshName]) return meshName;
    return this.boneMapping[meshName].name_vi;
  }

  getMovements() {
    if (!this.movementData) return [];
    return Object.values(this.movementData);
  }

  getChains() {
    if (!this.chainsData) return [];
    return Object.values(this.chainsData);
  }

  getChainById(id) {
    if (!this.chainsData) return null;
    return this.chainsData[id] || null;
  }

  getAcupoint(code) {
    if (!this.acupointData) return null;
    return this.acupointData[code] || null;
  }
}
