"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, RotateCcw, Send } from "lucide-react";
import ImageUpload from "@/components/admin/common/ImageUpload";
import { CHANGE_FIELDS, FIELD_GROUPS, type ChangeField } from "@/lib/change-requests";
import { unwrap } from "@/lib/action-result";
import { submitChangeRequest } from "@/app/portal/(member)/profile/actions";

type Values = Record<string, string>;

const inputClass =
    "w-full border rounded-xl px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary bg-white";

/**
 * Form for a member's own details. Starts from the current record (plus any pending
 * request) and sends only the fields that differ from the record.
 */
export default function ChangeRequestForm({ current, initial }: { current: Values; initial: Values }) {
    const router = useRouter();
    const [values, setValues] = useState<Values>(initial);
    const [note, setNote] = useState("");
    // Remounts the image picker (it keeps its own preview) after a reset or removal.
    const [photoVersion, setPhotoVersion] = useState(0);
    const [state, setState] = useState<{ status: "idle" | "saving" | "sent" | "error"; message?: string }>({ status: "idle" });

    const changedKeys = useMemo(
        () => CHANGE_FIELDS.filter((f) => (values[f.key] ?? "") !== (current[f.key] ?? "")).map((f) => f.key),
        [values, current],
    );

    const set = (key: string, value: string) => {
        setValues((v) => ({ ...v, [key]: value }));
        if (state.status !== "saving") setState({ status: "idle" });
    };

    const renderInput = (field: ChangeField) => {
        const value = values[field.key] ?? "";
        const changed = changedKeys.includes(field.key);
        const cls = `${inputClass} ${changed ? "border-primary bg-primary/5" : "border-gray-200"}`;
        switch (field.kind) {
            case "photo":
                return (
                    <div className="max-w-xs">
                        <ImageUpload key={photoVersion} value={value} onChange={(v) => set(field.key, v)} />
                        {value && (
                            <button type="button" onClick={() => {
                                set(field.key, "");
                                setPhotoVersion((n) => n + 1);
                            }} className="text-xs text-red-600 font-bold mt-2 hover:underline">
                                إزالة الصورة
                            </button>
                        )}
                    </div>
                );
            case "textarea":
                return <textarea rows={4} maxLength={field.max} value={value} onChange={(e) => set(field.key, e.target.value)} className={cls} />;
            case "select":
                return (
                    <select value={value} onChange={(e) => set(field.key, e.target.value)} className={cls}>
                        <option value="">غير محدد</option>
                        {Object.entries(field.options ?? {}).map(([k, label]) => (
                            <option key={k} value={k}>{label}</option>
                        ))}
                    </select>
                );
            default:
                return (
                    <input
                        type={field.kind}
                        dir={["email", "tel", "url"].includes(field.kind) ? "ltr" : undefined}
                        maxLength={field.max}
                        value={value}
                        onChange={(e) => set(field.key, e.target.value)}
                        className={`${cls} ${["email", "tel", "url"].includes(field.kind) ? "text-left" : ""}`}
                    />
                );
        }
    };

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setState({ status: "saving" });
        try {
            const changed = Object.fromEntries(changedKeys.map((k) => [k, values[k] ?? ""]));
            await unwrap(submitChangeRequest({ values: changed, note }));
            setState({ status: "sent" });
            setNote("");
            router.refresh();
        } catch (error) {
            setState({ status: "error", message: error instanceof Error ? error.message : "تعذر الإرسال" });
        }
    };

    const groups = Object.entries(FIELD_GROUPS) as [ChangeField["group"], string][];

    return (
        <form onSubmit={submit} className="space-y-6">
            {groups.map(([group, title]) => (
                <section key={group} className="bg-white rounded-2xl border border-line p-5 md:p-6">
                    <h2 className="font-bold mb-4">{title}</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {CHANGE_FIELDS.filter((f) => f.group === group).map((field) => (
                            <label key={field.key} className={`block space-y-1.5 ${field.kind === "textarea" || field.kind === "photo" ? "sm:col-span-2" : ""}`}>
                                <span className="text-sm font-bold text-gray-600 flex items-center gap-2">
                                    {field.label}
                                    {changedKeys.includes(field.key) && (
                                        <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">معدّل</span>
                                    )}
                                </span>
                                {renderInput(field)}
                            </label>
                        ))}
                    </div>
                </section>
            ))}

            <section className="bg-white rounded-2xl border border-line p-5 md:p-6 space-y-4">
                <label className="block space-y-1.5">
                    <span className="text-sm font-bold text-gray-600">ملاحظة للإدارة (اختياري)</span>
                    <textarea
                        rows={2}
                        maxLength={1000}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="مثال: انتقلت إلى الرياض هذا العام"
                        className={`${inputClass} border-gray-200`}
                    />
                </label>

                {state.status === "sent" && (
                    <p className="flex items-center gap-2 text-sm font-bold text-green-700 bg-green-50 rounded-xl p-3">
                        <CheckCircle2 className="w-4 h-4" />
                        تم إرسال طلبك، وسيظهر التعديل في ملفك بعد اعتماده من الإدارة.
                    </p>
                )}
                {state.status === "error" && <p className="text-sm font-bold text-red-600 bg-red-50 rounded-xl p-3">{state.message}</p>}

                <div className="flex flex-wrap items-center gap-3">
                    <button
                        type="submit"
                        disabled={changedKeys.length === 0 || state.status === "saving"}
                        className="flex items-center gap-2 bg-primary text-white font-bold rounded-xl px-6 py-3 text-sm hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {state.status === "saving" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        إرسال الطلب للمراجعة
                    </button>
                    {changedKeys.length > 0 && (
                        <>
                            <span className="text-sm text-gray-500">{changedKeys.length === 1 ? "حقل واحد معدّل" : `${changedKeys.length} حقول معدّلة`}</span>
                            <button
                                type="button"
                                onClick={() => {
                                    setValues(current);
                                    setPhotoVersion((n) => n + 1);
                                }}
                                className="flex items-center gap-1 text-sm font-bold text-gray-500 hover:text-gray-800"
                            >
                                <RotateCcw className="w-4 h-4" />
                                تراجع
                            </button>
                        </>
                    )}
                </div>
            </section>
        </form>
    );
}
