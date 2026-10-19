"use client";

import { useState, useTransition } from "react";
import { Mail, MailCheck } from "lucide-react";
import { requestPasswordReset } from "@/app/portal/forgot/actions";
import { authButtonClass, authInputClass } from "@/components/auth/AuthCard";

const CONTACT_ADMIN = "إرسال الرسائل غير مفعّل حالياً. تواصل مع مدير البوابة لإعادة تعيين كلمة المرور.";

export default function ForgotPasswordForm({ emailEnabled }: { emailEnabled: boolean }) {
    const [identifier, setIdentifier] = useState("");
    const [state, setState] = useState<"idle" | "sent" | "disabled">(emailEnabled ? "idle" : "disabled");
    const [error, setError] = useState<string | null>(null);
    const [pending, startTransition] = useTransition();

    if (state === "disabled") {
        return (
            <div role="status" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800 leading-7">
                {CONTACT_ADMIN}
            </div>
        );
    }

    if (state === "sent") {
        return (
            <div role="status" className="flex flex-col items-center gap-3 text-center">
                <MailCheck className="w-12 h-12 text-primary" />
                <p className="text-ink font-bold">تحقق من بريدك الإلكتروني</p>
                <p className="text-sm text-muted leading-7">
                    إذا كان هناك حساب مفعّل مرتبط بهذه البيانات وله بريد إلكتروني، فستصلك رسالة فيها رابط لتعيين كلمة مرور جديدة خلال دقائق. الرابط صالح لمدة ساعة.
                </p>
                <p className="text-xs text-muted">لم تصلك رسالة؟ تحقق من مجلد الرسائل غير المرغوبة، أو تواصل مع مدير البوابة.</p>
            </div>
        );
    }

    return (
        <form
            className="space-y-6"
            onSubmit={(e) => {
                e.preventDefault();
                setError(null);
                startTransition(async () => {
                    const res = await requestPasswordReset(identifier);
                    if (!res.ok) setError(res.error);
                    else setState(res.data.emailEnabled ? "sent" : "disabled");
                });
            }}
        >
            {error && (
                <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {error}
                </div>
            )}
            <label className="block space-y-2">
                <span className="text-sm font-bold text-ink">اسم المستخدم أو البريد الإلكتروني</span>
                <input
                    className={authInputClass}
                    type="text"
                    autoComplete="username"
                    required
                    maxLength={200}
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                />
            </label>
            <button type="submit" disabled={pending} className={authButtonClass}>
                <Mail className="w-5 h-5" />
                {pending ? "جارٍ الإرسال..." : "أرسل رابط الاستعادة"}
            </button>
        </form>
    );
}
