import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatNewsDate, getPublishedNewsBySlug, latestNews, toParagraphs } from "@/lib/data/news";
import { Calendar, User, ChevronLeft, Info } from "lucide-react";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
    const { slug } = await params;
    const article = await getPublishedNewsBySlug(decodeURIComponent(slug));
    return { title: article ? article.title : "الخبر غير موجود" };
}

export default async function NewsDetailsPage({ params }: { params: Params }) {
    const { slug } = await params;
    const article = await getPublishedNewsBySlug(decodeURIComponent(slug));
    if (!article) notFound();

    const recent = await latestNews(4);
    const others = recent.filter((n) => n.id !== article.id).slice(0, 3);
    const paragraphs = toParagraphs(article.content ?? article.excerpt);

    return (
        <>
            <main className="flex-grow w-full max-w-[1280px] mx-auto px-4 sm:px-10 py-10 font-naskh">
                <div className="flex flex-col lg:flex-row gap-12">

                    {/* Right Column: Article Content (Main) */}
                    <article className="w-full lg:w-2/3 flex flex-col">

                        {/* Breadcrumbs */}
                        <div className="flex flex-wrap items-center gap-2 mb-6 text-sm text-[#61896f] font-body">
                            <Link className="hover:text-primary transition-colors" href="/">الرئيسية</Link>
                            <ChevronLeft className="w-4 h-4 text-gray-400" />
                            <Link className="hover:text-primary transition-colors" href="/news">أخبار العائلة</Link>
                            <ChevronLeft className="w-4 h-4 text-gray-400" />
                            <span className="text-[#111813] font-semibold truncate max-w-[200px]">{article.title}</span>
                        </div>

                        {/* Headline */}
                        <h1 className="font-display text-3xl md:text-4xl lg:text-[42px] font-bold text-[#111813] leading-tight mb-4">
                            {article.title}
                        </h1>

                        {/* Meta Data */}
                        <div className="flex flex-wrap items-center gap-4 md:gap-6 pb-6 border-b border-[#f0f4f2] mb-8 font-body">
                            <div className="flex items-center gap-2 text-[#61896f]">
                                <Calendar className="w-5 h-5 text-primary" />
                                <time className="text-sm font-medium pt-1" dateTime={article.publishedAt?.toISOString()}>{formatNewsDate(article.publishedAt)}</time>
                            </div>
                            {article.authorName && (
                                <div className="flex items-center gap-2 text-[#61896f]">
                                    <User className="w-5 h-5 text-primary" />
                                    <span className="text-sm font-medium pt-1">{article.authorName}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2 text-[#61896f] mr-auto lg:mr-0">
                                <span className="px-3 py-1 bg-[#f0f4f0] text-primary rounded-full text-xs font-bold">
                                    {article.category}
                                </span>
                            </div>
                        </div>

                        {/* Featured Image */}
                        {article.coverUrl && (
                            <div className="bg-white p-2 border border-[#f0f4f2] rounded-lg shadow-sm mb-8">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={article.coverUrl} alt="" className="w-full max-h-[450px] object-cover rounded" />
                            </div>
                        )}

                        {/* Article Body */}
                        <div className="prose prose-lg max-w-none font-naskh text-[#111813]">
                            {paragraphs.map((p, i) => (
                                <p key={i} className="mb-6 text-lg leading-loose text-gray-800 whitespace-pre-line">{p}</p>
                            ))}
                        </div>

                    </article>


                    {/* Left Column: Sidebar */}
                    <aside className="w-full lg:w-1/3 flex flex-col gap-8">

                        {/* Latest News Widget */}
                        <div className="bg-white rounded-xl shadow-sm border border-[#f0f4f2] overflow-hidden p-6 font-body">
                            <div className="flex items-center justify-between mb-6 border-b border-[#f0f4f0] pb-4">
                                <h3 className="font-display text-xl font-bold text-primary">آخر الأخبار</h3>
                                <Link className="text-xs font-bold text-primary hover:underline" href="/news">عرض الكل</Link>
                            </div>
                            <div className="flex flex-col gap-6">
                                {others.length === 0 && <p className="text-sm text-gray-400">لا توجد أخبار أخرى.</p>}
                                {others.map((item) => (
                                    <Link key={item.id} className="group flex gap-4 items-start" href={`/news/${item.slug}`}>
                                        <div className="size-20 shrink-0 rounded-lg bg-gray-100 overflow-hidden relative">
                                            {item.coverUrl && (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={item.coverUrl} alt="" className="w-full h-full object-cover" />
                                            )}
                                        </div>
                                        <div className="flex flex-col pt-0.5">
                                            <span className="text-xs text-primary font-medium mb-1">{item.category}</span>
                                            <h4 className="font-display font-bold text-[#111813] text-sm leading-tight group-hover:text-primary transition-colors">
                                                {item.title}
                                            </h4>
                                            <span className="text-xs text-[#61896f] mt-2">{formatNewsDate(item.publishedAt)}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Info Card Widget */}
                        <div className="bg-primary/5 rounded-xl border border-primary/20 p-6 font-body">
                            <div className="flex items-center gap-3 mb-4">
                                <Info className="w-6 h-6 text-primary" />
                                <h3 className="font-display text-lg font-bold text-primary">تنويه هام</h3>
                            </div>
                            <p className="text-sm text-gray-700 leading-relaxed mb-4 font-naskh">
                                نذكر جميع أفراد العائلة بضرورة تحديث بيانات شجرة العائلة عبر البوابة الإلكترونية قبل نهاية الشهر الحالي لضمان دقة السجلات في الإصدار المطبوع القادم.
                            </p>
                            <button className="w-full py-2 bg-white border border-primary/30 text-primary hover:bg-primary hover:text-white rounded-lg text-sm font-bold transition-all">
                                تحديث بياناتي
                            </button>
                        </div>

                    </aside>
                </div>
            </main>

        </>
    );
}
