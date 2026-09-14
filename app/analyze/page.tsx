"use client";

/**
 * @fileoverview Document analysis page.
 * Allows users to upload a single legal document and view comprehensive AI analysis.
 */

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { FileText, Loader2, AlertCircle, RotateCcw } from "lucide-react";
import { DocumentUploader, type UploadedFile } from "@/components/DocumentUploader";
import type { AnalysisResult } from "@/components/AnalysisPanel";
import { cn } from "@/lib/utils";

// Dynamic code-splitting for minimal initial bundle size
const AnalysisPanel = dynamic(
  () => import("@/components/AnalysisPanel"),
  {
    loading: () => (
      <div className="flex flex-col items-center justify-center py-16 space-y-4" role="status" aria-label="Loading analysis">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <p className="text-slate-600 text-sm font-medium">Preparing legal analysis...</p>
      </div>
    ),
    ssr: true,
  }
);

type PageState = "idle" | "loading" | "success" | "error";

interface AnalysisResponse {
  success: boolean;
  analysis: AnalysisResult;
  metadata: {
    fileName: string;
    fileSize: number;
    wordCount: number;
    pageCount?: number;
    processingTime: string;
  };
  error?: string;
}

/**
 * Document Analysis page — the primary feature of LexAI.
 */
export default function AnalyzePage(): React.JSX.Element {
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);
  const [pageState, setPageState] = useState<PageState>("idle");
  const [analysisData, setAnalysisData] = useState<AnalysisResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleFileSelect = useCallback((file: UploadedFile) => {
    setSelectedFile(file);
    setPageState("idle");
    setAnalysisData(null);
    setErrorMessage("");
  }, []);

  const handleFileRemove = useCallback(() => {
    setSelectedFile(null);
    setPageState("idle");
    setAnalysisData(null);
    setErrorMessage("");
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!selectedFile || pageState === "loading") return;

    setPageState("loading");
    setErrorMessage("");

    const formData = new FormData();
    formData.append("file", selectedFile.file);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as AnalysisResponse;

      if (!response.ok || !data.success) {
        throw new Error(data.error ?? `HTTP ${response.status}`);
      }

      setAnalysisData(data);
      setPageState("success");

      // Scroll to results
      setTimeout(() => {
        document.getElementById("analysis-results")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to analyze document";
      setErrorMessage(msg);
      setPageState("error");
    }
  }, [selectedFile, pageState]);

  const handleReset = useCallback(() => {
    setSelectedFile(null);
    setPageState("idle");
    setAnalysisData(null);
    setErrorMessage("");
  }, []);

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900">
          Document Analysis
        </h1>
        <p className="mt-1.5 text-slate-600 text-base">
          Upload a legal document to receive a plain-English summary, clause breakdown, risk score, and actionable next steps.
        </p>
      </div>

      {/* Upload section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-slate-800 flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-600" aria-hidden="true" />
            Upload Your Document
          </h2>
          {(pageState === "success" || selectedFile) && (
            <button
              onClick={handleReset}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-slate-500",
                "hover:bg-slate-100 hover:text-slate-700",
                "focus:outline-none focus:ring-2 focus:ring-indigo-400",
                "transition-colors"
              )}
              aria-label="Start over with a new document"
              type="button"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              Start Over
            </button>
          )}
        </div>

        <DocumentUploader
          onFileSelect={handleFileSelect}
          onFileRemove={handleFileRemove}
          selectedFile={selectedFile}
          label="Drop your legal document here or click to browse"
          disabled={pageState === "loading"}
          testId="document-uploader"
        />

        {selectedFile && pageState !== "success" && (
          <button
            onClick={() => void handleAnalyze()}
            disabled={pageState === "loading"}
            className={cn(
              "w-full rounded-xl py-3 font-semibold text-sm text-white transition-all",
              "bg-indigo-600 hover:bg-indigo-700",
              "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
              "disabled:opacity-60 disabled:cursor-not-allowed",
              "flex items-center justify-center gap-2"
            )}
            aria-label={
              pageState === "loading"
                ? "Analyzing document, please wait"
                : "Analyze document"
            }
            type="button"
          >
            {pageState === "loading" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Analyzing with AI...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4" aria-hidden="true" />
                Analyze Document
              </>
            )}
          </button>
        )}

        {/* Error state */}
        {pageState === "error" && errorMessage && (
          <div
            className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3"
            role="alert"
            aria-live="polite"
          >
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" aria-hidden="true" />
            <div>
              <p className="font-semibold text-red-800 text-sm">Analysis Failed</p>
              <p className="text-red-700 text-sm mt-0.5">{errorMessage}</p>
              <button
                onClick={() => void handleAnalyze()}
                className="mt-2 text-xs font-semibold text-red-700 underline hover:no-underline focus:outline-none"
                type="button"
              >
                Try again
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {pageState === "success" && analysisData && (
        <div id="analysis-results" tabIndex={-1}>
          <AnalysisPanel
            analysis={analysisData.analysis}
            fileName={analysisData.metadata.fileName}
            wordCount={analysisData.metadata.wordCount}
          />
        </div>
      )}
    </div>
  );
}
