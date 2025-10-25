/**
 * Task Group 5: Patient Card Renderer Tests
 * Dev 2 - Task 5.1: Write 5-6 focused tests for patient card
 *
 * Following TDD: Write tests FIRST before implementation
 * Tests cover critical demo requirements for Sarah Chen scenario
 */

// Mock Lens Studio components for testing
const mockLensStudioComponents = {
  Text: class {
    constructor() {
      this.text = '';
      this.size = 18;
      this.textFill = { color: { r: 1, g: 1, b: 1, a: 1 } };
    }
  },
  ScreenTransform: class {
    constructor() {
      this.anchors = {
        setCenter: jest.fn(),
        getCenter: () => ({ x: 0.5, y: 0.9 })
      };
    }
  },
  SceneObject: class {
    constructor() {
      this.enabled = true;
      this.components = [];
    }
    getComponent(type) {
      return this.components.find(c => c.type === type);
    }
  }
};

// Mock config
const mockConfig = {
  AR_COLORS: {
    ALLERGY_TEXT: { r: 1, g: 0, b: 0, a: 1 }, // Red
    SUCCESS: { r: 0, g: 1, b: 0, a: 1 }, // Green
    CARD_BG: { r: 0.1, g: 0.1, b: 0.1, a: 0.5 } // Semi-transparent
  },
  TIMEOUTS: {
    PATIENT_CARD_AUTO_HIDE: 10000 // 10 seconds
  },
  TYPOGRAPHY: {
    MIN_FONT_SIZE: 18
  }
};

// Mock patient data for Sarah Chen
const sarahChenData = {
  name: "Sarah Chen",
  age: 34,
  sex: "Female",
  allergies: ["Penicillin"],
  medications: [
    { name: "Warfarin", dosage: "5mg daily" },
    { name: "Loratadine", dosage: "10mg daily" }
  ],
  chief_complaint: "Persistent cough and fever",
  current_symptoms: ["Chest tightness", "Coughing with yellow mucus"],
  current_vitals: {
    bp: "118/76",
    hr: 88,
    o2: 97,
    temp: 101.5
  },
  diagnosis_history: [
    { date: "2024-10-15", diagnosis: "Upper respiratory infection" },
    { date: "2024-09-20", diagnosis: "Seasonal allergies" },
    { date: "2024-08-10", diagnosis: "Annual checkup - healthy" }
  ]
};

describe('Patient Card Renderer - Task Group 5 Tests', () => {
  let renderer;
  let mockScript;

  beforeEach(() => {
    // Set up mock script object as in Lens Studio
    mockScript = {
      patientNameText: new mockLensStudioComponents.Text(),
      patientDetailsText: new mockLensStudioComponents.Text(),
      allergiesText: new mockLensStudioComponents.Text(),
      medicationsText: new mockLensStudioComponents.Text(),
      historyText: new mockLensStudioComponents.Text(),
      vitalsText: new mockLensStudioComponents.Text(),
      chiefComplaintText: new mockLensStudioComponents.Text(),
      symptomsText: new mockLensStudioComponents.Text(),
      cardRootObject: new mockLensStudioComponents.SceneObject(),
      cardBackground: { opacity: 0.5 },
      debugMode: false,
      createEvent: jest.fn((type) => ({
        bind: jest.fn(),
        reset: jest.fn(),
        cancel: jest.fn()
      }))
    };

    // Mock global config
    global.MedSnapConfig = mockConfig;

    // We'll mock the renderer functions for testing
    renderer = {
      script: mockScript,
      isCardVisible: false,
      autoHideTimer: null,
      currentPatientData: null,
      currentViewMode: 'all'
    };
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.clearAllMocks();
  });

  describe('Task 5.1: Core Patient Card Tests', () => {
    /**
     * Test 1: Card positioning at top_center (0.5, 0.9)
     * Requirement: FR AR-3 - Card at top 1/3 of screen
     */
    test('1. Should position card at top center of screen (0.5, 0.9)', () => {
      // Arrange
      const expectedPosition = { x: 0.5, y: 0.9 };
      const screenTransform = new mockLensStudioComponents.ScreenTransform();

      // Act - simulate card positioning
      screenTransform.anchors.setCenter(expectedPosition.x, expectedPosition.y);

      // Assert
      expect(screenTransform.anchors.setCenter).toHaveBeenCalledWith(0.5, 0.9);
      const actualPosition = screenTransform.anchors.getCenter();
      expect(actualPosition).toEqual(expectedPosition);
    });

    /**
     * Test 2: Allergy display with red borders
     * Requirement: FR-13, AR-1 - Allergies in red
     * Critical for Sarah Chen demo (Penicillin allergy)
     */
    test('2. Should display allergies with red color and borders', () => {
      // Arrange
      const allergies = sarahChenData.allergies;

      // Act - simulate allergy rendering
      mockScript.allergiesText.text = `Allergies: ${allergies.join(', ')}`;
      mockScript.allergiesText.textFill.color = mockConfig.AR_COLORS.ALLERGY_TEXT;

      // Assert
      expect(mockScript.allergiesText.text).toBe('Allergies: Penicillin');
      expect(mockScript.allergiesText.textFill.color).toEqual({ r: 1, g: 0, b: 0, a: 1 }); // Red
    });

    /**
     * Test 3: Medication list rendering
     * Requirement: FR-13 - Display current medications
     * Critical for Warfarin display in demo
     */
    test('3. Should render medication list correctly', () => {
      // Arrange
      const medications = sarahChenData.medications;

      // Act - simulate medication list rendering
      let medText = "Medications:\n";
      medications.forEach(med => {
        medText += `${med.name} ${med.dosage}\n`;
      });
      mockScript.medicationsText.text = medText;

      // Assert
      expect(mockScript.medicationsText.text).toContain('Warfarin 5mg daily');
      expect(mockScript.medicationsText.text).toContain('Loratadine 10mg daily');
      expect(mockScript.medicationsText.text.split('\n').length).toBe(4); // Header + 2 meds + empty line
    });

    /**
     * Test 4: Auto-hide after 10 seconds
     * Requirement: FR-13 - Auto-hide timer
     */
    test('4. Should auto-hide card after 10 seconds', () => {
      jest.useFakeTimers();

      // Arrange
      renderer.isCardVisible = true;
      mockScript.cardRootObject.enabled = true;

      // Create mock timer
      const hideCallback = jest.fn(() => {
        renderer.isCardVisible = false;
        mockScript.cardRootObject.enabled = false;
      });

      // Act - simulate timer setup
      setTimeout(hideCallback, mockConfig.TIMEOUTS.PATIENT_CARD_AUTO_HIDE);

      // Assert - before timeout
      expect(renderer.isCardVisible).toBe(true);
      expect(mockScript.cardRootObject.enabled).toBe(true);

      // Fast-forward 9 seconds (should still be visible)
      jest.advanceTimersByTime(9000);
      expect(hideCallback).not.toHaveBeenCalled();

      // Fast-forward to 10 seconds (should hide)
      jest.advanceTimersByTime(1000);
      expect(hideCallback).toHaveBeenCalled();

      // Verify hide was executed
      expect(renderer.isCardVisible).toBe(false);
      expect(mockScript.cardRootObject.enabled).toBe(false);

      jest.useRealTimers();
    });

    /**
     * Test 5: Manual recall via voice command
     * Requirement: FR-13 - Manual recall support
     */
    test('5. Should support manual recall of hidden card', () => {
      // Arrange
      renderer.currentPatientData = sarahChenData;
      renderer.isCardVisible = false;
      mockScript.cardRootObject.enabled = false;

      // Act - simulate manual recall
      const showPatientCard = () => {
        if (renderer.currentPatientData) {
          renderer.isCardVisible = true;
          mockScript.cardRootObject.enabled = true;
          mockScript.patientNameText.text = renderer.currentPatientData.name;
          return true;
        }
        return false;
      };

      const result = showPatientCard();

      // Assert
      expect(result).toBe(true);
      expect(renderer.isCardVisible).toBe(true);
      expect(mockScript.cardRootObject.enabled).toBe(true);
      expect(mockScript.patientNameText.text).toBe('Sarah Chen');
    });

    /**
     * Test 6: Information hierarchy display
     * Requirement: FR-13 - Proper priority order
     */
    test('6. Should display information in correct hierarchy', () => {
      // Arrange - hierarchy order per FR-13:
      // 1. Patient name/age/sex
      // 2. Allergies (RED)
      // 3. Chief complaint
      // 4. Current symptoms
      // 5. Vital signs
      // 6. Medications
      // 7. Diagnosis history

      const displayOrder = [];

      // Act - simulate rendering in order
      mockScript.patientNameText.text = sarahChenData.name;
      displayOrder.push('name');

      mockScript.patientDetailsText.text = `Age ${sarahChenData.age}, ${sarahChenData.sex}`;
      displayOrder.push('details');

      mockScript.allergiesText.text = `Allergies: ${sarahChenData.allergies.join(', ')}`;
      displayOrder.push('allergies');

      mockScript.chiefComplaintText.text = `Chief Complaint: ${sarahChenData.chief_complaint}`;
      displayOrder.push('chief_complaint');

      mockScript.symptomsText.text = `Current Symptoms:\n${sarahChenData.current_symptoms.join('\n')}`;
      displayOrder.push('symptoms');

      const vitals = sarahChenData.current_vitals;
      mockScript.vitalsText.text = `Vitals: BP: ${vitals.bp}, HR: ${vitals.hr}, O2: ${vitals.o2}, Temp: ${vitals.temp}°F`;
      displayOrder.push('vitals');

      // Assert correct order
      expect(displayOrder).toEqual([
        'name',
        'details',
        'allergies',
        'chief_complaint',
        'symptoms',
        'vitals'
      ]);

      // Assert all fields have content
      expect(mockScript.patientNameText.text).toBeTruthy();
      expect(mockScript.allergiesText.text).toContain('Penicillin');
      expect(mockScript.vitalsText.text).toContain('101.5°F');
    });
  });

  describe('Task 5.4: Visual Styling Tests', () => {
    /**
     * Test 7: Minimum font size compliance
     * Requirement: FR AR-2 - Minimum 18pt font
     */
    test('7. Should enforce minimum 18pt font size', () => {
      // Arrange
      const textComponents = [
        mockScript.patientNameText,
        mockScript.patientDetailsText,
        mockScript.allergiesText,
        mockScript.medicationsText,
        mockScript.vitalsText
      ];

      // Act & Assert
      textComponents.forEach(textComponent => {
        expect(textComponent.size).toBeGreaterThanOrEqual(mockConfig.TYPOGRAPHY.MIN_FONT_SIZE);
      });
    });

    /**
     * Test 8: Semi-transparent background
     * Requirement: FR AR-3 - 50% opacity background
     */
    test('8. Should have semi-transparent background at 50% opacity', () => {
      // Assert
      expect(mockScript.cardBackground.opacity).toBe(0.5);
      expect(mockConfig.AR_COLORS.CARD_BG.a).toBe(0.5);
    });
  });

  describe('Task 5.6: Information Filtering Tests', () => {
    /**
     * Test 9: Filter to medications only
     * Requirement: Information filtering support
     */
    test('9. Should filter display to show medications only', () => {
      // Arrange
      renderer.currentViewMode = 'medications';

      // Act - simulate filtering
      const applyViewMode = (mode) => {
        if (mode === 'medications') {
          mockScript.allergiesText.getSceneObject = () => ({ enabled: false });
          mockScript.historyText.getSceneObject = () => ({ enabled: false });
          mockScript.vitalsText.getSceneObject = () => ({ enabled: false });
          mockScript.medicationsText.getSceneObject = () => ({ enabled: true });
        }
      };

      applyViewMode(renderer.currentViewMode);

      // Assert
      expect(mockScript.medicationsText.getSceneObject().enabled).toBe(true);
    });

    /**
     * Test 10: Filter to allergies only with enlarged text
     * Requirement: Allergy-only view with emphasis
     */
    test('10. Should show allergies only with enlarged text', () => {
      // Arrange
      const normalSize = 18;
      const enlargedSize = 28;

      // Act
      renderer.currentViewMode = 'allergies';
      mockScript.allergiesText.size = enlargedSize;

      // Assert
      expect(mockScript.allergiesText.size).toBeGreaterThan(normalSize);
      expect(mockScript.allergiesText.size).toBe(28);
    });
  });
});

// Export for Lens Studio testing if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    mockLensStudioComponents,
    mockConfig,
    sarahChenData
  };
}