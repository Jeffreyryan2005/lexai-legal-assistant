/**
 * @fileoverview Document risk scoring utilities.
 * Provides consistent risk assessment logic used across the application.
 */

export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface RiskScore {
  score: number; // 1-10
  level: RiskLevel;
  color: string; // Tailwind color class
  label: string;
  description: string;
}

/**
 * Converts a numeric risk score (1-10) to a structured RiskScore object.
 *
 * @param score - Numeric score between 1 and 10
 * @returns Structured risk score with level, color, and labels
 */
export function scoreToRisk(score: number): RiskScore {
  const clampedScore = Math.max(1, Math.min(10, Math.round(score)));

  if (clampedScore <= 2) {
    return {
      score: clampedScore,
      level: "low",
      color: "text-emerald-600",
      label: "Low Risk",
      description: "This document appears to be standard and balanced.",
    };
  } else if (clampedScore <= 4) {
    return {
      score: clampedScore,
      level: "low",
      color: "text-green-600",
      label: "Moderate-Low Risk",
      description: "Minor concerns worth reviewing before signing.",
    };
  } else if (clampedScore <= 6) {
    return {
      score: clampedScore,
      level: "medium",
      color: "text-amber-600",
      label: "Medium Risk",
      description: "Several clauses require careful review or negotiation.",
    };
  } else if (clampedScore <= 8) {
    return {
      score: clampedScore,
      level: "high",
      color: "text-orange-600",
      label: "High Risk",
      description:
        "Significant concerns found. Professional legal review strongly recommended.",
    };
  } else {
    return {
      score: clampedScore,
      level: "critical",
      color: "text-red-600",
      label: "Critical Risk",
      description:
        "This document contains highly concerning terms. Do not sign without legal counsel.",
    };
  }
}

/**
 * Maps clause-level risk levels to color classes for the UI.
 *
 * @param level - Risk level string
 * @returns Tailwind background and text color classes
 */
export function riskLevelToColors(level: string): {
  bg: string;
  text: string;
  border: string;
  badge: string;
} {
  switch (level?.toLowerCase()) {
    case "low":
      return {
        bg: "bg-emerald-50",
        text: "text-emerald-800",
        border: "border-emerald-200",
        badge: "bg-emerald-100 text-emerald-700",
      };
    case "medium":
      return {
        bg: "bg-amber-50",
        text: "text-amber-800",
        border: "border-amber-200",
        badge: "bg-amber-100 text-amber-700",
      };
    case "high":
      return {
        bg: "bg-red-50",
        text: "text-red-800",
        border: "border-red-200",
        badge: "bg-red-100 text-red-700",
      };
    case "critical":
      return {
        bg: "bg-red-100",
        text: "text-red-900",
        border: "border-red-400",
        badge: "bg-red-200 text-red-900",
      };
    default:
      return {
        bg: "bg-slate-50",
        text: "text-slate-800",
        border: "border-slate-200",
        badge: "bg-slate-100 text-slate-700",
      };
  }
}

/**
 * Calculates an overall risk score from multiple clause-level risks.
 *
 * @param clauseRisks - Array of clause risk levels
 * @returns Aggregated numeric score 1-10
 */
export function aggregateRiskScore(clauseRisks: string[]): number {
  if (clauseRisks.length === 0) return 1;

  const weights: Record<string, number> = {
    low: 2,
    medium: 5,
    high: 8,
    critical: 10,
  };

  const total = clauseRisks.reduce((sum, risk) => {
    return sum + (weights[risk.toLowerCase()] ?? 5);
  }, 0);

  return Math.min(10, Math.round(total / clauseRisks.length));
}
