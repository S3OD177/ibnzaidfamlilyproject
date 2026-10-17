import "server-only";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { ActionError } from "@/lib/action-result";

// The only module that touches file contents. Files live in Postgres (files table) for
// now; switching to a storage bucket later only changes this file. URLs stay /files/<id>.

export type Visibility = "public" | "members";

export const MAX_FILE_BYTES = 15 * 1024 * 1024;

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
};

export const fileUrl = (id: string) => `/files/${id}`;

export async function storeFile(input: {
    name: string;
    mimeType: string;
    data: Buffer;
    visibility: Visibility;
    uploadedBy?: string | null;
}): Promise<{ id: string; url: string; sizeBytes: number }> {
    if (!ALLOWED_TYPES[input.mimeType]) throw new ActionError("نوع الملف غير مسموح (PDF أو صور أو مستندات Office)");
    if (input.data.length === 0) throw new ActionError("الملف فارغ");
    if (input.data.length > MAX_FILE_BYTES) throw new ActionError("حجم الملف يتجاوز 15 ميجابايت");

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
