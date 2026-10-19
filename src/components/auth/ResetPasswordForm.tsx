"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { CheckCircle2, KeyRound } from "lucide-react";
import { resetPassword } from "@/app/portal/reset/actions";
import { authButtonClass, authInputClass } from "@/components/auth/AuthCard";

export default function ResetPasswordForm({ token, minLength }: { token: string; minLength: number }) {
    const [form, setForm] = useState({ password: "", confirm: "" });
    const [error, setError] = useState<string | null>(null);
    const [done, setDone] = useState(false);
    const [pending, startTransition] = useTransition();

    if (done) {
        return (
            <div role="status" className="flex flex-col items-center gap-4 text-center">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
                <p className="text-ink font-bold">تم تعيين كلمة المرور الجديدة</p>
                <Link href="/portal/login" className={authButtonClass}>
                    تسجيل الدخول
                </Link>
            </div>
        );
    }

    return (
        <form
            className="space-y-6"
            onSubmit={(e) => {
                e.preventDefault();
                setError(null);
                if (form.password !== form.confirm) {
                    setError("كلمتا المرور غير متطابقتين");
                    return;
                }
                startTransition(async () => {
                    const res = await resetPassword({ token, ...form });
                    if (res.ok) setDone(true);
                    else setError(res.error);
                });
            }}
        >
            {error && (
                <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {error}
                </div>
            )}
            <label className="block space-y-2">
                <span className="text-sm font-bold text-ink">كلمة المرور الجديدة</span>
                <input
                    className={authInputClass}
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={minLength}
                    maxLength={200}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <span className="block text-xs text-muted">{minLength} أحرف على الأقل</span>
            </label>
            <label className="block space-y-2">
                <span className="text-sm font-bold text-ink">تأكيد كلمة المرور</span>
                <input
                    className={authInputClass}
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={minLength}
                    maxLength={200}
                    value={form.confirm}
                    onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                />
            </label>
            <button type="submit" disabled={pending} className={authButtonClass}>
                <KeyRound className="w-5 h-5" />
                {pending ? "جارٍ الحفظ..." : "حفظ كلمة المرور"}
            </button>
        </form>
    );
}
