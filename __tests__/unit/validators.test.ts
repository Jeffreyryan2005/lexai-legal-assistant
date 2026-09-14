/**
 * @fileoverview Unit tests for the validators module.
 * Tests input validation, sanitization, and JSON parsing utilities.
 */

import {
  validateFileMetadata,
  sanitizeString,
  parseGeminiJson,
  createErrorResponse,
  ChatMessageSchema,
} from "../../lib/validators";

describe("validateFileMetadata", () => {
  it("should accept valid PDF file", () => {
    const result = validateFileMetadata("contract.pdf", "application/pdf", 1024);
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it("should accept valid DOCX file", () => {
    const result = validateFileMetadata(
      "agreement.docx",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      2048
    );
    expect(result.valid).toBe(true);
  });

  it("should accept valid TXT file", () => {
    const result = validateFileMetadata("terms.txt", "text/plain", 512);
    expect(result.valid).toBe(true);
  });

  it("should reject file exceeding size limit", () => {
    const oversizedBytes = 6 * 1024 * 1024; // 6MB
    const result = validateFileMetadata("big.pdf", "application/pdf", oversizedBytes);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("5MB");
  });

  it("should reject empty file", () => {
    const result = validateFileMetadata("empty.pdf", "application/pdf", 0);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("empty");
  });

  it("should reject unsupported file types", () => {
    const result = validateFileMetadata("malware.exe", "application/octet-stream", 1024);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("not supported");
  });

  it("should reject file with very long name", () => {
    const longName = "a".repeat(256) + ".pdf";
    const result = validateFileMetadata(longName, "application/pdf", 1024);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("too long");
  });
});

describe("sanitizeString", () => {
  it("should remove control characters", () => {
    const input = "Hello\x00World\x08Test";
    const result = sanitizeString(input);
    expect(result).toBe("HelloWorldTest");
  });

  it("should trim whitespace", () => {
    const result = sanitizeString("  hello  ");
    expect(result).toBe("hello");
  });

  it("should preserve normal text and punctuation", () => {
    const input = "This is a legal contract! With $1,000.00 amounts.";
    const result = sanitizeString(input);
    expect(result).toBe(input.trim());
  });

  it("should handle empty string", () => {
    expect(sanitizeString("")).toBe("");
  });

  it("should preserve newlines (allowed control chars)", () => {
    const result = sanitizeString("line 1\nline 2");
    expect(result).toContain("\n");
  });
});

describe("parseGeminiJson", () => {
  it("should parse clean JSON", () => {
    const raw = '{"key": "value", "score": 7}';
    const result = parseGeminiJson<{ key: string; score: number }>(raw);
    expect(result).toEqual({ key: "value", score: 7 });
  });

  it("should strip markdown code blocks", () => {
    const raw = "```json\n{\"documentType\": \"NDA\"}\n```";
    const result = parseGeminiJson<{ documentType: string }>(raw);
    expect(result).toEqual({ documentType: "NDA" });
  });

  it("should strip code blocks without language tag", () => {
    const raw = "```\n{\"key\": \"test\"}\n```";
    const result = parseGeminiJson<{ key: string }>(raw);
    expect(result).toEqual({ key: "test" });
  });

  it("should extract JSON from surrounding text", () => {
    const raw = 'Here is the analysis: {"score": 5, "level": "medium"} End.';
    const result = parseGeminiJson<{ score: number; level: string }>(raw);
    expect(result).toEqual({ score: 5, level: "medium" });
  });

  it("should return null for invalid JSON", () => {
    const result = parseGeminiJson("This is not JSON at all");
    expect(result).toBeNull();
  });

  it("should return null for malformed JSON", () => {
    const result = parseGeminiJson("{malformed: json}");
    expect(result).toBeNull();
  });
});

describe("createErrorResponse", () => {
  it("should create error response with default code 400", () => {
    const response = createErrorResponse("Something went wrong");
    expect(response.error).toBe("Something went wrong");
    expect(response.code).toBe(400);
    expect(response.timestamp).toBeDefined();
  });

  it("should accept custom status codes", () => {
    const response = createErrorResponse("Server error", 500);
    expect(response.code).toBe(500);
  });

  it("should include ISO timestamp", () => {
    const response = createErrorResponse("Error");
    const parsed = new Date(response.timestamp);
    expect(parsed.getTime()).not.toBeNaN();
  });
});

describe("ChatMessageSchema", () => {
  it("should validate valid message", () => {
    const result = ChatMessageSchema.safeParse({
      message: "What does this clause mean?",
    });
    expect(result.success).toBe(true);
  });

  it("should reject empty message", () => {
    const result = ChatMessageSchema.safeParse({ message: "" });
    expect(result.success).toBe(false);
  });

  it("should reject message exceeding max length", () => {
    const result = ChatMessageSchema.safeParse({
      message: "x".repeat(2001),
    });
    expect(result.success).toBe(false);
  });

  it("should default history to empty array", () => {
    const result = ChatMessageSchema.safeParse({
      message: "Hello",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.history).toEqual([]);
    }
  });

  it("should accept valid history", () => {
    const result = ChatMessageSchema.safeParse({
      message: "Follow-up question",
      history: [
        { role: "user", content: "First question" },
        { role: "model", content: "First answer" },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("should reject invalid role in history", () => {
    const result = ChatMessageSchema.safeParse({
      message: "Hello",
      history: [{ role: "assistant", content: "test" }],
    });
    expect(result.success).toBe(false);
  });
});
