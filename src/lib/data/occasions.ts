import "server-only";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { getDb, schema } from "@/db";
import type { OccasionView } from "@/lib/occasions";

/**
 * Happy news with their congratulations. "viewerKey" marks which ones the viewer has
 * already congratulated. publicOnly limits to posts staff made public.
 */
export async function listOccasions(options: {
    status?: OccasionView["status"];
    publicOnly?: boolean;
    limit?: number;
    viewerKey?: string | null;
}): Promise<OccasionView[]> {
    const db = getDb();
    const conditions = [eq(schema.occasions.status, options.status ?? "approved")];
    if (options.publicOnly) conditions.push(eq(schema.occasions.visibility, "public"));

    const rows = await db
        .select({
            occasion: schema.occasions,
            memberName: schema.members.fullName,
        })
        .from(schema.occasions)
        .leftJoin(schema.members, eq(schema.occasions.memberId, schema.members.id))
        .where(and(...conditions))
        .orderBy(desc(sql`coalesce(${schema.occasions.occasionDate}, ${schema.occasions.createdAt}::date)`), desc(schema.occasions.createdAt))
        .limit(options.limit ?? 60);
    if (rows.length === 0) return [];

    const congrats = await db
        .select()
        .from(schema.occasionCongrats)
        .where(inArray(schema.occasionCongrats.occasionId, rows.map((r) => r.occasion.id)))
        .orderBy(schema.occasionCongrats.createdAt);
    const byOccasion = new Map<string, typeof congrats>();
    for (const c of congrats) byOccasion.set(c.occasionId, [...(byOccasion.get(c.occasionId) ?? []), c]);

    return rows.map(({ occasion: o, memberName }) => {
        const list = byOccasion.get(o.id) ?? [];
        return {
            id: o.id,
            type: o.type,
            title: o.title,
            message: o.message,
            occasionDate: o.occasionDate,
            memberId: o.memberId,
            memberName: memberName ?? null,
            photoUrl: o.photoUrl,
            visibility: o.visibility,
            status: o.status,
            submitterName: o.submitterName,
            createdAt: o.createdAt.toISOString(),
            congrats: list.map((c) => ({ name: c.authorName, message: c.message })),
            congratulated: Boolean(options.viewerKey && list.some((c) => c.authorKey === options.viewerKey)),
        };
    });
}

export async function countPendingOccasions(): Promise<number> {
    const [row] = await getDb()
        .select({ n: sql<number>`count(*)::int` })
        .from(schema.occasions)
        .where(eq(schema.occasions.status, "pending"));
    return row?.n ?? 0;
}
