import Link from "next/link";
import { FileText, Search, Folder, Image as ImageIcon, HardDrive, Filter } from "lucide-react";
import DocumentsManager from "@/components/admin/documents/DocumentsManager";
import { DOCUMENT_CATEGORIES, documentStats, listDocuments } from "@/lib/data/documents";

export const dynamic = "force-dynamic";

const nf = new Intl.NumberFormat("ar-SA");
const formatTotal = (bytes: number) =>
    bytes < 1024 * 1024 ? `${nf.format(bytes > 0 ? Math.max(1, Math.round(bytes / 1024)) : 0)} ك.ب` : `${nf.format(Number((bytes / 1024 / 1024).toFixed(1)))} م.ب`;

export default async function DocumentsPage({ searchParams }: { searchParams: Promise<{ q?: string; category?: string }> }) {
    const params = await searchParams;
    const q = params.q?.trim().slice(0, 100) || undefined;
    const category = DOCUMENT_CATEGORIES.includes(params.category as (typeof DOCUMENT_CATEGORIES)[number]) ? params.category : undefined;
    const [documents, stats] = await Promise.all([listDocuments({ q, category }), documentStats()]);

    const cards = [
        { label: "إجمالي الملفات", value: nf.format(stats.total), icon: FileText, className: "bg-blue-50 text-blue-600 border-blue-100" },
        { label: "صور ووسائط", value: nf.format(stats.images), icon: ImageIcon, className: "bg-amber-50 text-amber-600 border-amber-100" },
        { label: "تصنيفات مستخدمة", value: nf.format(stats.categories), icon: Folder, className: "bg-purple-50 text-purple-600 border-purple-100" },
        { label: "المساحة المستخدمة", value: formatTotal(stats.bytes), icon: HardDrive, className: "bg-green-50 text-green-600 border-green-100" },
    ];
    const href = (cat?: string) => {
        const sp = new URLSearchParams();
        if (cat) sp.set("category", cat);
        if (q) sp.set("q", q);
        const s = sp.toString();
        return s ? `/portal/admin/documents?${s}` : "/portal/admin/documents";
    };

    return (
        <div className="max-w-[1440px] mx-auto w-full font-display min-h-screen">
            <div className="mb-8 pb-6 border-b border-[#dbe6dd]">
                <h1 className="text-3xl font-black text-[#111812] mb-2">إدارة الوثائق والأرشيف</h1>
                <p className="text-[#618968] max-w-2xl">
                    مستودع مركزي لوثائق العائلة وصورها. ضع نجمة على وثيقة لتصبح «ميثاق العائلة» المنشور في صفحة المجلس.
                </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {cards.map((c) => (
                    <div key={c.label} className="bg-white p-5 rounded-xl border border-[#dbe6dd] shadow-sm flex items-center gap-4">
                        <div className={`size-12 rounded-full flex items-center justify-center border ${c.className}`}>
                            <c.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-[#111812]">{c.value}</p>
                            <p className="text-xs font-bold text-[#618968]">{c.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#dbe6dd] shadow-sm mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <form action="/portal/admin/documents" method="get" className="relative w-full md:w-80">
                    {category && <input type="hidden" name="category" value={category} />}
                    <Search className="absolute right-3 top-3 text-[#618968] w-4 h-4" />
                    <input name="q" type="search" defaultValue={q ?? ""} className="w-full rounded-lg border border-[#dbe6dd] bg-[#f8faf8] py-2.5 pr-10 pl-4 text-sm font-bold outline-none focus:border-primary" placeholder="البحث في الوثائق..." />
                </form>
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    {[undefined, ...DOCUMENT_CATEGORIES].map((c) => (
                        <Link
                            key={c ?? "all"}
                            href={href(c)}
                            className={c === category
                                ? "flex items-center gap-2 px-4 py-2 bg-[#111812] text-white rounded-lg text-sm font-bold whitespace-nowrap"
                                : "px-4 py-2 bg-white border border-[#dbe6dd] text-[#618968] rounded-lg text-sm font-bold hover:bg-[#f8faf8] whitespace-nowrap"}
                        >
                            {c === category && <Filter className="w-4 h-4" />}
                            {c ?? "الكل"}
                        </Link>
                    ))}
                </div>
            </div>

            <DocumentsManager documents={documents} categories={DOCUMENT_CATEGORIES} />
        </div>
    );
}
