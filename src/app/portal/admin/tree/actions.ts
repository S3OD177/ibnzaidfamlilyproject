"use server";

import { ActionError, safeAction, type ActionResult } from "@/lib/action-result";
import { and, eq, inArray } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { requireRole } from "@/lib/auth/current";
import { nodeDataToRow, rowToNodeData, type TreeNodeData } from "@/lib/data/tree";

// Admins and editors manage content; server actions re-check the account every call.
async function requireStaff() {
    await requireRole("admin", "editor");
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function assertId(id: unknown): asserts id is string {
    if (typeof id !== "string" || !UUID.test(id)) throw new ActionError("معرّف غير صالح");
}

export async function updateMember(id: string, data: unknown): Promise<ActionResult<TreeNodeData>> {
    return safeAction(async () => {
        await requireStaff();
        assertId(id);
        const [row] = await getDb()
            .update(schema.members)
            .set(nodeDataToRow(data))
            .where(eq(schema.members.id, id))
            .returning();
        if (!row) throw new ActionError("العضو غير موجود");
        return rowToNodeData(row);
    });
}

/** Adds members, each linked as a child of parentId when given. */
export async function addMembers(
    parentId: string | null,
    members: unknown[],
): Promise<ActionResult<{ id: string; data: TreeNodeData; parentId: string | null }[]>> {
    return safeAction(async () => {
        await requireStaff();
        if (parentId !== null) assertId(parentId);
        if (!Array.isArray(members) || members.length === 0 || members.length > 50) throw new ActionError("قائمة أفراد غير صالحة");
        const rows = members.map((member) => nodeDataToRow(member));

        return getDb().transaction(async (tx) => {
            const inserted = await tx.insert(schema.members).values(rows).returning();
            if (parentId) {
                await tx
                    .insert(schema.relationships)
                    .values(inserted.map((row) => ({ parentId, childId: row.id })));
            }
            return inserted.map((row) => ({ id: row.id, data: rowToNodeData(row), parentId }));
        });
    });
}

export async function deleteMember(id: string): Promise<ActionResult<void>> {
    return safeAction(async () => {
        await requireStaff();
        assertId(id);
        // Relationships go with it (ON DELETE CASCADE).
        await getDb().delete(schema.members).where(eq(schema.members.id, id));
    });
}

export async function linkMembers(parentId: string, childId: string): Promise<ActionResult<{ id: string }>> {
    return safeAction(async () => {
        await requireStaff();
        assertId(parentId);
        assertId(childId);
        if (parentId === childId) throw new ActionError("لا يمكن ربط الفرد بنفسه");
        const db = getDb();
        const found = await db
            .select({ id: schema.members.id })
            .from(schema.members)
            .where(inArray(schema.members.id, [parentId, childId]));
        if (found.length !== 2) throw new ActionError("العضو غير موجود");
        await db.insert(schema.relationships).values({ parentId, childId }).onConflictDoNothing();
        const [link] = await db
            .select({ id: schema.relationships.id })
            .from(schema.relationships)
            .where(and(eq(schema.relationships.parentId, parentId), eq(schema.relationships.childId, childId)));
        return link;
    });
}

export async function unlinkMembers(parentId: string, childId: string): Promise<ActionResult<void>> {
    return safeAction(async () => {
        await requireStaff();
        assertId(parentId);
        assertId(childId);
        await getDb()
            .delete(schema.relationships)
            .where(and(eq(schema.relationships.parentId, parentId), eq(schema.relationships.childId, childId)));
    });
}
