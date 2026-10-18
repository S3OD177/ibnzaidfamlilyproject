// Grey placeholder blocks shown while a page loads.

export function Skeleton({ className = "" }: { className?: string }) {
    return <div className={`animate-pulse rounded-xl bg-mist ${className}`} />;
}

/** A page heading and a few cards, the general shape of most portal pages. */
export function PageSkeleton({ cards = 3 }: { cards?: number }) {
    return (
        <div className="space-y-6" aria-busy="true" aria-label="جارٍ التحميل">
            <div className="space-y-2">
                <Skeleton className="h-8 w-56" />
                <Skeleton className="h-4 w-80 max-w-full" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Array.from({ length: cards }, (_, i) => (
                    <Skeleton key={i} className="h-28" />
                ))}
            </div>
            <Skeleton className="h-64" />
        </div>
    );
}
