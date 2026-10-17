"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { ActionError, safeAction, type ActionResult } from "@/lib/action-result";
import { requireRole } from "@/lib/auth/current";
import { applyChanges, getPendingRequest } from "@/lib/data/change-requests";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function review(id: string, decision: "approved" | "rejected", note?: string) {
    const me = await requireRole("admin", "editor");
    if (!UUID.test(id)) throw new ActionError("معرّف غير صالح");
    const request = await getPendingRequest(id);
    if (!request) throw new ActionError("الطلب غير موجود أو تمت مراجعته");

    if (decision === "approved") await applyChanges(request.memberId, request.changes);
    await getDb()
        .update(schema.memberChangeRequests)
        .set({
            status: decision,
            reviewNote: note?.trim().slice(0, 1000) || null,
            reviewedAt: new Date(),
            reviewedBy: me.isDbUser ? me.userId : null,
        })
        .where(eq(schema.memberChangeRequests.id, id));

    revalidatePath("/portal/admin/change-requests");
    revalidatePath("/portal/admin/tree");
    revalidatePath(`/portal/members/${request.memberId}`);
    revalidatePath(`/members/${request.memberId}`);
}

/** Applies the requested changes to the member's record. */
export async function approveChangeRequest(id: string, note?: string): Promise<ActionResult<void>> {
    return safeAction(() => review(id, "approved", note));
}

/** Declines the request; the note (optional) is shown to the member. */
export async function rejectChangeRequest(id: string, note?: string): Promise<ActionResult<void>> {
    return safeAction(() => review(id, "rejected", note));
}
