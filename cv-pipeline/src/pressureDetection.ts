/**
 * Pressure Detection via Hand Tension Heuristics
 * 
 * Requirements implemented:
 * - FR-34: Approximate pressure (via hand tension heuristics)
 * - FR-9: Excessive pressure feedback
 * 
 * Pressure is estimated by analyzing:
 * 1. Finger joint angles (more bent = more pressure)
 * 2. Hand landmark visibility/confidence (lower = occluded by pressure)
 * 3. Z-depth changes in finger landmarks (flattened = more pressure)
 */

import { HandLandmark } from './types/hands';

/**
 * Pressure level classification
 */
export type PressureLevel = 'too_light' | 'optimal' | 'too_heavy';

/**
 * Pressure detection result
 */
export interface PressureDetection {
  /** Pressure level classification */
  level: PressureLevel;
  
  /** Confidence in pressure detection (0.0-1.0) */
  confidence: number;
  
  /** Feedback message for user (FR-9) */
  feedback: string;
  
  /** Estimated pressure score (0.0 = no contact, 1.0 = maximum pressure) */
  pressureScore: number;
}

/**
 * Landmark indices for pressure analysis
 */
const FINGER_LANDMARKS = {
  INDEX_TIP: 8,
  INDEX_DIP: 7,
  INDEX_PIP: 6,
  INDEX_MCP: 5,
  MIDDLE_TIP: 12,
  MIDDLE_DIP: 11,
  MIDDLE_PIP: 10,
  MIDDLE_MCP: 9
};

/**
 * Pressure Detector class
 * Estimates pressure using hand tension heuristics
 */
export class PressureDetector {
  private readonly OPTIMAL_PRESSURE_MIN = 0.30;
  private readonly OPTIMAL_PRESSURE_MAX = 0.65;
  private readonly EXCESSIVE_PRESSURE_THRESHOLD = 0.70;
  private readonly TOO_LIGHT_THRESHOLD = 0.25;

  /**
   * Detect pressure level from hand landmarks
   * Uses heuristics: finger curvature, landmark visibility, depth changes
   * 
   * FR-34: Approximate pressure (via hand tension heuristics)
   * FR-9: Provide excessive pressure feedback
   */
  detectPressure(
    fingerLandmarks: HandLandmark[],
    wristLandmarks: HandLandmark[]
  ): PressureDetection {
    // Calculate multiple pressure indicators
    const fingerCurvature = this.calculateFingerCurvature(fingerLandmarks);
    const visibilityScore = this.calculateVisibilityScore(fingerLandmarks);
    const depthCompression = this.calculateDepthCompression(fingerLandmarks);
    
    // Combine heuristics to estimate pressure
    // Higher curvature + lower visibility + compressed depth = more pressure
    // Weight curvature more heavily as it's the most direct indicator
    const pressureScore = (
      fingerCurvature * 0.5 +
      (1 - visibilityScore) * 0.25 +
      depthCompression * 0.25
    );
    
    // Classify pressure level
    let level: PressureLevel;
    let feedback: string;
    let confidence: number;
    
    if (pressureScore < this.TOO_LIGHT_THRESHOLD) {
      level = 'too_light';
      feedback = 'Apply slightly more pressure to feel the pulse clearly.';
      confidence = 1 - (pressureScore / this.TOO_LIGHT_THRESHOLD);
    } else if (pressureScore > this.EXCESSIVE_PRESSURE_THRESHOLD) {
      // FR-9: Excessive pressure feedback
      level = 'too_heavy';
      feedback = "You're pressing too hard. Lighten your touch.";
      confidence = (pressureScore - this.EXCESSIVE_PRESSURE_THRESHOLD) / (1 - this.EXCESSIVE_PRESSURE_THRESHOLD);
    } else {
      level = 'optimal';
      feedback = 'Good pressure. Apply gentle, steady pressure.';
      confidence = 1 - Math.abs(pressureScore - 0.45) / 0.3;
    }
    
    return {
      level,
      confidence: Math.max(0, Math.min(1, confidence)),
      feedback,
      pressureScore
    };
  }

  /**
   * Calculate finger curvature as pressure indicator
   * More bent fingers indicate more pressure applied
   * Uses fingertip-to-MCP distance: shorter = more curled
   */
  private calculateFingerCurvature(landmarks: HandLandmark[]): number {
    // Calculate distance from fingertip to MCP (knuckle) for index and middle fingers
    // Shorter distance = more curled = more pressure
    const indexDistance = this.calculateDistance(
      landmarks[FINGER_LANDMARKS.INDEX_MCP],
      landmarks[FINGER_LANDMARKS.INDEX_TIP]
    );
    
    const middleDistance = this.calculateDistance(
      landmarks[FINGER_LANDMARKS.MIDDLE_MCP],
      landmarks[FINGER_LANDMARKS.MIDDLE_TIP]
    );
    
    // Average distance, then normalize and invert
    // Typical extended finger: ~0.25 distance units (low curvature/low pressure)
    // Typical curled finger pressing: ~0.05 distance units (high curvature/high pressure)
    const avgDistance = (indexDistance + middleDistance) / 2;
    // Invert: shorter distance = more curled = more pressure
    const curvature = Math.max(0, Math.min(1, 1 - (avgDistance / 0.30)));
    
    return curvature;
  }
  
  /**
   * Calculate 2D Euclidean distance between two landmarks
   */
  private calculateDistance(point1: HandLandmark, point2: HandLandmark): number {
    const dx = point1.x - point2.x;
    const dy = point1.y - point2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Calculate joint angle from three landmarks
   * Returns curvature score (0 = straight, 1 = 90+ degrees bend)
   */
  private calculateJointAngle(
    proximal: HandLandmark,
    joint: HandLandmark,
    distal: HandLandmark
  ): number {
    // Calculate vectors
    const v1 = {
      x: proximal.x - joint.x,
      y: proximal.y - joint.y
    };
    
    const v2 = {
      x: distal.x - joint.x,
      y: distal.y - joint.y
    };
    
    // Calculate angle using dot product
    const dotProduct = v1.x * v2.x + v1.y * v2.y;
    const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
    const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
    
    if (mag1 === 0 || mag2 === 0) return 0;
    
    const cosAngle = dotProduct / (mag1 * mag2);
    const angle = Math.acos(Math.max(-1, Math.min(1, cosAngle))) * (180 / Math.PI);
    
    // Normalize to 0-1 (0 = straight/180°, 1 = bent/90°)
    return 1 - (angle / 180);
  }

  /**
   * Calculate average visibility score
   * Lower visibility may indicate occlusion from pressing down
   */
  private calculateVisibilityScore(landmarks: HandLandmark[]): number {
    const fingertips = [
      landmarks[FINGER_LANDMARKS.INDEX_TIP],
      landmarks[FINGER_LANDMARKS.MIDDLE_TIP]
    ];
    
    const avgVisibility = fingertips.reduce((sum, lm) => 
      sum + (lm.visibility || 1.0), 0
    ) / fingertips.length;
    
    return avgVisibility;
  }

  /**
   * Calculate depth compression
   * Compressed/flattened hand (similar z-values) indicates pressure
   */
  private calculateDepthCompression(landmarks: HandLandmark[]): number {
    const fingerZ = [
      landmarks[FINGER_LANDMARKS.INDEX_TIP].z,
      landmarks[FINGER_LANDMARKS.INDEX_DIP].z,
      landmarks[FINGER_LANDMARKS.MIDDLE_TIP].z,
      landmarks[FINGER_LANDMARKS.MIDDLE_DIP].z
    ];
    
    // Calculate z-value variance (low variance = compressed/flat)
    const avgZ = fingerZ.reduce((sum, z) => sum + z, 0) / fingerZ.length;
    const variance = fingerZ.reduce((sum, z) => 
      sum + Math.pow(z - avgZ, 2), 0
    ) / fingerZ.length;
    
    // Normalize variance to compression score
    // Lower variance = more compression = higher score
    const compressionScore = Math.max(0, 1 - (variance * 100));
    
    return compressionScore;
  }

  /**
   * Check if pressure is within optimal range
   */
  isPressureOptimal(detection: PressureDetection): boolean {
    return detection.level === 'optimal';
  }

  /**
   * Check if pressure is excessive (FR-9)
   */
  isPressureExcessive(detection: PressureDetection): boolean {
    return detection.level === 'too_heavy';
  }
}

