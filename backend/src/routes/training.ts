// src/routes/training.ts
import { Router, Request, Response } from 'express';
import {
  startTraining,
  processFeedback,
} from '../controllers/trainingController';

const router = Router();

/**
 * POST /api/training/start
 * Initialize training session
 */
router.post('/start', async (req: Request, res: Response) => {
  try {
    const { procedure, user_id } = req.body;

    // Validation
    if (!procedure) {
      return res.status(400).json({
        success: false,
        error: 'procedure is required',
      });
    }

    if (!user_id) {
      return res.status(400).json({
        success: false,
        error: 'user_id is required',
      });
    }

    const result = await startTraining({ procedure, user_id });

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error in /api/training/start:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * POST /api/training/feedback
 * Process pulse count and provide feedback
 */
router.post('/feedback', async (req: Request, res: Response) => {
  try {
    const { session_id, pulse_count, duration_seconds } = req.body;

    // Validation
    if (!session_id) {
      return res.status(400).json({
        success: false,
        error: 'session_id is required',
      });
    }

    if (typeof pulse_count !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'pulse_count must be a number',
      });
    }

    if (typeof duration_seconds !== 'number' || duration_seconds <= 0) {
      return res.status(400).json({
        success: false,
        error: 'duration_seconds must be a positive number',
      });
    }

    const result = await processFeedback({
      session_id,
      pulse_count,
      duration_seconds,
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error in /api/training/feedback:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

export default router;
