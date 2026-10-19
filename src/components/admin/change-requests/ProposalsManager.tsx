"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, ExternalLink, Loader2, X } from "lucide-react";
import { approveProposal, rejectProposal } from "@/app/portal/admin/change-requests/proposal-actions";
import { unwrap } from "@/lib/action-result";
import { STATUS_LABELS } from "@/lib/change-requests";
import type { ProposalRow } from "@/lib/data/proposals";
import { toast } from "@/components/ui/feedback";
import { formatHijri } from "@/lib/dates";

const CALENDAR = { hijri: "هـ", gregorian: "م" } as const;

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div>
            <dt className="text-xs text-muted">{label}</dt>
            <dd className="font-medium text-ink mt-0.5">{value}</dd>
        </div>
    );
}

function ProposalCard({ proposal }: { proposal: ProposalRow }) {
    const router = useRouter();
    const [note, setNote] = useState("");
    const [busy, setBusy] = useState<"approve" | "reject" | null>(null);
    const [error, setError] = useState("");
    const pending = proposal.requestStatus === "pending";
    const suffix = CALENDAR[proposal.birthCalendar ?? "hijri"];

    const act = async (kind: "approve" | "reject") => {
        setBusy(kind);
        setError("");
        try {
            if (kind === "approve") await unwrap(approveProposal(proposal.id, note));
            else await unwrap(rejectProposal(proposal.id, note));
            toast.success(kind === "approve" ? `تمت إضافة ${proposal.fullName} إلى الشجرة` : "تم رفض الطلب");
            router.refresh();
        } catch (e) {
            setError(e instanceof Error ? e.message : "تعذر الحفظ");
            setBusy(null);
        }
    };

    return (
        <li className="bg-white rounded-2xl border border-line p-5 space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <p className="font-bold text-lg">
                        {proposal.createdMemberId ? (
                            <Link href={`/portal/members/${proposal.createdMemberId}`} target="_blank" className="hover:text-primary">{proposal.fullName}</Link>
                        ) : proposal.fullName}
                        <span className="text-sm font-medium text-muted"> — {proposal.gender === "male" ? "ابن" : "ابنة"} </span>
                        <Link href={`/portal/admin/tree?focus=${proposal.parentId}`} target="_blank" className="text-sm font-bold text-primary-dark hover:underline inline-flex items-center gap-1">
                            {proposal.parentName}
                            <ExternalLink className="w-3 h-3" />
                        </Link>
                    </p>
                    <p className="text-xs text-muted mt-0.5">
                        أرسله {proposal.requesterName} · {formatHijri(proposal.createdAt)}
                    </p>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${STATUS_LABELS[proposal.requestStatus].className}`}>
                    {STATUS_LABELS[proposal.requestStatus].label}
                </span>
            </div>

            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <Detail label="الجنس" value={proposal.gender === "male" ? "ذكر" : "أنثى"} />
                <Detail label="الحالة" value={proposal.status === "deceased" ? "متوفى" : "على قيد الحياة"} />
                <Detail label="سنة الميلاد" value={proposal.birthYear ? `${proposal.birthYear} ${suffix}` : "—"} />
                {proposal.status === "deceased" && <Detail label="سنة الوفاة" value={proposal.deathYear ? `${proposal.deathYear} ${suffix}` : "—"} />}
                <Detail
                    label="الأم"
                    value={proposal.motherName ? (
                        <>
                            {proposal.motherName}
                            {pending && proposal.parentGender === "male" && <span className="block text-[11px] text-muted">تُضاف زوجةً للأب إن لم تكن مسجّلة</span>}
                        </>
                    ) : "—"}
                />
            </dl>

            {proposal.note && (
                <p className="text-sm bg-canvas rounded-xl p-3">
                    <span className="font-bold">ملاحظة العضو: </span>
                    {proposal.note}
                </p>
            )}
            {!pending && proposal.reviewNote && (
                <p className="text-sm bg-canvas rounded-xl p-3">
                    <span className="font-bold">ملاحظة المراجعة: </span>
                    {proposal.reviewNote}
                </p>
            )}

            {pending && (
                <div className="space-y-3 border-t border-gray-100 pt-4">
                    <input
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        maxLength={1000}
                        placeholder="ملاحظة للعضو (اختياري، تظهر له مع النتيجة)"
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary"
                    />
                    {error && <p className="text-sm font-bold text-red-600">{error}</p>}
                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => act("approve")}
                            disabled={busy !== null}
                            className="flex items-center gap-2 bg-primary text-white font-bold rounded-xl px-5 py-2.5 text-sm hover:bg-primary-dark disabled:opacity-50"
                        >
                            {busy === "approve" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                            اعتماد وإضافة للشجرة
                        </button>
                        <button
                            type="button"
                            onClick={() => act("reject")}
                            disabled={busy !== null}
                            className="flex items-center gap-2 bg-white border border-red-200 text-red-600 font-bold rounded-xl px-5 py-2.5 text-sm hover:bg-red-50 disabled:opacity-50"
                        >
                            {busy === "reject" ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                            رفض
                        </button>
                    </div>
                </div>
            )}
        </li>
    );
}

/** Staff review of members' proposals to add new people to the tree. */
export default function ProposalsManager({ proposals, emptyText }: { proposals: ProposalRow[]; emptyText: string }) {
    if (proposals.length === 0) {
        return <p className="text-sm text-gray-400 text-center py-10 border border-dashed border-gray-200 rounded-2xl bg-white">{emptyText}</p>;
    }
    return (
        <ul className="space-y-4">
            {proposals.map((p) => (
                <ProposalCard key={p.id} proposal={p} />
            ))}
        </ul>
    );
}
