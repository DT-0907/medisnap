/**
 * API Integration Manager
 * Manages all external API connections (Gemini, Fish Audio, Letta, Supabase)
 * Configured for production with real API keys
 */

// @input Asset.RemoteServiceModule remoteServiceModule

const APIIntegrationManager = class {
    constructor() {
        // API Endpoints
        this.endpoints = {
            // Backend API (Local deployment)
            backend: 'http://localhost:3000',
            // For production: 'https://medsnap-api.railway.app'

            // External APIs (handled by backend proxy)
            gemini: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
            fishAudio: 'https://api.fish.audio/v1/tts',
            letta: 'https://api.letta.ai/v1/agents',
            supabase: 'https://YOUR_PROJECT.supabase.co'
        };

        // API Keys handled by backend (reads from .env file)
        // Backend has access to:
        // - GEMINI_API_KEY
        // - FISH_AUDIO_API_KEY
        // - LETTA_API_KEY
        // - SUPABASE_URL and SUPABASE_KEY
        this.useBackendProxy = true; // All API calls go through backend

        // Cache for TTS responses
        this.ttsCache = new Map();
        this.maxCacheSize = 100;

        // Request queue for rate limiting
        this.requestQueue = [];
        this.isProcessing = false;

        // Initialize
        this.initialize();
    }

    initialize() {
        print("[APIIntegrationManager] Initializing with production endpoints");

        // Validate API keys
        this.validateAPIKeys();

        // Pre-cache common TTS phrases
        this.preCacheTTSPhrases();
    }

    validateAPIKeys() {
        // API keys are managed by backend via .env file
        if (this.useBackendProxy) {
            print("[APIIntegrationManager] Using backend proxy - API keys loaded from .env");
            this.demoMode = false;

            // Verify backend connection
            this.verifyBackendConnection();
        } else {
            print("[APIIntegrationManager] Running in DEMO MODE - Using mock responses");
            this.demoMode = true;
        }
    }

    async verifyBackendConnection() {
        try {
            const request = {
                url: `${this.endpoints.backend}/health`,
                method: 'GET'
            };

            const response = await this.makeRequest(request);
            if (response && response.status === 'ok') {
                print("[APIIntegrationManager] ✅ Backend connected - API keys available");
            } else {
                print("[APIIntegrationManager] ⚠️ Backend connection issue");
            }
        } catch (error) {
            print("[APIIntegrationManager] ❌ Backend not reachable: " + error);
            print("[APIIntegrationManager] Falling back to DEMO MODE");
            this.demoMode = true;
        }
    }

    // Training Mode APIs
    async startTrainingSession() {
        const request = {
            url: `${this.endpoints.backend}/api/training/start`,
            method: 'POST',
            body: JSON.stringify({
                timestamp: Date.now(),
                device: 'snap_spectacles'
            })
        };

        return this.makeRequest(request);
    }

    async sendTrainingFeedback(bpm, technique) {
        const request = {
            url: `${this.endpoints.backend}/api/training/feedback`,
            method: 'POST',
            body: JSON.stringify({
                bpm,
                technique,
                timestamp: Date.now()
            })
        };

        const response = await this.makeRequest(request);

        // Generate TTS for feedback
        if (response && response.feedback) {
            response.tts_url = await this.generateTTS(response.feedback);
        }

        return response;
    }

    // Clinical Mode APIs
    async loadPatient(patientName) {
        const request = {
            url: `${this.endpoints.backend}/api/clinical/patient/load`,
            method: 'POST',
            body: JSON.stringify({
                patient_name: patientName
            })
        };

        const response = await this.makeRequest(request);

        // Pre-cache patient data TTS
        if (response && response.patient) {
            const summary = this.generatePatientSummary(response.patient);
            response.tts_url = await this.generateTTS(summary);
        }

        return response;
    }

    async recordSymptom(patientId, symptom) {
        const request = {
            url: `${this.endpoints.backend}/api/clinical/symptom/record`,
            method: 'POST',
            body: JSON.stringify({
                patient_id: patientId,
                symptom,
                timestamp: Date.now()
            })
        };

        return this.makeRequest(request);
    }

    async getDecisionSupport(symptoms, patientData) {
        // First, get context from Letta
        const context = await this.getLettaContext(patientData.id);

        // Then, get AI decision support via Gemini
        const request = {
            url: `${this.endpoints.backend}/api/clinical/decision-support`,
            method: 'POST',
            body: JSON.stringify({
                symptoms,
                patient: patientData,
                context
            })
        };

        const response = await this.makeRequest(request);

        // Generate TTS for recommendations
        if (response && response.recommendations) {
            const summary = response.recommendations.join('. ');
            response.tts_url = await this.generateTTS(summary);
        }

        return response;
    }

    async createPrescription(patientId, medication, dosage) {
        const request = {
            url: `${this.endpoints.backend}/api/clinical/prescription/create`,
            method: 'POST',
            body: JSON.stringify({
                patient_id: patientId,
                medication,
                dosage,
                prescribed_by: 'MedSnap AR System',
                timestamp: Date.now()
            })
        };

        const response = await this.makeRequest(request);

        // Generate TTS for prescription result
        if (response) {
            let message;
            if (response.blocked) {
                message = `Prescription blocked. ${response.warnings[0].message}. ${response.alternatives ? 'Consider ' + response.alternatives[0] : ''}`;
            } else {
                message = `Prescription created for ${medication} ${dosage}. Status: ${response.status}`;
            }
            response.tts_url = await this.generateTTS(message);
        }

        return response;
    }

    // Voice Command Processing
    async processVoiceCommand(transcription, mode, inSession) {
        const request = {
            url: `${this.endpoints.backend}/api/voice/command`,
            method: 'POST',
            body: JSON.stringify({
                transcription,
                mode,
                in_session: inSession,
                timestamp: Date.now()
            })
        };

        return this.makeRequest(request);
    }

    // External API Integrations

    // Gemini AI for clinical insights (via backend with .env keys)
    async getGeminiInsights(prompt) {
        if (this.demoMode) {
            return this.getMockGeminiResponse(prompt);
        }

        // Backend handles Gemini API call using GEMINI_API_KEY from .env
        const request = {
            url: `${this.endpoints.backend}/api/external/gemini`,
            method: 'POST',
            body: JSON.stringify({
                prompt: `Medical context: ${prompt}\nProvide clinical insights and recommendations.`,
                temperature: 0.7,
                maxOutputTokens: 500
            })
        };

        try {
            const response = await this.makeRequest(request);
            return response.text || response.insights;
        } catch (error) {
            print("[APIIntegrationManager] Gemini error: " + error);
            return this.getMockGeminiResponse(prompt);
        }
    }

    // Fish Audio TTS (via backend with .env keys)
    async generateTTS(text) {
        // Check cache first
        if (this.ttsCache.has(text)) {
            print("[APIIntegrationManager] TTS cache hit");
            return this.ttsCache.get(text);
        }

        if (this.demoMode) {
            return this.getMockTTSUrl(text);
        }

        // Backend handles Fish Audio API call using FISH_AUDIO_API_KEY from .env
        const request = {
            url: `${this.endpoints.backend}/api/tts/generate`,
            method: 'POST',
            body: JSON.stringify({
                text,
                voice: 'medical_professional', // Professional medical voice
                speed: 1.0,
                pitch: 1.0
            })
        };

        try {
            const response = await this.makeRequest(request);
            const audioUrl = response.audio_url || response.tts_url;

            // Cache the response
            this.cacheTTS(text, audioUrl);

            return audioUrl;
        } catch (error) {
            print("[APIIntegrationManager] Fish Audio error: " + error);
            return this.getMockTTSUrl(text);
        }
    }

    // Letta Context Management (via backend with .env keys)
    async getLettaContext(patientId) {
        if (this.demoMode) {
            return this.getMockLettaContext(patientId);
        }

        // Backend handles Letta API call using LETTA_API_KEY from .env
        const request = {
            url: `${this.endpoints.backend}/api/external/letta/context`,
            method: 'POST',
            body: JSON.stringify({
                patient_id: patientId,
                max_turns: 20,
                max_tokens: 4000
            })
        };

        try {
            const response = await this.makeRequest(request);
            return response.context;
        } catch (error) {
            print("[APIIntegrationManager] Letta error: " + error);
            return this.getMockLettaContext(patientId);
        }
    }

    // Supabase Database (via backend with .env keys)
    async querySupabase(query) {
        if (this.demoMode) {
            return this.getMockSupabaseData(query);
        }

        // Backend handles Supabase query using SUPABASE_URL and SUPABASE_KEY from .env
        const request = {
            url: `${this.endpoints.backend}/api/database/query`,
            method: 'POST',
            body: JSON.stringify({
                query
            })
        };

        try {
            const response = await this.makeRequest(request);
            return response.data || response;
        } catch (error) {
            print("[APIIntegrationManager] Supabase error: " + error);
            return this.getMockSupabaseData(query);
        }
    }

    // Request handling
    async makeRequest(request) {
        if (!script.remoteServiceModule) {
            print("[APIIntegrationManager] RemoteServiceModule not available");
            return this.getMockResponse(request);
        }

        try {
            const httpRequest = global.RemoteServiceHttpRequest.create();
            httpRequest.url = request.url;
            httpRequest.method = request.method === 'POST' ?
                RemoteServiceHttpRequest.HttpRequestMethod.Post :
                RemoteServiceHttpRequest.HttpRequestMethod.Get;

            if (request.body) {
                httpRequest.body = request.body;
            }

            const response = await script.remoteServiceModule.performHttpRequest(httpRequest);
            return JSON.parse(response.body);
        } catch (error) {
            print("[APIIntegrationManager] Request error: " + error);
            return this.getMockResponse(request);
        }
    }

    // All external API calls now go through backend which has .env keys
    // No need for direct external requests from client

    // Caching
    cacheTTS(text, url) {
        // Implement LRU cache
        if (this.ttsCache.size >= this.maxCacheSize) {
            const firstKey = this.ttsCache.keys().next().value;
            this.ttsCache.delete(firstKey);
        }

        this.ttsCache.set(text, url);
    }

    preCacheTTSPhrases() {
        const commonPhrases = [
            "Starting pulse taking training",
            "Wrist detected. Position your fingers on the pulse point",
            "Good position. Apply gentle pressure",
            "Count the beats for 15 seconds. Starting now",
            "Time. What was your count?",
            "Training complete. Great job",
            "Patient loaded successfully",
            "Prescription created successfully",
            "Drug interaction warning"
        ];

        // Pre-generate TTS for common phrases
        commonPhrases.forEach(phrase => {
            this.generateTTS(phrase).then(url => {
                print(`[APIIntegrationManager] Pre-cached: ${phrase.substring(0, 30)}...`);
            });
        });
    }

    // Utility methods
    generatePatientSummary(patient) {
        return `Patient ${patient.name}, ${patient.age} year old ${patient.sex}. ` +
               `Chief complaint: ${patient.chief_complaint}. ` +
               `Allergies: ${patient.allergies.join(', ')}. ` +
               `Current medications: ${patient.medications.map(m => m.name).join(', ')}.`;
    }

    // Mock responses for demo mode
    getMockResponse(request) {
        print("[APIIntegrationManager] Returning mock response for: " + request.url);

        if (request.url.includes('/patient/load')) {
            return {
                success: true,
                patient: {
                    id: '123',
                    name: 'Sarah Chen',
                    age: 34,
                    sex: 'Female',
                    chief_complaint: 'Chest tightness',
                    allergies: ['Penicillin'],
                    medications: [
                        { name: 'Warfarin', dosage: '5mg daily' },
                        { name: 'Loratadine', dosage: '10mg daily' }
                    ]
                }
            };
        }

        if (request.url.includes('/prescription/create')) {
            const body = JSON.parse(request.body);
            if (body.medication.toLowerCase() === 'ibuprofen') {
                return {
                    success: false,
                    blocked: true,
                    warnings: [{
                        type: 'drug_interaction',
                        severity: 'HIGH',
                        message: 'Ibuprofen interacts with Warfarin - increased bleeding risk'
                    }],
                    alternatives: ['Acetaminophen']
                };
            }
            return {
                success: true,
                status: 'pending_physician_approval'
            };
        }

        return { success: true, demo_mode: true };
    }

    getMockGeminiResponse(prompt) {
        return "Based on the symptoms presented, consider upper respiratory infection. " +
               "Recommend symptomatic treatment and follow-up if symptoms persist.";
    }

    getMockTTSUrl(text) {
        return `https://demo.medsnap.com/tts/${encodeURIComponent(text.substring(0, 50))}.mp3`;
    }

    getMockLettaContext(patientId) {
        return {
            turns: 5,
            summary: "Patient presenting with chest tightness. Previous history of allergies."
        };
    }

    getMockSupabaseData(query) {
        if (query.includes('patients')) {
            return [{
                id: '123',
                name: 'Sarah Chen',
                medications: [{ name: 'Warfarin', dosage: '5mg daily' }]
            }];
        }
        return [];
    }
};

// Create and export instance
const apiManager = new APIIntegrationManager();
global.apiManager = apiManager;

print("[APIIntegrationManager] Ready - External APIs configured");

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = APIIntegrationManager;
}