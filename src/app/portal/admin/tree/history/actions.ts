"use server";

import { revalidatePath } from "next/cache";
import { and, eq, inArray, ne } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { ActionError, safeAction, type ActionResult } from "@/lib/action-result";
import { requireRole } from "@/lib/auth/current";
import { formatHijri } from "@/lib/dates";
import { MEMBER_COLUMNS, memberDiff, recordChange, type DbExecutor, type MemberSnapshot } from "@/lib/tree-history";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isId = (v: unknown): v is string => typeof v === "string" && UUID.test(v);

type MemberInsert = typeof schema.members.$inferInsert;

/** Only known member columns from a stored snapshot. */
function cleanSnapshot(value: unknown): MemberSnapshot {
    if (!value || typeof value !== "object") return {};
    const source = value as Record<string, unknown>;
    return Object.fromEntries(MEMBER_COLUMNS.filter((k) => k in source).map((k) => [k, source[k]])) as MemberSnapshot;
}

/** A serial number taken by another member in the meantime is dropped rather than failing. */
async function freeSerial(tx: DbExecutor, serial: unknown, exceptId: string): Promise<boolean> {
    if (typeof serial !== "string" || !serial) return true;
    const [taken] = await tx
        .select({ id: schema.members.id })
        .from(schema.members)
        .where(and(eq(schema.members.serialNumber, serial), ne(schema.members.id, exceptId)));
    return !taken;
}

/**
 * Undoes one history entry: a data edit gets its previous values back; a deleted person
 * is re-created with the same id and the links and marriages stored when deleting
 * (those whose other person still exists).
 */
export async function restoreChange(changeId: string): Promise<ActionResult<{ memberId: string }>> {
    return safeAction(async () => {
        const me = await requireRole("admin", "editor");
        if (!isId(changeId)) throw new ActionError("معرّف غير صالح");

        const memberId = await getDb().transaction(async (tx) => {
            const [change] = await tx.select().from(schema.treeChanges).where(eq(schema.treeChanges.id, changeId));
            if (!change) throw new ActionError("السجل غير موجود");
            if (!change.memberId || !change.before) throw new ActionError("لا يمكن استعادة هذا التغيير");
            const id = change.memberId;
            const when = formatHijri(change.createdAt);

            if (change.action === "member.update") {
                const values = cleanSnapshot(change.before);
                if (Object.keys(values).length === 0) throw new ActionError("لا توجد قيم سابقة للاستعادة");
                const [current] = await tx.select().from(schema.members).where(eq(schema.members.id, id)).for("update");
                if (!current) throw new ActionError("الفرد لم يعد موجوداً في الشجرة");
                if ("serialNumber" in values && !(await freeSerial(tx, values.serialNumber, id))) delete values.serialNumber;
                const [row] = await tx.update(schema.members).set(values as Partial<MemberInsert>).where(eq(schema.members.id, id)).returning();
                const diff = memberDiff(current, row);
                await recordChange(tx, me, {
                    action: "member.restore",
                    memberId: id,
                    memberName: row.fullName,
                    summary: `استعادة بيانات ${row.fullName} إلى ما قبل تعديل ${when}`,
                    before: diff?.before ?? null,
                    after: diff?.after ?? null,
                });
                return id;
            }

            if (change.action === "member.delete") {
                const stored = change.before as {
                    member?: unknown;
                    relationships?: { parentId: string; childId: string }[];
                    marriages?: { memberId: string; spouseId: string | null; spouseName: string | null; marriageYear: number | null }[];
                };
                const values = cleanSnapshot(stored.member);
                if (typeof values.fullName !== "string" || !values.fullName) throw new ActionError("بيانات الفرد المحذوف ناقصة");
                const [exists] = await tx.select({ id: schema.members.id }).from(schema.members).where(eq(schema.members.id, id));
                if (exists) throw new ActionError("الفرد موجود في الشجرة بالفعل");
                if (!(await freeSerial(tx, values.serialNumber, id))) values.serialNumber = null;
                await tx.insert(schema.members).values({ ...(values as MemberInsert), id });

                const links = (Array.isArray(stored.relationships) ? stored.relationships : []).filter(
                    (l) => isId(l.parentId) && isId(l.childId) && (l.parentId === id || l.childId === id) && l.parentId !== l.childId,
                );
                const marriages = (Array.isArray(stored.marriages) ? stored.marriages : []).filter(
                    (m) => isId(m.memberId) && (m.memberId === id || m.spouseId === id),
                );
                const others = [
                    ...links.map((l) => (l.parentId === id ? l.childId : l.parentId)),
                    ...marriages.map((m) => (m.memberId === id ? m.spouseId : m.memberId)),
                ].filter(isId);
                const present = new Set(
                    others.length
                        ? (await tx.select({ id: schema.members.id }).from(schema.members).where(inArray(schema.members.id, others))).map((r) => r.id)
                        : [],
                );
                present.add(id);

                const restoredLinks = links.filter((l) => present.has(l.parentId) && present.has(l.childId));
                if (restoredLinks.length) {
                    await tx
                        .insert(schema.relationships)
                        .values(restoredLinks.map((l) => ({ parentId: l.parentId, childId: l.childId })))
                        .onConflictDoNothing();
                }
                let restoredMarriages = 0;
                for (const m of marriages) {
                    if (!present.has(m.memberId)) continue;
                    const spouseId = m.spouseId && present.has(m.spouseId) ? m.spouseId : null;
                    const spouseName = typeof m.spouseName === "string" ? m.spouseName : null;
                    if (!spouseId && !spouseName) continue;
                    if (spouseId === m.memberId) continue;
                    await tx.insert(schema.marriages).values({
                        memberId: m.memberId,
                        spouseId,
                        spouseName,
                        marriageYear: typeof m.marriageYear === "number" ? m.marriageYear : null,
                    });
                    restoredMarriages++;
                }

                await recordChange(tx, me, {
                    action: "member.restore",
                    memberId: id,
                    memberName: values.fullName,
                    summary: `استعادة ${values.fullName} بعد حذفه ${when} (${restoredLinks.length} رابط، ${restoredMarriages} زواج)`,
                    after: { member: values, relationships: restoredLinks, restoredMarriages },
                });
                return id;
            }

            throw new ActionError("لا يمكن استعادة هذا النوع من التغييرات");
        });

        revalidatePath("/portal/admin/tree");
        revalidatePath("/portal/admin/tree/history");
        revalidatePath("/portal/tree");
        revalidatePath(`/portal/members/${memberId}`);
        return { memberId };
    });
}
