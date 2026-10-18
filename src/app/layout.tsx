import type { Metadata, Viewport } from "next";
import "./globals.css";
import { getSiteSettings } from "@/lib/settings";
import { FeedbackHost } from "@/components/ui/feedback";

// Loaded via a stylesheet link instead of next/font/google: the build server
// receives Google font URLs that next/font cannot parse, which fails the build.
const fontsHref =
  "https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Cairo:wght@200..900&family=Newsreader:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&family=Noto+Naskh+Arabic:wght@400..700&display=swap";

const fontVariables = {
  "--font-cairo": "'Cairo'",
  "--font-newsreader": "'Newsreader'",
  "--font-naskh": "'Noto Naskh Arabic'",
} as React.CSSProperties;

export const viewport: Viewport = { themeColor: "#D4AF37" };

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteSettings();
  return {
    title: { default: site.siteName, template: `%s | ${site.siteName}` },
    description: site.tagline,
    appleWebApp: { capable: true, title: site.siteName, statusBarStyle: "default" },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* crossOrigin lets the tree export read and embed these fonts */}
        <link rel="stylesheet" href={fontsHref} crossOrigin="anonymous" />
      </head>
      <body
        style={fontVariables}
        className="font-sans antialiased bg-canvas text-ink"
      >
        {children}
        <FeedbackHost />
      </body>
    </html>
  );
}
