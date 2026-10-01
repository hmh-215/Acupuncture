import { Observable } from './Observable.js?v=6.0';

/**
 * MovementViewModel
 * Manages movement selection, active muscles, and filtering in the UI.
 */
export class MovementViewModel extends Observable {
  /**
   * @param {import('./AppViewModel.js').AppViewModel} appVM 
   */
  constructor(appVM) {
    super({
      selectedMovementId: null,
      selectedMovement: null,      // Full movement object
      activeMuscles: [],           // Enriched muscle list with details
      filterRole: 'all',           // 'all' | 'agonist' | 'antagonist' | 'synergist' | 'stabilizer'
      searchQuery: '',
      selectedMuscleDetail: null   // Full muscle detail for info panel
    });
    this.appVM = appVM;
  }
  
  /**
   * Handles selection of a specific movement.
   * Enriches muscle data and updates scene highlighting.
   * @param {string|null} movementId 
   */
  selectMovement(movementId) {
    const { movementData, muscleData } = this.appVM;
    if (!movementData || !muscleData) return;

    if (!movementId) {
      this.batch(() => {
        this.state.selectedMovementId = null;
        this.state.selectedMovement = null;
        this.state.activeMuscles = [];
        this.state.filterRole = 'all';
      });
      this.appVM.sceneVM.highlightMusclesForMovement([]);
      return;
    }

    // 1. Find movement in movementData (supports Object or Array)
    const movement = Array.isArray(movementData)
      ? movementData.find(m => m.id === movementId)
      : movementData[movementId];
    if (!movement) return;

    // 2. Enrich each muscle entry with full data from muscleData
    const activeMuscles = (movement.muscles || []).map(mRole => {
      const id = mRole.muscleId || mRole.id;
      const muscleDetail = Array.isArray(muscleData)
        ? (muscleData.find(m => m.id === id) || {})
        : (muscleData[id] || {});
      return {
        id,
        role: mRole.role,
        ...muscleDetail
      };
    });

    // 3. Update state.activeMuscles
    this.batch(() => {
      this.state.selectedMovementId = movementId;
      this.state.selectedMovement = movement;
      this.state.activeMuscles = activeMuscles;
      this.state.filterRole = 'all';
    });

    // 4. Tell sceneVM to highlight
    this.appVM.sceneVM.highlightMusclesForMovement(activeMuscles);
  }
  
  /**
   * Filters the currently active muscles based on their role in the movement.
   * @param {string} role 'all' | 'agonist' | 'antagonist' | 'synergist' | 'stabilizer'
   */
  filterByRole(role) {
    this.state.filterRole = role || 'all';
    const movement = this.state.selectedMovement;
    if (!movement) return;

    const allActive = (movement.muscles || []).map(mRole => {
      const id = mRole.muscleId || mRole.id;
      const muscleDetail = Array.isArray(this.appVM.muscleData)
        ? (this.appVM.muscleData.find(m => m.id === id) || {})
        : (this.appVM.muscleData?.[id] || {});
      return {
        id,
        role: mRole.role,
        ...muscleDetail
      };
    });
    
    const filteredMuscles = (!role || role === 'all')
      ? allActive 
      : allActive.filter(m => m.role === role);
      
    this.state.activeMuscles = filteredMuscles;
    this.appVM.sceneVM.highlightMusclesForMovement(filteredMuscles);
  }

  /**
   * Resets all filters.
   */
  resetFilters() {
    this.filterByRole('all');
  }
  
  /**
   * Loads full details including acupoints for a selected muscle.
   * @param {string|null} muscleId 
   */
  selectMuscleForDetail(muscleId) {
    if (!muscleId) {
      this.state.selectedMuscleDetail = null;
      return;
    }

    const { muscleData, acupointData } = this.appVM;
    const muscle = Array.isArray(muscleData)
      ? muscleData.find(m => m.id === muscleId)
      : muscleData?.[muscleId];
    
    if (muscle) {
      // Find all acupoints whose related_muscles array contains this muscleId
      const acupoints = [];
      if (acupointData) {
        const acupointList = Array.isArray(acupointData) ? acupointData : Object.values(acupointData);
        acupointList.forEach(pt => {
          if (pt.related_muscles && pt.related_muscles.includes(muscleId)) {
            acupoints.push(pt);
          }
        });
      }

      this.state.selectedMuscleDetail = {
        ...muscle,
        acupoints
      };
    }
  }
  
  /**
   * Updates search query for filtering movements or muscles.
   * @param {string} query 
   */
  search(query) {
    this.state.searchQuery = query || '';
    const q = (query || '').trim().toLowerCase();

    // Trường hợp 1: Đang chọn một cử động -> Lọc danh sách cơ trong cử động đó
    if (this.state.selectedMovement) {
      const movement = this.state.selectedMovement;
      const allActive = (movement.muscles || []).map(mRole => {
        const id = mRole.muscleId || mRole.id;
        const detail = this.appVM.muscleData?.[id] || {};
        return { id, role: mRole.role, ...detail };
      });

      if (!q) {
        this.state.activeMuscles = allActive;
        this.appVM.sceneVM.highlightMusclesForMovement(allActive);
        return;
      }

      const filtered = allActive.filter(m => {
        const nameVi = (m.name_vi || '').toLowerCase();
        const nameLatin = (m.name_latin || '').toLowerCase();
        const id = (m.id || '').toLowerCase();
        return nameVi.includes(q) || nameLatin.includes(q) || id.includes(q);
      });

      this.state.activeMuscles = filtered;
      this.appVM.sceneVM.highlightMusclesForMovement(filtered);
      return;
    }

    // Trường hợp 2: Chưa chọn cử động -> Tìm kiếm toàn cục trên toàn bộ kho cơ bắp y khoa
    if (!q) {
      this.state.activeMuscles = [];
      this.appVM.sceneVM.highlightMusclesForMovement([]);
      this.selectMuscleForDetail(null);
      return;
    }

    const allMuscles = this.appVM.getMuscles();
    const matchedMuscles = allMuscles.filter(m => {
      const nameVi = (m.name_vi || '').toLowerCase();
      const nameLatin = (m.name_latin || '').toLowerCase();
      const id = (m.id || '').toLowerCase();
      return nameVi.includes(q) || nameLatin.includes(q) || id.includes(q);
    });

    if (matchedMuscles.length > 0) {
      const activeList = matchedMuscles.map(m => ({
        id: m.id,
        role: 'agonist',
        ...m
      }));
      this.state.activeMuscles = activeList;
      this.appVM.sceneVM.highlightMusclesForMovement(activeList);
      this.selectMuscleForDetail(matchedMuscles[0].id);
    } else {
      this.state.activeMuscles = [];
      this.appVM.sceneVM.highlightMusclesForMovement([]);
      this.selectMuscleForDetail(null);
    }
  }
}
