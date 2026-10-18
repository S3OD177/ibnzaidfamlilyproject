import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AlbumView from "@/components/albums/AlbumView";
import { getAlbum } from "@/lib/data/albums";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "ألبوم صور" };

// Only albums staff made public; family albums live in the members' portal.
export default async function PublicAlbumPage({ params }: { params: Promise<{ id: string }> }) {
    const album = await getAlbum((await params).id, { publicOnly: true });
    if (!album) notFound();
    return (
        <main className="flex-grow max-w-6xl w-full mx-auto px-4 py-10">
            <AlbumView album={album} backHref="/albums" />
        </main>
    );
}
