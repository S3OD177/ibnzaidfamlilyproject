"use server";

import { ActionError, safeAction, type ActionResult } from "@/lib/action-result";
import { and, count, gt, or, sql } from "drizzle-orm";
import { getDb, schema } from "@/db";

export interface JoinInput {
    fullName: string;
    branch: string;
    mobile: string;
    email: string;
    note: string;
    website?: string; // honeypot: real visitors never see or fill this field
}

const text = (value: unknown, max: number) => (typeof value === "string" ? value.trim().slice(0, max) : "");
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Public: stores a membership request for an admin to review. */
export async function submitJoinRequest(input: JoinInput): Promise<ActionResult<null>> {
    return safeAction(async () => {
        if (text(input.website, 200)) return null; // bot; pretend it worked

        const fullName = text(input.fullName, 150);
        if (fullName.length < 3) throw new ActionError("اكتب الاسم الكامل");
        const mobile = text(input.mobile, 20).replace(/[^\d+]/g, "") || null;
        if (mobile && !/^\+?\d{9,15}$/.test(mobile)) throw new ActionError("رقم الجوال غير صالح");
        const email = text(input.email, 200).toLowerCase() || null;
        if (email && !EMAIL.test(email)) throw new ActionError("البريد الإلكتروني غير صالح");
        if (!mobile && !email) throw new ActionError("أدخل رقم الجوال أو البريد الإلكتروني للتواصل معك");

        const db = getDb();
        // At most 3 requests per contact per day.
        const [{ recent }] = await db
            .select({ recent: count() })
            .from(schema.membershipRequests)
            .where(
                and(
                    gt(schema.membershipRequests.createdAt, sql`now() - interval '1 day'`),
                    or(mobile ? sql`${schema.membershipRequests.mobile} = ${mobile}` : sql`false`, email ? sql`${schema.membershipRequests.email} = ${email}` : sql`false`),
                ),
            );
        if (recent >= 3) throw new ActionError("تم استلام طلبك مسبقاً، وسنتواصل معك قريباً");

        await db.insert(schema.membershipRequests).values({
            fullName,
            branch: text(input.branch, 100) || null,
            mobile,
            email,
            note: text(input.note, 1000) || null,
        });
        return null;
    });
}
