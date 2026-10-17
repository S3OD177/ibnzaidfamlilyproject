import { redirect } from "next/navigation";
import { UserCircle } from "lucide-react";
import ChangePasswordForm from "@/components/auth/ChangePasswordForm";
import { getSession } from "@/lib/auth/current";

export const dynamic = "force-dynamic";

const ROLE_LABELS = { admin: "مدير النظام", editor: "محرر", member: "عضو" } as const;

export default async function AccountPage() {
    const session = await getSession();
    if (!session) redirect("/portal/login?next=/portal/account");

    return (
        <div className="font-body">
            <div className="max-w-md mx-auto space-y-6">
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 space-y-6">
                    <div className="flex items-center gap-3">
                        <UserCircle className="w-10 h-10 text-primary" />
                        <div>
                            <h1 className="text-xl font-bold text-[#111813]">{session.displayName}</h1>
                            <p className="text-sm text-gray-500">{ROLE_LABELS[session.role]}</p>
                        </div>
                    </div>
                    {session.isDbUser ? (
                        <ChangePasswordForm />
                    ) : (
                        <p className="text-sm text-gray-500 bg-gray-50 rounded-xl p-4">
                            هذا حساب مؤقت (تجريبي أو من إعدادات الخادم) ولا يمكن تغيير كلمة مروره من هنا.
                        </p>
                    )}
                    <form action="/api/auth/logout" method="post">
                        <button type="submit" className="w-full text-sm font-bold text-red-600 hover:underline cursor-pointer">تسجيل الخروج</button>
                    </form>
                </div>
            </div>
        </div>
    );
}
