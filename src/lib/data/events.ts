import "server-only";
import { asc, desc, eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { eventCategory } from "@/lib/calendar/categories";

/** Calendar event as sent to the client; date is "YYYY-MM-DD" to avoid timezone shifts. */
export interface StoredEvent {
    id: string;
    title: string;
    description: string | null;
    date: string;
    category: string;
    categoryLabel: string;
    color: string;
}

export function toStoredEvent(row: typeof schema.events.$inferSelect): StoredEvent {
    const category = eventCategory(row.category);
    return {
        id: row.id,
        title: row.title,
        description: row.description,
        date: row.eventDate,
        category: category.id,
        categoryLabel: category.label,
        color: category.color,
    };
}

export async function listEvents(): Promise<StoredEvent[]> {
    const rows = await getDb().select().from(schema.events).orderBy(asc(schema.events.eventDate));
    return rows.map(toStoredEvent);
}

export interface StoredTimelineEvent {
    id: string;
    year: number;
    title: string;
    description: string | null;
    type: "birth" | "death" | "marriage" | "achievement" | "milestone";
    memberId: string | null;
}

export async function listTimelineEvents(): Promise<StoredTimelineEvent[]> {
    const rows = await getDb()
        .select()
        .from(schema.timelineEvents)
        .orderBy(desc(schema.timelineEvents.year), desc(schema.timelineEvents.createdAt));
    return rows.map((row) => ({
        id: row.id,
        year: row.year,
        title: row.title,
        description: row.description,
        type: row.type,
        memberId: row.memberId,
    }));
}

export async function getEvent(id: string) {
    const [row] = await getDb().select().from(schema.events).where(eq(schema.events.id, id));
    return row ?? null;
}
