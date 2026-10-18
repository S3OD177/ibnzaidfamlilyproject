"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Plus } from "lucide-react";
import FileUploadButton, { type UploadedFile } from "@/components/admin/common/FileUploadButton";
import { addFundEntry, setFundVisibility, type FundEntryInput } from "@/app/portal/admin/fund/actions";
import { unwrap } from "@/lib/action-result";
import { FUND_CATEGORIES, type FundKind } from "@/lib/fund";
import { confirmAction, toast } from "@/components/ui/feedback";

const inputClass = "w-full border border-line rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary bg-white";
const today = () => new Date().toISOString().slice(0, 10);

/** Admin: show the fund to members, and add income or spending records. */
export default function FundAdminControls({ visible }: { visible: boolean }) {
    const router = useRouter();
    const [form, setForm] = useState<FundEntryInput>({ kind: "income", amount: "", entryDate: today(), category: FUND_CATEGORIES.income[0], description: "", party: "", partyHidden: false, receiptFileId: null });
    const [receipt, setReceipt] = useState<UploadedFile | null>(null);
    const [busy, setBusy] = useState(false);
    const setKind = (kind: FundKind) => setForm((f) => ({ ...f, kind, category: FUND_CATEGORIES[kind][0] }));

    return (
        <div className="space-y-4">
            <div className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4 border ${visible ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"}`}>
                <p className="text-sm font-bold flex items-center gap-2">
                    {visible ? <Eye className="w-4 h-4 text-green-700" /> : <EyeOff className="w-4 h-4 text-amber-700" />}
                    {visible ? "صفحة الصندوق ظاهرة لأفراد العائلة." : "صفحة الصندوق مخفية عن الأعضاء حتى يعتمدها المجلس."}
                </p>
                <button
                    type="button"
                    onClick={async () => {
                        if (!visible && !(await confirmAction({ title: "إظهار الصندوق للأعضاء؟", message: "سيرى أفراد العائلة الرصيد والقيود (دون الأسماء المخفية).", confirmLabel: "إظهار" }))) return;
                        try {
                            await unwrap(setFundVisibility(!visible));
                            toast.success(visible ? "أُخفي الصندوق عن الأعضاء" : "أصبح الصندوق ظاهراً للأعضاء");
                            router.refresh();
                        } catch (e) {
                            toast.error(e instanceof Error ? e.message : "تعذر الحفظ");
                        }
                    }}
                    className="rounded-lg px-4 py-2 text-sm font-bold bg-white border border-current/20"
                >
                    {visible ? "إخفاء عن الأعضاء" : "إظهار للأعضاء"}
                </button>
            </div>

            <form
                onSubmit={async (e) => {
                    e.preventDefault();
                    setBusy(true);
                    try {
                        await unwrap(addFundEntry({ ...form, receiptFileId: receipt?.id ?? null }));
                        toast.success("تمت إضافة القيد");
                        setForm((f) => ({ ...f, amount: "", description: "", party: "", partyHidden: false }));
                        setReceipt(null);
                        router.refresh();
                    } catch (err) {
                        toast.error(err instanceof Error ? err.message : "تعذر الحفظ");
                    } finally {
                        setBusy(false);
                    }
                }}
                className="bg-white rounded-2xl border border-line p-5 space-y-4"
            >
                <div className="grid grid-cols-2 gap-1 bg-cream rounded-xl p-1 max-w-xs">
                    {(["income", "expense"] as const).map((k) => (
                        <button key={k} type="button" onClick={() => setKind(k)} className={`rounded-lg py-2 text-sm font-bold ${form.kind === k ? "bg-deep text-primary" : "text-muted"}`}>
                            {k === "income" ? "إيراد" : "مصروف"}
                        </button>
                    ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <label className="space-y-1.5">
                        <span className="text-sm font-bold text-gray-600">المبلغ (ر.س)</span>
                        <input required inputMode="decimal" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0" className={inputClass} dir="ltr" />
                    </label>
                    <label className="space-y-1.5">
                        <span className="text-sm font-bold text-gray-600">التاريخ</span>
                        <input required type="date" value={form.entryDate} onChange={(e) => setForm({ ...form, entryDate: e.target.value })} className={inputClass} />
                    </label>
                    <label className="space-y-1.5">
                        <span className="text-sm font-bold text-gray-600">التصنيف</span>
                        <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputClass}>
                            {FUND_CATEGORIES[form.kind].map((c) => (
                                <option key={c}>{c}</option>
                            ))}
                        </select>
                    </label>
                    <label className="space-y-1.5 sm:col-span-2">
                        <span className="text-sm font-bold text-gray-600">{form.kind === "income" ? "من (اختياري)" : "إلى / المستفيد (اختياري)"}</span>
                        <input maxLength={150} value={form.party} onChange={(e) => setForm({ ...form, party: e.target.value })} className={inputClass} />
                    </label>
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-600 sm:mt-7">
                        <input type="checkbox" checked={Boolean(form.partyHidden)} onChange={(e) => setForm({ ...form, partyHidden: e.target.checked })} className="size-4 accent-[var(--color-primary)]" />
                        إخفاء الاسم عن الأعضاء
                    </label>
                    <label className="space-y-1.5 sm:col-span-3">
                        <span className="text-sm font-bold text-gray-600">الوصف (اختياري)</span>
                        <input maxLength={500} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputClass} />
                    </label>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <FileUploadButton onUploaded={setReceipt} label={receipt ? `الإيصال: ${receipt.name}` : "إرفاق إيصال (اختياري)"} />
                    <button type="submit" disabled={busy} className="inline-flex items-center gap-2 bg-primary text-deep px-6 py-2.5 rounded-xl font-bold text-sm disabled:opacity-50 mr-auto">
                        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        إضافة القيد
                    </button>
                </div>
            </form>
        </div>
    );
}
