import Link from "next/link";
import { PageHero } from "@/components/heritage/PageHero";
import { Search, Calendar, ArrowRight, ChevronLeft, X } from "lucide-react";
import {
    NEWS_CATEGORIES,
    categoryColor,
    formatNewsDate,
    listNewsYears,
    listPublishedNews,
    type NewsRow,
} from "@/lib/data/news";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ q?: string; category?: string; year?: string; page?: string }>;

export default async function NewsArchivePage({ searchParams }: { searchParams: SearchParams }) {
    const params = await searchParams;
    const q = params.q?.trim().slice(0, 100) || undefined;
    const category = NEWS_CATEGORIES.includes(params.category as (typeof NEWS_CATEGORIES)[number]) ? params.category : undefined;
    const year = params.year && /^\d{4}$/.test(params.year) ? Number(params.year) : undefined;
    const page = Number(params.page) > 0 ? Math.floor(Number(params.page)) : 1;

    const [{ items, pages }, years] = await Promise.all([
        listPublishedNews({ q, category, year, page }),
        listNewsYears(),
    ]);

    const pageHref = (n: number) => {
        const sp = new URLSearchParams();
        if (q) sp.set("q", q);
        if (category) sp.set("category", category);
        if (year) sp.set("year", String(year));
        if (n > 1) sp.set("page", String(n));
        const qs = sp.toString();
        return qs ? `/news?${qs}` : "/news";
    };

    return (
        <>
            <PageHero eyebrow="المركز الإعلامي" title="أخبار العائلة" subtitle="تصفّح إعلانات وفعاليات العائلة ومناسباتها عبر السنين" />

            <div className="max-w-[1280px] mx-auto px-4 sm:px-10 flex-grow w-full pt-10 pb-20">

                {/* Filter Bar */}
                <form action="/news" method="get" className="bg-white rounded-2xl border border-sand p-4 mb-10">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-grow relative bg-cream rounded-lg h-12 focus-within:ring-2 ring-primary/20 transition-all">
                            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-muted w-5 h-5" />
                            <input
                                type="search"
                                name="q"
                                placeholder="بحث في الأرشيف..."
                                className="w-full h-full bg-transparent border-none outline-none pr-12 pl-4 text-sm font-medium placeholder:text-muted"
                                defaultValue={q}
                            />
                        </div>

                        {/* Filters */}
                        <div className="grid grid-cols-2 md:flex gap-4">
                            <select
                                name="category"
                                className="bg-cream border-none text-ink h-12 px-4 rounded-lg focus:ring-2 focus:ring-primary/20 cursor-pointer min-w-[140px] text-sm font-bold"
                                defaultValue={category ?? ""}
                            >
                                <option value="">كل التصنيفات</option>
                                {NEWS_CATEGORIES.map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>

                            <select
                                name="year"
                                className="bg-cream border-none text-ink h-12 px-4 rounded-lg focus:ring-2 focus:ring-primary/20 cursor-pointer min-w-[120px] text-sm font-bold"
                                defaultValue={year ? String(year) : ""}
                            >
                                <option value="">كل السنوات</option>
                                {years.map((y) => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>

                            <button
                                type="submit"
                                className="bg-deep text-primary px-6 h-12 rounded-lg font-bold hover:bg-deep-light transition flex items-center justify-center gap-2"
                            >
                                <Search className="w-5 h-5" />
                                <span>بحث</span>
                            </button>

                            {(q || category || year) && (
                                <Link
                                    href="/news"
                                    className="bg-white border border-gray-200 text-gray-600 px-6 h-12 rounded-lg font-bold hover:bg-gray-50 transition flex items-center justify-center gap-2"
                                >
                                    <X className="w-5 h-5" />
                                    <span>مسح</span>
                                </Link>
                            )}
                        </div>
                    </div>
                </form>

                {/* News List */}
                <div className="flex flex-col gap-6">
                    {items.length > 0 ? (
                        items.map((item) => <ArticleCard key={item.id} item={item} />)
                    ) : (
                        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-sand">
                            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-gray-900">لا توجد نتائج</h3>
                            <p className="text-gray-500">جرب البحث بكلمات مختلفة أو تغيير التصنيف</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {pages > 1 && (
                    <nav className="mt-12 flex justify-center items-center gap-2" aria-label="الصفحات">
                        {page > 1 && (
                            <Link href={pageHref(page - 1)} className="w-10 h-10 flex items-center justify-center rounded-lg border border-line hover:bg-slate-50 transition text-slate-500" aria-label="السابق">
                                <ChevronLeft className="w-5 h-5 rotate-180" />
                            </Link>
                        )}
                        {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                            <Link
                                key={n}
                                href={pageHref(n)}
                                className={n === page
                                    ? "w-10 h-10 flex items-center justify-center rounded-lg bg-deep text-primary font-bold"
                                    : "w-10 h-10 flex items-center justify-center rounded-lg border border-line hover:bg-slate-50 transition text-slate-600 font-bold"}
                            >
                                {n}
                            </Link>
                        ))}
                        {page < pages && (
                            <Link href={pageHref(page + 1)} className="w-10 h-10 flex items-center justify-center rounded-lg border border-line hover:bg-slate-50 transition text-slate-500" aria-label="التالي">
                                <ChevronLeft className="w-5 h-5" />
                            </Link>
                        )}
                    </nav>
                )}

            </div>
        </>
    );
}

function ArticleCard({ item }: { item: NewsRow }) {
    return (
        <Link href={`/news/${item.slug}`} className="flex flex-col md:flex-row gap-6 bg-white rounded-2xl overflow-hidden border border-sand hover:border-primary hover:shadow-lg hover:shadow-deep/5 transition-all duration-300 group cursor-pointer">
            <div className="w-full md:w-64 h-56 md:h-auto shrink-0 relative overflow-hidden bg-deep">
                <div className="absolute top-3 right-3 z-10">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold text-white backdrop-blur-sm ${categoryColor(item.category)}`}>
                        {item.category}
                    </span>
                </div>
                {item.coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.coverUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                    <div className="absolute inset-0 heritage-pattern opacity-25" />
                )}
            </div>
            <div className="flex flex-col justify-center p-6 md:pr-0 flex-1">
                <div className="flex items-center gap-2 text-muted text-sm mb-2">
                    <Calendar className="w-[18px] h-[18px]" />
                    <time dateTime={item.publishedAt?.toISOString()}>{formatNewsDate(item.publishedAt)}</time>
                </div>
                <h3 className="font-heritage text-3xl font-bold text-deep mb-3 group-hover:text-primary-dark transition-colors leading-snug">
                    {item.title}
                </h3>
                {item.excerpt && (
                    <p className="text-muted leading-relaxed mb-4 line-clamp-2">
                        {item.excerpt}
                    </p>
                )}
                <div className="mt-auto">
                    <span className="inline-flex items-center gap-1 text-primary-dark font-bold text-sm hover:underline">
                        اقرأ المزيد
                        <ArrowRight className="w-[18px] h-[18px] rtl:rotate-180" />
                    </span>
                </div>
            </div>
        </Link>
    );
}
