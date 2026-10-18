"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Globe, Lock, Trash2, X } from "lucide-react";
import OccasionCard from "@/components/occasions/OccasionCard";
import { deleteOccasion, reviewOccasion, setOccasionVisibility } from "@/app/portal/(member)/occasions/actions";
import { unwrap, type ActionResult } from "@/lib/action-result";
import { confirmAction, toast } from "@/components/ui/feedback";
import type { OccasionView } from "@/lib/occasions";

const button = "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold disabled:opacity-50";

/** Staff review of happy news: publish (family only or public), decline, or manage published ones. */
export default function OccasionsReview({ occasions }: { occasions: OccasionView[] }) {
    const router = useRouter();
    const [pending, startTransition] = useTransition();

    const run = (action: () => Promise<ActionResult<void>>, done: string) =>
        startTransition(async () => {
            try {
                await unwrap(action());
                toast.success(done);
                router.refresh();
            } catch (e) {
                toast.error(e instanceof Error ? e.message : "تعذر الحفظ");
            }
        });

    if (occasions.length === 0) {
        return <p className="text-sm text-gray-400 text-center py-16 border border-dashed border-gray-200 rounded-2xl bg-white">لا توجد أخبار هنا.</p>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {occasions.map((o) => (
                <OccasionCard
                    key={o.id}
                    occasion={o}
                    canCongratulate={false}
                    actions={
                        <div className="space-y-2">
                            <p className="text-xs text-muted">
                                أرسله {o.submitterName} · {o.visibility === "public" ? "ظاهر في الموقع العام" : "لأفراد العائلة فقط"}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {o.status === "pending" ? (
                                    <>
                                        <button type="button" disabled={pending} onClick={() => run(() => reviewOccasion(o.id, "approved", "members"), "تم النشر لأفراد العائلة")} className={`${button} bg-primary text-deep`}>
                                            <Check className="w-3.5 h-3.5" />
                                            نشر للعائلة
                                        </button>
                                        <button type="button" disabled={pending} onClick={() => run(() => reviewOccasion(o.id, "approved", "public"), "تم النشر للعموم")} className={`${button} bg-deep text-primary`}>
                                            <Globe className="w-3.5 h-3.5" />
                                            نشر للعموم
                                        </button>
                                        <button type="button" disabled={pending} onClick={() => run(() => reviewOccasion(o.id, "rejected"), "تم رفض الخبر")} className={`${button} border border-red-200 text-red-600`}>
                                            <X className="w-3.5 h-3.5" />
                                            رفض
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            type="button"
                                            disabled={pending}
                                            onClick={() =>
                                                run(
                                                    () => setOccasionVisibility(o.id, o.visibility === "public" ? "members" : "public"),
                                                    o.visibility === "public" ? "أصبح لأفراد العائلة فقط" : "أصبح ظاهراً في الموقع العام",
                                                )
                                            }
                                            className={`${button} border border-sand text-deep`}
                                        >
                                            {o.visibility === "public" ? <Lock className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />}
                                            {o.visibility === "public" ? "إخفاء عن العموم" : "إظهار للعموم"}
                                        </button>
                                        <button
                                            type="button"
                                            disabled={pending}
                                            onClick={async () => {
                                                if (!(await confirmAction({ title: `حذف "${o.title}"؟`, message: "تُحذف معه كل التهاني.", confirmLabel: "حذف", danger: true }))) return;
                                                run(() => deleteOccasion(o.id), "تم الحذف");
                                            }}
                                            className={`${button} border border-red-200 text-red-600`}
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                            حذف
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    }
                />
            ))}
        </div>
    );
}
