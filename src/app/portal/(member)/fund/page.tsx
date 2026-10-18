import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Lock } from "lucide-react";
import FundOverview from "@/components/fund/FundOverview";
import { getSession } from "@/lib/auth/current";
import { getFundSummary, isFundVisible } from "@/lib/data/fund";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "صندوق العائلة" };

// Members only, and only once an admin turns it on; never on the public site.
export default async function FundPage() {
    const session = await getSession();
    if (!session) redirect("/portal/login?next=/portal/fund");
    const visible = await isFundVisible();
    if (!visible && session.role !== "admin") {
        return (
            <div className="max-w-md mx-auto bg-white rounded-2xl border border-sand p-8 text-center">
                <Lock className="w-8 h-8 text-primary-dark mx-auto mb-3" />
                <h1 className="text-xl font-bold mb-2">صندوق العائلة</h1>
                <p className="text-sm text-gray-500">ستُنشر تقارير الصندوق هنا بعد اعتمادها من مجلس العائلة.</p>
            </div>
        );
    }
    const summary = await getFundSummary();
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl">صندوق العائلة</h1>
                <p className="text-sm text-gray-500 mt-1">تقرير شفاف بإيرادات الصندوق وأوجه صرفه، خاص بأفراد العائلة.</p>
            </div>
            {!visible && <p className="text-sm font-bold text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-3">هذه الصفحة مخفية عن الأعضاء حالياً، وتراها لأنك من الإدارة.</p>}
            <FundOverview summary={summary} />
        </div>
    );
}
