"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { CheckCircle, Send } from "lucide-react";
import { submitJoinRequest } from "@/app/(public)/join/actions";
import { unwrap } from "@/lib/action-result";

const inputClass =
    "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none text-ink";

export default function JoinForm() {
    const [form, setForm] = useState({ fullName: "", branch: "", mobile: "", email: "", note: "", website: "" });
    const [error, setError] = useState<string | null>(null);
    const [done, setDone] = useState(false);
    const [pending, startTransition] = useTransition();

    if (done) {
        return (
            <div className="text-center py-6">
                <CheckCircle className="w-14 h-14 text-primary mx-auto mb-4" />
                <h2 className="text-xl font-bold text-ink mb-2">تم استلام طلبك</h2>
                <p className="text-gray-500 mb-6">ستراجع إدارة المنصة طلبك وتتواصل معك لإرسال بيانات الدخول.</p>
                <Link href="/" className="text-primary font-bold hover:underline">العودة للرئيسية</Link>
            </div>
        );
    }

    return (
        <form
            className="space-y-5"
            onSubmit={(e) => {
                e.preventDefault();
                setError(null);
                startTransition(async () => {
                    try {
                        await unwrap(submitJoinRequest(form));
                        setDone(true);
                    } catch (err) {
                        setError(err instanceof Error ? err.message : "تعذر إرسال الطلب");
                    }
                });
            }}
        >
            {error && (
                <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>
            )}
            <label className="block space-y-2">
                <span className="text-sm font-bold text-ink">الاسم الكامل (رباعي)</span>
                <input className={inputClass} required minLength={3} maxLength={150} value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
            </label>
            <label className="block space-y-2">
                <span className="text-sm font-bold text-ink">الفرع أو اسم الأب والجد (اختياري)</span>
                <input className={inputClass} maxLength={100} placeholder="يساعدنا في معرفة مكانك في الشجرة" value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })} />
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block space-y-2">
                    <span className="text-sm font-bold text-ink">رقم الجوال</span>
                    <input className={inputClass} dir="ltr" inputMode="tel" placeholder="05xxxxxxxx" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
                </label>
                <label className="block space-y-2">
                    <span className="text-sm font-bold text-ink">البريد الإلكتروني</span>
                    <input className={inputClass} dir="ltr" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </label>
            </div>
            <p className="text-xs text-gray-500 -mt-2">يكفي أحدهما للتواصل معك.</p>
            <label className="block space-y-2">
                <span className="text-sm font-bold text-ink">ملاحظات (اختياري)</span>
                <textarea className={`${inputClass} min-h-[90px]`} maxLength={1000} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
            </label>
            {/* Honeypot, hidden from people and screen readers */}
            <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
            <button
                type="submit"
                disabled={pending}
                className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
            >
                <Send className="w-5 h-5" />
                {pending ? "جارٍ الإرسال..." : "إرسال الطلب"}
            </button>
        </form>
    );
}
