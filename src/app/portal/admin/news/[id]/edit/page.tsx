import { notFound } from "next/navigation";
import NewsEditor from "@/components/admin/news/NewsEditor";
import { NEWS_CATEGORIES, getNewsById } from "@/lib/data/news";

export const dynamic = "force-dynamic";

export default async function EditNewsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const item = await getNewsById(id);
    if (!item) notFound();

    // Older items may use a category that is no longer in the list; keep it selectable.
    const categories = NEWS_CATEGORIES.includes(item.category as (typeof NEWS_CATEGORIES)[number])
        ? NEWS_CATEGORIES
        : [...NEWS_CATEGORIES, item.category];

    return (
        <NewsEditor
            categories={categories}
            initial={{
                id: item.id,
                slug: item.slug,
                title: item.title,
                excerpt: item.excerpt ?? "",
                content: item.content ?? "",
                category: item.category,
                coverUrl: item.coverUrl,
                status: item.status,
                publishedAt: item.publishedAt ? item.publishedAt.toISOString().slice(0, 10) : null,
            }}
        />
    );
}
