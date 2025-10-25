# CV Pipeline - MediaPipe Hands Integration

**Version:** MediaPipe Hands v0.9+ (via @mediapipe/tasks-vision v0.10.22+)  
**Developer:** Dev 4 - Data, CV & Integration Owner  
**Branch:** CV  
**Timeline:** Hours 6-18 (12 hours)

## Overview

This module implements computer vision hand detection for the MedSnap AR Medical Assistant using MediaPipe Hands. It provides:

1. **Hand Detection**: Real-time hand landmark detection with retry logic
2. **Wrist Identification**: Locates wrist position for pulse-taking training
3. **Finger Placement Validation**: Checks finger positioning on radial pulse point
4. **Vital Sign OCR** (Optional): Reads vital signs from digital monitors

## Technology Stack

- **MediaPipe Hands v0.9+**: Hand landmark detection (21 landmarks per hand)
- **TypeScript**: Strict type checking enabled
- **Jest + ts-jest**: Test-driven development framework
- **CDN Loading**: Models loaded from MediaPipe CDN (no local download required)

## Configuration (FR-32)

```typescript
const MEDIAPIPE_CONFIG = {
  model: 'MediaPipe Hands v0.9+',
  input: {
    width: 640,
    height: 480,
    fps: 15,              // Optimized for performance
    format: 'RGB'
  },
  detection: {
    minDetectionConfidence: 0.7,  // Per FR-32
    minTrackingConfidence: 0.7,
    maxNumHands: 1                 // Per FR-33 (single-person detection)
  }
};
```

## Retry & Graceful Degradation

- **10-second retry timeout** (FR-10a): Automatically retries hand detection for 10 seconds
- **Graceful degradation** (FR-36): Never blocks workflow on CV failure
- **Performance target**: <500ms detection latency (FR-43)

## Project Structure

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
│   ├── unit/                   # Unit tests
│   ├── integration/            # Integration tests
│   └── fixtures/               # Test images and data
├── models/                     # (Not used with CDN loading)
├── package.json
├── tsconfig.json
├── jest.config.js
└── README.md
```

## Installation

```bash
npm install
```

## Testing

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Watch mode (TDD)
npm run test:watch

# Coverage report
npm run test:coverage
```

## Test-Driven Development (TDD) Workflow

This project follows strict TDD:

1. 📝 **Write tests FIRST** - Define expected behavior
2. 🔴 **Run tests** - Confirm they FAIL (proves test validity)
3. 💾 **Commit tests** - `git commit -m "[TDD] Add [feature] tests"`
4. 💻 **Implement code** - Write minimum code to pass tests
5. 🟢 **Run tests** - Iterate until all tests PASS
6. ✅ **Verify** - Check implementation quality
7. 💾 **Commit code** - `git commit -m "[TDD] Implement [feature]"`

## Usage Example

```typescript
import { MediaPipeHandsDetector, WristDetector } from './src';

// Initialize detector once
const handsDetector = new MediaPipeHandsDetector();
await handsDetector.initialize();
const wristDetector = new WristDetector();

// In AR loop
async function processFrame(cameraFrame: HTMLImageElement) {
  // Detect hands with retry
  const handResult = await handsDetector.detectHandsWithRetry(cameraFrame, {
    timeout: 10000,      // 10 seconds
    interval: 500,       // Check every 500ms
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
  
  // Validate finger placement
  const validation = wristDetector.validateFingerPlacement(
    patientWristLandmarks,
    nurseFingerLandmarks
  );
  
  // Show feedback
  displayFeedback(validation.feedback);
}
```

## Fallback Strategy

If MediaPipe Hands fails to load:
1. Log error for debugging
2. Return error state (don't throw)
3. Allow workflow to continue without CV features
4. Offer manual mode to user

## Performance Targets

- ✅ Detection latency: <500ms (FR-43)
- ✅ Wrist detection accuracy: ≥80% in good lighting (AC-CV1)
- ✅ Spatial feedback accuracy: ±2cm tolerance (AC-CV2)
- ✅ Graceful failure: No crashes on CV errors (AC-CV3)

## Acceptance Criteria

- [ ] **AC-CV1**: Wrist detection succeeds ≥80% in good lighting
- [ ] **AC-CV2**: Spatial feedback accurate within 2cm tolerance
- [ ] **AC-CV3**: Graceful failure handling without blocking workflow
- [ ] **FR-43**: CV detection latency <500ms (average)
- [ ] **FR-10a**: Retry logic with 10-second timeout
- [ ] **FR-36**: Workflow continues even when CV fails
- [ ] **FR-33**: Single-hand tracking (ignores additional hands)

## Integration Points

This module is designed to integrate with:
- **Dev 1**: Lens Studio AR overlay rendering
- **Dev 2**: Clinical mode vital sign reading
- **Backend**: Training feedback API

## License

ISC - MedSnap Team

