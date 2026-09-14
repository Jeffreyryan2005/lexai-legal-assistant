"use client";

/**
 * @fileoverview Risk meter component — visually displays document risk level
 * with an animated gauge, color coding, and ARIA accessibility.
 */

import { useMemo, memo } from "react";
import { ShieldCheck, ShieldAlert, ShieldX, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { scoreToRisk, type RiskScore } from "@/lib/riskScorer";

interface RiskMeterProps {
  /** Risk score from 1 (lowest) to 10 (highest) */
  score: number;
  /** Optional reason/explanation for this score */
  reason?: string;
  /** Show compact version (no description) */
  compact?: boolean;
}

/**
 * Returns the appropriate shield icon based on risk level.
 */
function RiskIcon({
  level,
  className,
}: {
  level: RiskScore["level"];
  className?: string;
}): React.JSX.Element {
  const props = { className, "aria-hidden": true as const };
  switch (level) {
    case "low":
      return <ShieldCheck {...props} />;
    case "medium":
      return <Shield {...props} />;
    case "high":
      return <ShieldAlert {...props} />;
    case "critical":
      return <ShieldX {...props} />;
  }
}

/**
 * Animated risk meter component.
 * Shows a visual gauge from 1-10 with color-coded risk assessment.
 */
export function RiskMeter({
  score,
  reason,
  compact = false,
}: RiskMeterProps): React.JSX.Element {
  const risk = useMemo(() => scoreToRisk(score), [score]);

  // Calculate gauge fill percentage (0-100%)
  const fillPercent = ((score - 1) / 9) * 100;

  const gaugeColors = useMemo(() => {
    if (score <= 3) return "bg-emerald-500";
    if (score <= 5) return "bg-green-500";
    if (score <= 7) return "bg-amber-500";
    if (score <= 8) return "bg-orange-500";
    return "bg-red-500";
  }, [score]);

  return (
    <div
      className={cn(
        "rounded-2xl border p-5",
        score <= 4
          ? "border-emerald-200 bg-emerald-50"
          : score <= 6
            ? "border-amber-200 bg-amber-50"
            : "border-red-200 bg-red-50"
      )}
      role="meter"
      aria-label={`Risk score: ${score} out of 10. ${risk.label}.`}
      aria-valuenow={score}
      aria-valuemin={1}
      aria-valuemax={10}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <RiskIcon
            level={risk.level}
            className={cn("h-8 w-8", risk.color)}
          />
          <div>
            <p className={cn("font-bold text-lg leading-tight", risk.color)}>
              {risk.label}
            </p>
            {!compact && (
              <p className="text-slate-600 text-sm mt-0.5">Overall Risk Assessment</p>
            )}
          </div>
        </div>
        <div className="text-right">
          <span
            className={cn("font-black text-4xl tabular-nums", risk.color)}
            aria-hidden="true"
          >
            {score}
          </span>
          <span className="text-slate-400 text-lg font-medium">/10</span>
        </div>
      </div>

      {/* Gauge bar */}
      <div className="mt-4">
        <div
          className="h-3 w-full overflow-hidden rounded-full bg-slate-200"
          aria-hidden="true"
        >
          <div
            className={cn("h-full rounded-full transition-all duration-700 ease-out", gaugeColors)}
            style={{ width: `${fillPercent}%` }}
          />
        </div>
        <div className="mt-1 flex justify-between" aria-hidden="true">
          <span className="text-emerald-600 text-xs font-medium">Low</span>
          <span className="text-amber-600 text-xs font-medium">Medium</span>
          <span className="text-red-600 text-xs font-medium">Critical</span>
        </div>
      </div>

      {/* Risk description */}
      {!compact && (
        <p className="mt-3 text-slate-700 text-sm leading-relaxed">
          {reason || risk.description}
        </p>
      )}
    </div>
  );
}

// Pure component — only re-renders when score, compact, or reason props change
export default memo(RiskMeter);
