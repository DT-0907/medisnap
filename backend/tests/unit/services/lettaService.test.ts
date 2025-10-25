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
      const hasSummary = context.messages.some((msg: any) =>
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
      // Set demo mode for testing without API
      process.env.DEMO_MODE = 'true';

      // Add some conversation history
      addMessage(sessionId, { role: 'user', content: 'Patient has fever' });
      addMessage(sessionId, { role: 'assistant', content: 'Recorded fever symptom' });

      const prompt = 'What are the symptoms so far?';
      const response = await callWithContext(sessionId, prompt);

      expect(response).toBeDefined();
      expect(typeof response).toBe('string');

      delete process.env.DEMO_MODE;
    });

    it('should inject context into Gemini prompt', async () => {
      process.env.DEMO_MODE = 'true';

      addMessage(sessionId, { role: 'user', content: 'Patient: Sarah Chen' });
      addMessage(sessionId, { role: 'user', content: 'Symptom: cough' });

      const prompt = 'Summarize patient info';
      const response = await callWithContext(sessionId, prompt);

      expect(response).toBeDefined();

      delete process.env.DEMO_MODE;
    });

    it('should update context after Gemini call', async () => {
      process.env.DEMO_MODE = 'true';

      const prompt = 'Test prompt';
      await callWithContext(sessionId, prompt);

      const context = getContext(sessionId);

      // Should have both user prompt and assistant response
      expect(context.messages.length).toBeGreaterThanOrEqual(2);

      delete process.env.DEMO_MODE;
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

  describe('LettaService Class', () => {
    it('should create service instance with session', () => {
      const service = new LettaService();

      expect(service).toBeDefined();
      expect(service.getContext()).toBeDefined();
    });

    it('should add messages via class API', () => {
      const service = new LettaService();

      service.addMessage({ role: 'user', content: 'Test message' });

      const context = service.getContext();
      expect(context.messages.length).toBe(1);
    });

    it('should get token count via class API', () => {
      const service = new LettaService();

      service.addMessage({ role: 'user', content: 'Test message' });

      const tokenCount = service.getTokenCount();
      expect(tokenCount).toBeGreaterThan(0);
    });

    it('should call with context via class API', async () => {
      process.env.DEMO_MODE = 'true';

      const service = new LettaService();
      service.addMessage({ role: 'user', content: 'Previous message' });

      const response = await service.callWithContext('New prompt');

      expect(response).toBeDefined();

      delete process.env.DEMO_MODE;
    });

    it('should clear session via class API', () => {
      const service = new LettaService();

      service.addMessage({ role: 'user', content: 'Test' });
      service.clear();

      const context = service.getContext();
      expect(context.messages.length).toBe(0);
    });
  });
});
