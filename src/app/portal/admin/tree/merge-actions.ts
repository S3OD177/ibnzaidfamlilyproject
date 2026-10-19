"use server";

import { revalidatePath } from "next/cache";
import { count, eq, inArray, or } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { ActionError, safeAction, type ActionResult } from "@/lib/action-result";
import { requireRole } from "@/lib/auth/current";
import { MEMBER_COLUMNS, memberSnapshot, recordChange, type DbExecutor, type MemberColumn, type MemberRow } from "@/lib/tree-history";
import { MEMBER_FIELD_LABELS, formatFieldValue } from "@/lib/tree-history-labels";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function assertId(id: unknown): asserts id is string {
    if (typeof id !== "string" || !UUID.test(id)) throw new ActionError("معرّف غير صالح");
}

// ---------- Comparison data for the merge dialog ----------

export interface MergeCandidate {
    id: string;
    name: string;
    /** [label, value] for every field shown side by side. */
    fields: { key: string; label: string; value: string }[];
    parents: string[];
    children: number;
    spouses: string[];
    accounts: number;
    updatedAt: string;
}

const COMPARE_FIELDS: MemberColumn[] = [
    "fullName",
    "serialNumber",
    "gender",
    "status",
    "birthYear",
    "birthCalendar",
    "deathYear",
    "generationLabel",
    "branch",
    "nickname",
    "mobile",
    "email",
    "location",
    "occupation",
    "education",
    "photoUrl",
    "bio",
];

export async function getMergeCandidates(ids: string[]): Promise<ActionResult<MergeCandidate[]>> {
    return safeAction(async () => {
        await requireRole("admin", "editor");
        if (!Array.isArray(ids) || ids.length < 2 || ids.length > 6) throw new ActionError("اختر سجلين على الأقل");
        ids.forEach(assertId);
        const db = getDb();
        const rows = await db.select().from(schema.members).where(inArray(schema.members.id, ids));
        if (rows.length < 2) throw new ActionError("أحد السجلات لم يعد موجوداً");

        const [links, marriages, accounts] = await Promise.all([
            db
                .select({ parentId: schema.relationships.parentId, childId: schema.relationships.childId })
                .from(schema.relationships)
                .where(or(inArray(schema.relationships.parentId, ids), inArray(schema.relationships.childId, ids))),
            db
                .select()
                .from(schema.marriages)
                .where(or(inArray(schema.marriages.memberId, ids), inArray(schema.marriages.spouseId, ids))),
            db
                .select({ memberId: schema.users.memberId, n: count() })
                .from(schema.users)
                .where(inArray(schema.users.memberId, ids))
                .groupBy(schema.users.memberId),
        ]);
        const otherIds = [
            ...links.map((l) => l.parentId),
            ...marriages.flatMap((m) => [m.memberId, m.spouseId]),
        ].filter((id): id is string => Boolean(id));
        const names = new Map(
            (otherIds.length
                ? await db.select({ id: schema.members.id, name: schema.members.fullName }).from(schema.members).where(inArray(schema.members.id, otherIds))
                : []
            ).map((r) => [r.id, r.name]),
        );
        const accountsOf = new Map(accounts.map((a) => [a.memberId, a.n]));

        return ids
            .map((id) => rows.find((r) => r.id === id))
            .filter((r): r is MemberRow => Boolean(r))
            .map((row) => ({
                id: row.id,
                name: row.fullName,
                fields: COMPARE_FIELDS.map((key) => ({ key, label: MEMBER_FIELD_LABELS[key] ?? key, value: formatFieldValue(key, row[key]) })),
                parents: links.filter((l) => l.childId === row.id).map((l) => names.get(l.parentId) ?? "—"),
                children: links.filter((l) => l.parentId === row.id).length,
                spouses: marriages
                    .filter((m) => m.memberId === row.id || m.spouseId === row.id)
                    .map((m) => {
                        const other = m.memberId === row.id ? m.spouseId : m.memberId;
                        return (other && names.get(other)) || m.spouseName || "—";
                    }),
                accounts: accountsOf.get(row.id) ?? 0,
                updatedAt: row.updatedAt.toISOString(),
            }));
    });
}

// ---------- Merge ----------

/** All descendants of a member through every parent link. */
async function descendantIds(exec: DbExecutor, id: string): Promise<Set<string>> {
    const seen = new Set<string>();
    let frontier = [id];
    while (frontier.length) {
        const rows = await exec
            .select({ childId: schema.relationships.childId })
            .from(schema.relationships)
            .where(inArray(schema.relationships.parentId, frontier));
        frontier = [];
        for (const r of rows) {
            if (seen.has(r.childId) || r.childId === id) continue;
            seen.add(r.childId);
            frontier.push(r.childId);
        }
    }
    return seen;
}

const isEmpty = (value: unknown) =>
    value === null ||
    value === undefined ||
    (typeof value === "string" && value.trim() === "") ||
    (Array.isArray(value) && value.length === 0) ||
    (typeof value === "object" && !Array.isArray(value) && Object.values(value as object).every((v) => v === undefined || v === null || v === ""));

// Filled as a group: a date's parts belong together.
const DATE_GROUPS: MemberColumn[][] = [
    ["birthYear", "birthMonth", "birthDay", "birthCalendar"],
    ["deathYear", "deathMonth", "deathDay", "deathCalendar"],
];
// Never copied: identity of the kept record, or settings that always have a value.
const NOT_FILLED = new Set<MemberColumn>(["fullName", "gender", "isPublic", "privacy"]);

/** Values the kept record lacks and the removed one has; never overwrites a value. */
function fillFrom(keep: MemberRow, remove: MemberRow): Partial<Record<MemberColumn, unknown>> {
    const fill: Partial<Record<MemberColumn, unknown>> = {};
    const grouped = new Set(DATE_GROUPS.flat());
    for (const group of DATE_GROUPS) {
        if (keep[group[0]] == null && remove[group[0]] != null) for (const k of group) fill[k] = remove[k];
    }
    for (const key of MEMBER_COLUMNS) {
        if (grouped.has(key) || NOT_FILLED.has(key)) continue;
        if (key === "status") {
            if (keep.status === "unknown" && remove.status !== "unknown") fill.status = remove.status;
            continue;
        }
        if (key === "socialLinks") {
            const merged: Record<string, string | undefined> = { ...(keep.socialLinks ?? {}) };
            let changed = false;
            for (const [k, v] of Object.entries(remove.socialLinks ?? {})) {
                if (v && !merged[k]) {
                    merged[k] = v;
                    changed = true;
                }
            }
            if (changed) fill.socialLinks = merged;
            continue;
        }
        if (isEmpty(keep[key]) && !isEmpty(remove[key])) fill[key] = remove[key];
    }
    return fill;
}

/**
 * Merges a duplicate record (removeId) into keepId in one transaction: moves its parent
 * and child links, marriages and every other reference, fills keepId's empty fields from
 * it, then deletes it. Refused when one is an ancestor of the other.
 */
export async function mergeMembers(keepId: string, removeId: string): Promise<ActionResult<{ keepId: string; filled: string[] }>> {
    return safeAction(async () => {
        const me = await requireRole("admin", "editor");
        assertId(keepId);
        assertId(removeId);
        if (keepId === removeId) throw new ActionError("اختر سجلين مختلفين");

        const result = await getDb().transaction(async (tx) => {
            const rows = await tx.select().from(schema.members).where(inArray(schema.members.id, [keepId, removeId])).for("update");
            const keep = rows.find((r) => r.id === keepId);
            const remove = rows.find((r) => r.id === removeId);
            if (!keep || !remove) throw new ActionError("أحد السجلين لم يعد موجوداً");

            if ((await descendantIds(tx, keepId)).has(removeId) || (await descendantIds(tx, removeId)).has(keepId)) {
                throw new ActionError("لا يمكن دمج فرد مع أحد أصوله أو ذريته");
            }

            // ----- Parent / child links -----
            const r = schema.relationships;
            const links = await tx.select({ parentId: r.parentId, childId: r.childId }).from(r).where(or(eq(r.parentId, removeId), eq(r.childId, removeId)));
            const moved = links
                .map((l) => ({ parentId: l.parentId === removeId ? keepId : l.parentId, childId: l.childId === removeId ? keepId : l.childId }))
                .filter((l) => l.parentId !== l.childId);
            let linksMoved = 0;
            if (moved.length) linksMoved = (await tx.insert(r).values(moved).onConflictDoNothing().returning({ id: r.id })).length;
            await tx.delete(r).where(or(eq(r.parentId, removeId), eq(r.childId, removeId)));

            // ----- Marriages (either column) -----
            const m = schema.marriages;
            const keepMarriages = await tx.select().from(m).where(or(eq(m.memberId, keepId), eq(m.spouseId, keepId)));
            const partnerKeys = new Set(
                keepMarriages.map((x) => {
                    const other = x.memberId === keepId ? x.spouseId : x.memberId;
                    return other ? `id:${other}` : `name:${(x.spouseName ?? "").trim()}`;
                }),
            );
            const removeMarriages = await tx.select().from(m).where(or(eq(m.memberId, removeId), eq(m.spouseId, removeId)));
            let marriagesMoved = 0;
            for (const x of removeMarriages) {
                const other = x.memberId === removeId ? x.spouseId : x.memberId;
                const key = other ? `id:${other}` : `name:${(x.spouseName ?? "").trim()}`;
                if (other === keepId || other === removeId || partnerKeys.has(key)) {
                    await tx.delete(m).where(eq(m.id, x.id));
                    continue;
                }
                partnerKeys.add(key);
                await tx
                    .update(m)
                    .set(x.memberId === removeId ? { memberId: keepId } : { spouseId: keepId })
                    .where(eq(m.id, x.id));
                marriagesMoved++;
            }

            // ----- Every other reference to the removed record -----
            await tx.update(schema.users).set({ memberId: keepId }).where(eq(schema.users.memberId, removeId));
            await tx.update(schema.occasions).set({ memberId: keepId }).where(eq(schema.occasions.memberId, removeId));
            await tx.update(schema.events).set({ memberId: keepId }).where(eq(schema.events.memberId, removeId));
            await tx.update(schema.timelineEvents).set({ memberId: keepId }).where(eq(schema.timelineEvents.memberId, removeId));
            await tx.update(schema.memberChangeRequests).set({ memberId: keepId }).where(eq(schema.memberChangeRequests.memberId, removeId));
            await tx.update(schema.memberProposals).set({ parentId: keepId }).where(eq(schema.memberProposals.parentId, removeId));
            await tx.update(schema.memberProposals).set({ createdMemberId: keepId }).where(eq(schema.memberProposals.createdMemberId, removeId));

            // ----- Fill the kept record, then drop the duplicate -----
            const fill = fillFrom(keep, remove);
            // Delete first: the serial number is unique and may move to the kept record.
            await tx.delete(schema.members).where(eq(schema.members.id, removeId));
            if (Object.keys(fill).length) {
                await tx.update(schema.members).set(fill as Partial<typeof schema.members.$inferInsert>).where(eq(schema.members.id, keepId));
            }

            const filled = Object.keys(fill)
                .filter((k) => !/(Month|Day|Calendar)$/.test(k))
                .map((k) => MEMBER_FIELD_LABELS[k] ?? k);
            const parts = [`${linksMoved} رابط`, `${marriagesMoved} زواج`];
            if (filled.length) parts.push(`أُكملت: ${filled.join("، ")}`);
            await recordChange(tx, me, {
                action: "member.merge",
                memberId: keepId,
                memberName: keep.fullName,
                summary: `دمج السجل المكرر «${remove.fullName}» في «${keep.fullName}» (${parts.join(" — ")})`,
                before: { kept: memberSnapshot(keep), removedId: removeId, removed: memberSnapshot(remove), links, marriages: removeMarriages },
                after: fill as Record<string, unknown>,
            });
            return { keepId, filled };
        });

        revalidatePath("/portal/admin/tree");
        revalidatePath("/portal/admin/tree/checks");
        revalidatePath("/portal/admin/tree/history");
        revalidatePath("/portal/tree");
        revalidatePath(`/portal/members/${keepId}`);
        return result;
    });
}

