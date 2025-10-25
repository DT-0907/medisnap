import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

describe('Database Seed Verification', () => {
  it('should have exactly 5 patients seeded', async () => {
    const { data, error } = await supabase
      .from('patients')
      .select('id');
    
    expect(error).toBeNull();
    expect(data).toHaveLength(5);
  });

  describe('Sarah Chen verification (CRITICAL)', () => {
    let sarahChen: any;

    beforeAll(async () => {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .ilike('name', 'Sarah Chen')
        .single();
      
      expect(error).toBeNull();
      sarahChen = data;
    });

    it('should exist in database', () => {
      expect(sarahChen).toBeDefined();
      expect(sarahChen.name).toBe('Sarah Chen');
    });

    it('CRITICAL: should have Warfarin medication', () => {
      const medications = sarahChen.medications;
      const warfarin = medications.find((m: any) => m.name === 'Warfarin');
      
      expect(warfarin).toBeDefined();
      expect(warfarin.dosage).toBe('5mg daily');
    });

    it('should have correct vital signs structure', () => {
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

    it('should have 3 diagnosis history entries', () => {
      expect(sarahChen.diagnosis_history).toHaveLength(3);
    });
  });

  it('should have diverse patient ages', async () => {
    const { data } = await supabase
      .from('patients')
      .select('age');
    
    const ages = data!.map(p => p.age);
    const uniqueAges = new Set(ages);
    
    expect(uniqueAges.size).toBeGreaterThanOrEqual(4);
  });

  it('should have both male and female patients', async () => {
    const { data } = await supabase
      .from('patients')
      .select('sex');
    
    const sexes = data!.map(p => p.sex);
    
    expect(sexes).toContain('Male');
    expect(sexes).toContain('Female');
  });
});

