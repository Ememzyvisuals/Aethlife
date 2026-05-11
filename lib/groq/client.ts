/**
 * AethLife — Groq API Key Rotation
 *
 * Uses up to 4 Groq API keys in round-robin order.
 * When one key hits a rate limit (429), the next key is tried automatically.
 * This quadruples your free-tier capacity.
 *
 * Setup in .env.local:
 *   GROQ_API_KEY_1=gsk_key1...
 *   GROQ_API_KEY_2=gsk_key2...
 *   GROQ_API_KEY_3=gsk_key3...
 *   GROQ_API_KEY_4=gsk_key4...
 *
 * You can use 1, 2, 3, or 4 keys — unused slots are skipped automatically.
 * Get free keys at: https://console.groq.com/keys (one key per account)
 * Create 4 free Groq accounts to get 4 keys.
 */

import Groq from 'groq-sdk';

function getGroqKeys(): string[] {
  const keys: string[] = [];

  // Support both single key (legacy) and multi-key setup
  const single = process.env.GROQ_API_KEY;
  const k1 = process.env.GROQ_API_KEY_1;
  const k2 = process.env.GROQ_API_KEY_2;
  const k3 = process.env.GROQ_API_KEY_3;
  const k4 = process.env.GROQ_API_KEY_4;

  if (k1) keys.push(k1);
  if (k2) keys.push(k2);
  if (k3) keys.push(k3);
  if (k4) keys.push(k4);

  // Fall back to single key if no numbered keys set
  if (keys.length === 0 && single) keys.push(single);

  return keys;
}

// Simple in-memory round-robin counter
// Resets on each server restart — that's fine
let currentKeyIndex = 0;

function getNextKey(): { key: string; index: number } {
  const keys = getGroqKeys();
  if (keys.length === 0) {
    throw new Error('No Groq API keys configured. Set GROQ_API_KEY_1 in your environment variables.');
  }
  const index = currentKeyIndex % keys.length;
  currentKeyIndex = (currentKeyIndex + 1) % keys.length;
  return { key: keys[index], index };
}

/**
 * Call Groq with automatic key rotation on rate limit errors.
 * If key N hits a 429, automatically retries with key N+1.
 * If all keys are rate limited, throws with a helpful message.
 */
export async function groqWithRotation<T>(
  fn: (client: Groq) => Promise<T>,
  retries = 0
): Promise<T> {
  const keys = getGroqKeys();
  const maxRetries = keys.length;

  if (retries >= maxRetries) {
    throw new Error(
      `All ${maxRetries} Groq API key(s) are rate limited. ` +
      'Wait a minute or add more keys (GROQ_API_KEY_1 through GROQ_API_KEY_4).'
    );
  }

  const { key, index } = getNextKey();
  const client = new Groq({ apiKey: key });

  try {
    return await fn(client);
  } catch (err: unknown) {
    const error = err as { status?: number; error?: { type?: string } };

    // 429 = rate limited — try the next key
    if (error?.status === 429 || error?.error?.type === 'rate_limit_exceeded') {
      console.warn(`[AethLife] Groq key #${index + 1} rate limited. Trying next key...`);
      return groqWithRotation(fn, retries + 1);
    }

    // Other errors — re-throw
    throw err;
  }
}

/**
 * Quick helper to get any available Groq client.
 * Use groqWithRotation() for production calls.
 */
export function createGroqClient(): Groq {
  const { key } = getNextKey();
  return new Groq({ apiKey: key });
}

/** Returns how many keys are configured */
export function getGroqKeyCount(): number {
  return getGroqKeys().length;
}
