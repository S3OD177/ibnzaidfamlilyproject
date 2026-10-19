import "server-only";
import { canSee, readPrivacy, type Viewer } from "@/lib/privacy";
import { ActionError } from "@/lib/action-result";
import { asc } from "drizzle-orm";
import { getDb, schema } from "@/db";
import type { MemberDate } from "@/types/member";

type MemberRow = typeof schema.members.$inferSelect;
export type MemberInsert = typeof schema.members.$inferInsert;

// Shape the tree builder (FamilyNode / MemberModal) works with in node.data.
export interface TreeNodeData {
    label: string;
    gender: "male" | "female";
    status: "alive" | "deceased" | "unknown";
    role?: string;
    serialNumber?: string;
    photo?: string;
    nickname?: string;
    mobile?: string;
    email?: string;
    website?: string;
    location?: string;
    country?: string;
    maritalStatus?: "single" | "married" | "divorced" | "widowed";
    occupation?: string;
    company?: string;
    education?: string;
    university?: string;
    socialMedia?: { twitter?: string; linkedin?: string; instagram?: string; website?: string };
    branch?: string;
    siblingOrder?: string;
    bio?: string;
    interests?: string[];
    birthDate?: MemberDate;
    deathDate?: MemberDate;
}

export interface TreeMarriage {
    id: string;
    memberId: string;
    spouseId: string | null;
    spouseName: string | null;
}

export interface TreeData {
    nodes: { id: string; data: TreeNodeData }[];
    edges: { id: string; source: string; target: string }[];
    marriages: TreeMarriage[];
}

const marriageColumns = {
    id: schema.marriages.id,
    memberId: schema.marriages.memberId,
    spouseId: schema.marriages.spouseId,
    spouseName: schema.marriages.spouseName,
};

const MAX_TEXT = 2000;
const MAX_PHOTO = 1_500_000; // base64 data URL; moves to CranL storage later

function toDate(year: number | null, month: number | null, day: number | null, calendar: string | null): MemberDate | undefined {
    if (!year) return undefined;
    return {
        year: String(year),
        month: String(month ?? 1),
        day: String(day ?? 1),
        type: calendar === "gregorian" ? "Gregorian" : "Hijri",
    };
}

export function rowToNodeData(row: MemberRow): TreeNodeData {
    const social = row.socialLinks ?? {};
    return {
        label: row.fullName,
        gender: row.gender,
        status: row.status,
        role: row.generationLabel ?? undefined,
        serialNumber: row.serialNumber ?? undefined,
        photo: row.photoUrl ?? undefined,
        nickname: row.nickname ?? undefined,
        mobile: row.mobile ?? undefined,
        email: row.email ?? undefined,
        website: social.website,
        location: row.location ?? undefined,
        country: row.country ?? undefined,
        maritalStatus: row.maritalStatus ?? undefined,
        occupation: row.occupation ?? undefined,
        company: row.company ?? undefined,
        education: row.education ?? undefined,
        university: row.university ?? undefined,
        socialMedia: social,
        branch: row.branch ?? undefined,
        siblingOrder: row.siblingOrder != null ? String(row.siblingOrder) : undefined,
        bio: row.bio ?? undefined,
        interests: row.interests,
        birthDate: toDate(row.birthYear, row.birthMonth, row.birthDay, row.birthCalendar),
        deathDate: toDate(row.deathYear, row.deathMonth, row.deathDay, row.deathCalendar),
    };
}

// ---------- Input sanitising (data arrives from the browser) ----------

function str(value: unknown, max = MAX_TEXT): string | null {
    if (typeof value !== "string") return null;
    const trimmed = value.trim();
    return trimmed ? trimmed.slice(0, max) : null;
}

function int(value: unknown, min: number, max: number): number | null {
    const n = typeof value === "number" ? value : typeof value === "string" && value.trim() ? Number(value) : NaN;
    return Number.isInteger(n) && n >= min && n <= max ? n : null;
}

function pick<T extends string>(value: unknown, allowed: readonly T[]): T | null {
    return typeof value === "string" && (allowed as readonly string[]).includes(value) ? (value as T) : null;
}

function dateParts(value: unknown) {
    const d = (value ?? {}) as Partial<MemberDate>;
    const year = int(d.year, 1, 3000);
    return {
        year,
        month: year ? int(d.month, 1, 12) : null,
        day: year ? int(d.day, 1, 31) : null,
        calendar: year ? (d.type === "Gregorian" ? ("gregorian" as const) : ("hijri" as const)) : null,
    };
}

/** Converts untrusted node data from the editor into a members row. Throws on a missing name. */
export function nodeDataToRow(input: unknown): Omit<MemberInsert, "id"> {
    const data = (input ?? {}) as Record<string, unknown>;
    const fullName = str(data.label, 200);
    if (!fullName) throw new ActionError("الاسم مطلوب");

    const status = pick(data.status, ["alive", "deceased", "unknown"] as const) ?? "unknown";
    const birth = dateParts(data.birthDate);
    // The editor always carries a death date; only keep it for deceased members.
    const death = status === "deceased" ? dateParts(data.deathDate) : { year: null, month: null, day: null, calendar: null };
    const social = (data.socialMedia ?? {}) as Record<string, unknown>;
    const photo = typeof data.photo === "string" && data.photo.length <= MAX_PHOTO ? data.photo : null;

    return {
        fullName,
        gender: pick(data.gender, ["male", "female"] as const) ?? "male",
        status,
        generationLabel: str(data.role ?? data.generationMark, 100),
        serialNumber: str(data.serialNumber ?? data.serial, 50),
        photoUrl: photo,
        nickname: str(data.nickname, 100),
        mobile: str(data.mobile, 30),
        email: str(data.email, 200),
        location: str(data.location, 200),
        country: str(data.country, 10),
        maritalStatus: pick(data.maritalStatus, ["single", "married", "divorced", "widowed"] as const),
        occupation: str(data.occupation, 200),
        company: str(data.company, 200),
        education: str(data.education, 200),
        university: str(data.university, 200),
        socialLinks: {
            twitter: str(social.twitter, 300) ?? undefined,
            linkedin: str(social.linkedin, 300) ?? undefined,
            instagram: str(social.instagram, 300) ?? undefined,
            website: str(data.website ?? social.website, 300) ?? undefined,
        },
        branch: str(data.branch, 100),
        siblingOrder: int(data.siblingOrder, 0, 1000),
        bio: str(data.bio, 5000),
        interests: Array.isArray(data.interests)
            ? data.interests.map((i) => str(i, 100)).filter((i): i is string => Boolean(i)).slice(0, 50)
            : [],
        birthYear: birth.year,
        birthMonth: birth.month,
        birthDay: birth.day,
        birthCalendar: birth.calendar,
        deathYear: death.year,
        deathMonth: death.month,
        deathDay: death.day,
        deathCalendar: death.calendar,
    };
}

export async function getTreeData(): Promise<TreeData> {
    const db = getDb();
    const [memberRows, links, marriages] = await Promise.all([
        db.select().from(schema.members).orderBy(asc(schema.members.serialNumber), asc(schema.members.createdAt)),
        db.select().from(schema.relationships),
        db.select(marriageColumns).from(schema.marriages),
    ]);
    return {
        nodes: memberRows.map((row) => ({ id: row.id, data: rowToNodeData(row) })),
        edges: links.map((link) => ({ id: link.id, source: link.parentId, target: link.childId })),
        marriages,
    };
}

/** What a member sees on a tree card; contact details stay on the profile page. */
export type TreeViewNodeData = Pick<TreeNodeData, "label" | "gender" | "status" | "serialNumber" | "photo" | "role" | "branch"> & {
    siblingOrder: number | null;
    birthYear: number | null;
    deathYear: number | null;
    yearSuffix: "هـ" | "م";
};

export interface TreeViewData {
    nodes: { id: string; data: TreeViewNodeData }[];
    edges: { id: string; source: string; target: string }[];
    marriages: TreeMarriage[];
}

/** The whole tree for the members' read-only view. */
export async function getTreeView(viewer: Viewer): Promise<TreeViewData> {
    const db = getDb();
    const [memberRows, links, marriages] = await Promise.all([
        db.select().from(schema.members).orderBy(asc(schema.members.serialNumber), asc(schema.members.createdAt)),
        db.select().from(schema.relationships),
        db.select(marriageColumns).from(schema.marriages),
    ]);
    const nodes = memberRows.map((row) => {
        const privacy = readPrivacy(row.privacy);
        return {
            id: row.id,
            row,
            data: rowToNodeData(row),
            showPhoto: canSee(privacy.photo, viewer, row.id),
            showBirth: canSee(privacy.birthDate, viewer, row.id),
        };
    });
    const edges = links.map((link) => ({ id: link.id, source: link.parentId, target: link.childId }));
    return {
        nodes: nodes.map(({ id, row, data, showPhoto, showBirth }) => ({
            id,
            data: {
                label: data.label,
                gender: data.gender,
                status: data.status,
                serialNumber: data.serialNumber,
                photo: showPhoto ? data.photo : undefined,
                role: data.role,
                branch: data.branch,
                siblingOrder: row.siblingOrder,
                birthYear: showBirth ? row.birthYear : null,
                deathYear: row.status === "deceased" ? row.deathYear : null,
                yearSuffix: (showBirth ? row.birthCalendar : row.deathCalendar) === "gregorian" ? "م" : "هـ",
            },
        })),
        edges,
        marriages,
    };
}

