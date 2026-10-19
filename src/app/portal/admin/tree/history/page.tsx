import type { Metadata } from "next";
import Link from "next/link";
import { History, Search } from "lucide-react";
import { formatHijri } from "@/lib/dates";
import { listTreeChanges, type TreeChangeRow } from "@/lib/tree-history";
import { MEMBER_FIELD_LABELS, TREE_ACTIONS, formatFieldValue, isTreeAction, type TreeAction } from "@/lib/tree-history-labels";
import RestoreButton from "./RestoreButton";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "سجل تغييرات الشجرة" };

const timeFormat = new Intl.DateTimeFormat("ar-SA-u-nu-latn", { hour: "numeric", minute: "2-digit", timeZone: "Asia/Riyadh" });

const BADGE: Partial<Record<TreeAction, string>> = {
    "member.delete": "bg-red-50 text-red-700 border-red-200",
    "member.add": "bg-green-50 text-green-700 border-green-200",
    "member.merge": "bg-violet-50 text-violet-700 border-violet-200",
    "member.restore": "bg-sky-50 text-sky-700 border-sky-200",
    import: "bg-amber-50 text-amber-700 border-amber-200",
};

function Diff({ before, after }: { before: Record<string, unknown> | null; after: Record<string, unknown> | null }) {
    const keys = [...new Set([...Object.keys(before ?? {}), ...Object.keys(after ?? {})])];
    if (keys.length === 0) return null;
    return (
        <div className="mt-2 overflow-x-auto">
            <table className="w-full text-xs border border-line rounded-lg">
                <thead className="bg-cream text-muted">
                    <tr>
                        <th className="p-2 text-start font-bold">الحقل</th>
                        <th className="p-2 text-start font-bold">قبل</th>
                        <th className="p-2 text-start font-bold">بعد</th>
                    </tr>
                </thead>
                <tbody>
                    {keys.map((k) => (
                        <tr key={k} className="border-t border-line align-top">
                            <td className="p-2 font-bold text-deep whitespace-nowrap">{MEMBER_FIELD_LABELS[k] ?? k}</td>
                            <td className="p-2 text-red-700 line-through decoration-red-300 break-words max-w-xs">{formatFieldValue(k, before?.[k])}</td>
                            <td className="p-2 text-green-800 break-words max-w-xs">{formatFieldValue(k, after?.[k])}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function ChangeItem({ row }: { row: TreeChangeRow }) {
    const action = isTreeAction(row.action) ? row.action : null;
    const showDiff = row.action === "member.update" || (row.action === "member.restore" && !row.after?.member);
    const canRestore = Boolean(row.memberId && row.before && (row.action === "member.update" || row.action === "member.delete"));
    return (
        <li className="py-4 flex flex-col gap-2">
            <div className="flex flex-wrap items-start gap-x-3 gap-y-1">
                <span className={`px-2 py-0.5 rounded-full border text-xs font-bold ${(action && BADGE[action]) ?? "bg-cream text-deep border-sand"}`}>
                    {action ? TREE_ACTIONS[action] : row.action}
                </span>
                <div className="flex-1 min-w-0">
                    <p className="font-bold text-ink leading-relaxed">{row.summary}</p>
                    <p className="text-xs text-muted mt-0.5">
                        {formatHijri(row.createdAt)} · {timeFormat.format(row.createdAt)} — {row.actorName ?? "النظام"}
                    </p>
                </div>
                <div className="flex gap-2 shrink-0">
                    {row.memberId && row.action !== "member.delete" && (
                        <Link
                            href={`/portal/admin/tree?focus=${row.memberId}`}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-primary/10 text-primary-dark border border-primary/20 hover:bg-primary/20"
                        >
                            في الشجرة
                        </Link>
                    )}
                    {canRestore && (
                        <RestoreButton changeId={row.id} kind={row.action === "member.update" ? "update" : "delete"} name={row.memberName ?? "الفرد"} />
                    )}
                </div>
            </div>
            {showDiff && (
                <details className="group">
                    <summary className="cursor-pointer text-xs font-bold text-primary-dark">عرض التغييرات</summary>
                    <Diff before={row.before} after={row.after} />
                </details>
            )}
        </li>
    );
}

export default async function TreeHistoryPage({ searchParams }: { searchParams: Promise<{ q?: string; action?: string; page?: string }> }) {
    const params = await searchParams;
    const q = params.q?.trim() ?? "";
    const action = isTreeAction(params.action) ? params.action : undefined;
    const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
    const { rows, hasMore } = await listTreeChanges({ q, action, page });

    const pageHref = (p: number) => {
        const sp = new URLSearchParams();
        if (q) sp.set("q", q);
        if (action) sp.set("action", action);
        if (p > 1) sp.set("page", String(p));
        const s = sp.toString();
        return `/portal/admin/tree/history${s ? `?${s}` : ""}`;
    };

    return (
        <div className="max-w-5xl mx-auto font-display space-y-6">
            <div>
                <h1 className="text-3xl font-black tracking-tight text-ink">سجل تغييرات الشجرة</h1>
                <p className="text-muted mt-1">كل تعديل على الشجرة: من قام به ومتى وماذا تغيّر، مع إمكانية استعادة البيانات المعدّلة أو الأفراد المحذوفين.</p>
            </div>

            <form className="bg-white rounded-2xl border border-sand p-4 flex flex-col sm:flex-row gap-3" action="/portal/admin/tree/history">
                <label className="flex-1 flex items-center gap-2 border border-line rounded-lg px-3 bg-white">
                    <Search className="w-4 h-4 text-muted" />
                    <input name="q" defaultValue={q} placeholder="ابحث باسم الفرد…" className="flex-1 py-2 bg-transparent outline-none text-sm" />
                </label>
                <select name="action" defaultValue={action ?? ""} className="border border-line rounded-lg px-3 py-2 text-sm bg-white">
                    <option value="">كل أنواع التغييرات</option>
                    {(Object.keys(TREE_ACTIONS) as TreeAction[]).map((a) => (
                        <option key={a} value={a}>
                            {TREE_ACTIONS[a]}
                        </option>
                    ))}
                </select>
                <button type="submit" className="px-4 py-2 rounded-lg text-sm font-bold bg-deep text-white hover:bg-deep/90">
                    تصفية
                </button>
                {(q || action) && (
                    <Link href="/portal/admin/tree/history" className="px-4 py-2 rounded-lg text-sm font-bold border border-line text-muted hover:bg-cream text-center">
                        مسح
                    </Link>
                )}
            </form>

            <section className="bg-white rounded-2xl border border-sand px-5 md:px-6">
                {rows.length === 0 ? (
                    <div className="py-12 flex flex-col items-center gap-2 text-muted">
                        <History className="w-8 h-8" />
                        <p>{q || action ? "لا توجد تغييرات مطابقة." : "لم تُسجّل أي تغييرات بعد."}</p>
                    </div>
                ) : (
                    <ul className="divide-y divide-line">
                        {rows.map((row) => (
                            <ChangeItem key={row.id} row={row} />
                        ))}
                    </ul>
                )}
            </section>

            {(page > 1 || hasMore) && (
                <div className="flex justify-between">
                    {page > 1 ? (
                        <Link href={pageHref(page - 1)} className="px-4 py-2 rounded-lg text-sm font-bold border border-line bg-white hover:bg-cream">
                            → الأحدث
                        </Link>
                    ) : (
                        <span />
                    )}
                    {hasMore && (
                        <Link href={pageHref(page + 1)} className="px-4 py-2 rounded-lg text-sm font-bold border border-line bg-white hover:bg-cream">
                            الأقدم ←
                        </Link>
                    )}
                </div>
            )}
        </div>
    );
}
