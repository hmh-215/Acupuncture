/**
 * UIView.js
 * Handles all DOM updates, controls, and user interactions.
 * Strictly adheres to index.html elements and theme.css styles.
 */
export class UIView {
  constructor(movementVM, sceneVM, appVM) {
    this.movementVM = movementVM;
    this.sceneVM = sceneVM;
    this.appVM = appVM;

    this._cacheElements();
    this._bindToViewModels();
    this._setupEventListeners();
  }

  _cacheElements() {
    this.els = {
      movementSelect: document.getElementById('movement-select'),
      searchInput: document.getElementById('search-input'),
      movementInfo: document.getElementById('movement-info'),
      movementDesc: document.getElementById('movement-desc'),
      movementPlane: document.getElementById('movement-plane'),
      movementRom: document.getElementById('movement-rom'),
      movementPhases: document.getElementById('movement-phases'),

      filterButtons: document.querySelectorAll('.filter-btn'),
      muscleList: document.getElementById('muscle-list'),

      muscleDetailCard: document.getElementById('muscle-detail-card'),
      detailMuscleName: document.getElementById('detail-muscle-name'),
      detailMuscleLatin: document.getElementById('detail-muscle-latin'),
      detailOrigin: document.getElementById('detail-origin'),
      detailInsertion: document.getElementById('detail-insertion'),
      detailAction: document.getElementById('detail-action'),
      detailInnervation: document.getElementById('detail-innervation'),
      detailBlood: document.getElementById('detail-blood'),
      detailAcupoints: document.getElementById('detail-acupoints'),
      btnCloseDetail: document.getElementById('btn-close-detail'),

      toggleSkeleton: document.getElementById('toggle-skeleton'),
      toggleMuscles: document.getElementById('toggle-muscles'),
      toggleNervous: document.getElementById('toggle-nervous'),
      toggleVascular: document.getElementById('toggle-vascular'),

      // 4 Thanh trượt độ mờ/nhạt độc lập cho 4 hệ
      sliderMuscleOpacity: document.getElementById('slider-muscle-opacity'),
      valMuscleOpacity: document.getElementById('val-muscle-opacity'),
      sliderSkeletonOpacity: document.getElementById('slider-skeleton-opacity'),
      valSkeletonOpacity: document.getElementById('val-skeleton-opacity'),
      sliderNervousOpacity: document.getElementById('slider-nervous-opacity'),
      valNervousOpacity: document.getElementById('val-nervous-opacity'),
      sliderVascularOpacity: document.getElementById('slider-vascular-opacity'),
      valVascularOpacity: document.getElementById('val-vascular-opacity'),

      btnResetView: document.getElementById('btn-reset-view'),
      btnToggleTheme: document.getElementById('btn-toggle-theme'),

      loadingOverlay: document.getElementById('loading-overlay')
    };
  }

  _bindToViewModels() {
    if (this.movementVM) {
      this.movementVM.on('selectedMovement', m => this._renderMovementInfo(m));
      this.movementVM.on('activeMuscles', muscles => this._renderMuscleList(muscles));
      this.movementVM.on('selectedMuscleDetail', detail => this._renderMuscleDetail(detail));
      this.movementVM.on('filterRole', role => this._updateFilterButtons(role));
    }

    if (this.appVM) {
      this.appVM.on('isLoading', loading => this._toggleLoading(loading));
      this.appVM.on('error', err => this._showError(err));
      this.appVM.on('dataLoaded', () => this._populateMovementDropdown());

      // Sửa lỗi: Nếu data đã nạp trước khi UIView khởi tạo, gọi populate ngay lập tức!
      if (this.appVM.state.dataLoaded) {
        this._populateMovementDropdown();
      }
    }
  }

  _setupEventListeners() {
    // Dropdown chọn cử động
    if (this.els.movementSelect) {
      this.els.movementSelect.addEventListener('change', (e) => {
        if (this.movementVM) this.movementVM.selectMovement(e.target.value);
      });
    }

    // Ô tìm kiếm cơ hoặc cử động
    if (this.els.searchInput) {
      this.els.searchInput.addEventListener('input', (e) => {
        const query = e.target.value;
        this._populateMovementDropdown(query);
        if (this.movementVM) this.movementVM.search(query);
      });
    }

    // Các nút lọc vai trò (Chủ vận, Đối vận, Hiệp đồng, Cố định)
    if (this.els.filterButtons) {
      this.els.filterButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
          const role = btn.dataset.role;
          if (this.movementVM) this.movementVM.filterByRole(role);
        });
      });
    }

    // Toggle ẩn/hiện xương
    if (this.els.toggleSkeleton) {
      this.els.toggleSkeleton.addEventListener('change', (e) => {
        if (this.sceneVM) this.sceneVM.setShowSkeleton(e.target.checked);
      });
    }

    // Toggle ẩn/hiện cơ
    if (this.els.toggleMuscles) {
      this.els.toggleMuscles.addEventListener('change', (e) => {
        if (this.sceneVM) this.sceneVM.setShowMuscleLayer(e.target.checked);
      });
    }

    // Toggle ẩn/hiện thần kinh
    if (this.els.toggleNervous) {
      this.els.toggleNervous.addEventListener('change', (e) => {
        if (this.sceneVM) this.sceneVM.setShowNervousLayer(e.target.checked);
      });
    }

    // Toggle ẩn/hiện tuần hoàn
    if (this.els.toggleVascular) {
      this.els.toggleVascular.addEventListener('change', (e) => {
        if (this.sceneVM) this.sceneVM.setShowVascularLayer(e.target.checked);
      });
    }

    // 1. Slider độ mờ/nhạt của Hệ Cơ
    if (this.els.sliderMuscleOpacity) {
      this.els.sliderMuscleOpacity.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        if (this.els.valMuscleOpacity) this.els.valMuscleOpacity.textContent = `${Math.round(val)}%`;
        if (this.sceneVM) this.sceneVM.setMuscleOpacity(val / 100);
      });
    }

    // 2. Slider độ mờ của Hệ Xương
    if (this.els.sliderSkeletonOpacity) {
      this.els.sliderSkeletonOpacity.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        if (this.els.valSkeletonOpacity) this.els.valSkeletonOpacity.textContent = `${Math.round(val)}%`;
        if (this.sceneVM) this.sceneVM.setSkeletonOpacity(val / 100);
      });
    }

    // 3. Slider độ mờ của Hệ Thần Kinh
    if (this.els.sliderNervousOpacity) {
      this.els.sliderNervousOpacity.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        if (this.els.valNervousOpacity) this.els.valNervousOpacity.textContent = `${Math.round(val)}%`;
        if (this.sceneVM) this.sceneVM.setNervousOpacity(val / 100);
      });
    }

    // 4. Slider độ mờ của Hệ Tuần Hoàn
    if (this.els.sliderVascularOpacity) {
      this.els.sliderVascularOpacity.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        if (this.els.valVascularOpacity) this.els.valVascularOpacity.textContent = `${Math.round(val)}%`;
        if (this.sceneVM) this.sceneVM.setVascularOpacity(val / 100);
      });
    }

    // Nút đặt lại góc nhìn và thông số
    if (this.els.btnResetView) {
      this.els.btnResetView.addEventListener('click', () => {
        if (this.sceneVM) this.sceneVM.resetView();
        if (this.movementVM) this.movementVM.resetFilters();
        if (this.els.searchInput) this.els.searchInput.value = '';

        // Đặt lại 4 thanh trượt về mặc định
        if (this.els.sliderMuscleOpacity) {
          this.els.sliderMuscleOpacity.value = 95;
          if (this.els.valMuscleOpacity) this.els.valMuscleOpacity.textContent = '95%';
          if (this.sceneVM) this.sceneVM.setMuscleOpacity(0.95);
        }
        if (this.els.sliderSkeletonOpacity) {
          this.els.sliderSkeletonOpacity.value = 80;
          if (this.els.valSkeletonOpacity) this.els.valSkeletonOpacity.textContent = '80%';
          if (this.sceneVM) this.sceneVM.setSkeletonOpacity(0.80);
        }
        if (this.els.sliderNervousOpacity) {
          this.els.sliderNervousOpacity.value = 90;
          if (this.els.valNervousOpacity) this.els.valNervousOpacity.textContent = '90%';
          if (this.sceneVM) this.sceneVM.setNervousOpacity(0.90);
        }
        if (this.els.sliderVascularOpacity) {
          this.els.sliderVascularOpacity.value = 90;
          if (this.els.valVascularOpacity) this.els.valVascularOpacity.textContent = '90%';
          if (this.sceneVM) this.sceneVM.setVascularOpacity(0.90);
        }

        if (this.els.toggleSkeleton) this.els.toggleSkeleton.checked = false;
        if (this.els.toggleMuscles) this.els.toggleMuscles.checked = true;
        if (this.els.toggleNervous) this.els.toggleNervous.checked = false;
        if (this.els.toggleVascular) this.els.toggleVascular.checked = false;
        this._populateMovementDropdown();
      });
    }

    // Nút chuyển đổi giao diện Sáng / Tối (Default là Light Mode)
    if (this.els.btnToggleTheme) {
      this.els.btnToggleTheme.addEventListener('click', () => {
        const isDark = document.body.classList.toggle('dark-theme');
        this.els.btnToggleTheme.textContent = isDark ? '☀️ Giao diện Sáng' : '🌙 Giao diện Tối';
        this.els.btnToggleTheme.title = isDark ? 'Chuyển sang chế độ Sáng y khoa' : 'Chuyển sang chế độ Tối y khoa';
        if (this.sceneVM && this.sceneVM.setTheme) {
          this.sceneVM.setTheme(isDark ? 'dark' : 'light');
        }
      });
    }

    // Nút đóng bảng chi tiết cơ
    if (this.els.btnCloseDetail) {
      this.els.btnCloseDetail.addEventListener('click', () => {
        if (this.els.muscleDetailCard) this.els.muscleDetailCard.style.display = 'none';
        if (this.sceneVM) this.sceneVM.clearIsolation();
      });
    }
  }

  _populateMovementDropdown(filterQuery = '') {
    if (!this.els.movementSelect || !this.appVM) return;

    let movements = this.appVM.getMovements();
    const q = (filterQuery || '').trim().toLowerCase();
    if (q) {
      movements = movements.filter(m => {
        const vi = (m.name_vi || '').toLowerCase();
        const en = (m.name_en || '').toLowerCase();
        const desc = (m.description_vi || '').toLowerCase();
        return vi.includes(q) || en.includes(q) || desc.includes(q);
      });
    }

    this.els.movementSelect.innerHTML = '<option value="">— Chọn chuyển động mẫu —</option>';

    // Phân nhóm hiển thị trực quan
    const groupPresets = document.createElement('optgroup');
    groupPresets.label = '🌟 CHUỖI VẬN ĐỘNG TOÀN THÂN & ĐẠO DẪN (PRESETS)';

    const groupShoulder = document.createElement('optgroup');
    groupShoulder.label = '🏃 CỬ ĐỘNG KHỚP VAI & ĐAI VAI';

    const groupScapula = document.createElement('optgroup');
    groupScapula.label = '🦴 CỬ ĐỘNG XƯƠNG BẢ VAI';

    const groupElbow = document.createElement('optgroup');
    groupElbow.label = '💪 CỬ ĐỘNG KHUỶU & CẲNG TAY';

    const presetIds = ['overhead_reach', 'trunk_rotation', 'walking_gait', 'forward_bending', 'archer_pull'];

    movements.forEach(m => {
      const opt = document.createElement('option');
      opt.value = m.id;
      opt.textContent = `${m.name_vi} (${m.name_en || ''})`;

      if (presetIds.includes(m.id)) {
        groupPresets.appendChild(opt);
      } else if (m.id.startsWith('shoulder_')) {
        groupShoulder.appendChild(opt);
      } else if (m.id.startsWith('scapular_')) {
        groupScapula.appendChild(opt);
      } else if (m.id.startsWith('elbow_')) {
        groupElbow.appendChild(opt);
      } else {
        groupPresets.appendChild(opt);
      }
    });

    if (groupPresets.children.length > 0) this.els.movementSelect.appendChild(groupPresets);
    if (groupShoulder.children.length > 0) this.els.movementSelect.appendChild(groupShoulder);
    if (groupScapula.children.length > 0) this.els.movementSelect.appendChild(groupScapula);
    if (groupElbow.children.length > 0) this.els.movementSelect.appendChild(groupElbow);
  }

  _renderMovementInfo(movement) {
    if (!this.els.movementInfo) return;

    if (!movement) {
      this.els.movementInfo.style.display = 'none';
      return;
    }

    this.els.movementInfo.style.display = 'block';

    if (this.els.movementDesc) {
      this.els.movementDesc.textContent = movement.description_vi || movement.description || '';
    }

    if (this.els.movementPlane) {
      this.els.movementPlane.textContent = movement.plane_vi || movement.plane || '';
    }

    if (this.els.movementRom) {
      this.els.movementRom.textContent = `Tầm vận động: ${movement.range_of_motion || movement.rom || 'Đầy đủ'}`;
    }

    // Render các pha vận động
    if (this.els.movementPhases) {
      this.els.movementPhases.innerHTML = '';
      if (movement.phases && Array.isArray(movement.phases) && movement.phases.length > 0) {
        movement.phases.forEach(p => {
          const item = document.createElement('div');
          item.className = 'phase-item';
          item.innerHTML = `
            <span class="phase-range">${p.range}</span>
            <span class="phase-desc">${p.primary}</span>
          `;
          this.els.movementPhases.appendChild(item);
        });
      }
    }
  }

  _renderMuscleList(muscles) {
    if (!this.els.muscleList) return;

    this.els.muscleList.innerHTML = '';

    if (!muscles || muscles.length === 0) {
      this.els.muscleList.innerHTML = '<li class="muscle-placeholder">Không có cơ nào trong danh mục này hoặc chưa chọn chuyển động.</li>';
      return;
    }

    const roleLabels = {
      agonist: 'Chủ vận',
      antagonist: 'Đối vận',
      synergist: 'Hiệp đồng',
      stabilizer: 'Ổn định'
    };

    muscles.forEach(m => {
      const li = document.createElement('li');
      li.className = 'muscle-item';
      li.dataset.role = m.role || 'synergist';

      let dotColor = 'var(--amber)';
      if (m.role === 'agonist') dotColor = 'var(--red)';
      else if (m.role === 'antagonist') dotColor = 'var(--cyan)';
      else if (m.role === 'stabilizer') dotColor = 'var(--green)';

      li.innerHTML = `
        <span class="muscle-color-dot" style="background: ${dotColor};"></span>
        <span class="muscle-name">${m.name_vi || m.id}</span>
        <span class="muscle-role-tag" data-role="${m.role || 'synergist'}">${roleLabels[m.role] || m.role}</span>
      `;

      li.addEventListener('click', () => {
        // Bỏ highlight các thẻ khác
        this.els.muscleList.querySelectorAll('.muscle-item').forEach(el => el.classList.remove('selected'));
        li.classList.add('selected');

        if (this.movementVM) this.movementVM.selectMuscleForDetail(m.id);
        if (this.sceneVM) this.sceneVM.isolateMuscle(m.id);
      });

      this.els.muscleList.appendChild(li);
    });
  }

  _renderMuscleDetail(detail) {
    if (!this.els.muscleDetailCard) return;

    if (!detail) {
      this.els.muscleDetailCard.style.display = 'none';
      return;
    }

    this.els.muscleDetailCard.style.display = 'block';

    if (this.els.detailMuscleName) this.els.detailMuscleName.textContent = detail.name_vi || detail.id;
    if (this.els.detailMuscleLatin) this.els.detailMuscleLatin.textContent = detail.name_latin || '';

    if (this.els.detailOrigin) this.els.detailOrigin.textContent = detail.origin_vi || 'Đang cập nhật';
    if (this.els.detailInsertion) this.els.detailInsertion.textContent = detail.insertion_vi || 'Đang cập nhật';
    if (this.els.detailAction) this.els.detailAction.textContent = detail.action_vi || 'Đang cập nhật';
    if (this.els.detailInnervation) this.els.detailInnervation.textContent = detail.innervation_vi || 'Đang cập nhật';
    if (this.els.detailBlood) this.els.detailBlood.textContent = detail.blood_supply_vi || 'Động mạch lân cận';

    // Render danh sách huyệt vị WHO liên quan
    if (this.els.detailAcupoints) {
      this.els.detailAcupoints.innerHTML = '';
      if (detail.acupoints && Array.isArray(detail.acupoints) && detail.acupoints.length > 0) {
        detail.acupoints.forEach(ap => {
          const li = document.createElement('li');
          li.className = 'acupoint-item';
          li.innerHTML = `
            <span class="acupoint-code">${ap.code}</span>
            <div class="acupoint-meta">
              <span class="acupoint-name">${ap.name_vi} (${ap.name_han_viet || ''}) - ${ap.meridian_vi || ''}</span>
              <p class="acupoint-location">${ap.location_vi || ''}</p>
            </div>
          `;
          this.els.detailAcupoints.appendChild(li);
        });
      } else {
        this.els.detailAcupoints.innerHTML = '<li class="text-muted" style="font-size:0.75rem; color:var(--muted); padding:4px 0;">Chưa ghi nhận huyệt vị chính trực tiếp trên cơ này.</li>';
      }
    }
  }

  _updateFilterButtons(role) {
    if (!this.els.filterButtons) return;

    this.els.filterButtons.forEach(btn => {
      const activeRole = role || 'all';
      if (btn.dataset.role === activeRole) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  _toggleLoading(loading) {
    if (this.els.loadingOverlay) {
      this.els.loadingOverlay.style.display = loading ? 'flex' : 'none';
    }
  }

  _showError(err) {
    console.error('Lỗi ứng dụng:', err);
    if (this.els.loadingOverlay) {
      this.els.loadingOverlay.style.display = 'flex';
      const p = this.els.loadingOverlay.querySelector('p');
      if (p) p.textContent = `Lỗi: ${err}`;
      const spinner = this.els.loadingOverlay.querySelector('.spinner');
      if (spinner) spinner.style.display = 'none';
    }
  }
}
