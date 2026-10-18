import "server-only";
import { and, count, desc, eq, gt, ilike, lte, or, sql, type SQL } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { formatDateBoth } from "@/lib/dates";

export type NewsRow = typeof schema.news.$inferSelect;
export type NewsStatusFilter = "all" | "published" | "draft" | "scheduled";

export const NEWS_CATEGORIES = ["إعلانات", "أخبار عائلية", "فعاليات", "مناسبات", "قصص نجاح", "تعميمات", "وفيات"] as const;

const CATEGORY_COLORS: Record<string, string> = {
    "قصص نجاح": "bg-primary/90",
    "إعلانات": "bg-blue-600/90",
    "فعاليات": "bg-orange-500/90",
    "مناسبات": "bg-purple-600/90",
    "تعميمات": "bg-amber-600/90",
    "وفيات": "bg-gray-600/90",
};
export function categoryColor(category: string) {
    return CATEGORY_COLORS[category] ?? "bg-primary/90";
}

export function formatNewsDate(date: Date | null) {
    return formatDateBoth(date);
}

/** Splits stored plain text into paragraphs on blank lines. */
export function toParagraphs(text: string | null) {
    return (text ?? "").split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
}

// Published and not scheduled for later.
const isLive = () => and(eq(schema.news.status, "published"), lte(schema.news.publishedAt, sql`now()`));

export const PAGE_SIZE = 10;

export async function listPublishedNews(filters: { q?: string; category?: string; year?: number; page?: number }) {
    const conditions: SQL[] = [isLive()!];
    if (filters.q) {
        const pattern = `%${filters.q.replace(/[%_\\]/g, (c) => `\\${c}`)}%`;
        conditions.push(or(ilike(schema.news.title, pattern), ilike(schema.news.excerpt, pattern), ilike(schema.news.content, pattern))!);
    }
    if (filters.category) conditions.push(eq(schema.news.category, filters.category));
    if (filters.year) conditions.push(sql`extract(year from ${schema.news.publishedAt}) = ${filters.year}`);

    const where = and(...conditions);
    const page = Math.max(1, filters.page ?? 1);
    const db = getDb();
    const [items, [{ total }]] = await Promise.all([
        db
            .select()
            .from(schema.news)
            .where(where)
            .orderBy(desc(schema.news.publishedAt))
            .limit(PAGE_SIZE)
            .offset((page - 1) * PAGE_SIZE),
        db.select({ total: count() }).from(schema.news).where(where),
    ]);
    return { items, total, page, pages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

/** Years that have published news, newest first (for the archive filter). */
export async function listNewsYears(): Promise<number[]> {
    const rows = await getDb()
        .selectDistinct({ year: sql<number>`extract(year from ${schema.news.publishedAt})::int` })
        .from(schema.news)
        .where(isLive());
    return rows.map((r) => r.year).filter(Boolean).sort((a, b) => b - a);
}

export async function latestNews(limit: number) {
    return getDb().select().from(schema.news).where(isLive()).orderBy(desc(schema.news.publishedAt)).limit(limit);
}

export async function getPublishedNewsBySlug(slug: string) {
    const [row] = await getDb().select().from(schema.news).where(and(eq(schema.news.slug, slug), isLive()));
    return row ?? null;
}

// ---------- Admin ----------

export function newsStatus(row: Pick<NewsRow, "status" | "publishedAt">): Exclude<NewsStatusFilter, "all"> | "archived" {
    if (row.status === "published" && row.publishedAt && row.publishedAt > new Date()) return "scheduled";
    return row.status;
}

export async function adminListNews(filter: NewsStatusFilter, q?: string) {
    const conditions: SQL[] = [];
    if (filter === "draft") conditions.push(eq(schema.news.status, "draft"));
    if (filter === "published") conditions.push(isLive()!);
    if (filter === "scheduled") conditions.push(and(eq(schema.news.status, "published"), gt(schema.news.publishedAt, sql`now()`))!);
    if (q) conditions.push(ilike(schema.news.title, `%${q.replace(/[%_\\]/g, (c) => `\\${c}`)}%`));

    const db = getDb();
    const [items, counts] = await Promise.all([
        db
            .select()
            .from(schema.news)
            .where(conditions.length ? and(...conditions) : undefined)
            .orderBy(desc(sql`coalesce(${schema.news.publishedAt}, ${schema.news.updatedAt})`)),
        db
            .select({
                all: count(),
                draft: sql<number>`count(*) filter (where ${schema.news.status} = 'draft')::int`,
                scheduled: sql<number>`count(*) filter (where ${schema.news.status} = 'published' and ${schema.news.publishedAt} > now())::int`,
                published: sql<number>`count(*) filter (where ${schema.news.status} = 'published' and ${schema.news.publishedAt} <= now())::int`,
            })
            .from(schema.news),
    ]);
    return { items, counts: counts[0] };
}

export async function getNewsById(id: string) {
    if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
    const [row] = await getDb().select().from(schema.news).where(eq(schema.news.id, id));
    return row ?? null;
}
