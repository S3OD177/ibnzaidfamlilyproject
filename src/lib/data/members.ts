import "server-only";
import { and, asc, eq, ilike, inArray, isNotNull, or } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { rowToNodeData } from "@/lib/data/tree";
import type { Member } from "@/types/member";
import { canSee, readPrivacy, type Viewer } from "@/lib/privacy";

type MemberRow = typeof schema.members.$inferSelect;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isMemberId(id: string): boolean {
    return UUID.test(id);
}

/** "1380 هـ" / "15/3/1985 م"; only the year when day and month are unknown. */
export function formatMemberDate(year: number | null, month: number | null, day: number | null, calendar: string | null) {
    if (!year) return null;
    const suffix = calendar === "gregorian" ? "م" : "هـ";
    return day && month ? `${day}/${month}/${year} ${suffix}` : `${year} ${suffix}`;
}

export interface RelativeRef {
    id: string;
    name: string;
    gender: "male" | "female";
}

export interface MemberProfile {
    id: string;
    name: string;
    gender: "male" | "female";
    status: MemberRow["status"];
    photoUrl: string | null;
    branch: string | null;
    generation: string | null;
    birth: string | null;
    death: string | null;
    location: string | null;
    occupation: string | null;
    education: string | null;
    bio: string[];
    mobile: string | null;
    email: string | null;
    councilRole: string | null;
    councilSince: string | null;
    father: RelativeRef | null;
    mother: RelativeRef | null;
    spouses: string[];
    children: RelativeRef[];
}

const toRef = (row: Pick<MemberRow, "id" | "fullName" | "gender">): RelativeRef => ({
    id: row.id,
    name: row.fullName,
    gender: row.gender,
});

/**
 * One member with parents, spouses and children. Returns null for unknown ids and,
 * unless includePrivate is set, for members hidden from the public site.
 */
export async function getMemberProfile(id: string, viewer: Viewer, { includePrivate = false } = {}): Promise<MemberProfile | null> {
    if (!isMemberId(id)) return null;
    const db = getDb();
    const [row] = await db.select().from(schema.members).where(eq(schema.members.id, id));
    if (!row || (!includePrivate && row.isPublic !== 1)) return null;

    const [parentLinks, childLinks, marriageRows] = await Promise.all([
        db.select({ id: schema.relationships.parentId }).from(schema.relationships).where(eq(schema.relationships.childId, id)),
        db.select({ id: schema.relationships.childId }).from(schema.relationships).where(eq(schema.relationships.parentId, id)),
        db.select().from(schema.marriages).where(or(eq(schema.marriages.memberId, id), eq(schema.marriages.spouseId, id))),
    ]);

    const relativeIds = [
        ...parentLinks.map((l) => l.id),
        ...childLinks.map((l) => l.id),
        // The other person in each marriage, whichever column this member is in.
        ...marriageRows.map((m) => (m.memberId === id ? m.spouseId : m.memberId)).filter((s): s is string => Boolean(s)),
    ];
    const relatives = relativeIds.length
        ? await db
              .select({
                  id: schema.members.id,
                  fullName: schema.members.fullName,
                  gender: schema.members.gender,
                  birthYear: schema.members.birthYear,
              })
              .from(schema.members)
              .where(inArray(schema.members.id, relativeIds))
        : [];
    const byId = new Map(relatives.map((r) => [r.id, r]));

    const parents = parentLinks.map((l) => byId.get(l.id)).filter((r) => r !== undefined);
    const children = childLinks
        .map((l) => byId.get(l.id))
        .filter((r) => r !== undefined)
        .sort((a, b) => (a.birthYear ?? 9999) - (b.birthYear ?? 9999));

    const privacy = readPrivacy(row.privacy);
    const show = (field: keyof typeof privacy) => canSee(privacy[field], viewer, row.id);
    const father = parents.find((p) => p.gender === "male");
    const mother = parents.find((p) => p.gender === "female");

    return {
        id: row.id,
        name: row.fullName,
        gender: row.gender,
        status: row.status,
        photoUrl: show("photo") ? row.photoUrl : null,
        branch: row.branch,
        generation: row.generationLabel,
        birth: show("birthDate") ? formatMemberDate(row.birthYear, row.birthMonth, row.birthDay, row.birthCalendar) : null,
        death: row.status === "deceased" ? formatMemberDate(row.deathYear, row.deathMonth, row.deathDay, row.deathCalendar) : null,
        location: show("location") ? row.location : null,
        occupation: row.occupation,
        education: row.education,
        bio: (row.bio ?? "").split("\n").map((p) => p.trim()).filter(Boolean),
        mobile: show("mobile") ? row.mobile : null,
        email: show("email") ? row.email : null,
        councilRole: row.councilRole,
        councilSince: row.councilSince,
        father: father ? toRef(father) : null,
        mother: mother ? toRef(mother) : null,
        spouses: marriageRows
            .map((m) => {
                const otherId = m.memberId === id ? m.spouseId : m.memberId;
                return otherId ? byId.get(otherId)?.fullName : m.spouseName;
            })
            .filter((n): n is string => Boolean(n)),
        children: children.map(toRef),
    };
}

export interface CouncilMember {
    id: string;
    name: string;
    role: string;
    location: string | null;
    since: string | null;
    statement: string | null;
    photoUrl: string | null;
}

export async function getCouncilMembers(viewer: Viewer): Promise<CouncilMember[]> {
    const rows = await getDb()
        .select()
        .from(schema.members)
        .where(isNotNull(schema.members.councilRole))
        .orderBy(asc(schema.members.councilOrder), asc(schema.members.fullName));
    return rows
        .filter((row) => row.isPublic === 1)
        .map((row) => ({
            id: row.id,
            name: row.fullName,
            role: row.councilRole!,
            location: canSee(readPrivacy(row.privacy).location, viewer, row.id) ? row.location : null,
            since: row.councilSince,
            statement: row.councilStatement,
            photoUrl: canSee(readPrivacy(row.privacy).photo, viewer, row.id) ? row.photoUrl : null,
        }));
}

/** Full member record for the portal (includes non-public members), with parents, siblings and children. */
export async function getPortalMember(id: string, viewer: Viewer): Promise<(Member & { createdAt: Date; updatedAt: Date }) | null> {
    if (!isMemberId(id)) return null;
    const db = getDb();
    const [row] = await db.select().from(schema.members).where(eq(schema.members.id, id));
    if (!row) return null;

    const parentLinks = await db
        .select({ id: schema.relationships.parentId })
        .from(schema.relationships)
        .where(eq(schema.relationships.childId, id));
    const parentIds = parentLinks.map((l) => l.id);
    const [childLinks, siblingLinks] = await Promise.all([
        db.select({ id: schema.relationships.childId }).from(schema.relationships).where(eq(schema.relationships.parentId, id)),
        parentIds.length
            ? db.select({ id: schema.relationships.childId }).from(schema.relationships).where(inArray(schema.relationships.parentId, parentIds))
            : Promise.resolve([] as { id: string }[]),
    ]);

    const siblingIds = [...new Set(siblingLinks.map((l) => l.id))].filter((s) => s !== id);
    const allIds = [...new Set([...parentIds, ...childLinks.map((l) => l.id), ...siblingIds])];
    const relatives = allIds.length
        ? await db
              .select({ id: schema.members.id, fullName: schema.members.fullName, gender: schema.members.gender })
              .from(schema.members)
              .where(inArray(schema.members.id, allIds))
        : [];
    const byId = new Map(relatives.map((r) => [r.id, { id: r.id, label: r.fullName, gender: r.gender }]));
    const pick = (ids: string[]) => ids.map((i) => byId.get(i)).filter((r) => r !== undefined);

    // Strip what this viewer may not see; staff and the member themself see everything.
    const privacy = readPrivacy(row.privacy);
    const show = (field: keyof typeof privacy) => canSee(privacy[field], viewer, row.id);
    const data = rowToNodeData(row);
    return {
        ...data,
        photo: show("photo") ? data.photo : undefined,
        birthDate: show("birthDate") ? data.birthDate : undefined,
        location: show("location") ? data.location : undefined,
        country: show("location") ? data.country : undefined,
        mobile: show("mobile") ? data.mobile : undefined,
        email: show("email") ? data.email : undefined,
        socialMedia: show("social") ? data.socialMedia : undefined,
        website: show("social") ? data.website : undefined,
        id: row.id,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        relatives: {
            parents: pick(parentIds),
            siblings: pick(siblingIds),
            children: pick(childLinks.map((l) => l.id)),
        },
    };
}

export interface CouncilAdminRow {
    id: string;
    name: string;
    role: string;
    order: number | null;
    since: string | null;
    statement: string | null;
    location: string | null;
}

/** Every council member (public or not), in display order, for the admin page. */
export async function listCouncilForAdmin(): Promise<CouncilAdminRow[]> {
    const rows = await getDb()
        .select()
        .from(schema.members)
        .where(isNotNull(schema.members.councilRole))
        .orderBy(asc(schema.members.councilOrder), asc(schema.members.fullName));
    return rows.map((r) => ({
        id: r.id,
        name: r.fullName,
        role: r.councilRole!,
        order: r.councilOrder,
        since: r.councilSince,
        statement: r.councilStatement,
        location: r.location,
    }));
}

export interface DirectoryEntry {
    id: string;
    name: string;
    gender: "male" | "female";
    status: "alive" | "deceased" | "unknown";
    photo: string | null;
    branch: string | null;
    location: string | null;
    generation: string | null;
}

/** Members' directory: search by name, nickname or serial number, filter by branch. */
export async function listDirectory(filters: { q?: string; branch?: string }, viewer: Viewer): Promise<DirectoryEntry[]> {
    const q = filters.q?.trim().slice(0, 100);
    const pattern = q ? `%${q.replace(/[%_\\]/g, (c) => `\\${c}`)}%` : null;
    const conditions = [
        pattern
            ? or(ilike(schema.members.fullName, pattern), ilike(schema.members.nickname, pattern), eq(schema.members.serialNumber, q!))
            : undefined,
        filters.branch ? eq(schema.members.branch, filters.branch) : undefined,
    ].filter((c) => c !== undefined);
    const rows = await getDb()
        .select({
            privacy: schema.members.privacy,
            id: schema.members.id,
            name: schema.members.fullName,
            gender: schema.members.gender,
            status: schema.members.status,
            photo: schema.members.photoUrl,
            branch: schema.members.branch,
            location: schema.members.location,
            generation: schema.members.generationLabel,
        })
        .from(schema.members)
        .where(conditions.length ? and(...conditions) : undefined)
        .orderBy(asc(schema.members.fullName))
        .limit(200);
    return rows.map(({ privacy: stored, ...entry }) => {
        const privacy = readPrivacy(stored);
        return {
            ...entry,
            photo: canSee(privacy.photo, viewer, entry.id) ? entry.photo : null,
            location: canSee(privacy.location, viewer, entry.id) ? entry.location : null,
        };
    });
}

/** Branch names in use, for the directory filter. */
export async function listBranches(): Promise<string[]> {
    const rows = await getDb()
        .selectDistinct({ branch: schema.members.branch })
        .from(schema.members)
        .where(isNotNull(schema.members.branch))
        .orderBy(asc(schema.members.branch));
    return rows.map((r) => r.branch!).filter(Boolean);
}
