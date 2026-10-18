"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowDownCircle, ArrowUpCircle, Paperclip, Trash2 } from "lucide-react";
import { deleteFundEntry } from "@/app/portal/admin/fund/actions";
import { unwrap } from "@/lib/action-result";
import { formatHijri } from "@/lib/dates";
import { formatSAR, type FundEntryView } from "@/lib/fund";
import { confirmAction, toast } from "@/components/ui/feedback";

/** The list of fund records; admins get a delete button and see hidden names. */
export default function FundLedger({ entries, canEdit = false }: { entries: FundEntryView[]; canEdit?: boolean }) {
    const router = useRouter();
    const [pending, start] = useTransition();
    if (entries.length === 0) return <p className="text-sm text-muted text-center py-10">لا توجد قيود بعد.</p>;

    return (
        <ul className="divide-y divide-sand">
            {entries.map((e) => {
                const income = e.kind === "income";
                const Icon = income ? ArrowDownCircle : ArrowUpCircle;
                return (
                    <li key={e.id} className="flex items-start gap-3 py-3">
                        <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${income ? "text-green-600" : "text-red-500"}`} />
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-ink">
                                {e.category}
                                <span className="text-muted font-normal text-sm">
                                    {" · "}
                                    {e.party ?? (e.partyHidden ? (income ? "فاعل خير" : "مستفيد") : "")}
                                    {canEdit && e.partyHidden && e.party && " (مخفي عن الأعضاء)"}
                                </span>
                            </p>
                            {e.description && <p className="text-sm text-gray-600 mt-0.5">{e.description}</p>}
                            <p className="text-xs text-muted mt-1 flex items-center gap-3">
                                {formatHijri(e.entryDate)}
                                {e.receiptFileId && (
                                    <a href={`/files/${e.receiptFileId}`} target="_blank" className="inline-flex items-center gap-1 text-primary-dark font-bold hover:underline">
                                        <Paperclip className="w-3 h-3" />
                                        الإيصال
                                    </a>
                                )}
                            </p>
                        </div>
                        <span className={`font-bold shrink-0 ${income ? "text-green-700" : "text-red-600"}`} dir="ltr">
                            {income ? "+" : "−"} {formatSAR(e.amount)}
                        </span>
                        {canEdit && (
                            <button
                                type="button"
                                disabled={pending}
                                aria-label="حذف القيد"
                                onClick={async () => {
                                    if (!(await confirmAction({ title: "حذف هذا القيد؟", message: `${e.category} · ${formatSAR(e.amount)}`, confirmLabel: "حذف", danger: true }))) return;
                                    start(async () => {
                                        try {
                                            await unwrap(deleteFundEntry(e.id));
                                            toast.success("تم حذف القيد");
                                            router.refresh();
                                        } catch (err) {
                                            toast.error(err instanceof Error ? err.message : "تعذر الحذف");
                                        }
                                    });
                                }}
                                className="p-1.5 text-gray-300 hover:text-red-600"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </li>
                );
            })}
        </ul>
    );
}
