# MedSnap Implementation Task List
**Based on:** PRD v1.1 - MedSnap AR Medical Assistant  
**Team:** 4 Developers | **Duration:** 48 hours  
**Methodology:** Test-Driven Development (TDD)  
**Version:** 2.0 - Comprehensive Update with Analysis Fixes Applied

---

## Project Structure

```
medsnap/
├── lens-studio/                 # Dev 1 & 2 - Snap Spectacles client
│   ├── Public/
│   │   └── assets/
│   │       ├── icons/           # UI icons (mic, checkmark, warning)
│   │       └── fonts/           # Sans-serif font for text overlays
│   ├── Scripts/
│   │   ├── main.js
│   │   ├── voiceController.js
│   │   ├── arOverlayManager.js
│   │   ├── cvPipeline.js
│   │   ├── trainingMode.js
│   │   ├── clinicalMode.js
│   │   ├── apiClient.js
│   │   ├── stateManager.js
│   │   ├── patientCardRenderer.js
│   │   ├── prescriptionUI.js
│   │   └── modeManager.js
│   └── Resources/
│       ├── config.json           # API endpoints and settings
│       └── audio/               # Cached TTS files (if local caching)
├── backend/                     # Dev 3 - Express API
│   ├── src/
│   │   ├── index.ts
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── models/
│   │   ├── db/
│   │   └── utils/
│   ├── tests/
│   │   ├── unit/
│   │   └── integration/
│   ├── data/
│   │   └── patients.json
│   ├── package.json
│   └── tsconfig.json
└── cv-pipeline/                 # Dev 4 - Computer Vision
    ├── src/
    │   ├── mediapipeHands.ts
    │   ├── wristDetection.ts
    │   └── vitalSignOCR.ts
    ├── tests/
    └── sample-data/
```

---

## Relevant Files

### Dev 1 - Training Mode & AR Foundation
- `lens-studio/Scripts/main.js` - Application entry point and initialization
- `lens-studio/Scripts/main.test.js` - Unit tests for main initialization
- `lens-studio/Scripts/arOverlayManager.js` - AR overlay rendering (circles, arrows, text)
- `lens-studio/Scripts/arOverlayManager.test.js` - Unit tests for AR overlays
- `lens-studio/Scripts/voiceController.js` - Snap ASR integration and voice command routing
- `lens-studio/Scripts/voiceController.test.js` - Unit tests for voice input
- `lens-studio/Scripts/cvPipeline.js` - CV integration wrapper for MediaPipe Hands
- `lens-studio/Scripts/cvPipeline.test.js` - Unit tests for CV pipeline
- `lens-studio/Scripts/trainingMode.js` - Training mode state machine and workflow
- `lens-studio/Scripts/trainingMode.test.js` - Unit tests for training mode
- `lens-studio/Scripts/apiClient.js` - HTTP client for backend API
- `lens-studio/Scripts/apiClient.test.js` - Unit tests for API client
- `lens-studio/Scripts/stateManager.js` - Application state management
- `lens-studio/Scripts/stateManager.test.js` - Unit tests for state manager

### Dev 2 - Clinical Mode & Voice UX
- `lens-studio/Scripts/clinicalMode.js` - Clinical mode state machine and workflow
- `lens-studio/Scripts/clinicalMode.test.js` - Unit tests for clinical mode
- `lens-studio/Scripts/patientCardRenderer.js` - Patient information card AR display
- `lens-studio/Scripts/patientCardRenderer.test.js` - Unit tests for patient cards
- `lens-studio/Scripts/prescriptionUI.js` - Prescription workflow UI components
- `lens-studio/Scripts/prescriptionUI.test.js` - Unit tests for prescription UI
- `lens-studio/Scripts/modeManager.js` - Mode switching logic
- `lens-studio/Scripts/modeManager.test.js` - Unit tests for mode management

### Dev 3 - Backend & AI Integration
- `backend/src/index.ts` - Express server entry point
- `backend/src/routes/training.ts` - Training mode API routes
- `backend/tests/unit/routes/training.test.ts` - Unit tests for training routes
- `backend/src/routes/clinical.ts` - Clinical mode API routes
- `backend/tests/unit/routes/clinical.test.ts` - Unit tests for clinical routes
- `backend/src/routes/prescription.ts` - Prescription API routes
- `backend/tests/unit/routes/prescription.test.ts` - Unit tests for prescription routes
- `backend/src/routes/voice.ts` - Voice command intent extraction routes **[NEW]**
- `backend/tests/unit/routes/voice.test.ts` - Unit tests for voice routes **[NEW]**
- `backend/src/routes/tts.ts` - TTS generation routes **[NEW]**
- `backend/tests/unit/routes/tts.test.ts` - Unit tests for TTS routes **[NEW]**
- `backend/src/controllers/trainingController.ts` - Training mode business logic
- `backend/tests/unit/controllers/trainingController.test.ts` - Unit tests
- `backend/src/controllers/clinicalController.ts` - Clinical mode business logic
- `backend/tests/unit/controllers/clinicalController.test.ts` - Unit tests
- `backend/src/controllers/prescriptionController.ts` - Prescription business logic
- `backend/tests/unit/controllers/prescriptionController.test.ts` - Unit tests
- `backend/src/services/geminiService.ts` - Gemini API integration
- `backend/tests/unit/services/geminiService.test.ts` - Unit tests
- `backend/src/services/lettaService.ts` - Letta context management wrapper
- `backend/tests/unit/services/lettaService.test.ts` - Unit tests
- `backend/src/services/fishAudioService.ts` - Fish Audio TTS integration
- `backend/tests/unit/services/fishAudioService.test.ts` - Unit tests
- `backend/src/services/drugInteractionService.ts` - Drug safety checking
- `backend/tests/unit/services/drugInteractionService.test.ts` - Unit tests
- `backend/src/services/clinicalDecisionEngine.ts` - Clinical decision support logic
- `backend/tests/unit/services/clinicalDecisionEngine.test.ts` - Unit tests
- `backend/src/db/supabase.ts` - Supabase client setup
- `backend/tests/unit/db/supabase.test.ts` - Unit tests
- `backend/src/models/patient.ts` - Patient data models
- `backend/tests/unit/models/patient.test.ts` - Unit tests
- `backend/src/models/prescription.ts` - Prescription data models
- `backend/tests/unit/models/prescription.test.ts` - Unit tests
- `backend/src/utils/responseCache.ts` - TTS response caching
- `backend/tests/unit/utils/responseCache.test.ts` - Unit tests
- `backend/data/patients.json` - Mock patient seed data

### Dev 4 - Data, CV & Integration
- `backend/db/schema.sql` - Supabase database schema
- `backend/db/seed.sql` - Database seed script
- `cv-pipeline/src/mediapipeHands.ts` - MediaPipe Hands model integration
- `cv-pipeline/tests/mediapipeHands.test.ts` - Unit tests
- `cv-pipeline/src/wristDetection.ts` - Wrist landmark detection logic
- `cv-pipeline/tests/wristDetection.test.ts` - Unit tests
- `cv-pipeline/src/vitalSignOCR.ts` - OCR for vital sign monitors
- `cv-pipeline/tests/vitalSignOCR.test.ts` - Unit tests
- `backend/tests/integration/training-flow.test.ts` - E2E training tests
- `backend/tests/integration/clinical-flow.test.ts` - E2E clinical tests
- `backend/tests/integration/prescription-flow.test.ts` - E2E prescription tests

### Notes
- **TDD Approach:** Write tests first, confirm they fail, then implement code to pass tests
- **Test Command:** `npx jest [optional/path/to/test]` or `npm test`
- **Lens Studio:** Use Lens Studio testing tools for client-side JavaScript
- **Integration Points:** Marked with 🔄 MERGE POINT indicators
- **Critical Path:** Tasks marked with ⚡ are on critical path for demo
- **NEW:** Tasks marked with **[ADDED]** are new based on PRD analysis
- **UPDATED:** Tasks marked with **[UPDATED]** have been enhanced for PRD compliance

---

## Tasks

### 🏗️ Phase 0: Environment Setup (Hours 0-6)

- [ ] **0.0 Project Infrastructure Setup**
  - [ ] 0.1 Initialize Git repository with proper .gitignore (node_modules, .env, build artifacts)
  - [ ] 0.2 Set up GitHub repository with branch protection for main
  - [ ] 0.3 Create development branches: `dev-1-training`, `dev-2-clinical`, `dev-3-backend`, `dev-4-integration`
  - [ ] 0.4 Set up Railway account and create new project
  - [ ] 0.5 Set up Supabase account and create new project
  - [ ] 0.6 Obtain and document all API keys (Gemini, Fish Audio, Letta)
  - [ ] 0.7 Create shared .env.example file with all required variables
  - [ ] 0.8 Set up project documentation in README.md
  - [ ] 0.9 Schedule daily standups (hours 0, 12, 24, 36, 42)
  - [ ] 0.10 **[ADDED]** Create demo mode configuration flag in .env (DEMO_MODE=true/false for mock vs real APIs)

---

### 👨‍💻 Dev 1: Training Mode & AR Foundation (Hours 0-36)

#### ⚡ 1.0 Lens Studio Project Setup & AR Foundation

- [ ] **1.0 Lens Studio Project Setup & AR Foundation**
  - [ ] 1.1 Install Lens Studio latest version from Snap website
  - [ ] 1.2 Create new Lens Studio project: "MedSnap"
  - [ ] 1.3 Configure project for Snap Spectacles target device
  - [ ] 1.4 Set up project directory structure (Public, Scripts, Resources)
  - [ ] 1.5 **[UPDATED]** Organize Public/assets/ subdirectories:
    - Public/assets/icons/ for UI icons (mic, checkmark, warning)
    - Public/assets/fonts/ for sans-serif font for text overlays
  - [ ] 1.6 Create Resources/config.json with backend API endpoints (Railway URL placeholder)
  - [ ] 1.7 **[ADDED]** Create Resources/audio/ directory for cached TTS files (optional local caching)
  - [ ] 1.8 Test project builds and deploys to Spectacles simulator
  - [ ] 1.9 Document Lens Studio setup process in README

- [ ] **1.1 AR Overlay Manager - TDD**
  - [ ] 1.1.1 **WRITE TESTS FIRST:** Create `arOverlayManager.test.js`
    - Test: `renderPulsePointCircle()` with position {x, y, z} returns overlay object with cyan color
    - Test: `renderDirectionArrow()` with angle returns overlay object with yellow color  
    - Test: `updateOverlayPosition()` moves existing overlay to new position
    - Test: `showTextOverlay()` displays text at specified location with 18pt font
    - Test: `clearOverlays()` removes all active overlays
    - Test: `setOverlayOpacity()` adjusts transparency (0-1 range)
    - Test: **[ADDED]** `renderVisualIndicator()` shows pulsing microphone icon for in-session commands (per FR-11)
  - [ ] 1.1.2 **RUN TESTS:** Confirm tests FAIL
  - [ ] 1.1.3 **COMMIT TESTS:** `git commit -m "Add AR overlay manager tests"`
  - [ ] 1.1.4 **IMPLEMENT:** Create `arOverlayManager.js` with all functions
  - [ ] 1.1.5 **RUN TESTS:** Iterate until all tests pass
  - [ ] 1.1.6 **COMMIT CODE:** `git commit -m "Implement AR overlay manager"`

- [ ] **⚡ 1.2 Voice Controller - TDD**
  - [ ] 1.2.1 **WRITE TESTS FIRST:** Create `voiceController.test.js`
    - Test: `initASR()` initializes Snap ASR with correct config
    - Test: `onWakeWord()` detects "Hey MedSnap" and triggers audio beep (100-200ms)
    - Test: **[ADDED]** `onWakeWord()` for session-initiating commands triggers audio beep
    - Test: **[ADDED]** `onInSessionCommand()` shows visual indicator (pulsing mic) instead of audio (per FR-11)
    - Test: `extractIntent()` parses "start training pulse taking" to {mode: 'training', action: 'start'}
    - Test: `extractIntent()` parses "start assessment Sarah Chen" to {mode: 'clinical', patient: 'Sarah Chen'}
    - Test: `extractIntent()` parses "prescribe Ibuprofen 400mg" to {action: 'prescribe', med: 'Ibuprofen', dose: '400mg'}
    - Test: **[ADDED]** `extractIntent()` parses "Show available medications" to {action: 'show_medications_list'} (per FR-22a)
    - Test: **[ADDED]** `extractIntent()` parses "Repeat instructions" to {action: 'repeat_last_prompt'} (per FR-15)
    - Test: `routeCommand()` sends training commands to trainingMode controller
    - Test: `routeCommand()` sends clinical commands to clinicalMode controller
    - Test: **[ADDED]** Error case: empty transcription returns null intent
    - Test: **[ADDED]** Edge case: nonsensical command returns {action: 'unknown'}
  - [ ] 1.2.2 **RUN TESTS:** Confirm tests FAIL
  - [ ] 1.2.3 **COMMIT TESTS:** `git commit -m "Add voice controller tests"`
  - [ ] 1.2.4 **IMPLEMENT:** Create `voiceController.js`
  - [ ] 1.2.5 **RUN TESTS:** Iterate until all tests pass
  - [ ] 1.2.6 **COMMIT CODE:** `git commit -m "Implement voice controller"`

- [ ] **1.3 CV Pipeline Wrapper - TDD**
  - [ ] 1.3.1 **WRITE TESTS FIRST:** Create `cvPipeline.test.js`
    - Test: `initCV()` loads MediaPipe Hands model successfully
    - Test: `detectHands()` returns hand landmarks array when hands visible
    - Test: `detectHands()` returns empty array when no hands detected
    - Test: `detectWrist()` identifies wrist position from hand landmarks
    - Test: `calculateFingerPosition()` computes finger coordinates relative to wrist
    - Test: **[ADDED]** `detectHands()` returns null after 10 seconds if wrist not detected (per FR-10a)
    - Test: **[ADDED]** `hasRetryTimedOut()` returns true after 10 seconds of failed detection
    - Test: **[ADDED]** Performance: `detectHands()` completes in <500ms (per FR-43)
  - [ ] 1.3.2 **RUN TESTS:** Confirm tests FAIL
  - [ ] 1.3.3 **COMMIT TESTS:** `git commit -m "Add CV pipeline tests"`
  - [ ] 1.3.4 **IMPLEMENT:** Create `cvPipeline.js` wrapper for MediaPipe integration
  - [ ] 1.3.5 **RUN TESTS:** Iterate until all tests pass
  - [ ] 1.3.6 **COMMIT CODE:** `git commit -m "Implement CV pipeline"`

- [ ] **1.4 API Client - TDD**
  - [ ] 1.4.1 **WRITE TESTS FIRST:** Create `apiClient.test.js`
    - Test: `post()` sends HTTP POST with JSON body
    - Test: `post()` includes authorization headers if configured
    - Test: `handleResponse()` parses successful JSON responses
    - Test: `handleError()` logs and returns error object for 4xx/5xx responses
    - Test: `setTimeout()` configures 5-second timeout for API calls
    - Test: **[ADDED]** `callEndpoint()` uses demo mode mock responses when DEMO_MODE=true
    - Test: **[ADDED]** Performance: API calls target <3 seconds total latency (per FR-42)
  - [ ] 1.4.2 **RUN TESTS:** Confirm tests FAIL
  - [ ] 1.4.3 **COMMIT TESTS:** `git commit -m "Add API client tests"`
  - [ ] 1.4.4 **IMPLEMENT:** Create `apiClient.js`
  - [ ] 1.4.5 **RUN TESTS:** Iterate until all tests pass
  - [ ] 1.4.6 **COMMIT CODE:** `git commit -m "Implement API client"`

- [ ] **1.5 State Manager - TDD**
  - [ ] 1.5.1 **WRITE TESTS FIRST:** Create `stateManager.test.js`
    - Test: `getCurrentMode()` returns 'idle', 'training', or 'clinical'
    - Test: `setMode()` updates current mode state
    - Test: `getSessionData()` returns current session information
    - Test: `updateSessionData()` merges new data into session
    - Test: `resetSession()` clears session data and returns to idle
    - Test: `getInactivityTime()` returns seconds since last activity
    - Test: **[ADDED]** `getInactivityTimeout()` returns 10 seconds for training mode (per FR-5a)
    - Test: **[ADDED]** `getInactivityTimeout()` returns 120 seconds for clinical mode (per FR-12a)
    - Test: **[ADDED]** `shouldAutoExit()` returns true when inactivity exceeds mode-specific timeout
  - [ ] 1.5.2 **RUN TESTS:** Confirm tests FAIL
  - [ ] 1.5.3 **COMMIT TESTS:** `git commit -m "Add state manager tests"`
  - [ ] 1.5.4 **IMPLEMENT:** Create `stateManager.js`
  - [ ] 1.5.5 **RUN TESTS:** Iterate until all tests pass
  - [ ] 1.5.6 **COMMIT CODE:** `git commit -m "Implement state manager"`

#### 1.6 Training Mode Implementation (Hours 6-18)

- [ ] **⚡ 1.6 Training Mode State Machine - TDD**
  - [ ] 1.6.1 **WRITE TESTS FIRST:** Create `trainingMode.test.js`
    - Test: `startTraining()` initializes training state and calls API /api/training/start
    - Test: Training state progression: IDLE → LOCATING_WRIST → POSITIONING → COUNTING → FEEDBACK → COMPLETE
    - Test: `onWristDetected()` transitions to POSITIONING state
    - Test: `onWristDetected()` displays AR circle on radial pulse point
    - Test: `onFingerPositionCorrect()` transitions to COUNTING state
    - Test: `onFingerPositionIncorrect()` provides corrective feedback via TTS
    - Test: `startCountingTimer()` sets 15-second timer
    - Test: `onCountingComplete()` prompts user for pulse count via TTS
    - Test: `onPulseCountReceived()` calculates BPM and sends to /api/training/feedback
    - Test: `displayFeedback()` shows "Normal range" or "Abnormal range" based on API response
    - Test: `completeTraining()` displays completion message and clears overlays
    - Test: **[ADDED]** `onWristNotDetected()` waits 10 seconds before offering skip option (per FR-10a)
    - Test: **[ADDED]** `allowManualContinue()` permits user to skip CV detection after retry timeout
    - Test: **[ADDED]** `autoExit()` exits training mode after 10 seconds of inactivity post-completion (per FR-5a)
    - Test: **[ADDED]** `exitTraining()` confirms with voice: "Training complete." (per FR-5a)
    - Test: **[ADDED]** Error handling: API failure shows fallback message and allows retry
    - Test: **[ADDED]** Edge case: User says "end training" before completion exits gracefully
    - Test: **[ADDED]** Voice prompt validation: each state transition includes correct TTS message per FR-8
  - [ ] 1.6.2 **RUN TESTS:** Confirm tests FAIL
  - [ ] 1.6.3 **COMMIT TESTS:** `git commit -m "Add training mode tests"`
  - [ ] 1.6.4 **IMPLEMENT:** Create `trainingMode.js` with full state machine
    - Implement all 7 voice prompts from FR-8
    - Implement error feedback messages from FR-9
    - Implement CV failure handling with 10-second retry from FR-10a
    - Implement audio beep for wake word, visual indicator for in-session commands (FR-11)
    - Implement auto-exit after 10 seconds inactivity (FR-5a)
  - [ ] 1.6.5 **RUN TESTS:** Iterate until all tests pass
  - [ ] 1.6.6 **VERIFY:** Manually test each voice prompt matches FR-8 exactly
  - [ ] 1.6.7 **COMMIT CODE:** `git commit -m "Implement training mode state machine"`

- [ ] **1.7 Training Mode Integration with Backend**
  - [ ] 1.7.1 Connect trainingMode.js to apiClient.js for /api/training/start
  - [ ] 1.7.2 Connect trainingMode.js to apiClient.js for /api/training/feedback
  - [ ] 1.7.3 Integrate TTS audio playback using audio_url from API responses
  - [ ] 1.7.4 Test full flow: wake word → training start → wrist detection → feedback → completion
  - [ ] 1.7.5 **[ADDED]** Test demo mode: verify mock responses work without backend (DEMO_MODE=true)
  - [ ] 1.7.6 **COMMIT:** `git commit -m "Integrate training mode with backend"`

- [ ] **1.8 Training Mode Optimization (Hours 18-24)**
  - [ ] 1.8.1 Profile AR overlay rendering performance using Lens Studio profiler
  - [ ] 1.8.2 Optimize CV detection loop to maintain 30+ FPS
  - [ ] 1.8.3 **[ADDED]** Implement automated FPS test: measure and log FPS during AR overlay rendering
  - [ ] 1.8.4 **[ADDED]** Automated test: CV detection latency should be <500ms (per FR-43)
  - [ ] 1.8.5 Test training mode on actual Spectacles hardware
  - [ ] 1.8.6 Fix any performance or visual issues
  - [ ] 1.8.7 **COMMIT:** `git commit -m "Optimize training mode performance"`

- [ ] **🔄 MERGE POINT 1 (Hour 12):**
  - [ ] 1.9.1 Merge dev-1-training branch to main
  - [ ] 1.9.2 Create release tag: `v0.3-training-foundation`
  - [ ] 1.9.3 **HANDOFF TO DEV 2:** AR component library and voice controller available
  - [ ] 1.9.4 Deploy to Spectacles for team testing

---

### 👨‍💻 Dev 2: Clinical Mode & Voice UX (Hours 0-36)

#### 2.0 Clinical Mode Foundation (Hours 0-6)

- [ ] **2.0 Environment Setup (parallel with Dev 1)**
  - [ ] 2.0.1 Clone repository and checkout `dev-2-clinical` branch
  - [ ] 2.0.2 Install Lens Studio and configure project (use Dev 1's setup once available)
  - [ ] 2.0.3 Set up local .env with backend API URLs
  - [ ] 2.0.4 **[ADDED]** Configure Jest for Lens Studio JavaScript testing
  - [ ] 2.0.5 Familiarize with Lens Studio AR components
  - [ ] 2.0.6 Review PRD sections 4.3-4.5 (Clinical Mode requirements)

#### 2.1 Mode Manager - TDD (Hours 6-12)

- [ ] **2.1 Mode Manager - TDD**
  - [ ] 2.1.1 **WRITE TESTS FIRST:** Create `modeManager.test.js`
    - Test: `switchMode()` transitions from idle to training
    - Test: `switchMode()` transitions from idle to clinical
    - Test: `switchMode()` transitions from training to clinical (auto-exit training first per FR-12b)
    - Test: `switchMode()` transitions from clinical to training (auto-exit clinical first per FR-12b)
    - Test: **[ADDED]** `autoExitOnSwitch()` confirms "Training complete" before starting clinical mode
    - Test: **[ADDED]** `autoExitOnSwitch()` confirms "Assessment complete" before starting training mode
    - Test: `exitCurrentMode()` clears session data and resets state
    - Test: `handleInactivity()` checks mode-specific timeout (10s training, 120s clinical per FR-5a, FR-12a)
    - Test: **[ADDED]** `handleInactivity()` triggers auto-exit for training after 10 seconds
    - Test: **[ADDED]** `handleInactivity()` triggers auto-exit for clinical after 120 seconds
    - Test: `confirmExit()` speaks confirmation message based on mode
  - [ ] 2.1.2 **RUN TESTS:** Confirm tests FAIL
  - [ ] 2.1.3 **COMMIT TESTS:** `git commit -m "Add mode manager tests"`
  - [ ] 2.1.4 **IMPLEMENT:** Create `modeManager.js`
    - Handle mode transitions with proper cleanup
    - Implement mode-specific inactivity timers (10s for training, 2min for clinical)
    - Implement auto-exit confirmation messages per FR-5a, FR-12a
    - Implement direct mode switching with auto-exit per FR-12b
  - [ ] 2.1.5 **RUN TESTS:** Iterate until all tests pass
  - [ ] 2.1.6 **COMMIT CODE:** `git commit -m "Implement mode manager"`

#### 2.2 Patient Card Renderer - TDD (Hours 12-18)

- [ ] **⚡ 2.2 Patient Card Renderer - TDD**
  - [ ] 2.2.1 **WRITE TESTS FIRST:** Create `patientCardRenderer.test.js`
    - Test: `renderPatientCard()` displays patient name, age, sex at top
    - Test: `renderPatientCard()` displays allergies prominently (per FR-13 priority)
    - Test: `renderPatientCard()` displays current medications list
    - Test: `renderPatientCard()` displays diagnosis history (last 3 visits)
    - Test: `renderPatientCard()` displays current vital signs
    - Test: `renderPatientCard()` displays chief complaint
    - Test: `renderPatientCard()` displays current symptoms
    - Test: `updateCardField()` updates specific field without re-rendering entire card
    - Test: `hidePatientCard()` removes card from AR display
    - Test: `showPatientHistory()` filters card to show only diagnosis history
    - Test: `showMedications()` filters card to show only medications list
    - Test: `showAllergies()` filters card to show only allergies (enlarged display)
    - Test: **[ADDED]** Card positioning: displays at "top_center" as per API response ar_config
    - Test: **[ADDED]** Card duration: auto-hides after 10 seconds unless pinned (per API ar_config)
    - Test: **[ADDED]** Priority fields: highlights allergies and medications per API ar_config
  - [ ] 2.2.2 **RUN TESTS:** Confirm tests FAIL
  - [ ] 2.2.3 **COMMIT TESTS:** `git commit -m "Add patient card renderer tests"`
  - [ ] 2.2.4 **IMPLEMENT:** Create `patientCardRenderer.js`
  - [ ] 2.2.5 **RUN TESTS:** Iterate until all tests pass
  - [ ] 2.2.6 **COMMIT CODE:** `git commit -m "Implement patient card renderer"`

#### 2.3 Clinical Mode State Machine - TDD (Hours 18-30)

- [ ] **⚡ 2.3 Clinical Mode State Machine - TDD**
  - [ ] 2.3.1 **WRITE TESTS FIRST:** Create `clinicalMode.test.js`
    - Test: `startAssessment()` with patient name calls /api/clinical/patient/load
    - Test: `onPatientLoaded()` displays patient card with all data
    - Test: `onPatientNotFound()` speaks "Patient not found. Please repeat patient name."
    - Test: **[ADDED]** `retryPatientLookup()` allows up to 3 attempts before offering patient list (per FR-14a)
    - Test: **[ADDED]** `offerPatientList()` after 3 failed attempts offers to show patient list or cancel
    - Test: **[ADDED]** `cancelAssessment()` exits clinical mode gracefully
    - Test: `recordSymptom()` voice command adds symptom to session and calls /api/clinical/symptom/record
    - Test: `showPatientHistory()` voice command filters patient card to history view
    - Test: `showMedications()` voice command filters patient card to medications view
    - Test: `showAllergies()` voice command filters patient card to allergies view
    - Test: **[ADDED]** `repeatInstructions()` replays last TTS prompt (per FR-15)
    - Test: `requestDecisionSupport()` calls /api/clinical/decision-support with symptoms
    - Test: `displayDecisionSupport()` shows AI recommendations via TTS
    - Test: `initiateVitalSignOCR()` (optional) attempts to read monitor
    - Test: **[ADDED]** `skipOCROnFailure()` allows manual vital entry after 3 OCR retry attempts (per FR-17a)
    - Test: **[ADDED]** `recordVitalsManually()` accepts voice input for vital signs
    - Test: `endAssessment()` clears patient data and exits clinical mode
    - Test: **[ADDED]** `autoExitClinical()` exits after 120 seconds inactivity with voice: "Assessment complete." (per FR-12a)
    - Test: **[ADDED]** Voice command coverage: test all FR-15 commands recognized correctly
    - Test: **[ADDED]** Error handling: API failures display fallback messages
    - Test: **[ADDED]** Edge case: Switching to training mid-assessment auto-exits clinical gracefully
  - [ ] 2.3.2 **RUN TESTS:** Confirm tests FAIL
  - [ ] 2.3.3 **COMMIT TESTS:** `git commit -m "Add clinical mode tests"`
  - [ ] 2.3.4 **IMPLEMENT:** Create `clinicalMode.js` with full workflow
    - Implement patient lookup with 3-retry logic (FR-14a)
    - Implement all voice commands from FR-15
    - Implement vital sign OCR with skip option (FR-16, FR-17, FR-17a)
    - Implement auto-exit after 2 minutes inactivity (FR-12a)
    - Implement "Repeat instructions" command
  - [ ] 2.3.5 **RUN TESTS:** Iterate until all tests pass
  - [ ] 2.3.6 **VERIFY:** Test each voice command from FR-15 manually
  - [ ] 2.3.7 **COMMIT CODE:** `git commit -m "Implement clinical mode state machine"`

#### 2.4 Prescription Workflow - TDD (Hours 30-36)

- [ ] **⚡ 2.4 Prescription UI - TDD**
  - [ ] 2.4.1 **WRITE TESTS FIRST:** Create `prescriptionUI.test.js`
    - Test: `handlePrescriptionCommand()` extracts medication name and dosage from voice
    - Test: `callPrescriptionAPI()` sends POST to /api/clinical/prescription/create
    - Test: `displayPrescriptionSuccess()` shows green checkmark and "PENDING" badge
    - Test: `displayPrescriptionWarning()` shows red X icon and warning message
    - Test: `displayAlternatives()` lists safer medication options from API response
    - Test: `speakPrescriptionResult()` plays TTS audio from API response
    - Test: `handleUnknownMedication()` speaks "Medication not found" message (per FR-22a)
    - Test: `showAvailableMedications()` lists 7-10 supported medications (baseline 8 from FR-22)
    - Test: **[ADDED]** `showAvailableMedications()` voice command displays AR list of medications
    - Test: **[ADDED]** Prescription status: displays "PENDING" badge per FR-26a
    - Test: **[ADDED]** Prescription logging: confirms prescription saved even if blocked
    - Test: **[ADDED]** Edge case: Empty medication name prompts for clarification
    - Test: **[ADDED]** Edge case: Ambiguous dosage prompts for confirmation
  - [ ] 2.4.2 **RUN TESTS:** Confirm tests FAIL
  - [ ] 2.4.3 **COMMIT TESTS:** `git commit -m "Add prescription UI tests"`
  - [ ] 2.4.4 **IMPLEMENT:** Create `prescriptionUI.js`
    - Parse medication and dosage from voice input
    - Handle unknown medications per FR-22a
    - Implement "Show available medications" voice command handler
    - Display success/warning UI per FR-26
    - Display alternatives when prescription blocked
    - Play TTS responses from API
  - [ ] 2.4.5 **RUN TESTS:** Iterate until all tests pass
  - [ ] 2.4.6 **COMMIT CODE:** `git commit -m "Implement prescription UI"`

- [ ] **2.5 Clinical Mode Integration & Testing (Hours 36-42)**
  - [ ] 2.5.1 Integrate clinicalMode with patientCardRenderer
  - [ ] 2.5.2 Integrate clinicalMode with prescriptionUI
  - [ ] 2.5.3 Integrate clinicalMode with modeManager
  - [ ] 2.5.4 Test Sarah Chen scenario end-to-end (per demo script)
  - [ ] 2.5.5 Test Warfarin + Ibuprofen interaction warning
  - [ ] 2.5.6 **[ADDED]** Test demo mode with mock patient data
  - [ ] 2.5.7 Verify all voice commands work correctly
  - [ ] 2.5.8 **COMMIT:** `git commit -m "Complete clinical mode integration"`

- [ ] **🔄 MERGE POINT 2 (Hour 24):**
  - [ ] 2.6.1 Merge dev-2-clinical branch to main
  - [ ] 2.6.2 Create release tag: `v0.6-clinical-complete`
  - [ ] 2.6.3 Test integration with Dev 1's training mode
  - [ ] 2.6.4 Test mode switching works correctly

---

### 👨‍💻 Dev 3: Backend & AI Integration (Hours 0-36)

#### 3.0 Backend Foundation (Hours 0-6)

- [ ] **3.0 Backend Project Setup**
  - [ ] 3.0.1 Initialize Node.js project: `npm init -y`
  - [ ] 3.0.2 Install dependencies: `express, typescript, @supabase/supabase-js, dotenv, cors, jest, ts-jest, @types/node, @types/express, supertest`
  - [ ] 3.0.3 Create `tsconfig.json` with strict type checking
  - [ ] 3.0.4 Create `backend/src/` directory structure (routes, controllers, services, models, db, utils)
  - [ ] 3.0.5 Configure Jest for TypeScript: create `jest.config.js`
  - [ ] 3.0.6 Create `.env.example` with all required API keys
  - [ ] 3.0.7 Create basic Express server in `index.ts` with health check endpoint
  - [ ] 3.0.8 Deploy placeholder to Railway and obtain URL
  - [ ] 3.0.9 **SHARE WITH DEV 1 & 2:** Provide Railway backend URL for config.json
  - [ ] 3.0.10 Document setup process in backend/README.md

#### 3.1 Database Client Setup - TDD (Hours 6-12)

- [ ] **3.1 Supabase Client - TDD**
  - [ ] 3.1.1 **WRITE TESTS FIRST:** Create `tests/unit/db/supabase.test.ts`
    - Test: `initSupabase()` creates client with correct URL and key
    - Test: `query()` executes SELECT query successfully
    - Test: `insert()` adds new record and returns ID
    - Test: `update()` modifies existing record
    - Test: `handleError()` logs and formats Supabase errors
  - [ ] 3.1.2 **RUN TESTS:** Confirm tests FAIL
  - [ ] 3.1.3 **COMMIT TESTS:** `git commit -m "Add Supabase client tests"`
  - [ ] 3.1.4 **IMPLEMENT:** Create `src/db/supabase.ts`
  - [ ] 3.1.5 **RUN TESTS:** Iterate until all tests pass
  - [ ] 3.1.6 **COMMIT CODE:** `git commit -m "Implement Supabase client"`

- [ ] **3.2 Patient Model - TDD**
  - [ ] 3.2.1 **WRITE TESTS FIRST:** Create `tests/unit/models/patient.test.ts`
    - Test: `PatientModel` interface matches database schema
    - Test: `findByName()` returns patient by name (case-insensitive)
    - Test: `findById()` returns patient by UUID
    - Test: `getAllPatients()` returns list of all patients (for patient list feature)
    - Test: `findByName()` returns null if patient not found
    - Test: **[ADDED]** Schema validation: medications is JSONB array (per PRD FR-37)
    - Test: **[ADDED]** Schema validation: allergies is text[] array (per PRD FR-37)
    - Test: **[ADDED]** Schema validation: diagnosis_history is JSONB array (per PRD FR-37)
  - [ ] 3.2.2 **RUN TESTS:** Confirm tests FAIL
  - [ ] 3.2.3 **COMMIT TESTS:** `git commit -m "Add patient model tests"`
  - [ ] 3.2.4 **IMPLEMENT:** Create `src/models/patient.ts`
  - [ ] 3.2.5 **RUN TESTS:** Iterate until all tests pass
  - [ ] 3.2.6 **COMMIT CODE:** `git commit -m "Implement patient model"`

- [ ] **3.3 Prescription Model - TDD**
  - [ ] 3.3.1 **WRITE TESTS FIRST:** Create `tests/unit/models/prescription.test.ts`
    - Test: `PrescriptionModel` interface includes patient_id, medication, dosage, status, created_at
    - Test: `create()` inserts prescription with "pending_physician_approval" status
    - Test: `findByPatient()` returns all prescriptions for a patient
    - Test: `updateStatus()` changes prescription status
  - [ ] 3.3.2 **RUN TESTS:** Confirm tests FAIL
  - [ ] 3.3.3 **COMMIT TESTS:** `git commit -m "Add prescription model tests"`
  - [ ] 3.3.4 **IMPLEMENT:** Create `src/models/prescription.ts`
  - [ ] 3.3.5 **RUN TESTS:** Iterate until all tests pass
  - [ ] 3.3.6 **COMMIT CODE:** `git commit -m "Implement prescription model"`

#### 3.3 External Service Integration (Hours 12-18)

- [ ] **⚡ 3.3 Gemini Service - TDD**
  - [ ] 3.3.1 **WRITE TESTS FIRST:** Create `tests/unit/services/geminiService.test.ts`
    - Test: `generateResponse()` sends prompt to Gemini API
    - Test: `generateResponse()` returns text completion
    - Test: `generateClinicalAdvice()` formats medical prompt correctly
    - Test: `parseGeminiResponse()` extracts structured data from response
    - Test: `handleAPIError()` catches rate limits and network errors
    - Test: **[ADDED]** Demo mode: returns mock responses when DEMO_MODE=true
    - Test: **[ADDED]** Response time: completes within timeout window
  - [ ] 3.3.2 **RUN TESTS:** Confirm tests FAIL
  - [ ] 3.3.3 **COMMIT TESTS:** `git commit -m "Add Gemini service tests"`
  - [ ] 3.3.4 **IMPLEMENT:** Create `src/services/geminiService.ts`
  - [ ] 3.3.5 **RUN TESTS:** Iterate until all tests pass (may need API key)
  - [ ] 3.3.6 **COMMIT CODE:** `git commit -m "Implement Gemini service"`

- [ ] **⚡ 3.4 Letta Context Service - TDD**
  - [ ] 3.4.1 **WRITE TESTS FIRST:** Create `tests/unit/services/lettaService.test.ts`
    - Test: `initSession()` creates new Letta conversation session
    - Test: `addMessage()` appends message to conversation history
    - Test: `getContext()` retrieves last N messages for prompt context
    - Test: `clearSession()` resets conversation history
    - Test: `wrapGeminiCall()` passes context window to Gemini API
    - Test: **[ADDED]** Context window management: maintains last 20 turns or 4000 tokens (per FR-4a)
    - Test: **[ADDED]** `summarizeOldContext()` compresses history beyond window limit (per FR-4a)
    - Test: **[ADDED]** `getContextSize()` returns current token count
    - Test: **[ADDED]** `shouldCompressContext()` returns true when approaching 4000 token limit
  - [ ] 3.4.2 **RUN TESTS:** Confirm tests FAIL
  - [ ] 3.4.3 **COMMIT TESTS:** `git commit -m "Add Letta service tests"`
  - [ ] 3.4.4 **IMPLEMENT:** Create `src/services/lettaService.ts`
    - Implement rolling window of 20 turns / 4000 tokens (FR-4a)
    - Implement context summarization when limit reached
    - Wrap Gemini API calls with context injection
  - [ ] 3.4.5 **RUN TESTS:** Iterate until all tests pass
  - [ ] 3.4.6 **COMMIT CODE:** `git commit -m "Implement Letta service"`

- [ ] **⚡ 3.5 Fish Audio TTS Service - TDD**
  - [ ] 3.5.1 **WRITE TESTS FIRST:** Create `tests/unit/services/fishAudioService.test.ts`
    - Test: `generateTTS()` sends text to Fish Audio API
    - Test: `generateTTS()` returns audio URL
    - Test: `selectVoice()` uses medical professional voice profile
    - Test: `handleAPIError()` catches and logs Fish Audio errors
    - Test: **[ADDED]** Performance: TTS generation completes in <1.5 seconds (per FR-44)
    - Test: **[ADDED]** Caching: checks cache before calling API (per FR-44a)
    - Test: **[ADDED]** Demo mode: returns mock audio URLs when DEMO_MODE=true
  - [ ] 3.5.2 **RUN TESTS:** Confirm tests FAIL
  - [ ] 3.5.3 **COMMIT TESTS:** `git commit -m "Add Fish Audio service tests"`
  - [ ] 3.5.4 **IMPLEMENT:** Create `src/services/fishAudioService.ts`
  - [ ] 3.5.5 **RUN TESTS:** Iterate until all tests pass
  - [ ] 3.5.6 **COMMIT CODE:** `git commit -m "Implement Fish Audio service"`

- [ ] **3.6 Response Cache - TDD**
  - [ ] 3.6.1 **WRITE TESTS FIRST:** Create `tests/unit/utils/responseCache.test.ts`
    - Test: `get()` retrieves cached TTS response by text hash
    - Test: `set()` stores TTS audio URL with expiration
    - Test: `has()` returns true if cache hit, false if miss
    - Test: `clear()` removes all cached responses
    - Test: `getHitRate()` calculates cache effectiveness (target >50% per FR-44a)
    - Test: **[ADDED]** TTL: cached responses expire after 24 hours
    - Test: **[ADDED]** Memory management: limits cache size to 100 entries (LRU eviction)
    - Test: **[ADDED]** Common phrases: pre-cache responses for common medical phrases at startup
  - [ ] 3.6.2 **RUN TESTS:** Confirm tests FAIL
  - [ ] 3.6.3 **COMMIT TESTS:** `git commit -m "Add response cache tests"`
  - [ ] 3.6.4 **IMPLEMENT:** Create `src/utils/responseCache.ts`
    - Implement in-memory cache with TTL
    - Pre-cache common medical phrases on server startup
    - Implement LRU eviction when cache full
  - [ ] 3.6.5 **RUN TESTS:** Iterate until all tests pass
  - [ ] 3.6.6 **COMMIT CODE:** `git commit -m "Implement response cache"`

#### 3.7 Drug Interaction Service - TDD (Hours 18-24)

- [ ] **⚡ 3.7 Drug Interaction Service - TDD**
  - [ ] 3.7.1 **WRITE TESTS FIRST:** Create `tests/unit/services/drugInteractionService.test.ts`
    - Test: **[UPDATED]** Medication database includes all 8 medications from FR-22:
      - Amoxicillin (antibiotic)
      - Azithromycin (antibiotic)
      - Acetaminophen (pain reliever)
      - Ibuprofen (NSAID)
      - Lisinopril (hypertension)
      - Metformin (diabetes)
      - Omeprazole (acid reflux)
      - Warfarin (anticoagulant)
    - Test: **[ADDED]** Each medication has properties: name, class, common_dosage
    - Test: `checkInteraction()` with Warfarin + Ibuprofen returns HIGH severity (bleeding risk)
    - Test: `checkInteraction()` with Warfarin + NSAIDs returns HIGH severity
    - Test: `checkInteraction()` with Lisinopril + Acetaminophen returns no interaction
    - Test: **[ADDED]** `checkInteraction()` with any other combination returns no interaction (for MVP)
    - Test: `getMedication()` with "Omeprazole" returns valid medication object
    - Test: `getMedication()` with "Amoxicillin" returns valid medication object
    - Test: **[ADDED]** `getMedication()` with unknown drug name returns null
    - Test: `checkAllergies()` blocks prescription if patient allergic
    - Test: `getAlternatives()` suggests safer options when interaction found
    - Test: **[ADDED]** Medication count: database contains 7-10 medications (baseline 8)
    - Test: **[ADDED]** Fuzzy matching: "ibuprofen" and "Ibuprofen" both match
  - [ ] 3.7.2 **RUN TESTS:** Confirm tests FAIL
  - [ ] 3.7.3 **COMMIT TESTS:** `git commit -m "Add drug interaction service tests"`
  - [ ] 3.7.4 **IMPLEMENT:** Create `src/services/drugInteractionService.ts`
    - Create medication database with all 8 drugs from FR-22
    - Allow for 7-10 medications (extensible for future)
    - Implement Warfarin + NSAID interaction check (HIGH severity)
    - Implement allergy checking against patient record
    - Implement alternative medication suggestions
    - Support for unknown medication detection
  - [ ] 3.7.5 **RUN TESTS:** Iterate until all tests pass
  - [ ] 3.7.6 **COMMIT CODE:** `git commit -m "Implement drug interaction service"`

- [ ] **3.8 Clinical Decision Engine - TDD**
  - [ ] 3.8.1 **WRITE TESTS FIRST:** Create `tests/unit/services/clinicalDecisionEngine.test.ts`
    - Test: `analyzeSymptoms()` with fever + cough suggests Upper Respiratory Infection
    - Test: `analyzeSymptoms()` with chest pain suggests cardiac evaluation
    - Test: `analyzeSymptoms()` with headache + fever suggests viral infection or meningitis screening
    - Test: `generateRecommendations()` returns 3-4 actionable next steps
    - Test: `assessUrgency()` returns "routine", "urgent", or "emergency" priority
    - Test: `formatForTTS()` converts analysis to natural speech
    - Test: **[ADDED]** Confidence scoring: returns confidence level (0.0-1.0) per API example
    - Test: **[ADDED]** Reasoning: includes explanation of diagnosis rationale per API example
    - Test: **[ADDED]** Follow-up guidance: includes when to escalate care per API example
  - [ ] 3.8.2 **RUN TESTS:** Confirm tests FAIL
  - [ ] 3.8.3 **COMMIT TESTS:** `git commit -m "Add clinical decision engine tests"`
  - [ ] 3.8.4 **IMPLEMENT:** Create `src/services/clinicalDecisionEngine.ts`
    - Integrate with Gemini via Letta for AI-powered analysis
    - Implement 3 test scenarios from FR-19
    - Return structured response per PRD API examples (Appendix B)
  - [ ] 3.8.5 **RUN TESTS:** Iterate until all tests pass
  - [ ] 3.8.6 **COMMIT CODE:** `git commit -m "Implement clinical decision engine"`

#### 3.9 API Endpoints - Training (Hours 24-28)

- [ ] **⚡ 3.9 Training API Routes - TDD**
  - [ ] 3.9.1 **WRITE TESTS FIRST:** Create `tests/unit/routes/training.test.ts`
    - Test: POST /api/training/start returns success with session_id
    - Test: POST /api/training/start includes TTS audio_url for "Starting pulse taking training"
    - Test: POST /api/training/feedback with BPM calculates normal/abnormal range
    - Test: POST /api/training/feedback returns technique feedback
    - Test: POST /api/training/feedback includes TTS audio_url for feedback message
    - Test: Error: POST /api/training/start without session fails gracefully
    - Test: **[ADDED]** Response validation: matches PRD API response structure
  - [ ] 3.9.2 **RUN TESTS:** Confirm tests FAIL
  - [ ] 3.9.3 **COMMIT TESTS:** `git commit -m "Add training route tests"`
  - [ ] 3.9.4 **WRITE TESTS FIRST:** Create `tests/unit/controllers/trainingController.test.ts`
    - Test: `startTraining()` initializes Letta session
    - Test: `startTraining()` generates TTS welcome message
    - Test: `processFeedback()` with 72 BPM returns "Normal range"
    - Test: `processFeedback()` with 110 BPM returns "Elevated. May indicate stress or exertion."
    - Test: `processFeedback()` with 45 BPM returns "Below normal. Recheck placement."
    - Test: `generateTechniqueFeedback()` uses Gemini for personalized advice
    - Test: **[ADDED]** Demo mode: returns mock responses when DEMO_MODE=true
  - [ ] 3.9.5 **RUN TESTS:** Confirm tests FAIL
  - [ ] 3.9.6 **COMMIT TESTS:** `git commit -m "Add training controller tests"`
  - [ ] 3.9.7 **IMPLEMENT:** Create `src/routes/training.ts` and `src/controllers/trainingController.ts`
  - [ ] 3.9.8 **RUN TESTS:** Iterate until all tests pass
  - [ ] 3.9.9 **COMMIT CODE:** `git commit -m "Implement training endpoints"`

#### 3.10 API Endpoints - Clinical (Hours 28-32)

- [ ] **⚡ 3.10 Clinical API Routes - TDD**
  - [ ] 3.10.1 **WRITE TESTS FIRST:** Create `tests/unit/routes/clinical.test.ts`
    - Test: POST /api/clinical/patient/load with "Sarah Chen" returns patient data
    - Test: POST /api/clinical/patient/load includes ar_config for card display
    - Test: POST /api/clinical/patient/load with unknown patient returns error
    - Test: POST /api/clinical/symptom/record adds symptom to session context
    - Test: POST /api/clinical/decision-support returns diagnosis suggestions
    - Test: POST /api/clinical/decision-support includes TTS audio_url
    - Test: **[ADDED]** Error case: patient lookup retry count validation
    - Test: **[ADDED]** Response validation: matches PRD Appendix B structure
  - [ ] 3.10.2 **RUN TESTS:** Confirm tests FAIL
  - [ ] 3.10.3 **COMMIT TESTS:** `git commit -m "Add clinical route tests"`
  - [ ] 3.10.4 **WRITE TESTS FIRST:** Create `tests/unit/controllers/clinicalController.test.ts`
    - Test: `loadPatient()` queries database by name
    - Test: `loadPatient()` formats response with ar_config
    - Test: `recordSymptom()` adds to Letta context
    - Test: `getDecisionSupport()` calls clinical decision engine
    - Test: `getDecisionSupport()` generates TTS for recommendations
    - Test: **[ADDED]** Context management: symptoms persist across session
    - Test: **[ADDED]** Demo mode: uses mock patients when DEMO_MODE=true
  - [ ] 3.10.5 **RUN TESTS:** Confirm tests FAIL
  - [ ] 3.10.6 **COMMIT TESTS:** `git commit -m "Add clinical controller tests"`
  - [ ] 3.10.7 **IMPLEMENT:** Create `src/routes/clinical.ts` and `src/controllers/clinicalController.ts`
  - [ ] 3.10.8 **RUN TESTS:** Iterate until all tests pass
  - [ ] 3.10.9 **COMMIT CODE:** `git commit -m "Implement clinical endpoints"`

#### 3.11 API Endpoints - Prescription (Hours 32-36)

- [ ] **⚡ 3.11 Prescription API Routes - TDD**
  - [ ] 3.11.1 **WRITE TESTS FIRST:** Create `tests/unit/routes/prescription.test.ts`
    - Test: POST /api/clinical/prescription/create with safe medication returns success
    - Test: POST /api/clinical/prescription/create with interaction returns blocked=true
    - Test: POST /api/clinical/prescription/create with allergy returns blocked=true
    - Test: POST /api/clinical/prescription/create with unknown medication returns error per FR-22a
    - Test: Blocked prescription includes warnings array
    - Test: Blocked prescription includes alternatives array
    - Test: Success prescription includes ar_display config with "PENDING" badge per FR-26a
    - Test: All responses include TTS audio_url
    - Test: **[ADDED]** Unknown medication response includes "Show available medications" suggestion
    - Test: **[ADDED]** Response validation: matches PRD Appendix B structure
  - [ ] 3.11.2 **RUN TESTS:** Confirm tests FAIL
  - [ ] 3.11.3 **COMMIT TESTS:** `git commit -m "Add prescription route tests"`
  - [ ] 3.11.4 **WRITE TESTS FIRST:** Create `tests/unit/controllers/prescriptionController.test.ts`
    - Test: `createPrescription()` checks drug interactions
    - Test: `createPrescription()` checks patient allergies
    - Test: `createPrescription()` logs prescription even if blocked (for audit)
    - Test: `createPrescription()` generates TTS for success/warning
    - Test: `createPrescription()` sets status to "pending_physician_approval"
    - Test: `getAlternatives()` suggests safer medications
    - Test: **[ADDED]** Unknown medication handling per FR-22a
    - Test: **[ADDED]** Demo mode compatibility
  - [ ] 3.11.5 **RUN TESTS:** Confirm tests FAIL
  - [ ] 3.11.6 **COMMIT TESTS:** `git commit -m "Add prescription controller tests"`
  - [ ] 3.11.7 **IMPLEMENT:** Create `src/routes/prescription.ts` and `src/controllers/prescriptionController.ts`
  - [ ] 3.11.8 **RUN TESTS:** Iterate until all tests pass
  - [ ] 3.11.9 **COMMIT CODE:** `git commit -m "Implement prescription endpoints"`

- [ ] **3.11.10 [ADDED] Voice & TTS Utility Endpoints - TDD**
  - [ ] 3.11.10.1 **WRITE TESTS FIRST:** Create `tests/unit/routes/voice.test.ts`
    - Test: POST /api/voice/command extracts intent from transcription
    - Test: POST /api/voice/command with "prescribe Ibuprofen" returns {intent: 'prescribe', medication: 'Ibuprofen'}
    - Test: POST /api/voice/command with "show medications" returns {intent: 'show_medications'}
    - Test: POST /api/voice/command with unknown command returns {intent: 'unknown'}
    - Test: **[ADDED]** Intent extraction for all commands from FR-15
  - [ ] 3.11.10.2 **RUN TESTS:** Confirm tests FAIL
  - [ ] 3.11.10.3 **COMMIT TESTS:** `git commit -m "Add voice route tests"`
  - [ ] 3.11.10.4 **WRITE TESTS FIRST:** Create `tests/unit/routes/tts.test.ts`
    - Test: POST /api/tts/generate converts text to audio_url
    - Test: POST /api/tts/generate checks cache before calling Fish Audio (per FR-44a)
    - Test: POST /api/tts/generate updates cache on new generation
    - Test: POST /api/tts/generate returns cached URL when available
    - Test: **[ADDED]** Cache hit rate monitoring
  - [ ] 3.11.10.5 **RUN TESTS:** Confirm tests FAIL
  - [ ] 3.11.10.6 **COMMIT TESTS:** `git commit -m "Add TTS route tests"`
  - [ ] 3.11.10.7 **IMPLEMENT:** Create `src/routes/voice.ts` and `src/routes/tts.ts`
    - voice.ts: Extract intent and parameters from voice transcription
    - tts.ts: Generate TTS with caching per FR-44a
  - [ ] 3.11.10.8 **RUN TESTS:** Iterate until all tests pass
  - [ ] 3.11.10.9 **COMMIT CODE:** `git commit -m "Implement voice and TTS utility endpoints"`

#### 3.12 Backend Testing & Optimization (Hours 36-42)

- [ ] **3.12 Integration & Performance Testing**
  - [ ] 3.12.1 Test all 10 API endpoints with Postman or curl **[UPDATED: was 8, now 10 endpoints]**
  - [ ] 3.12.2 **[ADDED]** Automated performance tests for response times:
    - Test: Training endpoints respond in <3 seconds (per FR-42)
    - Test: Clinical endpoints respond in <3 seconds (per FR-42)
    - Test: TTS generation completes in <1.5 seconds (per FR-44)
    - Test: Drug interaction check completes in <500ms
  - [ ] 3.12.3 **[ADDED]** Cache effectiveness test: measure TTS cache hit rate (target >50% per FR-44a)
  - [ ] 3.12.4 Test Letta context management with long conversations
  - [ ] 3.12.5 **[ADDED]** Test context window limit enforcement (20 turns / 4000 tokens per FR-4a)
  - [ ] 3.12.6 **[ADDED]** Test demo mode works for all endpoints
  - [ ] 3.12.7 Profile slow endpoints and optimize
  - [ ] 3.12.8 Add error logging and monitoring
  - [ ] 3.12.9 **COMMIT:** `git commit -m "Complete backend testing and optimization"`

- [ ] **3.13 Railway Deployment**
  - [ ] 3.13.1 Set environment variables in Railway dashboard
  - [ ] 3.13.2 Deploy backend to Railway
  - [ ] 3.13.3 Verify health check endpoint accessible
  - [ ] 3.13.4 Test all endpoints from Railway URL
  - [ ] 3.13.5 Configure auto-deployment from main branch
  - [ ] 3.13.6 **[ADDED]** Document Railway deployment process
  - [ ] 3.13.7 **SHARE WITH TEAM:** Confirm production backend URL

- [ ] **🔄 MERGE POINT 3 (Hour 24):**
  - [ ] 3.14.1 Merge dev-3-backend branch to main
  - [ ] 3.14.2 Create release tag: `v0.7-backend-complete`
  - [ ] 3.14.3 All 10 API endpoints deployed and tested **[UPDATED]**
  - [ ] 3.14.4 Share production API documentation with team

---

### 👨‍💻 Dev 4: Data, CV & Integration (Hours 0-42)

#### 4.0 Database Schema & Seed Data (Hours 0-6)

- [ ] **4.0 Environment Setup**
  - [ ] 4.0.1 Set up Supabase project and obtain credentials
  - [ ] 4.0.2 **[UPDATED]** Create database schema matching PRD FR-37:
    ```sql
    -- patients table with embedded JSONB arrays per PRD
    CREATE TABLE patients (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT NOT NULL,
      age INTEGER NOT NULL,
      sex TEXT NOT NULL,
      chief_complaint TEXT,
      current_symptoms TEXT[],
      vital_signs JSONB, -- {bp, hr, o2, temp}
      allergies TEXT[] NOT NULL DEFAULT '{}',
      medications JSONB NOT NULL DEFAULT '[]', -- Array of {name, dosage, started}
      diagnosis_history JSONB NOT NULL DEFAULT '[]', -- Array of {date, diagnosis, provider}
      created_at TIMESTAMP DEFAULT NOW()
    );
    
    -- visits table for assessment records
    CREATE TABLE visits (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      patient_id UUID REFERENCES patients(id),
      date TIMESTAMP DEFAULT NOW(),
      symptoms_recorded TEXT[],
      notes TEXT
    );
    
    -- prescriptions table for medication orders
    CREATE TABLE prescriptions (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      patient_id UUID REFERENCES patients(id),
      medication TEXT NOT NULL,
      dosage TEXT NOT NULL,
      status TEXT DEFAULT 'pending_physician_approval',
      created_at TIMESTAMP DEFAULT NOW(),
      blocked BOOLEAN DEFAULT FALSE,
      warnings JSONB DEFAULT '[]'
    );
    ```
  - [ ] 4.0.3 Create `backend/db/schema.sql` with above schema
  - [ ] 4.0.4 Run schema on Supabase project
  - [ ] 4.0.5 **SHARE WITH DEV 3:** Provide Supabase credentials

- [ ] **4.1 Mock Patient Data Creation**
  - [ ] 4.1.1 Create `backend/data/patients.json` with 3-5 mock patients per FR-38
  - [ ] 4.1.2 **[UPDATED]** Ensure Sarah Chen patient includes (per demo script):
    - Name: "Sarah Chen"
    - Age: 34
    - Sex: "Female"
    - Chief complaint: "Persistent cough and fever"
    - Current symptoms: ["fever", "cough", "fatigue", "chest tightness"]
    - Vital signs: {bp: "118/76", hr: 88, o2: 97, temp: 101.5}
    - Allergies: ["Penicillin"]
    - Medications: [
        {name: "Warfarin", dosage: "5mg daily", started: "2024-03-01"},
        {name: "Loratadine", dosage: "10mg daily", started: "2024-01-15"}
      ]
    - Diagnosis history: [
        {date: "2024-10-01", diagnosis: "Seasonal allergies", provider: "Dr. Smith"},
        {date: "2024-08-15", diagnosis: "Annual checkup - healthy", provider: "Dr. Smith"},
        {date: "2024-03-01", diagnosis: "Atrial fibrillation", provider: "Dr. Lee"}
      ]
  - [ ] 4.1.3 Create at least 2 additional diverse patient profiles
  - [ ] 4.1.4 **[UPDATED]** Create `backend/db/seed.sql` to insert patients with embedded JSONB data
  - [ ] 4.1.5 Run seed script on Supabase
  - [ ] 4.1.6 Verify Sarah Chen data loads correctly via SQL query
  - [ ] 4.1.7 **COMMIT:** `git commit -m "Add patient seed data"`

#### 4.2 Computer Vision - MediaPipe Integration (Hours 6-18)

- [ ] **4.2 MediaPipe Hands Setup**
  - [ ] 4.2.1 Initialize `cv-pipeline/` directory with TypeScript project
  - [ ] 4.2.2 Install MediaPipe Hands: `npm install @mediapipe/hands @mediapipe/tasks-vision`
  - [ ] 4.2.3 Configure TypeScript and Jest for CV pipeline
  - [ ] 4.2.4 Download MediaPipe Hands model files
  - [ ] 4.2.5 **[ADDED]** Document MediaPipe Hands version and fallback strategy in README

- [ ] **⚡ 4.3 MediaPipe Hands Detection - TDD**
  - [ ] 4.3.1 **WRITE TESTS FIRST:** Create `tests/mediapipeHands.test.ts`
    - Test: `initModel()` loads MediaPipe Hands successfully
    - Test: `detectHands()` returns hand landmarks from image
    - Test: `detectHands()` returns empty for image with no hands
    - Test: `detectHands()` focuses on single closest hand per FR-33
    - Test: `getHandedness()` returns 'Left' or 'Right'
    - Test: **[ADDED]** Performance: `detectHands()` processes frame in <500ms (per FR-43)
    - Test: **[ADDED]** Fallback: gracefully handles model loading failures per FR-36
    - Test: **[ADDED]** Retry logic: attempts detection for 10 seconds before timeout (per FR-10a)
  - [ ] 4.3.2 **RUN TESTS:** Confirm tests FAIL
  - [ ] 4.3.3 **COMMIT TESTS:** `git commit -m "Add MediaPipe Hands tests"`
  - [ ] 4.3.4 **IMPLEMENT:** Create `src/mediapipeHands.ts`
    - Load MediaPipe Hands model
    - Detect hand landmarks from video frames
    - Focus on single person detection per FR-33
    - Implement 10-second retry timeout per FR-10a
  - [ ] 4.3.5 **RUN TESTS:** Iterate with sample images until tests pass
  - [ ] 4.3.6 **COMMIT CODE:** `git commit -m "Implement MediaPipe Hands detection"`

- [ ] **4.4 Wrist Detection Logic - TDD**
  - [ ] 4.4.1 **WRITE TESTS FIRST:** Create `tests/wristDetection.test.ts`
    - Test: `findWrist()` identifies wrist landmark from hand data
    - Test: `findRadialPulsePoint()` calculates thumb-side wrist position
    - Test: `getWristOrientation()` returns wrist angle for AR overlay
    - Test: `validateFingerPlacement()` checks if fingers on radial pulse point
    - Test: `calculateFingerDistance()` measures distance from optimal position
    - Test: **[ADDED]** Edge case: handles missing wrist landmarks gracefully
    - Test: **[ADDED]** Accuracy: radial pulse point within 2cm of anatomical location
  - [ ] 4.4.2 **RUN TESTS:** Confirm tests FAIL
  - [ ] 4.4.3 **COMMIT TESTS:** `git commit -m "Add wrist detection tests"`
  - [ ] 4.4.4 **IMPLEMENT:** Create `src/wristDetection.ts`
    - Extract wrist position from MediaPipe landmarks
    - Calculate radial pulse point (thumb-side of wrist)
    - Validate finger positioning for training mode
  - [ ] 4.4.5 **RUN TESTS:** Iterate until all tests pass
  - [ ] 4.4.6 **COMMIT CODE:** `git commit -m "Implement wrist detection logic"`

- [ ] **4.5 [OPTIONAL] Vital Sign OCR - TDD**
  - [ ] 4.5.1 **WRITE TESTS FIRST:** Create `tests/vitalSignOCR.test.ts`
    - Test: `detectMonitor()` identifies vital sign display area
    - Test: `extractText()` reads numbers from monitor image
    - Test: `parseVitalSigns()` extracts BP, HR, O2, Temp from text
    - Test: `validateReadings()` checks if readings are realistic
    - Test: **[ADDED]** Retry logic: attempts OCR 3 times before offering skip (per FR-17a)
    - Test: **[ADDED]** Graceful failure: returns null after 3 failed attempts per FR-17
  - [ ] 4.5.2 **RUN TESTS:** Confirm tests FAIL
  - [ ] 4.5.3 **COMMIT TESTS:** `git commit -m "Add vital sign OCR tests"`
  - [ ] 4.5.4 **IMPLEMENT:** Create `src/vitalSignOCR.ts` (if time permits)
    - Use Tesseract.js or similar for OCR
    - Parse vital sign values from text
    - Implement 3-retry logic per FR-17a
    - Implement skip option per FR-17
  - [ ] 4.5.5 **RUN TESTS:** Iterate until tests pass
  - [ ] 4.5.6 **COMMIT CODE:** `git commit -m "Implement vital sign OCR (optional)"`
  - [ ] 4.5.7 **NOTE:** Mark as optional - demo can use voice input instead

#### 4.6 CV Integration with Lens Studio (Hours 18-24)

- [ ] **4.6 CV Pipeline Integration**
  - [ ] 4.6.1 **WORK WITH DEV 1:** Integrate MediaPipe Hands into cvPipeline.js
  - [ ] 4.6.2 Test wrist detection with live Spectacles camera feed
  - [ ] 4.6.3 Test radial pulse point AR overlay accuracy
  - [ ] 4.6.4 Test finger placement validation feedback
  - [ ] 4.6.5 **[ADDED]** Test 10-second retry timeout on detection failure
  - [ ] 4.6.6 **[ADDED]** Measure and log CV detection latency (target <500ms per FR-43)
  - [ ] 4.6.7 Optimize CV performance if needed
  - [ ] 4.6.8 **COMMIT:** `git commit -m "Integrate CV pipeline with Lens Studio"`

- [ ] **🔄 MERGE POINT 4 (Hour 18):**
  - [ ] 4.7.1 **HANDOFF TO DEV 1:** CV pipeline ready for training mode
  - [ ] 4.7.2 Verify training mode works with real CV detection
  - [ ] 4.7.3 Test fallback behavior when CV fails

#### 4.7 Integration Testing (Hours 24-36)

- [ ] **⚡ 4.7 Training Flow Integration Tests - TDD**
  - [ ] 4.7.1 **WRITE TESTS FIRST:** Create `tests/integration/training-flow.test.ts`
    - Test: Complete flow: start training → detect wrist → count pulse → receive feedback
    - Test: POST /api/training/start returns session_id and audio_url
    - Test: POST /api/training/feedback with 72 BPM returns "Normal range" message
    - Test: POST /api/training/feedback with 110 BPM returns "Elevated" message
    - Test: TTS audio URLs are accessible and valid
    - Test: **[ADDED]** CV failure path: 10-second retry then manual continue option
    - Test: **[ADDED]** Auto-exit: training exits after 10 seconds post-completion
    - Test: **[ADDED]** Voice prompts: verify all 7 prompts from FR-8 are triggered correctly
    - Test: **[ADDED]** End-to-end latency: full flow completes in reasonable time (<30 seconds)
  - [ ] 4.7.2 **RUN TESTS:** Confirm tests FAIL
  - [ ] 4.7.3 **COMMIT TESTS:** `git commit -m "Add training flow integration tests"`
  - [ ] 4.7.4 **WORK WITH DEV 1 & 3:** Fix integration issues
  - [ ] 4.7.5 **RUN TESTS:** Iterate until all tests pass
  - [ ] 4.7.6 **COMMIT FIXES:** `git commit -m "Fix training flow integration issues"`

- [ ] **⚡ 4.8 Clinical Flow Integration Tests - TDD**
  - [ ] 4.8.1 **WRITE TESTS FIRST:** Create `tests/integration/clinical-flow.test.ts`
    - Test: Complete flow: load patient → record symptom → get decision support
    - Test: POST /api/clinical/patient/load with "Sarah Chen" returns full patient data
    - Test: Patient data includes Warfarin medication
    - Test: POST /api/clinical/symptom/record adds symptom to session
    - Test: POST /api/clinical/decision-support returns diagnosis and recommendations
    - Test: Decision support includes TTS audio_url
    - Test: **[ADDED]** Patient not found: 3-retry logic then patient list offer per FR-14a
    - Test: **[ADDED]** Voice commands: test all FR-15 commands work correctly
    - Test: **[ADDED]** Auto-exit: clinical exits after 120 seconds inactivity per FR-12a
    - Test: **[ADDED]** Mode switching: switch from clinical to training auto-exits clinical per FR-12b
  - [ ] 4.8.2 **RUN TESTS:** Confirm tests FAIL
  - [ ] 4.8.3 **COMMIT TESTS:** `git commit -m "Add clinical flow integration tests"`
  - [ ] 4.8.4 **WORK WITH DEV 2 & 3:** Fix integration issues
  - [ ] 4.8.5 **RUN TESTS:** Iterate until all tests pass
  - [ ] 4.8.6 **COMMIT FIXES:** `git commit -m "Fix clinical flow integration issues"`

- [ ] **⚡ 4.9 Prescription Flow Integration Tests - TDD**
  - [ ] 4.9.1 **WRITE TESTS FIRST:** Create `tests/integration/prescription-flow.test.ts`
    - Test: POST /api/clinical/prescription/create with Acetaminophen (safe) → success response
    - Test: POST /api/clinical/prescription/create with Ibuprofen (Warfarin patient) → blocked response
    - Test: Blocked prescription includes HIGH severity warning
    - Test: Blocked prescription includes Acetaminophen as alternative
    - Test: Blocked prescription includes TTS audio_url with warning
    - Test: Success prescription includes green checkmark ar_display config
    - Test: Success prescription includes "PENDING" badge per FR-26a
    - Test: Success prescription includes TTS audio_url
    - Test: Prescription logged even when blocked (for audit)
    - Test: **[ADDED]** Unknown medication: returns error message per FR-22a
    - Test: **[ADDED]** Unknown medication: suggests "Show available medications" command
    - Test: **[ADDED]** All 8 medications from FR-22 are in database and prescribable
  - [ ] 4.9.2 **RUN TESTS:** Confirm tests FAIL
  - [ ] 4.9.3 **COMMIT TESTS:** `git commit -m "Add prescription flow integration tests"`
  - [ ] 4.9.4 **WORK WITH DEV 2 & 3:** Fix integration issues
  - [ ] 4.9.5 **RUN TESTS:** Iterate until all tests pass
  - [ ] 4.9.6 **COMMIT FIXES:** `git commit -m "Fix prescription flow integration issues"`

- [ ] **🔄 MERGE POINT 5 (Hour 36):**
  - [ ] 4.10.1 Run full integration test suite: `npm run test:integration`
  - [ ] 4.10.2 **[ADDED]** Verify all critical acceptance criteria pass (AC-T1-T6, AC-C1-C6, AC-P1-P5)
  - [ ] 4.10.3 Document test results and coverage
  - [ ] 4.10.4 Create integration test report
  - [ ] 4.10.5 Tag release: `v0.9-integration-complete`

#### 4.10 System Integration & Bug Fixes (Hours 36-42)

- [ ] **4.10 Cross-Team Integration**
  - [ ] 4.10.1 Test Dev 1's training mode with real backend
  - [ ] 4.10.2 Test Dev 2's clinical mode with real backend
  - [ ] 4.10.3 Test mode switching between training and clinical
  - [ ] 4.10.4 Test voice commands work in all scenarios
  - [ ] 4.10.5 Test AR overlays render correctly with real data
  - [ ] 4.10.6 Test prescription workflow end-to-end (Sarah Chen + Warfarin scenario)
  - [ ] 4.10.7 **[ADDED]** Test demo mode: verify all features work with DEMO_MODE=true
  - [ ] 4.10.8 Measure end-to-end latency (target <3 seconds per FR-42)

- [ ] **4.11 Performance Testing**
  - [ ] 4.11.1 **[UPDATED]** Automated performance test: AR rendering maintains 30+ FPS (per FR-41)
  - [ ] 4.11.2 **[UPDATED]** Automated performance test: CV detection completes in <500ms (per FR-43)
  - [ ] 4.11.3 **[UPDATED]** Automated performance test: API responses in <3s (per FR-42)
  - [ ] 4.11.4 **[UPDATED]** Automated performance test: TTS generation in <1.5s (per FR-44)
  - [ ] 4.11.5 Test response cache hit rate (target >50% per FR-44a)
  - [ ] 4.11.6 Profile memory usage on Spectacles
  - [ ] 4.11.7 **[ADDED]** Create performance benchmark script for CI/CD
  - [ ] 4.11.8 Document performance metrics and bottlenecks

- [ ] **4.12 Bug Tracking & Fixes**
  - [ ] 4.12.1 Create bug tracking document (GitHub Issues or shared doc)
  - [ ] 4.12.2 Prioritize bugs: Critical (blocks demo), High, Medium, Low
  - [ ] 4.12.3 Fix critical bugs with appropriate devs
  - [ ] 4.12.4 Test fixes and verify no regressions
  - [ ] 4.12.5 Document known issues and workarounds
  - [ ] 4.12.6 **[ADDED]** Create known issues section in README

- [ ] **4.13 Demo Preparation Support**
  - [ ] 4.13.1 Verify all 3+ mock patients are in database
  - [ ] 4.13.2 Verify Sarah Chen has Warfarin medication for drug interaction demo
  - [ ] 4.13.3 Test complete demo script 5+ times end-to-end
  - [ ] 4.13.4 Record demo video as backup
  - [ ] 4.13.5 Create demo environment checklist
  - [ ] 4.13.6 **[ADDED]** Test demo mode as complete fallback if APIs fail
  - [ ] 4.13.7 **[ADDED]** Prepare fallback plan documentation
  - [ ] 4.13.8 **[ADDED]** Create demo rehearsal checklist with timing

---

### 🎯 Final Integration & Demo (Hours 42-48) - All Devs

- [ ] **5.0 Demo Rehearsal (Hour 42-44)**
  - [ ] 5.0.1 **ALL DEVS:** Run through complete 3-minute demo script
  - [ ] 5.0.2 Verify training mode demo (pulse taking) works flawlessly
  - [ ] 5.0.3 Verify clinical mode demo (Sarah Chen assessment) works
  - [ ] 5.0.4 Verify prescription warning (Ibuprofen + Warfarin) displays correctly
  - [ ] 5.0.5 Practice presenter narration and timing
  - [ ] 5.0.6 Identify any remaining issues
  - [ ] 5.0.7 Fix critical issues immediately
  - [ ] 5.0.8 Run demo 3 times successfully in a row
  - [ ] 5.0.9 **[ADDED]** Test demo mode fallback works
  - [ ] 5.0.10 **[ADDED]** Verify all voice prompts match FR-8 and FR-15 exactly

- [ ] **5.1 Polish & Optimization (Hour 44-46)**
  - [ ] 5.1.1 Optimize AR overlay visuals for clarity
  - [ ] 5.1.2 Verify TTS audio quality and volume
  - [ ] 5.1.3 Test in demo environment (lighting, WiFi, etc.)
  - [ ] 5.1.4 Charge Spectacles hardware to 100%
  - [ ] 5.1.5 Prepare backup Spectacles if available
  - [ ] 5.1.6 Print demo script reference card
  - [ ] 5.1.7 Prepare fallback demo video
  - [ ] 5.1.8 **[ADDED]** Create emergency troubleshooting guide

- [ ] **5.2 Documentation & Presentation (Hour 46-48)**
  - [ ] 5.2.1 Create presentation slides (3-5 slides max)
  - [ ] 5.2.2 Include architecture diagram
  - [ ] 5.2.3 Include sponsor technology callouts (Fish Audio, Gemini, Letta, Snap)
  - [ ] 5.2.4 Highlight key differentiators (hands-free, AI-powered, dual-mode)
  - [ ] 5.2.5 Finalize README.md with setup instructions
  - [ ] 5.2.6 Document known issues and future enhancements
  - [ ] 5.2.7 Prepare for Q&A (technical questions, scalability, HIPAA, etc.)
  - [ ] 5.2.8 **[ADDED]** Create technical appendix for judges with API docs
  - [ ] 5.2.9 **[ADDED]** Prepare answers to anticipated questions (HIPAA, scalability, accuracy)

- [ ] **5.3 Final Checklist**
  - [ ] 5.3.1 **Hardware:** Spectacles charged, backup device ready
  - [ ] 5.3.2 **Network:** WiFi stable, backend accessible from venue
  - [ ] 5.3.3 **Backend:** Railway deployment healthy, all 10 APIs responding **[UPDATED]**
  - [ ] 5.3.4 **Database:** Supabase accessible, seed data loaded correctly
  - [ ] 5.3.5 **APIs:** Gemini, Fish Audio, Letta - all keys valid and not rate-limited
  - [ ] 5.3.6 **Demo:** Tested successfully 5+ times end-to-end
  - [ ] 5.3.7 **Backup:** Demo video ready to play if live demo fails
  - [ ] 5.3.8 **Backup:** Demo mode (DEMO_MODE=true) tested and working **[ADDED]**
  - [ ] 5.3.9 **Presentation:** Slides loaded, presenter ready
  - [ ] 5.3.10 **Team:** All devs available for emergency fixes

---

## 🔄 Merge Schedule & Integration Points

### Hour 6 → Foundation
- **Dev 4 → Dev 3:** Supabase credentials + schema
- **Dev 0 → All:** Demo mode configuration established

### Hour 12 → First Integration
- **Dev 1 → Main:** AR foundation + voice controller
- **Dev 1 → Dev 2:** AR component library handoff
- **Dev 3 → Main:** Backend core + database connection
- **Dev 3 → Dev 1 & 2:** Railway URL

### Hour 24 → Feature Complete
- **Dev 2 → Main:** Clinical mode UI
- **Dev 3 → Main:** All API endpoints (10 total: training x2, clinical x3, prescription x1, voice x2, TTS x2) **[UPDATED]**
- **Dev 4 → Dev 1:** CV pipeline
- **ALL:** Test integration points

### Hour 36 → Demo Ready
- **All → Main:** Final integration
- **Dev 4:** Sign off on integration tests passing
- **ALL:** Demo rehearsal

### Hour 42 → Polish
- **ALL:** Bug fixes and optimization
- **ALL:** Demo practice (3+ successful runs)

### Hour 48 → Showtime
- **ALL:** Final presentation

---

## 📝 Testing Notes

### TDD Workflow
1. **Write tests first** - Define expected behavior before implementation
2. **Run tests** - Confirm they FAIL (no implementation exists yet)
3. **Commit tests** - Preserve test-first approach in git history
4. **Implement code** - Write minimum code to pass tests
5. **Run tests** - Iterate until all tests pass
6. **Verify** - Ensure implementation doesn't overfit to tests
7. **Commit code** - Separate commit for implementation

### Test Commands
- **Unit tests:** `npx jest tests/unit/` or `npm run test:unit`
- **Integration tests:** `npx jest tests/integration/` or `npm run test:integration`
- **All tests:** `npx jest` or `npm test`
- **Watch mode:** `npx jest --watch`
- **Coverage:** `npx jest --coverage`

### Test Coverage Targets
- Unit tests: 80%+ coverage for services and controllers
- Integration tests: 100% coverage for critical paths (training, clinical, prescription)
- E2E tests: All demo scenarios working
- **[ADDED]** Acceptance criteria tests: All AC-T, AC-C, AC-P, AC-V tests passing

### Performance Testing Requirements **[ADDED]**
- AR rendering: 30+ FPS (FR-41)
- CV detection: <500ms latency (FR-43)
- API responses: <3 seconds (FR-42)
- TTS generation: <1.5 seconds (FR-44)
- Cache hit rate: >50% (FR-44a)

---

## 🚨 Critical Path Items (Must Work for Demo)

1. ⚡ Training mode: Complete pulse-taking demo (Dev 1)
2. ⚡ Clinical mode: Sarah Chen assessment (Dev 2)
3. ⚡ Prescription: Drug interaction warning (Dev 2 + Dev 3)
4. ⚡ Voice commands: Wake word + in-session commands (Dev 1)
5. ⚡ AR overlays: Pulse point circle + patient card (Dev 1 + Dev 2)
6. ⚡ Backend API: All 10 endpoints working **[UPDATED: was 8, now 10]**
7. ⚡ TTS: All voice responses natural and clear (Dev 3)
8. ⚡ Database: 3+ mock patients with Sarah Chen having Warfarin (Dev 4)
9. ⚡ Integration: End-to-end flows tested (Dev 4)
10. ⚡ Performance: <3 second response time, 30+ FPS (All)
11. **[ADDED]** ⚡ Demo mode: Working fallback if APIs fail (All)
12. **[ADDED]** ⚡ Voice prompt accuracy: All prompts match FR-8 and FR-15 exactly (Dev 1 + Dev 2)

---

## 📋 Changes Applied from Deep Analysis

### Critical Issues Fixed (8):
1. ✅ Added missing API endpoints: `/api/voice/command` and `/api/tts/generate` (Task 3.11.10)
2. ✅ Resolved database schema: Using JSONB in patients table per PRD FR-37 (Task 4.0.2)
3. ✅ Clarified medication database: 7-10 medications with 8 baseline (Tasks 3.7.1, 2.4.1)
4. ✅ Added "Show available medications" voice command (Tasks 1.2.1, 2.4.4)
5. ✅ Fixed mode exit inactivity timers: 10s training, 120s clinical (Tasks 1.5.1, 2.1.1)
6. ✅ Implemented audio beep vs visual indicator logic (Task 1.1.1, 1.2.1)
7. ✅ Added CV retry logic: 10-second timeout with skip option (Tasks 1.3.1, 1.6.1)
8. ✅ Added Letta context window details: 20 turns / 4000 tokens (Task 3.4.1)

### Moderate Issues Fixed (12):
9. ✅ Added demo mode configuration flag (Tasks 0.10, 3.0.10, throughout)
10. ✅ Added voice prompt validation tests (Tasks 1.6.1, 2.3.1)
11. ✅ Enhanced error message testing (Tasks 1.6.1, 2.3.1)
12. ✅ Detailed TTS caching strategy (Task 3.6.1)
13. ✅ Added CV fallback implementation details (Task 4.3.1)
14. ✅ Added automated performance tests (Tasks 1.8.3-1.8.4, 4.11.1-4.11.4)
15. ✅ Marked OCR as optional with graceful skip (Task 4.5)
16. ✅ Added missing acceptance criteria tests (Tasks 4.7.1, 4.8.1, 4.9.1)
17. ✅ Enhanced edge case coverage (Multiple tasks)
18. ✅ Added "Repeat instructions" command (Tasks 1.2.1, 2.3.1)
19. ✅ Added mode switching tests (Task 2.1.1)
20. ✅ Added integration test ordering (Tasks 4.7-4.9)

### Minor Improvements (15):
21-35. ✅ Added documentation enhancements, asset organization, profiling tools, code review notes, and other polish items throughout

---

## 📊 PRD Coverage Summary

**Functional Requirements:** 45/45 covered (100%)  
**API Endpoints:** 10/10 covered (100%) - **[UPDATED: was 6/8]**  
**User Stories:** 10/10 covered (100%)  
**Acceptance Criteria:** 100% covered with automated tests  
**Performance Requirements:** All specified and testable

---

**END OF TASK LIST v2.0**
