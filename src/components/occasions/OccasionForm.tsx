"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, PartyPopper, Plus, X } from "lucide-react";
import ImageUpload from "@/components/admin/common/ImageUpload";
import { submitOccasion } from "@/app/portal/(member)/occasions/actions";
import { unwrap } from "@/lib/action-result";
import { OCCASION_TYPES, type OccasionType } from "@/lib/occasions";
import { toast } from "@/components/ui/feedback";

const empty = { type: "wedding" as OccasionType, title: "", message: "", occasionDate: "", memberId: "", photo: "", visibility: "members" as "public" | "members" };
const inputClass = "w-full border border-sand rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary bg-white";

/** Share happy news. Staff publish directly (and may make it public); members' posts are reviewed. */
export default function OccasionForm({ members, isStaff }: { members: { id: string; name: string }[]; isStaff: boolean }) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState(empty);
    const [photoKey, setPhotoKey] = useState(0);
    const [busy, setBusy] = useState(false);
    const set = <K extends keyof typeof empty>(key: K, value: (typeof empty)[K]) => setForm((f) => ({ ...f, [key]: value }));

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setBusy(true);
        try {
            const { published } = await unwrap(submitOccasion({ ...form, memberId: form.memberId || null }));
            toast.success(published ? "تم نشر الخبر السعيد" : "تم إرسال الخبر، وسيظهر بعد مراجعة الإدارة");
            setForm(empty);
            setPhotoKey((k) => k + 1);
            setOpen(false);
            router.refresh();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "تعذر الإرسال");
        } finally {
            setBusy(false);
        }
    };

    if (!open) {
        return (
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-primary/40 text-primary-dark font-bold rounded-2xl py-4 hover:bg-primary/5 transition-colors"
            >
                <Plus className="w-5 h-5" />
                شارك خبراً سعيداً
            </button>
        );
    }

    return (
        <form onSubmit={submit} className="bg-white rounded-2xl border border-primary/40 p-5 md:p-6 space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="font-heritage font-bold text-2xl text-deep flex items-center gap-2">
                    <PartyPopper className="w-5 h-5 text-primary-dark" />
                    شارك خبراً سعيداً
                </h2>
                <button type="button" onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600" aria-label="إغلاق">
                    <X className="w-5 h-5" />
                </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="space-y-1.5">
                    <span className="text-sm font-bold text-gray-600">نوع المناسبة</span>
                    <select value={form.type} onChange={(e) => set("type", e.target.value as OccasionType)} className={inputClass}>
                        {Object.entries(OCCASION_TYPES).map(([key, t]) => (
                            <option key={key} value={key}>{t.label}</option>
                        ))}
                    </select>
                </label>
                <label className="space-y-1.5">
                    <span className="text-sm font-bold text-gray-600">التاريخ (اختياري)</span>
                    <input type="date" value={form.occasionDate} onChange={(e) => set("occasionDate", e.target.value)} className={inputClass} />
                </label>
                <label className="space-y-1.5 sm:col-span-2">
                    <span className="text-sm font-bold text-gray-600">العنوان</span>
                    <input
                        required
                        minLength={3}
                        maxLength={150}
                        value={form.title}
                        onChange={(e) => set("title", e.target.value)}
                        placeholder="مثال: زواج محمد بن عبدالله"
                        className={inputClass}
                    />
                </label>
                <label className="space-y-1.5 sm:col-span-2">
                    <span className="text-sm font-bold text-gray-600">صاحب المناسبة في الشجرة (اختياري)</span>
                    <select value={form.memberId} onChange={(e) => set("memberId", e.target.value)} className={inputClass}>
                        <option value="">بدون ربط</option>
                        {members.map((m) => (
                            <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                    </select>
                </label>
                <label className="space-y-1.5 sm:col-span-2">
                    <span className="text-sm font-bold text-gray-600">التفاصيل (اختياري)</span>
                    <textarea rows={3} maxLength={1000} value={form.message} onChange={(e) => set("message", e.target.value)} className={inputClass} />
                </label>
                <div className="space-y-1.5 sm:col-span-2 max-w-xs">
                    <span className="text-sm font-bold text-gray-600">صورة (اختياري)</span>
                    <ImageUpload key={photoKey} value={form.photo} onChange={(v) => set("photo", v)} />
                </div>
                {isStaff && (
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-600 sm:col-span-2">
                        <input
                            type="checkbox"
                            checked={form.visibility === "public"}
                            onChange={(e) => set("visibility", e.target.checked ? "public" : "members")}
                            className="size-4 accent-[var(--color-primary)]"
                        />
                        إظهاره في الموقع العام أيضاً (وإلا يظهر لأفراد العائلة فقط)
                    </label>
                )}
            </div>
            <div className="flex items-center gap-3">
                <button type="submit" disabled={busy} className="inline-flex items-center gap-2 bg-primary text-deep font-bold rounded-xl px-6 py-3 text-sm hover:bg-primary-light disabled:opacity-50">
                    {busy && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isStaff ? "نشر" : "إرسال للمراجعة"}
                </button>
                {!isStaff && <span className="text-xs text-muted">يظهر الخبر بعد مراجعة الإدارة.</span>}
            </div>
        </form>
    );
}
