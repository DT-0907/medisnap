/**
 * MediaPipe Hands Type Definitions
 * Based on MediaPipe Hands v0.9+ landmark structure
 */

/**
 * Hand landmark from MediaPipe Hands (21 landmarks per hand)
 * Landmark indices:
 * 0 = WRIST
 * 1-4 = THUMB (CMC, MCP, IP, TIP)
 * 5-8 = INDEX FINGER (MCP, PIP, DIP, TIP)
 * 9-12 = MIDDLE FINGER (MCP, PIP, DIP, TIP)
 * 13-16 = RING FINGER (MCP, PIP, DIP, TIP)
 * 17-20 = PINKY (MCP, PIP, DIP, TIP)
 */
export interface HandLandmark {
  /** Normalized x coordinate (0.0 - 1.0) */
  x: number;
  
  /** Normalized y coordinate (0.0 - 1.0) */
  y: number;
  
  /** Depth value (relative to wrist) */
  z: number;
  
  /** Detection confidence/visibility score (0.0 - 1.0) */
  visibility?: number;
}

/**
 * MediaPipe Hands landmark indices enumeration
 */
export enum LandmarkIndex {
  WRIST = 0,
  THUMB_CMC = 1,
  THUMB_MCP = 2,
  THUMB_IP = 3,
  THUMB_TIP = 4,
  INDEX_FINGER_MCP = 5,
  INDEX_FINGER_PIP = 6,
  INDEX_FINGER_DIP = 7,
  INDEX_FINGER_TIP = 8,
  MIDDLE_FINGER_MCP = 9,
  MIDDLE_FINGER_PIP = 10,
  MIDDLE_FINGER_DIP = 11,
  MIDDLE_FINGER_TIP = 12,
  RING_FINGER_MCP = 13,
  RING_FINGER_PIP = 14,
  RING_FINGER_DIP = 15,
  RING_FINGER_TIP = 16,
  PINKY_MCP = 17,
  PINKY_PIP = 18,
  PINKY_DIP = 19,
  PINKY_TIP = 20
}

/**
 * Handedness classification
 */
export type Handedness = 'Left' | 'Right';

/**
 * Hand detection category with confidence
 */
export interface HandCategory {
  categoryName: Handedness;
  score: number;
  displayName: Handedness;
}

