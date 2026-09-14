/**
 * @fileoverview In-memory rate limiter for API routes.
 * Prevents abuse and ensures fair usage of the Gemini API.
 * Uses a sliding window algorithm per IP address.
 */

/** Maximum requests allowed per window */
const MAX_REQUESTS = 20;
/** Window duration in milliseconds (1 minute) */
const WINDOW_MS = 60 * 1000;
/** Maximum number of IPs to track (prevents memory exhaustion) */
const MAX_TRACKED_IPS = 10_000;

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

/** In-memory store for rate limit tracking */
const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Cleans up expired rate limit entries to prevent memory leaks.
 * Called periodically on check.
 */
function cleanupExpired(): void {
  const now = Date.now();
  // Clean up proactively if the store has more than 50 entries
  if (rateLimitStore.size < 50) return;

  for (const [ip, entry] of rateLimitStore.entries()) {
    if (entry.resetAt <= now) {
      rateLimitStore.delete(ip);
    }
  }
}

/**
 * Checks if a request from the given IP is within rate limits.
 *
 * @param ip - The client's IP address
 * @returns Object with allowed status, remaining requests, and reset time
 */
export function checkRateLimit(ip: string): {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfterSeconds: number;
} {
  const now = Date.now();
  cleanupExpired();

  const existing = rateLimitStore.get(ip);

  if (!existing || existing.resetAt <= now) {
    // New window
    const resetAt = now + WINDOW_MS;
    rateLimitStore.set(ip, { count: 1, resetAt });
    return {
      allowed: true,
      remaining: MAX_REQUESTS - 1,
      resetAt,
      retryAfterSeconds: 0,
    };
  }

  if (existing.count >= MAX_REQUESTS) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: existing.resetAt,
      retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000),
    };
  }

  existing.count++;
  return {
    allowed: true,
    remaining: MAX_REQUESTS - existing.count,
    resetAt: existing.resetAt,
    retryAfterSeconds: 0,
  };
}

/**
 * Extracts the client IP address from request headers.
 * Handles proxied requests (Vercel, Cloudflare, etc.).
 *
 * @param headers - Request headers
 * @returns IP address string
 */
export function getClientIp(headers: Headers): string {
  // Check forwarded headers in priority order
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const firstIp = forwarded.split(",")[0]?.trim();
    if (firstIp) return firstIp;
  }

  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp;

  // Fallback for local development
  return "127.0.0.1";
}
