"use server";

import { randomUUID } from "node:crypto";
import { eq, inArray } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { ActionError, safeAction, type ActionResult } from "@/lib/action-result";
import { requireRole } from "@/lib/auth/current";
import { recordChange } from "@/lib/tree-history";
import {
    MAX_IMPORT_ROWS,
    nameKey,
    planImport,
    rowCalendar,
    rowStatus,
    sanitizeRows,
    type ExistingMember,
    type ImportRow,
    type MemberRef,
} from "@/lib/import/family-import";

export type ImportMode = "merge" | "replace";

export interface ImportSummary {
    mode: ImportMode;
    created: number;
    updated: number;
    deleted: number;
    relationships: number;
    marriages: number;
    warnings: string[];
}

const MAX_WARNINGS = 200;
const CHUNK = 500;

function chunks<T>(list: T[], size = CHUNK): T[][] {
    const out: T[][] = [];
    for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size));
    return out;
}

type MemberInsert = typeof schema.members.$inferInsert;

/** Columns for a new member from an import row. */
function insertValues(row: ImportRow, id: string): MemberInsert {
    const cal = rowCalendar(row);
    const status = rowStatus(row);
    const deathYear = status === "deceased" ? row.deathYear : null;
    return {
        id,
        fullName: row.fullName,
        gender: row.gender ?? "male",
        status,
        serialNumber: row.serial,
        birthYear: row.birthYear,
        birthCalendar: row.birthYear !== null ? cal : null,
        deathYear,
        deathCalendar: deathYear !== null ? cal : null,
        generationLabel: row.generationLabel,
        branch: row.branch,
        location: row.location,
        mobile: row.mobile,
        email: row.email,
        siblingOrder: row.siblingOrder,
    };
}

/** Columns to change on an existing member: only cells that hold a value. */
function updateValues(row: ImportRow, current: { birthYear: number | null; deathYear: number | null }): Partial<MemberInsert> {
    const cal = rowCalendar(row);
    const set: Partial<MemberInsert> = { fullName: row.fullName, updatedAt: new Date() };
    if (row.gender) set.gender = row.gender;
    if (row.status || row.deathYear !== null) set.status = rowStatus(row);
    if (row.birthYear !== null) {
        set.birthYear = row.birthYear;
        set.birthCalendar = cal;
        // A different year makes the stored day/month meaningless.
        if (row.birthYear !== current.birthYear) Object.assign(set, { birthMonth: null, birthDay: null });
    }
    if (row.deathYear !== null && rowStatus(row) === "deceased") {
        set.deathYear = row.deathYear;
        set.deathCalendar = cal;
        if (row.deathYear !== current.deathYear) Object.assign(set, { deathMonth: null, deathDay: null });
    }
    if (row.status === "alive") Object.assign(set, { deathYear: null, deathMonth: null, deathDay: null, deathCalendar: null });
    if (row.generationLabel) set.generationLabel = row.generationLabel;
    if (row.branch) set.branch = row.branch;
    if (row.location) set.location = row.location;
    if (row.mobile) set.mobile = row.mobile;
    if (row.email) set.email = row.email;
    if (row.siblingOrder !== null) set.siblingOrder = row.siblingOrder;
    return set;
}

/**
 * Imports a family list in one transaction (admins only).
 * - "merge": rows whose serial matches a member update that member; others are added.
 * - "replace": every member, relationship and marriage is deleted first.
 * Fathers/mothers are resolved by serial, else by a unique exact name; spouse names
 * matching a member of the opposite gender become links, otherwise they stay names.
 */
export async function importFamily(input: unknown, modeInput: unknown): Promise<ActionResult<ImportSummary>> {
    return safeAction(async () => {
        const me = await requireRole("admin");
        if (modeInput !== "merge" && modeInput !== "replace") throw new ActionError("وضع الاستيراد غير صالح");
        const mode: ImportMode = modeInput;
        if (Array.isArray(input) && input.length > MAX_IMPORT_ROWS) throw new ActionError(`الحد الأقصى ${MAX_IMPORT_ROWS} صف`);
        const rows = sanitizeRows(input);
        if (rows.length === 0) throw new ActionError("لا توجد صفوف للاستيراد");

        const db = getDb();

        return db.transaction(async (tx) => {
            // Current tree (merge mode), read inside the transaction.
            const currentMembers =
                mode === "merge"
                    ? await tx
                          .select({
                              id: schema.members.id,
                              serial: schema.members.serialNumber,
                              name: schema.members.fullName,
                              gender: schema.members.gender,
                              birthYear: schema.members.birthYear,
                              deathYear: schema.members.deathYear,
                          })
                          .from(schema.members)
                    : [];
            const existing: ExistingMember[] = currentMembers.map(({ id, serial, name, gender }) => ({ id, serial, name, gender }));

            const plan = planImport(rows, existing);
            if (plan.errorCount > 0) {
                const first = [
                    ...plan.general.filter((g) => g.level === "error").map((g) => g.message),
                    ...plan.rows.flatMap((p, i) => p.issues.filter((x) => x.level === "error").map((x) => `السطر ${rows[i].line}: ${x.message}`)),
                ].slice(0, 5);
                throw new ActionError(`في الملف ${plan.errorCount} خطأ، صحّحها ثم أعد المحاولة. ${first.join(" — ")}`);
            }

            let deleted = 0;
            if (mode === "replace") {
                await tx.delete(schema.marriages);
                await tx.delete(schema.relationships);
                deleted = (await tx.delete(schema.members).returning({ id: schema.members.id })).length;
            }

            // Member ids for every row: the matched member, or a new id.
            const ids = plan.rows.map((p) => p.existingId ?? randomUUID());
            const idOf = (ref: MemberRef) => (ref.kind === "row" ? ids[ref.index] : ref.id);

            const newRows = rows.map((row, i) => ({ row, i })).filter(({ i }) => !plan.rows[i].existingId);
            for (const part of chunks(newRows)) {
                await tx.insert(schema.members).values(part.map(({ row, i }) => insertValues(row, ids[i])));
            }

            const currentById = new Map(currentMembers.map((m) => [m.id, m]));
            let updated = 0;
            for (let i = 0; i < rows.length; i++) {
                const existingId = plan.rows[i].existingId;
                if (!existingId) continue;
                await tx.update(schema.members).set(updateValues(rows[i], currentById.get(existingId)!)).where(eq(schema.members.id, existingId));
                updated++;
            }

            // ----- Parent links -----
            const genderById = new Map<string, "male" | "female">(currentMembers.map((m) => [m.id, m.gender]));
            rows.forEach((row, i) => {
                if (!plan.rows[i].existingId) genderById.set(ids[i], row.gender ?? "male");
                else if (row.gender) genderById.set(ids[i], row.gender);
            });

            const links: { parentId: string; childId: string }[] = [];
            const updatedChildren = new Map<string, { father?: string; mother?: string }>();
            plan.rows.forEach((p, i) => {
                const childId = ids[i];
                const father = p.father ? idOf(p.father) : undefined;
                const mother = p.mother ? idOf(p.mother) : undefined;
                if (father) links.push({ parentId: father, childId });
                if (mother) links.push({ parentId: mother, childId });
                if (p.existingId && (father || mother)) updatedChildren.set(childId, { father, mother });
            });

            // Merge mode: an updated member's old father (or mother) link is replaced by the new one.
            if (updatedChildren.size) {
                const old = await tx
                    .select({ id: schema.relationships.id, parentId: schema.relationships.parentId, childId: schema.relationships.childId })
                    .from(schema.relationships)
                    .where(inArray(schema.relationships.childId, [...updatedChildren.keys()]));
                const stale = old
                    .filter((link) => {
                        const next = updatedChildren.get(link.childId)!;
                        const g = genderById.get(link.parentId);
                        const replacement = g === "female" ? next.mother : next.father;
                        return replacement !== undefined && replacement !== link.parentId;
                    })
                    .map((link) => link.id);
                for (const part of chunks(stale)) await tx.delete(schema.relationships).where(inArray(schema.relationships.id, part));
            }

            let relationshipCount = 0;
            for (const part of chunks(links)) {
                relationshipCount += (await tx.insert(schema.relationships).values(part).onConflictDoNothing().returning({ id: schema.relationships.id })).length;
            }

            // ----- Marriages -----
            const seen = new Set<string>();
            if (mode === "merge") {
                const current = await tx
                    .select({ memberId: schema.marriages.memberId, spouseId: schema.marriages.spouseId, spouseName: schema.marriages.spouseName })
                    .from(schema.marriages);
                for (const m of current) {
                    if (m.spouseId) seen.add([m.memberId, m.spouseId].sort().join("|"));
                    if (m.spouseName) seen.add(`${m.memberId}|name:${nameKey(m.spouseName)}`);
                }
            }
            const marriages: { memberId: string; spouseId: string | null; spouseName: string | null }[] = [];
            plan.rows.forEach((p, i) => {
                const memberId = ids[i];
                for (const spouse of p.spouses) {
                    if (spouse.kind === "name") {
                        const key = `${memberId}|name:${nameKey(spouse.name)}`;
                        if (seen.has(key)) continue;
                        seen.add(key);
                        marriages.push({ memberId, spouseId: null, spouseName: spouse.name });
                    } else {
                        const spouseId = idOf(spouse);
                        const key = [memberId, spouseId].sort().join("|");
                        if (spouseId === memberId || seen.has(key)) continue;
                        seen.add(key);
                        marriages.push({ memberId, spouseId, spouseName: null });
                    }
                }
            });
            for (const part of chunks(marriages)) await tx.insert(schema.marriages).values(part);

            const warnings = plan.rows
                .flatMap((p, i) => p.issues.filter((x) => x.level === "warning").map((x) => `السطر ${rows[i].line}: ${x.message}`))
                .slice(0, MAX_WARNINGS);

            const summary: ImportSummary = {
                mode,
                created: newRows.length,
                updated,
                deleted,
                relationships: relationshipCount,
                marriages: marriages.length,
                warnings,
            };
            await recordChange(tx, me, {
                action: "import",
                summary: [
                    mode === "replace" ? `استيراد كامل (استبدال ${deleted} فرد)` : "استيراد ودمج",
                    `${rows.length} صف`,
                    `أُضيف ${summary.created}`,
                    `حُدّث ${updated}`,
                    `${relationshipCount} رابط`,
                    `${marriages.length} زواج`,
                ].join(" — "),
                after: { mode, rows: rows.length, created: summary.created, updated, deleted, relationships: relationshipCount, marriages: marriages.length, warnings: warnings.length },
            });
            return summary;
        });
    });
}
