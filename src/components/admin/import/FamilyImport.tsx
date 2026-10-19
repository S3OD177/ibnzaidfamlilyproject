"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { AlertOctagon, CheckCircle2, Download, FileUp, RotateCcw, Upload } from "lucide-react";
import { toast, confirmAction } from "@/components/ui/feedback";
import ColumnMapper from "@/components/admin/import/ColumnMapper";
import ImportPreview from "@/components/admin/import/ImportPreview";
import { downloadText, readTable } from "@/components/admin/import/read-table";
import { importFamily, type ImportMode, type ImportSummary } from "@/app/portal/admin/tree/import/actions";
import {
    MAX_IMPORT_ROWS,
    guessMapping,
    mapRows,
    packRows,
    planImport,
    templateCsv,
    type ColumnMapping,
    type ExistingMember,
} from "@/lib/import/family-import";

interface Sheet {
    fileName: string;
    headers: string[];
    body: string[][];
}

const card = "rounded-2xl border border-sand bg-white p-5 sm:p-6 space-y-4";
const stepTitle = "font-heritage text-xl font-bold text-deep";

export default function FamilyImport({ existing }: { existing: ExistingMember[] }) {
    const [sheet, setSheet] = useState<Sheet | null>(null);
    const [mapping, setMapping] = useState<ColumnMapping>({});
    const [mode, setMode] = useState<ImportMode>("merge");
    const [reading, setReading] = useState(false);
    const [result, setResult] = useState<ImportSummary | null>(null);
    const [pending, startTransition] = useTransition();

    const mapped = useMemo(() => (sheet && mapping.name !== undefined ? mapRows(sheet.body, mapping) : null), [sheet, mapping]);
    const plan = useMemo(
        () => (mapped ? planImport(mapped.rows, mode === "merge" ? existing : [], { cellIssues: mapped.cellIssues }) : null),
        [mapped, mode, existing],
    );

    async function onFile(file: File | undefined) {
        if (!file) return;
        setReading(true);
        setResult(null);
        try {
            const table = await readTable(file);
            if (table.length < 2) throw new Error("الملف فارغ أو لا يحتوي إلا على صف العناوين");
            const [headers, ...body] = table;
            if (body.length > MAX_IMPORT_ROWS) throw new Error(`الملف فيه ${body.length} صف، والحد الأقصى ${MAX_IMPORT_ROWS}`);
            setSheet({ fileName: file.name, headers: headers.map((h) => h.trim()), body });
            setMapping(guessMapping(headers));
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "تعذر قراءة الملف");
        } finally {
            setReading(false);
        }
    }

    async function onImport() {
        if (!mapped || !plan || plan.errorCount > 0) return;
        if (mode === "replace") {
            const first = await confirmAction({
                title: "استبدال الشجرة بالكامل؟",
                message: `سيُحذف جميع أفراد الشجرة الحالية (${existing.length} فرداً) مع علاقاتهم وزيجاتهم، ثم يُستورد ${mapped.rows.length} فرداً من الملف. ستضيع أدوار مجلس العائلة والصور والسير وكل بيانات الأفراد المحذوفين، ويُفك ربط حسابات المستخدمين بهم.`,
                confirmLabel: "متابعة",
                danger: true,
            });
            if (!first) return;
            const second = await confirmAction({
                title: "تأكيد أخير",
                message: "لا يمكن التراجع عن هذه العملية. هل أنت متأكد من حذف الشجرة الحالية واستبدالها بالملف؟",
                confirmLabel: "نعم، استبدل الشجرة",
                danger: true,
            });
            if (!second) return;
        } else {
            const ok = await confirmAction({
                title: "استيراد الملف؟",
                message: `سيُضاف ${plan.rows.filter((p) => !p.existingId).length} فرداً جديداً ويُحدَّث ${plan.rows.filter((p) => p.existingId).length} فرداً موجوداً (بالرقم التسلسلي).`,
                confirmLabel: "استيراد",
            });
            if (!ok) return;
        }

        startTransition(async () => {
            const res = await importFamily(packRows(mapped.rows), mode);
            if (!res.ok) {
                toast.error(res.error);
                return;
            }
            setResult(res.data);
            toast.success("تم الاستيراد");
        });
    }

    function reset() {
        setSheet(null);
        setMapping({});
        setResult(null);
    }

    if (result) {
        return (
            <div className={card}>
                <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                    <h3 className={stepTitle}>اكتمل الاستيراد</h3>
                </div>
                <div className="grid gap-3 grid-cols-2 sm:grid-cols-5">
                    {[
                        ["أفراد جدد", result.created],
                        ["أفراد محدَّثون", result.updated],
                        ["علاقات أبوة/أمومة", result.relationships],
                        ["زيجات", result.marriages],
                        ...(result.mode === "replace" ? [["أفراد محذوفون", result.deleted] as const] : []),
                    ].map(([label, n]) => (
                        <div key={label} className="rounded-xl border border-line bg-cream p-3">
                            <div className="text-2xl font-black text-deep">{n}</div>
                            <div className="text-sm text-muted">{label}</div>
                        </div>
                    ))}
                </div>
                {result.warnings.length > 0 && (
                    <details className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                        <summary className="cursor-pointer font-bold">تنبيهات ({result.warnings.length})</summary>
                        <ul className="mt-2 space-y-1 list-disc ps-5">
                            {result.warnings.map((w, i) => (
                                <li key={i}>{w}</li>
                            ))}
                        </ul>
                    </details>
                )}
                <div className="flex flex-wrap gap-2">
                    <Link href="/portal/admin/tree" className="px-4 py-2 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark">
                        فتح الشجرة
                    </Link>
                    <Link href="/portal/admin/tree/checks" className="px-4 py-2 rounded-xl border border-line bg-white font-bold text-ink hover:bg-cream">
                        فحص بيانات الشجرة
                    </Link>
                    <button type="button" onClick={reset} className="px-4 py-2 rounded-xl border border-line bg-white font-bold text-muted hover:bg-cream cursor-pointer">
                        استيراد ملف آخر
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Step 1: file */}
            <section className={card}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className={stepTitle}>١. الملف</h3>
                    <button
                        type="button"
                        onClick={() => downloadText("family-template.csv", templateCsv())}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl border border-line bg-cream text-sm font-bold text-primary-dark hover:bg-sand/40 cursor-pointer"
                    >
                        <Download className="w-4 h-4" />
                        تنزيل نموذج CSV
                    </button>
                </div>
                <p className="text-sm text-muted leading-7">
                    الصف الأول عناوين الأعمدة، وكل صف بعده فرد واحد. عمود الأب أو الأم يقبل الرقم التسلسلي للوالد (الأفضل) أو اسمه كما هو مكتوب في الملف.
                    افصل بين أسماء الزوجات بفاصلة. الحد الأقصى {MAX_IMPORT_ROWS} صف، وتُقرأ الورقة الأولى فقط من ملف Excel.
                </p>
                {sheet ? (
                    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-cream px-4 py-3">
                        <FileUp className="w-5 h-5 text-primary" />
                        <span className="font-bold text-ink" dir="auto">{sheet.fileName}</span>
                        <span className="text-sm text-muted">{sheet.body.length} صف</span>
                        <button type="button" onClick={reset} className="ms-auto flex items-center gap-1 text-sm font-bold text-muted hover:text-ink cursor-pointer">
                            <RotateCcw className="w-4 h-4" />
                            ملف آخر
                        </button>
                    </div>
                ) : (
                    <label className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-sand bg-cream/50 px-4 py-10 text-center cursor-pointer hover:border-primary">
                        <Upload className="w-8 h-8 text-primary" />
                        <span className="font-bold text-ink">{reading ? "جارٍ قراءة الملف..." : "اختر ملف Excel أو CSV"}</span>
                        <span className="text-xs text-muted">.xlsx, .xls, .csv</span>
                        <input
                            type="file"
                            className="sr-only"
                            accept=".xlsx,.xls,.csv,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                            disabled={reading}
                            onChange={(e) => {
                                void onFile(e.target.files?.[0]);
                                e.target.value = "";
                            }}
                        />
                    </label>
                )}
            </section>

            {sheet && (
                <>
                    {/* Step 2: columns */}
                    <section className={card}>
                        <h3 className={stepTitle}>٢. مطابقة الأعمدة</h3>
                        <p className="text-sm text-muted">تم تخمين الأعمدة من عناوينها؛ راجعها وغيّر ما يلزم. عمود الاسم مطلوب.</p>
                        <ColumnMapper headers={sheet.headers} sample={sheet.body[0]} mapping={mapping} onChange={setMapping} />
                    </section>

                    {/* Step 3: mode */}
                    <section className={card}>
                        <h3 className={stepTitle}>٣. طريقة الاستيراد</h3>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <label className={`rounded-xl border-2 p-4 cursor-pointer ${mode === "merge" ? "border-primary bg-primary/5" : "border-line"}`}>
                                <input type="radio" name="mode" className="sr-only" checked={mode === "merge"} onChange={() => setMode("merge")} />
                                <span className="block font-bold text-ink">إضافة إلى الشجرة الحالية</span>
                                <span className="block text-sm text-muted mt-1">
                                    من له رقم تسلسلي موجود في الشجرة تُحدَّث بياناته (الخلايا الفارغة لا تمسح شيئاً)، والباقي يُضاف كأفراد جدد. يمكن ربط الأب أو الأم بأفراد الشجرة الحالية.
                                </span>
                            </label>
                            <label className={`rounded-xl border-2 p-4 cursor-pointer ${mode === "replace" ? "border-red-500 bg-red-50" : "border-line"}`}>
                                <input type="radio" name="mode" className="sr-only" checked={mode === "replace"} onChange={() => setMode("replace")} />
                                <span className="block font-bold text-red-700">استبدال الشجرة بالكامل</span>
                                <span className="block text-sm text-muted mt-1">
                                    يحذف جميع الأفراد ({existing.length}) وعلاقاتهم وزيجاتهم أولاً. تضيع أدوار المجلس والصور والسير المسجلة لهم، ويُفك ربط الحسابات بهم.
                                </span>
                            </label>
                        </div>
                    </section>

                    {/* Step 4: preview */}
                    <section className={card}>
                        <h3 className={stepTitle}>٤. المراجعة</h3>
                        {!plan || !mapped ? (
                            <p className="text-sm text-red-700">اختر عمود الاسم لعرض المعاينة.</p>
                        ) : (
                            <>
                                {plan.general.map((g, i) => (
                                    <p key={i} className="text-sm font-bold text-red-700">{g.message}</p>
                                ))}
                                <ImportPreview key={mode} rows={mapped.rows} plan={plan} existing={existing} />
                                <div className="flex flex-wrap items-center gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => void onImport()}
                                        disabled={pending || plan.errorCount > 0}
                                        className={`px-5 py-3 rounded-xl font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${
                                            mode === "replace" ? "bg-red-600 hover:bg-red-700" : "bg-primary hover:bg-primary-dark"
                                        }`}
                                    >
                                        {pending ? "جارٍ الاستيراد..." : mode === "replace" ? `استبدال الشجرة بـ ${mapped.rows.length} فرد` : `استيراد ${mapped.rows.length} فرد`}
                                    </button>
                                    {plan.errorCount > 0 && (
                                        <span className="flex items-center gap-1 text-sm font-bold text-red-700">
                                            <AlertOctagon className="w-4 h-4" />
                                            صحّح الأخطاء ({plan.errorCount}) في الملف ثم ارفعه من جديد
                                        </span>
                                    )}
                                </div>
                            </>
                        )}
                    </section>
                </>
            )}
        </div>
    );
}
