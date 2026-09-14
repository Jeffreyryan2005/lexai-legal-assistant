/**
 * @fileoverview Text extraction utilities for legal documents.
 * Supports PDF, DOCX, and plain text files.
 * Server-side only — uses Node.js APIs.
 */

/**
 * Supported file types for text extraction.
 */
export const SUPPORTED_FILE_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/markdown",
] as const;

export type SupportedMimeType = (typeof SUPPORTED_FILE_TYPES)[number];

/**
 * Maximum file size in bytes (5MB).
 * Prevents server overload and ensures quick processing.
 */
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

/**
 * Result of text extraction.
 */
export interface ExtractionResult {
  text: string;
  pageCount?: number;
  wordCount: number;
  mimeType: string;
  fileName: string;
}

/**
 * Extracts text from a PDF file buffer.
 * @param buffer - The PDF file as a Buffer
 * @returns Extracted text and metadata
 */
async function extractFromPdf(
  buffer: Buffer
): Promise<{ text: string; pageCount: number }> {
  // pdf-parse is a CommonJS module; dynamic import gives us its module shape.
  // We cast via unknown to work around the ESM/CJS boundary in strict TS.
  type PdfParseResult = { text: string; numpages: number };
  type PdfParseFn = (buffer: Buffer) => Promise<PdfParseResult>;
  const mod = await import("pdf-parse");
  const pdfParse: PdfParseFn =
    (mod as unknown as { default: PdfParseFn }).default ??
    (mod as unknown as PdfParseFn);
  const data = await pdfParse(buffer);
  return {
    text: data.text,
    pageCount: data.numpages,
  };
}

/**
 * Extracts text from a DOCX file buffer.
 * @param buffer - The DOCX file as a Buffer
 * @returns Extracted text
 */
async function extractFromDocx(buffer: Buffer): Promise<{ text: string }> {
  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({ buffer });
  return { text: result.value };
}

/**
 * Counts words in a string.
 * @param text - Input text
 * @returns Word count
 */
function countWords(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
}

/**
 * Cleans and normalizes extracted text.
 * Removes excessive whitespace and null bytes.
 * @param text - Raw extracted text
 * @returns Cleaned text
 */
function cleanText(text: string): string {
  return text
    .replace(/\0/g, "") // Remove null bytes
    .replace(/\r\n/g, "\n") // Normalize line endings
    .replace(/\r/g, "\n")
    .replace(/\n{4,}/g, "\n\n\n") // Max 3 consecutive newlines
    .replace(/[ \t]{2,}/g, " ") // Collapse multiple spaces
    .trim();
}

/**
 * Extracts text from a file given its buffer, MIME type, and name.
 *
 * @param buffer - File contents as Buffer
 * @param mimeType - MIME type of the file
 * @param fileName - Original file name
 * @returns Extraction result with text and metadata
 * @throws Error if file type is not supported
 */
export async function extractTextFromFile(
  buffer: Buffer,
  mimeType: string,
  fileName: string
): Promise<ExtractionResult> {
  let text: string;
  let pageCount: number | undefined;

  const normalizedMime = mimeType.toLowerCase().split(";")[0]?.trim() ?? "";

  if (
    normalizedMime === "application/pdf" ||
    fileName.toLowerCase().endsWith(".pdf")
  ) {
    const result = await extractFromPdf(buffer);
    text = result.text;
    pageCount = result.pageCount;
  } else if (
    normalizedMime ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    fileName.toLowerCase().endsWith(".docx")
  ) {
    const result = await extractFromDocx(buffer);
    text = result.text;
  } else if (
    normalizedMime === "text/plain" ||
    normalizedMime === "text/markdown" ||
    fileName.toLowerCase().endsWith(".txt") ||
    fileName.toLowerCase().endsWith(".md")
  ) {
    text = buffer.toString("utf-8");
  } else {
    throw new Error(
      `Unsupported file type: ${mimeType}. ` +
        `Supported types: PDF, DOCX, TXT, MD`
    );
  }

  const cleanedText = cleanText(text);

  return {
    text: cleanedText,
    pageCount,
    wordCount: countWords(cleanedText),
    mimeType: normalizedMime,
    fileName,
  };
}

/**
 * Checks if a given MIME type is supported.
 * @param mimeType - MIME type to check
 * @param fileName - File name as fallback check
 * @returns true if supported
 */
export function isSupportedFileType(
  mimeType: string,
  fileName: string
): boolean {
  const mime = mimeType.toLowerCase().split(";")[0]?.trim() ?? "";
  const name = fileName.toLowerCase();

  return (
    mime === "application/pdf" ||
    mime ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mime === "text/plain" ||
    mime === "text/markdown" ||
    name.endsWith(".pdf") ||
    name.endsWith(".docx") ||
    name.endsWith(".txt") ||
    name.endsWith(".md")
  );
}
