import type { Metadata } from "next";
import { redirect } from "next/navigation";
import FamilyTreeViewer from "@/components/portal/FamilyTreeViewer";
import { getSession, getViewer } from "@/lib/auth/current";
import { getTreeView } from "@/lib/data/tree";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "شجرة العائلة" };

export default async function MemberTreePage() {
    const session = await getSession();
    if (!session) redirect("/portal/login?next=/portal/tree");
    const tree = await getTreeView(await getViewer());

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-2xl font-black">شجرة العائلة</h1>
                <p className="text-sm text-gray-500 mt-1">اسحب للتنقل وكبّر للتفاصيل، واضغط «عرض» على أي فرد لفتح ملفه.</p>
            </div>
            <FamilyTreeViewer tree={tree} myMemberId={session.memberId} />
        </div>
    );
}
