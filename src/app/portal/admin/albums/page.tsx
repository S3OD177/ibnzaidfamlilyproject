import type { Metadata } from "next";
import AlbumGrid from "@/components/albums/AlbumGrid";
import NewAlbumForm from "@/components/admin/albums/NewAlbumForm";
import { listAlbums } from "@/lib/data/albums";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "ألبومات الصور" };

export default async function AdminAlbumsPage() {
    const albums = await listAlbums();
    return (
        <div className="max-w-6xl mx-auto font-display space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-ink">ألبومات الصور</h1>
                    <p className="text-muted mt-1">ألبوم لكل مناسبة. الألبومات للعائلة فقط ما لم تجعلها عامة.</p>
                </div>
                <NewAlbumForm />
            </div>
            <AlbumGrid albums={albums} base="/portal/admin/albums" showVisibility />
        </div>
    );
}
