"use client";

/**
 * @fileoverview Contract comparison page.
 * Allows users to upload two documents and compare them side-by-side.
 */

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { ArrowLeftRight, Loader2, AlertCircle, RotateCcw } from "lucide-react";
import { DocumentUploader, type UploadedFile } from "@/components/DocumentUploader";
import type { ComparisonResult } from "@/components/CompareView";
import { cn } from "@/lib/utils";

// Dynamic code-splitting for minimal initial bundle size
const CompareView = dynamic(
  () => import("@/components/CompareView"),
  {
    loading: () => (
      <div className="flex flex-col items-center justify-center py-16 space-y-4" role="status" aria-label="Loading comparison">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <p className="text-slate-600 text-sm font-medium">Preparing contract comparison...</p>
      </div>
    ),
    ssr: true,
  }
);

type PageState = "idle" | "loading" | "success" | "error";

interface ComparisonResponse {
  success: boolean;
  comparison: ComparisonResult;
  metadata: {
    doc1: { name: string; wordCount: number };
    doc2: { name: string; wordCount: number };
    processingTime: string;
  };
  error?: string;
}

/**
 * Contract Comparison page — compare two legal documents.
 */
export default function ComparePage(): React.JSX.Element {
  const [file1, setFile1] = useState<UploadedFile | null>(null);
  const [file2, setFile2] = useState<UploadedFile | null>(null);
  const [pageState, setPageState] = useState<PageState>("idle");
  const [comparisonData, setComparisonData] = useState<ComparisonResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleReset = useCallback(() => {
    setFile1(null);
    setFile2(null);
    setPageState("idle");
    setComparisonData(null);
    setErrorMessage("");
  }, []);

  const handleCompare = useCallback(async () => {
    if (!file1 || !file2 || pageState === "loading") return;

    setPageState("loading");
    setErrorMessage("");

    const formData = new FormData();
    formData.append("file1", file1.file);
    formData.append("file2", file2.file);

    try {
      const response = await fetch("/api/compare", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as ComparisonResponse;

      if (!response.ok || !data.success) {
        throw new Error(data.error ?? `HTTP ${response.status}`);
      }

      setComparisonData(data);
      setPageState("success");

      setTimeout(() => {
        document.getElementById("comparison-results")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to compare documents";
      setErrorMessage(msg);
      setPageState("error");
    }
  }, [file1, file2, pageState]);

  const isLoading = pageState === "loading";
  const canCompare = file1 !== null && file2 !== null;

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900">
          Contract Comparison
        </h1>
        <p className="mt-1.5 text-slate-600">
          Upload two versions of a contract or two different agreements. LexAI will identify differences, risks, and negotiation opportunities.
        </p>
      </div>

      {/* Upload section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-slate-800 flex items-center gap-2">
            <ArrowLeftRight className="h-5 w-5 text-indigo-600" aria-hidden="true" />
            Upload Two Documents
          </h2>
          {(file1 || file2 || pageState === "success") && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-colors"
              type="button"
              aria-label="Start over"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              Start Over
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Document 1
            </p>
            <DocumentUploader
              onFileSelect={setFile1}
              onFileRemove={() => setFile1(null)}
              selectedFile={file1}
              label="Upload first document"
              disabled={isLoading}
              testId="doc1-uploader"
            />
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Document 2
            </p>
            <DocumentUploader
              onFileSelect={setFile2}
              onFileRemove={() => setFile2(null)}
              selectedFile={file2}
              label="Upload second document"
              disabled={isLoading}
              testId="doc2-uploader"
            />
          </div>
        </div>

        {canCompare && (
          <button
            onClick={() => void handleCompare()}
            disabled={isLoading}
            className={cn(
              "w-full rounded-xl py-3 font-semibold text-sm text-white",
              "bg-violet-600 hover:bg-violet-700 transition-all",
              "focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2",
              "disabled:opacity-60 disabled:cursor-not-allowed",
              "flex items-center justify-center gap-2"
            )}
            type="button"
            aria-label={isLoading ? "Comparing documents, please wait" : "Compare documents"}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Comparing with AI...
              </>
            ) : (
              <>
                <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />
                Compare Documents
              </>
            )}
          </button>
        )}

        {!file1 && !file2 && (
          <p className="text-center text-slate-500 text-sm">
            Upload both documents above to begin comparison
          </p>
        )}

        {pageState === "error" && errorMessage && (
          <div
            className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3"
            role="alert"
          >
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" aria-hidden="true" />
            <div>
              <p className="font-semibold text-red-800 text-sm">Comparison Failed</p>
              <p className="text-red-700 text-sm mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {pageState === "success" && comparisonData && (
        <div id="comparison-results" tabIndex={-1}>
          <CompareView
            comparison={comparisonData.comparison}
            doc1Name={comparisonData.metadata.doc1.name}
            doc2Name={comparisonData.metadata.doc2.name}
          />
        </div>
      )}
    </div>
  );
}
