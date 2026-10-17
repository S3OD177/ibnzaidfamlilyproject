import "server-only";
import { asc, desc, eq } from "drizzle-orm";
import { getDb, schema } from "@/db";

export interface UserRow {
    id: string;
    username: string;
    displayName: string | null;
    email: string | null;
    role: "admin" | "editor" | "member";
    status: "active" | "disabled";
    memberId: string | null;
    memberName: string | null;
    lastLoginAt: string | null;
    createdAt: string;
}

export async function listUsers(): Promise<UserRow[]> {
    const rows = await getDb()
        .select({
            id: schema.users.id,
            username: schema.users.username,
            displayName: schema.users.displayName,
            email: schema.users.email,
            role: schema.users.role,
            status: schema.users.status,
            memberId: schema.users.memberId,
            memberName: schema.members.fullName,
            lastLoginAt: schema.users.lastLoginAt,
            createdAt: schema.users.createdAt,
        })
        .from(schema.users)
        .leftJoin(schema.members, eq(schema.users.memberId, schema.members.id))
        .orderBy(desc(schema.users.createdAt));
    return rows.map((r) => ({
        ...r,
        lastLoginAt: r.lastLoginAt?.toISOString() ?? null,
        createdAt: r.createdAt.toISOString(),
    }));
}

export interface MemberOption {
    id: string;
    name: string;
    serial: string | null;
}

/** Tree members for "link account to member" pickers. */
export async function listMemberOptions(): Promise<MemberOption[]> {
    const rows = await getDb()
        .select({ id: schema.members.id, name: schema.members.fullName, serial: schema.members.serialNumber })
        .from(schema.members)
        .orderBy(asc(schema.members.fullName));
    return rows;
}

export interface JoinRequestRow {
    id: string;
    fullName: string;
    branch: string | null;
    mobile: string | null;
    email: string | null;
    note: string | null;
    status: "pending" | "approved" | "rejected";
    createdAt: string;
    reviewedAt: string | null;
}

export async function listJoinRequests(status?: JoinRequestRow["status"]): Promise<JoinRequestRow[]> {
    const rows = await getDb()
        .select()
        .from(schema.membershipRequests)
        .where(status ? eq(schema.membershipRequests.status, status) : undefined)
        .orderBy(desc(schema.membershipRequests.createdAt));
    return rows.map((r) => ({
        id: r.id,
        fullName: r.fullName,
        branch: r.branch,
        mobile: r.mobile,
        email: r.email,
        note: r.note,
        status: r.status,
        createdAt: r.createdAt.toISOString(),
        reviewedAt: r.reviewedAt?.toISOString() ?? null,
    }));
}
