import "server-only";
import { desc, eq, ilike, or, sql } from "drizzle-orm";
import { getDb, schema } from "@/db";

export interface SearchResults {
    members: { id: string; name: string; detail: string | null }[];
    news: { id: string; title: string; status: string }[];
    decisions: { id: string; title: string; ref: string | null }[];
    documents: { id: string; title: string; fileId: string | null; category: string | null }[];
}

const LIMIT = 8;

/** Admin search across members, news, council decisions and documents. */
export async function searchAll(query: string): Promise<SearchResults> {
    const q = query.trim().slice(0, 100);
    if (q.length < 2) return { members: [], news: [], decisions: [], documents: [] };
    const pattern = `%${q.replace(/[%_\\]/g, (c) => `\\${c}`)}%`;
    const db = getDb();

    const [members, news, decisions, documents] = await Promise.all([
        db
            .select({
                id: schema.members.id,
                name: schema.members.fullName,
                detail: sql<string | null>`coalesce(${schema.members.councilRole}, ${schema.members.generationLabel}, ${schema.members.location})`,
            })
            .from(schema.members)
            .where(or(ilike(schema.members.fullName, pattern), ilike(schema.members.nickname, pattern), eq(schema.members.serialNumber, q)))
            .orderBy(schema.members.fullName)
            .limit(LIMIT),
        db
            .select({ id: schema.news.id, title: schema.news.title, status: schema.news.status })
            .from(schema.news)
            .where(or(ilike(schema.news.title, pattern), ilike(schema.news.excerpt, pattern)))
            .orderBy(desc(schema.news.updatedAt))
            .limit(LIMIT),
        db
            .select({ id: schema.decisions.id, title: schema.decisions.title, ref: schema.decisions.referenceNumber })
            .from(schema.decisions)
            .where(
                or(
                    ilike(schema.decisions.title, pattern),
                    ilike(schema.decisions.referenceNumber, pattern),
                    sql`array_to_string(${schema.decisions.keywords}, ' ') ilike ${pattern}`,
                ),
            )
            .orderBy(desc(schema.decisions.createdAt))
            .limit(LIMIT),
        db
            .select({ id: schema.documents.id, title: schema.documents.title, fileId: schema.documents.fileId, category: schema.documents.category })
            .from(schema.documents)
            .where(or(ilike(schema.documents.title, pattern), ilike(schema.documents.fileName, pattern)))
            .orderBy(desc(schema.documents.createdAt))
            .limit(LIMIT),
    ]);
    return { members, news, decisions, documents };
}
