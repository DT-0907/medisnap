/**
 * Integration Manager
 * Dev 2 - Task Group 8: Component Integration
 *
 * Central integration layer connecting all clinical mode components
 * Coordinates between voice controller, clinical mode, patient card, and prescription UI
 */

// @input Component.AudioComponent audioComponent
// @input Asset.AudioTrackAsset[] ttsAudioTracks

const IntegrationManager = (function() {
    // Component references
    const clinicalMode = global.ClinicalMode;
    const patientCardRenderer = global.PatientCardRenderer;
    const prescriptionUI = global.PrescriptionUI;
    const modeManager = global.ModeManager;
    const stateManager = global.StateManager;
    const apiClient = global.ApiClient;

    // Audio management
    let audioQueue = [];
    let isPlayingAudio = false;
    let currentAudioComponent = null;

    // Voice controller integration (placeholder for Dev 1)
    let voiceCommandHandlers = new Map();
    let wakeWordHandlers = new Map();

    /**
     * Initialize integration manager
     * Task 8.0: Complete component integration
     */
    function initialize() {
        // Store audio component reference
        if (script.audioComponent) {
            currentAudioComponent = script.audioComponent;
        }

        // Set up component cross-references
        setupComponentIntegration();

        // Register voice command handlers
        setupVoiceHandlers();

        // Set up state change listeners
        setupStateListeners();

        print("IntegrationManager initialized - All components connected");
    }

    /**
     * Task 8.1: Integrate clinical mode with patient card
     */
    function setupComponentIntegration() {
        // Ensure components can communicate
        if (clinicalMode && patientCardRenderer) {
            // Clinical mode state changes trigger card updates
            const originalLoadPatient = clinicalMode.loadPatient;
            clinicalMode.loadPatient = function(patientName) {
                return originalLoadPatient.call(clinicalMode, patientName)
                    .then(result => {
                        if (result.success && result.patient) {
                            // Ensure patient card displays with proper timing
                            patientCardRenderer.showCard(result.patient);
                        }
                        return result;
                    });
            };
        }

        // Task 8.2: Integrate clinical mode with prescription UI
        if (clinicalMode && prescriptionUI) {
            // Ensure prescription commands route through UI
            const originalPrescribe = clinicalMode.initiatePrescription;
            clinicalMode.initiatePrescription = function(command) {
                // Update state to show prescribing mode
                stateManager.setState('isPrescribing', true);

                return originalPrescribe.call(clinicalMode, command)
                    .then(result => {
                        // Handle drug interaction warnings
                        if (result.blocked && result.warnings) {
                            // Ensure warning displays properly
                            prescriptionUI.showWarning(result.warnings, result.alternatives);
                        } else if (result.success) {
                            // Show success state
                            prescriptionUI.showSuccess(result.medication, result.dosage);
                        }

                        // Update state
                        stateManager.setState('isPrescribing', false);
                        return result;
                    });
            };
        }

        // Task 8.3: Connect mode manager to all components
        if (modeManager) {
            // Register mode transition callbacks
            modeManager.onModeChange = function(fromMode, toMode) {
                coordinateModeTransition(fromMode, toMode);
            };
        }
    }

    /**
     * Task 8.3: Coordinate mode transitions
     */
    function coordinateModeTransition(fromMode, toMode) {
        // Proper activation/deactivation
        if (fromMode === 'CLINICAL') {
            // Deactivate clinical components
            if (clinicalMode) clinicalMode.cleanup();
            if (patientCardRenderer) patientCardRenderer.hideCard();
            if (prescriptionUI) prescriptionUI.hideUI();
        }

        if (toMode === 'CLINICAL') {
            // Activate clinical components
            if (clinicalMode) clinicalMode.initialize();
        }

        // State cleanup on mode switches
        if (fromMode !== 'IDLE' && toMode === 'IDLE') {
            if (stateManager) stateManager.clearState();
        }

        // Animation coordination (0.5s fade)
        animateTransition(fromMode, toMode);
    }

    /**
     * Animate mode transitions with fade effects
     */
    function animateTransition(fromMode, toMode) {
        // Fade out current mode UI
        if (fromMode !== 'IDLE') {
            fadeOutComponents(0.5);
        }

        // Fade in new mode UI after slight delay
        const fadeInDelay = script.createEvent("DelayedCallbackEvent");
        fadeInDelay.bind(function() {
            if (toMode !== 'IDLE') {
                fadeInComponents(0.5);
            }
        });
        fadeInDelay.reset(0.25); // Start fade in halfway through fade out
    }

    /**
     * Task 8.4: Integrate with Dev 1's voice controller
     */
    function setupVoiceHandlers() {
        // Register wake word commands
        registerWakeWordCommand('start assessment', function(command) {
            // Switch to clinical mode and load patient
            if (modeManager) {
                modeManager.switchMode('CLINICAL');
            }
            return clinicalMode.handleVoiceCommand(command);
        });

        registerWakeWordCommand('end assessment', function(command) {
            // Exit clinical mode
            if (clinicalMode) {
                return clinicalMode.exitMode();
            }
            if (modeManager) {
                modeManager.switchMode('IDLE');
            }
            return Promise.resolve({ success: true });
        });

        // Register in-session commands (no wake word)
        registerInSessionCommand('record symptom', function(command) {
            return clinicalMode.handleVoiceCommand(command);
        });

        registerInSessionCommand('prescribe', function(command) {
            return clinicalMode.handleVoiceCommand(command);
        });

        registerInSessionCommand('show medications', function(command) {
            return clinicalMode.handleVoiceCommand(command);
        });

        registerInSessionCommand('show allergies', function(command) {
            return clinicalMode.handleVoiceCommand(command);
        });

        registerInSessionCommand('show patient history', function(command) {
            return clinicalMode.handleVoiceCommand(command);
        });

        registerInSessionCommand('show available medications', function(command) {
            return clinicalMode.handleVoiceCommand(command);
        });

        registerInSessionCommand('repeat instructions', function(command) {
            return clinicalMode.handleVoiceCommand(command);
        });

        // Acknowledgment commands for warnings
        registerInSessionCommand('acknowledged', function(command) {
            if (prescriptionUI) {
                prescriptionUI.acknowledgeWarning();
            }
            return Promise.resolve({ success: true });
        });

        registerInSessionCommand('okay', function(command) {
            if (prescriptionUI) {
                prescriptionUI.acknowledgeWarning();
            }
            return Promise.resolve({ success: true });
        });
    }

    /**
     * Register wake word command handler
     * This will be called by Dev 1's voice controller
     */
    function registerWakeWordCommand(keyword, handler) {
        wakeWordHandlers.set(keyword.toLowerCase(), handler);
    }

    /**
     * Register in-session command handler
     * This will be called by Dev 1's voice controller
     */
    function registerInSessionCommand(keyword, handler) {
        voiceCommandHandlers.set(keyword.toLowerCase(), handler);
    }

    /**
     * Handle incoming voice command from Dev 1's voice controller
     * This is the main entry point for voice commands
     */
    function handleVoiceCommand(command, hasWakeWord) {
        const lowerCommand = command.toLowerCase();

        // Reset clinical mode inactivity timer on any command
        if (clinicalMode) {
            clinicalMode.resetInactivityTimer();
        }

        // Check wake word commands
        if (hasWakeWord) {
            for (const [keyword, handler] of wakeWordHandlers) {
                if (lowerCommand.includes(keyword)) {
                    return handler(command);
                }
            }
        }

        // Check in-session commands
        for (const [keyword, handler] of voiceCommandHandlers) {
            if (lowerCommand.includes(keyword)) {
                return handler(command);
            }
        }

        // Fallback to clinical mode handler
        if (clinicalMode) {
            return clinicalMode.handleVoiceCommand(command);
        }

        return Promise.resolve({
            success: false,
            error: 'Command not recognized'
        });
    }

    /**
     * Task 8.5: Add TTS audio playback
     */
    function playTTSAudio(audioUrl) {
        if (!audioUrl) return;

        // Add to audio queue
        audioQueue.push(audioUrl);

        // Start playing if not already playing
        if (!isPlayingAudio) {
            playNextInQueue();
        }
    }

    /**
     * Play next audio in queue
     */
    function playNextInQueue() {
        if (audioQueue.length === 0) {
            isPlayingAudio = false;
            return;
        }

        isPlayingAudio = true;
        const audioUrl = audioQueue.shift();

        if (currentAudioComponent) {
            // In production, would load audio from URL
            // For now, simulate audio playback
            print("Playing TTS audio: " + audioUrl);

            // Simulate audio duration (2 seconds)
            const audioCompleteEvent = script.createEvent("DelayedCallbackEvent");
            audioCompleteEvent.bind(function() {
                playNextInQueue(); // Play next audio if available
            });
            audioCompleteEvent.reset(2);

            // Play audio
            currentAudioComponent.play(1);
        } else {
            isPlayingAudio = false;
        }
    }

    /**
     * Set up state change listeners
     */
    function setupStateListeners() {
        if (!stateManager) return;

        // Listen for patient data changes
        const originalSetState = stateManager.setState;
        stateManager.setState = function(key, value) {
            originalSetState.call(stateManager, key, value);

            // Update patient card when patient data changes
            if (key === 'patient' && value && patientCardRenderer) {
                patientCardRenderer.updateCard(value);
            }

            // Update prescription UI when prescription state changes
            if (key === 'prescription' && value && prescriptionUI) {
                if (value.blocked) {
                    prescriptionUI.showWarning(value.warnings, value.alternatives);
                }
            }
        };
    }

    /**
     * Fade out all UI components
     */
    function fadeOutComponents(duration) {
        if (patientCardRenderer) {
            patientCardRenderer.fadeOut(duration);
        }
        if (prescriptionUI) {
            prescriptionUI.fadeOut(duration);
        }
    }

    /**
     * Fade in all UI components
     */
    function fadeInComponents(duration) {
        const state = stateManager ? stateManager.getState() : {};

        if (state.patient && patientCardRenderer) {
            patientCardRenderer.fadeIn(duration);
        }
        if (state.isPrescribing && prescriptionUI) {
            prescriptionUI.fadeIn(duration);
        }
    }

    /**
     * Get integration status (for testing)
     */
    function getIntegrationStatus() {
        return {
            clinicalModeConnected: !!clinicalMode,
            patientCardConnected: !!patientCardRenderer,
            prescriptionUIConnected: !!prescriptionUI,
            modeManagerConnected: !!modeManager,
            stateManagerConnected: !!stateManager,
            audioComponentConnected: !!currentAudioComponent,
            voiceHandlersRegistered: voiceCommandHandlers.size > 0,
            wakeWordHandlersRegistered: wakeWordHandlers.size > 0
        };
    }

    /**
     * Reset integration (for testing)
     */
    function reset() {
        audioQueue = [];
        isPlayingAudio = false;
        voiceCommandHandlers.clear();
        wakeWordHandlers.clear();
    }

    // Public API
    return {
        initialize: initialize,
        handleVoiceCommand: handleVoiceCommand,
        playTTSAudio: playTTSAudio,
        getIntegrationStatus: getIntegrationStatus,
        reset: reset,
        // Expose for Dev 1 integration
        registerWakeWordCommand: registerWakeWordCommand,
        registerInSessionCommand: registerInSessionCommand
    };
})();

// Export for use by other scripts
global.IntegrationManager = IntegrationManager;

// Initialize on script start
const integrationInitEvent = script.createEvent("OnStartEvent");
integrationInitEvent.bind(function() {
    IntegrationManager.initialize();
    print("IntegrationManager ready - Components integrated");
});