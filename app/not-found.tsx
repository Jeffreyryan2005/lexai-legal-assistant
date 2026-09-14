/**
 * @fileoverview Custom 404 Not Found page.
 * Displayed when a user navigates to a non-existent route.
 */

import Link from "next/link";
import { FileQuestion, Home, FileText, ArrowLeftRight, MessageSquare } from "lucide-react";

/**
 * 404 Not Found page with navigation back to core features.
 */
export default function NotFound(): React.JSX.Element {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center space-y-8 py-16">
      {/* Icon */}
      <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-slate-100">
        <FileQuestion className="h-12 w-12 text-slate-400" aria-hidden="true" />
      </div>

      {/* Message */}
      <div className="space-y-3">
        <h1 className="text-4xl font-black text-slate-900">Page not found</h1>
        <p className="text-slate-500 text-lg max-w-md mx-auto">
          The page you&apos;re looking for doesn&apos;t exist. Try one of the features below.
        </p>
      </div>

      {/* Navigation options */}
      <nav aria-label="Recovery navigation" className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:border-indigo-300 hover:bg-indigo-50 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <Home className="h-4 w-4" aria-hidden="true" />
            Go Home
          </Link>
          <Link
            href="/analyze"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <FileText className="h-4 w-4" aria-hidden="true" />
            Analyze a Document
          </Link>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/compare"
            className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:border-violet-300 hover:bg-violet-50 transition-all focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />
            Compare Contracts
          </Link>
          <Link
            href="/chat"
            className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:border-emerald-300 hover:bg-emerald-50 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <MessageSquare className="h-4 w-4" aria-hidden="true" />
            Legal Chat
          </Link>
        </div>
      </nav>
    </div>
  );
}
