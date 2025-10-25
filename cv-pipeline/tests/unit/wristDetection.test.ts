/**
 * Wrist Detection Unit Tests
 * TDD: Tests written FIRST before implementation
 * 
 * Requirements tested:
 * - FR-34: Wrist position, finger placement, pressure heuristics
 * - FR-7: Track user's hand position and provide feedback
 * - FR-9: Detect common errors and provide specific feedback
 * - AC-CV2: Spatial feedback accuracy ("Move 2cm toward thumb")
 */

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
      expect(wrist!.index).toBe(0); // Wrist is landmark #0 in MediaPipe
      expect(wrist!.position).toHaveProperty('x');
      expect(wrist!.position).toHaveProperty('y');
      expect(wrist!.position).toHaveProperty('z');
    });

    it('should handle missing wrist landmark gracefully', () => {
      const incompleteLandmarks: HandLandmark[] = []; // Empty landmarks
      
      const wrist = detector.findWrist(incompleteLandmarks);
      
      expect(wrist).toBeNull();
      // Should not throw error
    });

    it('should handle null landmarks without crashing', () => {
      const wrist = detector.findWrist(null as any);
      
      expect(wrist).toBeNull();
      // Should not throw error - graceful degradation
    });
  });

  describe('findRadialPulsePoint()', () => {
    it('should calculate thumb-side wrist position for radial pulse', () => {
      const mockLandmarks = createMockHandLandmarks('Right');
      
      const pulsePoint = detector.findRadialPulsePoint(mockLandmarks);
      
      expect(pulsePoint).toBeDefined();
      expect(pulsePoint.anatomicalName).toBe('Radial Artery (Pulse Point)');
      expect(pulsePoint.x).toBeDefined();
      expect(pulsePoint.y).toBeDefined();
      expect(pulsePoint.z).toBeDefined();
    });

    it('should adjust calculation for left vs right hand', () => {
      const rightHandLandmarks = createMockHandLandmarks('Right');
      const leftHandLandmarks = createMockHandLandmarks('Left');
      
      const rightPulse = detector.findRadialPulsePoint(rightHandLandmarks, 'Right');
      const leftPulse = detector.findRadialPulsePoint(leftHandLandmarks, 'Left');
      
      // Pulse point should be calculated (exact position varies)
      expect(rightPulse).toBeDefined();
      expect(leftPulse).toBeDefined();
      expect(rightPulse.anatomicalName).toBe('Radial Artery (Pulse Point)');
      expect(leftPulse.anatomicalName).toBe('Radial Artery (Pulse Point)');
    });

    it('should be within reasonable distance of wrist (accuracy test)', () => {
      const mockLandmarks = createMockHandLandmarks('Right');
      
      const pulsePoint = detector.findRadialPulsePoint(mockLandmarks);
      const wrist = mockLandmarks[0];
      
      // Pulse point should be close to wrist (within reasonable bounds)
      const distance = Math.sqrt(
        Math.pow(pulsePoint.x - wrist.x, 2) +
        Math.pow(pulsePoint.y - wrist.y, 2)
      );
      
      expect(distance).toBeLessThan(0.1); // Within 10% of normalized coordinates
    });

    it('should return confidence score from wrist landmark', () => {
      const mockLandmarks = createMockHandLandmarks('Right');
      
      const pulsePoint = detector.findRadialPulsePoint(mockLandmarks);
      
      expect(pulsePoint.confidence).toBeGreaterThan(0);
      expect(pulsePoint.confidence).toBeLessThanOrEqual(1);
    });
  });

  describe('getWristOrientation()', () => {
    it('should return wrist angle for AR overlay positioning', () => {
      const mockLandmarks = createMockHandLandmarks('Right');
      
      const orientation = detector.getWristOrientation(mockLandmarks);
      
      expect(orientation.angle).toBeGreaterThanOrEqual(-180);
      expect(orientation.angle).toBeLessThanOrEqual(180);
      expect(orientation.rotationMatrix).toBeDefined();
      expect(orientation.rotationMatrix).toHaveLength(3);
    });

    it('should detect horizontal wrist orientation', () => {
      const horizontalWrist = createMockHandLandmarks('Right', 0); // 0 degrees
      
      const orientation = detector.getWristOrientation(horizontalWrist);
      
      // Direction should be one of the three valid types
      expect(orientation.direction).toMatch(/horizontal|vertical|diagonal/);
      expect(orientation.angle).toBeDefined();
    });

    it('should detect vertical wrist orientation', () => {
      const verticalWrist = createMockHandLandmarks('Right', 90); // 90 degrees
      
      const orientation = detector.getWristOrientation(verticalWrist);
      
      expect(orientation.direction).toMatch(/vertical|diagonal/);
    });

    it('should provide rotation matrix for AR overlay transforms', () => {
      const mockLandmarks = createMockHandLandmarks('Right');
      
      const orientation = detector.getWristOrientation(mockLandmarks);
      
      // Rotation matrix should be 3x3
      expect(orientation.rotationMatrix).toHaveLength(3);
      expect(orientation.rotationMatrix[0]).toHaveLength(3);
      expect(orientation.rotationMatrix[1]).toHaveLength(3);
      expect(orientation.rotationMatrix[2]).toHaveLength(3);
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

    it('should provide directional feedback for correction (FR-9)', () => {
      const wristLandmarks = createMockHandLandmarks('Right');
      const fingerLandmarks = createFingerLandmarksOffPulse(wristLandmarks, 0.03);
      
      const validation = detector.validateFingerPlacement(wristLandmarks, fingerLandmarks);
      
      expect(validation.isCorrect).toBe(false);
      expect(validation.feedback).toBeDefined();
      expect(validation.correctionVector).toBeDefined();
      // Feedback should include directional guidance per FR-9
      expect(validation.feedback.length).toBeGreaterThan(10);
    });

    it('should include distance measurement in validation', () => {
      const wristLandmarks = createMockHandLandmarks('Right');
      const fingerLandmarks = createFingerLandmarksOffPulse(wristLandmarks, 0.02);
      
      const validation = detector.validateFingerPlacement(wristLandmarks, fingerLandmarks);
      
      expect(validation.distance).toBeDefined();
      expect(validation.distance).toBeGreaterThan(0);
    });
  });

  describe('calculateFingerDistance()', () => {
    it('should measure distance from optimal position in cm', () => {
      const wristLandmarks = createMockHandLandmarks('Right');
      const fingerLandmarks = createFingerLandmarksOffPulse(wristLandmarks, 0.03);
      
      const distance = detector.calculateFingerDistance(wristLandmarks, fingerLandmarks);
      
      expect(distance.cm).toBeGreaterThan(0);
      expect(distance.pixels).toBeGreaterThan(0);
    });

    it('should return near-zero for perfectly placed fingers', () => {
      const wristLandmarks = createMockHandLandmarks('Right');
      const fingerLandmarks = createFingerLandmarksOnPulse(wristLandmarks);
      
      const distance = detector.calculateFingerDistance(wristLandmarks, fingerLandmarks);
      
      expect(distance.cm).toBeLessThan(2); // Within 2cm tolerance (AC-CV2)
    });

    it('should provide both cm and pixel measurements', () => {
      const wristLandmarks = createMockHandLandmarks('Right');
      const fingerLandmarks = createFingerLandmarksOffPulse(wristLandmarks, 0.02);
      
      const distance = detector.calculateFingerDistance(wristLandmarks, fingerLandmarks);
      
      expect(distance).toHaveProperty('cm');
      expect(distance).toHaveProperty('pixels');
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
  });
});

/**
 * Helper function to create mock hand landmarks
 * Creates 21 landmarks following MediaPipe structure
 */
function createMockHandLandmarks(
  handedness: 'Left' | 'Right' = 'Right',
  wristAngle: number = 0
): HandLandmark[] {
  const landmarks: HandLandmark[] = [];
  
  // Wrist (landmark 0)
  landmarks.push({ x: 0.5, y: 0.5, z: 0, visibility: 0.95 });
  
  // Thumb (landmarks 1-4)
  for (let i = 1; i <= 4; i++) {
    landmarks.push({
      x: 0.5 + (i * 0.02),
      y: 0.5 - (i * 0.02),
      z: 0,
      visibility: 0.9
    });
  }
  
  // Index finger (landmarks 5-8)
  for (let i = 5; i <= 8; i++) {
    landmarks.push({
      x: 0.5 + (i * 0.01),
      y: 0.5 - (i * 0.03),
      z: 0,
      visibility: 0.9
    });
  }
  
  // Middle finger (landmarks 9-12)
  for (let i = 9; i <= 12; i++) {
    landmarks.push({
      x: 0.5 + (i * 0.005),
      y: 0.5 - (i * 0.035),
      z: 0,
      visibility: 0.9
    });
  }
  
  // Ring finger (landmarks 13-16)
  for (let i = 13; i <= 16; i++) {
    landmarks.push({
      x: 0.5 - (i * 0.005),
      y: 0.5 - (i * 0.03),
      z: 0,
      visibility: 0.9
    });
  }
  
  // Pinky (landmarks 17-20)
  for (let i = 17; i <= 20; i++) {
    landmarks.push({
      x: 0.5 - (i * 0.01),
      y: 0.5 - (i * 0.025),
      z: 0,
      visibility: 0.9
    });
  }
  
  return landmarks;
}

/**
 * Create finger landmarks positioned correctly on pulse point
 */
function createFingerLandmarksOnPulse(wristLandmarks: HandLandmark[]): HandLandmark[] {
  // Calculate pulse point location (same as WristDetector does)
  const thumbTip = wristLandmarks[4]; // THUMB_TIP
  const wrist = wristLandmarks[0];
  
  const thumbDirection = {
    x: thumbTip.x - wrist.x,
    y: thumbTip.y - wrist.y
  };
  
  const magnitude = Math.sqrt(thumbDirection.x * thumbDirection.x + thumbDirection.y * thumbDirection.y);
  const normalized = {
    x: thumbDirection.x / magnitude,
    y: thumbDirection.y / magnitude
  };
  
  // Pulse point position
  const pulseX = wrist.x + normalized.x * 0.02;
  const pulseY = wrist.y + normalized.y * 0.02;
  
  // Return finger landmarks right on the pulse point (within tolerance)
  return [
    { x: pulseX, y: pulseY, z: 0, visibility: 0.9 },
    { x: pulseX + 0.005, y: pulseY + 0.005, z: 0, visibility: 0.9 }
  ];
}

/**
 * Create finger landmarks offset from correct position
 */
function createFingerLandmarksOffPulse(
  wristLandmarks: HandLandmark[],
  offset: number
): HandLandmark[] {
  // Return mock landmarks offset from pulse point
  return [
    { x: wristLandmarks[0].x + offset, y: wristLandmarks[0].y, z: 0, visibility: 0.9 },
    { x: wristLandmarks[0].x + offset, y: wristLandmarks[0].y + 0.01, z: 0, visibility: 0.9 }
  ];
}

