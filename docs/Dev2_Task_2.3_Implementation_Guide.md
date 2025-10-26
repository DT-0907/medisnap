# Dev 2 Task 2.3: Clinical Mode State Machine - Implementation Guide

**Duration:** Hours 18-30 (12 hours)
**Prerequisites:** Task 2.0 (Environment), Task 2.1 (Mode Manager), Task 2.2 (Patient Card Renderer)
**Branch:** `dev-2-clinical`

---

## Table of Contents
1. [Overview](#overview)
2. [Architectural Decisions](#architectural-decisions)
3. [State Machine Design](#state-machine-design)
4. [Voice Command Processing](#voice-command-processing)
5. [Patient Lookup & Retry Logic](#patient-lookup--retry-logic)
6. [Symptom Recording](#symptom-recording)
7. [Decision Support Integration](#decision-support-integration)
8. [Vital Sign Reading](#vital-sign-reading)
9. [View Mode Management](#view-mode-management)
10. [Auto-Exit & Inactivity](#auto-exit--inactivity)
11. [TDD Workflow](#tdd-workflow)
12. [Test Cases](#test-cases)
13. [Implementation Details](#implementation-details)
14. [Edge Cases](#edge-cases)
15. [Integration Points](#integration-points)

---

## Overview

Task 2.3 implements the **Clinical Mode State Machine**, the orchestration layer that coordinates patient assessment workflows. This component:

- Manages state transitions throughout the clinical workflow
- Processes all FR-15 voice commands
- Integrates with patient card renderer (Task 2.2)
- Prepares for prescription UI integration (Task 2.4)
- Coordinates with mode manager (Task 2.1) for mode switching
- Handles auto-exit after 120s inactivity (FR-12a)

**Key Requirements:**
- FR-12: Clinical mode activation via voice
- FR-12a: Auto-exit after 2 minutes inactivity
- FR-12b: Direct mode switching auto-exits current mode
- FR-13: Patient card display upon load
- FR-14: Patient lookup with "not found" handling
- FR-14a: Up to 3 retry attempts before showing patient list
- FR-15: All in-session voice commands
- FR-16/FR-17: Vital sign OCR with fallback
- FR-17a: 3 OCR retry attempts before manual entry
- FR-18: Decision support after symptom recording

---

## Architectural Decisions

### Architecture Pattern: **Reactive State Machine**

After analyzing the existing codebase, I recommend a **Reactive State Machine** pattern:

**Why This Pattern:**
1. **Existing Infrastructure:** Mode Manager (Task 2.1) already handles high-level mode switching
2. **Patient Card Integration:** Task 2.2 provides self-contained rendering methods
3. **Separation of Concerns:** Clinical mode orchestrates, components handle their own state
4. **Testability:** Pure functions for state transitions, side effects isolated

**Key Principles:**
```javascript
// Clinical Mode ORCHESTRATES but doesn't OWN everything
// - Mode Manager owns: IDLE vs TRAINING vs CLINICAL
// - Clinical Mode owns: Clinical workflow states (LOADING_PATIENT, PATIENT_LOADED, etc.)
// - Patient Card Renderer owns: What's displayed and view modes
// - Prescription UI owns: Prescription workflow UI

// Clinical Mode COORDINATES:
clinicalMode.startAssessment() → modeManager.switchMode('clinical') → patientCard.render()
```

### State Ownership

| Component | Owns | Doesn't Own |
|-----------|------|-------------|
| **Mode Manager** | Top-level mode (IDLE/TRAINING/CLINICAL), inactivity timer for mode | Clinical workflow states |
| **Clinical Mode** | Clinical workflow state (LOADING_PATIENT, PATIENT_LOADED, RECORDING_SYMPTOM, PRESCRIBING), patient data cache | View modes, rendering details |
| **Patient Card** | View mode (all/history/medications/allergies), rendering state, auto-hide timer | Clinical workflow state |
| **Prescription UI** | Prescription workflow UI state | Patient data |

---

## State Machine Design

### Clinical Workflow States

```javascript
CLINICAL_STATE = {
  IDLE: 'idle',                      // Not in clinical mode (mode manager is IDLE or TRAINING)
  LOADING_PATIENT: 'loading_patient', // API call in progress
  PATIENT_LOADED: 'patient_loaded',   // Patient data ready, card displayed
  RECORDING_SYMPTOM: 'recording_symptom', // Symptom being recorded
  PRESCRIBING: 'prescribing',        // Prescription workflow active
  SHOWING_HISTORY: 'showing_history', // History view active (optional state)
  SHOWING_MEDICATIONS: 'showing_medications', // Medications view active (optional state)
  SHOWING_ALLERGIES: 'showing_allergies' // Allergies view active (optional state)
}
```

### State Transition Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLINICAL MODE                            │
└─────────────────────────────────────────────────────────────────┘

    [Voice: "start assessment Sarah Chen"]
                    │
                    ▼
            LOADING_PATIENT
            (API call to /api/clinical/patient/load)
                    │
        ┌───────────┴───────────┐
        │                       │
    SUCCESS                  FAIL
        │                       │
        ▼                       ▼
   PATIENT_LOADED      Retry (up to 3 times)
   (Show patient card)        │
        │                     │
        │                  After 3 fails
        │                     │
        │                     ▼
        │             Show patient list OR cancel
        │                     │
        │                     └──────────────────┐
        │                                        │
        ├────── "record symptom" ────────────────▶ RECORDING_SYMPTOM
        │                                         (API call + TTS confirm)
        │                                                 │
        │                                                 ▼
        │                                        Decision Support
        │                                        (FR-18 - optional auto-trigger)
        │                                                 │
        │ ◀───────────────────────────────────────────────┘
        │
        ├────── "prescribe [med] [dose]" ─────────▶ PRESCRIBING
        │                                         (Hand off to prescriptionUI)
        │                                                 │
        │ ◀───────────────────────────────────────────────┘
        │
        ├────── "show medications" ──────────────▶ SHOWING_MEDICATIONS
        │                                         (patientCard.showMedications())
        │                                                 │
        │ ◀───────────────────────────────────────────────┘
        │
        ├────── "show allergies" ────────────────▶ SHOWING_ALLERGIES
        │                                         (patientCard.showAllergies())
        │                                                 │
        │ ◀───────────────────────────────────────────────┘
        │
        ├────── "show patient history" ─────────▶ SHOWING_HISTORY
        │                                         (patientCard.showPatientHistory())
        │                                                 │
        │ ◀───────────────────────────────────────────────┘
        │
        ├────── "repeat instructions" ──────────▶ (Replay last TTS)
        │
        ├────── "end assessment" ────────────────▶ IDLE
        │                                         (modeManager.exitCurrentMode())
        │
        └────── [120s inactivity] ───────────────▶ IDLE
                                                  (Auto-exit + TTS: "Assessment complete.")
```

### View Mode States (Separate from Clinical State)

**Important:** `SHOWING_HISTORY`, `SHOWING_MEDICATIONS`, `SHOWING_ALLERGIES` are **OPTIONAL** states for tracking what view is active. Alternatively, we can just remain in `PATIENT_LOADED` state and let the patient card renderer track its own view mode.

**Recommended Approach:**
- Clinical state remains `PATIENT_LOADED`
- Patient card internally switches between view modes
- Clinical mode just calls `patientCardRenderer.showMedications()` etc.

**This keeps clinical mode simpler and respects component boundaries.**

---

## Voice Command Processing

### FR-15 Voice Commands

| Command | Parameters | Action | Wake Word Required? |
|---------|-----------|--------|---------------------|
| `"Hey MedSnap, start assessment [patient name]"` | patient name | `startAssessment(name)` | ✅ YES (session-initiating) |
| `"record symptom [description]"` | symptom description | `recordSymptom(desc)` | ❌ NO (in-session) |
| `"show patient history"` | none | `showPatientHistory()` | ❌ NO |
| `"show medications"` | none | `showMedications()` | ❌ NO |
| `"show allergies"` | none | `showAllergies()` | ❌ NO |
| `"prescribe [medication] [dosage]"` | med, dosage | `initiatePrescription(med, dose)` | ❌ NO |
| `"repeat instructions"` | none | `repeatLastTTS()` | ❌ NO |
| `"Hey MedSnap, end assessment"` | none | `endAssessment()` | ✅ YES (session-ending) |

### Voice Command Processing Flow

```javascript
// Dev 1 (voice router) will call this function
function processVoiceCommand(command, parameters) {
  // Reset inactivity timer on ANY voice command
  resetInactivityTimer();

  switch (command) {
    case 'start_assessment':
      startAssessment(parameters.patientName);
      break;
    case 'record_symptom':
      recordSymptom(parameters.description);
      break;
    case 'show_history':
      showPatientHistory();
      break;
    case 'show_medications':
      showMedications();
      break;
    case 'show_allergies':
      showAllergies();
      break;
    case 'prescribe':
      initiatePrescription(parameters.medication, parameters.dosage);
      break;
    case 'repeat_instructions':
      repeatLastTTS();
      break;
    case 'end_assessment':
      endAssessment();
      break;
    default:
      print("ERROR: Unknown command: " + command);
  }
}
```

**Integration with Dev 1:**
- Dev 1's voice router will parse the raw speech-to-text
- Dev 1 calls `clinicalMode.processVoiceCommand(command, parameters)`
- Clinical mode handles the command and updates state

---

## Patient Lookup & Retry Logic

### FR-14a: 3-Retry Attempts

```javascript
var patientLookupAttempts = 0;
var MAX_PATIENT_LOOKUP_ATTEMPTS = 3;

function startAssessment(patientName) {
  // Switch to clinical mode first
  if (script.modeManager && script.modeManager.getCurrentMode() !== 'clinical') {
    script.modeManager.switchMode('clinical');
  }

  // Reset retry counter
  patientLookupAttempts = 0;

  // Start lookup
  lookupPatient(patientName);
}

function lookupPatient(patientName) {
  currentState = config.CLINICAL_STATE.LOADING_PATIENT;

  // Call backend API (or demo mode)
  if (config.DEMO_MODE) {
    // Demo mode: synchronous lookup
    var demoPatient = getDemoPatient(patientName);
    if (demoPatient) {
      onPatientLoaded(demoPatient);
    } else {
      onPatientNotFound(patientName);
    }
  } else {
    // Real mode: async API call
    callPatientLoadAPI(patientName, onPatientLoaded, onPatientNotFound);
  }
}

function onPatientNotFound(patientName) {
  patientLookupAttempts++;

  if (patientLookupAttempts < MAX_PATIENT_LOOKUP_ATTEMPTS) {
    // Retry: ask user to repeat name
    speakMessage("Patient not found. Please repeat patient name.");
    // Wait for next voice command with patient name
  } else {
    // After 3 failures: offer patient list or cancel
    speakMessage("Patient not found after 3 attempts. Say 'show patient list' or 'cancel assessment'.");
    // Wait for user decision
  }
}

function showPatientList() {
  // Show list of all patients in AR
  // User can then say "Select patient [name]" or "Select patient 2"
  speakMessage("Available patients: Sarah Chen, Robert Martinez, Emily Watson. Say 'select patient' followed by the name.");
}

function cancelAssessment() {
  speakMessage("Assessment cancelled.");
  endAssessment();
}
```

**Edge Cases:**
- **Empty patient name:** Treat as not found, count as attempt
- **Patient name with typo:** Fuzzy matching (optional - simple MVP just exact match)
- **Network timeout:** Count as failed attempt, retry

---

## Symptom Recording

### FR-15: Record Symptom Command

```javascript
var sessionSymptoms = []; // In-memory symptom list for current session

function recordSymptom(symptomDescription) {
  if (currentState !== config.CLINICAL_STATE.PATIENT_LOADED) {
    print("ERROR: Cannot record symptom. No patient loaded.");
    speakMessage("Please load a patient first.");
    return;
  }

  currentState = config.CLINICAL_STATE.RECORDING_SYMPTOM;

  // Add to session symptoms
  sessionSymptoms.push({
    description: symptomDescription,
    timestamp: new Date().toISOString()
  });

  // Call backend API to persist
  if (config.DEMO_MODE) {
    // Demo mode: immediate success
    onSymptomRecorded(symptomDescription);
  } else {
    // Real mode: API call
    callSymptomRecordAPI(currentPatient.id, symptomDescription, onSymptomRecorded, onSymptomRecordFailed);
  }
}

function onSymptomRecorded(symptomDescription) {
  // TTS confirmation
  speakMessage("Symptom recorded: " + symptomDescription);

  // Return to patient loaded state
  currentState = config.CLINICAL_STATE.PATIENT_LOADED;

  // FR-18: Auto-trigger decision support (OPTIONAL)
  // Uncomment if decision support should be automatic:
  // requestDecisionSupport();
}

function onSymptomRecordFailed(error) {
  print("ERROR: Failed to record symptom: " + error);
  speakMessage("Failed to record symptom. Please try again.");
  currentState = config.CLINICAL_STATE.PATIENT_LOADED;
}
```

**Symptom Recording Patterns:**

**Pattern 1: Immediate Recording (Recommended for MVP)**
- User says: `"record symptom persistent cough and fever"`
- System immediately records "persistent cough and fever"

**Pattern 2: Prompted Recording (More conversational, but slower)**
- User says: `"record symptom"`
- System asks: `"What symptom?"`
- User says: `"persistent cough and fever"`
- System records

**Recommendation:** Use Pattern 1 for speed. User can always say "repeat instructions" if they forget the format.

---

## Decision Support Integration

### FR-18: Clinical Suggestions After Symptoms

```javascript
function requestDecisionSupport() {
  if (sessionSymptoms.length === 0) {
    speakMessage("No symptoms recorded yet. Record symptoms first.");
    return;
  }

  // Build context for AI
  var decisionSupportContext = {
    patient_id: currentPatient.id,
    patient_name: currentPatient.name,
    age: currentPatient.age,
    sex: currentPatient.sex,
    allergies: currentPatient.allergies,
    medications: currentPatient.medications,
    current_vitals: currentPatient.current_vitals,
    symptoms: sessionSymptoms.map(s => s.description),
    diagnosis_history: currentPatient.diagnosis_history
  };

  if (config.DEMO_MODE) {
    // Demo mode: return mock decision support
    onDecisionSupportReceived(getDemoDecisionSupport());
  } else {
    // Real mode: API call
    callDecisionSupportAPI(decisionSupportContext, onDecisionSupportReceived, onDecisionSupportFailed);
  }
}

function onDecisionSupportReceived(decisionSupport) {
  // decisionSupport format:
  // {
  //   possible_diagnoses: [{diagnosis: "URI", confidence: 0.8}, ...],
  //   recommendations: ["Check for wheezing", "Monitor O2 saturation"],
  //   warnings: ["High fever requires immediate attention"],
  //   tts_response: "Symptoms suggest upper respiratory infection...",
  //   tts_audio_url: "/audio/decision_support_123.mp3"
  // }

  // Speak the AI's clinical suggestion
  speakMessage(decisionSupport.tts_response);

  // Optionally display recommendations in AR (future enhancement)
  // displayDecisionSupport(decisionSupport);
}

function onDecisionSupportFailed(error) {
  print("ERROR: Decision support failed: " + error);
  speakMessage("Unable to retrieve clinical suggestions. Continuing assessment.");
}
```

**When to Trigger Decision Support:**

**Option A: Automatic (after each symptom)**
- Pro: Proactive, user doesn't forget
- Con: Could get repetitive if multiple symptoms

**Option B: Automatic (after first symptom only)**
- Pro: Provides guidance early
- Con: Might miss new insights from additional symptoms

**Option C: Manual (user requests)**
- Pro: User control
- Con: User might forget to request it

**Option D: Automatic (after 2+ symptoms or on demand)**
- Pro: Balance of automatic and manual

**Recommendation for MVP:** **Option C - Manual request** via voice command `"get recommendations"` or `"decision support"`. This gives user control and reduces API calls during demo.

**For comprehensive guide:** Show Option D (automatic after 2 symptoms, also manual).

---

## Vital Sign Reading

### FR-16/FR-17: OCR with Fallback

```javascript
var vitalSignOCRAttempts = 0;
var MAX_OCR_ATTEMPTS = 2; // FR-17a: retry once, so 2 total attempts

function initiateVitalSignOCR() {
  if (currentState !== config.CLINICAL_STATE.PATIENT_LOADED) {
    print("ERROR: Cannot read vitals. No patient loaded.");
    return;
  }

  vitalSignOCRAttempts = 0;
  attemptVitalSignOCR();
}

function attemptVitalSignOCR() {
  vitalSignOCRAttempts++;

  print("ClinicalMode: OCR attempt " + vitalSignOCRAttempts + " of " + MAX_OCR_ATTEMPTS);

  // Call CV service for OCR (Dev 4's work)
  // For now, this is a placeholder
  if (config.DEMO_MODE) {
    // Demo mode: simulate random success/failure
    var ocrSuccess = Math.random() > 0.5; // 50% success rate for demo
    if (ocrSuccess) {
      onVitalSignOCRSuccess({
        bp: "120/80",
        hr: 75,
        o2: 98,
        temp: 98.6
      });
    } else {
      onVitalSignOCRFailure();
    }
  } else {
    // Real mode: call CV service
    callVitalSignOCRAPI(onVitalSignOCRSuccess, onVitalSignOCRFailure);
  }
}

function onVitalSignOCRSuccess(vitals) {
  print("ClinicalMode: OCR success - vitals read");

  // Update patient's current vitals
  currentPatient.current_vitals = vitals;

  // Update patient card
  if (script.patientCardRenderer) {
    script.patientCardRenderer.updateCardField('vitals', vitals);
  }

  // TTS confirmation
  speakMessage("Vital signs recorded: Blood pressure " + vitals.bp + ", heart rate " + vitals.hr);
}

function onVitalSignOCRFailure() {
  if (vitalSignOCRAttempts < MAX_OCR_ATTEMPTS) {
    // Retry after 2-second delay (FR-17a)
    var retryDelay = script.createEvent("DelayedCallbackEvent");
    retryDelay.bind(function() {
      print("ClinicalMode: Retrying OCR...");
      attemptVitalSignOCR();
    });
    retryDelay.reset(2); // 2 seconds
  } else {
    // Skip OCR, offer manual entry
    print("ClinicalMode: OCR failed after " + MAX_OCR_ATTEMPTS + " attempts. Skipping to manual entry.");
    speakMessage("Unable to read vital signs monitor. Say 'record vitals manually' or continue without vitals.");
  }
}

function recordVitalsManually(vitalsVoiceInput) {
  // Parse voice input like: "blood pressure 120 over 80, heart rate 75, oxygen 98, temperature 98.6"
  // This is SIMPLIFIED parsing for MVP

  var vitals = parseVitalsFromVoice(vitalsVoiceInput);

  if (vitals) {
    currentPatient.current_vitals = vitals;

    // Update patient card
    if (script.patientCardRenderer) {
      script.patientCardRenderer.updateCardField('vitals', vitals);
    }

    speakMessage("Vital signs recorded manually.");
  } else {
    speakMessage("Could not understand vital signs. Please repeat.");
  }
}

function parseVitalsFromVoice(input) {
  // SIMPLIFIED parser for demo
  // Example input: "BP 120/80 HR 75 O2 98"

  var vitals = {};

  // Extract BP (e.g., "120/80" or "120 over 80")
  var bpMatch = input.match(/(\d{2,3})\s*(\/|over)\s*(\d{2,3})/i);
  if (bpMatch) {
    vitals.bp = bpMatch[1] + "/" + bpMatch[3];
  }

  // Extract HR (e.g., "HR 75" or "heart rate 75")
  var hrMatch = input.match(/hr|heart\s*rate\s*(\d{2,3})/i);
  if (hrMatch) {
    vitals.hr = parseInt(hrMatch[1]);
  }

  // Extract O2 (e.g., "O2 98" or "oxygen 98")
  var o2Match = input.match(/o2|oxygen\s*(\d{2,3})/i);
  if (o2Match) {
    vitals.o2 = parseInt(o2Match[1]);
  }

  // Extract temp (e.g., "temp 98.6" or "temperature 98.6")
  var tempMatch = input.match(/temp|temperature\s*(\d{2,3}\.?\d?)/i);
  if (tempMatch) {
    vitals.temp = parseFloat(tempMatch[1]);
  }

  // Return null if no vitals were parsed
  if (Object.keys(vitals).length === 0) {
    return null;
  }

  return vitals;
}
```

**Vital Sign Reading is OPTIONAL for MVP:**
- If time is limited, skip OCR implementation
- Just use manual entry as the primary method
- OCR can be added later by Dev 4

**For comprehensive guide:** Include OCR with fallback, but mark as optional.

---

## View Mode Management

### Integration with Patient Card Renderer (Task 2.2)

```javascript
function showPatientHistory() {
  if (currentState !== config.CLINICAL_STATE.PATIENT_LOADED) {
    print("ERROR: Cannot show history. No patient loaded.");
    return;
  }

  // Call patient card renderer to switch view mode
  if (script.patientCardRenderer) {
    script.patientCardRenderer.showPatientHistory();
  }

  // Optional: track state for internal tracking
  // currentState = config.CLINICAL_STATE.SHOWING_HISTORY;

  // Reset inactivity timer (user is active)
  resetInactivityTimer();
}

function showMedications() {
  if (currentState !== config.CLINICAL_STATE.PATIENT_LOADED) {
    print("ERROR: Cannot show medications. No patient loaded.");
    return;
  }

  if (script.patientCardRenderer) {
    script.patientCardRenderer.showMedications();
  }

  resetInactivityTimer();
}

function showAllergies() {
  if (currentState !== config.CLINICAL_STATE.PATIENT_LOADED) {
    print("ERROR: Cannot show allergies. No patient loaded.");
    return;
  }

  if (script.patientCardRenderer) {
    script.patientCardRenderer.showAllergies();
  }

  resetInactivityTimer();
}
```

**Key Point:** Clinical mode just delegates to patient card renderer. No need to track separate `SHOWING_*` states unless you want fine-grained state tracking for debugging.

---

## Auto-Exit & Inactivity

### FR-12a: 120-Second Inactivity Timer

**Important:** Mode Manager (Task 2.1) ALREADY handles the 120-second inactivity timer. Clinical mode just needs to reset it on user activity.

```javascript
function resetInactivityTimer() {
  // Delegate to mode manager
  if (script.modeManager && script.modeManager.resetInactivityTimer) {
    script.modeManager.resetInactivityTimer();

    if (script.debugMode) {
      print("ClinicalMode: Inactivity timer reset");
    }
  }
}

// Mode manager will call exitCurrentMode() after 120s inactivity
// Mode manager speaks "Assessment complete." (FR-12a)
// We just need to clean up our internal state

function onModeExited() {
  // Called by mode manager when exiting clinical mode
  // Clean up clinical mode state
  currentState = config.CLINICAL_STATE.IDLE;
  currentPatient = null;
  sessionSymptoms = [];
  patientLookupAttempts = 0;
  vitalSignOCRAttempts = 0;
  lastTTSMessage = null;

  // Hide patient card
  if (script.patientCardRenderer) {
    script.patientCardRenderer.hidePatientCard();
  }

  if (script.debugMode) {
    print("ClinicalMode: Cleaned up state after mode exit");
  }
}
```

**What Counts as Activity:**
- Any voice command (automatically handled by `processVoiceCommand()`)
- View mode changes (handled by `showMedications()`, etc.)
- Symptom recording
- Prescription requests

**What Does NOT Reset Timer:**
- System TTS playback
- Decision support responses
- Patient card auto-hide (10s timer is separate)

---

## TDD Workflow

### Step-by-Step TDD Process

**2.3.1 - WRITE TESTS FIRST** (3 hours)

Create `backend/tests/unit/clinicalMode.test.js`:

```javascript
/**
 * Unit Tests for Clinical Mode State Machine (Task 2.3)
 * Test-Driven Development (TDD) - Step 1: Write Tests First
 */

describe('Clinical Mode State Machine', () => {
  let clinicalMode;
  let mockModeManager;
  let mockPatientCardRenderer;
  let mockPrescriptionUI;

  beforeEach(() => {
    // Mock dependencies
    mockModeManager = {
      switchMode: jest.fn(),
      getCurrentMode: jest.fn().mockReturnValue('idle'),
      resetInactivityTimer: jest.fn()
    };

    mockPatientCardRenderer = {
      renderPatientCard: jest.fn(),
      hidePatientCard: jest.fn(),
      showPatientHistory: jest.fn(),
      showMedications: jest.fn(),
      showAllergies: jest.fn(),
      updateCardField: jest.fn()
    };

    mockPrescriptionUI = {
      initiatePrescription: jest.fn()
    };

    const ClinicalMode = require('../../lens-studio-mock/clinicalMode');
    clinicalMode = new ClinicalMode(mockModeManager, mockPatientCardRenderer, mockPrescriptionUI);
  });

  describe('Patient Lookup', () => {
    test('1: startAssessment() calls mode manager to switch to clinical', () => {
      clinicalMode.startAssessment('Sarah Chen');

      expect(mockModeManager.switchMode).toHaveBeenCalledWith('clinical');
    });

    test('2: onPatientLoaded() displays patient card with all data', () => {
      const patientData = {
        name: 'Sarah Chen',
        age: 34,
        allergies: ['Penicillin']
      };

      clinicalMode.onPatientLoaded(patientData);

      expect(mockPatientCardRenderer.renderPatientCard).toHaveBeenCalledWith(patientData, 'all');
      expect(clinicalMode.getCurrentState()).toBe('patient_loaded');
    });

    test('3: onPatientNotFound() speaks error message', () => {
      const speakSpy = jest.spyOn(clinicalMode, 'speakMessage');

      clinicalMode.onPatientNotFound('Unknown Patient');

      expect(speakSpy).toHaveBeenCalledWith('Patient not found. Please repeat patient name.');
    });

    test('4: retryPatientLookup() allows up to 3 attempts (FR-14a)', () => {
      const speakSpy = jest.spyOn(clinicalMode, 'speakMessage');

      // Attempt 1
      clinicalMode.onPatientNotFound('Unknown');
      expect(speakSpy).toHaveBeenCalledWith('Patient not found. Please repeat patient name.');

      // Attempt 2
      clinicalMode.onPatientNotFound('Unknown');
      expect(speakSpy).toHaveBeenCalledWith('Patient not found. Please repeat patient name.');

      // Attempt 3
      clinicalMode.onPatientNotFound('Unknown');
      expect(speakSpy).toHaveBeenCalledWith(expect.stringContaining('show patient list'));
    });

    test('5: offerPatientList() after 3 failed attempts', () => {
      const speakSpy = jest.spyOn(clinicalMode, 'speakMessage');

      // Fail 3 times
      clinicalMode.onPatientNotFound('Unknown');
      clinicalMode.onPatientNotFound('Unknown');
      clinicalMode.onPatientNotFound('Unknown');

      // Should offer patient list
      expect(speakSpy).toHaveBeenLastCalledWith(expect.stringContaining('show patient list'));
    });

    test('6: cancelAssessment() exits clinical mode gracefully', () => {
      clinicalMode.startAssessment('Sarah Chen');
      clinicalMode.cancelAssessment();

      expect(clinicalMode.getCurrentState()).toBe('idle');
      expect(mockPatientCardRenderer.hidePatientCard).toHaveBeenCalled();
    });
  });

  describe('Symptom Recording', () => {
    test('7: recordSymptom() adds symptom to session', () => {
      // Load patient first
      clinicalMode.onPatientLoaded({ name: 'Sarah Chen' });

      clinicalMode.recordSymptom('Persistent cough');

      const symptoms = clinicalMode.getSessionSymptoms();
      expect(symptoms).toContainEqual(expect.objectContaining({
        description: 'Persistent cough'
      }));
    });

    test('8: recordSymptom() calls backend API', () => {
      const apiSpy = jest.spyOn(clinicalMode, 'callSymptomRecordAPI');

      clinicalMode.onPatientLoaded({ id: 'DEMO_001', name: 'Sarah Chen' });
      clinicalMode.recordSymptom('Fever');

      expect(apiSpy).toHaveBeenCalledWith(
        'DEMO_001',
        'Fever',
        expect.any(Function),
        expect.any(Function)
      );
    });

    test('9: recordSymptom() resets inactivity timer', () => {
      clinicalMode.onPatientLoaded({ name: 'Sarah Chen' });
      clinicalMode.recordSymptom('Headache');

      expect(mockModeManager.resetInactivityTimer).toHaveBeenCalled();
    });
  });

  describe('View Mode Commands', () => {
    test('10: showPatientHistory() calls patient card renderer', () => {
      clinicalMode.onPatientLoaded({ name: 'Sarah Chen' });
      clinicalMode.showPatientHistory();

      expect(mockPatientCardRenderer.showPatientHistory).toHaveBeenCalled();
    });

    test('11: showMedications() calls patient card renderer', () => {
      clinicalMode.onPatientLoaded({ name: 'Sarah Chen' });
      clinicalMode.showMedications();

      expect(mockPatientCardRenderer.showMedications).toHaveBeenCalled();
    });

    test('12: showAllergies() calls patient card renderer', () => {
      clinicalMode.onPatientLoaded({ name: 'Sarah Chen' });
      clinicalMode.showAllergies();

      expect(mockPatientCardRenderer.showAllergies).toHaveBeenCalled();
    });
  });

  describe('Repeat Instructions', () => {
    test('13: repeatInstructions() replays last TTS message (FR-15)', () => {
      const speakSpy = jest.spyOn(clinicalMode, 'speakMessage');

      // First message
      clinicalMode.speakMessage('Patient loaded.');
      speakSpy.mockClear();

      // Repeat
      clinicalMode.repeatInstructions();

      expect(speakSpy).toHaveBeenCalledWith('Patient loaded.');
    });
  });

  describe('Decision Support', () => {
    test('14: requestDecisionSupport() calls backend with symptoms', () => {
      const apiSpy = jest.spyOn(clinicalMode, 'callDecisionSupportAPI');

      clinicalMode.onPatientLoaded({ id: 'DEMO_001', name: 'Sarah Chen' });
      clinicalMode.recordSymptom('Cough');
      clinicalMode.recordSymptom('Fever');

      clinicalMode.requestDecisionSupport();

      expect(apiSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          symptoms: expect.arrayContaining(['Cough', 'Fever'])
        }),
        expect.any(Function),
        expect.any(Function)
      );
    });

    test('15: displayDecisionSupport() speaks AI recommendations', () => {
      const speakSpy = jest.spyOn(clinicalMode, 'speakMessage');

      const decisionSupport = {
        tts_response: 'Symptoms suggest upper respiratory infection.',
        possible_diagnoses: [{ diagnosis: 'URI', confidence: 0.8 }]
      };

      clinicalMode.displayDecisionSupport(decisionSupport);

      expect(speakSpy).toHaveBeenCalledWith('Symptoms suggest upper respiratory infection.');
    });
  });

  describe('Vital Sign Reading', () => {
    test('16: initiateVitalSignOCR() attempts OCR reading', () => {
      const ocrSpy = jest.spyOn(clinicalMode, 'attemptVitalSignOCR');

      clinicalMode.onPatientLoaded({ name: 'Sarah Chen' });
      clinicalMode.initiateVitalSignOCR();

      expect(ocrSpy).toHaveBeenCalled();
    });

    test('17: skipOCROnFailure() allows manual entry after 2 failures (FR-17a)', () => {
      jest.useFakeTimers();
      const speakSpy = jest.spyOn(clinicalMode, 'speakMessage');

      clinicalMode.onPatientLoaded({ name: 'Sarah Chen' });

      // Fail twice
      clinicalMode.onVitalSignOCRFailure();
      jest.advanceTimersByTime(2000);
      clinicalMode.onVitalSignOCRFailure();

      expect(speakSpy).toHaveBeenLastCalledWith(expect.stringContaining('record vitals manually'));

      jest.useRealTimers();
    });

    test('18: recordVitalsManually() accepts voice input', () => {
      clinicalMode.onPatientLoaded({ name: 'Sarah Chen' });
      clinicalMode.recordVitalsManually('BP 120/80 HR 75 O2 98');

      expect(mockPatientCardRenderer.updateCardField).toHaveBeenCalledWith(
        'vitals',
        expect.objectContaining({
          bp: '120/80',
          hr: 75,
          o2: 98
        })
      );
    });
  });

  describe('Mode Exit', () => {
    test('19: endAssessment() clears patient data and exits', () => {
      clinicalMode.onPatientLoaded({ name: 'Sarah Chen' });
      clinicalMode.recordSymptom('Cough');

      clinicalMode.endAssessment();

      expect(clinicalMode.getCurrentState()).toBe('idle');
      expect(clinicalMode.getCurrentPatient()).toBeNull();
      expect(clinicalMode.getSessionSymptoms()).toEqual([]);
    });

    test('20: autoExitClinical() exits after inactivity (FR-12a)', () => {
      // This is handled by mode manager, but we test cleanup
      clinicalMode.onPatientLoaded({ name: 'Sarah Chen' });

      // Simulate mode manager calling onModeExited()
      clinicalMode.onModeExited();

      expect(clinicalMode.getCurrentState()).toBe('idle');
      expect(mockPatientCardRenderer.hidePatientCard).toHaveBeenCalled();
    });
  });

  describe('Voice Command Coverage', () => {
    test('21: All FR-15 commands recognized', () => {
      const commands = [
        { command: 'start_assessment', params: { patientName: 'Sarah Chen' } },
        { command: 'record_symptom', params: { description: 'Cough' } },
        { command: 'show_history', params: {} },
        { command: 'show_medications', params: {} },
        { command: 'show_allergies', params: {} },
        { command: 'prescribe', params: { medication: 'Amoxicillin', dosage: '500mg' } },
        { command: 'repeat_instructions', params: {} },
        { command: 'end_assessment', params: {} }
      ];

      commands.forEach(({ command, params }) => {
        expect(() => {
          clinicalMode.processVoiceCommand(command, params);
        }).not.toThrow();
      });
    });
  });

  describe('Error Handling', () => {
    test('22: API failure displays fallback message', () => {
      const speakSpy = jest.spyOn(clinicalMode, 'speakMessage');

      clinicalMode.onPatientLoaded({ name: 'Sarah Chen' });
      clinicalMode.onSymptomRecordFailed('Network error');

      expect(speakSpy).toHaveBeenCalledWith(expect.stringContaining('Failed to record'));
    });
  });

  describe('Edge Cases', () => {
    test('23: Switching to training mid-assessment auto-exits clinical', () => {
      clinicalMode.onPatientLoaded({ name: 'Sarah Chen' });

      // Simulate mode manager switching to training
      mockModeManager.getCurrentMode.mockReturnValue('training');
      clinicalMode.onModeExited();

      expect(clinicalMode.getCurrentState()).toBe('idle');
    });
  });
});
```

**Total: 23 test cases covering all FR requirements and edge cases.**

**2.3.2 - RUN TESTS** (15 minutes)

```bash
cd backend
npm test -- clinicalMode.test.js
```

Expected: ALL TESTS FAIL (module doesn't exist yet).

**2.3.3 - COMMIT TESTS** (5 minutes)

```bash
git add backend/tests/unit/clinicalMode.test.js
git commit -m "test: Add clinical mode state machine tests (Task 2.3 TDD Step 1)

Add 23 comprehensive test cases for Clinical Mode State Machine:
- Patient lookup with 3-retry logic (FR-14a)
- Symptom recording and session management (FR-15)
- View mode commands (FR-15)
- Repeat instructions (FR-15)
- Decision support integration (FR-18)
- Vital sign OCR with fallback (FR-16, FR-17, FR-17a)
- Mode exit and auto-exit (FR-12a)
- Voice command processing (FR-15)
- Error handling and edge cases

Tests cover all FR-12, FR-13, FR-14, FR-14a, FR-15, FR-16, FR-17, FR-17a, FR-18 requirements.

TDD Red phase: Tests fail as expected (module not implemented)."
```

**2.3.4 - IMPLEMENT** (6 hours)

Create implementations (see Implementation Details section below).

**2.3.5 - RUN TESTS** (1 hour)

```bash
npm test -- clinicalMode.test.js
```

Iterate until all 23 tests pass.

**2.3.6 - VERIFY MANUALLY** (1 hour)

Test each voice command from FR-15 in Lens Studio.

**2.3.7 - COMMIT CODE** (5 minutes)

```bash
git add backend/lens-studio-mock/clinicalMode.js lens-studio/Public/Scripts/clinical/clinicalMode.js
git commit -m "feat: Implement clinical mode state machine (Task 2.3)

Implement comprehensive clinical workflow orchestration:

**Clinical State Machine:**
- States: IDLE, LOADING_PATIENT, PATIENT_LOADED, RECORDING_SYMPTOM, PRESCRIBING
- State transitions with proper error handling
- Patient lookup with 3-retry logic (FR-14a)
- Session data management (symptoms, vitals, patient cache)

**Voice Command Processing (FR-15):**
- start_assessment: Patient lookup and card rendering
- record_symptom: Symptom recording with API persistence
- show_history/medications/allergies: View mode switching
- prescribe: Prescription workflow initiation
- repeat_instructions: Replay last TTS message
- end_assessment: Clean exit with state cleanup

**Integration Points:**
- Mode Manager: Automatic mode switching and inactivity handling
- Patient Card Renderer: View mode delegation and data updates
- Prescription UI: Prescription workflow coordination
- Demo Mode: Mock data and responses for testing

**Features:**
- 3-retry patient lookup with patient list fallback (FR-14a)
- Inactivity timer reset on user activity
- Decision support after symptom recording (FR-18 - optional)
- Vital sign OCR with 2-retry and manual entry fallback (FR-17a)
- Repeat instructions functionality (FR-15)
- Graceful error handling for API failures
- Auto-exit cleanup when mode manager exits clinical mode

**All 23 tests passing** (covering FR-12, FR-13, FR-14, FR-14a, FR-15, FR-16, FR-17, FR-17a, FR-18)

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Test Cases

(See TDD Workflow section above for complete test suite - 23 tests)

---

## Implementation Details

### Node.js Mock (`backend/lens-studio-mock/clinicalMode.js`)

```javascript
/**
 * Node.js Mock: Clinical Mode State Machine
 * Dev 2 Task 2.3: Clinical Mode State Machine
 */

const demoMode = require('../src/middleware/demoMode');

class ClinicalMode {
  constructor(modeManager, patientCardRenderer, prescriptionUI) {
    this.modeManager = modeManager;
    this.patientCardRenderer = patientCardRenderer;
    this.prescriptionUI = prescriptionUI;

    // State
    this.currentState = 'idle';
    this.currentPatient = null;
    this.sessionSymptoms = [];
    this.patientLookupAttempts = 0;
    this.vitalSignOCRAttempts = 0;
    this.lastTTSMessage = null;

    // Constants
    this.MAX_PATIENT_LOOKUP_ATTEMPTS = 3;
    this.MAX_OCR_ATTEMPTS = 2;

    // State constants
    this.STATES = {
      IDLE: 'idle',
      LOADING_PATIENT: 'loading_patient',
      PATIENT_LOADED: 'patient_loaded',
      RECORDING_SYMPTOM: 'recording_symptom',
      PRESCRIBING: 'prescribing'
    };
  }

  // === PATIENT LOOKUP ===

  startAssessment(patientName) {
    // Switch to clinical mode
    if (this.modeManager && this.modeManager.getCurrentMode() !== 'clinical') {
      this.modeManager.switchMode('clinical');
    }

    // Reset retry counter
    this.patientLookupAttempts = 0;

    // Start lookup
    this.lookupPatient(patientName);
  }

  lookupPatient(patientName) {
    this.currentState = this.STATES.LOADING_PATIENT;

    if (demoMode.isDemoMode()) {
      // Demo mode: synchronous lookup
      const patient = demoMode.getDemoPatient(patientName);
      if (patient) {
        this.onPatientLoaded(patient);
      } else {
        this.onPatientNotFound(patientName);
      }
    } else {
      // Real mode: would call API
      // callPatientLoadAPI(patientName, this.onPatientLoaded.bind(this), this.onPatientNotFound.bind(this));
      throw new Error('Real API not implemented - use DEMO_MODE=true');
    }
  }

  onPatientLoaded(patientData) {
    this.currentPatient = patientData;
    this.currentState = this.STATES.PATIENT_LOADED;
    this.sessionSymptoms = [];

    // Render patient card
    if (this.patientCardRenderer) {
      this.patientCardRenderer.renderPatientCard(patientData, 'all');
    }

    // TTS confirmation
    this.speakMessage(`Patient ${patientData.name} loaded. Age ${patientData.age}, allergies: ${patientData.allergies.length > 0 ? patientData.allergies.join(', ') : 'none'}.`);

    // Reset inactivity timer
    this.resetInactivityTimer();
  }

  onPatientNotFound(patientName) {
    this.patientLookupAttempts++;

    if (this.patientLookupAttempts < this.MAX_PATIENT_LOOKUP_ATTEMPTS) {
      this.speakMessage('Patient not found. Please repeat patient name.');
    } else {
      this.speakMessage('Patient not found after 3 attempts. Say \'show patient list\' or \'cancel assessment\'.');
    }
  }

  showPatientList() {
    // Show list of all patients (would query API in real mode)
    this.speakMessage('Available patients: Sarah Chen, Robert Martinez, Emily Watson. Say \'select patient\' followed by the name.');
  }

  cancelAssessment() {
    this.speakMessage('Assessment cancelled.');
    this.endAssessment();
  }

  // === SYMPTOM RECORDING ===

  recordSymptom(symptomDescription) {
    if (this.currentState !== this.STATES.PATIENT_LOADED) {
      this.speakMessage('Please load a patient first.');
      return;
    }

    this.currentState = this.STATES.RECORDING_SYMPTOM;

    // Add to session
    this.sessionSymptoms.push({
      description: symptomDescription,
      timestamp: new Date().toISOString()
    });

    // Call API
    this.callSymptomRecordAPI(
      this.currentPatient.id,
      symptomDescription,
      this.onSymptomRecorded.bind(this),
      this.onSymptomRecordFailed.bind(this)
    );
  }

  callSymptomRecordAPI(patientId, symptom, onSuccess, onFailure) {
    if (demoMode.isDemoMode()) {
      // Demo mode: immediate success
      setTimeout(() => onSuccess(symptom), 100);
    } else {
      // Real mode: would call API
      onFailure('Real API not implemented');
    }
  }

  onSymptomRecorded(symptomDescription) {
    this.speakMessage(`Symptom recorded: ${symptomDescription}`);
    this.currentState = this.STATES.PATIENT_LOADED;
    this.resetInactivityTimer();

    // Optional: Auto-trigger decision support after 2+ symptoms
    if (this.sessionSymptoms.length >= 2) {
      // this.requestDecisionSupport();
    }
  }

  onSymptomRecordFailed(error) {
    console.error('Failed to record symptom:', error);
    this.speakMessage('Failed to record symptom. Please try again.');
    this.currentState = this.STATES.PATIENT_LOADED;
  }

  // === VIEW MODES ===

  showPatientHistory() {
    if (this.currentState !== this.STATES.PATIENT_LOADED) {
      return;
    }

    if (this.patientCardRenderer) {
      this.patientCardRenderer.showPatientHistory();
    }

    this.resetInactivityTimer();
  }

  showMedications() {
    if (this.currentState !== this.STATES.PATIENT_LOADED) {
      return;
    }

    if (this.patientCardRenderer) {
      this.patientCardRenderer.showMedications();
    }

    this.resetInactivityTimer();
  }

  showAllergies() {
    if (this.currentState !== this.STATES.PATIENT_LOADED) {
      return;
    }

    if (this.patientCardRenderer) {
      this.patientCardRenderer.showAllergies();
    }

    this.resetInactivityTimer();
  }

  // === PRESCRIPTION ===

  initiatePrescription(medication, dosage) {
    if (this.currentState !== this.STATES.PATIENT_LOADED) {
      this.speakMessage('Please load a patient first.');
      return;
    }

    this.currentState = this.STATES.PRESCRIBING;

    // Hand off to prescription UI (Task 2.4)
    if (this.prescriptionUI) {
      this.prescriptionUI.handlePrescriptionCommand(medication, dosage, this.currentPatient);
    }

    // After prescription completes, return to patient loaded state
    // (prescription UI will call onPrescriptionComplete())
    this.resetInactivityTimer();
  }

  onPrescriptionComplete() {
    this.currentState = this.STATES.PATIENT_LOADED;
  }

  // === DECISION SUPPORT ===

  requestDecisionSupport() {
    if (this.sessionSymptoms.length === 0) {
      this.speakMessage('No symptoms recorded yet. Record symptoms first.');
      return;
    }

    const context = {
      patient_id: this.currentPatient.id,
      patient_name: this.currentPatient.name,
      age: this.currentPatient.age,
      sex: this.currentPatient.sex,
      allergies: this.currentPatient.allergies,
      medications: this.currentPatient.medications,
      current_vitals: this.currentPatient.current_vitals,
      symptoms: this.sessionSymptoms.map(s => s.description),
      diagnosis_history: this.currentPatient.diagnosis_history
    };

    this.callDecisionSupportAPI(
      context,
      this.displayDecisionSupport.bind(this),
      (error) => this.speakMessage('Unable to retrieve clinical suggestions.')
    );
  }

  callDecisionSupportAPI(context, onSuccess, onFailure) {
    if (demoMode.isDemoMode()) {
      // Demo mode: return mock decision support
      setTimeout(() => {
        onSuccess({
          possible_diagnoses: [{ diagnosis: 'Upper Respiratory Infection', confidence: 0.8 }],
          recommendations: ['Check for wheezing', 'Monitor O2 saturation'],
          tts_response: 'Symptoms suggest upper respiratory infection. Recommend chest auscultation and monitoring oxygen saturation.'
        });
      }, 500);
    } else {
      onFailure('Real API not implemented');
    }
  }

  displayDecisionSupport(decisionSupport) {
    this.speakMessage(decisionSupport.tts_response);
  }

  // === VITAL SIGNS ===

  initiateVitalSignOCR() {
    if (this.currentState !== this.STATES.PATIENT_LOADED) {
      return;
    }

    this.vitalSignOCRAttempts = 0;
    this.attemptVitalSignOCR();
  }

  attemptVitalSignOCR() {
    this.vitalSignOCRAttempts++;

    // Simulate OCR (would call CV service in real mode)
    const ocrSuccess = Math.random() > 0.5;

    if (ocrSuccess) {
      this.onVitalSignOCRSuccess({
        bp: '120/80',
        hr: 75,
        o2: 98,
        temp: 98.6
      });
    } else {
      this.onVitalSignOCRFailure();
    }
  }

  onVitalSignOCRSuccess(vitals) {
    this.currentPatient.current_vitals = vitals;

    if (this.patientCardRenderer) {
      this.patientCardRenderer.updateCardField('vitals', vitals);
    }

    this.speakMessage(`Vital signs recorded: Blood pressure ${vitals.bp}, heart rate ${vitals.hr}`);
  }

  onVitalSignOCRFailure() {
    if (this.vitalSignOCRAttempts < this.MAX_OCR_ATTEMPTS) {
      // Retry after 2-second delay
      setTimeout(() => this.attemptVitalSignOCR(), 2000);
    } else {
      this.speakMessage('Unable to read vital signs monitor. Say \'record vitals manually\' or continue without vitals.');
    }
  }

  recordVitalsManually(vitalsVoiceInput) {
    const vitals = this.parseVitalsFromVoice(vitalsVoiceInput);

    if (vitals) {
      this.currentPatient.current_vitals = vitals;

      if (this.patientCardRenderer) {
        this.patientCardRenderer.updateCardField('vitals', vitals);
      }

      this.speakMessage('Vital signs recorded manually.');
    } else {
      this.speakMessage('Could not understand vital signs. Please repeat.');
    }
  }

  parseVitalsFromVoice(input) {
    const vitals = {};

    // Extract BP
    const bpMatch = input.match(/(\d{2,3})\s*(\/|over)\s*(\d{2,3})/i);
    if (bpMatch) vitals.bp = `${bpMatch[1]}/${bpMatch[3]}`;

    // Extract HR
    const hrMatch = input.match(/(hr|heart\s*rate)\s*(\d{2,3})/i);
    if (hrMatch) vitals.hr = parseInt(hrMatch[2]);

    // Extract O2
    const o2Match = input.match(/(o2|oxygen)\s*(\d{2,3})/i);
    if (o2Match) vitals.o2 = parseInt(o2Match[2]);

    // Extract temp
    const tempMatch = input.match(/(temp|temperature)\s*(\d{2,3}\.?\d?)/i);
    if (tempMatch) vitals.temp = parseFloat(tempMatch[2]);

    return Object.keys(vitals).length > 0 ? vitals : null;
  }

  // === REPEAT INSTRUCTIONS ===

  repeatInstructions() {
    if (this.lastTTSMessage) {
      this.speakMessage(this.lastTTSMessage);
    } else {
      this.speakMessage('No previous message to repeat.');
    }
  }

  // === MODE EXIT ===

  endAssessment() {
    this.currentState = this.STATES.IDLE;
    this.currentPatient = null;
    this.sessionSymptoms = [];
    this.patientLookupAttempts = 0;
    this.vitalSignOCRAttempts = 0;
    this.lastTTSMessage = null;

    if (this.patientCardRenderer) {
      this.patientCardRenderer.hidePatientCard();
    }

    // Mode manager will handle speaking "Assessment complete."
    if (this.modeManager) {
      this.modeManager.switchMode('idle');
    }
  }

  onModeExited() {
    // Called by mode manager when exiting clinical mode
    this.currentState = this.STATES.IDLE;
    this.currentPatient = null;
    this.sessionSymptoms = [];
    this.patientLookupAttempts = 0;
    this.vitalSignOCRAttempts = 0;
    this.lastTTSMessage = null;

    if (this.patientCardRenderer) {
      this.patientCardRenderer.hidePatientCard();
    }
  }

  // === VOICE COMMAND PROCESSING ===

  processVoiceCommand(command, parameters) {
    this.resetInactivityTimer();

    switch (command) {
      case 'start_assessment':
        this.startAssessment(parameters.patientName);
        break;
      case 'record_symptom':
        this.recordSymptom(parameters.description);
        break;
      case 'show_history':
        this.showPatientHistory();
        break;
      case 'show_medications':
        this.showMedications();
        break;
      case 'show_allergies':
        this.showAllergies();
        break;
      case 'prescribe':
        this.initiatePrescription(parameters.medication, parameters.dosage);
        break;
      case 'repeat_instructions':
        this.repeatInstructions();
        break;
      case 'end_assessment':
        this.endAssessment();
        break;
      case 'show_patient_list':
        this.showPatientList();
        break;
      case 'cancel_assessment':
        this.cancelAssessment();
        break;
      case 'decision_support':
      case 'get_recommendations':
        this.requestDecisionSupport();
        break;
      case 'record_vitals_manually':
        this.recordVitalsManually(parameters.vitalsInput);
        break;
      default:
        console.error('Unknown command:', command);
    }
  }

  // === UTILITY METHODS ===

  resetInactivityTimer() {
    if (this.modeManager && this.modeManager.resetInactivityTimer) {
      this.modeManager.resetInactivityTimer();
    }
  }

  speakMessage(message) {
    this.lastTTSMessage = message;
    console.log('[TTS]', message);
    // In real implementation, would call TTS service
  }

  // Getters for testing
  getCurrentState() {
    return this.currentState;
  }

  getCurrentPatient() {
    return this.currentPatient;
  }

  getSessionSymptoms() {
    return this.sessionSymptoms;
  }
}

module.exports = ClinicalMode;
```

### Lens Studio Implementation (`lens-studio/Public/Scripts/clinical/clinicalMode.js`)

(Convert Node.js mock to Lens Studio JavaScript - no classes, use traditional functions, DelayedCallbackEvent for timers)

**Key differences:**
- Replace `class` with function-based module
- Replace `setTimeout` with `DelayedCallbackEvent`
- Replace `console.error` with `print`
- Add `@input` parameters for dependencies
- Export functions via `script.functionName`

---

## Edge Cases

### 1. Patient Lookup Edge Cases

| Scenario | Handling |
|----------|----------|
| Empty patient name | Treat as "not found", count as attempt |
| Patient name with special characters | Sanitize before API call |
| Network timeout during lookup | Count as failed attempt, retry |
| 3 failed attempts, then success | Reset counter on next assessment |
| "Show patient list" with no patients | Show error message |
| "Select patient" with invalid name | Restart lookup with new name |

### 2. Symptom Recording Edge Cases

| Scenario | Handling |
|----------|----------|
| Symptom recorded before patient loaded | Show error, prompt to load patient |
| Empty symptom description | Prompt user to repeat |
| Very long symptom description (>500 chars) | Truncate or reject |
| API failure during symptom recording | Show error, allow retry |
| Multiple symptoms recorded rapidly | Queue them, process sequentially |

### 3. View Mode Edge Cases

| Scenario | Handling |
|----------|----------|
| View mode command before patient loaded | Show error |
| Rapid view mode switches | Each command resets inactivity timer |
| View mode switch during prescription | Allow (non-blocking) |

### 4. Auto-Exit Edge Cases

| Scenario | Handling |
|----------|----------|
| User inactive for 120s | Mode manager auto-exits, TTS "Assessment complete." |
| User issues command at second 119 | Timer resets to 120s |
| User switches to training mode at second 60 | Clinical mode auto-exits immediately |
| Patient card auto-hides during session | Does NOT count as inactivity |

### 5. Prescription Edge Cases

| Scenario | Handling |
|----------|----------|
| Prescription command before patient loaded | Show error |
| Unknown medication | Handled by prescription UI (Task 2.4) |
| Drug interaction detected | Handled by prescription UI |
| Prescription during symptom recording | Queue until symptom recording completes |

---

## Integration Points

### Integration with Mode Manager (Task 2.1)

**Mode Manager provides:**
- `switchMode(newMode)` - Switch between IDLE/TRAINING/CLINICAL
- `getCurrentMode()` - Get current mode
- `resetInactivityTimer()` - Reset 120s timer
- `exitCurrentMode()` - Auto-exit with TTS confirmation

**Clinical Mode uses:**
```javascript
// Start clinical mode
script.modeManager.switchMode('clinical');

// Reset timer on activity
script.modeManager.resetInactivityTimer();

// Check current mode
if (script.modeManager.getCurrentMode() === 'clinical') { ... }
```

### Integration with Patient Card Renderer (Task 2.2)

**Patient Card Renderer provides:**
- `renderPatientCard(patientData, viewMode)` - Display patient card
- `hidePatientCard()` - Hide card
- `showPatientHistory()` - Switch to history view
- `showMedications()` - Switch to medications view
- `showAllergies()` - Switch to allergies view
- `updateCardField(field, value)` - Partial update

**Clinical Mode uses:**
```javascript
// Render patient card
script.patientCardRenderer.renderPatientCard(patientData, 'all');

// Switch view modes
script.patientCardRenderer.showMedications();

// Update vitals
script.patientCardRenderer.updateCardField('vitals', newVitals);
```

### Integration with Prescription UI (Task 2.4)

**Prescription UI will provide:**
- `handlePrescriptionCommand(medication, dosage, patient)` - Start prescription workflow
- `onPrescriptionComplete(result)` - Callback when prescription done

**Clinical Mode uses:**
```javascript
// Hand off to prescription UI
script.prescriptionUI.handlePrescriptionCommand(medication, dosage, currentPatient);
```

### Integration with Dev 1 (Voice Router)

**Dev 1 will call:**
```javascript
// Dev 1 parses speech-to-text and extracts command + parameters
script.clinicalMode.processVoiceCommand('record_symptom', { description: 'persistent cough' });
```

**Clinical Mode expects:**
- Command as string (e.g., `'start_assessment'`, `'record_symptom'`)
- Parameters as object (e.g., `{ patientName: 'Sarah Chen' }`)

---

## Demo Mode Integration

**Demo Mode Setup:**
```javascript
// .env
DEMO_MODE=true
DEMO_PATIENT_DATA_PATH=config/demo_patient_data.json
DEMO_API_RESPONSES_PATH=config/demo_api_responses.json
```

**Demo Mode Behavior:**
- Patient lookup: Read from `demo_patient_data.json`
- Symptom recording: Return mock success
- Decision support: Return mock recommendations
- Prescription: Return mock warnings/success
- TTS: Log to console (no real audio)

---

## Validation & Testing

### Manual Testing Checklist

After implementation, test each scenario manually:

**Patient Lookup:**
- [ ] "Start assessment Sarah Chen" → Patient loads successfully
- [ ] "Start assessment Unknown Patient" → "Patient not found" (retry 1)
- [ ] Repeat unknown name 2 more times → "Show patient list or cancel"
- [ ] "Show patient list" → Lists Sarah Chen, Robert Martinez, Emily Watson
- [ ] "Cancel assessment" → Returns to IDLE

**Symptom Recording:**
- [ ] "Record symptom persistent cough" → "Symptom recorded: persistent cough"
- [ ] "Record symptom fever and chills" → "Symptom recorded: fever and chills"

**View Modes:**
- [ ] "Show medications" → Patient card shows only medications
- [ ] "Show allergies" → Patient card shows only allergies (RED, enlarged)
- [ ] "Show patient history" → Patient card shows only diagnosis history

**Prescription:**
- [ ] "Prescribe Ibuprofen 200mg" → Hands off to prescription UI

**Repeat Instructions:**
- [ ] "Repeat instructions" → Replays last TTS message

**Auto-Exit:**
- [ ] Wait 120 seconds of inactivity → Auto-exit with "Assessment complete."
- [ ] Issue command at 119s → Timer resets, no auto-exit

---

## Performance Considerations

**API Call Latency:**
- Target: <3 seconds total response time (FR-42)
- Patient load: <2 seconds
- Symptom record: <1 second
- Decision support: <3 seconds (AI processing)

**Memory Usage:**
- Session symptoms: ~10 KB for 20 symptoms
- Patient data: ~5 KB per patient
- Total session memory: ~20 KB

**AR Rendering:**
- Patient card rendering: Handled by Task 2.2 (30 FPS target)
- Clinical mode logic: <10ms per voice command

---

## Troubleshooting

### Common Issues

**Issue: "Cannot read property 'switchMode' of undefined"**
- Cause: Mode manager not connected in Lens Studio
- Fix: Verify `@input Component.ScriptComponent modeManager` is connected in GUI

**Issue: "Patient not found" even for valid patient**
- Cause: Patient name doesn't match key in `demo_patient_data.json`
- Fix: Check patient name format (e.g., "sarah_chen" not "Sarah Chen")

**Issue: Inactivity timer doesn't reset**
- Cause: Not calling `resetInactivityTimer()` on commands
- Fix: Ensure `processVoiceCommand()` calls `resetInactivityTimer()` at start

**Issue: Tests fail with "Cannot find module"**
- Cause: Node.js mock not created yet
- Fix: Create `backend/lens-studio-mock/clinicalMode.js` first

---

## Architectural Recommendations

### State Management

**Recommended: Keep Clinical State Simple**

Don't create separate states for `SHOWING_MEDICATIONS`, `SHOWING_ALLERGIES`, `SHOWING_HISTORY`. Instead:

```javascript
// GOOD: Simple state machine
STATES = {
  IDLE,
  LOADING_PATIENT,
  PATIENT_LOADED,
  RECORDING_SYMPTOM,
  PRESCRIBING
}

// Patient card handles its own view modes internally
```

**Avoid: Overly complex state machine**

```javascript
// BAD: Too many states
STATES = {
  IDLE,
  LOADING_PATIENT,
  PATIENT_LOADED,
  PATIENT_LOADED_SHOWING_MEDICATIONS,
  PATIENT_LOADED_SHOWING_ALLERGIES,
  PATIENT_LOADED_SHOWING_HISTORY,
  RECORDING_SYMPTOM,
  PRESCRIBING,
  PRESCRIBING_WAITING_FOR_CONFIRMATION,
  // ... state explosion!
}
```

**Why:** Simpler state machine = easier testing, fewer bugs, clearer code.

### Component Boundaries

**Clinical Mode SHOULD:**
- Orchestrate the workflow
- Make API calls
- Manage session data (symptoms, patient cache)
- Handle voice command routing
- Coordinate between components

**Clinical Mode SHOULD NOT:**
- Render AR overlays (patient card does this)
- Manage view modes (patient card does this)
- Handle prescription UI logic (prescription UI does this)
- Manage top-level mode switching (mode manager does this)

**Key Principle:** Clinical mode is the **conductor**, not the **musician**.

---

## Summary

Task 2.3 implements the **Clinical Mode State Machine**, the orchestration layer that:

1. **Manages clinical workflow states** (IDLE → LOADING_PATIENT → PATIENT_LOADED → etc.)
2. **Processes all FR-15 voice commands** (start assessment, record symptom, show medications, etc.)
3. **Handles patient lookup with 3-retry logic** (FR-14a)
4. **Records symptoms and triggers decision support** (FR-15, FR-18)
5. **Coordinates with patient card renderer** for view mode switching (Task 2.2)
6. **Prepares for prescription workflow** integration (Task 2.4)
7. **Manages inactivity auto-exit** via mode manager delegation (FR-12a)
8. **Provides repeat instructions** functionality (FR-15)
9. **Handles vital sign OCR with fallback** (FR-16, FR-17, FR-17a - optional)

**Complexity: MODERATE**
- 23 test cases
- 500-700 lines of implementation code
- 6 hours implementation time
- Requires coordination with 3 other components

**Risk Areas:**
- Voice command parsing (depends on Dev 1)
- API integration (depends on Dev 3)
- State synchronization across components

**Mitigation:**
- Use demo mode for initial development
- Extensive unit testing (23 tests)
- Clear component boundaries
- Simple state machine design

---

**Ready to implement Task 2.3!** Follow the TDD workflow step-by-step, and you'll have a robust clinical mode state machine that coordinates the entire patient assessment workflow.
