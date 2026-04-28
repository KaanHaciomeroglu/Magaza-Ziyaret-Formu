export function Skeleton({ className = '', style = {} }) {
  return (
    <div
      className={`skeleton-shimmer rounded-lg ${className}`}
      style={style}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-[2rem] p-2" style={{ background: 'var(--color-surface-low)' }}>
      <div className="bg-white rounded-[1.5rem] p-5">
        <Skeleton className="h-4 w-1/3 mb-4" />
        <Skeleton className="h-8 w-1/2 mb-2" />
        <Skeleton className="h-3 w-full mb-2" />
        <Skeleton className="h-3 w-4/5" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="rounded-[2rem] p-2" style={{ background: 'var(--color-surface-low)' }}>
          <div className="bg-white rounded-[1.5rem] p-4">
            <div className="flex gap-4 items-center">
              <Skeleton className="h-10 w-10 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
