// src/controllers/prescriptionController.ts
import { findPatientById } from '../models/patient';
import {
  checkInteraction,
  checkAllergies,
  getAlternatives,
  getMedication,
} from '../services/drugInteractionService';
import { createPrescription } from '../models/prescription';
import { generateTTS } from '../services/fishAudioService';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface CreatePrescriptionInput {
  patient_id: string;
  medication: string;
  dosage: string;
}

export interface CreatePrescriptionResult {
  success: boolean;
  blocked?: boolean;
  prescription_id?: string;
  message?: string;
  warnings?: Array<{
    type: string;
    severity: string;
    message: string;
  }>;
  alternatives?: Array<{
    medication: string;
    dosage: string;
    rationale: string;
  }>;
  ar_display?: {
    icon: string;
    badge: string;
  };
  audio_url?: string;
  error?: string;
}

// ============================================
// CREATE PRESCRIPTION
// ============================================

/**
 * Create prescription with safety checks
 * Per FR-21, FR-22, FR-23, FR-24, FR-25, FR-26
 */
export async function createPrescriptionController(
  input: CreatePrescriptionInput
): Promise<CreatePrescriptionResult> {
  try {
    const { patient_id, medication, dosage } = input;

    // Validate medication exists in database (FR-22)
    const medicationInfo = getMedication(medication);
    if (!medicationInfo) {
      const errorMessage = `Medication not found in database. Please verify spelling or say "Show available medications" to see the list.`;
      const audio_url = await generateTTS(errorMessage);

      return {
        success: false,
        error: errorMessage,
        audio_url,
      };
    }

    // Load patient
    const patientResult = await findPatientById(patient_id);
    if (!patientResult.success || !patientResult.patient) {
      return {
        success: false,
        error: 'Patient not found',
      };
    }

    const patient = patientResult.patient;

    // Extract current medication names
    const currentMedications = patient.medications
      ? patient.medications.map((m: any) => m.name)
      : [];

    // Check drug interactions (FR-23)
    const interactionResult = checkInteraction(medication, currentMedications);

    // Check allergies (FR-23)
    const allergyResult = checkAllergies(medication, patient.allergies || []);

    // Determine if prescription should be blocked (FR-24)
    const blocked =
      interactionResult.hasInteraction || allergyResult.hasAllergy;

    // Collect warnings
    const warnings = [];
    if (interactionResult.hasInteraction) {
      warnings.push({
        type: 'drug_interaction',
        severity: interactionResult.severity || 'UNKNOWN',
        message: interactionResult.message,
        explanation: `Drug interaction detected between ${medication} and ${interactionResult.interactsWith}`,
      });
    }
    if (allergyResult.hasAllergy) {
      warnings.push({
        type: 'allergy',
        severity: 'HIGH',
        message: allergyResult.message,
        explanation: `Patient is allergic to ${allergyResult.allergen}`,
      });
    }

    // Get alternatives if blocked (FR-24)
    const alternatives = blocked
      ? getAlternatives(
          medication,
          interactionResult.interactsWith,
          allergyResult.allergen
        )
      : [];

    // Log prescription (even if blocked, for audit per FR-23, FR-26)
    const prescriptionResult = await createPrescription({
      patient_id,
      medication,
      dosage,
      blocked,
      warnings,
    });

    // Generate response message
    let message: string;
    if (blocked) {
      message = `WARNING: Prescription blocked due to safety concerns. ${warnings[0].message}`;
      if (alternatives.length > 0) {
        message += ` Recommend ${alternatives[0].medication} ${alternatives[0].dosage} instead.`;
      }
    } else {
      // FR-25: Log prescription, FR-26: pending_physician_approval status
      message = `Prescription logged: ${medication} ${dosage}. Status: Pending physician approval.`;
    }

    // Generate TTS (FR-26)
    const audio_url = await generateTTS(message);

    return {
      success: true,
      blocked,
      prescription_id: prescriptionResult.prescription?.id,
      message,
      warnings,
      alternatives,
      ar_display: {
        icon: blocked ? 'red_x' : 'green_checkmark',
        badge: blocked ? 'BLOCKED' : 'PENDING',
      },
      audio_url,
    };
  } catch (error) {
    console.error('Error in createPrescription:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
