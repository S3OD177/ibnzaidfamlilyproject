"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import Timeline from "@/components/timeline/Timeline";
import { TIMELINE_TYPES } from "@/lib/calendar/categories";
import type { StoredTimelineEvent } from "@/lib/data/events";
import { addTimelineEvent, deleteTimelineEvent } from "@/app/portal/admin/calendar/actions";
import type { TimelineEvent } from "@/types/timeline";
import { unwrap } from "@/lib/action-result";
import { confirmAction, toast } from "@/components/ui/feedback";

const byYearDesc = (a: StoredTimelineEvent, b: StoredTimelineEvent) => b.year - a.year;

export default function TimelineManager({ initialEvents }: { initialEvents: StoredTimelineEvent[] }) {
    const [events, setEvents] = useState(initialEvents);
    const [form, setForm] = useState({ year: "", title: "", description: "", type: "milestone" });
    const [error, setError] = useState<string | null>(null);
    const [pending, startTransition] = useTransition();

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        startTransition(async () => {
            try {
                const saved = await unwrap(addTimelineEvent({ ...form, year: Number(form.year) }));
                setEvents((prev) => [...prev, saved].sort(byYearDesc));
                toast.success("تمت إضافة الحدث");
                setForm({ year: "", title: "", description: "", type: form.type });
            } catch (err) {
                setError(err instanceof Error ? err.message : "تعذر الحفظ");
            }
        });
    };

    const remove = async (event: TimelineEvent) => {
        if (!(await confirmAction({ title: `حذف "${event.title}"؟`, confirmLabel: "حذف", danger: true }))) return;
        setError(null);
        startTransition(async () => {
            try {
                await unwrap(deleteTimelineEvent(event.id));
                setEvents((prev) => prev.filter((ev) => ev.id !== event.id));
                toast.success("تم حذف الحدث");
            } catch (err) {
                setError(err instanceof Error ? err.message : "تعذر الحذف");
            }
        });
    };

    const inputClass = "w-full rounded-lg border border-line bg-white p-2.5 text-sm outline-none focus:border-primary";

    return (
        <div className="space-y-6">
            <form onSubmit={submit} className="bg-white p-6 rounded-2xl border border-line shadow-sm space-y-4">
                <h2 className="font-bold text-ink">إضافة حدث للسجل</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <label className="block">
                        <span className="text-xs font-bold text-muted mb-1 block">السنة (هجري)</span>
                        <input
                            className={inputClass}
                            inputMode="numeric"
                            placeholder="1445"
                            required
                            value={form.year}
                            onChange={(e) => setForm({ ...form, year: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                        />
                    </label>
                    <label className="block md:col-span-2">
                        <span className="text-xs font-bold text-muted mb-1 block">العنوان</span>
                        <input
                            className={inputClass}
                            required
                            maxLength={200}
                            placeholder="مثال: تأسيس صندوق العائلة"
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                        />
                    </label>
                    <label className="block">
                        <span className="text-xs font-bold text-muted mb-1 block">النوع</span>
                        <select className={inputClass} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                            {TIMELINE_TYPES.map((t) => (
                                <option key={t.id} value={t.id}>{t.label}</option>
                            ))}
                        </select>
                    </label>
                </div>
                <label className="block">
                    <span className="text-xs font-bold text-muted mb-1 block">الوصف (اختياري)</span>
                    <textarea
                        className={`${inputClass} min-h-[70px]`}
                        maxLength={2000}
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                    />
                </label>
                <div className="flex items-center justify-between gap-4">
                    <span className="text-xs font-bold">
                        {pending && <span className="text-blue-600">جارٍ الحفظ...</span>}
                        {!pending && error && <span className="text-red-600">{error}</span>}
                    </span>
                    <button
                        type="submit"
                        disabled={pending}
                        className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg font-bold text-sm hover:bg-primary/90 transition-all disabled:opacity-50 cursor-pointer"
                    >
                        <Plus className="w-4 h-4" />
                        إضافة
                    </button>
                </div>
            </form>

            <div className="bg-white p-8 rounded-2xl border border-line shadow-sm">
                <Timeline
                    events={events.map((e) => ({ ...e, description: e.description ?? undefined, memberId: e.memberId ?? undefined }))}
                    onDelete={remove}
                />
            </div>
        </div>
    );
}
