const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "jsdom",
  transform: {
    ...tsJestTransformCfg,
  },
  // Increase timeout for tests with retry logic
  testTimeout: 15000,
  // Enable module mocking
  moduleNameMapper: {
    '^@mediapipe/tasks-vision$': '<rootDir>/tests/__mocks__/@mediapipe/tasks-vision.ts',
  },
};