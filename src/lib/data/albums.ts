import "server-only";
import { and, asc, desc, eq, sql } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { fileUrl } from "@/lib/files";

export interface AlbumSummary {
    id: string;
    title: string;
    description: string | null;
    eventDate: string | null;
    visibility: "public" | "members";
    coverUrl: string | null;
    photoCount: number;
}

export interface AlbumPhoto {
    id: string;
    fileId: string;
    url: string;
    caption: string | null;
}

const firstPhoto = sql<string | null>`(
    select p.file_id::text from album_photos p where p.album_id = ${schema.albums.id} order by p.created_at limit 1
)`;
const photoCount = sql<number>`(select count(*)::int from album_photos p where p.album_id = ${schema.albums.id})`;

/** Albums newest first; publicOnly keeps the ones staff made public. */
export async function listAlbums({ publicOnly = false, limit = 100 } = {}): Promise<AlbumSummary[]> {
    const rows = await getDb()
        .select({
            id: schema.albums.id,
            title: schema.albums.title,
            description: schema.albums.description,
            eventDate: schema.albums.eventDate,
            visibility: schema.albums.visibility,
            coverFileId: schema.albums.coverFileId,
            firstPhoto,
            photoCount,
        })
        .from(schema.albums)
        .where(publicOnly ? eq(schema.albums.visibility, "public") : undefined)
        .orderBy(desc(sql`coalesce(${schema.albums.eventDate}, ${schema.albums.createdAt}::date)`))
        .limit(limit);
    return rows.map(({ coverFileId, firstPhoto: first, ...album }) => {
        const cover = coverFileId ?? first;
        return { ...album, coverUrl: cover ? fileUrl(cover) : null };
    });
}

export async function getAlbum(id: string, { publicOnly = false } = {}): Promise<(AlbumSummary & { photos: AlbumPhoto[]; coverFileId: string | null }) | null> {
    if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
    const db = getDb();
    const [album] = await db
        .select()
        .from(schema.albums)
        .where(publicOnly ? and(eq(schema.albums.id, id), eq(schema.albums.visibility, "public")) : eq(schema.albums.id, id));
    if (!album) return null;
    const photos = await db
        .select({ id: schema.albumPhotos.id, fileId: schema.albumPhotos.fileId, caption: schema.albumPhotos.caption })
        .from(schema.albumPhotos)
        .where(eq(schema.albumPhotos.albumId, id))
        .orderBy(asc(schema.albumPhotos.createdAt));
    const cover = album.coverFileId ?? photos[0]?.fileId ?? null;
    return {
        id: album.id,
        title: album.title,
        description: album.description,
        eventDate: album.eventDate,
        visibility: album.visibility,
        coverFileId: album.coverFileId,
        coverUrl: cover ? fileUrl(cover) : null,
        photoCount: photos.length,
        photos: photos.map((p) => ({ ...p, url: fileUrl(p.fileId) })),
    };
}
