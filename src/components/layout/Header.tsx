"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Users, X } from "lucide-react";

const NAV = [
    { href: "/", label: "الرئيسية" },
    { href: "/news", label: "الأخبار" },
    { href: "/about", label: "عن العائلة" },
    { href: "/council", label: "مجلس العائلة" },
];

export function Header({ siteName }: { siteName: string }) {
    const pathname = usePathname();
    // Mobile menu; keyed on the path below so it closes after navigating.
    const [openPath, setOpenPath] = useState<string | null>(null);
    const menuOpen = openPath === pathname;

    const isActive = (path: string) => {
        if (path === "/") {
            return pathname === "/";
        }
        return pathname?.startsWith(path);
    };

    const getLinkClass = (path: string) => {
        return isActive(path)
            ? "text-primary text-sm font-bold leading-normal outline-none"
            : "text-[#111813] text-sm font-medium leading-normal hover:text-primary transition-colors outline-none";
    };

    return (
        <header className="sticky top-0 z-50 bg-white border-b border-[#f0f4f2]">
            <div className="max-w-[1280px] mx-auto px-4 sm:px-10 py-3 flex items-center justify-between whitespace-nowrap">
                {/* Logo & Brand - Right (RTL) */}
                <Link href="/" className="flex items-center gap-4 text-[#111813]">
                    <div className="size-8 text-primary">
                        {/* Using Lucide Users as equivalent to diversity_2 */}
                        <Users className="w-8 h-8" />
                    </div>
                    <h2 className="text-[#111813] text-xl font-bold leading-tight tracking-[-0.015em] font-display">
                        {siteName}
                    </h2>
                </Link>

                {/* Desktop Navigation - Center */}
                <div className="hidden lg:flex flex-1 justify-end gap-8 items-center">
                    <nav className="flex items-center gap-9">
                        {NAV.map((item) => (
                            <Link key={item.href} className={getLinkClass(item.href)} href={item.href}>
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Login Button */}
                    <Link
                        href="/portal/login"
                        className="flex items-center gap-2 bg-[#111812] text-white px-5 py-2 rounded-lg font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-md"
                    >
                        <Menu className="w-[18px] h-[18px]" />
                        <span>الخدمات الإلكترونية</span>
                    </Link>
                </div>

                {/* Mobile Menu Toggle */}
                <div className="lg:hidden flex items-center">
                    <button
                        type="button"
                        className="text-[#111813] p-2 -m-2 cursor-pointer"
                        aria-label={menuOpen ? "إغلاق القائمة" : "فتح القائمة"}
                        aria-expanded={menuOpen}
                        aria-controls="mobile-menu"
                        onClick={() => setOpenPath(menuOpen ? null : pathname)}
                    >
                        {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {menuOpen && (
                <nav id="mobile-menu" className="lg:hidden border-t border-[#f0f4f2] bg-white px-4 pb-4 shadow-lg">
                    <ul className="flex flex-col py-2">
                        {NAV.map((item) => (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={`block py-3 border-b border-gray-50 ${getLinkClass(item.href)}`}
                                    aria-current={isActive(item.href) ? "page" : undefined}
                                >
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                    <Link
                        href="/portal/login"
                        className="mt-2 flex items-center justify-center gap-2 bg-[#111812] text-white px-5 py-3 rounded-lg font-bold text-sm"
                    >
                        <Menu className="w-[18px] h-[18px]" />
                        <span>الخدمات الإلكترونية</span>
                    </Link>
                </nav>
            )}
        </header>
    );
}
