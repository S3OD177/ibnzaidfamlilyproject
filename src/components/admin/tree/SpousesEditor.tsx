"use client";

import { useEffect, useState, useTransition } from "react";
import { Heart, Trash2 } from "lucide-react";
import { addSpouse, listSpouses, removeSpouse, type SpouseEntry } from "@/app/portal/admin/tree/actions";
import { unwrap } from "@/lib/action-result";

export interface MemberOption {
    id: string;
    label: string;
}

const inputClass = "w-full p-2 text-sm rounded-lg border border-gray-200 outline-none focus:border-primary bg-white";

/** Lists and (unless readOnly) edits a member's spouses; changes save immediately. */
export default function SpousesEditor({ memberId, options, readOnly = false }: { memberId: string; options: MemberOption[]; readOnly?: boolean }) {
    const [spouses, setSpouses] = useState<SpouseEntry[] | null>(null);
    const [adding, setAdding] = useState(false);
    const [form, setForm] = useState({ spouseId: "", spouseName: "", marriageYear: "" });
    const [error, setError] = useState<string | null>(null);
    const [pending, startTransition] = useTransition();

    const [version, setVersion] = useState(0); // bump to reload after a change

    useEffect(() => {
        let cancelled = false;
        listSpouses(memberId).then((res) => {
            if (cancelled) return;
            if (res.ok) setSpouses(res.data);
            else setError(res.error);
        });
        return () => {
            cancelled = true;
        };
    }, [memberId, version]);

    const run = (fn: () => Promise<void>) => {
        setError(null);
        startTransition(async () => {
            try {
                await fn();
                setVersion((v) => v + 1);
            } catch (e) {
                setError(e instanceof Error ? e.message : "تعذر الحفظ");
            }
        });
    };

    return (
        <div className="space-y-2">
            {spouses === null && !error && <p className="text-xs text-gray-300">جارٍ التحميل...</p>}
            {spouses?.length === 0 && <p className="text-xs text-gray-300 font-bold text-center py-2">لا يوجد أزواج</p>}
            {spouses?.map((s) => (
                <div key={s.marriageId} className="flex items-center gap-2 p-2 rounded-lg bg-[#fbfaf6] border border-[#D4AF37]/20">
                    <Heart className="w-4 h-4 text-[#D4AF37] shrink-0" />
                    <span className="text-sm font-bold text-[#111814] flex-1 truncate">{s.name}</span>
                    {s.marriageYear && <span className="text-[11px] text-gray-400">{s.marriageYear}</span>}
                    {!s.spouseId && <span className="text-[10px] text-gray-400">من خارج الشجرة</span>}
                    {!readOnly && (
                        <button
                            type="button"
                            disabled={pending}
                            aria-label={`حذف ${s.name}`}
                            onClick={() => {
                                if (!confirm(`إزالة ${s.name} من الأزواج؟`)) return;
                                run(() => unwrap(removeSpouse(s.marriageId)));
                            }}
                            className="p-1 text-gray-300 hover:text-red-500 cursor-pointer"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            ))}

            {!readOnly && !adding && (
                <button
                    type="button"
                    onClick={() => setAdding(true)}
                    className="w-full py-2 border border-dashed border-gray-300 rounded-lg text-xs font-bold text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                    إضافة زوج / زوجة
                </button>
            )}

            {!readOnly && adding && (
                <div className="space-y-2 p-3 rounded-lg border border-gray-200 bg-gray-50">
                    <select className={inputClass} value={form.spouseId} onChange={(e) => setForm({ ...form, spouseId: e.target.value })}>
                        <option value="">من خارج الشجرة (اكتب الاسم)</option>
                        {options.filter((o) => o.id !== memberId).map((o) => (
                            <option key={o.id} value={o.id}>{o.label}</option>
                        ))}
                    </select>
                    {!form.spouseId && (
                        <input className={inputClass} placeholder="الاسم الكامل" maxLength={200} value={form.spouseName} onChange={(e) => setForm({ ...form, spouseName: e.target.value })} />
                    )}
                    <input
                        className={inputClass}
                        inputMode="numeric"
                        placeholder="سنة الزواج (اختياري)"
                        value={form.marriageYear}
                        onChange={(e) => setForm({ ...form, marriageYear: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                    />
                    <div className="flex gap-2">
                        <button
                            type="button"
                            disabled={pending}
                            onClick={() =>
                                run(async () => {
                                    await unwrap(addSpouse(memberId, { spouseId: form.spouseId || null, spouseName: form.spouseName, marriageYear: form.marriageYear }));
                                    setForm({ spouseId: "", spouseName: "", marriageYear: "" });
                                    setAdding(false);
                                })
                            }
                            className="flex-1 py-2 bg-primary text-white rounded-lg text-xs font-bold disabled:opacity-50 cursor-pointer"
                        >
                            {pending ? "جارٍ الحفظ..." : "حفظ"}
                        </button>
                        <button type="button" onClick={() => setAdding(false)} className="px-3 py-2 text-xs font-bold text-gray-500 cursor-pointer">إلغاء</button>
                    </div>
                </div>
            )}
            {error && <p className="text-xs font-bold text-red-600">{error}</p>}
        </div>
    );
}
