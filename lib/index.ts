/**
 * @fileoverview Barrel export for all LexAI library modules.
 * Provides a single import point for shared utilities.
 *
 * Usage:
 * ```ts
 * import { cn, sanitizeString, scoreToRisk } from "@/lib";
 * ```
 */

// Utilities
export { cn } from "./utils";

// Constants
export {
  MAX_FILE_SIZE_BYTES,
  MAX_FILE_NAME_LENGTH,
  MIN_DOCUMENT_LENGTH,
  RATE_LIMIT_MAX_REQUESTS,
  RATE_LIMIT_WINDOW_MS,
  GEMINI_MAX_TOKENS,
  GEMINI_TEMPERATURE,
  GEMINI_MAX_RETRIES,
  MAX_HISTORY_TURNS,
  MAX_CHAT_MESSAGE_LENGTH,
  SUPPORTED_MIME_TYPES,
  ALLOWED_EXTENSIONS,
  LEGAL_DISCLAIMER,
} from "./constants";

// Validators
export {
  sanitizeString,
  sanitizeFileName,
  validateFileMetadata,
  validateMagicBytes,
  parseGeminiJson,
  createErrorResponse,
  ChatMessageSchema,
  AnalysisRequestSchema,
  ComparisonRequestSchema,
} from "./validators";

// Risk scoring
export {
  scoreToRisk,
  riskLevelToColors,
  aggregateRiskScore,
} from "./riskScorer";

// Rate limiting
export { checkRateLimit, getClientIp } from "./rateLimit";

// Text extraction
export {
  extractTextFromFile,
  isSupportedFileType,
  SUPPORTED_FILE_TYPES,
} from "./extractText";

// Logging
export { logger } from "./logger";

// High-performance caching
export {
  EfficientCache,
  analysisCache,
  comparisonCache,
  type CacheEntry,
  type CacheStats,
} from "./cache";
