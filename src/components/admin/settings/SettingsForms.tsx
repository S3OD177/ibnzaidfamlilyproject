"use client";

import { useState, useTransition } from "react";
import { Globe, Info, Plus, Save, X } from "lucide-react";
import type { AboutContent, SiteSettings } from "@/lib/settings";
import { saveAboutContent, saveSiteSettings } from "@/app/portal/admin/settings/actions";
import { unwrap } from "@/lib/action-result";

const inputClass = "w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-primary";
const areaClass = `${inputClass} min-h-[90px] leading-relaxed`;

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
    return (
        <label className="block space-y-1.5">
            <span className="text-sm font-bold text-ink">{label}</span>
            {children}
            {hint && <span className="text-xs text-gray-400 block">{hint}</span>}
        </label>
    );
}

function SaveBar({ pending, message, onSave }: { pending: boolean; message: { type: "ok" | "error"; text: string } | null; onSave: () => void }) {
    return (
        <div className="flex items-center justify-end gap-3 pt-2">
            {message && <span className={`text-sm font-bold ${message.type === "ok" ? "text-green-600" : "text-red-600"}`}>{message.text}</span>}
            <button type="button" onClick={onSave} disabled={pending} className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold disabled:opacity-50 cursor-pointer">
                <Save className="w-4 h-4" />
                {pending ? "جارٍ الحفظ..." : "حفظ"}
            </button>
        </div>
    );
}

function useSaver() {
    const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
    const [pending, startTransition] = useTransition();
    const save = (fn: () => Promise<void>) => {
        setMessage(null);
        startTransition(async () => {
            try {
                await fn();
                setMessage({ type: "ok", text: "تم الحفظ" });
            } catch (e) {
                setMessage({ type: "error", text: e instanceof Error ? e.message : "تعذر الحفظ" });
            }
        });
    };
    return { message, pending, save };
}

export function SiteSettingsForm({ initial }: { initial: SiteSettings }) {
    const [v, setV] = useState(initial);
    const { message, pending, save } = useSaver();
    const set = (key: keyof SiteSettings, value: string) => setV((s) => ({ ...s, [key]: value }));

    return (
        <section id="site" className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5 scroll-mt-24">
            <h3 className="text-xl font-bold text-ink flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                الموقع ومعلومات التواصل
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="اسم الموقع" hint="يظهر في الشريط العلوي والتذييل وعنوان المتصفح.">
                    <input className={inputClass} maxLength={80} value={v.siteName} onChange={(e) => set("siteName", e.target.value)} />
                </Field>
                <Field label="الوصف المختصر" hint="يظهر في نتائج البحث وتحت اسم الموقع.">
                    <input className={inputClass} maxLength={200} value={v.tagline} onChange={(e) => set("tagline", e.target.value)} />
                </Field>
                <Field label="البريد الإلكتروني للتواصل">
                    <input className={inputClass} dir="ltr" type="email" value={v.contactEmail} onChange={(e) => set("contactEmail", e.target.value)} />
                </Field>
                <Field label="حساب منصة X" hint="بدون @، مثال: H_ibnzaid">
                    <input className={inputClass} dir="ltr" value={v.xHandle} onChange={(e) => set("xHandle", e.target.value)} />
                </Field>
                <Field label="رقم واتساب" hint="بالصيغة الدولية، مثال: 9665xxxxxxxx. اتركه فارغاً لإخفاء زر واتساب.">
                    <input className={inputClass} dir="ltr" inputMode="tel" value={v.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} />
                </Field>
                <Field label="نص التذييل" hint="يظهر أسفل كل صفحة بعد عبارة الحقوق.">
                    <textarea className={areaClass} maxLength={500} value={v.footerText} onChange={(e) => set("footerText", e.target.value)} />
                </Field>
            </div>
            <SaveBar pending={pending} message={message} onSave={() => save(() => unwrap(saveSiteSettings(v)))} />
        </section>
    );
}

export function AboutContentForm({ initial }: { initial: AboutContent }) {
    const [v, setV] = useState(initial);
    const [newValue, setNewValue] = useState("");
    const { message, pending, save } = useSaver();
    const set = (key: Exclude<keyof AboutContent, "values">, value: string) => setV((s) => ({ ...s, [key]: value }));

    return (
        <section id="about" className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5 scroll-mt-24">
            <h3 className="text-xl font-bold text-ink flex items-center gap-2">
                <Info className="w-5 h-5 text-primary" />
                صفحة «عن العائلة»
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="العنوان الرئيسي">
                    <input className={inputClass} maxLength={150} value={v.heroTitle} onChange={(e) => set("heroTitle", e.target.value)} />
                </Field>
                <Field label="النبذة التعريفية">
                    <textarea className={areaClass} maxLength={1000} value={v.heroText} onChange={(e) => set("heroText", e.target.value)} />
                </Field>
                <Field label="رسالتنا">
                    <textarea className={areaClass} maxLength={1000} value={v.mission} onChange={(e) => set("mission", e.target.value)} />
                </Field>
                <Field label="رؤيتنا">
                    <textarea className={areaClass} maxLength={1000} value={v.vision} onChange={(e) => set("vision", e.target.value)} />
                </Field>
            </div>
            <div className="space-y-2">
                <span className="text-sm font-bold text-ink block">قيمنا</span>
                <div className="flex flex-wrap gap-2">
                    {v.values.map((value, i) => (
                        <span key={`${value}-${i}`} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-bold">
                            {value}
                            <button
                                type="button"
                                aria-label={`حذف ${value}`}
                                onClick={() => setV((s) => ({ ...s, values: s.values.filter((_, j) => j !== i) }))}
                                className="text-primary/60 hover:text-red-500 cursor-pointer"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </span>
                    ))}
                    {v.values.length < 8 && (
                        <span className="inline-flex items-center gap-1">
                            <input
                                className="rounded-full border border-dashed border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-primary w-40"
                                placeholder="قيمة جديدة"
                                maxLength={60}
                                value={newValue}
                                onChange={(e) => setNewValue(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && newValue.trim()) {
                                        e.preventDefault();
                                        setV((s) => ({ ...s, values: [...s.values, newValue.trim()] }));
                                        setNewValue("");
                                    }
                                }}
                            />
                            <button
                                type="button"
                                aria-label="إضافة قيمة"
                                disabled={!newValue.trim()}
                                onClick={() => {
                                    setV((s) => ({ ...s, values: [...s.values, newValue.trim()] }));
                                    setNewValue("");
                                }}
                                className="p-1.5 rounded-full bg-primary text-white disabled:opacity-30 cursor-pointer"
                            >
                                <Plus className="w-3.5 h-3.5" />
                            </button>
                        </span>
                    )}
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="عنوان اللمحة التاريخية">
                    <input className={inputClass} maxLength={150} value={v.historyTitle} onChange={(e) => set("historyTitle", e.target.value)} />
                </Field>
                <Field label="عنوان دعوة المشاركة">
                    <input className={inputClass} maxLength={150} value={v.ctaTitle} onChange={(e) => set("ctaTitle", e.target.value)} />
                </Field>
                <Field label="اللمحة التاريخية" hint="اترك سطراً فارغاً بين الفقرات.">
                    <textarea className={`${areaClass} min-h-[160px]`} maxLength={5000} value={v.historyText} onChange={(e) => set("historyText", e.target.value)} />
                </Field>
                <Field label="نص دعوة المشاركة">
                    <textarea className={areaClass} maxLength={1000} value={v.ctaText} onChange={(e) => set("ctaText", e.target.value)} />
                </Field>
            </div>
            <SaveBar pending={pending} message={message} onSave={() => save(() => unwrap(saveAboutContent(v)))} />
        </section>
    );
}
