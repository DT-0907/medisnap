/**
 * MedSnap Configuration
 * Global configuration for all script components
 */

global.MedSnapConfig = {
    // API Configuration
    API_BASE_URL: 'http://localhost:3000', // Update with Railway URL from Dev 3
    DEMO_MODE: true, // Enable demo mode for testing without backend

    // AR Colors (per FR AR-1)
    AR_COLORS: {
        PULSE_CIRCLE: { r: 0, g: 1, b: 1, a: 0.5 }, // Cyan at 50% opacity
        DIRECTION_ARROW: { r: 1, g: 1, b: 0, a: 1 }, // Bright yellow
        WARNING: { r: 1, g: 0, b: 0, a: 1 }, // Red
        SUCCESS: { r: 0, g: 1, b: 0, a: 1 }, // Green
        ALLERGY_TEXT: { r: 1, g: 0, b: 0, a: 1 }, // Red for allergies
        CARD_BG: { r: 0.1, g: 0.1, b: 0.1, a: 0.5 } // Semi-transparent background
    },

    // Timeouts (in milliseconds)
    TIMEOUTS: {
        VOICE_RESPONSE: 3000, // 3 seconds (FR-42)
        PATIENT_CARD_AUTO_HIDE: 10000, // 10 seconds (FR-13)
        CLINICAL_MODE_INACTIVITY: 120000, // 120 seconds (FR-12a)
        PRESCRIPTION_UI_AUTO_HIDE: 5000, // 5 seconds (FR-26)
        TRAINING_MODE_INACTIVITY: 10000, // 10 seconds
        CV_RETRY: 10000 // 10 seconds for CV retry (FR-10a)
    },

    // Typography
    TYPOGRAPHY: {
        MIN_FONT_SIZE: 18, // Minimum 18pt (FR AR-2)
        HEADER_SIZE: 24,
        BODY_SIZE: 18,
        ENLARGED_ALLERGY_SIZE: 28
    },

    // Clinical State Enums
    CLINICAL_STATES: {
        IDLE: 'IDLE',
        LOADING_PATIENT: 'LOADING_PATIENT',
        PATIENT_LOADED: 'PATIENT_LOADED',
        RECORDING_SYMPTOM: 'RECORDING_SYMPTOM',
        PRESCRIBING: 'PRESCRIBING',
        REQUESTING_DECISION: 'REQUESTING_DECISION'
    },

    // Training State Enums
    TRAINING_STATES: {
        IDLE: 'IDLE',
        DETECTING_WRIST: 'DETECTING_WRIST',
        VALIDATING_PLACEMENT: 'VALIDATING_PLACEMENT',
        COUNTING: 'COUNTING',
        AWAITING_INPUT: 'AWAITING_INPUT',
        FEEDBACK: 'FEEDBACK',
        COMPLETE: 'COMPLETE'
    },

    // Available Medications (FR-22)
    MEDICATIONS: [
        { name: "Amoxicillin", type: "antibiotic", dosages: ["250mg", "500mg"] },
        { name: "Azithromycin", type: "antibiotic", dosages: ["250mg", "500mg"] },
        { name: "Acetaminophen", type: "pain reliever", dosages: ["325mg", "500mg", "650mg"] },
        { name: "Ibuprofen", type: "NSAID", dosages: ["200mg", "400mg", "600mg", "800mg"] },
        { name: "Lisinopril", type: "hypertension", dosages: ["5mg", "10mg", "20mg"] },
        { name: "Metformin", type: "diabetes", dosages: ["500mg", "850mg", "1000mg"] },
        { name: "Omeprazole", type: "acid reflux", dosages: ["20mg", "40mg"] },
        { name: "Warfarin", type: "anticoagulant", dosages: ["2mg", "5mg", "10mg"] }
    ],

    // Performance Requirements
    PERFORMANCE: {
        MIN_FPS: 30, // Minimum 30 FPS (FR-41)
        CV_LATENCY: 500, // CV detection <500ms (FR-43)
        TTS_GENERATION: 1500, // TTS <1.5 seconds (FR-44)
        TTS_CACHE_TARGET: 500 // Target <500ms with cache
    },

    // Debug Mode
    DEBUG: true,

    // Error Messages
    ERROR_MESSAGES: {
        PATIENT_NOT_FOUND: "Patient not found. Would you like to see available patients?",
        NETWORK_ERROR: "Network connection failed. Retrying...",
        MEDICATION_NOT_FOUND: "Medication not found. Say 'Show available medications' to see options.",
        DRUG_INTERACTION: "WARNING: Drug interaction detected. This prescription has been blocked for safety.",
        CV_FAILURE: "Unable to detect wrist. Please adjust your position or say 'skip' to continue."
    }
};

// Export configuration
print("MedSnap configuration loaded");
print("Demo mode: " + global.MedSnapConfig.DEMO_MODE);
print("API URL: " + global.MedSnapConfig.API_BASE_URL);