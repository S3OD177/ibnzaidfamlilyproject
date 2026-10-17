"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, LogOut, Search, Bell, Menu, X, KeyRound, Users } from "lucide-react";
import { useState } from "react";
import { findActive, sectionsFor } from "./adminNav";

const ROLE_LABELS = { admin: "مدير النظام", editor: "محرر", member: "عضو" } as const;

interface AdminShellProps {
    children: React.ReactNode;
    pendingRequests?: number;
    role: keyof typeof ROLE_LABELS;
    displayName: string;
    siteName: string;
}

export default function AdminShell({ children, pendingRequests = 0, role, displayName, siteName }: AdminShellProps) {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const sections = sectionsFor(role);
    const active = findActive(sections, pathname);
    const pendingBadge = pendingRequests > 0 ? String(pendingRequests) : undefined;

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
                        <h1 className="text-lg font-bold leading-tight">{siteName}</h1>
                        <p className="text-[#618975] text-xs font-normal">بوابة الإدارة المركزية</p>
                    </div>
                    <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden mr-auto text-gray-400">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
                    {sections.map((section) => {
                        const Icon = section.icon;
                        const isActive = active?.section.name === section.name;
                        const badge = section.tabs.some((t) => t.badge === "pending") ? pendingBadge : undefined;

                        return (
                            <Link
                                key={section.name}
                                href={section.tabs[0].href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                    ? "bg-primary text-white font-medium"
                                    : "text-[#111814] hover:bg-[#f0f4f2]"
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="text-sm">{section.name}</span>
                                {badge && (
                                    <span className="mr-auto bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                                        {badge}
                                    </span>
                                )}
                            </Link>
                        );
                    })}

                    <div className="mt-8 mb-2 px-4 text-[10px] uppercase tracking-widest text-[#618975] font-bold">النظام</div>

                    {role === "admin" && (
                        <Link href="/portal/admin/settings" className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#111814] hover:bg-[#f0f4f2] transition-colors">
                            <Settings className="w-5 h-5" />
                            <span className="text-sm">إعدادات المنصة</span>
                        </Link>
                    )}
                    <Link href="/portal/account" className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#111814] hover:bg-[#f0f4f2] transition-colors">
                        <KeyRound className="w-5 h-5" />
                        <span className="text-sm">حسابي وكلمة المرور</span>
                    </Link>
                </nav>

                <div className="p-4 border-t border-[#f0f4f2]">
                    <form action="/api/auth/logout" method="post">
                        <button type="submit" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors cursor-pointer">
                            <LogOut className="w-5 h-5" />
                            <span className="text-sm font-bold">تسجيل الخروج</span>
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main Content Wrapper */}
            <div className="flex-1 flex flex-col overflow-hidden">

                {/* Header */}
                <header className="h-16 bg-white border-b border-[#f0f4f2] flex items-center justify-between px-4 lg:px-8">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 text-gray-500" aria-label="فتح القائمة">
                            <Menu className="w-6 h-6" />
                        </button>

                        <form action="/portal/admin/search" method="get" role="search" className="hidden md:flex items-center bg-[#f6f8f7] px-3 py-1.5 rounded-lg border border-[#dbe6e0] w-full max-w-sm">
                            <Search className="w-4 h-4 text-[#618975] ml-2" />
                            <input
                                name="q"
                                className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-[#618975] outline-none"
                                placeholder="بحث عن عضو، خبر، قرار، أو وثيقة..."
                                type="search"
                            />
                        </form>
                        <Link href="/portal/admin/search" className="md:hidden p-2 text-gray-500" aria-label="بحث">
                            <Search className="w-5 h-5" />
                        </Link>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Join requests are the only notifications for now (admins only). */}
                        {role === "admin" && (
                            <>
                                <Link
                                    href="/portal/admin/approvals"
                                    className="p-2 text-[#618975] hover:bg-[#f0f4f2] rounded-full relative"
                                    aria-label={pendingRequests > 0 ? `${pendingRequests} طلبات انضمام جديدة` : "طلبات الانضمام"}
                                >
                                    <Bell className="w-5 h-5" />
                                    {pendingRequests > 0 && <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-white"></span>}
                                </Link>
                                <div className="h-8 w-px bg-[#f0f4f2]"></div>
                            </>
                        )}
                        <Link href="/portal/account" className="flex items-center gap-3" aria-label="حسابي">
                            <div className="text-left hidden sm:block">
                                <p className="text-sm font-bold text-[#111814] leading-none">{displayName}</p>
                                <p className="text-[10px] text-[#618975]">{ROLE_LABELS[role]}</p>
                            </div>
                            <div className="size-10 rounded-full border-2 border-primary overflow-hidden bg-gray-100 flex items-center justify-center text-gray-400">
                                <Users className="w-6 h-6" />
                            </div>
                        </Link>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto p-4 lg:p-8">
                    {active && active.section.tabs.length > 1 && (
                        <nav aria-label={active.section.name} className="-mx-4 lg:mx-0 px-4 lg:px-0 mb-6 overflow-x-auto">
                            <div className="flex gap-1 border-b border-[#dbe6e0] min-w-max">
                                {active.section.tabs.map((tab) => {
                                    const Icon = tab.icon;
                                    const selected = tab.href === active.tab.href;
                                    return (
                                        <Link
                                            key={tab.href}
                                            href={tab.href}
                                            aria-current={selected ? "page" : undefined}
                                            className={`flex items-center gap-2 px-4 py-2.5 -mb-px border-b-2 text-sm whitespace-nowrap transition-colors ${selected
                                                ? "border-primary text-primary font-bold"
                                                : "border-transparent text-[#618975] hover:text-[#111814] hover:border-[#dbe6e0]"
                                                }`}
                                        >
                                            <Icon className="w-4 h-4" />
                                            {tab.name}
                                            {tab.badge === "pending" && pendingBadge && (
                                                <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{pendingBadge}</span>
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        </nav>
                    )}
                    {children}
                </main>
            </div>
        </div>
    );
}
