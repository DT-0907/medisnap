/**
 * Jest Configuration for Lens Studio Scripts
 * Test infrastructure for clinical mode components
 */

module.exports = {
    // Test environment
    testEnvironment: 'node',

    // Test file patterns
    testMatch: [
        '**/tests/**/*.test.js',
        '**/__tests__/**/*.js'
    ],

    // Coverage configuration
    collectCoverageFrom: [
        '../*.js',
        '!../tests/**',
        '!../__tests__/**',
        '!../node_modules/**'
    ],

    // Coverage thresholds
    coverageThreshold: {
        global: {
            branches: 70,
            functions: 70,
            lines: 70,
            statements: 70
        }
    },

    // Module paths
    moduleNameMapper: {
        '^@/(.*)$': '../$1'
    },

    // Setup files
    setupFilesAfterEnv: ['./testSetup.js'],

    // Verbose output
    verbose: true,

    // Test timeout
    testTimeout: 5000,

    // Clear mocks between tests
    clearMocks: true,
    resetMocks: true,
    restoreMocks: true
};