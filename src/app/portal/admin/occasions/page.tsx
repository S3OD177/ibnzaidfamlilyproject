import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import OccasionsReview from "@/components/admin/occasions/OccasionsReview";
import { listOccasions } from "@/lib/data/occasions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "الأفراح والتهاني" };

const TABS = [
    { key: "pending", label: "بانتظار المراجعة" },
    { key: "approved", label: "المنشورة" },
    { key: "rejected", label: "المرفوضة" },
] as const;

export default async function AdminOccasionsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
    const { status } = await searchParams;
    const tab = TABS.find((t) => t.key === status)?.key ?? "pending";
    const occasions = await listOccasions({ status: tab, limit: 100 });

    return (
        <div className="max-w-5xl mx-auto font-display space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-ink">الأفراح والتهاني</h1>
                    <p className="text-muted mt-1">راجع الأخبار السعيدة التي يرسلها الأعضاء، واختر نشرها للعائلة فقط أو للعموم.</p>
                </div>
                <Link href="/portal/occasions" className="inline-flex items-center gap-2 bg-primary text-deep px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-primary-light">
                    <Plus className="w-4 h-4" />
                    نشر خبر سعيد
                </Link>
            </div>
            <div className="flex gap-2 border-b border-line pb-4">
                {TABS.map((t) => (
                    <Link
                        key={t.key}
                        href={t.key === "pending" ? "/portal/admin/occasions" : `/portal/admin/occasions?status=${t.key}`}
                        className={t.key === tab
                            ? "px-4 py-2 bg-primary/10 text-primary-dark rounded-lg text-sm font-bold border border-primary/20"
                            : "px-4 py-2 bg-white border border-line text-muted rounded-lg text-sm font-bold hover:bg-canvas"}
                    >
                        {t.label}
                    </Link>
                ))}
            </div>
            <OccasionsReview occasions={occasions} />
        </div>
    );
}
