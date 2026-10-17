import Link from "next/link";
import { Users } from "lucide-react";
import { getSiteSettings } from "@/lib/settings";

// Shared footer for every public page; texts come from the site settings.
export async function SiteFooter() {
    const site = await getSiteSettings();
    const year = new Date().getFullYear();

    return (
        <footer className="bg-[#102210] text-white/80 py-12 mt-auto font-body">
            <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-b border-white/10 pb-8 mb-8">
                    <div className="flex items-center gap-3">
                        <div className="size-8 rounded bg-primary/20 flex items-center justify-center text-primary">
                            <Users className="w-5 h-5" />
                        </div>
                        <span className="font-display text-lg font-bold text-white">{site.siteName}</span>
                    </div>
                    <nav className="flex flex-wrap justify-center gap-6 text-sm font-medium">
                        <Link className="hover:text-white transition-colors" href="/about">عن العائلة</Link>
                        <Link className="hover:text-white transition-colors" href="/council">المجلس</Link>
                        <Link className="hover:text-white transition-colors" href="/news">الأخبار</Link>
                        <Link className="hover:text-white transition-colors" href="/join">طلب انضمام</Link>
                        <Link className="hover:text-white transition-colors" href="/#contact">اتصل بنا</Link>
                    </nav>
                </div>
                <div className="text-center md:text-right">
                    <p className="text-xs leading-relaxed text-white/60 font-naskh">
                        جميع الحقوق محفوظة لـ{site.siteName} © {year}.{site.footerText ? ` ${site.footerText}` : ""}
                    </p>
                </div>
            </div>
        </footer>
    );
}
