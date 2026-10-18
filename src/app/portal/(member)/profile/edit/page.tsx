import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Clock, Info, UserX } from "lucide-react";
import ChangeRequestForm from "@/components/portal/ChangeRequestForm";
import { getSession } from "@/lib/auth/current";
import { currentValues, getMemberRow, latestRequestFor } from "@/lib/data/change-requests";
import { STATUS_LABELS } from "@/lib/change-requests";
import { formatHijri } from "@/lib/dates";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "تحديث بياناتي" };


export default async function EditMyProfilePage() {
    const session = await getSession();
    if (!session) redirect("/portal/login?next=/portal/profile/edit");

    const row = session.memberId ? await getMemberRow(session.memberId) : null;
    if (!row) {
        return (
            <div className="max-w-md mx-auto bg-white rounded-2xl border border-line p-8 text-center">
                <div className="size-14 mx-auto mb-4 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                    <UserX className="w-7 h-7" />
                </div>
                <h1 className="text-xl font-bold mb-2">حسابك غير مرتبط بالشجرة بعد</h1>
                <p className="text-sm text-gray-500">بعد أن تربط الإدارة حسابك بملفك في الشجرة، يمكنك طلب تحديث بياناتك من هنا.</p>
            </div>
        );
    }

    const current = currentValues(row);
    const latest = await latestRequestFor(row.id);
    const pending = latest?.status === "pending" ? latest : null;
    const initial = pending ? { ...current, ...pending.changes } : current;

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <Link href={`/portal/members/${row.id}`} className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-ink">
                <ArrowRight className="w-4 h-4" />
                ملفي
            </Link>
            <div>
                <h1 className="text-2xl font-black">تحديث بياناتي</h1>
                <p className="text-sm text-gray-500 mt-1">
                    عدّل ما تريد ثم أرسل الطلب، وتظهر التعديلات في ملفك بعد أن تعتمدها الإدارة. الاسم والنسب وتواريخ الميلاد تعدّلها الإدارة فقط.
                </p>
            </div>

            {pending && (
                <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                    <Clock className="w-5 h-5 shrink-0" />
                    <p>
                        لديك طلب قيد المراجعة أُرسل في {formatHijri(pending.createdAt)}، والحقول المعدّلة فيه ظاهرة أدناه.
                        إرسال طلب جديد يحلّ محله.
                    </p>
                </div>
            )}
            {latest && latest.status !== "pending" && (
                <div className={`flex gap-3 rounded-2xl border p-4 text-sm ${STATUS_LABELS[latest.status].className}`}>
                    <Info className="w-5 h-5 shrink-0" />
                    <p>
                        آخر طلب لك: <strong>{STATUS_LABELS[latest.status].label}</strong>
                        {latest.reviewedAt && ` في ${formatHijri(latest.reviewedAt)}`}.
                        {latest.reviewNote && <> ملاحظة الإدارة: «{latest.reviewNote}»</>}
                    </p>
                </div>
            )}

            <ChangeRequestForm current={current} initial={initial} />
        </div>
    );
}
