/**
 * API Client for Backend Communication
 * Dev 2 - Task Group 2: Backend Integration Client
 *
 * Minimal implementation following KISS principle
 */

// @input Asset.RemoteServiceModule remoteServiceModule

const ApiClient = (function() {
    // Configuration
    const API_BASE_URL = global.MedSnapConfig ? global.MedSnapConfig.API_BASE_URL : 'http://localhost:3000';
    const TIMEOUT_MS = 3000; // 3 second timeout (FR-42)
    const DEMO_MODE = global.MedSnapConfig ? global.MedSnapConfig.DEMO_MODE : false;

    /**
     * Load patient data by name
     */
    function loadPatient(patientName) {
        if (DEMO_MODE) {
            return Promise.resolve(getMockPatientData(patientName));
        }

        return makeRequest('/api/clinical/patient/load', {
            patient_name: patientName
        });
    }

    /**
     * Record a symptom for the current patient
     */
    function recordSymptom(data) {
        if (DEMO_MODE) {
            return Promise.resolve({
                success: true,
                message: "Symptom recorded",
                audio_url: "mock_tts_symptom.mp3"
            });
        }

        return makeRequest('/api/clinical/symptom/record', data);
    }

    /**
     * Get AI decision support
     */
    function getDecisionSupport(data) {
        if (DEMO_MODE) {
            return Promise.resolve({
                success: true,
                recommendations: "Based on symptoms, recommend chest X-ray and consider upper respiratory infection.",
                audio_url: "mock_tts_decision.mp3"
            });
        }

        return makeRequest('/api/clinical/decision-support', data);
    }

    /**
     * Create a prescription with safety checks
     */
    function createPrescription(data) {
        if (DEMO_MODE) {
            // Mock drug interaction for Warfarin + Ibuprofen
            if (data.medication && data.medication.toLowerCase() === 'ibuprofen') {
                return Promise.resolve({
                    success: false,
                    blocked: true,
                    warnings: [{
                        severity: "HIGH",
                        message: "Drug interaction: Ibuprofen + Warfarin increases bleeding risk"
                    }],
                    alternatives: ["Acetaminophen"],
                    audio_url: "mock_tts_warning.mp3"
                });
            }

            return Promise.resolve({
                success: true,
                prescription_id: "mock_rx_123",
                status: "pending_physician_approval",
                audio_url: "mock_tts_prescription.mp3"
            });
        }

        return makeRequest('/api/clinical/prescription/create', data);
    }

    /**
     * Extract intent from voice command
     */
    function processVoiceCommand(transcription) {
        if (DEMO_MODE) {
            return Promise.resolve({
                success: true,
                intent: parseIntentLocally(transcription),
                entities: extractEntitiesLocally(transcription)
            });
        }

        return makeRequest('/api/voice/command', {
            transcription: transcription
        });
    }

    /**
     * Make HTTP request using RemoteServiceModule
     */
    function makeRequest(endpoint, data) {
        return new Promise((resolve, reject) => {
            if (!script.remoteServiceModule) {
                reject({ error: 'RemoteServiceModule not configured' });
                return;
            }

            const request = RemoteServiceModule.createHttpRequest();
            request.url = API_BASE_URL + endpoint;
            request.method = RemoteServiceModule.HttpRequestMethod.Post;
            request.headers = { "Content-Type": "application/json" };
            request.body = JSON.stringify(data);

            const timeoutId = setTimeout(() => {
                reject({ error: 'Request timeout' });
            }, TIMEOUT_MS);

            script.remoteServiceModule.performHttpRequest(request, function(response) {
                clearTimeout(timeoutId);

                if (response.statusCode === 200) {
                    try {
                        const data = JSON.parse(response.body);
                        resolve(data);
                    } catch (e) {
                        reject({ error: 'Invalid response format' });
                    }
                } else {
                    reject({
                        error: 'Request failed',
                        statusCode: response.statusCode
                    });
                }
            });
        });
    }

    /**
     * Mock data for demo mode - Sarah Chen
     */
    function getMockPatientData(patientName) {
        if (patientName.toLowerCase().includes('sarah chen')) {
            return {
                success: true,
                patient: {
                    id: "mock_123",
                    name: "Sarah Chen",
                    age: 34,
                    sex: "Female",
                    allergies: ["Penicillin"],
                    medications: [
                        { name: "Warfarin", dosage: "5mg daily" },
                        { name: "Loratadine", dosage: "10mg daily" }
                    ],
                    current_symptoms: ["Chest tightness", "Coughing"],
                    vital_signs: {
                        bp: "118/76",
                        hr: 88,
                        o2: 97,
                        temp: 101.5
                    }
                },
                audio_url: "mock_tts_patient.mp3"
            };
        }

        return {
            success: false,
            error: "Patient not found"
        };
    }

    /**
     * Local intent parsing for demo mode
     */
    function parseIntentLocally(text) {
        const lower = text.toLowerCase();

        if (lower.includes('start assessment')) return 'load_patient';
        if (lower.includes('record symptom')) return 'record_symptom';
        if (lower.includes('prescribe')) return 'create_prescription';
        if (lower.includes('show medications')) return 'show_medications';
        if (lower.includes('show allergies')) return 'show_allergies';
        if (lower.includes('show history')) return 'show_history';
        if (lower.includes('end assessment')) return 'end_assessment';

        return 'unknown';
    }

    /**
     * Local entity extraction for demo mode
     */
    function extractEntitiesLocally(text) {
        const entities = {};

        // Extract patient name
        const nameMatch = text.match(/start assessment\s+(.+)/i);
        if (nameMatch) {
            entities.patient_name = nameMatch[1].trim();
        }

        // Extract symptom
        const symptomMatch = text.match(/record symptom\s*:?\s*(.+)/i);
        if (symptomMatch) {
            entities.symptom = symptomMatch[1].trim();
        }

        // Extract medication and dosage
        const prescribeMatch = text.match(/prescribe\s+(\w+)\s*(.+)?/i);
        if (prescribeMatch) {
            entities.medication = prescribeMatch[1];
            entities.dosage = prescribeMatch[2] ? prescribeMatch[2].trim() : '';
        }

        return entities;
    }

    // Public API
    return {
        loadPatient: loadPatient,
        recordSymptom: recordSymptom,
        getDecisionSupport: getDecisionSupport,
        createPrescription: createPrescription,
        processVoiceCommand: processVoiceCommand
    };
})();

// Export for use by other scripts
global.ApiClient = ApiClient;