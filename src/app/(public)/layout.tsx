import { Header } from "@/components/layout/Header";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { getSiteSettings } from "@/lib/settings";

export default async function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const site = await getSiteSettings();
    return (
        <div className="min-h-screen flex flex-col bg-cream font-body">
            <Header siteName={site.siteName} />
            {children}
            <SiteFooter />
        </div>
    );
}
