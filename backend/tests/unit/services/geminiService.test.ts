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
      } catch (error: any) {
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
