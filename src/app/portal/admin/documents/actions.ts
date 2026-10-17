"use server";

import { ActionError, safeAction, type ActionResult } from "@/lib/action-result";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { requireRole } from "@/lib/auth/current";
import { deleteFile, getFile, setFileVisibility, fileUrl } from "@/lib/files";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const text = (value: unknown, max: number) => (typeof value === "string" ? value.trim().slice(0, max) : "");

function refresh() {
    revalidatePath("/portal/admin/documents");
    revalidatePath("/council");
}

export interface DocumentInput {
    title: string;
    category: string;
    visibility: string;
}

function clean(input: DocumentInput) {
    const title = text(input.title, 200);
    if (!title) throw new ActionError("عنوان الوثيقة مطلوب");
    return {
        title,
        category: text(input.category, 50) || null,
        visibility: input.visibility === "public" ? ("public" as const) : ("members" as const),
    };
}

/** Registers an uploaded file (from /api/files) as a document. */
export async function createDocument(input: DocumentInput & { fileId: string }): Promise<ActionResult<{ id: string }>> {
    return safeAction(async () => {
        const me = await requireRole("admin", "editor");
        if (!UUID.test(input.fileId)) throw new ActionError("الملف غير صالح");
        const file = await getFile(input.fileId);
        if (!file) throw new ActionError("الملف غير موجود، أعد رفعه");
        const values = clean(input);
        await setFileVisibility(file.id, values.visibility);
        const [row] = await getDb()
            .insert(schema.documents)
            .values({
                ...values,
                fileId: file.id,
                fileUrl: fileUrl(file.id),
                fileName: file.name,
                mimeType: file.mimeType,
                sizeBytes: file.sizeBytes,
                uploadedBy: me.isDbUser ? me.userId : null,
            })
            .returning({ id: schema.documents.id });
        refresh();
        return { id: row.id };
    });
}

export async function updateDocument(id: string, input: DocumentInput): Promise<ActionResult<void>> {
    return safeAction(async () => {
        await requireRole("admin", "editor");
        if (!UUID.test(id)) throw new ActionError("معرّف غير صالح");
        const values = clean(input);
        const db = getDb();
        const [existing] = await db.select().from(schema.documents).where(eq(schema.documents.id, id));
        if (!existing) throw new ActionError("الوثيقة غير موجودة");
        // The charter is linked from the public council page, so it stays public.
        if (existing.isCharter && values.visibility !== "public") {
            throw new ActionError("الميثاق يجب أن يبقى عاماً لأنه منشور في صفحة المجلس");
        }
        await db.update(schema.documents).set(values).where(eq(schema.documents.id, id));
        if (existing.fileId) await setFileVisibility(existing.fileId, values.visibility);
        refresh();
    });
}

export async function deleteDocument(id: string): Promise<ActionResult<void>> {
    return safeAction(async () => {
        await requireRole("admin", "editor");
        if (!UUID.test(id)) throw new ActionError("معرّف غير صالح");
        const [row] = await getDb().delete(schema.documents).where(eq(schema.documents.id, id)).returning();
        if (row?.fileId) await deleteFile(row.fileId);
        refresh();
    });
}

/** Marks one document as the family charter (made public), or clears it with null. */
export async function setCharter(id: string | null): Promise<ActionResult<void>> {
    return safeAction(async () => {
        await requireRole("admin", "editor");
        if (id !== null && !UUID.test(id)) throw new ActionError("معرّف غير صالح");
        await getDb().transaction(async (tx) => {
            await tx.update(schema.documents).set({ isCharter: false }).where(eq(schema.documents.isCharter, true));
            if (id) {
                const [row] = await tx
                    .update(schema.documents)
                    .set({ isCharter: true, visibility: "public" })
                    .where(eq(schema.documents.id, id))
                    .returning();
                if (!row) throw new ActionError("الوثيقة غير موجودة");
                if (row.fileId) await tx.update(schema.files).set({ visibility: "public" }).where(eq(schema.files.id, row.fileId));
            }
        });
        refresh();
    });
}
