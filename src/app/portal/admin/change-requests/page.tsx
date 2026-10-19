import type { Metadata } from "next";
import Link from "next/link";
import ChangeRequestsManager from "@/components/admin/change-requests/ChangeRequestsManager";
import ProposalsManager from "@/components/admin/change-requests/ProposalsManager";
import { currentValuesFor, listChangeRequests } from "@/lib/data/change-requests";
import { listProposals } from "@/lib/data/proposals";
import type { ChangeRequestStatus } from "@/lib/change-requests";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "طلبات تعديل البيانات" };

const TABS: { key: ChangeRequestStatus; label: string }[] = [
    { key: "pending", label: "قيد المراجعة" },
    { key: "approved", label: "المعتمدة" },
    { key: "rejected", label: "المرفوضة" },
];

export default async function ChangeRequestsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
    const { status } = await searchParams;
    const tab = TABS.find((t) => t.key === status)?.key ?? "pending";
    const [requests, proposals] = await Promise.all([listChangeRequests(tab), listProposals(tab)]);
    // Old values are only meaningful while a request is pending; later the record has moved on.
    const current = tab === "pending" ? await currentValuesFor([...new Set(requests.map((r) => r.memberId))]) : new Map();

    return (
        <div className="max-w-5xl mx-auto font-display space-y-6">
            <div>
                <h1 className="text-3xl font-black tracking-tight text-ink">طلبات تعديل البيانات</h1>
                <p className="text-muted mt-1">
                    طلبات الأعضاء لتحديث بياناتهم في الشجرة. الاعتماد يطبّق التعديلات على ملف الفرد مباشرة.
                </p>
            </div>

            <div className="flex gap-2 border-b border-line pb-4">
                {TABS.map((t) => (
                    <Link
                        key={t.key}
                        href={t.key === "pending" ? "/portal/admin/change-requests" : `/portal/admin/change-requests?status=${t.key}`}
                        className={t.key === tab
                            ? "px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm font-bold border border-primary/20"
                            : "px-4 py-2 bg-white border border-line text-muted rounded-lg text-sm font-bold hover:bg-canvas"}
                    >
                        {t.label}
                    </Link>
                ))}
            </div>

            <section className="space-y-4">
                <div>
                    <h2 className="text-xl font-black text-ink">أفراد جدد مقترحون</h2>
                    <p className="text-sm text-muted mt-1">اقتراحات الأعضاء لإضافة مواليد أو أبناء وأحفاد إلى الشجرة. الاعتماد يضيف الفرد تحت أبيه أو أمه مباشرة.</p>
                </div>
                <ProposalsManager
                    proposals={proposals}
                    emptyText={tab === "pending" ? "لا توجد اقتراحات بانتظار المراجعة." : "لا توجد اقتراحات هنا."}
                />
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-black text-ink">تعديل البيانات</h2>
                <ChangeRequestsManager
                    requests={requests.map((r) => ({ ...r, current: current.get(r.memberId) ?? null }))}
                    emptyText={tab === "pending" ? "لا توجد طلبات بانتظار المراجعة." : "لا توجد طلبات هنا."}
                />
            </section>
        </div>
    );
}
