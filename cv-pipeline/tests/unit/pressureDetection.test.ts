/**
 * Pressure Detection Unit Tests
 * TDD: Tests written FIRST before implementation
 * 
 * Requirements tested:
 * - FR-34: Approximate pressure (via hand tension heuristics)
 * - FR-9: Excessive pressure feedback
 */

import { PressureDetector } from '../../src/pressureDetection';
import { HandLandmark } from '../../src/types/hands';

describe('PressureDetector', () => {
  let detector: PressureDetector;

  beforeEach(() => {
    detector = new PressureDetector();
  });

  describe('detectPressure()', () => {
    it('should detect optimal pressure for correct finger position', () => {
      const fingerLandmarks = createMockFingerLandmarks('optimal');
      const wristLandmarks = createMockWristLandmarks();
      
      const result = detector.detectPressure(fingerLandmarks, wristLandmarks);
      
      expect(result.level).toBe('optimal');
      expect(result.feedback).toContain('Good pressure');
      expect(result.pressureScore).toBeGreaterThan(0.30);
      expect(result.pressureScore).toBeLessThan(0.65);
    });

    it('should detect excessive pressure (FR-9)', () => {
      const fingerLandmarks = createMockFingerLandmarks('heavy');
      const wristLandmarks = createMockWristLandmarks();
      
      const result = detector.detectPressure(fingerLandmarks, wristLandmarks);
      
      expect(result.level).toBe('too_heavy');
      // FR-9: Exact feedback message
      expect(result.feedback).toBe("You're pressing too hard. Lighten your touch.");
      expect(result.pressureScore).toBeGreaterThan(0.70);
    });

    it('should detect too light pressure', () => {
      const fingerLandmarks = createMockFingerLandmarks('light');
      const wristLandmarks = createMockWristLandmarks();
      
      const result = detector.detectPressure(fingerLandmarks, wristLandmarks);
      
      expect(result.level).toBe('too_light');
      expect(result.feedback).toContain('Apply slightly more pressure');
      expect(result.pressureScore).toBeLessThan(0.25);
    });

    it('should provide confidence score with detection', () => {
      const fingerLandmarks = createMockFingerLandmarks('optimal');
      const wristLandmarks = createMockWristLandmarks();
      
      const result = detector.detectPressure(fingerLandmarks, wristLandmarks);
      
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });

    it('should provide pressure score (0.0-1.0)', () => {
      const fingerLandmarks = createMockFingerLandmarks('optimal');
      const wristLandmarks = createMockWristLandmarks();
      
      const result = detector.detectPressure(fingerLandmarks, wristLandmarks);
      
      expect(result.pressureScore).toBeGreaterThanOrEqual(0);
      expect(result.pressureScore).toBeLessThanOrEqual(1);
    });
  });

  describe('Pressure Level Classification', () => {
    it('should classify very light touch correctly', () => {
      const fingerLandmarks = createMockFingerLandmarks('light');
      const wristLandmarks = createMockWristLandmarks();
      
      const result = detector.detectPressure(fingerLandmarks, wristLandmarks);
      
      expect(result.level).toBe('too_light');
      expect(result.pressureScore).toBeLessThan(0.25);
    });

    it('should classify moderate pressure as optimal', () => {
      const fingerLandmarks = createMockFingerLandmarks('optimal');
      const wristLandmarks = createMockWristLandmarks();
      
      const result = detector.detectPressure(fingerLandmarks, wristLandmarks);
      
      expect(result.level).toBe('optimal');
      expect(result.pressureScore).toBeGreaterThanOrEqual(0.30);
      expect(result.pressureScore).toBeLessThanOrEqual(0.65);
    });

    it('should classify heavy pressure as excessive', () => {
      const fingerLandmarks = createMockFingerLandmarks('heavy');
      const wristLandmarks = createMockWristLandmarks();
      
      const result = detector.detectPressure(fingerLandmarks, wristLandmarks);
      
      expect(result.level).toBe('too_heavy');
      expect(result.pressureScore).toBeGreaterThan(0.70);
    });
  });

  describe('isPressureOptimal()', () => {
    it('should return true for optimal pressure', () => {
      const detection = {
        level: 'optimal' as const,
        confidence: 0.8,
        feedback: 'Good pressure',
        pressureScore: 0.45
      };
      
      expect(detector.isPressureOptimal(detection)).toBe(true);
    });

    it('should return false for non-optimal pressure', () => {
      const detection = {
        level: 'too_heavy' as const,
        confidence: 0.8,
        feedback: 'Too hard',
        pressureScore: 0.8
      };
      
      expect(detector.isPressureOptimal(detection)).toBe(false);
    });
  });

  describe('isPressureExcessive()', () => {
    it('should return true for excessive pressure (FR-9)', () => {
      const detection = {
        level: 'too_heavy' as const,
        confidence: 0.9,
        feedback: "You're pressing too hard. Lighten your touch.",
        pressureScore: 0.85
      };
      
      expect(detector.isPressureExcessive(detection)).toBe(true);
    });

    it('should return false for normal pressure', () => {
      const detection = {
        level: 'optimal' as const,
        confidence: 0.8,
        feedback: 'Good pressure',
        pressureScore: 0.45
      };
      
      expect(detector.isPressureExcessive(detection)).toBe(false);
    });
  });

  describe('Heuristics (FR-34)', () => {
    it('should use finger curvature as pressure indicator', () => {
      // More bent fingers = more pressure
      const bentFingers = createMockFingerLandmarks('heavy');
      const straightFingers = createMockFingerLandmarks('light');
      const wristLandmarks = createMockWristLandmarks();
      
      const bentResult = detector.detectPressure(bentFingers, wristLandmarks);
      const straightResult = detector.detectPressure(straightFingers, wristLandmarks);
      
      expect(bentResult.pressureScore).toBeGreaterThan(straightResult.pressureScore);
    });

    it('should handle edge case of missing visibility data', () => {
      const fingerLandmarks = createMockFingerLandmarks('optimal');
      // Remove visibility property
      fingerLandmarks.forEach(lm => delete lm.visibility);
      const wristLandmarks = createMockWristLandmarks();
      
      const result = detector.detectPressure(fingerLandmarks, wristLandmarks);
      
      // Should still work, defaulting to 1.0 visibility
      expect(result).toBeDefined();
      expect(result.level).toBeDefined();
    });
  });

  describe('Feedback Messages (FR-9)', () => {
    it('should provide specific feedback for excessive pressure', () => {
      const fingerLandmarks = createMockFingerLandmarks('heavy');
      const wristLandmarks = createMockWristLandmarks();
      
      const result = detector.detectPressure(fingerLandmarks, wristLandmarks);
      
      // FR-9: Exact message required
      expect(result.feedback).toBe("You're pressing too hard. Lighten your touch.");
    });

    it('should provide specific feedback for optimal pressure', () => {
      const fingerLandmarks = createMockFingerLandmarks('optimal');
      const wristLandmarks = createMockWristLandmarks();
      
      const result = detector.detectPressure(fingerLandmarks, wristLandmarks);
      
      expect(result.feedback).toContain('Good pressure');
    });

    it('should provide specific feedback for light pressure', () => {
      const fingerLandmarks = createMockFingerLandmarks('light');
      const wristLandmarks = createMockWristLandmarks();
      
      const result = detector.detectPressure(fingerLandmarks, wristLandmarks);
      
      expect(result.feedback).toContain('Apply slightly more pressure');
    });
  });
});

/**
 * Create mock finger landmarks for pressure testing
 * Simulates different pressure levels based on finger curvature and depth
 */
function createMockFingerLandmarks(pressureLevel: 'light' | 'optimal' | 'heavy'): HandLandmark[] {
  const landmarks: HandLandmark[] = Array(21).fill(null).map(() => ({
    x: 0.5,
    y: 0.5,
    z: 0,
    visibility: 0.9
  }));
  
  // Configure finger landmarks based on pressure level
  // Landmark indices: 5-8 (index), 9-12 (middle)
  let curvatureFactor: number;
  let visibility: number;
  let zVariance: number;
  
  switch (pressureLevel) {
    case 'light':
      curvatureFactor = 0.02;  // Very straight fingers
      visibility = 0.98; // Very high visibility
      zVariance = 0.15; // High z variance (not compressed)
      break;
    case 'optimal':
      curvatureFactor = 0.45;  // Moderate bend
      visibility = 0.78; // Moderate visibility
      zVariance = 0.025; // Moderate z variance
      break;
    case 'heavy':
      curvatureFactor = 1.5;  // Extremely bent fingers (closed fist pressing hard)
      visibility = 0.30; // Very low visibility (heavily occluded)
      zVariance = 0.001; // Minimal z variance (completely compressed/flat)
      break;
  }
  
  // Index finger landmarks (5-8: MCP, PIP, DIP, TIP)
  // Extended fingers: fingertips FAR from MCP (low y values)
  // Curled fingers: fingertips CLOSE to MCP (y values near MCP)
  const mcpY = 0.6;
  const extendedTipY = 0.35;  // Fingertip when extended (far from MCP)
  
  landmarks[5] = { x: 0.5, y: mcpY, z: 0, visibility: 0.9 }; // MCP
  landmarks[6] = { x: 0.5, y: mcpY - (1 - curvatureFactor) * 0.05, z: zVariance * 2, visibility: 0.9 }; // PIP
  landmarks[7] = { x: 0.5, y: mcpY - (1 - curvatureFactor) * 0.15, z: zVariance * 3, visibility: 0.9 }; // DIP
  landmarks[8] = { x: 0.5, y: mcpY - (1 - curvatureFactor) * (mcpY - extendedTipY), z: zVariance * 4, visibility }; // TIP
  
  // Middle finger landmarks (9-12: MCP, PIP, DIP, TIP)
  landmarks[9] = { x: 0.52, y: mcpY, z: 0, visibility: 0.9 }; // MCP
  landmarks[10] = { x: 0.52, y: mcpY - (1 - curvatureFactor) * 0.05, z: zVariance * 2, visibility: 0.9 }; // PIP
  landmarks[11] = { x: 0.52, y: mcpY - (1 - curvatureFactor) * 0.15, z: zVariance * 3, visibility: 0.9 }; // DIP
  landmarks[12] = { x: 0.52, y: mcpY - (1 - curvatureFactor) * (mcpY - extendedTipY), z: zVariance * 4, visibility }; // TIP
  
  return landmarks;
}

/**
 * Create mock wrist landmarks
 */
function createMockWristLandmarks(): HandLandmark[] {
  const landmarks: HandLandmark[] = [];
  
  // Wrist landmark
  landmarks.push({ x: 0.5, y: 0.5, z: 0, visibility: 0.95 });
  
  // Add remaining landmarks (simplified)
  for (let i = 1; i < 21; i++) {
    landmarks.push({
      x: 0.5 + (i * 0.01),
      y: 0.5 + (i * 0.01),
      z: 0,
      visibility: 0.9
    });
  }
  
  return landmarks;
}

