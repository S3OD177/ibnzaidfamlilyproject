// Signed, expiring session cookie. Accounts come from the users table, plus an optional
// admin from env vars (ADMIN_USERNAME / ADMIN_PASSWORD) and, when DEMO_LOGIN=true,
// two public demo accounts. Routing (proxy.ts) trusts the signed token; pages and
// actions re-check the user in the database through getSession() in ./current.ts.
import { randomBytes } from "node:crypto";
import { eq, or, sql } from "drizzle-orm";
import { verifyPassword } from "@/lib/auth/password";

export const SESSION_COOKIE = "ft_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days, in seconds

export type Role = "admin" | "editor" | "member";
export const ROLES: readonly Role[] = ["admin", "editor", "member"];

/** Non-database accounts use fixed ids instead of a users.id UUID. */
export const ENV_ADMIN_ID = "env-admin";
export const DEMO_IDS: Record<"admin" | "member", string> = { admin: "demo-admin", member: "demo-member" };

// Temporary demo accounts; their credentials are shown on the login page while enabled.
export const DEMO_ACCOUNTS: Record<"admin" | "member", { username: string; password: string }> = {
    admin: { username: "demo-admin", password: "demo-admin-2026" },
    member: { username: "demo-member", password: "demo-member-2026" },
};

export interface TokenSession {
    userId: string;
    role: Role;
}

export function isDemoLoginEnabled(): boolean {
    return process.env.DEMO_LOGIN === "true";
}

/** Admins and editors work in /portal/admin; only admins manage users and approvals. */
export function isStaff(role: Role | null | undefined): boolean {
    return role === "admin" || role === "editor";
}

export function homeForRole(role: Role): string {
    return isStaff(role) ? "/portal/admin" : "/portal";
}

const encoder = new TextEncoder();
let cachedSecret: string | null = null;

// AUTH_SECRET from env if set; otherwise a random secret kept in the settings table,
// so no secret has to be configured by hand.
async function getSecret(): Promise<string | null> {
    const fromEnv = process.env.AUTH_SECRET;
    if (fromEnv && fromEnv.length >= 32) return fromEnv;
    if (cachedSecret) return cachedSecret;
    if (!process.env.DATABASE_URL) return null;

    const { getDb, schema } = await import("@/db");
    const db = getDb();
    await db
        .insert(schema.settings)
        .values({ key: "auth_secret", value: randomBytes(48).toString("base64url") })
        .onConflictDoNothing();
    const [row] = await db.select().from(schema.settings).where(eq(schema.settings.key, "auth_secret"));
    cachedSecret = typeof row?.value === "string" ? row.value : null;
    return cachedSecret;
}

async function sign(value: string, secret: string): Promise<string> {
    const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"],
    );
    const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
    return Buffer.from(signature).toString("base64url");
}

function safeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    let diff = 0;
    for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
    return diff === 0;
}

function matches(username: string, password: string, account: { username: string; password: string }) {
    // Evaluate both so timing doesn't reveal which one was wrong.
    const userOk = safeEqual(username.toLowerCase(), account.username.toLowerCase());
    const passOk = safeEqual(password, account.password);
    return userOk && passOk;
}

export async function isAuthConfigured(): Promise<boolean> {
    return Boolean(await getSecret());
}

/** Checks a username (or email) and password; returns the session to create, or null. */
export async function checkCredentials(username: string, password: string): Promise<TokenSession | null> {
    if (!username || !password) return null;

    if (process.env.DATABASE_URL) {
        const { getDb, schema } = await import("@/db");
        const db = getDb();
        const login = username.toLowerCase();
        const [user] = await db
            .select()
            .from(schema.users)
            .where(or(sql`lower(${schema.users.username}) = ${login}`, sql`lower(${schema.users.email}) = ${login}`))
            .limit(1);
        if (user) {
            const ok = await verifyPassword(password, user.passwordHash);
            if (!ok || user.status !== "active") return null;
            await db.update(schema.users).set({ lastLoginAt: new Date() }).where(eq(schema.users.id, user.id));
            return { userId: user.id, role: user.role };
        }
    }

    const adminUser = process.env.ADMIN_USERNAME;
    const adminPass = process.env.ADMIN_PASSWORD;
    if (adminUser && adminPass && matches(username, password, { username: adminUser, password: adminPass })) {
        return { userId: ENV_ADMIN_ID, role: "admin" };
    }
    if (isDemoLoginEnabled()) {
        if (matches(username, password, DEMO_ACCOUNTS.admin)) return { userId: DEMO_IDS.admin, role: "admin" };
        if (matches(username, password, DEMO_ACCOUNTS.member)) return { userId: DEMO_IDS.member, role: "member" };
    }
    return null;
}

export async function createSessionToken(session: TokenSession): Promise<string> {
    const secret = await getSecret();
    if (!secret) throw new Error("No session secret: set AUTH_SECRET or DATABASE_URL");
    const expires = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE;
    const payload = `${session.userId}.${session.role}.${expires}`;
    return `${payload}.${await sign(payload, secret)}`;
}

/** Returns the signed session, or null when the token is missing, expired or forged. */
export async function verifySessionToken(token: string | undefined): Promise<TokenSession | null> {
    if (!token) return null;
    const parts = token.split(".");
    if (parts.length !== 4) return null;
    const [userId, role, expires, signature] = parts;
    if (!ROLES.includes(role as Role) || !(Number(expires) > Date.now() / 1000)) return null;
    const secret = await getSecret();
    if (!secret || !safeEqual(signature, await sign(`${userId}.${role}.${expires}`, secret))) return null;
    return { userId, role: role as Role };
}
