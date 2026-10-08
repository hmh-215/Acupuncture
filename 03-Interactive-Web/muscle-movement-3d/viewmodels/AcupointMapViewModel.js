import { Observable } from './Observable.js?v=8.0';

/**
 * AcupointMapViewModel
 * Quản lý trạng thái logic của Chế độ 2: Bản Đồ Các Huyệt Đạo Trên Cơ Thể Người (80 Huyệt Chuẩn YHCT)
 */
export class AcupointMapViewModel extends Observable {
  /**
   * @param {import('./AppViewModel.js').AppViewModel} appVM 
   */
  constructor(appVM) {
    super({
      selectedRegion: 'all',          // 'all' | 'head_neck' | 'lower_limb' | 'upper_limb' | 'chest_abdomen' | 'back_lumbar'
      searchQuery: '',
      activeAcupoints: [],           // Danh sách huyệt hiển thị trên danh sách và 3D
      selectedAcupoint: null,        // Huyệt được chọn xem chi tiết
      focusedAcupointCode: null      // Mã huyệt đang được tiêu điểm
    });
    this.appVM = appVM;
  }

  /**
   * Khởi tạo danh sách huyệt ban đầu khi nạp dữ liệu xong
   */
  initPoints() {
    this._updateFilteredList();
  }

  /**
   * Lọc huyệt theo phân vùng cơ thể
   * @param {string} region 
   */
  filterByRegion(region = 'all') {
    this.state.selectedRegion = region || 'all';
    this._updateFilteredList();
  }

  /**
   * Tìm kiếm huyệt theo từ khóa (tên Việt, mã WHO, tên Hán Việt, kinh mạch)
   * @param {string} query 
   */
  search(query = '') {
    this.state.searchQuery = (query || '').trim().toLowerCase();
    this._updateFilteredList();
  }

  /**
   * Cập nhật danh sách huyệt thỏa mãn cả vùng và từ khóa tìm kiếm
   */
  _updateFilteredList() {
    const acupointData = this.appVM.acupointData;
    if (!acupointData) return;

    let points = Array.isArray(acupointData) ? acupointData : Object.values(acupointData);

    const region = this.state.selectedRegion;
    if (region && region !== 'all') {
      points = points.filter(p => p.region === region);
    }

    const q = this.state.searchQuery;
    if (q) {
      points = points.filter(p => {
        const nameVi = (p.name_vi || '').toLowerCase();
        const code = (p.code || '').toLowerCase();
        const han = (p.name_han_viet || '').toLowerCase();
        const meridian = (p.meridian_vi || '').toLowerCase();
        const ind = (p.indications_vi || '').toLowerCase();
        return nameVi.includes(q) || code.includes(q) || han.includes(q) || meridian.includes(q) || ind.includes(q);
      });
    }

    this.batch(() => {
      this.state.activeAcupoints = points;
      // Nếu có huyệt đang chọn mà không còn trong danh sách thì giữ nguyên hoặc chọn phần tử đầu
      if (!this.state.selectedAcupoint && points.length > 0) {
        this.state.selectedAcupoint = points[0];
      }
    });

    // Cập nhật lên 3D Scene nếu đang ở Chế độ 2
    if (this.appVM.sceneVM && this.appVM.state.activeMode === 'acupoints') {
      this.appVM.sceneVM.displayAcupoints(points);
    }
  }

  /**
   * Chọn một huyệt cụ thể để xem chi tiết và phóng to/tiêu điểm trên 3D
   * @param {string} code 
   */
  selectAcupoint(code) {
    if (!this.appVM.acupointData) return;
    const pt = this.appVM.acupointData[code];
    if (pt) {
      this.batch(() => {
        this.state.selectedAcupoint = pt;
        this.state.focusedAcupointCode = code;
      });
      if (this.appVM.sceneVM) {
        this.appVM.sceneVM.focusAcupoint(code);
      }
    }
  }

  /**
   * Đặt lại trạng thái Chế độ 2
   */
  reset() {
    this.batch(() => {
      this.state.selectedRegion = 'all';
      this.state.searchQuery = '';
      this.state.selectedAcupoint = null;
      this.state.focusedAcupointCode = null;
    });
    this._updateFilteredList();
  }
}
