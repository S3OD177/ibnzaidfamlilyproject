import Link from "next/link";
import { Calendar, Filter, Search, Eye, History, Gavel, Scroll, Paperclip, X } from "lucide-react";
import { DECISION_STATES, DECISION_TYPES, listDecisions, topDecisionKeywords } from "@/lib/data/decisions";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ type?: string; year?: string; q?: string; state?: string }>;

const formatDate = (iso: string | null) =>
    iso ? new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura", { dateStyle: "long" }).format(new Date(`${iso}T12:00:00`)) : null;

export default async function DecisionsIndexPage({ searchParams }: { searchParams: SearchParams }) {
    const params = await searchParams;
    const type = DECISION_TYPES.includes(params.type as (typeof DECISION_TYPES)[number]) ? params.type : undefined;
    const year = params.year && /^\d{4}$/.test(params.year) ? Number(params.year) : undefined;
    const q = params.q?.trim().slice(0, 100) || undefined;
    const state = params.state && params.state in DECISION_STATES ? params.state : undefined;
    const [decisions, keywords] = await Promise.all([listDecisions({ type, year, q, state }), topDecisionKeywords()]);
    const filtered = Boolean(type || year || q || state);

    return (
        <div className="max-w-[1440px] mx-auto w-full font-display min-h-screen">
            {/* Page Heading */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-6 border-b border-[#dbe6dd]">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-primary">
                        <History className="w-5 h-5" />
                        <span className="text-sm font-bold uppercase tracking-widest">السجلات الرسمية</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-[#111812]">أرشيف قرارات المجلس الرسمية</h1>
                    <p className="text-[#618968] text-lg max-w-2xl">مستودع لجميع القرارات العائلية الرسمية والسجلات المعتمدة من المجلس.</p>
                </div>
                <Link href="/portal/admin/decisions/new" className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all">
                    <Gavel className="w-5 h-5" />
                    <span>إصدار قرار جديد</span>
                </Link>
            </div>

            {/* Filters Section */}
            <form action="/portal/admin/decisions" method="get" className="bg-white p-6 rounded-xl border border-[#dbe6dd] shadow-sm mb-10">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                    <label className="space-y-2 block">
                        <span className="text-sm font-bold text-[#111812]">نوع القرار</span>
                        <select name="type" defaultValue={type ?? ""} className="w-full rounded-lg border border-[#dbe6dd] bg-[#f8faf8] py-3 px-4 font-bold text-sm">
                            <option value="">جميع الأنواع</option>
                            {DECISION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </label>
                    <label className="space-y-2 block">
                        <span className="text-sm font-bold text-[#111812]">السنة (هجري)</span>
                        <input name="year" defaultValue={year ?? ""} inputMode="numeric" className="w-full rounded-lg border border-[#dbe6dd] bg-[#f8faf8] py-3 px-4 font-bold text-sm" placeholder="مثال: 1445" />
                    </label>
                    <label className="space-y-2 block">
                        <span className="text-sm font-bold text-[#111812]">الحالة</span>
                        <select name="state" defaultValue={state ?? ""} className="w-full rounded-lg border border-[#dbe6dd] bg-[#f8faf8] py-3 px-4 font-bold text-sm">
                            <option value="">كل الحالات</option>
                            {Object.entries(DECISION_STATES).map(([key, s]) => <option key={key} value={key}>{s.label}</option>)}
                        </select>
                    </label>
                    <label className="space-y-2 block">
                        <span className="text-sm font-bold text-[#111812]">الكلمات المفتاحية</span>
                        <div className="relative">
                            <Search className="absolute left-3 top-3.5 text-[#618968] w-5 h-5" />
                            <input name="q" type="search" defaultValue={q ?? ""} className="w-full rounded-lg border border-[#dbe6dd] bg-[#f8faf8] py-3 pl-10 pr-4 font-bold text-sm" placeholder="البحث في القرارات..." />
                        </div>
                    </label>
                    <div className="flex gap-2">
                        <button type="submit" className="flex-1 bg-[#111812] text-white font-bold py-3 px-6 rounded-lg hover:bg-black transition-colors flex items-center justify-center gap-2 cursor-pointer">
                            <Filter className="w-4 h-4" />
                            تطبيق
                        </button>
                        {filtered && (
                            <Link href="/portal/admin/decisions" className="px-3 py-3 rounded-lg border border-[#dbe6dd] text-gray-500 hover:bg-gray-50" aria-label="مسح الفلاتر">
                                <X className="w-5 h-5" />
                            </Link>
                        )}
                    </div>
                </div>
                {keywords.length > 0 && (
                    <div className="flex gap-3 mt-6 overflow-x-auto pb-2">
                        <span className="text-sm font-bold text-gray-400 flex items-center whitespace-nowrap">التصنيفات السريعة:</span>
                        {keywords.map((k) => (
                            <Link
                                key={k}
                                href={`/portal/admin/decisions?q=${encodeURIComponent(k)}`}
                                className={q === k
                                    ? "flex items-center h-8 shrink-0 rounded-full bg-primary/10 text-primary px-4 text-xs font-bold border border-primary/20"
                                    : "flex items-center h-8 shrink-0 rounded-full bg-[#f0f4f1] text-[#111812] px-4 text-xs font-bold border border-[#dbe6dd] hover:bg-[#e2e8e4]"}
                            >
                                {k}
                            </Link>
                        ))}
                    </div>
                )}
            </form>

            {/* Resolution Cards List */}
            <div className="flex flex-col gap-6">
                {decisions.length === 0 && (
                    <div className="text-center py-16 bg-white rounded-xl border border-dashed border-[#dbe6dd]">
                        <Gavel className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="font-bold text-[#111812]">{filtered ? "لا توجد قرارات مطابقة" : "لم تُسجل أي قرارات بعد"}</p>
                        {!filtered && <Link href="/portal/admin/decisions/new" className="inline-block mt-3 text-primary font-bold hover:underline">إصدار أول قرار</Link>}
                    </div>
                )}
                {decisions.map((d) => {
                    const st = DECISION_STATES[d.state];
                    const active = d.state === "active";
                    return (
                        <div key={d.id} className={`bg-white rounded-xl border border-[#dbe6dd] shadow-sm overflow-hidden hover:shadow-md transition-all group ${active ? "" : "opacity-80 hover:opacity-100"}`}>
                            <div className="flex flex-col md:flex-row">
                                <div className={`w-full md:w-2 ${active ? "bg-primary" : "bg-gray-400"}`}></div>
                                <div className="p-6 flex-1 flex flex-col md:flex-row gap-6">
                                    <div className={`flex-none flex flex-col items-center justify-center border-2 rounded-lg p-4 w-full md:w-32 ${active ? "border-[#D4AF37] bg-[#FDFBF7]" : "border-gray-200 bg-gray-50"}`}>
                                        <span className={`text-xs font-bold mb-1 ${active ? "text-[#D4AF37]" : "text-gray-500"}`}>رقم القرار</span>
                                        <span className="text-xl font-black text-[#111812]" dir="ltr">{d.referenceNumber || "—"}</span>
                                    </div>
                                    <div className="flex-1 flex flex-col gap-3">
                                        <div className="flex flex-wrap items-center justify-between gap-4">
                                            <h3 className="text-xl font-bold text-[#111812] group-hover:text-primary transition-colors">{d.title}</h3>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${st.className}`}>{st.label}</span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-4 text-sm text-[#618968]">
                                            {(d.issuedAt || d.hijriYear) && (
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" />
                                                    {formatDate(d.issuedAt) ?? `${d.hijriYear} هـ`}
                                                </span>
                                            )}
                                            <span className="flex items-center gap-1">
                                                <Scroll className="w-4 h-4" />
                                                {[d.decisionType, ...d.keywords.slice(0, 2)].join(" • ")}
                                            </span>
                                            {d.attachmentFileId && (
                                                <a href={`/files/${d.attachmentFileId}`} target="_blank" className="flex items-center gap-1 text-primary font-bold hover:underline">
                                                    <Paperclip className="w-4 h-4" />
                                                    المرفق
                                                </a>
                                            )}
                                        </div>
                                        {d.body && <p className="text-[#111812] leading-relaxed text-sm line-clamp-2">{d.body}</p>}
                                        <div className="flex justify-end mt-2">
                                            <Link href={`/portal/admin/decisions/${d.id}`} className="flex items-center gap-2 text-primary font-bold hover:underline text-sm">
                                                <Eye className="w-4 h-4" />
                                                عرض وتعديل القرار
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
