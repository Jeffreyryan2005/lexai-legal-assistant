/**
 * @route POST /api/compare
 * @description Compares two legal documents and highlights differences, risks, and recommendations.
 * Accepts multipart form data with two file uploads.
 *
 * Security:
 * - Rate limited per IP
 * - Both files validated independently
 * - Prompt injection defended in system prompt
 */

import { NextRequest, NextResponse } from "next/server";
import { extractTextFromFile, isSupportedFileType } from "@/lib/extractText";
import { getComparisonPrompt } from "@/lib/prompts";
import { generateContent, truncateToTokenLimit } from "@/lib/gemini";
import { validateFileMetadata, parseGeminiJson, createErrorResponse } from "@/lib/validators";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";
export const maxDuration = 90;

/**
 * Validates and extracts text from a form file entry.
 * Returns error message or extracted text.
 */
async function processFileEntry(
  formData: FormData,
  fieldName: string,
  label: string
): Promise<{ text: string; name: string; words: number } | { error: string }> {
  const file = formData.get(fieldName) as File | null;
  if (!file) {
    return { error: `${label} is required. Please upload a file.` };
  }

  const validation = validateFileMetadata(file.name, file.type, file.size);
  if (!validation.valid) {
    return { error: `${label}: ${validation.error}` };
  }

  if (!isSupportedFileType(file.type, file.name)) {
    return {
      error: `${label}: Unsupported file type. Please use PDF, DOCX, or TXT.`,
    };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const extraction = await extractTextFromFile(buffer, file.type, file.name);

  if (!extraction.text || extraction.text.trim().length < 50) {
    return {
      error: `${label}: Could not extract meaningful text from this file.`,
    };
  }

  return {
    text: extraction.text,
    name: file.name,
    words: extraction.wordCount,
  };
}

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
      { status: 429 }
    );
  }

  try {
    const formData = await request.formData();

    // 2. Process both files
    const [result1, result2] = await Promise.all([
      processFileEntry(formData, "file1", "Document 1"),
      processFileEntry(formData, "file2", "Document 2"),
    ]);

    if ("error" in result1) {
      return NextResponse.json(createErrorResponse(result1.error), { status: 400 });
    }
    if ("error" in result2) {
      return NextResponse.json(createErrorResponse(result2.error), { status: 400 });
    }

    // 3. Build comparison prompt with both documents
    // Split the token budget between two documents
    const maxTokensPerDoc = 400_000;
    const text1 = truncateToTokenLimit(result1.text, maxTokensPerDoc);
    const text2 = truncateToTokenLimit(result2.text, maxTokensPerDoc);

    const prompt = `${getComparisonPrompt()}

[DOCUMENT 1] - "${result1.name}"
--- START ---
${text1}
--- END ---

[DOCUMENT 2] - "${result2.name}"
--- START ---
${text2}
--- END ---`;

    // 4. Generate comparison
    const rawResponse = await generateContent(prompt);
    const comparison = parseGeminiJson(rawResponse);

    if (!comparison) {
      return NextResponse.json(
        createErrorResponse("Failed to parse comparison analysis. Please try again.", 500),
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      comparison,
      metadata: {
        doc1: { name: result1.name, wordCount: result1.words },
        doc2: { name: result2.name, wordCount: result2.words },
        processingTime: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error("[/api/compare] Unhandled error", {
      message: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      createErrorResponse("Failed to compare documents. Please try again.", 500),
      { status: 500 }
    );
  }
}
