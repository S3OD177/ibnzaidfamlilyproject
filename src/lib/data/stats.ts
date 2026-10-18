import "server-only";
import { count, desc, eq, sql } from "drizzle-orm";
import { getDb, schema } from "@/db";
import type { FamilyStats } from "@/lib/stats/familyStats";
import type { PlatformStats } from "@/types/platformStats";

const currentHijriYear = () =>
    Number(new Intl.DateTimeFormat("en-u-ca-islamic-umalqura-nu-latn", { year: "numeric" }).format(new Date()).replace(/\D/g, ""));

function topNames(names: string[]) {
    const counts = new Map<string, number>();
    for (const full of names) {
        const first = full.trim().split(/\s+/)[0];
        if (first) counts.set(first, (counts.get(first) ?? 0) + 1);
    }
    return [...counts.entries()]
        .map(([name, n]) => ({ name, count: n }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
}

export async function getFamilyStats(): Promise<FamilyStats> {
    const db = getDb();
    const [members, [{ links }], [{ parents }]] = await Promise.all([
        db
            .select({
                fullName: schema.members.fullName,
                gender: schema.members.gender,
                status: schema.members.status,
                birthYear: schema.members.birthYear,
                birthCalendar: schema.members.birthCalendar,
                generation: schema.members.generationLabel,
                location: schema.members.location,
            })
            .from(schema.members),
        db.select({ links: count() }).from(schema.relationships),
        db.select({ parents: sql<number>`count(distinct ${schema.relationships.parentId})::int` }).from(schema.relationships),
    ]);

    const males = members.filter((m) => m.gender === "male");
    const females = members.filter((m) => m.gender === "female");

    // Ages of living members only, using the calendar each birth year was recorded in.
    const hijriNow = currentHijriYear();
    const gregorianNow = new Date().getFullYear();
    const ageGroups = [
        { name: "0-18", value: 0 },
        { name: "19-35", value: 0 },
        { name: "36-60", value: 0 },
        { name: "+60", value: 0 },
    ];
    for (const m of members) {
        if (m.status !== "alive" || !m.birthYear) continue;
        const age = (m.birthCalendar === "gregorian" ? gregorianNow : hijriNow) - m.birthYear;
        if (age < 0 || age > 130) continue;
        ageGroups[age <= 18 ? 0 : age <= 35 ? 1 : age <= 60 ? 2 : 3].value++;
    }

    const locations = new Map<string, number>();
    for (const m of members) {
        const loc = m.location?.trim() || "غير محدد";
        locations.set(loc, (locations.get(loc) ?? 0) + 1);
    }

    return {
        totalMembers: members.length,
        livingCount: members.filter((m) => m.status === "alive").length,
        deceasedCount: members.filter((m) => m.status === "deceased").length,
        genderDistribution: [
            { name: "ذكور", value: males.length, fill: "#3b82f6" },
            { name: "إناث", value: females.length, fill: "#ec4899" },
        ],
        ageGroups,
        // Average number of children among members who have any recorded.
        averageChildren: parents > 0 ? Number((links / parents).toFixed(1)) : 0,
        generationsCount: new Set(members.map((m) => m.generation).filter(Boolean)).size,
        topMaleNames: topNames(males.map((m) => m.fullName)),
        topFemaleNames: topNames(females.map((m) => m.fullName)),
        locationDistribution: [...locations.entries()]
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5),
    };
}

export async function getPlatformStats(): Promise<PlatformStats> {
    const db = getDb();
    const [[users], [requests], [content]] = await Promise.all([
        db
            .select({
                total: count(),
                active: sql<number>`count(*) filter (where ${schema.users.status} = 'active')::int`,
            })
            .from(schema.users),
        db.select({ pending: count() }).from(schema.membershipRequests).where(eq(schema.membershipRequests.status, "pending")),
        db
            .select({
                news: sql<number>`(select count(*)::int from ${schema.news} where ${schema.news.status} = 'published' and ${schema.news.publishedAt} <= now())`,
                documents: sql<number>`(select count(*)::int from ${schema.documents})`,
                events: sql<number>`(select count(*)::int from ${schema.events})`,
            })
            .from(sql`(select 1) as one`),
    ]);
    return {
        users: { total: users.total, active: users.active, pending: requests.pending },
        content: { newsUrl: content.news, documents: content.documents, events: content.events },
        system: { status: "Operational", lastBackup: "غير مُعدّ بعد", version: "v0.1.0" },
    };
}

export async function countPendingRequests(): Promise<number> {
    const [{ pending }] = await getDb()
        .select({ pending: count() })
        .from(schema.membershipRequests)
        .where(eq(schema.membershipRequests.status, "pending"));
    return pending;
}

export interface ActivityItem {
    kind: "member" | "news" | "event";
    title: string;
    detail: string;
    href: string;
    at: Date;
}

/** Latest changes across members, news and events for the dashboard feed. */
export async function getRecentActivity(limit = 6): Promise<ActivityItem[]> {
    const db = getDb();
    const [members, news, events] = await Promise.all([
        db
            .select({ id: schema.members.id, name: schema.members.fullName, created: schema.members.createdAt, updated: schema.members.updatedAt })
            .from(schema.members)
            .orderBy(desc(schema.members.updatedAt))
            .limit(limit),
        db
            .select({ id: schema.news.id, title: schema.news.title, status: schema.news.status, updated: schema.news.updatedAt })
            .from(schema.news)
            .orderBy(desc(schema.news.updatedAt))
            .limit(limit),
        db
            .select({ title: schema.events.title, date: schema.events.eventDate, created: schema.events.createdAt })
            .from(schema.events)
            .orderBy(desc(schema.events.createdAt))
            .limit(limit),
    ]);

    const items: ActivityItem[] = [
        ...members.map((m) => ({
            kind: "member" as const,
            title: m.name,
            detail: m.updated.getTime() - m.created.getTime() < 1000 ? "أضيف إلى شجرة العائلة" : "تم تحديث بياناته في الشجرة",
            href: `/portal/members/${m.id}`,
            at: m.updated,
        })),
        ...news.map((n) => ({
            kind: "news" as const,
            title: n.title,
            detail: n.status === "published" ? "خبر منشور" : "مسودة خبر",
            href: `/portal/admin/news/${n.id}/edit`,
            at: n.updated,
        })),
        ...events.map((e) => ({
            kind: "event" as const,
            title: e.title,
            detail: `حدث في التقويم بتاريخ ${e.date}`,
            href: "/portal/admin/calendar",
            at: e.created,
        })),
    ];
    return items.sort((a, b) => b.at.getTime() - a.at.getTime()).slice(0, limit);
}

export async function getPendingRequests(limit = 3) {
    return getDb()
        .select()
        .from(schema.membershipRequests)
        .where(eq(schema.membershipRequests.status, "pending"))
        .orderBy(desc(schema.membershipRequests.createdAt))
        .limit(limit);
}

export interface PublicCounts {
    members: number;
    generations: number;
    families: number;
    news: number;
}

/** Headline numbers for the public home page. */
export async function getPublicCounts(): Promise<PublicCounts> {
    const db = getDb();
    const [[m], [r], [n]] = await Promise.all([
        db
            .select({
                members: count(),
                generations: sql<number>`count(distinct ${schema.members.generationLabel})::int`,
            })
            .from(schema.members),
        db.select({ families: sql<number>`count(distinct ${schema.relationships.parentId})::int` }).from(schema.relationships),
        db.select({ news: count() }).from(schema.news).where(eq(schema.news.status, "published")),
    ]);
    return { members: m.members, generations: m.generations, families: r.families, news: n.news };
}
