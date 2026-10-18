"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Images, LayoutDashboard, LogOut, Network, PartyPopper, UserCircle, Users } from "lucide-react";
import { Emblem } from "@/components/heritage/Ornament";

interface MemberShellProps {
    children: React.ReactNode;
    siteName: string;
    displayName: string;
    /** Tree member linked to this account, so "my profile" highlights on its page. */
    memberId: string | null;
    isStaff: boolean;
}

const NAV = [
    { name: "الرئيسية", href: "/portal", icon: Home },
    { name: "الشجرة", href: "/portal/tree", icon: Network },
    { name: "الأعضاء", href: "/portal/directory", icon: Users },
    { name: "الأفراح", href: "/portal/occasions", icon: PartyPopper },
    { name: "الصور", href: "/portal/albums", icon: Images, desktopOnly: true },
    { name: "ملفي", href: "/portal/members/me", icon: UserCircle },
];

// Frame for the members' portal: top bar on wide screens, bottom bar on phones.
export default function MemberShell({ children, siteName, displayName, memberId, isStaff }: MemberShellProps) {
    const pathname = usePathname();

    const activeHref = (() => {
        if (pathname === "/portal/members/me" || pathname.startsWith("/portal/profile") || (memberId && pathname === `/portal/members/${memberId}`)) return "/portal/members/me";
        if (pathname.startsWith("/portal/members/")) return "/portal/directory";
        return NAV.find((item) => item.href !== "/portal" && pathname.startsWith(item.href))?.href ?? (pathname === "/portal" ? "/portal" : null);
    })();

    return (
        <div className="portal-heritage min-h-screen bg-cream font-display text-ink" dir="rtl">
            <header className="sticky top-0 z-30 bg-deep/95 backdrop-blur border-b border-primary/20">
                <div className="max-w-6xl mx-auto h-16 px-4 flex items-center gap-6">
                    <Link href="/portal" className="flex items-center gap-2.5 shrink-0 min-w-0">
                        <Emblem />
                        <span className="font-heritage font-bold text-xl text-primary truncate">{siteName}</span>
                    </Link>

                    <nav className="hidden md:flex items-center gap-1" aria-label="بوابة الأعضاء">
                        {NAV.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                aria-current={activeHref === item.href ? "page" : undefined}
                                className={`px-3 py-2 rounded-lg text-sm transition-colors ${activeHref === item.href
                                    ? "bg-primary/15 text-primary font-bold"
                                    : "text-white/75 hover:text-white hover:bg-white/5"
                                    }`}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </nav>

                    <div className="mr-auto flex items-center gap-2">
                        {isStaff && (
                            <Link
                                href="/portal/admin"
                                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold text-primary border border-primary/40 hover:bg-primary/10"
                            >
                                <LayoutDashboard className="w-4 h-4" />
                                <span className="hidden sm:inline">لوحة الإدارة</span>
                            </Link>
                        )}
                        <Link
                            href="/portal/account"
                            className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-white hover:bg-white/5 ${pathname === "/portal/account" ? "bg-white/10" : ""}`}
                            aria-label="حسابي"
                        >
                            <span className="hidden sm:block text-sm font-bold max-w-40 truncate">{displayName}</span>
                            <span className="size-9 rounded-full border-2 border-primary bg-deep-light flex items-center justify-center text-primary">
                                <UserCircle className="w-5 h-5" />
                            </span>
                        </Link>
                        <form action="/api/auth/logout" method="post" className="hidden md:block">
                            <button type="submit" className="p-2 rounded-lg text-red-300 hover:bg-white/5 cursor-pointer" aria-label="تسجيل الخروج" title="تسجيل الخروج">
                                <LogOut className="w-5 h-5" />
                            </button>
                        </form>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 py-6 md:py-8 pb-28 md:pb-12">{children}</main>

            <nav
                className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-deep border-t border-primary/20 pb-[env(safe-area-inset-bottom)]"
                aria-label="بوابة الأعضاء"
            >
                <div className="grid grid-cols-5">
                    {NAV.filter((item) => !("desktopOnly" in item)).map((item) => {
                        const Icon = item.icon;
                        const active = activeHref === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                aria-current={active ? "page" : undefined}
                                className={`flex flex-col items-center gap-1 py-2.5 text-[11px] ${active ? "text-primary font-bold" : "text-white/60"}`}
                            >
                                <Icon className="w-5 h-5" />
                                {item.name}
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
}
