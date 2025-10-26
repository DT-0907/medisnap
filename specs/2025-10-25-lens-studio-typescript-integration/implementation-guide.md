# Implementation Guide: Lens Studio TypeScript Integration

This guide provides step-by-step instructions for implementing the TypeScript integration for MedSnap's Lens Studio project.

## Phase 1: Build System Setup (2 hours)

### Step 1.1: Create package.json

**Location**: `/Users/jasonyi/snaplens-code/lens-studio/package.json`

```json
{
  "name": "medsnap-lens-studio",
  "version": "1.0.0",
  "description": "MedSnap Lens Studio TypeScript implementation",
  "main": "dist/lens-studio-entry.js",
  "types": "dist/lens-studio-entry.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "clean": "node -e \"const fs = require('fs'); if (fs.existsSync('dist')) fs.rmSync('dist', { recursive: true, force: true });\"",
    "prebuild": "npm run clean",
    "type-check": "tsc --noEmit",
    "lint": "eslint src/**/*.ts",
    "lint:fix": "eslint src/**/*.ts --fix"
  },
  "keywords": [
    "ar",
    "snap-spectacles",
    "lens-studio",
    "medical-assistant",
    "typescript"
  ],
  "author": "MedSnap Team - Dev 2",
  "license": "MIT",
  "devDependencies": {
    "@types/node": "^20.10.6",
    "@typescript-eslint/eslint-plugin": "^6.17.0",
    "@typescript-eslint/parser": "^6.17.0",
    "eslint": "^8.56.0",
    "typescript": "^5.3.3"
  },
  "engines": {
    "node": ">=20.0.0",
    "npm": ">=10.0.0"
  }
}
```

### Step 1.2: Create tsconfig.json

**Location**: `/Users/jasonyi/snaplens-code/lens-studio/tsconfig.json`

```json
{
  "compilerOptions": {
    /* Language and Environment */
    "target": "ES2020",
    "lib": ["ES2020"],
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,

    /* Modules */
    "module": "commonjs",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@types/*": ["src/types/*"],
      "@ar-overlays/*": ["src/AROverlays/*"],
      "@voice/*": ["src/Voice/*"],
      "@state/*": ["src/State/*"],
      "@clinical/*": ["src/Clinical/*"],
      "@network/*": ["src/Network/*"]
    },

    /* Emit */
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "removeComments": false,
    "importHelpers": false,
    "downlevelIteration": true,

    /* Interop Constraints */
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true,

    /* Type Checking */
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": false,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,

    /* Completeness */
    "skipLibCheck": true
  },
  "include": [
    "src/**/*"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "MedSnap.lsproj",
    "**/*.spec.ts",
    "**/*.test.ts"
  ]
}
```

### Step 1.3: Create .gitignore

**Location**: `/Users/jasonyi/snaplens-code/lens-studio/.gitignore`

```
# Dependencies
node_modules/

# Build output
dist/

# TypeScript cache
*.tsbuildinfo

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Lens Studio (keep project files)
# MedSnap.lsproj/ - DO NOT IGNORE
```

### Step 1.4: Install dependencies

```bash
cd /Users/jasonyi/snaplens-code/lens-studio
npm install
```

**Validation:**
```bash
npm run build  # Should succeed (even with empty src/)
npm run dev    # Should start watch mode
```

## Phase 2: Type Definitions (2 hours)

### Step 2.1: Create Lens Studio API type definitions

**Location**: `/Users/jasonyi/snaplens-code/lens-studio/src/types/lens-studio.d.ts`

**Pattern**: Adapt from marvin's `lens-studio.d.ts`, focusing on Dev 2 needs

**Key types to define:**
1. **Core Math Types**: vec3, vec2, vec4, quat, mat4
2. **Scene Types**: Script, SceneObject, Component, Transform
3. **Rendering**: Text, ScreenTransform, BackgroundSettings
4. **Audio**: AudioComponent, AudioTrack, AsrModule
5. **Networking**: RemoteServiceModule, Request, Response
6. **Events**: UpdateEvent, SceneEvent, TapEvent
7. **Device**: DeviceTracking

**Reference**: `/Users/jasonyi/snaplens-code/marvin/ar-core/src/types/lens-studio.d.ts`

### Step 2.2: Create MedSnap core types

**Location**: `/Users/jasonyi/snaplens-code/lens-studio/src/types/core.ts`

```typescript
/**
 * MedSnap Core Type Definitions
 * Defines data structures for clinical mode, patient data, and UI
 */

import { vec3 } from './lens-studio';

// =============================================================================
// Application Modes
// =============================================================================

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
  SHOWING_MEDICATIONS = 'SHOWING_MEDICATIONS',
  SHOWING_ALLERGIES = 'SHOWING_ALLERGIES',
  PRESCRIBING = 'PRESCRIBING',
  ERROR = 'ERROR'
}

// =============================================================================
// Patient Data
// =============================================================================

export interface PatientData {
  id: string;
  name: string;
  age: number;
  sex: string;
  chiefComplaint?: string;
  currentSymptoms: string[];
  vitalSigns: VitalSigns;
  allergies: string[];
  medications: Medication[];
  diagnosisHistory: Diagnosis[];
}

export interface VitalSigns {
  bloodPressure?: string;
  heartRate?: number;
  oxygenSaturation?: number;
  temperature?: number;
}

export interface Medication {
  name: string;
  dosage: string;
  startedDate: string;
}

export interface Diagnosis {
  date: string;
  diagnosis: string;
  provider: string;
}

// =============================================================================
// Prescription Data
// =============================================================================

export interface PrescriptionData {
  id: string;
  patientId: string;
  medication: string;
  dosage: string;
  status: PrescriptionStatus;
  blocked: boolean;
  warnings: DrugInteractionWarning[];
  createdAt: string;
}

export type PrescriptionStatus =
  | 'pending_physician_approval'
  | 'approved'
  | 'blocked';

export interface DrugInteractionWarning {
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  interactingDrug: string;
  description: string;
  recommendation?: string;
}

// =============================================================================
// Voice Commands
// =============================================================================

export interface VoiceCommand {
  intent: VoiceIntent;
  parameters: Record<string, string>;
  confidence: number;
  rawTranscription: string;
}

export enum VoiceIntent {
  START_TRAINING = 'start_training',
  END_TRAINING = 'end_training',
  START_ASSESSMENT = 'start_assessment',
  END_ASSESSMENT = 'end_assessment',
  RECORD_SYMPTOM = 'record_symptom',
  SHOW_PATIENT_HISTORY = 'show_patient_history',
  SHOW_MEDICATIONS = 'show_medications',
  SHOW_ALLERGIES = 'show_allergies',
  PRESCRIBE_MEDICATION = 'prescribe_medication',
  SHOW_AVAILABLE_MEDICATIONS = 'show_available_medications',
  REPEAT_INSTRUCTIONS = 'repeat_instructions',
  UNKNOWN = 'unknown'
}

// =============================================================================
// AR Overlay Configuration
// =============================================================================

export interface AROverlayConfig {
  id: string;
  type: 'text' | 'notification' | 'card' | 'warning';
  position: vec3;
  content: string;
  style: OverlayStyle;
  billboard: boolean;
  visible: boolean;
  opacity: number;
  ttl?: number; // Time to live in milliseconds
  attachedTo?: string; // Object ID
}

export interface OverlayStyle {
  primaryColor: [number, number, number, number]; // RGBA
  backgroundColor: [number, number, number, number]; // RGBA
  fontSize: number;
  animation?: 'fade' | 'slide' | 'none';
  animationDuration?: number; // milliseconds
}

// =============================================================================
// AR Colors (FR AR-1)
// =============================================================================

export const AR_COLORS = {
  CYAN: [0, 1, 1, 1] as [number, number, number, number],
  YELLOW: [1, 1, 0, 1] as [number, number, number, number],
  RED: [1, 0, 0, 1] as [number, number, number, number],
  GREEN: [0, 1, 0, 1] as [number, number, number, number],
  WHITE: [1, 1, 1, 1] as [number, number, number, number],
  BLACK: [0, 0, 0, 1] as [number, number, number, number]
} as const;

// =============================================================================
// Configuration
// =============================================================================

export interface MedSnapConfig {
  backendUrl: string;
  performance: {
    minFps: number;
    maxDetectionLatency: number;
    maxRenderLatency: number;
  };
  timeouts: {
    clinicalModeInactivity: number; // 120000ms per FR-12a
    trainingModeInactivity: number; // 10000ms per FR-10a
    httpRequest: number;
  };
  defaultOverlayStyle: OverlayStyle;
  enablePerformanceMonitoring: boolean;
  demoMode: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

// =============================================================================
// API Responses
// =============================================================================

export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  audioUrl?: string; // TTS audio URL
}

export interface PatientLoadResponse {
  patient: PatientData;
  audioUrl: string; // TTS greeting
}

export interface SymptomRecordResponse {
  recorded: boolean;
  audioUrl: string; // TTS confirmation
}

export interface PrescriptionResponse {
  prescription: PrescriptionData;
  audioUrl: string; // TTS response (success or warning)
}

// =============================================================================
// Performance Metrics
// =============================================================================

export interface PerformanceMetrics {
  fps: number;
  renderLatency: number;
  audioLatency: number;
  httpLatency: number;
  timestamp: number;
}
```

**Validation:**
```bash
npm run type-check  # Should succeed
```

## Phase 3: AR System Core (4 hours)

### Step 3.1: Create MedSnapARSystem

**Location**: `/Users/jasonyi/snaplens-code/lens-studio/src/MedSnapARSystem.ts`

**Pattern**: Based on marvin's `main.ts`

**Key components:**
```typescript
export class MedSnapARSystem {
  // Core components
  private overlayManager?: OverlayManager;
  private voiceController?: VoiceController;
  private audioPlayer?: AudioPlayer;
  private stateManager?: StateManager;
  private modeManager?: ModeManager;
  private apiClient?: APIClient;

  // Lens Studio components
  private script?: Script;
  private remoteService?: RemoteServiceModule;
  private audioComponent?: AudioComponent;

  // Configuration
  private readonly config: MedSnapConfig;

  // State
  private isInitialized: boolean = false;
  private isRunning: boolean = false;

  // Methods
  async initialize(...): Promise<void>
  start(): void
  stop(): void
  update(): void  // Called every frame
  dispose(): void
}
```

### Step 3.2: Create Lens Studio Entry Point

**Location**: `/Users/jasonyi/snaplens-code/lens-studio/src/lens-studio-entry.ts`

**Pattern**: Based on marvin's `lens-studio-entry.ts`

**Critical features:**
```typescript
// @input annotations for Lens Studio Inspector
// @input SceneObject sceneRoot
// @input Component.RemoteServiceModule remoteService
// @input Component.AudioComponent audioComponent
// @input Asset.RemoteServiceModule backendUrl

// Global declarations for Lens Studio inputs
declare const script: Script;
declare const sceneRoot: SceneObject;
declare const remoteService: RemoteServiceModule;
declare const audioComponent: AudioComponent;

// System instance
let medSnapSystem: MedSnapARSystem;

// Initialize on scene load
const sceneLoadEvent = script.createEvent('SceneEvent.OnStart');
sceneLoadEvent.bind(() => {
  initializeSystem();
});

// Update loop
const updateEvent = script.createEvent('UpdateEvent');
updateEvent.bind(() => {
  if (medSnapSystem) {
    medSnapSystem.update();
  }
});

// Cleanup on scene destroy
const sceneUnloadEvent = script.createEvent('SceneEvent.OnDestroy');
sceneUnloadEvent.bind(() => {
  if (medSnapSystem) {
    medSnapSystem.dispose();
  }
});

// Debug API
(global as any).medSnap = {
  getSystem: () => medSnapSystem,
  getState: () => medSnapSystem?.getState(),
  getPerformance: () => medSnapSystem?.getPerformanceMetrics()
};
```

**Validation:**
```bash
npm run build
# Check that dist/lens-studio-entry.js exists
# Check that @input comments are preserved in output
```

## Phase 4: Component Implementations (6 hours)

### Step 4.1: Overlay Manager (2 hours)

**Location**: `/Users/jasonyi/snaplens-code/lens-studio/src/AROverlays/OverlayManager.ts`

**Pattern**: Adapt from marvin's `OverlayManager.ts`

**Key responsibilities:**
- Create Text components for AR overlays
- Position overlays in 3D space
- Billboard effect (always face camera)
- Fade animations
- Color management per FR AR-1
- Patient card rendering support

**Core API:**
```typescript
class OverlayManager {
  createOverlay(config: AROverlayConfig): void
  removeOverlay(id: string): void
  updateOverlay(id: string, updates: Partial<AROverlayConfig>): void
  attachToPosition(id: string, position: vec3): void
  updateBillboards(): void  // Called in update loop
  fadeIn(id: string, duration: number): void
  fadeOut(id: string, duration: number): void
  dispose(): void
}
```

### Step 4.2: Voice Controller (1 hour)

**Location**: `/Users/jasonyi/snaplens-code/lens-studio/src/Voice/VoiceController.ts`

**Responsibilities:**
- Initialize ASR (may be backend-based for MVP)
- Wake word detection ("Hey MedSnap")
- Transcription handling
- Route to APIClient for intent extraction

**Core API:**
```typescript
class VoiceController {
  initialize(): void
  startListening(): void
  stopListening(): void
  onTranscription(callback: (text: string) => void): void
  dispose(): void
}
```

### Step 4.3: Audio Player (1 hour)

**Location**: `/Users/jasonyi/snaplens-code/lens-studio/src/Voice/AudioPlayer.ts`

**Responsibilities:**
- Play TTS audio from URLs
- Queue management
- Stop/pause control

**Core API:**
```typescript
class AudioPlayer {
  initialize(audioComponent: AudioComponent): void
  playFromUrl(url: string): Promise<void>
  stop(): void
  isPlaying(): boolean
  dispose(): void
}
```

### Step 4.4: State Manager (1 hour)

**Location**: `/Users/jasonyi/snaplens-code/lens-studio/src/State/StateManager.ts`

**Responsibilities:**
- Global application state
- Current mode
- Current patient (if in clinical mode)
- Session context
- Event emitter for state changes

**Core API:**
```typescript
class StateManager {
  getCurrentMode(): AppMode
  setMode(mode: AppMode): void
  getClinicalState(): ClinicalState
  setClinicalState(state: ClinicalState): void
  getCurrentPatient(): PatientData | null
  setCurrentPatient(patient: PatientData | null): void
  onStateChange(callback: (state: any) => void): void
  reset(): void
}
```

### Step 4.5: Mode Manager (1 hour)

**Location**: `/Users/jasonyi/snaplens-code/lens-studio/src/State/ModeManager.ts`

**Note**: This is the foundation for Dev 2 Task 2.1

**Responsibilities:**
- Switch between IDLE, TRAINING, CLINICAL modes
- Validate mode transitions
- Exit cleanup
- Integration with StateManager

**Core API:**
```typescript
class ModeManager {
  initialize(stateManager: StateManager): void
  switchMode(mode: AppMode): void
  getCurrentMode(): AppMode
  canSwitchTo(mode: AppMode): boolean
  exitCurrentMode(): void
  dispose(): void
}
```

## Phase 5: Network Client (2 hours)

### Step 5.1: Create API Client

**Location**: `/Users/jasonyi/snaplens-code/lens-studio/src/Network/APIClient.ts`

**Responsibilities:**
- HTTP wrapper around RemoteServiceModule
- Request/response serialization
- Error handling with retries
- Timeout management

**Core API:**
```typescript
class APIClient {
  initialize(remoteService: RemoteServiceModule, config: MedSnapConfig): void

  // Clinical endpoints
  async loadPatient(patientName: string): Promise<APIResponse<PatientLoadResponse>>
  async recordSymptom(symptom: string): Promise<APIResponse<SymptomRecordResponse>>
  async createPrescription(medication: string, dosage: string): Promise<APIResponse<PrescriptionResponse>>

  // Utility endpoints
  async extractIntent(transcription: string): Promise<APIResponse<VoiceCommand>>
  async generateTTS(text: string): Promise<APIResponse<{ audioUrl: string }>>

  // Internal helpers
  private makeRequest(endpoint: string, method: string, body: any): Promise<any>
  private handleError(error: any): void
  dispose(): void
}
```

**Request pattern:**
```typescript
private async makeRequest(endpoint: string, method: string, body: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const request = new Request(this.config.backendUrl + endpoint);
    request.method = method === 'GET' ? Request.HttpMethod.Get : Request.HttpMethod.Post;

    if (body) {
      request.body = JSON.stringify(body);
    }

    const timeout = setTimeout(() => {
      reject(new Error('Request timeout'));
    }, this.config.timeouts.httpRequest);

    this.remoteService.performHttpRequest(request, (response) => {
      clearTimeout(timeout);

      if (response.statusCode === 200) {
        try {
          const data = JSON.parse(response.body);
          resolve(data);
        } catch (e) {
          reject(new Error('Failed to parse response'));
        }
      } else {
        reject(new Error(`HTTP ${response.statusCode}: ${response.body}`));
      }
    });
  });
}
```

## Phase 6: Lens Studio Integration (2 hours)

### Step 6.1: Build and prepare

```bash
cd /Users/jasonyi/snaplens-code/lens-studio
npm run build
```

**Verify output:**
- `dist/lens-studio-entry.js` exists
- `dist/lens-studio-entry.d.ts` exists
- `@input` comments preserved in .js file

### Step 6.2: Import into Lens Studio

1. Open Lens Studio
2. Open project: `/Users/jasonyi/snaplens-code/lens-studio/MedSnap.lsproj`
3. In Resources panel, right-click → Add Files
4. Navigate to `dist/lens-studio-entry.js`
5. Import the file

### Step 6.3: Create scene objects

In Scene Hierarchy, create:

```
Scene
├── MedSnapSystem (Scene Object)
│   └── MedSnapScript (Script Component)
│       - Script: lens-studio-entry.js
├── SceneRoot (Scene Object)
├── RemoteServiceModule (Scene Object)
│   └── RemoteService (RemoteServiceModule Component)
│       - API URL: http://localhost:3000 (or Railway URL)
└── AudioPlayer (Scene Object)
    └── AudioComponent (AudioComponent Component)
```

### Step 6.4: Wire inputs in Inspector

Select `MedSnapSystem` → `MedSnapScript` component

In Inspector, wire inputs:
- `sceneRoot` → drag SceneRoot object
- `remoteService` → drag RemoteServiceModule component
- `audioComponent` → drag AudioComponent component

### Step 6.5: Test in simulator

1. Click Play in Lens Studio
2. Check console (View → Logs)
3. Look for initialization logs:
   - `[MedSnap] Initializing system...`
   - `[MedSnap] System initialized successfully`
   - `[MedSnap] System started`

4. Test scene reload:
   - Stop and restart
   - Should see cleanup logs and re-initialization

**Validation checklist:**
- [ ] Script imports without errors
- [ ] All `@input` fields visible in Inspector
- [ ] Can wire all required components
- [ ] Scene loads without errors
- [ ] Console shows initialization logs
- [ ] Update loop fires (check via performance logs if enabled)
- [ ] System disposes on scene stop

## Testing Guide

### Unit Testing (TypeScript)

```bash
# Type checking
npm run type-check

# Build
npm run build

# Watch mode during development
npm run dev
```

### Integration Testing (Lens Studio)

**Test 1: Initialization**
- Import script
- Wire components
- Play scene
- **Expected**: Console shows "System initialized successfully"

**Test 2: Update Loop**
- Enable debug logging in MedSnapARSystem
- Play scene
- **Expected**: Console shows frame updates (throttle to 1/second)

**Test 3: API Call**
- Add test button in scene
- Call `apiClient.loadPatient("Sarah Chen")`
- **Expected**: HTTP request sent, response logged (or error if backend not running)

**Test 4: Audio Playback**
- Generate TTS audio from backend
- Call `audioPlayer.playFromUrl(audioUrl)`
- **Expected**: Audio plays (may need headphones)

**Test 5: Cleanup**
- Play scene
- Stop scene
- **Expected**: Console shows "System disposed"

## Troubleshooting

### Build fails with TypeScript errors

**Symptom**: `npm run build` fails with type errors

**Solutions**:
1. Check `tsconfig.json` matches template
2. Ensure all imports are correct
3. Run `npm run type-check` for detailed errors
4. Check that Lens Studio type definitions are complete

### `@input` fields don't appear in Inspector

**Symptom**: No input fields in Lens Studio Inspector

**Solutions**:
1. Check that `@input` comments are preserved in `dist/lens-studio-entry.js`
2. Ensure comments are **before** variable declarations
3. Try reimporting the script
4. Check Lens Studio console for syntax errors

### System doesn't initialize

**Symptom**: No console logs after scene starts

**Solutions**:
1. Check that script is attached to scene object
2. Verify all `@input` components are wired
3. Check Lens Studio console for errors
4. Add debug logs at top of `lens-studio-entry.ts`

### HTTP requests fail

**Symptom**: API calls timeout or fail

**Solutions**:
1. Verify backend is running (`npm run dev` in backend/)
2. Check backend URL in RemoteServiceModule config
3. Test endpoint with curl/Postman first
4. Check CORS settings on backend
5. Verify RemoteServiceModule is properly wired in Inspector

### Audio doesn't play

**Symptom**: TTS audio URL loaded but no sound

**Solutions**:
1. Check AudioComponent is wired correctly
2. Verify audio URL is accessible (test in browser)
3. Check audio format (Lens Studio supports MP3, WAV)
4. Ensure device volume is up
5. Try with test audio file first

## Next Steps

After completing this implementation, proceed to:

1. **Dev 2 Task 2.1**: Mode Manager
   - Extend `ModeManager.ts` with full implementation
   - Add mode transition validation
   - Implement exit cleanup
   - Write tests

2. **Dev 2 Task 2.2**: Patient Card Renderer
   - Create `Clinical/PatientCardRenderer.ts`
   - Use OverlayManager for AR rendering
   - Position cards in top 1/3 of screen
   - Implement color coding (red for allergies)

3. **Dev 2 Task 2.3**: Clinical Mode State Machine
   - Create `Clinical/ClinicalModeStateMachine.ts`
   - Implement state transitions
   - Wire voice command handling
   - Add inactivity timeout

4. **Dev 2 Task 2.4**: Prescription UI
   - Create `Clinical/PrescriptionUI.ts`
   - Display drug interaction warnings
   - Show success/blocked states
   - TTS feedback

All tasks now have proper TypeScript foundation with type safety and proven patterns from marvin!
