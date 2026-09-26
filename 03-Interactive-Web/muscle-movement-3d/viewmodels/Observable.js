/**
 * Observable.js
 * A lightweight Proxy-based reactive state management system.
 */
export class Observable {
  /**
   * @param {Object} initialState
   */
  constructor(initialState = {}) {
    this._listeners = new Map();
    this._anyListeners = new Set();
    this._batching = false;
    this._pendingNotifications = new Map();
    this._computedDeps = new Map();
    
    this.state = this._createProxy(initialState);
  }
  
  /**
   * Creates a proxy to intercept state changes.
   * Handles deep proxy wrapping for nested objects.
   * @param {Object} obj 
   * @param {string} pathPrefix 
   * @returns {Proxy}
   */
  _createProxy(obj, pathPrefix = '') {
    const handler = {
      get: (target, key) => {
        const val = target[key];
        if (val !== null && typeof val === 'object' && !Array.isArray(val) && !(val instanceof Date)) {
          return this._createProxy(val, `${pathPrefix}${key}.`);
        }
        return val;
      },
      set: (target, key, value) => {
        const oldValue = target[key];
        if (oldValue === value) return true;
        
        target[key] = value;
        const fullPath = `${pathPrefix}${key}`;
        
        if (this._batching) {
          if (!this._pendingNotifications.has(fullPath)) {
             this._pendingNotifications.set(fullPath, { value, oldValue });
          } else {
             // Retain the original oldValue across multiple batched updates
             this._pendingNotifications.get(fullPath).value = value;
          }
        } else {
          this._notify(fullPath, value, oldValue);
        }
        return true;
      }
    };
    return new Proxy(obj, handler);
  }

  /**
   * Subscribe to specific property changes.
   * @param {string} property 
   * @param {Function} callback 
   * @returns {Function} Unsubscribe function
   */
  on(property, callback) {
    if (!this._listeners.has(property)) {
      this._listeners.set(property, new Set());
    }
    this._listeners.get(property).add(callback);
    return () => {
      this._listeners.get(property)?.delete(callback);
    };
  }

  /**
   * Subscribe to any state change.
   * @param {Function} callback 
   * @returns {Function} Unsubscribe function
   */
  onAny(callback) {
    this._anyListeners.add(callback);
    return () => {
      this._anyListeners.delete(callback);
    };
  }

  /**
   * Batch multiple state changes and fire notifications once at the end.
   * @param {Function} fn 
   */
  batch(fn) {
    this._batching = true;
    try {
      fn();
    } finally {
      this._batching = false;
      this._pendingNotifications.forEach(({ value, oldValue }, key) => {
        this._notify(key, value, oldValue);
      });
      this._pendingNotifications.clear();
    }
  }

  /**
   * Create derived values that auto-update.
   * @param {string} property Property name to attach to state
   * @param {Array<string>} deps Array of dependency property paths
   * @param {Function} fn Function to compute the derived value
   */
  computed(property, deps, fn) {
    const evaluate = () => {
      // Evaluate function without triggering observers of the computed property immediately
      // if it's identical, to prevent unnecessary re-renders.
      const newValue = fn(this.state);
      this.state[property] = newValue;
    };
    
    deps.forEach(dep => {
      this.on(dep, evaluate);
    });
    
    // Initial evaluation
    evaluate();
  }

  /**
   * Internal method to notify listeners.
   * @param {string} key 
   * @param {*} value 
   * @param {*} oldValue 
   */
  _notify(key, value, oldValue) {
    if (this._listeners.has(key)) {
      this._listeners.get(key).forEach(callback => callback(value, oldValue));
    }
    this._anyListeners.forEach(callback => callback(key, value, oldValue));
  }

  /**
   * Cleanup all listeners.
   */
  dispose() {
    this._listeners.clear();
    this._anyListeners.clear();
    this._pendingNotifications.clear();
    this._computedDeps.clear();
  }
}
