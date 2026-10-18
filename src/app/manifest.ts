import type { MetadataRoute } from "next";
import { getSiteSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

// Lets members add the site to their phone's home screen and open it like an app.
export default async function manifest(): Promise<MetadataRoute.Manifest> {
    const site = await getSiteSettings();
    return {
        name: site.siteName,
        short_name: site.siteName,
        description: site.tagline,
        lang: "ar",
        dir: "rtl",
        start_url: "/portal",
        scope: "/",
        display: "standalone",
        background_color: "#f6f8f7",
        theme_color: "#D4AF37",
        icons: [
            { src: "/pwa-icon/192", sizes: "192x192", type: "image/png", purpose: "maskable" },
            { src: "/pwa-icon/512", sizes: "512x512", type: "image/png", purpose: "maskable" },
            { src: "/icon", sizes: "64x64", type: "image/png", purpose: "any" },
        ],
    };
}
