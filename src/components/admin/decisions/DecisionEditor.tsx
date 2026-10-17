"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, FileText, Gavel, Trash2, X } from "lucide-react";
import FileUploadButton from "@/components/admin/common/FileUploadButton";
import { deleteDecision, saveDecision, type DecisionInput } from "@/app/portal/admin/decisions/actions";
import { unwrap } from "@/lib/action-result";

const inputClass = "w-full rounded-lg border border-[#dbe6dd] bg-[#f8faf8] focus:border-primary py-2.5 px-3 text-sm outline-none";

export default function DecisionEditor({
    initial,
    attachmentName,
    types,
    states,
}: {
    initial: DecisionInput;
    attachmentName: string | null;
    types: readonly string[];
    states: Record<string, { label: string }>;
}) {
    const router = useRouter();
    const [values, setValues] = useState(initial);
    const [fileName, setFileName] = useState(attachmentName);
    const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
    const [pending, startTransition] = useTransition();
    const set = <K extends keyof DecisionInput>(key: K, value: DecisionInput[K]) => setValues((v) => ({ ...v, [key]: value }));

    const save = () => {
        setMessage(null);
        startTransition(async () => {
            try {
                const { id } = await unwrap(saveDecision(values));
                setMessage({ type: "ok", text: "تم حفظ القرار" });
                if (!values.id) router.replace(`/portal/admin/decisions/${id}`);
                else router.refresh();
                setValues((v) => ({ ...v, id }));
            } catch (e) {
                setMessage({ type: "error", text: e instanceof Error ? e.message : "تعذر الحفظ" });
            }
        });
    };

    const remove = () => {
        if (!values.id || !confirm("حذف هذا القرار نهائياً؟")) return;
        startTransition(async () => {
            try {
                await unwrap(deleteDecision(values.id!));
                router.replace("/portal/admin/decisions");
            } catch (e) {
                setMessage({ type: "error", text: e instanceof Error ? e.message : "تعذر الحذف" });
            }
        });
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 font-display pb-16">
            <Link href="/portal/admin/decisions" className="inline-flex items-center gap-2 text-sm font-bold text-[#618968] hover:text-[#111812]">
                <ArrowRight className="w-4 h-4" />
                أرشيف القرارات
            </Link>
            <h1 className="text-3xl font-black text-[#111812] flex items-center gap-3">
                <Gavel className="w-7 h-7 text-primary" />
                {values.id ? "تعديل قرار" : "إصدار قرار جديد"}
            </h1>

            <div className="bg-white p-6 rounded-xl border border-[#dbe6dd] shadow-sm space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <label className="block">
                        <span className="text-sm font-bold text-[#111812] mb-1.5 block">رقم القرار</span>
                        <input className={inputClass} dir="ltr" placeholder="1446-03" value={values.referenceNumber} onChange={(e) => set("referenceNumber", e.target.value)} />
                    </label>
                    <label className="block md:col-span-3">
                        <span className="text-sm font-bold text-[#111812] mb-1.5 block">عنوان القرار</span>
                        <input className={inputClass} maxLength={300} value={values.title} onChange={(e) => set("title", e.target.value)} />
                    </label>
                    <label className="block">
                        <span className="text-sm font-bold text-[#111812] mb-1.5 block">نوع القرار</span>
                        <select className={inputClass} value={values.decisionType} onChange={(e) => set("decisionType", e.target.value)}>
                            <option value="">اختر...</option>
                            {types.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </label>
                    <label className="block">
                        <span className="text-sm font-bold text-[#111812] mb-1.5 block">السنة (هجري)</span>
                        <input className={inputClass} inputMode="numeric" placeholder="1446" value={values.hijriYear} onChange={(e) => set("hijriYear", e.target.value.replace(/\D/g, "").slice(0, 4))} />
                    </label>
                    <label className="block">
                        <span className="text-sm font-bold text-[#111812] mb-1.5 block">تاريخ الإصدار</span>
                        <input className={inputClass} type="date" value={values.issuedAt} onChange={(e) => set("issuedAt", e.target.value)} />
                    </label>
                    <label className="block">
                        <span className="text-sm font-bold text-[#111812] mb-1.5 block">الحالة</span>
                        <select className={inputClass} value={values.state} onChange={(e) => set("state", e.target.value)}>
                            {Object.entries(states).map(([key, s]) => <option key={key} value={key}>{s.label}</option>)}
                        </select>
                    </label>
                </div>
                <label className="block">
                    <span className="text-sm font-bold text-[#111812] mb-1.5 block">الكلمات المفتاحية (افصل بينها بفاصلة)</span>
                    <input className={inputClass} placeholder="التعليم، صندوق التكافل" value={values.keywords} onChange={(e) => set("keywords", e.target.value)} />
                </label>
                <label className="block">
                    <span className="text-sm font-bold text-[#111812] mb-1.5 block">نص القرار</span>
                    <textarea className={`${inputClass} min-h-[260px] leading-relaxed text-base`} value={values.body} onChange={(e) => set("body", e.target.value)} />
                </label>
                <div className="space-y-2">
                    <span className="text-sm font-bold text-[#111812] block">المرفق الرسمي (اختياري)</span>
                    {values.attachmentFileId && fileName ? (
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-[#f8faf8] border border-[#dbe6dd]">
                            <FileText className="w-5 h-5 text-primary" />
                            <a href={`/files/${values.attachmentFileId}`} target="_blank" className="text-sm font-bold text-[#111812] hover:text-primary flex-1 truncate">{fileName}</a>
                            <button type="button" onClick={() => { set("attachmentFileId", null); setFileName(null); }} className="p-1 text-gray-400 hover:text-red-500 cursor-pointer" aria-label="إزالة المرفق">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <FileUploadButton
                            label="إرفاق ملف القرار (PDF)"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onUploaded={(f) => { set("attachmentFileId", f.id); setFileName(f.name); }}
                        />
                    )}
                </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    {values.id && (
                        <button type="button" onClick={remove} disabled={pending} className="flex items-center gap-2 text-sm font-bold text-red-600 hover:underline cursor-pointer">
                            <Trash2 className="w-4 h-4" />
                            حذف القرار
                        </button>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    {message && <span className={`text-sm font-bold ${message.type === "ok" ? "text-green-600" : "text-red-600"}`}>{message.text}</span>}
                    <button type="button" onClick={save} disabled={pending} className="px-8 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-dark disabled:opacity-50 cursor-pointer">
                        {pending ? "جارٍ الحفظ..." : "حفظ القرار"}
                    </button>
                </div>
            </div>
        </div>
    );
}
