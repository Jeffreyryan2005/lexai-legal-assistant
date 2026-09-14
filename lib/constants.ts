/**
 * @fileoverview Application-wide constants for LexAI.
 * Centralizes all magic numbers, limits, and configuration values.
 * Never put secrets here — use environment variables for those.
 */

// ── File Upload Limits ─────────────────────────────────────────────────────

/** Maximum file size allowed for upload: 5 MB */
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

/** Maximum file name length */
export const MAX_FILE_NAME_LENGTH = 255;

/** Minimum document length (characters) to be meaningful */
export const MIN_DOCUMENT_LENGTH = 50;

// ── Rate Limiting ──────────────────────────────────────────────────────────

/** Maximum requests per window per IP address */
export const RATE_LIMIT_MAX_REQUESTS = 20;

/** Sliding window duration in milliseconds (60 seconds) */
export const RATE_LIMIT_WINDOW_MS = 60 * 1000;

// ── Gemini AI Configuration ────────────────────────────────────────────────

/** Maximum token budget for document text sent to Gemini (~900k tokens) */
export const GEMINI_MAX_TOKENS = 900_000;

/** Characters per token approximation for English legal text */
export const CHARS_PER_TOKEN = 4;

/** Temperature for legal analysis (low = more deterministic/accurate) */
export const GEMINI_TEMPERATURE = 0.2;

/** Maximum retry attempts on transient Gemini errors */
export const GEMINI_MAX_RETRIES = 3;

/** Base delay for exponential backoff in milliseconds */
export const GEMINI_RETRY_BASE_DELAY_MS = 1000;

// ── Chat Configuration ─────────────────────────────────────────────────────

/** Maximum number of chat history turns sent to Gemini for context */
export const MAX_HISTORY_TURNS = 10;

/** Maximum characters in a single chat message */
export const MAX_CHAT_MESSAGE_LENGTH = 2000;

// ── Supported File Types ───────────────────────────────────────────────────

/** MIME types accepted for document upload */
export const SUPPORTED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/markdown",
] as const;

/** File extensions accepted for document upload */
export const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".txt", ".md"] as const;

// ── API Route Config ───────────────────────────────────────────────────────

/** Node.js runtime required for pdf-parse and mammoth */
export const API_RUNTIME = "nodejs" as const;

/** Maximum duration (seconds) for API route execution on Vercel */
export const API_MAX_DURATION = 60;

// ── Legal Disclaimer ───────────────────────────────────────────────────────

/**
 * Standard disclaimer appended to all AI-generated legal analysis.
 * Must be shown to users on every page and in every analysis.
 */
export const LEGAL_DISCLAIMER =
  "This analysis is for informational purposes only and does not constitute legal advice. " +
  "Always consult a qualified legal professional for advice specific to your situation.";
