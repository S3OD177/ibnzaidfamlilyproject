"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Newspaper,
    UserPlus,
    Users,
    FileText,
    Gavel,
    Settings,
    LogOut,
    Search,
    Bell,
    Menu,
    X,
    MessageCircle,
    Shield,
    BarChart3,
    Calendar
} from "lucide-react";
import { useState } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const menuItems = [
        { name: "لوحة التحكم", icon: LayoutDashboard, href: "/portal/admin" },

        { name: "إدارة الأخبار", icon: Newspaper, href: "/portal/admin/news" },
        { name: "التقويم العائلي", icon: Calendar, href: "/portal/admin/calendar" },
        { name: "طلبات العضوية", icon: UserPlus, href: "/portal/admin/approvals", badge: "12" },
        { name: "شجرة العائلة", icon: Users, href: "/portal/admin/tree" },
        { name: "إدارة الوثائق", icon: FileText, href: "/portal/admin/documents" },
        { name: "قرارات المجلس", icon: Gavel, href: "/portal/admin/decisions" },

        { name: "إدارة المستخدمين", icon: Shield, href: "/portal/admin/users" },
        { name: "الإحصائيات", icon: BarChart3, href: "/portal/admin/analytics" },
    ];

    return (
        <div className="flex h-screen overflow-hidden bg-[#f6f8f7] font-display text-[#111814]">

            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed lg:static inset-y-0 right-0 z-50 w-72 bg-white border-l border-[#dbe6e0] flex flex-col transition-transform duration-300 transform
                ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}
            `}>
                <div className="p-6 border-b border-[#f0f4f2] flex items-center gap-3">
                    <div className="bg-primary p-2 rounded-lg text-white">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold leading-tight">منصة العائلة</h1>
                        <p className="text-[#618975] text-xs font-normal">بوابة الإدارة المركزية</p>
                    </div>
                    <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden mr-auto text-gray-400">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                    ? "bg-primary text-white font-medium"
                                    : "text-[#111814] hover:bg-[#f0f4f2]"
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="text-sm">{item.name}</span>
                                {item.badge && (
                                    <span className="mr-auto bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                                        {item.badge}
                                    </span>
                                )}
                            </Link>
                        );
                    })}

                    <div className="mt-8 mb-2 px-4 text-[10px] uppercase tracking-widest text-[#618975] font-bold">النظام</div>

                    <Link href="/portal/admin/settings" className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#111814] hover:bg-[#f0f4f2] transition-colors">
                        <Settings className="w-5 h-5" />
                        <span className="text-sm">إعدادات المنصة</span>
                    </Link>
                </nav>

                <div className="p-4 border-t border-[#f0f4f2]">
                    <Link href="/portal/login" className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors">
                        <LogOut className="w-5 h-5" />
                        <span className="text-sm font-bold">تسجيل الخروج</span>
                    </Link>
                </div>
            </aside>

            {/* Main Content Wrapper */}
            <div className="flex-1 flex flex-col overflow-hidden">

                {/* Header */}
                <header className="h-16 bg-white border-b border-[#f0f4f2] flex items-center justify-between px-4 lg:px-8">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 text-gray-500">
                            <Menu className="w-6 h-6" />
                        </button>

                        <div className="hidden md:flex items-center bg-[#f6f8f7] px-3 py-1.5 rounded-lg border border-[#dbe6e0] w-full max-w-sm">
                            <Search className="w-4 h-4 text-[#618975] ml-2" />
                            <input
                                className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-[#618975] outline-none"
                                placeholder="بحث عن عضو، خبر، أو مستند..."
                                type="text"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="p-2 text-[#618975] hover:bg-[#f0f4f2] rounded-full relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                        <div className="h-8 w-px bg-[#f0f4f2]"></div>
                        <div className="flex items-center gap-3">
                            <div className="text-left hidden sm:block">
                                <p className="text-sm font-bold text-[#111814] leading-none">أحمد الفلاني</p>
                                <p className="text-[10px] text-[#618975]">مشرف النظام</p>
                            </div>
                            <div className="size-10 rounded-full border-2 border-primary overflow-hidden bg-gray-100 flex items-center justify-center text-gray-400">
                                <Users className="w-6 h-6" />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto p-4 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
