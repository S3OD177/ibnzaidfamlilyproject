import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatNewsDate, getPublishedNewsBySlug, latestNews, toParagraphs } from "@/lib/data/news";
import { Calendar, User, ChevronLeft } from "lucide-react";

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
                        <div className="flex flex-wrap items-center gap-2 mb-6 text-sm text-muted font-body">
                            <Link className="hover:text-primary transition-colors" href="/">الرئيسية</Link>
                            <ChevronLeft className="w-4 h-4 text-gray-400" />
                            <Link className="hover:text-primary transition-colors" href="/news">أخبار العائلة</Link>
                            <ChevronLeft className="w-4 h-4 text-gray-400" />
                            <span className="text-ink font-semibold truncate max-w-[200px]">{article.title}</span>
                        </div>

                        {/* Headline */}
                        <h1 className="font-heritage text-4xl md:text-5xl font-bold text-deep leading-snug mb-4">
                            {article.title}
                        </h1>

                        {/* Meta Data */}
                        <div className="flex flex-wrap items-center gap-4 md:gap-6 pb-6 border-b border-sand mb-8 font-body">
                            <div className="flex items-center gap-2 text-muted">
                                <Calendar className="w-5 h-5 text-primary" />
                                <time className="text-sm font-medium pt-1" dateTime={article.publishedAt?.toISOString()}>{formatNewsDate(article.publishedAt)}</time>
                            </div>
                            {article.authorName && (
                                <div className="flex items-center gap-2 text-muted">
                                    <User className="w-5 h-5 text-primary" />
                                    <span className="text-sm font-medium pt-1">{article.authorName}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2 text-muted mr-auto lg:mr-0">
                                <span className="px-3 py-1 bg-sand/70 text-deep rounded-full text-xs font-bold">
                                    {article.category}
                                </span>
                            </div>
                        </div>

                        {/* Featured Image */}
                        {article.coverUrl && (
                            <div className="bg-white p-2 border border-primary/30 rounded-2xl mb-8">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={article.coverUrl} alt="" className="w-full max-h-[450px] object-cover rounded-xl" />
                            </div>
                        )}

                        {/* Article Body */}
                        <div className="prose prose-lg max-w-none font-naskh text-ink">
                            {paragraphs.map((p, i) => (
                                <p key={i} className="mb-6 text-lg leading-loose text-gray-800 whitespace-pre-line">{p}</p>
                            ))}
                        </div>

                    </article>


                    {/* Left Column: Sidebar */}
                    <aside className="w-full lg:w-1/3 flex flex-col gap-8">

                        {/* Latest News Widget */}
                        <div className="bg-white rounded-2xl border border-sand overflow-hidden p-6 font-body">
                            <div className="flex items-center justify-between mb-6 border-b border-sand pb-4">
                                <h3 className="font-heritage text-2xl font-bold text-deep">آخر الأخبار</h3>
                                <Link className="text-xs font-bold text-primary-dark hover:underline" href="/news">عرض الكل</Link>
                            </div>
                            <div className="flex flex-col gap-6">
                                {others.length === 0 && <p className="text-sm text-gray-400">لا توجد أخبار أخرى.</p>}
                                {others.map((item) => (
                                    <Link key={item.id} className="group flex gap-4 items-start" href={`/news/${item.slug}`}>
                                        <div className="size-20 shrink-0 rounded-lg bg-deep overflow-hidden relative">
                                            {item.coverUrl && (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={item.coverUrl} alt="" className="w-full h-full object-cover" />
                                            )}
                                        </div>
                                        <div className="flex flex-col pt-0.5">
                                            <span className="text-xs text-primary font-medium mb-1">{item.category}</span>
                                            <h4 className="font-display font-bold text-ink text-sm leading-tight group-hover:text-primary transition-colors">
                                                {item.title}
                                            </h4>
                                            <span className="text-xs text-muted mt-2">{formatNewsDate(item.publishedAt)}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Members' portal */}
                        <div className="relative overflow-hidden bg-deep text-white rounded-2xl p-6 font-body">
                            <div className="absolute inset-0 heritage-pattern opacity-10" />
                            <div className="relative">
                                <h3 className="font-heritage text-2xl font-bold text-primary mb-2">بوابة الأعضاء</h3>
                                <p className="text-sm text-white/75 leading-relaxed mb-5 font-naskh">
                                    تصفّح شجرة العائلة، وابحث في دليل الأعضاء، وحدّث بياناتك لتبقى سجلات العائلة دقيقة.
                                </p>
                                <Link href="/portal/profile/edit" className="block w-full text-center py-2.5 bg-primary text-deep hover:bg-primary-light rounded-lg text-sm font-bold transition-colors">
                                    تحديث بياناتي
                                </Link>
                            </div>
                        </div>

                    </aside>
                </div>
            </main>

        </>
    );
}
