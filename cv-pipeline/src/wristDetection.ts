/**
 * Wrist Detection Implementation
 * 
 * Requirements implemented:
 * - FR-34: Wrist position, finger placement, pressure heuristics
 * - FR-7: Track user's hand position and provide feedback
 * - FR-9: Detect common errors and provide specific feedback
 * - AC-CV2: Spatial feedback accuracy (±2cm tolerance)
 */

import { HandLandmark } from './types/hands';
import type {
  WristPosition,
  PulsePoint,
  WristOrientation,
  FingerPlacementValidation,
  Distance
} from './types/detection';

/**
 * MediaPipe Hands landmark indices
 * Based on MediaPipe Hands v0.9+ landmark structure
 */
const LANDMARK_INDICES = {
  WRIST: 0,
  THUMB_CMC: 1,
  THUMB_MCP: 2,
  THUMB_IP: 3,
  THUMB_TIP: 4,
  INDEX_FINGER_MCP: 5,
  INDEX_FINGER_PIP: 6,
  INDEX_FINGER_DIP: 7,
  INDEX_FINGER_TIP: 8,
  MIDDLE_FINGER_MCP: 9,
  MIDDLE_FINGER_PIP: 10,
  MIDDLE_FINGER_DIP: 11,
  MIDDLE_FINGER_TIP: 12,
  RING_FINGER_MCP: 13,
  RING_FINGER_PIP: 14,
  RING_FINGER_DIP: 15,
  RING_FINGER_TIP: 16,
  PINKY_MCP: 17,
  PINKY_PIP: 18,
  PINKY_DIP: 19,
  PINKY_TIP: 20
};

/**
 * Wrist Detector class
 * Provides wrist position detection, pulse point calculation, and finger placement validation
 */
export class WristDetector {
  private readonly PULSE_POINT_OFFSET = 0.02; // Normalized coordinates (~2cm)
  private readonly PLACEMENT_TOLERANCE = 0.015; // Acceptable distance for "correct" placement (AC-CV2)

  /**
   * Find wrist landmark from hand landmarks array
   * FR-34: Wrist position detection
   */
  findWrist(landmarks: HandLandmark[] | null): WristPosition | null {
    // Graceful degradation
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
   * AC-CV2: Within 2cm accuracy
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
    
    // Normalize direction vector
    const magnitude = Math.sqrt(
      thumbDirection.x * thumbDirection.x + 
      thumbDirection.y * thumbDirection.y
    );
    
    const normalizedDirection = {
      x: thumbDirection.x / magnitude,
      y: thumbDirection.y / magnitude
    };

    // Pulse point is slightly toward thumb from wrist (radial side)
    const pulsePoint: PulsePoint = {
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
    const middleFingerMCP = landmarks[LANDMARK_INDICES.MIDDLE_FINGER_MCP]; // Middle finger base knuckle

    // Calculate angle from wrist to middle finger
    const dx = middleFingerMCP.x - wrist.x;
    const dy = middleFingerMCP.y - wrist.y;
    
    let angle = Math.atan2(dy, dx) * (180 / Math.PI);
    
    // Normalize to -180 to 180
    if (angle > 180) angle -= 360;
    if (angle < -180) angle += 360;

    // Determine direction classification
    let direction: 'horizontal' | 'vertical' | 'diagonal';
    const absAngle = Math.abs(angle);
    
    if (absAngle < 30 || absAngle > 150) {
      direction = 'horizontal';
    } else if (absAngle > 60 && absAngle < 120) {
      direction = 'vertical';
    } else {
      direction = 'diagonal';
    }

    // Create rotation matrix for AR overlay transforms
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
   * FR-9: Detect common errors and provide specific feedback
   * AC-CV2: Spatial feedback accuracy
   */
  validateFingerPlacement(
    wristLandmarks: HandLandmark[],
    fingerLandmarks: HandLandmark[]
  ): FingerPlacementValidation {
    const pulsePoint = this.findRadialPulsePoint(wristLandmarks);
    
    // Check index and middle finger positions
    // Assuming fingerLandmarks contains the finger tip positions
    const avgFingerPos = {
      x: fingerLandmarks.reduce((sum, lm) => sum + lm.x, 0) / fingerLandmarks.length,
      y: fingerLandmarks.reduce((sum, lm) => sum + lm.y, 0) / fingerLandmarks.length,
      z: fingerLandmarks.reduce((sum, lm) => sum + lm.z, 0) / fingerLandmarks.length
    };

    // Calculate distance from pulse point
    const distance = Math.sqrt(
      Math.pow(avgFingerPos.x - pulsePoint.x, 2) +
      Math.pow(avgFingerPos.y - pulsePoint.y, 2)
    );

    // Check if within tolerance (AC-CV2: ±2cm = 0.015 in normalized coordinates)
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

    // Generate directional feedback (FR-9)
    const distanceCm = distance * 100; // Approximate conversion to cm
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

    // FR-9: Specific feedback message
    const feedback = direction
      ? `Adjust your hand. Move ${Math.round(distanceCm)} centimeters ${direction}.`
      : `Adjust your hand. Move ${Math.round(distanceCm)} centimeters.`;

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
   * AC-CV2: Distance measurements in cm
   */
  calculateFingerDistance(
    wristLandmarks: HandLandmark[],
    fingerLandmarks: HandLandmark[]
  ): Distance {
    const validation = this.validateFingerPlacement(wristLandmarks, fingerLandmarks);
    
    // Convert normalized distance to cm (approximate)
    // Normalized coordinates are 0-1, assuming hand width ~10cm, this is a rough approximation
    const cm = validation.distance * 100;
    
    // Convert to pixels (based on 640x480 input resolution from FR-32)
    const pixels = validation.distance * 640;

    return { cm, pixels };
  }
}

