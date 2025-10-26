// Training Mode Tests - Hand Tracking & State Machine
// Following TDD principles - tests written before implementation

describe('TrainingMode', () => {
    let trainingMode;
    let mockHandProvider;
    let mockArOverlay;
    let mockApiClient;
    let mockAudioComponent;

    beforeEach(() => {
        // Setup mocks
        mockHandProvider = {
            getHand: jest.fn().mockReturnValue({
                isTracked: jest.fn(),
                isFacingCamera: jest.fn(),
                getWristPosition: jest.fn()
            })
        };

        mockArOverlay = {
            showPulsePoint: jest.fn(),
            hidePulsePoint: jest.fn(),
            showDirectionArrow: jest.fn(),
            hideDirectionArrow: jest.fn(),
            fadeIn: jest.fn(),
            fadeOut: jest.fn()
        };

        mockApiClient = {
            startTraining: jest.fn().mockResolvedValue({ success: true }),
            sendFeedback: jest.fn().mockResolvedValue({ feedback: 'Good technique' })
        };

        mockAudioComponent = {
            play: jest.fn(),
            stop: jest.fn()
        };

        // Will be initialized with TrainingMode class
        trainingMode = null;
    });

    describe('Hand Tracking Integration', () => {
        it('should detect wrist with confidence threshold of 0.7', () => {
            // Arrange
            const mockHand = {
                isTracked: () => true,
                getConfidence: () => 0.8,
                getWristLandmark: () => ({ x: 0.5, y: 0.5, z: 0.1 })
            };

            // Act
            const result = trainingMode.detectWrist(mockHand);

            // Assert
            expect(result.detected).toBe(true);
            expect(result.confidence).toBeGreaterThanOrEqual(0.7);
            expect(result.position).toBeDefined();
        });

        it('should validate finger position on radial pulse point', () => {
            // Arrange
            const wristPosition = { x: 0.5, y: 0.5, z: 0.1 };
            const fingerPosition = { x: 0.48, y: 0.52, z: 0.08 }; // Close to radial position

            // Act
            const result = trainingMode.validateFingerPosition(wristPosition, fingerPosition);

            // Assert
            expect(result.isValid).toBe(true);
            expect(result.distance).toBeLessThan(0.05); // Within 5cm tolerance
        });

        it('should detect pressure using z-axis velocity', () => {
            // Arrange
            const positions = [
                { z: 0.10, timestamp: 0 },
                { z: 0.08, timestamp: 100 },
                { z: 0.06, timestamp: 200 }
            ];

            // Act
            const pressure = trainingMode.estimatePressure(positions);

            // Assert
            expect(pressure).toBe('moderate'); // Moving toward wrist = pressure
            expect(pressure).not.toBe('none');
        });

        it('should position AR overlay on radial pulse point', () => {
            // Arrange
            const wristLandmark = { x: 0.5, y: 0.5, z: 0.1 };
            const expectedRadialOffset = { x: -0.03, y: 0.02 }; // Thumb side offset

            // Act
            trainingMode.positionOverlay(wristLandmark);

            // Assert
            expect(mockArOverlay.showPulsePoint).toHaveBeenCalledWith(
                expect.objectContaining({
                    x: wristLandmark.x + expectedRadialOffset.x,
                    y: wristLandmark.y + expectedRadialOffset.y,
                    color: '#00FFFF',
                    opacity: 0.5
                })
            );
        });

        it('should show directional arrow for guidance', () => {
            // Arrange
            const currentFingerPos = { x: 0.5, y: 0.5 };
            const targetPos = { x: 0.47, y: 0.52 };

            // Act
            trainingMode.showGuidanceArrow(currentFingerPos, targetPos);

            // Assert
            expect(mockArOverlay.showDirectionArrow).toHaveBeenCalledWith(
                expect.objectContaining({
                    color: '#FFFF00',
                    direction: expect.any(Object)
                })
            );
        });
    });

    describe('Training State Machine', () => {
        it('should progress through all 7 training steps', async () => {
            // Arrange
            const expectedStates = [
                'IDLE',
                'STARTING',
                'DETECTING_WRIST',
                'POSITIONING_FINGERS',
                'CHECKING_PRESSURE',
                'COUNTING_PULSE',
                'WAITING_FOR_RESPONSE',
                'COMPLETE'
            ];

            // Act
            await trainingMode.start();
            const states = trainingMode.getStateHistory();

            // Assert
            expect(states).toEqual(expectedStates);
        });

        it('should provide corrective feedback for positioning errors', () => {
            // Arrange
            const incorrectPosition = { x: 0.6, y: 0.6 }; // Too far from pulse point

            // Act
            const feedback = trainingMode.getPositionFeedback(incorrectPosition);

            // Assert
            expect(feedback).toContain('Move 2cm toward thumb');
        });

        it('should handle 15-second pulse counting timer', async () => {
            // Arrange
            jest.useFakeTimers();

            // Act
            trainingMode.startCounting();
            jest.advanceTimersByTime(15000);

            // Assert
            expect(trainingMode.state).toBe('WAITING_FOR_RESPONSE');
            expect(mockAudioComponent.play).toHaveBeenCalledWith(
                expect.stringContaining('Time. What was your count?')
            );
        });

        it('should validate BPM in normal range (60-100)', () => {
            // Arrange
            const testCases = [
                { bpm: 45, expected: 'low' },
                { bpm: 72, expected: 'normal' },
                { bpm: 120, expected: 'high' }
            ];

            testCases.forEach(({ bpm, expected }) => {
                // Act
                const result = trainingMode.validateBPM(bpm);

                // Assert
                expect(result.range).toBe(expected);
            });
        });

        it('should auto-exit after 10 seconds of inactivity', async () => {
            // Arrange
            jest.useFakeTimers();
            trainingMode.completeTraining();

            // Act
            jest.advanceTimersByTime(10000);

            // Assert
            expect(trainingMode.state).toBe('IDLE');
            expect(trainingMode.isActive).toBe(false);
        });
    });

    describe('Error Handling & Retry Logic', () => {
        it('should retry CV detection for 10 seconds on failure', async () => {
            // Arrange
            jest.useFakeTimers();
            mockHandProvider.getHand.mockReturnValue({
                isTracked: () => false
            });

            // Act
            trainingMode.startDetection();
            jest.advanceTimersByTime(10000);

            // Assert
            expect(trainingMode.retryAttempts).toBeGreaterThan(5);
            expect(trainingMode.shouldOfferSkip).toBe(true);
        });

        it('should allow manual skip after retry timeout', () => {
            // Arrange
            trainingMode.retryTimeoutReached = true;

            // Act
            const result = trainingMode.skipDetection();

            // Assert
            expect(result.skipped).toBe(true);
            expect(trainingMode.state).toBe('POSITIONING_FINGERS');
        });

        it('should gracefully degrade without blocking workflow', async () => {
            // Arrange
            mockHandProvider.getHand.mockReturnValue(null); // Simulate failure

            // Act
            const result = await trainingMode.continueWithoutCV();

            // Assert
            expect(result.success).toBe(true);
            expect(result.mode).toBe('manual');
        });
    });

    describe('Performance Validation', () => {
        it('should maintain 30+ FPS during tracking', () => {
            // Arrange
            const frameTimings = [];
            for (let i = 0; i < 100; i++) {
                const start = performance.now();
                trainingMode.update();
                frameTimings.push(performance.now() - start);
            }

            // Act
            const avgFrameTime = frameTimings.reduce((a, b) => a + b) / frameTimings.length;
            const fps = 1000 / avgFrameTime;

            // Assert
            expect(fps).toBeGreaterThanOrEqual(30);
        });

        it('should detect hand within 500ms latency', async () => {
            // Arrange
            const startTime = performance.now();

            // Act
            await trainingMode.detectWrist();
            const latency = performance.now() - startTime;

            // Assert
            expect(latency).toBeLessThan(500);
        });
    });
});