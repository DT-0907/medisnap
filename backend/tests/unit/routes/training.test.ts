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
