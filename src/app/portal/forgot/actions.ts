"use server";

import { createHash, randomBytes } from "node:crypto";
import { after } from "next/server";
import { and, count, eq, gt, isNotNull, or, sql } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { safeAction, type ActionResult } from "@/lib/action-result";
import { emailEnabled, siteUrl } from "@/lib/notify";
import { renderEmail, sendEmail } from "@/lib/email";
import { getSiteSettings } from "@/lib/settings";

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour
const MAX_TOKENS_PER_HOUR = 3;

/**
 * Starts a password reset for a username or email. Always answers the same way, so the
 * form never reveals whether an account exists. When a matching active account with an
 * email is found (and email is configured), a one-hour, single-use link is emailed.
 */
export async function requestPasswordReset(identifier: string): Promise<ActionResult<{ emailEnabled: boolean }>> {
    return safeAction(async () => {
        if (!emailEnabled()) return { emailEnabled: false };
        const value = typeof identifier === "string" ? identifier.trim().slice(0, 200) : "";
        if (!value) return { emailEnabled: true };

        const db = getDb();
        const [user] = await db
            .select({ id: schema.users.id, email: schema.users.email, displayName: schema.users.displayName, username: schema.users.username })
            .from(schema.users)
            .where(
                and(
                    eq(schema.users.status, "active"),
                    isNotNull(schema.users.email),
                    or(sql`lower(${schema.users.username}) = lower(${value})`, sql`lower(${schema.users.email}) = lower(${value})`),
                ),
            )
            .limit(1);

        if (user?.email) {
            const since = new Date(Date.now() - TOKEN_TTL_MS);
            const [{ recent }] = await db
                .select({ recent: count() })
                .from(schema.passwordResets)
                .where(and(eq(schema.passwordResets.userId, user.id), gt(schema.passwordResets.createdAt, since)));

            if (recent < MAX_TOKENS_PER_HOUR) {
                const token = randomBytes(32).toString("base64url");
                await db.insert(schema.passwordResets).values({
                    userId: user.id,
                    tokenHash: createHash("sha256").update(token).digest("hex"),
                    expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
                });
                const link = `${await siteUrl()}/portal/reset?token=${encodeURIComponent(token)}`;
                const to = user.email;
                const name = user.displayName || user.username;
                // Sent after the response so the answer time doesn't hint that an account exists.
                after(async () => {
                    const site = await getSiteSettings();
                    await sendEmail({
                        to,
                        subject: `استعادة كلمة المرور - ${site.siteName}`,
                        html: renderEmail({
                            siteName: site.siteName,
                            heading: "استعادة كلمة المرور",
                            title: `مرحباً ${name}`,
                            text: "وصلنا طلب لتعيين كلمة مرور جديدة لحسابك في بوابة العائلة. الرابط صالح لمدة ساعة واحدة ولمرة واحدة فقط.",
                            link,
                            linkLabel: "تعيين كلمة مرور جديدة",
                            footer: "إذا لم تطلب ذلك فتجاهل هذه الرسالة، ولن يتغير شيء في حسابك.",
                        }),
                    });
                });
            }
        }
        return { emailEnabled: true };
    });
}
