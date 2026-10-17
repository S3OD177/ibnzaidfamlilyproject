import type { Metadata } from "next";
import Link from "next/link";
import ChangeRequestsManager from "@/components/admin/change-requests/ChangeRequestsManager";
import { currentValuesFor, listChangeRequests } from "@/lib/data/change-requests";
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
    const requests = await listChangeRequests(tab);
    // Old values are only meaningful while a request is pending; later the record has moved on.
    const current = tab === "pending" ? await currentValuesFor([...new Set(requests.map((r) => r.memberId))]) : new Map();

    return (
        <div className="max-w-5xl mx-auto font-display space-y-6">
            <div>
                <h1 className="text-3xl font-black tracking-tight text-[#111814]">طلبات تعديل البيانات</h1>
                <p className="text-[#618975] mt-1">
                    طلبات الأعضاء لتحديث بياناتهم في الشجرة. الاعتماد يطبّق التعديلات على ملف الفرد مباشرة.
                </p>
            </div>

            <div className="flex gap-2 border-b border-[#dbe6e0] pb-4">
                {TABS.map((t) => (
                    <Link
                        key={t.key}
                        href={t.key === "pending" ? "/portal/admin/change-requests" : `/portal/admin/change-requests?status=${t.key}`}
                        className={t.key === tab
                            ? "px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm font-bold border border-primary/20"
                            : "px-4 py-2 bg-white border border-[#dbe6e0] text-[#618975] rounded-lg text-sm font-bold hover:bg-[#f8faf8]"}
                    >
                        {t.label}
                    </Link>
                ))}
            </div>

            <ChangeRequestsManager
                requests={requests.map((r) => ({ ...r, current: current.get(r.memberId) ?? null }))}
                emptyText={tab === "pending" ? "لا توجد طلبات بانتظار المراجعة." : "لا توجد طلبات هنا."}
            />
        </div>
    );
}
