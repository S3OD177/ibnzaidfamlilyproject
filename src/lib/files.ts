import "server-only";
import { eq, sql } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { ActionError } from "@/lib/action-result";

// The only module that touches file contents. Files live in Postgres (files table) for
// now; switching to a storage bucket later only changes this file. URLs stay /files/<id>.

export type Visibility = "public" | "members";

export const MAX_FILE_BYTES = 15 * 1024 * 1024;
/** Audio and video files may be larger. */
export const MAX_MEDIA_BYTES = 50 * 1024 * 1024;

export const isMediaType = (mimeType: string) => /^(audio|video)\//.test(mimeType);
export const maxBytesFor = (mimeType: string) => (isMediaType(mimeType) ? MAX_MEDIA_BYTES : MAX_FILE_BYTES);

// Allowed uploads. No SVG or HTML: they can run scripts when opened from our domain.
export const ALLOWED_TYPES: Record<string, { label: string; inline: boolean }> = {
    "application/pdf": { label: "PDF", inline: true },
    "image/jpeg": { label: "صورة", inline: true },
    "image/png": { label: "صورة", inline: true },
    "image/webp": { label: "صورة", inline: true },
    "image/gif": { label: "صورة", inline: true },
    "application/msword": { label: "Word", inline: false },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": { label: "Word", inline: false },
    "application/vnd.ms-excel": { label: "Excel", inline: false },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": { label: "Excel", inline: false },
    "application/vnd.ms-powerpoint": { label: "PowerPoint", inline: false },
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": { label: "PowerPoint", inline: false },
    "audio/mpeg": { label: "صوت", inline: true },
    "audio/mp4": { label: "صوت", inline: true },
    "audio/x-m4a": { label: "صوت", inline: true },
    "audio/aac": { label: "صوت", inline: true },
    "audio/wav": { label: "صوت", inline: true },
    "audio/ogg": { label: "صوت", inline: true },
    "audio/webm": { label: "صوت", inline: true },
    "video/mp4": { label: "فيديو", inline: true },
    "video/webm": { label: "فيديو", inline: true },
    "video/quicktime": { label: "فيديو", inline: true },
};

export const fileUrl = (id: string) => `/files/${id}`;

export async function storeFile(input: {
    name: string;
    mimeType: string;
    data: Buffer;
    visibility: Visibility;
    uploadedBy?: string | null;
}): Promise<{ id: string; url: string; sizeBytes: number }> {
    if (!ALLOWED_TYPES[input.mimeType]) throw new ActionError("نوع الملف غير مسموح (PDF أو صور أو مستندات Office أو تسجيلات صوت وفيديو)");
    if (input.data.length === 0) throw new ActionError("الملف فارغ");
    const maxBytes = maxBytesFor(input.mimeType);
    if (input.data.length > maxBytes) throw new ActionError(`حجم الملف يتجاوز ${maxBytes / 1024 / 1024} ميجابايت`);

    const name = input.name.replace(/[\\/\r\n"]/g, "_").slice(0, 200) || "file";
    const [row] = await getDb()
        .insert(schema.files)
        .values({
            name,
            mimeType: input.mimeType,
            sizeBytes: input.data.length,
            data: input.data,
            visibility: input.visibility,
            uploadedBy: input.uploadedBy ?? null,
        })
        .returning({ id: schema.files.id });
    return { id: row.id, url: fileUrl(row.id), sizeBytes: input.data.length };
}

export async function getFile(id: string) {
    if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
    const [row] = await getDb().select().from(schema.files).where(eq(schema.files.id, id));
    return row ?? null;
}

export async function setFileVisibility(id: string, visibility: Visibility) {
    await getDb().update(schema.files).set({ visibility }).where(eq(schema.files.id, id));
}

export async function deleteFile(id: string) {
    await getDb().delete(schema.files).where(eq(schema.files.id, id));
}

const ORPHAN_AGE = "24 hours";
const CLEANUP_EVERY_MS = 60 * 60 * 1000;
let lastCleanup = 0;

/**
 * Deletes uploaded files that nothing points to: picked in a form that was never saved,
 * or replaced by a newer photo or cover. Recent files are kept, since a form may still
 * be open with them. Runs at most once an hour per server; returns how many went.
 */
export async function deleteOrphanFiles({ force = false } = {}): Promise<number> {
    if (!force && Date.now() - lastCleanup < CLEANUP_EVERY_MS) return 0;
    lastCleanup = Date.now();
    const rows = await getDb().execute(sql`
        delete from files f
        where f.created_at < now() - interval '${sql.raw(ORPHAN_AGE)}'
          and not exists (select 1 from documents d where d.file_id = f.id)
          and not exists (select 1 from decisions d where d.attachment_file_id = f.id)
          and not exists (
              select 1 from members m where m.photo_url = '/files/' || f.id::text
          )
          and not exists (
              select 1 from news n
              where n.cover_url = '/files/' || f.id::text
                 or n.content like '%/files/' || f.id::text || '%'
          )
          and not exists (
              select 1 from timeline_events t where t.image_url = '/files/' || f.id::text
          )
          and not exists (
              select 1 from decisions d where d.body like '%/files/' || f.id::text || '%'
          )
          and not exists (select 1 from fund_entries e where e.receipt_file_id = f.id)
          and not exists (select 1 from album_photos p where p.file_id = f.id)
          and not exists (select 1 from albums a where a.cover_file_id = f.id)
          and not exists (select 1 from occasions o where o.photo_url = '/files/' || f.id::text)
          and not exists (
              select 1 from member_change_requests r
              where r.status = 'pending' and r.changes::text like '%/files/' || f.id::text || '%'
          )
          and not exists (
              select 1 from settings s where s.value::text like '%/files/' || f.id::text || '%'
          )
        returning f.id
    `);
    return rows.length;
}

const DATA_URL = /^data:(image\/(?:png|jpeg|webp|gif));base64,([A-Za-z0-9+/=]+)$/;

/**
 * Normalises an image field from a form: a data: URL (from the image picker) is stored
 * as a public file and replaced by its /files/ URL; an existing /files/ URL is kept;
 * anything else is dropped.
 */
export async function persistImage(value: unknown, uploadedBy?: string | null): Promise<string | null> {
    if (typeof value !== "string" || !value) return null;
    if (/^\/files\/[0-9a-f-]{36}$/i.test(value)) return value;
    const match = DATA_URL.exec(value);
    if (!match) return null;
    const ext = match[1].split("/")[1];
    const { url } = await storeFile({
        name: `image.${ext}`,
        mimeType: match[1],
        data: Buffer.from(match[2], "base64"),
        visibility: "public",
        uploadedBy,
    });
    return url;
}

export function formatBytes(bytes: number) {
    if (bytes < 1024) return `${bytes} بايت`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} ك.ب`;
    return `${(bytes / 1024 / 1024).toFixed(1)} م.ب`;
}
