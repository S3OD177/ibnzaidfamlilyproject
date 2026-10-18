// Family fund categories and shapes. Shared by client and server.

export type FundKind = "income" | "expense";

export const FUND_CATEGORIES: Record<FundKind, string[]> = {
    income: ["اشتراكات", "تبرعات", "أوقاف واستثمار", "أخرى"],
    expense: ["مساعدات اجتماعية", "تعليم ومنح", "فعاليات ومناسبات", "مصاريف إدارية", "أخرى"],
};

export interface FundEntryView {
    id: string;
    kind: FundKind;
    amount: number;
    entryDate: string;
    category: string;
    description: string | null;
    /** Payer or beneficiary; null when hidden from this viewer. */
    party: string | null;
    partyHidden: boolean;
    receiptFileId: string | null;
}

export interface FundSummary {
    balance: number;
    income: number;
    expense: number;
    yearIncome: number;
    yearExpense: number;
    hijriYear: number;
    incomeByCategory: { name: string; value: number }[];
    expenseByCategory: { name: string; value: number }[];
    entries: FundEntryView[];
}

export const formatSAR = (n: number) =>
    `${new Intl.NumberFormat("ar-SA-u-nu-latn", { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(n)} ر.س`;
