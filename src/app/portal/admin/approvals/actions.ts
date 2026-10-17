"use server";

import { ActionError, safeAction, type ActionResult } from "@/lib/action-result";
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { requireRole } from "@/lib/auth/current";
import { createUserRecord } from "@/lib/data/user-admin";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Approves a pending request by creating a member account; returns its temporary password. */
export async function approveRequest(
    id: string,
    input: { username: string; memberId: string | null },
): Promise<ActionResult<{ tempPassword: string }>> {
    return safeAction(async () => {
        const me = await requireRole("admin");
        if (!UUID.test(id)) throw new ActionError("معرّف غير صالح");
        const db = getDb();
        const [request] = await db
            .select()
            .from(schema.membershipRequests)
            .where(and(eq(schema.membershipRequests.id, id), eq(schema.membershipRequests.status, "pending")));
        if (!request) throw new ActionError("الطلب غير موجود أو تمت مراجعته");

        // createUserRecord validates the username/email and checks they are free.
        const { tempPassword } = await createUserRecord({
            username: input.username,
            displayName: request.fullName,
            email: request.email ?? "",
            role: "member",
            memberId: input.memberId,
        });

        await db
            .update(schema.membershipRequests)
            .set({ status: "approved", reviewedAt: new Date(), reviewedBy: me.isDbUser ? me.userId : null })
            .where(eq(schema.membershipRequests.id, id));
        revalidatePath("/portal/admin/approvals");
        revalidatePath("/portal/admin");
        return { tempPassword };
    });
}

export async function rejectRequest(id: string): Promise<ActionResult<void>> {
    return safeAction(async () => {
        const me = await requireRole("admin");
        if (!UUID.test(id)) throw new ActionError("معرّف غير صالح");
        await getDb()
            .update(schema.membershipRequests)
            .set({ status: "rejected", reviewedAt: new Date(), reviewedBy: me.isDbUser ? me.userId : null })
            .where(and(eq(schema.membershipRequests.id, id), eq(schema.membershipRequests.status, "pending")));
        revalidatePath("/portal/admin/approvals");
        revalidatePath("/portal/admin");
    });
}

