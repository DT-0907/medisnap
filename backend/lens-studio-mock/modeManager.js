/**
 * Node.js Mock for Mode Manager (Task 2.1)
 * Simulates Lens Studio behavior for Jest testing
 *
 * This mock replicates the behavior of lens-studio/Public/Scripts/clinical/modeManager.js
 * but uses Node.js timers instead of Lens Studio's DelayedCallbackEvent.
 */

class ModeManager {
  /**
   * @param {Object} ttsService - Mock TTS service with speak() method
   */
  constructor(ttsService) {
    this.ttsService = ttsService;

    // Configuration (matches lens-studio/Public/Scripts/config.js)
    this.config = {
      MODE: {
        IDLE: 'idle',
        TRAINING: 'training',
        CLINICAL: 'clinical'
      },
      TIMEOUTS: {
        TRAINING_AUTO_EXIT: 10000,   // 10 seconds (FR-5a)
        CLINICAL_AUTO_EXIT: 120000   // 120 seconds (FR-12a)
      }
    };

    // State
    this.state = {
      currentMode: this.config.MODE.IDLE,
      inactivityTimer: null,
      sessionData: {}
    };
  }

  /**
   * Switch to a new mode
   * @param {string} newMode - 'idle', 'training', or 'clinical'
   */
  switchMode(newMode) {
    // FR-12b: If not in idle, auto-exit current mode first
    if (this.state.currentMode !== this.config.MODE.IDLE) {
      this.exitCurrentMode();
    }

    // Enter new mode
    this.state.currentMode = newMode;

    if (newMode === this.config.MODE.IDLE) {
      // No setup needed for idle
      return;
    }

    // Initialize session data
    this._initializeSessionData(newMode);

    // Start inactivity timer
    this._startInactivityTimer(newMode);
  }

  /**
   * Exit the current mode with confirmation message
   */
  exitCurrentMode() {
    const currentMode = this.state.currentMode;

    if (currentMode === this.config.MODE.IDLE) {
      return; // Already in idle, nothing to exit
    }

    // Clear inactivity timer
    if (this.state.inactivityTimer) {
      clearTimeout(this.state.inactivityTimer);
      this.state.inactivityTimer = null;
    }

    // Clear session data
    this.state.sessionData = {};

    // Speak confirmation message
    if (currentMode === this.config.MODE.TRAINING) {
      this.ttsService.speak('Training complete.'); // FR-5a
    } else if (currentMode === this.config.MODE.CLINICAL) {
      this.ttsService.speak('Assessment complete.'); // FR-12a
    }

    // Return to idle
    this.state.currentMode = this.config.MODE.IDLE;
  }

  /**
   * Get current mode
   * @returns {string} Current mode ('idle', 'training', or 'clinical')
   */
  getCurrentMode() {
    return this.state.currentMode;
  }

  /**
   * Check if in clinical mode
   * @returns {boolean} True if in clinical mode
   */
  isInClinicalMode() {
    return this.state.currentMode === this.config.MODE.CLINICAL;
  }

  /**
   * Reset the inactivity timer (call this on user activity)
   */
  resetInactivityTimer() {
    const currentMode = this.state.currentMode;

    if (currentMode === this.config.MODE.IDLE) {
      return; // No timer in idle mode
    }

    // Clear existing timer
    if (this.state.inactivityTimer) {
      clearTimeout(this.state.inactivityTimer);
    }

    // Restart timer
    this._startInactivityTimer(currentMode);
  }

  /**
   * Initialize session data for a mode
   * @private
   * @param {string} mode - Mode to initialize
   */
  _initializeSessionData(mode) {
    this.state.sessionData = {
      mode: mode,
      startTime: Date.now()
    };
  }

  /**
   * Start inactivity timer for a mode
   * @private
   * @param {string} mode - Mode to start timer for
   */
  _startInactivityTimer(mode) {
    let timeout;

    if (mode === this.config.MODE.TRAINING) {
      timeout = this.config.TIMEOUTS.TRAINING_AUTO_EXIT; // 10s
    } else if (mode === this.config.MODE.CLINICAL) {
      timeout = this.config.TIMEOUTS.CLINICAL_AUTO_EXIT; // 120s
    } else {
      return; // No timer for idle
    }

    this.state.inactivityTimer = setTimeout(() => {
      // Auto-exit on timeout
      this.exitCurrentMode();
    }, timeout);
  }
}

module.exports = ModeManager;
