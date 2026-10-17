import { redirect } from "next/navigation";
import { Shield } from "lucide-react";
import UsersManager from "@/components/admin/users/UsersManager";
import { getSession } from "@/lib/auth/current";
import { isDemoLoginEnabled } from "@/lib/auth/session";
import { listMemberOptions, listUsers } from "@/lib/data/users";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
    const session = await getSession();
    if (session?.role !== "admin") redirect("/portal/admin");
    const [users, members] = await Promise.all([listUsers(), listMemberOptions()]);

    return (
        <div className="max-w-[1440px] mx-auto w-full font-display min-h-screen space-y-6">
            <div className="space-y-1">
                <h2 className="text-3xl font-black tracking-tight text-[#111813] flex items-center gap-3">
                    <Shield className="w-7 h-7 text-primary" />
                    إدارة المستخدمين
                </h2>
                <p className="text-[#61896b] max-w-2xl">
                    حسابات الدخول إلى البوابة وأدوارها: مدير النظام، محرر المحتوى، وعضو العائلة.
                </p>
            </div>

            {(!session.isDbUser || isDemoLoginEnabled()) && (
                <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                    {session.isDbUser
                        ? "الحسابات التجريبية ما زالت مفعّلة على صفحة الدخول. سيتم إيقافها قبل الإطلاق."
                        : "أنت تستخدم حساباً مؤقتاً. أنشئ حساب مدير حقيقياً لنفسك من النموذج أدناه ثم سجّل الدخول به."}
                </div>
            )}

            <UsersManager users={users} members={members} currentUserId={session.userId} />
        </div>
    );
}
