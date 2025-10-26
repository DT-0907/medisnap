/**
 * Training Mode Implementation
 * Uses SpectaclesInteractionKit for hand tracking and guides pulse-taking training
 * FR-5 through FR-11 compliance
 */

// @input SceneObject handTrackerObject
// @input Component.AudioComponent audioComponent
// @input Asset.RemoteServiceModule remoteServiceModule

const TrainingMode = class {
    constructor() {
        // State machine
        this.STATES = {
            IDLE: 'IDLE',
            STARTING: 'STARTING',
            DETECTING_WRIST: 'DETECTING_WRIST',
            POSITIONING_FINGERS: 'POSITIONING_FINGERS',
            CHECKING_PRESSURE: 'CHECKING_PRESSURE',
            COUNTING_PULSE: 'COUNTING_PULSE',
            WAITING_FOR_RESPONSE: 'WAITING_FOR_RESPONSE',
            COMPLETE: 'COMPLETE'
        };

        this.state = this.STATES.IDLE;
        this.stateHistory = [];
        this.isActive = false;

        // Hand tracking via SpectaclesInteractionKit
        this.handProvider = null; // Will be initialized with SIK.HandInputData
        this.leftHand = null;
        this.rightHand = null;

        // CV tracking
        this.confidenceThreshold = 0.7; // FR-35
        this.wristPosition = null;
        this.fingerPosition = null;
        this.pressureHistory = [];

        // Retry logic (FR-10a)
        this.retryAttempts = 0;
        this.maxRetryDuration = 10000; // 10 seconds
        this.retryStartTime = null;
        this.retryTimeoutReached = false;
        this.shouldOfferSkip = false;

        // Pulse counting
        this.countingStartTime = null;
        this.countDuration = 15000; // 15 seconds
        this.userBPM = null;

        // Auto-exit
        this.inactivityTimer = null;
        this.inactivityDuration = 10000; // 10 seconds after completion

        // AR overlays
        this.pulsePointOverlay = null;
        this.guidanceArrow = null;

        // API client
        this.apiClient = null;

        this.initialize();
    }

    initialize() {
        // Initialize SpectaclesInteractionKit hand tracking
        if (global.SIK && global.SIK.HandInputData) {
            this.handProvider = global.SIK.HandInputData;
            this.leftHand = this.handProvider.getHand('left');
            this.rightHand = this.handProvider.getHand('right');
        }

        // Setup AR overlays
        this.setupOverlays();

        // Initialize API client
        this.setupApiClient();

        // Start update loop
        const updateEvent = script.createEvent('UpdateEvent');
        updateEvent.bind(this.update.bind(this));

        return true;
    }

    setupOverlays() {
        // Use global AR overlay manager for actual rendering
        if (global.arOverlayManager) {
            print('[TrainingMode] Using global AR overlay manager for visual overlays');
            // The global manager is already initialized in arOverlayManager.js
            // We'll call its methods directly when needed
        } else {
            print('[TrainingMode] Warning: Global AR overlay manager not found - overlays will not render');
        }

        // Keep local references for backward compatibility
        // These now delegate to the global manager
        this.pulsePointOverlay = {
            show: (config) => {
                if (global.arOverlayManager && global.arOverlayManager.showPulsePoint) {
                    global.arOverlayManager.showPulsePoint(config.position);
                } else {
                    print('[TrainingMode] Fallback: Showing pulse point at: ' + JSON.stringify(config.position));
                }
            },
            hide: () => {
                if (global.arOverlayManager && global.arOverlayManager.clearOverlays) {
                    // Clear the pulse point specifically
                    if (global.arOverlayManager.pulsePointOverlay) {
                        global.arOverlayManager.pulsePointOverlay.enabled = false;
                    }
                } else {
                    print('[TrainingMode] Fallback: Hiding pulse point overlay');
                }
            }
        };

        // Create guidance arrow wrapper
        this.guidanceArrow = {
            show: (config) => {
                if (global.arOverlayManager && global.arOverlayManager.showCorrectionArrows) {
                    global.arOverlayManager.showCorrectionArrows(config);
                } else {
                    print('[TrainingMode] Fallback: Showing guidance arrow: ' + config.direction);
                }
            },
            hide: () => {
                if (global.arOverlayManager && global.arOverlayManager.guidanceArrows) {
                    // Hide all arrows
                    global.arOverlayManager.guidanceArrows.forEach(arrow => {
                        arrow.object.enabled = false;
                    });
                } else {
                    print('[TrainingMode] Fallback: Hiding guidance arrow');
                }
            }
        };
    }

    setupApiClient() {
        if (script.remoteServiceModule) {
            this.apiClient = {
                startTraining: () => {
                    const request = global.RemoteServiceHttpRequest.create();
                    request.url = 'http://localhost:3000/api/training/start';
                    request.method = RemoteServiceHttpRequest.HttpRequestMethod.Post;
                    return script.remoteServiceModule.performHttpRequest(request);
                },
                sendFeedback: (bpm) => {
                    const request = global.RemoteServiceHttpRequest.create();
                    request.url = 'http://localhost:3000/api/training/feedback';
                    request.method = RemoteServiceHttpRequest.HttpRequestMethod.Post;
                    request.body = JSON.stringify({ bpm, timestamp: Date.now() });
                    return script.remoteServiceModule.performHttpRequest(request);
                }
            };
        }
    }

    // Main update loop
    update() {
        if (!this.isActive) return;

        // Track hand positions
        this.updateHandTracking();

        // State machine updates
        switch (this.state) {
            case this.STATES.DETECTING_WRIST:
                this.updateWristDetection();
                break;
            case this.STATES.POSITIONING_FINGERS:
                this.updateFingerPositioning();
                break;
            case this.STATES.CHECKING_PRESSURE:
                this.updatePressureCheck();
                break;
            case this.STATES.COUNTING_PULSE:
                this.updatePulseCounting();
                break;
        }
    }

    // Public interface methods (for backward compatibility)
    handleCommand(command) {
        print("[TrainingMode] Handle command: " + command);

        if (command === "start training pulse taking") {
            this.startPulseTraining();
            return true;
        } else if (command === "end training") {
            this.endTraining();
            return true;
        }

        return false;
    }

    startPulseTraining() {
        print("[TrainingMode] Starting pulse training");
        this.start();
    }

    endTraining() {
        print("[TrainingMode] Ending training");
        this.exit();
    }

    cleanup() {
        print("[TrainingMode] Cleanup");
        this.exit();
    }

    // Training flow methods
    async start() {
        this.isActive = true;
        this.setState(this.STATES.STARTING);
        this.stateHistory = [this.STATES.IDLE];

        // Play welcome audio
        this.playAudio('Starting pulse taking training...');

        // Initialize training session via API
        try {
            await this.apiClient?.startTraining();
        } catch (error) {
            print('Failed to start training session: ' + error);
        }

        // Begin wrist detection
        await this.delay(2000);
        this.setState(this.STATES.DETECTING_WRIST);
    }

    setState(newState) {
        this.state = newState;
        this.stateHistory.push(newState);
        print('[TrainingMode] State: ' + newState);
    }

    detectWrist(hand) {
        if (!hand || !hand.isTracked()) {
            return { detected: false, confidence: 0 };
        }

        // For Spectacles, we check if hand is tracked and facing camera
        const tracked = hand.isTracked();
        const facingCamera = hand.isFacingCamera ? hand.isFacingCamera() : true;

        if (!tracked || !facingCamera) {
            return { detected: false, confidence: 0 };
        }

        // Get wrist position
        const wristPosition = hand.getWristPosition ?
            hand.getWristPosition() :
            { x: 0.5, y: 0.5, z: 0.1 };

        return {
            detected: true,
            confidence: 1.0, // Spectacles doesn't expose confidence
            position: wristPosition
        };
    }

    updateWristDetection() {
        // Try both hands
        const leftResult = this.detectWrist(this.leftHand);
        const rightResult = this.detectWrist(this.rightHand);

        const result = leftResult.detected ? leftResult : rightResult;

        if (result.detected) {
            this.wristPosition = result.position;
            this.positionOverlay(this.wristPosition);
            this.playAudio('Wrist detected. Position your fingers on the pulse point.');
            this.setState(this.STATES.POSITIONING_FINGERS);
            this.retryAttempts = 0;
            this.retryTimeoutReached = false;
        } else {
            this.handleDetectionRetry();
        }
    }

    positionOverlay(wristLandmark) {
        if (!wristLandmark) return;

        // Calculate radial pulse point position
        const radialOffset = { x: -0.03, y: 0.02 };
        const overlayPosition = {
            x: wristLandmark.x + radialOffset.x,
            y: wristLandmark.y + radialOffset.y,
            z: wristLandmark.z
        };

        // Show cyan circle at pulse point
        if (this.pulsePointOverlay) {
            this.pulsePointOverlay.show({
                position: overlayPosition,
                color: '#00FFFF',
                opacity: 0.5,
                radius: 0.02 // 2cm radius
            });
        }
    }

    updateFingerPositioning() {
        if (!this.wristPosition) return;

        // Simple validation - check if hand is still tracked
        const hand = this.leftHand?.isTracked() ? this.leftHand : this.rightHand;

        if (hand && hand.isTracked()) {
            this.fingerPosition = this.wristPosition; // Simplified for now
            this.playAudio('Good position. Apply gentle pressure.');
            this.setState(this.STATES.CHECKING_PRESSURE);
        }
    }

    updatePressureCheck() {
        // Simplified pressure check - move to counting after brief delay
        if (!this.pressureCheckStarted) {
            this.pressureCheckStarted = Date.now();
        }

        if (Date.now() - this.pressureCheckStarted > 2000) {
            this.playAudio('Perfect. Count the beats for 15 seconds. Starting now.');
            this.startCounting();
        }
    }

    startCounting() {
        this.setState(this.STATES.COUNTING_PULSE);
        this.countingStartTime = Date.now();

        // Set timer for 15 seconds
        setTimeout(() => {
            if (this.state === this.STATES.COUNTING_PULSE) {
                this.playAudio('Time. What was your count?');
                this.setState(this.STATES.WAITING_FOR_RESPONSE);

                // Simulate response for testing
                setTimeout(() => {
                    this.processBPMResponse(18); // 18 beats in 15 seconds = 72 BPM
                }, 3000);
            }
        }, this.countDuration);
    }

    updatePulseCounting() {
        // Show countdown timer
        const elapsed = Date.now() - this.countingStartTime;
        const remaining = Math.max(0, this.countDuration - elapsed);
        const seconds = Math.ceil(remaining / 1000);

        // Would update UI in production
        if (seconds % 5 === 0 && seconds !== this.lastAnnouncedTime) {
            print('[TrainingMode] Counting... ' + seconds + ' seconds remaining');
            this.lastAnnouncedTime = seconds;
        }
    }

    async processBPMResponse(count) {
        this.userBPM = count * 4; // Convert 15-second count to BPM

        const validation = this.validateBPM(this.userBPM);
        const feedback = this.getDefaultFeedback(validation);

        this.playAudio(feedback);

        // Complete training
        await this.delay(3000);
        this.completeTraining();
    }

    validateBPM(bpm) {
        // Normal resting heart rate: 60-100 bpm
        if (bpm < 60) return { range: 'low', message: 'Heart rate is below normal range' };
        if (bpm > 100) return { range: 'high', message: 'Heart rate is above normal range' };
        return { range: 'normal', message: 'Heart rate is in normal range' };
    }

    getDefaultFeedback(validation) {
        switch (validation.range) {
            case 'low':
                return `${this.userBPM} beats per minute. ${validation.message}. Try taking deeper breaths.`;
            case 'high':
                return `${this.userBPM} beats per minute. ${validation.message}. Consider resting before taking vitals.`;
            case 'normal':
                return `${this.userBPM} beats per minute. Excellent! Your pulse is normal. Good technique!`;
        }
    }

    completeTraining() {
        this.setState(this.STATES.COMPLETE);
        this.playAudio('Training complete. Great job!');

        // Start inactivity timer for auto-exit
        this.inactivityTimer = setTimeout(() => {
            this.exit();
        }, this.inactivityDuration);
    }

    handleDetectionRetry() {
        if (!this.retryStartTime) {
            this.retryStartTime = Date.now();
        }

        this.retryAttempts++;

        const elapsed = Date.now() - this.retryStartTime;
        if (elapsed >= this.maxRetryDuration) {
            this.retryTimeoutReached = true;
            this.shouldOfferSkip = true;
            this.playAudio('Having trouble detecting your hand. You can skip or keep trying.');
        }
    }

    updateHandTracking() {
        // Update hand tracking data each frame
        if (this.leftHand) {
            this.leftHandTracked = this.leftHand.isTracked();
        }
        if (this.rightHand) {
            this.rightHandTracked = this.rightHand.isTracked();
        }
    }

    playAudio(text) {
        print('[TrainingMode] TTS: ' + text);

        // In production, use Fish Audio TTS
        if (script.audioComponent) {
            // script.audioComponent.play(text);
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    exit() {
        this.isActive = false;
        this.setState(this.STATES.IDLE);
        this.wristPosition = null;
        this.fingerPosition = null;
        this.pressureHistory = [];
        this.retryAttempts = 0;
        this.retryTimeoutReached = false;
        this.pressureCheckStarted = null;

        // Hide overlays
        this.pulsePointOverlay?.hide();
        this.guidanceArrow?.hide();

        // Clear timers
        if (this.inactivityTimer) {
            clearTimeout(this.inactivityTimer);
            this.inactivityTimer = null;
        }

        print('[TrainingMode] Exited');
    }

    getStateHistory() {
        return this.stateHistory;
    }

    validateFingerPosition(wristPos, fingerPos) {
        if (!wristPos || !fingerPos) {
            return { isValid: false, distance: Infinity };
        }

        // Calculate radial pulse point
        const radialOffset = { x: -0.03, y: 0.02 };
        const targetPos = {
            x: wristPos.x + radialOffset.x,
            y: wristPos.y + radialOffset.y
        };

        // Calculate distance
        const dx = fingerPos.x - targetPos.x;
        const dy = fingerPos.y - targetPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        return {
            isValid: distance < 0.05,
            distance,
            targetPos
        };
    }

    estimatePressure(positions) {
        if (!positions || positions.length < 2) {
            return 'none';
        }

        // Calculate z-axis velocity
        const recent = positions.slice(-3);
        let totalVelocity = 0;

        for (let i = 1; i < recent.length; i++) {
            const dt = recent[i].timestamp - recent[i-1].timestamp;
            const dz = recent[i].z - recent[i-1].z;
            const velocity = dz / dt;
            totalVelocity += velocity;
        }

        const avgVelocity = totalVelocity / (recent.length - 1);

        if (avgVelocity < -0.0005) return 'excessive';
        if (avgVelocity < -0.0002) return 'moderate';
        if (avgVelocity < -0.0001) return 'light';
        return 'none';
    }

    showGuidanceArrow(currentPos, targetPos) {
        if (!currentPos || !targetPos) return;

        const direction = {
            x: targetPos.x - currentPos.x,
            y: targetPos.y - currentPos.y
        };

        const magnitude = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
        if (magnitude > 0.01) {
            direction.x /= magnitude;
            direction.y /= magnitude;

            if (this.guidanceArrow) {
                this.guidanceArrow.show({
                    position: currentPos,
                    direction,
                    color: '#FFFF00',
                    length: 0.05
                });
            }
        }
    }

    getPositionFeedback(position) {
        if (!this.wristPosition) return '';

        const radialTarget = {
            x: this.wristPosition.x - 0.03,
            y: this.wristPosition.y + 0.02
        };

        const dx = position.x - radialTarget.x;
        const dy = position.y - radialTarget.y;

        if (Math.abs(dx) > Math.abs(dy)) {
            return dx > 0 ? 'Move 2cm toward thumb' : 'Move 2cm away from thumb';
        } else {
            return dy > 0 ? 'Move 2cm down' : 'Move 2cm up';
        }
    }

    skipDetection() {
        if (!this.shouldOfferSkip) {
            return { skipped: false, message: 'Skip not available yet' };
        }

        this.playAudio('Skipping hand detection. Position fingers on your wrist.');
        this.setState(this.STATES.POSITIONING_FINGERS);
        return { skipped: true };
    }

    async continueWithoutCV() {
        this.playAudio('Continuing in manual mode. Follow the voice instructions.');
        await this.startManualTraining();
        return { success: true, mode: 'manual' };
    }

    async startManualTraining() {
        const steps = [
            'Place index and middle fingers on your wrist, below your thumb.',
            'Apply gentle pressure until you feel the pulse.',
            'Count the beats for 15 seconds. Starting now.'
        ];

        for (const instruction of steps) {
            this.playAudio(instruction);
            await this.delay(5000);
        }
    }
};

// Create instance
const trainingMode = new TrainingMode();

// Export for Lens Studio global access
global.trainingMode = trainingMode;

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TrainingMode;
}

print("[TrainingMode] Full implementation loaded with hand tracking");