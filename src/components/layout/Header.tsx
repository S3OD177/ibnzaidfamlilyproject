"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogIn, Menu, X } from "lucide-react";
import { Emblem } from "@/components/heritage/Ornament";

const NAV = [
    { href: "/", label: "الرئيسية" },
    { href: "/about", label: "عن العائلة" },
    { href: "/council", label: "مجلس العائلة" },
    { href: "/news", label: "الأخبار" },
    { href: "/join", label: "طلب انضمام" },
];

export function Header({ siteName }: { siteName: string }) {
    const pathname = usePathname();
    // Mobile menu; keyed on the path below so it closes after navigating.
    const [openPath, setOpenPath] = useState<string | null>(null);
    const menuOpen = openPath === pathname;

    const isActive = (path: string) => (path === "/" ? pathname === "/" : pathname?.startsWith(path));

    return (
        <header className="sticky top-0 z-50 bg-deep/95 backdrop-blur border-b border-primary/20">
            <div className="max-w-[1280px] mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-6">
                <Link href="/" className="flex items-center gap-3 min-w-0">
                    <Emblem />
                    <span className="font-heritage font-bold text-xl md:text-2xl text-primary truncate">{siteName}</span>
                </Link>

                <nav className="hidden lg:flex items-center gap-1" aria-label="القائمة الرئيسية">
                    {NAV.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            aria-current={isActive(item.href) ? "page" : undefined}
                            className={`relative px-4 py-2 text-sm transition-colors ${isActive(item.href) ? "text-primary font-bold" : "text-white/80 hover:text-white"}`}
                        >
                            {item.label}
                            {isActive(item.href) && <span className="absolute inset-x-4 -bottom-[13px] h-0.5 bg-primary rounded-full" />}
                        </Link>
                    ))}
                </nav>

                <div className="flex items-center gap-2">
                    <Link
                        href="/portal"
                        className="hidden sm:flex items-center gap-2 bg-primary text-deep px-4 py-2 rounded-lg font-bold text-sm hover:bg-primary-light transition-colors"
                    >
                        <LogIn className="w-4 h-4" />
                        <span>بوابة الأعضاء</span>
                    </Link>
                    <button
                        type="button"
                        className="lg:hidden text-white p-2 -m-1 cursor-pointer"
                        aria-label={menuOpen ? "إغلاق القائمة" : "فتح القائمة"}
                        aria-expanded={menuOpen}
                        aria-controls="mobile-menu"
                        onClick={() => setOpenPath(menuOpen ? null : pathname)}
                    >
                        {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {menuOpen && (
                <nav id="mobile-menu" className="lg:hidden border-t border-primary/20 bg-deep px-4 pb-5" aria-label="القائمة الرئيسية">
                    <ul className="flex flex-col py-2">
                        {NAV.map((item) => (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    aria-current={isActive(item.href) ? "page" : undefined}
                                    className={`block py-3.5 border-b border-white/10 ${isActive(item.href) ? "text-primary font-bold" : "text-white/85"}`}
                                >
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                    <Link href="/portal" className="mt-3 flex items-center justify-center gap-2 bg-primary text-deep px-5 py-3 rounded-lg font-bold text-sm">
                        <LogIn className="w-4 h-4" />
                        <span>بوابة الأعضاء</span>
                    </Link>
                </nav>
            )}
        </header>
    );
}
