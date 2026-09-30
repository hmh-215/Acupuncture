import { Observable } from './Observable.js?v=5.6';

/**
 * AcupunctureViewModel
 * Quản lý trạng thái logic của Chế độ 2: Trị Liệu & Châm Cứu Theo Chuỗi Cơ Cân
 */
export class AcupunctureViewModel extends Observable {
  /**
   * @param {import('./AppViewModel.js').AppViewModel} appVM 
   */
  constructor(appVM) {
    super({
      selectedChainId: null,
      selectedChain: null,          // Dữ liệu đầy đủ của hội chứng cân cơ đang chọn
      activePainMuscles: [],        // Danh sách cơ đau chính (màu đỏ cảnh báo)
      activeChainMuscles: [],       // Danh sách cơ liên đới trong chuỗi (màu vàng hổ phách)
      activeAcupoints: [],          // Danh sách các huyệt vị kèm tọa độ 3D
      selectedAcupoint: null        // Huyệt vị cụ thể đang được xem chi tiết
    });
    this.appVM = appVM;
  }

  /**
   * Chọn hội chứng đau cơ / chuỗi kinh cân lâm sàng
   * @param {string|null} chainId 
   */
  selectChain(chainId) {
    const chainsData = this.appVM.chainsData;
    if (!chainsData) return;

    if (!chainId) {
      this.batch(() => {
        this.state.selectedChainId = null;
        this.state.selectedChain = null;
        this.state.activePainMuscles = [];
        this.state.activeChainMuscles = [];
        this.state.activeAcupoints = [];
        this.state.selectedAcupoint = null;
      });
      if (this.appVM.sceneVM) {
        this.appVM.sceneVM.highlightAcupunctureChain([], []);
        this.appVM.sceneVM.displayAcupoints([]);
      }
      return;
    }

    const chain = chainsData[chainId];
    if (!chain) return;

    const painMuscles = (chain.pain_muscles || []).map(id => {
      const detail = this.appVM.getMuscleById(id) || {};
      return { id, role: 'pain', ...detail };
    });

    const chainMuscles = (chain.chain_muscles || []).map(item => {
      const detail = this.appVM.getMuscleById(item.muscleId) || {};
      return { id: item.muscleId, role: item.role || 'chain', note: item.note, ...detail };
    });

    const acupoints = chain.acupoints || [];

    this.batch(() => {
      this.state.selectedChainId = chainId;
      this.state.selectedChain = chain;
      this.state.activePainMuscles = painMuscles;
      this.state.activeChainMuscles = chainMuscles;
      this.state.activeAcupoints = acupoints;
      this.state.selectedAcupoint = acupoints[0] || null;
    });

    // Cập nhật lên 3D Scene
    if (this.appVM.sceneVM) {
      this.appVM.sceneVM.highlightAcupunctureChain(painMuscles, chainMuscles);
      this.appVM.sceneVM.displayAcupoints(acupoints);
    }
  }

  /**
   * Chọn một huyệt cụ thể để xem chi tiết
   * @param {string} code Mã huyệt WHO (ví dụ GB-21)
   */
  selectAcupoint(code) {
    if (!this.state.activeAcupoints) return;
    const pt = this.state.activeAcupoints.find(p => p.code === code);
    if (pt) {
      this.state.selectedAcupoint = pt;
      if (this.appVM.sceneVM) {
        this.appVM.sceneVM.focusAcupoint(code);
      }
    }
  }

  /**
   * Đặt lại trạng thái Chế độ 2
   */
  reset() {
    this.selectChain(null);
  }
}
