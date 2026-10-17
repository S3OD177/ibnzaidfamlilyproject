"use server";

import { ActionError, safeAction, type ActionResult } from "@/lib/action-result";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { requireRole } from "@/lib/auth/current";
import { DECISION_STATES } from "@/lib/data/decisions";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const text = (value: unknown, max: number) => (typeof value === "string" ? value.trim().slice(0, max) : "");

export interface DecisionInput {
    id?: string;
    referenceNumber: string;
    title: string;
    body: string;
    decisionType: string;
    hijriYear: string;
    issuedAt: string;
    keywords: string; // comma or Arabic-comma separated
    state: string;
    attachmentFileId: string | null;
}

export async function saveDecision(input: DecisionInput): Promise<ActionResult<{ id: string }>> {
    return safeAction(async () => {
        await requireRole("admin", "editor");
        if (input.id && !UUID.test(input.id)) throw new ActionError("معرّف غير صالح");
        const title = text(input.title, 300);
        if (!title) throw new ActionError("عنوان القرار مطلوب");
        const decisionType = text(input.decisionType, 50);
        if (!decisionType) throw new ActionError("اختر نوع القرار");
        const year = input.hijriYear ? Number(input.hijriYear) : null;
        if (year !== null && (!Number.isInteger(year) || year < 1300 || year > 1600)) throw new ActionError("السنة الهجرية غير صالحة");
        const issuedAt = /^\d{4}-\d{2}-\d{2}$/.test(input.issuedAt) ? input.issuedAt : null;
        const keywords = [...new Set(text(input.keywords, 500).split(/[,،]/).map((k) => k.trim()).filter(Boolean))].slice(0, 20);

        const values = {
            referenceNumber: text(input.referenceNumber, 50) || null,
            title,
            body: text(input.body, 50_000) || null,
            decisionType,
            hijriYear: year,
            issuedAt,
            keywords,
            state: (input.state in DECISION_STATES ? input.state : "active") as keyof typeof DECISION_STATES,
            attachmentFileId: input.attachmentFileId && UUID.test(input.attachmentFileId) ? input.attachmentFileId : null,
        };

        const db = getDb();
        let id = input.id;
        if (id) {
            const [row] = await db.update(schema.decisions).set(values).where(eq(schema.decisions.id, id)).returning({ id: schema.decisions.id });
            if (!row) throw new ActionError("القرار غير موجود");
        } else {
            [{ id }] = await db.insert(schema.decisions).values(values).returning({ id: schema.decisions.id });
        }
        revalidatePath("/portal/admin/decisions");
        return { id: id! };
    });
}

export async function deleteDecision(id: string): Promise<ActionResult<void>> {
    return safeAction(async () => {
        await requireRole("admin", "editor");
        if (!UUID.test(id)) throw new ActionError("معرّف غير صالح");
        await getDb().delete(schema.decisions).where(eq(schema.decisions.id, id));
        revalidatePath("/portal/admin/decisions");
    });
}
