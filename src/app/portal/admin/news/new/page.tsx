import NewsEditor from "@/components/admin/news/NewsEditor";
import { NEWS_CATEGORIES } from "@/lib/data/news";

export default function NewNewsPage() {
    return (
        <NewsEditor
            categories={NEWS_CATEGORIES}
            initial={{ title: "", excerpt: "", content: "", category: "", coverUrl: null, status: "draft", publishedAt: null }}
        />
    );
}
