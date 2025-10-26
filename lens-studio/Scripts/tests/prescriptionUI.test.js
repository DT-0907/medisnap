/**
 * Prescription UI Tests
 * Following TDD approach - tests written BEFORE implementation
 * Task Group 7: Prescription UI
 *
 * CRITICAL: This tests the Warfarin + Ibuprofen drug interaction demo
 */

// Mock dependencies
const mockApiClient = {
    createPrescription: jest.fn()
};

const mockStateManager = {
    getState: jest.fn(),
    setState: jest.fn()
};

const mockAudioComponent = {
    play: jest.fn(),
    stop: jest.fn()
};

// Mock AR components
const mockTextComponent = {
    text: '',
    enabled: false,
    getMaterial: jest.fn().mockReturnValue({
        mainColor: { r: 1, g: 1, b: 1, a: 1 }
    })
};

const mockScreenTransform = {
    anchors: {
        setCenter: jest.fn()
    }
};

const mockSceneObject = {
    enabled: false,
    getComponent: jest.fn((type) => {
        if (type === 'Component.Text') return mockTextComponent;
        if (type === 'Component.ScreenTransform') return mockScreenTransform;
        return null;
    })
};

// Mock configuration
global.MedSnapConfig = {
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
    TIMEOUTS: {
        PRESCRIPTION_UI_AUTO_HIDE: 5000
    },
    AR_COLORS: {
        WARNING: { r: 1, g: 0, b: 0, a: 1 },
        SUCCESS: { r: 0, g: 1, b: 0, a: 1 }
    },
    ERROR_MESSAGES: {
        MEDICATION_NOT_FOUND: "Medication not found. Say 'Show available medications' to see options.",
        DRUG_INTERACTION: "WARNING: Drug interaction detected. This prescription has been blocked for safety."
    }
};

// Import the module to test (will be implemented after tests)
let PrescriptionUI;

describe('Prescription UI', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
        jest.useFakeTimers();

        // Setup default mock returns
        mockStateManager.getState.mockReturnValue({
            currentPatient: {
                name: "Sarah Chen",
                medications: [
                    { name: "Warfarin", dosage: "5mg daily" },
                    { name: "Loratadine", dosage: "10mg daily" }
                ]
            }
        });

        // Reset module if it exists
        if (PrescriptionUI) {
            PrescriptionUI.reset();
        }
    });

    afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
    });

    describe('7.1 - Focused Prescription UI Tests', () => {

        test('7.1.1 - Should parse medication and dosage from voice command', () => {
            // Test medication/dosage parsing from voice
            const testCases = [
                {
                    input: "Prescribe Ibuprofen 400mg",
                    expected: { medication: "Ibuprofen", dosage: "400mg" }
                },
                {
                    input: "prescribe acetaminophen 650 milligrams",
                    expected: { medication: "Acetaminophen", dosage: "650mg" }
                },
                {
                    input: "Prescribe Warfarin 5mg daily",
                    expected: { medication: "Warfarin", dosage: "5mg" }
                },
                {
                    input: "prescribe metformin",
                    expected: { medication: "Metformin", dosage: "" }
                }
            ];

            testCases.forEach(testCase => {
                const result = PrescriptionUI.parsePrescriptionCommand(testCase.input);
                expect(result.medication).toBe(testCase.expected.medication);
                expect(result.dosage).toBe(testCase.expected.dosage);
            });
        });

        test('7.1.2 - Should display success state with green checkmark and pending badge', async () => {
            // Test success state with green checkmark
            mockApiClient.createPrescription.mockResolvedValue({
                success: true,
                prescription_id: "rx_123",
                status: "pending_physician_approval",
                audio_url: "success_audio.mp3"
            });

            await PrescriptionUI.createPrescription("Prescribe Acetaminophen 500mg");

            // Verify success UI elements
            expect(mockTextComponent.text).toContain("✓");
            expect(mockTextComponent.text).toContain("PENDING PHYSICIAN APPROVAL");
            expect(mockTextComponent.getMaterial().mainColor).toEqual(
                expect.objectContaining({ r: 0, g: 1, b: 0 }) // Green color
            );
            expect(mockSceneObject.enabled).toBe(true);

            // Verify audio playback
            expect(mockAudioComponent.play).toHaveBeenCalled();

            // Verify auto-hide after 5 seconds
            jest.advanceTimersByTime(5000);
            expect(mockSceneObject.enabled).toBe(false);
        });

        test('7.1.3 - Should display drug interaction warning for Warfarin + Ibuprofen', async () => {
            // Test drug interaction warning display - CRITICAL FOR DEMO
            mockApiClient.createPrescription.mockResolvedValue({
                success: false,
                blocked: true,
                warnings: [{
                    severity: "HIGH",
                    message: "Drug interaction: Ibuprofen + Warfarin increases bleeding risk"
                }],
                alternatives: ["Acetaminophen"],
                audio_url: "warning_audio.mp3"
            });

            await PrescriptionUI.createPrescription("Prescribe Ibuprofen 400mg");

            // Verify warning UI elements
            expect(mockTextComponent.text).toContain("⚠");
            expect(mockTextComponent.text).toContain("Drug interaction");
            expect(mockTextComponent.text).toContain("Warfarin");
            expect(mockTextComponent.text).toContain("bleeding risk");
            expect(mockTextComponent.getMaterial().mainColor).toEqual(
                expect.objectContaining({ r: 1, g: 0, b: 0 }) // Red color
            );

            // Verify full-screen warning overlay
            expect(mockSceneObject.enabled).toBe(true);
            expect(mockScreenTransform.anchors.setCenter).toHaveBeenCalledWith(0.5, 0.5);

            // Should NOT auto-hide - requires acknowledgment
            jest.advanceTimersByTime(10000);
            expect(mockSceneObject.enabled).toBe(true);
        });

        test('7.1.4 - Should display alternative medication suggestions', async () => {
            // Test alternative medication suggestions
            mockApiClient.createPrescription.mockResolvedValue({
                success: false,
                blocked: true,
                warnings: [{
                    severity: "HIGH",
                    message: "Drug interaction detected"
                }],
                alternatives: ["Acetaminophen", "Tramadol"],
                audio_url: "warning_audio.mp3"
            });

            await PrescriptionUI.createPrescription("Prescribe Ibuprofen 600mg");

            // Verify alternatives are displayed
            expect(mockTextComponent.text).toContain("Safe alternatives:");
            expect(mockTextComponent.text).toContain("Acetaminophen");
            expect(mockTextComponent.text).toContain("Tramadol");
        });

        test('7.1.5 - Should handle "Show available medications" command', () => {
            // Test "Show available medications" command
            PrescriptionUI.showAvailableMedications();

            // Verify medication list display
            expect(mockTextComponent.text).toContain("Available Medications:");
            expect(mockTextComponent.text).toContain("Amoxicillin");
            expect(mockTextComponent.text).toContain("Ibuprofen");
            expect(mockTextComponent.text).toContain("Warfarin");
            expect(mockTextComponent.text).toContain("Acetaminophen");
            expect(mockSceneObject.enabled).toBe(true);

            // Should include dosage guidelines
            expect(mockTextComponent.text).toContain("250mg");
            expect(mockTextComponent.text).toContain("400mg");

            // Auto-hide after viewing (10 seconds for list)
            jest.advanceTimersByTime(10000);
            expect(mockSceneObject.enabled).toBe(false);
        });

        test('7.1.6 - Should auto-hide success UI after 5 seconds', async () => {
            // Test auto-hide after 5 seconds
            mockApiClient.createPrescription.mockResolvedValue({
                success: true,
                prescription_id: "rx_456",
                status: "pending_physician_approval",
                audio_url: "success_audio.mp3"
            });

            await PrescriptionUI.createPrescription("Prescribe Metformin 500mg");

            expect(mockSceneObject.enabled).toBe(true);

            // Should still be visible at 4 seconds
            jest.advanceTimersByTime(4000);
            expect(mockSceneObject.enabled).toBe(true);

            // Should hide at 5 seconds
            jest.advanceTimersByTime(1000);
            expect(mockSceneObject.enabled).toBe(false);
        });
    });

    describe('7.2 - Voice Parsing Edge Cases', () => {

        test('Should handle ambiguous medication names', () => {
            const result = PrescriptionUI.parsePrescriptionCommand("prescribe ibu");
            expect(result.medication).toBe("Ibuprofen"); // Should match partial
            expect(result.ambiguous).toBe(true);
        });

        test('Should handle unknown medications', () => {
            const result = PrescriptionUI.parsePrescriptionCommand("prescribe aspirin 100mg");
            expect(result.medication).toBe(null);
            expect(result.error).toBe(global.MedSnapConfig.ERROR_MESSAGES.MEDICATION_NOT_FOUND);
        });

        test('Should normalize dosage formats', () => {
            const testCases = [
                { input: "400 mg", expected: "400mg" },
                { input: "400milligrams", expected: "400mg" },
                { input: "5 mg daily", expected: "5mg" },
                { input: "two hundred mg", expected: "200mg" }
            ];

            testCases.forEach(testCase => {
                const result = PrescriptionUI.normalizeDosage(testCase.input);
                expect(result).toBe(testCase.expected);
            });
        });
    });

    describe('7.3 - API Integration', () => {

        test('Should call prescription API with correct parameters', async () => {
            await PrescriptionUI.createPrescription("Prescribe Omeprazole 20mg");

            expect(mockApiClient.createPrescription).toHaveBeenCalledWith({
                patient_id: expect.any(String),
                medication: "Omeprazole",
                dosage: "20mg",
                patient_medications: expect.arrayContaining([
                    expect.objectContaining({ name: "Warfarin" })
                ])
            });
        });

        test('Should handle API errors gracefully', async () => {
            mockApiClient.createPrescription.mockRejectedValue({
                error: 'Network error'
            });

            await PrescriptionUI.createPrescription("Prescribe Lisinopril 10mg");

            expect(mockTextComponent.text).toContain("Error");
            expect(mockSceneObject.enabled).toBe(true);
        });
    });

    describe('7.5 - Warning UI Requirements', () => {

        test('Should show full-screen red border overlay for warnings', async () => {
            mockApiClient.createPrescription.mockResolvedValue({
                success: false,
                blocked: true,
                warnings: [{ severity: "HIGH", message: "Critical interaction" }]
            });

            await PrescriptionUI.createPrescription("Prescribe Ibuprofen 800mg");

            // Verify full-screen positioning
            expect(mockScreenTransform.anchors.setCenter).toHaveBeenCalledWith(0.5, 0.5);

            // Verify red border styling
            const borderStyle = PrescriptionUI.getWarningBorderStyle();
            expect(borderStyle).toContain("border: 5px solid red");
            expect(borderStyle).toContain("background-color: rgba(255, 0, 0, 0.1)");
        });

        test('Should require voice acknowledgment for warnings', async () => {
            mockApiClient.createPrescription.mockResolvedValue({
                success: false,
                blocked: true,
                warnings: [{ severity: "HIGH", message: "Drug interaction" }]
            });

            await PrescriptionUI.createPrescription("Prescribe Ibuprofen 400mg");

            // Warning should stay visible
            jest.advanceTimersByTime(20000);
            expect(mockSceneObject.enabled).toBe(true);

            // Acknowledge warning
            PrescriptionUI.acknowledgeWarning();
            expect(mockSceneObject.enabled).toBe(false);
        });

        test('Should display red X icon for blocked prescriptions', async () => {
            mockApiClient.createPrescription.mockResolvedValue({
                success: false,
                blocked: true,
                warnings: [{ severity: "HIGH", message: "Blocked" }]
            });

            await PrescriptionUI.createPrescription("Prescribe Ibuprofen 600mg");

            expect(mockTextComponent.text).toContain("✗"); // Red X
            expect(mockTextComponent.text).toContain("PRESCRIPTION BLOCKED");
        });
    });
});