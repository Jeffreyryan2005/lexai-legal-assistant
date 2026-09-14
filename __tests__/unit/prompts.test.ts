/**
 * @fileoverview Unit tests for the prompt engineering module.
 */

import {
  getAnalysisPrompt,
  getComparisonPrompt,
  getChatSystemPrompt,
  getClauseExtractionPrompt,
  LEGAL_DISCLAIMER,
} from "../../lib/prompts";

describe("getAnalysisPrompt", () => {
  it("should return a non-empty string", () => {
    const prompt = getAnalysisPrompt();
    expect(typeof prompt).toBe("string");
    expect(prompt.length).toBeGreaterThan(100);
  });

  it("should include instruction to return JSON", () => {
    const prompt = getAnalysisPrompt();
    expect(prompt).toContain("JSON");
  });

  it("should include injection defense", () => {
    const prompt = getAnalysisPrompt();
    // Check for prompt injection defense wording (case-insensitive)
    const lower = prompt.toLowerCase();
    expect(
      lower.includes("ignore any instructions") ||
      lower.includes("do not follow") ||
      lower.includes("embedded within") ||
      lower.includes("attempt to change your behavior")
    ).toBe(true);
  });

  it("should include legal disclaimer reminder", () => {
    const prompt = getAnalysisPrompt();
    expect(prompt.toLowerCase()).toContain("legal advice");
  });

  it("should include document type when provided", () => {
    const prompt = getAnalysisPrompt("Employment Contract");
    expect(prompt).toContain("Employment Contract");
  });

  it("should include key legal clause types to analyze", () => {
    const prompt = getAnalysisPrompt();
    expect(prompt.toLowerCase()).toContain("indemnif");
    expect(prompt.toLowerCase()).toContain("termination");
    expect(prompt.toLowerCase()).toContain("liability");
  });

  it("should define overallRiskScore in JSON schema", () => {
    const prompt = getAnalysisPrompt();
    expect(prompt).toContain("overallRiskScore");
  });

  it("should define questionsForLawyer in JSON schema", () => {
    const prompt = getAnalysisPrompt();
    expect(prompt).toContain("questionsForLawyer");
  });
});

describe("getComparisonPrompt", () => {
  it("should return a non-empty string", () => {
    const prompt = getComparisonPrompt();
    expect(prompt.length).toBeGreaterThan(100);
  });

  it("should reference DOCUMENT 1 and DOCUMENT 2", () => {
    const prompt = getComparisonPrompt();
    expect(prompt).toContain("[DOCUMENT 1]");
    expect(prompt).toContain("[DOCUMENT 2]");
  });

  it("should include favorability field", () => {
    const prompt = getComparisonPrompt();
    expect(prompt).toContain("favorability");
  });

  it("should include negotiationPoints field", () => {
    const prompt = getComparisonPrompt();
    expect(prompt).toContain("negotiationPoints");
  });
});

describe("getChatSystemPrompt", () => {
  it("should return a prompt without context", () => {
    const prompt = getChatSystemPrompt();
    expect(prompt.length).toBeGreaterThan(100);
    expect(prompt.toLowerCase()).toContain("legal advice");
  });

  it("should include document context when provided", () => {
    const context = "This is a sample employment agreement...";
    const prompt = getChatSystemPrompt(context);
    expect(prompt).toContain(context);
  });

  it("should mention LexAI in the prompt", () => {
    const prompt = getChatSystemPrompt();
    expect(prompt).toContain("LexAI");
  });

  it("should warn about general information without doc", () => {
    const prompt = getChatSystemPrompt(undefined);
    expect(prompt.toLowerCase()).toContain("general");
  });
});

describe("getClauseExtractionPrompt", () => {
  it("should include the clause type in the prompt", () => {
    const prompt = getClauseExtractionPrompt("non-compete");
    expect(prompt).toContain("non-compete");
  });

  it("should request JSON output", () => {
    const prompt = getClauseExtractionPrompt("indemnification");
    expect(prompt).toContain("JSON");
  });
});

describe("LEGAL_DISCLAIMER", () => {
  it("should be defined", () => {
    expect(LEGAL_DISCLAIMER).toBeDefined();
    expect(LEGAL_DISCLAIMER.length).toBeGreaterThan(20);
  });

  it("should mention legal advice", () => {
    expect(LEGAL_DISCLAIMER.toLowerCase()).toContain("legal advice");
  });

  it("should mention consulting a professional", () => {
    expect(LEGAL_DISCLAIMER.toLowerCase()).toContain("professional");
  });
});
