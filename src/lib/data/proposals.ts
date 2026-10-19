import "server-only";
import { and, count, desc, eq, inArray } from "drizzle-orm";
import { getDb, schema } from "@/db";
import type { ChangeRequestStatus } from "@/lib/change-requests";

export interface ProposalRow {
    id: string;
    parentId: string;
    parentName: string;
    parentGender: "male" | "female";
    fullName: string;
    gender: "male" | "female";
    status: "alive" | "deceased" | "unknown";
    birthYear: number | null;
    birthCalendar: "hijri" | "gregorian" | null;
    deathYear: number | null;
    motherName: string | null;
    note: string | null;
    requestStatus: ChangeRequestStatus;
    requesterName: string;
    reviewNote: string | null;
    createdMemberId: string | null;
    createdAt: string;
    reviewedAt: string | null;
}

const p = schema.memberProposals;

const columns = {
    id: p.id,
    parentId: p.parentId,
    parentName: schema.members.fullName,
    parentGender: schema.members.gender,
    fullName: p.fullName,
    gender: p.gender,
    status: p.status,
    birthYear: p.birthYear,
    birthCalendar: p.birthCalendar,
    deathYear: p.deathYear,
    motherName: p.motherName,
    note: p.note,
    requestStatus: p.requestStatus,
    requesterName: p.requesterName,
    reviewNote: p.reviewNote,
    createdMemberId: p.createdMemberId,
    createdAt: p.createdAt,
    reviewedAt: p.reviewedAt,
};

function toRow(r: Omit<ProposalRow, "createdAt" | "reviewedAt"> & { createdAt: Date; reviewedAt: Date | null }): ProposalRow {
    return { ...r, createdAt: r.createdAt.toISOString(), reviewedAt: r.reviewedAt?.toISOString() ?? null };
}

/** Proposals in one review state, with the proposed parent's name. */
export async function listProposals(status: ChangeRequestStatus): Promise<ProposalRow[]> {
    const rows = await getDb()
        .select(columns)
        .from(p)
        .innerJoin(schema.members, eq(p.parentId, schema.members.id))
        .where(eq(p.requestStatus, status))
        .orderBy(status === "pending" ? p.createdAt : desc(p.reviewedAt))
        .limit(100);
    return rows.map(toRow);
}

/** Proposals sent by one account, newest first. */
export async function myProposals(userId: string): Promise<ProposalRow[]> {
    const rows = await getDb()
        .select(columns)
        .from(p)
        .innerJoin(schema.members, eq(p.parentId, schema.members.id))
        .where(eq(p.requestedBy, userId))
        .orderBy(desc(p.createdAt))
        .limit(50);
    return rows.map(toRow);
}

export async function countPendingProposals(): Promise<number> {
    const [row] = await getDb().select({ n: count() }).from(p).where(eq(p.requestStatus, "pending"));
    return row?.n ?? 0;
}

export async function getPendingProposal(id: string) {
    const [row] = await getDb().select().from(p).where(and(eq(p.id, id), eq(p.requestStatus, "pending")));
    return row ?? null;
}

export interface ParentOption {
    id: string;
    name: string;
    gender: "male" | "female";
}

/**
 * People a member may add a child under: themself and all of their descendants,
 * found by walking parent → child links level by level.
 */
export async function allowedParents(memberId: string): Promise<ParentOption[]> {
    const db = getDb();
    const seen = new Set<string>([memberId]);
    const order: string[] = [memberId];
    let frontier = [memberId];
    while (frontier.length > 0 && seen.size < 5000) {
        const links = await db
            .select({ childId: schema.relationships.childId })
            .from(schema.relationships)
            .where(inArray(schema.relationships.parentId, frontier));
        frontier = [];
        for (const { childId } of links) {
            if (seen.has(childId)) continue;
            seen.add(childId);
            order.push(childId);
            frontier.push(childId);
        }
    }
    const rows = await db
        .select({ id: schema.members.id, name: schema.members.fullName, gender: schema.members.gender })
        .from(schema.members)
        .where(inArray(schema.members.id, order));
    const byId = new Map(rows.map((r) => [r.id, r]));
    return order.flatMap((id) => byId.get(id) ?? []);
}
