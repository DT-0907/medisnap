/**
 * Clinical Mode State Machine (Node.js Mock Implementation)
 * Task 2.3 - Dev 2
 *
 * 7-state state machine for clinical assessment workflow:
 * IDLE → AWAITING_PATIENT → PATIENT_LOADED → RECORDING_SYMPTOMS/SHOWING_INFO/PRESCRIBING → ERROR
 *
 * Requirements Coverage:
 * - FR-12: Clinical assessment workflow
 * - FR-13: Patient loading
 * - FR-14: Voice-based patient search with 3 retry attempts
 * - FR-15: Voice command mapping
 * - FR-16: Symptom recording
 * - FR-18: AI clinical decision support
 * - FR-20: Patient info display modes
 * - FR-21: Prescription workflow trigger
 * - AR-3: Patient card auto-hide after 10s
 */

class ClinicalMode {
  constructor(modeManager, patientCardRenderer, prescriptionUI, apiClient, voiceController) {
    this.modeManager = modeManager;
    this.patientCardRenderer = patientCardRenderer;
    this.prescriptionUI = prescriptionUI;
    this.apiClient = apiClient;
    this.voiceController = voiceController;

    // State machine
    this.currentState = 'IDLE';
    this.currentPatient = null;
    this.sessionSymptoms = [];
    this.retryCount = 0;

    // Constants
    this.MAX_RETRIES = 3;
    this.ERROR_TIMEOUT = 5000; // 5 seconds before returning to IDLE from ERROR
  }

  /**
   * Get current state (for testing)
   */
  getState() {
    return this.currentState;
  }

  /**
   * Get current patient (for testing)
   */
  getCurrentPatient() {
    return this.currentPatient;
  }

  /**
   * Get retry count (for testing)
   */
  getRetryCount() {
    return this.retryCount;
  }

  /**
   * Main voice command handler - delegates to state-specific handlers
   */
  async handleVoiceCommand(command) {
    // Notify mode manager of activity (resets 120s inactivity timer)
    this.modeManager.notifyActivity();

    const originalCommand = command.trim();
    const lowerCommand = command.toLowerCase().trim();

    // Handle "cancel" command globally
    if (lowerCommand === 'cancel') {
      await this.handleCancel();
      return;
    }

    // Route to state-specific handlers
    switch (this.currentState) {
      case 'IDLE':
        await this.handleIdleState(lowerCommand);
        break;
      case 'AWAITING_PATIENT':
        await this.handleAwaitingPatientState(lowerCommand);
        break;
      case 'PATIENT_LOADED':
        await this.handlePatientLoadedState(lowerCommand, originalCommand);
        break;
      case 'RECORDING_SYMPTOMS':
        await this.handleRecordingSymptomsState(lowerCommand);
        break;
      case 'SHOWING_INFO':
        await this.handleShowingInfoState(lowerCommand, originalCommand);
        break;
      case 'PRESCRIBING':
        // Prescription UI handles its own commands
        break;
      case 'ERROR':
        // Auto-recovers to IDLE after timeout
        break;
    }
  }

  /**
   * IDLE state handler - only accepts "start assessment" command
   */
  async handleIdleState(command) {
    if (command.startsWith('start assessment')) {
      const patientName = command.replace('start assessment', '').trim();
      await this.startAssessment(patientName);
    }
  }

  /**
   * AWAITING_PATIENT state handler - accepts retry attempts or "show patient list"
   */
  async handleAwaitingPatientState(command) {
    if (command.startsWith('start assessment')) {
      // Another attempt at loading a patient
      const patientName = command.replace('start assessment', '').trim();
      await this.loadPatient(patientName);
    } else if (command === 'show patient list') {
      await this.showPatientList();
    }
  }

  /**
   * PATIENT_LOADED state handler - accepts clinical workflow commands
   */
  async handlePatientLoadedState(command, originalCommand) {
    // Record symptom
    if (command.startsWith('record symptom')) {
      const symptom = command.replace('record symptom', '').replace(':', '').trim();
      await this.recordSymptom(symptom);
    }
    // Show patient info modes
    else if (command === 'show patient history') {
      await this.showHistory();
    } else if (command === 'show medications') {
      await this.showMedications();
    } else if (command === 'show allergies') {
      await this.showAllergies();
    }
    // Prescribe medication - use originalCommand to preserve case
    else if (command.startsWith('prescribe')) {
      await this.startPrescription(originalCommand);
    }
    // Show available medications
    else if (command === 'show available medications') {
      await this.showAvailableMedications();
    }
  }

  /**
   * RECORDING_SYMPTOMS state handler
   */
  async handleRecordingSymptomsState(command) {
    // After recording, return to PATIENT_LOADED state for next command
    this.currentState = 'PATIENT_LOADED';
  }

  /**
   * SHOWING_INFO state handler
   */
  async handleShowingInfoState(command, originalCommand) {
    // After showing info, return to PATIENT_LOADED state
    this.currentState = 'PATIENT_LOADED';

    // Allow chaining commands
    await this.handlePatientLoadedState(command, originalCommand);
  }

  /**
   * Start clinical assessment - transition IDLE → AWAITING_PATIENT
   */
  async startAssessment(patientName) {
    this.currentState = 'AWAITING_PATIENT';
    this.voiceController.playTTS(`Loading patient ${patientName}.`);

    await this.loadPatient(patientName);
  }

  /**
   * Load patient from backend - transition AWAITING_PATIENT → PATIENT_LOADED or retry
   */
  async loadPatient(patientName) {
    try {
      const response = await this.apiClient.post('/api/clinical/patient/load', {
        patient_name: patientName
      });

      if (response.data.patient) {
        // Success - transition to PATIENT_LOADED
        this.currentPatient = response.data.patient;
        this.sessionSymptoms = [];
        this.retryCount = 0; // Reset retry count on success
        this.currentState = 'PATIENT_LOADED';

        // Display patient card
        this.patientCardRenderer.showPatientCard(this.currentPatient);

        // TTS confirmation
        this.voiceController.playTTS(
          `Patient ${this.currentPatient.name} loaded. Age ${this.currentPatient.age}, ${this.currentPatient.sex}.`
        );
      } else {
        // Patient not found - handle retry logic
        await this.handlePatientNotFound();
      }
    } catch (error) {
      await this.handleError(error);
    }
  }

  /**
   * Handle patient not found - retry logic (FR-14a)
   */
  async handlePatientNotFound() {
    this.retryCount++;

    if (this.retryCount < this.MAX_RETRIES) {
      // Allow retry
      this.voiceController.playTTS(
        `Patient not found. Attempt ${this.retryCount} of ${this.MAX_RETRIES}. Please try again or say "cancel".`
      );
      // Stay in AWAITING_PATIENT state
    } else {
      // Max retries reached - offer patient list or cancel
      this.voiceController.playTTS(
        `Patient not found after ${this.MAX_RETRIES} attempts. Say "show patient list" to see available patients, or "cancel" to exit.`
      );
      // Stay in AWAITING_PATIENT state
    }
  }

  /**
   * Show list of available patients
   */
  async showPatientList() {
    try {
      const response = await this.apiClient.post('/api/clinical/patient/list', {});
      const patients = response.data.patients || [];

      if (patients.length > 0) {
        const patientNames = patients.join(', ');
        this.voiceController.playTTS(`Available patients: ${patientNames}`);
      } else {
        this.voiceController.playTTS('No patients found in the system.');
      }
    } catch (error) {
      await this.handleError(error);
    }
  }

  /**
   * Record symptom - transition PATIENT_LOADED → RECORDING_SYMPTOMS
   */
  async recordSymptom(symptom) {
    this.currentState = 'RECORDING_SYMPTOMS';

    try {
      // Send to backend
      const response = await this.apiClient.post('/api/clinical/symptom/record', {
        patient_id: this.currentPatient.id,
        symptom: symptom
      });

      if (response.data.success) {
        this.sessionSymptoms.push(symptom);
        this.voiceController.playTTS(`Recorded symptom: ${symptom}`);

        // Update patient card with new symptom
        this.patientCardRenderer.updateField('symptoms', this.sessionSymptoms);

        // Automatically request AI decision support after recording symptom (FR-18)
        await this.requestDecisionSupport();
      }

      // Return to PATIENT_LOADED state
      this.currentState = 'PATIENT_LOADED';
    } catch (error) {
      await this.handleError(error);
    }
  }

  /**
   * Request AI clinical decision support (FR-18)
   */
  async requestDecisionSupport() {
    try {
      const response = await this.apiClient.post('/api/clinical/decision-support', {
        patient_id: this.currentPatient.id,
        symptoms: this.sessionSymptoms
      });

      if (response.data.suggestions) {
        const suggestions = response.data.suggestions.join(', ');
        const rationale = response.data.rationale || '';

        this.voiceController.playTTS(
          `AI suggests: ${suggestions}. ${rationale}`
        );
      }
    } catch (error) {
      // Don't block workflow on AI failure - just log
      console.error('Decision support failed:', error);
    }
  }

  /**
   * Show patient history - transition PATIENT_LOADED → SHOWING_INFO
   */
  async showHistory() {
    this.currentState = 'SHOWING_INFO';
    this.patientCardRenderer.showHistoryView();
    this.modeManager.notifyActivity();
  }

  /**
   * Show medications - transition PATIENT_LOADED → SHOWING_INFO
   */
  async showMedications() {
    this.currentState = 'SHOWING_INFO';
    this.patientCardRenderer.showMedicationsView();
    this.modeManager.notifyActivity();
  }

  /**
   * Show allergies - transition PATIENT_LOADED → SHOWING_INFO
   */
  async showAllergies() {
    this.currentState = 'SHOWING_INFO';
    this.patientCardRenderer.showAllergiesView();
    this.modeManager.notifyActivity();
  }

  /**
   * Show available medications from database
   */
  async showAvailableMedications() {
    try {
      const response = await this.apiClient.post('/api/clinical/medications/list', {});
      const medications = response.data.medications || [];

      if (medications.length > 0) {
        const medList = medications.join(', ');
        this.voiceController.playTTS(`Available medications: ${medList}`);
      } else {
        this.voiceController.playTTS('No medications available.');
      }
    } catch (error) {
      await this.handleError(error);
    }
  }

  /**
   * Start prescription flow - transition PATIENT_LOADED → PRESCRIBING
   */
  async startPrescription(command) {
    // Parse "prescribe [medication] [dosage]"
    const parts = command.replace('prescribe', '').trim().split(' ');
    const medication = parts[0];
    const dosage = parts.slice(1).join(' ');

    this.currentState = 'PRESCRIBING';

    // Delegate to prescription UI
    this.prescriptionUI.startPrescriptionFlow(medication, dosage, this.currentPatient);
  }

  /**
   * Callback from prescription UI when prescription flow completes
   */
  async onPrescriptionComplete() {
    // Return to PATIENT_LOADED state after prescription
    if (!this.prescriptionUI.isActive()) {
      this.currentState = 'PATIENT_LOADED';
    }
  }

  /**
   * Handle cancel command
   */
  async handleCancel() {
    this.currentState = 'IDLE';
    this.currentPatient = null;
    this.sessionSymptoms = [];
    this.retryCount = 0;
    this.patientCardRenderer.hideCard();
    this.voiceController.playTTS('Assessment cancelled.');
  }

  /**
   * Handle error - transition to ERROR state, then auto-recover to IDLE
   */
  async handleError(error) {
    this.currentState = 'ERROR';
    console.error('Clinical Mode Error:', error);

    this.voiceController.playTTS('An error occurred. Please try again.');

    // Auto-return to IDLE after timeout
    setTimeout(() => {
      if (this.currentState === 'ERROR') {
        this.currentState = 'IDLE';
        this.currentPatient = null;
        this.sessionSymptoms = [];
        this.retryCount = 0;
      }
    }, this.ERROR_TIMEOUT);
  }

  /**
   * Exit clinical mode - called by mode manager
   */
  exit() {
    this.currentState = 'IDLE';
    this.currentPatient = null;
    this.sessionSymptoms = [];
    this.retryCount = 0;
    this.patientCardRenderer.hideCard();
  }
}

module.exports = ClinicalMode;
