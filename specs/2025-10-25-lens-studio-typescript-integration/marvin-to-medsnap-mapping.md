# Marvin to MedSnap Mapping

This document maps marvin's proven TypeScript AR patterns to MedSnap's specific requirements. Use this as a reference during implementation.

## Directory Structure Comparison

### Marvin
```
marvin/ar-core/
├── src/
│   ├── main.ts                    # MarvinARSystem coordinator
│   ├── lens-studio-entry.ts       # Lens Studio entry point
│   ├── types/
│   │   ├── lens-studio.d.ts       # Lens Studio API types
│   │   └── core.ts                # Marvin core types
│   ├── AROverlays/
│   │   └── OverlayManager.ts      # AR overlay rendering
│   ├── Gestures/
│   │   └── GestureHandler.ts      # Hand gesture recognition
│   ├── ObjectDetection/
│   │   ├── ObjectTracker.ts       # Object tracking
│   │   ├── SpatialAnchors.ts      # Spatial memory
│   │   └── DemoObjects.ts         # Object configs
│   ├── tsconfig.json
│   └── package.json
```

### MedSnap (To Create)
```
lens-studio/
├── src/
│   ├── MedSnapARSystem.ts         # ≈ MarvinARSystem
│   ├── lens-studio-entry.ts       # Same pattern
│   ├── types/
│   │   ├── lens-studio.d.ts       # Copy from marvin, adapt
│   │   └── core.ts                # MedSnap-specific types
│   ├── AROverlays/
│   │   └── OverlayManager.ts      # ≈ marvin's OverlayManager
│   ├── Voice/                     # NEW (not in marvin)
│   │   ├── VoiceController.ts     # ASR integration
│   │   └── AudioPlayer.ts         # TTS playback
│   ├── State/                     # NEW (not in marvin)
│   │   ├── StateManager.ts        # App state management
│   │   └── ModeManager.ts         # Mode switching
│   ├── Clinical/                  # NEW (Dev 2 tasks)
│   │   ├── PatientCardRenderer.ts
│   │   ├── ClinicalModeStateMachine.ts
│   │   └── PrescriptionUI.ts
│   ├── Network/                   # NEW (not in marvin)
│   │   └── APIClient.ts           # Backend HTTP client
│   ├── tsconfig.json              # ≈ marvin's config
│   └── package.json               # ≈ marvin's scripts
```

## Component Mapping

### 1. Main System Coordinator

#### Marvin: MarvinARSystem
**File**: `marvin/ar-core/src/main.ts`

**Key patterns:**
- Constructor takes config object
- `initialize()` accepts all Lens Studio components
- `start()` / `stop()` control system
- `update()` called every frame
- `dispose()` cleanup on scene unload
- Private component references (overlayManager, objectTracker, etc.)
- Event handlers for component communication
- Performance monitoring

**MedSnap equivalent**: `MedSnapARSystem.ts`

**Differences**:
- No ObjectTracker or GestureHandler (clinical mode doesn't need CV)
- Add VoiceController for ASR
- Add AudioPlayer for TTS
- Add StateManager for mode/patient state
- Add APIClient for backend calls

**Keep from marvin**:
- Overall structure and lifecycle pattern
- OverlayManager integration
- Update loop pattern
- Performance monitoring approach
- Error handling with ARError

### 2. Lens Studio Entry Point

#### Marvin: lens-studio-entry.ts
**File**: `marvin/ar-core/src/lens-studio-entry.ts`

**Key patterns:**
```typescript
// @input declarations
// @input SceneObject sceneRoot
// @input Component.ObjectTracking objectTracking
// @input Component.MLComponent mlComponent
// @input Component.HandTracking handTracking
// @input Component.DeviceTracking deviceTracking
// @input Component.SceneUnderstanding sceneUnderstanding {"optional": true}
// @input Component.Camera camera
// @input Component.RemoteServiceModule remoteService {"optional": true}

// Global declarations
declare const script: Script;
declare const sceneRoot: SceneObject;
// ... etc

// Create system
let arSystem: MarvinARSystem;

// Initialize on scene load
const sceneLoadEvent = script.createEvent('SceneEvent.OnStart');
sceneLoadEvent.bind(() => {
  initializeSystem();
});

// Update loop
const updateEvent = script.createEvent('UpdateEvent');
updateEvent.bind(() => {
  arSystem.update();
});

// Cleanup
const sceneUnloadEvent = script.createEvent('SceneEvent.OnDestroy');
sceneUnloadEvent.bind(() => {
  arSystem.dispose();
});

// Debug API
(global as any).marvinAR = {
  getSystem: () => arSystem,
  getTrackedObjects: () => arSystem?.getTrackedObjects() || [],
  getPerformance: () => arSystem?.getPerformanceMetrics()
};
```

**MedSnap equivalent**: `lens-studio-entry.ts`

**Changes**:
```typescript
// MedSnap @inputs (simpler - no CV components)
// @input SceneObject sceneRoot
// @input Component.RemoteServiceModule remoteService
// @input Component.AudioComponent audioComponent

// MedSnap-specific debug API
(global as any).medSnap = {
  getSystem: () => medSnapSystem,
  getState: () => medSnapSystem?.getCurrentState(),
  getPatient: () => medSnapSystem?.getCurrentPatient(),
  getPerformance: () => medSnapSystem?.getPerformanceMetrics()
};
```

**Keep exactly**:
- Event binding pattern (OnStart, UpdateEvent, OnDestroy)
- Error handling in initializeSystem()
- Global debug API pattern

### 3. Type Definitions

#### Marvin: lens-studio.d.ts
**File**: `marvin/ar-core/src/types/lens-studio.d.ts`

**Coverage**:
- Core math (vec3, quat, mat4)
- ObjectTracking
- MLComponent
- HandTracking
- DeviceTracking
- SceneUnderstanding
- RemoteServiceModule (basic)

**MedSnap needs**: Copy entire file, then ADD:
- AudioComponent (complete definition)
- AsrModule (if using Snap ASR)
- Text component (full properties)
- ScreenTransform (positioning)
- AnimationPlayer (fade effects)
- BackgroundSettings (card backgrounds)

**Pattern to follow**:
```typescript
declare namespace LensStudio {
  export class AudioComponent extends Component {
    audioTrack: AudioTrack;
    volume: number;
    play(): void;
    stop(): void;
    pause(): void;
    resume(): void;
    isPlaying(): boolean;
  }

  export class Text extends Component {
    text: string;
    size: number;
    textFill: TextFill;
    outlineSize: number;
    outlineColor: vec4;
    horizontalAlignment: HorizontalAlignment;
    verticalAlignment: VerticalAlignment;
  }

  // etc.
}
```

#### Marvin: core.ts
**File**: `marvin/ar-core/src/types/core.ts`

**Defines**:
- DemoObject (detected objects)
- DemoObjectConfig (object metadata)
- OverlayStyle
- GestureEvent
- PerformanceMetrics
- ARConfig

**MedSnap equivalent**: Completely different domain

**Replace with**:
- PatientData
- PrescriptionData
- VoiceCommand
- ClinicalState enum
- AppMode enum
- AR_COLORS constants
- MedSnapConfig

**Keep patterns**:
- Config object structure
- Performance metrics shape
- Overlay style definition (adapt colors)

### 4. Overlay Manager

#### Marvin: OverlayManager.ts
**File**: `marvin/ar-core/src/AROverlays/OverlayManager.ts`

**Key features**:
- Create text overlays at 3D positions
- Billboard effect (face camera)
- Adaptive brightness based on environment
- Fade in/out animations
- TTL (time-to-live) for temporary overlays
- Attach overlays to objects

**MedSnap can use ~90% as-is**

**Changes needed**:
- Color palette: Replace marvin's colors with AR_COLORS (cyan, yellow, red, green)
- Card layout: Add patient card-specific formatting (multi-line, sections)
- Position defaults: Top 1/3 of screen instead of object-attached

**Keep exactly**:
- Billboard rotation logic
- Fade animation system
- Max overlay limit
- Dispose pattern

**Example adaptation**:
```typescript
// Marvin
const config = DEMO_OBJECTS_CONFIG[object.type];
this.overlayManager.createOverlay({
  id: `overlay_${object.id}`,
  type: 'text',
  position: new vec3(object.spatialPosition.x, object.spatialPosition.y + 0.2, object.spatialPosition.z),
  content: config.displayName,
  style: config.overlayStyle,
  billboard: true,
  visible: true,
  opacity: 1.0
});

// MedSnap
this.overlayManager.createOverlay({
  id: 'patient-card',
  type: 'card',
  position: new vec3(0, 0.9, -1), // Top center, fixed distance
  content: formatPatientCard(patient),
  style: {
    primaryColor: AR_COLORS.CYAN,
    backgroundColor: [0, 0, 0, 0.8],
    fontSize: 18 // Minimum per FR AR-2
  },
  billboard: true,
  visible: true,
  opacity: 1.0
});
```

### 5. Components NOT in Marvin (MedSnap-specific)

These components have no marvin equivalent. Design from scratch following TypeScript/KISS principles.

#### VoiceController
**Purpose**: ASR integration and wake word detection

**Pattern inspiration**: Marvin's GestureHandler structure
- `initialize()` setup
- `startTracking()` / `stopTracking()` control
- Event callbacks for transcriptions
- `dispose()` cleanup

**API design**:
```typescript
class VoiceController {
  private asrModule?: AsrModule; // If using Snap ASR
  private isListening: boolean = false;
  private onTranscriptionCallback?: (text: string) => void;

  initialize(asrModule?: AsrModule): void;
  startListening(): void;
  stopListening(): void;
  onTranscription(callback: (text: string) => void): void;
  dispose(): void;
}
```

#### AudioPlayer
**Purpose**: Play TTS audio from URLs

**Pattern inspiration**: Marvin's component initialization
- Store AudioComponent reference
- Async audio loading
- Queue for multiple TTS responses

**API design**:
```typescript
class AudioPlayer {
  private audioComponent?: AudioComponent;
  private queue: string[] = [];
  private isPlaying: boolean = false;

  initialize(audioComponent: AudioComponent): void;
  async playFromUrl(url: string): Promise<void>;
  stop(): void;
  isPlaying(): boolean;
  dispose(): void;
}
```

#### StateManager
**Purpose**: Global application state

**Pattern inspiration**: Marvin's event-based communication
- Event emitter for state changes
- State getters/setters
- Reset functionality

**API design**:
```typescript
class StateManager {
  private currentMode: AppMode = AppMode.IDLE;
  private clinicalState: ClinicalState = ClinicalState.IDLE;
  private currentPatient: PatientData | null = null;
  private listeners: ((state: any) => void)[] = [];

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

#### APIClient
**Purpose**: Backend HTTP requests

**Pattern inspiration**: Marvin's RemoteServiceModule usage (basic)
- Promise-based API
- Timeout handling
- Error retries

**API design**:
```typescript
class APIClient {
  private remoteService?: RemoteServiceModule;
  private config?: MedSnapConfig;

  initialize(remoteService: RemoteServiceModule, config: MedSnapConfig): void;

  async loadPatient(patientName: string): Promise<APIResponse<PatientLoadResponse>>;
  async recordSymptom(symptom: string): Promise<APIResponse<SymptomRecordResponse>>;
  async createPrescription(medication: string, dosage: string): Promise<APIResponse<PrescriptionResponse>>;
  async extractIntent(transcription: string): Promise<APIResponse<VoiceCommand>>;
  async generateTTS(text: string): Promise<APIResponse<{ audioUrl: string }>>;

  private async makeRequest(endpoint: string, method: string, body: any): Promise<any>;
  dispose(): void;
}
```

## Build Configuration

### tsconfig.json

**Marvin's config**:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020"],
    "experimentalDecorators": true,
    "module": "commonjs",
    "moduleResolution": "node",
    "declaration": true,
    "sourceMap": true,
    "outDir": "./dist",
    "strict": true,
    // ... full config in marvin/ar-core/tsconfig.json
  }
}
```

**MedSnap can use 95% as-is**

**Changes**:
- `baseUrl`: "."
- `paths`: Update aliases for MedSnap structure

**Keep exactly**:
- target: ES2020 (Lens Studio compatibility)
- module: commonjs (required)
- experimentalDecorators: true (@input support)
- All strict mode flags

### package.json

**Marvin's scripts**:
```json
{
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "clean": "node -e \"const fs = require('fs'); if (fs.existsSync('dist')) fs.rmSync('dist', { recursive: true, force: true });\"",
    "prebuild": "npm run clean"
  }
}
```

**MedSnap can use exactly as-is**

**Add**:
- "test": "jest" (for TDD)
- "lint": "eslint src/**/*.ts"

## Initialization Pattern

### Marvin's initialize() method
```typescript
public async initialize(
  script: Script,
  sceneRoot: SceneObject,
  objectTracking: ObjectTracking,
  mlComponent: MLComponent,
  handTracking: HandTracking,
  deviceTracking: DeviceTracking,
  sceneUnderstanding: SceneUnderstanding,
  cameraProvider: CameraTextureProvider,
  remoteService: RemoteServiceModule
): Promise<void> {
  // Store components
  this.script = script;
  this.deviceTracking = deviceTracking;
  this.sceneUnderstanding = sceneUnderstanding;
  this.remoteService = remoteService;

  // Initialize subsystems
  this.objectTracker = new ObjectTracker({...});
  await this.objectTracker.initialize(objectTracking, mlComponent);

  this.overlayManager = new OverlayManager({...});
  this.gestureHandler = new GestureHandler({...});

  // Setup events
  this.setupEventHandlers();
  this.setupUpdateLoop();

  this.isInitialized = true;
}
```

### MedSnap equivalent
```typescript
public async initialize(
  script: Script,
  sceneRoot: SceneObject,
  remoteService: RemoteServiceModule,
  audioComponent: AudioComponent,
  asrModule?: AsrModule
): Promise<void> {
  // Store components
  this.script = script;
  this.remoteService = remoteService;
  this.audioComponent = audioComponent;

  // Initialize subsystems
  this.overlayManager = new OverlayManager({
    parentScene: sceneRoot,
    maxOverlays: 20
  });

  this.voiceController = new VoiceController();
  this.voiceController.initialize(asrModule);

  this.audioPlayer = new AudioPlayer();
  this.audioPlayer.initialize(audioComponent);

  this.stateManager = new StateManager();

  this.modeManager = new ModeManager();
  this.modeManager.initialize(this.stateManager);

  this.apiClient = new APIClient();
  this.apiClient.initialize(remoteService, this.config);

  // Setup events
  this.setupEventHandlers();
  this.setupUpdateLoop();

  this.isInitialized = true;
}
```

**Pattern to keep**:
- Store Lens Studio components first
- Initialize subsystems in dependency order
- Use config objects for subsystem initialization
- Setup events after initialization
- Set isInitialized flag last

## Update Loop Pattern

### Marvin's update()
```typescript
private update(): void {
  if (!this.isRunning) {
    return;
  }

  try {
    // Update camera position for overlays
    this.updateCameraPosition();

    // Update environmental brightness
    this.updateEnvironmentalBrightness();

    // Update billboard rotations
    this.overlayManager?.updateBillboards();

    // Update gesture handler with tracked objects
    const trackedObjects = this.objectTracker?.getTrackedObjects() || [];
    this.gestureHandler?.updateTrackedObjects(trackedObjects);

    // Cleanup
    this.overlayManager?.checkExpiredOverlays();
    this.spatialAnchors?.cleanupOldAnchors();

    // Performance monitoring
    if (this.config.enablePerformanceMonitoring) {
      this.checkPerformance();
    }
  } catch (error) {
    console.error('[MarvinAR] Error in update loop:', error);
  }
}
```

### MedSnap equivalent
```typescript
private update(): void {
  if (!this.isRunning) {
    return;
  }

  try {
    // Update overlays
    this.overlayManager?.updateBillboards();
    this.overlayManager?.checkExpiredOverlays();

    // Check for inactivity timeout
    this.checkInactivityTimeout();

    // Performance monitoring
    if (this.config.enablePerformanceMonitoring) {
      this.checkPerformance();
    }
  } catch (error) {
    console.error('[MedSnap] Error in update loop:', error);
  }
}
```

**Pattern to keep**:
- Guard clause for !isRunning
- Try-catch wrapper
- Update overlays
- Cleanup expired resources
- Performance monitoring conditional
- Error logging

**MedSnap differences**:
- No camera position update (overlays fixed position)
- No environmental brightness (indoor use)
- Add inactivity timeout check (120s clinical, 10s training)

## Error Handling Pattern

### Marvin's ARError
```typescript
export class ARError extends Error {
  constructor(
    public readonly type: ARErrorType,
    message: string,
    public readonly context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ARError';
  }
}

export enum ARErrorType {
  ML_MODEL_LOAD_FAILED = 'ML_MODEL_LOAD_FAILED',
  TRACKING_LOST = 'TRACKING_LOST',
  INITIALIZATION_FAILED = 'INITIALIZATION_FAILED',
  INVALID_CONFIG = 'INVALID_CONFIG'
}
```

**MedSnap should use similar**:
```typescript
export class MedSnapError extends Error {
  constructor(
    public readonly type: MedSnapErrorType,
    message: string,
    public readonly context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'MedSnapError';
  }
}

export enum MedSnapErrorType {
  INITIALIZATION_FAILED = 'INITIALIZATION_FAILED',
  API_REQUEST_FAILED = 'API_REQUEST_FAILED',
  TTS_PLAYBACK_FAILED = 'TTS_PLAYBACK_FAILED',
  PATIENT_NOT_FOUND = 'PATIENT_NOT_FOUND',
  INVALID_MODE_TRANSITION = 'INVALID_MODE_TRANSITION'
}
```

## Performance Monitoring Pattern

### Marvin's approach
```typescript
private checkPerformance(): void {
  const now = Date.now();

  if (now - this.lastPerformanceCheck < this.performanceCheckInterval) {
    return;
  }

  this.lastPerformanceCheck = now;

  const metrics: PerformanceMetrics = {
    fps: this.calculateFPS(),
    detectionLatency: this.objectTracker?.getAverageDetectionLatency() || 0,
    renderLatency: this.overlayManager?.getAverageRenderLatency() || 0,
    gestureLatency: this.gestureHandler?.getAverageRecognitionLatency() || 0,
    trackedObjectCount: this.objectTracker?.getTrackedObjectCount() || 0,
    activeOverlayCount: this.overlayManager?.getOverlayCount() || 0,
    memoryUsage: 0,
    timestamp: now
  };

  this.validatePerformance(metrics);

  if (this.config.logLevel === 'debug') {
    console.log('[MarvinAR] Performance:', metrics);
  }
}
```

**MedSnap should use similar**:
```typescript
private checkPerformance(): void {
  const now = Date.now();

  if (now - this.lastPerformanceCheck < 1000) {
    return; // Check every 1 second
  }

  this.lastPerformanceCheck = now;

  const metrics: PerformanceMetrics = {
    fps: this.calculateFPS(),
    renderLatency: this.overlayManager?.getAverageRenderLatency() || 0,
    audioLatency: this.audioPlayer?.getLatency() || 0,
    httpLatency: this.apiClient?.getAverageLatency() || 0,
    timestamp: now
  };

  // Check against FR-41 (30 FPS minimum)
  if (metrics.fps < 30) {
    console.warn('[MedSnap] FPS below minimum:', metrics.fps);
  }

  if (this.config.logLevel === 'debug') {
    console.log('[MedSnap] Performance:', metrics);
  }
}
```

**Pattern to keep**:
- Throttle checks (1/second)
- Collect metrics from all subsystems
- Validate against thresholds
- Log only in debug mode

## Summary: What to Copy vs. Create

### Copy Almost Exactly (95%+)
- `lens-studio-entry.ts` structure (change inputs and debug API)
- `tsconfig.json` (update paths only)
- `package.json` scripts
- Event binding pattern (OnStart, UpdateEvent, OnDestroy)
- Error handling pattern (ARError → MedSnapError)
- Performance monitoring pattern

### Adapt Heavily (50-70%)
- `main.ts` → `MedSnapARSystem.ts` (remove CV, add Voice/State/API)
- `OverlayManager.ts` (change colors, add card layouts)
- `lens-studio.d.ts` (add Audio/Text/Animation types)

### Create from Scratch (0% from marvin)
- `VoiceController.ts`
- `AudioPlayer.ts`
- `StateManager.ts`
- `ModeManager.ts`
- `APIClient.ts`
- `core.ts` (completely different domain)
- All Clinical/ components (Dev 2 tasks)

## Implementation Checklist

When implementing each file, ask:

- [ ] Does marvin have an equivalent? (Check this document)
- [ ] If yes, what percentage can be reused? (See summary above)
- [ ] What patterns should be kept exactly? (Event binding, error handling, etc.)
- [ ] What needs adaptation? (Colors, API surface, etc.)
- [ ] If creating from scratch, which marvin pattern is most similar? (Structure inspiration)
- [ ] Are all TypeScript types properly defined?
- [ ] Does it follow KISS principle? (No over-engineering)
- [ ] Are tests written FIRST per TDD? (Non-negotiable)

## Quick Reference

| MedSnap Component | Marvin Equivalent | Reuse % | Notes |
|-------------------|-------------------|---------|-------|
| MedSnapARSystem | MarvinARSystem | 70% | Remove CV, add Voice/API |
| lens-studio-entry.ts | lens-studio-entry.ts | 95% | Change inputs only |
| lens-studio.d.ts | lens-studio.d.ts | 80% | Add Audio/Text types |
| core.ts | core.ts | 5% | Completely different domain |
| OverlayManager | OverlayManager | 90% | Adapt colors and layouts |
| VoiceController | GestureHandler (pattern) | 30% | Structure only |
| AudioPlayer | - | 0% | Create from scratch |
| StateManager | - | 0% | Create from scratch |
| ModeManager | - | 0% | Create from scratch |
| APIClient | - | 0% | Create from scratch |
| tsconfig.json | tsconfig.json | 95% | Update paths only |
| package.json | package.json | 95% | Add test script |

---

**Remember**: Marvin is a reference for TypeScript + Lens Studio integration patterns, NOT a medical app. Copy the infrastructure, adapt the domain logic, create clinical features from scratch.
