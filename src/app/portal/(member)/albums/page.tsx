import type { Metadata } from "next";
import AlbumGrid from "@/components/albums/AlbumGrid";
import { listAlbums } from "@/lib/data/albums";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "ألبومات الصور" };

export default async function MemberAlbumsPage() {
    const albums = await listAlbums();
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl">ألبومات الصور</h1>
                <p className="text-sm text-gray-500 mt-1">صور مناسبات العائلة واجتماعاتها.</p>
            </div>
            <AlbumGrid albums={albums} base="/portal/albums" />
        </div>
    );
}
