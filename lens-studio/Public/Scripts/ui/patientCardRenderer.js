/**
 * Dev 2 Task 2.2: Patient Card Renderer
 * Renders patient information in AR overlay
 *
 * TO BE IMPLEMENTED: Hours 12-18
 *
 * Responsibilities:
 * - Display patient card at top 1/3 of screen (FR-13, AR-3)
 * - Show allergies in RED (FR-13, AR-1)
 * - Auto-hide after 10s (FR-13)
 * - Manual recall via voice command (FR-15)
 * - Render patient name, age, sex, medications, vitals (FR-13)
 */

// @input Component.Text patientNameText
// @input Component.Text patientAgeText
// @input Component.Text allergiesText
// @input Component.Text medicationsText
// @input Component.Text vitalsText
// @input Component.Image cardBackground
// @input SceneObject cardRootObject
// @input bool debugMode = true

// Get config
const config = global.MedSnapConfig;

if (!config) {
  print("ERROR: MedSnapConfig not loaded. Ensure config.js runs first.");
} else {
  print("PatientCardRenderer loaded - awaiting Task 2.2 implementation");

  if (script.debugMode) {
    print("Debug: Allergy text color: " + JSON.stringify(config.AR_COLORS.ALLERGY_TEXT));
    print("Debug: Auto-hide timeout: " + config.TIMEOUTS.PATIENT_CARD_AUTO_HIDE + "ms");
  }
}

// Placeholder state
var isCardVisible = false;
var autoHideTimer = null;
var currentPatientData = null;

// Placeholder functions - to be implemented in Task 2.2
function renderPatientCard(patientData) {
  if (script.debugMode) {
    print("PatientCardRenderer: renderPatientCard called");
    print("PatientCardRenderer: Patient: " + patientData.name);
  }

  // TODO Task 2.2: Implement patient card rendering
  // - Set patient name text
  // - Set age/sex text
  // - Set allergies text in RED (config.AR_COLORS.ALLERGY_TEXT)
  // - Set medications text
  // - Set vitals text
  // - Position card at top 1/3 (anchors.setCenter(0.5, 0.9))
  // - Fade in animation (300ms per AR-4)
  // - Start auto-hide timer (10s per FR-13)

  currentPatientData = patientData;
  isCardVisible = true;

  print("PatientCardRenderer: Card rendered for " + patientData.name + " (placeholder)");
}

function hidePatientCard() {
  if (script.debugMode) {
    print("PatientCardRenderer: hidePatientCard called");
  }

  // TODO Task 2.2: Implement card hiding
  // - Fade out animation (300ms per AR-4)
  // - Disable card root object
  // - Clear auto-hide timer

  isCardVisible = false;

  print("PatientCardRenderer: Card hidden (placeholder)");
}

function showPatientCard() {
  if (script.debugMode) {
    print("PatientCardRenderer: showPatientCard called (manual recall)");
  }

  // TODO Task 2.2: Implement manual recall
  // - Re-render last patient data
  // - Restart auto-hide timer

  if (currentPatientData) {
    renderPatientCard(currentPatientData);
  } else {
    print("PatientCardRenderer: No patient data to show");
  }
}

// Export functions for other scripts
script.renderPatientCard = renderPatientCard;
script.hidePatientCard = hidePatientCard;
script.showPatientCard = showPatientCard;
