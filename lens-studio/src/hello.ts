/**
 * Test file to validate TypeScript build pipeline
 * This file should compile to Lens Studio-compatible JavaScript
 */

// Test: TypeScript features compile correctly
interface TestConfig {
  name: string;
  version: number;
  enabled: boolean;
}

const config: TestConfig = {
  name: "MedSnap Build Test",
  version: 1.0,
  enabled: true
};

// @input SceneObject testObject
// @input number testValue
// Test: Class syntax compiles
class TestSystem {
  private readonly config: TestConfig;
  private isInitialized: boolean = false;

  constructor(config: TestConfig) {
    this.config = config;
  }

  initialize(): void {
    console.log(`[Test] Initializing ${this.config.name} v${this.config.version}`);
    this.isInitialized = true;
  }

  getStatus(): { initialized: boolean; config: TestConfig } {
    return {
      initialized: this.isInitialized,
      config: this.config
    };
  }
}

// Test: Export works
export { TestSystem, TestConfig };

// Test: Instantiation
const testSystem = new TestSystem(config);
testSystem.initialize();

console.log('[Test] TypeScript build pipeline validation file loaded successfully');
