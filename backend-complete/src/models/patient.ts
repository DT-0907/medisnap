// src/models/patient.ts
import { getSupabaseClient } from '../db/supabase';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface Patient {
  id: string;
  name: string;
  age: number;
  sex: string;
  chief_complaint: string | null;
  current_symptoms: string[];
  vital_signs: VitalSigns | null;
  allergies: string[];
  medications: Medication[];
  diagnosis_history: DiagnosisEntry[];
  created_at: string;
}

export interface Medication {
  name: string;
  dosage: string;
  started: string;
}

export interface DiagnosisEntry {
  date: string;
  diagnosis: string;
  provider: string;
}

export interface VitalSigns {
  bp: string;
  hr: number;
  o2: number;
  temp: number;
}

export interface PatientResult {
  success: boolean;
  error: string | null;
  patient: Patient | null;
}

export interface PatientsResult {
  success: boolean;
  error: string | null;
  patients: Patient[] | null;
}

// ============================================
// QUERY FUNCTIONS
// ============================================

/**
 * Find patient by name (case-insensitive, supports partial match)
 * @param {string} name - Patient name to search for
 * @returns {Promise<PatientResult>} Patient result
 */
export async function findPatientByName(name: string): Promise<PatientResult> {
  try {
    // Validate input
    if (!name || name.trim() === '') {
      return {
        success: false,
        error: 'Patient name is required',
        patient: null,
      };
    }

    const client = getSupabaseClient();

    // Case-insensitive search using ilike
    const { data, error } = await client
      .from('patients')
      .select('*')
      .ilike('name', `%${name.trim()}%`)
      .limit(1)
      .single();

    if (error) {
      // Not found is not an error for our purposes
      if (error.code === 'PGRST116') {
        return {
          success: true,
          error: null,
          patient: null,
        };
      }

      return {
        success: false,
        error: error.message,
        patient: null,
      };
    }

    return {
      success: true,
      error: null,
      patient: data as Patient,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: errorMessage,
      patient: null,
    };
  }
}

/**
 * Find patient by UUID
 * @param {string} id - Patient UUID
 * @returns {Promise<PatientResult>} Patient result
 */
export async function findPatientById(id: string): Promise<PatientResult> {
  try {
    // Validate input
    if (!id || id.trim() === '') {
      return {
        success: false,
        error: 'Patient ID is required',
        patient: null,
      };
    }

    // Basic UUID format validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return {
        success: false,
        error: 'Invalid UUID format',
        patient: null,
      };
    }

    const client = getSupabaseClient();

    const { data, error } = await client
      .from('patients')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      // Not found is not an error for our purposes
      if (error.code === 'PGRST116') {
        return {
          success: true,
          error: null,
          patient: null,
        };
      }

      return {
        success: false,
        error: error.message,
        patient: null,
      };
    }

    return {
      success: true,
      error: null,
      patient: data as Patient,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: errorMessage,
      patient: null,
    };
  }
}

/**
 * Get all patients with optional limit
 * @param {number} limit - Optional limit on number of patients to return
 * @returns {Promise<PatientsResult>} Patients result
 */
export async function getAllPatients(limit?: number): Promise<PatientsResult> {
  try {
    const client = getSupabaseClient();

    let query = client
      .from('patients')
      .select('*')
      .order('name', { ascending: true });

    // Apply limit if provided
    if (limit && limit > 0) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      return {
        success: false,
        error: error.message,
        patients: null,
      };
    }

    return {
      success: true,
      error: null,
      patients: data as Patient[],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: errorMessage,
      patients: null,
    };
  }
}
