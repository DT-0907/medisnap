# Implementation Checklist: Lens Studio TypeScript Integration

Use this checklist to track progress through the implementation. Mark items complete as you go.

## Phase 1: Build System Setup (2 hours)

### 1.1 Package Configuration
- [ ] Create `lens-studio/package.json`
- [ ] Install dependencies: `npm install`
- [ ] Verify build script works: `npm run build`
- [ ] Verify watch mode works: `npm run dev`
- [ ] Commit: `git commit -m "feat: Add TypeScript build system"`

### 1.2 TypeScript Configuration
- [ ] Create `lens-studio/tsconfig.json`
- [ ] Configure target: ES2020
- [ ] Configure module: commonjs
- [ ] Enable experimental decorators
- [ ] Configure path aliases (@types, @ar-overlays, etc.)
- [ ] Test compilation: `npm run type-check`
- [ ] Commit: `git commit -m "feat: Add TypeScript configuration"`

### 1.3 Git Configuration
- [ ] Create `lens-studio/.gitignore`
- [ ] Add node_modules/ to gitignore
- [ ] Add dist/ to gitignore
- [ ] Verify MedSnap.lsproj/ NOT ignored
- [ ] Commit: `git commit -m "chore: Add gitignore for TypeScript build"`

**Phase 1 Validation**:
- [ ] `npm run build` succeeds
- [ ] `npm run dev` starts watch mode
- [ ] No TypeScript errors
- [ ] Git status clean (ignored files not tracked)

---

## Phase 2: Type Definitions (2 hours)

### 2.1 Lens Studio API Types
- [ ] Create `lens-studio/src/types/lens-studio.d.ts`
- [ ] Copy base types from marvin reference
- [ ] Add vec3, vec2, vec4, quat, mat4 types
- [ ] Add Script, SceneObject, Component types
- [ ] Add RemoteServiceModule, Request, Response types
- [ ] Add AudioComponent, AudioTrack types
- [ ] Add Text, ScreenTransform types
- [ ] Add UpdateEvent, SceneEvent types
- [ ] Test compilation: `npm run type-check`
- [ ] Commit: `git commit -m "feat: Add Lens Studio type definitions"`

### 2.2 MedSnap Core Types
- [ ] Create `lens-studio/src/types/core.ts`
- [ ] Add AppMode enum (IDLE, CLINICAL, TRAINING)
- [ ] Add ClinicalState enum (states per FR-12)
- [ ] Add PatientData interface
- [ ] Add VitalSigns, Medication, Diagnosis interfaces
- [ ] Add PrescriptionData, DrugInteractionWarning interfaces
- [ ] Add VoiceCommand, VoiceIntent types
- [ ] Add AROverlayConfig, OverlayStyle interfaces
- [ ] Add AR_COLORS constants (per FR AR-1)
- [ ] Add MedSnapConfig interface
- [ ] Add API response types
- [ ] Add PerformanceMetrics interface
- [ ] Test compilation: `npm run type-check`
- [ ] Commit: `git commit -m "feat: Add MedSnap core type definitions"`

**Phase 2 Validation**:
- [ ] All types compile without errors
- [ ] Can import types in test files
- [ ] No circular dependencies
- [ ] Type autocomplete works in IDE

---

## Phase 3: AR System Core (4 hours)

### 3.1 MedSnapARSystem (TDD Step 1: Write Tests)
- [ ] Create `lens-studio/__tests__/ar-system.test.ts`
- [ ] Write test: "should be constructible with config"
- [ ] Write test: "should have initialize method"
- [ ] Write test: "should have lifecycle methods (start, stop, update, dispose)"
- [ ] Write test: "should throw if started before initialized"
- [ ] Run tests: `npm test` → FAIL (expected)
- [ ] Commit: `git commit -m "test: Add MedSnapARSystem tests (TDD Step 1)"`

### 3.2 MedSnapARSystem (TDD Step 2: Implement)
- [ ] Create `lens-studio/src/MedSnapARSystem.ts`
- [ ] Add constructor accepting MedSnapConfig
- [ ] Add initialize() method signature
- [ ] Add start(), stop(), update(), dispose() methods
- [ ] Add component storage (overlayManager, voiceController, etc.)
- [ ] Add state flags (isInitialized, isRunning)
- [ ] Implement basic initialization logic
- [ ] Implement basic lifecycle methods
- [ ] Run tests: `npm test` → PASS
- [ ] Commit: `git commit -m "feat: Implement MedSnapARSystem (TDD Step 2)"`

### 3.3 Lens Studio Entry Point (TDD Step 1: Write Tests)
- [ ] Create `lens-studio/__tests__/annotations.test.sh`
- [ ] Test: @input annotations preserved after build
- [ ] Run test: `bash __tests__/annotations.test.sh` → FAIL (expected)
- [ ] Commit: `git commit -m "test: Add entry point annotation test (TDD Step 1)"`

### 3.4 Lens Studio Entry Point (TDD Step 2: Implement)
- [ ] Create `lens-studio/src/lens-studio-entry.ts`
- [ ] Add @input annotations for Lens Studio Inspector
- [ ] Add global type declarations (script, sceneRoot, etc.)
- [ ] Create MedSnapARSystem instance variable
- [ ] Bind SceneEvent.OnStart → initializeSystem()
- [ ] Bind UpdateEvent → medSnapSystem.update()
- [ ] Bind SceneEvent.OnDestroy → medSnapSystem.dispose()
- [ ] Add global debug API (global.medSnap)
- [ ] Add error handling with try-catch
- [ ] Build: `npm run build`
- [ ] Verify @input in dist/lens-studio-entry.js
- [ ] Run test: `bash __tests__/annotations.test.sh` → PASS
- [ ] Commit: `git commit -m "feat: Implement Lens Studio entry point (TDD Step 2)"`

**Phase 3 Validation**:
- [ ] All unit tests pass: `npm test`
- [ ] Build succeeds: `npm run build`
- [ ] dist/lens-studio-entry.js exists
- [ ] @input annotations preserved
- [ ] No TypeScript errors

---

## Phase 4: Component Implementations (6 hours)

### 4.1 Overlay Manager (TDD Step 1: Write Tests)
- [ ] Create `lens-studio/__tests__/overlay-manager.test.ts`
- [ ] Write test: "should create overlay with config"
- [ ] Write test: "should remove overlay by id"
- [ ] Write test: "should not throw when removing non-existent overlay"
- [ ] Write test: "should enforce max overlay limit"
- [ ] Write test: "should dispose all overlays"
- [ ] Run tests: `npm test` → FAIL (expected)
- [ ] Commit: `git commit -m "test: Add OverlayManager tests (TDD Step 1)"`

### 4.2 Overlay Manager (TDD Step 2: Implement)
- [ ] Create `lens-studio/src/AROverlays/OverlayManager.ts`
- [ ] Reference marvin's OverlayManager pattern
- [ ] Add createOverlay() method
- [ ] Add removeOverlay() method
- [ ] Add updateOverlay() method
- [ ] Add attachToPosition() method
- [ ] Add updateBillboards() method (for update loop)
- [ ] Add fadeIn(), fadeOut() animation methods
- [ ] Add checkExpiredOverlays() method
- [ ] Add dispose() method
- [ ] Adapt colors to AR_COLORS (cyan, yellow, red, green)
- [ ] Run tests: `npm test` → PASS
- [ ] Commit: `git commit -m "feat: Implement OverlayManager (TDD Step 2)"`

### 4.3 Voice Controller
- [ ] Create `lens-studio/src/Voice/VoiceController.ts`
- [ ] Add initialize() method
- [ ] Add startListening(), stopListening() methods
- [ ] Add onTranscription() callback registration
- [ ] Add dispose() method
- [ ] Note: Full ASR integration may be backend-based (placeholder OK)
- [ ] Commit: `git commit -m "feat: Add VoiceController (placeholder)"`

### 4.4 Audio Player
- [ ] Create `lens-studio/src/Voice/AudioPlayer.ts`
- [ ] Add initialize(audioComponent) method
- [ ] Add playFromUrl(url) async method
- [ ] Add stop() method
- [ ] Add isPlaying() method
- [ ] Add dispose() method
- [ ] Commit: `git commit -m "feat: Implement AudioPlayer"`

### 4.5 State Manager (TDD Step 1: Write Tests)
- [ ] Create `lens-studio/__tests__/state-manager.test.ts`
- [ ] Write test: "should initialize in IDLE mode"
- [ ] Write test: "should switch to CLINICAL mode"
- [ ] Write test: "should update clinical state"
- [ ] Write test: "should store and retrieve patient data"
- [ ] Write test: "should emit state change events"
- [ ] Write test: "should reset to initial state"
- [ ] Run tests: `npm test` → FAIL (expected)
- [ ] Commit: `git commit -m "test: Add StateManager tests (TDD Step 1)"`

### 4.6 State Manager (TDD Step 2: Implement)
- [ ] Create `lens-studio/src/State/StateManager.ts`
- [ ] Add getCurrentMode(), setMode() methods
- [ ] Add getClinicalState(), setClinicalState() methods
- [ ] Add getCurrentPatient(), setCurrentPatient() methods
- [ ] Add onStateChange() event registration
- [ ] Add reset() method
- [ ] Implement event emitter pattern
- [ ] Run tests: `npm test` → PASS
- [ ] Commit: `git commit -m "feat: Implement StateManager (TDD Step 2)"`

### 4.7 Mode Manager (Foundation for Dev 2 Task 2.1)
- [ ] Create `lens-studio/src/State/ModeManager.ts`
- [ ] Add initialize(stateManager) method
- [ ] Add switchMode(mode) method
- [ ] Add getCurrentMode() method
- [ ] Add canSwitchTo(mode) validation
- [ ] Add exitCurrentMode() cleanup
- [ ] Add dispose() method
- [ ] Note: This is foundation only, full implementation in Task 2.1
- [ ] Commit: `git commit -m "feat: Add ModeManager foundation (for Task 2.1)"`

**Phase 4 Validation**:
- [ ] All component tests pass: `npm test`
- [ ] Build succeeds: `npm run build`
- [ ] No TypeScript errors
- [ ] All components have dispose() methods

---

## Phase 5: Network Client (2 hours)

### 5.1 API Client (TDD Step 1: Write Tests)
- [ ] Create `lens-studio/__tests__/api-client.test.ts`
- [ ] Write test: "should initialize with config"
- [ ] Write test: "should make patient load request"
- [ ] Write test: "should handle request timeout"
- [ ] Write test: "should handle HTTP errors"
- [ ] Run tests: `npm test` → FAIL (expected)
- [ ] Commit: `git commit -m "test: Add APIClient tests (TDD Step 1)"`

### 5.2 API Client (TDD Step 2: Implement)
- [ ] Create `lens-studio/src/Network/APIClient.ts`
- [ ] Add initialize(remoteService, config) method
- [ ] Add loadPatient(patientName) method
- [ ] Add recordSymptom(symptom) method
- [ ] Add createPrescription(medication, dosage) method
- [ ] Add extractIntent(transcription) method
- [ ] Add generateTTS(text) method
- [ ] Implement private makeRequest(endpoint, method, body) helper
- [ ] Add timeout handling
- [ ] Add error handling with retries
- [ ] Add dispose() method
- [ ] Run tests: `npm test` → PASS
- [ ] Commit: `git commit -m "feat: Implement APIClient (TDD Step 2)"`

**Phase 5 Validation**:
- [ ] APIClient tests pass
- [ ] Build succeeds: `npm run build`
- [ ] Can make HTTP requests (test with mock)
- [ ] Timeout logic works

---

## Phase 6: Lens Studio Integration (2 hours)

### 6.1 Build and Import
- [ ] Build TypeScript: `npm run build`
- [ ] Verify dist/lens-studio-entry.js exists
- [ ] Open Lens Studio project
- [ ] Import dist/lens-studio-entry.js into Resources
- [ ] Verify script appears in Resources panel

### 6.2 Scene Setup
- [ ] Create MedSnapSystem scene object
- [ ] Add Script component to MedSnapSystem
- [ ] Assign lens-studio-entry.js to Script component
- [ ] Create SceneRoot scene object
- [ ] Create RemoteServiceModule scene object
  - [ ] Add RemoteServiceModule component
  - [ ] Configure backend URL (http://localhost:3000)
- [ ] Create AudioPlayer scene object
  - [ ] Add AudioComponent component

### 6.3 Component Wiring
- [ ] Select MedSnapSystem object
- [ ] Verify @input fields appear in Inspector:
  - [ ] sceneRoot
  - [ ] remoteService
  - [ ] audioComponent
- [ ] Wire sceneRoot: drag SceneRoot object to input
- [ ] Wire remoteService: drag RemoteServiceModule component to input
- [ ] Wire audioComponent: drag AudioComponent component to input

### 6.4 Integration Testing
- [ ] Test 5.1: System Initialization
  - [ ] Click Play
  - [ ] Open Logs (View → Logs)
  - [ ] Verify initialization logs
  - [ ] Mark PASS/FAIL in test-plan.md
- [ ] Test 5.2: Update Loop
  - [ ] Enable performance monitoring
  - [ ] Play scene
  - [ ] Watch for performance logs
  - [ ] Mark PASS/FAIL in test-plan.md
- [ ] Test 5.3: System Cleanup
  - [ ] Play scene
  - [ ] Stop scene
  - [ ] Verify dispose logs
  - [ ] Play again (re-initialization test)
  - [ ] Mark PASS/FAIL in test-plan.md
- [ ] Test 5.4: API Request (requires backend running)
  - [ ] Start backend: `cd backend && npm run dev`
  - [ ] Test API call via debug console
  - [ ] Verify HTTP request sent and response received
  - [ ] Mark PASS/FAIL in test-plan.md

**Phase 6 Validation**:
- [ ] All integration tests PASS
- [ ] System initializes without errors
- [ ] Update loop runs smoothly
- [ ] System disposes cleanly
- [ ] Can make API requests

---

## Final Acceptance Criteria

### Build System
- [ ] `npm run build` succeeds without errors
- [ ] `npm run dev` watch mode works
- [ ] `npm run type-check` passes
- [ ] dist/lens-studio-entry.js generated correctly
- [ ] @input annotations preserved in output

### Type Safety
- [ ] All TypeScript files compile without errors
- [ ] No `any` types except in Lens Studio globals
- [ ] IDE autocomplete works for all types
- [ ] No circular dependency errors

### Core System
- [ ] MedSnapARSystem initializes successfully
- [ ] All @input components wire correctly in Inspector
- [ ] Scene lifecycle events fire (OnStart, OnDestroy, UpdateEvent)
- [ ] Update loop runs at target FPS
- [ ] System disposes cleanly on scene unload

### Components
- [ ] OverlayManager can create/remove overlays
- [ ] VoiceController foundation in place
- [ ] AudioPlayer can play TTS audio
- [ ] StateManager manages app state
- [ ] ModeManager foundation ready for Task 2.1
- [ ] APIClient can make HTTP requests

### Testing
- [ ] All unit tests pass: `npm test`
- [ ] All integration tests pass (5.1-5.4)
- [ ] Performance meets FR-41 (≥30 FPS)
- [ ] No memory leaks on scene reload

### Developer Experience
- [ ] Hot reload works (`npm run dev`)
- [ ] Debug API accessible (global.medSnap)
- [ ] Console logs helpful for debugging
- [ ] Documentation clear and complete

### Readiness for Dev 2 Tasks
- [ ] Can implement Task 2.1: Mode Manager (extend ModeManager.ts)
- [ ] Can implement Task 2.2: Patient Card Renderer (use OverlayManager)
- [ ] Can implement Task 2.3: Clinical Mode State Machine (use StateManager)
- [ ] Can implement Task 2.4: Prescription UI (use OverlayManager + AudioPlayer)

---

## Sign-Off

**Implementation Complete**: YES / NO
**Date**: __________
**Developer**: __________

**All Tests Passing**: YES / NO
**Ready for Dev 2 Tasks**: YES / NO

**Notes/Issues**: __________________________________________

---

## Post-Implementation

After all checkboxes are complete:

1. [ ] Update CLAUDE.md with TypeScript workflow instructions
2. [ ] Create Dev 2 Task 2.1 spec (Mode Manager implementation)
3. [ ] Archive this spec folder as reference
4. [ ] Celebrate! You have a working TypeScript foundation for Lens Studio!

**Estimated Time to Complete All Phases**: 12-18 hours
**Actual Time Taken**: __________ hours
