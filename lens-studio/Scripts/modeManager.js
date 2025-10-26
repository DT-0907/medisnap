/**
 * Mode Manager
 * Dev 2 - Task Group 4: Mode Switching Logic
 *
 * Handles switching between Training and Clinical modes
 * Manages component lifecycle and transitions
 */

// Mode states
const MODES = {
    IDLE: 'IDLE',
    TRAINING: 'TRAINING',
    CLINICAL: 'CLINICAL'
};

// Mode manager state
let currentMode = MODES.IDLE;
let modeTransitionInProgress = false;
let inactivityTimer = null;
let onModeChangeCallbacks = [];

/**
 * Initialize mode manager
 */
function initialize() {
    print("[ModeManager] Initializing mode manager");
    currentMode = MODES.IDLE;
    modeTransitionInProgress = false;
    clearInactivityTimer();
}

/**
 * Get current mode
 * @returns {string} Current mode (IDLE, TRAINING, or CLINICAL)
 */
function getCurrentMode() {
    return currentMode;
}

/**
 * Register callback for mode changes
 * @param {Function} callback - Function to call when mode changes
 */
function onModeChange(callback) {
    if (typeof callback === 'function') {
        onModeChangeCallbacks.push(callback);
    }
}

/**
 * Switch to a new mode
 * @param {string} newMode - Target mode
 * @returns {boolean} True if switch successful, false otherwise
 */
function switchMode(newMode) {
    if (!MODES[newMode]) {
        print("[ModeManager] Invalid mode: " + newMode);
        return false;
    }

    if (currentMode === newMode) {
        print("[ModeManager] Already in mode: " + newMode);
        return true;
    }

    if (modeTransitionInProgress) {
        print("[ModeManager] Mode transition already in progress");
        return false;
    }

    print("[ModeManager] Switching from " + currentMode + " to " + newMode);
    modeTransitionInProgress = true;

    // Clean up current mode
    cleanupCurrentMode();

    // Switch to new mode
    const previousMode = currentMode;
    currentMode = newMode;

    // Update state manager
    if (global.StateManager) {
        global.StateManager.setState('currentMode', newMode);
    }

    // Initialize new mode
    if (!initializeMode(newMode)) {
        // Rollback on failure
        currentMode = previousMode;
        if (global.StateManager) {
            global.StateManager.setState('currentMode', previousMode);
        }
        modeTransitionInProgress = false;
        return false;
    }

    // Start inactivity timer for non-IDLE modes
    if (newMode !== MODES.IDLE) {
        startInactivityTimer();
    }

    // Notify listeners
    notifyModeChange(previousMode, newMode);

    modeTransitionInProgress = false;
    return true;
}

/**
 * Initialize a specific mode
 * @param {string} mode - Mode to initialize
 * @returns {boolean} True if initialization successful
 */
function initializeMode(mode) {
    print("[ModeManager] Initializing mode: " + mode);

    switch (mode) {
        case MODES.IDLE:
            // Clear any active states
            if (global.StateManager) {
                global.StateManager.clearState();
            }
            return true;

        case MODES.TRAINING:
            // Initialize training mode (Dev 1 responsibility)
            if (global.trainingMode && global.trainingMode.initialize) {
                return global.trainingMode.initialize();
            }
            print("[ModeManager] Training mode not available");
            return false;

        case MODES.CLINICAL:
            // Initialize clinical mode
            if (global.clinicalMode && global.clinicalMode.initialize) {
                return global.clinicalMode.initialize();
            }
            print("[ModeManager] Clinical mode not available");
            return false;

        default:
            return false;
    }
}

/**
 * Clean up current mode before switching
 */
function cleanupCurrentMode() {
    print("[ModeManager] Cleaning up mode: " + currentMode);
    clearInactivityTimer();

    switch (currentMode) {
        case MODES.TRAINING:
            if (global.trainingMode && global.trainingMode.cleanup) {
                global.trainingMode.cleanup();
            }
            break;

        case MODES.CLINICAL:
            if (global.clinicalMode && global.clinicalMode.cleanup) {
                global.clinicalMode.cleanup();
            }
            // Hide patient card
            if (global.patientCardRenderer && global.patientCardRenderer.hide) {
                global.patientCardRenderer.hide();
            }
            // Hide prescription UI
            if (global.prescriptionUI && global.prescriptionUI.hide) {
                global.prescriptionUI.hide();
            }
            break;
    }
}

/**
 * Start inactivity timer based on current mode
 */
function startInactivityTimer() {
    clearInactivityTimer();

    let timeout;
    switch (currentMode) {
        case MODES.TRAINING:
            timeout = global.MedSnapConfig?.TIMEOUTS?.TRAINING_MODE_INACTIVITY || 10000;
            break;
        case MODES.CLINICAL:
            timeout = global.MedSnapConfig?.TIMEOUTS?.CLINICAL_MODE_INACTIVITY || 120000;
            break;
        default:
            return;
    }

    print("[ModeManager] Starting inactivity timer: " + timeout + "ms");
    inactivityTimer = script.setTimeout(function() {
        print("[ModeManager] Inactivity timeout - returning to IDLE");
        exitToIdle();
    }, timeout);
}

/**
 * Reset inactivity timer on user interaction
 */
function resetInactivityTimer() {
    if (currentMode !== MODES.IDLE) {
        print("[ModeManager] Resetting inactivity timer");
        startInactivityTimer();
        // Also reset state manager inactivity
        if (global.StateManager) {
            global.StateManager.resetInactivity();
        }
    }
}

/**
 * Clear inactivity timer
 */
function clearInactivityTimer() {
    if (inactivityTimer) {
        script.clearTimeout(inactivityTimer);
        inactivityTimer = null;
    }
}

/**
 * Exit current mode and return to IDLE
 */
function exitToIdle() {
    print("[ModeManager] Exiting to IDLE mode");

    // Play exit TTS if available
    if (global.ApiClient && global.ApiClient.generateTTS) {
        let exitMessage = currentMode === MODES.CLINICAL ?
            "Assessment complete. Exiting clinical mode." :
            "Training complete. Exiting training mode.";

        global.ApiClient.generateTTS(exitMessage).then(function(response) {
            if (response.audio_url && global.audioManager) {
                global.audioManager.playTTS(response.audio_url);
            }
        }).catch(function(error) {
            print("[ModeManager] Failed to generate exit TTS: " + JSON.stringify(error));
        });
    }

    switchMode(MODES.IDLE);

    // Play exit confirmation if available
    if (global.audioManager && global.audioManager.playSystemSound) {
        global.audioManager.playSystemSound('mode_exit');
    }
}

/**
 * Notify all listeners of mode change
 * @param {string} oldMode - Previous mode
 * @param {string} newMode - New mode
 */
function notifyModeChange(oldMode, newMode) {
    for (let i = 0; i < onModeChangeCallbacks.length; i++) {
        try {
            onModeChangeCallbacks[i](oldMode, newMode);
        } catch (error) {
            print("[ModeManager] Error in mode change callback: " + error);
        }
    }
}

/**
 * Handle voice command based on current mode
 * @param {string} command - Voice command text
 * @returns {boolean} True if command was handled
 */
function handleVoiceCommand(command) {
    print("[ModeManager] Handling command in " + currentMode + " mode: " + command);

    // Reset inactivity timer on any command
    resetInactivityTimer();

    // Mode switching commands
    if (command.includes("start training")) {
        return switchMode(MODES.TRAINING);
    } else if (command.includes("start assessment")) {
        return switchMode(MODES.CLINICAL);
    } else if (command.includes("end training") || command.includes("end assessment")) {
        return exitToIdle();
    }

    // Route to current mode handler
    switch (currentMode) {
        case MODES.TRAINING:
            if (global.trainingMode && global.trainingMode.handleCommand) {
                return global.trainingMode.handleCommand(command);
            }
            break;

        case MODES.CLINICAL:
            if (global.clinicalMode && global.clinicalMode.handleCommand) {
                return global.clinicalMode.handleCommand(command);
            }
            break;
    }

    return false;
}

/**
 * Check if a specific mode is active
 * @param {string} mode - Mode to check
 * @returns {boolean} True if mode is active
 */
function isMode(mode) {
    return currentMode === mode;
}

/**
 * Check if any mode is active (not IDLE)
 * @returns {boolean} True if a mode is active
 */
function isActive() {
    return currentMode !== MODES.IDLE;
}

// Export functions
global.modeManager = {
    MODES: MODES,
    initialize: initialize,
    getCurrentMode: getCurrentMode,
    switchMode: switchMode,
    exitToIdle: exitToIdle,
    resetInactivityTimer: resetInactivityTimer,
    handleVoiceCommand: handleVoiceCommand,
    onModeChange: onModeChange,
    isMode: isMode,
    isActive: isActive
};

// Initialize on script load
initialize();

print("[ModeManager] Mode manager loaded successfully");