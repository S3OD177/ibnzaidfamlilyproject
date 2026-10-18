"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { ActionError, safeAction, type ActionResult } from "@/lib/action-result";
import { getSession } from "@/lib/auth/current";
import { isStaff } from "@/lib/auth/session";
import { readPrivacy } from "@/lib/privacy";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Saves who may see each detail of a member, and whether the member appears on the
 * public site. Members change their own record (no approval needed: it only limits
 * what others see); admins and editors can change anyone's.
 */
export async function savePrivacy(memberId: string, input: { privacy: unknown; showOnPublicSite: boolean }): Promise<ActionResult<void>> {
    return safeAction(async () => {
        const session = await getSession();
        if (!session) throw new ActionError("سجّل الدخول أولاً");
        if (!UUID.test(memberId)) throw new ActionError("معرّف غير صالح");
        if (!isStaff(session.role) && session.memberId !== memberId) throw new ActionError("يمكنك تعديل خصوصية ملفك فقط");

        const result = await getDb()
            .update(schema.members)
            .set({ privacy: readPrivacy(input.privacy), isPublic: input.showOnPublicSite ? 1 : 0 })
            .where(eq(schema.members.id, memberId))
            .returning({ id: schema.members.id });
        if (result.length === 0) throw new ActionError("الفرد غير موجود");

        revalidatePath(`/portal/members/${memberId}`);
        revalidatePath(`/members/${memberId}`);
        revalidatePath("/council");
        revalidatePath("/");
    });
}
