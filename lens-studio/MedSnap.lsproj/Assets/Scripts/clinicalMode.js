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
    const prescriptionUI = global.PrescriptionUI; // Integration with Task Group 7

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

            // Prescribe medication - CRITICAL INTEGRATION WITH TASK GROUP 7
            if (lowerCommand.includes('prescribe')) {
                return initiatePrescription(command);
            }

            // Show available medications (Task Group 7 integration)
            if (lowerCommand.includes('show available medications')) {
                return showAvailableMedications();
            }

            // Acknowledge warning (Task Group 7 integration)
            if (lowerCommand.includes('acknowledged') || lowerCommand.includes('okay') || lowerCommand.includes('understood')) {
                if (prescriptionUI) {
                    prescriptionUI.acknowledgeWarning();
                    return Promise.resolve({
                        success: true,
                        action: 'acknowledge_warning'
                    });
                }
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

                    // Store patient in state manager
                    stateManager.setState('patient', response.patient);
                    stateManager.setState('currentPatient', response.patient);

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

        const state = stateManager.getState();
        const patient = state.patient || state.currentPatient;

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
                const symptoms = stateManager.getState('symptoms') || [];
                symptoms.push({ description: symptom, timestamp: Date.now() });
                stateManager.setState('symptoms', symptoms);

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
        const patient = state.patient || state.currentPatient;
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
     * UPDATED: Integrate with PrescriptionUI (Task Group 7)
     */
    function initiatePrescription(command) {
        if (currentState !== STATES.PATIENT_LOADED) {
            return Promise.resolve({
                success: false,
                error: 'Please load a patient first'
            });
        }

        currentState = STATES.PRESCRIBING;

        // Delegate to PrescriptionUI for complete handling
        if (prescriptionUI) {
            return prescriptionUI.createPrescription(command)
                .then(response => {
                    currentState = STATES.PATIENT_LOADED;

                    // If drug interaction detected, stay in prescribing state
                    if (response.blocked) {
                        currentState = STATES.PRESCRIBING;
                    }

                    return response;
                })
                .catch(error => {
                    currentState = STATES.PATIENT_LOADED;
                    return {
                        success: false,
                        error: error.error || 'Failed to create prescription'
                    };
                });
        }

        // Fallback if PrescriptionUI not loaded
        const prescription = parsePrescription(command);
        currentState = STATES.PATIENT_LOADED;

        return Promise.resolve({
            success: true,
            medication: prescription.medication,
            dosage: prescription.dosage,
            initiatedPrescription: true
        });
    }

    /**
     * Show available medications (Task Group 7 integration)
     */
    function showAvailableMedications() {
        if (prescriptionUI) {
            prescriptionUI.showAvailableMedications();
            return Promise.resolve({
                success: true,
                action: 'show_available_medications'
            });
        }

        return Promise.resolve({
            success: false,
            error: 'Prescription UI not available'
        });
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
            case STATES.PRESCRIBING:
                // Hide prescription UI
                if (prescriptionUI) {
                    prescriptionUI.hideUI();
                }
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
        if (stateManager) {
            const state = stateManager.getState();
            stateManager.setState('lastActivity', Date.now());
        }
        startInactivityTimer();
    }

    function cancelInactivityTimer() {
        if (inactivityTimer) {
            script.removeEvent(inactivityTimer);
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

        // Hide prescription UI
        if (prescriptionUI) {
            prescriptionUI.hideUI();
        }

        // Clear state
        if (stateManager) {
            stateManager.clearState();
        }

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
            script.audioComponent.play();
        }
    }

    function playExitMessage() {
        if (script.audioComponent && script.exitAudioTrack) {
            script.audioComponent.audioTrack = script.exitAudioTrack;
            script.audioComponent.play();
        }
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
        initiatePrescription: initiatePrescription,
        showAvailableMedications: showAvailableMedications,
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
const clinicalInitEvent = script.createEvent("OnStartEvent");
clinicalInitEvent.bind(function() {
    ClinicalMode.initialize();
    print("ClinicalMode initialized - Ready for patient assessment");
});