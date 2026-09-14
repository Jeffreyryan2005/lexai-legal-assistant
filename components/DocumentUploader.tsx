"use client";

/**
 * @fileoverview Document upload component with drag-and-drop support.
 * Accessible, keyboard navigable, and provides clear feedback.
 */

import { useCallback, useState, useRef, type DragEvent, type ChangeEvent } from "react";
import { Upload, X, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { ALLOWED_EXTENSIONS } from "@/lib/validators";
import { MAX_FILE_SIZE_BYTES } from "@/lib/extractText";

const MAX_SIZE_MB = MAX_FILE_SIZE_BYTES / 1024 / 1024;

export interface UploadedFile {
  file: File;
  name: string;
  size: number;
  type: string;
}

interface DocumentUploaderProps {
  /** Callback when a valid file is selected */
  onFileSelect: (file: UploadedFile) => void;
  /** Callback when a file is removed */
  onFileRemove?: () => void;
  /** Currently selected file */
  selectedFile?: UploadedFile | null;
  /** Label shown in the uploader (e.g., "Document 1") */
  label?: string;
  /** Whether the uploader is disabled */
  disabled?: boolean;
  /** Test id for automated testing */
  testId?: string;
}

/**
 * Validates a file against allowed types and size limit.
 */
function validateFile(file: File): string | null {
  const ext = `.${file.name.split(".").pop()?.toLowerCase()}`;
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return `Unsupported file type. Please use: ${ALLOWED_EXTENSIONS.join(", ")}`;
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `File too large. Maximum size is ${MAX_SIZE_MB}MB.`;
  }
  if (file.size === 0) {
    return "File is empty.";
  }
  return null;
}

/**
 * Formats file size for display.
 */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/**
 * DocumentUploader component — supports click and drag-and-drop.
 * Fully keyboard accessible with ARIA attributes.
 */
export function DocumentUploader({
  onFileSelect,
  onFileRemove,
  selectedFile,
  label = "Upload Document",
  disabled = false,
  testId,
}: DocumentUploaderProps): React.JSX.Element {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      setError(null);
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }
      onFileSelect({ file, name: file.name, size: file.size, type: file.type });
    },
    [onFileSelect]
  );

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled) return;
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [disabled, handleFile]
  );

  const handleDragOver = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (!disabled) setIsDragging(true);
    },
    [disabled]
  );

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      // Reset input value to allow re-selecting the same file
      if (inputRef.current) inputRef.current.value = "";
    },
    [handleFile]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        inputRef.current?.click();
      }
    },
    []
  );

  const handleRemove = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setError(null);
      onFileRemove?.();
    },
    [onFileRemove]
  );

  if (selectedFile) {
    return (
      <div
        className={cn(
          "relative flex items-center gap-3 rounded-xl border-2 p-4",
          "border-emerald-200 bg-emerald-50"
        )}
        data-testid={testId}
        role="status"
        aria-label={`${label}: ${selectedFile.name} selected`}
      >
        <CheckCircle className="h-8 w-8 flex-shrink-0 text-emerald-500" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-emerald-900 text-sm">{selectedFile.name}</p>
          <p className="text-emerald-600 text-xs mt-0.5">
            {formatFileSize(selectedFile.size)} • Ready for analysis
          </p>
        </div>
        {onFileRemove && (
          <button
            onClick={handleRemove}
            className={cn(
              "flex-shrink-0 rounded-lg p-1.5 text-emerald-600",
              "hover:bg-emerald-200 hover:text-emerald-800",
              "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1",
              "transition-colors"
            )}
            aria-label={`Remove ${selectedFile.name}`}
            type="button"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div
        onClick={() => !disabled && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={`${label}. Drag and drop or click to browse. Accepted formats: ${ALLOWED_EXTENSIONS.join(", ")}. Maximum size: ${MAX_SIZE_MB}MB.`}
        aria-disabled={disabled}
        data-testid={testId}
        className={cn(
          "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed",
          "px-6 py-10 text-center transition-all duration-200",
          "cursor-pointer select-none",
          "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
          isDragging
            ? "border-indigo-400 bg-indigo-50 scale-[1.01]"
            : "border-slate-300 bg-slate-50 hover:border-indigo-400 hover:bg-indigo-50",
          disabled && "cursor-not-allowed opacity-50",
          error && "border-red-300 bg-red-50"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ALLOWED_EXTENSIONS.map((e) => `.${e.slice(1)}`).join(",")}
          onChange={handleInputChange}
          disabled={disabled}
          className="sr-only"
          aria-hidden="true"
          tabIndex={-1}
        />
        <Upload
          className={cn(
            "mb-3 h-10 w-10",
            isDragging ? "text-indigo-500" : "text-slate-400"
          )}
          aria-hidden="true"
        />
        <p className="font-semibold text-slate-700 text-sm">
          {isDragging ? "Drop your file here" : label}
        </p>
        <p className="mt-1 text-slate-500 text-xs">
          {ALLOWED_EXTENSIONS.join(", ")} • Max {MAX_SIZE_MB}MB
        </p>
        <p className="mt-2 rounded-lg bg-indigo-600 px-4 py-1.5 text-white text-xs font-medium">
          Browse Files
        </p>
      </div>

      {error && (
        <div
          className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2"
          role="alert"
          aria-live="polite"
        >
          <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-500" aria-hidden="true" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}

// Explicit named export for tree-shaking
export type { DocumentUploaderProps };
