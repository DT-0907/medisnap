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
