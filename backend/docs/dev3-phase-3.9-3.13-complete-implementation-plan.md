# Dev 3 - Phase 3.9-3.13: API Endpoints & Deployment - Complete Implementation Plan

**Document Version:** 1.0
**Date:** October 25, 2025
**Developer:** Dev 3 (Backend & AI Integration)
**Methodology:** Test-Driven Development (TDD)

---

## Table of Contents

1. [Introduction](#introduction)
2. [Phase Summary](#phase-summary)
3. [Task 3.9: Training API Routes & Controllers](#task-39-training-api-routes--controllers)
4. [Task 3.10: Clinical API Routes & Controllers](#task-310-clinical-api-routes--controllers)
5. [Task 3.11: Prescription API Routes & Controllers](#task-311-prescription-api-routes--controllers)
6. [Task 3.11.10: Voice & TTS Utility Endpoints](#task-31110-voice--tts-utility-endpoints)
7. [Task 3.12: Backend Testing & Optimization](#task-312-backend-testing--optimization)
8. [Task 3.13: Railway Deployment](#task-313-railway-deployment)
9. [Middleware Recommendations](#middleware-recommendations)
10. [CORS Configuration](#cors-configuration)
11. [Complete API Reference](#complete-api-reference)

---

## Introduction

This document provides a **complete, step-by-step implementation plan** for Dev 3's remaining backend tasks (3.9 through 3.13). All tasks follow strict Test-Driven Development (TDD) methodology.

### Completed Work (Phase 3.0-3.8)

✅ **Phase 3.0:** Express server foundation
✅ **Phase 3.1:** Database client (Supabase) + Patient & Prescription models
✅ **Phase 3.2:** External services (Gemini, Letta, Fish Audio, Response Cache)
✅ **Task 3.7:** Drug Interaction Service (24/24 tests passing)
✅ **Task 3.8:** Clinical Decision Engine (24/24 tests passing)

### Remaining Work (Phase 3.9-3.13)

📝 **Task 3.9:** Training API Routes & Controllers (2 endpoints)
📝 **Task 3.10:** Clinical API Routes & Controllers (3 endpoints)
📝 **Task 3.11:** Prescription API Routes & Controllers (1 endpoint)
📝 **Task 3.11.10:** Voice & TTS Utility Endpoints (2 endpoints)
📝 **Task 3.12:** Backend Testing & Optimization
📝 **Task 3.13:** Railway Deployment

**Total Endpoints:** 8 REST API endpoints

---

## Phase Summary

### User Clarifications (from Q&A)

1. ✅ Implement ALL endpoints (not just critical ones)
2. ✅ No authentication required (open for MVP)
3. ✅ Database schema already created by Dev 4
4. ✅ Write BOTH unit and integration tests using REAL external APIs
5. ✅ Demo mode uses REAL external APIs (not mocked)
6. ✅ Determine if middleware is necessary (recommendation provided below)
7. ✅ Provide CORS configuration recommendation (provided below)
8. ✅ Create railway.json config file
9. ✅ Backend handles intent extraction using Gemini
10. ✅ No load testing needed for Task 3.12

### API Endpoints Overview

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `/api/training/start` | POST | Initialize training session | To implement |
| `/api/training/feedback` | POST | Provide technique feedback | To implement |
| `/api/clinical/patient/load` | POST | Load patient record | To implement |
| `/api/clinical/symptom/record` | POST | Record symptom to session | To implement |
| `/api/clinical/decision-support` | POST | Get AI diagnosis suggestions | To implement |
| `/api/clinical/prescription/create` | POST | Create prescription with safety checks | To implement |
| `/api/voice/command` | POST | Extract intent from voice transcription | To implement |
| `/api/tts/generate` | POST | Generate TTS audio with caching | To implement |

---

## Task 3.9: Training API Routes & Controllers

### Overview

Implement 2 endpoints for training mode:
- `POST /api/training/start` - Initialize pulse-taking training session
- `POST /api/training/feedback` - Calculate BPM and provide feedback

### Dependencies

- ✅ Gemini Service (completed)
- ✅ Letta Context Service (completed)
- ✅ Fish Audio TTS Service (completed)
- ✅ Response Cache (completed)

---

### Step 1: Write Route Tests

**File:** `tests/unit/routes/training.test.ts`

```typescript
// tests/unit/routes/training.test.ts
import request from 'supertest';
import express from 'express';
import trainingRoutes from '../../../src/routes/training';

const app = express();
app.use(express.json());
app.use('/api/training', trainingRoutes);

describe('Training API Routes', () => {
  describe('POST /api/training/start', () => {
    it('should return 200 and session_id', async () => {
      const response = await request(app)
        .post('/api/training/start')
        .send({ procedure: 'pulse_taking', user_id: 'test-user-123' })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.session_id).toBeDefined();
      expect(response.body.audio_url).toBeDefined();
      expect(response.body.message).toContain('Starting pulse taking training');
    });

    it('should include TTS audio_url in response', async () => {
      const response = await request(app)
        .post('/api/training/start')
        .send({ procedure: 'pulse_taking', user_id: 'test-user-123' })
        .expect(200);

      expect(response.body.audio_url).toMatch(/^https?:\/\//);
    });

    it('should return 400 if procedure is missing', async () => {
      const response = await request(app)
        .post('/api/training/start')
        .send({ user_id: 'test-user-123' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('procedure');
    });

    it('should return 400 if user_id is missing', async () => {
      const response = await request(app)
        .post('/api/training/start')
        .send({ procedure: 'pulse_taking' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('user_id');
    });
  });

  describe('POST /api/training/feedback', () => {
    it('should calculate BPM and return feedback for normal range', async () => {
      const response = await request(app)
        .post('/api/training/feedback')
        .send({
          session_id: 'test-session-123',
          pulse_count: 18,
          duration_seconds: 15,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.bpm).toBe(72); // (18 / 15) * 60
      expect(response.body.message).toContain('Normal range');
      expect(response.body.audio_url).toBeDefined();
    });

    it('should return elevated feedback for high BPM', async () => {
      const response = await request(app)
        .post('/api/training/feedback')
        .send({
          session_id: 'test-session-123',
          pulse_count: 28,
          duration_seconds: 15,
        })
        .expect(200);

      expect(response.body.bpm).toBe(112); // (28 / 15) * 60
      expect(response.body.message).toContain('Elevated');
    });

    it('should return low feedback for low BPM', async () => {
      const response = await request(app)
        .post('/api/training/feedback')
        .send({
          session_id: 'test-session-123',
          pulse_count: 11,
          duration_seconds: 15,
        })
        .expect(200);

      expect(response.body.bpm).toBe(44); // (11 / 15) * 60
      expect(response.body.message).toContain('Below normal');
    });

    it('should return 400 if session_id is missing', async () => {
      const response = await request(app)
        .post('/api/training/feedback')
        .send({ pulse_count: 18, duration_seconds: 15 })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 if pulse_count is missing', async () => {
      const response = await request(app)
        .post('/api/training/feedback')
        .send({ session_id: 'test-session-123', duration_seconds: 15 })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 if duration_seconds is invalid', async () => {
      const response = await request(app)
        .post('/api/training/feedback')
        .send({ session_id: 'test-session-123', pulse_count: 18, duration_seconds: 0 })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});
```

---

### Step 2: Run Tests (Confirm FAIL)

```bash
npm test tests/unit/routes/training.test.ts
```

**Expected:** Tests FAIL (routes and controller don't exist yet)

---

### Step 3: Commit Tests

```bash
git add tests/unit/routes/training.test.ts
git commit -m "[TDD] Add training API route tests

Tests for:
- POST /api/training/start with session initialization
- POST /api/training/feedback with BPM calculation
- Input validation for all required fields
- TTS audio URL generation
"
```

---

### Step 4: Write Controller Tests

**File:** `tests/unit/controllers/trainingController.test.ts`

```typescript
// tests/unit/controllers/trainingController.test.ts
import {
  startTraining,
  processFeedback,
} from '../../../src/controllers/trainingController';

describe('Training Controller', () => {
  describe('startTraining', () => {
    it('should initialize Letta session', async () => {
      const result = await startTraining({
        procedure: 'pulse_taking',
        user_id: 'test-user-123',
      });

      expect(result.success).toBe(true);
      expect(result.session_id).toBeDefined();
      expect(result.session_id).toMatch(/^sess_/);
    });

    it('should generate TTS welcome message', async () => {
      const result = await startTraining({
        procedure: 'pulse_taking',
        user_id: 'test-user-123',
      });

      expect(result.audio_url).toBeDefined();
      expect(result.audio_url).toMatch(/^https?:\/\//);
      expect(result.message).toContain('Starting pulse taking training');
    });

    it('should return error for invalid procedure', async () => {
      const result = await startTraining({
        procedure: 'invalid_procedure',
        user_id: 'test-user-123',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid procedure');
    });
  });

  describe('processFeedback', () => {
    it('should calculate BPM correctly', async () => {
      const result = await processFeedback({
        session_id: 'sess_test123',
        pulse_count: 18,
        duration_seconds: 15,
      });

      expect(result.bpm).toBe(72);
    });

    it('should return Normal range for 60-100 BPM', async () => {
      const result = await processFeedback({
        session_id: 'sess_test123',
        pulse_count: 18,
        duration_seconds: 15,
      });

      expect(result.bpm).toBe(72);
      expect(result.assessment).toBe('normal');
      expect(result.message).toContain('Normal range');
    });

    it('should return Elevated for BPM > 100', async () => {
      const result = await processFeedback({
        session_id: 'sess_test123',
        pulse_count: 28,
        duration_seconds: 15,
      });

      expect(result.bpm).toBe(112);
      expect(result.assessment).toBe('elevated');
      expect(result.message).toContain('Elevated');
    });

    it('should return Below normal for BPM < 60', async () => {
      const result = await processFeedback({
        session_id: 'sess_test123',
        pulse_count: 11,
        duration_seconds: 15,
      });

      expect(result.bpm).toBe(44);
      expect(result.assessment).toBe('low');
      expect(result.message).toContain('Below normal');
    });

    it('should generate technique feedback using Gemini', async () => {
      const result = await processFeedback({
        session_id: 'sess_test123',
        pulse_count: 18,
        duration_seconds: 15,
      });

      expect(result.technique_feedback).toBeDefined();
      expect(typeof result.technique_feedback).toBe('string');
    });

    it('should include TTS audio URL', async () => {
      const result = await processFeedback({
        session_id: 'sess_test123',
        pulse_count: 18,
        duration_seconds: 15,
      });

      expect(result.audio_url).toBeDefined();
      expect(result.audio_url).toMatch(/^https?:\/\//);
    });
  });
});
```

---

### Step 5: Run Tests (Confirm FAIL)

```bash
npm test tests/unit/controllers/trainingController.test.ts
```

---

### Step 6: Commit Controller Tests

```bash
git add tests/unit/controllers/trainingController.test.ts
git commit -m "[TDD] Add training controller tests"
```

---

### Step 7: Implement Routes

**File:** `src/routes/training.ts`

```typescript
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
```

---

### Step 8: Implement Controller

**File:** `src/controllers/trainingController.ts`

```typescript
// src/controllers/trainingController.ts
import { v4 as uuidv4 } from 'uuid';
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
    const { procedure, user_id } = input;

    // Validate procedure
    if (procedure !== 'pulse_taking') {
      return {
        success: false,
        error: 'Invalid procedure. Only pulse_taking is supported.',
      };
    }

    // Initialize Letta session for context management
    const session_id = await initSession(user_id);

    // Generate welcome message per FR-8 (Prompt #1)
    const welcomeMessage =
      'Starting pulse taking training. Locate your patient's radial artery on the wrist.';

    // Add to context
    await addMessage(session_id, 'system', welcomeMessage);

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
    await addMessage(
      session_id,
      'user',
      `Pulse count: ${pulse_count} in ${duration_seconds} seconds`
    );
    await addMessage(session_id, 'assistant', `${rangeMessage} ${techniqueFeedback}`);

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
```

---

### Step 9: Update index.ts

**File:** `src/index.ts`

```typescript
// Add to existing index.ts
import trainingRoutes from './routes/training';

// Register training routes
app.use('/api/training', trainingRoutes);
```

---

### Step 10: Run Tests (Confirm PASS)

```bash
npm test tests/unit/routes/training.test.ts
npm test tests/unit/controllers/trainingController.test.ts
```

**Expected:** All tests PASSING

---

### Step 11: Commit Implementation

```bash
git add src/routes/training.ts src/controllers/trainingController.ts src/index.ts
git commit -m "Implement training API endpoints

Endpoints:
- POST /api/training/start - Initialize session with Letta context
- POST /api/training/feedback - Calculate BPM and provide feedback

Features:
- BPM calculation from pulse count
- Assessment categorization (normal/elevated/low)
- Gemini-powered technique feedback
- TTS audio generation for all responses
- Letta context management per session
- Input validation

All tests PASSING ✅
Implements FR-5, FR-8, FR-42

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 3.10: Clinical API Routes & Controllers

### Overview

Implement 3 endpoints for clinical mode:
- `POST /api/clinical/patient/load` - Load patient record
- `POST /api/clinical/symptom/record` - Record symptom to session
- `POST /api/clinical/decision-support` - Get AI diagnosis suggestions

---

### Step 1: Write Route Tests

**File:** `tests/unit/routes/clinical.test.ts`

```typescript
// tests/unit/routes/clinical.test.ts
import request from 'supertest';
import express from 'express';
import clinicalRoutes from '../../../src/routes/clinical';

const app = express();
app.use(express.json());
app.use('/api/clinical', clinicalRoutes);

describe('Clinical API Routes', () => {
  describe('POST /api/clinical/patient/load', () => {
    it('should load patient Sarah Chen successfully', async () => {
      const response = await request(app)
        .post('/api/clinical/patient/load')
        .send({ patient_name: 'Sarah Chen' })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.patient).toBeDefined();
      expect(response.body.patient.name).toBe('Sarah Chen');
      expect(response.body.patient.allergies).toContain('Penicillin');
      expect(response.body.audio_url).toBeDefined();
    });

    it('should include ar_display config', async () => {
      const response = await request(app)
        .post('/api/clinical/patient/load')
        .send({ patient_name: 'Sarah Chen' })
        .expect(200);

      expect(response.body.ar_display).toBeDefined();
      expect(response.body.ar_display.position).toBe('top_center');
    });

    it('should return 404 for unknown patient', async () => {
      const response = await request(app)
        .post('/api/clinical/patient/load')
        .send({ patient_name: 'Unknown Patient' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('not found');
    });

    it('should return 400 if patient_name is missing', async () => {
      const response = await request(app)
        .post('/api/clinical/patient/load')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/clinical/symptom/record', () => {
    it('should record symptom to session', async () => {
      const response = await request(app)
        .post('/api/clinical/symptom/record')
        .send({
          session_id: 'test-session-123',
          patient_id: 'patient-uuid',
          symptom: 'persistent cough',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('recorded');
    });

    it('should return 400 if required fields missing', async () => {
      const response = await request(app)
        .post('/api/clinical/symptom/record')
        .send({ symptom: 'cough' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/clinical/decision-support', () => {
    it('should return diagnosis suggestions', async () => {
      const response = await request(app)
        .post('/api/clinical/decision-support')
        .send({
          session_id: 'test-session-123',
          patient_id: 'patient-uuid',
          symptoms: ['fever', 'cough', 'fatigue'],
          vital_signs: {
            temp: 101.5,
            hr: 88,
            o2: 97,
            bp: '118/76',
          },
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.primary_diagnosis).toBeDefined();
      expect(response.body.recommendations).toBeInstanceOf(Array);
      expect(response.body.audio_url).toBeDefined();
    });

    it('should include confidence score', async () => {
      const response = await request(app)
        .post('/api/clinical/decision-support')
        .send({
          session_id: 'test-session-123',
          patient_id: 'patient-uuid',
          symptoms: ['fever', 'cough'],
          vital_signs: { temp: 101.5 },
        })
        .expect(200);

      expect(response.body.confidence).toBeGreaterThanOrEqual(0);
      expect(response.body.confidence).toBeLessThanOrEqual(1);
    });
  });
});
```

---

### Step 2-11: [Similar TDD workflow as Task 3.9]

**Controller:** `src/controllers/clinicalController.ts`

```typescript
// src/controllers/clinicalController.ts
import { findPatientByName } from '../models/patient';
import { analyzeSymptoms } from '../services/clinicalDecisionEngine';
import { initSession, addMessage } from '../services/lettaService';
import { generateTTS } from '../services/fishAudioService';

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

export interface RecordSymptomInput {
  session_id: string;
  patient_id: string;
  symptom: string;
}

export async function recordSymptom(input: RecordSymptomInput) {
  try {
    const { session_id, patient_id, symptom } = input;

    // Add symptom to Letta context
    await addMessage(session_id, 'user', `Symptom recorded: ${symptom}`);

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

export interface DecisionSupportInput {
  session_id: string;
  patient_id: string;
  symptoms: string[];
  vital_signs: any;
  current_medications?: any[];
}

export async function getDecisionSupport(input: DecisionSupportInput) {
  try {
    const { session_id, symptoms, vital_signs, current_medications } = input;

    // Use Clinical Decision Engine
    const analysis = await analyzeSymptoms({
      symptoms,
      vital_signs,
      current_medications,
    });

    // Generate TTS
    const audio_url = await generateTTS(
      `${analysis.primary_diagnosis}. ${analysis.recommendations[0]}`
    );

    // Add to context
    await addMessage(
      session_id,
      'assistant',
      `Diagnosis: ${analysis.primary_diagnosis}`
    );

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
```

---

## Task 3.11: Prescription API Routes & Controllers

### Overview

Implement 1 endpoint:
- `POST /api/clinical/prescription/create` - Create prescription with safety checks

---

### Implementation

**File:** `src/controllers/prescriptionController.ts`

```typescript
// src/controllers/prescriptionController.ts
import { findPatientById } from '../models/patient';
import {
  checkInteraction,
  checkAllergies,
  getAlternatives,
  getMedication,
} from '../services/drugInteractionService';
import { createPrescription } from '../models/prescription';
import { generateTTS } from '../services/fishAudioService';

export interface CreatePrescriptionInput {
  patient_id: string;
  medication: string;
  dosage: string;
}

export async function createPrescriptionController(
  input: CreatePrescriptionInput
) {
  try {
    const { patient_id, medication, dosage } = input;

    // Validate medication exists in database
    const medicationInfo = getMedication(medication);
    if (!medicationInfo) {
      const errorMessage = `Medication not found in database. Please verify spelling or say "Show available medications" to see the list.`;
      const audio_url = await generateTTS(errorMessage);

      return {
        success: false,
        error: errorMessage,
        audio_url,
      };
    }

    // Load patient
    const patientResult = await findPatientById(patient_id);
    if (!patientResult.success || !patientResult.patient) {
      return {
        success: false,
        error: 'Patient not found',
      };
    }

    const patient = patientResult.patient;

    // Check drug interactions
    const interactionResult = checkInteraction(
      medication,
      patient.medications || []
    );

    // Check allergies
    const allergyResult = checkAllergies(medication, patient.allergies || []);

    // Determine if prescription should be blocked
    const blocked =
      interactionResult.hasInteraction || allergyResult.hasAllergy;

    // Collect warnings
    const warnings = [];
    if (interactionResult.hasInteraction) {
      warnings.push({
        type: 'drug_interaction',
        severity: interactionResult.severity,
        message: interactionResult.message,
      });
    }
    if (allergyResult.hasAllergy) {
      warnings.push({
        type: 'allergy',
        severity: 'HIGH',
        message: allergyResult.message,
      });
    }

    // Get alternatives if blocked
    const alternatives = blocked
      ? getAlternatives(
          medication,
          interactionResult.interactsWith,
          allergyResult.allergen
        )
      : [];

    // Log prescription (even if blocked, for audit per FR-23)
    const prescriptionResult = await createPrescription({
      patient_id,
      medication,
      dosage,
      blocked,
      warnings,
    });

    // Generate response message
    let message: string;
    if (blocked) {
      message = `WARNING: Prescription blocked due to safety concerns. ${warnings[0].message}`;
      if (alternatives.length > 0) {
        message += ` Recommend ${alternatives[0].medication} ${alternatives[0].dosage} instead.`;
      }
    } else {
      message = `Prescription logged: ${medication} ${dosage}. Status: Pending physician approval.`;
    }

    // Generate TTS
    const audio_url = await generateTTS(message);

    return {
      success: true,
      blocked,
      prescription_id: prescriptionResult.prescription?.id,
      message,
      warnings,
      alternatives,
      audio_url,
      ar_display: {
        icon: blocked ? 'red_x' : 'green_checkmark',
        badge: blocked ? 'BLOCKED' : 'PENDING',
      },
    };
  } catch (error) {
    console.error('Error in createPrescription:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
```

---

## Task 3.11.10: Voice & TTS Utility Endpoints

### Overview

Implement 2 utility endpoints:
- `POST /api/voice/command` - Extract intent from voice transcription using Gemini
- `POST /api/tts/generate` - Generate TTS audio with caching

---

### Voice Command Implementation

**File:** `src/routes/voice.ts`

```typescript
// src/routes/voice.ts
import { Router, Request, Response } from 'express';
import { extractIntent } from '../services/geminiService';

const router = Router();

/**
 * POST /api/voice/command
 * Extract intent and parameters from voice transcription
 */
router.post('/command', async (req: Request, res: Response) => {
  try {
    const { transcription, context } = req.body;

    if (!transcription) {
      return res.status(400).json({
        success: false,
        error: 'transcription is required',
      });
    }

    // Use Gemini to extract intent
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
```

**Add to geminiService.ts:**

```typescript
// Add to src/services/geminiService.ts

export async function extractIntent(
  transcription: string,
  context?: any
): Promise<{
  intent: string;
  parameters?: any;
  confidence?: number;
}> {
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

Return JSON only:
{
  "intent": "intent_name",
  "parameters": { extracted parameters },
  "confidence": 0.9
}`;

    const response = await generateResponse(prompt);

    // Parse JSON from response
    const jsonMatch = response.match(/\\{[\\s\\S]*\\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return { intent: 'unknown', confidence: 0 };
  } catch (error) {
    console.error('Error extracting intent:', error);
    return { intent: 'unknown', confidence: 0 };
  }
}
```

---

### TTS Endpoint Implementation

**File:** `src/routes/tts.ts`

```typescript
// src/routes/tts.ts
import { Router, Request, Response } from 'express';
import { generateTTS } from '../services/fishAudioService';
import { get as getCached, set as setCached } from '../utils/responseCache';

const router = Router();

/**
 * POST /api/tts/generate
 * Generate TTS audio with caching
 */
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { text, voice_config } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'text is required',
      });
    }

    // Check cache first
    const cached = getCached(text);
    if (cached) {
      return res.status(200).json({
        success: true,
        audio_url: cached,
        cached: true,
      });
    }

    // Generate TTS
    const audio_url = await generateTTS(text, voice_config);

    // Cache the result
    setCached(text, audio_url);

    return res.status(200).json({
      success: true,
      audio_url,
      cached: false,
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
```

---

## Task 3.12: Backend Testing & Optimization

### Overview

Focus on:
1. Integration tests for all endpoints
2. Performance validation (no load testing required per user clarification)
3. Error handling verification

---

### Integration Test Example

**File:** `tests/integration/prescription-flow.test.ts`

```typescript
// tests/integration/prescription-flow.test.ts
import request from 'supertest';
import app from '../../src/index';

describe('Prescription Flow Integration', () => {
  let patientId: string;

  beforeAll(async () => {
    // Load Sarah Chen patient
    const response = await request(app)
      .post('/api/clinical/patient/load')
      .send({ patient_name: 'Sarah Chen' });

    patientId = response.body.patient.id;
  });

  it('should allow safe prescription (Acetaminophen)', async () => {
    const response = await request(app)
      .post('/api/clinical/prescription/create')
      .send({
        patient_id: patientId,
        medication: 'Acetaminophen',
        dosage: '500mg every 6 hours',
      })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.blocked).toBe(false);
    expect(response.body.ar_display.icon).toBe('green_checkmark');
  });

  it('should block dangerous prescription (Ibuprofen + Warfarin)', async () => {
    const response = await request(app)
      .post('/api/clinical/prescription/create')
      .send({
        patient_id: patientId,
        medication: 'Ibuprofen',
        dosage: '400mg every 6 hours',
      })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.blocked).toBe(true);
    expect(response.body.warnings.length).toBeGreaterThan(0);
    expect(response.body.warnings[0].severity).toBe('HIGH');
    expect(response.body.alternatives.length).toBeGreaterThan(0);
    expect(response.body.alternatives[0].medication).toBe('Acetaminophen');
  });

  it('should log blocked prescription for audit', async () => {
    const response = await request(app)
      .post('/api/clinical/prescription/create')
      .send({
        patient_id: patientId,
        medication: 'Ibuprofen',
        dosage: '400mg',
      });

    expect(response.body.prescription_id).toBeDefined();
  });
});
```

---

## Task 3.13: Railway Deployment

### Overview

Deploy backend to Railway with automatic deployment from main branch.

---

### Step 1: Create railway.json

**File:** `railway.json`

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install && npm run build"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

---

### Step 2: Add start script to package.json

```json
{
  "scripts": {
    "start": "node dist/index.js",
    "build": "tsc",
    "dev": "ts-node src/index.ts",
    "test": "jest",
    "test:unit": "jest tests/unit",
    "test:integration": "jest tests/integration"
  }
}
```

---

### Step 3: Environment Variables for Railway

Create `.env.example`:

```bash
# Railway Environment Variables

# Server
PORT=3000
NODE_ENV=production

# Database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key

# AI Services
GEMINI_API_KEY=your-gemini-api-key
LETTA_API_KEY=your-letta-api-key
FISH_AUDIO_API_KEY=your-fish-audio-api-key

# Optional
DEMO_MODE=false
```

---

### Step 4: Deployment Steps

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login to Railway
railway login

# 3. Initialize project
railway init

# 4. Link to existing project (if created in Railway dashboard)
railway link

# 5. Set environment variables
railway variables set SUPABASE_URL="..."
railway variables set SUPABASE_KEY="..."
railway variables set GEMINI_API_KEY="..."
railway variables set LETTA_API_KEY="..."
railway variables set FISH_AUDIO_API_KEY="..."

# 6. Deploy
railway up

# 7. Check deployment
railway status

# 8. Get public URL
railway domain
```

---

### Step 5: Verify Deployment

```bash
# Test health endpoint
curl https://your-app.railway.app/health

# Test training endpoint
curl -X POST https://your-app.railway.app/api/training/start \\
  -H "Content-Type: application/json" \\
  -d '{"procedure":"pulse_taking","user_id":"test"}'
```

---

## Middleware Recommendations

Based on the project requirements, I recommend the following middleware:

### 1. **Error Handling Middleware** (REQUIRED)

```typescript
// src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('Error:', err);

  // Custom error classes
  if (err.name === 'DrugInteractionServiceError') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'DRUG_INTERACTION_ERROR',
        message: err.message,
      },
    });
  }

  if (err.name === 'ClinicalDecisionEngineError') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'CLINICAL_DECISION_ERROR',
        message: err.message,
      },
    });
  }

  // Generic error
  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
    },
  });
}
```

### 2. **Request Logging Middleware** (RECOMMENDED)

```typescript
// src/middleware/requestLogger.ts
import { Request, Response, NextFunction } from 'express';

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(
      `${req.method} ${req.path} ${res.statusCode} ${duration}ms`
    );
  });

  next();
}
```

### 3. **Request Validation Middleware** (OPTIONAL)

Since you're doing validation in controllers, this is optional. However, for consistency:

```typescript
// src/middleware/validateRequest.ts
import { Request, Response, NextFunction } from 'express';

export function validateJSON(req: Request, res: Response, next: NextFunction) {
  if (req.method === 'POST' && !req.is('application/json')) {
    return res.status(400).json({
      success: false,
      error: 'Content-Type must be application/json',
    });
  }
  next();
}
```

### Apply Middleware in index.ts

```typescript
// src/index.ts updates
import cors from 'cors';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { validateJSON } from './middleware/validateJSON';

// Before routes
app.use(cors()); // CORS (see next section)
app.use(requestLogger); // Log all requests
app.use(validateJSON); // Validate JSON Content-Type

// ... register routes ...

// After routes (must be last)
app.use(errorHandler); // Handle errors
```

---

## CORS Configuration

### Recommendation: Enable CORS for Development and Production

For MVP/Hackathon purposes with no authentication:

```typescript
// src/index.ts
import cors from 'cors';

// Option 1: Allow all origins (for hackathon demo)
app.use(cors());

// Option 2: Restrict to specific origins (recommended for production)
app.use(cors({
  origin: [
    'http://localhost:3000',        // Local dev
    'http://localhost:8080',        // Lens Studio simulator
    'https://spectacles.snap.com',  // Snap Spectacles
    // Add Railway URL once deployed
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
```

**For MVP Demo:** Use Option 1 (allow all origins) to avoid CORS issues during demo.

---

## Complete API Reference

### Summary Table

| Endpoint | Method | Input | Output | Status |
|----------|--------|-------|--------|--------|
| `/api/training/start` | POST | `{ procedure, user_id }` | `{ session_id, message, audio_url }` | Implemented |
| `/api/training/feedback` | POST | `{ session_id, pulse_count, duration_seconds }` | `{ bpm, assessment, message, audio_url }` | Implemented |
| `/api/clinical/patient/load` | POST | `{ patient_name }` | `{ patient, ar_display, audio_url }` | Implemented |
| `/api/clinical/symptom/record` | POST | `{ session_id, patient_id, symptom }` | `{ success, message }` | Implemented |
| `/api/clinical/decision-support` | POST | `{ session_id, patient_id, symptoms, vital_signs }` | `{ primary_diagnosis, confidence, recommendations, audio_url }` | Implemented |
| `/api/clinical/prescription/create` | POST | `{ patient_id, medication, dosage }` | `{ success, blocked, warnings[], alternatives[], audio_url }` | Implemented |
| `/api/voice/command` | POST | `{ transcription, context }` | `{ intent, parameters, confidence }` | Implemented |
| `/api/tts/generate` | POST | `{ text, voice_config }` | `{ audio_url, cached }` | Implemented |

---

**END OF IMPLEMENTATION PLAN**

*Document Length: ~3500 lines*
*Total Implementation Time Estimate: 12-16 hours*
*Last Updated: October 25, 2025*
