import "server-only";
import { and, count, desc, eq, inArray } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { ActionError } from "@/lib/action-result";
import { CHANGE_FIELDS, MARITAL_STATUS, fieldByKey, type ChangeRequestStatus } from "@/lib/change-requests";
import { setFileVisibility, storeFile } from "@/lib/files";

type MemberRow = typeof schema.members.$inferSelect;
type Values = Record<string, string>;

const FILE_URL = /^\/files\/([0-9a-f-]{36})$/i;
const DATA_URL = /^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/=]+)$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^\+?[0-9 ]{7,20}$/;

function readField(row: MemberRow, key: string): string {
    if (key.startsWith("socialLinks.")) {
        const name = key.slice("socialLinks.".length) as keyof typeof row.socialLinks;
        return row.socialLinks?.[name] ?? "";
    }
    const value = row[key as keyof MemberRow];
    return typeof value === "string" ? value : "";
}

/** The member's current values for every requestable field. */
export function currentValues(row: MemberRow): Values {
    return Object.fromEntries(CHANGE_FIELDS.map((f) => [f.key, readField(row, f.key)]));
}

/** Current values for several members at once, for showing old and new side by side. */
export async function currentValuesFor(memberIds: string[]): Promise<Map<string, Values>> {
    if (memberIds.length === 0) return new Map();
    const rows = await getDb().select().from(schema.members).where(inArray(schema.members.id, memberIds));
    return new Map(rows.map((r) => [r.id, currentValues(r)]));
}

export async function getMemberRow(memberId: string) {
    const [row] = await getDb().select().from(schema.members).where(eq(schema.members.id, memberId));
    return row ?? null;
}

/**
 * Validates a submitted form against the current record and keeps only real changes.
 * A new photo is stored as a members-only file; it becomes public once approved.
 */
export async function cleanChanges(input: unknown, current: Values, uploadedBy: string | null): Promise<Values> {
    if (!input || typeof input !== "object") throw new ActionError("بيانات غير صالحة");
    const raw = input as Record<string, unknown>;
    const changes: Values = {};

    for (const field of CHANGE_FIELDS) {
        if (!(field.key in raw)) continue;
        const value = typeof raw[field.key] === "string" ? (raw[field.key] as string).trim() : "";
        if (value === current[field.key]) continue;

        if (field.kind === "photo") {
            if (!value) {
                changes[field.key] = "";
                continue;
            }
            if (FILE_URL.test(value)) {
                changes[field.key] = value;
                continue;
            }
            const match = DATA_URL.exec(value);
            if (!match) throw new ActionError("الصورة غير صالحة");
            const { url } = await storeFile({
                name: `photo.${match[1].split("/")[1]}`,
                mimeType: match[1],
                data: Buffer.from(match[2], "base64"),
                visibility: "members",
                uploadedBy,
            });
            changes[field.key] = url;
            continue;
        }

        if (value.length > (field.max ?? 200)) throw new ActionError(`«${field.label}» أطول من المسموح`);
        if (value && field.kind === "email" && !EMAIL.test(value)) throw new ActionError("البريد الإلكتروني غير صالح");
        if (value && field.kind === "tel" && !PHONE.test(value)) throw new ActionError("رقم الجوال غير صالح");
        if (value && field.kind === "url" && !/^https?:\/\//i.test(value)) throw new ActionError(`«${field.label}» يجب أن يبدأ بـ https://`);
        if (value && field.kind === "select" && !(value in MARITAL_STATUS)) throw new ActionError(`«${field.label}» غير صالح`);
        changes[field.key] = value;
    }
    return changes;
}

/** Writes approved changes to the member record. */
export async function applyChanges(memberId: string, changes: Record<string, unknown>) {
    const row = await getMemberRow(memberId);
    if (!row) throw new ActionError("الفرد غير موجود في الشجرة");

    const update: Partial<typeof schema.members.$inferInsert> = {};
    const social = { ...(row.socialLinks ?? {}) } as Record<string, string | undefined>;
    let socialChanged = false;

    for (const [key, rawValue] of Object.entries(changes)) {
        if (!fieldByKey.has(key)) continue;
        const value = typeof rawValue === "string" && rawValue ? rawValue : null;
        if (key.startsWith("socialLinks.")) {
            social[key.slice("socialLinks.".length)] = value ?? undefined;
            socialChanged = true;
        } else if (key === "maritalStatus") {
            update.maritalStatus = value as MemberRow["maritalStatus"];
        } else {
            (update as Record<string, string | null>)[key] = value;
        }
    }
    if (socialChanged) update.socialLinks = social;

    const photo = changes.photoUrl;
    if (typeof photo === "string") {
        const match = FILE_URL.exec(photo);
        if (match) await setFileVisibility(match[1], "public");
    }
    if (Object.keys(update).length > 0) {
        await getDb().update(schema.members).set(update).where(eq(schema.members.id, memberId));
    }
}

export interface ChangeRequestRow {
    id: string;
    memberId: string;
    memberName: string;
    requesterName: string;
    changes: Record<string, string>;
    note: string | null;
    status: ChangeRequestStatus;
    reviewNote: string | null;
    createdAt: string;
    reviewedAt: string | null;
}

const columns = {
    id: schema.memberChangeRequests.id,
    memberId: schema.memberChangeRequests.memberId,
    memberName: schema.members.fullName,
    requesterName: schema.memberChangeRequests.requesterName,
    changes: schema.memberChangeRequests.changes,
    note: schema.memberChangeRequests.note,
    status: schema.memberChangeRequests.status,
    reviewNote: schema.memberChangeRequests.reviewNote,
    createdAt: schema.memberChangeRequests.createdAt,
    reviewedAt: schema.memberChangeRequests.reviewedAt,
};

function toRow(r: {
    createdAt: Date;
    reviewedAt: Date | null;
    changes: Record<string, unknown>;
} & Omit<ChangeRequestRow, "createdAt" | "reviewedAt" | "changes">): ChangeRequestRow {
    return {
        ...r,
        changes: r.changes as Record<string, string>,
        createdAt: r.createdAt.toISOString(),
        reviewedAt: r.reviewedAt?.toISOString() ?? null,
    };
}

export async function listChangeRequests(status: ChangeRequestStatus): Promise<ChangeRequestRow[]> {
    const rows = await getDb()
        .select(columns)
        .from(schema.memberChangeRequests)
        .innerJoin(schema.members, eq(schema.memberChangeRequests.memberId, schema.members.id))
        .where(eq(schema.memberChangeRequests.status, status))
        .orderBy(status === "pending" ? schema.memberChangeRequests.createdAt : desc(schema.memberChangeRequests.reviewedAt))
        .limit(100);
    return rows.map(toRow);
}

/** The member's most recent request, to show its status on their form. */
export async function latestRequestFor(memberId: string): Promise<ChangeRequestRow | null> {
    const [row] = await getDb()
        .select(columns)
        .from(schema.memberChangeRequests)
        .innerJoin(schema.members, eq(schema.memberChangeRequests.memberId, schema.members.id))
        .where(eq(schema.memberChangeRequests.memberId, memberId))
        .orderBy(desc(schema.memberChangeRequests.createdAt))
        .limit(1);
    return row ? toRow(row) : null;
}

export async function countPendingChanges(): Promise<number> {
    const [row] = await getDb()
        .select({ n: count() })
        .from(schema.memberChangeRequests)
        .where(eq(schema.memberChangeRequests.status, "pending"));
    return row?.n ?? 0;
}

export async function getPendingRequest(id: string) {
    const [row] = await getDb()
        .select()
        .from(schema.memberChangeRequests)
        .where(and(eq(schema.memberChangeRequests.id, id), eq(schema.memberChangeRequests.status, "pending")));
    return row ?? null;
}
