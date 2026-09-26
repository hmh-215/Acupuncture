import { Observable } from './Observable.js';
import { SceneViewModel } from './SceneViewModel.js';
import { MovementViewModel } from './MovementViewModel.js';

/**
 * AppViewModel
 * The root ViewModel responsible for managing application-level state,
 * loading JSON data, and orchestrating child ViewModels.
 */
export class AppViewModel extends Observable {
  constructor() {
    super({
      isLoading: true,
      error: null,
      dataLoaded: false
    });
    
    this.muscleData = null;
    this.movementData = null;
    this.acupointData = null;
    this.boneMapping = null;
    
    this.sceneVM = new SceneViewModel(this);
    this.movementVM = new MovementViewModel(this);
  }
  
  /**
   * Loads all JSON data files and initializes child ViewModels.
   */
  async initialize() {
    this.state.isLoading = true;
    this.state.error = null;
    
    try {
      const [muscles, movements, acupoints, bones] = await Promise.all([
        fetch('./data/muscles.json').then(r => r.json()),
        fetch('./data/movements.json').then(r => r.json()),
        fetch('./data/acupoints.json').then(r => r.json()),
        fetch('./data/bone-mapping.json').then(r => r.json())
      ]);
      
      this.muscleData = muscles;
      this.movementData = movements;
      this.acupointData = acupoints;
      this.boneMapping = bones;
      
      this.batch(() => {
        this.state.isLoading = false;
        this.state.dataLoaded = true;
      });
      
    } catch (err) {
      this.batch(() => {
        // Must use Vietnamese for UI text
        this.state.error = 'Lỗi tải dữ liệu: ' + err.message;
        this.state.isLoading = false;
      });
    }
  }

  /**
   * Get all muscles as an array.
   * @returns {Array} Array of muscle objects
   */
  getMuscles() {
    if (!this.muscleData) return [];
    return Object.values(this.muscleData);
  }

  /**
   * Get a muscle by its ID.
   * @param {string} id
   * @returns {Object|null}
   */
  getMuscleById(id) {
    if (!this.muscleData) return null;
    return this.muscleData[id] || null;
  }

  /**
   * Get a bone's Vietnamese name from the mapping.
   * @param {string} meshName - The mesh name from the 3D model
   * @returns {string} Vietnamese name or original mesh name
   */
  getBoneNameVi(meshName) {
    if (!this.boneMapping || !this.boneMapping[meshName]) return meshName;
    return this.boneMapping[meshName].name_vi;
  }

  /**
   * Get all movements as an array.
   * @returns {Array}
   */
  getMovements() {
    if (!this.movementData) return [];
    return Object.values(this.movementData);
  }

  /**
   * Get acupoint data by code.
   * @param {string} code - WHO acupoint code (e.g. "LI-15")
   * @returns {Object|null}
   */
  getAcupoint(code) {
    if (!this.acupointData) return null;
    return this.acupointData[code] || null;
  }
}
