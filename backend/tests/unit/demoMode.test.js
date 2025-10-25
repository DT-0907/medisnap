/**
 * Dev 2 Task 2.0: Demo Mode Tests
 * TDD Step 1: Write tests first
 */

const demoMode = require('../../src/middleware/demoMode');

describe('Demo Mode Middleware', () => {
  beforeAll(() => {
    process.env.DEMO_MODE = 'true';
    process.env.DEMO_PATIENT_DATA_PATH = 'config/demo_patient_data.json';
    process.env.DEMO_API_RESPONSES_PATH = 'config/demo_api_responses.json';
    demoMode.loadDemoData();
  });

  test('isDemoMode returns true when DEMO_MODE=true', () => {
    expect(demoMode.isDemoMode()).toBe(true);
  });

  test('getDemoPatient returns Sarah Chen data', () => {
    const patient = demoMode.getDemoPatient('Sarah Chen');
    expect(patient).not.toBeNull();
    expect(patient.name).toBe('Sarah Chen');
    expect(patient.age).toBe(34);
    expect(patient.allergies).toContain('Penicillin');
    expect(patient.medications).toHaveLength(2);
    expect(patient.medications[0].name).toBe('Warfarin');
  });

  test('getDemoPatient handles case insensitivity', () => {
    const patient = demoMode.getDemoPatient('sarah chen');
    expect(patient).not.toBeNull();
    expect(patient.name).toBe('Sarah Chen');
  });

  test('getDemoPatient returns Robert Martinez data', () => {
    const patient = demoMode.getDemoPatient('Robert Martinez');
    expect(patient).not.toBeNull();
    expect(patient.name).toBe('Robert Martinez');
    expect(patient.age).toBe(58);
    expect(patient.medications).toHaveLength(2);
  });

  test('getDemoPatient returns Emily Watson data', () => {
    const patient = demoMode.getDemoPatient('Emily Watson');
    expect(patient).not.toBeNull();
    expect(patient.name).toBe('Emily Watson');
    expect(patient.allergies).toContain('Sulfa drugs');
  });

  test('getDemoPatient returns null for unknown patient', () => {
    const patient = demoMode.getDemoPatient('Unknown Patient');
    expect(patient).toBeNull();
  });

  test('getDemoApiResponse returns Warfarin interaction warning', () => {
    const response = demoMode.getDemoApiResponse('prescription_warfarin_interaction');
    expect(response).not.toBeNull();
    expect(response.blocked).toBe(true);
    expect(response.warnings[0].type).toBe('drug_interaction');
    expect(response.warnings[0].message).toContain('Ibuprofen');
    expect(response.warnings[0].message).toContain('Warfarin');
    expect(response.alternatives.length).toBeGreaterThan(0);
  });

  test('getDemoApiResponse returns prescription success', () => {
    const response = demoMode.getDemoApiResponse('prescription_success');
    expect(response).not.toBeNull();
    expect(response.blocked).toBe(false);
    expect(response.prescription.status).toBe('PENDING');
    expect(response.prescription.medication).toBe('Acetaminophen');
  });

  test('getDemoApiResponse returns allergy check blocked', () => {
    const response = demoMode.getDemoApiResponse('allergy_check_blocked');
    expect(response).not.toBeNull();
    expect(response.blocked).toBe(true);
    expect(response.warnings[0].type).toBe('allergy');
    expect(response.warnings[0].severity).toBe('CRITICAL');
  });

  test('getDemoApiResponse returns patient loaded', () => {
    const response = demoMode.getDemoApiResponse('patient_loaded');
    expect(response).not.toBeNull();
    expect(response.success).toBe(true);
    expect(response.patient_id).toBe('DEMO_001');
  });
});
