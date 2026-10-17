// Single-admin session: a signed, expiring cookie checked by proxy.ts and the
// admin layout. Credentials and the signing secret come from env vars
// (ADMIN_USERNAME, ADMIN_PASSWORD, AUTH_SECRET). Replace with real user
// accounts once the backend exists.

export const SESSION_COOKIE = "ft_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days, in seconds

const encoder = new TextEncoder();

function getSecret(): string | null {
    const secret = process.env.AUTH_SECRET;
    return secret && secret.length >= 32 ? secret : null;
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

export function isAuthConfigured(): boolean {
    return Boolean(process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD && getSecret());
}

export function checkCredentials(username: string, password: string): boolean {
    const expectedUser = process.env.ADMIN_USERNAME;
    const expectedPass = process.env.ADMIN_PASSWORD;
    if (!expectedUser || !expectedPass) return false;
    // Evaluate both so timing doesn't reveal which one was wrong.
    const userOk = safeEqual(username, expectedUser);
    const passOk = safeEqual(password, expectedPass);
    return userOk && passOk;
}

export async function createSessionToken(): Promise<string> {
    const secret = getSecret();
    if (!secret) throw new Error("AUTH_SECRET is missing or shorter than 32 characters");
    const expires = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE;
    const payload = `admin.${expires}`;
    return `${payload}.${await sign(payload, secret)}`;
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
    const secret = getSecret();
    if (!token || !secret) return false;
    const lastDot = token.lastIndexOf(".");
    if (lastDot === -1) return false;
    const payload = token.slice(0, lastDot);
    const signature = token.slice(lastDot + 1);
    const [role, expires] = payload.split(".");
    if (role !== "admin" || !(Number(expires) > Date.now() / 1000)) return false;
    return safeEqual(signature, await sign(payload, secret));
}
