import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, UserX } from "lucide-react";
import ProposalForm from "@/components/portal/ProposalForm";
import { getSession } from "@/lib/auth/current";
import { allowedParents, myProposals } from "@/lib/data/proposals";
import { STATUS_LABELS } from "@/lib/change-requests";
import { formatHijri } from "@/lib/dates";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "إضافة فرد جديد للشجرة" };

export default async function ProposeMemberPage() {
    const session = await getSession();
    if (!session) redirect("/portal/login?next=/portal/profile/propose");

    const parents = session.memberId ? await allowedParents(session.memberId) : [];
    if (parents.length === 0) {
        return (
            <div className="max-w-md mx-auto bg-white rounded-2xl border border-line p-8 text-center">
                <div className="size-14 mx-auto mb-4 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                    <UserX className="w-7 h-7" />
                </div>
                <h1 className="text-xl font-bold mb-2">حسابك غير مرتبط بالشجرة بعد</h1>
                <p className="text-sm text-gray-500">بعد أن تربط الإدارة حسابك بملفك في الشجرة، يمكنك اقتراح إضافة أبنائك وأحفادك من هنا.</p>
            </div>
        );
    }

    const mine = session.isDbUser ? await myProposals(session.userId) : [];

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <Link href={`/portal/members/${parents[0].id}`} className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-ink">
                <ArrowRight className="w-4 h-4" />
                ملفي
            </Link>
            <div>
                <h1 className="text-2xl font-black">إضافة فرد جديد للشجرة</h1>
                <p className="text-sm text-gray-500 mt-1">
                    أضف مولوداً جديداً أو أحد أبنائك وأحفادك غير المسجّلين، ويظهر في الشجرة بعد أن تعتمده الإدارة.
                </p>
            </div>

            <ProposalForm parents={parents} />

            <section className="space-y-3">
                <h2 className="font-bold text-lg">طلباتي</h2>
                {mine.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-10 border border-dashed border-gray-200 rounded-2xl bg-white">لم ترسل أي طلب بعد.</p>
                ) : (
                    <ul className="space-y-3">
                        {mine.map((r) => (
                            <li key={r.id} className="bg-white rounded-2xl border border-line p-4 space-y-2">
                                <div className="flex flex-wrap items-start justify-between gap-2">
                                    <div>
                                        {r.createdMemberId ? (
                                            <Link href={`/portal/members/${r.createdMemberId}`} className="font-bold hover:text-primary">{r.fullName}</Link>
                                        ) : (
                                            <span className="font-bold">{r.fullName}</span>
                                        )}
                                        <p className="text-xs text-muted mt-0.5">
                                            {r.gender === "male" ? "ابن" : "ابنة"} {r.parentName} · أُرسل في {formatHijri(r.createdAt)}
                                        </p>
                                    </div>
                                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${STATUS_LABELS[r.requestStatus].className}`}>
                                        {STATUS_LABELS[r.requestStatus].label}
                                    </span>
                                </div>
                                {r.reviewNote && (
                                    <p className="text-sm bg-canvas rounded-xl p-3">
                                        <span className="font-bold">ملاحظة الإدارة: </span>
                                        {r.reviewNote}
                                    </p>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
}
