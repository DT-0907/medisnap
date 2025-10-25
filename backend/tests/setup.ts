// Global test setup
import dotenv from 'dotenv';

// Load environment variables for tests
dotenv.config();

// Set test environment
process.env.NODE_ENV = 'test';

// Increase timeout for integration tests
jest.setTimeout(10000);

// Global test teardown
afterAll(() => {
  // Cleanup if needed
});
