import { Observable } from './Observable.js?v=12.0';

/**
 * AcupunctureViewModel
 * Quản lý trạng thái logic của Chế độ 3: Trị Liệu & Châm Cứu Theo Chuỗi Cơ Cân
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
      selectedAcupoint: null,       // Huyệt vị cụ thể đang được xem chi tiết
      selectedRoleFilter: 'all'     // 'all' | 'pain' | 'chain' | 'antagonist_tight' | 'acupoint'
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
        this.state.selectedRoleFilter = 'all';
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
      this.state.selectedAcupoint = null; // Khởi đầu: chưa chọn huyệt đơn lẻ nào để hiển thị TOÀN BỘ các huyệt đặc trị của chuỗi
      this.state.selectedRoleFilter = 'all';
    });

    // Cập nhật lên 3D Scene
    if (this.appVM.sceneVM) {
      this.appVM.sceneVM.highlightAcupunctureChain(painMuscles, chainMuscles);
      this.appVM.sceneVM.displayAcupoints(acupoints);
      this.appVM.sceneVM.focusAcupoint(null);
    }
  }

  /**
   * Bật/tắt lọc hiển thị theo tiêu chí nhóm cơ trị liệu từ legend
   * @param {'pain' | 'chain' | 'antagonist_tight' | 'acupoint'} role 
   */
  toggleFilterRole(role) {
    const current = this.state.selectedRoleFilter || 'all';
    const nextRole = current === role ? 'all' : role;
    this.state.selectedRoleFilter = nextRole;

    if (!this.state.selectedChain) return;

    let pMuscles = this.state.activePainMuscles;
    let cMuscles = this.state.activeChainMuscles;

    if (nextRole === 'pain') {
      cMuscles = [];
    } else if (nextRole === 'chain') {
      pMuscles = [];
      cMuscles = cMuscles.filter(m => m.role === 'chain');
    } else if (nextRole === 'antagonist_tight') {
      pMuscles = [];
      cMuscles = cMuscles.filter(m => m.role === 'antagonist_tight');
    } else if (nextRole === 'acupoint') {
      if (this.state.activeAcupoints.length > 0) {
        this.selectAcupoint(this.state.activeAcupoints[0].code);
      }
      return;
    }

    if (this.appVM.sceneVM) {
      this.appVM.sceneVM.highlightAcupunctureChain(pMuscles, cMuscles);
    }
  }

  /**
   * Chọn một huyệt cụ thể để xem chi tiết
   * Hỗ trợ toggle: click lại chính huyệt đang chọn hoặc truyền null để hủy chọn (hiển thị lại tất cả huyệt của chuỗi)
   * @param {string|null} code Mã huyệt WHO (ví dụ GB-21)
   */
  selectAcupoint(code) {
    if (!code || this.state.selectedAcupoint?.code === code) {
      this.state.selectedAcupoint = null;
      if (this.appVM.sceneVM) {
        this.appVM.sceneVM.focusAcupoint(null);
      }
      return;
    }

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
   * Đặt lại trạng thái Chế độ 3
   */
  reset() {
    this.selectChain(null);
  }
}


