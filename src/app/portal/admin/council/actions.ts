"use server";

import { ActionError, safeAction, type ActionResult } from "@/lib/action-result";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { requireRole } from "@/lib/auth/current";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const text = (value: unknown, max: number) => (typeof value === "string" ? value.trim().slice(0, max) : "");

export interface CouncilInput {
    role: string;
    order: string;
    since: string;
    statement: string;
    location: string;
}

function clean(input: CouncilInput) {
    const councilRole = text(input.role, 100);
    if (!councilRole) throw new ActionError("اكتب المنصب في المجلس");
    const order = input.order ? Number(input.order) : null;
    if (order !== null && (!Number.isInteger(order) || order < 1 || order > 100)) throw new ActionError("الترتيب يجب أن يكون رقماً من 1 إلى 100");
    return {
        councilRole,
        councilOrder: order,
        councilSince: text(input.since, 50) || null,
        councilStatement: text(input.statement, 1000) || null,
        location: text(input.location, 200) || null,
    };
}

function refresh() {
    revalidatePath("/council");
    revalidatePath("/portal/admin/council");
}

/** Adds a tree member to the council, or creates a new person by name. */
export async function addCouncilMember(
    input: CouncilInput & { memberId: string | null; newName: string; gender: string },
): Promise<ActionResult<void>> {
    return safeAction(async () => {
        await requireRole("admin", "editor");
        const values = clean(input);
        const db = getDb();
        if (input.memberId) {
            if (!UUID.test(input.memberId)) throw new ActionError("معرّف غير صالح");
            const [row] = await db
                .update(schema.members)
                .set({ ...values, location: values.location ?? undefined })
                .where(eq(schema.members.id, input.memberId))
                .returning({ id: schema.members.id });
            if (!row) throw new ActionError("الفرد غير موجود");
        } else {
            const fullName = text(input.newName, 200);
            if (!fullName) throw new ActionError("اختر فرداً من الشجرة أو اكتب اسماً");
            await db.insert(schema.members).values({
                ...values,
                fullName,
                gender: input.gender === "female" ? "female" : "male",
                status: "alive",
            });
        }
        refresh();
    });
}

export async function updateCouncilMember(memberId: string, input: CouncilInput): Promise<ActionResult<void>> {
    return safeAction(async () => {
        await requireRole("admin", "editor");
        if (!UUID.test(memberId)) throw new ActionError("معرّف غير صالح");
        const [row] = await getDb().update(schema.members).set(clean(input)).where(eq(schema.members.id, memberId)).returning({ id: schema.members.id });
        if (!row) throw new ActionError("الفرد غير موجود");
        refresh();
    });
}

/** Takes someone off the council; their member record and profile stay. */
export async function removeCouncilMember(memberId: string): Promise<ActionResult<void>> {
    return safeAction(async () => {
        await requireRole("admin", "editor");
        if (!UUID.test(memberId)) throw new ActionError("معرّف غير صالح");
        await getDb()
            .update(schema.members)
            .set({ councilRole: null, councilOrder: null, councilSince: null, councilStatement: null })
            .where(eq(schema.members.id, memberId));
        refresh();
    });
}
