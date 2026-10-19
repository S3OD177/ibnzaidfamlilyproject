import "server-only";
import { ActionError } from "@/lib/action-result";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { DEMO_ACCOUNTS, credentialVersion, DEMO_IDS, ENV_ADMIN_ID, SESSION_COOKIE, isDemoLoginEnabled, isStaff, verifySessionToken, type Role } from "@/lib/auth/session";
import type { Viewer } from "@/lib/privacy";

export interface CurrentUser {
    userId: string;
    role: Role;
    displayName: string;
    memberId: string | null;
    /** false for the env admin and demo accounts, which have no users row */
    isDbUser: boolean;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * The signed-in user, re-checked against the database so a disabled account or a
 * changed role takes effect immediately. Returns null when signed out.
 */
export async function getSession(): Promise<CurrentUser | null> {
    const cookieStore = await cookies();
    const token = await verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
    if (!token) return null;

    if (UUID.test(token.userId)) {
        const [user] = await getDb().select().from(schema.users).where(eq(schema.users.id, token.userId));
        if (!user || user.status !== "active" || token.credentialVersion !== await credentialVersion(user.passwordHash)) return null;
        return {
            userId: user.id,
            role: user.role,
            displayName: user.displayName || user.username,
            memberId: user.memberId,
            isDbUser: true,
        };
    }
    if (token.userId === ENV_ADMIN_ID && process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD) {
        if (token.credentialVersion !== await credentialVersion(process.env.ADMIN_PASSWORD)) return null;
        return { userId: ENV_ADMIN_ID, role: "admin", displayName: process.env.ADMIN_USERNAME, memberId: null, isDbUser: false };
    }
    if (isDemoLoginEnabled() && (token.userId === DEMO_IDS.admin || token.userId === DEMO_IDS.member)) {
        const role: Role = token.userId === DEMO_IDS.admin ? "admin" : "member";
        if (token.credentialVersion !== await credentialVersion(DEMO_ACCOUNTS[role].password)) return null;
        // DEMO_MEMBER_ID links the demo member to a tree person, so "my profile" can be tried out.
        const demoMemberId = role === "member" && UUID.test(process.env.DEMO_MEMBER_ID ?? "") ? process.env.DEMO_MEMBER_ID! : null;
        return { userId: token.userId, role, displayName: role === "admin" ? "مدير تجريبي" : "عضو تجريبي", memberId: demoMemberId, isDbUser: false };
    }
    return null;
}

/** For server actions: throws unless the signed-in user has one of the roles. */
export async function requireRole(...roles: Role[]): Promise<CurrentUser> {
    const session = await getSession();
    if (!session || !roles.includes(session.role)) throw new ActionError("غير مصرح");
    return session;
}

/** Who is viewing, for the privacy rules in lib/privacy.ts. */
export async function getViewer(): Promise<Viewer> {
    const session = await getSession();
    if (!session) return { kind: "anon" };
    if (isStaff(session.role)) return { kind: "staff" };
    return { kind: "member", memberId: session.memberId };
}
