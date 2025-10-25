// src/controllers/clinicalController.ts
import { findPatientByName } from '../models/patient';
import { analyzeSymptoms } from '../services/clinicalDecisionEngine';
import { addMessage } from '../services/lettaService';
import { generateTTS } from '../services/fishAudioService';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface LoadPatientInput {
  patient_name: string;
}

export interface LoadPatientResult {
  success: boolean;
  patient?: any;
  ar_display?: {
    position: string;
    duration_seconds: number;
    priority_fields: string[];
  };
  audio_url?: string;
  error?: string;
}

export interface RecordSymptomInput {
  session_id: string;
  patient_id: string;
  symptom: string;
}

export interface RecordSymptomResult {
  success: boolean;
  message?: string;
  error?: string;
}

export interface DecisionSupportInput {
  session_id: string;
  patient_id: string;
  symptoms: string[];
  vital_signs: any;
  current_medications?: any[];
}

export interface DecisionSupportResult {
  success: boolean;
  primary_diagnosis?: string;
  confidence?: number;
  reasoning?: string;
  recommendations?: string[];
  warnings?: any[];
  follow_up?: string;
  audio_url?: string;
  error?: string;
}

// ============================================
// LOAD PATIENT
// ============================================

/**
 * Load patient record by name
 * Per FR-12, FR-13
 */
export async function loadPatient(
  input: LoadPatientInput
): Promise<LoadPatientResult> {
  try {
    const { patient_name } = input;

    // Query patient from database
    const patientResult = await findPatientByName(patient_name);

    if (!patientResult.success || !patientResult.patient) {
      return {
        success: false,
        error: 'Patient not found. Please repeat patient name.',
      };
    }

    const patient = patientResult.patient;

    // Generate TTS
    const message = `Patient loaded: ${patient.name}, age ${patient.age}.`;
    const audio_url = await generateTTS(message);

    // AR display config per FR-13
    const ar_display = {
      position: 'top_center',
      duration_seconds: 10,
      priority_fields: ['allergies', 'medications', 'chief_complaint'],
    };

    return {
      success: true,
      patient,
      ar_display,
      audio_url,
    };
  } catch (error) {
    console.error('Error in loadPatient:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================
// RECORD SYMPTOM
// ============================================

/**
 * Record symptom to session context
 * Per FR-15
 */
export async function recordSymptom(
  input: RecordSymptomInput
): Promise<RecordSymptomResult> {
  try {
    const { session_id, symptom } = input;

    // Add symptom to Letta context
    addMessage(session_id, {
      role: 'user',
      content: `Symptom recorded: ${symptom}`,
    });

    return {
      success: true,
      message: `Symptom recorded: ${symptom}`,
    };
  } catch (error) {
    console.error('Error in recordSymptom:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================
// DECISION SUPPORT
// ============================================

/**
 * Get AI-powered clinical decision support
 * Per FR-18, FR-19, FR-20
 */
export async function getDecisionSupport(
  input: DecisionSupportInput
): Promise<DecisionSupportResult> {
  try {
    const { session_id, symptoms, vital_signs, current_medications } = input;

    // Use Clinical Decision Engine
    const analysis = await analyzeSymptoms({
      symptoms,
      vital_signs,
      current_medications,
    });

    // Generate TTS for first recommendation
    const ttsText = `${analysis.primary_diagnosis}. ${analysis.recommendations[0]}`;
    const audio_url = await generateTTS(ttsText);

    // Add to context
    addMessage(session_id, {
      role: 'assistant',
      content: `Diagnosis: ${analysis.primary_diagnosis}`,
    });

    return {
      success: true,
      ...analysis,
      audio_url,
    };
  } catch (error) {
    console.error('Error in getDecisionSupport:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
