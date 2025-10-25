/**
 * Clinical Mode State Machine - Test Suite (TDD Step 1)
 * Task 2.3 - Dev 2
 *
 * Tests the clinical assessment workflow state machine with 7 states:
 * IDLE, AWAITING_PATIENT, PATIENT_LOADED, RECORDING_SYMPTOMS,
 * SHOWING_INFO, PRESCRIBING, ERROR
 *
 * Requirements Coverage:
 * - FR-12: Clinical assessment workflow
 * - FR-13: Patient loading with 3 retry attempts
 * - FR-14: Voice-based patient search
 * - FR-15: Voice command mapping (session commands)
 * - FR-16: Symptom recording
 * - FR-18: Clinical decision support
 * - FR-20: Patient info display modes
 * - FR-21: Prescription workflow trigger
 * - FR-42: <3s voice response time
 * - AR-3: Patient card auto-hide after 10s
 */

describe('Clinical Mode State Machine', () => {
  let clinicalMode;
  let mockModeManager;
  let mockPatientCardRenderer;
  let mockPrescriptionUI;
  let mockApiClient;
  let mockVoiceController;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    jest.clearAllTimers();
    jest.useFakeTimers();

    // Mock dependencies
    mockModeManager = {
      getCurrentMode: jest.fn().mockReturnValue('IDLE'),
      switchMode: jest.fn(),
      notifyActivity: jest.fn()
    };

    mockPatientCardRenderer = {
      showPatientCard: jest.fn(),
      updateField: jest.fn(),
      showHistoryView: jest.fn(),
      showMedicationsView: jest.fn(),
      showAllergiesView: jest.fn(),
      hideCard: jest.fn()
    };

    mockPrescriptionUI = {
      startPrescriptionFlow: jest.fn(),
      isActive: jest.fn().mockReturnValue(false)
    };

    mockApiClient = {
      post: jest.fn()
    };

    mockVoiceController = {
      playTTS: jest.fn(),
      cancelTTS: jest.fn()
    };

    // Import module after mocks are set up
    const ClinicalMode = require('../../lens-studio-mock/clinicalMode');
    clinicalMode = new ClinicalMode(
      mockModeManager,
      mockPatientCardRenderer,
      mockPrescriptionUI,
      mockApiClient,
      mockVoiceController
    );
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // ========================================
  // 1. State Transitions (7 tests)
  // ========================================
  describe('State Transitions', () => {
    test('1.1: Should initialize in IDLE state', () => {
      expect(clinicalMode.getState()).toBe('IDLE');
      expect(clinicalMode.getCurrentPatient()).toBeNull();
    });

    test('1.2: Should transition IDLE → AWAITING_PATIENT on "start assessment"', async () => {
      // Mock patient loading to prevent immediate state change
      mockApiClient.post.mockImplementation(() => new Promise(() => {})); // Never resolves

      clinicalMode.handleVoiceCommand('start assessment Sarah Chen'); // Don't await

      // Give time for state transition
      await Promise.resolve();

      expect(clinicalMode.getState()).toBe('AWAITING_PATIENT');
      expect(mockVoiceController.playTTS).toHaveBeenCalledWith(
        expect.stringContaining('Loading patient')
      );
    });

    test('1.3: Should transition AWAITING_PATIENT → PATIENT_LOADED on successful load (FR-13)', async () => {
      const mockPatient = {
        name: 'Sarah Chen',
        age: 34,
        sex: 'Female',
        allergies: ['Penicillin'],
        medications: [{ name: 'Warfarin', dosage: '5mg daily' }],
        vital_signs: { bp: '120/80', hr: 72 }
      };

      mockApiClient.post.mockResolvedValueOnce({ data: { patient: mockPatient } });

      await clinicalMode.handleVoiceCommand('start assessment Sarah Chen');

      // Wait for API call to resolve
      await jest.runAllTimersAsync();

      expect(clinicalMode.getState()).toBe('PATIENT_LOADED');
      expect(clinicalMode.getCurrentPatient()).toEqual(mockPatient);
      expect(mockPatientCardRenderer.showPatientCard).toHaveBeenCalledWith(mockPatient);
    });

    test('1.4: Should transition PATIENT_LOADED → RECORDING_SYMPTOMS on "record symptom"', async () => {
      // Setup: Load patient first
      const mockPatient = { name: 'Sarah Chen', age: 34 };
      mockApiClient.post
        .mockResolvedValueOnce({ data: { patient: mockPatient } })
        .mockResolvedValueOnce({ data: { success: true } }) // symptom recording
        .mockResolvedValueOnce({ data: { suggestions: [] } }); // decision support
      await clinicalMode.handleVoiceCommand('start assessment Sarah Chen');
      await jest.runAllTimersAsync();

      // Test: Record symptom - don't await completion
      const recordPromise = clinicalMode.handleVoiceCommand('record symptom chest tightness');

      // Give time for state change but before completion
      await Promise.resolve();

      expect(clinicalMode.getState()).toBe('RECORDING_SYMPTOMS');

      // Wait for completion
      await recordPromise;

      expect(mockVoiceController.playTTS).toHaveBeenCalledWith(
        expect.stringContaining('Recorded symptom')
      );
    });

    test('1.5: Should transition PATIENT_LOADED → SHOWING_INFO on info commands (FR-20)', async () => {
      // Setup: Load patient
      const mockPatient = { name: 'Sarah Chen', medications: [] };
      mockApiClient.post.mockResolvedValueOnce({ data: { patient: mockPatient } });
      await clinicalMode.handleVoiceCommand('start assessment Sarah Chen');
      await jest.runAllTimersAsync();

      // Test: Show medications
      await clinicalMode.handleVoiceCommand('show medications');

      expect(clinicalMode.getState()).toBe('SHOWING_INFO');
      expect(mockPatientCardRenderer.showMedicationsView).toHaveBeenCalled();
    });

    test('1.6: Should transition PATIENT_LOADED → PRESCRIBING on "prescribe" command (FR-21)', async () => {
      // Setup: Load patient
      const mockPatient = { name: 'Sarah Chen' };
      mockApiClient.post.mockResolvedValueOnce({ data: { patient: mockPatient } });
      await clinicalMode.handleVoiceCommand('start assessment Sarah Chen');
      await jest.runAllTimersAsync();

      // Test: Start prescription
      await clinicalMode.handleVoiceCommand('prescribe Ibuprofen 400mg');

      expect(clinicalMode.getState()).toBe('PRESCRIBING');
      expect(mockPrescriptionUI.startPrescriptionFlow).toHaveBeenCalledWith(
        'Ibuprofen',
        '400mg',
        mockPatient
      );
    });

    test('1.7: Should transition to ERROR state on API failure, then back to IDLE after 5s', async () => {
      mockApiClient.post.mockRejectedValueOnce(new Error('Network error'));

      await clinicalMode.handleVoiceCommand('start assessment Sarah Chen');

      // Wait for the error to be handled
      await Promise.resolve();

      expect(clinicalMode.getState()).toBe('ERROR');
      expect(mockVoiceController.playTTS).toHaveBeenCalledWith(
        expect.stringContaining('error')
      );

      // Should auto-return to IDLE after 5 seconds
      jest.advanceTimersByTime(5000);
      expect(clinicalMode.getState()).toBe('IDLE');
    });
  });

  // ========================================
  // 2. Patient Loading with Retry Logic (4 tests)
  // ========================================
  describe('Patient Loading with Retry (FR-13, FR-14)', () => {
    test('2.1: Should allow 3 retry attempts if patient not found (FR-14a)', async () => {
      mockApiClient.post
        .mockResolvedValueOnce({ data: { patient: null, error: 'Patient not found' } })
        .mockResolvedValueOnce({ data: { patient: null, error: 'Patient not found' } })
        .mockResolvedValueOnce({ data: { patient: null, error: 'Patient not found' } });

      // Attempt 1
      await clinicalMode.handleVoiceCommand('start assessment John Doe');
      await jest.runAllTimersAsync();
      expect(mockVoiceController.playTTS).toHaveBeenCalledWith(
        expect.stringContaining('not found')
      );
      expect(clinicalMode.getRetryCount()).toBe(1);

      // Attempt 2
      await clinicalMode.handleVoiceCommand('start assessment Jane Doe');
      await jest.runAllTimersAsync();
      expect(clinicalMode.getRetryCount()).toBe(2);

      // Attempt 3
      await clinicalMode.handleVoiceCommand('start assessment Jim Doe');
      await jest.runAllTimersAsync();
      expect(clinicalMode.getRetryCount()).toBe(3);

      // After 3 attempts, should offer patient list or cancel
      expect(mockVoiceController.playTTS).toHaveBeenCalledWith(
        expect.stringMatching(/patient list|cancel/i)
      );
    });

    test('2.2: Should reset retry count on successful patient load', async () => {
      // Fail once
      mockApiClient.post
        .mockResolvedValueOnce({ data: { patient: null, error: 'Patient not found' } })
        .mockResolvedValueOnce({ data: { patient: { name: 'Sarah Chen' } } });

      await clinicalMode.handleVoiceCommand('start assessment Wrong Name');
      await jest.runAllTimersAsync();
      expect(clinicalMode.getRetryCount()).toBe(1);

      await clinicalMode.handleVoiceCommand('start assessment Sarah Chen');
      await jest.runAllTimersAsync();
      expect(clinicalMode.getRetryCount()).toBe(0);
      expect(clinicalMode.getState()).toBe('PATIENT_LOADED');
    });

    test('2.3: Should handle "cancel" command during retry attempts', async () => {
      mockApiClient.post.mockResolvedValueOnce({ data: { patient: null, error: 'Not found' } });

      await clinicalMode.handleVoiceCommand('start assessment Wrong Name');
      await jest.runAllTimersAsync();
      expect(clinicalMode.getRetryCount()).toBe(1);

      await clinicalMode.handleVoiceCommand('cancel');
      expect(clinicalMode.getState()).toBe('IDLE');
      expect(clinicalMode.getRetryCount()).toBe(0);
      expect(mockVoiceController.playTTS).toHaveBeenCalledWith(
        expect.stringContaining('cancelled')
      );
    });

    test('2.4: Should handle "show patient list" after max retries', async () => {
      const mockPatientList = ['Sarah Chen', 'John Smith', 'Emily Davis'];
      mockApiClient.post
        .mockResolvedValueOnce({ data: { patient: null } })
        .mockResolvedValueOnce({ data: { patient: null } })
        .mockResolvedValueOnce({ data: { patient: null } })
        .mockResolvedValueOnce({ data: { patients: mockPatientList } });

      // 3 failed attempts
      await clinicalMode.handleVoiceCommand('start assessment Wrong');
      await jest.runAllTimersAsync();
      await clinicalMode.handleVoiceCommand('start assessment Wrong2');
      await jest.runAllTimersAsync();
      await clinicalMode.handleVoiceCommand('start assessment Wrong3');
      await jest.runAllTimersAsync();

      // Request patient list
      await clinicalMode.handleVoiceCommand('show patient list');
      await jest.runAllTimersAsync();

      expect(mockVoiceController.playTTS).toHaveBeenCalledWith(
        expect.stringContaining('Sarah Chen')
      );
    });
  });

  // ========================================
  // 3. Voice Command Handling (6 tests)
  // ========================================
  describe('Voice Command Handling (FR-15)', () => {
    beforeEach(async () => {
      // Setup: Load patient for most tests
      const mockPatient = {
        name: 'Sarah Chen',
        allergies: ['Penicillin'],
        medications: [{ name: 'Warfarin', dosage: '5mg' }],
        diagnosis_history: [{ date: '2024-01-15', diagnosis: 'URI' }]
      };
      mockApiClient.post.mockResolvedValue({ data: { patient: mockPatient } });
      await clinicalMode.handleVoiceCommand('start assessment Sarah Chen');
      await jest.runAllTimersAsync();
      jest.clearAllMocks();
    });

    test('3.1: Should handle "record symptom: [description]" command (FR-16)', async () => {
      mockApiClient.post.mockResolvedValueOnce({ data: { success: true } });

      await clinicalMode.handleVoiceCommand('record symptom chest tightness and cough');

      expect(mockApiClient.post).toHaveBeenCalledWith(
        expect.stringContaining('/symptom/record'),
        expect.objectContaining({ symptom: 'chest tightness and cough' })
      );
      expect(mockVoiceController.playTTS).toHaveBeenCalledWith(
        expect.stringContaining('Recorded symptom')
      );
    });

    test('3.2: Should handle "show patient history" command (FR-20)', async () => {
      await clinicalMode.handleVoiceCommand('show patient history');

      expect(mockPatientCardRenderer.showHistoryView).toHaveBeenCalled();
      expect(clinicalMode.getState()).toBe('SHOWING_INFO');
    });

    test('3.3: Should handle "show medications" command (FR-20)', async () => {
      await clinicalMode.handleVoiceCommand('show medications');

      expect(mockPatientCardRenderer.showMedicationsView).toHaveBeenCalled();
    });

    test('3.4: Should handle "show allergies" command (FR-20)', async () => {
      await clinicalMode.handleVoiceCommand('show allergies');

      expect(mockPatientCardRenderer.showAllergiesView).toHaveBeenCalled();
    });

    test('3.5: Should handle "prescribe [medication] [dosage]" command (FR-21)', async () => {
      await clinicalMode.handleVoiceCommand('prescribe Acetaminophen 500mg');

      expect(mockPrescriptionUI.startPrescriptionFlow).toHaveBeenCalledWith(
        'Acetaminophen',
        '500mg',
        expect.any(Object)
      );
      expect(clinicalMode.getState()).toBe('PRESCRIBING');
    });

    test('3.6: Should handle "show available medications" command', async () => {
      const mockMeds = ['Amoxicillin', 'Acetaminophen', 'Ibuprofen'];
      mockApiClient.post.mockResolvedValueOnce({ data: { medications: mockMeds } });

      await clinicalMode.handleVoiceCommand('show available medications');
      await jest.runAllTimersAsync();

      expect(mockVoiceController.playTTS).toHaveBeenCalledWith(
        expect.stringContaining('Amoxicillin')
      );
    });
  });

  // ========================================
  // 4. AI Clinical Decision Support (2 tests)
  // ========================================
  describe('AI Clinical Decision Support (FR-18)', () => {
    beforeEach(async () => {
      const mockPatient = { name: 'Sarah Chen', symptoms: [] };
      mockApiClient.post.mockResolvedValue({ data: { patient: mockPatient } });
      await clinicalMode.handleVoiceCommand('start assessment Sarah Chen');
      await jest.runAllTimersAsync();
      jest.clearAllMocks();
    });

    test('4.1: Should request AI decision support after recording symptoms', async () => {
      mockApiClient.post
        .mockResolvedValueOnce({ data: { success: true } }) // symptom recording
        .mockResolvedValueOnce({
          data: {
            suggestions: ['Upper Respiratory Infection', 'Acute Bronchitis'],
            confidence: 0.85
          }
        }); // decision support

      await clinicalMode.handleVoiceCommand('record symptom chest tightness');
      await jest.runAllTimersAsync();

      // Should automatically request decision support
      expect(mockApiClient.post).toHaveBeenCalledWith(
        expect.stringContaining('/decision-support'),
        expect.any(Object)
      );
    });

    test('4.2: Should speak AI suggestions via TTS (FR-18)', async () => {
      mockApiClient.post
        .mockResolvedValueOnce({ data: { success: true } })
        .mockResolvedValueOnce({
          data: {
            suggestions: ['Upper Respiratory Infection'],
            rationale: 'Based on chest tightness and cough symptoms'
          }
        });

      await clinicalMode.handleVoiceCommand('record symptom chest tightness');
      await jest.runAllTimersAsync();

      expect(mockVoiceController.playTTS).toHaveBeenCalledWith(
        expect.stringContaining('Upper Respiratory Infection')
      );
    });
  });

  // ========================================
  // 5. Activity Tracking for Mode Manager (2 tests)
  // ========================================
  describe('Activity Tracking', () => {
    test('5.1: Should notify mode manager on every voice command (for 120s timer reset)', async () => {
      const mockPatient = { name: 'Sarah Chen' };
      mockApiClient.post.mockResolvedValue({ data: { patient: mockPatient } });

      await clinicalMode.handleVoiceCommand('start assessment Sarah Chen');
      expect(mockModeManager.notifyActivity).toHaveBeenCalled();

      await jest.runAllTimersAsync();
      jest.clearAllMocks();

      await clinicalMode.handleVoiceCommand('show medications');
      expect(mockModeManager.notifyActivity).toHaveBeenCalled();
    });

    test('5.2: Should notify mode manager when viewing patient info', async () => {
      const mockPatient = { name: 'Sarah Chen' };
      mockApiClient.post.mockResolvedValue({ data: { patient: mockPatient } });
      await clinicalMode.handleVoiceCommand('start assessment Sarah Chen');
      await jest.runAllTimersAsync();
      jest.clearAllMocks();

      await clinicalMode.handleVoiceCommand('show allergies');
      expect(mockModeManager.notifyActivity).toHaveBeenCalled();
    });
  });

  // ========================================
  // 6. Integration with Prescription UI (2 tests)
  // ========================================
  describe('Prescription UI Integration', () => {
    beforeEach(async () => {
      const mockPatient = { name: 'Sarah Chen' };
      mockApiClient.post.mockResolvedValue({ data: { patient: mockPatient } });
      await clinicalMode.handleVoiceCommand('start assessment Sarah Chen');
      await jest.runAllTimersAsync();
      jest.clearAllMocks();
    });

    test('6.1: Should delegate to prescription UI when prescribing', async () => {
      await clinicalMode.handleVoiceCommand('prescribe Amoxicillin 500mg');

      expect(mockPrescriptionUI.startPrescriptionFlow).toHaveBeenCalledWith(
        'Amoxicillin',
        '500mg',
        expect.objectContaining({ name: 'Sarah Chen' })
      );
    });

    test('6.2: Should return to PATIENT_LOADED state after prescription UI completes', async () => {
      await clinicalMode.handleVoiceCommand('prescribe Amoxicillin 500mg');
      expect(clinicalMode.getState()).toBe('PRESCRIBING');

      // Simulate prescription UI completion callback
      mockPrescriptionUI.isActive.mockReturnValue(false);
      await clinicalMode.onPrescriptionComplete();

      expect(clinicalMode.getState()).toBe('PATIENT_LOADED');
    });
  });
});
