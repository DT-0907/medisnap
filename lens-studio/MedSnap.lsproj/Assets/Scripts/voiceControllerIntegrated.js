/**
 * Integrated Voice Controller
 * Combines ASR with wake word detection and command routing
 * FR-27 through FR-31 compliance
 */

// @input Component.Text debugText
// @input Component.AudioComponent audioComponent
// @input Asset.RemoteServiceModule remoteServiceModule

const VoiceController = class {
    constructor() {
        // ASR module reference
        this.asrModule = null;
        this.isListening = false;
        this.transcriptionOptions = null;

        // Wake word detection
        this.wakeWord = "hey medsnap";
        this.wakeWordTimeout = 5000; // 5 seconds to say command after wake word
        this.wakeWordDetected = false;
        this.wakeWordTimer = null;

        // Session management
        this.currentMode = null; // 'training' or 'clinical'
        this.inSession = false;

        // Command buffer
        this.currentTranscription = "";
        this.lastFinalTranscription = "";

        // Audio feedback
        this.audioComponent = script.audioComponent;

        // API client for command processing
        this.apiClient = null;

        this.initialize();
    }

    initialize() {
        // Initialize ASR module
        if (global.AsrModule) {
            this.asrModule = global.AsrModule;
            this.setupASR();
        } else {
            print("[VoiceController] ASR Module not available");
        }

        // Setup API client
        this.setupApiClient();

        print("[VoiceController] Initialized");
    }

    setupASR() {
        // Create transcription options
        this.transcriptionOptions = this.asrModule.AsrTranscriptionOptions.create();
        this.transcriptionOptions.silenceUntilTerminationMs = 1200; // 1.2s pause = end
        this.transcriptionOptions.mode = this.asrModule.AsrMode.HighAccuracy;

        // Add event handlers
        this.transcriptionOptions.onTranscriptionUpdateEvent.add((eventArgs) => {
            this.onTranscriptionUpdate(eventArgs);
        });

        this.transcriptionOptions.onTranscriptionErrorEvent.add((error) => {
            this.onTranscriptionError(error);
        });
    }

    setupApiClient() {
        if (script.remoteServiceModule) {
            this.apiClient = {
                processCommand: (text) => {
                    const request = global.RemoteServiceHttpRequest.create();
                    request.url = 'http://localhost:3000/api/voice/command';
                    request.method = RemoteServiceHttpRequest.HttpRequestMethod.Post;
                    request.body = JSON.stringify({
                        transcription: text,
                        mode: this.currentMode,
                        inSession: this.inSession
                    });
                    return script.remoteServiceModule.performHttpRequest(request);
                }
            };
        }
    }

    // Public methods
    start() {
        if (this.isListening) return;

        this.isListening = true;

        if (this.asrModule) {
            this.asrModule.startTranscribing(this.transcriptionOptions)
                .then(() => {
                    print("[VoiceController] Started listening");
                    this.updateDebugText("🎤 Listening...");
                })
                .catch((error) => {
                    print("[VoiceController] Failed to start: " + error);
                    this.isListening = false;
                });
        }
    }

    stop() {
        if (!this.isListening) return;

        this.isListening = false;

        if (this.asrModule) {
            this.asrModule.stopTranscribing()
                .then(() => {
                    print("[VoiceController] Stopped listening");
                    this.updateDebugText("🔇 Stopped");
                })
                .catch((error) => {
                    print("[VoiceController] Failed to stop: " + error);
                });
        }
    }

    // ASR event handlers
    onTranscriptionUpdate(eventArgs) {
        if (!eventArgs) return;

        if (eventArgs.isFinal) {
            // Final transcription - process as command
            const finalText = eventArgs.transcription.toLowerCase().trim();
            print("[VoiceController] Final: " + finalText);

            this.lastFinalTranscription = finalText;
            this.processTranscription(finalText);
        } else {
            // Partial transcription - update UI
            this.currentTranscription = eventArgs.transcription;
            this.updateDebugText("💭 " + this.currentTranscription);
        }
    }

    onTranscriptionError(error) {
        print("[VoiceController] Error: " + error);
        this.updateDebugText("❌ Error: " + error);
    }

    // Command processing
    processTranscription(text) {
        if (!text) return;

        // Check for wake word
        if (!this.inSession && !this.wakeWordDetected) {
            if (this.detectWakeWord(text)) {
                this.handleWakeWord(text);
            }
            return;
        }

        // Process as command
        this.processCommand(text);
    }

    detectWakeWord(text) {
        const normalized = text.toLowerCase().replace(/[^a-z ]/g, '');
        return normalized.includes(this.wakeWord);
    }

    handleWakeWord(text) {
        print("[VoiceController] Wake word detected");
        this.wakeWordDetected = true;

        // Play confirmation beep
        this.playBeep();
        this.updateDebugText("✅ Hey MedSnap! Listening...");

        // Extract command after wake word
        const wakeWordIndex = text.toLowerCase().indexOf(this.wakeWord);
        const commandText = text.substring(wakeWordIndex + this.wakeWord.length).trim();

        if (commandText) {
            // Command included with wake word
            this.processCommand(commandText);
        } else {
            // Wait for command
            this.startWakeWordTimer();
        }
    }

    startWakeWordTimer() {
        // Reset any existing timer
        if (this.wakeWordTimer) {
            clearTimeout(this.wakeWordTimer);
        }

        // Set new timer
        this.wakeWordTimer = setTimeout(() => {
            this.wakeWordDetected = false;
            print("[VoiceController] Wake word timeout");
            this.updateDebugText("⏱️ Timeout - say 'Hey MedSnap' again");
        }, this.wakeWordTimeout);
    }

    async processCommand(text) {
        print("[VoiceController] Processing: " + text);

        // Clear wake word state
        this.wakeWordDetected = false;
        if (this.wakeWordTimer) {
            clearTimeout(this.wakeWordTimer);
            this.wakeWordTimer = null;
        }

        // Route to appropriate handler
        if (this.routeLocalCommand(text)) {
            // Handled locally
            return;
        }

        // Send to backend for NLP processing
        try {
            const response = await this.apiClient?.processCommand(text);
            if (response) {
                this.handleCommandResponse(response);
            }
        } catch (error) {
            print("[VoiceController] API error: " + error);
            this.playError();
        }
    }

    routeLocalCommand(text) {
        const lower = text.toLowerCase();

        // Session-initiating commands
        if (!this.inSession) {
            if (lower.includes("start training") || lower.includes("training pulse")) {
                this.startTrainingMode();
                return true;
            }

            if (lower.includes("start assessment") || lower.includes("assess")) {
                const patientName = this.extractPatientName(text);
                this.startClinicalMode(patientName);
                return true;
            }
        }

        // In-session commands
        if (this.inSession) {
            // Training mode commands
            if (this.currentMode === 'training') {
                if (lower.includes("end training") || lower.includes("stop training")) {
                    this.endTrainingMode();
                    return true;
                }

                // BPM response
                const bpmMatch = text.match(/\d+/);
                if (bpmMatch) {
                    const count = parseInt(bpmMatch[0]);
                    if (global.trainingMode) {
                        global.trainingMode.processBPMResponse(count);
                    }
                    return true;
                }

                // Pass to training mode
                if (global.trainingMode) {
                    return global.trainingMode.handleCommand(text);
                }
            }

            // Clinical mode commands
            if (this.currentMode === 'clinical') {
                if (lower.includes("end assessment") || lower.includes("stop assessment")) {
                    this.endClinicalMode();
                    return true;
                }

                // Record symptom
                if (lower.includes("record symptom") || lower.includes("symptom")) {
                    const symptom = text.replace(/record symptom:?|symptom:?/gi, '').trim();
                    if (global.clinicalMode) {
                        global.clinicalMode.recordSymptom(symptom);
                    }
                    return true;
                }

                // Show commands
                if (lower.includes("show")) {
                    if (lower.includes("medication") || lower.includes("meds")) {
                        global.clinicalMode?.showMedications();
                        return true;
                    }
                    if (lower.includes("allerg")) {
                        global.clinicalMode?.showAllergies();
                        return true;
                    }
                    if (lower.includes("history")) {
                        global.clinicalMode?.showHistory();
                        return true;
                    }
                    if (lower.includes("available")) {
                        global.clinicalMode?.showAvailableMedications();
                        return true;
                    }
                }

                // Prescribe medication
                if (lower.includes("prescribe")) {
                    const prescription = text.replace(/prescribe:?/gi, '').trim();
                    if (global.clinicalMode) {
                        global.clinicalMode.prescribeMedication(prescription);
                    }
                    return true;
                }

                // Pass to clinical mode
                if (global.clinicalMode) {
                    return global.clinicalMode.handleCommand(text);
                }
            }
        }

        return false;
    }

    // Mode management
    startTrainingMode() {
        print("[VoiceController] Starting training mode");
        this.currentMode = 'training';
        this.inSession = true;

        if (global.trainingMode) {
            global.trainingMode.startPulseTraining();
        }

        this.playConfirmation();
        this.updateDebugText("🏃 Training Mode Active");
    }

    endTrainingMode() {
        print("[VoiceController] Ending training mode");
        this.currentMode = null;
        this.inSession = false;

        if (global.trainingMode) {
            global.trainingMode.endTraining();
        }

        this.playConfirmation();
        this.updateDebugText("✅ Training Complete");
    }

    startClinicalMode(patientName) {
        print("[VoiceController] Starting clinical mode for: " + patientName);
        this.currentMode = 'clinical';
        this.inSession = true;

        if (global.clinicalMode) {
            global.clinicalMode.startAssessment(patientName);
        }

        this.playConfirmation();
        this.updateDebugText("🏥 Clinical Mode: " + patientName);
    }

    endClinicalMode() {
        print("[VoiceController] Ending clinical mode");
        this.currentMode = null;
        this.inSession = false;

        if (global.clinicalMode) {
            global.clinicalMode.endAssessment();
        }

        this.playConfirmation();
        this.updateDebugText("✅ Assessment Complete");
    }

    // Utility methods
    extractPatientName(text) {
        // Remove common words to extract patient name
        const cleaned = text
            .replace(/hey medsnap|start assessment|assess|for|patient|named/gi, '')
            .trim();

        return cleaned || 'Unknown Patient';
    }

    handleCommandResponse(response) {
        if (!response) return;

        // Handle different response types
        if (response.action) {
            switch (response.action) {
                case 'load_patient':
                    global.clinicalMode?.loadPatient(response.patient_name);
                    break;
                case 'show_medications':
                    global.clinicalMode?.showMedications();
                    break;
                case 'prescribe':
                    global.clinicalMode?.prescribeMedication(response.medication, response.dosage);
                    break;
                default:
                    print("[VoiceController] Unknown action: " + response.action);
            }
        }

        // Play TTS response if available
        if (response.tts_url) {
            this.playTTS(response.tts_url);
        }
    }

    // Audio feedback
    playBeep() {
        print("[VoiceController] 🔔 BEEP");
        // In production, play actual beep sound
        if (this.audioComponent) {
            // this.audioComponent.play(beepSound);
        }
    }

    playConfirmation() {
        print("[VoiceController] ✅ Confirmation");
        // Visual indicator for in-session commands
    }

    playError() {
        print("[VoiceController] ❌ Error sound");
    }

    playTTS(url) {
        print("[VoiceController] Playing TTS from: " + url);
        if (this.audioComponent) {
            // Load and play TTS audio
            // this.audioComponent.audioTrack = loadAudioFromUrl(url);
            // this.audioComponent.play();
        }
    }

    // UI updates
    updateDebugText(text) {
        if (script.debugText) {
            script.debugText.text = text;
        }
        print("[VoiceController] " + text);
    }

    // Cleanup
    cleanup() {
        this.stop();
        this.currentMode = null;
        this.inSession = false;
        this.wakeWordDetected = false;

        if (this.wakeWordTimer) {
            clearTimeout(this.wakeWordTimer);
            this.wakeWordTimer = null;
        }
    }
};

// Create and export instance
const voiceController = new VoiceController();
global.voiceController = voiceController;

// Auto-start listening
voiceController.start();

print("[VoiceController] Integrated voice control ready");

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VoiceController;
}