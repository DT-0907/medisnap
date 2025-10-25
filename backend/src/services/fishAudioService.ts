// src/services/fishAudioService.ts
import axios from 'axios';
import { get as getCachedResponse, set as setCachedResponse } from '../utils/responseCache';

// ============================================
// ERROR CLASS
// ============================================

export class FishAudioServiceError extends Error {
  constructor(message: string, public originalError?: unknown) {
    super(message);
    this.name = 'FishAudioServiceError';
  }
}

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface Voice {
  id: string;
  name: string;
  language: string;
  gender: string;
}

// ============================================
// CONFIGURATION
// ============================================

const FISH_AUDIO_API_URL = 'https://api.fish.audio/v1/tts';
const DEMO_AUDIO_URL = 'https://example.com/demo-audio.mp3';

function getApiKey(): string {
  if (!process.env.FISH_AUDIO_API_KEY) {
    throw new FishAudioServiceError('FISH_AUDIO_API_KEY environment variable is not set');
  }
  return process.env.FISH_AUDIO_API_KEY;
}

// ============================================
// VOICE SELECTION
// ============================================

/**
 * Select appropriate voice for medical context
 * Per PRD Voice-1: Professional, calm, female voice
 * @returns Voice configuration
 */
export function selectVoice(): Voice {
  return {
    id: 'medical-professional-001',
    name: 'Professional Medical Assistant',
    language: 'en-US',
    gender: 'female',
  };
}

// ============================================
// TTS GENERATION
// ============================================

/**
 * Generate TTS audio from text
 * Per FR-44: Target < 1.5 seconds
 * Per FR-44a: Check cache first
 * @param text - Text to convert to speech
 * @returns Audio URL
 */
export async function generateTTS(text: string): Promise<string> {
  try {
    // Validation
    if (!text || text.trim() === '') {
      throw new FishAudioServiceError('Text cannot be empty');
    }

    // Check cache first (FR-44a)
    const cached = getCachedResponse(text);
    if (cached) {
      return cached;
    }

    let audioUrl: string;

    // Demo mode
    if (process.env.DEMO_MODE === 'true') {
      audioUrl = `${DEMO_AUDIO_URL}?text=${encodeURIComponent(text.substring(0, 20))}`;
    } else {
      // Get API key
      const apiKey = getApiKey();

      // Select voice
      const voice = selectVoice();

      // Call Fish Audio API
      const response = await axios.post(
        FISH_AUDIO_API_URL,
        {
          text,
          voice_id: voice.id,
          format: 'mp3',
          sample_rate: 24000,
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 3000, // 3 second timeout
        }
      );

      // Extract audio URL from response
      audioUrl = response.data.audio_url || response.data.url;

      if (!audioUrl) {
        throw new FishAudioServiceError('No audio URL in API response');
      }
    }

    // Cache the result (FR-44a)
    setCachedResponse(text, audioUrl);

    return audioUrl;
  } catch (error) {
    if (error instanceof FishAudioServiceError) {
      throw error;
    }

    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || error.message;
      throw new FishAudioServiceError(`Fish Audio API error: ${message}`, error);
    }

    throw new FishAudioServiceError('Failed to generate TTS', error);
  }
}

/**
 * Get cached TTS audio URL
 * @param text - Text to look up
 * @returns Cached audio URL or null
 */
export async function getCachedTTS(text: string): Promise<string | null> {
  return getCachedResponse(text);
}

/**
 * Pre-generate TTS for common phrases (FR-44a)
 * Call this on server startup
 */
export async function preGenerateCommonPhrases(): Promise<void> {
  const commonPhrases = [
    'Patient loaded',
    'Recording symptom',
    'Prescription logged',
    'Patient not found. Please repeat patient name.',
    'Starting pulse taking training',
    'Wrist detected',
    'Good position',
    'Time',
    'Training complete',
    'Assessment complete',
  ];

  console.log('Pre-generating TTS for common phrases...');

  for (const phrase of commonPhrases) {
    try {
      await generateTTS(phrase);
    } catch (error) {
      console.error(`Failed to pre-generate TTS for "${phrase}":`, error);
    }
  }

  console.log('TTS pre-generation complete');
}
