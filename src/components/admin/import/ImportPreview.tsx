"use client";

import { useMemo, useState } from "react";
import { AlertOctagon, AlertTriangle } from "lucide-react";
import { rowCalendar, rowStatus, type ExistingMember, type ImportPlan, type ImportRow, type SpouseRef } from "@/lib/import/family-import";

const PAGE = 200;
type Filter = "all" | "errors" | "warnings";

const STATUS_LABEL = { alive: "حي", deceased: "متوفى", unknown: "غير معروف" } as const;

/** The rows as they will be imported, with each row's problems. */
export default function ImportPreview({ rows, plan, existing }: { rows: ImportRow[]; plan: ImportPlan; existing: ExistingMember[] }) {
    const [filter, setFilter] = useState<Filter>(plan.errorCount ? "errors" : "all");
    const [limit, setLimit] = useState(PAGE);
    const existingName = useMemo(() => new Map(existing.map((m) => [m.id, m.name])), [existing]);

    const refName = (ref: SpouseRef | null) => {
        if (!ref) return "";
        if (ref.kind === "row") return rows[ref.index].fullName;
        if (ref.kind === "existing") return `${existingName.get(ref.id) ?? "؟"} (من الشجرة)`;
        return ref.name;
    };

    const visible = rows
        .map((row, i) => ({ row, p: plan.rows[i] }))
        .filter(({ p }) =>
            filter === "all" ? true : filter === "errors" ? p.issues.some((x) => x.level === "error") : p.issues.some((x) => x.level === "warning"),
        );

    const tab = (key: Filter, label: string, count?: number) => (
        <button
            type="button"
            onClick={() => {
                setFilter(key);
                setLimit(PAGE);
            }}
            className={`px-3 py-1.5 rounded-lg text-sm font-bold border cursor-pointer ${
                filter === key ? "bg-deep text-white border-deep" : "bg-white text-muted border-line hover:bg-cream"
            }`}
        >
            {label}
            {count !== undefined && ` (${count})`}
        </button>
    );

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
                {tab("all", "كل الصفوف", rows.length)}
                {tab("errors", "أخطاء", plan.errorCount)}
                {tab("warnings", "تنبيهات", plan.warningCount)}
            </div>
            <div className="overflow-x-auto rounded-xl border border-line bg-white">
                <table className="min-w-full text-sm">
                    <thead className="bg-cream text-ink">
                        <tr className="text-right">
                            {["السطر", "الرقم", "الاسم", "الجنس", "الأب", "الأم", "الزوج/الزوجات", "الميلاد", "الوفاة", "الحالة", "الملاحظات"].map((h) => (
                                <th key={h} className="px-3 py-2 font-bold whitespace-nowrap border-b border-line">
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                        {visible.slice(0, limit).map(({ row, p }) => {
                            const hasError = p.issues.some((x) => x.level === "error");
                            const cal = rowCalendar(row) === "hijri" ? "هـ" : "م";
                            return (
                                <tr key={row.line} className={hasError ? "bg-red-50/60" : p.existingId ? "bg-sky-50/50" : undefined}>
                                    <td className="px-3 py-2 text-muted">{row.line}</td>
                                    <td className="px-3 py-2">{row.serial}</td>
                                    <td className="px-3 py-2 font-bold text-ink whitespace-nowrap">
                                        {row.fullName || <span className="text-red-600">—</span>}
                                        {p.existingId && <span className="ms-2 text-xs font-medium text-sky-700">تحديث</span>}
                                    </td>
                                    <td className="px-3 py-2">{row.gender === "female" ? "أنثى" : row.gender === "male" ? "ذكر" : "—"}</td>
                                    <td className="px-3 py-2 whitespace-nowrap">{p.father ? refName(p.father) : row.father ? <span className="text-red-600">{row.father}</span> : ""}</td>
                                    <td className="px-3 py-2 whitespace-nowrap">{p.mother ? refName(p.mother) : row.mother ? <span className="text-red-600">{row.mother}</span> : ""}</td>
                                    <td className="px-3 py-2">
                                        {p.spouses.map((s, j) => (
                                            <span key={j} className={`inline-block me-1 mb-1 rounded px-1.5 py-0.5 text-xs ${s.kind === "name" ? "bg-gray-100 text-muted" : "bg-primary/10 text-primary-dark"}`}>
                                                {refName(s)}
                                            </span>
                                        ))}
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap">{row.birthYear !== null ? `${row.birthYear} ${cal}` : ""}</td>
                                    <td className="px-3 py-2 whitespace-nowrap">{row.deathYear !== null ? `${row.deathYear} ${cal}` : ""}</td>
                                    <td className="px-3 py-2 whitespace-nowrap">{STATUS_LABEL[rowStatus(row)]}</td>
                                    <td className="px-3 py-2 min-w-[16rem]">
                                        <ul className="space-y-1">
                                            {p.issues.map((x, j) => (
                                                <li key={j} className={`flex items-start gap-1 text-xs ${x.level === "error" ? "text-red-700" : "text-amber-700"}`}>
                                                    {x.level === "error" ? <AlertOctagon className="w-3.5 h-3.5 mt-0.5 shrink-0" /> : <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />}
                                                    <span>{x.message}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </td>
                                </tr>
                            );
                        })}
                        {visible.length === 0 && (
                            <tr>
                                <td colSpan={11} className="px-3 py-6 text-center text-muted">
                                    لا توجد صفوف هنا
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {visible.length > limit && (
                <button type="button" onClick={() => setLimit(limit + PAGE)} className="text-sm font-bold text-primary-dark hover:underline cursor-pointer">
                    عرض المزيد ({visible.length - limit} صف متبقٍ)
                </button>
            )}
        </div>
    );
}
