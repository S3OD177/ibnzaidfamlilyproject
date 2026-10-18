"use client";

import type { AlbumInput } from "@/app/portal/admin/albums/actions";

const inputClass = "w-full border border-line rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary bg-white";

/** Title, date, description and visibility of an album. */
export default function AlbumFields({ value, onChange }: { value: Required<AlbumInput>; onChange: (v: Required<AlbumInput>) => void }) {
    const set = <K extends keyof AlbumInput>(key: K, v: Required<AlbumInput>[K]) => onChange({ ...value, [key]: v });
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="space-y-1.5">
                <span className="text-sm font-bold text-gray-600">عنوان الألبوم</span>
                <input required minLength={2} maxLength={150} value={value.title} onChange={(e) => set("title", e.target.value)} placeholder="مثال: الاجتماع السنوي 1447هـ" className={inputClass} />
            </label>
            <label className="space-y-1.5">
                <span className="text-sm font-bold text-gray-600">تاريخ المناسبة (اختياري)</span>
                <input type="date" value={value.eventDate} onChange={(e) => set("eventDate", e.target.value)} className={inputClass} />
            </label>
            <label className="space-y-1.5 sm:col-span-2">
                <span className="text-sm font-bold text-gray-600">الوصف (اختياري)</span>
                <textarea rows={2} maxLength={1000} value={value.description} onChange={(e) => set("description", e.target.value)} className={inputClass} />
            </label>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-600 sm:col-span-2">
                <input type="checkbox" checked={value.visibility === "public"} onChange={(e) => set("visibility", e.target.checked ? "public" : "members")} className="size-4 accent-[var(--color-primary)]" />
                ألبوم عام يظهر في الموقع للجميع (وإلا لأفراد العائلة فقط)
            </label>
        </div>
    );
}
