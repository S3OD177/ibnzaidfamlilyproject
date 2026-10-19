import type { Metadata } from "next";
import { headers } from "next/headers";
import QRCode from "qrcode";
import { getSiteSettings } from "@/lib/settings";
import { DEMO_ACCOUNTS, isDemoLoginEnabled } from "@/lib/auth/session";
import { Emblem, Ornament } from "@/components/heritage/Ornament";
import DemoButtons from "./DemoButtons";

// Full-screen page for the projector at family gatherings. Public, not linked from the nav.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "عرض المنصة",
    robots: { index: false, follow: false },
};

/** The site's public address: SITE_URL / NEXT_PUBLIC_SITE_URL, or the address of this request. */
async function siteUrl(): Promise<string> {
    const fromEnv = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL;
    if (fromEnv) return fromEnv.replace(/\/$/, "");
    const h = await headers();
    const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
    const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
    return `${proto}://${host}`;
}

export default async function PresentPage({ searchParams }: { searchParams: Promise<{ qr?: string | string[] }> }) {
    const [{ qr }, site, base] = await Promise.all([searchParams, getSiteSettings(), siteUrl()]);
    const toPortal = qr === "portal";
    const target = toPortal ? `${base}/portal/login` : base;
    const svg = await QRCode.toString(target, {
        type: "svg",
        errorCorrectionLevel: "M",
        margin: 1,
        color: { dark: "#102210", light: "#ffffff" },
    });
    const displayUrl = target.replace(/^https?:\/\//, "");
    const demo = isDemoLoginEnabled();

    return (
        <main className="relative min-h-screen bg-deep text-cream overflow-hidden flex flex-col items-center justify-center px-4 py-8 sm:px-8">
            <div className="absolute inset-0 heritage-pattern opacity-[0.12]" aria-hidden />

            <div className="relative w-full max-w-6xl flex flex-col items-center gap-6 lg:gap-8">
                <header className="flex flex-col items-center gap-3 text-center">
                    <Emblem className="w-16 h-16 lg:w-20 lg:h-20" />
                    <h1 className="font-heritage text-5xl sm:text-6xl lg:text-7xl font-bold text-primary leading-tight">{site.siteName}</h1>
                    {site.tagline && <p className="text-lg sm:text-2xl text-cream/80">{site.tagline}</p>}
                    <Ornament light className="mt-1" />
                </header>

                <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-14 w-full">
                    <div className="flex flex-col items-center gap-4">
                        <div
                            className="bg-white rounded-3xl p-4 sm:p-5 shadow-2xl ring-4 ring-primary/60 w-[min(78vw,420px)] lg:w-[min(42vh,460px)] [&>svg]:w-full [&>svg]:h-auto [&>svg]:block"
                            role="img"
                            aria-label={`رمز QR للعنوان ${displayUrl}`}
                            dangerouslySetInnerHTML={{ __html: svg }}
                        />
                        <p className="text-lg sm:text-xl text-cream/80">
                            {toPortal ? "امسح الرمز للدخول إلى البوابة" : "امسح الرمز بكاميرا جوالك"}
                        </p>
                    </div>

                    <div className="flex flex-col items-center lg:items-start gap-6 text-center lg:text-start max-w-xl">
                        <div>
                            <p className="text-cream/70 text-lg mb-2">أو اكتب العنوان:</p>
                            <p dir="ltr" className="font-mono font-bold text-primary text-2xl sm:text-3xl lg:text-4xl break-all leading-snug">
                                {displayUrl}
                            </p>
                        </div>
                        {demo && <DemoButtons accounts={DEMO_ACCOUNTS} />}
                    </div>
                </div>
            </div>
        </main>
    );
}
