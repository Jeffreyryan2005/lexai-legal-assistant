/**
 * @fileoverview Unit tests for the risk scorer module.
 */

import {
  scoreToRisk,
  riskLevelToColors,
  aggregateRiskScore,
} from "../../lib/riskScorer";

describe("scoreToRisk", () => {
  it("should return low risk for score 1", () => {
    const result = scoreToRisk(1);
    expect(result.level).toBe("low");
    expect(result.score).toBe(1);
    expect(result.label).toContain("Low");
  });

  it("should return low risk for score 2", () => {
    const result = scoreToRisk(2);
    expect(result.level).toBe("low");
  });

  it("should return medium risk for score 5-6", () => {
    expect(scoreToRisk(5).level).toBe("medium");
    expect(scoreToRisk(6).level).toBe("medium");
  });

  it("should return high risk for score 7-8", () => {
    expect(scoreToRisk(7).level).toBe("high");
    expect(scoreToRisk(8).level).toBe("high");
  });

  it("should return critical risk for score 9-10", () => {
    expect(scoreToRisk(9).level).toBe("critical");
    expect(scoreToRisk(10).level).toBe("critical");
  });

  it("should clamp scores below 1 to 1", () => {
    const result = scoreToRisk(0);
    expect(result.score).toBe(1);
  });

  it("should clamp scores above 10 to 10", () => {
    const result = scoreToRisk(15);
    expect(result.score).toBe(10);
  });

  it("should include color class string", () => {
    const result = scoreToRisk(5);
    expect(result.color).toBeTruthy();
    expect(typeof result.color).toBe("string");
  });

  it("should include description", () => {
    const result = scoreToRisk(8);
    expect(result.description.length).toBeGreaterThan(10);
  });
});

describe("riskLevelToColors", () => {
  it("should return green colors for low risk", () => {
    const colors = riskLevelToColors("low");
    expect(colors.bg).toContain("emerald");
    expect(colors.text).toContain("emerald");
  });

  it("should return amber colors for medium risk", () => {
    const colors = riskLevelToColors("medium");
    expect(colors.bg).toContain("amber");
  });

  it("should return red colors for high risk", () => {
    const colors = riskLevelToColors("high");
    expect(colors.bg).toContain("red");
  });

  it("should return darker red colors for critical risk", () => {
    const colors = riskLevelToColors("critical");
    expect(colors.bg).toContain("red");
  });

  it("should handle unknown risk levels with defaults", () => {
    const colors = riskLevelToColors("unknown");
    expect(colors.bg).toContain("slate");
  });

  it("should be case insensitive", () => {
    const lower = riskLevelToColors("high");
    const upper = riskLevelToColors("HIGH");
    expect(lower.bg).toBe(upper.bg);
  });
});

describe("aggregateRiskScore", () => {
  it("should return 1 for empty array", () => {
    expect(aggregateRiskScore([])).toBe(1);
  });

  it("should return low score for all low risks", () => {
    const score = aggregateRiskScore(["low", "low", "low"]);
    expect(score).toBeLessThanOrEqual(3);
  });

  it("should return high score for all high risks", () => {
    const score = aggregateRiskScore(["high", "high", "high"]);
    expect(score).toBeGreaterThanOrEqual(7);
  });

  it("should return medium score for mixed risks", () => {
    const score = aggregateRiskScore(["low", "medium", "high"]);
    expect(score).toBeGreaterThanOrEqual(3);
    expect(score).toBeLessThanOrEqual(8);
  });

  it("should not exceed 10", () => {
    const score = aggregateRiskScore(["critical", "critical", "critical"]);
    expect(score).toBeLessThanOrEqual(10);
  });

  it("should handle single item", () => {
    const score = aggregateRiskScore(["medium"]);
    expect(score).toBe(5);
  });
});
