export function DashboardSkeleton() {
  return (
    <div aria-label="Memuat command center" className="animate-pulse space-y-4">
      {/* KPI row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-white/[0.06]" />
        ))}
      </div>
      {/* Trend + health */}
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(280px,1fr)]">
        <div className="h-48 rounded-xl bg-white/[0.06]" />
        <div className="h-48 rounded-xl bg-white/[0.06]" />
      </div>
      {/* Alerts + advisor */}
      <div className="grid gap-4 xl:grid-cols-2">
        <div className="h-40 rounded-xl bg-white/[0.06]" />
        <div className="h-40 rounded-xl bg-white/[0.06]" />
      </div>
      {/* Orders + inventory */}
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,1fr)]">
        <div className="h-48 rounded-xl bg-white/[0.06]" />
        <div className="h-48 rounded-xl bg-white/[0.06]" />
      </div>
    </div>
  );
}
