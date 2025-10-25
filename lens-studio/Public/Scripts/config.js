/**
 * Shared Configuration for MedSnap Lens
 * Referenced by all Dev 2 scripts
 *
 * Task 2.0: Environment Setup - IMPLEMENTED
 */

// API Configuration
const API_BASE_URL = "http://localhost:3000/api"; // Updated to real backend after Dev 3 handoff

// AR Overlay Colors (per FR AR-1)
const AR_COLORS = {
  WARNING: new vec4(1, 0, 0, 1),      // Red #FF0000
  SUCCESS: new vec4(0, 1, 0, 1),      // Green #00FF00
  ALLERGY_TEXT: new vec4(1, 0, 0, 1), // Red for allergies
  CARD_BG: new vec4(0.1, 0.1, 0.1, 0.8), // Semi-transparent dark background
  PULSE_POINT: new vec4(0, 1, 1, 0.5), // Cyan #00FFFF, 50% opacity (Dev 4)
  DIRECTIONAL_ARROW: new vec4(1, 1, 0, 1) // Yellow #FFFF00 (Dev 4)
};

// Timeouts (per FR-27, FR-12a, ar_config)
const TIMEOUTS = {
  CLINICAL_MODE_INACTIVITY: 120000,  // 120s = 2 minutes (FR-12a)
  TRAINING_MODE_INACTIVITY: 10000,   // 10s (Dev 1)
  PATIENT_CARD_AUTO_HIDE: 10000,     // 10s (FR-13)
  PRESCRIPTION_UI_AUTO_HIDE: 5000,   // 5s (FR-26)
  IN_SESSION_SILENCE: 30000          // 30s (FR-27a)
};

// Typography (per FR AR-2)
const TYPOGRAPHY = {
  MIN_FONT_SIZE: 18,
  FONT_FAMILY: "sans-serif" // Roboto or system default
};

// Mode States
const MODE = {
  IDLE: "idle",
  TRAINING: "training",
  CLINICAL: "clinical"
};

// Clinical Mode States (Task 2.3)
const CLINICAL_STATE = {
  IDLE: "idle",
  LOADING_PATIENT: "loading_patient",
  PATIENT_LOADED: "patient_loaded",
  RECORDING_SYMPTOM: "recording_symptom",
  PRESCRIBING: "prescribing",
  SHOWING_HISTORY: "showing_history",
  SHOWING_MEDICATIONS: "showing_medications",
  SHOWING_ALLERGIES: "showing_allergies"
};

// Performance Targets (per FR-41, FR-42, FR-44)
const PERFORMANCE = {
  TARGET_FPS: 30,              // FR-41
  API_RESPONSE_MAX_MS: 3000,   // FR-42
  TTS_LATENCY_MAX_MS: 1500,    // FR-44
  TTS_CACHED_TARGET_MS: 500    // FR-44a
};

// Demo Mode
const DEMO_MODE = true; // Set to false after real backend integration

// Export for use in other scripts
global.MedSnapConfig = {
  API_BASE_URL,
  AR_COLORS,
  TIMEOUTS,
  TYPOGRAPHY,
  MODE,
  CLINICAL_STATE,
  PERFORMANCE,
  DEMO_MODE
};

print("MedSnap Config loaded - Task 2.0 complete");
