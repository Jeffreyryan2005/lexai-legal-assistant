/**
 * @route POST /api/analyze
 * @description Analyzes a single legal document and returns structured insights.
 * Accepts multipart form data with a file upload.
 *
 * Security:
 * - Rate limited per IP
 * - File type and size validated
 * - API key server-side only
 * - Input sanitized
 */

import { NextRequest, NextResponse } from "next/server";
import { extractTextFromFile, isSupportedFileType } from "@/lib/extractText";
import { getAnalysisPrompt } from "@/lib/prompts";
import { generateContent, truncateToTokenLimit } from "@/lib/gemini";
import { validateFileMetadata, parseGeminiJson, createErrorResponse, validateMagicBytes, sanitizeFileName } from "@/lib/validators";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest): Promise<NextResponse> {
  // 1. Rate limiting
  const ip = getClientIp(request.headers);
  const rateCheck = checkRateLimit(ip);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      createErrorResponse(
        `Rate limit exceeded. Please wait ${rateCheck.retryAfterSeconds} seconds.`,
        429
      ),
      {
        status: 429,
        headers: {
          "Retry-After": String(rateCheck.retryAfterSeconds),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(rateCheck.resetAt),
        },
      }
    );
  }

  try {
    // 2. Parse multipart form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        createErrorResponse("No file provided. Please upload a PDF, DOCX, or TXT file."),
        { status: 400 }
      );
    }

    // 3. Validate file metadata
    const validation = validateFileMetadata(file.name, file.type, file.size);
    if (!validation.valid) {
      return NextResponse.json(
        createErrorResponse(validation.error ?? "Invalid file"),
        { status: 400 }
      );
    }

    // 4. Check MIME type support
    if (!isSupportedFileType(file.type, file.name)) {
      return NextResponse.json(
        createErrorResponse(
          "Unsupported file type. Please upload a PDF, DOCX, or TXT file."
        ),
        { status: 415 }
      );
    }

    // 5. Extract text from file
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 5a. Sanitize filename — prevent path traversal
    const safeFileName = sanitizeFileName(file.name);

    // 5b. Validate magic bytes — prevent MIME spoofing
    const ext = safeFileName.split(".").pop()?.toLowerCase() ?? "";
    if (!validateMagicBytes(buffer, ext)) {
      return NextResponse.json(
        createErrorResponse(
          "File content does not match its extension. The file may be corrupted or disguised."
        ),
        { status: 415 }
      );
    }

    const extraction = await extractTextFromFile(buffer, file.type, safeFileName);

    if (!extraction.text || extraction.text.trim().length < 50) {
      return NextResponse.json(
        createErrorResponse(
          "Could not extract meaningful text from this file. The document may be scanned, image-based, or empty."
        ),
        { status: 422 }
      );
    }

    // 6. Truncate to token limit and build prompt
    const truncatedText = truncateToTokenLimit(extraction.text);
    const prompt = `${getAnalysisPrompt()}\n\n--- DOCUMENT START ---\n${truncatedText}\n--- DOCUMENT END ---`;

    // 7. Generate analysis with Gemini
    const rawResponse = await generateContent(prompt);

    // 8. Parse and validate the JSON response
    const analysis = parseGeminiJson(rawResponse);
    if (!analysis) {
      return NextResponse.json(
        createErrorResponse("Failed to parse AI analysis. Please try again.", 500),
        { status: 500 }
      );
    }

    // 9. Return structured response with metadata
    return NextResponse.json(
      {
        success: true,
        analysis,
        metadata: {
          fileName: safeFileName,
          fileSize: file.size,
          wordCount: extraction.wordCount,
          pageCount: extraction.pageCount,
          processingTime: new Date().toISOString(),
        },
      },
      {
        headers: {
          "Cache-Control": "no-store, must-revalidate",
          "X-Content-Type-Options": "nosniff",
        },
      }
    );
  } catch (error) {
    logger.error("[/api/analyze] Unhandled error", {
      message: error instanceof Error ? error.message : String(error),
    });

    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";

    // Don't expose internal error details to client
    const safeMessage =
      message.includes("GEMINI_API_KEY") || message.includes("API")
        ? "AI service temporarily unavailable. Please try again later."
        : "Failed to analyze document. Please try again.";

    return NextResponse.json(createErrorResponse(safeMessage, 500), {
      status: 500,
    });
  }
}
