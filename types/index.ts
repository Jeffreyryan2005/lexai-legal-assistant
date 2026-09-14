/**
 * @fileoverview Shared TypeScript types used across the LexAI application.
 * Centralizing types ensures consistency between API responses and UI components.
 */

// ── Analysis Types ──────────────────────────────────────────────────────────

/** Risk level classification for clauses and documents */
export type RiskLevel = "low" | "medium" | "high" | "critical";

/** Individual clause analysis from a legal document */
export interface LegalClause {
  name: string;
  content: string;
  explanation: string;
  riskLevel: RiskLevel;
  riskReason: string;
}

/** Obligations extracted from a legal document */
export interface DocumentObligations {
  party1?: string[];
  party2?: string[];
}

/** Full structured analysis returned by the /api/analyze endpoint */
export interface DocumentAnalysis {
  documentType?: string;
  summary?: string;
  keyPoints?: string[];
  clauses?: LegalClause[];
  obligations?: DocumentObligations;
  redFlags?: string[];
  missingClauses?: string[];
  overallRiskScore?: number;
  overallRiskReason?: string;
  actionItems?: string[];
  questionsForLawyer?: string[];
  disclaimer?: string;
}

/** Metadata accompanying a document analysis response */
export interface AnalysisMetadata {
  fileName: string;
  fileSize: number;
  wordCount: number;
  pageCount?: number;
  processingTime: string;
}

/** Full /api/analyze response shape */
export interface AnalysisApiResponse {
  success: boolean;
  analysis: DocumentAnalysis;
  metadata: AnalysisMetadata;
  error?: string;
}

// ── Comparison Types ─────────────────────────────────────────────────────────

/** A single difference between two documents */
export interface ContractDifference {
  clauseName: string;
  doc1Text: string;
  doc2Text: string;
  significance: "low" | "medium" | "high";
  explanation: string;
  recommendation: string;
}

/** Risk comparison between two documents */
export interface RiskComparison {
  doc1Score: number;
  doc2Score: number;
  explanation: string;
}

/** Full comparison result from /api/compare */
export interface ComparisonResult {
  doc1Type?: string;
  doc2Type?: string;
  overallSummary?: string;
  favorability?: "doc1" | "doc2" | "balanced";
  favorabilityReason?: string;
  differences?: ContractDifference[];
  uniqueToDoc1?: string[];
  uniqueToDoc2?: string[];
  commonClauses?: string[];
  riskComparison?: RiskComparison;
  negotiationPoints?: string[];
  recommendation?: string;
  questionsForLawyer?: string[];
  disclaimer?: string;
}

/** Document metadata in a comparison response */
export interface ComparisonDocMeta {
  name: string;
  wordCount: number;
}

/** Full /api/compare response shape */
export interface ComparisonApiResponse {
  success: boolean;
  comparison: ComparisonResult;
  metadata: {
    doc1: ComparisonDocMeta;
    doc2: ComparisonDocMeta;
    processingTime: string;
  };
  error?: string;
}

// ── Chat Types ────────────────────────────────────────────────────────────────

/** A single turn in a conversation */
export interface ChatTurn {
  role: "user" | "model";
  content: string;
}

/** Request body for the /api/chat endpoint */
export interface ChatRequest {
  message: string;
  documentContext?: string;
  history?: ChatTurn[];
}

/** A single SSE chunk from the /api/chat streaming response */
export interface ChatStreamChunk {
  text?: string;
  done?: boolean;
  error?: string;
}

// ── File Upload Types ─────────────────────────────────────────────────────────

/** Represents an uploaded file ready for processing */
export interface UploadedFile {
  file: File;
  name: string;
  size: number;
  type: string;
}

// ── API Error Type ────────────────────────────────────────────────────────────

/** Standardized API error response */
export interface ApiError {
  error: string;
  code: number;
  timestamp: string;
}
