/**
 * @fileoverview Lightweight structured logger for server-side use.
 * In production, logs go to stdout in JSON format for log aggregation services.
 * Prevents accidental exposure of sensitive data in client-side bundles.
 *
 * Usage:
 * ```ts
 * import { logger } from "@/lib/logger";
 * logger.error("[/api/analyze]", { message: error.message });
 * ```
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
}

/**
 * Formats a log entry as structured JSON for production log aggregation.
 */
function formatEntry(
  level: LogLevel,
  message: string,
  context?: Record<string, unknown>
): LogEntry {
  return {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...(context ? { context } : {}),
  };
}

/**
 * Sanitizes context data to remove sensitive fields before logging.
 * Never log API keys, passwords, or document content.
 */
function sanitizeContext(
  context?: Record<string, unknown>
): Record<string, unknown> | undefined {
  if (!context) return undefined;
  const safe = { ...context };
  // Remove fields that should never appear in logs
  for (const key of ["apiKey", "password", "token", "secret", "authorization"]) {
    if (key in safe) safe[key] = "[REDACTED]";
  }
  return safe;
}

const isDev = process.env["NODE_ENV"] !== "production";

export const logger = {
  debug(message: string, context?: Record<string, unknown>): void {
    if (!isDev) return; // Only log debug in development
    const entry = formatEntry("debug", message, sanitizeContext(context));
    console.debug(JSON.stringify(entry));
  },

  info(message: string, context?: Record<string, unknown>): void {
    const entry = formatEntry("info", message, sanitizeContext(context));
    console.info(JSON.stringify(entry));
  },

  warn(message: string, context?: Record<string, unknown>): void {
    const entry = formatEntry("warn", message, sanitizeContext(context));
    console.warn(JSON.stringify(entry));
  },

  error(message: string, context?: Record<string, unknown>): void {
    const entry = formatEntry("error", message, sanitizeContext(context));
    console.error(JSON.stringify(entry));
  },
};
