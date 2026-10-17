"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle, User, Phone, Mail, GitBranch } from "lucide-react";
import type { JoinRequestRow, MemberOption } from "@/lib/data/users";
import { approveRequest, rejectRequest } from "@/app/portal/admin/approvals/actions";
import { TempPasswordNotice } from "@/components/admin/users/UsersManager";
import { unwrap } from "@/lib/action-result";

const inputClass = "w-full rounded-lg border border-[#dbe6e0] bg-white px-3 py-2 text-sm outline-none focus:border-primary";
const formatDate = (iso: string) =>
    new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura", { dateStyle: "medium" }).format(new Date(iso));

// Suggested username from the email's local part, else from the mobile number.
function suggestUsername(req: JoinRequestRow) {
    const fromEmail = req.email?.split("@")[0].toLowerCase().replace(/[^a-z0-9._-]/g, "");
    if (fromEmail && fromEmail.length >= 3) return fromEmail.slice(0, 32);
    const digits = req.mobile?.replace(/\D/g, "");
    return digits ? `u${digits.slice(-9)}` : "";
}

const STATUS = {
    pending: { label: "قيد المراجعة", className: "text-amber-700 bg-amber-50 border-amber-100" },
    approved: { label: "مقبول", className: "text-green-700 bg-green-50 border-green-100" },
    rejected: { label: "مرفوض", className: "text-red-700 bg-red-50 border-red-100" },
} as const;

function RequestCard({ req, members, onApproved }: { req: JoinRequestRow; members: MemberOption[]; onApproved: (who: string, pw: string) => void }) {
    const router = useRouter();
    const [username, setUsername] = useState(suggestUsername(req));
    const [memberId, setMemberId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [pending, startTransition] = useTransition();
    const status = STATUS[req.status];

    const run = (fn: () => Promise<void>) => {
        setError(null);
        startTransition(async () => {
            try {
                await fn();
                router.refresh();
            } catch (e) {
                setError(e instanceof Error ? e.message : "تعذر تنفيذ الإجراء");
            }
        });
    };

    return (
        <div className="bg-white border border-[#dbe6e0] rounded-xl p-5 space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-200">
                        <User className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="font-bold text-[#111814]">{req.fullName}</p>
                        <p className="text-xs text-[#618975]">طلب بتاريخ {formatDate(req.createdAt)}</p>
                    </div>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${status.className}`}>{status.label}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-[#111814]">
                <span className="flex items-center gap-2"><Phone className="w-4 h-4 text-gray-400" /><span dir="ltr">{req.mobile || "—"}</span></span>
                <span className="flex items-center gap-2"><Mail className="w-4 h-4 text-gray-400" /><span dir="ltr">{req.email || "—"}</span></span>
                <span className="flex items-center gap-2"><GitBranch className="w-4 h-4 text-gray-400" />{req.branch || "—"}</span>
            </div>
            {req.note && <p className="text-sm text-gray-600 bg-[#f6f8f7] rounded-lg p-3">{req.note}</p>}

            {req.status === "pending" && (
                <div className="border-t border-[#f0f4f2] pt-4 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <label className="block">
                            <span className="text-xs font-bold text-[#618975] mb-1 block">اسم المستخدم للحساب</span>
                            <input className={inputClass} dir="ltr" value={username} onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ""))} />
                        </label>
                        <label className="block">
                            <span className="text-xs font-bold text-[#618975] mb-1 block">ربطه بفرد في الشجرة (اختياري)</span>
                            <select className={inputClass} value={memberId ?? ""} onChange={(e) => setMemberId(e.target.value || null)}>
                                <option value="">لاحقاً</option>
                                {members.map((m) => (
                                    <option key={m.id} value={m.id}>{m.name}{m.serial ? ` (${m.serial})` : ""}</option>
                                ))}
                            </select>
                        </label>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <span className="text-xs font-bold text-red-600">{error}</span>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                disabled={pending}
                                onClick={() => {
                                    if (!confirm(`رفض طلب ${req.fullName}؟`)) return;
                                    run(() => unwrap(rejectRequest(req.id)));
                                }}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm font-bold hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
                            >
                                <XCircle className="w-4 h-4" />
                                رفض
                            </button>
                            <button
                                type="button"
                                disabled={pending || !username}
                                onClick={() =>
                                    run(async () => {
                                        const { tempPassword } = await unwrap(approveRequest(req.id, { username, memberId }));
                                        onApproved(`${req.fullName} (@${username})`, tempPassword);
                                    })
                                }
                                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary-dark disabled:opacity-50 cursor-pointer"
                            >
                                <CheckCircle className="w-4 h-4" />
                                {pending ? "جارٍ..." : "اعتماد وإنشاء حساب"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function ApprovalsManager({ requests, members }: { requests: JoinRequestRow[]; members: MemberOption[] }) {
    const [notice, setNotice] = useState<{ who: string; password: string } | null>(null);

    return (
        <div className="space-y-4">
            {notice && <TempPasswordNotice who={notice.who} password={notice.password} onClose={() => setNotice(null)} />}
            {requests.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border border-dashed border-[#dbe6e0] text-gray-400 text-sm">
                    لا توجد طلبات هنا.
                </div>
            ) : (
                requests.map((req) => (
                    <RequestCard key={req.id} req={req} members={members} onApproved={(who, password) => setNotice({ who, password })} />
                ))
            )}
        </div>
    );
}
