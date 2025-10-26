// src/services/drugInteractionService.ts

// ============================================
// ERROR CLASS
// ============================================

export class DrugInteractionServiceError extends Error {
  constructor(message: string, public originalError?: unknown) {
    super(message);
    this.name = 'DrugInteractionServiceError';
  }
}

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface Medication {
  name: string;
  class: string;
  common_dosage: string;
}

export interface PatientMedication {
  name: string;
  dosage: string;
  started: string;
}

export interface InteractionResult {
  hasInteraction: boolean;
  severity: 'HIGH' | 'MODERATE' | 'LOW' | null;
  message: string;
  interactsWith: string | null;
}

export interface AllergyResult {
  hasAllergy: boolean;
  allergen: string | null;
  message: string;
}

export interface Alternative {
  medication: string;
  dosage: string;
  rationale: string;
}

// ============================================
// MEDICATION DATABASE
// ============================================

/**
 * Medication database per FR-22
 * 8 common medications for MVP demo
 */
const MEDICATION_DATABASE: Medication[] = [
  {
    name: 'Amoxicillin',
    class: 'Penicillin',
    common_dosage: '500mg three times daily',
  },
  {
    name: 'Azithromycin',
    class: 'Macrolide',
    common_dosage: '250mg once daily',
  },
  {
    name: 'Acetaminophen',
    class: 'Analgesic',
    common_dosage: '500mg every 6 hours as needed',
  },
  {
    name: 'Ibuprofen',
    class: 'NSAID',
    common_dosage: '400mg every 6 hours as needed',
  },
  {
    name: 'Lisinopril',
    class: 'ACE Inhibitor',
    common_dosage: '10mg once daily',
  },
  {
    name: 'Metformin',
    class: 'Biguanide',
    common_dosage: '500mg twice daily',
  },
  {
    name: 'Omeprazole',
    class: 'Proton Pump Inhibitor',
    common_dosage: '20mg once daily',
  },
  {
    name: 'Warfarin',
    class: 'Anticoagulant',
    common_dosage: '5mg once daily',
  },
];

// ============================================
// INTERACTION RULES
// ============================================

/**
 * Drug interaction rules
 * MVP: Warfarin + NSAID = HIGH severity (bleeding risk)
 * Baseline implementation per user requirements
 */
const INTERACTION_RULES = [
  {
    drug1: 'Warfarin',
    drug2Class: 'NSAID',
    severity: 'HIGH' as const,
    message: 'Ibuprofen increases bleeding risk when combined with Warfarin (anticoagulant). NSAIDs like Ibuprofen can potentiate the effects of anticoagulants, increasing risk of serious bleeding complications.',
  },
];

/**
 * Allergy class mappings
 * Maps medication classes to common allergy triggers
 */
const ALLERGY_CLASS_MAP: Record<string, string[]> = {
  'Penicillin': ['Amoxicillin'], // Penicillin allergy applies to Amoxicillin
};

// ============================================
// MEDICATION LOOKUP
// ============================================

/**
 * Get medication by name (case-insensitive)
 * @param name - Medication name
 * @returns Medication object or null
 */
export function getMedication(name: string): Medication | null {
  if (!name || typeof name !== 'string') {
    return null;
  }

  const normalizedName = name.toLowerCase().trim();

  const medication = MEDICATION_DATABASE.find(
    med => med.name.toLowerCase() === normalizedName
  );

  return medication || null;
}

// ============================================
// INTERACTION CHECKING
// ============================================

/**
 * Check for drug interactions
 * Per FR-23: Check drug interactions with patient's current medications
 * @param proposedMedication - Medication to prescribe
 * @param currentMedications - Patient's current medications
 * @returns Interaction result
 */
export function checkInteraction(
  proposedMedication: string,
  currentMedications: PatientMedication[]
): InteractionResult {
  // Validation
  if (!proposedMedication || typeof proposedMedication !== 'string') {
    throw new DrugInteractionServiceError('Proposed medication name is required');
  }

  if (!Array.isArray(currentMedications)) {
    throw new DrugInteractionServiceError('Current medications must be an array');
  }

  // Look up proposed medication
  const proposedMed = getMedication(proposedMedication);

  if (!proposedMed) {
    throw new DrugInteractionServiceError(
      `Medication "${proposedMedication}" not found in database`
    );
  }

  // Check each current medication for interactions
  for (const currentMed of currentMedications) {
    const currentMedInfo = getMedication(currentMed.name);

    if (!currentMedInfo) {
      // Skip unknown medications in current list
      continue;
    }

    // Check interaction rules
    for (const rule of INTERACTION_RULES) {
      // Check if rule applies (Warfarin + NSAID)
      const isWarfarinNSAID =
        (currentMedInfo.name === rule.drug1 && proposedMed.class === rule.drug2Class) ||
        (proposedMed.name === rule.drug1 && currentMedInfo.class === rule.drug2Class);

      if (isWarfarinNSAID) {
        return {
          hasInteraction: true,
          severity: rule.severity,
          message: rule.message,
          interactsWith: currentMedInfo.name === rule.drug1 ? currentMedInfo.name : proposedMed.name,
        };
      }
    }
  }

  // No interactions found
  return {
    hasInteraction: false,
    severity: null,
    message: 'No known interactions detected.',
    interactsWith: null,
  };
}

// ============================================
// ALLERGY CHECKING
// ============================================

/**
 * Check for allergies
 * Per FR-23: Check patient allergy matches
 * @param proposedMedication - Medication to prescribe
 * @param patientAllergies - Patient's allergies
 * @returns Allergy result
 */
export function checkAllergies(
  proposedMedication: string,
  patientAllergies: string[]
): AllergyResult {
  if (!proposedMedication || !Array.isArray(patientAllergies)) {
    return {
      hasAllergy: false,
      allergen: null,
      message: 'No allergies detected.',
    };
  }

  const proposedMed = getMedication(proposedMedication);

  if (!proposedMed) {
    return {
      hasAllergy: false,
      allergen: null,
      message: 'Medication not found in database.',
    };
  }

  // Check direct medication name match
  for (const allergy of patientAllergies) {
    const normalizedAllergy = allergy.toLowerCase().trim();
    const normalizedMedName = proposedMed.name.toLowerCase();

    if (normalizedMedName === normalizedAllergy) {
      return {
        hasAllergy: true,
        allergen: allergy,
        message: `Patient is allergic to ${proposedMed.name}.`,
      };
    }
  }

  // Check medication class allergies (e.g., Penicillin allergy applies to Amoxicillin)
  for (const allergy of patientAllergies) {
    const normalizedAllergy = allergy.toLowerCase().trim();

    // Check if medication class matches allergy
    if (proposedMed.class.toLowerCase() === normalizedAllergy) {
      return {
        hasAllergy: true,
        allergen: allergy,
        message: `Patient is allergic to ${allergy}. ${proposedMed.name} is in the ${proposedMed.class} class.`,
      };
    }

    // Check allergy class mappings
    for (const [allergyClass, medications] of Object.entries(ALLERGY_CLASS_MAP)) {
      if (allergyClass.toLowerCase() === normalizedAllergy) {
        if (medications.includes(proposedMed.name)) {
          return {
            hasAllergy: true,
            allergen: allergy,
            message: `Patient is allergic to ${allergy}. ${proposedMed.name} is in the ${allergyClass} class.`,
          };
        }
      }
    }
  }

  return {
    hasAllergy: false,
    allergen: null,
    message: 'No known allergies detected.',
  };
}

// ============================================
// ALTERNATIVE SUGGESTIONS
// ============================================

/**
 * Get alternative medication suggestions
 * Per FR-24: Provide alternatives when safety concern detected
 * @param blockedMedication - Medication that was blocked
 * @param interactsWith - Medication it interacts with (optional)
 * @param allergen - Allergen that was matched (optional)
 * @returns Array of alternative suggestions
 */
export function getAlternatives(
  blockedMedication: string,
  interactsWith: string | null = null,
  allergen: string | null = null
): Alternative[] {
  const alternatives: Alternative[] = [];

  // Warfarin + NSAID interaction: Suggest Acetaminophen
  if (interactsWith && interactsWith.toLowerCase() === 'warfarin') {
    const blockedMed = getMedication(blockedMedication);
    if (blockedMed && blockedMed.class === 'NSAID') {
      alternatives.push({
        medication: 'Acetaminophen',
        dosage: '500mg every 6 hours as needed',
        rationale: 'Safer pain relief option with no anticoagulant interaction',
      });
    }
  }

  // Penicillin allergy: Suggest Azithromycin
  if (allergen && allergen.toLowerCase() === 'penicillin') {
    alternatives.push({
      medication: 'Azithromycin',
      dosage: '250mg once daily for 5 days',
      rationale: 'Macrolide antibiotic safe for patients with Penicillin allergy',
    });
  }

  return alternatives;
}
