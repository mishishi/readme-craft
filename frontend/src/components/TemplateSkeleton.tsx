/** Skeleton placeholder for template preview areas during loading */

export function TemplateSkeleton() {
  return (
    <div className="w-full animate-pulse rounded-md bg-white p-3">
      {/* Title line */}
      <div className="mb-2 h-3 w-2/3 rounded bg-muted-200" />
      {/* Description lines */}
      <div className="mb-1.5 space-y-1.5">
        <div className="h-2 w-full rounded bg-muted-100" />
        <div className="h-2 w-4/5 rounded bg-muted-100" />
      </div>
      {/* Feature bullets */}
      <div className="mb-2 space-y-1">
        <div className="h-2 w-1/3 rounded bg-muted-100" />
        <div className="h-2 w-1/2 rounded bg-muted-100" />
        <div className="h-2 w-2/5 rounded bg-muted-100" />
      </div>
      {/* Code block */}
      <div className="mb-1.5 h-8 w-full rounded bg-muted-200" />
      {/* Footer */}
      <div className="h-2 w-1/4 rounded bg-muted-100" />
    </div>
  );
}

/** Simplified skeleton for smaller preview areas (e.g., template selector cards) */
export function CompactSkeleton() {
  return (
    <div className="w-full animate-pulse space-y-2">
      <div className="flex gap-1">
        <div className="h-3 w-12 rounded bg-muted-200" />
        <div className="h-3 w-16 rounded bg-muted-200" />
        <div className="h-3 w-10 rounded bg-muted-200" />
      </div>
      <div className="h-2 w-full rounded bg-muted-100" />
      <div className="h-2 w-3/4 rounded bg-muted-100" />
    </div>
  );
}
