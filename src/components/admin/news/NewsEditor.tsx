"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Send, Calendar, Eye, Info, Image as ImageIcon, ArrowRight } from "lucide-react";
import ImageUpload from "@/components/admin/common/ImageUpload";
import { saveNews } from "@/app/portal/admin/news/actions";
import { unwrap } from "@/lib/action-result";

export interface NewsEditorValues {
    id?: string;
    slug?: string;
    title: string;
    excerpt: string;
    content: string;
    category: string;
    coverUrl: string | null;
    status: "draft" | "published" | "archived";
    publishedAt: string | null; // yyyy-mm-dd
}

export default function NewsEditor({ initial, categories }: { initial: NewsEditorValues; categories: readonly string[] }) {
    const router = useRouter();
    const [values, setValues] = useState(initial);
    const [pending, startTransition] = useTransition();
    const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
    const set = <K extends keyof NewsEditorValues>(key: K, value: NewsEditorValues[K]) => setValues((v) => ({ ...v, [key]: value }));

    const submit = (publish: boolean) => {
        setMessage(null);
        startTransition(async () => {
            try {
                const saved = await unwrap(saveNews({
                    id: values.id,
                    title: values.title,
                    excerpt: values.excerpt,
                    content: values.content,
                    category: values.category,
                    coverUrl: values.coverUrl,
                    publish,
                    publishedAt: values.publishedAt,
                }));
                setValues((v) => ({ ...v, id: saved.id, slug: saved.slug, status: publish ? "published" : "draft" }));
                const scheduled = publish && values.publishedAt !== null && values.publishedAt > new Date().toISOString().slice(0, 10);
                setMessage({ type: "ok", text: scheduled ? "تمت جدولة الخبر" : publish ? "تم نشر الخبر" : "تم حفظ المسودة" });
                if (!values.id) router.replace(`/portal/admin/news/${saved.id}/edit`);
                router.refresh();
            } catch (error) {
                setMessage({ type: "error", text: error instanceof Error ? error.message : "تعذر الحفظ" });
            }
        });
    };

    return (
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 font-display pb-28">
            {/* Writing Area */}
            <div className="flex-1 space-y-6">
                <Link href="/portal/admin/news" className="inline-flex items-center gap-2 text-sm font-bold text-muted hover:text-ink">
                    <ArrowRight className="w-4 h-4" />
                    كل الأخبار
                </Link>
                <div className="bg-white p-6 rounded-xl border border-line shadow-sm">
                    <input
                        className="w-full text-3xl font-bold bg-transparent border-none focus:ring-0 placeholder:text-gray-300 p-0 outline-none"
                        placeholder="عنوان الخبر..."
                        type="text"
                        maxLength={200}
                        value={values.title}
                        onChange={(e) => set("title", e.target.value)}
                    />
                    <div className="h-[1px] w-full bg-line mt-4"></div>

                    <label className="block mt-4">
                        <span className="text-sm font-bold text-muted mb-1.5 block">ملخص يظهر في القوائم</span>
                        <textarea
                            className="w-full min-h-[80px] rounded-lg border border-line bg-canvas p-3 text-base leading-relaxed text-ink outline-none focus:border-primary resize-y"
                            placeholder="سطر أو سطران يلخصان الخبر..."
                            maxLength={600}
                            value={values.excerpt}
                            onChange={(e) => set("excerpt", e.target.value)}
                        />
                    </label>

                    <textarea
                        className="w-full min-h-[460px] bg-transparent border-none focus:ring-0 text-lg leading-relaxed text-ink placeholder:text-gray-300 p-0 resize-y mt-6 outline-none"
                        placeholder="ابدأ في كتابة تفاصيل الخبر هنا... اترك سطراً فارغاً بين الفقرات."
                        value={values.content}
                        onChange={(e) => set("content", e.target.value)}
                    ></textarea>
                </div>
            </div>

            {/* Sidebar Options */}
            <div className="w-full lg:w-80 space-y-6 lg:pt-9">
                {/* Publishing Options Card */}
                <div className="bg-white p-5 rounded-xl border border-line shadow-sm">
                    <h3 className="text-base font-bold mb-4 flex items-center gap-2 text-ink">
                        <Send className="w-5 h-5 text-primary" />
                        خيارات النشر
                    </h3>
                    <div className="space-y-4">
                        <label className="block">
                            <span className="text-sm font-medium text-muted mb-1.5 block">تصنيف الخبر</span>
                            <select
                                className="w-full rounded-lg border border-line bg-white p-2.5 text-sm outline-none focus:border-primary"
                                value={values.category}
                                onChange={(e) => set("category", e.target.value)}
                            >
                                <option value="">اختر التصنيف...</option>
                                {categories.map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </label>
                        <label className="block">
                            <span className="text-sm font-medium text-muted mb-1.5 block">تاريخ النشر</span>
                            <div className="relative">
                                <input
                                    className="w-full rounded-lg border border-line bg-white p-2.5 pl-10 text-sm outline-none focus:border-primary"
                                    type="date"
                                    value={values.publishedAt ?? ""}
                                    onChange={(e) => set("publishedAt", e.target.value || null)}
                                />
                                <Calendar className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            </div>
                            <span className="flex items-start gap-1.5 text-xs text-muted mt-2">
                                <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                اتركه فارغاً للنشر الآن، أو اختر تاريخاً لاحقاً لجدولته.
                            </span>
                        </label>
                    </div>
                </div>

                {/* Featured Image Card */}
                <div className="bg-white p-5 rounded-xl border border-line shadow-sm">
                    <h3 className="text-base font-bold mb-4 flex items-center gap-2 text-ink">
                        <ImageIcon className="w-5 h-5 text-primary" />
                        الصورة البارزة
                    </h3>
                    <ImageUpload value={values.coverUrl ?? undefined} onChange={(base64) => set("coverUrl", base64 || null)} />
                    {values.coverUrl && (
                        <button type="button" onClick={() => set("coverUrl", null)} className="mt-3 text-xs font-bold text-red-500 hover:underline cursor-pointer">
                            إزالة الصورة
                        </button>
                    )}
                </div>
            </div>

            {/* Fixed Bottom Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-line z-40 lg:mr-72 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2 sm:gap-4 whitespace-nowrap">
                    <div className="text-xs font-bold">
                        {pending && <span className="text-blue-600">جارٍ الحفظ...</span>}
                        {!pending && message && (
                            <span className={message.type === "ok" ? "text-green-600" : "text-red-600"}>{message.text}</span>
                        )}
                        {!pending && !message && (
                            <span className="flex items-center gap-1.5 text-muted">
                                <span className={`w-2 h-2 rounded-full ${values.status === "published" ? "bg-green-500" : "bg-orange-400"}`}></span>
                                {values.status === "published" ? "منشور" : values.id ? "مسودة" : "خبر جديد"}
                            </span>
                        )}
                    </div>
                    <div className="flex gap-2 sm:gap-3">
                        <button
                            type="button"
                            disabled={pending}
                            onClick={() => submit(false)}
                            className="px-3 sm:px-5 py-2.5 text-sm font-bold text-muted hover:bg-gray-100 rounded-lg transition-all disabled:opacity-50 cursor-pointer"
                        >
                            {values.status === "published" ? "إلغاء النشر وحفظ كمسودة" : "حفظ كمسودة"}
                        </button>
                        {values.status === "published" && values.slug && (
                            <Link
                                href={`/news/${values.slug}`}
                                target="_blank"
                                className="px-5 py-2.5 text-sm font-bold text-ink border border-line hover:bg-gray-50 rounded-lg transition-all flex items-center gap-2"
                            >
                                <Eye className="w-4 h-4" />
                                عرض
                            </Link>
                        )}
                        <button
                            type="button"
                            disabled={pending}
                            onClick={() => submit(true)}
                            className="px-4 sm:px-8 py-2.5 bg-primary text-white text-sm font-bold rounded-lg hover:shadow-lg hover:shadow-primary/30 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                        >
                            <Send className="w-4 h-4" />
                            {values.status === "published" ? "حفظ التعديلات" : "نشر الخبر"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
