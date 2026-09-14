"use client";

/**
 * @fileoverview Contract comparison view — shows side-by-side differences
 * between two documents with risk comparison and negotiation tips.
 */

import { useMemo } from "react";
import {
  ArrowLeftRight,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Scale,
  MessageSquare,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { scoreToRisk } from "@/lib/riskScorer";
import { Disclaimer } from "./Disclaimer";

export interface ComparisonDifference {
  clauseName: string;
  doc1Text: string;
  doc2Text: string;
  significance: "low" | "medium" | "high";
  explanation: string;
  recommendation: string;
}

export interface ComparisonResult {
  doc1Type?: string;
  doc2Type?: string;
  overallSummary?: string;
  favorability?: "doc1" | "doc2" | "balanced";
  favorabilityReason?: string;
  differences?: ComparisonDifference[];
  uniqueToDoc1?: string[];
  uniqueToDoc2?: string[];
  commonClauses?: string[];
  riskComparison?: {
    doc1Score: number;
    doc2Score: number;
    explanation: string;
  };
  negotiationPoints?: string[];
  recommendation?: string;
  questionsForLawyer?: string[];
}

interface CompareViewProps {
  comparison: ComparisonResult;
  doc1Name: string;
  doc2Name: string;
}

const significanceColors = {
  low: "border-l-emerald-400 bg-emerald-50",
  medium: "border-l-amber-400 bg-amber-50",
  high: "border-l-red-400 bg-red-50",
};

const significanceBadge = {
  low: "bg-emerald-100 text-emerald-700",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-red-100 text-red-700",
};

/**
 * Individual difference card between two documents.
 */
function DifferenceCard({
  diff,
  doc1Name,
  doc2Name,
}: {
  diff: ComparisonDifference;
  doc1Name: string;
  doc2Name: string;
}): React.JSX.Element {
  const sig = diff.significance ?? "medium";

  return (
    <div
      className={cn(
        "rounded-xl border-l-4 border border-slate-200 p-4 space-y-3",
        significanceColors[sig]
      )}
      role="article"
      aria-label={`Clause difference: ${diff.clauseName}`}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-800 text-sm">{diff.clauseName}</h3>
        <span
          className={cn("rounded-full px-2 py-0.5 text-xs font-semibold capitalize", significanceBadge[sig])}
        >
          {sig} significance
        </span>
      </div>

      {/* Side by side comparison */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div className="rounded-lg bg-white/70 border border-slate-200 p-3">
          <p className="text-xs font-semibold text-slate-500 mb-1 truncate">📄 {doc1Name}</p>
          <p className="text-xs text-slate-700 leading-relaxed italic">
            {diff.doc1Text || "Not present in this document"}
          </p>
        </div>
        <div className="rounded-lg bg-white/70 border border-slate-200 p-3">
          <p className="text-xs font-semibold text-slate-500 mb-1 truncate">📄 {doc2Name}</p>
          <p className="text-xs text-slate-700 leading-relaxed italic">
            {diff.doc2Text || "Not present in this document"}
          </p>
        </div>
      </div>

      {/* Explanation */}
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
          What this difference means
        </p>
        <p className="text-sm text-slate-700 leading-relaxed">{diff.explanation}</p>
      </div>

      {/* Recommendation */}
      {diff.recommendation && (
        <div className="flex items-start gap-2 rounded-lg bg-white/80 px-3 py-2">
          <TrendingUp className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-indigo-500" aria-hidden="true" />
          <p className="text-xs text-indigo-800">{diff.recommendation}</p>
        </div>
      )}
    </div>
  );
}

/**
 * Full comparison view component.
 */
export function CompareView({
  comparison,
  doc1Name,
  doc2Name,
}: CompareViewProps): React.JSX.Element {
  const doc1Risk = useMemo(
    () => scoreToRisk(comparison.riskComparison?.doc1Score ?? 5),
    [comparison.riskComparison]
  );
  const doc2Risk = useMemo(
    () => scoreToRisk(comparison.riskComparison?.doc2Score ?? 5),
    [comparison.riskComparison]
  );

  const favorabilityLabel = {
    doc1: `📄 ${doc1Name} is more favorable`,
    doc2: `📄 ${doc2Name} is more favorable`,
    balanced: "⚖️ Both documents are relatively balanced",
  };

  return (
    <div className="space-y-6" role="main" aria-label="Document comparison results">
      <Disclaimer />

      {/* Overview card */}
      {comparison.overallSummary && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="h-5 w-5 text-indigo-600" aria-hidden="true" />
            <h2 className="font-bold text-slate-800">Comparison Overview</h2>
          </div>
          <p className="text-slate-700 text-sm leading-relaxed">{comparison.overallSummary}</p>

          {/* Favorability */}
          {comparison.favorability && (
            <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3">
              <p className="font-semibold text-indigo-800 text-sm">
                {favorabilityLabel[comparison.favorability]}
              </p>
              {comparison.favorabilityReason && (
                <p className="text-indigo-700 text-xs mt-1">{comparison.favorabilityReason}</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Risk comparison */}
      {comparison.riskComparison && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-indigo-600" aria-hidden="true" />
            <h2 className="font-bold text-slate-800">Risk Comparison</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {/* Doc 1 risk */}
            <div
              className={cn("rounded-xl border p-4 text-center",
                doc1Risk.score <= 4 ? "border-emerald-200 bg-emerald-50" :
                doc1Risk.score <= 6 ? "border-amber-200 bg-amber-50" :
                "border-red-200 bg-red-50"
              )}
              role="meter"
              aria-valuenow={doc1Risk.score}
              aria-valuemin={1}
              aria-valuemax={10}
              aria-label={`${doc1Name} risk: ${doc1Risk.score} out of 10`}
            >
              <p className="text-xs text-slate-500 truncate mb-1">{doc1Name}</p>
              <p className={cn("font-black text-3xl", doc1Risk.color)}>{doc1Risk.score}</p>
              <p className={cn("text-xs font-semibold", doc1Risk.color)}>/10 • {doc1Risk.label}</p>
            </div>
            {/* Doc 2 risk */}
            <div
              className={cn("rounded-xl border p-4 text-center",
                doc2Risk.score <= 4 ? "border-emerald-200 bg-emerald-50" :
                doc2Risk.score <= 6 ? "border-amber-200 bg-amber-50" :
                "border-red-200 bg-red-50"
              )}
              role="meter"
              aria-valuenow={doc2Risk.score}
              aria-valuemin={1}
              aria-valuemax={10}
              aria-label={`${doc2Name} risk: ${doc2Risk.score} out of 10`}
            >
              <p className="text-xs text-slate-500 truncate mb-1">{doc2Name}</p>
              <p className={cn("font-black text-3xl", doc2Risk.color)}>{doc2Risk.score}</p>
              <p className={cn("text-xs font-semibold", doc2Risk.color)}>/10 • {doc2Risk.label}</p>
            </div>
          </div>
          {comparison.riskComparison.explanation && (
            <p className="text-slate-600 text-sm">{comparison.riskComparison.explanation}</p>
          )}
        </div>
      )}

      {/* Differences */}
      {comparison.differences && comparison.differences.length > 0 && (
        <section aria-labelledby="differences-heading">
          <h2 id="differences-heading" className="flex items-center gap-2 font-bold text-slate-800 mb-3">
            <ArrowLeftRight className="h-5 w-5 text-indigo-600" aria-hidden="true" />
            Key Differences ({comparison.differences.length})
          </h2>
          <div className="space-y-3">
            {comparison.differences.map((diff, i) => (
              <DifferenceCard key={i} diff={diff} doc1Name={doc1Name} doc2Name={doc2Name} />
            ))}
          </div>
        </section>
      )}

      {/* Unique clauses */}
      {((comparison.uniqueToDoc1 && comparison.uniqueToDoc1.length > 0) ||
        (comparison.uniqueToDoc2 && comparison.uniqueToDoc2.length > 0)) && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {comparison.uniqueToDoc1 && comparison.uniqueToDoc1.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <h3 className="font-semibold text-slate-700 text-sm mb-2">
                Only in {doc1Name}
              </h3>
              <ul className="space-y-1">
                {comparison.uniqueToDoc1.map((clause, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                    <Minus className="mt-0.5 h-3 w-3 flex-shrink-0 text-slate-400" />
                    {clause}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {comparison.uniqueToDoc2 && comparison.uniqueToDoc2.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <h3 className="font-semibold text-slate-700 text-sm mb-2">
                Only in {doc2Name}
              </h3>
              <ul className="space-y-1">
                {comparison.uniqueToDoc2.map((clause, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                    <Minus className="mt-0.5 h-3 w-3 flex-shrink-0 text-slate-400" />
                    {clause}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Negotiation points */}
      {comparison.negotiationPoints && comparison.negotiationPoints.length > 0 && (
        <section aria-labelledby="negotiation-heading">
          <h2 id="negotiation-heading" className="flex items-center gap-2 font-bold text-slate-800 mb-3">
            <MessageSquare className="h-5 w-5 text-indigo-600" aria-hidden="true" />
            Negotiation Points
          </h2>
          <ol className="space-y-2">
            {comparison.negotiationPoints.map((point, i) => (
              <li
                key={i}
                className="flex items-start gap-3 rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-2.5 text-sm text-indigo-900"
              >
                <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white text-xs font-bold">
                  {i + 1}
                </span>
                {point}
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Questions for lawyer */}
      {comparison.questionsForLawyer && comparison.questionsForLawyer.length > 0 && (
        <section aria-labelledby="lawyer-questions-heading">
          <h2 id="lawyer-questions-heading" className="flex items-center gap-2 font-bold text-slate-800 mb-3">
            <HelpCircle className="h-5 w-5 text-indigo-600" aria-hidden="true" />
            Questions to Ask Your Lawyer
          </h2>
          <ul className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
            {comparison.questionsForLawyer.map((q, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                <HelpCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-indigo-400" />
                {q}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
