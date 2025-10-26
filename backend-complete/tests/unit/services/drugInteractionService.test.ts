// tests/unit/services/drugInteractionService.test.ts
import {
  getMedication,
  checkInteraction,
  checkAllergies,
  getAlternatives,
  DrugInteractionServiceError,
} from '../../../src/services/drugInteractionService';

describe('Drug Interaction Service', () => {
  describe('Medication Database', () => {
    it('should contain all 8 medications from FR-22', () => {
      const medications = [
        'Amoxicillin',
        'Azithromycin',
        'Acetaminophen',
        'Ibuprofen',
        'Lisinopril',
        'Metformin',
        'Omeprazole',
        'Warfarin',
      ];

      medications.forEach(med => {
        const medication = getMedication(med);
        expect(medication).toBeDefined();
        expect(medication?.name).toBe(med);
      });
    });

    it('should have medication properties: name, class, common_dosage', () => {
      const ibuprofen = getMedication('Ibuprofen');

      expect(ibuprofen).toHaveProperty('name');
      expect(ibuprofen).toHaveProperty('class');
      expect(ibuprofen).toHaveProperty('common_dosage');
    });

    it('should return null for unknown medication', () => {
      const result = getMedication('UnknownDrug123');

      expect(result).toBeNull();
    });

    it('should perform case-insensitive medication lookup', () => {
      const lower = getMedication('ibuprofen');
      const upper = getMedication('IBUPROFEN');
      const mixed = getMedication('IbUpRoFeN');

      expect(lower).toBeDefined();
      expect(upper).toBeDefined();
      expect(mixed).toBeDefined();
      expect(lower?.name).toBe('Ibuprofen');
    });

    it('should have exactly 8 medications in database', () => {
      const amoxicillin = getMedication('Amoxicillin');
      const azithromycin = getMedication('Azithromycin');
      const acetaminophen = getMedication('Acetaminophen');
      const ibuprofen = getMedication('Ibuprofen');
      const lisinopril = getMedication('Lisinopril');
      const metformin = getMedication('Metformin');
      const omeprazole = getMedication('Omeprazole');
      const warfarin = getMedication('Warfarin');

      expect(amoxicillin).toBeDefined();
      expect(azithromycin).toBeDefined();
      expect(acetaminophen).toBeDefined();
      expect(ibuprofen).toBeDefined();
      expect(lisinopril).toBeDefined();
      expect(metformin).toBeDefined();
      expect(omeprazole).toBeDefined();
      expect(warfarin).toBeDefined();
    });
  });

  describe('Drug Interaction Checking', () => {
    it('should detect HIGH severity interaction: Warfarin + Ibuprofen', () => {
      const currentMedications = [
        { name: 'Warfarin', dosage: '5mg daily', started: '2024-03-01' },
      ];

      const result = checkInteraction('Ibuprofen', currentMedications);

      expect(result.hasInteraction).toBe(true);
      expect(result.severity).toBe('HIGH');
      expect(result.message).toContain('bleeding risk');
      expect(result.interactsWith).toBe('Warfarin');
    });

    it('should detect HIGH severity interaction: Warfarin + any NSAID', () => {
      const currentMedications = [
        { name: 'Warfarin', dosage: '5mg daily', started: '2024-03-01' },
      ];

      // Ibuprofen is classified as NSAID
      const result = checkInteraction('Ibuprofen', currentMedications);

      expect(result.hasInteraction).toBe(true);
      expect(result.severity).toBe('HIGH');
    });

    it('should return no interaction: Warfarin + Acetaminophen', () => {
      const currentMedications = [
        { name: 'Warfarin', dosage: '5mg daily', started: '2024-03-01' },
      ];

      const result = checkInteraction('Acetaminophen', currentMedications);

      expect(result.hasInteraction).toBe(false);
      expect(result.severity).toBeNull();
    });

    it('should return no interaction: Lisinopril + Acetaminophen', () => {
      const currentMedications = [
        { name: 'Lisinopril', dosage: '10mg daily', started: '2023-06-10' },
      ];

      const result = checkInteraction('Acetaminophen', currentMedications);

      expect(result.hasInteraction).toBe(false);
    });

    it('should return no interaction: Metformin + Amoxicillin', () => {
      const currentMedications = [
        { name: 'Metformin', dosage: '500mg twice daily', started: '2023-06-10' },
      ];

      const result = checkInteraction('Amoxicillin', currentMedications);

      expect(result.hasInteraction).toBe(false);
    });

    it('should handle empty current medications list', () => {
      const result = checkInteraction('Ibuprofen', []);

      expect(result.hasInteraction).toBe(false);
    });

    it('should handle case-insensitive medication names', () => {
      const currentMedications = [
        { name: 'warfarin', dosage: '5mg daily', started: '2024-03-01' },
      ];

      const result = checkInteraction('ibuprofen', currentMedications);

      expect(result.hasInteraction).toBe(true);
      expect(result.severity).toBe('HIGH');
    });

    it('should check all current medications for interactions', () => {
      const currentMedications = [
        { name: 'Lisinopril', dosage: '10mg daily', started: '2023-06-10' },
        { name: 'Metformin', dosage: '500mg twice daily', started: '2023-06-10' },
        { name: 'Warfarin', dosage: '5mg daily', started: '2024-03-01' },
      ];

      const result = checkInteraction('Ibuprofen', currentMedications);

      expect(result.hasInteraction).toBe(true);
      expect(result.interactsWith).toBe('Warfarin');
    });
  });

  describe('Allergy Checking', () => {
    it('should detect allergy match: Penicillin allergy vs Amoxicillin', () => {
      const patientAllergies = ['Penicillin'];

      const result = checkAllergies('Amoxicillin', patientAllergies);

      expect(result.hasAllergy).toBe(true);
      expect(result.allergen).toBe('Penicillin');
      expect(result.message).toContain('allergic');
    });

    it('should return no allergy when patient has no allergies', () => {
      const result = checkAllergies('Ibuprofen', []);

      expect(result.hasAllergy).toBe(false);
    });

    it('should return no allergy: Sulfa drugs allergy vs Ibuprofen', () => {
      const patientAllergies = ['Sulfa drugs'];

      const result = checkAllergies('Ibuprofen', patientAllergies);

      expect(result.hasAllergy).toBe(false);
    });

    it('should perform case-insensitive allergy checking', () => {
      const patientAllergies = ['penicillin'];

      const result = checkAllergies('Amoxicillin', patientAllergies);

      expect(result.hasAllergy).toBe(true);
    });

    it('should check medication class allergies', () => {
      // Amoxicillin is in Penicillin class
      const patientAllergies = ['Penicillin'];

      const result = checkAllergies('Amoxicillin', patientAllergies);

      expect(result.hasAllergy).toBe(true);
    });
  });

  describe('Alternative Medication Suggestions', () => {
    it('should suggest Acetaminophen when Warfarin + NSAID interaction detected', () => {
      const alternatives = getAlternatives('Ibuprofen', 'Warfarin');

      expect(alternatives).toHaveLength(1);
      expect(alternatives[0].medication).toBe('Acetaminophen');
      expect(alternatives[0].dosage).toContain('500mg');
      expect(alternatives[0].rationale).toContain('no anticoagulant interaction');
    });

    it('should return empty array when no interactions detected', () => {
      const alternatives = getAlternatives('Acetaminophen', 'Lisinopril');

      expect(alternatives).toHaveLength(0);
    });

    it('should suggest Azithromycin when Penicillin allergy detected', () => {
      const alternatives = getAlternatives('Amoxicillin', null, 'Penicillin');

      expect(alternatives.length).toBeGreaterThan(0);
      const suggestion = alternatives.find((alt: any) => alt.medication === 'Azithromycin');
      expect(suggestion).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should throw error when medication not in database', () => {
      expect(() => {
        checkInteraction('UnknownDrug', []);
      }).toThrow(DrugInteractionServiceError);
    });

    it('should handle null or undefined inputs gracefully', () => {
      expect(() => {
        checkInteraction(null as any, []);
      }).toThrow(DrugInteractionServiceError);

      expect(() => {
        checkInteraction('Ibuprofen', null as any);
      }).toThrow(DrugInteractionServiceError);
    });
  });

  describe('Demo Mode', () => {
    it('should return predictable results in demo mode', () => {
      process.env.DEMO_MODE = 'true';

      const currentMedications = [
        { name: 'Warfarin', dosage: '5mg daily', started: '2024-03-01' },
      ];

      const result = checkInteraction('Ibuprofen', currentMedications);

      expect(result.hasInteraction).toBe(true);
      expect(result.severity).toBe('HIGH');

      delete process.env.DEMO_MODE;
    });
  });
});
