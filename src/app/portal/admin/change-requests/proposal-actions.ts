"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { ActionError, safeAction, type ActionResult } from "@/lib/action-result";
import { requireRole } from "@/lib/auth/current";
import { getPendingProposal } from "@/lib/data/proposals";
import { memberSnapshot, recordChange } from "@/lib/tree-history";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const ORDINALS = ["الأول", "الثاني", "الثالث", "الرابع", "الخامس", "السادس", "السابع", "الثامن", "التاسع", "العاشر"];

/** "الجيل الثالث" → "الجيل الرابع"; anything else (or past العاشر) → null. */
function nextGeneration(label: string | null): string | null {
    const match = /^\s*الجيل\s+(\S+)\s*$/.exec(label ?? "");
    if (!match) return null;
    const i = ORDINALS.indexOf(match[1]);
    return i >= 0 && i + 1 < ORDINALS.length ? `الجيل ${ORDINALS[i + 1]}` : null;
}

function revalidate() {
    revalidatePath("/portal/admin/change-requests");
    revalidatePath("/portal/admin/tree");
    revalidatePath("/portal/tree");
    revalidatePath("/portal/profile/propose");
}

/** Adds the proposed person to the tree under the parent, then marks the proposal approved. */
export async function approveProposal(id: string, note?: string): Promise<ActionResult<{ memberId: string }>> {
    return safeAction(async () => {
        const me = await requireRole("admin", "editor");
        if (!UUID.test(id)) throw new ActionError("معرّف غير صالح");

        const memberId = await getDb().transaction(async (tx) => {
            const p = schema.memberProposals;
            const [proposal] = await tx.select().from(p).where(and(eq(p.id, id), eq(p.requestStatus, "pending"))).for("update");
            if (!proposal) throw new ActionError("الطلب غير موجود أو تمت مراجعته");
            const [parent] = await tx.select().from(schema.members).where(eq(schema.members.id, proposal.parentId));
            if (!parent) throw new ActionError("الأب / الأم غير موجود في الشجرة");

            const calendar = proposal.birthCalendar ?? "hijri";
            const [created] = await tx
                .insert(schema.members)
                .values({
                    fullName: proposal.fullName,
                    gender: proposal.gender,
                    status: proposal.status,
                    birthYear: proposal.birthYear,
                    birthCalendar: calendar,
                    deathYear: proposal.deathYear,
                    deathCalendar: calendar,
                    generationLabel: nextGeneration(parent.generationLabel),
                    branch: parent.branch,
                })
                .returning();
            await tx.insert(schema.relationships).values({ parentId: parent.id, childId: created.id });

            const mother = proposal.motherName?.trim();
            let motherAdded = false;
            if (mother && parent.gender === "male") {
                const [existing] = await tx
                    .select({ id: schema.marriages.id })
                    .from(schema.marriages)
                    .where(and(eq(schema.marriages.memberId, parent.id), eq(schema.marriages.spouseName, mother)));
                if (!existing) {
                    await tx.insert(schema.marriages).values({ memberId: parent.id, spouseName: mother });
                    motherAdded = true;
                }
            }

            const word = created.gender === "female" ? "ابنةً" : "ابناً";
            await recordChange(tx, me, {
                action: "member.add",
                memberId: created.id,
                memberName: created.fullName,
                summary: `اعتماد مقترح ${proposal.requesterName}: إضافة ${created.fullName} ${word} لـ${parent.fullName}${motherAdded ? ` (وتسجيل الزوجة ${mother})` : ""}`,
                after: { member: memberSnapshot(created), parentId: parent.id, proposalId: proposal.id },
            });

            await tx
                .update(p)
                .set({
                    requestStatus: "approved",
                    createdMemberId: created.id,
                    reviewNote: note?.trim().slice(0, 1000) || null,
                    reviewedAt: new Date(),
                    reviewedBy: me.isDbUser ? me.userId : null,
                })
                .where(eq(p.id, id));
            return created.id;
        });

        revalidate();
        return { memberId };
    });
}

/** Declines the proposal; the note (optional) is shown to the member. */
export async function rejectProposal(id: string, note?: string): Promise<ActionResult<void>> {
    return safeAction(async () => {
        const me = await requireRole("admin", "editor");
        if (!UUID.test(id)) throw new ActionError("معرّف غير صالح");
        if (!(await getPendingProposal(id))) throw new ActionError("الطلب غير موجود أو تمت مراجعته");
        await getDb()
            .update(schema.memberProposals)
            .set({
                requestStatus: "rejected",
                reviewNote: note?.trim().slice(0, 1000) || null,
                reviewedAt: new Date(),
                reviewedBy: me.isDbUser ? me.userId : null,
            })
            .where(and(eq(schema.memberProposals.id, id), eq(schema.memberProposals.requestStatus, "pending")));
        revalidate();
    });
}
