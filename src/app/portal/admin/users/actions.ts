"use server";

import { ActionError, safeAction, type ActionResult } from "@/lib/action-result";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { requireRole } from "@/lib/auth/current";
import { generateTempPassword, hashPassword } from "@/lib/auth/password";
import { cleanUserInput, createUserRecord, type UserInput } from "@/lib/data/user-admin";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Creates an account and returns its one-time temporary password. */
export async function createUser(input: UserInput): Promise<ActionResult<{ tempPassword: string }>> {
    return safeAction(async () => {
        await requireRole("admin");
        const result = await createUserRecord(input);
        revalidatePath("/portal/admin/users");
        return result;
    });
}

export async function updateUser(id: string, input: UserInput & { status: string }): Promise<ActionResult<void>> {
    return safeAction(async () => {
        const me = await requireRole("admin");
        if (!UUID.test(id)) throw new ActionError("معرّف غير صالح");
        const values = await cleanUserInput(input, id);
        const status = input.status === "disabled" ? "disabled" : "active";
        // Never let an admin lock themselves out.
        if (me.userId === id && (values.role !== "admin" || status !== "active")) {
            throw new ActionError("لا يمكنك تعطيل حسابك أو تغيير دورك بنفسك");
        }
        await getDb().update(schema.users).set({ ...values, status }).where(eq(schema.users.id, id));
        revalidatePath("/portal/admin/users");
    });
}

export async function resetUserPassword(id: string): Promise<ActionResult<{ tempPassword: string }>> {
    return safeAction(async () => {
        await requireRole("admin");
        if (!UUID.test(id)) throw new ActionError("معرّف غير صالح");
        const tempPassword = generateTempPassword();
        const [row] = await getDb()
            .update(schema.users)
            .set({ passwordHash: await hashPassword(tempPassword) })
            .where(eq(schema.users.id, id))
            .returning({ id: schema.users.id });
        if (!row) throw new ActionError("المستخدم غير موجود");
        return { tempPassword };
    });
}
