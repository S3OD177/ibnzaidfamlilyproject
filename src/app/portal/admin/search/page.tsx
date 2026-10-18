import Link from "next/link";
import { Search, Users, Newspaper, Gavel, FileText } from "lucide-react";
import { searchAll } from "@/lib/data/search";

export const dynamic = "force-dynamic";

function Group({ title, icon: Icon, count, children }: { title: string; icon: typeof Users; count: number; children: React.ReactNode }) {
    if (count === 0) return null;
    return (
        <section className="bg-white rounded-xl border border-line overflow-hidden">
            <h2 className="px-5 py-3 bg-canvas border-b border-line text-sm font-bold text-ink flex items-center gap-2">
                <Icon className="w-4 h-4 text-primary" />
                {title} ({count})
            </h2>
            <ul className="divide-y divide-mist">{children}</ul>
        </section>
    );
}

function Row({ href, title, detail, external }: { href: string; title: string; detail?: string | null; external?: boolean }) {
    return (
        <li>
            <Link href={href} target={external ? "_blank" : undefined} className="block px-5 py-3 hover:bg-canvas">
                <p className="text-sm font-bold text-ink">{title}</p>
                {detail && <p className="text-xs text-muted mt-0.5">{detail}</p>}
            </Link>
        </li>
    );
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
    const { q = "" } = await searchParams;
    const query = q.trim();
    const results = await searchAll(query);
    const total = results.members.length + results.news.length + results.decisions.length + results.documents.length;

    return (
        <div className="max-w-3xl mx-auto font-display space-y-6">
            <form action="/portal/admin/search" method="get" className="relative">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                <input
                    name="q"
                    type="search"
                    defaultValue={query}
                    autoFocus={!query}
                    placeholder="بحث عن عضو، خبر، قرار، أو وثيقة..."
                    className="w-full rounded-xl border border-line bg-white py-3.5 pr-12 pl-4 text-base outline-none focus:border-primary"
                />
            </form>

            {query.length > 0 && query.length < 2 && <p className="text-sm text-gray-500">اكتب حرفين على الأقل.</p>}
            {query.length >= 2 && total === 0 && (
                <p className="text-center py-12 text-gray-500 bg-white rounded-xl border border-dashed border-line">لا توجد نتائج لـ «{query}».</p>
            )}

            <Group title="أفراد العائلة" icon={Users} count={results.members.length}>
                {results.members.map((m) => <Row key={m.id} href={`/portal/members/${m.id}`} title={m.name} detail={m.detail} />)}
            </Group>
            <Group title="الأخبار" icon={Newspaper} count={results.news.length}>
                {results.news.map((n) => (
                    <Row key={n.id} href={`/portal/admin/news/${n.id}/edit`} title={n.title} detail={n.status === "published" ? "منشور" : "مسودة"} />
                ))}
            </Group>
            <Group title="قرارات المجلس" icon={Gavel} count={results.decisions.length}>
                {results.decisions.map((d) => <Row key={d.id} href={`/portal/admin/decisions/${d.id}`} title={d.title} detail={d.ref && `رقم القرار ${d.ref}`} />)}
            </Group>
            <Group title="الوثائق" icon={FileText} count={results.documents.length}>
                {results.documents.map((d) => (
                    <Row key={d.id} href={d.fileId ? `/files/${d.fileId}` : "/portal/admin/documents"} title={d.title} detail={d.category} external={Boolean(d.fileId)} />
                ))}
            </Group>
        </div>
    );
}
