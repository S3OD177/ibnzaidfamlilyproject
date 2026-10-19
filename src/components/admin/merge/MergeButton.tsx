"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GitMerge, Loader2, X } from "lucide-react";
import { unwrap } from "@/lib/action-result";
import { confirmAction, toast } from "@/components/ui/feedback";
import { getMergeCandidates, mergeMembers, type MergeCandidate } from "@/app/portal/admin/tree/merge-actions";

/**
 * "دمج" for a possible-duplicate set: opens a side-by-side comparison of the records,
 * the person picks the one to keep, and the others are merged into it.
 */
export default function MergeButton({ ids, currentId }: { ids: string[]; currentId: string }) {
    const [open, setOpen] = useState(false);
    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-deep text-white hover:bg-deep/90"
            >
                <GitMerge className="w-3.5 h-3.5" />
                دمج
            </button>
            {open && <MergeDialog ids={ids} currentId={currentId} onClose={() => setOpen(false)} />}
        </>
    );
}

function MergeDialog({ ids, currentId, onClose }: { ids: string[]; currentId: string; onClose: () => void }) {
    const router = useRouter();
    const [candidates, setCandidates] = useState<MergeCandidate[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [keepId, setKeepId] = useState(currentId);
    const [removeIds, setRemoveIds] = useState<Set<string>>(() => new Set(ids.filter((id) => id !== currentId)));
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        let alive = true;
        unwrap(getMergeCandidates(ids))
            .then((list) => {
                if (!alive) return;
                setCandidates(list);
                const present = new Set(list.map((c) => c.id));
                const keep = present.has(currentId) ? currentId : list[0]?.id;
                setKeepId(keep);
                setRemoveIds(new Set(list.map((c) => c.id).filter((id) => id !== keep)));
            })
            .catch((e: Error) => alive && setError(e.message));
        return () => {
            alive = false;
        };
    }, [ids, currentId]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && !busy && onClose();
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [busy, onClose]);

    const chooseKeep = (id: string) => {
        setKeepId(id);
        setRemoveIds(new Set((candidates ?? []).map((c) => c.id).filter((c) => c !== id)));
    };
    const toggleRemove = (id: string) =>
        setRemoveIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });

    const keep = candidates?.find((c) => c.id === keepId);
    const toRemove = (candidates ?? []).filter((c) => c.id !== keepId && removeIds.has(c.id));

    const submit = async () => {
        if (!keep || toRemove.length === 0) return;
        const ok = await confirmAction({
            title: "دمج السجلات",
            message: `سيُحتفظ بسجل «${keep.name}» وتُنقل إليه روابط ${toRemove.length === 1 ? "السجل الآخر" : `${toRemove.length} سجلات`} وبياناته الناقصة، ثم يُحذف المكرر. لا يمكن التراجع إلا يدوياً.`,
            confirmLabel: "دمج",
            danger: true,
        });
        if (!ok) return;
        setBusy(true);
        try {
            const filled = new Set<string>();
            for (const c of toRemove) {
                const res = await unwrap(mergeMembers(keep.id, c.id));
                res.filled.forEach((f) => filled.add(f));
            }
            toast.success(filled.size ? `تم الدمج وأُكملت: ${[...filled].join("، ")}` : "تم دمج السجلات");
            onClose();
            router.refresh();
        } catch (e) {
            toast.error((e as Error).message);
            router.refresh();
        } finally {
            setBusy(false);
        }
    };

    // Rows where the records differ are highlighted.
    const differs = (key: string) => new Set((candidates ?? []).map((c) => c.fields.find((f) => f.key === key)?.value)).size > 1;

    return (
        <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-2 sm:p-4" onClick={() => !busy && onClose()}>
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="merge-title"
                dir="rtl"
                className="w-full max-w-4xl max-h-[92vh] flex flex-col bg-white rounded-2xl shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center gap-3 px-5 py-4 border-b border-line">
                    <GitMerge className="w-5 h-5 text-primary-dark" />
                    <h2 id="merge-title" className="font-heritage text-xl font-bold text-deep flex-1">دمج سجلات مكررة</h2>
                    <button type="button" onClick={onClose} disabled={busy} className="p-1.5 rounded-lg text-muted hover:bg-cream" aria-label="إغلاق">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="overflow-auto px-5 py-4 flex-1">
                    {error && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">{error}</p>}
                    {!candidates && !error && (
                        <div className="flex items-center justify-center gap-2 py-10 text-muted">
                            <Loader2 className="w-5 h-5 animate-spin" /> جارٍ التحميل…
                        </div>
                    )}
                    {candidates && (
                        <>
                            <p className="text-sm text-muted mb-3">
                                اختر السجل الذي يبقى. تُنقل إليه روابط الوالدين والأبناء والزيجات والحسابات المرتبطة، وتُكمل حقوله الفارغة من السجل المحذوف دون استبدال أي قيمة موجودة.
                            </p>
                            <table className="w-full text-sm border-collapse">
                                <thead>
                                    <tr>
                                        <th className="w-28" />
                                        {candidates.map((c) => {
                                            const isKeep = c.id === keepId;
                                            return (
                                                <th key={c.id} className={`p-2 align-top text-start border-b-2 ${isKeep ? "border-primary bg-primary/10" : "border-line"}`}>
                                                    <label className="flex items-center gap-2 cursor-pointer font-bold text-deep">
                                                        <input type="radio" name="keep" checked={isKeep} onChange={() => chooseKeep(c.id)} className="accent-primary" />
                                                        {isKeep ? "يبقى" : "احتفظ بهذا"}
                                                    </label>
                                                    {!isKeep && candidates.length > 2 && (
                                                        <label className="flex items-center gap-2 mt-1 text-xs font-normal text-muted cursor-pointer">
                                                            <input type="checkbox" checked={removeIds.has(c.id)} onChange={() => toggleRemove(c.id)} />
                                                            ادمجه في المختار
                                                        </label>
                                                    )}
                                                </th>
                                            );
                                        })}
                                    </tr>
                                </thead>
                                <tbody>
                                    {candidates[0].fields.map((f) => (
                                        <tr key={f.key} className={differs(f.key) ? "bg-amber-50/60" : ""}>
                                            <th className="p-2 text-start font-bold text-muted border-b border-line align-top">{f.label}</th>
                                            {candidates.map((c) => (
                                                <td key={c.id} className={`p-2 border-b border-line align-top break-words ${c.id === keepId ? "bg-primary/5" : ""}`}>
                                                    {f.key === "photoUrl" && c.fields.find((x) => x.key === f.key)?.value.startsWith("/") ? (
                                                        // eslint-disable-next-line @next/next/no-img-element
                                                        <img src={c.fields.find((x) => x.key === f.key)!.value} alt="" className="w-12 h-12 rounded-lg object-cover" />
                                                    ) : (
                                                        <span className="line-clamp-3">{c.fields.find((x) => x.key === f.key)?.value ?? "—"}</span>
                                                    )}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                    <Row label="الوالدان" candidates={candidates} keepId={keepId} value={(c) => c.parents.join("، ") || "—"} />
                                    <Row label="الأبناء" candidates={candidates} keepId={keepId} value={(c) => String(c.children)} />
                                    <Row label="الأزواج" candidates={candidates} keepId={keepId} value={(c) => c.spouses.join("، ") || "—"} />
                                    <Row label="حسابات مرتبطة" candidates={candidates} keepId={keepId} value={(c) => String(c.accounts)} />
                                </tbody>
                            </table>
                        </>
                    )}
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2 px-5 py-4 border-t border-line bg-cream/60 rounded-b-2xl">
                    <button type="button" onClick={onClose} disabled={busy} className="px-4 py-2 rounded-lg text-sm font-bold border border-line bg-white text-muted hover:bg-cream">
                        إلغاء
                    </button>
                    <button
                        type="button"
                        onClick={submit}
                        disabled={busy || !keep || toRemove.length === 0}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold bg-primary text-deep hover:bg-primary/90 disabled:opacity-50"
                    >
                        {busy && <Loader2 className="w-4 h-4 animate-spin" />}
                        {toRemove.length > 1 ? `دمج ${toRemove.length} سجلات` : "دمج"}
                    </button>
                </div>
            </div>
        </div>
    );
}

function Row({ label, candidates, keepId, value }: { label: string; candidates: MergeCandidate[]; keepId: string; value: (c: MergeCandidate) => string }) {
    return (
        <tr>
            <th className="p-2 text-start font-bold text-muted border-b border-line align-top">{label}</th>
            {candidates.map((c) => (
                <td key={c.id} className={`p-2 border-b border-line align-top ${c.id === keepId ? "bg-primary/5" : ""}`}>
                    {value(c)}
                </td>
            ))}
        </tr>
    );
}
