/**
 * Dev 2 Task 2.4: Prescription UI
 * Displays prescription success/warning UI
 *
 * TO BE IMPLEMENTED: Hours 30-36
 *
 * Responsibilities:
 * - Display success UI: green checkmark + "Prescription logged" (FR-26)
 * - Display warning UI: red X + drug interaction message (FR-24)
 * - Show alternative medications (FR-23, FR-24)
 * - Display "PENDING" badge (FR-26, FR-26a)
 * - Auto-dismiss after 5s (FR-26)
 * - Center screen positioning (AR-3)
 * - Fade in/out animations (AR-4)
 */

// @input Component.Image iconImage
// @input Component.Text messageText
// @input Component.Text alternativesText
// @input Component.Text badgeText
// @input Component.Image backgroundImage
// @input SceneObject uiRootObject
// @input bool debugMode = true

// Get config
const config = global.MedSnapConfig;

if (!config) {
  print("ERROR: MedSnapConfig not loaded. Ensure config.js runs first.");
} else {
  print("PrescriptionUI loaded - awaiting Task 2.4 implementation");

  if (script.debugMode) {
    print("Debug: Success color: " + JSON.stringify(config.AR_COLORS.SUCCESS));
    print("Debug: Warning color: " + JSON.stringify(config.AR_COLORS.WARNING));
    print("Debug: Auto-dismiss timeout: " + config.TIMEOUTS.PRESCRIPTION_UI_AUTO_HIDE + "ms");
  }
}

// Placeholder state
var isUIVisible = false;
var autoDismissTimer = null;

// Placeholder functions - to be implemented in Task 2.4
function showSuccess(medication, dosage) {
  if (script.debugMode) {
    print("PrescriptionUI: showSuccess called");
    print("PrescriptionUI: Medication: " + medication + ", Dosage: " + dosage);
  }

  // TODO Task 2.4: Implement success UI
  // - Set icon to green checkmark (config.AR_COLORS.SUCCESS)
  // - Set message text: "Prescription logged: [medication] [dosage]"
  // - Set badge text: "PENDING" (FR-26)
  // - Position at center (anchors.setCenter(0.5, 0.5) per AR-3)
  // - Fade in animation (300ms per AR-4)
  // - TTS: "Prescription logged for physician review" (FR-26)
  // - Auto-dismiss after 5s (FR-26)

  isUIVisible = true;

  print("PrescriptionUI: Success UI shown for " + medication + " " + dosage + " (placeholder)");
}

function showWarning(medication, warningMessage, alternatives) {
  if (script.debugMode) {
    print("PrescriptionUI: showWarning called");
    print("PrescriptionUI: Medication: " + medication);
    print("PrescriptionUI: Warning: " + warningMessage);
    print("PrescriptionUI: Alternatives: " + JSON.stringify(alternatives));
  }

  // TODO Task 2.4: Implement warning UI
  // - Set icon to red X (config.AR_COLORS.WARNING)
  // - Set message text: [warning message]
  // - Set alternatives text: List alternative medications
  // - Position at center (anchors.setCenter(0.5, 0.5) per AR-3)
  // - Fade in animation (300ms per AR-4)
  // - TTS: Warning message + alternatives (FR-24)
  // - Auto-dismiss after 5s

  isUIVisible = true;

  print("PrescriptionUI: Warning UI shown for " + medication + " (placeholder)");
}

function hideUI() {
  if (script.debugMode) {
    print("PrescriptionUI: hideUI called");
  }

  // TODO Task 2.4: Implement UI hiding
  // - Fade out animation (300ms per AR-4)
  // - Disable UI root object
  // - Clear auto-dismiss timer

  isUIVisible = false;

  print("PrescriptionUI: UI hidden (placeholder)");
}

// Export functions for other scripts
script.showSuccess = showSuccess;
script.showWarning = showWarning;
script.hideUI = hideUI;
