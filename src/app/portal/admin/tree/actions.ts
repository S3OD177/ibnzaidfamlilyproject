"use server";

import { ActionError, safeAction, type ActionResult } from "@/lib/action-result";
import { and, eq, inArray, or } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { requireRole } from "@/lib/auth/current";
import { nodeDataToRow, rowToNodeData, type TreeNodeData } from "@/lib/data/tree";
import { persistImage } from "@/lib/files";
import { memberDiff, memberSnapshot, recordChange, type DbExecutor } from "@/lib/tree-history";
import { MEMBER_FIELD_LABELS } from "@/lib/tree-history-labels";

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

/** Names of members by id, for history summaries. */
async function namesOf(exec: DbExecutor, ids: (string | null | undefined)[]): Promise<Map<string, { name: string; gender: "male" | "female" }>> {
    const list = [...new Set(ids.filter((id): id is string => Boolean(id)))];
    if (list.length === 0) return new Map();
    const rows = await exec
        .select({ id: schema.members.id, name: schema.members.fullName, gender: schema.members.gender })
        .from(schema.members)
        .where(inArray(schema.members.id, list));
    return new Map(rows.map((r) => [r.id, { name: r.name, gender: r.gender }]));
}

const childWord = (gender: "male" | "female") => (gender === "female" ? "ابنةً" : "ابناً");

export async function updateMember(id: string, data: unknown): Promise<ActionResult<TreeNodeData>> {
    return safeAction(async () => {
        const me = await requireStaff();
        assertId(id);
        const values = nodeDataToRow(await withStoredPhoto(data, me.isDbUser ? me.userId : null));
        return getDb().transaction(async (tx) => {
            const [prev] = await tx.select().from(schema.members).where(eq(schema.members.id, id)).for("update");
            if (!prev) throw new ActionError("العضو غير موجود");
            const [row] = await tx.update(schema.members).set(values).where(eq(schema.members.id, id)).returning();
            const diff = memberDiff(prev, row);
            if (diff) {
                const fields = Object.keys(diff.after).map((k) => MEMBER_FIELD_LABELS[k] ?? k);
                await recordChange(tx, me, {
                    action: "member.update",
                    memberId: id,
                    memberName: row.fullName,
                    summary: `تعديل بيانات ${prev.fullName}: ${fields.join("، ")}`,
                    ...diff,
                });
            }
            return rowToNodeData(row);
        });
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
            const parentName = parentId ? (await namesOf(tx, [parentId])).get(parentId)?.name : undefined;
            for (const row of inserted) {
                await recordChange(tx, me, {
                    action: "member.add",
                    memberId: row.id,
                    memberName: row.fullName,
                    summary: `إضافة ${row.fullName}${parentName ? ` ${childWord(row.gender)} لـ${parentName}` : ""}`,
                    after: { member: memberSnapshot(row), parentId },
                });
            }
            return inserted.map((row) => ({ id: row.id, data: rowToNodeData(row), parentId }));
        });
    });
}

export async function deleteMember(id: string): Promise<ActionResult<void>> {
    return safeAction(async () => {
        const me = await requireStaff();
        assertId(id);
        await getDb().transaction(async (tx) => {
            const [row] = await tx.select().from(schema.members).where(eq(schema.members.id, id)).for("update");
            if (!row) return;
            // Kept in the history so the person can be restored with their links.
            const relationships = await tx
                .select({ parentId: schema.relationships.parentId, childId: schema.relationships.childId })
                .from(schema.relationships)
                .where(or(eq(schema.relationships.parentId, id), eq(schema.relationships.childId, id)));
            const marriages = await tx
                .select({
                    memberId: schema.marriages.memberId,
                    spouseId: schema.marriages.spouseId,
                    spouseName: schema.marriages.spouseName,
                    marriageYear: schema.marriages.marriageYear,
                })
                .from(schema.marriages)
                .where(or(eq(schema.marriages.memberId, id), eq(schema.marriages.spouseId, id)));
            // Relationships go with it (ON DELETE CASCADE).
            await tx.delete(schema.members).where(eq(schema.members.id, id));
            await recordChange(tx, me, {
                action: "member.delete",
                memberId: id,
                memberName: row.fullName,
                summary: `حذف ${row.fullName}`,
                before: { member: memberSnapshot(row), relationships, marriages },
            });
        });
    });
}

export async function linkMembers(parentId: string, childId: string): Promise<ActionResult<{ id: string }>> {
    return safeAction(async () => {
        const me = await requireStaff();
        assertId(parentId);
        assertId(childId);
        if (parentId === childId) throw new ActionError("لا يمكن ربط الفرد بنفسه");
        return getDb().transaction(async (tx) => {
            const names = await namesOf(tx, [parentId, childId]);
            if (names.size !== 2) throw new ActionError("العضو غير موجود");
            const added = await tx
                .insert(schema.relationships)
                .values({ parentId, childId })
                .onConflictDoNothing()
                .returning({ id: schema.relationships.id });
            if (added.length) {
                const child = names.get(childId)!;
                await recordChange(tx, me, {
                    action: "link.add",
                    memberId: childId,
                    memberName: child.name,
                    summary: `ربط ${child.name} ${childWord(child.gender)} لـ${names.get(parentId)!.name}`,
                    after: { parentId, childId },
                });
            }
            const [link] = await tx
                .select({ id: schema.relationships.id })
                .from(schema.relationships)
                .where(and(eq(schema.relationships.parentId, parentId), eq(schema.relationships.childId, childId)));
            return link;
        });
    });
}

export async function unlinkMembers(parentId: string, childId: string): Promise<ActionResult<void>> {
    return safeAction(async () => {
        const me = await requireStaff();
        assertId(parentId);
        assertId(childId);
        await getDb().transaction(async (tx) => {
            const removed = await tx
                .delete(schema.relationships)
                .where(and(eq(schema.relationships.parentId, parentId), eq(schema.relationships.childId, childId)))
                .returning({ id: schema.relationships.id });
            if (!removed.length) return;
            const names = await namesOf(tx, [parentId, childId]);
            const childName = names.get(childId)?.name ?? "—";
            await recordChange(tx, me, {
                action: "link.remove",
                memberId: childId,
                memberName: childName,
                summary: `فك ربط ${childName} عن ${names.get(parentId)?.name ?? "—"}`,
                before: { parentId, childId },
            });
        });
    });
}

/**
 * Moves a child under a new parent: drops its link to oldParentId (its current primary
 * parent, when it has one) and links it to newParentId, in one transaction. Refuses a
 * move that would make the child its own ancestor.
 */
export async function setParent(
    childId: string,
    newParentId: string,
    oldParentId: string | null,
): Promise<ActionResult<{ id: string }>> {
    return safeAction(async () => {
        const me = await requireStaff();
        assertId(childId);
        assertId(newParentId);
        if (oldParentId !== null) assertId(oldParentId);
        if (newParentId === childId) throw new ActionError("لا يمكن جعل الفرد أباً لنفسه");
        const db = getDb();
        const found = await db
            .select({ id: schema.members.id })
            .from(schema.members)
            .where(inArray(schema.members.id, [childId, newParentId]));
        if (found.length !== 2) throw new ActionError("العضو غير موجود");

        // Walk the child's descendants (through every parent link) looking for the new parent.
        const seen = new Set<string>([childId]);
        let frontier = [childId];
        while (frontier.length) {
            const rows = await db
                .select({ childId: schema.relationships.childId })
                .from(schema.relationships)
                .where(inArray(schema.relationships.parentId, frontier));
            frontier = [];
            for (const r of rows) {
                if (r.childId === newParentId) throw new ActionError("لا يمكن نقل الفرد تحت أحد أبنائه أو أحفاده");
                if (!seen.has(r.childId)) {
                    seen.add(r.childId);
                    frontier.push(r.childId);
                }
            }
        }

        return db.transaction(async (tx) => {
            if (oldParentId && oldParentId !== newParentId) {
                await tx
                    .delete(schema.relationships)
                    .where(and(eq(schema.relationships.parentId, oldParentId), eq(schema.relationships.childId, childId)));
            }
            await tx.insert(schema.relationships).values({ parentId: newParentId, childId }).onConflictDoNothing();
            const [link] = await tx
                .select({ id: schema.relationships.id })
                .from(schema.relationships)
                .where(and(eq(schema.relationships.parentId, newParentId), eq(schema.relationships.childId, childId)));
            if (!link) throw new ActionError("تعذر حفظ الرابط");
            const names = await namesOf(tx, [childId, newParentId, oldParentId]);
            const childName = names.get(childId)?.name ?? "—";
            const from = oldParentId && oldParentId !== newParentId ? ` من ${names.get(oldParentId)?.name ?? "—"}` : "";
            await recordChange(tx, me, {
                action: "parent.move",
                memberId: childId,
                memberName: childName,
                summary: `نقل ${childName}${from} إلى ${names.get(newParentId)?.name ?? "—"}`,
                before: { parentId: oldParentId },
                after: { parentId: newParentId },
            });
            return link;
        });
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
        const me = await requireStaff();
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
        await db.transaction(async (tx) => {
            const names = await namesOf(tx, [memberId, spouseId]);
            const member = names.get(memberId);
            if (!member || (spouseId && !names.has(spouseId))) throw new ActionError("العضو غير موجود");
            const [marriage] = await tx
                .insert(schema.marriages)
                .values({ memberId, spouseId, spouseName: spouseId ? null : spouseName, marriageYear: year })
                .returning();
            await recordChange(tx, me, {
                action: "marriage.add",
                memberId,
                memberName: member.name,
                summary: `تسجيل زواج ${member.name} من ${spouseId ? names.get(spouseId)!.name : spouseName}${year ? ` (${year})` : ""}`,
                after: { marriageId: marriage.id, memberId, spouseId, spouseName: marriage.spouseName, marriageYear: year },
            });
        });
    });
}

export async function removeSpouse(marriageId: string): Promise<ActionResult<void>> {
    return safeAction(async () => {
        const me = await requireStaff();
        assertId(marriageId);
        await getDb().transaction(async (tx) => {
            const [removed] = await tx.delete(schema.marriages).where(eq(schema.marriages.id, marriageId)).returning();
            if (!removed) return;
            const names = await namesOf(tx, [removed.memberId, removed.spouseId]);
            const memberName = names.get(removed.memberId)?.name ?? "—";
            const spouse = (removed.spouseId && names.get(removed.spouseId)?.name) || removed.spouseName || "—";
            await recordChange(tx, me, {
                action: "marriage.remove",
                memberId: removed.memberId,
                memberName,
                summary: `حذف زواج ${memberName} من ${spouse}`,
                before: {
                    memberId: removed.memberId,
                    spouseId: removed.spouseId,
                    spouseName: removed.spouseName,
                    marriageYear: removed.marriageYear,
                },
            });
        });
    });
}
