"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Download, X } from "lucide-react";
import type { AlbumPhoto } from "@/lib/data/albums";

/** Photo grid; a photo opens full screen with arrows, swipe and Escape to close. */
export default function PhotoGallery({ photos, renderActions }: { photos: AlbumPhoto[]; renderActions?: (photo: AlbumPhoto) => React.ReactNode }) {
    const [open, setOpen] = useState<number | null>(null);
    const touchX = useRef<number | null>(null);
    const count = photos.length;

    // RTL: the next photo is to the left.
    const next = useCallback(() => setOpen((i) => (i === null ? i : (i + 1) % count)), [count]);
    const prev = useCallback(() => setOpen((i) => (i === null ? i : (i - 1 + count) % count)), [count]);

    useEffect(() => {
        if (open === null) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(null);
            if (e.key === "ArrowLeft") next();
            if (e.key === "ArrowRight") prev();
        };
        document.addEventListener("keydown", onKey);
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = "";
        };
    }, [open, next, prev]);

    if (count === 0) {
        return <p className="text-center text-muted py-16 bg-white rounded-2xl border border-dashed border-sand">لا توجد صور في هذا الألبوم بعد.</p>;
    }
    const current = open === null ? null : photos[open];

    return (
        <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                {photos.map((photo, i) => (
                    <div key={photo.id} className="relative group">
                        <button type="button" onClick={() => setOpen(i)} className="block w-full aspect-square rounded-xl overflow-hidden bg-mist" aria-label={`فتح الصورة ${i + 1}`}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={photo.url} alt={photo.caption ?? ""} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        </button>
                        {renderActions && <div className="absolute top-2 left-2 flex gap-1">{renderActions(photo)}</div>}
                    </div>
                ))}
            </div>

            {current && (
                <div
                    className="fixed inset-0 z-[90] bg-black/95 flex flex-col"
                    role="dialog"
                    aria-modal="true"
                    onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
                    onTouchEnd={(e) => {
                        if (touchX.current === null) return;
                        const dx = e.changedTouches[0].clientX - touchX.current;
                        if (Math.abs(dx) > 50) (dx > 0 ? next : prev)();
                        touchX.current = null;
                    }}
                >
                    <div className="flex items-center justify-between p-4 text-white/80">
                        <button type="button" onClick={() => setOpen(null)} className="p-2 hover:text-white" aria-label="إغلاق">
                            <X className="w-6 h-6" />
                        </button>
                        <span className="text-sm">{(open ?? 0) + 1} / {count}</span>
                        <a href={`${current.url}?download`} className="p-2 hover:text-white" aria-label="تحميل الصورة">
                            <Download className="w-5 h-5" />
                        </a>
                    </div>
                    <div className="flex-1 flex items-center justify-center px-2 min-h-0 relative">
                        {count > 1 && (
                            <button type="button" onClick={prev} className="absolute right-2 md:right-6 p-3 rounded-full bg-white/10 text-white hover:bg-white/20" aria-label="السابقة">
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        )}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={current.url} alt={current.caption ?? ""} className="max-h-full max-w-full object-contain select-none" />
                        {count > 1 && (
                            <button type="button" onClick={next} className="absolute left-2 md:left-6 p-3 rounded-full bg-white/10 text-white hover:bg-white/20" aria-label="التالية">
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                        )}
                    </div>
                    {current.caption && <p className="text-center text-white/80 p-4 font-naskh">{current.caption}</p>}
                </div>
            )}
        </>
    );
}
