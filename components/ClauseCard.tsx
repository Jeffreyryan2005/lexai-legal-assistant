"use client";

/**
 * @fileoverview ClauseCard — displays individual legal clause analysis
 * with expandable details, risk badge, and explanation.
 */

import { useState, useCallback } from "react";
import { ChevronDown, ChevronUp, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { riskLevelToColors } from "@/lib/riskScorer";

export interface Clause {
  name: string;
  content: string;
  explanation: string;
  riskLevel: string;
  riskReason: string;
}

interface ClauseCardProps {
  clause: Clause;
  /** Index for unique IDs */
  index: number;
}

/**
 * Expandable clause card showing clause name, risk level, explanation, and raw text.
 */
export function ClauseCard({ clause, index }: ClauseCardProps): React.JSX.Element {
  const [expanded, setExpanded] = useState(false);
  const colors = riskLevelToColors(clause.riskLevel);
  const cardId = `clause-${index}`;
  const contentId = `clause-content-${index}`;

  const toggle = useCallback(() => setExpanded((prev) => !prev), []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggle();
      }
    },
    [toggle]
  );

  return (
    <div
      className={cn(
        "rounded-xl border overflow-hidden transition-all duration-200",
        colors.border,
        colors.bg
      )}
      id={cardId}
    >
      {/* Header — clickable to expand */}
      <div
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        aria-controls={contentId}
        onClick={toggle}
        onKeyDown={handleKeyDown}
        className={cn(
          "flex cursor-pointer items-center justify-between px-4 py-3",
          "focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-400",
          "select-none"
        )}
      >
        <div className="flex items-center gap-3 min-w-0">
          {(clause.riskLevel === "high" || clause.riskLevel === "critical") ? (
            <AlertTriangle
              className={cn("h-4 w-4 flex-shrink-0", colors.text)}
              aria-hidden="true"
            />
          ) : (
            <Info
              className={cn("h-4 w-4 flex-shrink-0", colors.text)}
              aria-hidden="true"
            />
          )}
          <span className={cn("font-semibold text-sm truncate", colors.text)}>
            {clause.name}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-xs font-semibold capitalize",
              colors.badge
            )}
            aria-label={`Risk level: ${clause.riskLevel}`}
          >
            {clause.riskLevel} risk
          </span>
          {expanded ? (
            <ChevronUp className={cn("h-4 w-4", colors.text)} aria-hidden="true" />
          ) : (
            <ChevronDown className={cn("h-4 w-4", colors.text)} aria-hidden="true" />
          )}
        </div>
      </div>

      {/* Expandable content */}
      <div
        id={contentId}
        role="region"
        aria-label={`Details for ${clause.name}`}
        className={cn(
          "overflow-hidden transition-all duration-300",
          expanded ? "max-h-96" : "max-h-0"
        )}
      >
        <div className="border-t border-current/10 px-4 py-4 space-y-3">
          {/* Plain English Explanation */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
              What this means
            </p>
            <p className="text-slate-700 text-sm leading-relaxed">
              {clause.explanation}
            </p>
          </div>

          {/* Why this risk level */}
          {clause.riskReason && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
                Why this risk level
              </p>
              <p className="text-slate-700 text-sm leading-relaxed">
                {clause.riskReason}
              </p>
            </div>
          )}

          {/* Raw clause text */}
          {clause.content && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
                Document text
              </p>
              <blockquote className="border-l-2 border-slate-300 pl-3 text-slate-600 text-xs italic leading-relaxed">
                {clause.content}
              </blockquote>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
