/**
 * Voice Controller
 * Dev 2 - Task Group 8.4: Voice Controller Integration
 *
 * Enhanced placeholder for Dev 1's voice controller implementation
 * Provides complete interface for integration with clinical mode components
 */

// @input Component.AudioComponent audioComponent
// @input Asset.AudioTrackAsset wakeWordBeepSound

const VoiceController = (function() {
    // Integration manager reference
    const integrationManager = global.IntegrationManager;
    const modeManager = global.ModeManager;

    // Voice state
    let isListening = false;
    let hasHeardWakeWord = false;
    let currentSessionMode = 'IDLE';
    let commandTimeout = null;
    let wakeWordCallbacks = [];
    let commandCallbacks = [];

    // Configuration
    const CONFIG = {
        WAKE_WORD: 'hey medsnap',
        COMMAND_TIMEOUT: 5000, // 5 seconds to complete command after wake word
        SESSION_TIMEOUT: 120000 // 2 minutes for clinical mode
    };

    /**
     * Initialize voice controller
     * This is a placeholder - Dev 1 will implement actual ASR integration
     */
    function initialize() {
        // Start listening for voice commands
        startListening();

        print("[VoiceController] Enhanced placeholder initialized - Ready for Dev 1 ASR integration");
        return true;
    }

    /**
     * Start listening for voice commands
     * Dev 1 will implement actual Snap ASR integration
     */
    function startListening() {
        isListening = true;
        print("[VoiceController] Start listening - simulated");
    }

    /**
     * Stop listening for voice commands
     */
    function stopListening() {
        isListening = false;
        clearCommandTimeout();
        print("[VoiceController] Stop listening");
    }

    /**
     * Register wake word callback
     * Dev 1 will trigger this when wake word is detected
     */
    function onWakeWord(callback) {
        wakeWordCallbacks.push(callback);
        print("[VoiceController] Wake word listener registered");
    }

    /**
     * Register command callback
     * Dev 1 will trigger this for all voice commands
     */
    function onCommand(callback) {
        commandCallbacks.push(callback);
        print("[VoiceController] Command listener registered");
    }

    /**
     * Process incoming voice transcription
     * This is the main entry point from ASR
     */
    function processTranscription(transcription) {
        if (!isListening) return;

        const lowerTranscript = transcription.toLowerCase();

        // Check for wake word
        if (lowerTranscript.includes(CONFIG.WAKE_WORD)) {
            handleWakeWord(transcription);
        } else if (hasHeardWakeWord || currentSessionMode !== 'IDLE') {
            // In-session command (no wake word needed)
            handleInSessionCommand(transcription);
        }
    }

    /**
     * Handle wake word detection
     */
    function handleWakeWord(transcription) {
        // Play confirmation beep
        playWakeWordBeep();

        // Set wake word flag
        hasHeardWakeWord = true;

        // Start command timeout
        startCommandTimeout();

        // Trigger wake word callbacks
        wakeWordCallbacks.forEach(cb => cb(transcription));

        // Extract command after wake word
        const wakeWordIndex = transcription.toLowerCase().indexOf(CONFIG.WAKE_WORD);
        const command = transcription.substring(wakeWordIndex + CONFIG.WAKE_WORD.length).trim();

        if (command) {
            // Process the command immediately
            routeCommand(command, true);
        } else {
            // Wait for follow-up command
            print("[VoiceController] Listening for command...");
        }
    }

    /**
     * Handle in-session commands (no wake word)
     */
    function handleInSessionCommand(command) {
        // Visual indicator only (no beep for in-session)
        showVisualIndicator();

        // Trigger command callbacks
        commandCallbacks.forEach(cb => cb(command));

        // Route the command
        routeCommand(command, false);

        // Reset session timeout if in clinical mode
        if (currentSessionMode === 'CLINICAL') {
            resetSessionTimeout();
        }
    }

    /**
     * Route command to appropriate handler
     */
    function routeCommand(command, hasWakeWord) {
        clearCommandTimeout();

        // Log for debugging
        print("[VoiceController] Command: " + command + " (wake word: " + hasWakeWord + ")");

        // Route through integration manager
        if (integrationManager) {
            integrationManager.handleVoiceCommand(command, hasWakeWord)
                .then(response => {
                    handleCommandResponse(response);
                })
                .catch(error => {
                    handleCommandError(error);
                });
        } else {
            // Fallback to clinical mode directly
            const clinicalMode = global.ClinicalMode;
            if (clinicalMode) {
                clinicalMode.handleVoiceCommand(command)
                    .then(response => {
                        handleCommandResponse(response);
                    })
                    .catch(error => {
                        handleCommandError(error);
                    });
            }
        }

        // Clear wake word flag after processing
        if (hasWakeWord) {
            hasHeardWakeWord = false;
        }
    }

    /**
     * Handle command response
     */
    function handleCommandResponse(response) {
        if (response.success) {
            // Update session mode based on response
            if (response.action === 'start_assessment') {
                currentSessionMode = 'CLINICAL';
            } else if (response.action === 'exit_mode') {
                currentSessionMode = 'IDLE';
            }

            print("[VoiceController] Command successful: " + (response.action || 'processed'));
        } else {
            print("[VoiceController] Command failed: " + (response.error || 'unknown error'));
        }
    }

    /**
     * Handle command error
     */
    function handleCommandError(error) {
        print("[VoiceController] Command error: " + error);
        showErrorIndicator();
    }

    /**
     * Play wake word confirmation beep
     */
    function playWakeWordBeep() {
        if (script.audioComponent && script.wakeWordBeepSound) {
            script.audioComponent.audioTrack = script.wakeWordBeepSound;
            script.audioComponent.play(1);
        }
        print("[VoiceController] ♪ Wake word beep");
    }

    /**
     * Show visual indicator for in-session commands
     */
    function showVisualIndicator() {
        // Dev 1 will implement actual visual feedback
        print("[VoiceController] ◉ Listening indicator");
    }

    /**
     * Show error indicator
     */
    function showErrorIndicator() {
        // Dev 1 will implement actual error feedback
        print("[VoiceController] ✗ Error indicator");
    }

    /**
     * Start command timeout
     */
    function startCommandTimeout() {
        clearCommandTimeout();

        commandTimeout = script.createEvent("DelayedCallbackEvent");
        commandTimeout.bind(function() {
            hasHeardWakeWord = false;
            print("[VoiceController] Command timeout - wake word expired");
        });
        commandTimeout.reset(CONFIG.COMMAND_TIMEOUT / 1000);
    }

    /**
     * Clear command timeout
     */
    function clearCommandTimeout() {
        if (commandTimeout) {
            script.removeEvent(commandTimeout);
            commandTimeout = null;
        }
    }

    /**
     * Reset session timeout (for clinical mode)
     */
    function resetSessionTimeout() {
        const clinicalMode = global.ClinicalMode;
        if (clinicalMode) {
            clinicalMode.resetInactivityTimer();
        }
    }

    /**
     * Simulate voice command (for testing and demo)
     */
    function simulateCommand(command) {
        print("[VoiceController] Simulating: " + command);
        processTranscription(command);
    }

    /**
     * Get voice controller status
     */
    function getStatus() {
        return {
            isListening: isListening,
            hasHeardWakeWord: hasHeardWakeWord,
            currentSessionMode: currentSessionMode
        };
    }

    // Public API - maintains compatibility with original placeholder
    return {
        initialize: initialize,
        startListening: startListening,
        stopListening: stopListening,
        onWakeWord: onWakeWord,
        onCommand: onCommand,
        // Additional methods for integration
        processTranscription: processTranscription,
        simulateCommand: simulateCommand,
        getStatus: getStatus
    };
})();

// Export for use by other scripts
global.VoiceController = VoiceController;
global.voiceController = VoiceController; // Backward compatibility

// Initialize on script start
const voiceInitEvent = script.createEvent("OnStartEvent");
voiceInitEvent.bind(function() {
    VoiceController.initialize();
    print("[VoiceController] Ready - Awaiting Dev 1 ASR implementation");
});