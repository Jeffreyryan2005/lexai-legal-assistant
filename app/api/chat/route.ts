/**
 * @route POST /api/chat
 * @description Streaming Q&A chat grounded on uploaded document context.
 * Uses Server-Sent Events (SSE) for real-time streaming responses.
 *
 * Security:
 * - Rate limited per IP
 * - Message length validated
 * - Document context sanitized
 * - Streaming prevents timeout on long responses
 */

import { NextRequest, NextResponse } from "next/server";
import { getChatSystemPrompt } from "@/lib/prompts";
import { generateChatStream, truncateToTokenLimit } from "@/lib/gemini";
import { ChatMessageSchema, createErrorResponse } from "@/lib/validators";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest): Promise<NextResponse | Response> {
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
    // 2. Parse and validate request body
    const body = (await request.json()) as unknown;
    const parseResult = ChatMessageSchema.safeParse(body);

    if (!parseResult.success) {
      const errors = parseResult.error.issues.map((e: { message: string }) => e.message).join(", ");
      return NextResponse.json(
        createErrorResponse(`Invalid request: ${errors}`),
        { status: 400 }
      );
    }

    const { message, documentContext, history } = parseResult.data;

    // 3. Truncate document context if provided
    const truncatedContext = documentContext
      ? truncateToTokenLimit(documentContext, 300_000)
      : undefined;

    // 4. Build system prompt with document context
    const systemPrompt = getChatSystemPrompt(truncatedContext);

    // 5. Stream response using Server-Sent Events
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const streamResult = await generateChatStream(
            systemPrompt,
            history ?? [],
            message
          );

          for await (const chunk of streamResult.stream) {
            const text = chunk.text();
            if (text) {
              // SSE format: "data: {json}\n\n"
              const data = JSON.stringify({ text, done: false });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }
          }

          // Send completion signal
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ text: "", done: true })}\n\n`)
          );
          controller.close();
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Streaming error";
          const safeMessage = message.includes("API")
            ? "AI service temporarily unavailable."
            : message;
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: safeMessage, done: true })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no", // Disable Nginx buffering for SSE
      },
    });
  } catch (error) {
    console.error("[/api/chat] Error:", error);
    return NextResponse.json(
      createErrorResponse("Chat service temporarily unavailable.", 500),
      { status: 500 }
    );
  }
}
