"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { unwrap } from "@/lib/action-result";
import { submitProposal } from "@/app/portal/(member)/profile/propose/actions";
import type { ParentOption } from "@/lib/data/proposals";

const inputClass =
    "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary bg-white";

const empty = {
    fullName: "",
    gender: "male",
    status: "alive",
    birthYear: "",
    birthCalendar: "hijri",
    deathYear: "",
    motherName: "",
    note: "",
};

function Choice({ name, value, current, label, onChange }: {
    name: string;
    value: string;
    current: string;
    label: string;
    onChange: (v: string) => void;
}) {
    const active = value === current;
    return (
        <label className={`flex-1 text-center cursor-pointer rounded-xl border px-3 py-2.5 text-sm font-bold transition-colors ${active ? "border-primary bg-primary/10 text-primary-dark" : "border-gray-200 bg-white text-gray-600 hover:bg-cream"}`}>
            <input type="radio" name={name} value={value} checked={active} onChange={() => onChange(value)} className="sr-only" />
            {label}
        </label>
    );
}

/** Form for proposing a new person under the member or one of their descendants. */
export default function ProposalForm({ parents }: { parents: ParentOption[] }) {
    const router = useRouter();
    const [parentId, setParentId] = useState(parents[0]?.id ?? "");
    const [values, setValues] = useState(empty);
    const [state, setState] = useState<{ status: "idle" | "saving" | "sent" | "error"; message?: string }>({ status: "idle" });

    const parent = parents.find((p) => p.id === parentId);
    const set = (key: keyof typeof empty, value: string) => {
        setValues((v) => ({ ...v, [key]: value }));
        if (state.status !== "saving") setState({ status: "idle" });
    };

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setState({ status: "saving" });
        try {
            await unwrap(submitProposal({ parentId, ...values }));
            setState({ status: "sent" });
            setValues(empty);
            router.refresh();
        } catch (error) {
            setState({ status: "error", message: error instanceof Error ? error.message : "تعذر الإرسال" });
        }
    };

    return (
        <form onSubmit={submit} className="bg-white rounded-2xl border border-line p-5 md:p-6 space-y-5">
            <label className="block space-y-1.5">
                <span className="text-sm font-bold text-gray-600">الأب / الأم في الشجرة</span>
                <select value={parentId} onChange={(e) => setParentId(e.target.value)} className={inputClass}>
                    {parents.map((p, i) => (
                        <option key={p.id} value={p.id}>
                            {i === 0 ? `أنا (${p.name})` : p.name}
                        </option>
                    ))}
                </select>
                <span className="block text-xs text-muted">يمكنك الإضافة تحتك أو تحت أحد أبنائك وأحفادك.</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block space-y-1.5 sm:col-span-2">
                    <span className="text-sm font-bold text-gray-600">اسم الفرد</span>
                    <input required maxLength={150} value={values.fullName} onChange={(e) => set("fullName", e.target.value)} placeholder="الاسم الأول" className={inputClass} />
                </label>

                <div className="space-y-1.5">
                    <span className="text-sm font-bold text-gray-600">الجنس</span>
                    <div className="flex gap-2">
                        <Choice name="gender" value="male" current={values.gender} label="ذكر" onChange={(v) => set("gender", v)} />
                        <Choice name="gender" value="female" current={values.gender} label="أنثى" onChange={(v) => set("gender", v)} />
                    </div>
                </div>
                <div className="space-y-1.5">
                    <span className="text-sm font-bold text-gray-600">الحالة</span>
                    <div className="flex gap-2">
                        <Choice name="status" value="alive" current={values.status} label="على قيد الحياة" onChange={(v) => set("status", v)} />
                        <Choice name="status" value="deceased" current={values.status} label="متوفى" onChange={(v) => set("status", v)} />
                    </div>
                </div>

                <label className="block space-y-1.5">
                    <span className="text-sm font-bold text-gray-600">سنة الميلاد (اختياري)</span>
                    <div className="flex gap-2">
                        <input inputMode="numeric" dir="ltr" maxLength={4} value={values.birthYear} onChange={(e) => set("birthYear", e.target.value.replace(/\D/g, ""))} placeholder={values.birthCalendar === "hijri" ? "1446" : "2025"} className={`${inputClass} flex-1 min-w-0 text-left`} />
                        <select value={values.birthCalendar} onChange={(e) => set("birthCalendar", e.target.value)} className={`${inputClass.replace("w-full", "")} w-28 shrink-0`}>
                            <option value="hijri">هجري</option>
                            <option value="gregorian">ميلادي</option>
                        </select>
                    </div>
                </label>
                {values.status === "deceased" && (
                    <label className="block space-y-1.5">
                        <span className="text-sm font-bold text-gray-600">سنة الوفاة (اختياري، بنفس التقويم)</span>
                        <input inputMode="numeric" dir="ltr" maxLength={4} value={values.deathYear} onChange={(e) => set("deathYear", e.target.value.replace(/\D/g, ""))} className={`${inputClass} flex-1 min-w-0 text-left`} />
                    </label>
                )}

                <label className="block space-y-1.5 sm:col-span-2">
                    <span className="text-sm font-bold text-gray-600">اسم الأم (اختياري)</span>
                    <input maxLength={150} value={values.motherName} onChange={(e) => set("motherName", e.target.value)} className={inputClass} />
                    {parent?.gender === "male" && (
                        <span className="block text-xs text-muted">تُضاف زوجةً لـ {parent.name} إن لم تكن مسجّلة.</span>
                    )}
                </label>

                <label className="block space-y-1.5 sm:col-span-2">
                    <span className="text-sm font-bold text-gray-600">ملاحظة للإدارة (اختياري)</span>
                    <textarea rows={2} maxLength={1000} value={values.note} onChange={(e) => set("note", e.target.value)} placeholder="مثال: مولود جديد في شهر رمضان" className={inputClass} />
                </label>
            </div>

            {state.status === "sent" && (
                <p className="flex items-center gap-2 text-sm font-bold text-green-700 bg-green-50 rounded-xl p-3">
                    <CheckCircle2 className="w-4 h-4" />
                    تم إرسال الطلب، ويظهر الفرد في الشجرة بعد اعتماده من الإدارة.
                </p>
            )}
            {state.status === "error" && <p className="text-sm font-bold text-red-600 bg-red-50 rounded-xl p-3">{state.message}</p>}

            <button
                type="submit"
                disabled={!values.fullName.trim() || !parentId || state.status === "saving"}
                className="flex items-center gap-2 bg-primary text-white font-bold rounded-xl px-6 py-3 text-sm hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {state.status === "saving" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                إرسال الطلب للمراجعة
            </button>
        </form>
    );
}
