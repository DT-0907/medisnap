// tests/unit/models/prescription.test.ts
import {
  createPrescription,
  findPrescriptionsByPatient,
  updatePrescriptionStatus,
  Prescription,
  PrescriptionInput,
  PrescriptionWarning,
} from '../../../src/models/prescription';
import { findPatientByName } from '../../../src/models/patient';

describe('Prescription Model', () => {
  let testPatientId: string;

  beforeAll(async () => {
    // Get Sarah Chen's ID for testing
    const result = await findPatientByName('Sarah Chen');
    testPatientId = result.patient!.id;
  });

  describe('Type Definitions', () => {
    it('should define Prescription interface correctly', () => {
      const prescription: Prescription = {
        id: 'test-uuid',
        patient_id: 'patient-uuid',
        medication: 'Aspirin',
        dosage: '100mg daily',
        status: 'pending_physician_approval',
        created_at: new Date().toISOString(),
        blocked: false,
        warnings: [],
      };

      expect(prescription).toBeDefined();
      expect(prescription.status).toBe('pending_physician_approval');
    });

    it('should define PrescriptionInput interface correctly', () => {
      const input: PrescriptionInput = {
        patient_id: 'patient-uuid',
        medication: 'Aspirin',
        dosage: '100mg daily',
        blocked: false,
        warnings: [],
      };

      expect(input.patient_id).toBeDefined();
      expect(input.medication).toBeDefined();
      expect(input.dosage).toBeDefined();
    });

    it('should define PrescriptionWarning interface correctly', () => {
      const warning: PrescriptionWarning = {
        type: 'drug_interaction',
        severity: 'HIGH',
        message: 'Test warning',
        explanation: 'Test explanation',
      };

      expect(warning.type).toBeDefined();
      expect(warning.severity).toBeDefined();
    });
  });

  describe('createPrescription', () => {
    it('should create a prescription successfully', async () => {
      const input: PrescriptionInput = {
        patient_id: testPatientId,
        medication: 'Acetaminophen',
        dosage: '500mg every 6 hours',
        blocked: false,
        warnings: [],
      };

      const result = await createPrescription(input);

      expect(result.success).toBe(true);
      expect(result.error).toBeNull();
      expect(result.prescription).toBeDefined();
      expect(result.prescription?.id).toBeDefined();
      expect(result.prescription?.medication).toBe('Acetaminophen');
    });

    it('should set default status to pending_physician_approval (FR-26)', async () => {
      const input: PrescriptionInput = {
        patient_id: testPatientId,
        medication: 'Aspirin',
        dosage: '100mg daily',
        blocked: false,
        warnings: [],
      };

      const result = await createPrescription(input);

      expect(result.prescription?.status).toBe('pending_physician_approval');
    });

    it('should create prescription even when blocked (for audit - FR-23)', async () => {
      const input: PrescriptionInput = {
        patient_id: testPatientId,
        medication: 'Ibuprofen',
        dosage: '400mg',
        blocked: true,
        warnings: [
          {
            type: 'drug_interaction',
            severity: 'HIGH',
            message: 'Interaction with Warfarin',
            explanation: 'Increased bleeding risk',
          },
        ],
      };

      const result = await createPrescription(input);

      expect(result.success).toBe(true);
      expect(result.prescription).toBeDefined();
      expect(result.prescription?.blocked).toBe(true);
      expect(result.prescription?.warnings).toHaveLength(1);
    });

    it('should store warnings as JSONB array', async () => {
      const warnings: PrescriptionWarning[] = [
        {
          type: 'drug_interaction',
          severity: 'HIGH',
          message: 'Warning 1',
          explanation: 'Explanation 1',
        },
        {
          type: 'allergy',
          severity: 'HIGH',
          message: 'Warning 2',
          explanation: 'Explanation 2',
        },
      ];

      const input: PrescriptionInput = {
        patient_id: testPatientId,
        medication: 'Test Med',
        dosage: '100mg',
        blocked: true,
        warnings,
      };

      const result = await createPrescription(input);

      expect(result.prescription?.warnings).toHaveLength(2);
      expect(result.prescription?.warnings[0].type).toBe('drug_interaction');
      expect(result.prescription?.warnings[1].type).toBe('allergy');
    });

    it('should handle missing patient_id', async () => {
      const input: PrescriptionInput = {
        patient_id: '',
        medication: 'Aspirin',
        dosage: '100mg',
        blocked: false,
        warnings: [],
      };

      const result = await createPrescription(input);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Patient ID is required');
    });

    it('should handle missing medication', async () => {
      const input: PrescriptionInput = {
        patient_id: testPatientId,
        medication: '',
        dosage: '100mg',
        blocked: false,
        warnings: [],
      };

      const result = await createPrescription(input);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Medication is required');
    });

    it('should handle missing dosage', async () => {
      const input: PrescriptionInput = {
        patient_id: testPatientId,
        medication: 'Aspirin',
        dosage: '',
        blocked: false,
        warnings: [],
      };

      const result = await createPrescription(input);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Dosage is required');
    });

    it('should handle database errors gracefully', async () => {
      const input: PrescriptionInput = {
        patient_id: '00000000-0000-0000-0000-000000000000', // Non-existent patient
        medication: 'Aspirin',
        dosage: '100mg',
        blocked: false,
        warnings: [],
      };

      const result = await createPrescription(input);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('findPrescriptionsByPatient', () => {
    beforeAll(async () => {
      // Create a test prescription
      const input: PrescriptionInput = {
        patient_id: testPatientId,
        medication: 'Test Medication',
        dosage: '100mg',
        blocked: false,
        warnings: [],
      };
      await createPrescription(input);
    });

    it('should find all prescriptions for a patient', async () => {
      const result = await findPrescriptionsByPatient(testPatientId);

      expect(result.success).toBe(true);
      expect(result.error).toBeNull();
      expect(result.prescriptions).toBeDefined();
      expect(Array.isArray(result.prescriptions)).toBe(true);
      expect(result.prescriptions!.length).toBeGreaterThan(0);
    });

    it('should return prescriptions with all fields', async () => {
      const result = await findPrescriptionsByPatient(testPatientId);

      const prescription = result.prescriptions![0];
      expect(prescription.id).toBeDefined();
      expect(prescription.patient_id).toBe(testPatientId);
      expect(prescription.medication).toBeDefined();
      expect(prescription.dosage).toBeDefined();
      expect(prescription.status).toBeDefined();
      expect(prescription.created_at).toBeDefined();
      expect(typeof prescription.blocked).toBe('boolean');
      expect(Array.isArray(prescription.warnings)).toBe(true);
    });

    it('should return empty array for patient with no prescriptions', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const result = await findPrescriptionsByPatient(fakeId);

      expect(result.success).toBe(true);
      expect(result.prescriptions).toEqual([]);
    });

    it('should handle empty patient_id', async () => {
      const result = await findPrescriptionsByPatient('');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Patient ID is required');
    });

    it('should support limit parameter', async () => {
      const result = await findPrescriptionsByPatient(testPatientId, 1);

      expect(result.prescriptions).toBeDefined();
      expect(result.prescriptions!.length).toBeLessThanOrEqual(1);
    });
  });

  describe('updatePrescriptionStatus', () => {
    let testPrescriptionId: string;

    beforeAll(async () => {
      // Create a test prescription
      const input: PrescriptionInput = {
        patient_id: testPatientId,
        medication: 'Status Test Med',
        dosage: '100mg',
        blocked: false,
        warnings: [],
      };
      const result = await createPrescription(input);
      testPrescriptionId = result.prescription!.id;
    });

    it('should update prescription status', async () => {
      const result = await updatePrescriptionStatus(
        testPrescriptionId,
        'approved'
      );

      expect(result.success).toBe(true);
      expect(result.error).toBeNull();
      expect(result.prescription).toBeDefined();
      expect(result.prescription?.status).toBe('approved');
    });

    it('should handle invalid prescription ID', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const result = await updatePrescriptionStatus(fakeId, 'approved');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle empty prescription ID', async () => {
      const result = await updatePrescriptionStatus('', 'approved');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Prescription ID is required');
    });

    it('should handle empty status', async () => {
      const result = await updatePrescriptionStatus(testPrescriptionId, '');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Status is required');
    });
  });
});
