import { Observable } from './Observable.js';

const ROLE_COLORS = {
  agonist: '#ef4444',     // Red
  antagonist: '#38bdf8',  // Cyan
  synergist: '#f59e0b',   // Amber
  stabilizer: '#10b981'   // Green
};

/**
 * SceneViewModel
 * Manages Three.js scene state logically. Does NOT touch DOM or Three.js directly.
 */
export class SceneViewModel extends Observable {
  /**
   * @param {import('./AppViewModel.js').AppViewModel} appVM 
   */
  constructor(appVM) {
    super({
      selectedBoneId: null,
      highlightedMuscles: [],    // Array of { muscleId, role, color }
      cameraTarget: null,        // { x, y, z } or null
      showSkeleton: false,       // MẶC ĐỊNH: Ẩn hệ xương
      showMuscleLayer: true,     // MẶC ĐỊNH: Hiện hệ cơ
      showNervousLayer: false,   // MẶC ĐỊNH: Ẩn hệ thần kinh
      showVascularLayer: false,  // MẶC ĐỊNH: Ẩn hệ tuần hoàn
      muscleOpacity: 0.95,       // Độ mờ độc lập của Hệ Cơ
      skeletonOpacity: 0.80,     // Độ mờ độc lập của Hệ Xương
      nervousOpacity: 0.90,      // Độ mờ độc lập của Hệ Thần Kinh
      vascularOpacity: 0.90,     // Độ mờ độc lập của Hệ Tuần Hoàn
      hoveredObjectId: null,
      isolatedMuscleId: null     // When set, only this muscle is fully visible
    });
    this.appVM = appVM;
  }
  
  /**
   * Updates selected bone and manages camera targeting if necessary.
   * @param {string|null} boneId 
   */
  selectBone(boneId) {
    this.state.selectedBoneId = boneId;
  }
  
  /**
   * Highlights specific muscles according to their roles in a movement.
   * @param {Array<{id: string, role: string}>} muscleList 
   */
  highlightMusclesForMovement(muscleList) {
    this.state.highlightedMuscles = muscleList.map(m => ({
      muscleId: m.id,
      role: m.role,
      color: ROLE_COLORS[m.role] || '#ffffff'
    }));
  }
  
  /**
   * Sets the visibility of the skeleton model.
   * @param {boolean} show
   */
  setShowSkeleton(show) {
    this.state.showSkeleton = Boolean(show);
  }

  /**
   * Sets the visibility of the muscle layer.
   * @param {boolean} show
   */
  setShowMuscleLayer(show) {
    this.state.showMuscleLayer = Boolean(show);
  }

  /**
   * Sets the visibility of the nervous system layer.
   * @param {boolean} show
   */
  setShowNervousLayer(show) {
    this.state.showNervousLayer = Boolean(show);
  }

  /**
   * Sets the visibility of the vascular system layer.
   * @param {boolean} show
   */
  setShowVascularLayer(show) {
    this.state.showVascularLayer = Boolean(show);
  }

  /**
   * Sets muscle opacity between 0.05 and 1.0.
   * @param {number} opacity
   */
  setMuscleOpacity(opacity) {
    this.state.muscleOpacity = Math.max(0.05, Math.min(1, opacity));
  }

  /**
   * Sets skeleton opacity between 0.05 and 1.0.
   * @param {number} opacity
   */
  setSkeletonOpacity(opacity) {
    this.state.skeletonOpacity = Math.max(0.05, Math.min(1, opacity));
  }

  /**
   * Sets nervous system opacity between 0.05 and 1.0.
   * @param {number} opacity
   */
  setNervousOpacity(opacity) {
    this.state.nervousOpacity = Math.max(0.05, Math.min(1, opacity));
  }

  /**
   * Sets vascular system opacity between 0.05 and 1.0.
   * @param {number} opacity
   */
  setVascularOpacity(opacity) {
    this.state.vascularOpacity = Math.max(0.05, Math.min(1, opacity));
  }

  /**
   * Toggles the visibility of the skeleton model.
   */
  toggleSkeleton() {
    this.state.showSkeleton = !this.state.showSkeleton;
  }
  
  /**
   * Toggles the visibility of the muscle layer.
   */
  toggleMuscleLayer() {
    this.state.showMuscleLayer = !this.state.showMuscleLayer;
  }
  
  /**
   * Sets the ID of the object currently being hovered over in the 3D scene.
   * @param {string|null} objectId 
   */
  setHoveredObject(objectId) {
    this.state.hoveredObjectId = objectId;
  }
  
  /**
   * Sets a specific muscle to be isolated visually.
   * @param {string} muscleId 
   */
  isolateMuscle(muscleId) {
    this.state.isolatedMuscleId = muscleId;
  }
  
  /**
   * Clears any active muscle isolation.
   */
  clearIsolation() {
    this.state.isolatedMuscleId = null;
  }
  
  /**
   * Resets all visual states in the 3D scene to their default values.
   */
  resetView() {
    this.batch(() => {
      this.state.selectedBoneId = null;
      this.state.highlightedMuscles = [];
      this.state.cameraTarget = null;
      this.state.showSkeleton = true;
      this.state.showMuscleLayer = true;
      this.state.skeletonOpacity = 1.0;
      this.state.hoveredObjectId = null;
      this.state.isolatedMuscleId = null;
    });
  }
}
