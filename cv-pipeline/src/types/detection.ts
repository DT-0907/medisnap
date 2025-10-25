/**
 * Detection Result Type Definitions
 * Common interfaces for CV pipeline outputs
 */

import { HandLandmark, Handedness } from './hands';

/**
 * Result from hand detection operation
 */
export interface DetectionResult {
  /** Whether hands were successfully detected */
  handsDetected: boolean;
  
  /** Array of 21 hand landmarks (or empty if no hands detected) */
  landmarks: HandLandmark[];
  
  /** Left or Right hand classification */
  handedness?: Handedness;
  
  /** Detection confidence score (0.0 - 1.0) */
  confidence: number;
  
  /** Number of hands detected (always 1 or 0 per FR-33) */
  handCount: number;
  
  /** Timestamp of detection */
  timestamp: number;
  
  /** Skip option offered after retry timeout (FR-10a) */
  skipOffered?: boolean;
}

/**
 * Wrist position information
 */
export interface WristPosition {
  /** Landmark index (always 0 for wrist) */
  index: number;
  
  /** 3D position coordinates */
  position: {
    x: number;
    y: number;
    z: number;
  };
  
  /** Detection confidence */
  confidence: number;
}

/**
 * Radial pulse point location (thumb-side of wrist)
 */
export interface PulsePoint {
  /** Normalized x coordinate */
  x: number;
  
  /** Normalized y coordinate */
  y: number;
  
  /** Depth value */
  z: number;
  
  /** Anatomical name for reference */
  anatomicalName: string;
  
  /** Detection confidence */
  confidence: number;
}

/**
 * Wrist orientation for AR overlay alignment
 */
export interface WristOrientation {
  /** Angle in degrees (-180 to 180) */
  angle: number;
  
  /** Direction classification */
  direction: 'horizontal' | 'vertical' | 'diagonal';
  
  /** 3x3 rotation matrix for AR transforms */
  rotationMatrix: number[][];
}

/**
 * Finger placement validation result
 */
export interface FingerPlacementValidation {
  /** Whether finger placement is correct */
  isCorrect: boolean;
  
  /** Feedback message for user (matches FR-9 format) */
  feedback: string;
  
  /** Vector pointing toward correct position */
  correctionVector?: {
    x: number;
    y: number;
  };
  
  /** Distance from optimal position (normalized) */
  distance: number;
}

/**
 * Distance measurement in multiple units
 */
export interface Distance {
  /** Distance in centimeters (approximate) */
  cm: number;
  
  /** Distance in pixels (based on 640x480 input) */
  pixels: number;
}

/**
 * Retry configuration for CV operations
 */
export interface RetryConfig {
  /** Maximum retry duration in milliseconds */
  timeout: number;
  
  /** Interval between retry attempts in milliseconds */
  interval: number;
  
  /** Callback when timeout is reached */
  onTimeout?: () => { skipOffered?: boolean };
}

/**
 * Performance metrics for CV operations
 */
export interface PerformanceMetrics {
  /** Detection latency in milliseconds */
  latencyMs: number;
  
  /** Whether performance target was met (<500ms per FR-43) */
  withinTarget: boolean;
  
  /** Timestamp of measurement */
  timestamp: number;
}

/**
 * Vital signs extracted from monitor OCR (FR-16)
 */
export interface VitalSigns {
  /** Blood pressure (e.g., "118/76") */
  bp: string | null;
  
  /** Heart rate in BPM */
  hr: number | null;
  
  /** Oxygen saturation percentage */
  o2: number | null;
  
  /** Temperature in Fahrenheit */
  temp: number | null;
}

/**
 * OCR validation result
 */
export interface ValidationResult {
  /** Whether readings are valid/realistic */
  isValid: boolean;
  
  /** Warning messages for unrealistic values */
  warnings: Array<{
    field: string;
    message: string;
  }>;
}

