// Signed, expiring session cookie checked by proxy.ts and the portal layouts.
// Accounts for now: one admin from env vars (ADMIN_USERNAME / ADMIN_PASSWORD) plus,
// when DEMO_LOGIN=true, two public demo accounts. Replace with the users table later.
import { randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";

export const SESSION_COOKIE = "ft_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days, in seconds

export type Role = "admin" | "member";

// Temporary demo accounts; their credentials are shown on the login page while enabled.
export const DEMO_ACCOUNTS: Record<Role, { username: string; password: string }> = {
    admin: { username: "demo-admin", password: "demo-admin-2026" },
    member: { username: "demo-member", password: "demo-member-2026" },
};

export function isDemoLoginEnabled(): boolean {
    return process.env.DEMO_LOGIN === "true";
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
    const userOk = safeEqual(username, account.username);
    const passOk = safeEqual(password, account.password);
    return userOk && passOk;
}

export async function isAuthConfigured(): Promise<boolean> {
    const hasAccounts = Boolean(process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD) || isDemoLoginEnabled();
    return hasAccounts && Boolean(await getSecret());
}

/** Returns the role for valid credentials, or null. */
export function checkCredentials(username: string, password: string): Role | null {
    const adminUser = process.env.ADMIN_USERNAME;
    const adminPass = process.env.ADMIN_PASSWORD;
    if (adminUser && adminPass && matches(username, password, { username: adminUser, password: adminPass })) {
        return "admin";
    }
    if (isDemoLoginEnabled()) {
        if (matches(username, password, DEMO_ACCOUNTS.admin)) return "admin";
        if (matches(username, password, DEMO_ACCOUNTS.member)) return "member";
    }
    return null;
}

export async function createSessionToken(role: Role): Promise<string> {
    const secret = await getSecret();
    if (!secret) throw new Error("No session secret: set AUTH_SECRET or DATABASE_URL");
    const expires = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE;
    const payload = `${role}.${expires}`;
    return `${payload}.${await sign(payload, secret)}`;
}

/** Returns the session's role, or null when the token is missing, expired or forged. */
export async function verifySessionToken(token: string | undefined): Promise<Role | null> {
    if (!token) return null;
    const lastDot = token.lastIndexOf(".");
    if (lastDot === -1) return null;
    const payload = token.slice(0, lastDot);
    const signature = token.slice(lastDot + 1);
    const [role, expires] = payload.split(".");
    if ((role !== "admin" && role !== "member") || !(Number(expires) > Date.now() / 1000)) return null;
    const secret = await getSecret();
    if (!secret || !safeEqual(signature, await sign(payload, secret))) return null;
    return role;
}

export function homeForRole(role: Role): string {
    return role === "admin" ? "/portal/admin" : "/portal/members/me";
}
