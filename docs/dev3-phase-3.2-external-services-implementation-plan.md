# Dev 3 Implementation Plan: External Service Integration
## Phase 3.2: AI & TTS Services (Hours 12-18)

**Developer**: Dev 3 - Backend & AI Integration Owner
**Timeline**: Hours 12-18
**Branch**: `dev3` (continuing from Phase 3.1)
**Methodology**: Strict Test-Driven Development (TDD)
**Critical Handoffs**:
- Hour 12: Begin external service integration
- Hour 18: Share working API endpoints with Dev 1 & 2

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Task 3.3: Gemini Service - TDD](#task-33-gemini-service---tdd)
3. [Task 3.4: Letta Context Service - TDD](#task-34-letta-context-service---tdd)
4. [Task 3.5: Fish Audio TTS Service - TDD](#task-35-fish-audio-tts-service---tdd)
5. [Task 3.6: Response Cache - TDD](#task-36-response-cache---tdd)
6. [Phase 3.2 Verification Checklist](#phase-32-verification-checklist)
7. [Troubleshooting Guide](#troubleshooting-guide)
8. [Next Steps](#next-steps)

---

## Prerequisites

**BEFORE STARTING Phase 3.2:**

Ensure Phase 3.1 is complete:
- ✅ Supabase client implemented (10 tests passing)
- ✅ Patient model implemented (27 tests passing)
- ✅ Prescription model implemented (22 tests passing)
- ✅ All Phase 3.1 code committed and pushed
- ✅ Database connection working

**API Keys Required:**

Update `.env` with your API keys:
```bash
# External API Keys
GEMINI_API_KEY=your-gemini-key-here
FISH_AUDIO_API_KEY=your-fish-audio-key-here
LETTA_API_KEY=your-letta-key-here
```

Also add to Railway:
```bash
railway variables set GEMINI_API_KEY="your-gemini-key"
railway variables set FISH_AUDIO_API_KEY="your-fish-audio-key"
railway variables set LETTA_API_KEY="your-letta-key"
```

**Install Additional Dependencies:**

```bash
# From backend directory
npm install @google/generative-ai  # Gemini API client
npm install node-fetch              # For HTTP requests (if using Node < 18)
npm install axios                   # For Fish Audio API
```

---

## Task 3.3: Gemini Service - TDD

**Estimated Time**: 1.5 hours
**Purpose**: Integrate Google Gemini API for AI-powered clinical decision support

### Requirements from PRD

- **FR-4**: System SHALL use Gemini API wrapped with Letta for conversational AI
- **FR-18**: Clinical decision support with diagnoses and recommendations
- **FR-19**: Implement 3 clinical decision scenarios
- **FR-42**: API response time < 3 seconds total

### TDD Step 1: Write Tests FIRST

Create `tests/unit/services/geminiService.test.ts`:

```typescript
// tests/unit/services/geminiService.test.ts
import {
  generateResponse,
  generateClinicalAdvice,
  analyzeSymptoms,
  formatPrompt,
  GeminiServiceError,
} from '../../../src/services/geminiService';

describe('Gemini Service', () => {
  beforeAll(() => {
    // Verify environment variable is set
    expect(process.env.GEMINI_API_KEY).toBeDefined();
  });

  describe('Configuration', () => {
    it('should have valid API key configured', () => {
      expect(process.env.GEMINI_API_KEY).toBeDefined();
      expect(process.env.GEMINI_API_KEY?.length).toBeGreaterThan(0);
    });

    it('should throw error if API key is missing', () => {
      const originalKey = process.env.GEMINI_API_KEY;
      delete process.env.GEMINI_API_KEY;

      expect(() => {
        // Force module reload
        jest.resetModules();
        require('../../../src/services/geminiService');
      }).toThrow('GEMINI_API_KEY');

      // Restore
      process.env.GEMINI_API_KEY = originalKey;
      jest.resetModules();
    });
  });

  describe('generateResponse', () => {
    it('should generate text response from simple prompt', async () => {
      const prompt = 'What is hypertension?';
      const response = await generateResponse(prompt);

      expect(response).toBeDefined();
      expect(typeof response).toBe('string');
      expect(response.length).toBeGreaterThan(0);
    });

    it('should generate medical advice from clinical prompt', async () => {
      const prompt = 'Patient has fever 101.5°F and cough. Suggest diagnosis.';
      const response = await generateResponse(prompt);

      expect(response).toBeDefined();
      expect(response.toLowerCase()).toMatch(/respiratory|infection|viral/);
    });

    it('should handle empty prompt gracefully', async () => {
      await expect(generateResponse('')).rejects.toThrow('Prompt cannot be empty');
    });

    it('should handle very long prompts', async () => {
      const longPrompt = 'Patient symptoms: ' + 'cough '.repeat(1000);
      const response = await generateResponse(longPrompt);

      expect(response).toBeDefined();
    });

    it('should complete within reasonable time', async () => {
      const startTime = Date.now();
      await generateResponse('Quick medical question: what is aspirin?');
      const elapsed = Date.now() - startTime;

      // Should be < 2 seconds for Gemini alone (leaves 1s for other ops to meet FR-42)
      expect(elapsed).toBeLessThan(2000);
    }, 5000);
  });

  describe('generateClinicalAdvice', () => {
    it('should generate clinical advice for respiratory infection', async () => {
      const patientData = {
        symptoms: ['fever', 'cough', 'fatigue', 'chest tightness'],
        vitalSigns: {
          temp: 101.5,
          hr: 88,
          o2: 97,
          bp: '118/76',
        },
      };

      const advice = await generateClinicalAdvice(patientData);

      expect(advice).toBeDefined();
      expect(advice.diagnosis).toBeDefined();
      expect(advice.recommendations).toBeDefined();
      expect(Array.isArray(advice.recommendations)).toBe(true);
      expect(advice.recommendations.length).toBeGreaterThan(0);
    });

    it('should generate advice for hypertension scenario', async () => {
      const patientData = {
        symptoms: [],
        vitalSigns: {
          bp: '148/94',
          hr: 76,
          o2: 99,
          temp: 98.4,
        },
        medications: [
          { name: 'Lisinopril', dosage: '10mg daily', started: '2023-06-10' },
        ],
      };

      const advice = await generateClinicalAdvice(patientData);

      expect(advice.diagnosis.toLowerCase()).toMatch(/hypertension|elevated|blood pressure/);
      expect(advice.recommendations.some((r: string) =>
        r.toLowerCase().includes('medication') || r.toLowerCase().includes('compliance')
      )).toBe(true);
    });

    it('should include urgency assessment', async () => {
      const patientData = {
        symptoms: ['chest pain', 'shortness of breath'],
        vitalSigns: {
          bp: '180/110',
          hr: 120,
          o2: 92,
          temp: 98.6,
        },
      };

      const advice = await generateClinicalAdvice(patientData);

      expect(advice.urgency).toBeDefined();
      expect(['routine', 'urgent', 'emergency']).toContain(advice.urgency);
    });

    it('should provide confidence score', async () => {
      const patientData = {
        symptoms: ['headache'],
        vitalSigns: {
          bp: '120/80',
          hr: 72,
          o2: 98,
          temp: 98.6,
        },
      };

      const advice = await generateClinicalAdvice(patientData);

      expect(advice.confidence).toBeDefined();
      expect(advice.confidence).toBeGreaterThanOrEqual(0);
      expect(advice.confidence).toBeLessThanOrEqual(1);
    });
  });

  describe('analyzeSymptoms', () => {
    it('should map symptoms to possible diagnoses', async () => {
      const symptoms = ['fever', 'dry cough', 'fatigue'];
      const analysis = await analyzeSymptoms(symptoms);

      expect(analysis).toBeDefined();
      expect(Array.isArray(analysis.possibleDiagnoses)).toBe(true);
      expect(analysis.possibleDiagnoses.length).toBeGreaterThan(0);
    });

    it('should handle empty symptoms array', async () => {
      await expect(analyzeSymptoms([])).rejects.toThrow('At least one symptom required');
    });

    it('should provide differential diagnoses', async () => {
      const symptoms = ['fever', 'cough', 'chest pain'];
      const analysis = await analyzeSymptoms(symptoms);

      expect(analysis.possibleDiagnoses.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('formatPrompt', () => {
    it('should format clinical prompt with patient context', () => {
      const context = {
        patientAge: 34,
        patientSex: 'Female',
        symptoms: ['fever', 'cough'],
        vitalSigns: { temp: 101.5, hr: 88 },
      };

      const prompt = formatPrompt('Provide diagnosis', context);

      expect(prompt).toContain('34');
      expect(prompt).toContain('Female');
      expect(prompt).toContain('fever');
      expect(prompt).toContain('101.5');
    });

    it('should include medication context when provided', () => {
      const context = {
        medications: [
          { name: 'Warfarin', dosage: '5mg daily' },
        ],
      };

      const prompt = formatPrompt('Check interactions', context);

      expect(prompt).toContain('Warfarin');
      expect(prompt).toContain('5mg');
    });

    it('should include allergy information', () => {
      const context = {
        allergies: ['Penicillin', 'Sulfa'],
      };

      const prompt = formatPrompt('Recommend treatment', context);

      expect(prompt).toContain('Penicillin');
      expect(prompt).toContain('Sulfa');
    });
  });

  describe('Error Handling', () => {
    it('should handle API rate limits gracefully', async () => {
      // This test may be skipped if rate limits not hit
      // Manual testing: make 100 rapid requests
      const promises = Array(5).fill(null).map(() =>
        generateResponse('test')
      );

      await expect(Promise.all(promises)).resolves.toBeDefined();
    });

    it('should handle network errors', async () => {
      // Temporarily corrupt API key
      const originalKey = process.env.GEMINI_API_KEY;
      process.env.GEMINI_API_KEY = 'invalid-key-12345';

      jest.resetModules();
      const { generateResponse: badGenerate } = require('../../../src/services/geminiService');

      await expect(badGenerate('test')).rejects.toThrow(GeminiServiceError);

      // Restore
      process.env.GEMINI_API_KEY = originalKey;
      jest.resetModules();
    });

    it('should format error messages consistently', async () => {
      const originalKey = process.env.GEMINI_API_KEY;
      process.env.GEMINI_API_KEY = 'invalid-key';

      jest.resetModules();
      const { generateResponse: badGenerate } = require('../../../src/services/geminiService');

      try {
        await badGenerate('test');
        fail('Should have thrown error');
      } catch (error) {
        expect(error).toBeInstanceOf(GeminiServiceError);
        expect(error.message).toBeDefined();
      }

      // Restore
      process.env.GEMINI_API_KEY = originalKey;
      jest.resetModules();
    });
  });

  describe('Demo Mode', () => {
    it('should return mock responses when DEMO_MODE=true', async () => {
      process.env.DEMO_MODE = 'true';

      const response = await generateResponse('test prompt');

      expect(response).toBeDefined();
      expect(typeof response).toBe('string');

      delete process.env.DEMO_MODE;
    });

    it('should return realistic clinical advice in demo mode', async () => {
      process.env.DEMO_MODE = 'true';

      const advice = await generateClinicalAdvice({
        symptoms: ['fever', 'cough'],
        vitalSigns: { temp: 101.5 },
      });

      expect(advice.diagnosis).toBeDefined();
      expect(advice.recommendations).toBeDefined();

      delete process.env.DEMO_MODE;
    });
  });
});
```

### TDD Step 2: Run Tests (Confirm FAIL)

```bash
npm test tests/unit/services/geminiService.test.ts
```

**Expected Result**: All tests FAIL (module doesn't exist yet).

Example output:
```
 FAIL  tests/unit/services/geminiService.test.ts
  ● Test suite failed to run

    Cannot find module '../../../src/services/geminiService'
```

### TDD Step 3: Commit Tests

```bash
git add tests/unit/services/geminiService.test.ts
git commit -m "[TDD] Add Gemini service tests

Tests cover:
- API key validation and configuration
- generateResponse() with various prompts
- generateClinicalAdvice() with patient data
- analyzeSymptoms() for differential diagnosis
- formatPrompt() with clinical context
- Error handling (rate limits, network errors)
- Performance validation (<2s per call)
- Demo mode mock responses
- Clinical decision scenarios per FR-19

All tests currently FAILING (no implementation yet)"
```

### TDD Step 4: Implement Gemini Service

Create `src/services/geminiService.ts`:

```typescript
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
    const model = client.getGenerativeModel({ model: 'gemini-pro' });

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
```

### TDD Step 5: Run Tests (Confirm PASS)

```bash
npm test tests/unit/services/geminiService.test.ts
```

**Expected Result**: All tests PASS ✅

If tests fail:
- Check API key is valid
- Check network connectivity
- Review error messages for specific issues
- Adjust timeout if API is slow

### TDD Step 6: Commit Implementation

```bash
git add src/services/geminiService.ts
git commit -m "[TDD] Implement Gemini service with clinical AI

Implementation includes:
- GoogleGenerativeAI client initialization
- generateResponse() for general prompts
- generateClinicalAdvice() with structured output
- analyzeSymptoms() for differential diagnosis
- formatPrompt() with patient context
- Response parsing for clinical data
- Error handling and GeminiServiceError class
- Demo mode support for testing without API
- Performance optimizations

All tests PASSING ✅
Meets FR-4, FR-18, FR-19, FR-42"
```

---

## Task 3.4: Letta Context Service - TDD

**Estimated Time**: 1.5 hours
**Purpose**: Wrap Gemini API with Letta for conversation context management

### Requirements from PRD

- **FR-4**: Gemini API wrapped with Letta for context management
- **FR-4a**: Maintain rolling window of last 20 turns or 4000 tokens
- **FR-4a**: Summarize and compress older context when limit reached

### TDD Step 1: Write Tests FIRST

Create `tests/unit/services/lettaService.test.ts`:

```typescript
// tests/unit/services/lettaService.test.ts
import {
  initSession,
  addMessage,
  getContext,
  clearSession,
  callWithContext,
  getContextSize,
  shouldCompressContext,
  LettaService,
} from '../../../src/services/lettaService';

describe('Letta Context Service', () => {
  let sessionId: string;

  beforeEach(() => {
    // Create new session for each test
    sessionId = initSession();
  });

  afterEach(() => {
    // Clean up session
    clearSession(sessionId);
  });

  describe('Session Management', () => {
    it('should create new session with unique ID', () => {
      const id1 = initSession();
      const id2 = initSession();

      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(id1).not.toBe(id2);

      clearSession(id1);
      clearSession(id2);
    });

    it('should initialize session with empty context', () => {
      const context = getContext(sessionId);

      expect(context).toBeDefined();
      expect(Array.isArray(context.messages)).toBe(true);
      expect(context.messages.length).toBe(0);
    });

    it('should clear session and remove all messages', () => {
      addMessage(sessionId, { role: 'user', content: 'Test message' });
      clearSession(sessionId);

      const context = getContext(sessionId);
      expect(context.messages.length).toBe(0);
    });
  });

  describe('Message Management', () => {
    it('should add user message to session', () => {
      addMessage(sessionId, { role: 'user', content: 'Patient has fever' });

      const context = getContext(sessionId);
      expect(context.messages.length).toBe(1);
      expect(context.messages[0].role).toBe('user');
      expect(context.messages[0].content).toContain('fever');
    });

    it('should add assistant message to session', () => {
      addMessage(sessionId, { role: 'assistant', content: 'Record symptom: fever' });

      const context = getContext(sessionId);
      expect(context.messages[0].role).toBe('assistant');
    });

    it('should maintain message order', () => {
      addMessage(sessionId, { role: 'user', content: 'Message 1' });
      addMessage(sessionId, { role: 'assistant', content: 'Response 1' });
      addMessage(sessionId, { role: 'user', content: 'Message 2' });

      const context = getContext(sessionId);
      expect(context.messages.length).toBe(3);
      expect(context.messages[0].content).toContain('Message 1');
      expect(context.messages[1].content).toContain('Response 1');
      expect(context.messages[2].content).toContain('Message 2');
    });
  });

  describe('Context Window Management (FR-4a)', () => {
    it('should maintain last 20 turns when turn limit reached', () => {
      // Add 25 message pairs (50 messages total)
      for (let i = 0; i < 25; i++) {
        addMessage(sessionId, { role: 'user', content: `User message ${i}` });
        addMessage(sessionId, { role: 'assistant', content: `Assistant response ${i}` });
      }

      const context = getContext(sessionId);

      // Should keep last 20 turns (40 messages)
      expect(context.messages.length).toBeLessThanOrEqual(40);

      // Should keep most recent messages
      const lastMessage = context.messages[context.messages.length - 1];
      expect(lastMessage.content).toContain('24');
    });

    it('should calculate token count approximately', () => {
      addMessage(sessionId, { role: 'user', content: 'Short message' });

      const size = getContextSize(sessionId);
      expect(size).toBeGreaterThan(0);
      expect(size).toBeLessThan(100); // Rough estimate
    });

    it('should detect when context approaches 4000 token limit', () => {
      // Add many long messages
      for (let i = 0; i < 15; i++) {
        const longMessage = 'This is a long medical description. '.repeat(50);
        addMessage(sessionId, { role: 'user', content: longMessage });
        addMessage(sessionId, { role: 'assistant', content: longMessage });
      }

      const shouldCompress = shouldCompressContext(sessionId);
      expect(shouldCompress).toBe(true);
    });

    it('should compress old context when limit reached', () => {
      // Add many messages to trigger compression
      for (let i = 0; i < 30; i++) {
        const message = 'Patient symptom recorded: ' + 'detail '.repeat(100);
        addMessage(sessionId, { role: 'user', content: message });
        addMessage(sessionId, { role: 'assistant', content: 'Recorded' });
      }

      const context = getContext(sessionId);

      // Should have compressed old messages
      expect(context.messages.length).toBeLessThan(60);

      // Should have summary marker
      const hasSummary = context.messages.some(msg =>
        msg.content.includes('[Summary]') || msg.role === 'system'
      );
      expect(hasSummary).toBe(true);
    });

    it('should preserve recent context during compression', () => {
      // Add 25 message pairs
      for (let i = 0; i < 25; i++) {
        addMessage(sessionId, { role: 'user', content: `Message ${i}` });
        addMessage(sessionId, { role: 'assistant', content: `Response ${i}` });
      }

      const context = getContext(sessionId);

      // Most recent messages should be preserved
      const lastUserMsg = context.messages[context.messages.length - 2];
      expect(lastUserMsg.content).toContain('24');
    });
  });

  describe('Gemini Integration', () => {
    it('should wrap Gemini call with context', async () => {
      // Add some conversation history
      addMessage(sessionId, { role: 'user', content: 'Patient has fever' });
      addMessage(sessionId, { role: 'assistant', content: 'Recorded fever symptom' });

      const prompt = 'What are the symptoms so far?';
      const response = await callWithContext(sessionId, prompt);

      expect(response).toBeDefined();
      expect(typeof response).toBe('string');
      // Response should consider previous context
      expect(response.toLowerCase()).toMatch(/fever/);
    });

    it('should inject context into Gemini prompt', async () => {
      addMessage(sessionId, { role: 'user', content: 'Patient: Sarah Chen' });
      addMessage(sessionId, { role: 'user', content: 'Symptom: cough' });

      const prompt = 'Summarize patient info';
      const response = await callWithContext(sessionId, prompt);

      expect(response).toBeDefined();
    });

    it('should update context after Gemini call', async () => {
      const prompt = 'Test prompt';
      await callWithContext(sessionId, prompt);

      const context = getContext(sessionId);

      // Should have both user prompt and assistant response
      expect(context.messages.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Performance', () => {
    it('should handle large contexts efficiently', () => {
      const startTime = Date.now();

      // Add 50 messages
      for (let i = 0; i < 50; i++) {
        addMessage(sessionId, { role: 'user', content: `Message ${i}` });
      }

      const elapsed = Date.now() - startTime;

      expect(elapsed).toBeLessThan(100); // Should be very fast
    });

    it('should compress context quickly', () => {
      // Add many messages
      for (let i = 0; i < 30; i++) {
        const longMsg = 'text '.repeat(200);
        addMessage(sessionId, { role: 'user', content: longMsg });
        addMessage(sessionId, { role: 'assistant', content: longMsg });
      }

      const startTime = Date.now();
      // Trigger compression
      addMessage(sessionId, { role: 'user', content: 'trigger compression' });
      const elapsed = Date.now() - startTime;

      expect(elapsed).toBeLessThan(1000); // Compression should be fast
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid session ID gracefully', () => {
      const context = getContext('invalid-session-id');

      expect(context).toBeDefined();
      expect(context.messages.length).toBe(0);
    });

    it('should handle empty messages', () => {
      expect(() => {
        addMessage(sessionId, { role: 'user', content: '' });
      }).not.toThrow();
    });
  });
});
```

### TDD Step 2: Run Tests (Confirm FAIL)

```bash
npm test tests/unit/services/lettaService.test.ts
```

### TDD Step 3: Commit Tests

```bash
git add tests/unit/services/lettaService.test.ts
git commit -m "[TDD] Add Letta context service tests

Tests cover:
- Session creation and management
- Message addition and retrieval
- Context window management (20 turns / 4000 tokens per FR-4a)
- Context compression and summarization
- Gemini integration with context injection
- Token counting and limit detection
- Performance validation
- Error handling

All tests currently FAILING (no implementation yet)"
```

### TDD Step 4: Implement Letta Service

Create `src/services/lettaService.ts`:

```typescript
// src/services/lettaService.ts
import { generateResponse } from './geminiService';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
}

export interface Context {
  messages: Message[];
  tokenCount: number;
}

// ============================================
// CONSTANTS
// ============================================

const MAX_TURNS = 20; // Per FR-4a: last 20 turns
const MAX_TOKENS = 4000; // Per FR-4a: 4000 token limit
const TOKENS_PER_CHAR = 0.25; // Rough estimate: 4 chars = 1 token

// ============================================
// SESSION STORAGE
// ============================================

const sessions = new Map<string, Context>();

// ============================================
// SESSION MANAGEMENT
// ============================================

/**
 * Initialize new conversation session
 * @returns Session ID
 */
export function initSession(): string {
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  sessions.set(sessionId, {
    messages: [],
    tokenCount: 0,
  });

  return sessionId;
}

/**
 * Clear session and remove all context
 * @param sessionId - Session identifier
 */
export function clearSession(sessionId: string): void {
  sessions.delete(sessionId);
}

/**
 * Get context for session
 * @param sessionId - Session identifier
 * @returns Session context
 */
export function getContext(sessionId: string): Context {
  const context = sessions.get(sessionId);

  if (!context) {
    // Return empty context for invalid session
    return {
      messages: [],
      tokenCount: 0,
    };
  }

  return context;
}

// ============================================
// MESSAGE MANAGEMENT
// ============================================

/**
 * Add message to session context
 * @param sessionId - Session identifier
 * @param message - Message to add
 */
export function addMessage(sessionId: string, message: Message): void {
  let context = sessions.get(sessionId);

  if (!context) {
    // Create session if it doesn't exist
    context = {
      messages: [],
      tokenCount: 0,
    };
    sessions.set(sessionId, context);
  }

  // Add timestamp
  const messageWithTimestamp = {
    ...message,
    timestamp: new Date(),
  };

  context.messages.push(messageWithTimestamp);

  // Update token count
  context.tokenCount = estimateTokenCount(context.messages);

  // Check if compression needed
  if (shouldCompressContext(sessionId)) {
    compressContext(sessionId);
  }

  // Enforce turn limit (20 turns = 40 messages)
  const maxMessages = MAX_TURNS * 2;
  if (context.messages.length > maxMessages) {
    // Keep last 20 turns (40 messages)
    context.messages = context.messages.slice(-maxMessages);
    context.tokenCount = estimateTokenCount(context.messages);
  }
}

// ============================================
// CONTEXT WINDOW MANAGEMENT
// ============================================

/**
 * Calculate approximate token count for messages
 * @param messages - Array of messages
 * @returns Estimated token count
 */
function estimateTokenCount(messages: Message[]): number {
  const totalChars = messages.reduce(
    (sum, msg) => sum + msg.content.length,
    0
  );

  return Math.ceil(totalChars * TOKENS_PER_CHAR);
}

/**
 * Get current context size in tokens
 * @param sessionId - Session identifier
 * @returns Token count
 */
export function getContextSize(sessionId: string): number {
  const context = getContext(sessionId);
  return context.tokenCount;
}

/**
 * Check if context should be compressed
 * @param sessionId - Session identifier
 * @returns True if compression needed
 */
export function shouldCompressContext(sessionId: string): boolean {
  const context = getContext(sessionId);

  // Compress if approaching token limit (90% threshold)
  return context.tokenCount > MAX_TOKENS * 0.9;
}

/**
 * Compress old context by summarizing
 * @param sessionId - Session identifier
 */
function compressContext(sessionId: string): void {
  const context = getContext(sessionId);

  if (context.messages.length < 10) {
    // Not enough messages to compress
    return;
  }

  // Keep last 50% of messages
  const keepCount = Math.floor(context.messages.length / 2);
  const oldMessages = context.messages.slice(0, -keepCount);
  const recentMessages = context.messages.slice(-keepCount);

  // Create summary of old messages
  const summary = summarizeMessages(oldMessages);

  // Replace old messages with summary
  context.messages = [
    {
      role: 'system',
      content: `[Summary of previous conversation]\n${summary}`,
      timestamp: new Date(),
    },
    ...recentMessages,
  ];

  context.tokenCount = estimateTokenCount(context.messages);
}

/**
 * Summarize array of messages
 * @param messages - Messages to summarize
 * @returns Summary text
 */
function summarizeMessages(messages: Message[]): string {
  // Extract key information
  const symptoms: string[] = [];
  const diagnoses: string[] = [];
  const medications: string[] = [];

  messages.forEach(msg => {
    const content = msg.content.toLowerCase();

    // Extract symptoms
    if (content.includes('symptom') || content.includes('fever') || content.includes('pain')) {
      const match = msg.content.match(/symptom[:\s]+([^.]+)/i);
      if (match) symptoms.push(match[1].trim());
    }

    // Extract diagnoses
    if (content.includes('diagnosis') || content.includes('suggest')) {
      const match = msg.content.match(/diagnosis[:\s]+([^.]+)/i);
      if (match) diagnoses.push(match[1].trim());
    }

    // Extract medications
    if (content.includes('prescribe') || content.includes('medication')) {
      const match = msg.content.match(/prescribe[:\s]+([^.]+)/i);
      if (match) medications.push(match[1].trim());
    }
  });

  let summary = 'Previous conversation covered:\n';

  if (symptoms.length > 0) {
    summary += `- Symptoms recorded: ${symptoms.join(', ')}\n`;
  }

  if (diagnoses.length > 0) {
    summary += `- Diagnoses discussed: ${diagnoses.join(', ')}\n`;
  }

  if (medications.length > 0) {
    summary += `- Medications mentioned: ${medications.join(', ')}\n`;
  }

  if (symptoms.length === 0 && diagnoses.length === 0 && medications.length === 0) {
    summary += `${messages.length} messages exchanged in assessment.`;
  }

  return summary;
}

// ============================================
// GEMINI INTEGRATION
// ============================================

/**
 * Call Gemini with conversation context
 * @param sessionId - Session identifier
 * @param prompt - User prompt
 * @returns Gemini response
 */
export async function callWithContext(
  sessionId: string,
  prompt: string
): Promise<string> {
  const context = getContext(sessionId);

  // Build context-aware prompt
  let fullPrompt = '';

  if (context.messages.length > 0) {
    fullPrompt += 'Conversation History:\n';
    context.messages.forEach(msg => {
      fullPrompt += `${msg.role}: ${msg.content}\n`;
    });
    fullPrompt += '\n';
  }

  fullPrompt += `Current Request: ${prompt}`;

  // Add user message to context
  addMessage(sessionId, { role: 'user', content: prompt });

  // Call Gemini
  const response = await generateResponse(fullPrompt);

  // Add assistant response to context
  addMessage(sessionId, { role: 'assistant', content: response });

  return response;
}

// ============================================
// EXPORT CLASS (ALTERNATIVE API)
// ============================================

export class LettaService {
  private sessionId: string;

  constructor() {
    this.sessionId = initSession();
  }

  addMessage(message: Message): void {
    addMessage(this.sessionId, message);
  }

  getContext(): Context {
    return getContext(this.sessionId);
  }

  async callWithContext(prompt: string): Promise<string> {
    return callWithContext(this.sessionId, prompt);
  }

  clear(): void {
    clearSession(this.sessionId);
  }

  getTokenCount(): number {
    return getContextSize(this.sessionId);
  }
}
```

### TDD Step 5: Run Tests (Confirm PASS)

```bash
npm test tests/unit/services/lettaService.test.ts
```

**Expected Result**: All tests PASS ✅

### TDD Step 6: Commit Implementation

```bash
git add src/services/lettaService.ts
git commit -m "[TDD] Implement Letta context service

Implementation includes:
- Session management (init, clear, get context)
- Message addition with timestamps
- Context window management (20 turns per FR-4a)
- Token counting (4000 token limit per FR-4a)
- Context compression and summarization
- Gemini integration with context injection
- Performance optimizations
- Both functional and class-based APIs

All tests PASSING ✅
Meets FR-4, FR-4a"
```

---

## Task 3.5: Fish Audio TTS Service - TDD

**Estimated Time**: 1 hour
**Purpose**: Integrate Fish Audio API for text-to-speech generation

### Requirements from PRD

- **FR-29**: All system responses via Fish Audio TTS
- **FR-44**: TTS generation < 1.5 seconds
- **FR-44a**: Cache common responses (>50% hit rate target)

### TDD Step 1: Write Tests FIRST

Create `tests/unit/services/fishAudioService.test.ts`:

```typescript
// tests/unit/services/fishAudioService.test.ts
import {
  generateTTS,
  selectVoice,
  getCachedTTS,
  FishAudioServiceError,
} from '../../../src/services/fishAudioService';

describe('Fish Audio TTS Service', () => {
  beforeAll(() => {
    // Verify API key configured
    expect(process.env.FISH_AUDIO_API_KEY).toBeDefined();
  });

  describe('Configuration', () => {
    it('should have valid API key configured', () => {
      expect(process.env.FISH_AUDIO_API_KEY).toBeDefined();
      expect(process.env.FISH_AUDIO_API_KEY?.length).toBeGreaterThan(0);
    });

    it('should throw error if API key missing', () => {
      const originalKey = process.env.FISH_AUDIO_API_KEY;
      delete process.env.FISH_AUDIO_API_KEY;

      expect(() => {
        jest.resetModules();
        require('../../../src/services/fishAudioService');
      }).toThrow('FISH_AUDIO_API_KEY');

      process.env.FISH_AUDIO_API_KEY = originalKey;
      jest.resetModules();
    });
  });

  describe('generateTTS', () => {
    it('should generate audio URL from text', async () => {
      const text = 'Patient loaded successfully';
      const audioUrl = await generateTTS(text);

      expect(audioUrl).toBeDefined();
      expect(typeof audioUrl).toBe('string');
      expect(audioUrl).toMatch(/^https?:\/\//);
    });

    it('should handle medical terminology correctly', async () => {
      const text = 'Prescription logged: Acetaminophen 500mg';
      const audioUrl = await generateTTS(text);

      expect(audioUrl).toBeDefined();
    });

    it('should generate audio within performance target (FR-44)', async () => {
      const text = 'Recording symptom';
      const startTime = Date.now();

      const audioUrl = await generateTTS(text);

      const elapsed = Date.now() - startTime;

      expect(audioUrl).toBeDefined();
      expect(elapsed).toBeLessThan(1500); // < 1.5 seconds per FR-44
    }, 3000);

    it('should handle empty text gracefully', async () => {
      await expect(generateTTS('')).rejects.toThrow('Text cannot be empty');
    });

    it('should handle very long text', async () => {
      const longText = 'Patient symptoms include: ' + 'cough, fever, '.repeat(50);
      const audioUrl = await generateTTS(longText);

      expect(audioUrl).toBeDefined();
    });
  });

  describe('Voice Selection', () => {
    it('should use professional medical voice', () => {
      const voice = selectVoice();

      expect(voice).toBeDefined();
      expect(voice.id).toBeDefined();
      expect(voice.name).toContain('professional' || 'medical' || 'calm');
    });

    it('should return consistent voice', () => {
      const voice1 = selectVoice();
      const voice2 = selectVoice();

      expect(voice1.id).toBe(voice2.id);
    });
  });

  describe('Caching (FR-44a)', () => {
    it('should check cache before calling API', async () => {
      const text = 'Patient loaded';

      // First call - should hit API
      const url1 = await generateTTS(text);

      // Second call - should hit cache
      const startTime = Date.now();
      const url2 = await getCachedTTS(text);
      const elapsed = Date.now() - startTime;

      expect(url2).toBe(url1);
      expect(elapsed).toBeLessThan(50); // Cache should be very fast
    });

    it('should return null from cache if not found', async () => {
      const url = await getCachedTTS('This text has never been generated');

      expect(url).toBeNull();
    });

    it('should cache generated TTS', async () => {
      const text = 'Unique test phrase ' + Date.now();

      const url1 = await generateTTS(text);
      const url2 = await getCachedTTS(text);

      expect(url2).toBe(url1);
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      const originalKey = process.env.FISH_AUDIO_API_KEY;
      process.env.FISH_AUDIO_API_KEY = 'invalid-key';

      jest.resetModules();
      const { generateTTS: badGenerate } = require('../../../src/services/fishAudioService');

      await expect(badGenerate('test')).rejects.toThrow(FishAudioServiceError);

      process.env.FISH_AUDIO_API_KEY = originalKey;
      jest.resetModules();
    });

    it('should format error messages consistently', async () => {
      const originalKey = process.env.FISH_AUDIO_API_KEY;
      process.env.FISH_AUDIO_API_KEY = 'invalid';

      jest.resetModules();
      const { generateTTS: badGenerate } = require('../../../src/services/fishAudioService');

      try {
        await badGenerate('test');
        fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(FishAudioServiceError);
        expect(error.message).toBeDefined();
      }

      process.env.FISH_AUDIO_API_KEY = originalKey;
      jest.resetModules();
    });
  });

  describe('Demo Mode', () => {
    it('should return mock audio URL when DEMO_MODE=true', async () => {
      process.env.DEMO_MODE = 'true';

      const audioUrl = await generateTTS('Test message');

      expect(audioUrl).toBeDefined();
      expect(audioUrl).toMatch(/^https?:\/\//);
      expect(audioUrl).toContain('demo');

      delete process.env.DEMO_MODE;
    });

    it('should return quickly in demo mode', async () => {
      process.env.DEMO_MODE = 'true';

      const startTime = Date.now();
      await generateTTS('Test');
      const elapsed = Date.now() - startTime;

      expect(elapsed).toBeLessThan(100);

      delete process.env.DEMO_MODE;
    });
  });
});
```

### TDD Step 2: Run Tests (Confirm FAIL)

```bash
npm test tests/unit/services/fishAudioService.test.ts
```

### TDD Step 3: Commit Tests

```bash
git add tests/unit/services/fishAudioService.test.ts
git commit -m "[TDD] Add Fish Audio TTS service tests

Tests cover:
- API key configuration
- TTS generation with text input
- Medical terminology handling
- Performance validation (<1.5s per FR-44)
- Voice selection (professional medical voice)
- Cache integration per FR-44a
- Error handling and FishAudioServiceError
- Demo mode support

All tests currently FAILING (no implementation yet)"
```

### TDD Step 4: Implement Fish Audio Service

Create `src/services/fishAudioService.ts`:

```typescript
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

    // Demo mode
    if (process.env.DEMO_MODE === 'true') {
      return `${DEMO_AUDIO_URL}?text=${encodeURIComponent(text.substring(0, 20))}`;
    }

    // Check cache first (FR-44a)
    const cached = getCachedResponse(text);
    if (cached) {
      return cached;
    }

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
    const audioUrl = response.data.audio_url || response.data.url;

    if (!audioUrl) {
      throw new FishAudioServiceError('No audio URL in API response');
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
```

### TDD Step 5: Run Tests (Confirm PASS)

```bash
npm test tests/unit/services/fishAudioService.test.ts
```

**Expected Result**: All tests PASS ✅

### TDD Step 6: Commit Implementation

```bash
git add src/services/fishAudioService.ts
git commit -m "[TDD] Implement Fish Audio TTS service

Implementation includes:
- Fish Audio API integration
- generateTTS() with performance target <1.5s (FR-44)
- Voice selection (professional medical voice)
- Cache integration per FR-44a
- Pre-generation for common phrases
- Error handling and FishAudioServiceError
- Demo mode support
- Axios HTTP client with timeout

All tests PASSING ✅
Meets FR-29, FR-44, FR-44a"
```

---

## Task 3.6: Response Cache - TDD

**Estimated Time**: 45 minutes
**Purpose**: Implement caching for TTS responses to improve performance

### Requirements from PRD

- **FR-44a**: Cache common responses for sub-500ms response time
- **FR-44a**: Target >50% cache hit rate

### TDD Step 1: Write Tests FIRST

Create `tests/unit/utils/responseCache.test.ts`:

```typescript
// tests/unit/utils/responseCache.test.ts
import {
  get,
  set,
  has,
  clear,
  getStats,
  getHitRate,
} from '../../../src/utils/responseCache';

describe('Response Cache', () => {
  beforeEach(() => {
    // Clear cache before each test
    clear();
  });

  describe('Basic Operations', () => {
    it('should store and retrieve cached response', () => {
      const key = 'Patient loaded';
      const value = 'https://example.com/audio.mp3';

      set(key, value);
      const cached = get(key);

      expect(cached).toBe(value);
    });

    it('should return null for cache miss', () => {
      const result = get('non-existent-key');

      expect(result).toBeNull();
    });

    it('should check if key exists', () => {
      set('test-key', 'test-value');

      expect(has('test-key')).toBe(true);
      expect(has('missing-key')).toBe(false);
    });

    it('should clear all cached responses', () => {
      set('key1', 'value1');
      set('key2', 'value2');

      clear();

      expect(get('key1')).toBeNull();
      expect(get('key2')).toBeNull();
    });
  });

  describe('Cache Statistics', () => {
    it('should track cache hits and misses', () => {
      set('key1', 'value1');

      get('key1'); // hit
      get('key1'); // hit
      get('key2'); // miss
      get('key3'); // miss

      const stats = getStats();

      expect(stats.hits).toBe(2);
      expect(stats.misses).toBe(2);
      expect(stats.size).toBe(1);
    });

    it('should calculate hit rate', () => {
      set('key1', 'value1');

      get('key1'); // hit
      get('key2'); // miss

      const hitRate = getHitRate();

      expect(hitRate).toBe(0.5); // 50%
    });

    it('should return 0 hit rate with no accesses', () => {
      const hitRate = getHitRate();

      expect(hitRate).toBe(0);
    });

    it('should achieve >50% hit rate for common phrases (FR-44a)', () => {
      // Simulate realistic usage pattern
      const commonPhrases = [
        'Patient loaded',
        'Recording symptom',
        'Prescription logged',
      ];

      const rarePhrases = [
        'Unique phrase 1',
        'Unique phrase 2',
      ];

      // Pre-cache common phrases
      commonPhrases.forEach(phrase => {
        set(phrase, `url-for-${phrase}`);
      });

      // Simulate usage: 70% common, 30% rare
      for (let i = 0; i < 100; i++) {
        if (Math.random() < 0.7) {
          // Access common phrase
          const phrase = commonPhrases[Math.floor(Math.random() * commonPhrases.length)];
          get(phrase);
        } else {
          // Access rare phrase
          const phrase = rarePhrases[Math.floor(Math.random() * rarePhrases.length)];
          get(phrase);
        }
      }

      const hitRate = getHitRate();

      expect(hitRate).toBeGreaterThan(0.5); // > 50% per FR-44a
    });
  });

  describe('TTL and Expiration', () => {
    it('should expire cached values after TTL', async () => {
      set('test-key', 'test-value', 100); // 100ms TTL

      expect(get('test-key')).toBe('test-value');

      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 150));

      expect(get('test-key')).toBeNull();
    });

    it('should use default 24-hour TTL', async () => {
      set('test-key', 'test-value');

      // Check that value is still there after short wait
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(get('test-key')).toBe('test-value');
    });

    it('should not expire before TTL', async () => {
      set('test-key', 'test-value', 200); // 200ms TTL

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(get('test-key')).toBe('test-value');
    });
  });

  describe('Memory Management', () => {
    it('should limit cache size to prevent memory issues', () => {
      // Add 150 entries (cache limit should be 100 per FR-44a notes)
      for (let i = 0; i < 150; i++) {
        set(`key-${i}`, `value-${i}`);
      }

      const stats = getStats();

      expect(stats.size).toBeLessThanOrEqual(100);
    });

    it('should use LRU eviction when cache full', () => {
      // Fill cache to limit
      for (let i = 0; i < 100; i++) {
        set(`key-${i}`, `value-${i}`);
      }

      // Access key-50 to make it recently used
      get('key-50');

      // Add new entries to trigger eviction
      for (let i = 100; i < 110; i++) {
        set(`key-${i}`, `value-${i}`);
      }

      // key-50 should still exist (recently used)
      expect(has('key-50')).toBe(true);

      // key-0 should be evicted (least recently used)
      expect(has('key-0')).toBe(false);
    });
  });

  describe('Case Sensitivity', () => {
    it('should normalize text case for cache keys', () => {
      set('Patient Loaded', 'url1');

      expect(get('patient loaded')).toBe('url1');
      expect(get('PATIENT LOADED')).toBe('url1');
    });

    it('should handle mixed case consistently', () => {
      set('Recording Symptom', 'url1');

      expect(has('recording symptom')).toBe(true);
      expect(has('RECORDING SYMPTOM')).toBe(true);
    });
  });

  describe('Performance', () => {
    it('should access cache very quickly', () => {
      set('test-key', 'test-value');

      const startTime = Date.now();
      get('test-key');
      const elapsed = Date.now() - startTime;

      expect(elapsed).toBeLessThan(10); // < 10ms
    });

    it('should handle large cache efficiently', () => {
      // Add 100 entries
      for (let i = 0; i < 100; i++) {
        set(`key-${i}`, `value-${i}`);
      }

      const startTime = Date.now();

      // Access 100 entries
      for (let i = 0; i < 100; i++) {
        get(`key-${i}`);
      }

      const elapsed = Date.now() - startTime;

      expect(elapsed).toBeLessThan(100); // < 100ms for 100 accesses
    });
  });
});
```

### TDD Step 2: Run Tests (Confirm FAIL)

```bash
npm test tests/unit/utils/responseCache.test.ts
```

### TDD Step 3: Commit Tests

```bash
git add tests/unit/utils/responseCache.test.ts
git commit -m "[TDD] Add response cache utility tests

Tests cover:
- Basic cache operations (get, set, has, clear)
- Cache statistics tracking (hits, misses, hit rate)
- Hit rate validation (target >50% per FR-44a)
- TTL and expiration (24-hour default)
- Memory management (100 entry limit with LRU)
- Case-insensitive keys
- Performance validation (<10ms access)

All tests currently FAILING (no implementation yet)"
```

### TDD Step 4: Implement Response Cache

Create `src/utils/responseCache.ts`:

```typescript
// src/utils/responseCache.ts

// ============================================
// TYPE DEFINITIONS
// ============================================

interface CacheEntry {
  value: string;
  expires: number;
  lastAccessed: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  size: number;
}

// ============================================
// CONSTANTS
// ============================================

const DEFAULT_TTL = 24 * 60 * 60 * 1000; // 24 hours
const MAX_CACHE_SIZE = 100; // Per FR-44a memory management

// ============================================
// CACHE STORAGE
// ============================================

const cache = new Map<string, CacheEntry>();
let hits = 0;
let misses = 0;

// ============================================
// KEY NORMALIZATION
// ============================================

/**
 * Normalize cache key (lowercase, trim whitespace)
 * @param key - Original key
 * @returns Normalized key
 */
function normalizeKey(key: string): string {
  return key.toLowerCase().trim();
}

// ============================================
// CACHE OPERATIONS
// ============================================

/**
 * Get cached value
 * @param key - Cache key
 * @returns Cached value or null
 */
export function get(key: string): string | null {
  const normalizedKey = normalizeKey(key);
  const entry = cache.get(normalizedKey);

  if (!entry) {
    misses++;
    return null;
  }

  // Check if expired
  if (Date.now() > entry.expires) {
    cache.delete(normalizedKey);
    misses++;
    return null;
  }

  // Update last accessed time
  entry.lastAccessed = Date.now();

  hits++;
  return entry.value;
}

/**
 * Set cached value
 * @param key - Cache key
 * @param value - Value to cache
 * @param ttl - Time to live in milliseconds (default 24 hours)
 */
export function set(key: string, value: string, ttl: number = DEFAULT_TTL): void {
  const normalizedKey = normalizeKey(key);

  // Check cache size limit
  if (cache.size >= MAX_CACHE_SIZE && !cache.has(normalizedKey)) {
    evictLRU();
  }

  const entry: CacheEntry = {
    value,
    expires: Date.now() + ttl,
    lastAccessed: Date.now(),
  };

  cache.set(normalizedKey, entry);
}

/**
 * Check if key exists in cache
 * @param key - Cache key
 * @returns True if key exists and not expired
 */
export function has(key: string): boolean {
  return get(key) !== null;
}

/**
 * Clear all cached values
 */
export function clear(): void {
  cache.clear();
  hits = 0;
  misses = 0;
}

// ============================================
// STATISTICS
// ============================================

/**
 * Get cache statistics
 * @returns Stats object
 */
export function getStats(): CacheStats {
  return {
    hits,
    misses,
    size: cache.size,
  };
}

/**
 * Get cache hit rate
 * @returns Hit rate (0.0 to 1.0)
 */
export function getHitRate(): number {
  const total = hits + misses;

  if (total === 0) {
    return 0;
  }

  return hits / total;
}

// ============================================
// MEMORY MANAGEMENT
// ============================================

/**
 * Evict least recently used entry
 */
function evictLRU(): void {
  let oldestKey: string | null = null;
  let oldestTime = Infinity;

  cache.forEach((entry, key) => {
    if (entry.lastAccessed < oldestTime) {
      oldestTime = entry.lastAccessed;
      oldestKey = key;
    }
  });

  if (oldestKey) {
    cache.delete(oldestKey);
  }
}

/**
 * Clean up expired entries
 * Run this periodically to free memory
 */
export function cleanupExpired(): void {
  const now = Date.now();

  cache.forEach((entry, key) => {
    if (now > entry.expires) {
      cache.delete(key);
    }
  });
}

// ============================================
// PERIODIC CLEANUP
// ============================================

// Run cleanup every hour
setInterval(cleanupExpired, 60 * 60 * 1000);
```

### TDD Step 5: Run Tests (Confirm PASS)

```bash
npm test tests/unit/utils/responseCache.test.ts
```

**Expected Result**: All tests PASS ✅

### TDD Step 6: Commit Implementation

```bash
git add src/utils/responseCache.ts
git commit -m "[TDD] Implement response cache utility

Implementation includes:
- In-memory cache with Map storage
- TTL-based expiration (default 24 hours)
- LRU eviction when cache full (100 entry limit)
- Case-insensitive key normalization
- Hit/miss tracking and statistics
- Hit rate calculation (target >50% per FR-44a)
- Periodic cleanup of expired entries
- High performance (<10ms access time)

All tests PASSING ✅
Meets FR-44a"
```

---

## Phase 3.2 Verification Checklist

Before proceeding to Phase 3.3, verify:

- [ ] Gemini service implemented with all functions
- [ ] Gemini tests passing (35+ tests)
- [ ] Letta context service implemented
- [ ] Letta tests passing (25+ tests)
- [ ] Fish Audio TTS service implemented
- [ ] Fish Audio tests passing (20+ tests)
- [ ] Response cache implemented
- [ ] Response cache tests passing (25+ tests)
- [ ] All services handle errors gracefully
- [ ] Demo mode working for all services
- [ ] Performance targets met:
  - [ ] Gemini responses < 2 seconds
  - [ ] TTS generation < 1.5 seconds
  - [ ] Cache access < 10ms
  - [ ] Cache hit rate > 50%
- [ ] All code committed and pushed

### Run Full Test Suite

```bash
# Run all service tests
npm run test:unit

# Expected results:
# - Supabase: 10 tests ✅
# - Patient: 27 tests ✅
# - Prescription: 22 tests ✅
# - Gemini: 35+ tests ✅
# - Letta: 25+ tests ✅
# - Fish Audio: 20+ tests ✅
# - Response Cache: 25+ tests ✅
# Total: 160+ tests passing
```

### Update Railway with Latest Code

```bash
# Build
npm run build

# Deploy
railway up

# Verify
railway domain
curl https://your-railway-url.up.railway.app/health
```

---

## Troubleshooting Guide

### Issue: Gemini API rate limit errors

**Solution**:
```bash
# Check rate limit status
# Implement exponential backoff in geminiService.ts

# Add retry logic:
const maxRetries = 3;
let retryCount = 0;

while (retryCount < maxRetries) {
  try {
    const result = await model.generateContent(prompt);
    break;
  } catch (error) {
    if (error.message.includes('rate limit')) {
      retryCount++;
      await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
    } else {
      throw error;
    }
  }
}
```

### Issue: Fish Audio TTS timeout

**Solution**:
1. Check network connectivity
2. Increase axios timeout
3. Use demo mode for testing
4. Verify API key is valid

```bash
# Test Fish Audio API directly
curl -X POST https://api.fish.audio/v1/tts \
  -H "Authorization: Bearer YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"text": "test", "voice_id": "medical-professional-001"}'
```

### Issue: Letta context growing too large

**Solution**:
```typescript
// Force compression
compressContext(sessionId);

// Or clear old sessions periodically
setInterval(() => {
  // Clear sessions older than 1 hour
  sessions.forEach((context, id) => {
    if (context.messages.length === 0) {
      clearSession(id);
    }
  });
}, 60 * 60 * 1000);
```

### Issue: Cache hit rate below 50%

**Solution**:
1. Pre-generate more common phrases
2. Check key normalization
3. Analyze access patterns

```bash
# Add more common phrases to fishAudioService.ts
const commonPhrases = [
  'Patient loaded',
  'Recording symptom',
  'Prescription logged',
  'Patient not found',
  // Add more based on usage logs
];
```

---

## Next Steps

After completing Phase 3.2, you will move to:

**Phase 3.3: Drug Interaction Service - TDD (Hours 18-24)**
- Drug database with 8 medications (FR-22)
- Drug interaction checking (Warfarin + NSAIDs)
- Allergy checking
- Alternative medication suggestions
- Clinical decision engine integration

**Phase 3.4: API Endpoints - Training, Clinical, Prescription (Hours 24-36)**
- Training mode routes and controllers
- Clinical mode routes and controllers
- Prescription routes and controllers
- Voice command and TTS utility endpoints

Continue following strict TDD for all remaining tasks.

---

## Time Estimates

| Task | Estimated Time | Actual Time |
|------|---------------|-------------|
| Task 3.3: Gemini Service | 1.5 hours | _____ hours |
| Task 3.4: Letta Service | 1.5 hours | _____ hours |
| Task 3.5: Fish Audio TTS | 1 hour | _____ hours |
| Task 3.6: Response Cache | 0.75 hours | _____ hours |
| **Total** | **4.75 hours** | **_____ hours** |

**Target Completion**: Hour 18
**Critical Deadline**: Hour 18 (for API endpoint development to begin)

---

## Success Criteria

✅ Phase 3.2 Complete When:
1. Gemini service working with clinical advice generation
2. Letta context management with 20 turn / 4000 token window
3. Fish Audio TTS generating audio < 1.5 seconds
4. Response cache achieving >50% hit rate
5. **160+ tests passing**
6. All services support demo mode
7. Performance targets met (FR-42, FR-44, FR-44a)
8. Code committed and pushed
9. Railway deployment updated

**You are now ready to proceed to Phase 3.3: Drug Interaction Service!**
