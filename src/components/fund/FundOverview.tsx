import { PiggyBank, TrendingDown, TrendingUp } from "lucide-react";
import FundLedger from "./FundLedger";
import { formatSAR, type FundSummary } from "@/lib/fund";

function CategoryBars({ title, rows, tone }: { title: string; rows: { name: string; value: number }[]; tone: "income" | "expense" }) {
    const max = Math.max(1, ...rows.map((r) => r.value));
    return (
        <section className="bg-white rounded-2xl border border-sand p-5">
            <h2 className="font-heritage text-2xl font-bold text-deep mb-4">{title}</h2>
            {rows.length === 0 ? (
                <p className="text-sm text-muted">لا توجد قيود.</p>
            ) : (
                <ul className="space-y-2.5">
                    {rows.map((r) => (
                        <li key={r.name}>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="font-bold">{r.name}</span>
                                <span className="text-muted">{formatSAR(r.value)}</span>
                            </div>
                            <div className="h-2.5 rounded-full bg-cream overflow-hidden">
                                <div className={`h-full rounded-full ${tone === "income" ? "bg-green-500" : "bg-red-400"}`} style={{ width: `${(r.value / max) * 100}%` }} />
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}

/** Balance, this year's totals, categories and the ledger. */
export default function FundOverview({ summary, canEdit = false }: { summary: FundSummary; canEdit?: boolean }) {
    const cards = [
        { label: "الرصيد الحالي", value: summary.balance, icon: PiggyBank, strong: true },
        { label: `إيرادات ${summary.hijriYear}هـ`, value: summary.yearIncome, icon: TrendingUp },
        { label: `مصروفات ${summary.hijriYear}هـ`, value: summary.yearExpense, icon: TrendingDown },
    ];
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {cards.map(({ label, value, icon: Icon, strong }) => (
                    <div key={label} className={`relative overflow-hidden rounded-2xl p-5 ${strong ? "bg-deep text-white" : "bg-white border border-sand"}`}>
                        {strong && <div className="absolute inset-0 heritage-pattern opacity-10" />}
                        <Icon className={`relative w-5 h-5 mb-2 ${strong ? "text-primary" : "text-primary-dark"}`} />
                        <p className={`relative font-heritage font-bold text-3xl ${strong ? "text-primary" : "text-deep"}`}>{formatSAR(value)}</p>
                        <p className={`relative text-sm mt-1 ${strong ? "text-white/70" : "text-muted"}`}>{label}</p>
                    </div>
                ))}
            </div>
            <p className="text-xs text-muted">
                إجمالي الإيرادات منذ البداية {formatSAR(summary.income)}، وإجمالي المصروفات {formatSAR(summary.expense)}.
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CategoryBars title="مصادر الإيرادات" rows={summary.incomeByCategory} tone="income" />
                <CategoryBars title="أوجه الصرف" rows={summary.expenseByCategory} tone="expense" />
            </div>
            <section className="bg-white rounded-2xl border border-sand p-5">
                <h2 className="font-heritage text-2xl font-bold text-deep mb-2">سجل القيود</h2>
                <FundLedger entries={summary.entries} canEdit={canEdit} />
            </section>
        </div>
    );
}
