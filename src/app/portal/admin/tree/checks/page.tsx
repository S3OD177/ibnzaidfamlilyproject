import type { Metadata } from "next";
import Link from "next/link";
import { AlertOctagon, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import MergeButton from "@/components/admin/merge/MergeButton";
import { getTreeChecks, type CheckSeverity, type TreeCheckGroup } from "@/lib/data/tree-checks";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "فحص بيانات الشجرة" };

const MAX_ITEMS = 50;

const SEVERITY: Record<CheckSeverity, { label: string; badge: string; icon: typeof Info; tile: string }> = {
    error: { label: "أخطاء", badge: "bg-red-50 text-red-700 border-red-200", icon: AlertOctagon, tile: "text-red-700" },
    warning: { label: "تنبيهات", badge: "bg-amber-50 text-amber-700 border-amber-200", icon: AlertTriangle, tile: "text-amber-700" },
    info: { label: "للمراجعة", badge: "bg-sky-50 text-sky-700 border-sky-200", icon: Info, tile: "text-sky-700" },
};

const SEVERITY_LABEL: Record<CheckSeverity, string> = { error: "خطأ", warning: "تنبيه", info: "معلومة" };

function ItemList({ group }: { group: TreeCheckGroup }) {
    const shown = group.items.slice(0, MAX_ITEMS);
    const rest = group.items.length - shown.length;
    return (
        <>
            <ul className="divide-y divide-line">
                {shown.map((it, i) => (
                    <li key={`${it.memberId}-${i}`} className="py-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                        <div className="flex-1 min-w-0">
                            <div className="font-bold text-ink truncate">{it.name}</div>
                            <div className="text-sm text-muted">{it.detail}</div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                            {it.duplicates && it.duplicates.length > 1 && <MergeButton ids={it.duplicates} currentId={it.memberId} />}
                            <Link
                                href={`/portal/admin/tree?focus=${it.memberId}`}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-primary/10 text-primary-dark border border-primary/20 hover:bg-primary/20"
                            >
                                عرض في الشجرة
                            </Link>
                            <Link
                                href={`/portal/members/${it.memberId}`}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-muted border border-line hover:bg-cream"
                            >
                                الملف
                            </Link>
                        </div>
                    </li>
                ))}
            </ul>
            {rest > 0 && <p className="text-sm text-muted pt-3">و {rest} أخرى</p>}
        </>
    );
}

function GroupCard({ group }: { group: TreeCheckGroup }) {
    const sev = SEVERITY[group.severity];
    const Icon = sev.icon;
    const header = (
        <div className="flex items-start gap-3">
            <Icon className={`w-5 h-5 mt-1 shrink-0 ${sev.tile}`} />
            <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-heritage text-xl font-bold text-deep">{group.title}</h2>
                    <span className={`px-2 py-0.5 rounded-full border text-xs font-bold ${sev.badge}`}>{SEVERITY_LABEL[group.severity]}</span>
                    <span className="px-2 py-0.5 rounded-full bg-cream border border-sand text-xs font-bold text-deep">{group.items.length}</span>
                </div>
                <p className="text-sm text-muted mt-1">{group.description}</p>
            </div>
        </div>
    );

    if (group.collapsed) {
        return (
            <details className="bg-white rounded-2xl border border-sand p-5 md:p-6 group">
                <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                    {header}
                    <span className="block text-xs font-bold text-primary-dark mt-3 group-open:hidden">إظهار القائمة</span>
                </summary>
                <div className="mt-4 border-t border-line pt-1">
                    <ItemList group={group} />
                </div>
            </details>
        );
    }

    return (
        <section className="bg-white rounded-2xl border border-sand p-5 md:p-6">
            {header}
            <div className="mt-4 border-t border-line pt-1">
                <ItemList group={group} />
            </div>
        </section>
    );
}

export default async function TreeChecksPage() {
    const groups = (await getTreeChecks()).filter((g) => g.items.length > 0);
    const totals: Record<CheckSeverity, number> = { error: 0, warning: 0, info: 0 };
    for (const g of groups) totals[g.severity] += g.items.length;
    const problems = totals.error + totals.warning;

    return (
        <div className="max-w-5xl mx-auto font-display space-y-6">
            <div>
                <h1 className="text-3xl font-black tracking-tight text-ink">فحص بيانات الشجرة</h1>
                <p className="text-muted mt-1">
                    مراجعة آلية لبيانات الشجرة تكشف التكرار والتواريخ غير الممكنة والروابط الناقصة، لتصحيحها قبل استيراد القائمة الكاملة وبعده.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(Object.keys(SEVERITY) as CheckSeverity[]).map((s) => {
                    const Icon = SEVERITY[s].icon;
                    return (
                        <div key={s} className="bg-white rounded-2xl border border-sand p-4 flex items-center gap-3">
                            <Icon className={`w-6 h-6 ${SEVERITY[s].tile}`} />
                            <div>
                                <div className={`text-2xl font-black ${SEVERITY[s].tile}`}>{totals[s]}</div>
                                <div className="text-sm text-muted">{SEVERITY[s].label}</div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {problems === 0 && (
                <div className="bg-white rounded-2xl border border-sand p-6 flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                    <div>
                        <div className="font-heritage text-xl font-bold text-deep">لا توجد مشاكل</div>
                        <p className="text-sm text-muted">
                            {totals.info > 0 ? "لم يُعثر على أخطاء أو تنبيهات. البنود أدناه للمراجعة فقط." : "لم يُعثر على أي ملاحظات في بيانات الشجرة."}
                        </p>
                    </div>
                </div>
            )}

            {groups.map((g) => (
                <GroupCard key={g.key} group={g} />
            ))}
        </div>
    );
}
