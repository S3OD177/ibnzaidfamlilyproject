import Link from "next/link";
import {
    Users,
    FileText,
    UserPlus,
    PlusSquare,
    Gavel,
    UploadCloud,
    Newspaper,
    CalendarDays,
} from "lucide-react";
import { getFamilyStats, getPendingRequests, getPlatformStats, getRecentActivity } from "@/lib/data/stats";
import { getSession } from "@/lib/auth/current";
import { formatHijri } from "@/lib/dates";

export const dynamic = "force-dynamic";

const nf = new Intl.NumberFormat("ar-SA");
const timeAgo = (date: Date) => {
    const rtf = new Intl.RelativeTimeFormat("ar", { numeric: "auto" });
    const minutes = Math.round((date.getTime() - Date.now()) / 60000);
    if (Math.abs(minutes) < 60) return rtf.format(minutes, "minute");
    const hours = Math.round(minutes / 60);
    if (Math.abs(hours) < 24) return rtf.format(hours, "hour");
    return rtf.format(Math.round(hours / 24), "day");
};

const ACTIVITY_STYLE = {
    member: { icon: Users, className: "bg-gray-100 text-gray-500" },
    news: { icon: Newspaper, className: "bg-primary/10 text-primary" },
    event: { icon: CalendarDays, className: "bg-blue-100 text-blue-600" },
} as const;

export default async function AdminDashboard() {
    // Editors see content stats; user management and join requests are for admins.
    const isAdmin = (await getSession())?.role === "admin";
    const [family, platform, activity, requests] = await Promise.all([
        getFamilyStats(),
        getPlatformStats(),
        getRecentActivity(6),
        getPendingRequests(3),
    ]);

    const statCards = [
        { label: "إجمالي أفراد العائلة", value: family.totalMembers, icon: Users, className: "bg-primary/10 text-primary", href: "/portal/admin/tree" },
        { label: "الأخبار المنشورة", value: platform.content.newsUrl, icon: FileText, className: "bg-blue-100 text-blue-600", href: "/portal/admin/news" },
        { label: "طلبات عضوية قيد الانتظار", value: platform.users.pending, icon: UserPlus, className: "bg-amber-100 text-amber-600", href: "/portal/admin/approvals", adminOnly: true },
    ].filter((card) => isAdmin || !card.adminOnly);

    const quickActions = [
        { label: "نشر خبر جديد", icon: PlusSquare, href: "/portal/admin/news/new", primary: true },
        { label: "إضافة قرار مجلس", icon: Gavel, href: "/portal/admin/decisions" },
        { label: "رفع ميثاق العائلة", icon: UploadCloud, href: "/portal/admin/documents" },
        { label: "إدارة المستخدمين", icon: UserPlus, href: "/portal/admin/users", adminOnly: true },
    ].filter((action) => isAdmin || !action.adminOnly);

    return (
        <div className="max-w-7xl mx-auto space-y-8 font-display">
            {/* Page Heading */}
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-ink tracking-tight">لوحة التحكم العامة</h2>
                    <p className="text-muted mt-1">مرحباً بك مجدداً. إليك نظرة سريعة على نشاط العائلة.</p>
                </div>
                <div className="text-sm text-muted font-medium bg-white px-4 py-2 rounded-lg border border-line">
                    {formatHijri(new Date(), { weekday: true })}
                </div>
            </div>

            {/* Stats Grid */}
            <div className={`grid grid-cols-1 gap-6 ${isAdmin ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
                {statCards.map((card) => (
                    <Link key={card.label} href={card.href} className="bg-white p-6 rounded-xl border border-line shadow-sm flex flex-col hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-lg ${card.className}`}>
                                <card.icon className="w-6 h-6" />
                            </div>
                        </div>
                        <p className="text-muted text-sm font-medium">{card.label}</p>
                        <p className="text-3xl font-bold text-ink mt-1">{nf.format(card.value)}</p>
                    </Link>
                ))}
            </div>

            {/* Quick Actions Section */}
            <div>
                <h3 className="text-xl font-bold text-ink mb-4">إجراءات سريعة</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {quickActions.map((action) => (
                        <Link
                            key={action.label}
                            href={action.href}
                            className={action.primary
                                ? "flex items-center gap-3 p-4 bg-primary text-white rounded-xl shadow-md hover:bg-primary/90 transition-all group active:scale-95"
                                : "flex items-center gap-3 p-4 bg-white text-ink border border-line rounded-xl hover:bg-gray-50 transition-all active:scale-95"}
                        >
                            <action.icon className={`w-6 h-6 ${action.primary ? "group-hover:scale-110 transition-transform" : "text-primary"}`} />
                            <span className="font-bold">{action.label}</span>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Two Columns Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity (2/3 width) */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-xl font-bold text-ink">النشاط الأخير</h3>
                    <div className="bg-white border border-line rounded-xl overflow-hidden shadow-sm">
                        {activity.length === 0 ? (
                            <p className="p-6 text-sm text-gray-400 text-center">لا يوجد نشاط بعد.</p>
                        ) : (
                            <div className="divide-y divide-mist">
                                {activity.map((item, i) => {
                                    const style = ACTIVITY_STYLE[item.kind];
                                    return (
                                        <Link key={i} href={item.href} className="p-4 flex gap-4 items-center hover:bg-gray-50 transition-colors">
                                            <div className={`size-10 rounded-full flex items-center justify-center ${style.className}`}>
                                                <style.icon className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-ink truncate">
                                                    <span className="font-bold">{item.title}</span> — {item.detail}
                                                </p>
                                                <p className="text-[10px] text-muted mt-0.5">{timeAgo(item.at)}</p>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Pending Approvals (1/3 width) */}
                {isAdmin && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-ink">طلبات انضمام</h3>
                        <span className="bg-primary/20 text-primary text-xs font-bold px-2 py-0.5 rounded-full">{nf.format(platform.users.pending)} طلب</span>
                    </div>
                    <div className="bg-white border border-line rounded-xl p-4 space-y-4 shadow-sm">
                        {requests.length === 0 ? (
                            <p className="text-sm text-gray-400 text-center py-4">لا توجد طلبات انضمام جديدة.</p>
                        ) : (
                            requests.map((req) => (
                                <div key={req.id} className="p-3 bg-canvas rounded-lg border border-mist">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold text-sm text-ink leading-tight">{req.fullName}</p>
                                            {req.branch && <p className="text-[10px] text-muted">{req.branch}</p>}
                                        </div>
                                        <span className="text-[9px] text-muted font-medium">{timeAgo(req.createdAt)}</span>
                                    </div>
                                </div>
                            ))
                        )}
                        <Link href="/portal/admin/approvals" className="block w-full text-center text-xs font-bold text-muted py-2 hover:text-primary transition-colors">
                            عرض كافة الطلبات
                        </Link>
                    </div>
                </div>
                )}
            </div>
        </div>
    );
}
