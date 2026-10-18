"use client";

import { useState, useTransition } from "react";
import { KeyRound } from "lucide-react";
import { changePassword } from "@/app/portal/(member)/account/actions";
import { unwrap } from "@/lib/action-result";

const inputClass = "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-primary outline-none text-ink";

export default function ChangePasswordForm() {
    const [form, setForm] = useState({ current: "", next: "", confirm: "" });
    const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
    const [pending, startTransition] = useTransition();

    return (
        <form
            className="space-y-4"
            onSubmit={(e) => {
                e.preventDefault();
                setMessage(null);
                if (form.next !== form.confirm) {
                    setMessage({ type: "error", text: "كلمتا المرور الجديدتان غير متطابقتين" });
                    return;
                }
                startTransition(async () => {
                    try {
                        await unwrap(changePassword({ current: form.current, next: form.next }));
                        setForm({ current: "", next: "", confirm: "" });
                        setMessage({ type: "ok", text: "تم تغيير كلمة المرور" });
                    } catch (err) {
                        setMessage({ type: "error", text: err instanceof Error ? err.message : "تعذر تغيير كلمة المرور" });
                    }
                });
            }}
        >
            {message && (
                <div role="status" className={`rounded-xl px-4 py-3 text-sm font-medium border ${message.type === "ok" ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"}`}>
                    {message.text}
                </div>
            )}
            <label className="block space-y-2">
                <span className="text-sm font-bold text-ink">كلمة المرور الحالية</span>
                <input className={inputClass} type="password" autoComplete="current-password" required value={form.current} onChange={(e) => setForm({ ...form, current: e.target.value })} />
            </label>
            <label className="block space-y-2">
                <span className="text-sm font-bold text-ink">كلمة المرور الجديدة</span>
                <input className={inputClass} type="password" autoComplete="new-password" required minLength={8} value={form.next} onChange={(e) => setForm({ ...form, next: e.target.value })} />
            </label>
            <label className="block space-y-2">
                <span className="text-sm font-bold text-ink">تأكيد كلمة المرور الجديدة</span>
                <input className={inputClass} type="password" autoComplete="new-password" required minLength={8} value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} />
            </label>
            <button type="submit" disabled={pending} className="w-full bg-primary text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer">
                <KeyRound className="w-5 h-5" />
                {pending ? "جارٍ الحفظ..." : "تغيير كلمة المرور"}
            </button>
        </form>
    );
}
