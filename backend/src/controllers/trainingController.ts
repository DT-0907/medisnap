// src/controllers/trainingController.ts
import { generateResponse } from '../services/geminiService';
import { initSession, addMessage } from '../services/lettaService';
import { generateTTS } from '../services/fishAudioService';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface StartTrainingInput {
  procedure: string;
  user_id: string;
}

export interface StartTrainingResult {
  success: boolean;
  session_id?: string;
  message?: string;
  audio_url?: string;
  error?: string;
}

export interface ProcessFeedbackInput {
  session_id: string;
  pulse_count: number;
  duration_seconds: number;
}

export interface ProcessFeedbackResult {
  success: boolean;
  bpm?: number;
  assessment?: 'normal' | 'elevated' | 'low';
  message?: string;
  technique_feedback?: string;
  audio_url?: string;
  error?: string;
}

// ============================================
// START TRAINING
// ============================================

/**
 * Initialize training session
 * Per FR-5, FR-8
 */
export async function startTraining(
  input: StartTrainingInput
): Promise<StartTrainingResult> {
  try {
    const { procedure } = input;

    // Validate procedure
    if (procedure !== 'pulse_taking') {
      return {
        success: false,
        error: 'Invalid procedure. Only pulse_taking is supported.',
      };
    }

    // Initialize Letta session for context management
    const session_id = initSession();

    // Generate welcome message per FR-8 (Prompt #1)
    const welcomeMessage =
      'Starting pulse taking training. Locate your patient\'s radial artery on the wrist.';

    // Add to context
    addMessage(session_id, { role: 'system', content: welcomeMessage });

    // Generate TTS audio
    const audio_url = await generateTTS(welcomeMessage);

    return {
      success: true,
      session_id,
      message: welcomeMessage,
      audio_url,
    };
  } catch (error) {
    console.error('Error in startTraining:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================
// PROCESS FEEDBACK
// ============================================

/**
 * Calculate BPM and provide technique feedback
 * Per FR-8 (Prompt #6)
 */
export async function processFeedback(
  input: ProcessFeedbackInput
): Promise<ProcessFeedbackResult> {
  try {
    const { session_id, pulse_count, duration_seconds } = input;

    // Calculate BPM
    const bpm = Math.round((pulse_count / duration_seconds) * 60);

    // Assess range (Normal: 60-100 BPM)
    let assessment: 'normal' | 'elevated' | 'low';
    let rangeMessage: string;

    if (bpm >= 60 && bpm <= 100) {
      assessment = 'normal';
      rangeMessage = 'Normal range';
    } else if (bpm > 100) {
      assessment = 'elevated';
      rangeMessage = 'Elevated. May indicate stress or exertion.';
    } else {
      assessment = 'low';
      rangeMessage = 'Below normal. Recheck placement.';
    }

    // Generate technique feedback using Gemini
    const techniqueFeedback = await generateTechniqueFeedback(bpm, assessment);

    // Add to Letta context
    addMessage(session_id, {
      role: 'user',
      content: `Pulse count: ${pulse_count} in ${duration_seconds} seconds`,
    });
    addMessage(session_id, {
      role: 'assistant',
      content: `${rangeMessage} ${techniqueFeedback}`,
    });

    // Construct full message
    const fullMessage = `Recording ${bpm} beats per minute. ${rangeMessage} ${techniqueFeedback}`;

    // Generate TTS
    const audio_url = await generateTTS(fullMessage);

    return {
      success: true,
      bpm,
      assessment,
      message: fullMessage,
      technique_feedback: techniqueFeedback,
      audio_url,
    };
  } catch (error) {
    console.error('Error in processFeedback:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Generate personalized technique feedback using Gemini
 */
async function generateTechniqueFeedback(
  bpm: number,
  assessment: 'normal' | 'elevated' | 'low'
): Promise<string> {
  try {
    const prompt = `You are providing feedback to a nursing student who just measured a radial pulse at ${bpm} BPM (${assessment} range).

Provide brief, encouraging technique feedback in 1-2 sentences. Focus on:
- Acknowledgment of their measurement
- Brief encouragement or corrective advice if needed
- Maintain a calm, professional teaching tone

Keep response under 30 words.`;

    const feedback = await generateResponse(prompt);
    return feedback.trim();
  } catch (error) {
    // Fallback feedback
    if (assessment === 'normal') {
      return 'Good technique. Your placement and pressure were appropriate.';
    } else if (assessment === 'elevated') {
      return 'Ensure proper positioning and try again to confirm the reading.';
    } else {
      return 'Check finger placement - you may need slightly firmer pressure.';
    }
  }
}
