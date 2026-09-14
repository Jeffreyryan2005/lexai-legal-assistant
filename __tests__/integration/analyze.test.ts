/**
 * @fileoverview Integration tests for the /api/analyze endpoint.
 * All Gemini API calls are mocked — tests never make real network requests.
 */

import { NextRequest } from "next/server";

// Mock the Gemini module before importing the route
jest.mock("../../lib/gemini", () => ({
  generateContent: jest.fn(),
  truncateToTokenLimit: jest.fn((text: string) => text),
}));

// Mock pdf-parse to avoid binary dependency
jest.mock("pdf-parse", () =>
  jest.fn().mockResolvedValue({ text: "Sample legal document text.", numpages: 2 })
);

// Mock mammoth to avoid binary dependency
jest.mock("mammoth", () => ({
  extractRawText: jest.fn().mockResolvedValue({ value: "Sample DOCX content." }),
}));

import { generateContent } from "../../lib/gemini";

const mockGenerateContent = generateContent as jest.MockedFunction<
  typeof generateContent
>;

/** Minimal valid analysis JSON that the mock returns */
const MOCK_ANALYSIS_JSON = JSON.stringify({
  documentType: "Non-Disclosure Agreement",
  summary: "This is an NDA between two parties.",
  keyPoints: ["Confidentiality obligations last 3 years.", "Mutual NDA."],
  clauses: [
    {
      name: "Confidentiality",
      content: "All information shall remain confidential.",
      explanation: "Both parties must keep information secret.",
      riskLevel: "low",
      riskReason: "Standard mutual clause.",
    },
  ],
  obligations: {
    party1: ["Keep information confidential"],
    party2: ["Keep information confidential"],
  },
  redFlags: [],
  missingClauses: ["Governing law clause"],
  overallRiskScore: 3,
  overallRiskReason: "Standard NDA with mutual obligations.",
  actionItems: ["Review the 3-year term.", "Add governing law clause."],
  questionsForLawyer: ["Is 3 years standard in my industry?"],
  disclaimer:
    "This analysis is for informational purposes only and does not constitute legal advice.",
});

/**
 * Creates a mock FormData request with a text file.
 */
function createMockRequest(
  content: string,
  fileName = "test.txt",
  mimeType = "text/plain"
): NextRequest {
  const blob = new Blob([content], { type: mimeType });
  const file = new File([blob], fileName, { type: mimeType });
  const formData = new FormData();
  formData.append("file", file);

  return new NextRequest("http://localhost:3000/api/analyze", {
    method: "POST",
    body: formData,
  });
}

describe("/api/analyze route", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 200 with analysis for valid text file", async () => {
    mockGenerateContent.mockResolvedValueOnce(MOCK_ANALYSIS_JSON);

    // Dynamic import to ensure mocks are set up first
    const { POST } = await import("../../app/api/analyze/route");
    const request = createMockRequest(
      "This is a sample NDA agreement between Company A and Company B.",
      "nda.txt",
      "text/plain"
    );

    const response = await POST(request);
    const data = (await response.json()) as {
      success: boolean;
      analysis: { documentType: string };
    };

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.analysis.documentType).toBe("Non-Disclosure Agreement");
  });

  it("should return 400 when no file is provided", async () => {
    const { POST } = await import("../../app/api/analyze/route");
    const formData = new FormData();
    const request = new NextRequest("http://localhost:3000/api/analyze", {
      method: "POST",
      body: formData,
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const data = (await response.json()) as { error: string };
    expect(data.error).toBeDefined();
  });

  it("should return 400 for unsupported file type", async () => {
    const { POST } = await import("../../app/api/analyze/route");
    const request = createMockRequest(
      "binary content",
      "malware.exe",
      "application/octet-stream"
    );

    const response = await POST(request);
    expect(response.status).toBe(400);

    const data = (await response.json()) as { error: string };
    expect(data.error.toLowerCase()).toContain("not supported");
  });

  it("should return 400 for an empty file", async () => {
    const { POST } = await import("../../app/api/analyze/route");
    const request = createMockRequest("", "empty.txt", "text/plain");

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("should handle Gemini API errors gracefully", async () => {
    mockGenerateContent.mockRejectedValueOnce(
      new Error("Gemini API quota exceeded")
    );

    const { POST } = await import("../../app/api/analyze/route");
    const request = createMockRequest(
      "Valid document content.",
      "doc.txt",
      "text/plain"
    );

    const response = await POST(request);
    // Should return 500 with an error message, not crash the server
    expect(response.status).toBe(500);

    const data = (await response.json()) as { error: string };
    expect(data.error).toBeDefined();
  });

  it("should set correct content-type header on success", async () => {
    mockGenerateContent.mockResolvedValueOnce(MOCK_ANALYSIS_JSON);

    const { POST } = await import("../../app/api/analyze/route");
    const request = createMockRequest(
      "Legal document text.",
      "contract.txt",
      "text/plain"
    );

    const response = await POST(request);
    expect(response.headers.get("content-type")).toContain("application/json");
  });
});
