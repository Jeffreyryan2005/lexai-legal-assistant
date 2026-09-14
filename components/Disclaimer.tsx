"use client";

/**
 * @fileoverview Legal disclaimer banner.
 * Always shown to remind users that AI analysis is informational only.
 */

import { Info } from "lucide-react";

/**
 * Persistent disclaimer banner — shown on all analysis pages.
 * Critical for responsible legal AI deployment.
 */
export function Disclaimer(): React.JSX.Element {
  return (
    <div
      className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3"
      role="note"
      aria-label="Legal disclaimer"
    >
      <Info
        className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500"
        aria-hidden="true"
      />
      <p className="text-blue-800 text-sm leading-relaxed">
        <strong>Informational use only.</strong> LexAI provides AI-generated
        analysis to help you understand legal documents. This is not legal
        advice and does not create an attorney-client relationship. For
        advice specific to your situation, please consult a qualified legal
        professional.
      </p>
    </div>
  );
}
