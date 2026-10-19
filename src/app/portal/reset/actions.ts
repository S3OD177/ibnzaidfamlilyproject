"use server";

import { createHash } from "node:crypto";
import { and, eq, gt, isNull } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { ActionError, safeAction, type ActionResult } from "@/lib/action-result";
import { MIN_PASSWORD_LENGTH, hashPassword } from "@/lib/auth/password";

const INVALID = "رابط الاستعادة غير صالح أو منتهي الصلاحية. اطلب رابطاً جديداً.";

/** Sets a new password from an emailed reset token; the token (and any other open ones) stop working. */
export async function resetPassword(input: { token: string; password: string; confirm: string }): Promise<ActionResult<void>> {
    return safeAction(async () => {
        const token = typeof input?.token === "string" ? input.token.trim() : "";
        const password = typeof input?.password === "string" ? input.password : "";
        if (!token || token.length > 200) throw new ActionError(INVALID);
        if (password.length < MIN_PASSWORD_LENGTH) throw new ActionError(`كلمة المرور يجب ألا تقل عن ${MIN_PASSWORD_LENGTH} أحرف`);
        if (password.length > 200) throw new ActionError("كلمة المرور طويلة جداً");
        if (password !== input.confirm) throw new ActionError("كلمتا المرور غير متطابقتين");

        const tokenHash = createHash("sha256").update(token).digest("hex");
        const passwordHash = await hashPassword(password);
        const now = new Date();

        await getDb().transaction(async (tx) => {
            // Claim the token atomically so it can only be used once.
            const [claimed] = await tx
                .update(schema.passwordResets)
                .set({ usedAt: now })
                .where(
                    and(
                        eq(schema.passwordResets.tokenHash, tokenHash),
                        isNull(schema.passwordResets.usedAt),
                        gt(schema.passwordResets.expiresAt, now),
                    ),
                )
                .returning({ userId: schema.passwordResets.userId });
            if (!claimed) throw new ActionError(INVALID);

            const [user] = await tx
                .update(schema.users)
                .set({ passwordHash })
                .where(and(eq(schema.users.id, claimed.userId), eq(schema.users.status, "active")))
                .returning({ id: schema.users.id });
            if (!user) throw new ActionError(INVALID);

            // Any other open links for this account stop working.
            await tx
                .update(schema.passwordResets)
                .set({ usedAt: now })
                .where(and(eq(schema.passwordResets.userId, claimed.userId), isNull(schema.passwordResets.usedAt)));
        });
    });
}
