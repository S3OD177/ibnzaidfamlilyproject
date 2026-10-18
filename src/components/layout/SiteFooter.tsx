import Link from "next/link";
import { Mail, MessageCircle, Twitter } from "lucide-react";
import { Emblem, Ornament } from "@/components/heritage/Ornament";
import { getSiteSettings } from "@/lib/settings";

// Shared footer for every public page; texts and contact channels come from the site settings.
export async function SiteFooter() {
    const site = await getSiteSettings();
    const year = new Date().getFullYear();
    const links = [
        { href: "/about", label: "عن العائلة" },
        { href: "/council", label: "مجلس العائلة" },
        { href: "/news", label: "الأخبار" },
        { href: "/albums", label: "ألبومات الصور" },
        { href: "/join", label: "طلب انضمام" },
        { href: "/portal", label: "بوابة الأعضاء" },
    ];

    return (
        <footer className="relative overflow-hidden bg-deep text-white/75 mt-auto font-body">
            <div className="absolute inset-0 heritage-pattern opacity-[0.06]" />
            <div className="relative max-w-[1280px] mx-auto px-4 sm:px-8 pt-14 pb-8">
                <div className="flex flex-col items-center text-center gap-4">
                    <Emblem className="w-12 h-12" />
                    <p className="font-heritage font-bold text-3xl text-primary">{site.siteName}</p>
                    {site.tagline && <p className="text-white/70 font-naskh">{site.tagline}</p>}
                    <Ornament light className="mt-1" />
                </div>

                <nav className="flex flex-wrap justify-center gap-x-8 gap-y-3 mt-8 text-sm" aria-label="روابط الموقع">
                    {links.map((l) => (
                        <Link key={l.href} href={l.href} className="hover:text-primary transition-colors">{l.label}</Link>
                    ))}
                </nav>

                {(site.xHandle || site.whatsapp || site.contactEmail) && (
                    <div className="flex justify-center gap-3 mt-8">
                        {site.xHandle && (
                            <a href={`https://x.com/${site.xHandle}`} target="_blank" rel="noopener" aria-label="منصة X" className="size-10 rounded-full border border-primary/30 flex items-center justify-center text-primary hover:bg-primary hover:text-deep transition-colors">
                                <Twitter className="w-4 h-4" />
                            </a>
                        )}
                        {site.whatsapp && (
                            <a href={`https://wa.me/${site.whatsapp}`} target="_blank" rel="noopener" aria-label="واتساب" className="size-10 rounded-full border border-primary/30 flex items-center justify-center text-primary hover:bg-primary hover:text-deep transition-colors">
                                <MessageCircle className="w-4 h-4" />
                            </a>
                        )}
                        {site.contactEmail && (
                            <a href={`mailto:${site.contactEmail}`} aria-label="البريد الإلكتروني" className="size-10 rounded-full border border-primary/30 flex items-center justify-center text-primary hover:bg-primary hover:text-deep transition-colors">
                                <Mail className="w-4 h-4" />
                            </a>
                        )}
                    </div>
                )}

                <p className="text-center text-xs leading-relaxed text-white/50 font-naskh border-t border-white/10 mt-10 pt-6">
                    جميع الحقوق محفوظة لـ{site.siteName} © {year}.{site.footerText ? ` ${site.footerText}` : ""}
                </p>
            </div>
        </footer>
    );
}
