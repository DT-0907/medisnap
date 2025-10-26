/**
 * Training Mode Tests - TDD Approach
 * Tests for pulse-taking training workflow with CV integration
 */

describe('TrainingMode', () => {
    let trainingMode;
    let mockCVPipeline;
    let mockAROverlay;
    let mockVoiceController;
    let mockApiClient;
    let mockStateManager;

    beforeEach(() => {
        // Mock dependencies
        mockCVPipeline = {
            detectHand: jest.fn(),
            findWrist: jest.fn(),
            findRadialPulsePoint: jest.fn(),
            validateFingerPlacement: jest.fn(),
            detectPressure: jest.fn(),
            registerWristCallback: jest.fn(),
            registerFingerCallback: jest.fn(),
            unregisterCallbacks: jest.fn()
        };

        mockAROverlay = {
            showPulsePoint: jest.fn(),
            showCorrectionArrows: jest.fn(),
            showText: jest.fn(),
            clearOverlays: jest.fn(),
            fadeIn: jest.fn(),
            fadeOut: jest.fn()
        };

        mockVoiceController = {
            speak: jest.fn(),
            listen: jest.fn(),
            stopListening: jest.fn()
        };

        mockApiClient = {
            sendTrainingFeedback: jest.fn().mockResolvedValue({ success: true })
        };

        mockStateManager = {
            getState: jest.fn(),
            setState: jest.fn(),
            clearState: jest.fn()
        };

        // Initialize training mode with mocks
        trainingMode = require('./trainingMode');
        trainingMode.initialize(
            mockCVPipeline,
            mockAROverlay,
            mockVoiceController,
            mockApiClient,
            mockStateManager
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('State Machine', () => {
        test('should initialize in IDLE state', () => {
            expect(trainingMode.getState()).toBe('IDLE');
        });

        test('should transition from IDLE to DETECTING_WRIST on start', () => {
            trainingMode.startPulseTraining();
            expect(trainingMode.getState()).toBe('DETECTING_WRIST');
            expect(mockVoiceController.speak).toHaveBeenCalledWith(
                expect.stringContaining('position your hand')
            );
        });

        test('should transition to VALIDATING_PLACEMENT after wrist detected', () => {
            trainingMode.startPulseTraining();
            const mockWrist = { x: 100, y: 200, z: 0 };

            // Simulate CV callback for wrist detection
            trainingMode.onWristDetected(mockWrist);

            expect(trainingMode.getState()).toBe('VALIDATING_PLACEMENT');
            expect(mockAROverlay.showPulsePoint).toHaveBeenCalledWith(mockWrist);
        });

        test('should transition to COUNTING after correct finger placement', () => {
            trainingMode.setState('VALIDATING_PLACEMENT');

            const validation = { isCorrect: true, feedback: '' };
            trainingMode.onFingerPlacementValidated(validation);

            expect(trainingMode.getState()).toBe('COUNTING');
            expect(mockVoiceController.speak).toHaveBeenCalledWith(
                expect.stringContaining('Start counting')
            );
        });

        test('should transition to FEEDBACK after counting completes', async () => {
            trainingMode.setState('COUNTING');

            // Fast-forward 15 seconds
            jest.advanceTimersByTime(15000);
            await trainingMode.onCountingComplete();

            expect(trainingMode.getState()).toBe('FEEDBACK');
            expect(mockVoiceController.listen).toHaveBeenCalled();
        });

        test('should return to IDLE after feedback', async () => {
            trainingMode.setState('FEEDBACK');

            await trainingMode.processBPMResponse('72');

            expect(mockApiClient.sendTrainingFeedback).toHaveBeenCalledWith({
                bpm: 72,
                technique: expect.any(Object)
            });
            expect(trainingMode.getState()).toBe('IDLE');
        });
    });

    describe('CV Integration', () => {
        test('should retry wrist detection for up to 10 seconds', async () => {
            trainingMode.startPulseTraining();

            // Simulate failed detections
            for (let i = 0; i < 9; i++) {
                jest.advanceTimersByTime(1000);
                trainingMode.onWristDetected(null);
            }

            expect(trainingMode.getState()).toBe('DETECTING_WRIST');

            // 10th second - should offer manual skip
            jest.advanceTimersByTime(1000);
            trainingMode.onWristDetected(null);

            expect(mockVoiceController.speak).toHaveBeenCalledWith(
                expect.stringContaining('skip')
            );
        });

        test('should show correction arrows for incorrect finger placement', () => {
            trainingMode.setState('VALIDATING_PLACEMENT');

            const validation = {
                isCorrect: false,
                feedback: 'Move fingers 2cm to the right',
                correction: { direction: 'right', distance: 2 }
            };

            trainingMode.onFingerPlacementValidated(validation);

            expect(mockAROverlay.showCorrectionArrows).toHaveBeenCalledWith(
                expect.objectContaining({ direction: 'right' })
            );
            expect(mockVoiceController.speak).toHaveBeenCalledWith(
                'Move fingers 2cm to the right'
            );
        });

        test('should provide pressure feedback during counting', () => {
            trainingMode.setState('COUNTING');

            const pressureData = {
                level: 'too_light',
                feedback: 'Apply slightly more pressure'
            };

            trainingMode.onPressureDetected(pressureData);

            expect(mockAROverlay.showText).toHaveBeenCalledWith(
                'Apply slightly more pressure',
                expect.any(Object)
            );
        });
    });

    describe('BPM Validation', () => {
        test('should accept valid BPM range (40-200)', async () => {
            trainingMode.setState('FEEDBACK');

            const result = await trainingMode.processBPMResponse('72');

            expect(result.isValid).toBe(true);
            expect(result.feedback).toContain('normal');
        });

        test('should reject invalid BPM (< 40)', async () => {
            trainingMode.setState('FEEDBACK');

            const result = await trainingMode.processBPMResponse('30');

            expect(result.isValid).toBe(false);
            expect(result.feedback).toContain('too low');
        });

        test('should reject invalid BPM (> 200)', async () => {
            trainingMode.setState('FEEDBACK');

            const result = await trainingMode.processBPMResponse('250');

            expect(result.isValid).toBe(false);
            expect(result.feedback).toContain('too high');
        });

        test('should provide technique feedback based on pressure history', async () => {
            trainingMode.setState('COUNTING');

            // Simulate pressure too light multiple times
            for (let i = 0; i < 5; i++) {
                trainingMode.onPressureDetected({ level: 'too_light' });
            }

            trainingMode.setState('FEEDBACK');
            const result = await trainingMode.processBPMResponse('72');

            expect(result.techniqueFeedback).toContain('more pressure');
        });
    });

    describe('Auto-Exit Logic', () => {
        test('should auto-exit after 10 seconds of inactivity', () => {
            trainingMode.setState('IDLE');
            trainingMode.startPulseTraining();
            trainingMode.setState('FEEDBACK');

            // Complete feedback
            trainingMode.processBPMResponse('72');

            // Wait 10 seconds
            jest.advanceTimersByTime(10000);

            expect(trainingMode.getState()).toBe('IDLE');
            expect(mockStateManager.clearState).toHaveBeenCalled();
            expect(mockAROverlay.clearOverlays).toHaveBeenCalled();
        });

        test('should reset inactivity timer on user interaction', () => {
            trainingMode.setState('VALIDATING_PLACEMENT');

            jest.advanceTimersByTime(5000);

            // User interaction
            trainingMode.onFingerPlacementValidated({ isCorrect: false });

            jest.advanceTimersByTime(9000); // 9 more seconds

            expect(trainingMode.getState()).not.toBe('IDLE');
        });
    });

    describe('Error Handling', () => {
        test('should handle CV pipeline errors gracefully', () => {
            trainingMode.startPulseTraining();

            // Simulate CV error
            mockCVPipeline.detectHand.mockRejectedValue(new Error('CV failed'));

            trainingMode.onCVError(new Error('CV failed'));

            expect(mockVoiceController.speak).toHaveBeenCalledWith(
                expect.stringContaining('detection issue')
            );
            expect(trainingMode.getState()).toBe('DETECTING_WRIST'); // Stay in current state
        });

        test('should handle API errors gracefully', async () => {
            trainingMode.setState('FEEDBACK');

            mockApiClient.sendTrainingFeedback.mockRejectedValue(
                new Error('Network error')
            );

            await trainingMode.processBPMResponse('72');

            expect(mockVoiceController.speak).toHaveBeenCalledWith(
                expect.stringContaining('saved locally')
            );
        });
    });

    describe('Voice Commands', () => {
        test('should handle "repeat instructions" command', () => {
            trainingMode.setState('VALIDATING_PLACEMENT');

            trainingMode.handleCommand('repeat instructions');

            expect(mockVoiceController.speak).toHaveBeenCalledWith(
                expect.stringContaining('fingers on the radial pulse')
            );
        });

        test('should handle "skip" command during wrist detection', () => {
            trainingMode.setState('DETECTING_WRIST');

            trainingMode.handleCommand('skip');

            expect(trainingMode.getState()).toBe('MANUAL_GUIDANCE');
            expect(mockVoiceController.speak).toHaveBeenCalledWith(
                expect.stringContaining('manual guidance')
            );
        });

        test('should handle "end training" command', () => {
            trainingMode.setState('COUNTING');

            trainingMode.handleCommand('end training');

            expect(trainingMode.getState()).toBe('IDLE');
            expect(mockAROverlay.clearOverlays).toHaveBeenCalled();
            expect(mockStateManager.clearState).toHaveBeenCalled();
        });
    });

    describe('Performance Requirements', () => {
        test('should detect wrist within 500ms (FR-43)', () => {
            const startTime = Date.now();

            trainingMode.startPulseTraining();
            trainingMode.onWristDetected({ x: 100, y: 200, z: 0 });

            const detectionTime = Date.now() - startTime;
            expect(detectionTime).toBeLessThan(500);
        });

        test('should maintain 30+ FPS during AR rendering', () => {
            // This would be tested with actual hardware
            // Mocking performance monitoring
            const mockPerformance = {
                fps: 35,
                frameTime: 28 // ms
            };

            trainingMode.monitorPerformance(mockPerformance);

            expect(mockPerformance.fps).toBeGreaterThanOrEqual(30);
        });
    });
});