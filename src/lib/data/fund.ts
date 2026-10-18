import "server-only";
import { desc, eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import type { FundSummary } from "@/lib/fund";

const SETTINGS_KEY = "fund";

/** Whether members can see the fund page (off until the council approves). */
export async function isFundVisible(): Promise<boolean> {
    const [row] = await getDb().select().from(schema.settings).where(eq(schema.settings.key, SETTINGS_KEY));
    return Boolean((row?.value as { visibleToMembers?: boolean } | undefined)?.visibleToMembers);
}

export async function setFundVisible(visible: boolean) {
    await getDb()
        .insert(schema.settings)
        .values({ key: SETTINGS_KEY, value: { visibleToMembers: visible } })
        .onConflictDoUpdate({ target: schema.settings.key, set: { value: { visibleToMembers: visible } } });
}

const hijriYearOf = (iso: string) =>
    Number(new Intl.DateTimeFormat("en-u-ca-islamic-umalqura-nu-latn", { year: "numeric" }).format(new Date(`${iso}T12:00:00`)).replace(/\D/g, ""));

/** Balance, this Hijri year's totals, amounts by category and the ledger. */
export async function getFundSummary({ showHiddenParties = false } = {}): Promise<FundSummary> {
    const rows = await getDb().select().from(schema.fundEntries).orderBy(desc(schema.fundEntries.entryDate), desc(schema.fundEntries.createdAt));
    const hijriYear = hijriYearOf(new Date().toISOString().slice(0, 10));
    const sum = (list: typeof rows) => Math.round(list.reduce((t, r) => t + Number(r.amount), 0) * 100) / 100;
    const income = rows.filter((r) => r.kind === "income");
    const expense = rows.filter((r) => r.kind === "expense");
    const thisYear = (list: typeof rows) => list.filter((r) => hijriYearOf(r.entryDate) === hijriYear);
    const byCategory = (list: typeof rows) => {
        const totals = new Map<string, number>();
        for (const r of list) totals.set(r.category, (totals.get(r.category) ?? 0) + Number(r.amount));
        return [...totals.entries()].map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 })).sort((a, b) => b.value - a.value);
    };
    return {
        balance: Math.round((sum(income) - sum(expense)) * 100) / 100,
        income: sum(income),
        expense: sum(expense),
        yearIncome: sum(thisYear(income)),
        yearExpense: sum(thisYear(expense)),
        hijriYear,
        incomeByCategory: byCategory(income),
        expenseByCategory: byCategory(expense),
        entries: rows.slice(0, 200).map((r) => ({
            id: r.id,
            kind: r.kind,
            amount: Number(r.amount),
            entryDate: r.entryDate,
            category: r.category,
            description: r.description,
            party: r.partyHidden && !showHiddenParties ? null : r.party,
            partyHidden: r.partyHidden,
            receiptFileId: r.receiptFileId,
        })),
    };
}
