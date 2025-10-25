/**
 * Clinical Mode State Machine
 * Dev 2 - Task Group 6: Clinical State Machine
 *
 * Core functionality for MedSnap Clinical Mode
 * Following TDD - implementation to pass tests written in clinicalMode.test.js
 */

// @input Component.AudioComponent audioComponent
// @input Asset.AudioTrackAsset exitAudioTrack

const ClinicalMode = (function() {
    // Dependencies
    const patientCardRenderer = global.PatientCardRenderer;
    const apiClient = global.ApiClient;
    const stateManager = global.StateManager;

    // Clinical mode states
    const STATES = {
        IDLE: 'IDLE',
        LOADING_PATIENT: 'LOADING_PATIENT',
        PATIENT_LOADED: 'PATIENT_LOADED',
        RECORDING_SYMPTOM: 'RECORDING_SYMPTOM',
        PRESCRIBING: 'PRESCRIBING',
        REQUESTING_DECISION: 'REQUESTING_DECISION'
    };

    // Current state
    let currentState = STATES.IDLE;
    let inactivityTimer = null;
    let patientLoadRetries = 0;
    let lastAudioUrl = null;

    /**
     * Initialize clinical mode
     */
    function initialize() {
        currentState = STATES.IDLE;
        patientLoadRetries = 0;
        startInactivityTimer();
    }

    /**
     * Handle voice commands
     * Task 6.5: Implement voice command handlers
     */
    function handleVoiceCommand(command) {
        // Reset inactivity timer on any interaction
        resetInactivityTimer();

        const lowerCommand = command.toLowerCase();

        // Session-initiating command (with "Hey MedSnap")
        if (lowerCommand.includes('start assessment')) {
            const patientName = extractPatientName(command);
            if (patientName) {
                return loadPatient(patientName);
            }
            return Promise.resolve({
                success: false,
                error: 'Please specify patient name'
            });
        }

        // In-session commands (no wake word needed)
        if (currentState === STATES.PATIENT_LOADED) {
            // Record symptom
            if (lowerCommand.includes('record symptom')) {
                const symptom = extractSymptom(command);
                if (symptom) {
                    return recordSymptom(symptom);
                }
            }

            // Show commands
            if (lowerCommand.includes('show medications')) {
                return showMedications();
            }
            if (lowerCommand.includes('show allergies')) {
                return showAllergies();
            }
            if (lowerCommand.includes('show patient history') || lowerCommand.includes('show history')) {
                return showPatientHistory();
            }

            // Prescribe medication
            if (lowerCommand.includes('prescribe')) {
                return initiatePrescription(command);
            }

            // Repeat last instructions
            if (lowerCommand.includes('repeat instructions')) {
                return repeatLastInstructions();
            }

            // End assessment
            if (lowerCommand.includes('end assessment')) {
                return exitMode();
            }
        }

        return Promise.resolve({
            success: false,
            error: 'Command not recognized'
        });
    }

    /**
     * Task 6.2: Implement patient loading workflow
     */
    function loadPatient(patientName) {
        currentState = STATES.LOADING_PATIENT;
        patientLoadRetries = 0;

        return loadPatientWithRetry(patientName);
    }

    function loadPatientWithRetry(patientName) {
        return apiClient.loadPatient(patientName)
            .then(response => {
                if (response.success) {
                    // Success - show patient card
                    currentState = STATES.PATIENT_LOADED;
                    stateManager.setPatient(response.patient);

                    if (patientCardRenderer) {
                        patientCardRenderer.showCard(response.patient);
                    }

                    // Play TTS audio if available
                    if (response.audio_url) {
                        playAudio(response.audio_url);
                    }

                    return {
                        success: true,
                        patient: response.patient
                    };
                } else {
                    throw response;
                }
            })
            .catch(error => {
                patientLoadRetries++;

                if (patientLoadRetries < 3) {
                    // Retry
                    print("Patient not found, retry " + patientLoadRetries + " of 3");
                    return loadPatientWithRetry(patientName);
                } else {
                    // After 3 retries, offer patient list
                    currentState = STATES.IDLE;
                    return {
                        success: false,
                        offerPatientList: true,
                        message: 'Patient not found after 3 attempts. Would you like to see available patients?'
                    };
                }
            });
    }

    /**
     * Task 6.3: Implement symptom recording
     */
    function recordSymptom(symptom) {
        if (currentState !== STATES.PATIENT_LOADED) {
            return Promise.resolve({
                success: false,
                error: 'Please load a patient first'
            });
        }

        currentState = STATES.RECORDING_SYMPTOM;

        const patient = stateManager.getState('patient');
        if (!patient || !patient.id) {
            currentState = STATES.PATIENT_LOADED;
            return Promise.resolve({
                success: false,
                error: 'No patient loaded'
            });
        }

        return apiClient.recordSymptom({
            patient_id: patient.id,
            symptom: symptom
        }).then(response => {
            currentState = STATES.PATIENT_LOADED;

            if (response.success) {
                // Add symptom to state
                stateManager.addSymptom(symptom);

                // Show green checkmark confirmation
                showConfirmation('green_checkmark');

                // Play TTS confirmation
                if (response.audio_url) {
                    playAudio(response.audio_url);
                }

                return {
                    success: true,
                    showConfirmation: true,
                    confirmationType: 'green_checkmark'
                };
            }

            return response;
        }).catch(error => {
            currentState = STATES.PATIENT_LOADED;
            return {
                success: false,
                error: error.error || 'Failed to record symptom',
                canRetry: true
            };
        });
    }

    /**
     * Task 6.4: Implement decision support
     */
    function requestDecisionSupport() {
        if (currentState !== STATES.PATIENT_LOADED) {
            return Promise.resolve({
                success: false,
                error: 'Please load a patient first'
            });
        }

        currentState = STATES.REQUESTING_DECISION;

        const state = stateManager.getState();
        const patient = state.patient;
        const symptoms = state.symptoms || [];

        if (!patient || !patient.id) {
            currentState = STATES.PATIENT_LOADED;
            return Promise.resolve({
                success: false,
                error: 'No patient loaded'
            });
        }

        return apiClient.getDecisionSupport({
            patient_id: patient.id,
            symptoms: symptoms.map(s => s.description || s)
        }).then(response => {
            currentState = STATES.PATIENT_LOADED;

            if (response.success) {
                // Play TTS recommendations
                if (response.audio_url) {
                    playAudio(response.audio_url);
                }

                // Update patient card if needed
                if (response.update_card && patientCardRenderer) {
                    patientCardRenderer.updateCard(patient);
                }

                return {
                    success: true,
                    recommendations: response.recommendations
                };
            }

            return response;
        }).catch(error => {
            currentState = STATES.PATIENT_LOADED;
            return {
                success: false,
                error: error.error || 'Failed to get decision support'
            };
        });
    }

    /**
     * Initiate prescription workflow
     */
    function initiatePrescription(command) {
        currentState = STATES.PRESCRIBING;

        const prescription = parsePrescription(command);

        return {
            success: true,
            medication: prescription.medication,
            dosage: prescription.dosage,
            initiatedPrescription: true
        };
    }

    /**
     * Task 6.5: Voice command handlers
     */
    function showMedications() {
        if (patientCardRenderer) {
            patientCardRenderer.filterToMedications();
        }

        return Promise.resolve({
            success: true,
            action: 'show_medications'
        });
    }

    function showAllergies() {
        if (patientCardRenderer) {
            patientCardRenderer.filterToAllergies();
        }

        return Promise.resolve({
            success: true,
            action: 'show_allergies'
        });
    }

    function showPatientHistory() {
        if (patientCardRenderer) {
            patientCardRenderer.filterToHistory();
        }

        return Promise.resolve({
            success: true,
            action: 'show_history'
        });
    }

    function repeatLastInstructions() {
        if (lastAudioUrl) {
            playAudio(lastAudioUrl);
        }

        return Promise.resolve({
            success: true,
            action: 'repeat'
        });
    }

    /**
     * Task 6.6: State transitions
     */
    function setState(newState) {
        const previousState = currentState;
        currentState = newState;

        // Clean up on state exit
        if (previousState !== newState) {
            onStateExit(previousState);
        }

        // Initialize new state
        onStateEnter(newState);
    }

    function onStateExit(state) {
        // Clean up based on exiting state
        switch(state) {
            case STATES.LOADING_PATIENT:
                // Cancel any pending requests if needed
                break;
            case STATES.PATIENT_LOADED:
                // Save any unsaved data
                break;
        }
    }

    function onStateEnter(state) {
        // Initialize based on entering state
        switch(state) {
            case STATES.IDLE:
                cleanup();
                break;
            case STATES.PATIENT_LOADED:
                startInactivityTimer();
                break;
        }
    }

    /**
     * Task 6.7: Implement inactivity timer
     */
    function startInactivityTimer() {
        cancelInactivityTimer();

        // 120-second timer for clinical mode
        inactivityTimer = script.createEvent("DelayedCallbackEvent");
        inactivityTimer.bind(function() {
            autoExit();
        });
        inactivityTimer.reset(120); // 120 seconds
    }

    function resetInactivityTimer() {
        stateManager.resetInactivity();
        startInactivityTimer();
    }

    function cancelInactivityTimer() {
        if (inactivityTimer) {
            inactivityTimer.cancel();
            inactivityTimer = null;
        }
    }

    function autoExit() {
        // Play exit message
        playExitMessage();

        // Clean up and exit
        exitMode();
    }

    /**
     * Exit clinical mode
     */
    function exitMode() {
        currentState = STATES.IDLE;
        cleanup();

        return Promise.resolve({
            success: true,
            action: 'exit_mode'
        });
    }

    /**
     * Clean up on mode exit
     */
    function cleanup() {
        // Hide patient card
        if (patientCardRenderer) {
            patientCardRenderer.hideCard();
        }

        // Clear state
        stateManager.clearState();

        // Cancel timers
        cancelInactivityTimer();

        // Reset variables
        patientLoadRetries = 0;
        lastAudioUrl = null;
    }

    /**
     * Reset the module (for testing)
     */
    function reset() {
        currentState = STATES.IDLE;
        cleanup();
    }

    /**
     * Utility functions
     */
    function extractPatientName(command) {
        const match = command.match(/start assessment\s+(.+)/i);
        return match ? match[1].trim() : null;
    }

    function extractSymptom(command) {
        const match = command.match(/record symptom\s*:?\s*(.+)/i);
        return match ? match[1].trim() : null;
    }

    function parsePrescription(command) {
        const match = command.match(/prescribe\s+(\w+)\s*(.+)?/i);
        return {
            medication: match ? match[1] : '',
            dosage: match && match[2] ? match[2].trim() : ''
        };
    }

    function showConfirmation(type) {
        // Show visual confirmation (green checkmark, red X, etc.)
        // This would integrate with AR overlay components
        print("Showing confirmation: " + type);
    }

    function playAudio(audioUrl) {
        lastAudioUrl = audioUrl;

        if (script.audioComponent) {
            // In real implementation, would load and play audio
            script.audioComponent.play({
                text: audioUrl // Placeholder
            });
        }
    }

    function playExitMessage() {
        playAudio({
            text: "Assessment complete. Exiting clinical mode."
        });
    }

    /**
     * Get current state (for testing)
     */
    function getCurrentState() {
        return currentState;
    }

    // Public API
    return {
        initialize: initialize,
        handleVoiceCommand: handleVoiceCommand,
        loadPatient: loadPatient,
        loadPatientWithRetry: loadPatientWithRetry,
        recordSymptom: recordSymptom,
        requestDecisionSupport: requestDecisionSupport,
        setState: setState,
        getCurrentState: getCurrentState,
        startInactivityTimer: startInactivityTimer,
        resetInactivityTimer: resetInactivityTimer,
        exitMode: exitMode,
        cleanup: cleanup,
        reset: reset
    };
})();

// Export for use by other scripts
global.ClinicalMode = ClinicalMode;

// Initialize on script start
ClinicalMode.initialize();