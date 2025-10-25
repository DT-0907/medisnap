/**
 * Dev 2 Task 2.1: Mode Manager
 * Handles Clinical/Training/Idle mode switching
 *
 * IMPLEMENTED: Hours 6-12 (Task 2.1 complete)
 *
 * Responsibilities:
 * - Switch between IDLE, TRAINING, CLINICAL modes (FR-12b)
 * - Track current mode state
 * - Handle inactivity timers (FR-5a: 10s training, FR-12a: 120s clinical)
 * - Coordinate with voice command router (Dev 1 integration)
 * - Speak confirmation messages via TTS
 */

// @input bool debugMode = true
// @input Component.ScriptComponent ttsService

// Get config
const config = global.MedSnapConfig;

if (!config) {
  print("ERROR: MedSnapConfig not loaded. Ensure config.js runs first.");
} else {
  print("ModeManager loaded (Task 2.1 complete)");

  if (script.debugMode) {
    print("Debug: Available modes: " + JSON.stringify(config.MODE));
    print("Debug: Training timeout: " + (config.TIMEOUTS.TRAINING_AUTO_EXIT / 1000) + "s");
    print("Debug: Clinical timeout: " + (config.TIMEOUTS.CLINICAL_AUTO_EXIT / 1000) + "s");
  }
}

// State
var currentMode = config ? config.MODE.IDLE : "idle";
var inactivityTimer = null;
var sessionData = {};

/**
 * Switch to a new mode
 * @param {string} newMode - 'idle', 'training', or 'clinical'
 */
function switchMode(newMode) {
  if (script.debugMode) {
    print("ModeManager: switchMode called with: " + newMode);
    print("ModeManager: Current mode: " + currentMode);
  }

  // FR-12b: If not in idle, auto-exit current mode first
  if (currentMode !== config.MODE.IDLE) {
    exitCurrentMode();
  }

  // Enter new mode
  currentMode = newMode;

  if (newMode === config.MODE.IDLE) {
    if (script.debugMode) {
      print("ModeManager: Entered IDLE mode");
    }
    return;
  }

  // Initialize session data
  initializeSessionData(newMode);

  // Start inactivity timer
  startInactivityTimer(newMode);

  if (script.debugMode) {
    print("ModeManager: Entered " + newMode.toUpperCase() + " mode");
  }
}

/**
 * Exit the current mode with confirmation message
 */
function exitCurrentMode() {
  if (currentMode === config.MODE.IDLE) {
    return; // Already in idle, nothing to exit
  }

  if (script.debugMode) {
    print("ModeManager: Exiting " + currentMode.toUpperCase() + " mode");
  }

  // Clear inactivity timer
  if (inactivityTimer) {
    inactivityTimer.cancel();
    inactivityTimer = null;
  }

  // Clear session data
  sessionData = {};

  // Speak confirmation message
  if (currentMode === config.MODE.TRAINING) {
    speakMessage("Training complete."); // FR-5a
  } else if (currentMode === config.MODE.CLINICAL) {
    speakMessage("Assessment complete."); // FR-12a
  }

  // Return to idle
  currentMode = config.MODE.IDLE;
}

/**
 * Get current mode
 * @returns {string} Current mode ('idle', 'training', or 'clinical')
 */
function getCurrentMode() {
  return currentMode;
}

/**
 * Check if in clinical mode
 * @returns {boolean} True if in clinical mode
 */
function isInClinicalMode() {
  return currentMode === config.MODE.CLINICAL;
}

/**
 * Reset the inactivity timer (call this on user activity)
 */
function resetInactivityTimer() {
  if (currentMode === config.MODE.IDLE) {
    return; // No timer in idle mode
  }

  if (script.debugMode) {
    print("ModeManager: Resetting inactivity timer for " + currentMode.toUpperCase() + " mode");
  }

  // Clear existing timer
  if (inactivityTimer) {
    inactivityTimer.cancel();
  }

  // Restart timer
  startInactivityTimer(currentMode);
}

/**
 * Initialize session data for a mode
 * @private
 */
function initializeSessionData(mode) {
  sessionData = {
    mode: mode,
    startTime: getTime()
  };

  if (script.debugMode) {
    print("ModeManager: Session data initialized for " + mode);
  }
}

/**
 * Start inactivity timer for a mode
 * CRITICAL: DelayedCallbackEvent uses SECONDS, not milliseconds!
 * @private
 */
function startInactivityTimer(mode) {
  var timeoutMs;

  if (mode === config.MODE.TRAINING) {
    timeoutMs = config.TIMEOUTS.TRAINING_AUTO_EXIT; // 10000ms = 10s
  } else if (mode === config.MODE.CLINICAL) {
    timeoutMs = config.TIMEOUTS.CLINICAL_AUTO_EXIT; // 120000ms = 120s
  } else {
    return; // No timer for idle
  }

  // Convert milliseconds to seconds for Lens Studio API
  var timeoutSeconds = timeoutMs / 1000;

  if (script.debugMode) {
    print("ModeManager: Starting " + timeoutSeconds + "s inactivity timer for " + mode);
  }

  // Create delayed callback
  var delayedEvent = script.createEvent("DelayedCallbackEvent");
  delayedEvent.bind(function() {
    if (script.debugMode) {
      print("ModeManager: Inactivity timeout reached for " + mode);
    }
    exitCurrentMode();
  });
  delayedEvent.reset(timeoutSeconds); // Use seconds, not milliseconds!

  inactivityTimer = delayedEvent;
}

/**
 * Speak a message via TTS service
 * @private
 */
function speakMessage(message) {
  if (script.ttsService && script.ttsService.speak) {
    script.ttsService.speak(message);
  } else if (script.debugMode) {
    print("ModeManager: TTS not available, would say: " + message);
  }
}

// Export functions for other scripts
script.switchMode = switchMode;
script.getCurrentMode = getCurrentMode;
script.isInClinicalMode = isInClinicalMode;
script.exitCurrentMode = exitCurrentMode;
script.resetInactivityTimer = resetInactivityTimer;
