// src/models/prescription.ts
import { getSupabaseClient } from '../db/supabase';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface Prescription {
  id: string;
  patient_id: string;
  medication: string;
  dosage: string;
  status: string;
  created_at: string;
  blocked: boolean;
  warnings: PrescriptionWarning[];
}

export interface PrescriptionInput {
  patient_id: string;
  medication: string;
  dosage: string;
  blocked: boolean;
  warnings: PrescriptionWarning[];
}

export interface PrescriptionWarning {
  type: string;
  severity: string;
  message: string;
  explanation: string;
}

export interface PrescriptionResult {
  success: boolean;
  error: string | null;
  prescription: Prescription | null;
}

export interface PrescriptionsResult {
  success: boolean;
  error: string | null;
  prescriptions: Prescription[] | null;
}

// ============================================
// QUERY FUNCTIONS
// ============================================

/**
 * Create a new prescription
 * NOTE: Per FR-23, prescriptions are logged even when blocked for audit purposes
 * @param {PrescriptionInput} input - Prescription data
 * @returns {Promise<PrescriptionResult>} Prescription result
 */
export async function createPrescription(
  input: PrescriptionInput
): Promise<PrescriptionResult> {
  try {
    // Validate required fields
    if (!input.patient_id || input.patient_id.trim() === '') {
      return {
        success: false,
        error: 'Patient ID is required',
        prescription: null,
      };
    }

    if (!input.medication || input.medication.trim() === '') {
      return {
        success: false,
        error: 'Medication is required',
        prescription: null,
      };
    }

    if (!input.dosage || input.dosage.trim() === '') {
      return {
        success: false,
        error: 'Dosage is required',
        prescription: null,
      };
    }

    const client = getSupabaseClient();

    // Insert prescription
    // Status defaults to 'pending_physician_approval' per FR-26
    const { data, error } = await client
      .from('prescriptions')
      .insert({
        patient_id: input.patient_id,
        medication: input.medication,
        dosage: input.dosage,
        blocked: input.blocked,
        warnings: input.warnings,
        // status will default to 'pending_physician_approval' in database
      })
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: error.message,
        prescription: null,
      };
    }

    return {
      success: true,
      error: null,
      prescription: data as Prescription,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: errorMessage,
      prescription: null,
    };
  }
}

/**
 * Find all prescriptions for a patient
 * @param {string} patientId - Patient UUID
 * @param {number} limit - Optional limit on number of prescriptions to return
 * @returns {Promise<PrescriptionsResult>} Prescriptions result
 */
export async function findPrescriptionsByPatient(
  patientId: string,
  limit?: number
): Promise<PrescriptionsResult> {
  try {
    // Validate input
    if (!patientId || patientId.trim() === '') {
      return {
        success: false,
        error: 'Patient ID is required',
        prescriptions: null,
      };
    }

    const client = getSupabaseClient();

    let query = client
      .from('prescriptions')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    // Apply limit if provided
    if (limit && limit > 0) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      return {
        success: false,
        error: error.message,
        prescriptions: null,
      };
    }

    return {
      success: true,
      error: null,
      prescriptions: data as Prescription[],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: errorMessage,
      prescriptions: null,
    };
  }
}

/**
 * Update prescription status
 * @param {string} prescriptionId - Prescription UUID
 * @param {string} status - New status
 * @returns {Promise<PrescriptionResult>} Updated prescription result
 */
export async function updatePrescriptionStatus(
  prescriptionId: string,
  status: string
): Promise<PrescriptionResult> {
  try {
    // Validate input
    if (!prescriptionId || prescriptionId.trim() === '') {
      return {
        success: false,
        error: 'Prescription ID is required',
        prescription: null,
      };
    }

    if (!status || status.trim() === '') {
      return {
        success: false,
        error: 'Status is required',
        prescription: null,
      };
    }

    const client = getSupabaseClient();

    const { data, error } = await client
      .from('prescriptions')
      .update({ status })
      .eq('id', prescriptionId)
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: error.message,
        prescription: null,
      };
    }

    if (!data) {
      return {
        success: false,
        error: 'Prescription not found',
        prescription: null,
      };
    }

    return {
      success: true,
      error: null,
      prescription: data as Prescription,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: errorMessage,
      prescription: null,
    };
  }
}
