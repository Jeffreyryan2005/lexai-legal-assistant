/**
 * @fileoverview Loading skeleton for the Document Analysis page.
 */
export default function AnalyzeLoading(): React.JSX.Element {
  return (
    <div className="space-y-8 animate-pulse" role="status" aria-label="Loading document analysis">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-9 w-72 rounded-2xl bg-slate-200" />
        <div className="h-5 w-96 rounded-xl bg-slate-100" />
      </div>
      {/* Upload card skeleton */}
      <div className="rounded-2xl border-2 border-slate-100 bg-white p-6 space-y-4">
        <div className="h-6 w-48 rounded-lg bg-slate-200" />
        <div className="h-36 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-200" />
      </div>
      <span className="sr-only">Loading...</span>
    </div>
  );
}
