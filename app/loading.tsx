/**
 * @fileoverview Root loading UI — shown while the page is loading.
 * Uses Suspense boundary for streaming with skeleton placeholders.
 */
export default function Loading(): React.JSX.Element {
  return (
    <div
      className="space-y-8 animate-pulse"
      role="status"
      aria-label="Loading page content"
      aria-live="polite"
    >
      {/* Hero skeleton */}
      <div className="space-y-4 py-12 text-center">
        <div className="mx-auto h-6 w-48 rounded-full bg-slate-200" />
        <div className="mx-auto h-14 w-3/4 rounded-2xl bg-slate-200" />
        <div className="mx-auto h-8 w-1/2 rounded-2xl bg-slate-100" />
        <div className="mx-auto h-6 w-2/3 rounded-xl bg-slate-100" />
        <div className="flex justify-center gap-3">
          <div className="h-12 w-44 rounded-2xl bg-indigo-200" />
          <div className="h-12 w-44 rounded-2xl bg-slate-200" />
        </div>
      </div>

      {/* Feature cards skeleton */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-2xl border-2 border-slate-100 bg-white p-7 space-y-4"
          >
            <div className="h-14 w-14 rounded-2xl bg-slate-200" />
            <div className="h-6 w-2/3 rounded-lg bg-slate-200" />
            <div className="space-y-2">
              <div className="h-4 w-full rounded bg-slate-100" />
              <div className="h-4 w-5/6 rounded bg-slate-100" />
              <div className="h-4 w-4/6 rounded bg-slate-100" />
            </div>
          </div>
        ))}
      </div>

      <span className="sr-only">Loading LexAI...</span>
    </div>
  );
}
