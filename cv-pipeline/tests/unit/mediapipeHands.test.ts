/**
 * MediaPipe Hands Detector Unit Tests
 * TDD: Tests written FIRST before implementation
 * 
 * Requirements tested:
 * - FR-32: MediaPipe Hands v0.9+ configuration
 * - FR-33: Single-hand detection (max 1 hand tracked)
 * - FR-36: Graceful degradation on CV failure
 * - FR-10a: 10-second retry timeout with skip option
 * - FR-43: CV detection latency <500ms
 */

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
      
      expect(result).not.toBeNull();
      expect(result!.handsDetected).toBe(true);
      expect(result!.landmarks).toHaveLength(21); // MediaPipe returns 21 landmarks
      expect(result!.landmarks[0]).toHaveProperty('x');
      expect(result!.landmarks[0]).toHaveProperty('y');
      expect(result!.landmarks[0]).toHaveProperty('z');
    });

    it('should return empty result for image with no hands', async () => {
      const testImage = await loadTestImage('fixtures/test-images/no-hand.jpg');
      
      const result = await detector.detectHands(testImage);
      
      expect(result).not.toBeNull();
      expect(result!.handsDetected).toBe(false);
      expect(result!.landmarks).toHaveLength(0);
    });

    it('should focus on single closest hand when multiple visible (FR-33)', async () => {
      const testImage = await loadTestImage('fixtures/test-images/two-hands.jpg');
      
      const result = await detector.detectHands(testImage);
      
      expect(result).not.toBeNull();
      expect(result!.handsDetected).toBe(true);
      expect(result!.landmarks).toHaveLength(21); // Only one hand
      expect(result!.handCount).toBe(1);
    });

    it('should return handedness (Left or Right)', async () => {
      const testImage = await loadTestImage('fixtures/test-images/right-hand.jpg');
      
      const result = await detector.detectHands(testImage);
      
      expect(result).not.toBeNull();
      expect(result!.handedness).toMatch(/^(Left|Right)$/);
    });

    it('should detect hands with confidence above threshold', async () => {
      const testImage = await loadTestImage('fixtures/test-images/hand-visible.jpg');
      
      const result = await detector.detectHands(testImage);
      
      expect(result).not.toBeNull();
      expect(result!.confidence).toBeGreaterThanOrEqual(0.7);
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
      const badDetector = new MediaPipeHandsDetector({ modelPath: '/invalid' });
      
      // Should throw on initialization (expected behavior)
      await expect(badDetector.initialize()).rejects.toThrow();
      expect(badDetector.isInitialized()).toBe(false);
    });

    it('should return null result on detection error without crashing', async () => {
      const uninitializedDetector = new MediaPipeHandsDetector();
      // Don't initialize model
      
      const result = await uninitializedDetector.detectHands(null as any);
      
      expect(result).toBeNull();
      // Should not throw error - graceful degradation
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
    }, 15000); // Increase test timeout to 15 seconds

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
    }, 15000); // Increase test timeout
  });
});

/**
 * Helper function to load test images
 * TODO: Implement actual image loading from fixtures/test-images/
 * For now, returns mock Image objects for testing
 */
async function loadTestImage(path: string): Promise<HTMLImageElement> {
  // Mock implementation for unit testing
  // In actual implementation, this would load real images from data/test/images/
  const img = {
    width: 640,
    height: 480,
    src: path,
    complete: true
  } as HTMLImageElement;
  
  return Promise.resolve(img);
}

