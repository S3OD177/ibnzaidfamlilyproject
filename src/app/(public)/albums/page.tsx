import type { Metadata } from "next";
import { PageHero } from "@/components/heritage/PageHero";
import AlbumGrid from "@/components/albums/AlbumGrid";
import { listAlbums } from "@/lib/data/albums";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "ألبومات الصور" };

export default async function PublicAlbumsPage() {
    const albums = await listAlbums({ publicOnly: true });
    return (
        <main className="flex-grow">
            <PageHero eyebrow="المركز الإعلامي" title="ألبومات الصور" subtitle="لقطات من مناسبات العائلة واجتماعاتها." />
            <div className="max-w-6xl mx-auto px-4 py-12">
                <AlbumGrid albums={albums} base="/albums" />
            </div>
        </main>
    );
}
