/**
 * @fileoverview Next.js Proxy (formerly Middleware) — runs on every request before routing.
 * Adds security headers, blocks suspicious patterns, and enforces safe defaults.
 *
 * Runs at the Edge — extremely fast, no Node.js runtime needed.
 */

import { NextResponse, type NextRequest } from "next/server";

/**
 * Paths that require the API key to be set.
 * Used to return a clear error if the server is misconfigured.
 */
const API_PATHS = ["/api/analyze", "/api/compare", "/api/chat"];

/**
 * Suspicious patterns that may indicate prompt injection attempts via URL.
 * Defense-in-depth: prompts themselves are also protected.
 */
const SUSPICIOUS_PATTERNS = [
  /ignore\s+previous\s+instructions/i,
  /system\s*:\s*you\s+are/i,
  /<script\b/i,
  /javascript:/i,
];

export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  // ── 1. Block obviously suspicious URL patterns ──
  const fullUrl = request.url;
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(fullUrl)) {
      return NextResponse.json(
        { error: "Request blocked", code: 400 },
        { status: 400 }
      );
    }
  }

  // ── 2. Check API key is configured for API routes ──
  if (API_PATHS.some((p) => pathname.startsWith(p))) {
    if (!process.env["GEMINI_API_KEY"]) {
      return NextResponse.json(
        {
          error:
            "Server misconfiguration: GEMINI_API_KEY is not set. Please configure the environment variable.",
          code: 503,
        },
        { status: 503 }
      );
    }
  }

  // ── 3. Build response with security headers ──
  const response = NextResponse.next();

  // Prevent the browser from MIME-sniffing
  response.headers.set("X-Content-Type-Options", "nosniff");
  // Prevent clickjacking
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  // Enable XSS filter in older browsers
  response.headers.set("X-XSS-Protection", "1; mode=block");
  // Control referrer information
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  // Restrict browser features
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=()"
  );
  // Remove server identification
  response.headers.delete("X-Powered-By");

  // Rate limit headers for transparency
  if (API_PATHS.some((p) => pathname.startsWith(p))) {
    response.headers.set("X-RateLimit-Policy", "20;w=60");
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
