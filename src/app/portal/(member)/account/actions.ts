"use server";

import { ActionError, safeAction, type ActionResult } from "@/lib/action-result";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { getSession } from "@/lib/auth/current";
import { MIN_PASSWORD_LENGTH, hashPassword, verifyPassword } from "@/lib/auth/password";

export async function changePassword(input: { current: string; next: string }): Promise<ActionResult<void>> {
    return safeAction(async () => {
        const session = await getSession();
        if (!session?.isDbUser) throw new ActionError("هذا الحساب لا يملك كلمة مرور قابلة للتغيير");
        if (typeof input.next !== "string" || input.next.length < MIN_PASSWORD_LENGTH) {
            throw new ActionError(`كلمة المرور الجديدة يجب ألا تقل عن ${MIN_PASSWORD_LENGTH} أحرف`);
        }
        if (input.next.length > 200) throw new ActionError("كلمة المرور طويلة جداً");

        const db = getDb();
        const [user] = await db.select().from(schema.users).where(eq(schema.users.id, session.userId));
        if (!user || !(await verifyPassword(String(input.current ?? ""), user.passwordHash))) {
            throw new ActionError("كلمة المرور الحالية غير صحيحة");
        }
        await db.update(schema.users).set({ passwordHash: await hashPassword(input.next) }).where(eq(schema.users.id, user.id));
    });
}
