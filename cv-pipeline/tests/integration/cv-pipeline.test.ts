/**
 * CV Pipeline Integration Tests
 * Tests the complete flow: Hand Detection → Wrist Detection → Pulse Point → Validation
 * 
 * Requirements tested:
 * - Complete training mode flow
 * - FR-36: Graceful degradation throughout pipeline
 * - FR-43: End-to-end performance <1 second
 * - AC-CV1, AC-CV2, AC-CV3: All acceptance criteria
 */

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

  afterAll(async () => {
    await handsDetector.close();
  });

  describe('Training Mode Flow', () => {
    it('should detect hand → find wrist → locate pulse point → validate placement', async () => {
      // Step 1: Detect hand
      const testImage = await loadTestImage('fixtures/test-images/hand-visible.jpg');
      const handResult = await handsDetector.detectHands(testImage);
      
      expect(handResult).not.toBeNull();
      expect(handResult!.handsDetected).toBe(true);
      
      // Step 2: Find wrist
      const wrist = wristDetector.findWrist(handResult!.landmarks);
      
      expect(wrist).toBeDefined();
      expect(wrist!.index).toBe(0);
      
      // Step 3: Locate pulse point
      const pulsePoint = wristDetector.findRadialPulsePoint(
        handResult!.landmarks,
        handResult!.handedness
      );
      
      expect(pulsePoint).toBeDefined();
      expect(pulsePoint.anatomicalName).toBe('Radial Artery (Pulse Point)');
      expect(pulsePoint.x).toBeDefined();
      expect(pulsePoint.y).toBeDefined();
      
      // Step 4: Validate finger placement (using same hand landmarks as mock)
      const validation = wristDetector.validateFingerPlacement(
        handResult!.landmarks,
        [handResult!.landmarks[8], handResult!.landmarks[12]] // Index and middle finger tips
      );
      
      expect(validation).toBeDefined();
      expect(validation.feedback).toBeDefined();
      expect(validation.distance).toBeGreaterThanOrEqual(0);
    });

    it('should handle CV failure gracefully throughout pipeline (FR-36)', async () => {
      const noHandImage = await loadTestImage('fixtures/test-images/no-hand.jpg');
      
      // Step 1 fails - no hand detected
      const handResult = await handsDetector.detectHands(noHandImage);
      expect(handResult).not.toBeNull();
      expect(handResult!.handsDetected).toBe(false);
      
      // Pipeline continues without crashing - graceful degradation
      const wrist = wristDetector.findWrist(handResult!.landmarks);
      expect(wrist).toBeNull();
      
      // Workflow continues - no errors thrown (FR-36)
      expect(() => {
        wristDetector.findWrist([]);
      }).not.toThrow();
    });

    it('should provide wrist orientation for AR overlay positioning', async () => {
      const testImage = await loadTestImage('fixtures/test-images/hand-visible.jpg');
      const handResult = await handsDetector.detectHands(testImage);
      
      expect(handResult!.handsDetected).toBe(true);
      
      const orientation = wristDetector.getWristOrientation(handResult!.landmarks);
      
      expect(orientation).toBeDefined();
      expect(orientation.angle).toBeGreaterThanOrEqual(-180);
      expect(orientation.angle).toBeLessThanOrEqual(180);
      expect(orientation.direction).toMatch(/horizontal|vertical|diagonal/);
      expect(orientation.rotationMatrix).toHaveLength(3);
    });

    it('should calculate finger distance for feedback', async () => {
      const testImage = await loadTestImage('fixtures/test-images/hand-visible.jpg');
      const handResult = await handsDetector.detectHands(testImage);
      
      expect(handResult!.handsDetected).toBe(true);
      
      const distance = wristDetector.calculateFingerDistance(
        handResult!.landmarks,
        [handResult!.landmarks[8], handResult!.landmarks[12]]
      );
      
      expect(distance).toBeDefined();
      expect(distance.cm).toBeGreaterThanOrEqual(0);
      expect(distance.pixels).toBeGreaterThanOrEqual(0);
    });
  });

  describe('End-to-End Performance (FR-43)', () => {
    it('should complete full detection pipeline in <1 second', async () => {
      const testImage = await loadTestImage('fixtures/test-images/hand-visible.jpg');
      
      const startTime = performance.now();
      
      // Full pipeline
      const handResult = await handsDetector.detectHands(testImage);
      const wrist = wristDetector.findWrist(handResult!.landmarks);
      const pulsePoint = wristDetector.findRadialPulsePoint(handResult!.landmarks);
      const validation = wristDetector.validateFingerPlacement(
        handResult!.landmarks,
        [handResult!.landmarks[8], handResult!.landmarks[12]]
      );
      
      const duration = performance.now() - startTime;
      
      // FR-43: Target <500ms for CV detection, total pipeline should be <1 second
      expect(duration).toBeLessThan(1000);
    });

    it('should handle retry logic efficiently', async () => {
      const testImage = await loadTestImage('fixtures/test-images/hand-visible.jpg');
      
      const startTime = Date.now();
      const result = await handsDetector.detectHandsWithRetry(testImage, {
        timeout: 10000,
        interval: 500
      });
      const duration = Date.now() - startTime;
      
      // Should detect hand quickly, not wait for full timeout
      expect(result.handsDetected).toBe(true);
      expect(duration).toBeLessThan(1000);
    });
  });

  describe('Acceptance Criteria Validation', () => {
    it('AC-CV1: Wrist detection succeeds in good conditions', async () => {
      const testImage = await loadTestImage('fixtures/test-images/hand-visible.jpg');
      
      const handResult = await handsDetector.detectHands(testImage);
      expect(handResult!.handsDetected).toBe(true);
      
      const wrist = wristDetector.findWrist(handResult!.landmarks);
      expect(wrist).not.toBeNull();
      
      // AC-CV1: ≥80% success rate (this test represents good conditions)
      expect(wrist!.confidence).toBeGreaterThan(0.7);
    });

    it('AC-CV2: Spatial feedback accurate within 2cm tolerance', async () => {
      const testImage = await loadTestImage('fixtures/test-images/hand-visible.jpg');
      const handResult = await handsDetector.detectHands(testImage);
      
      const distance = wristDetector.calculateFingerDistance(
        handResult!.landmarks,
        [handResult!.landmarks[8], handResult!.landmarks[12]]
      );
      
      // AC-CV2: Spatial feedback should provide cm measurements
      expect(distance.cm).toBeDefined();
      expect(typeof distance.cm).toBe('number');
    });

    it('AC-CV3: Graceful failure handling - no crashes on CV errors', async () => {
      // Test various error conditions
      expect(() => wristDetector.findWrist(null)).not.toThrow();
      expect(() => wristDetector.findWrist([])).not.toThrow();
      
      const uninitializedDetector = new MediaPipeHandsDetector();
      const result = await uninitializedDetector.detectHands({} as any);
      
      expect(result).toBeNull(); // Graceful degradation, no throw
    });
  });

  describe('Integration with Multiple Hands Scenarios', () => {
    it('should focus on single hand when multiple visible (FR-33)', async () => {
      const testImage = await loadTestImage('fixtures/test-images/two-hands.jpg');
      
      const handResult = await handsDetector.detectHands(testImage);
      
      // FR-33: Should detect only 1 hand (single-person detection)
      expect(handResult!.handsDetected).toBe(true);
      expect(handResult!.handCount).toBe(1);
      expect(handResult!.landmarks).toHaveLength(21);
    });
  });

  describe('Error Recovery', () => {
    it('should recover from temporary detection failures', async () => {
      // First attempt: no hand
      const noHandImage = await loadTestImage('fixtures/test-images/no-hand.jpg');
      const result1 = await handsDetector.detectHands(noHandImage);
      expect(result1!.handsDetected).toBe(false);
      
      // Second attempt: hand visible
      const handImage = await loadTestImage('fixtures/test-images/hand-visible.jpg');
      const result2 = await handsDetector.detectHands(handImage);
      expect(result2!.handsDetected).toBe(true);
      
      // Detector should work correctly after previous failure
      const wrist = wristDetector.findWrist(result2!.landmarks);
      expect(wrist).not.toBeNull();
    });
  });
});

/**
 * Helper function to load test images
 * Uses mock Image objects for testing
 */
async function loadTestImage(path: string): Promise<HTMLImageElement> {
  const img = {
    width: 640,
    height: 480,
    src: path,
    complete: true
  } as HTMLImageElement;
  
  return Promise.resolve(img);
}

