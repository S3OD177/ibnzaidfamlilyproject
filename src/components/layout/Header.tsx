import Link from "next/link";
import { Menu, Users } from "lucide-react";

export function Header() {
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
                        <Link className="text-primary text-sm font-bold leading-normal" href="/">
                            الرئيسية
                        </Link>
                        <Link className="text-[#111813] text-sm font-medium leading-normal hover:text-primary transition-colors" href="/news">
                            الأخبار
                        </Link>
                        <Link className="text-[#111813] text-sm font-medium leading-normal hover:text-primary transition-colors" href="/portal/tree">
                            شجرة العائلة
                        </Link>
                        <Link className="text-[#111813] text-sm font-medium leading-normal hover:text-primary transition-colors" href="/about">
                            عن العائلة
                        </Link>
                    </nav>

                    {/* Login Button */}
                    <Link
                        href="/portal/login"
                        className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-6 bg-primary hover:bg-green-600 text-white text-sm font-bold leading-normal tracking-[0.015em] transition-colors"
                    >
                        <span className="truncate">تسجيل الدخول</span>
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
