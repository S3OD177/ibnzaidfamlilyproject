import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, PencilLine, UserX } from "lucide-react";
import ProfileHeader from "@/components/admin/members/ProfileHeader";
import FamilyConnections from "@/components/admin/members/FamilyConnections";
import { getPortalMember } from "@/lib/data/members";
import { getSession } from "@/lib/auth/current";
import { isStaff } from "@/lib/auth/session";
import { formatHijri } from "@/lib/dates";

export const dynamic = "force-dynamic";

function formatDate(date: Date) {
    return formatHijri(date);
}

export default async function MemberProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await getSession();
    if (!session) redirect(`/portal/login?next=/portal/members/${id}`);
    const backLink = isStaff(session.role)
        ? { href: "/portal/admin/tree", label: "العودة لشجرة العائلة" }
        : { href: "/portal/directory", label: "دليل الأعضاء" };

    // "me" opens the tree member linked to this account, when an admin has linked one.
    if (id === "me" && session.memberId) redirect(`/portal/members/${session.memberId}`);
    if (id === "me") {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                    <div className="size-14 mx-auto mb-4 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                        <UserX className="w-7 h-7" />
                    </div>
                    <h1 className="text-xl font-bold text-ink mb-2">حسابك غير مرتبط بالشجرة بعد</h1>
                    <p className="text-sm text-gray-500 mb-6">
                        سيتم ربط حسابك بملفك في شجرة العائلة من قبل الإدارة. يمكنك تصفح الموقع حتى ذلك الحين.
                    </p>
                    <div className="flex flex-col gap-3">
                        <Link href="/portal" className="bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary-dark transition-colors">
                            الرئيسية
                        </Link>
                        <Link href="/portal/account" className="text-sm font-bold text-primary hover:underline">
                            حسابي وتغيير كلمة المرور
                        </Link>
                        <form action="/api/auth/logout" method="post">
                            <button type="submit" className="w-full text-sm font-bold text-red-600 hover:underline cursor-pointer">
                                تسجيل الخروج
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    const member = await getPortalMember(id);
    if (!member) notFound();

    return (
        <div>
            <div className="max-w-5xl mx-auto">
                {/* Breadcrumb / Back */}
                <div className="mb-6 flex items-center justify-between gap-3">
                    <Link href={backLink.href} className="inline-flex items-center gap-2 text-gray-500 hover:text-ink transition-colors font-bold text-sm">
                        <ArrowRight className="w-4 h-4" />
                        {backLink.label}
                    </Link>
                    {session.memberId === member.id && (
                        <Link
                            href="/portal/profile/edit"
                            className="inline-flex items-center gap-2 bg-primary text-white font-bold text-sm rounded-xl px-4 py-2.5 hover:bg-primary-dark"
                        >
                            <PencilLine className="w-4 h-4" />
                            تحديث بياناتي
                        </Link>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Column */}
                    <div className="lg:col-span-2 space-y-6">
                        <ProfileHeader member={member} />

                        {/* Bio / History */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                            <h3 className="text-lg font-bold text-ink mb-4">السيرة الذاتية</h3>
                            <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-line">
                                {member.bio || "لا توجد سيرة ذاتية مسجلة."}
                            </p>
                        </div>
                    </div>

                    {/* Sidebar Column */}
                    <div className="space-y-6">
                        <FamilyConnections member={member} />

                        {/* Meta Info Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">معلومات السجل</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">تاريخ الإضافة</span>
                                    <span className="font-medium text-ink">{formatDate(member.createdAt)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">آخر تعديل</span>
                                    <span className="font-medium text-ink">{formatDate(member.updatedAt)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
