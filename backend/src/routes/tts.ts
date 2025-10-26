// src/routes/tts.ts
import { Router, Request, Response } from 'express';
import { generateTTS } from '../services/fishAudioService';

const router = Router();

/**
 * POST /api/tts/generate
 * Generate TTS audio from text with caching
 * Per Task 3.11.10, FR-44, FR-44a
 */
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { text } = req.body;

    // Validation
    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'text is required',
      });
    }

    // Generate TTS (fishAudioService handles caching internally)
    const audio_url = await generateTTS(text);

    return res.status(200).json({
      success: true,
      audio_url,
    });
  } catch (error) {
    console.error('Error in /api/tts/generate:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

export default router;
