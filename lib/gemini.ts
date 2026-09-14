/**
 * @fileoverview Gemini AI client with streaming support, retry logic, and rate limiting.
 * All API calls are server-side only — the API key is never exposed to the client.
 */

import {
  GoogleGenerativeAI,
  GenerativeModel,
  GenerateContentStreamResult,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

/** Maximum number of retry attempts for transient errors */
const MAX_RETRIES = 3;
/** Base delay in milliseconds for exponential backoff */
const BASE_DELAY_MS = 1000;
/** Maximum tokens to send per request (Gemini 2.0 Flash context window) */
const MAX_INPUT_TOKENS = 900_000;
/** Rough token estimate: 1 token ≈ 4 chars */
const CHARS_PER_TOKEN = 4;

/**
 * Safety settings to prevent harmful content generation.
 * Legal context requires balanced settings — not too restrictive for legal terms.
 */
const SAFETY_SETTINGS = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
];

let cachedModel: GenerativeModel | null = null;
let lastApiKey: string | null = null;

/**
 * Initializes and returns the Gemini generative model using a Singleton pattern.
 * Caches the initialized model instance across warm serverless/Node.js invocations,
 * preventing expensive client recreation and connection pool resets.
 */
function getModel(): GenerativeModel {
  const apiKey = process.env["GEMINI_API_KEY"];
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY environment variable is not set. " +
        "Please add it to your .env.local file."
    );
  }

  // Reuse existing model instance if API key hasn't changed
  if (cachedModel && lastApiKey === apiKey) {
    return cachedModel;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  cachedModel = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    safetySettings: SAFETY_SETTINGS,
    generationConfig: {
      temperature: 0.2, // Lower temperature for more deterministic legal analysis
      topP: 0.8,
      topK: 40,
      maxOutputTokens: 8192,
    },
  });
  lastApiKey = apiKey;

  return cachedModel;
}

/**
 * Sleeps for a given number of milliseconds.
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Truncates text to stay within the token limit.
 * @param text - The input text to truncate
 * @param maxTokens - Maximum tokens allowed
 * @returns Truncated text with a notice if truncation occurred
 */
export function truncateToTokenLimit(
  text: string,
  maxTokens: number = MAX_INPUT_TOKENS
): string {
  const maxChars = maxTokens * CHARS_PER_TOKEN;
  if (text.length <= maxChars) return text;

  const truncated = text.slice(0, maxChars);
  return (
    truncated +
    "\n\n[Document truncated due to length. Analysis is based on the first portion of the document.]"
  );
}

/**
 * Generates a complete (non-streaming) response from Gemini.
 * Includes exponential backoff retry for transient failures.
 *
 * @param prompt - The full prompt to send
 * @returns The text response from the model
 */
export async function generateContent(prompt: string): Promise<string> {
  const model = getModel();
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      return text;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      const isRetryable =
        lastError.message.includes("429") ||
        lastError.message.includes("503") ||
        lastError.message.includes("500");

      if (!isRetryable || attempt === MAX_RETRIES - 1) {
        throw lastError;
      }

      // Exponential backoff: 1s, 2s, 4s
      const delay = BASE_DELAY_MS * Math.pow(2, attempt);
      await sleep(delay);
    }
  }

  throw lastError ?? new Error("Unknown error generating content");
}

/**
 * Generates a streaming response from Gemini.
 * Returns an async generator that yields text chunks as they arrive.
 *
 * @param systemPrompt - The system instruction for the model
 * @param userMessage - The user's message
 * @returns Stream result from Gemini
 */
export async function generateContentStream(
  systemPrompt: string,
  userMessage: string
): Promise<GenerateContentStreamResult> {
  const model = getModel();

  const result = await model.generateContentStream({
    contents: [
      {
        role: "user",
        parts: [{ text: `${systemPrompt}\n\n${userMessage}` }],
      },
    ],
  });

  return result;
}

/**
 * Generates a streaming response for multi-turn chat.
 *
 * @param systemPrompt - System instructions
 * @param history - Previous conversation turns
 * @param newMessage - The new user message
 * @returns Stream result
 */
export async function generateChatStream(
  systemPrompt: string,
  history: Array<{ role: "user" | "model"; content: string }>,
  newMessage: string
): Promise<GenerateContentStreamResult> {
  const model = getModel();

  const contents = [
    // Inject system prompt as first user turn
    {
      role: "user" as const,
      parts: [{ text: systemPrompt }],
    },
    {
      role: "model" as const,
      parts: [
        {
          text: "Understood. I am LexAI, your AI legal companion. I will help you understand legal documents while always reminding you that my analysis is informational and not a substitute for professional legal advice.",
        },
      ],
    },
    // Add conversation history
    ...history.map((turn) => ({
      role: turn.role as "user" | "model",
      parts: [{ text: turn.content }],
    })),
    // Add the new message
    {
      role: "user" as const,
      parts: [{ text: newMessage }],
    },
  ];

  const result = await model.generateContentStream({ contents });
  return result;
}
