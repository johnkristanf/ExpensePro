// components/dashboard-bar-chart-skeleton.tsx
export function BarChartSkeleton() {
    return (
        <div className="rounded-lg border p-6 shadow-sm">
            <div className="h-4 w-32 mb-2 bg-muted animate-pulse rounded" />
            <div className="h-4 w-48 mb-4 bg-muted animate-pulse rounded" />
            <div className="h-48 w-full bg-muted animate-pulse rounded" />
            <div className="mt-4 space-y-2">
                <div className="h-4 w-64 bg-muted animate-pulse rounded" />
                <div className="h-3 w-48 bg-muted animate-pulse rounded" />
            </div>
        </div>
    )
}
