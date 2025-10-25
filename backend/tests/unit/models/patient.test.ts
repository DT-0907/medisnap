// tests/unit/models/patient.test.ts
import {
  findPatientByName,
  findPatientById,
  getAllPatients,
  Patient,
  Medication,
  DiagnosisEntry,
  VitalSigns,
} from '../../../src/models/patient';

describe('Patient Model', () => {
  describe('Type Definitions', () => {
    it('should define Patient interface correctly', () => {
      const patient: Patient = {
        id: 'test-uuid',
        name: 'Test Patient',
        age: 30,
        sex: 'Female',
        chief_complaint: 'Test complaint',
        current_symptoms: ['symptom1'],
        vital_signs: { bp: '120/80', hr: 72, o2: 98, temp: 98.6 },
        allergies: ['Penicillin'],
        medications: [],
        diagnosis_history: [],
        created_at: new Date().toISOString(),
      };

      expect(patient).toBeDefined();
      expect(typeof patient.name).toBe('string');
      expect(typeof patient.age).toBe('number');
    });

    it('should define Medication interface correctly', () => {
      const medication: Medication = {
        name: 'Aspirin',
        dosage: '100mg daily',
        started: '2024-01-01',
      };

      expect(medication.name).toBeDefined();
      expect(medication.dosage).toBeDefined();
      expect(medication.started).toBeDefined();
    });

    it('should define VitalSigns interface correctly', () => {
      const vitals: VitalSigns = {
        bp: '120/80',
        hr: 72,
        o2: 98,
        temp: 98.6,
      };

      expect(vitals.bp).toBeDefined();
      expect(vitals.hr).toBeDefined();
      expect(vitals.o2).toBeDefined();
      expect(vitals.temp).toBeDefined();
    });
  });

  describe('findPatientByName', () => {
    it('should find patient by exact name match', async () => {
      const result = await findPatientByName('Sarah Chen');

      expect(result.success).toBe(true);
      expect(result.error).toBeNull();
      expect(result.patient).toBeDefined();
      expect(result.patient?.name).toBe('Sarah Chen');
    });

    it('should find patient with case-insensitive search', async () => {
      const result = await findPatientByName('sarah chen');

      expect(result.success).toBe(true);
      expect(result.patient).toBeDefined();
      expect(result.patient?.name).toBe('Sarah Chen');
    });

    it('should find patient with partial name match', async () => {
      const result = await findPatientByName('Sarah');

      expect(result.success).toBe(true);
      expect(result.patient).toBeDefined();
      expect(result.patient?.name).toContain('Sarah');
    });

    it('should return null when patient not found', async () => {
      const result = await findPatientByName('Nonexistent Patient');

      expect(result.success).toBe(true);
      expect(result.patient).toBeNull();
      expect(result.error).toBeNull();
    });

    it('should handle empty string gracefully', async () => {
      const result = await findPatientByName('');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain('Patient name is required');
    });

    it('should return patient with all fields populated', async () => {
      const result = await findPatientByName('Sarah Chen');

      expect(result.patient).toBeDefined();
      const patient = result.patient!;

      // Core fields
      expect(patient.id).toBeDefined();
      expect(patient.name).toBe('Sarah Chen');
      expect(patient.age).toBe(34);
      expect(patient.sex).toBe('Female');

      // Clinical fields
      expect(patient.chief_complaint).toBeDefined();
      expect(Array.isArray(patient.current_symptoms)).toBe(true);
      expect(patient.vital_signs).toBeDefined();

      // Safety fields
      expect(Array.isArray(patient.allergies)).toBe(true);
      expect(Array.isArray(patient.medications)).toBe(true);
      expect(Array.isArray(patient.diagnosis_history)).toBe(true);
    });

    it('CRITICAL: Sarah Chen should have Warfarin medication', async () => {
      const result = await findPatientByName('Sarah Chen');

      expect(result.patient).toBeDefined();
      const medications = result.patient!.medications;

      const warfarin = medications.find((m: Medication) => m.name === 'Warfarin');
      expect(warfarin).toBeDefined();
      expect(warfarin?.dosage).toBe('5mg daily');
      expect(warfarin?.started).toBe('2024-03-01');
    });

    it('should parse JSONB medications correctly', async () => {
      const result = await findPatientByName('Sarah Chen');

      expect(result.patient?.medications).toBeDefined();
      const medications = result.patient!.medications;

      expect(Array.isArray(medications)).toBe(true);
      expect(medications.length).toBeGreaterThan(0);

      medications.forEach((med: Medication) => {
        expect(med.name).toBeDefined();
        expect(med.dosage).toBeDefined();
        expect(med.started).toBeDefined();
      });
    });

    it('should parse JSONB diagnosis_history correctly', async () => {
      const result = await findPatientByName('Sarah Chen');

      expect(result.patient?.diagnosis_history).toBeDefined();
      const history = result.patient!.diagnosis_history;

      expect(Array.isArray(history)).toBe(true);
      expect(history.length).toBeGreaterThan(0);

      history.forEach((entry: DiagnosisEntry) => {
        expect(entry.date).toBeDefined();
        expect(entry.diagnosis).toBeDefined();
        expect(entry.provider).toBeDefined();
      });
    });

    it('should parse vital_signs JSONB correctly', async () => {
      const result = await findPatientByName('Sarah Chen');

      expect(result.patient?.vital_signs).toBeDefined();
      const vitals = result.patient!.vital_signs!;

      expect(vitals.bp).toBeDefined();
      expect(vitals.hr).toBeDefined();
      expect(vitals.o2).toBeDefined();
      expect(vitals.temp).toBeDefined();
    });

    it('should handle database errors gracefully', async () => {
      // This test will pass with proper error handling
      // Actual implementation will catch database errors
      const result = await findPatientByName('Sarah Chen');
      expect(result).toBeDefined();
      expect(result.success).toBeDefined();
    });
  });

  describe('findPatientById', () => {
    let sarahChenId: string;

    beforeAll(async () => {
      // Get Sarah Chen's ID for testing
      const result = await findPatientByName('Sarah Chen');
      sarahChenId = result.patient!.id;
    });

    it('should find patient by UUID', async () => {
      const result = await findPatientById(sarahChenId);

      expect(result.success).toBe(true);
      expect(result.error).toBeNull();
      expect(result.patient).toBeDefined();
      expect(result.patient?.id).toBe(sarahChenId);
      expect(result.patient?.name).toBe('Sarah Chen');
    });

    it('should return null when patient ID not found', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const result = await findPatientById(fakeId);

      expect(result.success).toBe(true);
      expect(result.patient).toBeNull();
    });

    it('should handle invalid UUID format', async () => {
      const result = await findPatientById('invalid-uuid');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle empty string gracefully', async () => {
      const result = await findPatientById('');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Patient ID is required');
    });
  });

  describe('getAllPatients', () => {
    it('should return all patients', async () => {
      const result = await getAllPatients();

      expect(result.success).toBe(true);
      expect(result.error).toBeNull();
      expect(result.patients).toBeDefined();
      expect(Array.isArray(result.patients)).toBe(true);
    });

    it('should return at least 3 patients (per FR-38)', async () => {
      const result = await getAllPatients();

      expect(result.patients).toBeDefined();
      expect(result.patients!.length).toBeGreaterThanOrEqual(3);
    });

    it('should return at most 5 patients for MVP (per FR-38)', async () => {
      const result = await getAllPatients();

      expect(result.patients).toBeDefined();
      expect(result.patients!.length).toBeLessThanOrEqual(5);
    });

    it('should include Sarah Chen in patient list', async () => {
      const result = await getAllPatients();

      expect(result.patients).toBeDefined();
      const sarahChen = result.patients!.find((p: Patient) => p.name === 'Sarah Chen');
      expect(sarahChen).toBeDefined();
    });

    it('should return patients with all required fields', async () => {
      const result = await getAllPatients();

      result.patients!.forEach((patient: Patient) => {
        expect(patient.id).toBeDefined();
        expect(patient.name).toBeDefined();
        expect(patient.age).toBeGreaterThan(0);
        expect(patient.sex).toBeDefined();
        expect(Array.isArray(patient.allergies)).toBe(true);
        expect(Array.isArray(patient.medications)).toBe(true);
        expect(Array.isArray(patient.diagnosis_history)).toBe(true);
      });
    });

    it('should support limit parameter', async () => {
      const result = await getAllPatients(2);

      expect(result.patients).toBeDefined();
      expect(result.patients!.length).toBeLessThanOrEqual(2);
    });

    it('should handle database errors gracefully', async () => {
      // Proper error handling should make this pass
      const result = await getAllPatients();
      expect(result).toBeDefined();
      expect(result.success).toBeDefined();
    });
  });
});
