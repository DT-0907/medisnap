import patients from '../../../data/patients.json';

describe('Patient Mock Data Validation', () => {
  it('should have at least 3 patients', () => {
    expect(patients.length).toBeGreaterThanOrEqual(3);
  });

  it('should have at most 5 patients (per FR-38)', () => {
    expect(patients.length).toBeLessThanOrEqual(5);
  });

  describe('Sarah Chen patient (CRITICAL for demo)', () => {
    let sarahChen: any;

    beforeAll(() => {
      sarahChen = patients.find(p => p.name === 'Sarah Chen');
    });

    it('should exist in dataset', () => {
      expect(sarahChen).toBeDefined();
    });

    it('should have correct demographics', () => {
      expect(sarahChen.name).toBe('Sarah Chen');
      expect(sarahChen.age).toBe(34);
      expect(sarahChen.sex).toBe('Female');
    });

    it('should have chief complaint', () => {
      expect(sarahChen.chief_complaint).toBe('Persistent cough and fever');
    });

    it('should have current symptoms array', () => {
      expect(sarahChen.current_symptoms).toEqual([
        'fever',
        'cough',
        'fatigue',
        'chest tightness'
      ]);
    });

    it('should have vital signs object', () => {
      expect(sarahChen.vital_signs).toEqual({
        bp: '118/76',
        hr: 88,
        o2: 97,
        temp: 101.5
      });
    });

    it('should have Penicillin allergy', () => {
      expect(sarahChen.allergies).toContain('Penicillin');
    });

    it('CRITICAL: should have Warfarin medication for drug interaction demo', () => {
      const warfarin = sarahChen.medications.find(
        (m: any) => m.name === 'Warfarin'
      );
      
      expect(warfarin).toBeDefined();
      expect(warfarin.dosage).toBe('5mg daily');
      expect(warfarin.started).toBe('2024-03-01');
    });

    it('should have Loratadine as second medication', () => {
      const loratadine = sarahChen.medications.find(
        (m: any) => m.name === 'Loratadine'
      );
      
      expect(loratadine).toBeDefined();
      expect(loratadine.dosage).toBe('10mg daily');
    });

    it('should have diagnosis history with 3 entries', () => {
      expect(sarahChen.diagnosis_history).toHaveLength(3);
      
      // Most recent: Seasonal allergies
      expect(sarahChen.diagnosis_history[0]).toEqual({
        date: '2024-10-01',
        diagnosis: 'Seasonal allergies',
        provider: 'Dr. Smith'
      });
      
      // Second: Annual checkup
      expect(sarahChen.diagnosis_history[1]).toEqual({
        date: '2024-08-15',
        diagnosis: 'Annual checkup - healthy',
        provider: 'Dr. Smith'
      });
      
      // Oldest: Atrial fibrillation (explains Warfarin)
      expect(sarahChen.diagnosis_history[2]).toEqual({
        date: '2024-03-01',
        diagnosis: 'Atrial fibrillation',
        provider: 'Dr. Lee'
      });
    });
  });

  describe('All patients data integrity', () => {
    it('should have required fields for all patients', () => {
      patients.forEach(patient => {
        expect(patient.name).toBeDefined();
        expect(patient.age).toBeGreaterThan(0);
        expect(patient.sex).toMatch(/^(Male|Female|Other)$/);
        expect(patient.allergies).toBeInstanceOf(Array);
        expect(patient.medications).toBeInstanceOf(Array);
        expect(patient.diagnosis_history).toBeInstanceOf(Array);
      });
    });

    it('should have valid medication structure', () => {
      patients.forEach(patient => {
        patient.medications.forEach((med: any) => {
          expect(med.name).toBeDefined();
          expect(med.dosage).toBeDefined();
          expect(med.started).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        });
      });
    });

    it('should have valid diagnosis history structure', () => {
      patients.forEach(patient => {
        patient.diagnosis_history.forEach((dx: any) => {
          expect(dx.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
          expect(dx.diagnosis).toBeDefined();
          expect(dx.provider).toBeDefined();
        });
      });
    });

    it('should have diverse patient profiles', () => {
      const ages = patients.map(p => p.age);
      const uniqueAges = new Set(ages);
      
      // At least 2 different age groups
      expect(uniqueAges.size).toBeGreaterThanOrEqual(2);
      
      // Mix of male and female
      const sexes = patients.map(p => p.sex);
      expect(sexes).toContain('Male');
      expect(sexes).toContain('Female');
    });
  });
});

