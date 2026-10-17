"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, ExternalLink, Loader2, X } from "lucide-react";
import { approveChangeRequest, rejectChangeRequest } from "@/app/portal/admin/change-requests/actions";
import { unwrap } from "@/lib/action-result";
import { STATUS_LABELS, displayValue, fieldByKey } from "@/lib/change-requests";
import type { ChangeRequestRow } from "@/lib/data/change-requests";

type Request = ChangeRequestRow & { current: Record<string, string> | null };

const dateFormat = new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura", { dateStyle: "medium" });

function Value({ field, value }: { field: string; value: string | null | undefined }) {
    if (fieldByKey.get(field)?.kind === "photo") {
        return value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="size-14 rounded-lg object-cover border border-gray-200" />
        ) : (
            <span className="text-gray-400">بدون صورة</span>
        );
    }
    return <span className="break-words whitespace-pre-line">{displayValue(field, value)}</span>;
}

function RequestCard({ request }: { request: Request }) {
    const router = useRouter();
    const [note, setNote] = useState("");
    const [busy, setBusy] = useState<"approve" | "reject" | null>(null);
    const [error, setError] = useState("");
    const pending = request.status === "pending";

    const act = async (kind: "approve" | "reject") => {
        setBusy(kind);
        setError("");
        try {
            await unwrap((kind === "approve" ? approveChangeRequest : rejectChangeRequest)(request.id, note));
            router.refresh();
        } catch (e) {
            setError(e instanceof Error ? e.message : "تعذر الحفظ");
            setBusy(null);
        }
    };

    return (
        <li className="bg-white rounded-2xl border border-[#dbe6e0] p-5 space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <Link href={`/portal/members/${request.memberId}`} target="_blank" className="font-bold text-lg hover:text-primary inline-flex items-center gap-1.5">
                        {request.memberName}
                        <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                    <p className="text-xs text-[#618975] mt-0.5">
                        أرسله {request.requesterName} · {dateFormat.format(new Date(request.createdAt))}
                    </p>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${STATUS_LABELS[request.status].className}`}>
                    {STATUS_LABELS[request.status].label}
                </span>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-right text-xs text-[#618975] border-b border-gray-100">
                            <th className="py-2 pl-4 font-bold">الحقل</th>
                            {pending && <th className="py-2 pl-4 font-bold">الحالي</th>}
                            <th className="py-2 font-bold">{pending ? "المطلوب" : "القيمة المطلوبة"}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(request.changes).map(([key, value]) => (
                            <tr key={key} className="border-b border-gray-50 last:border-0 align-top">
                                <td className="py-2.5 pl-4 font-bold text-gray-600 whitespace-nowrap">{fieldByKey.get(key)?.label ?? key}</td>
                                {pending && (
                                    <td className="py-2.5 pl-4 text-gray-400 line-through decoration-gray-300">
                                        <Value field={key} value={request.current?.[key]} />
                                    </td>
                                )}
                                <td className="py-2.5 text-[#111814] font-medium">
                                    <Value field={key} value={value} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {request.note && (
                <p className="text-sm bg-[#f6f8f7] rounded-xl p-3">
                    <span className="font-bold">ملاحظة العضو: </span>
                    {request.note}
                </p>
            )}
            {!pending && request.reviewNote && (
                <p className="text-sm bg-[#f6f8f7] rounded-xl p-3">
                    <span className="font-bold">ملاحظة المراجعة: </span>
                    {request.reviewNote}
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
                            اعتماد وتطبيق
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

/** Staff review of members' change requests: what changes, from what, and a decision. */
export default function ChangeRequestsManager({ requests, emptyText }: { requests: Request[]; emptyText: string }) {
    if (requests.length === 0) {
        return <p className="text-sm text-gray-400 text-center py-16 border border-dashed border-gray-200 rounded-2xl bg-white">{emptyText}</p>;
    }
    return (
        <ul className="space-y-4">
            {requests.map((r) => (
                <RequestCard key={r.id} request={r} />
            ))}
        </ul>
    );
}
