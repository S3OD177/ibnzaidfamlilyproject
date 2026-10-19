import "server-only";
import { and, desc, eq, ilike, or } from "drizzle-orm";
import { getDb, schema } from "@/db";
import type { CurrentUser } from "@/lib/auth/current";
import type { TreeAction } from "@/lib/tree-history-labels";

// Change history of the family tree (table tree_changes). Every tree mutation calls
// recordChange inside its own transaction, so a change and its history row are saved
// together.

type Db = ReturnType<typeof getDb>;
type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];
export type DbExecutor = Db | Tx;

export type MemberRow = typeof schema.members.$inferSelect;

export interface ChangeEntry {
    action: TreeAction;
    memberId?: string | null;
    memberName?: string | null;
    summary: string;
    before?: Record<string, unknown> | null;
    after?: Record<string, unknown> | null;
}

export async function recordChange(exec: DbExecutor, actor: Pick<CurrentUser, "userId" | "displayName" | "isDbUser"> | null, entry: ChangeEntry) {
    await exec.insert(schema.treeChanges).values({
        action: entry.action,
        memberId: entry.memberId ?? null,
        memberName: entry.memberName ?? null,
        summary: entry.summary.slice(0, 2000),
        before: entry.before ?? null,
        after: entry.after ?? null,
        actorId: actor?.isDbUser ? actor.userId : null,
        actorName: actor?.displayName ?? null,
    });
}

/** Member columns kept in history snapshots and restorable (everything but id and timestamps). */
export const MEMBER_COLUMNS = [
    "serialNumber",
    "fullName",
    "nickname",
    "gender",
    "status",
    "photoUrl",
    "birthYear",
    "birthMonth",
    "birthDay",
    "birthCalendar",
    "deathYear",
    "deathMonth",
    "deathDay",
    "deathCalendar",
    "mobile",
    "email",
    "location",
    "country",
    "maritalStatus",
    "occupation",
    "company",
    "education",
    "university",
    "socialLinks",
    "branch",
    "generationLabel",
    "siblingOrder",
    "councilRole",
    "councilOrder",
    "councilSince",
    "councilStatement",
    "bio",
    "interests",
    "isPublic",
    "privacy",
] as const satisfies readonly (keyof MemberRow)[];

export type MemberColumn = (typeof MEMBER_COLUMNS)[number];
export type MemberSnapshot = Partial<Pick<MemberRow, MemberColumn>>;

/** The member's stored values (no id or timestamps), safe to keep as JSON. */
export function memberSnapshot(row: MemberRow): MemberSnapshot {
    return Object.fromEntries(MEMBER_COLUMNS.map((k) => [k, row[k]])) as MemberSnapshot;
}

const same = (a: unknown, b: unknown) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

/** Only the fields that differ between two versions of a member, as { before, after }. */
export function memberDiff(before: MemberRow, after: MemberRow): { before: MemberSnapshot; after: MemberSnapshot } | null {
    const b: Record<string, unknown> = {};
    const a: Record<string, unknown> = {};
    for (const key of MEMBER_COLUMNS) {
        if (same(before[key], after[key])) continue;
        b[key] = before[key];
        a[key] = after[key];
    }
    return Object.keys(a).length ? { before: b as MemberSnapshot, after: a as MemberSnapshot } : null;
}

// ---------- Reading ----------

export interface TreeChangeRow {
    id: string;
    action: string;
    memberId: string | null;
    memberName: string | null;
    summary: string;
    before: Record<string, unknown> | null;
    after: Record<string, unknown> | null;
    actorName: string | null;
    createdAt: Date;
}

export const HISTORY_PAGE_SIZE = 50;

/** Newest first; q searches the person's name and the summary. */
export async function listTreeChanges({ q, action, page = 1 }: { q?: string; action?: TreeAction; page?: number }) {
    const t = schema.treeChanges;
    const conditions = [];
    const term = q?.trim().slice(0, 100);
    if (term) {
        const like = `%${term.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
        conditions.push(or(ilike(t.memberName, like), ilike(t.summary, like)));
    }
    if (action) conditions.push(eq(t.action, action));
    const where = conditions.length ? and(...conditions) : undefined;
    const rows = await getDb()
        .select({
            id: t.id,
            action: t.action,
            memberId: t.memberId,
            memberName: t.memberName,
            summary: t.summary,
            before: t.before,
            after: t.after,
            actorName: t.actorName,
            createdAt: t.createdAt,
        })
        .from(t)
        .where(where)
        .orderBy(desc(t.createdAt))
        .limit(HISTORY_PAGE_SIZE + 1)
        .offset((Math.max(1, page) - 1) * HISTORY_PAGE_SIZE);
    return { rows: rows.slice(0, HISTORY_PAGE_SIZE) as TreeChangeRow[], hasMore: rows.length > HISTORY_PAGE_SIZE };
}
