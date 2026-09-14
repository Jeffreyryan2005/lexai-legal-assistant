"use client";

/**
 * @fileoverview React Error Boundary for graceful error handling.
 * Catches runtime errors in child component trees and shows a user-friendly message.
 */

import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import Link from "next/link";

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Optional custom fallback UI */
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

/**
 * Error Boundary component.
 * Must be a class component as React error boundaries require lifecycle methods.
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorMessage: "" };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      // Only show safe, user-friendly message — never expose stack traces
      errorMessage:
        error.message.length < 200
          ? error.message
          : "An unexpected error occurred.",
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Log to console in development, would go to error tracking service in production
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, errorMessage: "" });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div
          className="flex flex-col items-center justify-center py-16 text-center space-y-6"
          role="alert"
          aria-live="assertive"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
            <AlertTriangle
              className="h-8 w-8 text-red-500"
              aria-hidden="true"
            />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900">
              Something went wrong
            </h2>
            <p className="text-slate-500 text-sm max-w-md">
              An unexpected error occurred. You can try refreshing the page or
              return to the home page.
            </p>
            {this.state.errorMessage && (
              <p className="rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-600 font-mono max-w-md">
                {this.state.errorMessage}
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-indigo-300 hover:bg-indigo-50 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
              type="button"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Try Again
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <Home className="h-4 w-4" aria-hidden="true" />
              Go Home
            </Link>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
