"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { ActionError, safeAction, type ActionResult } from "@/lib/action-result";
import { getSession } from "@/lib/auth/current";
import { cleanChanges, currentValues, getMemberRow } from "@/lib/data/change-requests";

/**
 * Sends the signed-in member's requested changes to their own tree record for review.
 * A newer request replaces one still pending, so staff always review the latest wish.
 */
export async function submitChangeRequest(input: { values: unknown; note?: string }): Promise<ActionResult<{ fields: number }>> {
    return safeAction(async () => {
        const session = await getSession();
        if (!session) throw new ActionError("سجّل الدخول أولاً");
        if (!session.memberId) throw new ActionError("حسابك غير مرتبط بملف في الشجرة بعد");
        const row = await getMemberRow(session.memberId);
        if (!row) throw new ActionError("ملفك غير موجود في الشجرة");

        const uploadedBy = session.isDbUser ? session.userId : null;
        const changes = await cleanChanges(input.values, currentValues(row), uploadedBy);
        if (Object.keys(changes).length === 0) throw new ActionError("لم تغيّر أي بيانات");
        const note = typeof input.note === "string" ? input.note.trim().slice(0, 1000) || null : null;

        const db = getDb();
        const pending = and(eq(schema.memberChangeRequests.memberId, row.id), eq(schema.memberChangeRequests.status, "pending"));
        const [existing] = await db.select({ id: schema.memberChangeRequests.id }).from(schema.memberChangeRequests).where(pending);
        const values = { changes, note, requesterName: session.displayName, requestedBy: uploadedBy };
        if (existing) {
            await db.update(schema.memberChangeRequests).set(values).where(eq(schema.memberChangeRequests.id, existing.id));
        } else {
            await db.insert(schema.memberChangeRequests).values({ ...values, memberId: row.id });
        }

        revalidatePath("/portal/profile/edit");
        revalidatePath("/portal/admin/change-requests");
        return { fields: Object.keys(changes).length };
    });
}
