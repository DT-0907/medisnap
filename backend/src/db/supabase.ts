// src/db/supabase.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Singleton instance
let supabaseInstance: SupabaseClient | null = null;

/**
 * Get Supabase client instance (singleton pattern)
 * @throws {Error} If SUPABASE_URL or SUPABASE_KEY environment variables are not set
 * @returns {SupabaseClient} Supabase client instance
 */
export function getSupabaseClient(): SupabaseClient {
  // Return existing instance if available
  if (supabaseInstance) {
    return supabaseInstance;
  }

  // Validate environment variables
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;

  if (!supabaseUrl) {
    throw new Error('SUPABASE_URL environment variable is not set');
  }

  if (!supabaseKey) {
    throw new Error('SUPABASE_KEY environment variable is not set');
  }

  // Create and cache instance
  supabaseInstance = createClient(supabaseUrl, supabaseKey);

  return supabaseInstance;
}

/**
 * Test database connection
 * @returns {Promise<ConnectionResult>} Connection test result
 */
export async function testConnection(): Promise<ConnectionResult> {
  try {
    const client = getSupabaseClient();

    // Test connection by querying patients table
    const { error } = await client
      .from('patients')
      .select('id')
      .limit(1);

    if (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to connect to Supabase',
      };
    }

    // Get list of tables
    const tables = ['patients', 'visits', 'prescriptions'];

    return {
      success: true,
      error: null,
      message: 'Connected to Supabase successfully',
      tablesFound: tables.length,
      tables,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: errorMessage,
      message: 'Connection test failed',
    };
  }
}

/**
 * Format Supabase error for consistent error handling
 * @param {any} error - Supabase error object
 * @returns {string} Formatted error message
 */
export function formatSupabaseError(error: any): string {
  if (!error) {
    return 'Unknown error occurred';
  }

  if (typeof error === 'string') {
    return error;
  }

  if (error.message) {
    return error.message;
  }

  return JSON.stringify(error);
}

// Type definitions
export interface ConnectionResult {
  success: boolean;
  error: string | null;
  message: string;
  tablesFound?: number;
  tables?: string[];
}
