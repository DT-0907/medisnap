/**
 * State Manager for MedSnap Application
 * Dev 2 - Task Group 3: Application State Manager
 *
 * Manages global state for clinical and training modes
 * Following KISS principle
 */

const StateManager = (function() {
    // Global state object
    let appState = {
        currentMode: 'IDLE', // IDLE, TRAINING, CLINICAL
        patient: null,
        symptoms: [],
        prescriptions: [],
        sessionData: {},
        lastInteraction: Date.now()
    };

    /**
     * Set a state value
     */
    function setState(key, value) {
        if (typeof key === 'object') {
            // Allow setting multiple values at once
            Object.assign(appState, key);
        } else {
            appState[key] = value;
        }

        // Update last interaction time
        appState.lastInteraction = Date.now();
    }

    /**
     * Get a state value or entire state
     */
    function getState(key) {
        if (key === undefined) {
            return Object.assign({}, appState); // Return copy of entire state
        }
        return appState[key];
    }

    /**
     * Clear all state (mode exit)
     */
    function clearState() {
        appState = {
            currentMode: 'IDLE',
            patient: null,
            symptoms: [],
            prescriptions: [],
            sessionData: {},
            lastInteraction: Date.now()
        };
    }

    /**
     * Add a symptom to the list
     */
    function addSymptom(symptom) {
        if (!appState.symptoms) {
            appState.symptoms = [];
        }
        appState.symptoms.push({
            description: symptom,
            timestamp: Date.now()
        });
        appState.lastInteraction = Date.now();
    }

    /**
     * Add a prescription to history
     */
    function addPrescription(prescription) {
        if (!appState.prescriptions) {
            appState.prescriptions = [];
        }
        appState.prescriptions.push({
            ...prescription,
            timestamp: Date.now()
        });
        appState.lastInteraction = Date.now();
    }

    /**
     * Set current patient data
     */
    function setPatient(patientData) {
        appState.patient = patientData;
        appState.lastInteraction = Date.now();
    }

    /**
     * Get time since last interaction (in seconds)
     */
    function getInactivityTime() {
        return (Date.now() - appState.lastInteraction) / 1000;
    }

    /**
     * Reset inactivity timer
     */
    function resetInactivity() {
        appState.lastInteraction = Date.now();
    }

    // Public API
    return {
        setState: setState,
        getState: getState,
        clearState: clearState,
        addSymptom: addSymptom,
        addPrescription: addPrescription,
        setPatient: setPatient,
        getInactivityTime: getInactivityTime,
        resetInactivity: resetInactivity
    };
})();

// Export for use by other scripts
global.StateManager = StateManager;