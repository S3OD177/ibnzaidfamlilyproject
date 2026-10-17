import "server-only";
import { and, ne, or, sql } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { ActionError } from "@/lib/action-result";
import { generateTempPassword, hashPassword } from "@/lib/auth/password";
import { ROLES, type Role } from "@/lib/auth/session";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const USERNAME = /^[a-z0-9._-]{3,32}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const text = (value: unknown, max: number) => (typeof value === "string" ? value.trim().slice(0, max) : "");

export interface UserInput {
    username: string;
    displayName: string;
    email: string;
    role: string;
    memberId: string | null;
}

export async function cleanUserInput(input: UserInput, excludeId?: string) {
    const username = text(input.username, 32).toLowerCase();
    if (!USERNAME.test(username)) throw new ActionError("اسم المستخدم: 3-32 حرفاً إنجليزياً أو أرقاماً أو . _ -");
    const email = text(input.email, 200).toLowerCase() || null;
    if (email && !EMAIL.test(email)) throw new ActionError("البريد الإلكتروني غير صالح");
    if (!ROLES.includes(input.role as Role)) throw new ActionError("الدور غير صالح");
    const memberId = input.memberId && UUID.test(input.memberId) ? input.memberId : null;

    const db = getDb();
    const clash = or(
        sql`lower(${schema.users.username}) = ${username}`,
        email ? sql`lower(${schema.users.email}) = ${email}` : sql`false`,
    );
    const [taken] = await db
        .select({ username: schema.users.username, email: schema.users.email })
        .from(schema.users)
        .where(excludeId ? and(clash, ne(schema.users.id, excludeId)) : clash)
        .limit(1);
    if (taken) throw new ActionError(taken.username.toLowerCase() === username ? "اسم المستخدم مستخدم من قبل" : "البريد الإلكتروني مستخدم من قبل");

    return { username, email, displayName: text(input.displayName, 100) || null, role: input.role as Role, memberId };
}

/** Inserts a validated account and returns its one-time temporary password. Callers check permissions. */
export async function createUserRecord(input: UserInput): Promise<{ tempPassword: string }> {
    const values = await cleanUserInput(input);
    const tempPassword = generateTempPassword();
    await getDb().insert(schema.users).values({ ...values, passwordHash: await hashPassword(tempPassword) });
    return { tempPassword };
}
