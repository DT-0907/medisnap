/**
 * Dev 2 Task 2.2: Patient Card Renderer Tests
 * Test-Driven Development (TDD) - Step 1: Write Tests First
 *
 * Tests cover:
 * - FR-13: Patient card display with priority order
 * - AR-1: Color coding (RED for allergies)
 * - AR-2: Typography (≥18pt, sans-serif)
 * - AR-3: Layout positioning (top 1/3 center)
 * - AR-4: Animations (300ms fade, 10s auto-hide)
 */

const PatientCardRenderer = require('../../lens-studio-mock/patientCardRenderer');
const demoPatientData = require('../../../config/demo_patient_data.json');

describe('Patient Card Renderer', () => {
  let renderer;
  let sarahChen;

  beforeEach(() => {
    renderer = new PatientCardRenderer();
    sarahChen = demoPatientData.sarah_chen;
  });

  describe('Basic Patient Information Display', () => {
    /**
     * Test 1: Display patient name, age, sex (FR-13)
     */
    test('1: Should display patient name, age, and sex', () => {
      renderer.renderPatientCard(sarahChen);

      const state = renderer.getCardState();
      expect(state.visible).toBe(true);
      expect(state.patientName).toBe('Sarah Chen');
      expect(state.patientDetails).toBe('Age 34, Female');
    });

    /**
     * Test 2: Display allergies prominently in RED (FR-13, AR-1)
     */
    test('2: Should display allergies prominently in RED', () => {
      renderer.renderPatientCard(sarahChen);

      const state = renderer.getCardState();
      expect(state.allergies).toBe('Allergies: Penicillin');
      expect(state.allergiesColor).toEqual({ r: 1, g: 0, b: 0, a: 1 }); // RED
    });

    /**
     * Test 3: Display medications list (FR-13)
     */
    test('3: Should display current medications list', () => {
      renderer.renderPatientCard(sarahChen);

      const state = renderer.getCardState();
      expect(state.medications).toContain('Warfarin 5mg daily');
      expect(state.medications).toContain('Loratadine 10mg daily');
    });

    /**
     * Test 4: Display diagnosis history - last 3 visits (FR-13)
     */
    test('4: Should display last 3 diagnosis history entries', () => {
      renderer.renderPatientCard(sarahChen);

      const state = renderer.getCardState();
      expect(state.history).toContain('Seasonal allergies');
      expect(state.history).toContain('Annual checkup - healthy');
      expect(state.history).toContain('Atrial fibrillation');
      // Should show 3 most recent diagnoses (plus header = 4 lines total)
      const historyLines = state.history.split('\n').filter(line => line.trim());
      expect(historyLines.length).toBeLessThanOrEqual(4); // Header + 3 entries
    });

    /**
     * Test 5: Display vital signs (FR-13)
     */
    test('5: Should display current vital signs', () => {
      renderer.renderPatientCard(sarahChen);

      const state = renderer.getCardState();
      expect(state.vitals).toContain('BP: 118/76');
      expect(state.vitals).toContain('HR: 88');
      expect(state.vitals).toContain('O2: 97');
      expect(state.vitals).toContain('Temp: 101.5°F');
    });

    /**
     * Test 6: Display chief complaint (FR-13)
     */
    test('6: Should display chief complaint', () => {
      renderer.renderPatientCard(sarahChen);

      const state = renderer.getCardState();
      expect(state.chiefComplaint).toBe('Chief Complaint: Persistent cough and fever');
    });

    /**
     * Test 7: Display current symptoms (FR-13)
     */
    test('7: Should display current symptoms when added', () => {
      renderer.renderPatientCard(sarahChen);
      renderer.updateCardField('symptoms', 'Coughing with yellow mucus, night sweats');

      const state = renderer.getCardState();
      expect(state.symptoms).toBe('Current Symptoms: Coughing with yellow mucus, night sweats');
    });
  });

  describe('Partial Updates', () => {
    /**
     * Test 8: Update specific field without full re-render (performance)
     */
    test('8: Should update specific field without re-rendering entire card', () => {
      renderer.renderPatientCard(sarahChen);

      const initialRenderCount = renderer._getRenderCount();

      renderer.updateCardField('symptoms', 'Persistent headache');

      const state = renderer.getCardState();
      expect(state.symptoms).toBe('Current Symptoms: Persistent headache');
      // Should not increment full render count
      expect(renderer._getRenderCount()).toBe(initialRenderCount);
    });
  });

  describe('Card Visibility', () => {
    /**
     * Test 9: Hide patient card (FR-13)
     */
    test('9: Should hide patient card on command', () => {
      renderer.renderPatientCard(sarahChen);
      expect(renderer.getCardState().visible).toBe(true);

      renderer.hidePatientCard();

      const state = renderer.getCardState();
      expect(state.visible).toBe(false);
    });
  });

  describe('View Modes', () => {
    /**
     * Test 10: Filter view - history only (FR-13)
     */
    test('10: Should show history-only view mode', () => {
      renderer.renderPatientCard(sarahChen);
      renderer.showPatientHistory();

      const state = renderer.getCardState();
      expect(state.viewMode).toBe('history');
      expect(state.visible).toBe(true);
      expect(state.history).toContain('Seasonal allergies');
      // Other fields should be hidden or empty in history-only mode
    });

    /**
     * Test 11: Filter view - medications only (FR-13)
     */
    test('11: Should show medications-only view mode', () => {
      renderer.renderPatientCard(sarahChen);
      renderer.showMedications();

      const state = renderer.getCardState();
      expect(state.viewMode).toBe('medications');
      expect(state.visible).toBe(true);
      expect(state.medications).toContain('Warfarin');
      expect(state.medications).toContain('Loratadine');
    });

    /**
     * Test 12: Filter view - allergies only enlarged (FR-13, AR-1)
     */
    test('12: Should show allergies-only view mode with enlarged text', () => {
      renderer.renderPatientCard(sarahChen);
      renderer.showAllergies();

      const state = renderer.getCardState();
      expect(state.viewMode).toBe('allergies');
      expect(state.visible).toBe(true);
      expect(state.allergies).toBe('Allergies: Penicillin');
      expect(state.allergiesColor).toEqual({ r: 1, g: 0, b: 0, a: 1 }); // RED
      // Font size should be larger in allergies-only mode
      expect(state.allergiesFontSize).toBeGreaterThan(18);
    });
  });

  describe('Layout and Positioning', () => {
    /**
     * Test 13: Card positioning top center (AR-3)
     */
    test('13: Should position card at top 1/3 center of screen', () => {
      renderer.renderPatientCard(sarahChen);

      const state = renderer.getCardState();
      expect(state.position).toEqual({ x: 0.5, y: 0.9 }); // Top center (anchors)
      expect(state.size).toEqual({ width: 500, height: 400 }); // Expected size
    });
  });

  describe('Auto-hide Timer', () => {
    /**
     * Test 14: Auto-hide after 10 seconds (FR-13, AR-4)
     */
    test('14: Should auto-hide card after 10 seconds', (done) => {
      jest.useFakeTimers();
      renderer.renderPatientCard(sarahChen);

      expect(renderer.getCardState().visible).toBe(true);

      // Fast-forward 9 seconds (should still be visible)
      jest.advanceTimersByTime(9000);
      expect(renderer.getCardState().visible).toBe(true);

      // Fast-forward to 10 seconds (should hide)
      jest.advanceTimersByTime(1000);
      expect(renderer.getCardState().visible).toBe(false);

      jest.useRealTimers();
      done();
    }, 15000);
  });

  describe('Edge Cases', () => {
    /**
     * Test 15 (Bonus): Handle empty allergies gracefully
     */
    test('15: Should handle patient with no allergies', () => {
      const robertMartinez = demoPatientData.robert_martinez; // No allergies

      renderer.renderPatientCard(robertMartinez);

      const state = renderer.getCardState();
      expect(state.allergies).toBe('Allergies: None');
      expect(state.allergiesColor).toEqual({ r: 1, g: 0, b: 0, a: 1 }); // Still RED
    });

    /**
     * Test 16 (Bonus): Handle missing vital signs
     */
    test('16: Should handle missing or incomplete vital signs', () => {
      const patientWithMissingVitals = {
        ...sarahChen,
        current_vitals: { bp: '120/80', hr: 75 } // Missing O2 and temp
      };

      renderer.renderPatientCard(patientWithMissingVitals);

      const state = renderer.getCardState();
      expect(state.vitals).toContain('BP: 120/80');
      expect(state.vitals).toContain('HR: 75');
      // Should gracefully handle missing O2 and temp
      expect(state.vitals).not.toContain('undefined');
      expect(state.vitals).not.toContain('NaN');
    });
  });
});
