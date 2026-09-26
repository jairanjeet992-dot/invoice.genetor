// In-memory sliding window rate limiter for Next.js API routes

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

/**
 * Checks if an IP or key has exceeded allowed requests within the time window.
 * @param key unique identifier (e.g. client IP or session)
 * @param limit maximum allowed calls
 * @param windowMs time window in milliseconds (default 1 minute)
 */
export function checkRateLimit(
  key: string,
  limit: number = 20,
  windowMs: number = 60 * 1000
): { success: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  // Clean up old entries occasionally
  if (rateLimitStore.size > 2000) {
    for (const [k, rec] of rateLimitStore.entries()) {
      if (rec.resetTime < now) {
        rateLimitStore.delete(k);
      }
    }
  }

  if (!record || record.resetTime < now) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    return { success: true, remaining: limit - 1, resetTime: now + windowMs };
  }

  if (record.count >= limit) {
    return { success: false, remaining: 0, resetTime: record.resetTime };
  }

  record.count += 1;
  return { success: true, remaining: limit - record.count, resetTime: record.resetTime };
}
