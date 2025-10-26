/**
 * Mock implementation of @mediapipe/tasks-vision for unit testing
 * Allows testing our wrapper logic without actual MediaPipe initialization
 */

export interface MockHandLandmarkerResult {
  landmarks: Array<Array<{ x: number; y: number; z: number; visibility?: number }>>;
  handednesses: Array<Array<{ displayName: 'Left' | 'Right'; score: number }>>;
}

export class HandLandmarker {
  static async createFromOptions(vision: any, options: any): Promise<HandLandmarker> {
    // Simulate error for invalid model paths
    if (options.baseOptions?.modelAssetPath?.includes('/invalid')) {
      throw new Error('Model not found');
    }
    return new HandLandmarker();
  }

  detect(image: any): MockHandLandmarkerResult {
    // Mock behavior based on image src (from our test helper)
    if (image.src?.includes('no-hand')) {
      // No hands detected
      return {
        landmarks: [],
        handednesses: []
      };
    }

    // Default: Return mock hand landmarks (21 points)
    const mockLandmarks = Array.from({ length: 21 }, (_, i) => ({
      x: 0.5 + (i * 0.01),
      y: 0.5 + (i * 0.01),
      z: 0,
      visibility: 0.95
    }));

    return {
      landmarks: [mockLandmarks],
      handednesses: [[
        {
          displayName: image.src?.includes('left') ? 'Left' : 'Right',
          score: 0.85
        }
      ]]
    };
  }

  close(): void {
    // Mock cleanup
  }
}

export class FilesetResolver {
  static async forVisionTasks(wasmPath: string): Promise<any> {
    // Mock vision resolver
    return {};
  }
}

export interface HandLandmarkerResult {
  landmarks: Array<Array<{ x: number; y: number; z: number; visibility?: number }>>;
  handednesses?: Array<Array<{ displayName: string; score: number }>>;
}

