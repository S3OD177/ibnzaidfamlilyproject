"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { setEmailNotifications } from "@/app/portal/(member)/account/actions";
import { unwrap } from "@/lib/action-result";
import { toast } from "@/components/ui/feedback";

/** Email notifications switch on the account page. */
export default function NotifyToggle({ initial, email, sending }: { initial: boolean; email: string | null; sending: boolean }) {
    const [on, setOn] = useState(initial);
    const [busy, setBusy] = useState(false);
    return (
        <div className="rounded-xl border border-sand p-4 space-y-2">
            <label className="flex items-start justify-between gap-4 cursor-pointer">
                <span>
                    <span className="font-bold flex items-center gap-2 text-ink">
                        <Bell className="w-4 h-4 text-primary-dark" />
                        إشعارات البريد الإلكتروني
                    </span>
                    <span className="block text-xs text-muted mt-1">رسالة عند نشر خبر جديد أو فرح عائلي أو تصويت.</span>
                </span>
                <input
                    type="checkbox"
                    checked={on}
                    disabled={busy || !email}
                    onChange={async (e) => {
                        const next = e.target.checked;
                        setBusy(true);
                        try {
                            await unwrap(setEmailNotifications(next));
                            setOn(next);
                            toast.success(next ? "سيصلك بريد بالجديد" : "أُوقفت إشعارات البريد");
                        } catch (err) {
                            toast.error(err instanceof Error ? err.message : "تعذر الحفظ");
                        } finally {
                            setBusy(false);
                        }
                    }}
                    className="mt-1 size-5 accent-[var(--color-primary)] shrink-0"
                />
            </label>
            {!email && <p className="text-xs text-amber-700">لا يوجد بريد إلكتروني في حسابك. اطلب من الإدارة إضافته لتصلك الإشعارات.</p>}
            {email && !sending && <p className="text-xs text-muted">إرسال البريد غير مفعّل في الموقع بعد، وسيبدأ عند تفعيله من الإدارة.</p>}
        </div>
    );
}
