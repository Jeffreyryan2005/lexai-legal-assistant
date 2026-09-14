"use client";

/**
 * @fileoverview Full analysis panel — shows all structured results from
 * the /api/analyze endpoint including summary, clauses, obligations,
 * red flags, action items, and questions for a lawyer.
 */

import { useMemo, memo } from "react";
import {
  FileText,
  AlertTriangle,
  CheckSquare,
  HelpCircle,
  Lightbulb,
  Flag,
  ListChecks,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { RiskMeter } from "./RiskMeter";
import { ClauseCard, type Clause } from "./ClauseCard";
import { Disclaimer } from "./Disclaimer";

// Type matching the JSON structure returned by Gemini /api/analyze
export interface AnalysisResult {
  documentType?: string;
  summary?: string;
  keyPoints?: string[];
  clauses?: Clause[];
  obligations?: {
    party1?: string[];
    party2?: string[];
  };
  redFlags?: string[];
  missingClauses?: string[];
  overallRiskScore?: number;
  overallRiskReason?: string;
  actionItems?: string[];
  questionsForLawyer?: string[];
  disclaimer?: string;
}

interface AnalysisPanelProps {
  analysis: AnalysisResult;
  fileName: string;
  wordCount?: number;
}

/**
 * Section wrapper with header.
 */
function Section({
  icon: Icon,
  title,
  children,
  className,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
  className?: string;
}): React.JSX.Element {
  return (
    <section className={cn("space-y-3", className)} aria-labelledby={`section-${title.replace(/\s+/g, "-").toLowerCase()}`}>
      <h2
        id={`section-${title.replace(/\s+/g, "-").toLowerCase()}`}
        className="flex items-center gap-2 font-bold text-slate-800 text-base"
      >
        <Icon className="h-5 w-5 text-indigo-600" aria-hidden="true" />
        {title}
      </h2>
      {children}
    </section>
  );
}

/**
 * Full document analysis panel with all insights.
 */
function AnalysisPanelComponent({
  analysis,
  fileName,
  wordCount,
}: AnalysisPanelProps): React.JSX.Element {
  const riskScore = useMemo(
    () => Math.max(1, Math.min(10, Math.round(analysis.overallRiskScore ?? 5))),
    [analysis.overallRiskScore]
  );

  return (
    <div className="space-y-6" role="main" aria-label="Document analysis results">
      {/* Document Header */}
      <div className="flex items-center gap-3 rounded-xl bg-slate-100 px-4 py-3">
        <FileText className="h-6 w-6 text-indigo-600" aria-hidden="true" />
        <div>
          <p className="font-semibold text-slate-800 text-sm">{fileName}</p>
          <p className="text-slate-500 text-xs">
            {analysis.documentType || "Legal Document"}
            {wordCount ? ` • ${wordCount.toLocaleString()} words` : ""}
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <Disclaimer />

      {/* Risk Meter */}
      <RiskMeter
        score={riskScore}
        reason={analysis.overallRiskReason}
      />

      {/* Summary */}
      {analysis.summary && (
        <Section icon={FileText} title="Plain English Summary">
          <p className="text-slate-700 leading-relaxed text-sm bg-white rounded-xl border border-slate-200 p-4">
            {analysis.summary}
          </p>
        </Section>
      )}

      {/* Key Points */}
      {analysis.keyPoints && analysis.keyPoints.length > 0 && (
        <Section icon={Lightbulb} title="Key Points to Know">
          <ul className="space-y-2" role="list">
            {analysis.keyPoints.map((point, i) => (
              <li
                key={i}
                className="flex items-start gap-2.5 text-sm text-slate-700"
                role="listitem"
              >
                <span
                  className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold"
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                {point}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Red Flags */}
      {analysis.redFlags && analysis.redFlags.length > 0 && (
        <Section icon={Flag} title="⚠ Red Flags">
          <ul className="space-y-2" role="list">
            {analysis.redFlags.map((flag, i) => (
              <li
                key={i}
                className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
                role="listitem"
              >
                <AlertTriangle
                  className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500"
                  aria-hidden="true"
                />
                {flag}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Clause Analysis */}
      {analysis.clauses && analysis.clauses.length > 0 && (
        <Section icon={FileText} title="Clause-by-Clause Analysis">
          <div className="space-y-2">
            {analysis.clauses.map((clause, i) => (
              <ClauseCard key={i} clause={clause} index={i} />
            ))}
          </div>
        </Section>
      )}

      {/* Obligations */}
      {analysis.obligations && (
        <Section icon={ListChecks} title="Obligations">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {analysis.obligations.party1 && analysis.obligations.party1.length > 0 && (
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <h3 className="font-semibold text-slate-700 text-xs uppercase tracking-wide mb-2">
                  Party 1 Obligations
                </h3>
                <ul className="space-y-1.5" role="list">
                  {analysis.obligations.party1.map((ob, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-slate-600"
                    >
                      <CheckSquare
                        className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-indigo-500"
                        aria-hidden="true"
                      />
                      {ob}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {analysis.obligations.party2 && analysis.obligations.party2.length > 0 && (
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <h3 className="font-semibold text-slate-700 text-xs uppercase tracking-wide mb-2">
                  Party 2 Obligations
                </h3>
                <ul className="space-y-1.5" role="list">
                  {analysis.obligations.party2.map((ob, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-slate-600"
                    >
                      <CheckSquare
                        className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-indigo-500"
                        aria-hidden="true"
                      />
                      {ob}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Section>
      )}

      {/* Missing Clauses */}
      {analysis.missingClauses && analysis.missingClauses.length > 0 && (
        <Section icon={AlertTriangle} title="Missing Clauses">
          <ul className="space-y-2" role="list">
            {analysis.missingClauses.map((clause, i) => (
              <li
                key={i}
                className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800"
              >
                <AlertTriangle
                  className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500"
                  aria-hidden="true"
                />
                {clause}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Action Items */}
      {analysis.actionItems && analysis.actionItems.length > 0 && (
        <Section icon={CheckSquare} title="Recommended Next Steps">
          <ol className="space-y-2" role="list">
            {analysis.actionItems.map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-3 rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-2.5 text-sm text-indigo-900"
              >
                <span
                  className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white text-xs font-bold"
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                {item}
              </li>
            ))}
          </ol>
        </Section>
      )}

      {/* Questions for a Lawyer */}
      {analysis.questionsForLawyer && analysis.questionsForLawyer.length > 0 && (
        <Section icon={HelpCircle} title="Questions to Ask Your Lawyer">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <ul className="space-y-3" role="list">
              {analysis.questionsForLawyer.map((question, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2.5 text-sm text-slate-700"
                >
                  <HelpCircle
                    className="mt-0.5 h-4 w-4 flex-shrink-0 text-indigo-400"
                    aria-hidden="true"
                  />
                  {question}
                </li>
              ))}
            </ul>
          </div>
        </Section>
      )}
    </div>
  );
}

// Memoized — re-renders only when analysis data changes, not on parent state changes
export const AnalysisPanel = memo(AnalysisPanelComponent);
export default AnalysisPanel;
