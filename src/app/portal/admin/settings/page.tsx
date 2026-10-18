import Link from "next/link";
import { redirect } from "next/navigation";
import { ExternalLink, Settings } from "lucide-react";
import { AboutContentForm, SiteSettingsForm } from "@/components/admin/settings/SettingsForms";
import { getSession } from "@/lib/auth/current";
import { getAboutContent, getSiteSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
    const session = await getSession();
    if (session?.role !== "admin") redirect("/portal/admin");
    const [site, about] = await Promise.all([getSiteSettings(), getAboutContent()]);

    return (
        <div className="max-w-5xl mx-auto font-display space-y-8 pb-16">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-ink mb-2 flex items-center gap-3">
                        <Settings className="w-7 h-7 text-primary" />
                        إعدادات المنصة
                    </h2>
                    <p className="text-gray-500 max-w-2xl">اسم الموقع ومعلومات التواصل ونصوص صفحة «عن العائلة». تظهر التغييرات في الموقع فور الحفظ.</p>
                </div>
                <div className="flex gap-4 text-sm font-bold">
                    <Link href="/" target="_blank" className="flex items-center gap-1 text-primary hover:underline"><ExternalLink className="w-4 h-4" />الرئيسية</Link>
                    <Link href="/about" target="_blank" className="flex items-center gap-1 text-primary hover:underline"><ExternalLink className="w-4 h-4" />عن العائلة</Link>
                </div>
            </div>
            <SiteSettingsForm initial={site} />
            <AboutContentForm initial={about} />
        </div>
    );
}
