import { Observable } from './Observable.js?v=8.0';

const ROLE_COLORS = {
  agonist: '#ef4444',     // Đỏ - Cơ chủ vận
  antagonist: '#38bdf8',  // Xanh da trời Cyan - Cơ đối vận
  synergist: '#f59e0b',   // Vàng Amber - Cơ hiệp đồng
  stabilizer: '#10b981',  // Xanh lá Emerald - Cơ ổn định / cố định
  pain: '#dc2626',        // Đỏ Crimson cảnh báo - Cơ đau chính
  chain: '#f59e0b',       // Vàng hổ phách - Chuỗi cơ liên đới
  antagonist_tight: '#0284c7' // Xanh biển - Cơ co rút đối ứng
};

/**
 * SceneViewModel
 * Quản lý trạng thái logic của Three.js Scene:
 * - Chế độ 1: Cử động & Phân vai cơ động học (Agonist, Antagonist...)
 * - Chế độ 2: Trị liệu & Chuỗi Cơ Cân (Pain Point, Myofascial Chain, 3D Acupoints)
 * - 2 Lớp giải phẫu chính: Hệ Cơ (Muscular) & Hệ Thần Kinh (Nervous)
 */
export class SceneViewModel extends Observable {
  /**
   * @param {import('./AppViewModel.js').AppViewModel} appVM 
   */
  constructor(appVM) {
    super({
      highlightedMuscles: [],    // Array of { muscleId, role, color }
      showMuscleLayer: true,     // MẶC ĐỊNH: Hiện hệ cơ
      showNervousLayer: false,   // MẶC ĐỊNH: Ẩn hệ thần kinh
      muscleOpacity: 1.0,        // MẶC ĐỊNH: 100% ĐỤC (Opaque solid)
      nervousOpacity: 0.90,      // Độ mờ độc lập của Hệ Thần Kinh
      hoveredObjectId: null,
      isolatedMuscleId: null,
      displayedAcupoints: [],    // Danh sách điểm huyệt 3D đang hiển thị
      focusedAcupointCode: null  // Mã huyệt đang được tiêu điểm
    });
    this.appVM = appVM;
  }
  
  /**
   * Highlight cơ cho Chế độ 1 (Cử động mẫu)
   * @param {Array<{id: string, role: string}>} muscleList 
   */
  highlightMusclesForMovement(muscleList) {
    this.state.highlightedMuscles = (muscleList || []).map(m => ({
      muscleId: m.id,
      role: m.role,
      color: ROLE_COLORS[m.role] || '#ef4444'
    }));
  }

  /**
   * Highlight cơ cho Chế độ 2 (Chuỗi cơ cân & Cơ đau)
   * @param {Array<{id: string, role: string}>} painMuscles 
   * @param {Array<{id: string, role: string}>} chainMuscles 
   */
  highlightAcupunctureChain(painMuscles = [], chainMuscles = []) {
    const list = [];
    painMuscles.forEach(m => {
      list.push({
        muscleId: m.id,
        role: 'pain',
        color: ROLE_COLORS.pain
      });
    });
    chainMuscles.forEach(m => {
      list.push({
        muscleId: m.id,
        role: m.role || 'chain',
        color: ROLE_COLORS[m.role] || ROLE_COLORS.chain
      });
    });
    this.state.highlightedMuscles = list;
  }

  /**
   * Hiển thị danh sách các điểm huyệt 3D trên mô hình
   * @param {Array<Object>} acupoints 
   */
  displayAcupoints(acupoints = []) {
    this.state.displayedAcupoints = acupoints;
  }

  /**
   * Tiêu điểm (Focus) vào một huyệt cụ thể
   * @param {string|null} code 
   */
  focusAcupoint(code) {
    this.state.focusedAcupointCode = code;
  }
  
  setShowMuscleLayer(show) {
    this.state.showMuscleLayer = Boolean(show);
  }

  setShowNervousLayer(show) {
    this.state.showNervousLayer = Boolean(show);
  }

  setMuscleOpacity(opacity) {
    this.state.muscleOpacity = Math.max(0.05, Math.min(1, opacity));
  }

  setNervousOpacity(opacity) {
    this.state.nervousOpacity = Math.max(0.05, Math.min(1, opacity));
  }

  setHoveredObject(objectId) {
    this.state.hoveredObjectId = objectId;
  }
  
  isolateMuscle(muscleId) {
    this.state.isolatedMuscleId = muscleId;
  }
  
  clearIsolation() {
    this.state.isolatedMuscleId = null;
  }
  
  resetView() {
    this.batch(() => {
      this.state.highlightedMuscles = [];
      this.state.showMuscleLayer = true;
      this.state.muscleOpacity = 1.0;
      this.state.hoveredObjectId = null;
      this.state.isolatedMuscleId = null;
      this.state.displayedAcupoints = [];
      this.state.focusedAcupointCode = null;
    });
  }
}


