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
