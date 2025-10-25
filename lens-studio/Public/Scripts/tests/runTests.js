/**
 * Simple test runner for Lens Studio scripts
 * Simulates Jest-like testing environment
 */

// Mock Jest functions
let testResults = [];
let currentDescribe = '';
let currentTest = '';

global.describe = function(name, fn) {
  currentDescribe = name;
  console.log('\n' + name);
  fn();
};

global.test = global.it = function(name, fn) {
  currentTest = name;
  try {
    fn();
    console.log('  ✓ ' + name);
    testResults.push({ describe: currentDescribe, test: name, passed: true });
  } catch (error) {
    console.log('  ✗ ' + name);
    console.log('    Error: ' + error.message);
    testResults.push({ describe: currentDescribe, test: name, passed: false, error: error.message });
  }
};

global.expect = function(actual) {
  return {
    toBe: function(expected) {
      if (actual !== expected) {
        throw new Error(`Expected ${expected} but got ${actual}`);
      }
    },
    toEqual: function(expected) {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(`Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`);
      }
    },
    toBeTruthy: function() {
      if (!actual) {
        throw new Error(`Expected truthy value but got ${actual}`);
      }
    },
    toBeFalsy: function() {
      if (actual) {
        throw new Error(`Expected falsy value but got ${actual}`);
      }
    },
    toContain: function(expected) {
      if (typeof actual === 'string' && !actual.includes(expected)) {
        throw new Error(`Expected "${actual}" to contain "${expected}"`);
      } else if (Array.isArray(actual) && !actual.includes(expected)) {
        throw new Error(`Expected array to contain ${expected}`);
      }
    },
    toBeGreaterThan: function(expected) {
      if (actual <= expected) {
        throw new Error(`Expected ${actual} to be greater than ${expected}`);
      }
    },
    toBeGreaterThanOrEqual: function(expected) {
      if (actual < expected) {
        throw new Error(`Expected ${actual} to be greater than or equal to ${expected}`);
      }
    },
    toHaveBeenCalled: function() {
      if (!actual.called) {
        throw new Error('Expected function to have been called');
      }
    },
    toHaveBeenCalledWith: function(...args) {
      if (!actual.calledWith || JSON.stringify(actual.calledWith) !== JSON.stringify(args)) {
        throw new Error(`Expected function to be called with ${JSON.stringify(args)}`);
      }
    },
    not: {
      toHaveBeenCalled: function() {
        if (actual.called) {
          throw new Error('Expected function not to have been called');
        }
      },
      toBe: function(expected) {
        if (actual === expected) {
          throw new Error(`Expected ${actual} not to be ${expected}`);
        }
      }
    }
  };
};

global.jest = {
  fn: function(impl) {
    let fn = impl || function() {};
    fn.called = false;
    fn.calledWith = null;
    fn.mockImplementation = function(newImpl) {
      fn = newImpl;
      return fn;
    };
    let wrapper = function(...args) {
      wrapper.called = true;
      wrapper.calledWith = args;
      return fn(...args);
    };
    wrapper.called = false;
    wrapper.calledWith = null;
    wrapper.mockImplementation = fn.mockImplementation;
    return wrapper;
  },
  useFakeTimers: function() {
    global.timers = [];
    global.originalSetTimeout = global.setTimeout;
    global.setTimeout = function(fn, delay) {
      global.timers.push({ fn, delay, elapsed: 0 });
      return global.timers.length - 1;
    };
  },
  useRealTimers: function() {
    global.setTimeout = global.originalSetTimeout || global.setTimeout;
    global.timers = [];
  },
  advanceTimersByTime: function(ms) {
    if (global.timers) {
      global.timers.forEach(timer => {
        timer.elapsed += ms;
        if (timer.elapsed >= timer.delay) {
          timer.fn();
        }
      });
    }
  },
  clearAllTimers: function() {
    global.timers = [];
  },
  clearAllMocks: function() {
    // Reset all mocks
  }
};

global.beforeEach = function(fn) {
  // Run before each test
  fn();
};

global.afterEach = function(fn) {
  // Run after each test
  fn();
};

// Mock Lens Studio vec2
global.vec2 = function(x, y) {
  return { x: x, y: y };
};

// Mock Lens Studio vec4
global.vec4 = function(r, g, b, a) {
  return { r: r, g: g, b: b, a: a };
};

// Run the patient card renderer tests
console.log('Running Patient Card Renderer Tests...\n');

// Load and run tests
try {
  require('./patientCardRenderer.test.js');

  // Print summary
  console.log('\n========================================');
  const passed = testResults.filter(r => r.passed).length;
  const failed = testResults.filter(r => !r.passed).length;
  console.log(`Test Results: ${passed} passed, ${failed} failed, ${testResults.length} total`);

  if (failed === 0) {
    console.log('✅ All tests passed!');
  } else {
    console.log('❌ Some tests failed. See details above.');
  }
} catch (error) {
  console.log('Failed to run tests:', error.message);
}