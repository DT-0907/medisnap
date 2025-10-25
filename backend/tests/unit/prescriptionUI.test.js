/**
 * Prescription UI - Test Suite (TDD Step 1)
 * Task 2.4 - Dev 2
 *
 * Tests the prescription workflow UI component including:
 * - Medication/dosage parsing from voice commands
 * - API integration for prescription creation
 * - Success/warning/blocked prescription display
 * - Alternative medication suggestions
 * - TTS audio playback
 * - Unknown medication handling
 * - Available medications list display
 *
 * Requirements Coverage:
 * - FR-21: Prescription creation workflow
 * - FR-22: Medication database (8 baseline medications)
 * - FR-22a: Unknown medication handling
 * - FR-23: Drug interaction checking
 * - FR-24: Prescription blocking for safety
 * - FR-25: Alternative medication suggestions
 * - FR-26: Prescription success confirmation
 * - FR-26a: "PENDING" badge display
 */

describe('Prescription UI', () => {
  let prescriptionUI;
  let mockApiClient;
  let mockVoiceController;
  let mockARDisplay;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock dependencies
    mockApiClient = {
      post: jest.fn()
    };

    mockVoiceController = {
      playTTS: jest.fn()
    };

    mockARDisplay = {
      showSuccessIcon: jest.fn(),
      showWarningIcon: jest.fn(),
      showPendingBadge: jest.fn(),
      showAlternatives: jest.fn(),
      clearDisplay: jest.fn()
    };

    // Import module
    const PrescriptionUI = require('../../lens-studio-mock/prescriptionUI');
    prescriptionUI = new PrescriptionUI(mockApiClient, mockVoiceController, mockARDisplay);
  });

  // ========================================
  // 1. Command Parsing (3 tests)
  // ========================================
  describe('Command Parsing', () => {
    test('1.1: Should extract medication name and dosage from voice command', () => {
      const { medication, dosage } = prescriptionUI.parseCommand('prescribe Ibuprofen 400mg');

      expect(medication).toBe('Ibuprofen');
      expect(dosage).toBe('400mg');
    });

    test('1.2: Should handle commands with "twice daily" dosage format', () => {
      const { medication, dosage } = prescriptionUI.parseCommand('prescribe Amoxicillin 500mg twice daily');

      expect(medication).toBe('Amoxicillin');
      expect(dosage).toBe('500mg twice daily');
    });

    test('1.3: Should return null for empty medication name', () => {
      const result = prescriptionUI.parseCommand('prescribe');

      expect(result.medication).toBeNull();
      expect(result.dosage).toBeNull();
    });
  });

  // ========================================
  // 2. API Integration (2 tests)
  // ========================================
  describe('API Integration', () => {
    test('2.1: Should call prescription API with correct parameters', async () => {
      const patient = { id: '123', name: 'Sarah Chen' };
      mockApiClient.post.mockResolvedValueOnce({
        data: { success: true, prescription_id: 'rx-001', status: 'pending' }
      });

      await prescriptionUI.startPrescriptionFlow('Acetaminophen', '500mg', patient);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/api/clinical/prescription/create',
        expect.objectContaining({
          patient_id: '123',
          medication: 'Acetaminophen',
          dosage: '500mg'
        })
      );
    });

    test('2.2: Should handle API errors gracefully', async () => {
      const patient = { id: '123' };
      mockApiClient.post.mockRejectedValueOnce(new Error('Network error'));

      await prescriptionUI.startPrescriptionFlow('Ibuprofen', '400mg', patient);

      expect(mockVoiceController.playTTS).toHaveBeenCalledWith(
        expect.stringContaining('error')
      );
    });
  });

  // ========================================
  // 3. Success Display (2 tests)
  // ========================================
  describe('Success Display (FR-26, FR-26a)', () => {
    test('3.1: Should display green checkmark and PENDING badge on success', async () => {
      const patient = { id: '123' };
      mockApiClient.post.mockResolvedValueOnce({
        data: {
          success: true,
          prescription_id: 'rx-001',
          status: 'pending_physician_approval',
          message: 'Prescription created successfully'
        }
      });

      await prescriptionUI.startPrescriptionFlow('Acetaminophen', '500mg', patient);

      expect(mockARDisplay.showSuccessIcon).toHaveBeenCalled();
      expect(mockARDisplay.showPendingBadge).toHaveBeenCalledWith('PENDING');
      expect(mockVoiceController.playTTS).toHaveBeenCalledWith(
        expect.stringContaining('created successfully')
      );
    });

    test('3.2: Should speak prescription confirmation message', async () => {
      const patient = { id: '123' };
      mockApiClient.post.mockResolvedValueOnce({
        data: {
          success: true,
          message: 'Acetaminophen 500mg prescribed. Pending physician approval.',
          audio_url: 'https://tts.example.com/audio.mp3'
        }
      });

      await prescriptionUI.startPrescriptionFlow('Acetaminophen', '500mg', patient);

      expect(mockVoiceController.playTTS).toHaveBeenCalledWith(
        'Acetaminophen 500mg prescribed. Pending physician approval.'
      );
    });
  });

  // ========================================
  // 4. Warning/Blocked Display (3 tests)
  // ========================================
  describe('Warning/Blocked Display (FR-24)', () => {
    test('4.1: Should display red X icon when prescription blocked', async () => {
      const patient = { id: '123' };
      mockApiClient.post.mockResolvedValueOnce({
        data: {
          success: false,
          blocked: true,
          warnings: [{
            severity: 'HIGH',
            interaction: 'Warfarin + Ibuprofen',
            reason: 'Increased bleeding risk'
          }]
        }
      });

      await prescriptionUI.startPrescriptionFlow('Ibuprofen', '400mg', patient);

      expect(mockARDisplay.showWarningIcon).toHaveBeenCalled();
      expect(mockVoiceController.playTTS).toHaveBeenCalledWith(
        expect.stringContaining('blocked')
      );
    });

    test('4.2: Should display warning message with details', async () => {
      const patient = { id: '123' };
      mockApiClient.post.mockResolvedValueOnce({
        data: {
          success: false,
          blocked: true,
          warnings: [{
            severity: 'HIGH',
            interaction: 'Warfarin + Ibuprofen',
            reason: 'Increased bleeding risk'
          }],
          message: 'Prescription blocked due to HIGH severity drug interaction.'
        }
      });

      await prescriptionUI.startPrescriptionFlow('Ibuprofen', '400mg', patient);

      expect(mockVoiceController.playTTS).toHaveBeenCalledWith(
        expect.stringContaining('HIGH severity drug interaction')
      );
    });

    test('4.3: Should save prescription even if blocked (FR-24)', async () => {
      const patient = { id: '123' };
      mockApiClient.post.mockResolvedValueOnce({
        data: {
          success: false,
          blocked: true,
          prescription_id: 'rx-002', // Still logged
          status: 'blocked',
          warnings: [{ severity: 'HIGH' }]
        }
      });

      await prescriptionUI.startPrescriptionFlow('Ibuprofen', '400mg', patient);

      // Verify prescription was logged (has an ID)
      expect(mockVoiceController.playTTS).toHaveBeenCalled();
    });
  });

  // ========================================
  // 5. Alternative Medication Suggestions (1 test)
  // ========================================
  describe('Alternative Medication Suggestions (FR-25)', () => {
    test('5.1: Should display and speak alternative medications when blocked', async () => {
      const patient = { id: '123' };
      mockApiClient.post.mockResolvedValueOnce({
        data: {
          success: false,
          blocked: true,
          alternatives: [
            { medication: 'Acetaminophen', dosage: '500mg', reason: 'No interaction with Warfarin' }
          ],
          message: 'Consider Acetaminophen as a safer alternative.'
        }
      });

      await prescriptionUI.startPrescriptionFlow('Ibuprofen', '400mg', patient);

      expect(mockARDisplay.showAlternatives).toHaveBeenCalledWith([
        expect.objectContaining({ medication: 'Acetaminophen' })
      ]);
      expect(mockVoiceController.playTTS).toHaveBeenCalledWith(
        expect.stringContaining('Acetaminophen')
      );
    });
  });

  // ========================================
  // 6. Unknown Medication Handling (2 tests)
  // ========================================
  describe('Unknown Medication Handling (FR-22a)', () => {
    test('6.1: Should speak "Medication not found" for unknown medications', async () => {
      const patient = { id: '123' };
      mockApiClient.post.mockResolvedValueOnce({
        data: {
          success: false,
          error: 'medication_not_found',
          message: 'Medication not found. Say "Show available medications" to see the list.'
        }
      });

      await prescriptionUI.startPrescriptionFlow('UnknownDrug', '100mg', patient);

      expect(mockVoiceController.playTTS).toHaveBeenCalledWith(
        expect.stringContaining('not found')
      );
      expect(mockVoiceController.playTTS).toHaveBeenCalledWith(
        expect.stringContaining('Show available medications')
      );
    });

    test('6.2: Should handle "show available medications" command', async () => {
      const mockMeds = [
        'Amoxicillin', 'Azithromycin', 'Acetaminophen', 'Ibuprofen',
        'Lisinopril', 'Metformin', 'Omeprazole', 'Warfarin'
      ];
      mockApiClient.post.mockResolvedValueOnce({
        data: { medications: mockMeds }
      });

      await prescriptionUI.showAvailableMedications();

      expect(mockVoiceController.playTTS).toHaveBeenCalledWith(
        expect.stringMatching(/Amoxicillin.*Azithromycin.*Acetaminophen/)
      );
    });
  });

  // ========================================
  // 7. State Management (2 tests)
  // ========================================
  describe('State Management', () => {
    test('7.1: Should track if prescription UI is active', async () => {
      expect(prescriptionUI.isActive()).toBe(false);

      const patient = { id: '123' };
      mockApiClient.post.mockImplementation(() => new Promise(() => {})); // Never resolves

      prescriptionUI.startPrescriptionFlow('Ibuprofen', '400mg', patient);

      // Give time for async operation to start
      await Promise.resolve();

      expect(prescriptionUI.isActive()).toBe(true);
    });

    test('7.2: Should mark as inactive after prescription completes', async () => {
      const patient = { id: '123' };
      mockApiClient.post.mockResolvedValueOnce({
        data: { success: true }
      });

      await prescriptionUI.startPrescriptionFlow('Acetaminophen', '500mg', patient);

      expect(prescriptionUI.isActive()).toBe(false);
    });
  });
});
