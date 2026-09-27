import { Observable } from './Observable.js?v=4.0';
import { SceneViewModel } from './SceneViewModel.js?v=4.0';
import { MovementViewModel } from './MovementViewModel.js?v=4.0';
import { AcupunctureViewModel } from './AcupunctureViewModel.js?v=4.0';

/**
 * AppViewModel
 * ViewModel gốc quản lý trạng thái toàn ứng dụng, nạp dữ liệu JSON,
 * điều phối 2 chế độ: Chế độ 1 (Động học cử động) & Chế độ 2 (Trị liệu chuỗi cơ cân).
 */
export class AppViewModel extends Observable {
  constructor() {
    super({
      isLoading: true,
      error: null,
      dataLoaded: false,
      activeMode: 'movement' // 'movement' (Chế độ 1) | 'acupuncture' (Chế độ 2)
    });
    
    this.muscleData = null;
    this.movementData = null;
    this.acupointData = null;
    this.boneMapping = null;
    this.chainsData = null;
    
    this.sceneVM = new SceneViewModel(this);
    this.movementVM = new MovementViewModel(this);
    this.acupunctureVM = new AcupunctureViewModel(this);
  }
  
  /**
   * Nạp toàn bộ dữ liệu JSON của ứng dụng
   */
  async initialize() {
    this.state.isLoading = true;
    this.state.error = null;
    
    try {
      const [muscles, movements, acupoints, bones, chains] = await Promise.all([
        fetch('./data/muscles.json').then(r => r.json()),
        fetch('./data/movements.json').then(r => r.json()),
        fetch('./data/acupoints.json').then(r => r.json()),
        fetch('./data/bone-mapping.json').then(r => r.json()),
        fetch('./data/acupuncture-chains.json').then(r => r.json())
      ]);
      
      this.muscleData = muscles;
      this.movementData = movements;
      this.acupointData = acupoints;
      this.boneMapping = bones;
      this.chainsData = chains;
      
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
   * Chuyển đổi giữa 2 chế độ ứng dụng
   * @param {'movement' | 'acupuncture'} mode 
   */
  setMode(mode) {
    if (this.state.activeMode === mode) return;
    this.state.activeMode = mode;

    if (mode === 'movement') {
      // Chuyển sang Chế độ 1: Khôi phục cử động đang chọn nếu có
      this.acupunctureVM.reset();
      const currentMovId = this.movementVM.state.selectedMovementId;
      if (currentMovId) {
        this.movementVM.selectMovement(currentMovId);
      } else {
        this.sceneVM.highlightMusclesForMovement([]);
        this.sceneVM.displayAcupoints([]);
      }
    } else {
      // Chuyển sang Chế độ 2: Xóa highlight cử động và trả tư thế về đứng thẳng trung tính
      this.movementVM.selectMovement(null);
      this.sceneVM.resetView();
      const currentChainId = this.acupunctureVM.state.selectedChainId;
      if (currentChainId) {
        this.acupunctureVM.selectChain(currentChainId);
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
