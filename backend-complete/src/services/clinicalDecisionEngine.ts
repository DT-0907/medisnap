// src/services/clinicalDecisionEngine.ts
import { generateResponse } from './geminiService';

// ============================================
// ERROR CLASS
// ============================================

export class ClinicalDecisionEngineError extends Error {
  constructor(message: string, public originalError?: unknown) {
    super(message);
    this.name = 'ClinicalDecisionEngineError';
  }
}

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface PatientData {
  symptoms: string[];
  vital_signs: VitalSigns;
  current_medications?: PatientMedication[];
  allergies?: string[];
}

export interface VitalSigns {
  bp?: string;
  hr?: number;
  o2?: number;
  temp?: number;
}

export interface PatientMedication {
  name: string;
  dosage: string;
  started?: string;
}

export interface ClinicalAnalysis {
  primary_diagnosis: string;
  confidence: number;
  reasoning: string;
  recommendations: string[];
  warnings: string[];
  follow_up: string;
  urgency: 'routine' | 'urgent' | 'emergency';
}

// ============================================
// SYMPTOM PATTERN RECOGNITION
// ============================================

/**
 * Check if symptoms match respiratory infection pattern
 * Scenario 1 from FR-19
 */
function isRespiratoryInfection(symptoms: string[], vitals: VitalSigns): boolean {
  const symptomStr = symptoms.join(' ').toLowerCase();

  const hasRespSymptoms =
    symptomStr.includes('cough') ||
    symptomStr.includes('fever') ||
    symptomStr.includes('fatigue') ||
    symptomStr.includes('chest');

  const hasFever = vitals.temp && vitals.temp > 100;

  return hasRespSymptoms && (hasFever || symptoms.length >= 2);
}

/**
 * Check if vitals indicate hypertension
 * Scenario 2 from FR-19
 */
function isHypertension(vitals: VitalSigns): boolean {
  if (!vitals.bp) return false;

  const bpMatch = vitals.bp.match(/(\d+)\/(\d+)/);
  if (!bpMatch) return false;

  const systolic = parseInt(bpMatch[1], 10);
  const diastolic = parseInt(bpMatch[2], 10);

  // Elevated BP: systolic >= 140 OR diastolic >= 90
  return systolic >= 140 || diastolic >= 90;
}

/**
 * Assess urgency level based on symptoms and vitals
 */
function assessUrgency(symptoms: string[], vitals: VitalSigns): 'routine' | 'urgent' | 'emergency' {
  const symptomStr = symptoms.join(' ').toLowerCase();

  // Emergency indicators
  const hasChestPain = symptomStr.includes('chest pain');
  const hasSevereBreathing = symptomStr.includes('shortness of breath') || symptomStr.includes('difficulty breathing');
  const lowO2 = vitals.o2 && vitals.o2 < 90;
  const veryHighBP = vitals.bp && (() => {
    const match = vitals.bp.match(/(\d+)\/(\d+)/);
    if (!match) return false;
    const systolic = parseInt(match[1], 10);
    return systolic >= 180;
  })();

  if (hasChestPain && (hasSevereBreathing || lowO2 || veryHighBP)) {
    return 'emergency';
  }

  // Urgent indicators
  const highFever = vitals.temp && vitals.temp > 103;
  const moderateLowO2 = vitals.o2 && vitals.o2 <= 94;
  const elevatedHR = vitals.hr && vitals.hr > 120;

  if (highFever || moderateLowO2 || elevatedHR || veryHighBP) {
    return 'urgent';
  }

  return 'routine';
}

// ============================================
// RULE-BASED ANALYSIS
// ============================================

/**
 * Analyze respiratory infection pattern
 * Returns structured diagnosis per Scenario 1 (FR-19)
 */
function analyzeRespiratoryInfection(
  symptoms: string[],
  vitals: VitalSigns
): ClinicalAnalysis {
  return {
    primary_diagnosis: 'Upper Respiratory Infection',
    confidence: 0.85,
    reasoning: `Combination of fever (${vitals.temp || 'reported'}°F), cough, fatigue, and chest tightness consistent with URI. Normal O2 saturation ${vitals.o2 ? `(${vitals.o2}%)` : ''} rules out lower respiratory involvement.`,
    recommendations: [
      'Perform chest auscultation to check for wheezing or crackles',
      'Monitor O2 saturation over next 24 hours',
      'Consider chest X-ray if symptoms worsen or persist beyond 7 days',
      'Supportive care: rest, fluids, over-the-counter symptom relief',
    ],
    warnings: [],
    follow_up: 'If fever persists beyond 3 days or shortness of breath develops, escalate to physician for possible bacterial infection and antibiotic consideration.',
    urgency: assessUrgency(symptoms, vitals),
  };
}

/**
 * Analyze hypertension pattern
 * Returns structured diagnosis per Scenario 2 (FR-19)
 */
function analyzeHypertension(
  vitals: VitalSigns,
  medications: PatientMedication[] = []
): ClinicalAnalysis {
  const bpMed = medications.find(med =>
    med.name.toLowerCase().includes('lisinopril') ||
    med.name.toLowerCase().includes('losartan') ||
    med.name.toLowerCase().includes('amlodipine')
  );

  return {
    primary_diagnosis: 'Elevated Blood Pressure (Hypertension)',
    confidence: 0.9,
    reasoning: `Blood pressure reading of ${vitals.bp} exceeds normal range. ${bpMed ? `Patient currently on ${bpMed.name} ${bpMed.dosage}.` : 'No current antihypertensive medication found in patient record.'}`,
    recommendations: [
      'Verify medication compliance - ensure patient taking prescribed dose',
      'Recheck BP in 15 minutes after patient has rested',
      bpMed ? 'Consider dosage adjustment if BP remains elevated' : 'Consider initiating antihypertensive therapy',
      'Consult physician for treatment modification if BP consistently elevated',
    ],
    warnings: [],
    follow_up: 'If blood pressure remains elevated on recheck, consult physician for possible medication adjustment or initiation of therapy.',
    urgency: assessUrgency([], vitals),
  };
}

// ============================================
// AI-POWERED ANALYSIS (GEMINI FALLBACK)
// ============================================

/**
 * Use Gemini for complex or unrecognized patterns
 * Fallback when rule-based logic doesn't apply
 */
async function analyzeWithGemini(patientData: PatientData): Promise<ClinicalAnalysis> {
  const prompt = `You are a clinical decision support AI. Analyze the following patient data and provide a structured clinical assessment.

Patient Symptoms: ${patientData.symptoms.join(', ') || 'None reported'}
Vital Signs: ${JSON.stringify(patientData.vital_signs)}
Current Medications: ${patientData.current_medications?.map(m => `${m.name} ${m.dosage}`).join(', ') || 'None'}

Provide your analysis in the following JSON format:
{
  "primary_diagnosis": "Main diagnosis or concern",
  "confidence": 0.75,
  "reasoning": "Explanation of diagnosis rationale",
  "recommendations": ["Recommendation 1", "Recommendation 2", "Recommendation 3"],
  "warnings": ["Any warnings or red flags"],
  "follow_up": "When to escalate or follow up",
  "urgency": "routine or urgent or emergency"
}

Focus on practical, actionable recommendations. Be concise but thorough.`;

  try {
    const response = await generateResponse(prompt);

    // Try to parse JSON response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const analysis = JSON.parse(jsonMatch[0]);
      return {
        primary_diagnosis: analysis.primary_diagnosis || 'Assessment in progress',
        confidence: analysis.confidence || 0.6,
        reasoning: analysis.reasoning || 'AI-generated analysis based on available data.',
        recommendations: analysis.recommendations || ['Continue monitoring patient', 'Document symptoms'],
        warnings: analysis.warnings || [],
        follow_up: analysis.follow_up || 'Follow up as clinically appropriate.',
        urgency: analysis.urgency || 'routine',
      };
    }

    // Fallback: parse natural language response
    return {
      primary_diagnosis: 'Assessment in progress',
      confidence: 0.5,
      reasoning: response.substring(0, 200),
      recommendations: ['Review AI analysis', 'Continue patient monitoring'],
      warnings: [],
      follow_up: 'Consult with physician for complex cases.',
      urgency: 'routine',
    };
  } catch (error) {
    // Gemini API failure - return safe fallback
    return {
      primary_diagnosis: 'Unable to complete analysis',
      confidence: 0.3,
      reasoning: 'Analysis system temporarily unavailable. Please use clinical judgment.',
      recommendations: [
        'Perform standard assessment procedures',
        'Document all symptoms and vital signs',
        'Consult with supervising physician',
      ],
      warnings: ['Automated analysis unavailable'],
      follow_up: 'Escalate to physician for clinical assessment.',
      urgency: 'routine',
    };
  }
}

// ============================================
// MAIN ANALYSIS FUNCTION
// ============================================

/**
 * Analyze symptoms and vital signs to provide clinical decision support
 * Per FR-18: Provide diagnosis suggestions, recommendations, warnings
 * Per FR-19: Implement 3 demo scenarios + AI fallback
 *
 * @param patientData - Patient symptoms and vital signs
 * @returns Clinical analysis with diagnosis and recommendations
 */
export async function analyzeSymptoms(
  patientData: PatientData
): Promise<ClinicalAnalysis> {
  // Validation
  if (!patientData || typeof patientData !== 'object') {
    throw new ClinicalDecisionEngineError('Patient data is required');
  }

  if (!Array.isArray(patientData.symptoms)) {
    throw new ClinicalDecisionEngineError('Symptoms must be an array');
  }

  if (!patientData.vital_signs || typeof patientData.vital_signs !== 'object') {
    throw new ClinicalDecisionEngineError('Vital signs are required');
  }

  // Demo mode: Return predictable respiratory infection analysis
  if (process.env.DEMO_MODE === 'true') {
    return analyzeRespiratoryInfection(
      patientData.symptoms.length > 0 ? patientData.symptoms : ['fever', 'cough'],
      patientData.vital_signs.temp ? patientData.vital_signs : { temp: 101.5, o2: 97 }
    );
  }

  // Rule-based analysis for known patterns

  // Scenario 1: Respiratory Infection
  if (isRespiratoryInfection(patientData.symptoms, patientData.vital_signs)) {
    return analyzeRespiratoryInfection(patientData.symptoms, patientData.vital_signs);
  }

  // Scenario 2: Hypertension Alert
  if (isHypertension(patientData.vital_signs)) {
    return analyzeHypertension(patientData.vital_signs, patientData.current_medications);
  }

  // No symptoms and normal vitals
  if (patientData.symptoms.length === 0) {
    const vitals = patientData.vital_signs;
    const allNormal =
      (!vitals.temp || (vitals.temp >= 97 && vitals.temp <= 99)) &&
      (!vitals.hr || (vitals.hr >= 60 && vitals.hr <= 100)) &&
      (!vitals.o2 || vitals.o2 >= 95) &&
      (!vitals.bp || (() => {
        const match = vitals.bp.match(/(\d+)\/(\d+)/);
        if (!match) return true;
        const sys = parseInt(match[1], 10);
        const dia = parseInt(match[2], 10);
        return sys < 140 && dia < 90;
      })());

    if (allNormal) {
      return {
        primary_diagnosis: 'No significant concerns detected',
        confidence: 0.9,
        reasoning: 'Patient presents with no reported symptoms and normal vital signs.',
        recommendations: [
          'Continue routine wellness care',
          'Maintain healthy lifestyle habits',
          'Schedule regular checkups as appropriate',
        ],
        warnings: [],
        follow_up: 'Return for routine follow-up or if new symptoms develop.',
        urgency: 'routine',
      };
    }
  }

  // Fallback: Use Gemini for unrecognized patterns
  return await analyzeWithGemini(patientData);
}

/**
 * Format clinical analysis for TTS delivery
 * Per FR-20: Deliver suggestions via Fish Audio TTS
 *
 * @param analysis - Clinical analysis result
 * @returns Formatted text for TTS
 */
export function formatForTTS(analysis: ClinicalAnalysis): string {
  let text = `Based on the assessment, the likely diagnosis is ${analysis.primary_diagnosis}. `;

  if (analysis.recommendations.length > 0) {
    text += 'Recommended next steps: ';
    text += analysis.recommendations.slice(0, 3).join('. ') + '. ';
  }

  if (analysis.warnings.length > 0) {
    text += 'Important warnings: ' + analysis.warnings.join('. ') + '. ';
  }

  return text;
}
