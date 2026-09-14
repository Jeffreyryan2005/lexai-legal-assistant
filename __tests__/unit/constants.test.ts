/**
 * @fileoverview Unit tests for lib/constants.ts
 * Verifies all constant values are correctly defined and within expected ranges.
 */

import {
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
  API_MAX_DURATION,
} from "../../lib/constants";

describe("lib/constants", () => {
  describe("file limits", () => {
    it("MAX_FILE_SIZE_BYTES should be 5MB", () => {
      expect(MAX_FILE_SIZE_BYTES).toBe(5 * 1024 * 1024);
    });

    it("MAX_FILE_NAME_LENGTH should be 255", () => {
      expect(MAX_FILE_NAME_LENGTH).toBe(255);
    });

    it("MIN_DOCUMENT_LENGTH should be a positive number", () => {
      expect(MIN_DOCUMENT_LENGTH).toBeGreaterThan(0);
    });
  });

  describe("rate limiting", () => {
    it("RATE_LIMIT_MAX_REQUESTS should be 20", () => {
      expect(RATE_LIMIT_MAX_REQUESTS).toBe(20);
    });

    it("RATE_LIMIT_WINDOW_MS should be 60 seconds", () => {
      expect(RATE_LIMIT_WINDOW_MS).toBe(60_000);
    });

    it("rate limit window should be in milliseconds (>1000)", () => {
      expect(RATE_LIMIT_WINDOW_MS).toBeGreaterThan(1000);
    });
  });

  describe("Gemini AI config", () => {
    it("GEMINI_MAX_TOKENS should be a large number for legal docs", () => {
      expect(GEMINI_MAX_TOKENS).toBeGreaterThan(100_000);
    });

    it("GEMINI_TEMPERATURE should be between 0 and 1", () => {
      expect(GEMINI_TEMPERATURE).toBeGreaterThanOrEqual(0);
      expect(GEMINI_TEMPERATURE).toBeLessThanOrEqual(1);
    });

    it("GEMINI_TEMPERATURE should be low for deterministic legal analysis", () => {
      expect(GEMINI_TEMPERATURE).toBeLessThan(0.5);
    });

    it("GEMINI_MAX_RETRIES should be positive", () => {
      expect(GEMINI_MAX_RETRIES).toBeGreaterThan(0);
    });
  });

  describe("chat config", () => {
    it("MAX_HISTORY_TURNS should be positive", () => {
      expect(MAX_HISTORY_TURNS).toBeGreaterThan(0);
    });

    it("MAX_CHAT_MESSAGE_LENGTH should be reasonable (>=500)", () => {
      expect(MAX_CHAT_MESSAGE_LENGTH).toBeGreaterThanOrEqual(500);
    });
  });

  describe("file types", () => {
    it("SUPPORTED_MIME_TYPES should include PDF", () => {
      expect(SUPPORTED_MIME_TYPES).toContain("application/pdf");
    });

    it("SUPPORTED_MIME_TYPES should include DOCX", () => {
      expect(SUPPORTED_MIME_TYPES).toContain(
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      );
    });

    it("SUPPORTED_MIME_TYPES should include plain text", () => {
      expect(SUPPORTED_MIME_TYPES).toContain("text/plain");
    });

    it("ALLOWED_EXTENSIONS should include .pdf", () => {
      expect(ALLOWED_EXTENSIONS).toContain(".pdf");
    });

    it("ALLOWED_EXTENSIONS should include .docx", () => {
      expect(ALLOWED_EXTENSIONS).toContain(".docx");
    });

    it("ALLOWED_EXTENSIONS should include .txt", () => {
      expect(ALLOWED_EXTENSIONS).toContain(".txt");
    });

    it("ALLOWED_EXTENSIONS should all start with a dot", () => {
      for (const ext of ALLOWED_EXTENSIONS) {
        expect(ext.startsWith(".")).toBe(true);
      }
    });
  });

  describe("legal disclaimer", () => {
    it("LEGAL_DISCLAIMER should be a non-empty string", () => {
      expect(typeof LEGAL_DISCLAIMER).toBe("string");
      expect(LEGAL_DISCLAIMER.length).toBeGreaterThan(0);
    });

    it("LEGAL_DISCLAIMER should mention legal advice", () => {
      expect(LEGAL_DISCLAIMER.toLowerCase()).toContain("legal advice");
    });

    it("LEGAL_DISCLAIMER should direct users to professionals", () => {
      expect(LEGAL_DISCLAIMER.toLowerCase()).toContain("professional");
    });
  });

  describe("API config", () => {
    it("API_MAX_DURATION should be at least 30 seconds", () => {
      expect(API_MAX_DURATION).toBeGreaterThanOrEqual(30);
    });
  });
});
