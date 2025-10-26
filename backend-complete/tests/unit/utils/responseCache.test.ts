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
