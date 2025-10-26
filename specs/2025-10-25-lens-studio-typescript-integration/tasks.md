# Lens Studio TypeScript Integration - Task List

**Document Type**: Implementation Task Breakdown
**Created**: 2025-10-25
**Status**: Ready for Implementation
**Estimated Total Effort**: 12-18 hours
**Critical Path**: All tasks blocking Dev 2 clinical mode implementation

---

## Overview

This task list breaks down the Lens Studio TypeScript integration into concrete, actionable tasks. Tasks are organized by phase, with dependencies clearly marked and parallelization opportunities identified.

**Context**: This is an UPGRADE of an existing codebase:
- Backend: FULLY IMPLEMENTED (Node.js/Express/Supabase with passing tests)
- Frontend: PLACEHOLDER JavaScript files in `/lens-studio/Public/Scripts/`
- Reference: Working marvin TypeScript AR system with proven Lens Studio patterns
- Goal: Replace placeholders with production TypeScript system following marvin patterns

**TDD Workflow Required**: Every implementation task MUST follow the workflow defined in CLAUDE.md

---

## Phase 1: Build System Foundation (2 hours)

**Goal**: Establish TypeScript build pipeline for Lens Studio compatibility

**Dependencies**: None (can start immediately)

**Critical Path**: YES - All other phases depend on this

### Task 1.1: Create Package Configuration (30 min)

**File**: `/Users/jasonyi/snaplens-code/lens-studio/package.json`

**Steps**:
1. Create new package.json in lens-studio/ directory
2. Add TypeScript 5.3.3 as devDependency
3. Add build scripts:
   - `build`: TypeScript compilation
   - `dev`: Watch mode for hot reload
   - `clean`: Remove dist/ directory
   - `type-check`: Type checking without emit
4. Add ESLint dependencies for code quality
5. Test: `npm install` succeeds

**Acceptance Criteria**:
- [ ] `npm install` completes without errors
- [ ] All dependencies installed in node_modules/
- [ ] package.json valid JSON

**Deliverable**: Working package.json with all build scripts defined

**Commit**: `git commit -m "feat: Add TypeScript build system configuration"`

---

### Task 1.2: Configure TypeScript Compiler (30 min)

**File**: `/Users/jasonyi/snaplens-code/lens-studio/tsconfig.json`

**Steps**:
1. Create tsconfig.json in lens-studio/ directory
2. Set target to ES2020 (Lens Studio JavaScript engine compatibility)
3. Set module to commonjs (Lens Studio requirement)
4. Enable experimentalDecorators (for @input annotations)
5. Set removeComments to false (CRITICAL: preserve @input annotations)
6. Configure path aliases (@types, @ar-overlays, @voice, etc.)
7. Set strict mode for type safety
8. Configure outDir to ./dist
9. Test: `npm run type-check` succeeds (even with empty src/)

**Acceptance Criteria**:
- [ ] TypeScript compiler runs without configuration errors
- [ ] Comments preservation enabled (removeComments: false)
- [ ] Path aliases work in IDE autocomplete

**Deliverable**: TypeScript configuration matching Lens Studio requirements

**Commit**: `git commit -m "feat: Configure TypeScript compiler for Lens Studio"`

---

### Task 1.3: Setup Git Ignore and Directory Structure (15 min)

**Files**:
- `/Users/jasonyi/snaplens-code/lens-studio/.gitignore`
- Create `/Users/jasonyi/snaplens-code/lens-studio/src/` directory

**Steps**:
1. Create .gitignore in lens-studio/
2. Add node_modules/ to ignore
3. Add dist/ to ignore
4. Ensure MedSnap.lsproj/ NOT ignored (keep Lens Studio project)
5. Create src/ directory for TypeScript source
6. Create subdirectories: types/, AROverlays/, Voice/, State/, Clinical/, Network/
7. Test: Git status shows correct ignored files

**Acceptance Criteria**:
- [ ] node_modules/ ignored by git
- [ ] dist/ ignored by git
- [ ] MedSnap.lsproj/ tracked by git
- [ ] All src subdirectories created

**Deliverable**: Proper git ignore configuration and source directory structure

**Commit**: `git commit -m "chore: Setup git ignore and source directories"`

---

### Task 1.4: Validate Build Pipeline (45 min)

**Steps**:
1. Create minimal test TypeScript file in src/
2. Run `npm run build` - should succeed and create dist/
3. Run `npm run dev` - watch mode should start
4. Make change to test file - should auto-rebuild
5. Run `npm run clean` - should remove dist/
6. Verify source maps generated in dist/
7. Verify declaration files (.d.ts) generated

**Acceptance Criteria**:
- [ ] `npm run build` succeeds with minimal TypeScript file
- [ ] dist/ directory created with .js, .d.ts, .js.map files
- [ ] Watch mode detects changes and rebuilds
- [ ] Clean script removes dist/ completely

**Deliverable**: Fully functional TypeScript build pipeline

**Commit**: `git commit -m "test: Validate TypeScript build pipeline"`

---

## Phase 2: Type System Foundation (2 hours)

**Goal**: Define all type definitions for Lens Studio API and MedSnap domain

**Dependencies**: Phase 1 complete (build system must work)

**Critical Path**: YES - All component implementations need these types

**Parallelization**: Tasks 2.1 and 2.2 can be done by different developers simultaneously

### Task 2.1: Copy and Adapt Lens Studio API Types (1 hour)

**File**: `/Users/jasonyi/snaplens-code/lens-studio/src/types/lens-studio.d.ts`

**Steps**:
1. Copy base file from marvin: `/Users/jasonyi/snaplens-code/marvin/ar-core/src/types/lens-studio.d.ts`
2. Review and adapt for MedSnap needs:
   - Keep: vec3, vec2, vec4, quat, mat4 (math types)
   - Keep: Script, SceneObject, Component, Transform (scene types)
   - Keep: UpdateEvent, SceneEvent, TapEvent (events)
   - EXTEND: Add AudioComponent, AudioTrack types (not in marvin)
   - EXTEND: Add AsrModule type for voice recognition
   - EXTEND: Add RemoteServiceModule, Request, Response (networking)
   - EXTEND: Add Text, ScreenTransform, BackgroundSettings (AR rendering)
3. Verify all types needed for Dev 2 tasks are present
4. Add JSDoc comments for unclear APIs
5. Test: `npm run type-check` succeeds

**Reference Files**:
- Source: `/Users/jasonyi/snaplens-code/marvin/ar-core/src/types/lens-studio.d.ts`
- API Docs: `/Users/jasonyi/snaplens-code/docs/Lens_Studio_API_Reference.md`

**Acceptance Criteria**:
- [ ] All math types defined (vec3, vec2, vec4, quat, mat4)
- [ ] Scene types complete (Script, SceneObject, Component)
- [ ] Audio types added (AudioComponent, AudioTrack, AsrModule)
- [ ] Networking types added (RemoteServiceModule, Request, Response)
- [ ] Text rendering types added (Text, ScreenTransform)
- [ ] Type checking passes

**Deliverable**: Complete Lens Studio API type definitions

**Commit**: `git commit -m "feat: Add Lens Studio API type definitions"`

---

### Task 2.2: Define MedSnap Core Types (1 hour)

**File**: `/Users/jasonyi/snaplens-code/lens-studio/src/types/core.ts`

**Steps**:
1. Define AppMode enum (IDLE, TRAINING, CLINICAL)
2. Define ClinicalState enum (all states from FR-12)
3. Define PatientData interface (matching backend schema)
4. Define VitalSigns, Medication, Diagnosis interfaces
5. Define PrescriptionData, DrugInteractionWarning interfaces
6. Define VoiceCommand, VoiceIntent types
7. Define AROverlayConfig, OverlayStyle interfaces
8. Define AR_COLORS constants (cyan, yellow, red, green per FR AR-1)
9. Define MedSnapConfig interface (typed version of config.js)
10. Define API response types (PatientLoadResponse, etc.)
11. Define PerformanceMetrics interface
12. Test: Create test file importing all types, verify compilation

**Reference Files**:
- Backend types: `/Users/jasonyi/snaplens-code/backend/src/models/`
- Config: `/Users/jasonyi/snaplens-code/lens-studio/Public/Scripts/config.js`
- PRD: `/Users/jasonyi/snaplens-code/MedSnap_PRD.md`

**Acceptance Criteria**:
- [ ] All enums defined and exported
- [ ] All interfaces match backend API contracts
- [ ] AR_COLORS constants match FR AR-1 requirements
- [ ] MedSnapConfig interface covers all config.js fields
- [ ] Type checking passes
- [ ] Can import and use types in test file

**Deliverable**: Complete MedSnap domain type definitions

**Commit**: `git commit -m "feat: Add MedSnap core type definitions"`

---

## Phase 3: AR System Core (4 hours)

**Goal**: Implement main system coordinator and Lens Studio entry point

**Dependencies**: Phase 2 complete (types must be defined)

**Critical Path**: YES - All components integrate through this system

**TDD Required**: Write tests BEFORE implementation for each task

### Task 3.1: Write MedSnapARSystem Tests (30 min)

**File**: `/Users/jasonyi/snaplens-code/lens-studio/__tests__/ar-system.test.ts`

**Steps**:
1. Create __tests__ directory in lens-studio/
2. Write test: "should be constructible with config"
3. Write test: "should have initialize method"
4. Write test: "should have lifecycle methods (start, stop, update, dispose)"
5. Write test: "should throw if started before initialized"
6. Write test: "should track initialization state"
7. Run: `npm test` - should FAIL (no implementation yet)

**Acceptance Criteria**:
- [ ] All tests written and documented
- [ ] Tests follow AAA pattern (Arrange, Act, Assert)
- [ ] Tests run and FAIL as expected
- [ ] Test file uses TypeScript

**Deliverable**: Comprehensive test suite for MedSnapARSystem (failing)

**Commit**: `git commit -m "test: Add MedSnapARSystem tests (TDD Step 1)"`

---

### Task 3.2: Implement MedSnapARSystem (2 hours)

**File**: `/Users/jasonyi/snaplens-code/lens-studio/src/MedSnapARSystem.ts`

**Steps**:
1. Copy structure from marvin's main.ts as starting point
2. Define class MedSnapARSystem
3. Add constructor accepting MedSnapConfig
4. Add component storage properties:
   - overlayManager?: OverlayManager
   - voiceController?: VoiceController
   - audioPlayer?: AudioPlayer
   - stateManager?: StateManager
   - modeManager?: ModeManager
   - apiClient?: APIClient
5. Add Lens Studio component storage:
   - script?: Script
   - remoteService?: RemoteServiceModule
   - audioComponent?: AudioComponent
6. Add state flags: isInitialized, isRunning
7. Implement async initialize() method:
   - Store Lens Studio components
   - Initialize subsystems in dependency order
   - Setup event handlers
   - Set isInitialized = true
8. Implement start() method:
   - Guard: throw if not initialized
   - Start all subsystems
   - Set isRunning = true
9. Implement stop() method:
   - Stop all subsystems
   - Set isRunning = false
10. Implement update() method (called every frame):
    - Update overlays (billboards)
    - Check timeouts
    - Monitor performance if enabled
11. Implement dispose() method:
    - Stop if running
    - Cleanup all subsystems
    - Release resources
    - Set isInitialized = false
12. Add accessor methods (getCurrentMode, getCurrentPatient, getPerformanceMetrics)
13. Run: `npm test` - should PASS

**Reference Files**:
- Pattern: `/Users/jasonyi/snaplens-code/marvin/ar-core/src/main.ts`
- Marvin comparison: `/Users/jasonyi/snaplens-code/docs/Marvin_vs_MedSnap_Comparison_Report.md`

**Differences from Marvin**:
- REMOVE: ObjectTracker, GestureHandler, SpatialAnchors (CV not needed)
- ADD: VoiceController, AudioPlayer, StateManager, ModeManager, APIClient

**Acceptance Criteria**:
- [ ] All tests pass
- [ ] Initialize → Start → Update → Stop → Dispose workflow works
- [ ] Guards prevent invalid state transitions
- [ ] Build succeeds without TypeScript errors
- [ ] Follows marvin's proven lifecycle pattern

**Deliverable**: Working MedSnapARSystem coordinator

**Commit**: `git commit -m "feat: Implement MedSnapARSystem (TDD Step 2)"`

---

### Task 3.3: Write Entry Point Annotation Test (15 min)

**File**: `/Users/jasonyi/snaplens-code/lens-studio/__tests__/annotations.test.sh`

**Steps**:
1. Create shell script test
2. Test: @input annotations preserved after build
3. Check dist/lens-studio-entry.js contains "@input SceneObject sceneRoot"
4. Check dist/lens-studio-entry.js contains "@input Component.RemoteServiceModule"
5. Run: Should FAIL (no entry point yet)

**Acceptance Criteria**:
- [ ] Shell script is executable
- [ ] Test checks for @input preservation
- [ ] Test fails as expected

**Deliverable**: Annotation preservation test (failing)

**Commit**: `git commit -m "test: Add entry point annotation test (TDD Step 1)"`

---

### Task 3.4: Implement Lens Studio Entry Point (1.25 hours)

**File**: `/Users/jasonyi/snaplens-code/lens-studio/src/lens-studio-entry.ts`

**Steps**:
1. Copy exact pattern from marvin's lens-studio-entry.ts
2. Add @input annotations at top of file:
   ```typescript
   // @input SceneObject sceneRoot
   // @input Component.RemoteServiceModule remoteService
   // @input Component.AudioComponent audioComponent
   ```
3. Add global declarations:
   ```typescript
   declare const script: Script;
   declare const sceneRoot: SceneObject;
   declare const remoteService: RemoteServiceModule;
   declare const audioComponent: AudioComponent;
   ```
4. Create system instance variable:
   ```typescript
   let medSnapSystem: MedSnapARSystem;
   ```
5. Create loadConfig() helper function (reads global.MedSnapConfig)
6. Bind SceneEvent.OnStart:
   - Load config
   - Create MedSnapARSystem instance
   - Call initialize()
   - Call start()
   - Wrap in try-catch with error logging
7. Bind UpdateEvent:
   - Call medSnapSystem.update() if system exists
8. Bind SceneEvent.OnDestroy:
   - Call medSnapSystem.dispose()
9. Create global debug API:
   ```typescript
   (global as any).medSnap = {
     getSystem: () => medSnapSystem,
     getState: () => medSnapSystem?.getState(),
     getPerformance: () => medSnapSystem?.getPerformanceMetrics()
   };
   ```
10. Build: `npm run build`
11. Run annotation test: Should PASS

**Reference File**: `/Users/jasonyi/snaplens-code/marvin/ar-core/src/lens-studio-entry.ts`

**CRITICAL**: tsconfig.json MUST have `removeComments: false` or @input annotations will be stripped

**Acceptance Criteria**:
- [ ] Annotation test passes
- [ ] dist/lens-studio-entry.js exists
- [ ] @input comments preserved in .js output
- [ ] Global debug API accessible
- [ ] Build succeeds without errors

**Deliverable**: Working Lens Studio entry point with @input wiring

**Commit**: `git commit -m "feat: Implement Lens Studio entry point (TDD Step 2)"`

---

## Phase 4: Component Implementations (6 hours)

**Goal**: Implement all subsystem components (AR, Voice, State, Network)

**Dependencies**: Phase 3 complete (MedSnapARSystem must exist)

**Critical Path**: YES - These components enable Dev 2 tasks

**Parallelization**: Tasks 4.1-4.7 can be partially parallelized (different developers):
- Group A: 4.1-4.2 (AR rendering)
- Group B: 4.3-4.4 (Voice/Audio)
- Group C: 4.5-4.7 (State management)

**TDD Required**: Write tests before implementation for testable components

### Task 4.1: Write OverlayManager Tests (30 min)

**File**: `/Users/jasonyi/snaplens-code/lens-studio/__tests__/overlay-manager.test.ts`

**Steps**:
1. Write test: "should create overlay with config"
2. Write test: "should remove overlay by id"
3. Write test: "should not throw when removing non-existent overlay"
4. Write test: "should enforce max overlay limit"
5. Write test: "should update overlay properties"
6. Write test: "should dispose all overlays"
7. Run: Should FAIL (no implementation)

**Acceptance Criteria**:
- [ ] All tests written with clear assertions
- [ ] Tests cover create, update, remove, dispose
- [ ] Tests run and FAIL as expected

**Deliverable**: OverlayManager test suite (failing)

**Commit**: `git commit -m "test: Add OverlayManager tests (TDD Step 1)"`

---

### Task 4.2: Implement OverlayManager (1.5 hours)

**File**: `/Users/jasonyi/snaplens-code/lens-studio/src/AROverlays/OverlayManager.ts`

**Steps**:
1. Copy marvin's OverlayManager.ts as base
2. Adapt to MedSnap needs:
   - Change color palette to AR_COLORS (cyan, yellow, red, green)
   - Support multi-line patient card formatting (not just single-line)
   - Position defaults: top 1/3 of screen (fixed) instead of object-attached
3. Keep from marvin:
   - Billboard rotation logic (always face camera)
   - Fade animation system (fadeIn, fadeOut)
   - Max overlay limit with auto-remove oldest
   - TTL (time-to-live) for temporary overlays
   - Dispose pattern
4. Implement methods:
   - createOverlay(config: AROverlayConfig): void
   - removeOverlay(id: string): void
   - updateOverlay(id: string, updates: Partial<AROverlayConfig>): void
   - attachToPosition(id: string, position: vec3): void
   - updateBillboards(): void (called in MedSnapARSystem.update())
   - fadeIn(id: string, duration: number): void
   - fadeOut(id: string, duration: number): void
   - checkExpiredOverlays(): void
   - dispose(): void
5. Run: `npm test` - should PASS

**Reference File**: `/Users/jasonyi/snaplens-code/marvin/ar-core/src/AROverlays/OverlayManager.ts`

**Reuse Percentage**: ~90% from marvin (proven patterns)

**Acceptance Criteria**:
- [ ] All tests pass
- [ ] Can create/remove overlays
- [ ] Billboard effect works
- [ ] Fade animations implemented
- [ ] AR_COLORS used correctly
- [ ] Build succeeds

**Deliverable**: Working OverlayManager for AR text rendering

**Commit**: `git commit -m "feat: Implement OverlayManager (TDD Step 2)"`

---

### Task 4.3: Implement VoiceController (Placeholder) (30 min)

**File**: `/Users/jasonyi/snaplens-code/lens-studio/src/Voice/VoiceController.ts`

**Steps**:
1. Create VoiceController class
2. Implement methods:
   - initialize(asrModule?: AsrModule): void
   - startListening(): void
   - stopListening(): void
   - onTranscription(callback: (text: string) => void): void
   - dispose(): void
3. Note: Full ASR integration may be backend-based, this is placeholder/wrapper
4. Add TODO comments for future ASR implementation
5. Build: `npm run build` - should succeed

**Pattern Inspiration**: Marvin's GestureHandler structure (init, start/stop, callbacks, dispose)

**Acceptance Criteria**:
- [ ] Class compiles without errors
- [ ] All methods defined (even if placeholder)
- [ ] Follows initialize → start → stop → dispose pattern
- [ ] Build succeeds

**Deliverable**: VoiceController foundation (placeholder)

**Commit**: `git commit -m "feat: Add VoiceController placeholder"`

---

### Task 4.4: Implement AudioPlayer (1 hour)

**File**: `/Users/jasonyi/snaplens-code/lens-studio/src/Voice/AudioPlayer.ts`

**Steps**:
1. Create AudioPlayer class
2. Add private audioComponent?: AudioComponent property
3. Implement initialize(audioComponent: AudioComponent):
   - Store component reference
4. Implement async playFromUrl(url: string):
   - Load audio track from URL
   - Set audioComponent.audioTrack
   - Call audioComponent.play()
   - Return promise that resolves when playback completes
5. Implement stop():
   - Call audioComponent.stop()
6. Implement isPlaying():
   - Return audioComponent.isPlaying()
7. Implement dispose():
   - Stop if playing
   - Clear references
8. Add queue management for multiple TTS responses
9. Test manually with backend TTS endpoint
10. Build: `npm run build` - should succeed

**Integration Pattern**:
```typescript
// Example usage
const response = await apiClient.generateTTS("Patient loaded");
await audioPlayer.playFromUrl(response.audioUrl);
```

**Acceptance Criteria**:
- [ ] Can initialize with AudioComponent
- [ ] Can play audio from URL
- [ ] Can stop playback
- [ ] Queue management implemented
- [ ] Build succeeds

**Deliverable**: Working AudioPlayer for TTS playback

**Commit**: `git commit -m "feat: Implement AudioPlayer"`

---

### Task 4.5: Write StateManager Tests (30 min)

**File**: `/Users/jasonyi/snaplens-code/lens-studio/__tests__/state-manager.test.ts`

**Steps**:
1. Write test: "should initialize in IDLE mode"
2. Write test: "should switch to CLINICAL mode"
3. Write test: "should update clinical state"
4. Write test: "should store and retrieve patient data"
5. Write test: "should emit state change events"
6. Write test: "should reset to initial state"
7. Run: Should FAIL (no implementation)

**Acceptance Criteria**:
- [ ] All tests written
- [ ] Tests cover mode switching, state updates, patient data
- [ ] Tests run and FAIL as expected

**Deliverable**: StateManager test suite (failing)

**Commit**: `git commit -m "test: Add StateManager tests (TDD Step 1)"`

---

### Task 4.6: Implement StateManager (1 hour)

**File**: `/Users/jasonyi/snaplens-code/lens-studio/src/State/StateManager.ts`

**Steps**:
1. Create StateManager class
2. Add private properties:
   - currentMode: AppMode = AppMode.IDLE
   - clinicalState: ClinicalState = ClinicalState.IDLE
   - currentPatient: PatientData | null = null
   - stateChangeCallbacks: Array<(state: any) => void> = []
3. Implement getCurrentMode(): return currentMode
4. Implement setMode(mode: AppMode):
   - Update currentMode
   - Emit state change event
5. Implement getClinicalState(): return clinicalState
6. Implement setClinicalState(state: ClinicalState):
   - Update clinicalState
   - Emit state change event
7. Implement getCurrentPatient(): return currentPatient
8. Implement setCurrentPatient(patient: PatientData | null):
   - Update currentPatient
   - Emit state change event
9. Implement onStateChange(callback):
   - Add to callbacks array
10. Implement reset():
    - Reset to IDLE mode
    - Clear patient data
    - Reset clinical state
    - Emit state change
11. Run: `npm test` - should PASS

**Acceptance Criteria**:
- [ ] All tests pass
- [ ] Mode switching works
- [ ] Patient data stored/retrieved
- [ ] State change events emitted
- [ ] Build succeeds

**Deliverable**: Working StateManager for app state

**Commit**: `git commit -m "feat: Implement StateManager (TDD Step 2)"`

---

### Task 4.7: Implement ModeManager Foundation (1 hour)

**File**: `/Users/jasonyi/snaplens-code/lens-studio/src/State/ModeManager.ts`

**Steps**:
1. Review existing implementation: `/Users/jasonyi/snaplens-code/lens-studio/Public/Scripts/clinical/modeManager.js`
2. Port to TypeScript with proper types
3. Create ModeManager class
4. Add private stateManager?: StateManager property
5. Implement initialize(stateManager: StateManager):
   - Store reference
6. Implement switchMode(mode: AppMode):
   - Validate can switch (via canSwitchTo)
   - Exit current mode
   - Update state via StateManager
   - Initialize new mode
7. Implement getCurrentMode():
   - Return stateManager.getCurrentMode()
8. Implement canSwitchTo(mode: AppMode):
   - Basic validation (no CLINICAL → TRAINING direct switch)
9. Implement exitCurrentMode():
   - Cleanup based on current mode
   - Reset timers
10. Implement dispose():
    - Exit current mode
    - Clear references
11. Note: This is foundation only, full implementation in Dev 2 Task 2.1
12. Build: `npm run build` - should succeed

**Reference**: `/Users/jasonyi/snaplens-code/lens-studio/Public/Scripts/clinical/modeManager.js`

**Acceptance Criteria**:
- [ ] Ported from JavaScript to TypeScript
- [ ] Type safety added
- [ ] Integrates with StateManager
- [ ] Foundation ready for Task 2.1 full implementation
- [ ] Build succeeds

**Deliverable**: ModeManager foundation (ready for Task 2.1)

**Commit**: `git commit -m "feat: Add ModeManager foundation (for Task 2.1)"`

---

## Phase 5: Network Integration (2 hours)

**Goal**: Implement HTTP client for backend API integration

**Dependencies**: Phase 3 complete (needs MedSnapARSystem structure)

**Critical Path**: YES - Required for all backend communication

**TDD Required**: Write tests before implementation

### Task 5.1: Write APIClient Tests (30 min)

**File**: `/Users/jasonyi/snaplens-code/lens-studio/__tests__/api-client.test.ts`

**Steps**:
1. Create mock RemoteServiceModule for testing
2. Write test: "should initialize with config"
3. Write test: "should make patient load request"
4. Write test: "should parse JSON response"
5. Write test: "should handle request timeout"
6. Write test: "should handle HTTP errors (404, 500)"
7. Write test: "should retry on failure"
8. Run: Should FAIL (no implementation)

**Acceptance Criteria**:
- [ ] All tests written
- [ ] Mock RemoteServiceModule created
- [ ] Tests cover success, timeout, error cases
- [ ] Tests run and FAIL as expected

**Deliverable**: APIClient test suite (failing)

**Commit**: `git commit -m "test: Add APIClient tests (TDD Step 1)"`

---

### Task 5.2: Implement APIClient (1.5 hours)

**File**: `/Users/jasonyi/snaplens-code/lens-studio/src/Network/APIClient.ts`

**Steps**:
1. Create APIClient class
2. Add private properties:
   - remoteService?: RemoteServiceModule
   - config?: MedSnapConfig
3. Implement initialize(remoteService, config):
   - Store references
4. Implement private makeRequest(endpoint, method, body):
   - Create Request object
   - Set HTTP method (GET/POST)
   - Set body if provided (JSON.stringify)
   - Setup timeout timer (from config)
   - Call remoteService.performHttpRequest()
   - Parse JSON response
   - Handle errors
   - Return Promise
5. Implement public API methods:
   - async loadPatient(patientName: string): Promise<APIResponse<PatientLoadResponse>>
     - POST /api/clinical/patient/load
     - Body: { patient_name: patientName }
   - async recordSymptom(symptom: string): Promise<APIResponse<SymptomRecordResponse>>
     - POST /api/clinical/symptom/record
     - Body: { symptom }
   - async createPrescription(medication: string, dosage: string): Promise<APIResponse<PrescriptionResponse>>
     - POST /api/clinical/prescription/create
     - Body: { medication, dosage }
   - async extractIntent(transcription: string): Promise<APIResponse<VoiceCommand>>
     - POST /api/voice/command
     - Body: { transcription }
   - async generateTTS(text: string): Promise<APIResponse<{ audioUrl: string }>>
     - POST /api/tts/generate
     - Body: { text }
6. Add error handling with retry logic (3 retries)
7. Add timeout handling (5s default from config)
8. Implement dispose():
   - Clear references
9. Run: `npm test` - should PASS

**Backend Endpoints** (already implemented):
- POST /api/clinical/patient/load
- POST /api/clinical/symptom/record
- POST /api/clinical/prescription/create
- POST /api/voice/command
- POST /api/tts/generate

**Acceptance Criteria**:
- [ ] All tests pass
- [ ] Can make HTTP requests
- [ ] Timeout logic works
- [ ] Retry logic works
- [ ] JSON parsing works
- [ ] Error handling works
- [ ] Build succeeds

**Deliverable**: Working APIClient for backend integration

**Commit**: `git commit -m "feat: Implement APIClient (TDD Step 2)"`

---

## Phase 6: Lens Studio Integration & Validation (2 hours)

**Goal**: Import TypeScript system into Lens Studio and validate it works

**Dependencies**: Phases 1-5 complete (all code implemented)

**Critical Path**: YES - Final validation before Dev 2 tasks can begin

**Manual Testing Required**: These are integration tests in Lens Studio simulator

### Task 6.1: Build and Prepare Output (15 min)

**Steps**:
1. Run final build: `npm run build`
2. Verify dist/lens-studio-entry.js exists
3. Verify dist/lens-studio-entry.d.ts exists
4. Check @input annotations preserved in .js file:
   ```bash
   grep "@input SceneObject sceneRoot" dist/lens-studio-entry.js
   ```
5. Verify no TypeScript errors in build output
6. Check file size reasonable (<500KB for entry point)

**Acceptance Criteria**:
- [ ] Build succeeds without errors
- [ ] dist/ directory contains all expected files
- [ ] @input annotations preserved
- [ ] No warnings in build output

**Deliverable**: Production-ready JavaScript for Lens Studio

**Commit**: `git commit -m "build: Generate production Lens Studio output"`

---

### Task 6.2: Import into Lens Studio Project (30 min)

**Steps**:
1. Open Lens Studio
2. Open project: `/Users/jasonyi/snaplens-code/lens-studio/MedSnap.lsproj`
3. In Resources panel, right-click → Add Files
4. Navigate to dist/lens-studio-entry.js
5. Import the file
6. Verify script appears in Resources panel
7. Check for import errors in Lens Studio console

**Acceptance Criteria**:
- [ ] Script imported without errors
- [ ] Visible in Resources panel
- [ ] No syntax errors reported

**Deliverable**: TypeScript system imported into Lens Studio

---

### Task 6.3: Create and Wire Scene Objects (30 min)

**Steps**:
1. In Scene Hierarchy, create scene objects:
   - MedSnapSystem (SceneObject)
     - Add Script component
     - Assign lens-studio-entry.js
   - SceneRoot (SceneObject)
   - RemoteServiceModule (SceneObject)
     - Add RemoteServiceModule component
     - Set API URL to backend (http://localhost:3000 or Railway URL)
   - AudioPlayer (SceneObject)
     - Add AudioComponent component
2. Select MedSnapSystem → Script component
3. Verify @input fields appear in Inspector:
   - sceneRoot
   - remoteService
   - audioComponent
4. Wire inputs by dragging:
   - Drag SceneRoot object → sceneRoot input
   - Drag RemoteServiceModule component → remoteService input
   - Drag AudioComponent component → audioComponent input
5. Verify all inputs wired (no red warnings)

**Acceptance Criteria**:
- [ ] All scene objects created
- [ ] All components added
- [ ] All @input fields visible in Inspector
- [ ] All inputs wired correctly
- [ ] No errors in Lens Studio console

**Deliverable**: Fully wired Lens Studio scene

---

### Task 6.4: Integration Test 1 - System Initialization (15 min)

**Test ID**: INT-6.1

**Steps**:
1. Click Play in Lens Studio
2. Open Logs panel (View → Logs)
3. Look for initialization logs:
   - "[MedSnap] Initializing system..."
   - "[MedSnap] System initialized successfully"
   - "[MedSnap] System started"
4. Verify no errors in console
5. Stop scene
6. Look for cleanup logs:
   - "[MedSnap] System disposed"

**Expected Result**:
- System initializes without errors
- All initialization logs appear
- Cleanup logs appear on stop

**Acceptance Criteria**:
- [ ] Initialization logs appear
- [ ] No errors in console
- [ ] System disposes cleanly

**Result**: PASS / FAIL

**Notes**: ___________________________________

---

### Task 6.5: Integration Test 2 - Update Loop (15 min)

**Test ID**: INT-6.2

**Steps**:
1. Enable performance monitoring in MedSnapARSystem
2. Play scene
3. Watch console for frame update logs (throttle to 1/second)
4. Verify FPS ~60 (or at least ≥30 per FR-41)
5. Run for 30 seconds
6. Check for memory leaks (stable FPS, no degradation)

**Expected Result**:
- Update loop runs smoothly
- FPS ≥30 (ideally 60)
- No performance degradation over time

**Acceptance Criteria**:
- [ ] Update loop fires every frame
- [ ] FPS meets target (≥30)
- [ ] No memory leaks detected

**Result**: PASS / FAIL

**Notes**: ___________________________________

---

### Task 6.6: Integration Test 3 - API Request (Backend Running) (15 min)

**Test ID**: INT-6.3

**Prerequisites**:
1. Start backend server:
   ```bash
   cd /Users/jasonyi/snaplens-code/backend
   npm run dev
   ```
2. Verify backend running at http://localhost:3000

**Steps**:
1. Play scene in Lens Studio
2. Open console
3. Execute test command:
   ```javascript
   global.medSnap.getSystem().apiClient.loadPatient("Sarah Chen")
   ```
4. Watch for:
   - HTTP request log
   - Response received log
   - Patient data logged
5. Verify response contains patient data
6. Test error case (invalid patient):
   ```javascript
   global.medSnap.getSystem().apiClient.loadPatient("Invalid Name")
   ```
7. Verify error handled gracefully

**Expected Result**:
- HTTP request sent successfully
- Response received and parsed
- Patient data accessible
- Errors handled gracefully

**Acceptance Criteria**:
- [ ] Can make HTTP request
- [ ] Response parsed correctly
- [ ] Patient data accessible
- [ ] Error handling works

**Result**: PASS / FAIL

**Notes**: ___________________________________

---

### Task 6.7: Integration Test 4 - Audio Playback (15 min)

**Test ID**: INT-6.4

**Prerequisites**: Backend running (for TTS generation)

**Steps**:
1. Generate TTS audio via backend:
   ```javascript
   const response = await global.medSnap.getSystem().apiClient.generateTTS("Test audio playback");
   ```
2. Play audio:
   ```javascript
   await global.medSnap.getSystem().audioPlayer.playFromUrl(response.audioUrl);
   ```
3. Listen for audio (may need headphones)
4. Verify audio plays
5. Test stop:
   ```javascript
   global.medSnap.getSystem().audioPlayer.stop();
   ```
6. Verify audio stops

**Expected Result**:
- TTS audio generated
- Audio plays successfully
- Can stop playback

**Acceptance Criteria**:
- [ ] TTS audio generated
- [ ] Audio plays
- [ ] Can stop playback
- [ ] No audio errors

**Result**: PASS / FAIL

**Notes**: ___________________________________

---

### Task 6.8: Integration Test 5 - Scene Reload (Cleanup) (15 min)

**Test ID**: INT-6.5

**Steps**:
1. Play scene
2. Wait for initialization
3. Stop scene
4. Verify cleanup logs appear
5. Play scene again
6. Verify re-initialization works
7. Check for any lingering objects or memory leaks
8. Repeat 3 times

**Expected Result**:
- Clean disposal on stop
- Successful re-initialization on play
- No memory leaks
- No lingering scene objects

**Acceptance Criteria**:
- [ ] Dispose logs appear
- [ ] Re-initialization succeeds
- [ ] No memory leaks after 3 cycles
- [ ] Scene hierarchy clean

**Result**: PASS / FAIL

**Notes**: ___________________________________

---

## Final Acceptance & Sign-Off

**All tasks complete**: YES / NO

**Date**: __________

**Developer**: __________

### Build System Validation
- [ ] `npm run build` succeeds without errors
- [ ] `npm run dev` watch mode works
- [ ] `npm run type-check` passes
- [ ] dist/lens-studio-entry.js generated correctly
- [ ] @input annotations preserved in output

### Type Safety Validation
- [ ] All TypeScript files compile without errors
- [ ] No `any` types except in Lens Studio globals
- [ ] IDE autocomplete works for all types
- [ ] No circular dependency errors

### Core System Validation
- [ ] MedSnapARSystem initializes successfully
- [ ] All @input components wire correctly in Inspector
- [ ] Scene lifecycle events fire (OnStart, OnDestroy, UpdateEvent)
- [ ] Update loop runs at target FPS
- [ ] System disposes cleanly on scene unload

### Component Validation
- [ ] OverlayManager can create/remove overlays
- [ ] VoiceController foundation in place
- [ ] AudioPlayer can play TTS audio
- [ ] StateManager manages app state
- [ ] ModeManager foundation ready for Task 2.1
- [ ] APIClient can make HTTP requests

### Integration Test Validation
- [ ] INT-6.1: System Initialization - PASS
- [ ] INT-6.2: Update Loop - PASS
- [ ] INT-6.3: API Request - PASS
- [ ] INT-6.4: Audio Playback - PASS
- [ ] INT-6.5: Scene Reload - PASS

### Performance Validation
- [ ] AR rendering ≥30 FPS (ideally 60 FPS per FR-41)
- [ ] No memory leaks on scene reload
- [ ] HTTP requests complete <3s
- [ ] TTS audio playback starts <1.5s

### Developer Experience Validation
- [ ] Hot reload works (`npm run dev`)
- [ ] Debug API accessible (global.medSnap)
- [ ] Console logs helpful for debugging
- [ ] Documentation clear and complete

### Readiness for Dev 2 Tasks
- [ ] Can implement Task 2.1: Mode Manager (extend ModeManager.ts)
- [ ] Can implement Task 2.2: Patient Card Renderer (use OverlayManager)
- [ ] Can implement Task 2.3: Clinical Mode State Machine (use StateManager)
- [ ] Can implement Task 2.4: Prescription UI (use OverlayManager + AudioPlayer)

**Implementation Status**: COMPLETE / INCOMPLETE

**Ready for Dev 2 Tasks**: YES / NO

**Total Time Spent**: __________ hours (Target: 12-18 hours)

**Issues Encountered**: ___________________________________

**Lessons Learned**: ___________________________________

---

## Post-Implementation Tasks

After all phases complete and tests pass:

1. [ ] Update CLAUDE.md with TypeScript workflow instructions
2. [ ] Create Dev 2 Task 2.1 spec (Mode Manager implementation)
3. [ ] Archive this spec folder as reference
4. [ ] Document any deviations from original plan
5. [ ] Share learnings with team

---

## Quick Reference: Critical Dependencies

**Task Dependency Graph** (Critical Path in Bold):

```
**Phase 1 (Build System)** → **Phase 2 (Types)** → **Phase 3 (AR System)** → Phase 4 (Components) → Phase 5 (Network) → **Phase 6 (Integration)**
                                                                                    ↓
                                                                            Dev 2 Tasks (2.1-2.4)
```

**Phase 4 Parallelization**:
- Group A (AR): Tasks 4.1-4.2 (OverlayManager)
- Group B (Voice/Audio): Tasks 4.3-4.4 (VoiceController, AudioPlayer)
- Group C (State): Tasks 4.5-4.7 (StateManager, ModeManager)

**Before Starting Each Phase**:
- Ensure previous phase 100% complete
- Run `npm run build` to verify build health
- Run `npm test` to verify tests passing

**Emergency Rollback**:
If integration fails, git reset to last passing phase commit.

---

## Troubleshooting Guide

### Build Fails
- Check tsconfig.json matches spec
- Verify all imports correct
- Run `npm run type-check` for details
- Check Lens Studio type definitions complete

### @input Fields Missing
- Check `removeComments: false` in tsconfig.json
- Verify @input comments in .js output
- Reimport script in Lens Studio
- Check console for syntax errors

### System Doesn't Initialize
- Verify script attached to scene object
- Check all @input components wired
- Look for errors in Lens Studio console
- Add debug logs at top of entry point

### API Requests Fail
- Verify backend running (`npm run dev` in backend/)
- Check backend URL in RemoteServiceModule
- Test endpoint with curl/Postman
- Check CORS settings
- Verify RemoteServiceModule wired

### Audio Doesn't Play
- Check AudioComponent wired
- Verify audio URL accessible (test in browser)
- Check audio format (MP3/WAV supported)
- Ensure device volume up
- Try test audio file first

---

**END OF TASK LIST**
