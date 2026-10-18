"use server";

import { revalidatePath } from "next/cache";
import { and, eq, inArray } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { ActionError, safeAction, type ActionResult } from "@/lib/action-result";
import { requireRole } from "@/lib/auth/current";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

type Visibility = "public" | "members";
export interface AlbumInput {
    title: string;
    description?: string;
    eventDate?: string;
    visibility?: Visibility;
}

function clean(input: AlbumInput) {
    const title = input.title?.trim() ?? "";
    if (title.length < 2 || title.length > 150) throw new ActionError("عنوان الألبوم بين حرفين و150 حرفاً");
    return {
        title,
        description: input.description?.trim().slice(0, 1000) || null,
        eventDate: input.eventDate && /^\d{4}-\d{2}-\d{2}$/.test(input.eventDate) ? input.eventDate : null,
        visibility: (input.visibility === "public" ? "public" : "members") as Visibility,
    };
}

function refresh(albumId?: string) {
    revalidatePath("/portal/admin/albums");
    revalidatePath("/portal/albums");
    revalidatePath("/albums");
    if (albumId) {
        revalidatePath(`/portal/admin/albums/${albumId}`);
        revalidatePath(`/portal/albums/${albumId}`);
        revalidatePath(`/albums/${albumId}`);
    }
}

/** Photo files follow their album: a public album needs public files. */
async function syncFiles(albumId: string, visibility: Visibility) {
    const db = getDb();
    const photos = await db.select({ fileId: schema.albumPhotos.fileId }).from(schema.albumPhotos).where(eq(schema.albumPhotos.albumId, albumId));
    if (photos.length > 0) {
        await db.update(schema.files).set({ visibility }).where(inArray(schema.files.id, photos.map((p) => p.fileId)));
    }
}

export async function createAlbum(input: AlbumInput): Promise<ActionResult<{ id: string }>> {
    return safeAction(async () => {
        const me = await requireRole("admin", "editor");
        const [row] = await getDb()
            .insert(schema.albums)
            .values({ ...clean(input), createdBy: me.isDbUser ? me.userId : null })
            .returning({ id: schema.albums.id });
        refresh(row.id);
        return { id: row.id };
    });
}

export async function updateAlbum(id: string, input: AlbumInput): Promise<ActionResult<void>> {
    return safeAction(async () => {
        await requireRole("admin", "editor");
        if (!UUID.test(id)) throw new ActionError("معرّف غير صالح");
        const values = clean(input);
        const updated = await getDb().update(schema.albums).set(values).where(eq(schema.albums.id, id)).returning({ id: schema.albums.id });
        if (updated.length === 0) throw new ActionError("الألبوم غير موجود");
        await syncFiles(id, values.visibility);
        refresh(id);
    });
}

/** Deletes the album; its photos are removed with it (files go with the unused-file cleanup). */
export async function deleteAlbum(id: string): Promise<ActionResult<void>> {
    return safeAction(async () => {
        await requireRole("admin", "editor");
        if (!UUID.test(id)) throw new ActionError("معرّف غير صالح");
        await getDb().delete(schema.albums).where(eq(schema.albums.id, id));
        refresh(id);
    });
}

/** Adds uploaded image files (from /api/files) to an album. */
export async function addAlbumPhotos(albumId: string, fileIds: string[]): Promise<ActionResult<{ added: number }>> {
    return safeAction(async () => {
        await requireRole("admin", "editor");
        if (!UUID.test(albumId)) throw new ActionError("معرّف غير صالح");
        const ids = [...new Set(fileIds)].filter((f) => UUID.test(f)).slice(0, 200);
        if (ids.length === 0) throw new ActionError("لم تُرفع أي صورة");
        const db = getDb();
        const [album] = await db.select({ visibility: schema.albums.visibility }).from(schema.albums).where(eq(schema.albums.id, albumId));
        if (!album) throw new ActionError("الألبوم غير موجود");
        const images = await db
            .select({ id: schema.files.id })
            .from(schema.files)
            .where(and(inArray(schema.files.id, ids), inArray(schema.files.mimeType, IMAGE_TYPES)));
        if (images.length === 0) throw new ActionError("الملفات المرفوعة ليست صوراً");
        await db.insert(schema.albumPhotos).values(images.map((f) => ({ albumId, fileId: f.id })));
        await syncFiles(albumId, album.visibility);
        refresh(albumId);
        return { added: images.length };
    });
}

export async function removeAlbumPhoto(photoId: string): Promise<ActionResult<void>> {
    return safeAction(async () => {
        await requireRole("admin", "editor");
        if (!UUID.test(photoId)) throw new ActionError("معرّف غير صالح");
        const [row] = await getDb().delete(schema.albumPhotos).where(eq(schema.albumPhotos.id, photoId)).returning({ albumId: schema.albumPhotos.albumId, fileId: schema.albumPhotos.fileId });
        if (row) {
            await getDb()
                .update(schema.albums)
                .set({ coverFileId: null })
                .where(and(eq(schema.albums.id, row.albumId), eq(schema.albums.coverFileId, row.fileId)));
            refresh(row.albumId);
        }
    });
}

export async function setAlbumCover(albumId: string, fileId: string): Promise<ActionResult<void>> {
    return safeAction(async () => {
        await requireRole("admin", "editor");
        if (!UUID.test(albumId) || !UUID.test(fileId)) throw new ActionError("معرّف غير صالح");
        await getDb().update(schema.albums).set({ coverFileId: fileId }).where(eq(schema.albums.id, albumId));
        refresh(albumId);
    });
}
