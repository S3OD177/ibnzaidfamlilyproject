"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { ActionError, safeAction, type ActionResult } from "@/lib/action-result";
import { requireRole } from "@/lib/auth/current";
import { setFundVisible } from "@/lib/data/fund";
import { FUND_CATEGORIES, type FundKind } from "@/lib/fund";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function refresh() {
    revalidatePath("/portal/admin/fund");
    revalidatePath("/portal/fund");
}

export interface FundEntryInput {
    kind: FundKind;
    amount: string;
    entryDate: string;
    category: string;
    description?: string;
    party?: string;
    partyHidden?: boolean;
    receiptFileId?: string | null;
}

/** Admins only: money records are the council's responsibility. */
export async function addFundEntry(input: FundEntryInput): Promise<ActionResult<void>> {
    return safeAction(async () => {
        const me = await requireRole("admin");
        if (input.kind !== "income" && input.kind !== "expense") throw new ActionError("اختر نوع القيد");
        const amount = Number(String(input.amount).replace(/[,٬\s]/g, ""));
        if (!Number.isFinite(amount) || amount <= 0 || amount > 1e10) throw new ActionError("المبلغ غير صالح");
        if (!/^\d{4}-\d{2}-\d{2}$/.test(input.entryDate ?? "")) throw new ActionError("اختر التاريخ");
        if (!FUND_CATEGORIES[input.kind].includes(input.category)) throw new ActionError("اختر التصنيف");
        await getDb().insert(schema.fundEntries).values({
            kind: input.kind,
            amount: amount.toFixed(2),
            entryDate: input.entryDate,
            category: input.category,
            description: input.description?.trim().slice(0, 500) || null,
            party: input.party?.trim().slice(0, 150) || null,
            partyHidden: Boolean(input.partyHidden),
            receiptFileId: input.receiptFileId && UUID.test(input.receiptFileId) ? input.receiptFileId : null,
            createdBy: me.isDbUser ? me.userId : null,
        });
        refresh();
    });
}

export async function deleteFundEntry(id: string): Promise<ActionResult<void>> {
    return safeAction(async () => {
        await requireRole("admin");
        if (!UUID.test(id)) throw new ActionError("معرّف غير صالح");
        await getDb().delete(schema.fundEntries).where(eq(schema.fundEntries.id, id));
        refresh();
    });
}

/** Shows or hides the fund page for members (turn on after the council approves). */
export async function setFundVisibility(visible: boolean): Promise<ActionResult<void>> {
    return safeAction(async () => {
        await requireRole("admin");
        await setFundVisible(Boolean(visible));
        refresh();
        revalidatePath("/portal");
    });
}
