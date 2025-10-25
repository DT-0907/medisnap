/**
 * Unit Tests for Mode Manager (Task 2.1)
 * Test-Driven Development (TDD) - Step 1: Write Tests First
 *
 * Requirements Coverage:
 * - FR-5a: Training auto-exit after 10s inactivity
 * - FR-12a: Clinical auto-exit after 120s inactivity
 * - FR-12b: Direct mode switching auto-exits current mode
 * - Confirmation messages via TTS
 * - Session data cleanup on mode exit
 */

describe('Mode Manager', () => {
  let modeManager;
  let mockTTSService;

  beforeEach(() => {
    // Mock TTS service
    mockTTSService = {
      speak: jest.fn()
    };

    // Import ModeManager mock
    const ModeManager = require('../../lens-studio-mock/modeManager');
    modeManager = new ModeManager(mockTTSService);
  });

  afterEach(() => {
    // Clean up any running timers
    if (modeManager.state.inactivityTimer) {
      clearTimeout(modeManager.state.inactivityTimer);
    }
  });

  // ===================================================================
  // Test Group 1: Mode Switching (FR-12b)
  // ===================================================================

  describe('Mode Switching', () => {
    test('1.1: Should initialize in IDLE mode', () => {
      expect(modeManager.getCurrentMode()).toBe('idle');
      expect(modeManager.isInClinicalMode()).toBe(false);
    });

    test('1.2: Should switch from IDLE to TRAINING mode', () => {
      modeManager.switchMode('training');

      expect(modeManager.getCurrentMode()).toBe('training');
      expect(modeManager.isInClinicalMode()).toBe(false);
      expect(modeManager.state.inactivityTimer).not.toBeNull();
    });

    test('1.3: Should switch from IDLE to CLINICAL mode', () => {
      modeManager.switchMode('clinical');

      expect(modeManager.getCurrentMode()).toBe('clinical');
      expect(modeManager.isInClinicalMode()).toBe(true);
      expect(modeManager.state.inactivityTimer).not.toBeNull();
    });

    test('1.4: Should auto-exit TRAINING when switching to CLINICAL (FR-12b)', () => {
      // Enter training mode
      modeManager.switchMode('training');
      expect(modeManager.getCurrentMode()).toBe('training');

      // Switch to clinical - should auto-exit training first
      modeManager.switchMode('clinical');

      expect(modeManager.getCurrentMode()).toBe('clinical');
      expect(mockTTSService.speak).toHaveBeenCalledWith('Training complete.');
      expect(mockTTSService.speak).toHaveBeenCalledTimes(1);
    });

    test('1.5: Should auto-exit CLINICAL when switching to TRAINING (FR-12b)', () => {
      // Enter clinical mode
      modeManager.switchMode('clinical');
      expect(modeManager.getCurrentMode()).toBe('clinical');

      // Switch to training - should auto-exit clinical first
      modeManager.switchMode('training');

      expect(modeManager.getCurrentMode()).toBe('training');
      expect(mockTTSService.speak).toHaveBeenCalledWith('Assessment complete.');
      expect(mockTTSService.speak).toHaveBeenCalledTimes(1);
    });

    test('1.6: Should allow switching back to IDLE from any mode', () => {
      // From training
      modeManager.switchMode('training');
      modeManager.switchMode('idle');
      expect(modeManager.getCurrentMode()).toBe('idle');
      expect(mockTTSService.speak).toHaveBeenCalledWith('Training complete.');

      // Reset mock
      mockTTSService.speak.mockClear();

      // From clinical
      modeManager.switchMode('clinical');
      modeManager.switchMode('idle');
      expect(modeManager.getCurrentMode()).toBe('idle');
      expect(mockTTSService.speak).toHaveBeenCalledWith('Assessment complete.');
    });
  });

  // ===================================================================
  // Test Group 2: Inactivity Timers
  // ===================================================================

  describe('Inactivity Timers', () => {
    test('2.1: Should auto-exit TRAINING after 10s inactivity (FR-5a)', (done) => {
      modeManager.switchMode('training');
      expect(modeManager.getCurrentMode()).toBe('training');

      // Wait for auto-exit (10s timeout)
      setTimeout(() => {
        expect(modeManager.getCurrentMode()).toBe('idle');
        expect(mockTTSService.speak).toHaveBeenCalledWith('Training complete.');
        done();
      }, 10100); // 10s + 100ms buffer
    }, 15000); // Jest timeout extended to 15s

    test('2.2: Should auto-exit CLINICAL after 120s inactivity (FR-12a)', (done) => {
      modeManager.switchMode('clinical');
      expect(modeManager.getCurrentMode()).toBe('clinical');

      // Wait for auto-exit (120s timeout)
      setTimeout(() => {
        expect(modeManager.getCurrentMode()).toBe('idle');
        expect(mockTTSService.speak).toHaveBeenCalledWith('Assessment complete.');
        done();
      }, 120100); // 120s + 100ms buffer
    }, 125000); // Jest timeout extended to 125s

    test('2.3: Should reset timer on activity in TRAINING mode', (done) => {
      modeManager.switchMode('training');

      // Simulate activity after 5s
      setTimeout(() => {
        modeManager.resetInactivityTimer();
        expect(modeManager.getCurrentMode()).toBe('training'); // Still in training
      }, 5000);

      // Check after original 10s - should still be in training (timer reset)
      setTimeout(() => {
        expect(modeManager.getCurrentMode()).toBe('training');
      }, 10500);

      // Check after 15s total - should now be idle (5s activity + 10s timeout)
      setTimeout(() => {
        expect(modeManager.getCurrentMode()).toBe('idle');
        done();
      }, 15100);
    }, 20000);

    test('2.4: Should clear timer when manually exiting mode', () => {
      modeManager.switchMode('training');
      const timerId = modeManager.state.inactivityTimer;
      expect(timerId).not.toBeNull();

      modeManager.switchMode('idle');
      expect(modeManager.state.inactivityTimer).toBeNull();
    });
  });

  // ===================================================================
  // Test Group 3: Session Data Management
  // ===================================================================

  describe('Session Data Management', () => {
    test('3.1: Should initialize session data when entering TRAINING mode', () => {
      modeManager.switchMode('training');

      expect(modeManager.state.sessionData).toBeDefined();
      expect(modeManager.state.sessionData.mode).toBe('training');
      expect(modeManager.state.sessionData.startTime).toBeDefined();
    });

    test('3.2: Should initialize session data when entering CLINICAL mode', () => {
      modeManager.switchMode('clinical');

      expect(modeManager.state.sessionData).toBeDefined();
      expect(modeManager.state.sessionData.mode).toBe('clinical');
      expect(modeManager.state.sessionData.startTime).toBeDefined();
    });

    test('3.3: Should clear session data when exiting mode', () => {
      modeManager.switchMode('training');
      expect(modeManager.state.sessionData.mode).toBe('training');

      modeManager.switchMode('idle');
      expect(modeManager.state.sessionData).toEqual({});
    });

    test('3.4: Should preserve session data during mode (before exit)', () => {
      modeManager.switchMode('clinical');
      const startTime = modeManager.state.sessionData.startTime;

      // Simulate activity
      modeManager.resetInactivityTimer();

      // Session data should remain intact
      expect(modeManager.state.sessionData.startTime).toBe(startTime);
      expect(modeManager.state.sessionData.mode).toBe('clinical');
    });
  });

  // ===================================================================
  // Test Group 4: Confirmation Messages
  // ===================================================================

  describe('Confirmation Messages', () => {
    test('4.1: Should speak "Training complete." when exiting training (FR-5a)', () => {
      modeManager.switchMode('training');
      mockTTSService.speak.mockClear(); // Clear any initialization calls

      modeManager.exitCurrentMode();

      expect(mockTTSService.speak).toHaveBeenCalledWith('Training complete.');
      expect(mockTTSService.speak).toHaveBeenCalledTimes(1);
    });

    test('4.2: Should speak "Assessment complete." when exiting clinical (FR-12a)', () => {
      modeManager.switchMode('clinical');
      mockTTSService.speak.mockClear(); // Clear any initialization calls

      modeManager.exitCurrentMode();

      expect(mockTTSService.speak).toHaveBeenCalledWith('Assessment complete.');
      expect(mockTTSService.speak).toHaveBeenCalledTimes(1);
    });

    test('4.3: Should not speak confirmation when already in IDLE', () => {
      expect(modeManager.getCurrentMode()).toBe('idle');

      modeManager.exitCurrentMode();

      expect(mockTTSService.speak).not.toHaveBeenCalled();
    });
  });
});
