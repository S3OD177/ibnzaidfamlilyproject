"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Users } from "lucide-react";

export function Header() {
    const pathname = usePathname();

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
                        منصة العائلة
                    </h2>
                </Link>

                {/* Desktop Navigation - Center */}
                <div className="hidden lg:flex flex-1 justify-end gap-8 items-center">
                    <nav className="flex items-center gap-9">
                        <Link className={getLinkClass("/")} href="/">
                            الرئيسية
                        </Link>
                        <Link className={getLinkClass("/news")} href="/news">
                            الأخبار
                        </Link>

                        <Link className={getLinkClass("/about")} href="/about">
                            عن العائلة
                        </Link>
                        <Link className={getLinkClass("/council")} href="/council">
                            مجلس العائلة
                        </Link>
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
                    <button className="text-[#111813]">
                        <Menu className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </header>
    );
}
