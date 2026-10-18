import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ExternalLink } from "lucide-react";
import AlbumEditor from "@/components/admin/albums/AlbumEditor";
import { getAlbum } from "@/lib/data/albums";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "تعديل ألبوم" };

export default async function AdminAlbumPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const album = await getAlbum(id);
    if (!album) notFound();
    return (
        <div className="max-w-6xl mx-auto font-display space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <Link href="/portal/admin/albums" className="inline-flex items-center gap-2 text-sm font-bold text-muted hover:text-ink">
                    <ArrowRight className="w-4 h-4" />
                    كل الألبومات
                </Link>
                <Link href={`/portal/albums/${album.id}`} target="_blank" className="inline-flex items-center gap-1.5 text-sm font-bold text-primary-dark hover:underline">
                    <ExternalLink className="w-4 h-4" />
                    عرض كما يراه الأعضاء
                </Link>
            </div>
            <h1 className="text-3xl font-black text-ink">{album.title}</h1>
            <AlbumEditor
                album={{
                    id: album.id,
                    title: album.title,
                    description: album.description ?? "",
                    eventDate: album.eventDate ?? "",
                    visibility: album.visibility,
                    coverFileId: album.coverFileId,
                    photos: album.photos,
                }}
            />
        </div>
    );
}
