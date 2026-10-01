/**
 * UIView.js
 * Quản lý toàn bộ giao diện DOM, bảng điều khiển 2 Chế độ và tương tác người dùng:
 * - Chế độ 1: 🏃 Động Học Cử Động (Chủ vận, Đối vận, Hiệp đồng, Ổn định)
 * - Chế độ 2: ⚡ Trị Liệu & Chuỗi Kinh Cân (Bệnh lý cơ đau, Chuỗi cơ cân, Huyệt vị 3D)
 * - Điều khiển 2 hệ giải phẫu cốt lõi: Hệ Cơ & Hệ Thần Kinh
 */
export class UIView {
  constructor(movementVM, sceneVM, appVM) {
    this.movementVM = movementVM;
    this.sceneVM = sceneVM;
    this.appVM = appVM;

    this._cacheElements();
    this._bindToViewModels();
    this._setupEventListeners();
    this._initLectures();
  }

  _cacheElements() {
    this.els = {
      // Menu Điều Hướng Cấp Cao (Mục 1: 3D & Mục 2: Video)
      navBtn3D: document.getElementById('nav-btn-3d'),
      navBtnVideo: document.getElementById('nav-btn-video'),
      section3DModel: document.getElementById('section-3d-model'),
      sectionVideoLectures: document.getElementById('section-video-lectures'),

      // Chuyển Tab 2 Chế độ (trong Mục 1: Mô hình 3D)
      tabModeMovement: document.getElementById('tab-mode-movement'),
      tabModeAcupuncture: document.getElementById('tab-mode-acupuncture'),
      mode1Container: document.getElementById('mode-1-container'),
      mode2Container: document.getElementById('mode-2-container'),

      // Chế độ 1: Cử động mẫu
      movementSelect: document.getElementById('movement-select'),
      searchInput: document.getElementById('search-input'),
      movementInfo: document.getElementById('movement-info'),
      movementDesc: document.getElementById('movement-desc'),
      movementPlane: document.getElementById('movement-plane'),
      movementRom: document.getElementById('movement-rom'),
      movementPhases: document.getElementById('movement-phases'),
      filterButtons: document.querySelectorAll('.filter-btn'),
      muscleList: document.getElementById('muscle-list'),

      // Chế độ 2: Bệnh lý cơ đau & Chuỗi kinh cân
      chainSelect: document.getElementById('chain-select'),
      chainInfo: document.getElementById('chain-info'),
      chainMyofascial: document.getElementById('chain-myofascial'),
      chainMeridian: document.getElementById('chain-meridian'),
      chainBiomechanics: document.getElementById('chain-biomechanics'),
      chainProtocol: document.getElementById('chain-protocol'),
      chainAcupointSection: document.getElementById('chain-acupoint-section'),
      chainAcupointsList: document.getElementById('chain-acupoints-list'),
      acupointDetailCard: document.getElementById('acupoint-detail-card'),
      acupointDetailTitle: document.getElementById('acupoint-detail-title'),
      acupointDetailLoc: document.getElementById('acupoint-detail-loc'),
      acupointDetailDepth: document.getElementById('acupoint-detail-depth'),
      acupointDetailDeqi: document.getElementById('acupoint-detail-deqi'),
      acupointDetailSafety: document.getElementById('acupoint-detail-safety'),

      // Thẻ chi tiết cơ (khi click vào cơ trên 3D hoặc trong danh sách)
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

      // Toggle & Sliders 2 hệ cốt lõi
      toggleMuscles: document.getElementById('toggle-muscles'),
      sliderMuscleOpacity: document.getElementById('slider-muscle-opacity'),
      valMuscleOpacity: document.getElementById('val-muscle-opacity'),

      toggleNervous: document.getElementById('toggle-nervous'),
      sliderNervousOpacity: document.getElementById('slider-nervous-opacity'),
      valNervousOpacity: document.getElementById('val-nervous-opacity'),

      btnResetView: document.getElementById('btn-reset-view'),
      btnToggleTheme: document.getElementById('btn-toggle-theme'),
      loadingOverlay: document.getElementById('loading-overlay'),

      // Mục 2: Video Player & Danh Sách Bài Giảng Theo Chương
      videoActiveBadge: document.getElementById('video-active-badge'),
      videoActiveTitle: document.getElementById('video-active-title'),
      videoActiveDuration: document.getElementById('video-active-duration'),
      videoActiveStatus: document.getElementById('video-active-status'),
      videoScreenContainer: document.getElementById('video-screen-container'),
      videoPlaceholderScreen: document.getElementById('video-placeholder-screen'),
      placeholderHeading: document.getElementById('placeholder-heading'),
      placeholderSub: document.getElementById('placeholder-sub'),
      btnPlayPlaceholder: document.getElementById('btn-play-placeholder'),
      ctrlPlayPause: document.getElementById('ctrl-play-pause'),
      ctrlTimelineProgress: document.getElementById('ctrl-timeline-progress'),
      ctrlTimeDisplay: document.getElementById('ctrl-time-display'),
      vtabSummaryText: document.getElementById('vtab-summary-text'),
      vtabShotsList: document.getElementById('vtab-shots-list'),
      vtabTranscriptText: document.getElementById('vtab-transcript-text'),
      playlistItemsList: document.getElementById('playlist-items-list'),
      playlistSearchInput: document.getElementById('playlist-search-input')
    };
  }

  _bindToViewModels() {
    // Chế độ 1: Cử động
    if (this.movementVM) {
      this.movementVM.on('selectedMovement', m => this._renderMovementInfo(m));
      this.movementVM.on('activeMuscles', muscles => this._renderMuscleList(muscles));
      this.movementVM.on('selectedMuscleDetail', detail => this._renderMuscleDetail(detail));
      this.movementVM.on('filterRole', role => this._updateFilterButtons(role));
    }

    // Chế độ 2: Châm cứu & Chuỗi cơ cân
    if (this.appVM && this.appVM.acupunctureVM) {
      this.appVM.acupunctureVM.on('selectedChain', chain => this._renderChainInfo(chain));
      this.appVM.acupunctureVM.on('selectedAcupoint', pt => this._renderAcupointDetail(pt));
    }

    // Ứng dụng chung
    if (this.appVM) {
      this.appVM.on('isLoading', loading => this._toggleLoading(loading));
      this.appVM.on('error', err => this._showError(err));
      this.appVM.on('dataLoaded', () => {
        this._populateMovementDropdown();
        this._populateChainDropdown();
      });

      if (this.appVM.state.dataLoaded) {
        this._populateMovementDropdown();
        this._populateChainDropdown();
      }
    }
  }

  _setupEventListeners() {
    // Menu Điều Hướng Cấp Cao (Mục 1: Mô Hình 3D vs Mục 2: Video Thuyết Minh Bài Giảng)
    if (this.els.navBtn3D) {
      this.els.navBtn3D.addEventListener('click', () => this.switchTopSection('section-3d-model'));
    }
    if (this.els.navBtnVideo) {
      this.els.navBtnVideo.addEventListener('click', () => this.switchTopSection('section-video-lectures'));
    }

    // Chuyển Tab 2 Chế độ (trong Mục 1)
    if (this.els.tabModeMovement && this.els.tabModeAcupuncture) {
      this.els.tabModeMovement.addEventListener('click', () => this._switchMode('movement'));
      this.els.tabModeAcupuncture.addEventListener('click', () => this._switchMode('acupuncture'));
    }

    // Dropdown chọn cử động (Chế độ 1)
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

      this.els.searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          if (this.els.movementSelect && this.els.movementSelect.options.length > 1) {
            const firstValidOption = Array.from(this.els.movementSelect.options).find(opt => opt.value);
            if (firstValidOption) {
              this.els.movementSelect.value = firstValidOption.value;
              if (this.movementVM) this.movementVM.selectMovement(firstValidOption.value);
            }
          }
        }
      });
    }

    // Lọc vai trò cơ
    if (this.els.filterButtons) {
      this.els.filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          const role = btn.dataset.role;
          if (this.movementVM) this.movementVM.filterByRole(role);
        });
      });
    }

    // Dropdown chọn Hội chứng đau cơ (Chế độ 2)
    if (this.els.chainSelect) {
      this.els.chainSelect.addEventListener('change', (e) => {
        if (this.appVM.acupunctureVM) {
          this.appVM.acupunctureVM.selectChain(e.target.value);
        }
      });
    }

    // Toggle & Slider Hệ Cơ
    if (this.els.toggleMuscles) {
      this.els.toggleMuscles.addEventListener('change', (e) => {
        if (this.sceneVM) this.sceneVM.setShowMuscleLayer(e.target.checked);
      });
    }

    if (this.els.sliderMuscleOpacity) {
      const handleMuscleOpacity = (e) => {
        const val = parseFloat(e.target.value);
        if (this.els.valMuscleOpacity) this.els.valMuscleOpacity.textContent = `${Math.round(val)}%`;
        if (this.sceneVM) this.sceneVM.setMuscleOpacity(val / 100);
      };
      this.els.sliderMuscleOpacity.addEventListener('input', handleMuscleOpacity);
      this.els.sliderMuscleOpacity.addEventListener('change', handleMuscleOpacity);
    }

    // Toggle & Slider Hệ Thần Kinh
    if (this.els.toggleNervous) {
      this.els.toggleNervous.addEventListener('change', (e) => {
        const checked = e.target.checked;
        if (this.sceneVM) this.sceneVM.setShowNervousLayer(checked);
      });
    }

    if (this.els.sliderNervousOpacity) {
      const handleNervousOpacity = (e) => {
        const val = parseFloat(e.target.value);
        if (this.els.valNervousOpacity) this.els.valNervousOpacity.textContent = `${Math.round(val)}%`;
        if (this.sceneVM) this.sceneVM.setNervousOpacity(val / 100);
      };
      this.els.sliderNervousOpacity.addEventListener('input', handleNervousOpacity);
      this.els.sliderNervousOpacity.addEventListener('change', handleNervousOpacity);
    }

    // Đặt lại góc nhìn và thông số
    if (this.els.btnResetView) {
      this.els.btnResetView.addEventListener('click', () => {
        if (this.sceneVM) this.sceneVM.resetView();
        if (this.movementVM) this.movementVM.resetFilters();
        if (this.appVM.acupunctureVM) this.appVM.acupunctureVM.reset();
        if (this.els.searchInput) this.els.searchInput.value = '';

        if (this.els.sliderMuscleOpacity) {
          this.els.sliderMuscleOpacity.value = 100;
          if (this.els.valMuscleOpacity) this.els.valMuscleOpacity.textContent = '100%';
          if (this.sceneVM) this.sceneVM.setMuscleOpacity(1.0);
        }
        if (this.els.sliderNervousOpacity) {
          this.els.sliderNervousOpacity.value = 90;
          if (this.els.valNervousOpacity) this.els.valNervousOpacity.textContent = '90%';
          if (this.sceneVM) this.sceneVM.setNervousOpacity(0.90);
        }

        if (this.els.toggleMuscles) this.els.toggleMuscles.checked = true;
        if (this.els.toggleNervous) this.els.toggleNervous.checked = false;

        this._populateMovementDropdown();
        if (this.els.chainSelect) this.els.chainSelect.value = '';
        if (this.els.chainInfo) this.els.chainInfo.style.display = 'none';
        if (this.els.chainAcupointSection) this.els.chainAcupointSection.style.display = 'none';
        if (this.els.acupointDetailCard) this.els.acupointDetailCard.style.display = 'none';
      });
    }

    // Chuyển đổi giao diện Sáng / Tối
    if (this.els.btnToggleTheme) {
      this.els.btnToggleTheme.addEventListener('click', () => {
        const isDark = document.body.classList.toggle('dark-theme');
        this.els.btnToggleTheme.textContent = isDark ? '☀️ Giao diện Sáng' : '🌙 Giao diện Tối';
        if (this.sceneVM && this.sceneVM.setTheme) {
          this.sceneVM.setTheme(isDark ? 'dark' : 'light');
        }
      });
    }

    // Đóng bảng chi tiết cơ
    if (this.els.btnCloseDetail) {
      this.els.btnCloseDetail.addEventListener('click', () => {
        if (this.els.muscleDetailCard) this.els.muscleDetailCard.style.display = 'none';
        if (this.sceneVM) this.sceneVM.clearIsolation();
      });
    }

    // === MỤC 2: VIDEO THUYẾT MINH BÀI GIẢNG LISTENERS ===
    // Chuyển Tab trong khung Video (Tóm tắt / Micro-Shots / Transcript)
    document.querySelectorAll('.vtab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.vtab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.vtab-content').forEach(c => c.style.display = 'none');
        btn.classList.add('active');
        const targetId = btn.getAttribute('data-vtab');
        const targetEl = document.getElementById(targetId);
        if (targetEl) targetEl.style.display = 'block';
      });
    });

    // Tìm kiếm trong Playlist bài giảng theo chương
    if (this.els.playlistSearchInput) {
      this.els.playlistSearchInput.addEventListener('input', (e) => {
        this.filterPlaylist(e.target.value);
      });
    }

    // Nút Play / Pause mô phỏng khung video
    let isPlaying = false;
    let playInterval = null;
    let simulatedProgress = 32;
    const handleTogglePlay = () => {
      isPlaying = !isPlaying;
      if (this.els.ctrlPlayPause) this.els.ctrlPlayPause.textContent = isPlaying ? '⏸' : '▶';
      if (this.els.btnPlayPlaceholder) {
        this.els.btnPlayPlaceholder.style.transform = isPlaying ? 'scale(0.92)' : 'scale(1)';
        this.els.btnPlayPlaceholder.title = isPlaying ? 'Đang phát mô phỏng bài giảng (Nhấn để tạm dừng)' : 'Nhấn để phát video';
      }
      if (isPlaying) {
        playInterval = setInterval(() => {
          simulatedProgress = (simulatedProgress + 0.5) % 100;
          if (this.els.ctrlTimelineProgress) this.els.ctrlTimelineProgress.style.width = `${simulatedProgress}%`;
        }, 400);
      } else {
        if (playInterval) clearInterval(playInterval);
      }
    };
    if (this.els.btnPlayPlaceholder) this.els.btnPlayPlaceholder.addEventListener('click', handleTogglePlay);
    if (this.els.ctrlPlayPause) this.els.ctrlPlayPause.addEventListener('click', handleTogglePlay);
  }

  _switchMode(mode) {
    if (!this.appVM) return;
    this.appVM.setMode(mode);

    if (mode === 'movement') {
      this.els.tabModeMovement.classList.add('active');
      this.els.tabModeAcupuncture.classList.remove('active');
      this.els.mode1Container.style.display = 'block';
      this.els.mode2Container.style.display = 'none';
      if (this.els.acupointDetailCard) this.els.acupointDetailCard.style.display = 'none';
      if (this.els.chainSelect) this.els.chainSelect.value = '';
    } else {
      this.els.tabModeAcupuncture.classList.add('active');
      this.els.tabModeMovement.classList.remove('active');
      this.els.mode2Container.style.display = 'block';
      this.els.mode1Container.style.display = 'none';
      if (this.els.movementSelect) this.els.movementSelect.value = '';
      if (this.els.movementInfo) this.els.movementInfo.style.display = 'none';

      // Tự động chọn chuỗi đầu tiên để hiển thị trực quan ngay lập tức
      if (this.appVM.acupunctureVM && !this.appVM.acupunctureVM.state.selectedChainId) {
        const chains = this.appVM.getChains();
        if (chains && chains.length > 0) {
          const firstId = chains[0].id;
          if (this.els.chainSelect) this.els.chainSelect.value = firstId;
          this.appVM.acupunctureVM.selectChain(firstId);
        }
      }
    }
  }

  // ============================================================
  // ĐỔ DỮ LIỆU DROPDOWNS
  // ============================================================
  _populateMovementDropdown(filterQuery = '') {
    if (!this.els.movementSelect || !this.appVM) return;

    let movements = this.appVM.getMovements();
    const q = (filterQuery || '').trim().toLowerCase();
    if (q) {
      movements = movements.filter(m => {
        const vi = (m.name_vi || '').toLowerCase();
        const en = (m.name_en || '').toLowerCase();
        return vi.includes(q) || en.includes(q);
      });
    }

    this.els.movementSelect.innerHTML = '<option value="">— Chọn chuyển động mẫu —</option>';

    const groupPresets = document.createElement('optgroup');
    groupPresets.label = '🌟 CHUỖI VẬN ĐỘNG TOÀN THÂN & ĐẠO DẪN (PRESETS)';

    const groupLeg = document.createElement('optgroup');
    groupLeg.label = '🦵 CỬ ĐỘNG CHI DƯỚI & KHUNG CHẬU (SQUAT, LUNGES, DEADLIFT, HIP THRUST)';

    const groupShoulder = document.createElement('optgroup');
    groupShoulder.label = '🏃 CỬ ĐỘNG KHỚP VAI & ĐAI VAI';

    const groupElbow = document.createElement('optgroup');
    groupElbow.label = '💪 CỬ ĐỘNG KHUỶU & CẲNG TAY';

    const presetIds = ['overhead_reach', 'trunk_rotation', 'walking_gait', 'forward_bending', 'archer_pull', 'daodan_archer_pull', 'daodan_hand_behind_back'];
    const legIds = ['squat', 'lunges', 'deadlift', 'hip_thrust'];

    movements.forEach(m => {
      const opt = document.createElement('option');
      opt.value = m.id;
      opt.textContent = `${m.name_vi} (${m.name_en || ''})`;

      if (presetIds.includes(m.id)) {
        groupPresets.appendChild(opt);
      } else if (legIds.includes(m.id) || m.id.startsWith('leg_') || m.id.startsWith('hip_')) {
        groupLeg.appendChild(opt);
      } else if (m.id.startsWith('shoulder_') || m.id.startsWith('scapular_')) {
        groupShoulder.appendChild(opt);
      } else if (m.id.startsWith('elbow_')) {
        groupElbow.appendChild(opt);
      } else {
        groupPresets.appendChild(opt);
      }
    });

    if (groupPresets.children.length > 0) this.els.movementSelect.appendChild(groupPresets);
    if (groupLeg.children.length > 0) this.els.movementSelect.appendChild(groupLeg);
    if (groupShoulder.children.length > 0) this.els.movementSelect.appendChild(groupShoulder);
    if (groupElbow.children.length > 0) this.els.movementSelect.appendChild(groupElbow);
  }

  _populateChainDropdown() {
    if (!this.els.chainSelect || !this.appVM) return;

    const chains = this.appVM.getChains();
    this.els.chainSelect.innerHTML = '<option value="">— Chọn bệnh lý cân cơ / điểm đau —</option>';

    chains.forEach(chain => {
      const opt = document.createElement('option');
      opt.value = chain.id;
      opt.textContent = `⚡ ${chain.name_vi}`;
      this.els.chainSelect.appendChild(opt);
    });
  }

  // ============================================================
  // RENDER THÔNG TIN CHẾ ĐỘ 1: CỬ ĐỘNG
  // ============================================================
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
      this.els.movementPlane.textContent = `📐 ${movement.plane_vi || 'Mặt phẳng giải phẫu'}`;
    }

    if (this.els.movementRom) {
      this.els.movementRom.textContent = `🔄 Biên độ: ${movement.range_of_motion || 'Sinh lý'}`;
    }

    if (this.els.movementPhases) {
      this.els.movementPhases.innerHTML = '';
      if (movement.phases && movement.phases.length > 0) {
        movement.phases.forEach((phase) => {
          const div = document.createElement('div');
          div.className = 'phase-item';
          div.innerHTML = `<strong>${phase.range}:</strong> <span>${phase.primary}</span>`;
          this.els.movementPhases.appendChild(div);
        });
      }
    }
  }

  _renderMuscleList(muscles) {
    if (!this.els.muscleList) return;

    if (!muscles || muscles.length === 0) {
      this.els.muscleList.innerHTML = '<li class="muscle-placeholder">Chọn một cử động để xem phân vai các nhóm cơ</li>';
      return;
    }

    this.els.muscleList.innerHTML = '';

    const roleLabels = {
      agonist: 'Chủ vận',
      antagonist: 'Đối vận',
      synergist: 'Hiệp đồng',
      stabilizer: 'Ổn định'
    };

    muscles.forEach(muscle => {
      const li = document.createElement('li');
      li.className = `muscle-item role-${muscle.role}`;
      li.innerHTML = `
        <div class="muscle-header">
          <span class="muscle-name">${muscle.name_vi || muscle.id}</span>
          <span class="role-badge role-${muscle.role}">${roleLabels[muscle.role] || muscle.role}</span>
        </div>
        <div class="muscle-latin">${muscle.name_latin || ''}</div>
      `;

      li.addEventListener('click', () => {
        if (this.movementVM) this.movementVM.selectMuscleForDetail(muscle.id);
        if (this.sceneVM) this.sceneVM.isolateMuscle(muscle.id);
      });

      this.els.muscleList.appendChild(li);
    });
  }

  _updateFilterButtons(currentRole) {
    if (!this.els.filterButtons) return;
    this.els.filterButtons.forEach(btn => {
      if (btn.dataset.role === currentRole) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  // ============================================================
  // RENDER THÔNG TIN CHẾ ĐỘ 2: TRỊ LIỆU & CHÂU KINH CÂN
  // ============================================================
  _renderChainInfo(chain) {
    if (!this.els.chainInfo || !this.els.chainAcupointSection) return;

    if (!chain) {
      this.els.chainInfo.style.display = 'none';
      this.els.chainAcupointSection.style.display = 'none';
      if (this.els.acupointDetailCard) this.els.acupointDetailCard.style.display = 'none';
      return;
    }

    this.els.chainInfo.style.display = 'block';
    this.els.chainAcupointSection.style.display = 'block';

    if (this.els.chainMyofascial) this.els.chainMyofascial.textContent = chain.myofascial_chain_vi || '';
    if (this.els.chainMeridian) this.els.chainMeridian.textContent = `⚡ Kinh Lạc: ${chain.meridian_chain_vi || ''}`;
    if (this.els.chainBiomechanics) this.els.chainBiomechanics.textContent = chain.biomechanics_vi || '';
    if (this.els.chainProtocol) this.els.chainProtocol.textContent = chain.treatment_protocol_vi || '';

    // Render danh sách huyệt vị tương tác
    if (this.els.chainAcupointsList) {
      this.els.chainAcupointsList.innerHTML = '';
      const pts = chain.acupoints || [];
      pts.forEach(pt => {
        const btn = document.createElement('button');
        btn.className = 'acupoint-card-btn';
        btn.innerHTML = `
          <div class="acupoint-card-header">
            <span class="acupoint-badge">${pt.code}</span>
            <span style="font-weight: 600; color: var(--text);">${pt.name_vi} (${pt.name_han || ''})</span>
            <span class="acupoint-meta-inline">${pt.depth_mm}</span>
          </div>
          <div class="acupoint-meta-inline">📍 ${pt.location_vi}</div>
        `;

        if (this.appVM.acupunctureVM?.state.selectedAcupoint?.code === pt.code) {
          btn.classList.add('active');
        }

        btn.addEventListener('click', () => {
          if (this.appVM.acupunctureVM) this.appVM.acupunctureVM.selectAcupoint(pt.code);
          // Highlight nút đang chọn
          this.els.chainAcupointsList.querySelectorAll('.acupoint-card-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
        });

        this.els.chainAcupointsList.appendChild(btn);
      });
    }
  }

  _renderAcupointDetail(pt) {
    if (!this.els.acupointDetailCard) return;

    if (!pt) {
      this.els.acupointDetailCard.style.display = 'none';
      return;
    }

    this.els.acupointDetailCard.style.display = 'block';
    if (this.els.acupointDetailTitle) {
      this.els.acupointDetailTitle.textContent = `🔴 Huyệt ${pt.name_vi} (${pt.code} — ${pt.name_han || ''})`;
    }
    if (this.els.acupointDetailLoc) this.els.acupointDetailLoc.textContent = pt.location_vi || '';
    if (this.els.acupointDetailDepth) this.els.acupointDetailDepth.textContent = `${pt.depth_mm} • ${pt.direction_vi || ''}`;
    if (this.els.acupointDetailDeqi) this.els.acupointDetailDeqi.textContent = pt.deqi_vi || '';
    if (this.els.acupointDetailSafety) {
      this.els.acupointDetailSafety.textContent = pt.safety_vi || 'Kỹ thuật châm đạt chuẩn an toàn y khoa.';
    }
  }

  // ============================================================
  // CHI TIẾT CƠ (BẢNG CLICK CƠ)
  // ============================================================
  _renderMuscleDetail(muscle) {
    if (!this.els.muscleDetailCard) return;

    if (!muscle) {
      this.els.muscleDetailCard.style.display = 'none';
      return;
    }

    this.els.muscleDetailCard.style.display = 'block';
    if (this.els.detailMuscleName) this.els.detailMuscleName.textContent = muscle.name_vi || muscle.id;
    if (this.els.detailMuscleLatin) this.els.detailMuscleLatin.textContent = muscle.name_latin || '';
    if (this.els.detailOrigin) this.els.detailOrigin.textContent = muscle.origin_vi || 'Chưa cập nhật';
    if (this.els.detailInsertion) this.els.detailInsertion.textContent = muscle.insertion_vi || 'Chưa cập nhật';
    if (this.els.detailAction) this.els.detailAction.textContent = muscle.action_vi || 'Chưa cập nhật';
    if (this.els.detailInnervation) this.els.detailInnervation.textContent = muscle.innervation_vi || 'Chưa cập nhật';
    if (this.els.detailBlood) this.els.detailBlood.textContent = muscle.blood_supply_vi || 'Chưa cập nhật';

    if (this.els.detailAcupoints) {
      this.els.detailAcupoints.innerHTML = '';
      if (muscle.acupoints && muscle.acupoints.length > 0) {
        muscle.acupoints.forEach(code => {
          const pt = this.appVM.getAcupoint(code);
          const li = document.createElement('li');
          li.className = 'acupoint-item';
          li.innerHTML = `
            <span class="acupoint-code">${code}</span>
            <div>
              <span class="acupoint-name">${pt ? pt.name_vi : ''}</span>
              <p class="acupoint-location">${pt ? pt.location_vi : ''}</p>
            </div>
          `;
          this.els.detailAcupoints.appendChild(li);
        });
      } else {
        this.els.detailAcupoints.innerHTML = '<li class="acupoint-item">Không có huyệt vị trực tiếp trên thân cơ</li>';
      }
    }
  }

  _toggleLoading(loading) {
    if (this.els.loadingOverlay) {
      this.els.loadingOverlay.style.display = loading ? 'flex' : 'none';
    }
  }

  _showError(err) {
    if (!err) return;
    alert(err);
  }

  // ============================================================
  // MỤC 1 & MỤC 2: ĐIỀU HƯỚNG CẤP CAO & QUẢN LÝ VIDEO BÀI GIẢNG
  // ============================================================

  /**
   * Chuyển đổi giữa Mục 1 (Mô hình 3D Hệ Đạo Dẫn) và Mục 2 (Video Thuyết Minh Bài Giảng)
   */
  switchTopSection(targetSectionId) {
    if (targetSectionId === 'section-3d-model') {
      if (this.els.navBtn3D) this.els.navBtn3D.classList.add('active');
      if (this.els.navBtnVideo) this.els.navBtnVideo.classList.remove('active');
      if (this.els.section3DModel) this.els.section3DModel.style.display = 'grid';
      if (this.els.sectionVideoLectures) this.els.sectionVideoLectures.style.display = 'none';

      // Kích hoạt tính toán lại viewport Three.js sau khi hiện lại canvas
      if (window.dispatchEvent) {
        window.dispatchEvent(new Event('resize'));
      }
    } else if (targetSectionId === 'section-video-lectures') {
      if (this.els.navBtn3D) this.els.navBtn3D.classList.remove('active');
      if (this.els.navBtnVideo) this.els.navBtnVideo.classList.add('active');
      if (this.els.section3DModel) this.els.section3DModel.style.display = 'none';
      if (this.els.sectionVideoLectures) this.els.sectionVideoLectures.style.display = 'grid';
    }
  }

  /**
   * Khởi tạo và nạp dữ liệu danh sách bài giảng từ lectures.json
   */
  async _initLectures() {
    try {
      const res = await fetch('./data/lectures.json?v=7.2');
      this.lectures = await res.json();
      this.selectedLectureId = this.lectures.length > 0 ? this.lectures[0].id : null;
      this._renderPlaylist(this.lectures);
      if (this.selectedLectureId) {
        this.selectLecture(this.selectedLectureId);
      }
    } catch (e) {
      console.warn('Chưa nạp được danh mục bài giảng:', e);
    }
  }

  /**
   * Hiển thị danh sách các chương bài giảng lên playlist sidebar
   */
  _renderPlaylist(list) {
    if (!this.els.playlistItemsList) return;
    this.els.playlistItemsList.innerHTML = '';

    if (!list || list.length === 0) {
      this.els.playlistItemsList.innerHTML = '<div style="padding: 12px; color: var(--muted); font-size: 0.8rem; text-align: center;">Không tìm thấy bài giảng phù hợp</div>';
      return;
    }

    list.forEach(lecture => {
      const card = document.createElement('div');
      card.className = `playlist-item-card ${lecture.id === this.selectedLectureId ? 'active' : ''}`;
      card.setAttribute('data-lecture-id', lecture.id);
      card.innerHTML = `
        <div class="playlist-item-top">
          <span class="playlist-item-chapter">${lecture.chapter}</span>
          <span class="playlist-item-duration">⏱️ ${lecture.duration}</span>
        </div>
        <h4 class="playlist-item-title">${lecture.title}</h4>
        <span class="playlist-item-badge">🏷️ ${lecture.badge}</span>
      `;
      card.addEventListener('click', () => {
        this.selectLecture(lecture.id);
      });
      this.els.playlistItemsList.appendChild(card);
    });
  }

  /**
   * Chọn và tải bài giảng lên khung phát video và các tab chi tiết
   */
  selectLecture(id) {
    if (!this.lectures) return;
    const lecture = this.lectures.find(l => l.id === id);
    if (!lecture) return;
    this.selectedLectureId = id;

    // Cập nhật trạng thái active trong danh sách playlist
    document.querySelectorAll('.playlist-item-card').forEach(card => {
      if (card.getAttribute('data-lecture-id') === id) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    });

    // Cập nhật Header khung Video
    if (this.els.videoActiveBadge) this.els.videoActiveBadge.textContent = `${lecture.chapter.toUpperCase()} • BÀI GIẢNG CƠ SINH HỌC & ĐẠO DẪN`;
    if (this.els.videoActiveTitle) this.els.videoActiveTitle.textContent = lecture.title;
    if (this.els.videoActiveDuration) this.els.videoActiveDuration.textContent = lecture.duration;
    if (this.els.videoActiveStatus) this.els.videoActiveStatus.textContent = lecture.badge;
    if (this.els.placeholderHeading) this.els.placeholderHeading.textContent = lecture.title;
    if (this.els.placeholderSub) this.els.placeholderSub.textContent = `Mô hình 3D Z-Anatomy & Google Flow • Thời lượng ${lecture.duration} • Thuyết minh 100% Tiếng Việt`;
    if (this.els.ctrlTimeDisplay) this.els.ctrlTimeDisplay.textContent = `00:00 / ${lecture.duration}`;

    // Cập nhật Tab 1: Tóm tắt bài giảng
    if (this.els.vtabSummaryText) this.els.vtabSummaryText.textContent = lecture.summary;

    // Cập nhật Tab 2: Phân đoạn Micro-Shots
    if (this.els.vtabShotsList) {
      this.els.vtabShotsList.innerHTML = '';
      if (lecture.micro_shots && lecture.micro_shots.length > 0) {
        lecture.micro_shots.forEach(s => {
          const item = document.createElement('div');
          item.className = 'vshot-item';
          item.innerHTML = `
            <span class="vshot-time-badge">${s.time}</span>
            <div class="vshot-details">
              <span class="vshot-name">${s.shot}</span>
              <p class="vshot-desc">${s.desc}</p>
            </div>
          `;
          this.els.vtabShotsList.appendChild(item);
        });
      }
    }

    // Cập nhật Tab 3: Transcript thuyết minh
    if (this.els.vtabTranscriptText) {
      this.els.vtabTranscriptText.textContent = `"${lecture.transcript}"`;
    }
  }

  /**
   * Lọc danh sách bài giảng theo từ khóa tìm kiếm
   */
  filterPlaylist(query) {
    if (!this.lectures) return;
    const q = (query || '').toLowerCase().trim();
    if (!q) {
      this._renderPlaylist(this.lectures);
      return;
    }
    const filtered = this.lectures.filter(l => 
      l.title.toLowerCase().includes(q) || 
      l.chapter.toLowerCase().includes(q) || 
      l.summary.toLowerCase().includes(q)
    );
    this._renderPlaylist(filtered);
  }
}


