/**
 * @fileoverview Unit tests for new security functions:
 * - validateMagicBytes: MIME spoofing prevention
 * - sanitizeFileName: path traversal prevention
 */

import { validateMagicBytes, sanitizeFileName } from "../../lib/validators";

// ── validateMagicBytes ────────────────────────────────────────────────────────

describe("validateMagicBytes", () => {
  it("should accept valid PDF with correct magic bytes", () => {
    // %PDF = 0x25 0x50 0x44 0x46
    const buf = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e]);
    expect(validateMagicBytes(buf, "pdf")).toBe(true);
  });

  it("should reject fake PDF (wrong magic bytes)", () => {
    // Text content with .pdf extension
    const buf = Buffer.from("This is not a real PDF file content here");
    expect(validateMagicBytes(buf, "pdf")).toBe(false);
  });

  it("should accept valid DOCX with PK ZIP magic bytes (variant 1)", () => {
    // PK\x03\x04 = ZIP local file header
    const buf = Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x14, 0x00]);
    expect(validateMagicBytes(buf, "docx")).toBe(true);
  });

  it("should accept valid DOCX with PK ZIP magic bytes (variant 2)", () => {
    // PK\x05\x06 = ZIP end of central directory
    const buf = Buffer.from([0x50, 0x4b, 0x05, 0x06, 0x00, 0x00]);
    expect(validateMagicBytes(buf, "docx")).toBe(true);
  });

  it("should reject fake DOCX (wrong magic bytes)", () => {
    const buf = Buffer.from("This is not a zip file at all!");
    expect(validateMagicBytes(buf, "docx")).toBe(false);
  });

  it("should accept any txt file (no magic bytes)", () => {
    const buf = Buffer.from("Hello world this is plain text");
    expect(validateMagicBytes(buf, "txt")).toBe(true);
  });

  it("should accept any md file (no magic bytes)", () => {
    const buf = Buffer.from("# Markdown document");
    expect(validateMagicBytes(buf, "md")).toBe(true);
  });

  it("should return true for unknown extension (allow through)", () => {
    const buf = Buffer.from("any content");
    expect(validateMagicBytes(buf, "unknown")).toBe(true);
  });

  it("should handle empty buffer gracefully for txt", () => {
    const buf = Buffer.from([]);
    expect(validateMagicBytes(buf, "txt")).toBe(true);
  });

  it("should handle single-byte buffer for pdf", () => {
    const buf = Buffer.from([0x25]); // Just % — not a full PDF signature
    expect(validateMagicBytes(buf, "pdf")).toBe(false);
  });
});

// ── sanitizeFileName ──────────────────────────────────────────────────────────

describe("sanitizeFileName", () => {
  it("should return the filename unchanged for normal names", () => {
    expect(sanitizeFileName("contract.pdf")).toBe("contract.pdf");
  });

  it("should prevent path traversal with ../ patterns", () => {
    const result = sanitizeFileName("../../etc/passwd");
    expect(result).not.toContain("..");
    expect(result).not.toContain("/");
    expect(result).toBe("passwd");
  });

  it("should prevent Windows path traversal", () => {
    const result = sanitizeFileName("..\\..\\windows\\system32\\config");
    expect(result).not.toContain("..");
    expect(result).toBe("config");
  });

  it("should strip null bytes", () => {
    const result = sanitizeFileName("file\x00name.pdf");
    expect(result).not.toContain("\x00");
  });

  it("should strip control characters", () => {
    const result = sanitizeFileName("file\x01\x1fname.pdf");
    expect(result).not.toMatch(/[\x00-\x1f]/);
  });

  it("should replace shell-dangerous characters", () => {
    const result = sanitizeFileName('contract<>:"/|?*.pdf');
    expect(result).not.toMatch(/[<>:"/|?*]/);
  });

  it("should handle nested directory paths", () => {
    const result = sanitizeFileName("/home/user/documents/nda.pdf");
    expect(result).toBe("nda.pdf");
  });

  it("should truncate to 255 characters", () => {
    const longName = "a".repeat(300) + ".pdf";
    expect(sanitizeFileName(longName).length).toBeLessThanOrEqual(255);
  });

  it("should handle empty string with fallback", () => {
    const result = sanitizeFileName("");
    expect(result).toBeDefined();
    expect(typeof result).toBe("string");
  });

  it("should preserve dots in filename", () => {
    expect(sanitizeFileName("my.legal.document.pdf")).toBe("my.legal.document.pdf");
  });

  it("should trim leading/trailing whitespace", () => {
    expect(sanitizeFileName("  contract.pdf  ")).toBe("contract.pdf");
  });
});
