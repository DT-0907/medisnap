/**
 * Prescription UI Component (Node.js Mock Implementation)
 * Task 2.4 - Dev 2
 *
 * Handles prescription workflow UI including:
 * - Medication/dosage parsing from voice commands
 * - API integration for prescription creation with safety checks
 * - Success/warning/blocked prescription displays
 * - Alternative medication suggestions
 * - TTS audio playback
 * - Unknown medication handling
 * - Available medications list
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

class PrescriptionUI {
  constructor(apiClient, voiceController, arDisplay) {
    this.apiClient = apiClient;
    this.voiceController = voiceController;
    this.arDisplay = arDisplay;

    this.active = false;
  }

  /**
   * Parse prescription command to extract medication and dosage
   * Examples:
   *  - "prescribe Ibuprofen 400mg" → { medication: 'Ibuprofen', dosage: '400mg' }
   *  - "prescribe Amoxicillin 500mg twice daily" → { medication: 'Amoxicillin', dosage: '500mg twice daily' }
   */
  parseCommand(command) {
    // Remove "prescribe" prefix
    const cleaned = command.replace(/^prescribe\s+/i, '').trim();

    if (!cleaned) {
      return { medication: null, dosage: null };
    }

    // Split by first space - medication is first word, rest is dosage
    const parts = cleaned.split(/\s+/);
    const medication = parts[0];
    const dosage = parts.slice(1).join(' ');

    if (!medication || !dosage) {
      return { medication: null, dosage: null };
    }

    return { medication, dosage };
  }

  /**
   * Check if prescription UI is currently active
   */
  isActive() {
    return this.active;
  }

  /**
   * Start prescription flow - main entry point
   * Called by clinicalMode when user says "prescribe [medication] [dosage]"
   */
  async startPrescriptionFlow(medication, dosage, patient) {
    this.active = true;

    try {
      // Call prescription API
      const response = await this.apiClient.post('/api/clinical/prescription/create', {
        patient_id: patient.id,
        medication: medication,
        dosage: dosage
      });

      const data = response.data;

      // Handle different response scenarios
      if (data.error === 'medication_not_found') {
        // FR-22a: Unknown medication
        await this.handleUnknownMedication(data.message);
      } else if (data.blocked) {
        // FR-24: Prescription blocked due to safety issue
        await this.handleBlockedPrescription(data);
      } else if (data.success) {
        // FR-26: Prescription success
        await this.handleSuccessfulPrescription(data);
      } else {
        // Generic error
        this.voiceController.playTTS('Unable to create prescription. Please try again.');
      }
    } catch (error) {
      console.error('Prescription UI Error:', error);
      this.voiceController.playTTS('An error occurred. Please try again.');
    } finally {
      this.active = false;
    }
  }

  /**
   * Handle successful prescription (FR-26, FR-26a)
   */
  async handleSuccessfulPrescription(data) {
    // Display green checkmark
    this.arDisplay.showSuccessIcon();

    // Display PENDING badge (FR-26a)
    this.arDisplay.showPendingBadge('PENDING');

    // Play TTS confirmation
    const message = data.message || 'Prescription created successfully.';
    this.voiceController.playTTS(message);
  }

  /**
   * Handle blocked prescription (FR-24)
   */
  async handleBlockedPrescription(data) {
    // Display red X icon
    this.arDisplay.showWarningIcon();

    // Play warning message
    const message = data.message || 'Prescription blocked due to safety concern.';
    this.voiceController.playTTS(message);

    // Show alternatives if provided (FR-25)
    if (data.alternatives && data.alternatives.length > 0) {
      await this.handleAlternatives(data.alternatives, data.message);
    }
  }

  /**
   * Handle alternative medication suggestions (FR-25)
   */
  async handleAlternatives(alternatives, message) {
    // Display alternatives in AR
    this.arDisplay.showAlternatives(alternatives);

    // Speak alternatives
    if (message && message.includes(alternatives[0].medication)) {
      // Message already mentions alternative
      this.voiceController.playTTS(message);
    } else {
      const altNames = alternatives.map(alt => alt.medication).join(', ');
      this.voiceController.playTTS(`Consider ${altNames} as safer alternatives.`);
    }
  }

  /**
   * Handle unknown medication (FR-22a)
   */
  async handleUnknownMedication(message) {
    const defaultMessage = 'Medication not found. Say "Show available medications" to see the list.';
    this.voiceController.playTTS(message || defaultMessage);
  }

  /**
   * Show available medications list (FR-22)
   * Called when user says "show available medications"
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
      console.error('Failed to fetch medications:', error);
      this.voiceController.playTTS('Unable to retrieve medication list.');
    }
  }
}

module.exports = PrescriptionUI;
