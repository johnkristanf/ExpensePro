// components/dashboard-card-skeleton.tsx
export function CardSkeleton() {
    return (
        <div className="rounded-lg border p-6 shadow-sm space-y-4 max-h-48">
            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            <div className="h-8 w-32 bg-muted animate-pulse rounded" />
            <div className="h-4 w-[180px] bg-muted animate-pulse rounded" />
        </div>
    )
}
