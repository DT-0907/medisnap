/**
 * MediaPipe Hands Detector Implementation
 * Based on MediaPipe Hands v0.9+ via @mediapipe/tasks-vision
 * 
 * Requirements implemented:
 * - FR-32: MediaPipe Hands v0.9+ for hand detection
 * - FR-33: Single-person detection (max 1 hand tracked)
 * - FR-36: Graceful degradation on CV failure
 * - FR-10a: 10-second retry timeout with skip option
 * - FR-43: CV detection latency <500ms
 */

import { HandLandmarker, FilesetResolver, HandLandmarkerResult } from '@mediapipe/tasks-vision';
import type { DetectionResult, RetryConfig } from './types/detection';

/**
 * Configuration options for MediaPipe Hands detector
 */
export interface MediaPipeConfig {
  modelPath?: string;
  minDetectionConfidence?: number;
  minTrackingConfidence?: number;
  maxNumHands?: number;
}

/**
 * MediaPipe Hands Detector class
 * Wraps MediaPipe Hands model with retry logic and graceful degradation
 */
export class MediaPipeHandsDetector {
  private handLandmarker: HandLandmarker | null = null;
  private initialized: boolean = false;
  private config: Required<MediaPipeConfig>;

  constructor(config: MediaPipeConfig = {}) {
    // Default configuration per FR-32
    this.config = {
      modelPath: config.modelPath || 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
      minDetectionConfidence: config.minDetectionConfidence ?? 0.7,
      minTrackingConfidence: config.minTrackingConfidence ?? 0.7,
      maxNumHands: config.maxNumHands ?? 1  // FR-33: Single-person detection
    };
  }

  /**
   * Initialize MediaPipe Hands model
   * Loads model from CDN (no local download required)
   */
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
    } catch (error: any) {
      throw new Error(`Failed to load MediaPipe model: ${error.message}`);
    }
  }

  /**
   * Check if detector is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Get model version string
   */
  getModelVersion(): string {
    return 'MediaPipe Hands v0.9+';
  }

  /**
   * Get current configuration
   */
  getConfig(): Required<MediaPipeConfig> {
    return { ...this.config };
  }

  /**
   * Detect hands in an image
   * Returns detection result with landmarks or null on error
   * 
   * FR-36: Graceful degradation - returns null on error, doesn't throw
   * FR-43: Target <500ms latency
   */
  async detectHands(image: HTMLImageElement | ImageData | null): Promise<DetectionResult | null> {
    // FR-36: Graceful degradation
    if (!this.initialized || !this.handLandmarker) {
      console.error('Detector not initialized');
      return null;
    }

    if (!image) {
      console.error('Invalid image input');
      return null;
    }

    try {
      const startTime = performance.now();
      const results: HandLandmarkerResult = this.handLandmarker.detect(image);
      const duration = performance.now() - startTime;

      // FR-43: Log performance warning if too slow
      if (duration > 500) {
        console.warn(`CV detection took ${duration}ms (target: <500ms)`);
      }

      // No hands detected
      if (!results.landmarks || results.landmarks.length === 0) {
        return {
          handsDetected: false,
          landmarks: [],
          confidence: 0,
          handCount: 0,
          timestamp: Date.now()
        };
      }

      // FR-33: Focus on first hand only (single-person detection)
      const firstHandLandmarks = results.landmarks[0];
      const handedness = results.handednesses?.[0]?.[0]?.displayName as 'Left' | 'Right' | undefined;
      const confidence = results.handednesses?.[0]?.[0]?.score || 0;

      return {
        handsDetected: true,
        landmarks: firstHandLandmarks.map(lm => ({
          x: lm.x,
          y: lm.y,
          z: lm.z,
          visibility: lm.visibility
        })),
        handedness,
        confidence,
        handCount: 1,  // Always 1 per FR-33
        timestamp: Date.now()
      };
    } catch (error: any) {
      // FR-36: Graceful degradation - log error but don't throw
      console.error('Detection error:', error);
      return null;
    }
  }

  /**
   * Detect hands with retry logic
   * FR-10a: Retry for 10 seconds before offering skip option
   * 
   * @param image Input image to detect hands in
   * @param retryConfig Configuration for retry behavior
   * @returns Detection result with skipOffered flag if timeout reached
   */
  async detectHandsWithRetry(
    image: HTMLImageElement | ImageData,
    retryConfig: RetryConfig
  ): Promise<DetectionResult & { skipOffered?: boolean }> {
    const startTime = Date.now();
    let attempts = 0;
    const maxAttempts = Math.floor(retryConfig.timeout / retryConfig.interval);

    while (attempts < maxAttempts) {
      const result = await this.detectHands(image);

      // Success! Return immediately
      if (result && result.handsDetected) {
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

    // FR-10a: Timeout reached - offer skip option
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

  /**
   * Close detector and release resources
   */
  async close(): Promise<void> {
    if (this.handLandmarker) {
      this.handLandmarker.close();
      this.handLandmarker = null;
      this.initialized = false;
    }
  }
}

