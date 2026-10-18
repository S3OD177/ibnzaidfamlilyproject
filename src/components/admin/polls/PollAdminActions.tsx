"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Lock, Trash2 } from "lucide-react";
import { closePoll, deletePoll } from "@/app/portal/(member)/polls/actions";
import { unwrap } from "@/lib/action-result";
import { confirmAction, toast } from "@/components/ui/feedback";

export default function PollAdminActions({ id, question, closed }: { id: string; question: string; closed: boolean }) {
    const router = useRouter();
    const [pending, start] = useTransition();
    const run = (fn: () => Promise<unknown>, done: string) =>
        start(async () => {
            try {
                await fn();
                toast.success(done);
                router.refresh();
            } catch (e) {
                toast.error(e instanceof Error ? e.message : "تعذر الحفظ");
            }
        });

    return (
        <div className="flex flex-wrap gap-2 pt-3 border-t border-sand">
            {!closed && (
                <button
                    type="button"
                    disabled={pending}
                    onClick={async () => {
                        if (!(await confirmAction({ title: "إغلاق التصويت الآن؟", message: "لن يستطيع أحد التصويت بعد الإغلاق، وتظهر النتائج للجميع.", confirmLabel: "إغلاق" }))) return;
                        run(() => unwrap(closePoll(id)), "أُغلق التصويت");
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold border border-sand text-deep disabled:opacity-50"
                >
                    <Lock className="w-3.5 h-3.5" />
                    إغلاق التصويت
                </button>
            )}
            <button
                type="button"
                disabled={pending}
                onClick={async () => {
                    if (!(await confirmAction({ title: `حذف "${question}"؟`, message: "تُحذف معه كل الأصوات.", confirmLabel: "حذف", danger: true }))) return;
                    run(() => unwrap(deletePoll(id)), "تم الحذف");
                }}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold border border-red-200 text-red-600 disabled:opacity-50"
            >
                <Trash2 className="w-3.5 h-3.5" />
                حذف
            </button>
        </div>
    );
}
