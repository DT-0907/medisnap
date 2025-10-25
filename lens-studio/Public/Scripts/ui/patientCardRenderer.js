/**
 * Dev 2 Task 2.2: Patient Card Renderer
 * Renders patient information in AR overlay
 */

// @input Component.Text patientNameText
// @input Component.Text patientDetailsText {"label":"Patient Age/Sex"}
// @input Component.Text allergiesText
// @input Component.Text medicationsText
// @input Component.Text historyText
// @input Component.Text vitalsText
// @input Component.Text chiefComplaintText
// @input Component.Text symptomsText
// @input Component.Image cardBackground
// @input SceneObject cardRootObject
// @input bool debugMode = true

// Get config
const config = global.MedSnapConfig;

if (!config) {
  print("ERROR: MedSnapConfig not loaded. Ensure config.js runs first.");
  throw new Error("MedSnapConfig not loaded");
}

print("PatientCardRenderer loaded - Task 2.2 implementation active");

if (script.debugMode) {
  print("Debug: Allergy text color: " + JSON.stringify(config.AR_COLORS.ALLERGY_TEXT));
  print("Debug: Auto-hide timeout: " + config.TIMEOUTS.PATIENT_CARD_AUTO_HIDE + "ms");
}

// State
var isCardVisible = false;
var autoHideTimer = null;
var currentPatientData = null;
var currentViewMode = 'all'; // 'all', 'history', 'medications', 'allergies'

/**
 * Render patient card with all data
 * @param {Object} patientData - Patient data object from backend/demo
 * @param {string} viewMode - 'all', 'history', 'medications', or 'allergies'
 */
function renderPatientCard(patientData, viewMode) {
  if (!patientData) {
    print("ERROR: No patient data provided to renderPatientCard");
    return;
  }

  viewMode = viewMode || 'all';
  currentPatientData = patientData;
  currentViewMode = viewMode;

  if (script.debugMode) {
    print("PatientCardRenderer: Rendering card for " + patientData.name + " (mode: " + viewMode + ")");
  }

  // 1. Patient name
  script.patientNameText.text = patientData.name;

  // 2. Patient age and sex
  script.patientDetailsText.text = "Age " + patientData.age + ", " + patientData.sex;

  // 3. Allergies (prominent, RED per AR-1)
  if (patientData.allergies && patientData.allergies.length > 0) {
    script.allergiesText.text = "Allergies: " + patientData.allergies.join(', ');
    script.allergiesText.textFill.color = config.AR_COLORS.ALLERGY_TEXT; // RED
  } else {
    script.allergiesText.text = "Allergies: None";
    script.allergiesText.textFill.color = config.AR_COLORS.ALLERGY_TEXT; // Still RED per FR-13
  }

  // 4. Chief complaint
  if (patientData.chief_complaint) {
    script.chiefComplaintText.text = "Chief Complaint: " + patientData.chief_complaint;
  } else {
    script.chiefComplaintText.text = "";
  }

  // 5. Current symptoms (initially empty, updated via updateCardField)
  if (patientData.current_symptoms && patientData.current_symptoms.length > 0) {
    var symptomsText = "Current Symptoms:\n";
    for (var i = 0; i < patientData.current_symptoms.length; i++) {
      symptomsText += "- " + patientData.current_symptoms[i] + "\n";
    }
    script.symptomsText.text = symptomsText;
  } else {
    script.symptomsText.text = "";
  }

  // 6. Vital signs
  if (patientData.current_vitals) {
    var v = patientData.current_vitals;
    var vitalParts = [];

    if (v.bp) vitalParts.push("BP: " + v.bp);
    if (v.hr !== undefined) vitalParts.push("HR: " + v.hr);
    if (v.o2 !== undefined) vitalParts.push("O2: " + v.o2);
    if (v.temp !== undefined) vitalParts.push("Temp: " + v.temp + "°F");

    script.vitalsText.text = vitalParts.length > 0
      ? "Vitals: " + vitalParts.join(', ')
      : "Vitals: Not recorded";
  } else {
    script.vitalsText.text = "Vitals: Not recorded";
  }

  // 7. Medications
  if (patientData.medications && patientData.medications.length > 0) {
    var medText = "Medications:\n";
    for (var j = 0; j < patientData.medications.length; j++) {
      var med = patientData.medications[j];
      medText += med.name + " " + med.dosage + "\n";
    }
    script.medicationsText.text = medText;
  } else {
    script.medicationsText.text = "Medications: None";
  }

  // 8. Diagnosis history (last 3 visits)
  if (patientData.diagnosis_history && patientData.diagnosis_history.length > 0) {
    var historyText = "Recent Diagnoses:\n";
    var historyCount = Math.min(3, patientData.diagnosis_history.length);
    for (var k = 0; k < historyCount; k++) {
      var dx = patientData.diagnosis_history[k];
      var date = formatDate(dx.date);
      historyText += date + ": " + dx.diagnosis + "\n";
    }
    script.historyText.text = historyText;
  } else {
    script.historyText.text = "Recent Diagnoses: None";
  }

  // Apply view mode filters
  applyViewMode(viewMode);

  // Show card with fade-in animation
  fadeIn();

  // Start auto-hide timer (10 seconds per FR-13)
  startAutoHideTimer();

  isCardVisible = true;

  if (script.debugMode) {
    print("PatientCardRenderer: Card rendered successfully");
  }
}

/**
 * Update a specific field without full re-render (performance optimization)
 * @param {string} fieldName - 'vitals', 'symptoms', 'medications'
 * @param {*} value - New value for the field
 */
function updateCardField(fieldName, value) {
  if (!currentPatientData) {
    print("ERROR: No patient data loaded. Cannot update field.");
    return;
  }

  if (script.debugMode) {
    print("PatientCardRenderer: Updating field: " + fieldName);
  }

  switch (fieldName) {
    case 'vitals':
      var vitalParts = [];
      if (value.bp) vitalParts.push("BP: " + value.bp);
      if (value.hr !== undefined) vitalParts.push("HR: " + value.hr);
      if (value.o2 !== undefined) vitalParts.push("O2: " + value.o2);
      if (value.temp !== undefined) vitalParts.push("Temp: " + value.temp + "°F");

      script.vitalsText.text = vitalParts.length > 0
        ? "Vitals: " + vitalParts.join(', ')
        : "Vitals: Not recorded";
      currentPatientData.current_vitals = value;
      break;

    case 'symptoms':
      if (typeof value === 'string') {
        script.symptomsText.text = "Current Symptoms: " + value;
      } else {
        var symptomsText = "Current Symptoms:\n";
        for (var i = 0; i < value.length; i++) {
          symptomsText += "- " + value[i] + "\n";
        }
        script.symptomsText.text = symptomsText;
      }
      currentPatientData.current_symptoms = value;
      break;

    case 'medications':
      var medText = "Medications:\n";
      for (var j = 0; j < value.length; j++) {
        medText += value[j].name + " " + value[j].dosage + "\n";
      }
      script.medicationsText.text = medText;
      currentPatientData.medications = value;
      break;

    default:
      print("ERROR: Unknown field: " + fieldName);
  }

  // Restart auto-hide timer
  startAutoHideTimer();
}

/**
 * Hide patient card with fade-out animation
 */
function hidePatientCard() {
  if (script.debugMode) {
    print("PatientCardRenderer: Hiding card");
  }

  fadeOut();
  clearAutoHideTimer();
  isCardVisible = false;
}

/**
 * Show patient card (manual recall from voice command)
 */
function showPatientCard() {
  if (!currentPatientData) {
    print("ERROR: No patient data to show");
    return;
  }

  if (script.debugMode) {
    print("PatientCardRenderer: Manual recall - showing card");
  }

  renderPatientCard(currentPatientData, currentViewMode);
}

/**
 * Show patient history view
 */
function showPatientHistory() {
  if (!currentPatientData) {
    print("ERROR: No patient data loaded");
    return;
  }

  renderPatientCard(currentPatientData, 'history');
}

/**
 * Show medications view
 */
function showMedications() {
  if (!currentPatientData) {
    print("ERROR: No patient data loaded");
    return;
  }

  renderPatientCard(currentPatientData, 'medications');
}

/**
 * Show allergies view (enlarged)
 */
function showAllergies() {
  if (!currentPatientData) {
    print("ERROR: No patient data loaded");
    return;
  }

  renderPatientCard(currentPatientData, 'allergies');

  // Enlarge allergy text
  script.allergiesText.size = 28; // Larger than default 20pt
}

// --- Private Functions ---

/**
 * Apply view mode filters (show/hide specific sections)
 */
function applyViewMode(viewMode) {
  // Get parent SceneObjects for each text component
  var nameObj = script.patientNameText.getSceneObject();
  var detailsObj = script.patientDetailsText.getSceneObject();
  var allergiesObj = script.allergiesText.getSceneObject();
  var medicationsObj = script.medicationsText.getSceneObject();
  var historyObj = script.historyText.getSceneObject();
  var vitalsObj = script.vitalsText.getSceneObject();
  var chiefComplaintObj = script.chiefComplaintText.getSceneObject();
  var symptomsObj = script.symptomsText.getSceneObject();

  // Default: show all
  nameObj.enabled = true;
  detailsObj.enabled = true;
  allergiesObj.enabled = true;
  medicationsObj.enabled = true;
  historyObj.enabled = true;
  vitalsObj.enabled = true;
  chiefComplaintObj.enabled = true;
  symptomsObj.enabled = true;

  switch (viewMode) {
    case 'history':
      allergiesObj.enabled = false;
      medicationsObj.enabled = false;
      vitalsObj.enabled = false;
      chiefComplaintObj.enabled = false;
      symptomsObj.enabled = false;
      break;

    case 'medications':
      allergiesObj.enabled = false;
      historyObj.enabled = false;
      vitalsObj.enabled = false;
      chiefComplaintObj.enabled = false;
      symptomsObj.enabled = false;
      break;

    case 'allergies':
      medicationsObj.enabled = false;
      historyObj.enabled = false;
      vitalsObj.enabled = false;
      chiefComplaintObj.enabled = false;
      symptomsObj.enabled = false;
      break;

    case 'all':
    default:
      // All enabled (default)
      break;
  }
}

/**
 * Fade in animation (300ms per AR-4)
 */
function fadeIn() {
  script.cardRootObject.enabled = true;

  // TODO: Implement smooth fade-in using TweenManager or AnimateProperty
  // For now, just enable the object

  if (script.debugMode) {
    print("PatientCardRenderer: Fade in (placeholder)");
  }
}

/**
 * Fade out animation (300ms per AR-4)
 */
function fadeOut() {
  // TODO: Implement smooth fade-out using TweenManager or AnimateProperty
  // For now, just disable the object

  script.cardRootObject.enabled = false;

  if (script.debugMode) {
    print("PatientCardRenderer: Fade out (placeholder)");
  }
}

/**
 * Start auto-hide timer (10 seconds)
 */
function startAutoHideTimer() {
  clearAutoHideTimer();

  var hideDelay = script.createEvent("DelayedCallbackEvent");
  hideDelay.bind(function() {
    if (script.debugMode) {
      print("PatientCardRenderer: Auto-hide triggered");
    }
    hidePatientCard();
  });
  hideDelay.reset(config.TIMEOUTS.PATIENT_CARD_AUTO_HIDE / 1000); // Convert ms to seconds

  autoHideTimer = hideDelay;
}

/**
 * Clear auto-hide timer
 */
function clearAutoHideTimer() {
  if (autoHideTimer) {
    autoHideTimer.cancel();
    autoHideTimer = null;
  }
}

/**
 * Format date for display (MM/DD/YYYY)
 * @param {string} dateString - ISO date string (e.g., "2024-10-01")
 * @returns {string} Formatted date
 */
function formatDate(dateString) {
  var parts = dateString.split('-'); // ["2024", "10", "01"]
  if (parts.length === 3) {
    return parts[1] + "/" + parts[2] + "/" + parts[0]; // "10/01/2024"
  }
  return dateString; // Fallback
}

// Export functions for other scripts
script.renderPatientCard = renderPatientCard;
script.updateCardField = updateCardField;
script.hidePatientCard = hidePatientCard;
script.showPatientCard = showPatientCard;
script.showPatientHistory = showPatientHistory;
script.showMedications = showMedications;
script.showAllergies = showAllergies;
