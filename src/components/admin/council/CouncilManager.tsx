"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Crown, Save, UserMinus, UserPlus, ExternalLink } from "lucide-react";
import type { CouncilAdminRow } from "@/lib/data/members";
import type { MemberOption } from "@/lib/data/users";
import { addCouncilMember, removeCouncilMember, updateCouncilMember, type CouncilInput } from "@/app/portal/admin/council/actions";
import { unwrap } from "@/lib/action-result";
import { confirmAction, toast } from "@/components/ui/feedback";

const inputClass = "w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-primary";

function toInput(row: CouncilAdminRow): CouncilInput {
    return {
        role: row.role,
        order: row.order ? String(row.order) : "",
        since: row.since ?? "",
        statement: row.statement ?? "",
        location: row.location ?? "",
    };
}

function CouncilRowEditor({ row, isChair }: { row: CouncilAdminRow; isChair: boolean }) {
    const router = useRouter();
    const [draft, setDraft] = useState(toInput(row));
    const [error, setError] = useState<string | null>(null);
    const [pending, startTransition] = useTransition();
    const dirty = JSON.stringify(draft) !== JSON.stringify(toInput(row));

    const run = (fn: () => Promise<void>) => {
        setError(null);
        startTransition(async () => {
            try {
                await fn();
                router.refresh();
            } catch (e) {
                setError(e instanceof Error ? e.message : "تعذر الحفظ");
            }
        });
    };

    return (
        <div className={`bg-white rounded-xl border p-5 space-y-3 ${isChair ? "border-primary/50" : "border-line"}`}>
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    {isChair && <Crown className="w-5 h-5 text-primary" />}
                    <Link href={`/members/${row.id}`} target="_blank" className="font-bold text-ink hover:text-primary flex items-center gap-1">
                        {row.name}
                        <ExternalLink className="w-3.5 h-3.5 text-gray-300" />
                    </Link>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        disabled={!dirty || pending}
                        onClick={() => run(async () => {
                            await unwrap(updateCouncilMember(row.id, draft));
                            toast.success("تم الحفظ");
                        })}
                        className="flex items-center gap-1 px-3 py-2 rounded-lg bg-primary text-white text-xs font-bold disabled:opacity-30 cursor-pointer"
                    >
                        <Save className="w-3.5 h-3.5" />
                        حفظ
                    </button>
                    <button
                        type="button"
                        disabled={pending}
                        onClick={async () => {
                            if (!(await confirmAction({ title: `إزالة ${row.name} من المجلس؟`, message: "يبقى ملفه في الشجرة.", confirmLabel: "إزالة", danger: true }))) return;
                            run(async () => {
                                await unwrap(removeCouncilMember(row.id));
                                toast.success("تمت الإزالة من المجلس");
                            });
                        }}
                        className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-200 text-gray-500 text-xs font-bold hover:text-red-600 cursor-pointer"
                    >
                        <UserMinus className="w-3.5 h-3.5" />
                        إزالة
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <label className="block col-span-2">
                    <span className="text-xs font-bold text-muted mb-1 block">المنصب</span>
                    <input className={inputClass} value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value })} />
                </label>
                <label className="block">
                    <span className="text-xs font-bold text-muted mb-1 block">الترتيب</span>
                    <input className={inputClass} inputMode="numeric" value={draft.order} onChange={(e) => setDraft({ ...draft, order: e.target.value.replace(/\D/g, "").slice(0, 3) })} />
                </label>
                <label className="block">
                    <span className="text-xs font-bold text-muted mb-1 block">منذ</span>
                    <input className={inputClass} placeholder="١٤٤٥ هـ" value={draft.since} onChange={(e) => setDraft({ ...draft, since: e.target.value })} />
                </label>
                <label className="block col-span-2 md:col-span-4">
                    <span className="text-xs font-bold text-muted mb-1 block">المنطقة</span>
                    <input className={inputClass} value={draft.location} onChange={(e) => setDraft({ ...draft, location: e.target.value })} />
                </label>
                {isChair && (
                    <label className="block col-span-2 md:col-span-4">
                        <span className="text-xs font-bold text-muted mb-1 block">كلمة رئيس المجلس (تظهر في صفحة المجلس)</span>
                        <textarea className={`${inputClass} min-h-[70px]`} maxLength={1000} value={draft.statement} onChange={(e) => setDraft({ ...draft, statement: e.target.value })} />
                    </label>
                )}
            </div>
            {error && <p className="text-xs font-bold text-red-600">{error}</p>}
        </div>
    );
}

export default function CouncilManager({ council, members }: { council: CouncilAdminRow[]; members: MemberOption[] }) {
    const router = useRouter();
    const [form, setForm] = useState({ memberId: "", newName: "", gender: "male", role: "", order: "", since: "", statement: "", location: "" });
    const [error, setError] = useState<string | null>(null);
    const [pending, startTransition] = useTransition();
    const councilIds = new Set(council.map((c) => c.id));

    return (
        <div className="space-y-6">
            <form
                className="bg-white p-5 rounded-xl border border-line shadow-sm space-y-4"
                onSubmit={(e) => {
                    e.preventDefault();
                    setError(null);
                    startTransition(async () => {
                        try {
                            await unwrap(addCouncilMember({ ...form, memberId: form.memberId || null }));
                            setForm({ memberId: "", newName: "", gender: "male", role: "", order: "", since: "", statement: "", location: "" });
                            toast.success("تمت الإضافة إلى المجلس");
                            router.refresh();
                        } catch (err) {
                            setError(err instanceof Error ? err.message : "تعذر الإضافة");
                        }
                    });
                }}
            >
                <h3 className="font-bold text-ink flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-primary" />
                    إضافة عضو للمجلس
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <label className="block md:col-span-2">
                        <span className="text-xs font-bold text-muted mb-1 block">الفرد</span>
                        <select className={inputClass} value={form.memberId} onChange={(e) => setForm({ ...form, memberId: e.target.value })}>
                            <option value="">شخص جديد (اكتب الاسم)</option>
                            {members.filter((m) => !councilIds.has(m.id)).map((m) => (
                                <option key={m.id} value={m.id}>{m.name}{m.serial ? ` (${m.serial})` : ""}</option>
                            ))}
                        </select>
                    </label>
                    {!form.memberId && (
                        <>
                            <label className="block">
                                <span className="text-xs font-bold text-muted mb-1 block">الاسم</span>
                                <input className={inputClass} value={form.newName} onChange={(e) => setForm({ ...form, newName: e.target.value })} />
                            </label>
                            <label className="block">
                                <span className="text-xs font-bold text-muted mb-1 block">الجنس</span>
                                <select className={inputClass} value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                                    <option value="male">ذكر</option>
                                    <option value="female">أنثى</option>
                                </select>
                            </label>
                        </>
                    )}
                    <label className="block md:col-span-2">
                        <span className="text-xs font-bold text-muted mb-1 block">المنصب</span>
                        <input className={inputClass} placeholder="مثال: ممثل فرع الشمال" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
                    </label>
                    <label className="block">
                        <span className="text-xs font-bold text-muted mb-1 block">الترتيب (1 = الرئيس)</span>
                        <input className={inputClass} inputMode="numeric" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value.replace(/\D/g, "").slice(0, 3) })} />
                    </label>
                    <label className="block">
                        <span className="text-xs font-bold text-muted mb-1 block">المنطقة</span>
                        <input className={inputClass} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                    </label>
                </div>
                <div className="flex items-center justify-end gap-3">
                    {error && <span className="text-xs font-bold text-red-600">{error}</span>}
                    <button type="submit" disabled={pending} className="px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-bold disabled:opacity-50 cursor-pointer">
                        {pending ? "جارٍ الإضافة..." : "إضافة"}
                    </button>
                </div>
            </form>

            {council.length === 0 ? (
                <p className="text-center py-10 text-sm text-gray-400 bg-white rounded-xl border border-dashed border-line">لا يوجد أعضاء في المجلس بعد.</p>
            ) : (
                <div className="space-y-4">
                    {council.map((row, i) => (
                        <CouncilRowEditor key={`${row.id}-${row.order}-${row.role}`} row={row} isChair={i === 0} />
                    ))}
                </div>
            )}
        </div>
    );
}
