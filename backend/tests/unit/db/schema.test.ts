import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

describe('Database Schema Validation', () => {
  describe('patients table', () => {
    it('should exist with correct structure', async () => {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .limit(0);
      
      expect(error).toBeNull();
      expect(data).toBeDefined();
    });

    it('should have UUID primary key with default generator', async () => {
      // Query information_schema to verify column definition
      const { data, error } = await supabase.rpc('get_column_info', {
        table_name: 'patients',
        column_name: 'id'
      });
      
      expect(error).toBeNull();
      expect(data[0].data_type).toBe('uuid');
      expect(data[0].column_default).toContain('uuid_generate_v4');
    });

    it('should have medications as JSONB type (not TEXT[])', async () => {
      const { data, error } = await supabase.rpc('get_column_info', {
        table_name: 'patients',
        column_name: 'medications'
      });
      
      expect(error).toBeNull();
      expect(data[0].data_type).toBe('jsonb');
    });

    it('should have allergies as TEXT[] array type', async () => {
      const { data, error } = await supabase.rpc('get_column_info', {
        table_name: 'patients',
        column_name: 'allergies'
      });
      
      expect(error).toBeNull();
      expect(data[0].data_type).toBe('ARRAY');
    });

    it('should have diagnosis_history as JSONB type', async () => {
      const { data, error } = await supabase.rpc('get_column_info', {
        table_name: 'patients',
        column_name: 'diagnosis_history'
      });
      
      expect(error).toBeNull();
      expect(data[0].data_type).toBe('jsonb');
    });

    it('should have vital_signs as JSONB type', async () => {
      const { data, error } = await supabase.rpc('get_column_info', {
        table_name: 'patients',
        column_name: 'vital_signs'
      });
      
      expect(error).toBeNull();
      expect(data[0].data_type).toBe('jsonb');
    });

    it('should have NOT NULL constraints on required fields', async () => {
      const { data: nameInfo, error: nameError } = await supabase.rpc('get_column_info', {
        table_name: 'patients',
        column_name: 'name'
      });
      const { data: ageInfo, error: ageError } = await supabase.rpc('get_column_info', {
        table_name: 'patients',
        column_name: 'age'
      });
      
      expect(nameError).toBeNull();
      expect(ageError).toBeNull();
      expect(nameInfo[0].is_nullable).toBe('NO');
      expect(ageInfo[0].is_nullable).toBe('NO');
    });
  });

  describe('visits table', () => {
    it('should exist with foreign key to patients', async () => {
      const { data, error } = await supabase
        .from('visits')
        .select('*')
        .limit(0);
      
      expect(error).toBeNull();
    });

    it('should have patient_id foreign key constraint', async () => {
      const { data, error } = await supabase.rpc('get_foreign_keys', {
        table_name: 'visits'
      });
      
      expect(error).toBeNull();
      expect(data).toContainEqual(
        expect.objectContaining({
          column_name: 'patient_id',
          foreign_table_name: 'patients'
        })
      );
    });
  });

  describe('prescriptions table', () => {
    it('should exist with foreign key to patients', async () => {
      const { data, error } = await supabase
        .from('prescriptions')
        .select('*')
        .limit(0);
      
      expect(error).toBeNull();
    });

    it('should have default status of pending_physician_approval', async () => {
      const { data, error } = await supabase.rpc('get_column_info', {
        table_name: 'prescriptions',
        column_name: 'status'
      });
      
      expect(error).toBeNull();
      expect(data[0].column_default).toContain('pending_physician_approval');
    });

    it('should have blocked as BOOLEAN with default FALSE', async () => {
      const { data, error } = await supabase.rpc('get_column_info', {
        table_name: 'prescriptions',
        column_name: 'blocked'
      });
      
      expect(error).toBeNull();
      expect(data[0].data_type).toBe('boolean');
      expect(data[0].column_default).toBe('false');
    });

    it('should have warnings as JSONB type', async () => {
      const { data, error } = await supabase.rpc('get_column_info', {
        table_name: 'prescriptions',
        column_name: 'warnings'
      });
      
      expect(error).toBeNull();
      expect(data[0].data_type).toBe('jsonb');
    });
  });
});

