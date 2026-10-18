import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, ShieldCheck, UserX } from "lucide-react";
import PrivacyForm from "@/components/portal/PrivacyForm";
import { getSession } from "@/lib/auth/current";
import { isStaff } from "@/lib/auth/session";
import { getMemberRow } from "@/lib/data/change-requests";
import { readPrivacy } from "@/lib/privacy";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "الخصوصية" };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** A member's own privacy settings; staff can open anyone's with ?member=<id>. */
export default async function PrivacyPage({ searchParams }: { searchParams: Promise<{ member?: string }> }) {
    const session = await getSession();
    if (!session) redirect("/portal/login?next=/portal/profile/privacy");
    const { member } = await searchParams;
    const staff = isStaff(session.role);
    const memberId = staff && member && UUID.test(member) ? member : session.memberId;
    const row = memberId ? await getMemberRow(memberId) : null;

    if (!row) {
        return (
            <div className="max-w-md mx-auto bg-white rounded-2xl border border-sand p-8 text-center">
                <div className="size-14 mx-auto mb-4 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                    <UserX className="w-7 h-7" />
                </div>
                <h1 className="text-xl font-bold mb-2">حسابك غير مرتبط بالشجرة بعد</h1>
                <p className="text-sm text-gray-500">بعد ربط حسابك بملفك في الشجرة، يمكنك التحكم في خصوصية بياناتك من هنا.</p>
            </div>
        );
    }

    const forSomeoneElse = row.id !== session.memberId;
    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <Link href={`/portal/members/${row.id}`} className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-ink">
                <ArrowRight className="w-4 h-4" />
                {forSomeoneElse ? row.fullName : "ملفي"}
            </Link>
            <div>
                <h1 className="text-3xl flex items-center gap-2">
                    <ShieldCheck className="w-7 h-7 text-primary-dark" />
                    {forSomeoneElse ? `خصوصية ${row.fullName}` : "خصوصية بياناتي"}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                    اختر من يرى كل معلومة. الإدارة ترى كل البيانات دائماً، والتغيير يُطبَّق فوراً دون حاجة لاعتماد.
                </p>
            </div>
            <PrivacyForm memberId={row.id} initial={readPrivacy(row.privacy)} initialPublic={row.isPublic === 1} />
        </div>
    );
}
