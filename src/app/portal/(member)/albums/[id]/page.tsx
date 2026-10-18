import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AlbumView from "@/components/albums/AlbumView";
import { getAlbum } from "@/lib/data/albums";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "ألبوم صور" };

export default async function MemberAlbumPage({ params }: { params: Promise<{ id: string }> }) {
    const album = await getAlbum((await params).id);
    if (!album) notFound();
    return <AlbumView album={album} backHref="/portal/albums" />;
}
