# Phase 4.2: Computer Vision - MediaPipe Integration
## Comprehensive Implementation Plan

**Developer:** Dev 4 - Data, CV & Integration Owner  
**Timeline:** Hours 6-18 (12 hours)  
**Branch:** CV  
**Dependencies:** Phase 4.0 (Database Setup) completed

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Requirements Summary](#requirements-summary)
3. [Architecture Design](#architecture-design)
4. [Test-Driven Development Workflow](#test-driven-development-workflow)
5. [Implementation Steps](#implementation-steps)
6. [Edge Cases & Error Handling](#edge-cases--error-handling)
7. [Performance Optimization](#performance-optimization)
8. [Integration & Handoff](#integration--handoff)
9. [Acceptance Criteria](#acceptance-criteria)

---

## Overview

This phase implements the Computer Vision pipeline using MediaPipe Hands for:
1. **Training Mode:** Wrist detection, finger placement tracking, and real-time feedback
2. **Clinical Mode (Optional):** Vital sign monitor OCR for automated reading
3. **Performance:** Real-time processing (<500ms latency) with graceful degradation

### Key Technologies
- **MediaPipe Hands v0.9+** (via `@mediapipe/hands` or HuggingFace)
- **TypeScript** (strict mode)
- **Jest** for testing
- **Tesseract.js** for OCR (optional feature)

### Critical Success Factors
1. ✅ TDD workflow: Tests FIRST, implementation second
2. ✅ Graceful degradation: Never block workflow on CV failure
3. ✅ Performance: <500ms detection latency (FR-43)
4. ✅ Retry logic: 10-second timeout with fallback (FR-10a)
5. ✅ Accuracy: ≥80% wrist detection success rate in good lighting

---

## Requirements Summary

### Functional Requirements (from PRD)

| FR ID | Requirement | Priority |
|-------|-------------|----------|
| FR-32 | MediaPipe Hands v0.9+ for hand detection | P0 |
| FR-33 | Single-person detection (max 1 hand tracked) | P0 |
| FR-34 | Wrist position, finger placement, pressure heuristics | P0 |
| FR-35 | Vital sign monitor OCR (optional) | P2 |
| FR-36 | Graceful degradation on CV failure | P0 |
| FR-10a | 10-second retry timeout for CV detection | P0 |
| FR-17a | OCR retry: 2 attempts with 2-second delay | P1 |
| FR-43 | CV detection latency <500ms | P0 |

### Acceptance Criteria

| AC ID | Criteria | Status |
|-------|----------|--------|
| AC-CV1 | Wrist detection ≥80% success in good lighting | ⬜ |
| AC-CV2 | Spatial feedback accuracy ("Move 2cm toward thumb") | ⬜ |
| AC-CV3 | Graceful failure handling without blocking workflow | ⬜ |

---

## Architecture Design

### Directory Structure

```
cv-pipeline/
├── src/
│   ├── mediapipeHands.ts       # Core MediaPipe integration
│   ├── wristDetection.ts       # Wrist landmark logic
│   ├── fingerPlacement.ts      # Finger position validation
│   ├── vitalSignOCR.ts         # OCR for monitors (optional)
│   ├── utils/
│   │   ├── retry.ts            # Retry logic with timeout
│   │   ├── performance.ts      # Latency measurement
│   │   └── landmarks.ts        # Landmark helper functions
│   └── types/
│       ├── hands.ts            # MediaPipe types
│       └── detection.ts        # Detection result types
├── tests/
│   ├── unit/
│   │   ├── mediapipeHands.test.ts
│   │   ├── wristDetection.test.ts
│   │   ├── fingerPlacement.test.ts
│   │   └── vitalSignOCR.test.ts
│   ├── integration/
│   │   └── cv-pipeline.test.ts
│   └── fixtures/
│       ├── test-images/         # Test hand images
│       └── test-monitors/       # Test monitor screenshots
├── models/
│   └── hand_landmarker.task     # MediaPipe model file
├── package.json
├── tsconfig.json
├── jest.config.js
└── README.md
```

### Data Flow

```
[Video Frame Input]
        ↓
[MediaPipe Hands Detection]
        ↓ (with retry logic)
[Hand Landmarks Extraction]
        ↓
[Wrist Position Calculation]
        ↓
[Finger Placement Validation] → [AR Overlay Data]
        ↓
[Feedback Generation] → [TTS + Visual Feedback]
```

### Configuration (FR-32)

```typescript
const MEDIAPIPE_CONFIG = {
  model: 'MediaPipe Hands v0.9+',
  input: {
    width: 640,
    height: 480,
    fps: 15,              // Optimize for performance
    format: 'RGB'
  },
  detection: {
    minDetectionConfidence: 0.7,  // Per FR-32
    minTrackingConfidence: 0.7,
    maxNumHands: 1                 // Per FR-33
  }
};

const CV_RETRY_CONFIG = {
  timeout: 10000,         // 10 seconds per FR-10a
  interval: 500,          // Check every 500ms
  maxAttempts: 20         // 10s / 500ms = 20 attempts
};

const OCR_RETRY_CONFIG = {
  maxAttempts: 2,         // Per FR-17a
  delay: 2000             // 2 seconds per FR-17a
};
```

---

## Test-Driven Development Workflow

### TDD Cycle (Mandatory)

```
1. 📝 WRITE TEST    → Define expected behavior
2. 🔴 RUN TEST      → Confirm FAIL (proves test validity)
3. 💾 COMMIT TEST   → git commit -m "Add [feature] tests"
4. 💻 IMPLEMENT     → Write minimum code to pass
5. 🟢 RUN TEST      → Iterate until PASS
6. ✅ VERIFY        → Check implementation quality
7. 💾 COMMIT CODE   → git commit -m "Implement [feature]"
```

### Test Coverage Requirements

| Component | Coverage Target | Test Types |
|-----------|----------------|------------|
| mediapipeHands.ts | 100% (critical path) | Unit + Integration |
| wristDetection.ts | 100% (critical path) | Unit + Integration |
| fingerPlacement.ts | 90% | Unit |
| vitalSignOCR.ts | 80% (optional) | Unit |
| Retry logic | 100% (critical path) | Unit |

---

## Implementation Steps

### Step 1: Environment Setup (Hour 6)

**Duration:** 30 minutes

#### Actions
1. Create `cv-pipeline/` directory structure
2. Initialize TypeScript project
3. Install dependencies
4. Configure Jest for TypeScript
5. Download MediaPipe Hands model files

#### Commands
```bash
cd /Ubuntu/home/devin-cheng/medisnap
mkdir -p cv-pipeline/{src/{utils,types},tests/{unit,integration,fixtures},models}
cd cv-pipeline

# Initialize project
npm init -y
npm install --save @mediapipe/hands @mediapipe/tasks-vision
npm install --save-dev typescript ts-node jest ts-jest @types/jest @types/node

# Initialize TypeScript
npx tsc --init --strict --esModuleInterop --resolveJsonModule --target ES2020

# Initialize Jest
npx ts-jest config:init

# Download MediaPipe model (if using local model)
# curl -o models/hand_landmarker.task https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task
```

#### Deliverable
- [ ] `cv-pipeline/package.json` with dependencies
- [ ] `cv-pipeline/tsconfig.json` configured
- [ ] `cv-pipeline/jest.config.js` configured
- [ ] MediaPipe Hands model downloaded

---

### Step 2: MediaPipe Hands Detection - TDD (Hours 6.5-8)

**Duration:** 1.5 hours

#### 2.1 Write Tests FIRST

**File:** `tests/unit/mediapipeHands.test.ts`

```typescript
import { MediaPipeHandsDetector } from '../../src/mediapipeHands';
import { HandLandmark } from '../../src/types/hands';

describe('MediaPipeHandsDetector', () => {
  let detector: MediaPipeHandsDetector;

  beforeAll(async () => {
    detector = new MediaPipeHandsDetector();
    await detector.initialize();
  });

  afterAll(async () => {
    await detector.close();
  });

  describe('initialize()', () => {
    it('should load MediaPipe Hands model successfully', async () => {
      // Test model initialization
      expect(detector.isInitialized()).toBe(true);
      expect(detector.getModelVersion()).toContain('v0.9');
    });

    it('should configure detection with correct parameters', () => {
      const config = detector.getConfig();
      expect(config.minDetectionConfidence).toBe(0.7);
      expect(config.minTrackingConfidence).toBe(0.7);
      expect(config.maxNumHands).toBe(1);
    });

    it('should throw error if model fails to load', async () => {
      const badDetector = new MediaPipeHandsDetector({ modelPath: '/invalid' });
      await expect(badDetector.initialize()).rejects.toThrow('Failed to load MediaPipe model');
    });
  });

  describe('detectHands()', () => {
    it('should return hand landmarks from image with hand', async () => {
      const testImage = await loadTestImage('fixtures/test-images/hand-visible.jpg');
      
      const result = await detector.detectHands(testImage);
      
      expect(result.handsDetected).toBe(true);
      expect(result.landmarks).toHaveLength(21); // MediaPipe returns 21 landmarks
      expect(result.landmarks[0]).toHaveProperty('x');
      expect(result.landmarks[0]).toHaveProperty('y');
      expect(result.landmarks[0]).toHaveProperty('z');
    });

    it('should return empty result for image with no hands', async () => {
      const testImage = await loadTestImage('fixtures/test-images/no-hand.jpg');
      
      const result = await detector.detectHands(testImage);
      
      expect(result.handsDetected).toBe(false);
      expect(result.landmarks).toHaveLength(0);
    });

    it('should focus on single closest hand when multiple visible (FR-33)', async () => {
      const testImage = await loadTestImage('fixtures/test-images/two-hands.jpg');
      
      const result = await detector.detectHands(testImage);
      
      expect(result.handsDetected).toBe(true);
      expect(result.landmarks).toHaveLength(21); // Only one hand
      expect(result.handCount).toBe(1);
    });

    it('should return handedness (Left or Right)', async () => {
      const testImage = await loadTestImage('fixtures/test-images/right-hand.jpg');
      
      const result = await detector.detectHands(testImage);
      
      expect(result.handedness).toMatch(/^(Left|Right)$/);
      expect(result.handedness).toBe('Right');
    });

    it('should detect hands with confidence above threshold', async () => {
      const testImage = await loadTestImage('fixtures/test-images/hand-visible.jpg');
      
      const result = await detector.detectHands(testImage);
      
      expect(result.confidence).toBeGreaterThanOrEqual(0.7);
    });
  });

  describe('Performance (FR-43)', () => {
    it('should process frame in <500ms', async () => {
      const testImage = await loadTestImage('fixtures/test-images/hand-visible.jpg');
      
      const startTime = performance.now();
      await detector.detectHands(testImage);
      const duration = performance.now() - startTime;
      
      expect(duration).toBeLessThan(500);
    });
  });

  describe('Graceful Degradation (FR-36)', () => {
    it('should handle model loading failures gracefully', async () => {
      const detector = new MediaPipeHandsDetector({ modelPath: '/invalid' });
      
      // Should not throw, should return error state
      await expect(detector.initialize()).rejects.toThrow();
      expect(detector.isInitialized()).toBe(false);
    });

    it('should return null result on detection error without crashing', async () => {
      const detector = new MediaPipeHandsDetector();
      // Don't initialize model
      
      const result = await detector.detectHands(null as any);
      
      expect(result).toBeNull();
      // Should not throw error
    });
  });

  describe('Retry Logic (FR-10a)', () => {
    it('should retry detection for 10 seconds before timeout', async () => {
      const testImage = await loadTestImage('fixtures/test-images/poor-lighting.jpg');
      
      const startTime = Date.now();
      const result = await detector.detectHandsWithRetry(testImage, {
        timeout: 10000,
        interval: 500
      });
      const duration = Date.now() - startTime;
      
      // If detection fails, should take close to 10 seconds
      if (!result.handsDetected) {
        expect(duration).toBeGreaterThanOrEqual(9000);
        expect(duration).toBeLessThan(11000);
      }
    });

    it('should return immediately on successful detection (no full timeout)', async () => {
      const testImage = await loadTestImage('fixtures/test-images/hand-visible.jpg');
      
      const startTime = Date.now();
      const result = await detector.detectHandsWithRetry(testImage, {
        timeout: 10000,
        interval: 500
      });
      const duration = Date.now() - startTime;
      
      expect(result.handsDetected).toBe(true);
      expect(duration).toBeLessThan(1000); // Should succeed quickly
    });

    it('should offer skip option after timeout', async () => {
      const testImage = await loadTestImage('fixtures/test-images/no-hand.jpg');
      
      const result = await detector.detectHandsWithRetry(testImage, {
        timeout: 10000,
        interval: 500,
        onTimeout: () => ({ skipOffered: true })
      });
      
      expect(result.handsDetected).toBe(false);
      expect(result.skipOffered).toBe(true);
    });
  });
});

// Helper function
async function loadTestImage(path: string): Promise<HTMLImageElement> {
  // Implementation to load test images
}
```

#### 2.2 Run Tests → Confirm FAIL

```bash
cd cv-pipeline
npm test tests/unit/mediapipeHands.test.ts
```

**Expected:** All tests should FAIL (no implementation yet)

#### 2.3 Commit Tests

```bash
git add tests/unit/mediapipeHands.test.ts
git commit -m "[TDD] Add MediaPipe Hands detection tests"
```

#### 2.4 Implement MediaPipe Hands Detection

**File:** `src/mediapipeHands.ts`

```typescript
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import type { HandLandmarkerResult } from '@mediapipe/tasks-vision';

export interface MediaPipeConfig {
  modelPath?: string;
  minDetectionConfidence?: number;
  minTrackingConfidence?: number;
  maxNumHands?: number;
}

export interface DetectionResult {
  handsDetected: boolean;
  landmarks: Array<{ x: number; y: number; z: number }>;
  handedness?: 'Left' | 'Right';
  confidence: number;
  handCount: number;
  timestamp: number;
}

export interface RetryConfig {
  timeout: number;      // milliseconds
  interval: number;     // milliseconds
  onTimeout?: () => any;
}

export class MediaPipeHandsDetector {
  private handLandmarker: HandLandmarker | null = null;
  private initialized: boolean = false;
  private config: Required<MediaPipeConfig>;

  constructor(config: MediaPipeConfig = {}) {
    this.config = {
      modelPath: config.modelPath || 'models/hand_landmarker.task',
      minDetectionConfidence: config.minDetectionConfidence ?? 0.7,
      minTrackingConfidence: config.minTrackingConfidence ?? 0.7,
      maxNumHands: config.maxNumHands ?? 1
    };
  }

  async initialize(): Promise<void> {
    try {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );

      this.handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: this.config.modelPath,
          delegate: "GPU"
        },
        runningMode: "IMAGE",
        numHands: this.config.maxNumHands,
        minHandDetectionConfidence: this.config.minDetectionConfidence,
        minHandPresenceConfidence: this.config.minTrackingConfidence,
        minTrackingConfidence: this.config.minTrackingConfidence
      });

      this.initialized = true;
    } catch (error) {
      throw new Error(`Failed to load MediaPipe model: ${error.message}`);
    }
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  getModelVersion(): string {
    return 'MediaPipe Hands v0.9+';
  }

  getConfig(): Required<MediaPipeConfig> {
    return { ...this.config };
  }

  async detectHands(image: HTMLImageElement | ImageData): Promise<DetectionResult | null> {
    if (!this.initialized || !this.handLandmarker) {
      console.error('Detector not initialized');
      return null;
    }

    try {
      const startTime = performance.now();
      const results = this.handLandmarker.detect(image);
      const duration = performance.now() - startTime;

      // Log performance warning if too slow
      if (duration > 500) {
        console.warn(`CV detection took ${duration}ms (target: <500ms)`);
      }

      if (!results.landmarks || results.landmarks.length === 0) {
        return {
          handsDetected: false,
          landmarks: [],
          confidence: 0,
          handCount: 0,
          timestamp: Date.now()
        };
      }

      // Focus on first hand only (FR-33)
      const firstHandLandmarks = results.landmarks[0];
      const handedness = results.handednesses?.[0]?.[0]?.displayName as 'Left' | 'Right';
      const confidence = results.handednesses?.[0]?.[0]?.score || 0;

      return {
        handsDetected: true,
        landmarks: firstHandLandmarks.map(lm => ({
          x: lm.x,
          y: lm.y,
          z: lm.z
        })),
        handedness,
        confidence,
        handCount: 1,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Detection error:', error);
      return null;
    }
  }

  async detectHandsWithRetry(
    image: HTMLImageElement | ImageData,
    retryConfig: RetryConfig
  ): Promise<DetectionResult & { skipOffered?: boolean }> {
    const startTime = Date.now();
    let attempts = 0;
    const maxAttempts = Math.floor(retryConfig.timeout / retryConfig.interval);

    while (attempts < maxAttempts) {
      const result = await this.detectHands(image);

      if (result && result.handsDetected) {
        // Success! Return immediately
        return result;
      }

      // Check if timeout reached
      const elapsed = Date.now() - startTime;
      if (elapsed >= retryConfig.timeout) {
        break;
      }

      // Wait before next attempt
      await new Promise(resolve => setTimeout(resolve, retryConfig.interval));
      attempts++;
    }

    // Timeout reached - offer skip option
    const skipCallback = retryConfig.onTimeout?.();
    
    return {
      handsDetected: false,
      landmarks: [],
      confidence: 0,
      handCount: 0,
      timestamp: Date.now(),
      skipOffered: !!skipCallback?.skipOffered
    };
  }

  async close(): Promise<void> {
    if (this.handLandmarker) {
      this.handLandmarker.close();
      this.handLandmarker = null;
      this.initialized = false;
    }
  }
}
```

#### 2.5 Run Tests → Iterate Until PASS

```bash
npm test tests/unit/mediapipeHands.test.ts
```

**Expected:** All tests should PASS

#### 2.6 Commit Implementation

```bash
git add src/mediapipeHands.ts src/types/
git commit -m "[TDD] Implement MediaPipe Hands detection with retry logic"
```

---

### Step 3: Wrist Detection Logic - TDD (Hours 8-10)

**Duration:** 2 hours

#### 3.1 Write Tests FIRST

**File:** `tests/unit/wristDetection.test.ts`

```typescript
import { WristDetector } from '../../src/wristDetection';
import { HandLandmark } from '../../src/types/hands';

describe('WristDetector', () => {
  let detector: WristDetector;

  beforeEach(() => {
    detector = new WristDetector();
  });

  describe('findWrist()', () => {
    it('should identify wrist landmark from hand data', () => {
      const mockLandmarks = createMockHandLandmarks();
      
      const wrist = detector.findWrist(mockLandmarks);
      
      expect(wrist).toBeDefined();
      expect(wrist.index).toBe(0); // Wrist is landmark #0 in MediaPipe
      expect(wrist.position).toHaveProperty('x');
      expect(wrist.position).toHaveProperty('y');
      expect(wrist.position).toHaveProperty('z');
    });

    it('should handle missing wrist landmark gracefully', () => {
      const incompleteLandmarks = []; // Empty landmarks
      
      const wrist = detector.findWrist(incompleteLandmarks);
      
      expect(wrist).toBeNull();
      // Should not throw error
    });
  });

  describe('findRadialPulsePoint()', () => {
    it('should calculate thumb-side wrist position for radial pulse', () => {
      const mockLandmarks = createMockHandLandmarks('Right');
      
      const pulsePoint = detector.findRadialPulsePoint(mockLandmarks);
      
      expect(pulsePoint).toBeDefined();
      expect(pulsePoint.x).toBeCloseTo(mockLandmarks[0].x + 0.02, 2); // ~2cm toward thumb
      expect(pulsePoint.y).toBeCloseTo(mockLandmarks[0].y, 2);
      expect(pulsePoint.anatomicalName).toBe('Radial Artery (Pulse Point)');
    });

    it('should adjust calculation for left vs right hand', () => {
      const rightHandLandmarks = createMockHandLandmarks('Right');
      const leftHandLandmarks = createMockHandLandmarks('Left');
      
      const rightPulse = detector.findRadialPulsePoint(rightHandLandmarks, 'Right');
      const leftPulse = detector.findRadialPulsePoint(leftHandLandmarks, 'Left');
      
      // Pulse point should be on opposite sides
      expect(rightPulse.x).toBeGreaterThan(rightHandLandmarks[0].x);
      expect(leftPulse.x).toBeLessThan(leftHandLandmarks[0].x);
    });

    it('should be within 2cm of anatomical location (accuracy test)', () => {
      const mockLandmarks = createMockHandLandmarks('Right');
      const expectedAnatomicalPoint = { x: 0.52, y: 0.45, z: 0 };
      
      const pulsePoint = detector.findRadialPulsePoint(mockLandmarks);
      
      const distance = calculateDistance(pulsePoint, expectedAnatomicalPoint);
      expect(distance).toBeLessThan(0.02); // Within 2cm (normalized coordinates)
    });
  });

  describe('getWristOrientation()', () => {
    it('should return wrist angle for AR overlay positioning', () => {
      const mockLandmarks = createMockHandLandmarks('Right');
      
      const orientation = detector.getWristOrientation(mockLandmarks);
      
      expect(orientation.angle).toBeGreaterThanOrEqual(-180);
      expect(orientation.angle).toBeLessThanOrEqual(180);
      expect(orientation.rotationMatrix).toBeDefined();
    });

    it('should detect horizontal wrist orientation', () => {
      const horizontalWrist = createMockHandLandmarks('Right', 0); // 0 degrees
      
      const orientation = detector.getWristOrientation(horizontalWrist);
      
      expect(orientation.angle).toBeCloseTo(0, 1);
      expect(orientation.direction).toBe('horizontal');
    });

    it('should detect vertical wrist orientation', () => {
      const verticalWrist = createMockHandLandmarks('Right', 90); // 90 degrees
      
      const orientation = detector.getWristOrientation(verticalWrist);
      
      expect(orientation.angle).toBeCloseTo(90, 1);
      expect(orientation.direction).toBe('vertical');
    });
  });

  describe('validateFingerPlacement()', () => {
    it('should detect correct finger placement on radial pulse point', () => {
      const wristLandmarks = createMockHandLandmarks('Right');
      const fingerLandmarks = createFingerLandmarksOnPulse(wristLandmarks);
      
      const validation = detector.validateFingerPlacement(wristLandmarks, fingerLandmarks);
      
      expect(validation.isCorrect).toBe(true);
      expect(validation.feedback).toContain('Good position');
    });

    it('should detect incorrect finger placement (too far from pulse point)', () => {
      const wristLandmarks = createMockHandLandmarks('Right');
      const fingerLandmarks = createFingerLandmarksOffPulse(wristLandmarks, 0.05);
      
      const validation = detector.validateFingerPlacement(wristLandmarks, fingerLandmarks);
      
      expect(validation.isCorrect).toBe(false);
      expect(validation.feedback).toContain('Adjust your hand');
    });

    it('should provide directional feedback for correction', () => {
      const wristLandmarks = createMockHandLandmarks('Right');
      const fingerLandmarks = createFingerLandmarksOffPulse(wristLandmarks, -0.02);
      
      const validation = detector.validateFingerPlacement(wristLandmarks, fingerLandmarks);
      
      expect(validation.isCorrect).toBe(false);
      expect(validation.feedback).toMatch(/Move.*toward the thumb/i);
      expect(validation.correctionVector).toBeDefined();
    });
  });

  describe('calculateFingerDistance()', () => {
    it('should measure distance from optimal position in cm', () => {
      const wristLandmarks = createMockHandLandmarks('Right');
      const fingerLandmarks = createFingerLandmarksOffPulse(wristLandmarks, 0.03);
      
      const distance = detector.calculateFingerDistance(wristLandmarks, fingerLandmarks);
      
      expect(distance.cm).toBeCloseTo(3, 1); // ~3cm off
      expect(distance.pixels).toBeGreaterThan(0);
    });

    it('should return zero for perfectly placed fingers', () => {
      const wristLandmarks = createMockHandLandmarks('Right');
      const fingerLandmarks = createFingerLandmarksOnPulse(wristLandmarks);
      
      const distance = detector.calculateFingerDistance(wristLandmarks, fingerLandmarks);
      
      expect(distance.cm).toBeCloseTo(0, 1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle partially visible hand gracefully', () => {
      const partialLandmarks = createMockHandLandmarks('Right').slice(0, 10); // Only 10 landmarks
      
      const wrist = detector.findWrist(partialLandmarks);
      
      expect(wrist).toBeDefined(); // Should still find wrist (landmark 0)
    });

    it('should handle occluded wrist landmark', () => {
      const landmarksWithLowConfidence = createMockHandLandmarks('Right');
      landmarksWithLowConfidence[0].visibility = 0.3; // Low confidence
      
      const pulsePoint = detector.findRadialPulsePoint(landmarksWithLowConfidence);
      
      // Should still calculate but may flag low confidence
      expect(pulsePoint).toBeDefined();
      expect(pulsePoint.confidence).toBeLessThan(0.7);
    });

    it('should handle null landmarks without crashing', () => {
      const wrist = detector.findWrist(null as any);
      
      expect(wrist).toBeNull();
      // Should not throw
    });
  });
});

// Helper functions
function createMockHandLandmarks(
  handedness: 'Left' | 'Right' = 'Right',
  wristAngle: number = 0
): HandLandmark[] {
  // Create 21 mock landmarks following MediaPipe structure
  // Landmark 0 = wrist, 1-4 = thumb, 5-8 = index, etc.
  const landmarks: HandLandmark[] = [];
  
  // Wrist (landmark 0)
  landmarks.push({ x: 0.5, y: 0.5, z: 0, visibility: 0.95 });
  
  // Add remaining 20 landmarks
  for (let i = 1; i < 21; i++) {
    landmarks.push({
      x: 0.5 + Math.random() * 0.1,
      y: 0.5 + Math.random() * 0.1,
      z: Math.random() * 0.05,
      visibility: 0.9
    });
  }
  
  return landmarks;
}

function createFingerLandmarksOnPulse(wristLandmarks: HandLandmark[]): HandLandmark[] {
  // Return index and middle finger landmarks positioned correctly on pulse
  return [
    wristLandmarks[8],  // Index finger tip
    wristLandmarks[12]  // Middle finger tip
  ];
}

function createFingerLandmarksOffPulse(
  wristLandmarks: HandLandmark[],
  offset: number
): HandLandmark[] {
  // Return finger landmarks offset from correct position
  return [
    { ...wristLandmarks[8], x: wristLandmarks[8].x + offset },
    { ...wristLandmarks[12], x: wristLandmarks[12].x + offset }
  ];
}

function calculateDistance(
  point1: { x: number; y: number; z: number },
  point2: { x: number; y: number; z: number }
): number {
  return Math.sqrt(
    Math.pow(point2.x - point1.x, 2) +
    Math.pow(point2.y - point1.y, 2) +
    Math.pow(point2.z - point1.z, 2)
  );
}
```

#### 3.2 Run Tests → Confirm FAIL

```bash
npm test tests/unit/wristDetection.test.ts
```

#### 3.3 Commit Tests

```bash
git add tests/unit/wristDetection.test.ts
git commit -m "[TDD] Add wrist detection and finger placement tests"
```

#### 3.4 Implement Wrist Detection

**File:** `src/wristDetection.ts`

```typescript
import { HandLandmark } from './types/hands';

export interface WristPosition {
  index: number;
  position: { x: number; y: number; z: number };
  confidence: number;
}

export interface PulsePoint {
  x: number;
  y: number;
  z: number;
  anatomicalName: string;
  confidence: number;
}

export interface WristOrientation {
  angle: number;
  direction: 'horizontal' | 'vertical' | 'diagonal';
  rotationMatrix: number[][];
}

export interface FingerPlacementValidation {
  isCorrect: boolean;
  feedback: string;
  correctionVector?: { x: number; y: number };
  distance: number;
}

export interface Distance {
  cm: number;
  pixels: number;
}

// MediaPipe Hands landmark indices
const LANDMARK_INDICES = {
  WRIST: 0,
  THUMB_TIP: 4,
  INDEX_FINGER_TIP: 8,
  MIDDLE_FINGER_TIP: 12,
  RING_FINGER_TIP: 16,
  PINKY_TIP: 20
};

export class WristDetector {
  private readonly PULSE_POINT_OFFSET = 0.02; // Normalized coordinates (~2cm)
  private readonly PLACEMENT_TOLERANCE = 0.015; // Acceptable distance for "correct" placement

  /**
   * Find wrist landmark from hand landmarks array
   * FR-34: Wrist position detection
   */
  findWrist(landmarks: HandLandmark[] | null): WristPosition | null {
    if (!landmarks || landmarks.length === 0) {
      return null;
    }

    const wristLandmark = landmarks[LANDMARK_INDICES.WRIST];
    if (!wristLandmark) {
      return null;
    }

    return {
      index: LANDMARK_INDICES.WRIST,
      position: {
        x: wristLandmark.x,
        y: wristLandmark.y,
        z: wristLandmark.z
      },
      confidence: wristLandmark.visibility || 1.0
    };
  }

  /**
   * Calculate radial pulse point (thumb-side of wrist)
   * FR-34: Radial pulse point identification
   */
  findRadialPulsePoint(
    landmarks: HandLandmark[],
    handedness: 'Left' | 'Right' = 'Right'
  ): PulsePoint {
    const wrist = this.findWrist(landmarks);
    if (!wrist) {
      throw new Error('Cannot find wrist landmark');
    }

    const thumbTip = landmarks[LANDMARK_INDICES.THUMB_TIP];
    
    // Calculate direction to thumb (radial side)
    const thumbDirection = {
      x: thumbTip.x - wrist.position.x,
      y: thumbTip.y - wrist.position.y
    };
    
    // Normalize direction
    const magnitude = Math.sqrt(
      thumbDirection.x * thumbDirection.x + 
      thumbDirection.y * thumbDirection.y
    );
    
    const normalizedDirection = {
      x: thumbDirection.x / magnitude,
      y: thumbDirection.y / magnitude
    };

    // Pulse point is slightly toward thumb from wrist
    const pulsePoint = {
      x: wrist.position.x + normalizedDirection.x * this.PULSE_POINT_OFFSET,
      y: wrist.position.y + normalizedDirection.y * this.PULSE_POINT_OFFSET,
      z: wrist.position.z,
      anatomicalName: 'Radial Artery (Pulse Point)',
      confidence: wrist.confidence
    };

    return pulsePoint;
  }

  /**
   * Get wrist orientation for AR overlay alignment
   * FR-34: Wrist orientation detection
   */
  getWristOrientation(landmarks: HandLandmark[]): WristOrientation {
    const wrist = landmarks[LANDMARK_INDICES.WRIST];
    const middleFingerMCP = landmarks[9]; // Middle finger base knuckle

    // Calculate angle from wrist to middle finger
    const dx = middleFingerMCP.x - wrist.x;
    const dy = middleFingerMCP.y - wrist.y;
    
    let angle = Math.atan2(dy, dx) * (180 / Math.PI);
    
    // Normalize to -180 to 180
    if (angle > 180) angle -= 360;
    if (angle < -180) angle += 360;

    // Determine direction
    let direction: 'horizontal' | 'vertical' | 'diagonal';
    const absAngle = Math.abs(angle);
    
    if (absAngle < 30 || absAngle > 150) {
      direction = 'horizontal';
    } else if (absAngle > 60 && absAngle < 120) {
      direction = 'vertical';
    } else {
      direction = 'diagonal';
    }

    // Create rotation matrix for AR overlay
    const radians = angle * (Math.PI / 180);
    const rotationMatrix = [
      [Math.cos(radians), -Math.sin(radians), 0],
      [Math.sin(radians), Math.cos(radians), 0],
      [0, 0, 1]
    ];

    return {
      angle,
      direction,
      rotationMatrix
    };
  }

  /**
   * Validate finger placement on radial pulse point
   * FR-7: Track user's hand position and provide feedback
   */
  validateFingerPlacement(
    wristLandmarks: HandLandmark[],
    fingerLandmarks: HandLandmark[]
  ): FingerPlacementValidation {
    const pulsePoint = this.findRadialPulsePoint(wristLandmarks);
    
    // Check index and middle finger positions
    const indexTip = fingerLandmarks[LANDMARK_INDICES.INDEX_FINGER_TIP];
    const middleTip = fingerLandmarks[LANDMARK_INDICES.MIDDLE_FINGER_TIP];

    // Calculate average finger position
    const avgFingerPos = {
      x: (indexTip.x + middleTip.x) / 2,
      y: (indexTip.y + middleTip.y) / 2,
      z: (indexTip.z + middleTip.z) / 2
    };

    // Calculate distance from pulse point
    const distance = Math.sqrt(
      Math.pow(avgFingerPos.x - pulsePoint.x, 2) +
      Math.pow(avgFingerPos.y - pulsePoint.y, 2)
    );

    // Check if within tolerance
    if (distance <= this.PLACEMENT_TOLERANCE) {
      return {
        isCorrect: true,
        feedback: 'Good position. Apply gentle, steady pressure.',
        distance
      };
    }

    // Calculate correction vector
    const correctionVector = {
      x: pulsePoint.x - avgFingerPos.x,
      y: pulsePoint.y - avgFingerPos.y
    };

    // Generate directional feedback
    const distanceCm = distance * 100; // Approximate conversion
    let direction = '';
    
    if (correctionVector.x > 0.01) {
      direction = 'toward the thumb';
    } else if (correctionVector.x < -0.01) {
      direction = 'away from the thumb';
    }
    
    if (correctionVector.y > 0.01) {
      direction += direction ? ' and down' : 'down';
    } else if (correctionVector.y < -0.01) {
      direction += direction ? ' and up' : 'up';
    }

    const feedback = `Adjust your hand. Move ${Math.round(distanceCm)} centimeters ${direction}.`;

    return {
      isCorrect: false,
      feedback,
      correctionVector,
      distance
    };
  }

  /**
   * Calculate distance from optimal finger position
   * FR-9: Measure finger distance for feedback
   */
  calculateFingerDistance(
    wristLandmarks: HandLandmark[],
    fingerLandmarks: HandLandmark[]
  ): Distance {
    const validation = this.validateFingerPlacement(wristLandmarks, fingerLandmarks);
    
    // Convert normalized distance to cm (approximate)
    const cm = validation.distance * 100;
    
    // Convert to pixels (assuming 640x480 input resolution from FR-32)
    const pixels = validation.distance * 640;

    return { cm, pixels };
  }
}
```

#### 3.5 Run Tests → Iterate Until PASS

```bash
npm test tests/unit/wristDetection.test.ts
```

#### 3.6 Commit Implementation

```bash
git add src/wristDetection.ts
git commit -m "[TDD] Implement wrist detection and finger placement validation"
```

---

### Step 4: Vital Sign OCR - TDD (Hours 10-12) [OPTIONAL]

**Duration:** 2 hours (can be skipped if time constrained)

#### 4.1 Write Tests FIRST

**File:** `tests/unit/vitalSignOCR.test.ts`

```typescript
import { VitalSignOCR } from '../../src/vitalSignOCR';

describe('VitalSignOCR', () => {
  let ocr: VitalSignOCR;

  beforeAll(async () => {
    ocr = new VitalSignOCR();
    await ocr.initialize();
  });

  describe('detectMonitor()', () => {
    it('should identify vital sign display area in image', async () => {
      const testImage = await loadTestImage('fixtures/test-monitors/monitor-clear.jpg');
      
      const displayArea = await ocr.detectMonitor(testImage);
      
      expect(displayArea).toBeDefined();
      expect(displayArea.bounds).toHaveProperty('x');
      expect(displayArea.bounds).toHaveProperty('y');
      expect(displayArea.bounds).toHaveProperty('width');
      expect(displayArea.bounds).toHaveProperty('height');
      expect(displayArea.confidence).toBeGreaterThan(0.7);
    });

    it('should return null when no monitor detected', async () => {
      const testImage = await loadTestImage('fixtures/test-monitors/no-monitor.jpg');
      
      const displayArea = await ocr.detectMonitor(testImage);
      
      expect(displayArea).toBeNull();
    });
  });

  describe('extractText()', () => {
    it('should read numbers from monitor image', async () => {
      const monitorImage = await loadTestImage('fixtures/test-monitors/monitor-clear.jpg');
      
      const text = await ocr.extractText(monitorImage);
      
      expect(text).toContain('118/76'); // BP
      expect(text).toContain('88');     // HR
      expect(text).toContain('97');     // O2
    });

    it('should handle poor quality images', async () => {
      const blurryImage = await loadTestImage('fixtures/test-monitors/monitor-blurry.jpg');
      
      const text = await ocr.extractText(blurryImage);
      
      // May return partial or empty text
      expect(text).toBeDefined();
    });
  });

  describe('parseVitalSigns()', () => {
    it('should extract BP, HR, O2, Temp from OCR text (FR-16)', () => {
      const mockText = `
        BP: 118/76 mmHg
        HR: 88 bpm
        SpO2: 97%
        Temp: 101.5°F
      `;
      
      const vitals = ocr.parseVitalSigns(mockText);
      
      expect(vitals.bp).toBe('118/76');
      expect(vitals.hr).toBe(88);
      expect(vitals.o2).toBe(97);
      expect(vitals.temp).toBe(101.5);
    });

    it('should handle various text formats', () => {
      const variations = [
        'Blood Pressure 120/80',
        'HR 72',
        'O2 Sat: 98%',
        'Temperature: 98.6 F'
      ];
      
      variations.forEach(text => {
        const vitals = ocr.parseVitalSigns(text);
        expect(vitals).toBeDefined();
      });
    });

    it('should return null for values it cannot parse', () => {
      const incompleteText = 'BP: 118/76 mmHg';
      
      const vitals = ocr.parseVitalSigns(incompleteText);
      
      expect(vitals.bp).toBe('118/76');
      expect(vitals.hr).toBeNull();
      expect(vitals.o2).toBeNull();
      expect(vitals.temp).toBeNull();
    });
  });

  describe('validateReadings()', () => {
    it('should accept realistic vital sign values', () => {
      const validVitals = {
        bp: '120/80',
        hr: 75,
        o2: 98,
        temp: 98.6
      };
      
      const validation = ocr.validateReadings(validVitals);
      
      expect(validation.isValid).toBe(true);
      expect(validation.warnings).toHaveLength(0);
    });

    it('should flag unrealistic values', () => {
      const invalidVitals = {
        bp: '300/200',  // Unrealistic BP
        hr: 250,         // Unrealistic HR
        o2: 50,          // Dangerously low O2
        temp: 110        // Unrealistic temp
      };
      
      const validation = ocr.validateReadings(invalidVitals);
      
      expect(validation.isValid).toBe(false);
      expect(validation.warnings.length).toBeGreaterThan(0);
      expect(validation.warnings).toContainEqual(
        expect.objectContaining({ field: 'bp' })
      );
    });
  });

  describe('Retry Logic (FR-17a)', () => {
    it('should retry OCR 2 times with 2-second delay', async () => {
      const poorImage = await loadTestImage('fixtures/test-monitors/monitor-poor.jpg');
      
      const startTime = Date.now();
      const result = await ocr.extractVitalSignsWithRetry(poorImage);
      const duration = Date.now() - startTime;
      
      // If fails both attempts, should take ~4 seconds (2 retries x 2 seconds)
      if (!result) {
        expect(duration).toBeGreaterThanOrEqual(3900);
        expect(duration).toBeLessThan(5000);
      }
    });

    it('should return immediately on successful first attempt', async () => {
      const clearImage = await loadTestImage('fixtures/test-monitors/monitor-clear.jpg');
      
      const startTime = Date.now();
      const result = await ocr.extractVitalSignsWithRetry(clearImage);
      const duration = Date.now() - startTime;
      
      expect(result).toBeDefined();
      expect(duration).toBeLessThan(2000); // Should not wait for retry
    });
  });

  describe('Graceful Failure (FR-17)', () => {
    it('should return null after 2 failed attempts', async () => {
      const unreadableImage = await loadTestImage('fixtures/test-monitors/monitor-unreadable.jpg');
      
      const result = await ocr.extractVitalSignsWithRetry(unreadableImage);
      
      expect(result).toBeNull();
      // Should not throw error
    });

    it('should not block workflow on OCR failure', async () => {
      const badImage = null as any;
      
      // Should handle gracefully
      const result = await ocr.extractVitalSignsWithRetry(badImage);
      
      expect(result).toBeNull();
      // Workflow continues
    });
  });
});
```

#### 4.2 Implementation (Abbreviated - OPTIONAL)

**File:** `src/vitalSignOCR.ts`

```typescript
// Implementation using Tesseract.js or similar OCR library
// Full implementation omitted for brevity
// Follow same pattern as MediaPipe Hands implementation
```

---

### Step 5: Integration Testing (Hours 12-14)

**Duration:** 2 hours

#### 5.1 Write Integration Tests

**File:** `tests/integration/cv-pipeline.test.ts`

```typescript
import { MediaPipeHandsDetector } from '../../src/mediapipeHands';
import { WristDetector } from '../../src/wristDetection';

describe('CV Pipeline Integration', () => {
  let handsDetector: MediaPipeHandsDetector;
  let wristDetector: WristDetector;

  beforeAll(async () => {
    handsDetector = new MediaPipeHandsDetector();
    await handsDetector.initialize();
    wristDetector = new WristDetector();
  });

  describe('Training Mode Flow', () => {
    it('should detect hand → find wrist → locate pulse point → validate placement', async () => {
      // Step 1: Detect hand
      const testImage = await loadTestImage('fixtures/test-images/training-scenario.jpg');
      const handResult = await handsDetector.detectHands(testImage);
      
      expect(handResult.handsDetected).toBe(true);
      
      // Step 2: Find wrist
      const wrist = wristDetector.findWrist(handResult.landmarks);
      
      expect(wrist).toBeDefined();
      
      // Step 3: Locate pulse point
      const pulsePoint = wristDetector.findRadialPulsePoint(
        handResult.landmarks,
        handResult.handedness
      );
      
      expect(pulsePoint).toBeDefined();
      expect(pulsePoint.anatomicalName).toBe('Radial Artery (Pulse Point)');
      
      // Step 4: Validate finger placement (simulated)
      const validation = wristDetector.validateFingerPlacement(
        handResult.landmarks,
        handResult.landmarks
      );
      
      expect(validation).toBeDefined();
      expect(validation.feedback).toBeDefined();
    });

    it('should handle CV failure gracefully throughout pipeline', async () => {
      const noHandImage = await loadTestImage('fixtures/test-images/no-hand.jpg');
      
      // Step 1 fails
      const handResult = await handsDetector.detectHands(noHandImage);
      expect(handResult.handsDetected).toBe(false);
      
      // Pipeline continues without crashing
      const wrist = wristDetector.findWrist(handResult.landmarks);
      expect(wrist).toBeNull();
      
      // Workflow continues (graceful degradation per FR-36)
    });
  });

  describe('End-to-End Performance', () => {
    it('should complete full detection pipeline in <1 second', async () => {
      const testImage = await loadTestImage('fixtures/test-images/training-scenario.jpg');
      
      const startTime = performance.now();
      
      // Full pipeline
      const handResult = await handsDetector.detectHands(testImage);
      const wrist = wristDetector.findWrist(handResult.landmarks);
      const pulsePoint = wristDetector.findRadialPulsePoint(handResult.landmarks);
      const validation = wristDetector.validateFingerPlacement(
        handResult.landmarks,
        handResult.landmarks
      );
      
      const duration = performance.now() - startTime;
      
      expect(duration).toBeLessThan(1000);
    });
  });
});
```

#### 5.2 Run Integration Tests

```bash
npm test tests/integration/cv-pipeline.test.ts
```

---

## Edge Cases & Error Handling

### Critical Edge Cases to Test

| Edge Case | Expected Behavior | Test Coverage |
|-----------|-------------------|---------------|
| **No hand visible** | Return empty result, offer skip after 10s | ✅ Required |
| **Partially visible hand** | Extract available landmarks, flag low confidence | ✅ Required |
| **Multiple hands in frame** | Focus on closest hand (FR-33) | ✅ Required |
| **Poor lighting** | Retry detection, degrade gracefully | ✅ Required |
| **Occluded wrist** | Flag low confidence, continue workflow | ✅ Required |
| **Model loading failure** | Throw initialization error, prevent usage | ✅ Required |
| **Null/invalid input** | Return null without crashing | ✅ Required |
| **Performance degradation** | Log warning, continue processing | ✅ Required |

### Error Handling Strategy

```typescript
// Example error handling pattern
async function safeDetection(image: HTMLImageElement): Promise<DetectionResult> {
  try {
    return await detector.detectHands(image);
  } catch (error) {
    // Log error for debugging
    logger.error('CV detection failed', { error, timestamp: Date.now() });
    
    // Return safe default (graceful degradation)
    return {
      handsDetected: false,
      landmarks: [],
      confidence: 0,
      handCount: 0,
      timestamp: Date.now()
    };
  }
}
```

---

## Performance Optimization

### Optimization Strategies

1. **Reduce Input Resolution (FR-32)**
   ```typescript
   // Use 640x480 instead of full HD
   const optimizedImage = resizeImage(originalImage, 640, 480);
   ```

2. **Lower Frame Rate**
   ```typescript
   // Process at 15 FPS instead of 30 FPS
   const PROCESSING_FPS = 15;
   const FRAME_INTERVAL = 1000 / PROCESSING_FPS; // 66ms
   ```

3. **GPU Acceleration**
   ```typescript
   // Use GPU delegate in MediaPipe config
   delegate: "GPU"
   ```

4. **Skip Frames Under Load**
   ```typescript
   let frameSkipCounter = 0;
   
   function shouldProcessFrame(): boolean {
     if (performance.now() - lastFrameTime < FRAME_INTERVAL) {
       frameSkipCounter++;
       return false;
     }
     return true;
   }
   ```

5. **Caching Stable Detections**
   ```typescript
   // Cache wrist position if hand is stable (not moving much)
   if (isHandStable(currentLandmarks, previousLandmarks)) {
     return cachedWristPosition;
   }
   ```

### Performance Benchmarking

**File:** `tests/performance/cv-benchmark.test.ts`

```typescript
describe('CV Performance Benchmarks', () => {
  it('should meet FR-43: detection <500ms', async () => {
    const iterations = 100;
    const durations: number[] = [];
    
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      await detector.detectHands(testImage);
      durations.push(performance.now() - start);
    }
    
    const avg = durations.reduce((a, b) => a + b) / iterations;
    const p95 = durations.sort()[Math.floor(iterations * 0.95)];
    
    console.log(`Average: ${avg}ms, P95: ${p95}ms`);
    
    expect(avg).toBeLessThan(500);
    expect(p95).toBeLessThan(750); // Allow some variance
  });
});
```

---

## Integration & Handoff

### Handoff to Dev 1 (Lens Studio)

**Deliverables:**
- [ ] `cv-pipeline/` module with exports:
  - `MediaPipeHandsDetector`
  - `WristDetector`
  - `VitalSignOCR` (if implemented)
- [ ] Integration guide: `cv-pipeline/INTEGRATION.md`
- [ ] Test data: Sample images and expected results
- [ ] Performance report: Latency measurements

**Integration Points:**

```typescript
// Example usage for Dev 1 in Lens Studio
import { MediaPipeHandsDetector, WristDetector } from './cv-pipeline/src';

// Initialize once
const handsDetector = new MediaPipeHandsDetector();
await handsDetector.initialize();
const wristDetector = new WristDetector();

// In AR loop
async function processFrame(cameraFrame) {
  // Detect hands with retry
  const handResult = await handsDetector.detectHandsWithRetry(cameraFrame, {
    timeout: 10000,
    interval: 500,
    onTimeout: () => showSkipOption()
  });
  
  if (!handResult.handsDetected) {
    if (handResult.skipOffered) {
      // User can skip or continue waiting
    }
    return;
  }
  
  // Find pulse point
  const pulsePoint = wristDetector.findRadialPulsePoint(
    handResult.landmarks,
    handResult.handedness
  );
  
  // Render AR overlay at pulse point
  renderPulsePointOverlay(pulsePoint);
  
  // Validate finger placement (if user's other hand is visible)
  const validation = wristDetector.validateFingerPlacement(
    patientWristLandmarks,
    nurseFingerLandmarks
  );
  
  // Show feedback
  displayFeedback(validation.feedback);
}
```

---

## Acceptance Criteria

### Checklist (Must ALL Pass)

- [ ] **AC-CV1:** Wrist detection succeeds ≥80% in good lighting (10 test subjects)
- [ ] **AC-CV2:** Spatial feedback accurate within 2cm tolerance
- [ ] **AC-CV3:** Graceful failure handling - no crashes on CV errors
- [ ] **FR-43:** CV detection latency <500ms (average across 100 frames)
- [ ] **FR-10a:** Retry logic: 10-second timeout with skip option
- [ ] **FR-36:** Workflow continues even when CV fails
- [ ] **FR-33:** Single-hand tracking (ignores additional hands)
- [ ] **TDD:** All tests written BEFORE implementation
- [ ] **Coverage:** ≥90% code coverage for critical paths
- [ ] **Integration:** Successfully integrated with Dev 1's Lens Studio app

---

## Commit Checklist

### Expected Git History

```bash
git log --oneline

[TDD] Implement vital sign OCR (optional)
[TDD] Add vital sign OCR tests
[TDD] Implement wrist detection and finger placement validation
[TDD] Add wrist detection and finger placement tests
[TDD] Implement MediaPipe Hands detection with retry logic
[TDD] Add MediaPipe Hands detection tests
[TDD] Initialize CV pipeline project structure
```

### Branch Management

```bash
# All work on CV branch
git checkout -b CV

# After each TDD cycle, commit
git add tests/
git commit -m "[TDD] Add [component] tests"

git add src/
git commit -m "[TDD] Implement [component]"

# Push regularly
git push origin CV

# Merge to main after integration testing (Hour 18)
git checkout main
git merge CV
git tag v0.8-cv-complete
git push origin main --tags
```

---

## Troubleshooting Guide

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| **Model fails to load** | Incorrect path or CORS error | Use CDN version, check network |
| **Poor detection accuracy** | Low lighting or motion blur | Increase confidence threshold, add lighting check |
| **Slow performance** | High resolution input | Downsample to 640x480 per FR-32 |
| **Memory leaks** | Model not closed properly | Ensure `detector.close()` in cleanup |
| **Multiple hand confusion** | maxNumHands > 1 | Set maxNumHands: 1 per FR-33 |

### Debug Commands

```bash
# Run specific test
npm test -- tests/unit/mediapipeHands.test.ts

# Run with verbose output
npm test -- --verbose

# Run with coverage
npm test -- --coverage

# Run integration tests only
npm test -- tests/integration/

# Profile performance
node --inspect-brk node_modules/.bin/jest tests/performance/
```

---

## Success Criteria Summary

✅ **Phase Complete When:**
1. All unit tests pass (100% for critical paths)
2. All integration tests pass
3. Performance benchmarks meet targets (<500ms)
4. CV pipeline successfully integrated with Lens Studio
5. Graceful degradation verified in failure scenarios
6. Handoff documentation delivered to Dev 1
7. Code committed to CV branch and merged to main

---

## Timeline Checkpoints

| Hour | Checkpoint | Deliverable |
|------|-----------|-------------|
| 6 | Environment setup complete | `cv-pipeline/` initialized |
| 8 | MediaPipe Hands TDD complete | `mediapipeHands.ts` + tests |
| 10 | Wrist detection TDD complete | `wristDetection.ts` + tests |
| 12 | OCR TDD complete (optional) | `vitalSignOCR.ts` + tests |
| 14 | Integration tests pass | `cv-pipeline.test.ts` passes |
| 16 | Performance optimization | <500ms latency achieved |
| 18 | **HANDOFF TO DEV 1** | CV module + docs delivered |

---

**END OF IMPLEMENTATION PLAN**

