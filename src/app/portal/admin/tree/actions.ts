"use server";

import { ActionError, safeAction, type ActionResult } from "@/lib/action-result";
import { and, eq, inArray, or } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { requireRole } from "@/lib/auth/current";
import { nodeDataToRow, rowToNodeData, type TreeNodeData } from "@/lib/data/tree";
import { persistImage } from "@/lib/files";

// Admins and editors manage content; server actions re-check the account every call.
async function requireStaff() {
    return requireRole("admin", "editor");
}

// Stores a newly picked photo (data URL) as a public file and keeps only its /files/ URL.
async function withStoredPhoto(data: unknown, uploadedBy: string | null) {
    const record = (data ?? {}) as Record<string, unknown>;
    return { ...record, photo: await persistImage(record.photo, uploadedBy) };
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function assertId(id: unknown): asserts id is string {
    if (typeof id !== "string" || !UUID.test(id)) throw new ActionError("معرّف غير صالح");
}

export async function updateMember(id: string, data: unknown): Promise<ActionResult<TreeNodeData>> {
    return safeAction(async () => {
        const me = await requireStaff();
        assertId(id);
        const [row] = await getDb()
            .update(schema.members)
            .set(nodeDataToRow(await withStoredPhoto(data, me.isDbUser ? me.userId : null)))
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
        const me = await requireStaff();
        if (parentId !== null) assertId(parentId);
        if (!Array.isArray(members) || members.length === 0 || members.length > 50) throw new ActionError("قائمة أفراد غير صالحة");
        const uploadedBy = me.isDbUser ? me.userId : null;
        const rows = await Promise.all(members.map(async (member) => nodeDataToRow(await withStoredPhoto(member, uploadedBy))));

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

export interface SpouseEntry {
    marriageId: string;
    spouseId: string | null;
    name: string;
    marriageYear: number | null;
}

/** Spouses of a member, whichever side of the marriage row the member is on. */
export async function listSpouses(memberId: string): Promise<ActionResult<SpouseEntry[]>> {
    return safeAction(async () => {
        await requireStaff();
        assertId(memberId);
        const db = getDb();
        const rows = await db
            .select()
            .from(schema.marriages)
            .where(or(eq(schema.marriages.memberId, memberId), eq(schema.marriages.spouseId, memberId)));
        const otherIds = rows
            .map((r) => (r.memberId === memberId ? r.spouseId : r.memberId))
            .filter((id): id is string => Boolean(id));
        const names = otherIds.length
            ? await db
                  .select({ id: schema.members.id, name: schema.members.fullName })
                  .from(schema.members)
                  .where(inArray(schema.members.id, otherIds))
            : [];
        const byId = new Map(names.map((n) => [n.id, n.name]));
        return rows.map((r) => {
            const otherId = r.memberId === memberId ? r.spouseId : r.memberId;
            return {
                marriageId: r.id,
                spouseId: otherId,
                name: (otherId && byId.get(otherId)) || r.spouseName || "—",
                marriageYear: r.marriageYear,
            };
        });
    });
}

/** Adds a spouse: another tree member (spouseId) or a name from outside the family. */
export async function addSpouse(
    memberId: string,
    input: { spouseId: string | null; spouseName: string; marriageYear: string },
): Promise<ActionResult<void>> {
    return safeAction(async () => {
        await requireStaff();
        assertId(memberId);
        const spouseId = input.spouseId || null;
        if (spouseId) assertId(spouseId);
        if (spouseId === memberId) throw new ActionError("لا يمكن تزويج الفرد بنفسه");
        const spouseName = typeof input.spouseName === "string" ? input.spouseName.trim().slice(0, 200) : "";
        if (!spouseId && !spouseName) throw new ActionError("اختر فرداً من الشجرة أو اكتب الاسم");
        const year = input.marriageYear ? Number(input.marriageYear) : null;
        if (year !== null && (!Number.isInteger(year) || year < 1000 || year > 3000)) throw new ActionError("سنة الزواج غير صالحة");

        const db = getDb();
        if (spouseId) {
            const [existing] = await db
                .select({ id: schema.marriages.id })
                .from(schema.marriages)
                .where(
                    or(
                        and(eq(schema.marriages.memberId, memberId), eq(schema.marriages.spouseId, spouseId)),
                        and(eq(schema.marriages.memberId, spouseId), eq(schema.marriages.spouseId, memberId)),
                    ),
                );
            if (existing) throw new ActionError("الزواج مسجل مسبقاً");
        }
        await db.insert(schema.marriages).values({
            memberId,
            spouseId,
            spouseName: spouseId ? null : spouseName,
            marriageYear: year,
        });
    });
}

export async function removeSpouse(marriageId: string): Promise<ActionResult<void>> {
    return safeAction(async () => {
        await requireStaff();
        assertId(marriageId);
        await getDb().delete(schema.marriages).where(eq(schema.marriages.id, marriageId));
    });
}
