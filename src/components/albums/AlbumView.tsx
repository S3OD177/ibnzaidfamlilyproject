import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
import PhotoGallery from "./PhotoGallery";
import WhatsAppShare from "@/components/common/WhatsAppShare";
import { formatHijri } from "@/lib/dates";
import type { AlbumPhoto, AlbumSummary } from "@/lib/data/albums";

/** One album's heading and photos, used by the portal and the public site. */
export default function AlbumView({ album, backHref }: { album: AlbumSummary & { photos: AlbumPhoto[] }; backHref: string }) {
    return (
        <div className="space-y-6">
            <Link href={backHref} className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-ink">
                <ArrowRight className="w-4 h-4" />
                كل الألبومات
            </Link>
            <div>
                <h1 className="font-heritage text-4xl font-bold text-deep">{album.title}</h1>
                <p className="flex flex-wrap items-center gap-3 text-sm text-muted mt-2">
                    {album.eventDate && (
                        <span className="flex items-center gap-1">
                            <CalendarDays className="w-4 h-4" />
                            {formatHijri(album.eventDate)}
                        </span>
                    )}
                    <span>{album.photos.length} صورة</span>
                </p>
                {album.description && <p className="text-gray-600 mt-3 leading-relaxed font-naskh max-w-3xl">{album.description}</p>}
                <WhatsAppShare text={`ألبوم صور: ${album.title}`} className="mt-3" />
            </div>
            <PhotoGallery photos={album.photos} />
        </div>
    );
}
