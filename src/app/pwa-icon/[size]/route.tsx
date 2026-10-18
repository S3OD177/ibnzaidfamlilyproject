import { brandIcon } from "@/lib/brand-icon";

// Home-screen icons listed in the web app manifest: /pwa-icon/192 and /pwa-icon/512.
export async function GET(_request: Request, { params }: { params: Promise<{ size: string }> }) {
    const { size } = await params;
    const px = size === "512" ? 512 : 192;
    return brandIcon(px, { padded: true });
}
