/**
 * Mode Manager Tests
 * Task Group 4: Mode Switching Logic
 */

// Import test setup
require('./testSetup');

// Mock dependencies
const mockClinicalMode = {
    initialize: jest.fn(() => true),
    cleanup: jest.fn(),
    handleCommand: jest.fn(() => true)
};

const mockTrainingMode = {
    initialize: jest.fn(() => true),
    cleanup: jest.fn(),
    handleCommand: jest.fn(() => true)
};

const mockStateManager = {
    clearState: jest.fn()
};

// Set up global mocks
global.clinicalMode = mockClinicalMode;
global.trainingMode = mockTrainingMode;
global.stateManager = mockStateManager;

// Import module under test
let modeManager;

describe('Mode Manager', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();

        // Reset and reload module
        delete require.cache[require.resolve('../modeManager.js')];
        require('../modeManager.js');
        modeManager = global.modeManager;
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    describe('4.1 - Mode Manager Core Tests', () => {
        test('Should switch from IDLE to CLINICAL mode', () => {
            // Initial state should be IDLE
            expect(modeManager.getCurrentMode()).toBe('IDLE');

            // Switch to CLINICAL
            const result = modeManager.switchMode('CLINICAL');

            expect(result).toBe(true);
            expect(modeManager.getCurrentMode()).toBe('CLINICAL');
            expect(mockClinicalMode.initialize).toHaveBeenCalled();
        });

        test('Should auto-exit from CLINICAL to IDLE after 120 seconds', () => {
            // Switch to CLINICAL
            modeManager.switchMode('CLINICAL');
            expect(modeManager.getCurrentMode()).toBe('CLINICAL');

            // Fast-forward 120 seconds
            jest.advanceTimersByTime(120000);

            // Should return to IDLE
            expect(modeManager.getCurrentMode()).toBe('IDLE');
            expect(mockClinicalMode.cleanup).toHaveBeenCalled();
        });

        test('Should maintain mode during operations', () => {
            // Switch to CLINICAL
            modeManager.switchMode('CLINICAL');

            // Perform some operations (reset timer)
            modeManager.resetInactivityTimer();

            // Fast-forward 60 seconds (less than timeout)
            jest.advanceTimersByTime(60000);

            // Should still be in CLINICAL
            expect(modeManager.getCurrentMode()).toBe('CLINICAL');

            // Reset again
            modeManager.resetInactivityTimer();

            // Fast-forward another 60 seconds
            jest.advanceTimersByTime(60000);

            // Should still be in CLINICAL (timer was reset)
            expect(modeManager.getCurrentMode()).toBe('CLINICAL');
        });

        test('Should cleanup properly on mode transitions', () => {
            // Switch to CLINICAL
            modeManager.switchMode('CLINICAL');
            expect(mockClinicalMode.initialize).toHaveBeenCalled();

            // Switch to TRAINING
            modeManager.switchMode('TRAINING');

            // Should cleanup CLINICAL and initialize TRAINING
            expect(mockClinicalMode.cleanup).toHaveBeenCalled();
            expect(mockTrainingMode.initialize).toHaveBeenCalled();
            expect(modeManager.getCurrentMode()).toBe('TRAINING');
        });

        test('Should prevent concurrent mode switches', () => {
            // Start with IDLE
            expect(modeManager.getCurrentMode()).toBe('IDLE');

            // Try to switch to same mode
            const result = modeManager.switchMode('IDLE');
            expect(result).toBe(true);
            expect(modeManager.getCurrentMode()).toBe('IDLE');

            // Switch to CLINICAL
            modeManager.switchMode('CLINICAL');

            // Try invalid mode
            const invalidResult = modeManager.switchMode('INVALID_MODE');
            expect(invalidResult).toBe(false);
            expect(modeManager.getCurrentMode()).toBe('CLINICAL');
        });
    });

    describe('Voice Command Handling', () => {
        test('Should handle mode switching voice commands', () => {
            // Start assessment command
            const result1 = modeManager.handleVoiceCommand('start assessment Sarah Chen');
            expect(result1).toBe(true);
            expect(modeManager.getCurrentMode()).toBe('CLINICAL');

            // End assessment command
            const result2 = modeManager.handleVoiceCommand('end assessment');
            expect(result2).toBe(true);
            expect(modeManager.getCurrentMode()).toBe('IDLE');

            // Start training command
            const result3 = modeManager.handleVoiceCommand('start training pulse');
            expect(result3).toBe(true);
            expect(modeManager.getCurrentMode()).toBe('TRAINING');
        });

        test('Should route commands to appropriate mode handler', () => {
            // Switch to CLINICAL
            modeManager.switchMode('CLINICAL');

            // Send a clinical command
            modeManager.handleVoiceCommand('record symptom headache');
            expect(mockClinicalMode.handleCommand).toHaveBeenCalledWith('record symptom headache');

            // Switch to TRAINING
            modeManager.switchMode('TRAINING');

            // Send a training command
            modeManager.handleVoiceCommand('show pulse point');
            expect(mockTrainingMode.handleCommand).toHaveBeenCalledWith('show pulse point');
        });

        test('Should reset inactivity timer on voice commands', () => {
            // Switch to CLINICAL
            modeManager.switchMode('CLINICAL');

            // Fast-forward 100 seconds
            jest.advanceTimersByTime(100000);

            // Send a command (should reset timer)
            modeManager.handleVoiceCommand('show medications');

            // Fast-forward another 100 seconds
            jest.advanceTimersByTime(100000);

            // Should still be in CLINICAL (timer was reset at 100s)
            expect(modeManager.getCurrentMode()).toBe('CLINICAL');

            // Fast-forward final 20+ seconds to trigger timeout
            jest.advanceTimersByTime(21000);

            // Now should return to IDLE
            expect(modeManager.getCurrentMode()).toBe('IDLE');
        });
    });

    describe('Mode Change Callbacks', () => {
        test('Should notify listeners on mode changes', () => {
            const callback = jest.fn();
            modeManager.onModeChange(callback);

            // Switch modes
            modeManager.switchMode('CLINICAL');

            expect(callback).toHaveBeenCalledWith('IDLE', 'CLINICAL');

            // Switch again
            modeManager.switchMode('TRAINING');

            expect(callback).toHaveBeenCalledWith('CLINICAL', 'TRAINING');
            expect(callback).toHaveBeenCalledTimes(2);
        });

        test('Should handle callback errors gracefully', () => {
            const errorCallback = jest.fn(() => {
                throw new Error('Callback error');
            });
            const goodCallback = jest.fn();

            modeManager.onModeChange(errorCallback);
            modeManager.onModeChange(goodCallback);

            // Switch mode - should not throw
            expect(() => {
                modeManager.switchMode('CLINICAL');
            }).not.toThrow();

            // Good callback should still be called
            expect(goodCallback).toHaveBeenCalledWith('IDLE', 'CLINICAL');
        });
    });

    describe('Edge Cases', () => {
        test('Should handle missing mode implementations gracefully', () => {
            // Remove clinical mode
            global.clinicalMode = null;

            // Try to switch to CLINICAL
            const result = modeManager.switchMode('CLINICAL');

            expect(result).toBe(false);
            expect(modeManager.getCurrentMode()).toBe('IDLE');
        });

        test('Should clear state on return to IDLE', () => {
            // Switch to CLINICAL
            modeManager.switchMode('CLINICAL');

            // Return to IDLE
            modeManager.exitToIdle();

            expect(mockStateManager.clearState).toHaveBeenCalled();
            expect(modeManager.getCurrentMode()).toBe('IDLE');
        });
    });
});

console.log('[ModeManager Tests] Test suite loaded');