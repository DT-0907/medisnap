/**
 * Dev 2 Task 2.0: Environment Setup Verification Tests
 * TDD Step 1: Write tests first
 */

describe('Environment Setup', () => {
  test('Node.js environment is configured', () => {
    expect(process.version).toMatch(/^v(18|20|22)\./);
  });

  test('Environment variables can be loaded', () => {
    process.env.TEST_VAR = 'test_value';
    expect(process.env.TEST_VAR).toBe('test_value');
  });

  test('Jest is working correctly', () => {
    expect(1 + 1).toBe(2);
  });
});
