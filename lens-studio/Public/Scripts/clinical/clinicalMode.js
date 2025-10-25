/**
 * Dev 2 Task 2.3: Clinical Mode State Machine
 * State machine for clinical workflow
 *
 * TO BE IMPLEMENTED: Hours 18-30
 *
 * Responsibilities:
 * - Manage clinical mode states (IDLE, LOADING_PATIENT, PATIENT_LOADED, etc.)
 * - Process voice commands (FR-15)
 * - Handle patient load (FR-12, FR-14)
 * - Record symptoms (FR-15)
 * - Initiate prescription workflow (FR-21)
 * - Inactivity timeout (FR-12a - 120s)
 * - Integration with Dev 1's voice router (after Hour 12)
 */

// @input Component.ScriptComponent modeManager
// @input Component.ScriptComponent patientCardRenderer
// @input Component.ScriptComponent prescriptionUI
// @input bool debugMode = true

// Get config
const config = global.MedSnapConfig;

if (!config) {
  print("ERROR: MedSnapConfig not loaded. Ensure config.js runs first.");
} else {
  print("ClinicalMode loaded - awaiting Task 2.3 implementation");

  if (script.debugMode) {
    print("Debug: Clinical states: " + JSON.stringify(config.CLINICAL_STATE));
    print("Debug: Inactivity timeout: " + config.TIMEOUTS.CLINICAL_MODE_INACTIVITY + "ms");
  }
}

// Placeholder state
var currentState = config ? config.CLINICAL_STATE.IDLE : "idle";
var inactivityTimer = null;
var currentPatient = null;

// Placeholder functions - to be implemented in Task 2.3
function startClinicalMode(patientName) {
  if (script.debugMode) {
    print("ClinicalMode: startClinicalMode called");
    print("ClinicalMode: Patient name: " + patientName);
  }

  // TODO Task 2.3: Implement clinical mode start
  // - Switch to CLINICAL mode via modeManager
  // - Change state to LOADING_PATIENT
  // - Call backend API to load patient
  // - On success: renderPatientCard, change state to PATIENT_LOADED
  // - On failure: show error, retry logic per FR-14a
  // - Start inactivity timer (120s per FR-12a)

  currentState = config.CLINICAL_STATE.LOADING_PATIENT;

  print("ClinicalMode: Clinical mode started for " + patientName + " (placeholder)");
}

function endClinicalMode() {
  if (script.debugMode) {
    print("ClinicalMode: endClinicalMode called");
  }

  // TODO Task 2.3: Implement clinical mode exit
  // - Hide patient card
  // - Clear patient data
  // - Cancel inactivity timer
  // - Switch to IDLE mode via modeManager
  // - TTS confirmation: "Assessment complete." (FR-12a)

  currentState = config.CLINICAL_STATE.IDLE;
  currentPatient = null;

  print("ClinicalMode: Clinical mode ended (placeholder)");
}

function processVoiceCommand(command, parameters) {
  if (script.debugMode) {
    print("ClinicalMode: processVoiceCommand called");
    print("ClinicalMode: Command: " + command);
    print("ClinicalMode: Parameters: " + JSON.stringify(parameters));
  }

  // TODO Task 2.3: Implement voice command processing
  // Commands (per FR-15):
  // - "start assessment [patient name]" -> startClinicalMode()
  // - "end assessment" -> endClinicalMode()
  // - "record symptom" -> recordSymptom()
  // - "show patient history" -> showHistory()
  // - "show medications" -> showMedications()
  // - "show allergies" -> showAllergies()
  // - "prescribe [med] [dose]" -> initiatePrescription()

  print("ClinicalMode: Command '" + command + "' processed (placeholder)");
}

function recordSymptom(symptomDescription) {
  if (script.debugMode) {
    print("ClinicalMode: recordSymptom called");
    print("ClinicalMode: Symptom: " + symptomDescription);
  }

  // TODO Task 2.3: Implement symptom recording
  // - Change state to RECORDING_SYMPTOM
  // - Call backend API: POST /api/clinical/symptom/record
  // - TTS confirmation: "Symptom recorded" (FR-15)
  // - Reset inactivity timer

  print("ClinicalMode: Symptom recorded (placeholder)");
}

function initiatePrescription(medication, dosage) {
  if (script.debugMode) {
    print("ClinicalMode: initiatePrescription called");
    print("ClinicalMode: Medication: " + medication + ", Dosage: " + dosage);
  }

  // TODO Task 2.3: Implement prescription initiation
  // - Change state to PRESCRIBING
  // - Call backend API: POST /api/clinical/prescription/create
  // - On success: prescriptionUI.showSuccess()
  // - On drug interaction: prescriptionUI.showWarning()
  // - Reset inactivity timer

  print("ClinicalMode: Prescription initiated for " + medication + " " + dosage + " (placeholder)");
}

function showMedications() {
  if (script.debugMode) {
    print("ClinicalMode: showMedications called");
  }

  // TODO Task 2.3: Implement medications display
  // - Change state to SHOWING_MEDICATIONS
  // - Re-render patient card with medications highlighted
  // - Reset inactivity timer

  print("ClinicalMode: Medications shown (placeholder)");
}

function showAllergies() {
  if (script.debugMode) {
    print("ClinicalMode: showAllergies called");
  }

  // TODO Task 2.3: Implement allergies display
  // - Change state to SHOWING_ALLERGIES
  // - Re-render patient card with allergies highlighted (RED)
  // - Reset inactivity timer

  print("ClinicalMode: Allergies shown (placeholder)");
}

// Export functions for other scripts
script.startClinicalMode = startClinicalMode;
script.endClinicalMode = endClinicalMode;
script.processVoiceCommand = processVoiceCommand;
script.recordSymptom = recordSymptom;
script.initiatePrescription = initiatePrescription;
script.showMedications = showMedications;
script.showAllergies = showAllergies;
