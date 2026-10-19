"use client";

import { useRouter } from "next/navigation";
import { Printer } from "lucide-react";

/** Options bar for the family book; hidden when printing. */
export default function BookControls({
    rootId,
    photos,
    branchOptions,
}: {
    rootId: string | null;
    photos: boolean;
    branchOptions: { id: string; name: string }[];
}) {
    const router = useRouter();
    const go = (next: { root?: string | null; photos?: boolean }) => {
        const sp = new URLSearchParams();
        const root = next.root === undefined ? rootId : next.root;
        if (root) sp.set("root", root);
        if (next.photos ?? photos) sp.set("photos", "1");
        const s = sp.toString();
        router.replace(`/portal/book${s ? `?${s}` : ""}`);
    };

    return (
        <div className="print:hidden sticky top-0 z-10 bg-deep text-white px-4 py-3 flex flex-wrap items-center gap-3">
            <a href="/portal/tree" className="text-sm text-white/70 hover:text-white">
                ← الشجرة
            </a>
            <span className="font-heritage font-bold text-xl text-primary">كتاب العائلة</span>
            <label className="flex items-center gap-2 text-sm sm:mr-auto">
                المحتوى
                <select
                    value={rootId ?? ""}
                    onChange={(e) => go({ root: e.target.value || null })}
                    className="bg-white text-ink rounded-lg px-2 py-1.5 text-sm max-w-56"
                >
                    <option value="">العائلة كاملة</option>
                    {branchOptions.map((b) => (
                        <option key={b.id} value={b.id}>
                            فرع {b.name}
                        </option>
                    ))}
                </select>
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={photos} onChange={(e) => go({ photos: e.target.checked })} className="accent-primary w-4 h-4" />
                مع الصور
            </label>
            <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 bg-primary text-deep font-bold rounded-lg px-4 py-2 text-sm hover:bg-primary-light"
            >
                <Printer className="w-4 h-4" />
                طباعة / حفظ PDF
            </button>
        </div>
    );
}
