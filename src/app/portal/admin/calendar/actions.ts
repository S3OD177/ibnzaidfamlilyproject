"use server";

import { ActionError, safeAction, type ActionResult } from "@/lib/action-result";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { requireRole } from "@/lib/auth/current";
import { EVENT_CATEGORIES, TIMELINE_TYPES } from "@/lib/calendar/categories";
import { toStoredEvent, type StoredEvent } from "@/lib/data/events";

// Admins and editors manage content; server actions re-check the account every call.
async function requireStaff() {
    await requireRole("admin", "editor");
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const text = (value: unknown, max: number) => (typeof value === "string" ? value.trim().slice(0, max) : "");

export async function addEvent(input: { title: string; description: string; date: string; category: string }): Promise<ActionResult<StoredEvent>> {
    return safeAction(async () => {
        await requireStaff();
        const title = text(input.title, 200);
        if (!title) throw new ActionError("عنوان الحدث مطلوب");
        if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date) || Number.isNaN(Date.parse(input.date))) throw new ActionError("تاريخ غير صالح");
        const category = EVENT_CATEGORIES.some((c) => c.id === input.category) ? input.category : "general";

        const [row] = await getDb()
            .insert(schema.events)
            .values({ title, description: text(input.description, 2000) || null, eventDate: input.date, category })
            .returning();
        return toStoredEvent(row);
    });
}

export async function deleteEvent(id: string): Promise<ActionResult<void>> {
    return safeAction(async () => {
        await requireStaff();
        if (!UUID.test(id)) throw new ActionError("معرّف غير صالح");
        await getDb().delete(schema.events).where(eq(schema.events.id, id));
    });
}

export async function addTimelineEvent(input: { year: number; title: string; description: string; type: string }) {
    return safeAction(async () => {
        await requireStaff();
        const title = text(input.title, 200);
        if (!title) throw new ActionError("عنوان الحدث مطلوب");
        const year = Number(input.year);
        if (!Number.isInteger(year) || year < 1 || year > 3000) throw new ActionError("السنة غير صالحة");
        const type = TIMELINE_TYPES.find((t) => t.id === input.type)?.id ?? "milestone";

        const [row] = await getDb()
            .insert(schema.timelineEvents)
            .values({ year, title, description: text(input.description, 2000) || null, type })
            .returning();
        return { id: row.id, year: row.year, title: row.title, description: row.description, type: row.type, memberId: row.memberId };
    });
}

export async function deleteTimelineEvent(id: string): Promise<ActionResult<void>> {
    return safeAction(async () => {
        await requireStaff();
        if (!UUID.test(id)) throw new ActionError("معرّف غير صالح");
        await getDb().delete(schema.timelineEvents).where(eq(schema.timelineEvents.id, id));
    });
}
