"use client";

/**
 * @fileoverview Legal disclaimer banner.
 * Always shown to remind users that AI analysis is informational only.
 * Memoized — static content, never needs to re-render.
 */

import { memo } from "react";
import { Info } from "lucide-react";

/**
 * Persistent disclaimer banner — shown on all analysis pages.
 * Critical for responsible legal AI deployment.
 * Uses role="note" for accessibility — informational, non-urgent.
 */
function Disclaimer(): React.JSX.Element {
  return (
    <div
      className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3"
      role="note"
      aria-label="Legal disclaimer — informational use only"
      aria-describedby="disclaimer-text"
    >
      <Info
        className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500"
        aria-hidden="true"
      />
      <p id="disclaimer-text" className="text-blue-800 text-sm leading-relaxed">
        <strong>Informational use only.</strong> LexAI provides AI-generated
        analysis to help you understand legal documents. This is{" "}
        <strong>not legal advice</strong> and does not create an attorney-client
        relationship. For advice specific to your situation, please consult a
        qualified legal professional.
      </p>
    </div>
  );
}

// Static component — memoized to prevent unnecessary re-renders
export default memo(Disclaimer);

// Also export as named for backward compat
export { Disclaimer };
