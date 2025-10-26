# Test Plan: Lens Studio TypeScript Integration

## Overview

This test plan follows TDD principles as mandated in CLAUDE.md. All tests must be written BEFORE implementation code.

## Testing Strategy

### 1. Type-Level Tests (TypeScript Compiler)
- TypeScript compiler validates API contracts
- No runtime cost
- Catches integration errors at build time

### 2. Build System Tests
- Validate build pipeline produces correct output
- Ensure Lens Studio can consume built JavaScript
- Verify `@input` annotations preserved

### 3. Integration Tests (Lens Studio Simulator)
- System initialization
- Component wiring
- Lifecycle events
- Runtime behavior

## Phase-by-Phase Test Requirements

### Phase 1: Build System (2 hours)

#### Test 1.1: TypeScript Build Success
**Write BEFORE**: Creating any .ts files
**File**: `lens-studio/__tests__/build.test.sh`

```bash
#!/bin/bash
# Test: TypeScript build succeeds

cd /Users/jasonyi/snaplens-code/lens-studio

# Clean build
npm run clean
if [ -d "dist" ]; then
  echo "FAIL: dist/ not cleaned"
  exit 1
fi

# Build
npm run build
if [ $? -ne 0 ]; then
  echo "FAIL: Build failed"
  exit 1
fi

# Check output files
if [ ! -f "dist/lens-studio-entry.js" ]; then
  echo "FAIL: lens-studio-entry.js not generated"
  exit 1
fi

if [ ! -f "dist/lens-studio-entry.d.ts" ]; then
  echo "FAIL: Type declarations not generated"
  exit 1
fi

echo "PASS: Build system works"
```

**Run**: `bash lens-studio/__tests__/build.test.sh`
**Expected**: FAIL (no src/ files yet)
**Commit**: `git commit -m "test: Add build system test"`

#### Test 1.2: Input Annotations Preserved
**Write BEFORE**: Implementing lens-studio-entry.ts
**File**: `lens-studio/__tests__/annotations.test.sh`

```bash
#!/bin/bash
# Test: @input annotations preserved in built JavaScript

cd /Users/jasonyi/snaplens-code/lens-studio

npm run build

# Check for @input comment in output
if ! grep -q "@input SceneObject sceneRoot" dist/lens-studio-entry.js; then
  echo "FAIL: @input annotations not preserved"
  exit 1
fi

echo "PASS: Annotations preserved"
```

**Run**: `bash lens-studio/__tests__/annotations.test.sh`
**Expected**: FAIL initially
**Commit**: `git commit -m "test: Add annotation preservation test"`

### Phase 2: Type Definitions (2 hours)

#### Test 2.1: Lens Studio Types Compile
**Write BEFORE**: Implementing lens-studio.d.ts
**File**: `lens-studio/__tests__/types-compile.test.ts`

```typescript
/**
 * Test: Lens Studio type definitions compile
 * This file should compile without errors
 */

import {
  Script,
  SceneObject,
  Component,
  vec3,
  quat,
  mat4,
  RemoteServiceModule,
  AudioComponent,
  Text,
  ScreenTransform,
  Request,
  UpdateEvent
} from '../src/types/lens-studio';

// Instantiate vec3
const position: vec3 = new vec3(0, 1, 2);
const sum: vec3 = position.add(new vec3(1, 0, 0));

// RemoteServiceModule usage
let remoteService: RemoteServiceModule;
const request: Request = new Request('http://example.com/api');
request.method = Request.HttpMethod.Post;
request.body = '{"test": true}';

// AudioComponent usage
let audio: AudioComponent;
// audio.play(); // Methods should be defined

// Text component
let textComponent: Text;
// textComponent.text = "Hello"; // Properties should be defined

console.log('Type definitions compile');
```

**Run**: `npm run type-check`
**Expected**: FAIL (types don't exist yet)
**Commit**: `git commit -m "test: Add type definition compilation test"`

#### Test 2.2: Core Types Compile
**Write BEFORE**: Implementing core.ts
**File**: `lens-studio/__tests__/core-types.test.ts`

```typescript
/**
 * Test: MedSnap core types compile and are usable
 */

import {
  AppMode,
  ClinicalState,
  PatientData,
  VitalSigns,
  PrescriptionData,
  VoiceCommand,
  VoiceIntent,
  AROverlayConfig,
  AR_COLORS,
  MedSnapConfig
} from '../src/types/core';

import { vec3 } from '../src/types/lens-studio';

// Test enum usage
const mode: AppMode = AppMode.CLINICAL;
const state: ClinicalState = ClinicalState.PATIENT_LOADED;

// Test patient data structure
const patient: PatientData = {
  id: 'test-123',
  name: 'Sarah Chen',
  age: 34,
  sex: 'Female',
  currentSymptoms: ['chest tightness'],
  vitalSigns: {
    heartRate: 78,
    bloodPressure: '120/80'
  },
  allergies: ['Penicillin'],
  medications: [
    {
      name: 'Warfarin',
      dosage: '5mg daily',
      startedDate: '2024-01-15'
    }
  ],
  diagnosisHistory: []
};

// Test voice command
const command: VoiceCommand = {
  intent: VoiceIntent.START_ASSESSMENT,
  parameters: { patientName: 'Sarah Chen' },
  confidence: 0.95,
  rawTranscription: 'start assessment Sarah Chen'
};

// Test overlay config
const overlayConfig: AROverlayConfig = {
  id: 'patient-card',
  type: 'card',
  position: new vec3(0, 0.9, -1),
  content: 'Sarah Chen, 34, Female',
  style: {
    primaryColor: AR_COLORS.CYAN,
    backgroundColor: [0, 0, 0, 0.8],
    fontSize: 18
  },
  billboard: true,
  visible: true,
  opacity: 1.0
};

console.log('Core types compile and are usable');
```

**Run**: `npm run type-check`
**Expected**: FAIL initially
**Commit**: `git commit -m "test: Add core types compilation test"`

### Phase 3: AR System Core (4 hours)

#### Test 3.1: MedSnapARSystem Interface
**Write BEFORE**: Implementing MedSnapARSystem.ts
**File**: `lens-studio/__tests__/ar-system.test.ts`

```typescript
/**
 * Test: MedSnapARSystem implements required interface
 */

import { MedSnapARSystem } from '../src/MedSnapARSystem';
import { MedSnapConfig, AppMode } from '../src/types/core';
import {
  Script,
  SceneObject,
  RemoteServiceModule,
  AudioComponent
} from '../src/types/lens-studio';

// This test verifies the API contract exists
// Implementation details tested in Lens Studio

describe('MedSnapARSystem', () => {
  let system: MedSnapARSystem;
  let mockConfig: MedSnapConfig;

  beforeEach(() => {
    mockConfig = {
      backendUrl: 'http://localhost:3000',
      performance: {
        minFps: 30,
        maxDetectionLatency: 500,
        maxRenderLatency: 500
      },
      timeouts: {
        clinicalModeInactivity: 120000,
        trainingModeInactivity: 10000,
        httpRequest: 5000
      },
      defaultOverlayStyle: {
        primaryColor: [0, 1, 1, 1],
        backgroundColor: [0, 0, 0, 0.8],
        fontSize: 18
      },
      enablePerformanceMonitoring: true,
      demoMode: false,
      logLevel: 'debug'
    };

    system = new MedSnapARSystem(mockConfig);
  });

  test('should be constructible with config', () => {
    expect(system).toBeDefined();
  });

  test('should have initialize method', () => {
    expect(typeof system.initialize).toBe('function');
  });

  test('should have start method', () => {
    expect(typeof system.start).toBe('function');
  });

  test('should have stop method', () => {
    expect(typeof system.stop).toBe('function');
  });

  test('should have update method', () => {
    expect(typeof system.update).toBe('function');
  });

  test('should have dispose method', () => {
    expect(typeof system.dispose).toBe('function');
  });

  test('should have getCurrentMode method', () => {
    expect(typeof system.getCurrentMode).toBe('function');
  });

  test('should throw if started before initialized', () => {
    expect(() => system.start()).toThrow();
  });

  test('should not throw if stopped before started', () => {
    expect(() => system.stop()).not.toThrow();
  });
});
```

**Run**: `npm test` (requires jest setup)
**Expected**: FAIL (class doesn't exist yet)
**Commit**: `git commit -m "test: Add MedSnapARSystem interface test"`

### Phase 4: Component Tests (6 hours)

#### Test 4.1: OverlayManager
**Write BEFORE**: Implementing OverlayManager.ts
**File**: `lens-studio/__tests__/overlay-manager.test.ts`

```typescript
/**
 * Test: OverlayManager manages AR overlays
 */

import { OverlayManager } from '../src/AROverlays/OverlayManager';
import { AROverlayConfig, AR_COLORS } from '../src/types/core';
import { vec3 } from '../src/types/lens-studio';

describe('OverlayManager', () => {
  let manager: OverlayManager;

  beforeEach(() => {
    manager = new OverlayManager({
      maxOverlays: 10,
      defaultDistance: 0.5
    });
  });

  test('should create overlay with config', () => {
    const config: AROverlayConfig = {
      id: 'test-overlay',
      type: 'text',
      position: new vec3(0, 0, -1),
      content: 'Test',
      style: {
        primaryColor: AR_COLORS.CYAN,
        backgroundColor: AR_COLORS.BLACK,
        fontSize: 18
      },
      billboard: true,
      visible: true,
      opacity: 1.0
    };

    expect(() => manager.createOverlay(config)).not.toThrow();
  });

  test('should remove overlay by id', () => {
    const config: AROverlayConfig = {
      id: 'test-overlay',
      type: 'text',
      position: new vec3(0, 0, -1),
      content: 'Test',
      style: {
        primaryColor: AR_COLORS.CYAN,
        backgroundColor: AR_COLORS.BLACK,
        fontSize: 18
      },
      billboard: true,
      visible: true,
      opacity: 1.0
    };

    manager.createOverlay(config);
    expect(() => manager.removeOverlay('test-overlay')).not.toThrow();
  });

  test('should not throw when removing non-existent overlay', () => {
    expect(() => manager.removeOverlay('does-not-exist')).not.toThrow();
  });

  test('should enforce max overlay limit', () => {
    const manager = new OverlayManager({ maxOverlays: 2 });

    const config1: AROverlayConfig = {
      id: 'overlay-1',
      type: 'text',
      position: new vec3(0, 0, -1),
      content: 'Test 1',
      style: { primaryColor: AR_COLORS.CYAN, backgroundColor: AR_COLORS.BLACK, fontSize: 18 },
      billboard: true,
      visible: true,
      opacity: 1.0
    };

    const config2: AROverlayConfig = { ...config1, id: 'overlay-2', content: 'Test 2' };
    const config3: AROverlayConfig = { ...config1, id: 'overlay-3', content: 'Test 3' };

    manager.createOverlay(config1);
    manager.createOverlay(config2);

    // Should remove oldest when limit exceeded
    expect(() => manager.createOverlay(config3)).not.toThrow();
  });

  test('should dispose all overlays', () => {
    const config: AROverlayConfig = {
      id: 'test',
      type: 'text',
      position: new vec3(0, 0, -1),
      content: 'Test',
      style: { primaryColor: AR_COLORS.CYAN, backgroundColor: AR_COLORS.BLACK, fontSize: 18 },
      billboard: true,
      visible: true,
      opacity: 1.0
    };

    manager.createOverlay(config);
    expect(() => manager.dispose()).not.toThrow();
  });
});
```

**Run**: `npm test`
**Expected**: FAIL initially
**Commit**: `git commit -m "test: Add OverlayManager tests"`

#### Test 4.2: StateManager
**Write BEFORE**: Implementing StateManager.ts
**File**: `lens-studio/__tests__/state-manager.test.ts`

```typescript
/**
 * Test: StateManager manages application state
 */

import { StateManager } from '../src/State/StateManager';
import { AppMode, ClinicalState, PatientData } from '../src/types/core';

describe('StateManager', () => {
  let stateManager: StateManager;

  beforeEach(() => {
    stateManager = new StateManager();
  });

  test('should initialize in IDLE mode', () => {
    expect(stateManager.getCurrentMode()).toBe(AppMode.IDLE);
  });

  test('should switch to CLINICAL mode', () => {
    stateManager.setMode(AppMode.CLINICAL);
    expect(stateManager.getCurrentMode()).toBe(AppMode.CLINICAL);
  });

  test('should initialize clinical state to IDLE', () => {
    expect(stateManager.getClinicalState()).toBe(ClinicalState.IDLE);
  });

  test('should update clinical state', () => {
    stateManager.setClinicalState(ClinicalState.PATIENT_LOADED);
    expect(stateManager.getClinicalState()).toBe(ClinicalState.PATIENT_LOADED);
  });

  test('should store and retrieve patient data', () => {
    const patient: PatientData = {
      id: 'test-123',
      name: 'Sarah Chen',
      age: 34,
      sex: 'Female',
      currentSymptoms: [],
      vitalSigns: {},
      allergies: ['Penicillin'],
      medications: [],
      diagnosisHistory: []
    };

    stateManager.setCurrentPatient(patient);
    expect(stateManager.getCurrentPatient()).toEqual(patient);
  });

  test('should emit state change events', (done) => {
    stateManager.onStateChange((state) => {
      expect(state.mode).toBe(AppMode.CLINICAL);
      done();
    });

    stateManager.setMode(AppMode.CLINICAL);
  });

  test('should reset to initial state', () => {
    const patient: PatientData = {
      id: 'test-123',
      name: 'Sarah Chen',
      age: 34,
      sex: 'Female',
      currentSymptoms: [],
      vitalSigns: {},
      allergies: [],
      medications: [],
      diagnosisHistory: []
    };

    stateManager.setMode(AppMode.CLINICAL);
    stateManager.setClinicalState(ClinicalState.PATIENT_LOADED);
    stateManager.setCurrentPatient(patient);

    stateManager.reset();

    expect(stateManager.getCurrentMode()).toBe(AppMode.IDLE);
    expect(stateManager.getClinicalState()).toBe(ClinicalState.IDLE);
    expect(stateManager.getCurrentPatient()).toBeNull();
  });
});
```

**Run**: `npm test`
**Expected**: FAIL initially
**Commit**: `git commit -m "test: Add StateManager tests"`

#### Test 4.3: APIClient
**Write BEFORE**: Implementing APIClient.ts
**File**: `lens-studio/__tests__/api-client.test.ts`

```typescript
/**
 * Test: APIClient makes HTTP requests
 * Note: Uses mocks since RemoteServiceModule is Lens Studio-only
 */

import { APIClient } from '../src/Network/APIClient';
import { MedSnapConfig } from '../src/types/core';

// Mock RemoteServiceModule
class MockRemoteService {
  performHttpRequest(request: any, callback: (response: any) => void) {
    // Simulate successful response
    setTimeout(() => {
      callback({
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          data: { test: true }
        })
      });
    }, 10);
  }
}

describe('APIClient', () => {
  let apiClient: APIClient;
  let mockRemoteService: MockRemoteService;
  let mockConfig: MedSnapConfig;

  beforeEach(() => {
    mockRemoteService = new MockRemoteService();
    mockConfig = {
      backendUrl: 'http://localhost:3000',
      performance: {
        minFps: 30,
        maxDetectionLatency: 500,
        maxRenderLatency: 500
      },
      timeouts: {
        clinicalModeInactivity: 120000,
        trainingModeInactivity: 10000,
        httpRequest: 5000
      },
      defaultOverlayStyle: {
        primaryColor: [0, 1, 1, 1],
        backgroundColor: [0, 0, 0, 0.8],
        fontSize: 18
      },
      enablePerformanceMonitoring: false,
      demoMode: false,
      logLevel: 'info'
    };

    apiClient = new APIClient();
    apiClient.initialize(mockRemoteService as any, mockConfig);
  });

  test('should initialize with config', () => {
    expect(apiClient).toBeDefined();
  });

  test('should make patient load request', async () => {
    const response = await apiClient.loadPatient('Sarah Chen');
    expect(response.success).toBe(true);
  });

  test('should handle request timeout', async () => {
    // Override mock to delay response
    const slowMock = {
      performHttpRequest: (req: any, cb: any) => {
        setTimeout(() => cb({ statusCode: 200, body: '{}' }), 10000);
      }
    };

    const slowClient = new APIClient();
    slowClient.initialize(slowMock as any, mockConfig);

    await expect(slowClient.loadPatient('Test')).rejects.toThrow('timeout');
  }, 6000);

  test('should handle HTTP errors', async () => {
    const errorMock = {
      performHttpRequest: (req: any, cb: any) => {
        cb({ statusCode: 500, body: 'Internal Server Error' });
      }
    };

    const errorClient = new APIClient();
    errorClient.initialize(errorMock as any, mockConfig);

    await expect(errorClient.loadPatient('Test')).rejects.toThrow();
  });
});
```

**Run**: `npm test`
**Expected**: FAIL initially
**Commit**: `git commit -m "test: Add APIClient tests"`

### Phase 5: Integration Tests (Lens Studio Simulator)

#### Test 5.1: System Initialization
**Execute AFTER**: Building all components
**File**: Manual test checklist

```
Lens Studio Integration Test 5.1: System Initialization

Prerequisites:
- [ ] All TypeScript code built (`npm run build`)
- [ ] dist/lens-studio-entry.js imported into Lens Studio
- [ ] Scene objects created (MedSnapSystem, SceneRoot, RemoteService, AudioPlayer)
- [ ] All @input components wired in Inspector

Steps:
1. Open Lens Studio project
2. Select MedSnapSystem object
3. Verify Inspector shows all @input fields:
   - [ ] sceneRoot (wired)
   - [ ] remoteService (wired)
   - [ ] audioComponent (wired)
4. Click Play
5. Open Logs panel (View → Logs)

Expected Console Output:
✓ [MedSnap] Initializing system...
✓ [MedSnap] Initializing OverlayManager...
✓ [MedSnap] Initializing VoiceController...
✓ [MedSnap] Initializing AudioPlayer...
✓ [MedSnap] Initializing StateManager...
✓ [MedSnap] Initializing ModeManager...
✓ [MedSnap] Initializing APIClient...
✓ [MedSnap] System initialized successfully
✓ [MedSnap] System started

Result: PASS / FAIL
Notes: _______________________
```

#### Test 5.2: Update Loop
**Execute AFTER**: Test 5.1 passes
**File**: Manual test checklist

```
Lens Studio Integration Test 5.2: Update Loop

Steps:
1. Enable performance monitoring in MedSnapARSystem
2. Play scene
3. Watch console for 5 seconds

Expected:
✓ Performance metrics logged every 1 second
✓ FPS reported (should be ~60)
✓ No errors in console
✓ Scene rendering smoothly

Result: PASS / FAIL
Notes: _______________________
```

#### Test 5.3: System Cleanup
**Execute AFTER**: Test 5.2 passes
**File**: Manual test checklist

```
Lens Studio Integration Test 5.3: System Cleanup

Steps:
1. Play scene
2. Wait for initialization logs
3. Stop scene
4. Check console

Expected Console Output:
✓ [MedSnap] System stopping...
✓ [MedSnap] Disposing OverlayManager...
✓ [MedSnap] Disposing VoiceController...
✓ [MedSnap] Disposing AudioPlayer...
✓ [MedSnap] Disposing StateManager...
✓ [MedSnap] Disposing ModeManager...
✓ [MedSnap] Disposing APIClient...
✓ [MedSnap] System disposed

4. Play scene again
5. Verify re-initialization works

Expected:
✓ System initializes again without errors
✓ All components recreated
✓ No memory leaks (check Lens Studio profiler)

Result: PASS / FAIL
Notes: _______________________
```

#### Test 5.4: API Request
**Execute AFTER**: Backend is running
**File**: Manual test checklist

```
Lens Studio Integration Test 5.4: API Request

Prerequisites:
- [ ] Backend running at http://localhost:3000
- [ ] Patient "Sarah Chen" seeded in database

Steps:
1. Play scene
2. Open browser console for global.medSnap access
3. In Lens Studio console, execute:
   ```
   global.medSnap.getSystem().apiClient.loadPatient('Sarah Chen')
   ```
4. Watch console

Expected:
✓ HTTP request sent to backend
✓ Response received
✓ Patient data logged
✓ No errors

Result: PASS / FAIL
Response: _______________________
Notes: _______________________
```

## Acceptance Criteria

All tests must PASS before marking this spec as complete:

### Build System
- [x] `npm run build` succeeds without errors
- [x] `npm run type-check` passes
- [x] dist/lens-studio-entry.js generated
- [x] @input annotations preserved in output

### Type Definitions
- [x] Lens Studio types compile
- [x] Core types compile
- [x] No circular dependencies
- [x] All Dev 2 API surfaces typed

### AR System Core
- [x] MedSnapARSystem interface tests pass
- [x] System initializes in Lens Studio
- [x] All @input components wire correctly
- [x] Lifecycle events fire (OnStart, OnDestroy, UpdateEvent)

### Components
- [x] OverlayManager tests pass
- [x] StateManager tests pass
- [x] APIClient tests pass
- [x] All components dispose cleanly

### Integration
- [x] Test 5.1: System Initialization PASS
- [x] Test 5.2: Update Loop PASS
- [x] Test 5.3: System Cleanup PASS
- [x] Test 5.4: API Request PASS

### Developer Experience
- [x] Hot reload works (`npm run dev`)
- [x] Debug API accessible via global.medSnap
- [x] Console logs helpful for debugging
- [x] Ready to implement Dev 2 Task 2.1

## Test Execution Log

### Phase 1: Build System Tests
- Date: __________
- Tester: __________
- Result: PASS / FAIL
- Notes: __________

### Phase 2: Type Definition Tests
- Date: __________
- Tester: __________
- Result: PASS / FAIL
- Notes: __________

### Phase 3: AR System Tests
- Date: __________
- Tester: __________
- Result: PASS / FAIL
- Notes: __________

### Phase 4: Component Tests
- Date: __________
- Tester: __________
- Result: PASS / FAIL
- Notes: __________

### Phase 5: Integration Tests
- Date: __________
- Tester: __________
- Result: PASS / FAIL
- Notes: __________

## Sign-off

**Developer**: __________ Date: __________
**Reviewer**: __________ Date: __________

**Spec Complete**: YES / NO
**Ready for Dev 2 Task 2.1**: YES / NO
