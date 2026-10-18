"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, KeyRound, Save, Copy, Check, X } from "lucide-react";
import type { MemberOption, UserRow } from "@/lib/data/users";
import { createUser, resetUserPassword, updateUser } from "@/app/portal/admin/users/actions";
import { unwrap } from "@/lib/action-result";
import { confirmAction, toast } from "@/components/ui/feedback";
import { formatHijri } from "@/lib/dates";

const ROLE_OPTIONS = [
    { id: "admin", label: "مدير النظام", hint: "كل الصلاحيات بما فيها المستخدمين والطلبات" },
    { id: "editor", label: "محرر", hint: "الشجرة والأخبار والتقويم والسجل" },
    { id: "member", label: "عضو", hint: "بوابة الأعضاء فقط" },
] as const;

const inputClass = "w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-primary";
const formatDate = (iso: string | null) =>
    iso ? formatHijri(iso) : "لم يسجل دخول";

function MemberSelect({ value, onChange, members }: { value: string | null; onChange: (v: string | null) => void; members: MemberOption[] }) {
    return (
        <select className={inputClass} value={value ?? ""} onChange={(e) => onChange(e.target.value || null)}>
            <option value="">غير مرتبط بالشجرة</option>
            {members.map((m) => (
                <option key={m.id} value={m.id}>
                    {m.name}{m.serial ? ` (${m.serial})` : ""}
                </option>
            ))}
        </select>
    );
}

/** Shows a temporary password once, with a copy button. */
export function TempPasswordNotice({ who, password, onClose }: { who: string; password: string; onClose: () => void }) {
    const [copied, setCopied] = useState(false);
    return (
        <div role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
            <div className="text-sm text-amber-900">
                <p className="font-bold">كلمة المرور المؤقتة لـ {who}</p>
                <p className="text-xs mt-1">انسخها وأرسلها له الآن، لن تظهر مرة أخرى.</p>
            </div>
            <div className="flex items-center gap-2">
                <code dir="ltr" className="bg-white border border-amber-200 rounded-lg px-3 py-2 font-mono text-base font-bold text-ink">{password}</code>
                <button
                    type="button"
                    onClick={async () => {
                        await navigator.clipboard.writeText(password);
                        setCopied(true);
                    }}
                    className="p-2 rounded-lg bg-white border border-amber-200 text-amber-800 hover:bg-amber-100 cursor-pointer"
                    aria-label="نسخ"
                >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
                <button type="button" onClick={onClose} className="p-2 rounded-lg text-amber-800 hover:bg-amber-100 cursor-pointer" aria-label="إغلاق">
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}

function UserRowEditor({ user, members, isSelf, onPassword }: { user: UserRow; members: MemberOption[]; isSelf: boolean; onPassword: (who: string, pw: string) => void }) {
    const router = useRouter();
    const [draft, setDraft] = useState({
        username: user.username,
        displayName: user.displayName ?? "",
        email: user.email ?? "",
        role: user.role as string,
        status: user.status as string,
        memberId: user.memberId,
    });
    const [error, setError] = useState<string | null>(null);
    const [pending, startTransition] = useTransition();
    const dirty =
        draft.displayName !== (user.displayName ?? "") ||
        draft.email !== (user.email ?? "") ||
        draft.role !== user.role ||
        draft.status !== user.status ||
        draft.memberId !== user.memberId;

    const run = (fn: () => Promise<void>) => {
        setError(null);
        startTransition(async () => {
            try {
                await fn();
            } catch (e) {
                setError(e instanceof Error ? e.message : "تعذر الحفظ");
            }
        });
    };

    return (
        <tr className={`align-top ${user.status === "disabled" ? "bg-gray-50/70" : ""}`}>
            <td className="px-4 py-3 min-w-[200px]">
                <input className={`${inputClass} font-bold`} value={draft.displayName} placeholder="الاسم الظاهر" onChange={(e) => setDraft({ ...draft, displayName: e.target.value })} />
                <p className="text-xs text-muted mt-1" dir="ltr">@{user.username}{isSelf ? " (أنت)" : ""}</p>
            </td>
            <td className="px-4 py-3 min-w-[180px]">
                <input className={inputClass} dir="ltr" type="email" value={draft.email} placeholder="email@example.com" onChange={(e) => setDraft({ ...draft, email: e.target.value })} />
            </td>
            <td className="px-4 py-3">
                <select className={inputClass} value={draft.role} disabled={isSelf} onChange={(e) => setDraft({ ...draft, role: e.target.value })}>
                    {ROLE_OPTIONS.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
                </select>
            </td>
            <td className="px-4 py-3">
                <select className={inputClass} value={draft.status} disabled={isSelf} onChange={(e) => setDraft({ ...draft, status: e.target.value })}>
                    <option value="active">نشط</option>
                    <option value="disabled">معطّل</option>
                </select>
            </td>
            <td className="px-4 py-3 min-w-[200px]">
                <MemberSelect value={draft.memberId} members={members} onChange={(memberId) => setDraft({ ...draft, memberId })} />
            </td>
            <td className="px-4 py-3 text-xs text-muted whitespace-nowrap">{formatDate(user.lastLoginAt)}</td>
            <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        disabled={!dirty || pending}
                        onClick={() => run(async () => { await unwrap(updateUser(user.id, draft)); toast.success("تم حفظ الحساب"); router.refresh(); })}
                        className="flex items-center gap-1 px-3 py-2 rounded-lg bg-primary text-white text-xs font-bold disabled:opacity-30 cursor-pointer"
                    >
                        <Save className="w-3.5 h-3.5" />
                        حفظ
                    </button>
                    <button
                        type="button"
                        disabled={pending}
                        title="إعادة تعيين كلمة المرور"
                        onClick={async () => {
                            if (!(await confirmAction({ title: `إنشاء كلمة مرور مؤقتة جديدة لـ ${user.displayName || user.username}؟`, message: "ستتوقف كلمة المرور الحالية عن العمل.", confirmLabel: "إنشاء" }))) return;
                            run(async () => {
                                const { tempPassword } = await unwrap(resetUserPassword(user.id));
                                onPassword(user.displayName || user.username, tempPassword);
                            });
                        }}
                        className="p-2 rounded-lg border border-line text-muted hover:bg-gray-50 cursor-pointer"
                    >
                        <KeyRound className="w-4 h-4" />
                    </button>
                </div>
                {error && <p className="text-xs text-red-600 font-bold mt-2 max-w-[220px]">{error}</p>}
            </td>
        </tr>
    );
}

export default function UsersManager({ users, members, currentUserId }: { users: UserRow[]; members: MemberOption[]; currentUserId: string }) {
    const router = useRouter();
    const [form, setForm] = useState({ username: "", displayName: "", email: "", role: "member", memberId: null as string | null });
    const [notice, setNotice] = useState<{ who: string; password: string } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [pending, startTransition] = useTransition();

    const create = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        startTransition(async () => {
            try {
                const { tempPassword } = await unwrap(createUser(form));
                setNotice({ who: form.displayName || form.username, password: tempPassword });
                setForm({ username: "", displayName: "", email: "", role: "member", memberId: null });
                router.refresh();
            } catch (err) {
                setError(err instanceof Error ? err.message : "تعذر إنشاء الحساب");
            }
        });
    };

    return (
        <div className="space-y-6">
            {notice && <TempPasswordNotice who={notice.who} password={notice.password} onClose={() => setNotice(null)} />}

            <form onSubmit={create} className="bg-white border border-line rounded-xl p-5 space-y-4">
                <h3 className="font-bold text-ink flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-primary" />
                    إضافة مستخدم
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    <label className="block">
                        <span className="text-xs font-bold text-muted mb-1 block">اسم المستخدم</span>
                        <input className={inputClass} dir="ltr" required placeholder="ahmad.s" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase().replace(/\s/g, "") })} />
                    </label>
                    <label className="block">
                        <span className="text-xs font-bold text-muted mb-1 block">الاسم الظاهر</span>
                        <input className={inputClass} placeholder="أحمد بن سعد" value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} />
                    </label>
                    <label className="block">
                        <span className="text-xs font-bold text-muted mb-1 block">البريد (اختياري)</span>
                        <input className={inputClass} dir="ltr" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                    </label>
                    <label className="block">
                        <span className="text-xs font-bold text-muted mb-1 block">الدور</span>
                        <select className={inputClass} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                            {ROLE_OPTIONS.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
                        </select>
                    </label>
                    <label className="block">
                        <span className="text-xs font-bold text-muted mb-1 block">الفرد في الشجرة</span>
                        <MemberSelect value={form.memberId} members={members} onChange={(memberId) => setForm({ ...form, memberId })} />
                    </label>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs text-muted">
                        {ROLE_OPTIONS.find((r) => r.id === form.role)?.hint}. ستظهر كلمة مرور مؤقتة بعد الإنشاء.
                    </p>
                    <div className="flex items-center gap-3">
                        {error && <span className="text-xs font-bold text-red-600">{error}</span>}
                        <button type="submit" disabled={pending} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-bold disabled:opacity-50 cursor-pointer">
                            <UserPlus className="w-4 h-4" />
                            {pending ? "جارٍ الإنشاء..." : "إنشاء الحساب"}
                        </button>
                    </div>
                </div>
            </form>

            <div className="bg-white border border-line rounded-xl overflow-x-auto">
                {users.length === 0 ? (
                    <p className="p-8 text-center text-sm text-gray-400">لا يوجد مستخدمون بعد. أضف أول حساب من النموذج أعلاه.</p>
                ) : (
                    <table className="w-full text-right">
                        <thead className="bg-mist text-muted text-xs">
                            <tr>
                                <th className="px-4 py-3 font-bold">المستخدم</th>
                                <th className="px-4 py-3 font-bold">البريد</th>
                                <th className="px-4 py-3 font-bold">الدور</th>
                                <th className="px-4 py-3 font-bold">الحالة</th>
                                <th className="px-4 py-3 font-bold">مرتبط بـ</th>
                                <th className="px-4 py-3 font-bold">آخر دخول</th>
                                <th className="px-4 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-mist">
                            {users.map((user) => (
                                <UserRowEditor
                                    key={`${user.id}-${user.role}-${user.status}-${user.memberId}`}
                                    user={user}
                                    members={members}
                                    isSelf={user.id === currentUserId}
                                    onPassword={(who, password) => setNotice({ who, password })}
                                />
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
