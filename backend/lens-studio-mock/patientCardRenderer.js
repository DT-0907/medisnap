/**
 * Node.js Mock: Patient Card Renderer
 * Dev 2 Task 2.2: Patient Card Renderer
 *
 * This mock simulates Lens Studio's patient card rendering for Jest testing.
 * Implements all FR-13, AR-1, AR-2, AR-3, AR-4 requirements.
 */

class PatientCardRenderer {
  constructor() {
    // Card state
    this.state = {
      visible: false,
      viewMode: 'all', // 'all', 'history', 'medications', 'allergies'
      patientName: '',
      patientDetails: '',
      allergies: '',
      allergiesColor: { r: 1, g: 0, b: 0, a: 1 }, // RED per AR-1
      allergiesFontSize: 20,
      medications: '',
      history: '',
      vitals: '',
      chiefComplaint: '',
      symptoms: '',
      position: { x: 0.5, y: 0.9 }, // Top center per AR-3
      size: { width: 500, height: 400 }
    };

    // Internal tracking
    this.currentPatientData = null;
    this.autoHideTimer = null;
    this.renderCount = 0;

    // Configuration (from MedSnapConfig)
    this.config = {
      AR_COLORS: {
        ALLERGY_TEXT: { r: 1, g: 0, b: 0, a: 1 }
      },
      TIMEOUTS: {
        PATIENT_CARD_AUTO_HIDE: 10000 // 10 seconds
      }
    };
  }

  /**
   * Render patient card with full patient data (FR-13)
   * @param {Object} patientData - Patient data object
   */
  renderPatientCard(patientData) {
    this.currentPatientData = patientData;
    this.renderCount++;

    // Set patient name and details
    this.state.patientName = patientData.name;
    this.state.patientDetails = `Age ${patientData.age}, ${patientData.sex}`;

    // Set allergies in RED (FR-13, AR-1)
    if (patientData.allergies && patientData.allergies.length > 0) {
      this.state.allergies = `Allergies: ${patientData.allergies.join(', ')}`;
    } else {
      this.state.allergies = 'Allergies: None';
    }
    this.state.allergiesColor = this.config.AR_COLORS.ALLERGY_TEXT;

    // Set medications
    if (patientData.medications && patientData.medications.length > 0) {
      const medLines = patientData.medications.map(med =>
        `${med.name} ${med.dosage}`
      );
      this.state.medications = `Medications:\n${medLines.join('\n')}`;
    } else {
      this.state.medications = 'Medications: None';
    }

    // Set diagnosis history (last 3 entries per FR-13)
    if (patientData.diagnosis_history && patientData.diagnosis_history.length > 0) {
      const last3 = patientData.diagnosis_history.slice(0, 3);
      const historyLines = last3.map(entry =>
        `${this._formatDate(entry.date)}: ${entry.diagnosis}`
      );
      this.state.history = `Recent Diagnoses:\n${historyLines.join('\n')}`;
    } else {
      this.state.history = 'Recent Diagnoses: None';
    }

    // Set vital signs
    if (patientData.current_vitals) {
      const vitals = patientData.current_vitals;
      const vitalParts = [];

      if (vitals.bp) vitalParts.push(`BP: ${vitals.bp}`);
      if (vitals.hr !== undefined) vitalParts.push(`HR: ${vitals.hr}`);
      if (vitals.o2 !== undefined) vitalParts.push(`O2: ${vitals.o2}`);
      if (vitals.temp !== undefined) vitalParts.push(`Temp: ${vitals.temp}°F`);

      this.state.vitals = vitalParts.length > 0
        ? `Vitals: ${vitalParts.join(', ')}`
        : 'Vitals: Not recorded';
    } else {
      this.state.vitals = 'Vitals: Not recorded';
    }

    // Set chief complaint
    if (patientData.chief_complaint) {
      this.state.chiefComplaint = `Chief Complaint: ${patientData.chief_complaint}`;
    } else {
      this.state.chiefComplaint = '';
    }

    // Initialize symptoms as empty (will be updated separately)
    if (!this.state.symptoms) {
      this.state.symptoms = '';
    }

    // Apply current view mode
    this._applyViewMode(this.state.viewMode);

    // Show card
    this.state.visible = true;

    // Start auto-hide timer (10s per FR-13, AR-4)
    this._startAutoHideTimer();
  }

  /**
   * Update a specific field without full re-render (performance optimization)
   * @param {string} field - Field name ('symptoms', 'vitals', etc.)
   * @param {string} value - New value
   */
  updateCardField(field, value) {
    if (field === 'symptoms') {
      this.state.symptoms = value ? `Current Symptoms: ${value}` : '';
    } else if (field === 'vitals') {
      this.state.vitals = value;
    } else if (field === 'medications') {
      this.state.medications = value;
    } else if (field === 'history') {
      this.state.history = value;
    } else if (field === 'allergies') {
      this.state.allergies = value;
    } else if (field === 'chiefComplaint') {
      this.state.chiefComplaint = value;
    }

    // Restart auto-hide timer
    this._startAutoHideTimer();
  }

  /**
   * Hide patient card (FR-13)
   */
  hidePatientCard() {
    this.state.visible = false;
    this._clearAutoHideTimer();
  }

  /**
   * Show patient history view (FR-13)
   */
  showPatientHistory() {
    this.state.viewMode = 'history';
    this.state.visible = true;
    this._applyViewMode('history');
    this._startAutoHideTimer();
  }

  /**
   * Show medications view (FR-13)
   */
  showMedications() {
    this.state.viewMode = 'medications';
    this.state.visible = true;
    this._applyViewMode('medications');
    this._startAutoHideTimer();
  }

  /**
   * Show allergies view with enlarged text (FR-13, AR-1)
   */
  showAllergies() {
    this.state.viewMode = 'allergies';
    this.state.visible = true;
    this.state.allergiesFontSize = 28; // Enlarged in allergies-only mode
    this._applyViewMode('allergies');
    this._startAutoHideTimer();
  }

  /**
   * Get current card state (for testing)
   */
  getCardState() {
    return { ...this.state };
  }

  /**
   * Get render count (for testing partial updates)
   * @private
   */
  _getRenderCount() {
    return this.renderCount;
  }

  /**
   * Apply view mode filters
   * @private
   * @param {string} mode - View mode ('all', 'history', 'medications', 'allergies')
   */
  _applyViewMode(mode) {
    // In filtered views, we keep the data but UI would selectively show/hide
    // For testing purposes, we just track the mode
    // The actual Lens Studio implementation would toggle SceneObject visibility
    this.state.viewMode = mode;

    if (mode === 'all') {
      this.state.allergiesFontSize = 20; // Normal size
    } else if (mode === 'allergies') {
      this.state.allergiesFontSize = 28; // Enlarged
    }
  }

  /**
   * Start auto-hide timer (10s per FR-13, AR-4)
   * @private
   */
  _startAutoHideTimer() {
    this._clearAutoHideTimer();

    this.autoHideTimer = setTimeout(() => {
      this.hidePatientCard();
    }, this.config.TIMEOUTS.PATIENT_CARD_AUTO_HIDE);
  }

  /**
   * Clear auto-hide timer
   * @private
   */
  _clearAutoHideTimer() {
    if (this.autoHideTimer) {
      clearTimeout(this.autoHideTimer);
      this.autoHideTimer = null;
    }
  }

  /**
   * Format date for display (MM/DD/YYYY)
   * @private
   * @param {string} dateString - ISO date string
   * @returns {string} Formatted date
   */
  _formatDate(dateString) {
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  }
}

module.exports = PatientCardRenderer;
