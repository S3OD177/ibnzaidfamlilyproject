import Link from "next/link";
import { redirect } from "next/navigation";
import { ExternalLink } from "lucide-react";
import ApprovalsManager from "@/components/admin/approvals/ApprovalsManager";
import { getSession } from "@/lib/auth/current";
import { listJoinRequests, listMemberOptions, type JoinRequestRow } from "@/lib/data/users";

export const dynamic = "force-dynamic";

const TABS: { key: JoinRequestRow["status"]; label: string }[] = [
    { key: "pending", label: "قيد المراجعة" },
    { key: "approved", label: "المقبولة" },
    { key: "rejected", label: "المرفوضة" },
];

export default async function ApprovalsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
    const session = await getSession();
    if (session?.role !== "admin") redirect("/portal/admin");
    const { status } = await searchParams;
    const tab = TABS.find((t) => t.key === status)?.key ?? "pending";
    const [requests, members] = await Promise.all([listJoinRequests(tab), listMemberOptions()]);

    return (
        <div className="max-w-5xl mx-auto font-display space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-[#111814]">طلبات انضمام الأعضاء</h1>
                    <p className="text-[#618975] mt-1">راجع الطلبات المرسلة من صفحة طلب الانضمام، واعتمدها لإنشاء حساب عضو.</p>
                </div>
                <Link href="/join" target="_blank" className="flex items-center gap-2 text-sm font-bold text-primary hover:underline">
                    <ExternalLink className="w-4 h-4" />
                    صفحة طلب الانضمام
                </Link>
            </div>

            <div className="flex gap-2 border-b border-[#dbe6e0] pb-4">
                {TABS.map((t) => (
                    <Link
                        key={t.key}
                        href={t.key === "pending" ? "/portal/admin/approvals" : `/portal/admin/approvals?status=${t.key}`}
                        className={t.key === tab
                            ? "px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm font-bold border border-primary/20"
                            : "px-4 py-2 bg-white border border-[#dbe6e0] text-[#618975] rounded-lg text-sm font-bold hover:bg-[#f8faf8]"}
                    >
                        {t.label}
                    </Link>
                ))}
            </div>

            <ApprovalsManager requests={requests} members={members} />
        </div>
    );
}
