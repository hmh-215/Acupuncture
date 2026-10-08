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

    this.currentShotIndex = 0;
    this.currentLecture = null;
    this.autoNextShot = true;

    this._cacheElements();
    this._bindToViewModels();
    this._setupEventListeners();
    this._initLectures();
    this._switchMode('kinematics');
  }

  _cacheElements() {
    this.els = {
      // Menu Điều Hướng Cấp Cao (Mục 1: 3D & Mục 2: Video)
      navBtn3D: document.getElementById('nav-btn-3d'),
      navBtnVideo: document.getElementById('nav-btn-video'),
      section3DModel: document.getElementById('section-3d-model'),
      sectionVideoLectures: document.getElementById('section-video-lectures'),

      // Chuyển Tab 3 Chế độ (trong Mục 1: Mô hình 3D)
      tabModeKinematics: document.getElementById('tab-mode-kinematics'),
      tabModeAcupoints: document.getElementById('tab-mode-acupoints'),
      tabModeTherapy: document.getElementById('tab-mode-therapy'),
      tabModeMovement: document.getElementById('tab-mode-kinematics'), // fallback
      tabModeAcupuncture: document.getElementById('tab-mode-therapy'), // fallback
      mode1Container: document.getElementById('mode-1-container'),
      mode2Container: document.getElementById('mode-2-container'),
      mode3Container: document.getElementById('mode-3-container'),

      // Floating Viewport Legend Card (Chế độ 1)
      viewportLegendCard: document.getElementById('viewport-legend-card'),
      viewportLegendItems: document.querySelectorAll('.viewport-legend-item'),

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

      // Chế độ 2: Bản đồ 80 Huyệt Đạo Toàn Thân
      searchAcupointInput: document.getElementById('search-acupoint-input'),
      regionPills: document.querySelectorAll('.region-pill'),
      lblActiveAcupointCount: document.getElementById('lbl-active-acupoint-count'),
      acupointMapList: document.getElementById('acupoint-map-list'),
      mapAcupointDetailCard: document.getElementById('map-acupoint-detail-card'),
      mapDetailCode: document.getElementById('map-detail-code'),
      mapDetailName: document.getElementById('map-detail-name'),
      mapDetailHan: document.getElementById('map-detail-han'),
      mapDetailMeridian: document.getElementById('map-detail-meridian'),
      mapDetailLocation: document.getElementById('map-detail-location'),
      mapDetailDepth: document.getElementById('map-detail-depth'),
      mapDetailDeqi: document.getElementById('map-detail-deqi'),
      mapDetailIndications: document.getElementById('map-detail-indications'),
      mapDetailSafety: document.getElementById('map-detail-safety'),
      btnCloseMapDetail: document.getElementById('btn-close-map-detail'),

      // Chế độ 3: Bệnh lý cơ đau & Chuỗi kinh cân trị liệu
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
      cardControlMuscle: document.getElementById('card-control-muscle'),
      toggleMuscles: document.getElementById('toggle-muscles'),
      sliderMuscleOpacity: document.getElementById('slider-muscle-opacity'),
      valMuscleOpacity: document.getElementById('val-muscle-opacity'),

      cardControlNervous: document.getElementById('card-control-nervous'),
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
      playlistSearchInput: document.getElementById('playlist-search-input'),

      // HTML5 Video Player & Shots Bar
      html5VideoPlayer: document.getElementById('html5-video-player'),
      videoShotsBar: document.getElementById('video-shots-bar'),
      videoShotActiveLabel: document.getElementById('video-shot-active-label'),
      videoShotsButtonsRow: document.getElementById('video-shots-buttons-row'),
      videoPlayerToolbar: document.getElementById('video-player-toolbar'),
      btnPrevShot: document.getElementById('btn-prev-shot'),
      btnNextShot: document.getElementById('btn-next-shot'),
      chkAutoNext: document.getElementById('chk-auto-next'),
      vtoolbarShotInfo: document.getElementById('vtoolbar-shot-info'),
      btnQuickInfographic: document.getElementById('btn-quick-infographic')
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

    // Chế độ 2: Bản đồ 80 Huyệt Đạo Toàn Thân
    if (this.appVM && this.appVM.acupointMapVM) {
      this.appVM.acupointMapVM.on('activeAcupoints', points => this._renderAcupointMapList(points));
      this.appVM.acupointMapVM.on('selectedAcupoint', pt => this._renderMapAcupointDetail(pt));
      this.appVM.acupointMapVM.on('selectedRegion', region => this._updateRegionPills(region));
    }

    // Chế độ 3: Châm cứu & Chuỗi cơ cân trị liệu
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
        if (this.appVM.acupointMapVM) {
          this._renderAcupointMapList(this.appVM.acupointMapVM.state.activeAcupoints);
        }
      });

      if (this.appVM.state.dataLoaded) {
        this._populateMovementDropdown();
        this._populateChainDropdown();
        if (this.appVM.acupointMapVM) {
          this._renderAcupointMapList(this.appVM.acupointMapVM.state.activeAcupoints);
        }
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

    // Chuyển Tab 3 Chế độ (trong Mục 1: Mô hình 3D)
    if (this.els.tabModeKinematics) {
      this.els.tabModeKinematics.addEventListener('click', () => this._switchMode('kinematics'));
    }
    if (this.els.tabModeAcupoints) {
      this.els.tabModeAcupoints.addEventListener('click', () => this._switchMode('acupoints'));
    }
    if (this.els.tabModeTherapy) {
      this.els.tabModeTherapy.addEventListener('click', () => this._switchMode('therapy'));
    }
    if (this.els.tabModeMovement && this.els.tabModeMovement !== this.els.tabModeKinematics) {
      this.els.tabModeMovement.addEventListener('click', () => this._switchMode('kinematics'));
    }
    if (this.els.tabModeAcupuncture && this.els.tabModeAcupuncture !== this.els.tabModeTherapy) {
      this.els.tabModeAcupuncture.addEventListener('click', () => this._switchMode('therapy'));
    }

    // Floating Viewport Legend Card (Chế độ 1: Bấm để lọc vai trò, bấm lại để chọn tất cả)
    if (this.els.viewportLegendItems) {
      this.els.viewportLegendItems.forEach(item => {
        item.addEventListener('click', () => {
          const role = item.dataset.role;
          if (this.movementVM) this.movementVM.toggleFilterRole(role);
        });
      });
    }

    // Dropdown chọn cử động (Chế độ 1)
    if (this.els.movementSelect) {
      this.els.movementSelect.addEventListener('change', (e) => {
        if (this.movementVM) this.movementVM.selectMovement(e.target.value);
      });
    }

    // Ô tìm kiếm cơ hoặc cử động (Chế độ 1)
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

    // Lọc vai trò cơ (Chế độ 1 - Thanh nút lọc ngang)
    if (this.els.filterButtons) {
      this.els.filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          const role = btn.dataset.role;
          if (this.movementVM) this.movementVM.filterByRole(role);
        });
      });
    }

    // Chế độ 2: Tìm kiếm huyệt vị
    if (this.els.searchAcupointInput) {
      this.els.searchAcupointInput.addEventListener('input', (e) => {
        if (this.appVM?.acupointMapVM) {
          this.appVM.acupointMapVM.search(e.target.value);
        }
      });
    }

    // Chế độ 2: Lọc phân vùng huyệt vị (Region Pills)
    if (this.els.regionPills) {
      this.els.regionPills.forEach(pill => {
        pill.addEventListener('click', () => {
          const region = pill.dataset.region;
          if (this.appVM?.acupointMapVM) {
            this.appVM.acupointMapVM.filterByRegion(region);
          }
        });
      });
    }

    // Chế độ 2: Đóng bảng chi tiết huyệt
    if (this.els.btnCloseMapDetail) {
      this.els.btnCloseMapDetail.addEventListener('click', () => {
        if (this.els.mapAcupointDetailCard) this.els.mapAcupointDetailCard.style.display = 'none';
        if (this.sceneVM) this.sceneVM.focusAcupoint(null);
      });
    }

    // Dropdown chọn Hội chứng đau cơ (Chế độ 3)
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
        if (this.appVM.acupointMapVM) this.appVM.acupointMapVM.reset();
        if (this.appVM.acupunctureVM) this.appVM.acupunctureVM.reset();
        if (this.els.searchInput) this.els.searchInput.value = '';
        if (this.els.searchAcupointInput) this.els.searchAcupointInput.value = '';

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
        
        const activeMode = this.appVM?.state.activeMode || 'kinematics';
        if (activeMode === 'acupoints') {
          if (this.els.toggleNervous) this.els.toggleNervous.checked = true;
          if (this.sceneVM) this.sceneVM.setShowNervousLayer(true);
        } else {
          if (this.els.toggleNervous) this.els.toggleNervous.checked = false;
          if (this.sceneVM) this.sceneVM.setShowNervousLayer(false);
        }

        this._populateMovementDropdown();
        if (this.els.chainSelect) this.els.chainSelect.value = '';
        if (this.els.chainInfo) this.els.chainInfo.style.display = 'none';
        if (this.els.chainAcupointSection) this.els.chainAcupointSection.style.display = 'none';
        if (this.els.acupointDetailCard) this.els.acupointDetailCard.style.display = 'none';
        if (this.els.mapAcupointDetailCard) this.els.mapAcupointDetailCard.style.display = 'none';
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

    // Nút mở nhanh Video Infographic từ Mục 1 (3D Model)
    if (this.els.btnQuickInfographic) {
      this.els.btnQuickInfographic.addEventListener('click', () => {
        this.switchTopSection('section-video-lectures');
        this.selectLecture('chuong-01');
        if (this.els.html5VideoPlayer) {
          this.els.html5VideoPlayer.play().catch(() => {});
        }
      });
    }

    // Điều hướng Shot trước / Shot sau & Tự động chuyển shot kế tiếp
    if (this.els.btnPrevShot) {
      this.els.btnPrevShot.addEventListener('click', () => {
        this.switchShot(this.currentShotIndex - 1, true);
      });
    }
    if (this.els.btnNextShot) {
      this.els.btnNextShot.addEventListener('click', () => {
        this.switchShot(this.currentShotIndex + 1, true);
      });
    }
    if (this.els.chkAutoNext) {
      this.els.chkAutoNext.addEventListener('change', (e) => {
        this.autoNextShot = e.target.checked;
      });
    }
    if (this.els.html5VideoPlayer) {
      this.els.html5VideoPlayer.addEventListener('ended', () => {
        if (this.autoNextShot && this.currentLecture && this.currentLecture.shots) {
          if (this.currentShotIndex < this.currentLecture.shots.length - 1) {
            this.switchShot(this.currentShotIndex + 1, true);
          }
        }
      });
    }

    // Nút Play / Pause mô phỏng khung video (khi xem bài giảng chưa có video thật)
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

  _switchMode(rawMode) {
    if (!this.appVM) return;
    let mode = rawMode;
    if (mode === 'movement') mode = 'kinematics';
    if (mode === 'acupuncture') mode = 'therapy';

    this.appVM.setMode(mode);

    // Bỏ active tất cả các tab
    if (this.els.tabModeKinematics) this.els.tabModeKinematics.classList.remove('active');
    if (this.els.tabModeAcupoints) this.els.tabModeAcupoints.classList.remove('active');
    if (this.els.tabModeTherapy) this.els.tabModeTherapy.classList.remove('active');

    // Ẩn tất cả các container
    if (this.els.mode1Container) this.els.mode1Container.style.display = 'none';
    if (this.els.mode2Container) this.els.mode2Container.style.display = 'none';
    if (this.els.mode3Container) this.els.mode3Container.style.display = 'none';

    // Ẩn các bảng chi tiết
    if (this.els.muscleDetailCard) this.els.muscleDetailCard.style.display = 'none';
    if (this.els.acupointDetailCard) this.els.acupointDetailCard.style.display = 'none';
    if (this.els.mapAcupointDetailCard) this.els.mapAcupointDetailCard.style.display = 'none';

    if (mode === 'kinematics') {
      if (this.els.tabModeKinematics) this.els.tabModeKinematics.classList.add('active');
      if (this.els.mode1Container) this.els.mode1Container.style.display = 'block';

      // Hiện floating legend card trên 3D canvas
      if (this.els.viewportLegendCard) this.els.viewportLegendCard.style.display = 'block';

      // Ẩn điều khiển Hệ Thần Kinh ở Chế độ 1 theo yêu cầu người dùng
      if (this.els.cardControlNervous) this.els.cardControlNervous.style.display = 'none';
      if (this.els.toggleNervous) this.els.toggleNervous.checked = false;
      if (this.sceneVM) this.sceneVM.setShowNervousLayer(false);

    } else if (mode === 'acupoints') {
      if (this.els.tabModeAcupoints) this.els.tabModeAcupoints.classList.add('active');
      if (this.els.mode2Container) this.els.mode2Container.style.display = 'block';

      // Ẩn floating legend card
      if (this.els.viewportLegendCard) this.els.viewportLegendCard.style.display = 'none';

      // Hiện điều khiển Hệ Thần Kinh và kích hoạt hiển thị Hệ Thần Kinh + Hệ Cơ
      if (this.els.cardControlNervous) this.els.cardControlNervous.style.display = 'flex';
      if (this.els.toggleNervous) this.els.toggleNervous.checked = true;
      if (this.sceneVM) {
        this.sceneVM.setShowNervousLayer(true);
        this.sceneVM.setShowMuscleLayer(true);
      }

      // Render danh sách 80 huyệt
      if (this.appVM.acupointMapVM) {
        this._renderAcupointMapList(this.appVM.acupointMapVM.state.activeAcupoints);
      }

    } else if (mode === 'therapy') {
      if (this.els.tabModeTherapy) this.els.tabModeTherapy.classList.add('active');
      if (this.els.mode3Container) this.els.mode3Container.style.display = 'block';

      // Ẩn floating legend card
      if (this.els.viewportLegendCard) this.els.viewportLegendCard.style.display = 'none';

      // Hiện điều khiển Hệ Thần Kinh nhưng mặc định tắt
      if (this.els.cardControlNervous) this.els.cardControlNervous.style.display = 'flex';
      if (this.els.toggleNervous) this.els.toggleNervous.checked = false;
      if (this.sceneVM) this.sceneVM.setShowNervousLayer(false);

      // Tự động chọn chuỗi đầu tiên nếu chưa chọn
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

    const roleMeta = {
      agonist: {
        title: '🔴 Cơ chủ vận (Agonist)',
        color: '#ef4444',
        label: 'Chủ vận',
        badgeClass: 'role-agonist'
      },
      antagonist: {
        title: '🔵 Cơ đối vận (Antagonist)',
        color: '#0ea5e9',
        label: 'Đối vận',
        badgeClass: 'role-antagonist'
      },
      synergist: {
        title: '🟠 Cơ hiệp đồng / Liên đới (Synergist)',
        color: '#f59e0b',
        label: 'Hiệp đồng',
        badgeClass: 'role-synergist'
      },
      stabilizer: {
        title: '🟢 Cơ ổn định (Stabilizer)',
        color: '#10b981',
        label: 'Ổn định',
        badgeClass: 'role-stabilizer'
      }
    };

    const currentFilter = this.movementVM ? this.movementVM.state.filterRole : 'all';

    const createMuscleItem = (muscle) => {
      const li = document.createElement('li');
      li.className = `muscle-item role-${muscle.role}`;
      const meta = roleMeta[muscle.role] || { label: muscle.role, badgeClass: '' };

      li.innerHTML = `
        <div class="muscle-item-row-top">
          <span class="muscle-item-name">${muscle.name_vi || muscle.id}</span>
          <span class="role-badge ${meta.badgeClass}">${meta.label}</span>
        </div>
        <div class="muscle-item-row-bottom">
          <span class="muscle-item-latin">${muscle.name_latin || ''}</span>
        </div>
      `;

      li.addEventListener('click', () => {
        if (this.movementVM) this.movementVM.selectMuscleForDetail(muscle.id);
        if (this.sceneVM) this.sceneVM.isolateMuscle(muscle.id);
      });

      return li;
    };

    if (!currentFilter || currentFilter === 'all') {
      // Khi chọn "Tất cả": sắp xếp theo category headers (Chủ vận -> Đối vận -> Hiệp đồng -> Ổn định)
      const roles = ['agonist', 'antagonist', 'synergist', 'stabilizer'];
      roles.forEach(roleKey => {
        const groupMuscles = muscles.filter(m => m.role === roleKey);
        if (groupMuscles.length === 0) return;

        const catBlock = document.createElement('div');
        catBlock.className = 'muscle-category-block';

        const catHeader = document.createElement('div');
        catHeader.className = 'muscle-category-header';
        catHeader.style.setProperty('--category-color', roleMeta[roleKey].color);
        catHeader.innerHTML = `
          <span class="muscle-category-title">${roleMeta[roleKey].title}</span>
          <span class="muscle-category-count">${groupMuscles.length}</span>
        `;
        catBlock.appendChild(catHeader);

        const groupList = document.createElement('ul');
        groupList.className = 'muscle-group-sublist';
        groupMuscles.forEach(muscle => {
          groupList.appendChild(createMuscleItem(muscle));
        });
        catBlock.appendChild(groupList);

        this.els.muscleList.appendChild(catBlock);
      });
    } else {
      // Khi áp dụng filter: chỉ hiển thị các nhóm cơ có liên quan đến filter được chọn
      const filteredGroup = muscles.filter(m => m.role === currentFilter);
      if (filteredGroup.length === 0) {
        this.els.muscleList.innerHTML = `<li class="muscle-placeholder">Không có nhóm cơ nào thuộc vai trò này trong cử động hiện tại</li>`;
        return;
      }

      const catBlock = document.createElement('div');
      catBlock.className = 'muscle-category-block';

      const catHeader = document.createElement('div');
      catHeader.className = 'muscle-category-header';
      catHeader.style.setProperty('--category-color', roleMeta[currentFilter]?.color || 'var(--cyan)');
      catHeader.innerHTML = `
        <span class="muscle-category-title">${roleMeta[currentFilter]?.title || currentFilter}</span>
        <span class="muscle-category-count">${filteredGroup.length}</span>
      `;
      catBlock.appendChild(catHeader);

      const groupList = document.createElement('ul');
      groupList.className = 'muscle-group-sublist';
      filteredGroup.forEach(muscle => {
        groupList.appendChild(createMuscleItem(muscle));
      });
      catBlock.appendChild(groupList);

      this.els.muscleList.appendChild(catBlock);
    }
  }

  _updateFilterButtons(currentRole) {
    const role = currentRole || 'all';

    // Cập nhật các nút filter thanh ngang trong info panel
    if (this.els.filterButtons) {
      this.els.filterButtons.forEach(btn => {
        if (btn.dataset.role === role) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    }

    // Cập nhật các mục trong Floating Legend Card góc trên-phải 3D Viewport
    if (this.els.viewportLegendItems) {
      this.els.viewportLegendItems.forEach(item => {
        if (role !== 'all' && item.dataset.role === role) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      });
    }

    // Re-render muscle list với active filter
    if (this.movementVM) {
      this._renderMuscleList(this.movementVM.state.activeMuscles);
    }
  }

  // ============================================================
  // RENDER THÔNG TIN CHẾ ĐỘ 2: BẢN ĐỒ 80 HUYỆT ĐẠO TOÀN THÂN
  // ============================================================
  _renderAcupointMapList(points) {
    if (!this.els.acupointMapList) return;

    const count = points ? points.length : 0;
    if (this.els.lblActiveAcupointCount) {
      this.els.lblActiveAcupointCount.textContent = count;
    }

    if (!points || points.length === 0) {
      this.els.acupointMapList.innerHTML = '<div class="acupoint-placeholder" style="padding: 16px; text-align: center; color: var(--muted); font-size: 0.8rem;">Không tìm thấy huyệt vị phù hợp với từ khóa hoặc phân vùng</div>';
      return;
    }

    this.els.acupointMapList.innerHTML = '';
    const selectedCode = this.appVM?.acupointMapVM?.state.selectedAcupoint?.code;

    points.forEach(pt => {
      const item = document.createElement('div');
      item.className = 'map-acupoint-item' + (pt.code === selectedCode ? ' active' : '');
      item.dataset.code = pt.code;
      item.innerHTML = `
        <div class="map-acupoint-left">
          <span class="map-acupoint-code">${pt.code}</span>
          <div>
            <div class="map-acupoint-name">${pt.name_vi} <span class="map-acupoint-han">(${pt.name_han_viet || ''})</span></div>
            <div class="map-acupoint-meridian">${pt.meridian_vi || ''}</div>
          </div>
        </div>
        <div class="map-acupoint-right">
          <span class="map-acupoint-region-tag">${pt.region_vi || pt.region || ''}</span>
        </div>
      `;

      item.addEventListener('click', () => {
        if (this.appVM?.acupointMapVM) {
          this.appVM.acupointMapVM.selectAcupoint(pt.code);
        }
      });

      this.els.acupointMapList.appendChild(item);
    });
  }

  _renderMapAcupointDetail(pt) {
    if (!this.els.mapAcupointDetailCard) return;

    if (!pt) {
      this.els.mapAcupointDetailCard.style.display = 'none';
      return;
    }

    this.els.mapAcupointDetailCard.style.display = 'block';

    if (this.els.mapDetailCode) this.els.mapDetailCode.textContent = pt.code;
    if (this.els.mapDetailName) this.els.mapDetailName.textContent = pt.name_vi;
    if (this.els.mapDetailHan) this.els.mapDetailHan.textContent = pt.name_han_viet || '';
    if (this.els.mapDetailMeridian) this.els.mapDetailMeridian.textContent = `⚡ ${pt.meridian_vi || ''}`;
    if (this.els.mapDetailLocation) this.els.mapDetailLocation.textContent = pt.location_vi || '';
    if (this.els.mapDetailDepth) {
      this.els.mapDetailDepth.textContent = `${pt.depth_mm || ''} • Hướng kim: ${pt.direction_vi || 'Thẳng'}`;
    }
    if (this.els.mapDetailDeqi) {
      this.els.mapDetailDeqi.textContent = pt.deqi_vi || 'Tê, tức, nặng, căng lan theo kinh lạc (Đắc khí).';
    }
    if (this.els.mapDetailIndications) {
      this.els.mapDetailIndications.textContent = pt.indications_vi || '';
    }
    if (this.els.mapDetailSafety) {
      this.els.mapDetailSafety.textContent = `⚠️ An toàn: ${pt.safety_vi || 'Tuân thủ đúng góc châm và độ sâu an toàn giải phẫu.'}`;
    }

    // Cập nhật trạng thái active trong danh sách huyệt
    if (this.els.acupointMapList) {
      this.els.acupointMapList.querySelectorAll('.map-acupoint-item').forEach(el => {
        if (el.dataset.code === pt.code) {
          el.classList.add('active');
          el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        } else {
          el.classList.remove('active');
        }
      });
    }
  }

  _updateRegionPills(currentRegion) {
    const region = currentRegion || 'all';
    if (this.els.regionPills) {
      this.els.regionPills.forEach(pill => {
        if (pill.dataset.region === region) {
          pill.classList.add('active');
        } else {
          pill.classList.remove('active');
        }
      });
    }
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
      const res = await fetch('./data/lectures.json?v=7.4');
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
      
      const hasShots = lecture.shots && lecture.shots.length > 0;
      const badgeStyle = hasShots ? 'color: var(--cyan); font-weight: 700;' : '';

      card.innerHTML = `
        <div class="playlist-item-top">
          <span class="playlist-item-chapter">${lecture.chapter}</span>
          <span class="playlist-item-duration">⏱️ ${lecture.duration}</span>
        </div>
        <h4 class="playlist-item-title">${lecture.title}</h4>
        <span class="playlist-item-badge" style="${badgeStyle}">🏷️ ${lecture.badge}</span>
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
    this.currentLecture = lecture;
    this.currentShotIndex = 0;

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

    // Kiểm tra cấu hình video / shots của bài giảng
    if (lecture.shots && lecture.shots.length > 0) {
      // Có danh sách shots thực tế (như Chương 1 có 3 shots)
      if (this.els.html5VideoPlayer) {
        this.els.html5VideoPlayer.style.display = 'block';
      }
      if (this.els.videoPlaceholderScreen) {
        this.els.videoPlaceholderScreen.style.display = 'none';
      }
      if (this.els.videoShotsBar) {
        this.els.videoShotsBar.style.display = 'flex';
      }
      if (this.els.videoPlayerToolbar) {
        this.els.videoPlayerToolbar.style.display = 'flex';
      }

      this._renderShotButtons(lecture.shots);
      this.switchShot(0, false);
    } else if (lecture.video_src) {
      // Có file video đơn lẻ
      if (this.els.html5VideoPlayer) {
        this.els.html5VideoPlayer.style.display = 'block';
        this.els.html5VideoPlayer.src = lecture.video_src;
        this.els.html5VideoPlayer.load();
      }
      if (this.els.videoPlaceholderScreen) {
        this.els.videoPlaceholderScreen.style.display = 'none';
      }
      if (this.els.videoShotsBar) {
        this.els.videoShotsBar.style.display = 'none';
      }
      if (this.els.videoPlayerToolbar) {
        this.els.videoPlayerToolbar.style.display = 'none';
      }
    } else {
      // Chưa có video -> Hiển thị Placeholder Graphic
      if (this.els.html5VideoPlayer) {
        this.els.html5VideoPlayer.pause();
        this.els.html5VideoPlayer.removeAttribute('src');
        this.els.html5VideoPlayer.load();
        this.els.html5VideoPlayer.style.display = 'none';
      }
      if (this.els.videoPlaceholderScreen) {
        this.els.videoPlaceholderScreen.style.display = 'flex';
      }
      if (this.els.videoShotsBar) {
        this.els.videoShotsBar.style.display = 'none';
      }
      if (this.els.videoPlayerToolbar) {
        this.els.videoPlayerToolbar.style.display = 'none';
      }
    }

    // Cập nhật Tab 1: Tóm tắt bài giảng
    if (this.els.vtabSummaryText) this.els.vtabSummaryText.textContent = lecture.summary;

    // Cập nhật Tab 2: Phân đoạn Micro-Shots
    this._renderMicroShots(lecture);

    // Cập nhật Tab 3: Transcript thuyết minh
    if (this.els.vtabTranscriptText) {
      this.els.vtabTranscriptText.textContent = `"${lecture.transcript}"`;
    }
  }

  /**
   * Tạo các nút chọn Shot trên thanh điều khiển
   */
  _renderShotButtons(shots) {
    if (!this.els.videoShotsButtonsRow) return;
    this.els.videoShotsButtonsRow.innerHTML = '';

    shots.forEach((shot, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `video-shot-btn ${idx === this.currentShotIndex ? 'active' : ''}`;
      btn.setAttribute('data-shot-index', idx);
      btn.innerHTML = `
        <span>▶ ${shot.shot_num || `Shot ${idx + 1}`}</span>
        <span class="vshot-btn-time">${shot.duration || ''}</span>
      `;
      btn.addEventListener('click', () => {
        this.switchShot(idx, true);
      });
      this.els.videoShotsButtonsRow.appendChild(btn);
    });
  }

  /**
   * Chuyển đổi và phát một Shot video cụ thể
   */
  switchShot(index, autoPlay = false) {
    if (!this.currentLecture || !this.currentLecture.shots) return;
    if (index < 0 || index >= this.currentLecture.shots.length) return;

    this.currentShotIndex = index;
    const shot = this.currentLecture.shots[index];

    // Cập nhật video player
    if (this.els.html5VideoPlayer && shot.video_src) {
      const currentSrc = this.els.html5VideoPlayer.getAttribute('src');
      if (currentSrc !== shot.video_src) {
        this.els.html5VideoPlayer.src = shot.video_src;
        this.els.html5VideoPlayer.load();
      }
      if (autoPlay) {
        this.els.html5VideoPlayer.play().catch(e => console.log('Autoplay deferred:', e));
      }
    }

    // Cập nhật trạng thái active của Shot buttons
    if (this.els.videoShotsButtonsRow) {
      this.els.videoShotsButtonsRow.querySelectorAll('.video-shot-btn').forEach((btn, idx) => {
        if (idx === index) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    }

    // Cập nhật nhãn shot đang phát
    if (this.els.videoShotActiveLabel) {
      this.els.videoShotActiveLabel.textContent = `Đang phát: ${shot.title} (${shot.duration})`;
    }

    // Cập nhật toolbar
    if (this.els.vtoolbarShotInfo) {
      this.els.vtoolbarShotInfo.textContent = `Shot ${index + 1} / ${this.currentLecture.shots.length}`;
    }
    if (this.els.btnPrevShot) {
      this.els.btnPrevShot.disabled = (index <= 0);
    }
    if (this.els.btnNextShot) {
      this.els.btnNextShot.disabled = (index >= this.currentLecture.shots.length - 1);
    }

    // Cập nhật Transcript Tab với lời bình của Shot hiện tại
    if (this.els.vtabTranscriptText && shot.transcript) {
      this.els.vtabTranscriptText.textContent = `"${shot.transcript}"`;
    }

    // Highlight micro-shot tương ứng trong Tab 2
    if (this.els.vtabShotsList) {
      this.els.vtabShotsList.querySelectorAll('.vshot-item').forEach((item, idx) => {
        if (idx === index) {
          item.classList.add('active-playing-shot');
        } else {
          item.classList.remove('active-playing-shot');
        }
      });
    }
  }

  /**
   * Hiển thị danh sách Micro-Shots kèm nút tương tác xem trực tiếp
   */
  _renderMicroShots(lecture) {
    if (!this.els.vtabShotsList) return;
    this.els.vtabShotsList.innerHTML = '';
    if (!lecture.micro_shots || lecture.micro_shots.length === 0) return;

    lecture.micro_shots.forEach((s, idx) => {
      const item = document.createElement('div');
      item.className = `vshot-item ${idx === this.currentShotIndex && lecture.shots ? 'active-playing-shot' : ''}`;
      
      const hasActionBtn = lecture.shots && lecture.shots[idx];
      const actionHtml = hasActionBtn
        ? `<div class="vshot-action">
             <button type="button" class="vshot-play-btn" data-shot-idx="${idx}">
               ▶ Xem video phân đoạn này (${lecture.shots[idx].duration})
             </button>
           </div>`
        : '';

      item.innerHTML = `
        <span class="vshot-time-badge">${s.time}</span>
        <div class="vshot-details">
          <span class="vshot-name">${s.shot}</span>
          <p class="vshot-desc">${s.desc}</p>
          ${actionHtml}
        </div>
      `;

      if (hasActionBtn) {
        const playBtn = item.querySelector('.vshot-play-btn');
        if (playBtn) {
          playBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.switchShot(idx, true);
            if (this.els.videoScreenContainer) {
              this.els.videoScreenContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
          });
        }
      }

      this.els.vtabShotsList.appendChild(item);
    });
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


