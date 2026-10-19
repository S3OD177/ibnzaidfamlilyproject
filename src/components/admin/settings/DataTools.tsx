"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Database, Download, Loader2, Sparkles, Trash2 } from "lucide-react";
import { addDemoContent, removeDemoContent } from "@/app/portal/admin/settings/demo-actions";
import { unwrap } from "@/lib/action-result";
import { confirmAction, toast } from "@/components/ui/feedback";

/** Admin tools: download a backup, add or remove the sample content used for presenting. */
export default function DataTools({ hasDemo }: { hasDemo: boolean }) {
    const router = useRouter();
    const [busy, setBusy] = useState(false);
    const run = async (fn: () => Promise<unknown>, done: string) => {
        setBusy(true);
        try {
            await fn();
            toast.success(done);
            router.refresh();
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "تعذر التنفيذ");
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section className="bg-white rounded-2xl border border-line p-6 space-y-3">
                <h3 className="text-lg font-bold flex items-center gap-2">
                    <Database className="w-5 h-5 text-primary-dark" />
                    النسخ الاحتياطي
                </h3>
                <p className="text-sm text-muted leading-relaxed">
                    نزّل نسخة كاملة من بيانات الموقع واحفظها في مكان آمن (مثلاً أسبوعياً). لا تتضمن كلمات المرور.
                </p>
                <div className="flex flex-wrap gap-2">
                    <a href="/api/admin/backup" className="inline-flex items-center gap-2 bg-deep text-primary px-4 py-2.5 rounded-xl font-bold text-sm">
                        <Download className="w-4 h-4" />
                        تنزيل البيانات
                    </a>
                    <a href="/api/admin/backup?files=1" className="inline-flex items-center gap-2 border border-line px-4 py-2.5 rounded-xl font-bold text-sm">
                        <Download className="w-4 h-4" />
                        مع الصور والملفات (أكبر حجماً)
                    </a>
                </div>
            </section>

            <section className="bg-white rounded-2xl border border-line p-6 space-y-3">
                <h3 className="text-lg font-bold flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary-dark" />
                    المحتوى التجريبي
                </h3>
                <p className="text-sm text-muted leading-relaxed">
                    لعرض الموقع على العائلة قبل إدخال البيانات الحقيقية: مناسبات قادمة، تصويت، أفراح، ألبوم صور، وقيود للصندوق، كلها معلّمة بكلمة «تجريبي». الحذف يزيل هذه العناصر فقط.
                </p>
                {hasDemo ? (
                    <button
                        type="button"
                        disabled={busy}
                        onClick={async () => {
                            if (!(await confirmAction({ title: "حذف المحتوى التجريبي؟", message: "تُحذف العناصر التجريبية فقط مع أصواتها وتهانيها.", confirmLabel: "حذف", danger: true }))) return;
                            run(() => unwrap(removeDemoContent()), "حُذف المحتوى التجريبي");
                        }}
                        className="inline-flex items-center gap-2 border border-red-200 text-red-600 px-4 py-2.5 rounded-xl font-bold text-sm disabled:opacity-50"
                    >
                        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        حذف المحتوى التجريبي
                    </button>
                ) : (
                    <button
                        type="button"
                        disabled={busy}
                        onClick={() => run(() => unwrap(addDemoContent()), "أُضيف المحتوى التجريبي")}
                        className="inline-flex items-center gap-2 bg-primary text-deep px-4 py-2.5 rounded-xl font-bold text-sm disabled:opacity-50"
                    >
                        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        إضافة محتوى تجريبي
                    </button>
                )}
            </section>
        </div>
    );
}
