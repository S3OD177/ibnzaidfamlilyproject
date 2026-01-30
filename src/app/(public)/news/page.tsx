import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Search, Filter, Calendar, ArrowRight, ChevronLeft } from "lucide-react";

export const metadata = {
    title: "أرشيف الأخبار | منصة العائلة",
};

export default function NewsArchivePage() {
    return (
        <div className="bg-white min-h-screen flex flex-col font-body">
            <Header />

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
                            />
                        </div>

                        {/* Filters */}
                        <div className="grid grid-cols-2 md:flex gap-4">
                            <select className="bg-[#f0f4f0] border-none text-[#111813] h-12 px-4 rounded-lg focus:ring-2 focus:ring-primary/20 cursor-pointer min-w-[140px] text-sm font-bold">
                                <option>كل التصنيفات</option>
                                <option>إعلانات</option>
                                <option>قصص نجاح</option>
                                <option>وفيات</option>
                            </select>

                            <select className="bg-[#f0f4f0] border-none text-[#111813] h-12 px-4 rounded-lg focus:ring-2 focus:ring-primary/20 cursor-pointer min-w-[120px] text-sm font-bold">
                                <option>2024</option>
                                <option>2023</option>
                                <option>2022</option>
                            </select>

                            <button className="bg-primary text-white px-8 h-12 rounded-lg font-bold hover:bg-green-600 transition flex items-center justify-center gap-2 shadow-lg shadow-primary/20 col-span-2 md:col-span-1">
                                <Filter className="w-5 h-5" />
                                <span>تصفية</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* News List */}
                <div className="flex flex-col gap-6">
                    <ArticleCard
                        title="تكريم الدكتور أحمد لحصوله على جائزة الملك فيصل العالمية"
                        category="قصص نجاح"
                        date="15 نوفمبر 2023"
                        excerpt="في حفل بهيج حضره كبار الشخصيات، تم تكريم ابن العائلة الدكتور أحمد نظير إسهاماته العلمية المتميزة في مجال الطب والجراحة، والتي رفعت اسم العائلة عالياً..."
                    />
                    <ArticleCard
                        title="تحديد موعد الاجتماع السنوي التاسع للعائلة في الرياض"
                        category="إعلانات"
                        categoryColor="bg-blue-600/90"
                        date="01 أكتوبر 2023"
                        excerpt="يسر مجلس العائلة دعوة جميع الأفراد لحضور الاجتماع السنوي الذي سيقام في قاعة الاحتفالات الكبرى، وسيتضمن اللقاء فقرات متنوعة وتكريم للمتفوقين..."
                    />
                    <ArticleCard
                        title="افتتاح معرض الفنون التشكيلية لمواهب العائلة الشابة"
                        category="فعاليات"
                        categoryColor="bg-orange-500/90"
                        date="20 سبتمبر 2023"
                        excerpt="في مبادرة لدعم المواهب، تم افتتاح المعرض الفني الذي يضم أكثر من ٥٠ عملاً فنياً من إبداع أبناء وبنات العائلة، ويستمر المعرض لمدة ثلاثة أيام..."
                    />
                    <ArticleCard
                        title="نعي فاضل: المغفور له بإذن الله الشيخ عبدالله"
                        category="وفيات"
                        categoryColor="bg-gray-600/90"
                        date="10 أغسطس 2023"
                        excerpt="بقلوب مؤمنة بقضاء الله وقدره، تنعي العائلة فقيدها الشيخ عبدالله الذي وافته المنية صباح اليوم. وسيوارى جثمانه الثرى بعد صلاة العصر..."
                    />
                </div>

                {/* Pagination */}
                <div className="mt-12 flex justify-center gap-2">
                    <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#e5e7eb] hover:bg-slate-50 transition text-slate-500">
                        <ChevronLeft className="w-5 h-5 rotate-180" />
                    </button>
                    <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary text-white font-bold shadow-lg shadow-primary/20">
                        1
                    </button>
                    <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#e5e7eb] hover:bg-slate-50 transition text-[#111813] font-medium">
                        2
                    </button>
                    <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#e5e7eb] hover:bg-slate-50 transition text-[#111813] font-medium">
                        3
                    </button>
                    <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#e5e7eb] hover:bg-slate-50 transition text-slate-500">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                </div>

            </div>
        </div>
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
