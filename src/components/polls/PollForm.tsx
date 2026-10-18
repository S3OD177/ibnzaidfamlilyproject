"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, X } from "lucide-react";
import { createPoll } from "@/app/portal/(member)/polls/actions";
import { unwrap } from "@/lib/action-result";
import { RESULTS_LABELS, type PollResults } from "@/lib/polls";
import { toast } from "@/components/ui/feedback";

const inputClass = "w-full border border-line rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary bg-white";
const empty = { question: "", description: "", options: ["", ""], multiple: false, anonymous: true, results: "after_vote" as PollResults, closesAt: "" };

/** Staff: create a poll with 2–10 options. */
export default function PollForm() {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState(empty);
    const [busy, setBusy] = useState(false);

    if (!open) {
        return (
            <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-2 bg-primary text-deep px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-primary-light">
                <Plus className="w-4 h-4" />
                تصويت جديد
            </button>
        );
    }

    const setOption = (i: number, value: string) => setForm((f) => ({ ...f, options: f.options.map((o, j) => (j === i ? value : o)) }));

    return (
        <form
            onSubmit={async (e) => {
                e.preventDefault();
                setBusy(true);
                try {
                    await unwrap(createPoll(form));
                    toast.success("تم نشر التصويت");
                    setForm(empty);
                    setOpen(false);
                    router.refresh();
                } catch (err) {
                    toast.error(err instanceof Error ? err.message : "تعذر النشر");
                } finally {
                    setBusy(false);
                }
            }}
            className="w-full bg-white rounded-2xl border border-primary/40 p-5 space-y-4"
        >
            <label className="block space-y-1.5">
                <span className="text-sm font-bold text-gray-600">السؤال</span>
                <input required minLength={5} maxLength={300} value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} placeholder="مثال: ما الموعد الأنسب للاجتماع السنوي؟" className={inputClass} />
            </label>
            <label className="block space-y-1.5">
                <span className="text-sm font-bold text-gray-600">توضيح (اختياري)</span>
                <textarea rows={2} maxLength={1000} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputClass} />
            </label>
            <div className="space-y-2">
                <span className="text-sm font-bold text-gray-600">الخيارات</span>
                {form.options.map((option, i) => (
                    <div key={i} className="flex gap-2">
                        <input required={i < 2} maxLength={150} value={option} onChange={(e) => setOption(i, e.target.value)} placeholder={`الخيار ${i + 1}`} className={inputClass} />
                        {form.options.length > 2 && (
                            <button type="button" onClick={() => setForm((f) => ({ ...f, options: f.options.filter((_, j) => j !== i) }))} className="px-2 text-gray-400 hover:text-red-600" aria-label="حذف الخيار">
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                ))}
                {form.options.length < 10 && (
                    <button type="button" onClick={() => setForm((f) => ({ ...f, options: [...f.options, ""] }))} className="text-sm font-bold text-primary-dark hover:underline">
                        + إضافة خيار
                    </button>
                )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="space-y-1.5">
                    <span className="text-sm font-bold text-gray-600">عرض النتائج</span>
                    <select value={form.results} onChange={(e) => setForm({ ...form, results: e.target.value as PollResults })} className={inputClass}>
                        {Object.entries(RESULTS_LABELS).map(([k, label]) => (
                            <option key={k} value={k}>{label}</option>
                        ))}
                    </select>
                </label>
                <label className="space-y-1.5">
                    <span className="text-sm font-bold text-gray-600">يُغلق في (اختياري)</span>
                    <input type="date" value={form.closesAt} onChange={(e) => setForm({ ...form, closesAt: e.target.value })} className={inputClass} />
                </label>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-bold text-gray-600">
                <label className="flex items-center gap-2">
                    <input type="checkbox" checked={form.multiple} onChange={(e) => setForm({ ...form, multiple: e.target.checked })} className="size-4 accent-[var(--color-primary)]" />
                    السماح باختيار أكثر من خيار
                </label>
                <label className="flex items-center gap-2">
                    <input type="checkbox" checked={!form.anonymous} onChange={(e) => setForm({ ...form, anonymous: !e.target.checked })} className="size-4 accent-[var(--color-primary)]" />
                    تصويت بالأسماء (تظهر للإدارة أسماء المصوّتين)
                </label>
            </div>
            <div className="flex gap-2">
                <button type="submit" disabled={busy} className="inline-flex items-center gap-2 bg-primary text-deep px-6 py-2.5 rounded-xl font-bold text-sm disabled:opacity-50">
                    {busy && <Loader2 className="w-4 h-4 animate-spin" />}
                    نشر التصويت
                </button>
                <button type="button" onClick={() => setOpen(false)} className="px-4 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100">إلغاء</button>
            </div>
        </form>
    );
}
