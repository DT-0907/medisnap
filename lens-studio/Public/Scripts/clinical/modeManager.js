/**
 * Dev 2 Task 2.1: Mode Manager
 * Handles Clinical/Training/Idle mode switching
 *
 * TO BE IMPLEMENTED: Hours 6-12
 *
 * Responsibilities:
 * - Switch between IDLE, TRAINING, CLINICAL modes (FR-12b)
 * - Track current mode state
 * - Handle mode transitions
 * - Coordinate with voice command router (Dev 1 integration)
 */

// @input bool debugMode = true

// Get config
const config = global.MedSnapConfig;

if (!config) {
  print("ERROR: MedSnapConfig not loaded. Ensure config.js runs first.");
} else {
  print("ModeManager loaded - awaiting Task 2.1 implementation");

  if (script.debugMode) {
    print("Debug: Available modes: " + JSON.stringify(config.MODE));
  }
}

// Placeholder state
var currentMode = config ? config.MODE.IDLE : "idle";

// Placeholder functions - to be implemented in Task 2.1
function switchMode(newMode) {
  if (script.debugMode) {
    print("ModeManager: switchMode called with: " + newMode);
    print("ModeManager: Current mode: " + currentMode);
  }

  // TODO Task 2.1: Implement mode switching logic
  // - Validate newMode
  // - Exit current mode
  // - Enter new mode
  // - Update currentMode

  currentMode = newMode;
  print("ModeManager: Mode switched to " + newMode + " (placeholder)");
}

function getCurrentMode() {
  return currentMode;
}

function isInClinicalMode() {
  return currentMode === (config ? config.MODE.CLINICAL : "clinical");
}

// Export functions for other scripts
script.switchMode = switchMode;
script.getCurrentMode = getCurrentMode;
script.isInClinicalMode = isInClinicalMode;
