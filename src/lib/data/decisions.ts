import "server-only";
import { and, desc, eq, ilike, or, sql, type SQL } from "drizzle-orm";
import { getDb, schema } from "@/db";

export const DECISION_TYPES = ["مالي", "إداري", "اجتماعي", "تعليمي", "تاريخي"] as const;

export const DECISION_STATES = {
    active: { label: "قرار ساري", className: "bg-green-100 text-green-700 border-green-200" },
    superseded: { label: "مستبدل بقرار لاحق", className: "bg-gray-100 text-gray-600 border-gray-200" },
    cancelled: { label: "ملغى", className: "bg-red-50 text-red-600 border-red-100" },
} as const;

export interface DecisionRow {
    id: string;
    referenceNumber: string | null;
    title: string;
    body: string | null;
    decisionType: string;
    hijriYear: number | null;
    keywords: string[];
    state: keyof typeof DECISION_STATES;
    issuedAt: string | null;
    attachmentFileId: string | null;
    attachmentName: string | null;
}

const columns = {
    id: schema.decisions.id,
    referenceNumber: schema.decisions.referenceNumber,
    title: schema.decisions.title,
    body: schema.decisions.body,
    decisionType: schema.decisions.decisionType,
    hijriYear: schema.decisions.hijriYear,
    keywords: schema.decisions.keywords,
    state: schema.decisions.state,
    issuedAt: schema.decisions.issuedAt,
    attachmentFileId: schema.decisions.attachmentFileId,
    attachmentName: schema.files.name,
};

export async function listDecisions(filters: { type?: string; year?: number; q?: string; state?: string }): Promise<DecisionRow[]> {
    const conditions: SQL[] = [];
    if (filters.type) conditions.push(eq(schema.decisions.decisionType, filters.type));
    if (filters.year) conditions.push(eq(schema.decisions.hijriYear, filters.year));
    if (filters.state && filters.state in DECISION_STATES) {
        conditions.push(eq(schema.decisions.state, filters.state as keyof typeof DECISION_STATES));
    }
    if (filters.q) {
        const pattern = `%${filters.q.replace(/[%_\\]/g, (c) => `\\${c}`)}%`;
        conditions.push(
            or(
                ilike(schema.decisions.title, pattern),
                ilike(schema.decisions.body, pattern),
                ilike(schema.decisions.referenceNumber, pattern),
                sql`array_to_string(${schema.decisions.keywords}, ' ') ilike ${pattern}`,
            )!,
        );
    }
    return getDb()
        .select(columns)
        .from(schema.decisions)
        .leftJoin(schema.files, eq(schema.decisions.attachmentFileId, schema.files.id))
        .where(conditions.length ? and(...conditions) : undefined)
        .orderBy(desc(schema.decisions.hijriYear), desc(schema.decisions.issuedAt), desc(schema.decisions.createdAt));
}

export async function getDecision(id: string): Promise<DecisionRow | null> {
    if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
    const [row] = await getDb()
        .select(columns)
        .from(schema.decisions)
        .leftJoin(schema.files, eq(schema.decisions.attachmentFileId, schema.files.id))
        .where(eq(schema.decisions.id, id));
    return row ?? null;
}

/** Most used keywords, for the quick filter chips. */
export async function topDecisionKeywords(limit = 6): Promise<string[]> {
    const rows = await getDb().execute<{ keyword: string }>(
        sql`select keyword from (select unnest(${schema.decisions.keywords}) as keyword from ${schema.decisions}) k
            group by keyword order by count(*) desc, keyword limit ${limit}`,
    );
    return rows.map((r) => r.keyword);
}
