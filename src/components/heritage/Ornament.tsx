// Gold divider with an eight-pointed star in the middle, used under headings.

export function Star8({ className = "w-4 h-4" }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
            <path fill="currentColor" d="M12 0l3.1 7.5L22.6 4.6l-2.9 7.4L24 12l-4.3 0 2.9 7.4-7.5-2.9L12 24l-3.1-7.5-7.5 2.9L4.3 12 0 12l4.3 0L1.4 4.6l7.5 2.9z" />
        </svg>
    );
}

export function Ornament({ className = "", light = false }: { className?: string; light?: boolean }) {
    const line = light ? "from-transparent to-primary/70" : "from-transparent to-primary";
    return (
        <div className={`flex items-center justify-center gap-3 ${className}`} aria-hidden="true">
            <span className={`h-px w-16 bg-gradient-to-l ${line}`} />
            <Star8 className="w-3.5 h-3.5 text-primary" />
            <span className={`h-px w-16 bg-gradient-to-r ${line}`} />
        </div>
    );
}

/** The family emblem (three linked people), matching the site icon. */
export function Emblem({ className = "w-9 h-9" }: { className?: string }) {
    return (
        <span className={`inline-flex items-center justify-center rounded-xl bg-primary text-deep shrink-0 ${className}`} aria-hidden="true">
            <svg viewBox="0 0 64 64" className="w-[62%] h-[62%]" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round">
                <path d="M32 22v10M32 32H16v8M32 32h16v8" />
                <circle cx="32" cy="14" r="8" fill="currentColor" stroke="none" />
                <circle cx="16" cy="48" r="8" fill="currentColor" stroke="none" />
                <circle cx="48" cy="48" r="8" fill="currentColor" stroke="none" />
            </svg>
        </span>
    );
}
