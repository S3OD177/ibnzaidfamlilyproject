import Link from "next/link";
import { CalendarDays, Images, Lock } from "lucide-react";
import { formatHijri } from "@/lib/dates";
import type { AlbumSummary } from "@/lib/data/albums";

/** Album cards linking to `${base}/<id>`. */
export default function AlbumGrid({ albums, base, showVisibility = false }: { albums: AlbumSummary[]; base: string; showVisibility?: boolean }) {
    if (albums.length === 0) {
        return <p className="text-center text-muted py-16 bg-white rounded-2xl border border-dashed border-sand">لا توجد ألبومات بعد.</p>;
    }
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {albums.map((album) => (
                <Link key={album.id} href={`${base}/${album.id}`} className="group bg-white rounded-2xl border border-sand overflow-hidden hover:border-primary hover:shadow-lg hover:shadow-deep/5 transition-all">
                    <div className="relative aspect-[4/3] bg-deep overflow-hidden">
                        {album.coverUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={album.coverUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                            <div className="absolute inset-0 heritage-pattern opacity-20" />
                        )}
                        <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 bg-deep/80 text-primary text-xs font-bold px-2.5 py-1 rounded-full">
                            <Images className="w-3.5 h-3.5" />
                            {album.photoCount}
                        </span>
                        {showVisibility && album.visibility === "members" && (
                            <span className="absolute top-3 right-3 inline-flex items-center gap-1 bg-white/90 text-deep text-[11px] font-bold px-2 py-1 rounded-full">
                                <Lock className="w-3 h-3" />
                                للعائلة
                            </span>
                        )}
                    </div>
                    <div className="p-4">
                        <h3 className="font-heritage font-bold text-2xl text-deep leading-snug group-hover:text-primary-dark transition-colors">{album.title}</h3>
                        {album.eventDate && (
                            <p className="flex items-center gap-1 text-xs text-muted mt-1">
                                <CalendarDays className="w-3.5 h-3.5" />
                                {formatHijri(album.eventDate)}
                            </p>
                        )}
                    </div>
                </Link>
            ))}
        </div>
    );
}
