# Dev 2 Task 2.1 Implementation Guide: Mode Manager (TDD)

**Task**: Mode Manager - TDD
**Hours**: 6-12 (6 hours)
**Approach**: Test-Driven Development (TDD)
**Prerequisites**: Task 2.0 complete, Dev 1's State Manager available (Hour 6 handoff)

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites Checklist](#prerequisites-checklist)
3. [Mode Manager Specifications](#mode-manager-specifications)
4. [State Machine Design](#state-machine-design)
5. [Data Structures](#data-structures)
6. [TDD Implementation Steps](#tdd-implementation-steps)
7. [Test Cases (2.1.1)](#test-cases-211)
8. [Implementation Guide (2.1.4)](#implementation-guide-214)
9. [Integration with Dev 1](#integration-with-dev-1)
10. [Edge Cases & Error Handling](#edge-cases--error-handling)
11. [Performance Considerations](#performance-considerations)
12. [Troubleshooting](#troubleshooting)

---

## Overview

### What This Task Does

Task 2.1 implements the **Mode Manager**, which handles transitions between three application modes:
- **IDLE**: Default state, waiting for voice command
- **TRAINING**: Pulse-taking training mode (Dev 1's responsibility)
- **CLINICAL**: Patient assessment mode (Dev 2's responsibility)

The Mode Manager is the **orchestration layer** that ensures clean mode transitions, proper cleanup, and auto-exit behavior.

### Key Responsibilities

Per **FR-5a**, **FR-12a**, **FR-12b**, and **Task 2.1**, the Mode Manager must:

1. **Maintain current mode state** (idle/training/clinical)
2. **Handle mode transitions** with proper cleanup between modes
3. **Auto-exit training mode** after procedure completion + 10 seconds of inactivity (FR-5a)
4. **Auto-exit clinical mode** after 120 seconds (2 minutes) of inactivity (FR-12a)
5. **Direct mode switching** (FR-12b): "Hey MedSnap, start [mode]" auto-exits current mode
6. **Voice confirmations**: "Training complete." / "Assessment complete." on exit
7. **Coordinate with Dev 1's components** (Voice Controller, State Manager)

### Functional Requirements Covered

- **FR-5a**: Training mode exit (manual "end training" or auto after 10s inactivity)
- **FR-12a**: Clinical mode exit (manual "end assessment" or auto after 120s inactivity)
- **FR-12b**: Direct mode switching without explicit exit commands
- **FR-27a**: Session-based listening (wake word for session start, no wake word in-session)

### Dependencies

**What You Need Before Starting**:
- ✅ Task 2.0 complete (config.js with MODE constants, demo mode setup)
- ✅ Dev 1's State Manager available (Hour 6 handoff) - manages underlying state storage
- ⏳ Dev 1's Voice Controller (Hour 6 handoff) - routes commands to Mode Manager
- ⏳ TTS integration (for confirmation messages) - will mock for now

**What You DON'T Need Yet**:
- ❌ Patient Card Renderer (Task 2.2)
- ❌ Clinical Mode State Machine (Task 2.3)
- ❌ Full voice command parsing (Dev 1 handles this, Mode Manager just receives events)

---

## Prerequisites Checklist

Before starting Task 2.1, verify:

### Environment Setup (from Task 2.0)
- [ ] On `dev-2-clinical` branch
- [ ] `lens-studio/Public/Scripts/config.js` exists with MODE constants
- [ ] `lens-studio/Public/Scripts/clinical/modeManager.js` placeholder exists
- [ ] Backend testing framework (Jest) configured
- [ ] All 13 tests from Task 2.0 passing

### Dev 1 Handoff (Hour 6)
- [ ] Dev 1's `stateManager.js` available and documented
- [ ] Dev 1's Voice Controller can route mode switch commands
- [ ] Dev 1 has provided integration points documentation

### Git State
- [ ] Working directory clean (no uncommitted Task 2.0 changes)
- [ ] All 6 commits from Task 2.0 present

---

## Mode Manager Specifications

### Three Modes

From `config.js`:
```javascript
MODE: {
  IDLE: 'idle',
  TRAINING: 'training',
  CLINICAL: 'clinical'
}
```

### Mode Transition Rules

**Valid Transitions**:
```
IDLE → TRAINING     (voice: "Hey MedSnap, start training pulse taking")
IDLE → CLINICAL     (voice: "Hey MedSnap, start assessment [patient name]")
TRAINING → IDLE     (voice: "Hey MedSnap, end training" OR auto after 10s inactivity)
CLINICAL → IDLE     (voice: "Hey MedSnap, end assessment" OR auto after 120s inactivity)
TRAINING → CLINICAL (voice: "Hey MedSnap, start assessment [patient]" - auto-exits training first per FR-12b)
CLINICAL → TRAINING (voice: "Hey MedSnap, start training..." - auto-exits clinical first per FR-12b)
```

**Direct Mode Switching (FR-12b)**:
When user says "Hey MedSnap, start [new mode]" while in a different mode:
1. Mode Manager auto-exits current mode
2. Speaks confirmation ("Training complete" or "Assessment complete")
3. Immediately enters new mode
4. No explicit exit command needed

### Inactivity Timeouts

Per **FR-5a** and **FR-12a**:

| Mode     | Inactivity Timeout | Confirmation Message    |
|----------|-------------------|-------------------------|
| IDLE     | N/A (no timeout)  | N/A                     |
| TRAINING | 10 seconds        | "Training complete."    |
| CLINICAL | 120 seconds       | "Assessment complete."  |

**Inactivity Definition**: No user input (voice commands, interactions) for the specified duration **after procedure completion** (training) or **at any time** (clinical).

### Exit Confirmation Messages

Per **FR-5a** and **FR-12a**:
- Training exit: **"Training complete."**
- Clinical exit: **"Assessment complete."**

These are spoken via TTS (Fish Audio API) when mode exits.

### Session Data Cleanup

When exiting a mode:
- **Training mode**: Clear CV tracking state, reset procedure step counter
- **Clinical mode**: Clear patient session data, symptom recordings, prescription drafts
- **Both**: Stop inactivity timer, reset session context

---

## State Machine Design

### State Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                          IDLE                               │
│  - No active session                                        │
│  - Listening for wake word: "Hey MedSnap, start..."        │
│  - No inactivity timer                                      │
└─────────────┬───────────────────────┬───────────────────────┘
              │                       │
              │ "start training"      │ "start assessment"
              ▼                       ▼
┌────────────────────┐      ┌────────────────────────────┐
│     TRAINING       │      │        CLINICAL            │
│  - CV tracking ON  │◄────►│  - Patient session active  │
│  - Step-by-step    │      │  - Listening for commands  │
│  - Timer: 10s      │      │  - Timer: 120s             │
└────────┬───────────┘      └────────┬───────────────────┘
         │                           │
         │ "end training" OR         │ "end assessment" OR
         │ 10s inactivity OR         │ 120s inactivity OR
         │ "start assessment"        │ "start training"
         │                           │
         └───────────┬───────────────┘
                     │
                     │ Speaks confirmation
                     ▼
                  (back to IDLE or switch directly)
```

### State Transition Logic

**Function**: `switchMode(newMode)`

**Algorithm**:
```
1. IF newMode === currentMode:
     - Do nothing (already in that mode)
     - Return

2. IF currentMode !== IDLE:
     - Call exitCurrentMode()
       - Stop inactivity timer
       - Clear session data
       - Speak confirmation message
       - Set currentMode = IDLE

3. Set currentMode = newMode

4. IF newMode === TRAINING:
     - Initialize training state
     - Start 10s inactivity timer (with restart on activity)
     - Notify Dev 1's Training Controller

5. IF newMode === CLINICAL:
     - Initialize clinical session
     - Start 120s inactivity timer (with restart on activity)
     - Ready for patient lookup

6. IF newMode === IDLE:
     - Clear all state
     - Stop all timers
```

### Inactivity Timer Logic

**Function**: `startInactivityTimer(mode)`

**Algorithm**:
```
1. Clear any existing inactivity timer

2. Get timeout duration based on mode:
   - TRAINING: 10 seconds
   - CLINICAL: 120 seconds
   - IDLE: No timer

3. Create DelayedCallbackEvent:
   - Bind callback: handleInactivityTimeout()
   - Reset timer with duration

4. Store timer reference for later clearing
```

**Function**: `resetInactivityTimer()`

Called whenever user performs an action (voice command, interaction):
```
1. IF currentMode === IDLE:
     - Do nothing

2. Clear existing timer

3. Restart timer with same duration
```

**Function**: `handleInactivityTimeout()`

Called when timer expires:
```
1. IF currentMode === TRAINING:
     - Speak "Training complete."
     - Switch to IDLE

2. IF currentMode === CLINICAL:
     - Speak "Assessment complete."
     - Switch to IDLE
```

---

## Data Structures

### Mode Manager State

```javascript
{
  currentMode: string,              // 'idle' | 'training' | 'clinical'
  inactivityTimer: DelayedCallbackEvent | null,
  sessionData: {
    training: {
      procedureStep: number,
      cvTrackingActive: boolean,
      completionTime: number | null
    },
    clinical: {
      patientId: string | null,
      patientName: string | null,
      sessionStartTime: number,
      lastActivityTime: number
    }
  },
  lastExitConfirmation: string | null  // For testing
}
```

### Configuration (from config.js)

```javascript
MODE: {
  IDLE: 'idle',
  TRAINING: 'training',
  CLINICAL: 'clinical'
}

TIMEOUTS: {
  TRAINING_AUTO_EXIT: 10000,   // 10 seconds in ms
  CLINICAL_AUTO_EXIT: 120000   // 120 seconds in ms
}
```

### TTS Integration

Mode Manager needs to call TTS for confirmation messages. For Task 2.1, we'll **mock TTS** and just print the message. Real TTS integration comes from Dev 3.

**Mock TTS Interface**:
```javascript
function speakConfirmation(message) {
  // For now: just print to console
  // Later (Dev 3 integration): call Fish Audio TTS API
  print("TTS: " + message);

  // TODO: Replace with actual TTS call
  // global.ttsService.speak(message);
}
```

---

## TDD Implementation Steps

Task 2.1 follows the **6-step TDD workflow**:

### Step 2.1.1: Write Tests First
- Create `backend/tests/unit/modeManager.test.js`
- Write 11 test cases (listed below)
- Tests will FAIL (no implementation yet)

### Step 2.1.2: Confirm Tests Fail
- Run `npm test` from `backend/` directory
- Verify all new tests fail with appropriate error messages

### Step 2.1.3: Commit Tests
- Git commit: `git commit -m "test: Add mode manager tests (Task 2.1 TDD Step 1)"`

### Step 2.1.4: Implement Mode Manager
- Create `backend/lens-studio-mock/modeManager.js` (Node.js mock for testing)
- Update `lens-studio/Public/Scripts/clinical/modeManager.js` (Lens Studio implementation)

### Step 2.1.5: Run Tests Until Pass
- Iteratively run `npm test`
- Fix implementation until all tests pass

### Step 2.1.6: Commit Implementation
- Git commit: `git commit -m "feat: Implement mode manager (Task 2.1)"`

---

## Test Cases (2.1.1)

Create `backend/tests/unit/modeManager.test.js` with these 11 test cases:

### Test File Structure

```javascript
/**
 * Dev 2 Task 2.1: Mode Manager Tests
 * TDD Step 1: Write tests first
 */

const ModeManager = require('../../lens-studio-mock/modeManager');

describe('Mode Manager', () => {
  let modeManager;
  let mockTTS;
  let ttsMessages;

  beforeEach(() => {
    // Mock TTS service
    ttsMessages = [];
    mockTTS = {
      speak: (message) => {
        ttsMessages.push(message);
        return Promise.resolve();
      }
    };

    modeManager = new ModeManager(mockTTS);
  });

  afterEach(() => {
    // Clean up timers
    modeManager.cleanup();
  });

  // Test 1: Initial state is IDLE
  test('Initial mode is IDLE', () => {
    expect(modeManager.getCurrentMode()).toBe('idle');
  });

  // Test 2: Switch from IDLE to TRAINING
  test('switchMode() transitions from idle to training', () => {
    modeManager.switchMode('training');

    expect(modeManager.getCurrentMode()).toBe('training');
    expect(modeManager.hasActiveInactivityTimer()).toBe(true);
  });

  // Test 3: Switch from IDLE to CLINICAL
  test('switchMode() transitions from idle to clinical', () => {
    modeManager.switchMode('clinical');

    expect(modeManager.getCurrentMode()).toBe('clinical');
    expect(modeManager.hasActiveInactivityTimer()).toBe(true);
  });

  // Test 4: Switch from TRAINING to CLINICAL (auto-exit training first per FR-12b)
  test('switchMode() transitions from training to clinical (auto-exit training first per FR-12b)', () => {
    modeManager.switchMode('training');
    expect(modeManager.getCurrentMode()).toBe('training');

    // Now switch directly to clinical (should auto-exit training)
    modeManager.switchMode('clinical');

    expect(modeManager.getCurrentMode()).toBe('clinical');
    expect(ttsMessages).toContain('Training complete.');
  });

  // Test 5: Switch from CLINICAL to TRAINING (auto-exit clinical first per FR-12b)
  test('switchMode() transitions from clinical to training (auto-exit clinical first per FR-12b)', () => {
    modeManager.switchMode('clinical');
    expect(modeManager.getCurrentMode()).toBe('clinical');

    // Now switch directly to training (should auto-exit clinical)
    modeManager.switchMode('training');

    expect(modeManager.getCurrentMode()).toBe('training');
    expect(ttsMessages).toContain('Assessment complete.');
  });

  // Test 6: Auto-exit training confirms "Training complete" before starting clinical
  test('autoExitOnSwitch() confirms "Training complete" before starting clinical mode', () => {
    modeManager.switchMode('training');
    modeManager.switchMode('clinical');

    expect(ttsMessages[0]).toBe('Training complete.');
    expect(modeManager.getCurrentMode()).toBe('clinical');
  });

  // Test 7: Auto-exit clinical confirms "Assessment complete" before starting training
  test('autoExitOnSwitch() confirms "Assessment complete" before starting training mode', () => {
    modeManager.switchMode('clinical');
    modeManager.switchMode('training');

    expect(ttsMessages[0]).toBe('Assessment complete.');
    expect(modeManager.getCurrentMode()).toBe('training');
  });

  // Test 8: Exit current mode clears session data and resets state
  test('exitCurrentMode() clears session data and resets state', () => {
    modeManager.switchMode('clinical');
    modeManager.setSessionData({ patientId: 'DEMO_001', patientName: 'Sarah Chen' });

    modeManager.exitCurrentMode();

    expect(modeManager.getCurrentMode()).toBe('idle');
    expect(modeManager.getSessionData()).toEqual({});
    expect(modeManager.hasActiveInactivityTimer()).toBe(false);
  });

  // Test 9: Inactivity timer checks mode-specific timeout
  test('handleInactivity() checks mode-specific timeout (10s training, 120s clinical per FR-5a, FR-12a)', () => {
    modeManager.switchMode('training');
    const trainingTimeout = modeManager.getInactivityTimeout();
    expect(trainingTimeout).toBe(10000); // 10 seconds

    modeManager.switchMode('clinical');
    const clinicalTimeout = modeManager.getInactivityTimeout();
    expect(clinicalTimeout).toBe(120000); // 120 seconds
  });

  // Test 10: Inactivity triggers auto-exit for training after 10 seconds
  test('handleInactivity() triggers auto-exit for training after 10 seconds', (done) => {
    modeManager.switchMode('training');

    // Wait 10.1 seconds
    setTimeout(() => {
      expect(modeManager.getCurrentMode()).toBe('idle');
      expect(ttsMessages).toContain('Training complete.');
      done();
    }, 10100);
  }, 12000); // Test timeout 12s

  // Test 11: Inactivity triggers auto-exit for clinical after 120 seconds
  test('handleInactivity() triggers auto-exit for clinical after 120 seconds', (done) => {
    modeManager.switchMode('clinical');

    // Wait 120.1 seconds
    setTimeout(() => {
      expect(modeManager.getCurrentMode()).toBe('idle');
      expect(ttsMessages).toContain('Assessment complete.');
      done();
    }, 120100);
  }, 125000); // Test timeout 125s

  // Test 12 (BONUS): Confirm exit speaks confirmation message based on mode
  test('confirmExit() speaks confirmation message based on mode', () => {
    modeManager.switchMode('training');
    modeManager.exitCurrentMode();
    expect(ttsMessages).toContain('Training complete.');

    ttsMessages = []; // Reset

    modeManager.switchMode('clinical');
    modeManager.exitCurrentMode();
    expect(ttsMessages).toContain('Assessment complete.');
  });

  // Test 13 (BONUS): Reset inactivity timer on user activity
  test('resetInactivityTimer() restarts timer on user activity', (done) => {
    modeManager.switchMode('clinical');

    // Wait 60 seconds (halfway through 120s timeout)
    setTimeout(() => {
      expect(modeManager.getCurrentMode()).toBe('clinical');

      // User performs activity - reset timer
      modeManager.resetInactivityTimer();

      // Wait another 60 seconds (should NOT timeout)
      setTimeout(() => {
        expect(modeManager.getCurrentMode()).toBe('clinical'); // Still in clinical
        done();
      }, 60000);
    }, 60000);
  }, 125000); // Test timeout 125s

  // Test 14 (BONUS): Handle invalid mode gracefully
  test('switchMode() handles invalid mode gracefully', () => {
    expect(() => {
      modeManager.switchMode('invalid_mode');
    }).toThrow('Invalid mode: invalid_mode');

    expect(modeManager.getCurrentMode()).toBe('idle'); // Should remain idle
  });
});
```

### Test Explanation

**Why These Tests?**

1. **Test 1**: Verify initial state
2. **Tests 2-3**: Basic mode transitions from IDLE
3. **Tests 4-5**: Direct mode switching (FR-12b) - critical feature
4. **Tests 6-7**: Confirmation messages on auto-exit during switch
5. **Test 8**: Proper cleanup on exit
6. **Test 9**: Mode-specific timeout values
7. **Tests 10-11**: Auto-exit after inactivity (long-running tests)
8. **Test 12**: Confirmation messages for both modes
9. **Test 13**: Timer reset on user activity
10. **Test 14**: Error handling for invalid modes

---

## Implementation Guide (2.1.4)

### Node.js Mock for Testing

Create `backend/lens-studio-mock/modeManager.js`:

```javascript
/**
 * Node.js Mock of Mode Manager
 * For Jest testing only - mirrors Lens Studio implementation
 */

class ModeManager {
  constructor(ttsService) {
    this.ttsService = ttsService || {
      speak: (message) => {
        console.log('TTS Mock:', message);
        return Promise.resolve();
      }
    };

    this.state = {
      currentMode: 'idle',
      inactivityTimer: null,
      sessionData: {}
    };

    this.config = {
      MODE: {
        IDLE: 'idle',
        TRAINING: 'training',
        CLINICAL: 'clinical'
      },
      TIMEOUTS: {
        TRAINING_AUTO_EXIT: 10000,   // 10 seconds
        CLINICAL_AUTO_EXIT: 120000   // 120 seconds
      }
    };
  }

  /**
   * Switch to a new mode
   * Handles auto-exit of current mode per FR-12b
   */
  switchMode(newMode) {
    // Validate mode
    const validModes = Object.values(this.config.MODE);
    if (!validModes.includes(newMode)) {
      throw new Error(`Invalid mode: ${newMode}`);
    }

    // If already in this mode, do nothing
    if (this.state.currentMode === newMode) {
      return;
    }

    // Auto-exit current mode if not idle (FR-12b)
    if (this.state.currentMode !== this.config.MODE.IDLE) {
      this.exitCurrentMode();
    }

    // Enter new mode
    this.state.currentMode = newMode;

    // Initialize mode-specific state
    if (newMode === this.config.MODE.TRAINING) {
      this._initializeTrainingMode();
    } else if (newMode === this.config.MODE.CLINICAL) {
      this._initializeClinicalMode();
    }
  }

  /**
   * Exit the current mode with confirmation
   */
  exitCurrentMode() {
    const exitingMode = this.state.currentMode;

    // Stop inactivity timer
    this._clearInactivityTimer();

    // Clear session data
    this.state.sessionData = {};

    // Speak confirmation message
    if (exitingMode === this.config.MODE.TRAINING) {
      this.ttsService.speak('Training complete.');
    } else if (exitingMode === this.config.MODE.CLINICAL) {
      this.ttsService.speak('Assessment complete.');
    }

    // Set to idle
    this.state.currentMode = this.config.MODE.IDLE;
  }

  /**
   * Get current mode
   */
  getCurrentMode() {
    return this.state.currentMode;
  }

  /**
   * Set session data (for testing)
   */
  setSessionData(data) {
    this.state.sessionData = { ...this.state.sessionData, ...data };
  }

  /**
   * Get session data
   */
  getSessionData() {
    return this.state.sessionData;
  }

  /**
   * Check if inactivity timer is active
   */
  hasActiveInactivityTimer() {
    return this.state.inactivityTimer !== null;
  }

  /**
   * Get current inactivity timeout value (in ms)
   */
  getInactivityTimeout() {
    if (this.state.currentMode === this.config.MODE.TRAINING) {
      return this.config.TIMEOUTS.TRAINING_AUTO_EXIT;
    } else if (this.state.currentMode === this.config.MODE.CLINICAL) {
      return this.config.TIMEOUTS.CLINICAL_AUTO_EXIT;
    }
    return null;
  }

  /**
   * Reset inactivity timer (called on user activity)
   */
  resetInactivityTimer() {
    if (this.state.currentMode === this.config.MODE.IDLE) {
      return; // No timer in idle mode
    }

    this._clearInactivityTimer();
    this._startInactivityTimer();
  }

  /**
   * Cleanup (for testing)
   */
  cleanup() {
    this._clearInactivityTimer();
  }

  // --- Private Methods ---

  /**
   * Initialize training mode
   */
  _initializeTrainingMode() {
    this.state.sessionData = {
      procedureStep: 0,
      cvTrackingActive: true,
      completionTime: null
    };

    this._startInactivityTimer();
  }

  /**
   * Initialize clinical mode
   */
  _initializeClinicalMode() {
    this.state.sessionData = {
      patientId: null,
      patientName: null,
      sessionStartTime: Date.now(),
      lastActivityTime: Date.now()
    };

    this._startInactivityTimer();
  }

  /**
   * Start inactivity timer based on current mode
   */
  _startInactivityTimer() {
    this._clearInactivityTimer();

    let timeout;
    if (this.state.currentMode === this.config.MODE.TRAINING) {
      timeout = this.config.TIMEOUTS.TRAINING_AUTO_EXIT;
    } else if (this.state.currentMode === this.config.MODE.CLINICAL) {
      timeout = this.config.TIMEOUTS.CLINICAL_AUTO_EXIT;
    } else {
      return; // No timer for idle mode
    }

    this.state.inactivityTimer = setTimeout(() => {
      this._handleInactivityTimeout();
    }, timeout);
  }

  /**
   * Clear inactivity timer
   */
  _clearInactivityTimer() {
    if (this.state.inactivityTimer) {
      clearTimeout(this.state.inactivityTimer);
      this.state.inactivityTimer = null;
    }
  }

  /**
   * Handle inactivity timeout
   */
  _handleInactivityTimeout() {
    // Auto-exit current mode
    this.exitCurrentMode();
  }
}

module.exports = ModeManager;
```

### Lens Studio Implementation

Update `lens-studio/Public/Scripts/clinical/modeManager.js`:

```javascript
/**
 * Dev 2 Task 2.1: Mode Manager
 * Handles Clinical/Training/Idle mode switching
 */

// @input bool debugMode = true

// Get config
const config = global.MedSnapConfig;

if (!config) {
  print("ERROR: MedSnapConfig not loaded. Ensure config.js runs first.");
  throw new Error("MedSnapConfig not loaded");
}

// State
var currentMode = config.MODE.IDLE;
var inactivityTimer = null;
var sessionData = {};

/**
 * Switch to a new mode
 * Handles auto-exit of current mode per FR-12b
 * @param {string} newMode - 'idle' | 'training' | 'clinical'
 */
function switchMode(newMode) {
  if (script.debugMode) {
    print("ModeManager: Switching from " + currentMode + " to " + newMode);
  }

  // Validate mode
  var validModes = [config.MODE.IDLE, config.MODE.TRAINING, config.MODE.CLINICAL];
  var isValid = false;
  for (var i = 0; i < validModes.length; i++) {
    if (validModes[i] === newMode) {
      isValid = true;
      break;
    }
  }

  if (!isValid) {
    print("ERROR: Invalid mode: " + newMode);
    return;
  }

  // If already in this mode, do nothing
  if (currentMode === newMode) {
    if (script.debugMode) {
      print("ModeManager: Already in mode " + newMode);
    }
    return;
  }

  // Auto-exit current mode if not idle (FR-12b)
  if (currentMode !== config.MODE.IDLE) {
    exitCurrentMode();
  }

  // Enter new mode
  currentMode = newMode;

  // Initialize mode-specific state
  if (newMode === config.MODE.TRAINING) {
    initializeTrainingMode();
  } else if (newMode === config.MODE.CLINICAL) {
    initializeClinicalMode();
  }

  if (script.debugMode) {
    print("ModeManager: Now in " + currentMode + " mode");
  }
}

/**
 * Exit the current mode with confirmation
 */
function exitCurrentMode() {
  var exitingMode = currentMode;

  if (script.debugMode) {
    print("ModeManager: Exiting " + exitingMode + " mode");
  }

  // Stop inactivity timer
  clearInactivityTimer();

  // Clear session data
  sessionData = {};

  // Speak confirmation message (per FR-5a, FR-12a)
  if (exitingMode === config.MODE.TRAINING) {
    speakConfirmation("Training complete.");
  } else if (exitingMode === config.MODE.CLINICAL) {
    speakConfirmation("Assessment complete.");
  }

  // Set to idle
  currentMode = config.MODE.IDLE;
}

/**
 * Get current mode
 * @returns {string} Current mode ('idle' | 'training' | 'clinical')
 */
function getCurrentMode() {
  return currentMode;
}

/**
 * Check if in clinical mode
 * @returns {boolean}
 */
function isInClinicalMode() {
  return currentMode === config.MODE.CLINICAL;
}

/**
 * Check if in training mode
 * @returns {boolean}
 */
function isInTrainingMode() {
  return currentMode === config.MODE.TRAINING;
}

/**
 * Reset inactivity timer (called on user activity)
 */
function resetInactivityTimer() {
  if (currentMode === config.MODE.IDLE) {
    return; // No timer in idle mode
  }

  if (script.debugMode) {
    print("ModeManager: Resetting inactivity timer");
  }

  clearInactivityTimer();
  startInactivityTimer();
}

/**
 * Get session data
 * @returns {object}
 */
function getSessionData() {
  return sessionData;
}

/**
 * Set session data
 * @param {object} data
 */
function setSessionData(data) {
  for (var key in data) {
    sessionData[key] = data[key];
  }
}

// --- Private Functions ---

/**
 * Initialize training mode
 */
function initializeTrainingMode() {
  sessionData = {
    procedureStep: 0,
    cvTrackingActive: true,
    completionTime: null
  };

  startInactivityTimer();

  if (script.debugMode) {
    print("ModeManager: Training mode initialized");
  }
}

/**
 * Initialize clinical mode
 */
function initializeClinicalMode() {
  sessionData = {
    patientId: null,
    patientName: null,
    sessionStartTime: getTime(),
    lastActivityTime: getTime()
  };

  startInactivityTimer();

  if (script.debugMode) {
    print("ModeManager: Clinical mode initialized");
  }
}

/**
 * Start inactivity timer based on current mode
 */
function startInactivityTimer() {
  clearInactivityTimer();

  var timeout;
  if (currentMode === config.MODE.TRAINING) {
    timeout = config.TIMEOUTS.TRAINING_AUTO_EXIT / 1000; // Convert ms to seconds
  } else if (currentMode === config.MODE.CLINICAL) {
    timeout = config.TIMEOUTS.CLINICAL_AUTO_EXIT / 1000; // Convert ms to seconds
  } else {
    return; // No timer for idle mode
  }

  var timerEvent = script.createEvent("DelayedCallbackEvent");
  timerEvent.bind(function() {
    handleInactivityTimeout();
  });
  timerEvent.reset(timeout);

  inactivityTimer = timerEvent;

  if (script.debugMode) {
    print("ModeManager: Inactivity timer started (" + timeout + " seconds)");
  }
}

/**
 * Clear inactivity timer
 */
function clearInactivityTimer() {
  if (inactivityTimer) {
    inactivityTimer.cancel();
    inactivityTimer = null;

    if (script.debugMode) {
      print("ModeManager: Inactivity timer cleared");
    }
  }
}

/**
 * Handle inactivity timeout
 */
function handleInactivityTimeout() {
  if (script.debugMode) {
    print("ModeManager: Inactivity timeout triggered");
  }

  // Auto-exit current mode
  exitCurrentMode();
}

/**
 * Speak confirmation message via TTS
 * @param {string} message
 */
function speakConfirmation(message) {
  print("TTS: " + message);

  // TODO: Replace with actual TTS integration from Dev 3
  // Example:
  // if (global.ttsService) {
  //   global.ttsService.speak(message);
  // }
}

// Export functions for other scripts
script.switchMode = switchMode;
script.exitCurrentMode = exitCurrentMode;
script.getCurrentMode = getCurrentMode;
script.isInClinicalMode = isInClinicalMode;
script.isInTrainingMode = isInTrainingMode;
script.resetInactivityTimer = resetInactivityTimer;
script.getSessionData = getSessionData;
script.setSessionData = setSessionData;

if (script.debugMode) {
  print("ModeManager: Task 2.1 implementation complete");
  print("ModeManager: Current mode: " + currentMode);
}
```

### Configuration Updates

Ensure `lens-studio/Public/Scripts/config.js` has these constants (should already exist from Task 2.0):

```javascript
TIMEOUTS: {
  PATIENT_CARD_AUTO_HIDE: 10000,    // From Task 2.0
  TRAINING_AUTO_EXIT: 10000,        // NEW for Task 2.1 - 10 seconds
  CLINICAL_AUTO_EXIT: 120000        // NEW for Task 2.1 - 120 seconds
}
```

---

## Integration with Dev 1

### Expected Dev 1 Handoff (Hour 6)

Dev 1 should provide:

1. **State Manager** (`stateManager.js`):
   - Low-level state storage
   - Mode Manager wraps this for high-level orchestration
   - NOT a blocker if unavailable - Mode Manager can work standalone

2. **Voice Controller** integration points:
   - How Mode Manager receives mode switch commands
   - Expected pattern:
   ```javascript
   // Dev 1's Voice Controller calls:
   global.modeManager.switchMode('clinical'); // When user says "start assessment"
   global.modeManager.exitCurrentMode();      // When user says "end assessment"
   ```

3. **Training Controller** callbacks:
   - Mode Manager notifies Training Controller when entering training mode
   - Expected pattern:
   ```javascript
   // Mode Manager calls Dev 1's Training Controller:
   if (global.trainingController) {
     global.trainingController.startProcedure('pulse_taking');
   }
   ```

### Integration Pattern

**Mode Manager acts as an event hub**:

```
Voice Controller (Dev 1)
       ↓
   switchMode('clinical')
       ↓
    Mode Manager (Dev 2) ←→ State Manager (Dev 1)
       ↓
   Clinical Mode State Machine (Dev 2, Task 2.3)
```

### Communication Flow Example

**Scenario**: User says "Hey MedSnap, start assessment Sarah Chen"

1. Dev 1's Voice Controller receives transcription
2. Voice Controller parses command → `{ action: 'start_assessment', patient: 'Sarah Chen' }`
3. Voice Controller calls: `global.modeManager.switchMode('clinical')`
4. Mode Manager:
   - Exits training mode if active (auto-exit per FR-12b)
   - Speaks "Training complete." if needed
   - Sets mode to CLINICAL
   - Starts 120s inactivity timer
   - Initializes clinical session
5. Mode Manager notifies Clinical Mode State Machine (Task 2.3)
6. Clinical Mode loads patient "Sarah Chen"

---

## Edge Cases & Error Handling

### Edge Case 1: Rapid Mode Switching

**Scenario**: User says "start training" then immediately "start assessment"

**Expected Behavior**:
- Mode Manager processes sequentially
- Training mode starts
- Clinical mode starts (auto-exits training)
- User hears "Training complete." followed by patient load confirmation

**Implementation**: No debounce needed - handle sequentially

### Edge Case 2: Exit Command While in IDLE

**Scenario**: User says "end assessment" while in IDLE mode

**Expected Behavior**:
- Mode Manager ignores command (already in IDLE)
- No confirmation message spoken

**Implementation**:
```javascript
function exitCurrentMode() {
  if (currentMode === config.MODE.IDLE) {
    return; // Already idle, do nothing
  }
  // ... rest of exit logic
}
```

### Edge Case 3: Inactivity Timer During User Activity

**Scenario**: User is actively recording symptoms in clinical mode, timer about to expire

**Expected Behavior**:
- Each user action calls `resetInactivityTimer()`
- Timer restarts from full duration (120s)
- Mode does NOT auto-exit while user is active

**Implementation**: Clinical Mode State Machine (Task 2.3) must call `resetInactivityTimer()` on every voice command

### Edge Case 4: Mode Switch During TTS Playback

**Scenario**: "Training complete." is being spoken, user says "start assessment"

**Expected Behavior**:
- TTS for "Training complete." continues
- Mode switches to clinical
- New mode initialization proceeds
- Acceptable overlap (minor UX imperfection)

**Implementation**: No special handling needed for MVP

### Edge Case 5: Invalid Mode String

**Scenario**: `switchMode('invalid_mode')` called (bug in voice parsing)

**Expected Behavior**:
- Log error
- Do NOT change mode
- System remains in current mode

**Implementation**:
```javascript
function switchMode(newMode) {
  var validModes = [config.MODE.IDLE, config.MODE.TRAINING, config.MODE.CLINICAL];
  var isValid = false;
  for (var i = 0; i < validModes.length; i++) {
    if (validModes[i] === newMode) {
      isValid = true;
      break;
    }
  }

  if (!isValid) {
    print("ERROR: Invalid mode: " + newMode);
    return; // Don't change mode
  }
  // ... rest of logic
}
```

### Edge Case 6: Timer Doesn't Fire (Lens Studio Bug)

**Scenario**: DelayedCallbackEvent fails to trigger

**Expected Behavior**:
- Fallback: Manual exit command still works
- User can always exit with "end training" / "end assessment"

**Implementation**: Manual exit commands always work regardless of timer state

---

## Performance Considerations

### Timer Overhead

**Concern**: Two simultaneous timers (training 10s + clinical 120s) might impact performance

**Reality**: Minimal impact - timers are native Lens Studio events, very lightweight

**Measurement**: No performance impact expected

### State Storage

**Concern**: `sessionData` object might grow large

**Reality**: Small object (5-10 properties max)

**Optimization**: Clear on mode exit (already implemented)

### TTS Latency

**Concern**: "Training complete." message delays mode switch

**Reality**: TTS is async, doesn't block mode transition

**Implementation**: Fire-and-forget TTS call

---

## Troubleshooting

### Issue 1: Tests Timeout (Tests 10-11)

**Cause**: Long-running tests (10s, 120s) not completing

**Solution**:
- Increase Jest timeout: `test('...', () => {...}, 125000)`
- Verify `done()` callback is called
- Check timer cleanup in `afterEach()`

### Issue 2: "MedSnapConfig not loaded"

**Cause**: `config.js` not running before `modeManager.js`

**Solution**:
1. Verify script execution order in Lens Studio
2. Ensure `config.js` is attached to Orthographic Camera (loads first)
3. Check Objects Panel script order

### Issue 3: Inactivity Timer Not Firing

**Cause**: Lens Studio `DelayedCallbackEvent` syntax error

**Solution**:
```javascript
// WRONG:
timerEvent.reset(10000); // Lens Studio uses SECONDS, not milliseconds

// CORRECT:
timerEvent.reset(10); // 10 seconds
```

**Note**: Convert `config.TIMEOUTS.TRAINING_AUTO_EXIT` (ms) to seconds: `timeout / 1000`

### Issue 4: Mode Doesn't Switch

**Cause**: `switchMode()` called but mode unchanged

**Debug**:
1. Check `script.debugMode = true` in Inspector
2. Look for "ModeManager: Switching from..." messages in Logger
3. Verify `currentMode` variable is being updated

**Common Bug**: Using `var currentMode` inside function instead of global scope

### Issue 5: TTS Message Not Spoken

**Cause**: TTS integration not implemented yet

**Expected for Task 2.1**: TTS is mocked - should only see `print("TTS: ...")` in Logger

**Real TTS**: Comes from Dev 3 integration (post-Hour 24)

### Issue 6: Session Data Persists Across Modes

**Cause**: `sessionData = {}` not clearing properly

**Solution**: Use empty object literal, not null:
```javascript
// CORRECT:
sessionData = {};

// WRONG:
sessionData = null; // Will cause errors on next access
```

---

## Validation & Testing

### Step 1: Run Unit Tests

From `backend/` directory:

```bash
npm test
```

Expected output:
```
PASS  tests/unit/modeManager.test.js
  Mode Manager
    ✓ Initial mode is IDLE (2 ms)
    ✓ switchMode() transitions from idle to training (3 ms)
    ✓ switchMode() transitions from idle to clinical (2 ms)
    ✓ switchMode() transitions from training to clinical (auto-exit training first per FR-12b) (5 ms)
    ✓ switchMode() transitions from clinical to training (auto-exit clinical first per FR-12b) (4 ms)
    ✓ autoExitOnSwitch() confirms "Training complete" before starting clinical mode (3 ms)
    ✓ autoExitOnSwitch() confirms "Assessment complete" before starting training mode (3 ms)
    ✓ exitCurrentMode() clears session data and resets state (2 ms)
    ✓ handleInactivity() checks mode-specific timeout (10s training, 120s clinical per FR-5a, FR-12a) (3 ms)
    ✓ handleInactivity() triggers auto-exit for training after 10 seconds (10105 ms)
    ✓ handleInactivity() triggers auto-exit for clinical after 120 seconds (120105 ms)
    ✓ confirmExit() speaks confirmation message based on mode (4 ms)
    ✓ resetInactivityTimer() restarts timer on user activity (120050 ms)
    ✓ switchMode() handles invalid mode gracefully (2 ms)

Test Suites: 4 passed, 4 total (includes Task 2.0 tests)
Tests:       43 passed, 43 total (13 from Task 2.0 + 16 from Task 2.2 + 14 new)
```

**Note**: Tests 10, 11, 13 take ~10s, ~120s, ~120s respectively due to timer delays

### Step 2: Manual Lens Studio Testing

Create test script `testModeManager.js`:

```javascript
// @input Component.ScriptComponent modeManagerScript

print("=== Mode Manager Manual Test ===");

// Test 1: Switch to training
print("Test 1: Switching to training mode");
script.modeManagerScript.switchMode('training');
print("Current mode: " + script.modeManagerScript.getCurrentMode());

// Test 2: Wait 3s, then switch to clinical (should auto-exit training)
var delay1 = script.createEvent("DelayedCallbackEvent");
delay1.bind(function() {
  print("Test 2: Switching to clinical (should auto-exit training)");
  script.modeManagerScript.switchMode('clinical');
  print("Current mode: " + script.modeManagerScript.getCurrentMode());
});
delay1.reset(3);

// Test 3: Wait 3s, then manually exit
var delay2 = script.createEvent("DelayedCallbackEvent");
delay2.bind(function() {
  print("Test 3: Manually exiting clinical mode");
  script.modeManagerScript.exitCurrentMode();
  print("Current mode: " + script.modeManagerScript.getCurrentMode());
});
delay2.reset(6);

// Test 4: Wait 3s, switch to training, wait 12s (should auto-exit)
var delay3 = script.createEvent("DelayedCallbackEvent");
delay3.bind(function() {
  print("Test 4: Switching to training, then waiting for auto-exit (10s)");
  script.modeManagerScript.switchMode('training');

  var delay4 = script.createEvent("DelayedCallbackEvent");
  delay4.bind(function() {
    print("After 12s, current mode: " + script.modeManagerScript.getCurrentMode());
    print("Expected: idle (auto-exited)");
  });
  delay4.reset(12);
});
delay3.reset(9);
```

**Expected Logger Output**:
```
=== Mode Manager Manual Test ===
Test 1: Switching to training mode
ModeManager: Switching from idle to training
ModeManager: Training mode initialized
Current mode: training

[3s later]
Test 2: Switching to clinical (should auto-exit training)
ModeManager: Exiting training mode
TTS: Training complete.
ModeManager: Switching from idle to clinical
ModeManager: Clinical mode initialized
Current mode: clinical

[3s later]
Test 3: Manually exiting clinical mode
ModeManager: Exiting clinical mode
TTS: Assessment complete.
Current mode: idle

[3s later]
Test 4: Switching to training, then waiting for auto-exit (10s)
ModeManager: Switching from idle to training
ModeManager: Training mode initialized

[12s later]
ModeManager: Inactivity timeout triggered
ModeManager: Exiting training mode
TTS: Training complete.
After 12s, current mode: idle
Expected: idle (auto-exited)
```

---

## Completion Checklist

Before considering Task 2.1 complete:

### TDD Workflow
- [ ] Step 2.1.1: Created `backend/tests/unit/modeManager.test.js` with 14 tests
- [ ] Step 2.1.2: Ran `npm test` and confirmed tests FAIL (before implementation)
- [ ] Step 2.1.3: Committed tests: `git commit -m "test: Add mode manager tests (Task 2.1 TDD Step 1)"`
- [ ] Step 2.1.4: Created `backend/lens-studio-mock/modeManager.js` (Node.js mock)
- [ ] Step 2.1.4: Updated `lens-studio/Public/Scripts/clinical/modeManager.js` (actual implementation)
- [ ] Step 2.1.5: Ran `npm test` and confirmed all 43 tests PASS (13 from Task 2.0 + 16 from Task 2.2 + 14 new)
- [ ] Step 2.1.6: Committed implementation: `git commit -m "feat: Implement mode manager (Task 2.1)"`

### Functional Testing
- [ ] Manual test in Lens Studio: Mode switches work
- [ ] Manual test: Training auto-exits after 10s inactivity
- [ ] Manual test: Clinical auto-exits after 120s inactivity
- [ ] Manual test: Direct mode switching (training → clinical) auto-exits training
- [ ] Manual test: Confirmation messages ("Training complete", "Assessment complete") appear in Logger
- [ ] Manual test: `resetInactivityTimer()` restarts timer on activity

### Requirements Coverage
- [ ] FR-5a: Training mode auto-exit after 10s inactivity
- [ ] FR-12a: Clinical mode auto-exit after 120s inactivity
- [ ] FR-12b: Direct mode switching without explicit exit
- [ ] Confirmation messages match spec exactly

### Edge Cases
- [ ] Handles invalid mode strings gracefully
- [ ] Handles exit command while in IDLE (no-op)
- [ ] Handles rapid mode switching sequentially
- [ ] Timer resets on user activity

### Documentation
- [ ] Code comments explain key functions
- [ ] Debug logging enabled
- [ ] Session data structure documented

### Git
- [ ] On `dev-2-clinical` branch
- [ ] 2 commits for Task 2.1 (tests + implementation)
- [ ] No uncommitted changes

---

## Next Steps

After Task 2.1 completion:

### Task 2.2: Patient Card Renderer (Hours 12-18)

**Dependencies on Task 2.1**:
- Mode Manager maintains clinical mode state
- Patient Card only renders when `isInClinicalMode() === true`

**Integration Points**:
```javascript
// In clinicalMode.js (Task 2.3)
if (modeManager.isInClinicalMode()) {
  patientCardRenderer.renderPatientCard(patientData);
}
```

### Task 2.3: Clinical Mode State Machine (Hours 18-30)

**Dependencies on Task 2.1**:
- Clinical Mode calls `modeManager.resetInactivityTimer()` on every user action
- Clinical Mode checks `modeManager.isInClinicalMode()` before executing commands

**Integration Points**:
```javascript
// In clinicalMode.js
function recordSymptom(symptom) {
  if (!modeManager.isInClinicalMode()) {
    print("ERROR: Not in clinical mode");
    return;
  }

  // Record symptom
  // ...

  // Reset inactivity timer
  modeManager.resetInactivityTimer();
}
```

---

## Appendix: Quick Reference

### Key Files Created/Modified

**New Files**:
- `backend/tests/unit/modeManager.test.js` (14 tests)
- `backend/lens-studio-mock/modeManager.js` (Node.js mock for testing)

**Modified Files**:
- `lens-studio/Public/Scripts/clinical/modeManager.js` (full implementation)
- `lens-studio/Public/Scripts/config.js` (added TRAINING_AUTO_EXIT, CLINICAL_AUTO_EXIT timeouts)

### Git Commits

1. `test: Add mode manager tests (Task 2.1 TDD Step 1)`
2. `feat: Implement mode manager (Task 2.1)`

### Time Breakdown (Estimated 6 hours)

- Hour 6-7: Write tests (2.1.1-2.1.3)
- Hour 7-8: Create Node.js mock
- Hour 8-10: Implement Lens Studio Mode Manager
- Hour 10-11: Manual testing in Lens Studio
- Hour 11-12: Fix bugs, polish, long-running test verification

### Critical Constants

```javascript
MODE: {
  IDLE: 'idle',
  TRAINING: 'training',
  CLINICAL: 'clinical'
}

TIMEOUTS: {
  TRAINING_AUTO_EXIT: 10000,   // 10 seconds (FR-5a)
  CLINICAL_AUTO_EXIT: 120000   // 120 seconds (FR-12a)
}
```

### Exported Functions

```javascript
script.switchMode(newMode)           // Primary function - handles all transitions
script.exitCurrentMode()             // Manual exit
script.getCurrentMode()              // Get current mode string
script.isInClinicalMode()           // Boolean check
script.isInTrainingMode()           // Boolean check
script.resetInactivityTimer()       // Called on user activity
script.getSessionData()             // Get current session data
script.setSessionData(data)         // Set session data
```

---

## Summary

Task 2.1 implements the **Mode Manager**, the orchestration layer for switching between IDLE, TRAINING, and CLINICAL modes. It follows TDD workflow, handles auto-exit with inactivity timers, supports direct mode switching per FR-12b, and speaks confirmation messages on exit.

**Key Deliverables**:
- ✅ 14 comprehensive Jest tests
- ✅ Node.js mock for testing
- ✅ Lens Studio Mode Manager with timers, auto-exit, confirmations
- ✅ Edge case handling (invalid modes, rapid switching)
- ✅ Full requirements coverage (FR-5a, FR-12a, FR-12b)

**Next**: Task 2.2 (Patient Card Renderer) will use Mode Manager's `isInClinicalMode()` to control card visibility, and Task 2.3 (Clinical Mode State Machine) will call `resetInactivityTimer()` on user activity.
