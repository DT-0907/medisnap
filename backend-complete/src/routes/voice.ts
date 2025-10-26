// src/routes/voice.ts
import { Router, Request, Response } from 'express';
import { extractIntent } from '../services/geminiService';

const router = Router();

/**
 * POST /api/voice/command
 * Extract intent from voice command transcription
 * Per Task 3.11.10
 */
router.post('/command', async (req: Request, res: Response) => {
  try {
    const { transcription, context } = req.body;

    // Validation
    if (!transcription) {
      return res.status(400).json({
        success: false,
        error: 'transcription is required',
      });
    }

    // Extract intent using Gemini
    const intentResult = await extractIntent(transcription, context);

    return res.status(200).json({
      success: true,
      ...intentResult,
    });
  } catch (error) {
    console.error('Error in /api/voice/command:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

export default router;
