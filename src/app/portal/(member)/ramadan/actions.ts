"use server";
import { revalidatePath } from "next/cache";
import { eq, sql } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { requireRole } from "@/lib/auth/current";
import { ActionError, safeAction } from "@/lib/action-result";
import { extractRamadanXHandle } from "@/lib/ramadan-x";
import { competitionLive, roundState } from "@/lib/ramadan";

export async function submitRamadanAnswer(roundId: string, optionIndex: number, xAccount: string) {
    return safeAction(async () => {
        const me = await requireRole("member");
        if (!me.isDbUser) throw new ActionError("المشاركة متاحة للحسابات الفعلية فقط");
        if (!/^[0-9a-f-]{36}$/i.test(roundId) || !Number.isInteger(optionIndex)) throw new ActionError("إجابة غير صالحة");
        const xHandle = extractRamadanXHandle(xAccount);
        if (!xHandle) throw new ActionError("أدخل اسم مستخدم X صحيحاً، مثل @username");
        await getDb().transaction(async tx => {
            // Same row lock as admin controls: closing/publishing and submissions serialize.
            const [r] = await tx.select().from(schema.ramadanRounds).where(eq(schema.ramadanRounds.id,roundId)).for("update");
            if (!r) throw new ActionError("السؤال غير موجود");
            const [c] = await tx.select().from(schema.ramadanCompetitions).where(eq(schema.ramadanCompetitions.id,r.competitionId)).for("share");
            const [{ now }] = await tx.execute<{ now: string }>(sql`select clock_timestamp() as now`);
            const time = new Date(now).getTime();
            if (!c || !competitionLive(c,time) || roundState(r,time) !== "open") throw new ActionError("الإجابات غير متاحة الآن");
            if (optionIndex < 0 || optionIndex >= r.options.length) throw new ActionError("اختر إجابة صحيحة من الخيارات");
            const inserted = await tx.insert(schema.ramadanAnswers).values({ roundId, userId: me.userId, participantName: me.displayName, xHandle, optionIndex }).onConflictDoNothing().returning({ id: schema.ramadanAnswers.id });
            if (!inserted.length) throw new ActionError("سبق أن أرسلت إجابتك لهذا السؤال");
        });
        revalidatePath("/portal/ramadan"); revalidatePath("/portal/admin/ramadan");
    });
}
