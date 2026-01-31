"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Filter, Calendar, ArrowRight, ChevronLeft, X } from "lucide-react";

// Mock Data
const NEWS_ITEMS = [
    {
        id: 1,
        title: "تكريم الدكتور أحمد لحصوله على جائزة الملك فيصل العالمية",
        category: "قصص نجاح",
        date: "15 نوفمبر 2023",
        year: "2023",
        excerpt: "في حفل بهيج حضره كبار الشخصيات، تم تكريم ابن العائلة الدكتور أحمد نظير إسهاماته العلمية المتميزة في مجال الطب والجراحة، والتي رفعت اسم العائلة عالياً...",
        categoryColor: "bg-primary/90"
    },
    {
        id: 2,
        title: "تحديد موعد الاجتماع السنوي التاسع للعائلة في الرياض",
        category: "إعلانات",
        date: "01 أكتوبر 2023",
        year: "2023",
        excerpt: "يسر مجلس العائلة دعوة جميع الأفراد لحضور الاجتماع السنوي الذي سيقام في قاعة الاحتفالات الكبرى، وسيتضمن اللقاء فقرات متنوعة وتكريم للمتفوقين...",
        categoryColor: "bg-blue-600/90"
    },
    {
        id: 3,
        title: "افتتاح معرض الفنون التشكيلية لمواهب العائلة الشابة",
        category: "فعاليات",
        date: "20 سبتمبر 2023",
        year: "2023",
        excerpt: "في مبادرة لدعم المواهب، تم افتتاح المعرض الفني الذي يضم أكثر من ٥٠ عملاً فنياً من إبداع أبناء وبنات العائلة، ويستمر المعرض لمدة ثلاثة أيام...",
        categoryColor: "bg-orange-500/90"
    },
    {
        id: 4,
        title: "نعي فاضل: المغفور له بإذن الله الشيخ عبدالله",
        category: "وفيات",
        date: "10 أغسطس 2023",
        year: "2023",
        excerpt: "بقلوب مؤمنة بقضاء الله وقدره، تنعي العائلة فقيدها الشيخ عبدالله الذي وافته المنية صباح اليوم. وسيوارى جثمانه الثرى بعد صلاة العصر...",
        categoryColor: "bg-gray-600/90"
    }
];

export default function NewsArchivePage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("كل التصنيفات");
    const [selectedYear, setSelectedYear] = useState("كل السنوات");

    // Filter Logic
    const filteredNews = NEWS_ITEMS.filter((item) => {
        const matchesSearch = item.title.includes(searchQuery) || item.excerpt.includes(searchQuery);
        const matchesCategory = selectedCategory === "كل التصنيفات" || item.category === selectedCategory;
        const matchesYear = selectedYear === "كل السنوات" || item.year === selectedYear;
        return matchesSearch && matchesCategory && matchesYear;
    });

    const clearFilters = () => {
        setSearchQuery("");
        setSelectedCategory("كل التصنيفات");
        setSelectedYear("كل السنوات");
    };

    return (
        <>
            {/* Page Header */}
            <div className="bg-white border-b border-[#f0f4f2] py-12 mb-8">
                <div className="max-w-[1280px] mx-auto px-4 sm:px-10 text-center">
                    <h1 className="text-4xl font-black text-[#111813] mb-4 font-display">أرشيف الأخبار</h1>
                    <p className="text-[#61896f] text-lg max-w-2xl mx-auto">
                        تصفح تاريخ وإعلانات وفعاليات العائلة عبر السنين
                    </p>
                </div>
            </div>

            <div className="max-w-[1280px] mx-auto px-4 sm:px-10 flex-grow w-full pb-20">

                {/* Filter Bar */}
                <div className="bg-white rounded-xl shadow-sm border border-[#e5e7eb] p-4 mb-10">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-grow relative bg-[#f0f4f0] rounded-lg h-12 focus-within:ring-2 ring-primary/20 transition-all">
                            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-[#61896f] w-5 h-5" />
                            <input
                                type="text"
                                placeholder="بحث في الأرشيف..."
                                className="w-full h-full bg-transparent border-none outline-none pr-12 pl-4 text-sm font-medium placeholder:text-[#61896f]"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Filters */}
                        <div className="grid grid-cols-2 md:flex gap-4">
                            <select
                                className="bg-[#f0f4f0] border-none text-[#111813] h-12 px-4 rounded-lg focus:ring-2 focus:ring-primary/20 cursor-pointer min-w-[140px] text-sm font-bold"
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                            >
                                <option>كل التصنيفات</option>
                                <option>إعلانات</option>
                                <option>قصص نجاح</option>
                                <option>وفيات</option>
                                <option>فعاليات</option>
                            </select>

                            <select
                                className="bg-[#f0f4f0] border-none text-[#111813] h-12 px-4 rounded-lg focus:ring-2 focus:ring-primary/20 cursor-pointer min-w-[120px] text-sm font-bold"
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value)}
                            >
                                <option>كل السنوات</option>
                                <option>2024</option>
                                <option>2023</option>
                                <option>2022</option>
                            </select>

                            <button
                                onClick={clearFilters}
                                className="bg-white border border-gray-200 text-gray-600 px-6 h-12 rounded-lg font-bold hover:bg-gray-50 transition flex items-center justify-center gap-2 col-span-2 md:col-span-1"
                            >
                                <X className="w-5 h-5" />
                                <span>مسح</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* News List */}
                <div className="flex flex-col gap-6">
                    {filteredNews.length > 0 ? (
                        filteredNews.map((item) => (
                            <ArticleCard
                                key={item.id}
                                title={item.title}
                                category={item.category}
                                date={item.date}
                                excerpt={item.excerpt}
                                categoryColor={item.categoryColor}
                            />
                        ))
                    ) : (
                        <div className="text-center py-20 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-gray-900">لا توجد نتائج</h3>
                            <p className="text-gray-500">جرب البحث بكلمات مختلفة أو تغيير التصنيف</p>
                        </div>
                    )}
                </div>

                {/* Pagination (Static for demo) */}
                {filteredNews.length > 0 && (
                    <div className="mt-12 flex justify-center gap-2">
                        <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#e5e7eb] hover:bg-slate-50 transition text-slate-500">
                            <ChevronLeft className="w-5 h-5 rotate-180" />
                        </button>
                        <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary text-white font-bold shadow-lg shadow-primary/20">
                            1
                        </button>
                    </div>
                )}

            </div>
        </>
    );
}

function ArticleCard({ title, category, date, excerpt, categoryColor = "bg-primary/90" }: any) {
    return (
        <Link href="/news/1" className="flex flex-col md:flex-row gap-6 bg-white rounded-xl overflow-hidden border border-[#e5e7eb] hover:shadow-lg hover:shadow-gray-100/50 transition-all duration-300 group cursor-pointer">
            <div className="w-full md:w-64 h-56 md:h-auto shrink-0 relative overflow-hidden bg-slate-100">
                <div className="absolute top-3 right-3 z-10">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold text-white backdrop-blur-sm ${categoryColor}`}>
                        {category}
                    </span>
                </div>
                {/* Placeholder for Image */}
                <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <Calendar className="w-12 h-12 opacity-20" />
                </div>
            </div>
            <div className="flex flex-col justify-center p-6 md:pr-0 flex-1">
                <div className="flex items-center gap-2 text-[#61896f] text-sm mb-2">
                    <Calendar className="w-[18px] h-[18px]" />
                    <time>{date}</time>
                </div>
                <h3 className="text-2xl font-bold text-[#111813] mb-3 group-hover:text-primary transition-colors font-display">
                    {title}
                </h3>
                <p className="text-[#61896f] leading-relaxed mb-4 line-clamp-2">
                    {excerpt}
                </p>
                <div className="mt-auto">
                    <span className="inline-flex items-center gap-1 text-primary font-bold text-sm hover:underline">
                        اقرأ المزيد
                        <ArrowRight className="w-[18px] h-[18px] rtl:rotate-180" />
                    </span>
                </div>
            </div>
        </Link>
    )
}
