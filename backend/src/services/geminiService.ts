// src/services/geminiService.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

// ============================================
// ERROR CLASS
// ============================================

export class GeminiServiceError extends Error {
  constructor(message: string, public originalError?: unknown) {
    super(message);
    this.name = 'GeminiServiceError';
  }
}

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface ClinicalAdvice {
  diagnosis: string;
  recommendations: string[];
  urgency: 'routine' | 'urgent' | 'emergency';
  confidence: number;
  reasoning?: string;
}

export interface SymptomAnalysis {
  possibleDiagnoses: string[];
  differentialDiagnoses?: string[];
}

export interface PatientContext {
  patientAge?: number;
  patientSex?: string;
  symptoms?: string[];
  vitalSigns?: {
    temp?: number;
    hr?: number;
    o2?: number;
    bp?: string;
  };
  medications?: Array<{
    name: string;
    dosage: string;
    started?: string;
  }>;
  allergies?: string[];
  diagnosisHistory?: string[];
}

// ============================================
// CONFIGURATION
// ============================================

let genAI: GoogleGenerativeAI | null = null;

function getGeminiClient(): GoogleGenerativeAI {
  if (!process.env.GEMINI_API_KEY) {
    throw new GeminiServiceError('GEMINI_API_KEY environment variable is not set');
  }

  if (!genAI) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }

  return genAI;
}

// ============================================
// DEMO MODE RESPONSES
// ============================================

const DEMO_RESPONSES = {
  clinicalAdvice: {
    diagnosis: 'Upper Respiratory Infection (likely viral)',
    recommendations: [
      'Rest and increase fluid intake',
      'Monitor temperature and symptoms',
      'Consider over-the-counter fever reducer if needed',
      'Follow up if symptoms worsen or persist beyond 7 days',
    ],
    urgency: 'routine' as const,
    confidence: 0.8,
    reasoning: 'Symptoms consistent with common viral URI. No concerning vital signs.',
  },
  hypertension: {
    diagnosis: 'Elevated Blood Pressure - Hypertension',
    recommendations: [
      'Verify medication compliance (currently on Lisinopril 10mg)',
      'Recheck BP in 15 minutes after rest',
      'Consider dosage adjustment if consistently elevated',
      'Consult physician for treatment modification',
    ],
    urgency: 'urgent' as const,
    confidence: 0.9,
  },
  symptomAnalysis: {
    possibleDiagnoses: [
      'Upper Respiratory Infection',
      'Influenza',
      'COVID-19',
      'Bronchitis',
    ],
  },
};

// ============================================
// CORE FUNCTIONS
// ============================================

/**
 * Generate response from Gemini API
 * @param prompt - Text prompt to send to Gemini
 * @returns Generated text response
 */
export async function generateResponse(prompt: string): Promise<string> {
  try {
    // Validation
    if (!prompt || prompt.trim() === '') {
      throw new GeminiServiceError('Prompt cannot be empty');
    }

    // Demo mode
    if (process.env.DEMO_MODE === 'true') {
      return `[Demo] Gemini response to: ${prompt.substring(0, 50)}...`;
    }

    const client = getGeminiClient();
    const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    if (!text || text.trim() === '') {
      throw new GeminiServiceError('Empty response from Gemini API');
    }

    return text;
  } catch (error) {
    if (error instanceof GeminiServiceError) {
      throw error;
    }
    throw new GeminiServiceError(
      'Failed to generate response from Gemini',
      error
    );
  }
}

/**
 * Generate clinical advice from patient data
 * @param patientData - Patient symptoms and vitals
 * @returns Structured clinical advice
 */
export async function generateClinicalAdvice(
  patientData: PatientContext
): Promise<ClinicalAdvice> {
  try {
    // Demo mode
    if (process.env.DEMO_MODE === 'true') {
      // Return appropriate demo response based on data
      if (patientData.vitalSigns?.bp && parseFloat(patientData.vitalSigns.bp.split('/')[0]) > 140) {
        return DEMO_RESPONSES.hypertension;
      }
      return DEMO_RESPONSES.clinicalAdvice;
    }

    const prompt = formatClinicalPrompt(patientData);
    const response = await generateResponse(prompt);

    return parseClinicalResponse(response);
  } catch (error) {
    throw new GeminiServiceError(
      'Failed to generate clinical advice',
      error
    );
  }
}

/**
 * Analyze symptoms and suggest possible diagnoses
 * @param symptoms - Array of symptom strings
 * @returns Symptom analysis with possible diagnoses
 */
export async function analyzeSymptoms(
  symptoms: string[]
): Promise<SymptomAnalysis> {
  try {
    if (!symptoms || symptoms.length === 0) {
      throw new GeminiServiceError('At least one symptom required');
    }

    // Demo mode
    if (process.env.DEMO_MODE === 'true') {
      return DEMO_RESPONSES.symptomAnalysis;
    }

    const prompt = `As a medical AI assistant, analyze the following symptoms and provide 3-4 possible diagnoses:\n\nSymptoms: ${symptoms.join(', ')}\n\nProvide a list of possible diagnoses from most to least likely.`;

    const response = await generateResponse(prompt);

    // Parse response to extract diagnoses
    const lines = response.split('\n').filter(line => line.trim() !== '');
    const possibleDiagnoses = lines
      .filter(line => line.match(/^\d+\.|^-|^•/))
      .map(line => line.replace(/^\d+\.|^-|^•/, '').trim())
      .filter(line => line.length > 0);

    return {
      possibleDiagnoses: possibleDiagnoses.length > 0 ? possibleDiagnoses : [response],
    };
  } catch (error) {
    throw new GeminiServiceError(
      'Failed to analyze symptoms',
      error
    );
  }
}

/**
 * Format prompt with patient context
 * @param basePrompt - Base prompt text
 * @param context - Patient context data
 * @returns Formatted prompt string
 */
export function formatPrompt(basePrompt: string, context: PatientContext): string {
  let prompt = basePrompt + '\n\nPatient Context:\n';

  if (context.patientAge) {
    prompt += `- Age: ${context.patientAge}\n`;
  }

  if (context.patientSex) {
    prompt += `- Sex: ${context.patientSex}\n`;
  }

  if (context.symptoms && context.symptoms.length > 0) {
    prompt += `- Symptoms: ${context.symptoms.join(', ')}\n`;
  }

  if (context.vitalSigns) {
    prompt += '- Vital Signs:\n';
    if (context.vitalSigns.temp) prompt += `  - Temperature: ${context.vitalSigns.temp}°F\n`;
    if (context.vitalSigns.hr) prompt += `  - Heart Rate: ${context.vitalSigns.hr} BPM\n`;
    if (context.vitalSigns.o2) prompt += `  - O2 Saturation: ${context.vitalSigns.o2}%\n`;
    if (context.vitalSigns.bp) prompt += `  - Blood Pressure: ${context.vitalSigns.bp}\n`;
  }

  if (context.medications && context.medications.length > 0) {
    prompt += '- Current Medications:\n';
    context.medications.forEach(med => {
      prompt += `  - ${med.name} ${med.dosage}\n`;
    });
  }

  if (context.allergies && context.allergies.length > 0) {
    prompt += `- Allergies: ${context.allergies.join(', ')}\n`;
  }

  return prompt;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function formatClinicalPrompt(patientData: PatientContext): string {
  const basePrompt = `As a medical AI assistant, analyze the following patient data and provide:
1. Most likely diagnosis
2. 3-4 specific clinical recommendations
3. Urgency level (routine, urgent, or emergency)
4. Confidence level (0.0 to 1.0)

Be concise and professional.`;

  return formatPrompt(basePrompt, patientData);
}

function parseClinicalResponse(response: string): ClinicalAdvice {
  // Simple parsing - extract diagnosis and recommendations
  const lines = response.split('\n').filter(line => line.trim() !== '');

  // Find diagnosis (usually first substantive line)
  const diagnosis = lines.find(line =>
    line.toLowerCase().includes('diagnosis') ||
    line.match(/^\d+\.\s/) ||
    line.length > 20
  ) || lines[0] || 'Unable to determine diagnosis';

  // Extract recommendations (lines that look like recommendations)
  const recommendations = lines
    .filter(line =>
      line.match(/^[-•\d]/) ||
      line.toLowerCase().includes('recommend') ||
      line.toLowerCase().includes('suggest')
    )
    .map(line => line.replace(/^[-•\d]+\.?\s*/, '').trim())
    .filter(line => line.length > 0)
    .slice(0, 4);

  // Determine urgency from keywords
  let urgency: 'routine' | 'urgent' | 'emergency' = 'routine';
  const lowerResponse = response.toLowerCase();
  if (lowerResponse.includes('emergency') || lowerResponse.includes('immediately')) {
    urgency = 'emergency';
  } else if (lowerResponse.includes('urgent') || lowerResponse.includes('prompt')) {
    urgency = 'urgent';
  }

  // Confidence (default to 0.7 if not specified)
  let confidence = 0.7;
  const confMatch = response.match(/confidence[:\s]+(\d+\.?\d*)/i);
  if (confMatch) {
    confidence = parseFloat(confMatch[1]);
    if (confidence > 1) confidence = confidence / 100; // Handle percentage
  }

  return {
    diagnosis: diagnosis.replace(/^(diagnosis|assessment)[:\s]*/i, '').trim(),
    recommendations: recommendations.length > 0 ? recommendations : [
      'Continue monitoring symptoms',
      'Follow up if condition worsens',
    ],
    urgency,
    confidence,
    reasoning: response,
  };
}

// ============================================
// VOICE INTENT EXTRACTION
// ============================================

export interface IntentResult {
  intent: string;
  parameters?: any;
  confidence?: number;
}

/**
 * Extract intent from voice command transcription
 * Per implementation plan Task 3.11.10
 */
export async function extractIntent(
  transcription: string,
  _context?: any
): Promise<IntentResult> {
  try {
    const prompt = `Extract the intent and parameters from this voice command: "${transcription}"

Possible intents:
- start_training
- start_assessment
- record_symptom
- prescribe_medication
- show_medications
- show_allergies
- show_patient_history
- repeat_instructions
- end_session
- unknown

Return JSON only in this format:
{
  "intent": "intent_name",
  "parameters": { extracted parameters },
  "confidence": 0.9
}`;

    const response = await generateResponse(prompt);

    // Parse JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return { intent: 'unknown', confidence: 0 };
  } catch (error) {
    console.error('Error extracting intent:', error);
    return { intent: 'unknown', confidence: 0 };
  }
}
