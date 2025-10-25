// tests/unit/db/supabase.test.ts
import { getSupabaseClient, testConnection } from '../../../src/db/supabase';
import { SupabaseClient } from '@supabase/supabase-js';

describe('Supabase Client', () => {
  let client: SupabaseClient;

  beforeAll(() => {
    // Verify environment variables are set
    expect(process.env.SUPABASE_URL).toBeDefined();
    expect(process.env.SUPABASE_KEY).toBeDefined();
  });

  describe('getSupabaseClient', () => {
    it('should return a valid Supabase client instance', () => {
      client = getSupabaseClient();

      expect(client).toBeDefined();
      expect(client).toBeInstanceOf(Object);
      expect(client.from).toBeDefined();
      expect(typeof client.from).toBe('function');
    });

    it('should return the same instance on multiple calls (singleton)', () => {
      const client1 = getSupabaseClient();
      const client2 = getSupabaseClient();

      expect(client1).toBe(client2);
    });

    it('should throw error if SUPABASE_URL is missing', () => {
      const originalUrl = process.env.SUPABASE_URL;
      delete process.env.SUPABASE_URL;

      expect(() => getSupabaseClient()).toThrow('SUPABASE_URL');

      // Restore
      process.env.SUPABASE_URL = originalUrl;
    });

    it('should throw error if SUPABASE_KEY is missing', () => {
      const originalKey = process.env.SUPABASE_KEY;
      delete process.env.SUPABASE_KEY;

      expect(() => getSupabaseClient()).toThrow('SUPABASE_KEY');

      // Restore
      process.env.SUPABASE_KEY = originalKey;
    });
  });

  describe('testConnection', () => {
    it('should successfully connect to database', async () => {
      const result = await testConnection();

      expect(result.success).toBe(true);
      expect(result.error).toBeNull();
    });

    it('should return connection details on success', async () => {
      const result = await testConnection();

      expect(result.message).toContain('Connected to Supabase');
      expect(result.tablesFound).toBeGreaterThanOrEqual(3);
      expect(result.tables).toContain('patients');
      expect(result.tables).toContain('visits');
      expect(result.tables).toContain('prescriptions');
    });

    it('should handle connection errors gracefully', async () => {
      // Temporarily corrupt the client to test error handling
      const originalKey = process.env.SUPABASE_KEY;
      process.env.SUPABASE_KEY = 'invalid-key';

      // Force new client creation
      jest.resetModules();
      const { testConnection: testBadConnection } = require('../../../src/db/supabase');

      const result = await testBadConnection();

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();

      // Restore
      process.env.SUPABASE_KEY = originalKey;
      jest.resetModules();
    });
  });

  describe('query execution', () => {
    it('should execute SELECT query successfully', async () => {
      client = getSupabaseClient();

      const { data, error } = await client
        .from('patients')
        .select('id, name')
        .limit(1);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
    });

    it('should handle query errors gracefully', async () => {
      client = getSupabaseClient();

      const { data, error } = await client
        .from('nonexistent_table')
        .select('*');

      expect(error).toBeDefined();
      expect(data).toBeNull();
    });
  });

  describe('error formatting', () => {
    it('should format Supabase errors consistently', async () => {
      client = getSupabaseClient();

      const { error } = await client
        .from('nonexistent_table')
        .select('*');

      expect(error).toBeDefined();
      expect(error?.message).toBeDefined();
      expect(typeof error?.message).toBe('string');
    });
  });
});
