/**
 * Clinical Mode State Machine Tests
 * Following TDD approach - tests written BEFORE implementation
 * Task Group 6: Clinical State Machine
 */

// Mock dependencies
const mockPatientCardRenderer = {
    showCard: jest.fn(),
    hideCard: jest.fn(),
    updateCard: jest.fn(),
    filterToMedications: jest.fn(),
    filterToAllergies: jest.fn(),
    filterToHistory: jest.fn()
};

const mockApiClient = {
    loadPatient: jest.fn(),
    recordSymptom: jest.fn(),
    getDecisionSupport: jest.fn(),
    createPrescription: jest.fn()
};

const mockStateManager = {
    setState: jest.fn(),
    getState: jest.fn(),
    clearState: jest.fn()
};

const mockAudioComponent = {
    play: jest.fn(),
    stop: jest.fn()
};

// Import the module to test (will be implemented after tests)
let ClinicalMode;

describe('Clinical Mode State Machine', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();

        // Reset module if it exists
        if (ClinicalMode) {
            ClinicalMode.reset();
        }
    });

    describe('6.1 - Core Clinical Mode Tests', () => {

        test('6.1.1 - Should load patient with "start assessment" command', async () => {
            // Arrange
            const voiceCommand = "start assessment Sarah Chen";
            mockApiClient.loadPatient.mockResolvedValue({
                success: true,
                patient: {
                    name: "Sarah Chen",
                    age: 34,
                    sex: "Female",
                    allergies: ["Penicillin"],
                    medications: [
                        { name: "Warfarin", dosage: "5mg daily" },
                        { name: "Loratadine", dosage: "10mg daily" }
                    ]
                },
                audio_url: "tts_audio_1.mp3"
            });

            // Act
            const result = await ClinicalMode.handleVoiceCommand(voiceCommand);

            // Assert
            expect(mockApiClient.loadPatient).toHaveBeenCalledWith("Sarah Chen");
            expect(mockPatientCardRenderer.showCard).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: "Sarah Chen",
                    age: 34,
                    sex: "Female"
                })
            );
            expect(ClinicalMode.getCurrentState()).toBe('PATIENT_LOADED');
            expect(result.success).toBe(true);
        });

        test('6.1.2 - Should implement 3-retry logic for patient not found', async () => {
            // Arrange
            mockApiClient.loadPatient
                .mockRejectedValueOnce({ error: 'Patient not found' })
                .mockRejectedValueOnce({ error: 'Patient not found' })
                .mockRejectedValueOnce({ error: 'Patient not found' });

            // Act
            const result = await ClinicalMode.loadPatientWithRetry("John Doe");

            // Assert
            expect(mockApiClient.loadPatient).toHaveBeenCalledTimes(3);
            expect(result.success).toBe(false);
            expect(result.offerPatientList).toBe(true);
            expect(result.message).toContain('Would you like to see available patients?');
        });

        test('6.1.3 - Should record symptoms successfully', async () => {
            // Arrange - Patient already loaded
            ClinicalMode.setState('PATIENT_LOADED');
            mockStateManager.getState.mockReturnValue({
                patient: { name: "Sarah Chen", id: "123" }
            });

            mockApiClient.recordSymptom.mockResolvedValue({
                success: true,
                message: "Symptom recorded",
                audio_url: "tts_confirm.mp3"
            });

            // Act
            const result = await ClinicalMode.handleVoiceCommand("record symptom chest tightness");

            // Assert
            expect(mockApiClient.recordSymptom).toHaveBeenCalledWith({
                patient_id: "123",
                symptom: "chest tightness"
            });
            expect(result.showConfirmation).toBe(true);
            expect(result.confirmationType).toBe('green_checkmark');
            expect(mockAudioComponent.play).toHaveBeenCalled();
        });

        test('6.1.4 - Should request decision support', async () => {
            // Arrange
            ClinicalMode.setState('PATIENT_LOADED');
            mockStateManager.getState.mockReturnValue({
                patient: { name: "Sarah Chen", id: "123" },
                symptoms: ["chest tightness", "shortness of breath"]
            });

            mockApiClient.getDecisionSupport.mockResolvedValue({
                success: true,
                recommendations: "Possible upper respiratory infection. Consider chest X-ray.",
                audio_url: "tts_recommendations.mp3"
            });

            // Act
            const result = await ClinicalMode.requestDecisionSupport();

            // Assert
            expect(mockApiClient.getDecisionSupport).toHaveBeenCalledWith({
                patient_id: "123",
                symptoms: ["chest tightness", "shortness of breath"]
            });
            expect(mockAudioComponent.play).toHaveBeenCalled();
            expect(result.success).toBe(true);
        });

        test('6.1.5 - Should initiate prescription workflow', async () => {
            // Arrange
            ClinicalMode.setState('PATIENT_LOADED');
            const command = "prescribe Ibuprofen 400mg";

            // Act
            const result = await ClinicalMode.handleVoiceCommand(command);

            // Assert
            expect(ClinicalMode.getCurrentState()).toBe('PRESCRIBING');
            expect(result.medication).toBe("Ibuprofen");
            expect(result.dosage).toBe("400mg");
            expect(result.initiatedPrescription).toBe(true);
        });

        test('6.1.6 - Should auto-exit after 120 seconds of inactivity', async () => {
            // Arrange
            ClinicalMode.setState('PATIENT_LOADED');
            jest.useFakeTimers();

            // Act
            ClinicalMode.startInactivityTimer();

            // Fast-forward time by 119 seconds - should still be active
            jest.advanceTimersByTime(119000);
            expect(ClinicalMode.getCurrentState()).toBe('PATIENT_LOADED');

            // Fast-forward 1 more second to reach 120 seconds
            jest.advanceTimersByTime(1000);

            // Assert
            expect(ClinicalMode.getCurrentState()).toBe('IDLE');
            expect(mockStateManager.clearState).toHaveBeenCalled();
            expect(mockAudioComponent.play).toHaveBeenCalled(); // TTS: "Assessment complete"

            jest.useRealTimers();
        });

        test('6.1.7 - Should route voice commands correctly', async () => {
            // Arrange
            ClinicalMode.setState('PATIENT_LOADED');
            mockStateManager.getState.mockReturnValue({
                patient: {
                    medications: ["Warfarin", "Loratadine"],
                    allergies: ["Penicillin"],
                    history: ["Hypertension", "Diabetes"]
                }
            });

            // Test various commands
            const commands = [
                { input: "show medications", expectedFilter: 'medications' },
                { input: "show allergies", expectedFilter: 'allergies' },
                { input: "show patient history", expectedFilter: 'history' },
                { input: "repeat instructions", expectedAction: 'repeat' },
                { input: "end assessment", expectedState: 'IDLE' }
            ];

            // Act & Assert for each command
            for (const cmd of commands) {
                await ClinicalMode.handleVoiceCommand(cmd.input);

                if (cmd.expectedFilter) {
                    const filterMethod = `filterTo${cmd.expectedFilter.charAt(0).toUpperCase() + cmd.expectedFilter.slice(1)}`;
                    expect(mockPatientCardRenderer[filterMethod]).toHaveBeenCalled();
                } else if (cmd.expectedAction === 'repeat') {
                    expect(mockAudioComponent.play).toHaveBeenCalled();
                } else if (cmd.expectedState) {
                    expect(ClinicalMode.getCurrentState()).toBe(cmd.expectedState);
                }
            }
        });

        test('6.1.8 - Should handle errors gracefully and recover', async () => {
            // Arrange
            ClinicalMode.setState('PATIENT_LOADED');
            mockApiClient.recordSymptom.mockRejectedValue({
                error: 'Network timeout'
            });

            // Act
            const result = await ClinicalMode.handleVoiceCommand("record symptom headache");

            // Assert
            expect(result.success).toBe(false);
            expect(result.error).toContain('Network timeout');
            expect(ClinicalMode.getCurrentState()).toBe('PATIENT_LOADED'); // Still in same state
            expect(result.canRetry).toBe(true);
        });
    });

    describe('6.6 - State Transitions', () => {

        test('Should transition from IDLE to LOADING_PATIENT to PATIENT_LOADED', async () => {
            // Arrange
            expect(ClinicalMode.getCurrentState()).toBe('IDLE');

            mockApiClient.loadPatient.mockResolvedValue({
                success: true,
                patient: { name: "Sarah Chen" }
            });

            // Act
            const promise = ClinicalMode.loadPatient("Sarah Chen");

            // Check intermediate state
            expect(ClinicalMode.getCurrentState()).toBe('LOADING_PATIENT');

            await promise;

            // Assert final state
            expect(ClinicalMode.getCurrentState()).toBe('PATIENT_LOADED');
        });

        test('Should transition from PATIENT_LOADED to RECORDING_SYMPTOM and back', async () => {
            // Arrange
            ClinicalMode.setState('PATIENT_LOADED');
            mockApiClient.recordSymptom.mockResolvedValue({ success: true });

            // Act
            const promise = ClinicalMode.recordSymptom("headache");

            // Check intermediate state
            expect(ClinicalMode.getCurrentState()).toBe('RECORDING_SYMPTOM');

            await promise;

            // Assert - returns to PATIENT_LOADED after recording
            expect(ClinicalMode.getCurrentState()).toBe('PATIENT_LOADED');
        });

        test('Should clean up properly on state transitions', () => {
            // Arrange
            ClinicalMode.setState('PATIENT_LOADED');
            const cleanupSpy = jest.spyOn(ClinicalMode, 'cleanup');

            // Act
            ClinicalMode.exitMode();

            // Assert
            expect(cleanupSpy).toHaveBeenCalled();
            expect(mockPatientCardRenderer.hideCard).toHaveBeenCalled();
            expect(mockStateManager.clearState).toHaveBeenCalled();
            expect(ClinicalMode.getCurrentState()).toBe('IDLE');
        });
    });

    describe('6.7 - Inactivity Timer', () => {

        test('Should reset timer on user interaction', () => {
            // Arrange
            ClinicalMode.setState('PATIENT_LOADED');
            jest.useFakeTimers();

            ClinicalMode.startInactivityTimer();

            // Act - advance time by 100 seconds
            jest.advanceTimersByTime(100000);

            // User interaction should reset timer
            ClinicalMode.resetInactivityTimer();

            // Advance another 100 seconds (total would be 200s without reset)
            jest.advanceTimersByTime(100000);

            // Assert - should still be active (only 100s since reset)
            expect(ClinicalMode.getCurrentState()).toBe('PATIENT_LOADED');

            jest.useRealTimers();
        });

        test('Should auto-exit with proper TTS message', async () => {
            // Arrange
            ClinicalMode.setState('PATIENT_LOADED');
            jest.useFakeTimers();

            // Act
            ClinicalMode.startInactivityTimer();
            jest.advanceTimersByTime(120000);

            // Assert
            expect(mockAudioComponent.play).toHaveBeenCalledWith(
                expect.objectContaining({
                    text: "Assessment complete. Exiting clinical mode."
                })
            );
            expect(ClinicalMode.getCurrentState()).toBe('IDLE');

            jest.useRealTimers();
        });
    });
});