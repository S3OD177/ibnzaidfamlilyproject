import "server-only";
import { and, count, desc, eq, ilike, sql, type SQL } from "drizzle-orm";
import { getDb, schema } from "@/db";

export const DOCUMENT_CATEGORIES = ["وثائق رسمية", "ميثاق ولوائح", "محاضر اجتماعات", "تقارير", "صور ووسائط", "أخرى"] as const;

export interface DocumentRow {
    id: string;
    title: string;
    category: string | null;
    visibility: "public" | "members";
    isCharter: boolean;
    fileId: string | null;
    fileName: string | null;
    mimeType: string | null;
    sizeBytes: number | null;
    uploaderName: string | null;
    createdAt: string;
}

export async function listDocuments(filters: { q?: string; category?: string }): Promise<DocumentRow[]> {
    const conditions: SQL[] = [];
    if (filters.category) conditions.push(eq(schema.documents.category, filters.category));
    if (filters.q) conditions.push(ilike(schema.documents.title, `%${filters.q.replace(/[%_\\]/g, (c) => `\\${c}`)}%`));
    const rows = await getDb()
        .select({
            id: schema.documents.id,
            title: schema.documents.title,
            category: schema.documents.category,
            visibility: schema.documents.visibility,
            isCharter: schema.documents.isCharter,
            fileId: schema.documents.fileId,
            fileName: schema.documents.fileName,
            mimeType: schema.documents.mimeType,
            sizeBytes: schema.documents.sizeBytes,
            uploaderName: sql<string | null>`coalesce(${schema.users.displayName}, ${schema.users.username})`,
            createdAt: schema.documents.createdAt,
        })
        .from(schema.documents)
        .leftJoin(schema.users, eq(schema.documents.uploadedBy, schema.users.id))
        .where(conditions.length ? and(...conditions) : undefined)
        .orderBy(desc(schema.documents.isCharter), desc(schema.documents.createdAt));
    return rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }));
}

export async function documentStats() {
    const [row] = await getDb()
        .select({
            total: count(),
            images: sql<number>`count(*) filter (where ${schema.documents.mimeType} like 'image/%')::int`,
            categories: sql<number>`count(distinct ${schema.documents.category})::int`,
            bytes: sql<number>`coalesce(sum(${schema.documents.sizeBytes}), 0)::bigint`,
        })
        .from(schema.documents);
    return { ...row, bytes: Number(row.bytes) };
}

/** The document marked as the family charter, if any. */
export async function getCharter() {
    const [row] = await getDb()
        .select({ fileId: schema.documents.fileId, title: schema.documents.title, visibility: schema.documents.visibility })
        .from(schema.documents)
        .where(eq(schema.documents.isCharter, true))
        .limit(1);
    return row?.fileId ? row : null;
}
