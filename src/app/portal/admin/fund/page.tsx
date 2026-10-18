import type { Metadata } from "next";
import { redirect } from "next/navigation";
import FundOverview from "@/components/fund/FundOverview";
import FundAdminControls from "@/components/fund/FundAdminControls";
import { getSession } from "@/lib/auth/current";
import { getFundSummary, isFundVisible } from "@/lib/data/fund";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "صندوق العائلة" };

export default async function AdminFundPage() {
    const session = await getSession();
    if (session?.role !== "admin") redirect("/portal/admin");
    const [summary, visible] = await Promise.all([getFundSummary({ showHiddenParties: true }), isFundVisible()]);
    return (
        <div className="max-w-5xl mx-auto font-display space-y-6">
            <div>
                <h1 className="text-3xl font-black tracking-tight text-ink">صندوق العائلة</h1>
                <p className="text-muted mt-1">سجل الإيرادات والمصروفات للشفافية. لا تتم أي مدفوعات عبر الموقع.</p>
            </div>
            <FundAdminControls visible={visible} />
            <FundOverview summary={summary} canEdit />
        </div>
    );
}
