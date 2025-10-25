// src/routes/clinical.ts
import { Router, Request, Response } from 'express';
import {
  loadPatient,
  recordSymptom,
  getDecisionSupport,
} from '../controllers/clinicalController';
import { createPrescriptionController } from '../controllers/prescriptionController';

const router = Router();

/**
 * POST /api/clinical/patient/load
 * Load patient record by name
 */
router.post('/patient/load', async (req: Request, res: Response) => {
  try {
    const { patient_name } = req.body;

    // Validation
    if (!patient_name) {
      return res.status(400).json({
        success: false,
        error: 'patient_name is required',
      });
    }

    const result = await loadPatient({ patient_name });

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error in /api/clinical/patient/load:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * POST /api/clinical/symptom/record
 * Record symptom to session
 */
router.post('/symptom/record', async (req: Request, res: Response) => {
  try {
    const { session_id, patient_id, symptom } = req.body;

    // Validation
    if (!session_id) {
      return res.status(400).json({
        success: false,
        error: 'session_id is required',
      });
    }

    if (!patient_id) {
      return res.status(400).json({
        success: false,
        error: 'patient_id is required',
      });
    }

    if (!symptom) {
      return res.status(400).json({
        success: false,
        error: 'symptom is required',
      });
    }

    const result = await recordSymptom({ session_id, patient_id, symptom });

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error in /api/clinical/symptom/record:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * POST /api/clinical/decision-support
 * Get AI diagnosis suggestions
 */
router.post('/decision-support', async (req: Request, res: Response) => {
  try {
    const {
      session_id,
      patient_id,
      symptoms,
      vital_signs,
      current_medications,
    } = req.body;

    // Validation
    if (!session_id) {
      return res.status(400).json({
        success: false,
        error: 'session_id is required',
      });
    }

    if (!patient_id) {
      return res.status(400).json({
        success: false,
        error: 'patient_id is required',
      });
    }

    if (!symptoms || !Array.isArray(symptoms)) {
      return res.status(400).json({
        success: false,
        error: 'symptoms must be an array',
      });
    }

    const result = await getDecisionSupport({
      session_id,
      patient_id,
      symptoms,
      vital_signs,
      current_medications,
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error in /api/clinical/decision-support:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * POST /api/clinical/prescription/create
 * Create prescription with safety checks
 */
router.post('/prescription/create', async (req: Request, res: Response) => {
  try {
    const { patient_id, medication, dosage } = req.body;

    // Validation
    if (!patient_id) {
      return res.status(400).json({
        success: false,
        error: 'patient_id is required',
      });
    }

    if (!medication) {
      return res.status(400).json({
        success: false,
        error: 'medication is required',
      });
    }

    if (!dosage) {
      return res.status(400).json({
        success: false,
        error: 'dosage is required',
      });
    }

    const result = await createPrescriptionController({
      patient_id,
      medication,
      dosage,
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error in /api/clinical/prescription/create:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

export default router;
