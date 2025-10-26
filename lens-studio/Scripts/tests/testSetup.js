/**
 * Test Setup for Lens Studio Scripts
 * Global test configuration and mocks
 */

// Mock Lens Studio global objects
global.print = console.log;
global.script = {
    setTimeout: setTimeout,
    clearTimeout: clearTimeout,
    setInterval: setInterval,
    clearInterval: clearInterval
};

// Mock Lens Studio Components
global.Component = {
    Text: class {
        constructor() {
            this.text = '';
            this.size = 18;
            this.color = { r: 1, g: 1, b: 1, a: 1 };
        }
    },
    AudioComponent: class {
        constructor() {
            this.audioTrack = null;
            this.play = jest.fn();
            this.stop = jest.fn();
            this.pause = jest.fn();
        }
    },
    ScreenTransform: class {
        constructor() {
            this.anchors = {
                setCenter: jest.fn(),
                setSize: jest.fn()
            };
            this.position = { x: 0, y: 0, z: 0 };
        }
    }
};

// Mock RemoteServiceModule for API calls
global.RemoteServiceModule = {
    performHttpRequest: jest.fn((request, callback) => {
        // Default to success response
        setTimeout(() => {
            callback({
                statusCode: 200,
                body: JSON.stringify({ success: true })
            });
        }, 10);
    })
};

// Mock Request object
global.Request = class {
    constructor(url) {
        this.url = url;
        this.method = 'GET';
        this.body = null;
        this.headers = {};
    }

    static HttpMethod = {
        Get: 'GET',
        Post: 'POST',
        Put: 'PUT',
        Delete: 'DELETE'
    };
};

// Load configuration
global.MedSnapConfig = {
    API_BASE_URL: 'http://localhost:3000',
    DEMO_MODE: true,
    AR_COLORS: {
        PULSE_CIRCLE: { r: 0, g: 1, b: 1, a: 0.5 },
        DIRECTION_ARROW: { r: 1, g: 1, b: 0, a: 1 },
        WARNING: { r: 1, g: 0, b: 0, a: 1 },
        SUCCESS: { r: 0, g: 1, b: 0, a: 1 },
        ALLERGY_TEXT: { r: 1, g: 0, b: 0, a: 1 },
        CARD_BG: { r: 0.1, g: 0.1, b: 0.1, a: 0.5 }
    },
    TIMEOUTS: {
        VOICE_RESPONSE: 3000,
        PATIENT_CARD_AUTO_HIDE: 10000,
        CLINICAL_MODE_INACTIVITY: 120000,
        PRESCRIPTION_UI_AUTO_HIDE: 5000,
        TRAINING_MODE_INACTIVITY: 10000,
        CV_RETRY: 10000
    },
    TYPOGRAPHY: {
        MIN_FONT_SIZE: 18,
        HEADER_SIZE: 24,
        BODY_SIZE: 18,
        ENLARGED_ALLERGY_SIZE: 28
    },
    CLINICAL_STATES: {
        IDLE: 'IDLE',
        LOADING_PATIENT: 'LOADING_PATIENT',
        PATIENT_LOADED: 'PATIENT_LOADED',
        RECORDING_SYMPTOM: 'RECORDING_SYMPTOM',
        PRESCRIBING: 'PRESCRIBING',
        REQUESTING_DECISION: 'REQUESTING_DECISION'
    },
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
    ERROR_MESSAGES: {
        PATIENT_NOT_FOUND: "Patient not found. Would you like to see available patients?",
        NETWORK_ERROR: "Network connection failed. Retrying...",
        MEDICATION_NOT_FOUND: "Medication not found. Say 'Show available medications' to see options.",
        DRUG_INTERACTION: "WARNING: Drug interaction detected. This prescription has been blocked for safety.",
        CV_FAILURE: "Unable to detect wrist. Please adjust your position or say 'skip' to continue."
    }
};

// Utility functions for testing
global.testUtils = {
    // Wait for async operations
    waitFor: (predicate, timeout = 1000) => {
        return new Promise((resolve, reject) => {
            const interval = 10;
            let elapsed = 0;

            const check = () => {
                if (predicate()) {
                    resolve();
                } else if (elapsed >= timeout) {
                    reject(new Error('Timeout waiting for condition'));
                } else {
                    elapsed += interval;
                    setTimeout(check, interval);
                }
            };

            check();
        });
    },

    // Create mock scene object
    createMockSceneObject: () => ({
        getComponent: jest.fn((type) => {
            switch (type) {
                case 'Component.Text':
                    return new global.Component.Text();
                case 'Component.AudioComponent':
                    return new global.Component.AudioComponent();
                case 'Component.ScreenTransform':
                    return new global.Component.ScreenTransform();
                default:
                    return null;
            }
        }),
        enabled: true,
        name: 'TestObject'
    }),

    // Create mock patient data
    createMockPatient: (name = 'Sarah Chen') => ({
        name: name,
        age: 34,
        sex: 'Female',
        allergies: ['Penicillin'],
        medications: [
            { name: 'Warfarin', dosage: '5mg daily' },
            { name: 'Loratadine', dosage: '10mg daily' }
        ],
        chief_complaint: 'Chest tightness and shortness of breath',
        vitals: {
            bp: '120/80',
            hr: 78,
            temp: '98.6°F',
            o2: '98%'
        }
    })
};

console.log('[Test Setup] Lens Studio test environment configured');