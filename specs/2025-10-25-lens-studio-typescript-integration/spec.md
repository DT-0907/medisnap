# Lens Studio TypeScript Integration - Formal Specification

**Document Type**: Technical Specification
**Status**: Draft
**Created**: 2025-10-25
**Owner**: Dev 2
**Priority**: Critical (Blocking all Dev 2 Tasks)
**Estimated Effort**: 12-18 hours
**Target Completion**: Before Dev 2 Task 2.1 implementation

---

## Executive Summary

This specification defines the complete migration of MedSnap's Lens Studio implementation from placeholder JavaScript files to a production-ready TypeScript architecture. This is **NOT a greenfield project** - we are upgrading an existing codebase with working backend APIs and placeholder frontend implementations to a full TypeScript-based system following proven patterns from the marvin reference implementation.

**Current State**:
- Backend: FULLY IMPLEMENTED with passing tests (Node.js/Express/Supabase)
- Frontend: PLACEHOLDER JavaScript files with TODO comments in `/lens-studio/Public/Scripts/`
- Reference: Working marvin TypeScript AR system with Lens Studio integration
- Documentation: Comprehensive planning documents in this spec folder

**Target State**:
- TypeScript-first development with full type safety
- Build pipeline producing Lens Studio-compatible JavaScript
- Modular component architecture following marvin patterns
- Seamless integration with existing backend APIs
- Ready for Dev 2 clinical mode tasks (2.1-2.4)

---

## 1. Problem Statement

### 1.1 Current Implementation Gaps

**Existing Backend** (`/Users/jasonyi/snaplens-code/backend/`):
- ✅ Complete Express API implementation
- ✅ Patient, prescription, voice, TTS endpoints
- ✅ Comprehensive test suite (unit + integration)
- ✅ Database schema and mock data

**Existing Frontend** (`/Users/jasonyi/snaplens-code/lens-studio/Public/Scripts/`):
```
lens-studio/Public/Scripts/
├── clinical/
│   ├── clinicalMode.js       # Placeholder with config loading
│   └── modeManager.js        # Basic implementation (Task 2.1 complete)
├── ui/
│   ├── patientCardRenderer.js  # TODO placeholder
│   └── prescriptionUI.js       # TODO placeholder
└── config.js                   # Working config (AR colors, timeouts, etc.)
```

**What's Missing**:
- ❌ TypeScript build system for Lens Studio
- ❌ Type definitions for Lens Studio API
- ❌ Modular component architecture
- ❌ Proper scene lifecycle management
- ❌ AR overlay rendering system
- ❌ Voice/audio integration layer
- ❌ State management system
- ❌ HTTP client for backend integration
- ❌ Testable, maintainable code structure

### 1.2 Reference Implementation Available

**Marvin AR System** (`/Users/jasonyi/snaplens-code/marvin/ar-core/`):
- ✅ Complete TypeScript architecture
- ✅ Lens Studio API type definitions
- ✅ MarvinARSystem coordinator pattern
- ✅ OverlayManager for AR text rendering
- ✅ Scene lifecycle event handling
- ✅ @input annotations for Inspector wiring
- ✅ Successfully deployed to Snap Spectacles

We will adapt marvin's proven infrastructure patterns while creating MedSnap-specific domain logic from scratch.

### 1.3 Success Criteria

**Infrastructure Ready When**:
1. TypeScript builds to Lens Studio-compatible JavaScript without errors
2. All @input components wire correctly in Lens Studio Inspector
3. System initializes and runs in Spectacles Simulator
4. Can make HTTP requests to existing backend APIs
5. Can play TTS audio from backend responses
6. Developer can immediately start Dev 2 Task 2.1 (Mode Manager)

---

## 2. Architecture Overview

### 2.1 Directory Structure Transformation

**FROM** (Current - Placeholder JavaScript):
```
lens-studio/
├── MedSnap.lsproj/           # Lens Studio project
└── Public/Scripts/
    ├── clinical/
    │   ├── clinicalMode.js   # Basic placeholder
    │   └── modeManager.js    # Partial implementation
    ├── ui/
    │   ├── patientCardRenderer.js  # TODO
    │   └── prescriptionUI.js       # TODO
    └── config.js             # Working config
```

**TO** (Target - TypeScript System):
```
lens-studio/
├── src/                      # *** NEW: TypeScript source ***
│   ├── MedSnapARSystem.ts           # Main coordinator (≈ marvin's main.ts)
│   ├── lens-studio-entry.ts         # Entry point (≈ marvin's pattern)
│   │
│   ├── types/                       # Type definitions
│   │   ├── lens-studio.d.ts         # Lens Studio API (from marvin + extensions)
│   │   └── core.ts                  # MedSnap types (patient, prescription, etc.)
│   │
│   ├── AROverlays/                  # AR rendering
│   │   └── OverlayManager.ts        # Text overlays (≈90% from marvin)
│   │
│   ├── Voice/                       # *** NEW: Voice/Audio (not in marvin) ***
│   │   ├── VoiceController.ts       # ASR integration
│   │   └── AudioPlayer.ts           # TTS playback
│   │
│   ├── State/                       # *** NEW: State management (not in marvin) ***
│   │   ├── StateManager.ts          # App state (mode, patient, session)
│   │   └── ModeManager.ts           # Mode switching (extends existing modeManager.js)
│   │
│   ├── Clinical/                    # *** NEW: Dev 2 tasks (to be implemented) ***
│   │   ├── PatientCardRenderer.ts   # Task 2.2
│   │   ├── ClinicalModeStateMachine.ts  # Task 2.3
│   │   └── PrescriptionUI.ts        # Task 2.4
│   │
│   └── Network/                     # *** NEW: Backend integration (not in marvin) ***
│       └── APIClient.ts             # HTTP wrapper for backend APIs
│
├── dist/                     # *** NEW: Build output ***
│   ├── lens-studio-entry.js         # Import this in Lens Studio
│   └── *.d.ts                       # Type declarations
│
├── tsconfig.json             # *** NEW: TypeScript config ***
├── package.json              # *** NEW: Build scripts ***
├── .gitignore                # *** NEW: Ignore node_modules, dist ***
│
├── MedSnap.lsproj/           # Existing Lens Studio project
└── Public/Scripts/           # Legacy JS (archived for reference)
```

### 2.2 Component Hierarchy

```
MedSnapARSystem (central coordinator)
│
├── OverlayManager (AR rendering)
│   ├── PatientCardRenderer (Dev 2 Task 2.2) - creates patient cards
│   └── PrescriptionUI (Dev 2 Task 2.4) - creates prescription UI
│
├── VoiceController (ASR + wake word detection)
│   └── AudioPlayer (TTS playback) - plays backend TTS audio
│
├── StateManager (application state)
│   ├── ModeManager (Dev 2 Task 2.1) - mode switching logic
│   └── ClinicalModeStateMachine (Dev 2 Task 2.3) - clinical workflow
│
├── APIClient (backend HTTP client)
│   └── Calls: /api/clinical/*, /api/voice/*, /api/tts/*
│
└── DeviceTracking (Lens Studio component - provided by platform)
```

### 2.3 Integration with Existing Systems

**Backend APIs** (Already Implemented):
```
/api/clinical/patient/load              → APIClient.loadPatient()
/api/clinical/symptom/record            → APIClient.recordSymptom()
/api/clinical/prescription/create       → APIClient.createPrescription()
/api/voice/command                      → APIClient.extractIntent()
/api/tts/generate                       → APIClient.generateTTS()
```

**Existing Config** (`config.js`):
```javascript
global.MedSnapConfig = {
  API_BASE_URL: "http://localhost:3000/api",
  AR_COLORS: { WARNING, SUCCESS, ALLERGY_TEXT, ... },
  TIMEOUTS: { CLINICAL_AUTO_EXIT: 120000, ... },
  MODE: { IDLE, TRAINING, CLINICAL },
  ...
}
```

**Migration Path**:
1. TypeScript `core.ts` will export equivalent types
2. `MedSnapARSystem` constructor accepts config object
3. Legacy `config.js` can coexist during transition
4. New TypeScript code uses typed config, legacy JS uses global

---

## 3. Technical Design

### 3.1 Build System

**Tools**:
- TypeScript 5.3.3 (compiler)
- ES2020 target (Lens Studio compatibility)
- CommonJS modules (Lens Studio requirement)
- Source maps for debugging
- Declaration files for type checking

**Build Pipeline**:
```bash
# Development
npm install              # Install dependencies
npm run dev              # Watch mode (tsc --watch)
npm run build            # Production build (tsc)
npm run type-check       # Type checking only (tsc --noEmit)

# Output
dist/lens-studio-entry.js      # Import into Lens Studio
dist/lens-studio-entry.d.ts    # Type declarations
dist/MedSnapARSystem.js        # All components bundled
```

**tsconfig.json** (Critical Settings):
```json
{
  "compilerOptions": {
    "target": "ES2020",                 // Lens Studio JS engine
    "module": "commonjs",               // Lens Studio module system
    "experimentalDecorators": true,     // @input annotations
    "declaration": true,                // Generate .d.ts
    "sourceMap": true,                  // Debugging support
    "strict": true,                     // Type safety
    "removeComments": false,            // KEEP @input comments
    "outDir": "./dist"
  }
}
```

### 3.2 Type Definitions

#### 3.2.1 Lens Studio API Types

**File**: `src/types/lens-studio.d.ts`

**Source**: Adapt from marvin's `lens-studio.d.ts` + extend for Dev 2 needs

**Core Types Required**:
```typescript
// Math
vec3, vec2, vec4, quat, mat4

// Scene
Script, SceneObject, Component, Transform

// Rendering
Text, ScreenTransform, BackgroundSettings, TextFill

// Audio (EXTEND beyond marvin)
AudioComponent, AudioTrack, AsrModule

// Networking (EXTEND beyond marvin)
RemoteServiceModule, Request, Response

// Events
UpdateEvent, SceneEvent, DelayedCallbackEvent

// Device
DeviceTracking
```

**Pattern** (Example):
```typescript
declare namespace LensStudio {
  export class AudioComponent extends Component {
    audioTrack: AudioTrack;
    volume: number;
    play(): void;
    stop(): void;
    pause(): void;
    isPlaying(): boolean;
  }

  export class Text extends Component {
    text: string;
    size: number;
    textFill: TextFill;
    outlineColor: vec4;
    horizontalAlignment: HorizontalAlignment;
    verticalAlignment: VerticalAlignment;
  }

  export class RemoteServiceModule extends Component {
    performHttpRequest(
      request: Request,
      callback: (response: Response) => void
    ): void;
  }
}
```

#### 3.2.2 MedSnap Core Types

**File**: `src/types/core.ts`

**Domain-Specific Types** (NO marvin equivalent):
```typescript
// Application Modes
export enum AppMode {
  IDLE = 'IDLE',
  TRAINING = 'TRAINING',
  CLINICAL = 'CLINICAL'
}

export enum ClinicalState {
  IDLE = 'IDLE',
  LOADING_PATIENT = 'LOADING_PATIENT',
  PATIENT_LOADED = 'PATIENT_LOADED',
  RECORDING_SYMPTOM = 'RECORDING_SYMPTOM',
  PRESCRIBING = 'PRESCRIBING',
  // ... (matches config.js CLINICAL_STATE)
}

// Patient Data (matches backend API schema)
export interface PatientData {
  id: string;
  name: string;
  age: number;
  sex: string;
  currentSymptoms: string[];
  vitalSigns: VitalSigns;
  allergies: string[];
  medications: Medication[];
  diagnosisHistory: Diagnosis[];
}

// Voice Commands
export interface VoiceCommand {
  intent: VoiceIntent;
  parameters: Record<string, string>;
  confidence: number;
  rawTranscription: string;
}

// AR Overlay Config
export interface AROverlayConfig {
  id: string;
  type: 'text' | 'notification' | 'card' | 'warning';
  position: vec3;
  content: string;
  style: OverlayStyle;
  billboard: boolean;
  visible: boolean;
  opacity: number;
}

// AR Colors (matches config.js AR_COLORS)
export const AR_COLORS = {
  CYAN: [0, 1, 1, 1] as const,
  YELLOW: [1, 1, 0, 1] as const,
  RED: [1, 0, 0, 1] as const,
  GREEN: [0, 1, 0, 1] as const,
};

// Configuration (TypeScript version of global.MedSnapConfig)
export interface MedSnapConfig {
  backendUrl: string;
  performance: {
    minFps: number;
    maxDetectionLatency: number;
  };
  timeouts: {
    clinicalModeInactivity: number;  // 120000ms
    trainingModeInactivity: number;  // 10000ms
    httpRequest: number;
  };
  defaultOverlayStyle: OverlayStyle;
  enablePerformanceMonitoring: boolean;
  demoMode: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}
```

### 3.3 Core System Components

#### 3.3.1 MedSnapARSystem (Main Coordinator)

**File**: `src/MedSnapARSystem.ts`

**Pattern**: Based on marvin's `main.ts` (MarvinARSystem)

**Responsibilities**:
- Initialize all subsystems
- Manage lifecycle (start, stop, dispose)
- Coordinate update loop
- Handle errors
- Provide debug API

**API**:
```typescript
export class MedSnapARSystem {
  private overlayManager?: OverlayManager;
  private voiceController?: VoiceController;
  private audioPlayer?: AudioPlayer;
  private stateManager?: StateManager;
  private modeManager?: ModeManager;
  private apiClient?: APIClient;

  private readonly config: MedSnapConfig;
  private isInitialized: boolean = false;
  private isRunning: boolean = false;

  constructor(config: MedSnapConfig) {
    this.config = config;
  }

  async initialize(
    script: Script,
    sceneRoot: SceneObject,
    remoteService: RemoteServiceModule,
    audioComponent: AudioComponent,
    asrModule?: AsrModule
  ): Promise<void> {
    // Store Lens Studio components
    // Initialize subsystems in dependency order
    // Setup event handlers
  }

  start(): void {
    // Start all subsystems
    // Begin update loop
  }

  stop(): void {
    // Stop all subsystems
  }

  update(): void {
    // Called every frame from UpdateEvent
    // Update overlays, check timeouts, monitor performance
  }

  dispose(): void {
    // Cleanup all subsystems
    // Release resources
  }

  // Accessors
  getCurrentMode(): AppMode;
  getCurrentPatient(): PatientData | null;
  getPerformanceMetrics(): PerformanceMetrics;
}
```

**Differences from Marvin**:
- Remove: ObjectTracker, GestureHandler, SpatialAnchors (CV not needed for clinical mode)
- Add: VoiceController, AudioPlayer, StateManager, ModeManager, APIClient
- Keep: OverlayManager pattern, lifecycle management, update loop, error handling

#### 3.3.2 Lens Studio Entry Point

**File**: `src/lens-studio-entry.ts`

**Pattern**: Exact pattern from marvin's `lens-studio-entry.ts`

**Critical Features**:
```typescript
// @input annotations (parsed by Lens Studio, not TypeScript)
// @input SceneObject sceneRoot
// @input Component.RemoteServiceModule remoteService
// @input Component.AudioComponent audioComponent

// Global declarations (Lens Studio provides these)
declare const script: Script;
declare const sceneRoot: SceneObject;
declare const remoteService: RemoteServiceModule;
declare const audioComponent: AudioComponent;

// System instance
let medSnapSystem: MedSnapARSystem;

// Initialize on scene load
const sceneLoadEvent = script.createEvent('SceneEvent.OnStart');
sceneLoadEvent.bind(() => {
  try {
    const config: MedSnapConfig = loadConfig();
    medSnapSystem = new MedSnapARSystem(config);
    await medSnapSystem.initialize(
      script,
      sceneRoot,
      remoteService,
      audioComponent
    );
    medSnapSystem.start();
  } catch (error) {
    console.error('[MedSnap] Initialization failed:', error);
  }
});

// Update loop
const updateEvent = script.createEvent('UpdateEvent');
updateEvent.bind(() => {
  if (medSnapSystem) {
    medSnapSystem.update();
  }
});

// Cleanup
const sceneUnloadEvent = script.createEvent('SceneEvent.OnDestroy');
sceneUnloadEvent.bind(() => {
  if (medSnapSystem) {
    medSnapSystem.dispose();
  }
});

// Debug API (accessible via global.medSnap in console)
(global as any).medSnap = {
  getSystem: () => medSnapSystem,
  getState: () => medSnapSystem?.getCurrentState(),
  getPatient: () => medSnapSystem?.getCurrentPatient(),
  getPerformance: () => medSnapSystem?.getPerformanceMetrics()
};
```

### 3.4 Component Implementations

#### 3.4.1 OverlayManager

**File**: `src/AROverlays/OverlayManager.ts`

**Pattern**: 90% reuse from marvin's `OverlayManager.ts`

**Changes**:
- Color palette: Use `AR_COLORS` (cyan, yellow, red, green) instead of marvin's colors
- Card layouts: Add multi-line patient card formatting (not just single-line labels)
- Position defaults: Top 1/3 of screen (fixed) instead of object-attached (dynamic)

**Keep Exactly**:
- Billboard rotation logic
- Fade animation system
- Max overlay limit (auto-remove oldest)
- TTL (time-to-live) for temporary overlays
- Dispose pattern

**API**:
```typescript
class OverlayManager {
  createOverlay(config: AROverlayConfig): void;
  removeOverlay(id: string): void;
  updateOverlay(id: string, updates: Partial<AROverlayConfig>): void;
  attachToPosition(id: string, position: vec3): void;
  updateBillboards(): void;  // Called in update loop
  fadeIn(id: string, duration: number): void;
  fadeOut(id: string, duration: number): void;
  checkExpiredOverlays(): void;
  dispose(): void;
}
```

#### 3.4.2 VoiceController (NEW - not in marvin)

**File**: `src/Voice/VoiceController.ts`

**Pattern Inspiration**: Marvin's GestureHandler structure (init, start/stop, callbacks, dispose)

**API**:
```typescript
class VoiceController {
  initialize(asrModule?: AsrModule): void;
  startListening(): void;
  stopListening(): void;
  onTranscription(callback: (text: string) => void): void;
  dispose(): void;
}
```

**Note**: Full ASR may be backend-based (send audio to backend for transcription). This is a placeholder/wrapper for now.

#### 3.4.3 AudioPlayer (NEW - not in marvin)

**File**: `src/Voice/AudioPlayer.ts`

**Responsibilities**:
- Play TTS audio from backend URLs
- Queue management (multiple TTS responses)
- Playback control (stop, pause)

**API**:
```typescript
class AudioPlayer {
  initialize(audioComponent: AudioComponent): void;
  async playFromUrl(url: string): Promise<void>;
  stop(): void;
  isPlaying(): boolean;
  dispose(): void;
}
```

**Integration**:
```typescript
// Example usage
const response = await apiClient.generateTTS("Sarah Chen, 34, Female");
await audioPlayer.playFromUrl(response.audioUrl);
```

#### 3.4.4 StateManager (NEW - not in marvin)

**File**: `src/State/StateManager.ts`

**Responsibilities**:
- Track current mode (IDLE, TRAINING, CLINICAL)
- Track clinical state (IDLE, PATIENT_LOADED, PRESCRIBING, etc.)
- Store current patient data
- Emit state change events
- Reset on exit

**API**:
```typescript
class StateManager {
  getCurrentMode(): AppMode;
  setMode(mode: AppMode): void;
  getClinicalState(): ClinicalState;
  setClinicalState(state: ClinicalState): void;
  getCurrentPatient(): PatientData | null;
  setCurrentPatient(patient: PatientData | null): void;
  onStateChange(callback: (state: any) => void): void;
  reset(): void;
}
```

#### 3.4.5 ModeManager (NEW - extends existing modeManager.js)

**File**: `src/State/ModeManager.ts`

**Current State**: Basic implementation in `Public/Scripts/clinical/modeManager.js`
- ✅ Mode switching logic
- ✅ Inactivity timers
- ✅ TTS confirmation messages

**Migration Path**:
1. Port existing JavaScript logic to TypeScript
2. Add type safety
3. Integrate with StateManager
4. Foundation for Dev 2 Task 2.1 (full implementation)

**API**:
```typescript
class ModeManager {
  initialize(stateManager: StateManager): void;
  switchMode(mode: AppMode): void;
  getCurrentMode(): AppMode;
  canSwitchTo(mode: AppMode): boolean;
  exitCurrentMode(): void;
  resetInactivityTimer(): void;
  dispose(): void;
}
```

#### 3.4.6 APIClient (NEW - not in marvin)

**File**: `src/Network/APIClient.ts`

**Responsibilities**:
- HTTP wrapper around RemoteServiceModule
- Request/response JSON serialization
- Timeout handling (5s default)
- Error handling with retries
- Endpoint mapping to backend APIs

**API**:
```typescript
class APIClient {
  initialize(remoteService: RemoteServiceModule, config: MedSnapConfig): void;

  // Clinical endpoints (backend already implemented)
  async loadPatient(patientName: string): Promise<APIResponse<PatientLoadResponse>>;
  async recordSymptom(symptom: string): Promise<APIResponse<SymptomRecordResponse>>;
  async createPrescription(medication: string, dosage: string): Promise<APIResponse<PrescriptionResponse>>;

  // Utility endpoints
  async extractIntent(transcription: string): Promise<APIResponse<VoiceCommand>>;
  async generateTTS(text: string): Promise<APIResponse<{ audioUrl: string }>>;

  // Internal
  private async makeRequest(endpoint: string, method: string, body: any): Promise<any>;
  dispose(): void;
}
```

**Integration with Backend**:
```typescript
// Example: Load patient
const response = await apiClient.loadPatient("Sarah Chen");
if (response.success) {
  stateManager.setCurrentPatient(response.data.patient);
  await audioPlayer.playFromUrl(response.data.audioUrl); // TTS greeting
  patientCardRenderer.render(response.data.patient);
}
```

---

## 4. Implementation Plan

### Phase 1: Build System Setup (2 hours)

**Deliverables**:
- [ ] `package.json` with build scripts
- [ ] `tsconfig.json` with Lens Studio settings
- [ ] `.gitignore` for node_modules, dist
- [ ] `npm install` succeeds
- [ ] `npm run build` succeeds (even with empty src/)

**Validation**:
```bash
cd /Users/jasonyi/snaplens-code/lens-studio
npm install
npm run build   # Should succeed
npm run dev     # Should start watch mode
```

### Phase 2: Type Definitions (2 hours)

**Deliverables**:
- [ ] `src/types/lens-studio.d.ts` (copy from marvin + extend)
- [ ] `src/types/core.ts` (MedSnap domain types)
- [ ] All types compile: `npm run type-check`

**Test**:
```typescript
// Test file should compile
import { PatientData, AROverlayConfig, AR_COLORS } from './types/core';
import { vec3, AudioComponent, Text } from './types/lens-studio';

const patient: PatientData = { /* ... */ };
const overlay: AROverlayConfig = { /* ... */ };
const position: vec3 = new vec3(0, 1, 0);
```

### Phase 3: AR System Core (4 hours)

**Deliverables**:
- [ ] `src/MedSnapARSystem.ts` (main coordinator)
- [ ] `src/lens-studio-entry.ts` (entry point)
- [ ] Build produces `dist/lens-studio-entry.js`
- [ ] @input annotations preserved

**Validation**:
```bash
npm run build
grep "@input SceneObject sceneRoot" dist/lens-studio-entry.js  # Should exist
```

### Phase 4: Component Implementations (6 hours)

**Deliverables**:
- [ ] `src/AROverlays/OverlayManager.ts` (2 hours)
- [ ] `src/Voice/VoiceController.ts` (1 hour - placeholder)
- [ ] `src/Voice/AudioPlayer.ts` (1 hour)
- [ ] `src/State/StateManager.ts` (1 hour)
- [ ] `src/State/ModeManager.ts` (1 hour - foundation)

**Validation**:
- All components have `initialize()`, `dispose()` methods
- Build succeeds without errors
- Type checking passes

### Phase 5: Network Client (2 hours)

**Deliverables**:
- [ ] `src/Network/APIClient.ts`
- [ ] All backend endpoints wrapped
- [ ] Timeout and error handling
- [ ] Integration tests with mock RemoteServiceModule

**Validation**:
```typescript
// Mock test
const mockRemoteService = new MockRemoteService();
const apiClient = new APIClient();
apiClient.initialize(mockRemoteService, config);
const response = await apiClient.loadPatient("Sarah Chen");
expect(response.success).toBe(true);
```

### Phase 6: Lens Studio Integration (2 hours)

**Deliverables**:
- [ ] Import `dist/lens-studio-entry.js` into Lens Studio
- [ ] Create scene objects (MedSnapSystem, SceneRoot, etc.)
- [ ] Wire @input components in Inspector
- [ ] System initializes in simulator
- [ ] Update loop runs
- [ ] System disposes cleanly
- [ ] Can make HTTP request to backend

**Validation** (Manual Tests):
1. **Test 6.1: System Initialization**
   - Play scene → Check console for initialization logs
   - Expected: "System initialized successfully"

2. **Test 6.2: Update Loop**
   - Enable performance monitoring
   - Play scene → Watch for FPS logs
   - Expected: ~60 FPS, no errors

3. **Test 6.3: System Cleanup**
   - Play → Stop → Play again
   - Expected: Clean disposal and re-initialization

4. **Test 6.4: API Request** (requires backend running)
   - Execute: `global.medSnap.getSystem().apiClient.loadPatient("Sarah Chen")`
   - Expected: HTTP request sent, response received

---

## 5. Testing Strategy

### 5.1 Test-Driven Development (TDD)

**MANDATORY WORKFLOW** (per CLAUDE.md):
```
1. WRITE TESTS FIRST - Define expected behavior
2. RUN TESTS - Confirm they FAIL (red)
3. COMMIT TESTS - git commit -m "test: Add [component] tests (TDD Step 1)"
4. IMPLEMENT CODE - Write minimum code to pass tests
5. RUN TESTS - Iterate until GREEN
6. COMMIT CODE - git commit -m "feat: Implement [component] (TDD Step 2)"
```

### 5.2 Test Coverage

**Unit Tests** (Jest):
- [ ] MedSnapARSystem interface tests
- [ ] OverlayManager tests (create, remove, fade, dispose)
- [ ] StateManager tests (mode switching, patient data, events)
- [ ] APIClient tests (HTTP requests, timeout, errors)

**Integration Tests** (Lens Studio Simulator):
- [ ] System initialization
- [ ] Update loop performance
- [ ] System cleanup (dispose and re-init)
- [ ] API request to backend

**Build Tests** (Shell scripts):
- [ ] TypeScript build succeeds
- [ ] @input annotations preserved
- [ ] Type checking passes

### 5.3 Acceptance Criteria

**All must PASS before spec complete**:
- [x] Build system: `npm run build` succeeds
- [x] Type checking: `npm run type-check` passes
- [x] Unit tests: `npm test` all green
- [x] Integration: System runs in Lens Studio simulator
- [x] Backend: Can make HTTP request and receive response
- [x] Audio: Can play TTS audio
- [x] Lifecycle: Initialize → Update → Dispose works correctly
- [x] Developer ready: Can start Dev 2 Task 2.1

---

## 6. Integration Points

### 6.1 With Existing Backend (Dev 3)

**Backend Status**: FULLY IMPLEMENTED
**API Endpoints**: All working with tests passing

**Integration**:
```typescript
// APIClient maps to backend routes
apiClient.loadPatient() → POST /api/clinical/patient/load
apiClient.recordSymptom() → POST /api/clinical/symptom/record
apiClient.createPrescription() → POST /api/clinical/prescription/create
apiClient.extractIntent() → POST /api/voice/command
apiClient.generateTTS() → POST /api/tts/generate
```

**Configuration**:
```typescript
// config in MedSnapARSystem
const config: MedSnapConfig = {
  backendUrl: "http://localhost:3000",  // Dev
  // OR
  backendUrl: "https://medsnap-api.railway.app",  // Production
  ...
};
```

### 6.2 With Existing Config (config.js)

**Current**: `global.MedSnapConfig` in `Public/Scripts/config.js`

**Migration Strategy**:
1. TypeScript `core.ts` exports typed `MedSnapConfig` interface
2. Create `loadConfig()` function that reads `global.MedSnapConfig`
3. Convert to TypeScript config object
4. Legacy JS files continue using `global.MedSnapConfig`
5. New TypeScript files use typed config

**Example**:
```typescript
function loadConfig(): MedSnapConfig {
  const legacyConfig = (global as any).MedSnapConfig;

  return {
    backendUrl: legacyConfig.API_BASE_URL,
    performance: {
      minFps: legacyConfig.PERFORMANCE.TARGET_FPS,
      maxDetectionLatency: 500,
    },
    timeouts: {
      clinicalModeInactivity: legacyConfig.TIMEOUTS.CLINICAL_AUTO_EXIT,
      trainingModeInactivity: legacyConfig.TIMEOUTS.TRAINING_AUTO_EXIT,
      httpRequest: 5000,
    },
    defaultOverlayStyle: {
      primaryColor: legacyConfig.AR_COLORS.CYAN,
      backgroundColor: legacyConfig.AR_COLORS.CARD_BG,
      fontSize: legacyConfig.TYPOGRAPHY.MIN_FONT_SIZE,
    },
    enablePerformanceMonitoring: true,
    demoMode: legacyConfig.DEMO_MODE,
    logLevel: 'debug',
  };
}
```

### 6.3 With Marvin Reference

**Usage Pattern**:
| MedSnap Component | Marvin Equivalent | Reuse % | Strategy |
|-------------------|-------------------|---------|----------|
| MedSnapARSystem | MarvinARSystem | 70% | Remove CV, add Voice/API |
| lens-studio-entry.ts | lens-studio-entry.ts | 95% | Change @inputs only |
| lens-studio.d.ts | lens-studio.d.ts | 80% | Add Audio/Text types |
| core.ts | core.ts | 5% | Completely different domain |
| OverlayManager | OverlayManager | 90% | Adapt colors and layouts |
| VoiceController | GestureHandler | 30% | Structure inspiration only |
| AudioPlayer | - | 0% | Create from scratch |
| StateManager | - | 0% | Create from scratch |
| APIClient | - | 0% | Create from scratch |

**Reference Files**:
- `/Users/jasonyi/snaplens-code/marvin/ar-core/src/main.ts`
- `/Users/jasonyi/snaplens-code/marvin/ar-core/src/lens-studio-entry.ts`
- `/Users/jasonyi/snaplens-code/marvin/ar-core/src/types/lens-studio.d.ts`
- `/Users/jasonyi/snaplens-code/marvin/ar-core/src/AROverlays/OverlayManager.ts`
- `/Users/jasonyi/snaplens-code/marvin/ar-core/tsconfig.json`

---

## 7. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Lens Studio doesn't support TypeScript syntax | HIGH | Use marvin's proven tsconfig (ES2020, CommonJS) |
| @input annotations break after build | HIGH | Set `removeComments: false`, test early in Phase 3 |
| Performance degradation | MEDIUM | Profile in simulator, match marvin's update loop pattern |
| Type definitions incomplete | MEDIUM | Start with marvin's types, extend incrementally |
| Backend integration failures | MEDIUM | Test with mocks first, then real backend |
| Existing JS conflicts with TypeScript | LOW | Keep legacy in Public/Scripts, new code in src/ |

---

## 8. Success Metrics

**Infrastructure Complete When**:
1. **Build Success**: 100% (no TypeScript errors)
2. **Integration Success**: All @input components wire in Lens Studio
3. **Runtime Success**: System runs in simulator without errors
4. **Code Reuse**: >80% of patterns match marvin's proven implementation
5. **Developer Readiness**: Dev 2 can start Task 2.1 immediately

**Performance Targets** (per FR-41, FR-42, FR-44):
- AR rendering: ≥30 FPS (ideally 60 FPS)
- Voice command response: <3s (wake word → TTS)
- TTS generation: <1.5s (target <500ms with cache)
- HTTP request latency: <3s

---

## 9. Post-Implementation

### 9.1 Next Steps (Dev 2 Tasks)

With this infrastructure in place, proceed to:

1. **Task 2.1: Mode Manager** (hours 6-12)
   - Extend `src/State/ModeManager.ts`
   - Full implementation with tests
   - Integration with voice commands

2. **Task 2.2: Patient Card Renderer** (hours 12-18)
   - Create `src/Clinical/PatientCardRenderer.ts`
   - Use OverlayManager for AR display
   - Top 1/3 screen positioning

3. **Task 2.3: Clinical Mode State Machine** (hours 18-30)
   - Create `src/Clinical/ClinicalModeStateMachine.ts`
   - Workflow: Load patient → Record symptoms → Prescribe
   - Voice integration via APIClient

4. **Task 2.4: Prescription UI** (hours 30-36)
   - Create `src/Clinical/PrescriptionUI.ts`
   - Display drug warnings (red for HIGH severity)
   - TTS feedback via AudioPlayer

### 9.2 Documentation Updates

- [ ] Update CLAUDE.md with TypeScript workflow
- [ ] Create Dev 2 Task 2.1 spec
- [ ] Archive this spec folder as reference

---

## 10. References

### 10.1 Existing Codebase

**Backend** (IMPLEMENTED):
- `/Users/jasonyi/snaplens-code/backend/` - Express API, all endpoints working
- `/Users/jasonyi/snaplens-code/backend/tests/` - Comprehensive test suite

**Frontend** (PLACEHOLDER):
- `/Users/jasonyi/snaplens-code/lens-studio/Public/Scripts/` - Legacy JS files
- `/Users/jasonyi/snaplens-code/lens-studio/MedSnap.lsproj/` - Lens Studio project

**Reference Implementation**:
- `/Users/jasonyi/snaplens-code/marvin/ar-core/` - Working TypeScript AR system

### 10.2 Planning Documents

**This Spec Folder**:
- `README.md` - Overview and problem statement
- `implementation-guide.md` - Step-by-step implementation instructions
- `marvin-to-medsnap-mapping.md` - Detailed pattern mapping
- `test-plan.md` - TDD workflow and test definitions
- `CHECKLIST.md` - Phase-by-phase progress tracking
- `spec.md` - This document (formal specification)

### 10.3 Project Documentation

- `/Users/jasonyi/snaplens-code/MedSnap_PRD.md` - Product requirements
- `/Users/jasonyi/snaplens-code/MedSnap_TaskList_Updated.md` - Task breakdown
- `/Users/jasonyi/snaplens-code/CLAUDE.md` - Developer guidelines (TDD, KISS, YAGNI)
- `/Users/jasonyi/snaplens-code/docs/Lens_Studio_API_Reference.md` - API docs
- `/Users/jasonyi/snaplens-code/docs/Marvin_vs_MedSnap_Comparison_Report.md` - Architecture comparison

---

## 11. Sign-Off

**Specification Status**: DRAFT
**Ready for Implementation**: Pending review

**Developer**: __________ Date: __________
**Reviewer**: __________ Date: __________

**Approved for Implementation**: YES / NO

---

## Appendix A: File Checklist

**Files to Create** (All in `/Users/jasonyi/snaplens-code/lens-studio/`):

**Build System**:
- [ ] `package.json`
- [ ] `tsconfig.json`
- [ ] `.gitignore`

**Type Definitions**:
- [ ] `src/types/lens-studio.d.ts`
- [ ] `src/types/core.ts`

**Core System**:
- [ ] `src/MedSnapARSystem.ts`
- [ ] `src/lens-studio-entry.ts`

**Components**:
- [ ] `src/AROverlays/OverlayManager.ts`
- [ ] `src/Voice/VoiceController.ts`
- [ ] `src/Voice/AudioPlayer.ts`
- [ ] `src/State/StateManager.ts`
- [ ] `src/State/ModeManager.ts`
- [ ] `src/Network/APIClient.ts`

**Tests** (TDD):
- [ ] `__tests__/build.test.sh`
- [ ] `__tests__/annotations.test.sh`
- [ ] `__tests__/types-compile.test.ts`
- [ ] `__tests__/ar-system.test.ts`
- [ ] `__tests__/overlay-manager.test.ts`
- [ ] `__tests__/state-manager.test.ts`
- [ ] `__tests__/api-client.test.ts`

**Total Files**: 22

---

## Appendix B: Command Reference

```bash
# Setup
cd /Users/jasonyi/snaplens-code/lens-studio
npm install

# Development
npm run build              # Build TypeScript
npm run dev                # Watch mode
npm run type-check         # Type checking only
npm test                   # Run tests (after jest setup)

# Validation
grep "@input" dist/lens-studio-entry.js  # Check annotations preserved
npm run build && echo "Build OK"          # Quick validation

# Backend (for integration testing)
cd /Users/jasonyi/snaplens-code/backend
npm run dev                # Start backend at http://localhost:3000
```

---

**END OF SPECIFICATION**
