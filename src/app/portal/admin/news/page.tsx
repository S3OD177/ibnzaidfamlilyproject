"use client";

import Link from "next/link";
import {
    Plus, Search, Filter, MoreHorizontal, Edit, Trash2,
    Eye, Calendar, CheckCircle, XCircle
} from "lucide-react";

export default function NewsIndexPage() {
    return (
        <div className="max-w-[1440px] mx-auto w-full font-display min-h-screen">

            {/* Page Heading */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b border-[#dbe6dd] pb-6">
                <div>
                    <h1 className="text-3xl font-black text-[#111812] mb-2">إدارة الأخبار والمحتوى</h1>
                    <p className="text-[#618968] max-w-2xl">نشر ومتابعة الأخبار، الفعاليات، والتعميمات الرسمية لجميع فروع العائلة.</p>
                </div>
                <Link href="/portal/admin/news/new" className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all">
                    <Plus className="w-5 h-5" />
                    <span>كتابة خبر جديد</span>
                </Link>
            </div>

            {/* Filters & Search */}
            <div className="bg-white p-4 rounded-xl border border-[#dbe6dd] shadow-sm mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative w-full md:w-80">
                        <Search className="absolute right-3 top-3 text-[#618968] w-4 h-4" />
                        <input className="w-full rounded-lg border-[#dbe6dd] bg-[#f8faf8] focus:ring-primary focus:border-primary py-2.5 pr-10 pl-4 text-sm font-bold" placeholder="البحث في الأخبار..." type="text" />
                    </div>
                </div>
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    <button className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm font-bold whitespace-nowrap border border-primary/20">
                        <Filter className="w-4 h-4" />
                        الكل (24)
                    </button>
                    <button className="px-4 py-2 bg-white border border-[#dbe6dd] text-[#618968] rounded-lg text-sm font-bold hover:bg-[#f8faf8] whitespace-nowrap transition-colors">منشور (18)</button>
                    <button className="px-4 py-2 bg-white border border-[#dbe6dd] text-[#618968] rounded-lg text-sm font-bold hover:bg-[#f8faf8] whitespace-nowrap transition-colors">مسودة (4)</button>
                    <button className="px-4 py-2 bg-white border border-[#dbe6dd] text-[#618968] rounded-lg text-sm font-bold hover:bg-[#f8faf8] whitespace-nowrap transition-colors">مجدول (2)</button>
                </div>
            </div>

            {/* News Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* News Card 1 */}
                <div className="bg-white rounded-xl border border-[#dbe6dd] shadow-sm overflow-hidden hover:shadow-md transition-all group">
                    <div className="relative h-48 bg-gray-100">
                        {/* Placeholder for News Image */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-primary shadow-sm">
                            أخبار عائلية
                        </div>
                        <div className="absolute bottom-4 right-4 left-4 text-white">
                            <h3 className="font-bold text-lg leading-tight mb-1 truncate">افتتاح المخيم الربيعي السنوي</h3>
                            <div className="flex items-center gap-2 text-xs opacity-90">
                                <Calendar className="w-3 h-3" />
                                <span>منذ يومين</span>
                            </div>
                        </div>
                    </div>
                    <div className="p-4">
                        <div className="flex items-center justify-between mb-4">
                            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-xs font-bold border border-green-100">
                                <CheckCircle className="w-3 h-3" />
                                منشور
                            </span>
                            <div className="flex items-center gap-2 text-gray-400 text-xs font-bold">
                                <Eye className="w-3 h-3" />
                                <span>1.2k مشاهدة</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 border-t border-[#f0f4f2] pt-4">
                            <Link href="/portal/admin/news/new" className="flex-1 py-2 text-center text-sm font-bold text-[#618968] hover:bg-[#f0f4f2] rounded-lg transition-colors flex items-center justify-center gap-2">
                                <Edit className="w-4 h-4" />
                                تعديل
                            </Link>
                            <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* News Card 2 */}
                <div className="bg-white rounded-xl border border-[#dbe6dd] shadow-sm overflow-hidden hover:shadow-md transition-all group">
                    <div className="relative h-48 bg-gray-100 flex items-center justify-center">
                        <div className="text-gray-400 font-bold text-sm">لا توجد صورة بارزة</div>
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-amber-600 shadow-sm">
                            تعميم إداري
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white">
                            <h3 className="font-bold text-lg leading-tight mb-1 truncate">تحديث سياسة الخصوصية الجديدة</h3>
                            <div className="flex items-center gap-2 text-xs opacity-90">
                                <Calendar className="w-3 h-3" />
                                <span>15 مارس 2024</span>
                            </div>
                        </div>
                    </div>
                    <div className="p-4">
                        <div className="flex items-center justify-between mb-4">
                            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-100">
                                <CheckCircle className="w-3 h-3" />
                                مجدول
                            </span>
                            <div className="flex items-center gap-2 text-gray-400 text-xs font-bold">
                                <span>-- مشاهدة</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 border-t border-[#f0f4f2] pt-4">
                            <Link href="/portal/admin/news/new" className="flex-1 py-2 text-center text-sm font-bold text-[#618968] hover:bg-[#f0f4f2] rounded-lg transition-colors flex items-center justify-center gap-2">
                                <Edit className="w-4 h-4" />
                                تعديل
                            </Link>
                            <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* News Card 3 */}
                <div className="bg-white rounded-xl border border-[#dbe6dd] shadow-sm overflow-hidden hover:shadow-md transition-all group opacity-80">
                    <div className="relative h-48 bg-gray-100">
                        <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-500 shadow-sm">
                            مسودة
                        </div>
                        <div className="absolute bottom-4 right-4 left-4 text-[#111812]">
                            <h3 className="font-bold text-lg leading-tight mb-1 truncate">تقرير اجتماع مجلس الإدارة الربع سنوي</h3>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                <Calendar className="w-3 h-3" />
                                <span>آخر تعديل: قبل ساعة</span>
                            </div>
                        </div>
                    </div>
                    <div className="p-4">
                        <div className="flex items-center justify-between mb-4">
                            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-bold border border-gray-200">
                                <Edit className="w-3 h-3" />
                                قيد التحرير
                            </span>
                        </div>
                        <div className="flex items-center gap-2 border-t border-[#f0f4f2] pt-4">
                            <Link href="/portal/admin/news/new" className="flex-1 py-2 text-center text-sm font-bold text-[#618968] hover:bg-[#f0f4f2] rounded-lg transition-colors flex items-center justify-center gap-2">
                                <Edit className="w-4 h-4" />
                                استكمال
                            </Link>
                            <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pagination Component (Same as others) */}
            <div className="flex justify-center items-center gap-4 mt-12 py-6 border-t border-[#dbe6dd]">
                {/* Simplified for brevity */}
                <div className="flex gap-2">
                    <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary text-white font-bold shadow-md shadow-primary/20">1</button>
                    <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#dbe6dd] bg-white hover:bg-gray-50 font-bold text-gray-600 transition-colors">2</button>
                </div>
            </div>
        </div>
    );
}
