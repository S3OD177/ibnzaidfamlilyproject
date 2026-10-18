"use server";

import { revalidatePath } from "next/cache";
import { and, eq, inArray } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { ActionError, safeAction, type ActionResult } from "@/lib/action-result";
import { getSession, requireRole } from "@/lib/auth/current";
import type { PollResults } from "@/lib/polls";
import { notifyMembers } from "@/lib/notify";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function refresh() {
    revalidatePath("/portal/polls");
    revalidatePath("/portal/admin/polls");
    revalidatePath("/portal");
}

/** Casts or replaces the signed-in person's ballot; an empty choice withdraws it. */
export async function vote(pollId: string, optionIds: string[]): Promise<ActionResult<void>> {
    return safeAction(async () => {
        const session = await getSession();
        if (!session) throw new ActionError("سجّل الدخول أولاً");
        if (!UUID.test(pollId)) throw new ActionError("معرّف غير صالح");
        const db = getDb();
        const [poll] = await db.select().from(schema.polls).where(eq(schema.polls.id, pollId));
        if (!poll) throw new ActionError("التصويت غير موجود");
        if (poll.closedAt || (poll.closesAt && poll.closesAt.getTime() <= Date.now())) throw new ActionError("أُغلق هذا التصويت");

        const chosen = [...new Set(optionIds)].filter((id) => UUID.test(id));
        if (!poll.multiple && chosen.length > 1) throw new ActionError("اختر خياراً واحداً");
        const valid = chosen.length
            ? await db.select({ id: schema.pollOptions.id }).from(schema.pollOptions).where(and(eq(schema.pollOptions.pollId, pollId), inArray(schema.pollOptions.id, chosen)))
            : [];
        if (valid.length !== chosen.length) throw new ActionError("خيار غير صالح");

        await db.transaction(async (tx) => {
            await tx.delete(schema.pollVotes).where(and(eq(schema.pollVotes.pollId, pollId), eq(schema.pollVotes.voterKey, session.userId)));
            if (valid.length) {
                await tx.insert(schema.pollVotes).values(valid.map((o) => ({ pollId, optionId: o.id, voterKey: session.userId, voterName: session.displayName })));
            }
        });
        refresh();
    });
}

export interface PollInput {
    question: string;
    description?: string;
    options: string[];
    multiple: boolean;
    anonymous: boolean;
    results: PollResults;
    closesAt?: string; // YYYY-MM-DD, closes at the end of that day (Riyadh)
}

export async function createPoll(input: PollInput): Promise<ActionResult<void>> {
    return safeAction(async () => {
        const me = await requireRole("admin", "editor");
        const question = input.question?.trim() ?? "";
        if (question.length < 5 || question.length > 300) throw new ActionError("السؤال بين 5 و300 حرف");
        const options = [...new Set((input.options ?? []).map((o) => o.trim()).filter(Boolean))].map((o) => o.slice(0, 150));
        if (options.length < 2 || options.length > 10) throw new ActionError("أضف من خيارين إلى عشرة خيارات");
        const results: PollResults = ["always", "after_vote", "after_close"].includes(input.results) ? input.results : "after_vote";
        const closesAt = input.closesAt && /^\d{4}-\d{2}-\d{2}$/.test(input.closesAt) ? new Date(`${input.closesAt}T23:59:59+03:00`) : null;
        if (closesAt && closesAt.getTime() <= Date.now()) throw new ActionError("تاريخ الإغلاق يجب أن يكون في المستقبل");

        await getDb().transaction(async (tx) => {
            const [poll] = await tx
                .insert(schema.polls)
                .values({
                    question,
                    description: input.description?.trim().slice(0, 1000) || null,
                    multiple: Boolean(input.multiple),
                    anonymous: Boolean(input.anonymous),
                    results,
                    closesAt,
                    createdBy: me.isDbUser ? me.userId : null,
                })
                .returning({ id: schema.polls.id });
            await tx.insert(schema.pollOptions).values(options.map((label, i) => ({ pollId: poll.id, label, sortOrder: i })));
        });
        refresh();
        await notifyMembers({ heading: "تصويت جديد", title: question, text: "شارك برأيك في البوابة.", path: "/portal/polls" });
    });
}

export async function closePoll(id: string): Promise<ActionResult<void>> {
    return safeAction(async () => {
        await requireRole("admin", "editor");
        if (!UUID.test(id)) throw new ActionError("معرّف غير صالح");
        await getDb().update(schema.polls).set({ closedAt: new Date() }).where(eq(schema.polls.id, id));
        refresh();
    });
}

export async function deletePoll(id: string): Promise<ActionResult<void>> {
    return safeAction(async () => {
        await requireRole("admin", "editor");
        if (!UUID.test(id)) throw new ActionError("معرّف غير صالح");
        await getDb().delete(schema.polls).where(eq(schema.polls.id, id));
        refresh();
    });
}
