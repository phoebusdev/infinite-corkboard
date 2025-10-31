import { kv } from '@vercel/kv';

const RATE_LIMIT_WINDOW = 900; // 15 minutes in seconds
const MAX_ATTEMPTS = 5;

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Check if a request is within rate limits
 * @param key Unique identifier for rate limiting (e.g., IP address, user ID)
 * @param action Action being rate limited (e.g., 'login', 'add-paper')
 * @returns Rate limit result with remaining attempts and reset time
 */
export async function checkRateLimit(
  key: string,
  action: string = 'default'
): Promise<RateLimitResult> {
  // Skip rate limiting if KV is not configured (development)
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
    console.warn('KV not configured, skipping rate limit check');
    return {
      success: true,
      remaining: MAX_ATTEMPTS,
      resetAt: Date.now() + RATE_LIMIT_WINDOW * 1000,
    };
  }

  try {
    const rateLimitKey = `rate-limit:${action}:${key}`;
    const current = await kv.get<number>(rateLimitKey);

    const attempts = current || 0;
    const remaining = Math.max(0, MAX_ATTEMPTS - attempts);

    if (attempts >= MAX_ATTEMPTS) {
      const ttl = await kv.ttl(rateLimitKey);
      const resetAt = Date.now() + (ttl > 0 ? ttl * 1000 : RATE_LIMIT_WINDOW * 1000);

      return {
        success: false,
        remaining: 0,
        resetAt,
      };
    }

    // Increment attempt counter
    await kv.set(rateLimitKey, attempts + 1, {
      ex: RATE_LIMIT_WINDOW,
    });

    return {
      success: true,
      remaining: remaining - 1,
      resetAt: Date.now() + RATE_LIMIT_WINDOW * 1000,
    };
  } catch (error) {
    console.error('Rate limit check error:', error);
    // Fail open - allow request if rate limiting fails
    return {
      success: true,
      remaining: MAX_ATTEMPTS,
      resetAt: Date.now() + RATE_LIMIT_WINDOW * 1000,
    };
  }
}

/**
 * Reset rate limit for a key
 * @param key Unique identifier
 * @param action Action being rate limited
 */
export async function resetRateLimit(
  key: string,
  action: string = 'default'
): Promise<void> {
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
    return;
  }

  try {
    const rateLimitKey = `rate-limit:${action}:${key}`;
    await kv.del(rateLimitKey);
  } catch (error) {
    console.error('Rate limit reset error:', error);
  }
}

/**
 * Get current rate limit status without incrementing
 * @param key Unique identifier
 * @param action Action being rate limited
 */
export async function getRateLimitStatus(
  key: string,
  action: string = 'default'
): Promise<RateLimitResult> {
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
    return {
      success: true,
      remaining: MAX_ATTEMPTS,
      resetAt: Date.now() + RATE_LIMIT_WINDOW * 1000,
    };
  }

  try {
    const rateLimitKey = `rate-limit:${action}:${key}`;
    const current = await kv.get<number>(rateLimitKey);
    const attempts = current || 0;
    const remaining = Math.max(0, MAX_ATTEMPTS - attempts);
    const ttl = await kv.ttl(rateLimitKey);
    const resetAt = Date.now() + (ttl > 0 ? ttl * 1000 : RATE_LIMIT_WINDOW * 1000);

    return {
      success: attempts < MAX_ATTEMPTS,
      remaining,
      resetAt,
    };
  } catch (error) {
    console.error('Rate limit status error:', error);
    return {
      success: true,
      remaining: MAX_ATTEMPTS,
      resetAt: Date.now() + RATE_LIMIT_WINDOW * 1000,
    };
  }
}
