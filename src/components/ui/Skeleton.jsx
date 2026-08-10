export function Skeleton({ className = '' }) {
  return <div className={`skeleton rounded-xl ${className}`} />;
}

export function SkeletonStoreCard() {
  return (
    <div className="bg-white rounded-2xl p-4 border border-ocean-100 shadow-sm flex items-center gap-3">
      <Skeleton className="w-12 h-12 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

export function SkeletonProductCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-ocean-100 shadow-sm flex flex-col justify-between h-[380px]">
      <div>
        <Skeleton className="h-48 w-full rounded-none" />
        <div className="p-4 space-y-3">
          <Skeleton className="h-5 w-1/2 rounded-md" />
          <Skeleton className="h-5 w-4/5" />
          <Skeleton className="h-6 w-1/3" />
        </div>
      </div>
      <div className="p-4 pt-0">
        <Skeleton className="h-10 w-full rounded-xl" />
      </div>
    </div>
  );
}

export function SkeletonDashboard() {
  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in space-y-8">
      {/* Banner Skeleton */}
      <div className="bg-ocean-900/10 rounded-3xl p-6 md:p-8 space-y-4 border border-ocean-100">
        <Skeleton className="h-6 w-48 rounded-full bg-ocean-200/50" />
        <Skeleton className="h-10 w-3/4 max-w-md bg-ocean-200/50" />
        <Skeleton className="h-4 w-full max-w-lg bg-ocean-200/50" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 max-w-xl">
          <Skeleton className="h-16 rounded-2xl bg-ocean-200/40" />
          <Skeleton className="h-16 rounded-2xl bg-ocean-200/40" />
          <Skeleton className="h-16 rounded-2xl bg-ocean-200/40" />
        </div>
      </div>

      {/* Stores Section Skeleton */}
      <div>
        <Skeleton className="h-6 w-48 mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <SkeletonStoreCard />
          <SkeletonStoreCard />
          <SkeletonStoreCard />
        </div>
      </div>

      {/* Search & Filter Skeleton */}
      <div className="bg-white p-4 md:p-6 rounded-2xl border border-ocean-100 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <Skeleton className="h-11 flex-1 rounded-xl" />
          <div className="flex gap-2">
            <Skeleton className="h-11 w-36 rounded-xl" />
            <Skeleton className="h-11 w-36 rounded-xl" />
          </div>
        </div>
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-7 w-20 rounded-full" />
          <Skeleton className="h-7 w-24 rounded-full" />
          <Skeleton className="h-7 w-24 rounded-full" />
          <Skeleton className="h-7 w-20 rounded-full" />
        </div>
      </div>

      {/* Product Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonProductCard key={i} />
        ))}
      </div>
    </div>
  );
}
