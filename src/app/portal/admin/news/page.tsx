import Link from "next/link";
import { Plus, Search, Filter, Edit, Calendar, CheckCircle, Clock, FileText, ExternalLink } from "lucide-react";
import DeleteNewsButton from "@/components/admin/news/DeleteNewsButton";
import { adminListNews, formatNewsDate, newsStatus, type NewsStatusFilter } from "@/lib/data/news";

export const dynamic = "force-dynamic";

const FILTERS: { key: NewsStatusFilter; label: string }[] = [
    { key: "all", label: "الكل" },
    { key: "published", label: "منشور" },
    { key: "draft", label: "مسودة" },
    { key: "scheduled", label: "مجدول" },
];

const STATUS_BADGE = {
    published: { label: "منشور", icon: CheckCircle, className: "bg-green-50 text-green-700 border-green-100" },
    scheduled: { label: "مجدول", icon: Clock, className: "bg-amber-50 text-amber-700 border-amber-100" },
    draft: { label: "مسودة", icon: FileText, className: "bg-gray-50 text-gray-600 border-gray-200" },
    archived: { label: "مؤرشف", icon: FileText, className: "bg-gray-50 text-gray-500 border-gray-200" },
} as const;

type SearchParams = Promise<{ status?: string; q?: string }>;

export default async function NewsIndexPage({ searchParams }: { searchParams: SearchParams }) {
    const params = await searchParams;
    const filter = (FILTERS.some((f) => f.key === params.status) ? params.status : "all") as NewsStatusFilter;
    const q = params.q?.trim().slice(0, 100) || undefined;
    const { items, counts } = await adminListNews(filter, q);

    const filterHref = (key: NewsStatusFilter) => {
        const sp = new URLSearchParams();
        if (key !== "all") sp.set("status", key);
        if (q) sp.set("q", q);
        const qs = sp.toString();
        return qs ? `/portal/admin/news?${qs}` : "/portal/admin/news";
    };

    return (
        <div className="max-w-[1440px] mx-auto w-full font-display min-h-screen">
            {/* Page Heading */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b border-line pb-6">
                <div>
                    <h1 className="text-3xl font-black text-ink mb-2">إدارة الأخبار والمحتوى</h1>
                    <p className="text-muted max-w-2xl">نشر ومتابعة الأخبار، الفعاليات، والتعميمات الرسمية لجميع فروع العائلة.</p>
                </div>
                <Link href="/portal/admin/news/new" className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all">
                    <Plus className="w-5 h-5" />
                    <span>كتابة خبر جديد</span>
                </Link>
            </div>

            {/* Filters & Search */}
            <div className="bg-white p-4 rounded-xl border border-line shadow-sm mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <form action="/portal/admin/news" method="get" className="relative w-full md:w-80">
                    {filter !== "all" && <input type="hidden" name="status" value={filter} />}
                    <Search className="absolute right-3 top-3 text-muted w-4 h-4" />
                    <input
                        name="q"
                        type="search"
                        defaultValue={q}
                        className="w-full rounded-lg border border-line bg-canvas focus:ring-primary focus:border-primary py-2.5 pr-10 pl-4 text-sm font-bold outline-none"
                        placeholder="البحث في الأخبار..."
                    />
                </form>
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    {FILTERS.map((f) => (
                        <Link
                            key={f.key}
                            href={filterHref(f.key)}
                            className={f.key === filter
                                ? "flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm font-bold whitespace-nowrap border border-primary/20"
                                : "px-4 py-2 bg-white border border-line text-muted rounded-lg text-sm font-bold hover:bg-canvas whitespace-nowrap transition-colors"}
                        >
                            {f.key === filter && <Filter className="w-4 h-4" />}
                            {f.label} ({counts[f.key]})
                        </Link>
                    ))}
                </div>
            </div>

            {/* News Grid */}
            {items.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-dashed border-line">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="font-bold text-ink">لا توجد أخبار هنا</p>
                    <Link href="/portal/admin/news/new" className="inline-block mt-4 text-primary font-bold hover:underline">اكتب أول خبر</Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((item) => {
                        const status = newsStatus(item);
                        const badge = STATUS_BADGE[status];
                        const BadgeIcon = badge.icon;
                        return (
                            <div key={item.id} className="bg-white rounded-xl border border-line shadow-sm overflow-hidden hover:shadow-md transition-all group">
                                <div className="relative h-48 bg-gray-100 flex items-center justify-center">
                                    {item.coverUrl ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={item.coverUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-gray-400 font-bold text-sm">لا توجد صورة بارزة</div>
                                    )}
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-primary shadow-sm">
                                        {item.category}
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white">
                                        <h3 className="font-bold text-lg leading-tight mb-1 truncate">{item.title}</h3>
                                        <div className="flex items-center gap-2 text-xs opacity-90">
                                            <Calendar className="w-3 h-3" />
                                            <span>{item.publishedAt ? formatNewsDate(item.publishedAt) : `آخر تعديل ${formatNewsDate(item.updatedAt)}`}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${badge.className}`}>
                                            <BadgeIcon className="w-3 h-3" />
                                            {badge.label}
                                        </span>
                                        {status === "published" && (
                                            <Link href={`/news/${item.slug}`} target="_blank" className="flex items-center gap-1 text-gray-400 hover:text-primary text-xs font-bold">
                                                <ExternalLink className="w-3 h-3" />
                                                عرض
                                            </Link>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 border-t border-mist pt-4">
                                        <Link href={`/portal/admin/news/${item.id}/edit`} className="flex-1 py-2 text-center text-sm font-bold text-muted hover:bg-mist rounded-lg transition-colors flex items-center justify-center gap-2">
                                            <Edit className="w-4 h-4" />
                                            تعديل
                                        </Link>
                                        <DeleteNewsButton id={item.id} title={item.title} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
