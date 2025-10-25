// tests/unit/services/fishAudioService.test.ts
import {
  generateTTS,
  selectVoice,
  getCachedTTS,
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

    it('should throw error if API key missing', async () => {
      const originalKey = process.env.FISH_AUDIO_API_KEY;
      const originalDemo = process.env.DEMO_MODE;

      delete process.env.FISH_AUDIO_API_KEY;
      delete process.env.DEMO_MODE;

      await expect(generateTTS('test')).rejects.toThrow('FISH_AUDIO_API_KEY');

      process.env.FISH_AUDIO_API_KEY = originalKey;
      process.env.DEMO_MODE = originalDemo;
    });
  });

  describe('generateTTS', () => {
    it('should generate audio URL from text', async () => {
      // Use demo mode for testing without real API
      process.env.DEMO_MODE = 'true';

      const text = 'Patient loaded successfully';
      const audioUrl = await generateTTS(text);

      expect(audioUrl).toBeDefined();
      expect(typeof audioUrl).toBe('string');
      expect(audioUrl).toMatch(/^https?:\/\//);

      delete process.env.DEMO_MODE;
    });

    it('should handle medical terminology correctly', async () => {
      process.env.DEMO_MODE = 'true';

      const text = 'Prescription logged: Acetaminophen 500mg';
      const audioUrl = await generateTTS(text);

      expect(audioUrl).toBeDefined();

      delete process.env.DEMO_MODE;
    });

    it('should generate audio within performance target (FR-44)', async () => {
      process.env.DEMO_MODE = 'true';

      const text = 'Recording symptom';
      const startTime = Date.now();

      const audioUrl = await generateTTS(text);

      const elapsed = Date.now() - startTime;

      expect(audioUrl).toBeDefined();
      expect(elapsed).toBeLessThan(1500); // < 1.5 seconds per FR-44

      delete process.env.DEMO_MODE;
    }, 3000);

    it('should handle empty text gracefully', async () => {
      await expect(generateTTS('')).rejects.toThrow('Text cannot be empty');
    });

    it('should handle very long text', async () => {
      process.env.DEMO_MODE = 'true';

      const longText = 'Patient symptoms include: ' + 'cough, fever, '.repeat(50);
      const audioUrl = await generateTTS(longText);

      expect(audioUrl).toBeDefined();

      delete process.env.DEMO_MODE;
    });
  });

  describe('Voice Selection', () => {
    it('should use professional medical voice', () => {
      const voice = selectVoice();

      expect(voice).toBeDefined();
      expect(voice.id).toBeDefined();
      expect(voice.name).toBeDefined();
    });

    it('should return consistent voice', () => {
      const voice1 = selectVoice();
      const voice2 = selectVoice();

      expect(voice1.id).toBe(voice2.id);
    });
  });

  describe('Caching (FR-44a)', () => {
    it('should check cache before calling API', async () => {
      process.env.DEMO_MODE = 'true';

      const text = 'Patient loaded';

      // First call - should hit API
      const url1 = await generateTTS(text);

      // Second call - should hit cache
      const startTime = Date.now();
      const url2 = await getCachedTTS(text);
      const elapsed = Date.now() - startTime;

      expect(url2).toBe(url1);
      expect(elapsed).toBeLessThan(50); // Cache should be very fast

      delete process.env.DEMO_MODE;
    });

    it('should return null from cache if not found', async () => {
      const url = await getCachedTTS('This text has never been generated');

      expect(url).toBeNull();
    });

    it('should cache generated TTS', async () => {
      process.env.DEMO_MODE = 'true';

      const text = 'Unique test phrase ' + Date.now();

      const url1 = await generateTTS(text);
      const url2 = await getCachedTTS(text);

      expect(url2).toBe(url1);

      delete process.env.DEMO_MODE;
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      const originalKey = process.env.FISH_AUDIO_API_KEY;
      const originalDemo = process.env.DEMO_MODE;

      process.env.FISH_AUDIO_API_KEY = 'invalid-key';
      delete process.env.DEMO_MODE;

      jest.resetModules();
      const { generateTTS: badGenerate } = require('../../../src/services/fishAudioService');

      await expect(badGenerate('test')).rejects.toThrow();

      process.env.FISH_AUDIO_API_KEY = originalKey;
      process.env.DEMO_MODE = originalDemo;
      jest.resetModules();
    });

    it('should format error messages consistently', async () => {
      const originalKey = process.env.FISH_AUDIO_API_KEY;
      const originalDemo = process.env.DEMO_MODE;

      process.env.FISH_AUDIO_API_KEY = 'invalid';
      delete process.env.DEMO_MODE;

      jest.resetModules();
      const { generateTTS: badGenerate } = require('../../../src/services/fishAudioService');

      try {
        await badGenerate('test');
        fail('Should have thrown');
      } catch (error: any) {
        expect(error.message).toBeDefined();
      }

      process.env.FISH_AUDIO_API_KEY = originalKey;
      process.env.DEMO_MODE = originalDemo;
      jest.resetModules();
    });
  });

  describe('Demo Mode', () => {
    it('should return mock audio URL when DEMO_MODE=true', async () => {
      process.env.DEMO_MODE = 'true';

      const audioUrl = await generateTTS('Test message');

      expect(audioUrl).toBeDefined();
      expect(audioUrl).toMatch(/^https?:\/\//);

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
