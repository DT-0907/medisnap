/**
 * Task Group 5: Patient Card Renderer
 * Dev 2 - Clinical Mode AR UI
 *
 * Renders patient information in AR overlay with proper positioning,
 * styling, and auto-hide functionality
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
// @input Component.ScreenTransform cardTransform
// @input SceneObject cardRootObject
// @input bool debugMode = false

// Get config
const config = global.MedSnapConfig;

if (!config) {
  print("ERROR: MedSnapConfig not loaded. Ensure config.js runs first.");
  throw new Error("MedSnapConfig not loaded");
}

print("PatientCardRenderer loaded - Task Group 5 implementation");

if (script.debugMode) {
  print("Debug: Allergy text color: " + JSON.stringify(config.AR_COLORS.ALLERGY_TEXT));
  print("Debug: Auto-hide timeout: " + config.TIMEOUTS.PATIENT_CARD_AUTO_HIDE + "ms");
}

// State
var isCardVisible = false;
var autoHideTimer = null;
var currentPatientData = null;
var currentViewMode = 'all'; // 'all', 'history', 'medications', 'allergies'
var fadeAnimationTimer = null;

// Initialize card positioning and styling (Task 5.3)
function initializeCard() {
  // Position card at top center (Task 5.3 - FR AR-3)
  if (script.cardTransform) {
    script.cardTransform.anchors.setCenter(0.5, 0.9); // Top 1/3 of screen
    script.cardTransform.anchors.setSize(500, 400); // Fixed size for consistency
  }

  // Set semi-transparent background (Task 5.4 - 50% opacity)
  if (script.cardBackground) {
    script.cardBackground.mainPass.baseColor = config.AR_COLORS.CARD_BG;
  }

  // Ensure minimum font sizes (Task 5.3 - FR AR-2)
  ensureMinimumFontSizes();

  // Initially hide the card
  hideCardImmediate();
}

// Ensure all text components meet minimum font size requirement (Task 5.3)
function ensureMinimumFontSizes() {
  const minSize = config.TYPOGRAPHY.MIN_FONT_SIZE; // 18pt minimum
  const textComponents = [
    script.patientNameText,
    script.patientDetailsText,
    script.allergiesText,
    script.medicationsText,
    script.historyText,
    script.vitalsText,
    script.chiefComplaintText,
    script.symptomsText
  ];

  textComponents.forEach(function(textComponent) {
    if (textComponent && textComponent.size < minSize) {
      textComponent.size = minSize;
    }
  });
}

/**
 * Render patient card with all data (Task 5.2, 5.3, 5.4)
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

  // Task 5.2: Create AR text components with patient data
  // Information hierarchy per FR-13:
  // 1. Patient name, age, sex
  script.patientNameText.text = patientData.name;
  script.patientDetailsText.text = "Age " + patientData.age + ", " + patientData.sex;

  // 2. Allergies (prominent, RED per AR-1) - Task 5.4
  if (patientData.allergies && patientData.allergies.length > 0) {
    script.allergiesText.text = "Allergies: " + patientData.allergies.join(', ');
  } else {
    script.allergiesText.text = "Allergies: None";
  }
  // Always show allergies in RED (Task 5.4)
  script.allergiesText.textFill.color = config.AR_COLORS.ALLERGY_TEXT; // RED

  // Add red border effect for allergy warnings (Task 5.4)
  if (patientData.allergies && patientData.allergies.length > 0) {
    // Create visual emphasis for allergies
    script.allergiesText.size = 20; // Slightly larger than minimum
    if (script.allergiesText.getSceneObject()) {
      // Add drop shadow for readability (Task 5.4)
      script.allergiesText.dropshadowSettings.enabled = true;
      script.allergiesText.dropshadowSettings.offset = new vec2(2, 2);
    }
  }

  // 3. Chief complaint
  if (patientData.chief_complaint) {
    script.chiefComplaintText.text = "Chief Complaint: " + patientData.chief_complaint;
  } else {
    script.chiefComplaintText.text = "";
  }

  // 4. Current symptoms
  if (patientData.current_symptoms && patientData.current_symptoms.length > 0) {
    var symptomsText = "Current Symptoms:\n";
    for (var i = 0; i < patientData.current_symptoms.length; i++) {
      symptomsText += "- " + patientData.current_symptoms[i] + "\n";
    }
    script.symptomsText.text = symptomsText;
  } else {
    script.symptomsText.text = "";
  }

  // 5. Vital signs
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

  // 6. Medications (Task 5.2)
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

  // 7. Diagnosis history (last 3 visits)
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

  // Task 5.6: Apply view mode filters
  applyViewMode(viewMode);

  // Task 5.4: Show card with fade-in animation (0.5s)
  fadeIn();

  // Task 5.5: Start auto-hide timer (10 seconds per FR-13)
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
      } else if (Array.isArray(value)) {
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

  // Task 5.5: Reset auto-hide timer on interaction
  startAutoHideTimer();
}

/**
 * Hide patient card with fade-out animation (Task 5.4)
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
 * Hide card immediately without animation
 */
function hideCardImmediate() {
  script.cardRootObject.enabled = false;
  isCardVisible = false;
  clearAutoHideTimer();
}

/**
 * Show patient card - manual recall from voice command (Task 5.5)
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
 * Show patient history view (Task 5.6)
 */
function showPatientHistory() {
  if (!currentPatientData) {
    print("ERROR: No patient data loaded");
    return;
  }

  renderPatientCard(currentPatientData, 'history');
}

/**
 * Show medications view (Task 5.6)
 */
function showMedications() {
  if (!currentPatientData) {
    print("ERROR: No patient data loaded");
    return;
  }

  renderPatientCard(currentPatientData, 'medications');
}

/**
 * Show allergies view - enlarged (Task 5.6)
 */
function showAllergies() {
  if (!currentPatientData) {
    print("ERROR: No patient data loaded");
    return;
  }

  renderPatientCard(currentPatientData, 'allergies');

  // Task 5.6: Enlarge allergy text for emphasis
  script.allergiesText.size = 28; // Larger than default 18-20pt
}

// --- Private Functions ---

/**
 * Apply view mode filters - Task 5.6
 * Show/hide specific sections based on mode
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

  // Task 5.6: Filter based on view mode
  switch (viewMode) {
    case 'history':
      // Show only name, details, and history
      allergiesObj.enabled = false;
      medicationsObj.enabled = false;
      vitalsObj.enabled = false;
      chiefComplaintObj.enabled = false;
      symptomsObj.enabled = false;
      break;

    case 'medications':
      // Show only name, details, and medications
      allergiesObj.enabled = false;
      historyObj.enabled = false;
      vitalsObj.enabled = false;
      chiefComplaintObj.enabled = false;
      symptomsObj.enabled = false;
      break;

    case 'allergies':
      // Show only name, details, and allergies (enlarged)
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
 * Fade in animation - Task 5.4 (0.5s per spec)
 */
function fadeIn() {
  clearFadeAnimation();

  script.cardRootObject.enabled = true;

  // Animate opacity from 0 to 1 over 0.5 seconds
  if (script.cardBackground) {
    var startOpacity = 0;
    var targetOpacity = 0.5; // Semi-transparent background
    var duration = 0.5; // 500ms
    var elapsed = 0;

    var fadeInEvent = script.createEvent("UpdateEvent");
    fadeInEvent.bind(function(eventData) {
      elapsed += eventData.getDeltaTime();
      var progress = Math.min(elapsed / duration, 1);

      // Ease-in-out interpolation
      var eased = progress < 0.5
        ? 2 * progress * progress
        : -1 + (4 - 2 * progress) * progress;

      var currentOpacity = startOpacity + (targetOpacity - startOpacity) * eased;

      if (script.cardBackground.mainPass) {
        var color = script.cardBackground.mainPass.baseColor;
        color.a = currentOpacity;
        script.cardBackground.mainPass.baseColor = color;
      }

      if (progress >= 1) {
        fadeInEvent.enabled = false;
      }
    });

    fadeAnimationTimer = fadeInEvent;
  }

  if (script.debugMode) {
    print("PatientCardRenderer: Fade in animation started (0.5s)");
  }
}

/**
 * Fade out animation - Task 5.4 (0.5s per spec)
 */
function fadeOut() {
  clearFadeAnimation();

  // Animate opacity from current to 0 over 0.5 seconds
  if (script.cardBackground) {
    var startOpacity = 0.5;
    var targetOpacity = 0;
    var duration = 0.5; // 500ms
    var elapsed = 0;

    var fadeOutEvent = script.createEvent("UpdateEvent");
    fadeOutEvent.bind(function(eventData) {
      elapsed += eventData.getDeltaTime();
      var progress = Math.min(elapsed / duration, 1);

      // Ease-in-out interpolation
      var eased = progress < 0.5
        ? 2 * progress * progress
        : -1 + (4 - 2 * progress) * progress;

      var currentOpacity = startOpacity + (targetOpacity - startOpacity) * eased;

      if (script.cardBackground.mainPass) {
        var color = script.cardBackground.mainPass.baseColor;
        color.a = currentOpacity;
        script.cardBackground.mainPass.baseColor = color;
      }

      if (progress >= 1) {
        script.cardRootObject.enabled = false;
        fadeOutEvent.enabled = false;
      }
    });

    fadeAnimationTimer = fadeOutEvent;
  } else {
    // Fallback: just hide immediately
    script.cardRootObject.enabled = false;
  }

  if (script.debugMode) {
    print("PatientCardRenderer: Fade out animation started (0.5s)");
  }
}

/**
 * Clear any active fade animation
 */
function clearFadeAnimation() {
  if (fadeAnimationTimer) {
    fadeAnimationTimer.enabled = false;
    fadeAnimationTimer = null;
  }
}

/**
 * Start auto-hide timer - Task 5.5 (10 seconds)
 */
function startAutoHideTimer() {
  clearAutoHideTimer();

  var hideDelay = script.createEvent("DelayedCallbackEvent");
  hideDelay.bind(function() {
    if (script.debugMode) {
      print("PatientCardRenderer: Auto-hide triggered after 10 seconds");
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
    autoHideTimer.enabled = false;
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

/**
 * Get current card state (for testing/debugging)
 */
function getCardState() {
  return {
    visible: isCardVisible,
    patientData: currentPatientData,
    viewMode: currentViewMode,
    position: script.cardTransform ? script.cardTransform.anchors.getCenter() : null,
    hasAutoHideTimer: autoHideTimer !== null
  };
}

// Initialize card on script start
initializeCard();

// Export functions for other scripts
script.renderPatientCard = renderPatientCard;
script.updateCardField = updateCardField;
script.hidePatientCard = hidePatientCard;
script.showPatientCard = showPatientCard;
script.showPatientHistory = showPatientHistory;
script.showMedications = showMedications;
script.showAllergies = showAllergies;
script.getCardState = getCardState;

print("PatientCardRenderer: Task Group 5 implementation complete");