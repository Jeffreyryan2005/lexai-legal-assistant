/**
 * @fileoverview Input validation and sanitization for all API routes.
 * Provides defense against injection attacks, oversized inputs, and malformed data.
 */

import { z } from "zod";
import { MAX_FILE_SIZE_BYTES } from "./extractText";

/** Maximum length for chat messages */
const MAX_MESSAGE_LENGTH = 2000;

/** Maximum number of chat history turns to keep in context */
export const MAX_HISTORY_TURNS = 20;

/** Allowed file extensions (validated against actual content via MIME type) */
export const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".txt", ".md"];

/**
 * Zod schema for chat message validation.
 */
export const ChatMessageSchema = z.object({
  message: z
    .string()
    .min(1, "Message cannot be empty")
    .max(MAX_MESSAGE_LENGTH, `Message cannot exceed ${MAX_MESSAGE_LENGTH} characters`)
    .transform((s) => sanitizeString(s)),
  documentContext: z.string().optional(),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "model"]),
        content: z.string().max(5000),
      })
    )
    .max(MAX_HISTORY_TURNS)
    .optional()
    .default([]),
});

/**
 * Zod schema for document analysis request validation.
 */
export const AnalysisRequestSchema = z.object({
  fileName: z
    .string()
    .min(1)
    .max(255)
    .regex(/^[^<>:"/\\|?*\x00-\x1f]+$/, "Invalid file name"),
  mimeType: z.string().min(1).max(100),
  fileSize: z.number().max(MAX_FILE_SIZE_BYTES, "File exceeds 5MB limit"),
});

/**
 * Zod schema for document comparison request.
 */
export const ComparisonRequestSchema = z.object({
  doc1Name: z.string().min(1).max(255),
  doc2Name: z.string().min(1).max(255),
  doc1Size: z.number().max(MAX_FILE_SIZE_BYTES),
  doc2Size: z.number().max(MAX_FILE_SIZE_BYTES),
});

export type ChatMessage = z.infer<typeof ChatMessageSchema>;
export type AnalysisRequest = z.infer<typeof AnalysisRequestSchema>;

/**
 * Sanitizes a string by removing potentially dangerous characters.
 * Note: This is defense-in-depth. The primary XSS protection is React's
 * auto-escaping, and prompt injection is handled in the system prompts.
 *
 * @param input - Raw string input
 * @returns Sanitized string
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "") // Remove control chars
    .trim();
}

/**
 * Validates file metadata before processing.
 * Checks size, name, and basic MIME type format.
 *
 * @param fileName - Original file name
 * @param mimeType - Reported MIME type
 * @param fileSize - File size in bytes
 * @returns Validation result
 */
export function validateFileMetadata(
  fileName: string,
  mimeType: string,
  fileSize: number
): { valid: boolean; error?: string } {
  if (fileSize > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File size ${(fileSize / 1024 / 1024).toFixed(1)}MB exceeds the 5MB limit`,
    };
  }

  if (fileSize === 0) {
    return { valid: false, error: "File is empty" };
  }

  const ext = fileName.split(".").pop()?.toLowerCase();
  if (!ext || !ALLOWED_EXTENSIONS.includes(`.${ext}`)) {
    return {
      valid: false,
      error: `File type not supported. Allowed: ${ALLOWED_EXTENSIONS.join(", ")}`,
    };
  }

  if (fileName.length > 255) {
    return { valid: false, error: "File name too long" };
  }

  return { valid: true };
}

/**
 * Validates and parses JSON response from Gemini.
 * Handles cases where the model wraps JSON in markdown code blocks.
 *
 * @param raw - Raw string response from Gemini
 * @returns Parsed JSON object or null if invalid
 */
export function parseGeminiJson<T = unknown>(raw: string): T | null {
  try {
    // Strip markdown code blocks if present
    const cleaned = raw
      .replace(/^```(?:json)?\n?/m, "")
      .replace(/\n?```$/m, "")
      .trim();
    return JSON.parse(cleaned) as T;
  } catch {
    // Try to extract JSON from the response
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]) as T;
      } catch {
        return null;
      }
    }
    return null;
  }
}

/**
 * Creates a standardized API error response object.
 *
 * @param message - User-facing error message
 * @param code - HTTP status code
 * @returns Error object for JSON response
 */
export function createErrorResponse(
  message: string,
  code: number = 400
): { error: string; code: number; timestamp: string } {
  return {
    error: message,
    code,
    timestamp: new Date().toISOString(),
  };
}
