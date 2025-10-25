// tests/unit/services/clinicalDecisionEngine.test.ts
import {
  analyzeSymptoms,
  formatForTTS,
  ClinicalDecisionEngineError,
} from '../../../src/services/clinicalDecisionEngine';

describe('Clinical Decision Engine', () => {
  describe('Scenario 1: Respiratory Infection', () => {
    it('should diagnose Upper Respiratory Infection with fever + cough + fatigue', async () => {
      const patientData = {
        symptoms: ['fever', 'cough', 'fatigue', 'chest tightness'],
        vital_signs: {
          bp: '118/76',
          hr: 88,
          o2: 97,
          temp: 101.5,
        },
      };

      const result = await analyzeSymptoms(patientData);

      expect(result.primary_diagnosis).toContain('Respiratory Infection');
      expect(result.confidence).toBeGreaterThan(0.7);
      expect(result.recommendations).toBeDefined();
      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    it('should include chest auscultation in recommendations', async () => {
      const patientData = {
        symptoms: ['fever', 'dry cough', 'fatigue'],
        vital_signs: {
          temp: 101.5,
          o2: 97,
        },
      };

      const result = await analyzeSymptoms(patientData);

      const hasAuscultation = result.recommendations.some((rec: string) =>
        rec.toLowerCase().includes('auscultation') || rec.toLowerCase().includes('listen')
      );

      expect(hasAuscultation).toBe(true);
    });

    it('should mention O2 saturation monitoring', async () => {
      const patientData = {
        symptoms: ['fever', 'cough', 'chest tightness'],
        vital_signs: {
          temp: 101.5,
          o2: 97,
        },
      };

      const result = await analyzeSymptoms(patientData);

      const hasO2Monitoring = result.recommendations.some((rec: string) =>
        rec.toLowerCase().includes('o2') || rec.toLowerCase().includes('oxygen')
      );

      expect(hasO2Monitoring).toBe(true);
    });

    it('should provide follow-up guidance', async () => {
      const patientData = {
        symptoms: ['fever', 'cough'],
        vital_signs: {
          temp: 101.5,
        },
      };

      const result = await analyzeSymptoms(patientData);

      expect(result.follow_up).toBeDefined();
      expect(result.follow_up.length).toBeGreaterThan(0);
    });
  });

  describe('Scenario 2: Hypertension Alert', () => {
    it('should detect elevated blood pressure', async () => {
      const patientData = {
        symptoms: [],
        vital_signs: {
          bp: '148/94',
          hr: 76,
        },
        current_medications: [
          { name: 'Lisinopril', dosage: '10mg daily', started: '2023-06-10' },
        ],
      };

      const result = await analyzeSymptoms(patientData);

      expect(result.primary_diagnosis).toContain('Hypertension');
      expect(result.confidence).toBeGreaterThan(0.8);
    });

    it('should recommend medication compliance check', async () => {
      const patientData = {
        symptoms: [],
        vital_signs: {
          bp: '148/94',
        },
        current_medications: [
          { name: 'Lisinopril', dosage: '10mg daily', started: '2023-06-10' },
        ],
      };

      const result = await analyzeSymptoms(patientData);

      const hasComplianceCheck = result.recommendations.some((rec: string) =>
        rec.toLowerCase().includes('compliance') || rec.toLowerCase().includes('medication')
      );

      expect(hasComplianceCheck).toBe(true);
    });

    it('should suggest BP recheck', async () => {
      const patientData = {
        symptoms: [],
        vital_signs: {
          bp: '148/94',
        },
      };

      const result = await analyzeSymptoms(patientData);

      const hasRecheck = result.recommendations.some((rec: string) =>
        rec.toLowerCase().includes('recheck') || rec.toLowerCase().includes('repeat')
      );

      expect(hasRecheck).toBe(true);
    });

    it('should mention physician consultation for persistent elevation', async () => {
      const patientData = {
        symptoms: [],
        vital_signs: {
          bp: '160/100',
        },
      };

      const result = await analyzeSymptoms(patientData);

      expect(result.follow_up).toContain('physician');
    });
  });

  describe('Edge Cases and Gemini Fallback', () => {
    it('should handle unknown symptom patterns with Gemini', async () => {
      const patientData = {
        symptoms: ['unusual symptom pattern', 'rare condition'],
        vital_signs: {},
      };

      const result = await analyzeSymptoms(patientData);

      expect(result.primary_diagnosis).toBeDefined();
      expect(result.confidence).toBeLessThan(0.7); // Lower confidence for unknown patterns
    }, 10000); // Extended timeout for Gemini API

    it('should handle empty symptoms gracefully', async () => {
      const patientData = {
        symptoms: [],
        vital_signs: {
          bp: '120/80',
          hr: 72,
        },
      };

      const result = await analyzeSymptoms(patientData);

      expect(result.primary_diagnosis).toBeDefined();
      expect(result.recommendations).toBeDefined();
    });

    it('should provide general wellness advice when no issues detected', async () => {
      const patientData = {
        symptoms: [],
        vital_signs: {
          bp: '118/76',
          hr: 72,
          o2: 99,
          temp: 98.6,
        },
      };

      const result = await analyzeSymptoms(patientData);

      expect(result.primary_diagnosis).toContain('No significant concerns');
    });
  });

  describe('Output Format', () => {
    it('should return structured response per PRD Appendix B', async () => {
      const patientData = {
        symptoms: ['fever', 'cough'],
        vital_signs: {
          temp: 101.5,
        },
      };

      const result = await analyzeSymptoms(patientData);

      expect(result).toHaveProperty('primary_diagnosis');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('reasoning');
      expect(result).toHaveProperty('recommendations');
      expect(result).toHaveProperty('warnings');
      expect(result).toHaveProperty('follow_up');
    });

    it('should provide confidence score between 0.0 and 1.0', async () => {
      const patientData = {
        symptoms: ['fever', 'cough'],
        vital_signs: { temp: 101.5 },
      };

      const result = await analyzeSymptoms(patientData);

      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });

    it('should return recommendations as array', async () => {
      const patientData = {
        symptoms: ['fever'],
        vital_signs: {},
      };

      const result = await analyzeSymptoms(patientData);

      expect(Array.isArray(result.recommendations)).toBe(true);
      expect(result.recommendations.length).toBeGreaterThan(0);
    }, 10000); // Extended timeout

    it('should provide reasoning for diagnosis', async () => {
      const patientData = {
        symptoms: ['fever', 'cough'],
        vital_signs: { temp: 101.5 },
      };

      const result = await analyzeSymptoms(patientData);

      expect(result.reasoning).toBeDefined();
      expect(result.reasoning.length).toBeGreaterThan(10); // Substantial explanation
    });
  });

  describe('Urgency Assessment', () => {
    it('should return "routine" urgency for minor symptoms', async () => {
      const patientData = {
        symptoms: ['mild cough'],
        vital_signs: { temp: 98.6 },
      };

      const result = await analyzeSymptoms(patientData);

      expect(result.urgency).toBe('routine');
    }, 10000); // Extended timeout

    it('should return "urgent" for moderately concerning symptoms', async () => {
      const patientData = {
        symptoms: ['fever', 'cough', 'chest pain'],
        vital_signs: { temp: 102.5, o2: 94 },
      };

      const result = await analyzeSymptoms(patientData);

      expect(result.urgency).toBe('urgent');
    }, 10000); // Extended timeout

    it('should return "emergency" for critical vitals', async () => {
      const patientData = {
        symptoms: ['chest pain', 'shortness of breath'],
        vital_signs: { bp: '180/120', hr: 140, o2: 88 },
      };

      const result = await analyzeSymptoms(patientData);

      expect(result.urgency).toBe('emergency');
    }, 10000); // Extended timeout
  });

  describe('Demo Mode', () => {
    it('should return predictable results in demo mode', async () => {
      process.env.DEMO_MODE = 'true';

      const patientData = {
        symptoms: ['fever', 'cough'],
        vital_signs: { temp: 101.5 },
      };

      const result = await analyzeSymptoms(patientData);

      expect(result.primary_diagnosis).toBeDefined();
      expect(result.confidence).toBeGreaterThan(0);

      delete process.env.DEMO_MODE;
    });
  });

  describe('Error Handling', () => {
    it('should throw error for invalid input', async () => {
      await expect(analyzeSymptoms(null as any)).rejects.toThrow(
        ClinicalDecisionEngineError
      );
    });

    it('should handle Gemini API failures gracefully', async () => {
      // Simulate API failure by providing complex input
      const patientData = {
        symptoms: ['test error handling'],
        vital_signs: {},
      };

      // Should not throw, should return fallback response
      const result = await analyzeSymptoms(patientData);

      expect(result).toBeDefined();
    }, 10000); // Extended timeout
  });

  describe('Performance', () => {
    it('should complete analysis within reasonable time', async () => {
      const patientData = {
        symptoms: ['fever', 'cough'],
        vital_signs: { temp: 101.5 },
      };

      const startTime = Date.now();
      await analyzeSymptoms(patientData);
      const elapsed = Date.now() - startTime;

      expect(elapsed).toBeLessThan(3000); // < 3 seconds per FR-42
    }, 10000);
  });

  describe('TTS Formatting', () => {
    it('should format analysis for TTS delivery', async () => {
      const patientData = {
        symptoms: ['fever', 'cough'],
        vital_signs: { temp: 101.5 },
      };

      const analysis = await analyzeSymptoms(patientData);
      const ttsText = formatForTTS(analysis);

      expect(ttsText).toBeDefined();
      expect(ttsText.length).toBeGreaterThan(20);
      expect(ttsText).toContain('diagnosis');
    });

    it('should include recommendations in TTS format', async () => {
      const patientData = {
        symptoms: ['fever', 'cough'],
        vital_signs: { temp: 101.5 },
      };

      const analysis = await analyzeSymptoms(patientData);
      const ttsText = formatForTTS(analysis);

      expect(ttsText).toContain('Recommended');
    });
  });
});
