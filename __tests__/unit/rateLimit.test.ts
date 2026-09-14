/**
 * @fileoverview Unit tests for rate limiter module.
 */

import { checkRateLimit, getClientIp } from "../../lib/rateLimit";

describe("checkRateLimit", () => {
  it("should allow first request for a new IP", () => {
    const result = checkRateLimit("192.168.1.1");
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBeGreaterThan(0);
  });

  it("should decrement remaining on each request", () => {
    const ip = "10.0.0.1";
    const first = checkRateLimit(ip);
    const second = checkRateLimit(ip);
    expect(second.remaining).toBeLessThan(first.remaining);
  });

  it("should block after exceeding limit", () => {
    const ip = `unique-test-ip-${Date.now()}`;
    // Exhaust the limit (20 requests)
    let last;
    for (let i = 0; i < 21; i++) {
      last = checkRateLimit(ip);
    }
    expect(last?.allowed).toBe(false);
    expect(last?.remaining).toBe(0);
    expect(last?.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("should provide a reset time in the future", () => {
    const result = checkRateLimit("172.16.0.1");
    expect(result.resetAt).toBeGreaterThan(Date.now());
  });

  it("should return 0 retryAfterSeconds when allowed", () => {
    const result = checkRateLimit(`fresh-ip-${Date.now()}-2`);
    expect(result.retryAfterSeconds).toBe(0);
  });
});

describe("getClientIp", () => {
  it("should extract IP from X-Forwarded-For header", () => {
    const headers = new Headers({ "x-forwarded-for": "203.0.113.1, 10.0.0.1" });
    const ip = getClientIp(headers);
    expect(ip).toBe("203.0.113.1");
  });

  it("should fall back to X-Real-IP header", () => {
    const headers = new Headers({ "x-real-ip": "198.51.100.5" });
    const ip = getClientIp(headers);
    expect(ip).toBe("198.51.100.5");
  });

  it("should return localhost for missing headers", () => {
    const headers = new Headers({});
    const ip = getClientIp(headers);
    expect(ip).toBe("127.0.0.1");
  });

  it("should use first IP in X-Forwarded-For chain", () => {
    const headers = new Headers({
      "x-forwarded-for": "1.2.3.4, 5.6.7.8, 9.10.11.12",
    });
    const ip = getClientIp(headers);
    expect(ip).toBe("1.2.3.4");
  });
});
