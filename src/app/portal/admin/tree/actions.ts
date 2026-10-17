"use server";

import { cookies } from "next/headers";
import { and, eq, inArray } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth/session";
import { nodeDataToRow, rowToNodeData, type TreeNodeData } from "@/lib/data/tree";

// Server actions are public endpoints, so each one checks for an admin session itself.
async function requireAdmin() {
    const cookieStore = await cookies();
    const role = await verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
    if (role !== "admin") throw new Error("غير مصرح");
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function assertId(id: unknown): asserts id is string {
    if (typeof id !== "string" || !UUID.test(id)) throw new Error("معرّف غير صالح");
}

export async function updateMember(id: string, data: unknown): Promise<TreeNodeData> {
    await requireAdmin();
    assertId(id);
    const [row] = await getDb()
        .update(schema.members)
        .set(nodeDataToRow(data))
        .where(eq(schema.members.id, id))
        .returning();
    if (!row) throw new Error("العضو غير موجود");
    return rowToNodeData(row);
}

/** Adds members, each linked as a child of parentId when given. */
export async function addMembers(
    parentId: string | null,
    members: unknown[],
): Promise<{ id: string; data: TreeNodeData; parentId: string | null }[]> {
    await requireAdmin();
    if (parentId !== null) assertId(parentId);
    if (!Array.isArray(members) || members.length === 0 || members.length > 50) throw new Error("قائمة أفراد غير صالحة");
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
}

export async function deleteMember(id: string): Promise<void> {
    await requireAdmin();
    assertId(id);
    // Relationships go with it (ON DELETE CASCADE).
    await getDb().delete(schema.members).where(eq(schema.members.id, id));
}

export async function linkMembers(parentId: string, childId: string): Promise<{ id: string }> {
    await requireAdmin();
    assertId(parentId);
    assertId(childId);
    if (parentId === childId) throw new Error("لا يمكن ربط الفرد بنفسه");
    const db = getDb();
    const found = await db
        .select({ id: schema.members.id })
        .from(schema.members)
        .where(inArray(schema.members.id, [parentId, childId]));
    if (found.length !== 2) throw new Error("العضو غير موجود");
    await db.insert(schema.relationships).values({ parentId, childId }).onConflictDoNothing();
    const [link] = await db
        .select({ id: schema.relationships.id })
        .from(schema.relationships)
        .where(and(eq(schema.relationships.parentId, parentId), eq(schema.relationships.childId, childId)));
    return link;
}

export async function unlinkMembers(parentId: string, childId: string): Promise<void> {
    await requireAdmin();
    assertId(parentId);
    assertId(childId);
    await getDb()
        .delete(schema.relationships)
        .where(and(eq(schema.relationships.parentId, parentId), eq(schema.relationships.childId, childId)));
}
