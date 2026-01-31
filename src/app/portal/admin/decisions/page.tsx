"use client";

import Link from "next/link";
import {
    Calendar, FileText, Filter, Search, Download,
    ChevronLeft, ChevronRight, Eye, MoreHorizontal,
    History, Gavel, Scale, Scroll
} from "lucide-react";

export default function DecisionsIndexPage() {
    return (
        <div className="max-w-[1440px] mx-auto w-full font-display min-h-screen">

            {/* Page Heading */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-6 border-b border-[#dbe6dd]">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-primary">
                        <History className="w-5 h-5" />
                        <span className="text-sm font-bold uppercase tracking-widest">السجلات الرسمية</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-[#111812]">أرشيف قرارات المجلس الرسمية</h1>
                    <p className="text-[#618968] text-lg max-w-2xl">مستودع آمن لجميع القرارات العائلية الرسمية والسجلات التشريعية المعتمدة.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-6 py-3 bg-white border border-[#dbe6dd] text-[#111812] font-bold rounded-xl hover:bg-[#f9f8f3] transition-colors">
                        <Download className="w-5 h-5" />
                        <span>تصدير التقرير</span>
                    </button>
                    <Link href="/portal/admin/decisions/new" className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all">
                        <Gavel className="w-5 h-5" />
                        <span>إصدار قرار جديد</span>
                    </Link>
                </div>
            </div>

            {/* Filters Section */}
            <div className="bg-white p-6 rounded-xl border border-[#dbe6dd] shadow-sm mb-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-[#111812]">نوع القرار</label>
                        <select className="w-full rounded-lg border-[#dbe6dd] bg-[#f8faf8] focus:ring-primary focus:border-primary py-3 px-4 font-bold text-sm">
                            <option>جميع الأنواع</option>
                            <option>مالي</option>
                            <option>إداري</option>
                            <option>اجتماعي</option>
                            <option>تاريخي</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-[#111812]">السنة (هجري)</label>
                        <input className="w-full rounded-lg border-[#dbe6dd] bg-[#f8faf8] focus:ring-primary focus:border-primary py-3 px-4 font-bold text-sm" placeholder="مثال: 1445 هـ" type="text" />
                    </div>
                    <div className="space-y-2 md:col-span-1">
                        <label className="text-sm font-bold text-[#111812]">الكلمات المفتاحية</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-3.5 text-[#618968] w-5 h-5" />
                            <input className="w-full rounded-lg border-[#dbe6dd] bg-[#f8faf8] focus:ring-primary focus:border-primary py-3 pl-10 pr-4 font-bold text-sm" placeholder="البحث في العنوان أو المحتوى..." type="text" />
                        </div>
                    </div>
                    <button className="bg-[#111812] text-white font-bold py-3 px-6 rounded-lg hover:bg-black transition-colors flex items-center justify-center gap-2">
                        <Filter className="w-4 h-4" />
                        تطبيق الفلترة
                    </button>
                </div>
                <div className="flex gap-3 mt-6 overflow-x-auto pb-2 custom-scrollbar">
                    <span className="text-sm font-bold text-gray-400 flex items-center whitespace-nowrap">التصنيفات السريعة:</span>
                    <button className="flex items-center gap-1 h-8 shrink-0 rounded-full bg-primary/10 text-primary px-4 text-xs font-bold border border-primary/20 hover:bg-primary/20 transition-colors">
                        التعليم
                    </button>
                    <button className="flex items-center gap-1 h-8 shrink-0 rounded-full bg-[#f0f4f1] text-[#111812] px-4 text-xs font-bold border border-[#dbe6dd] hover:bg-[#e2e8e4] transition-colors">
                        الأوقاف
                    </button>
                    <button className="flex items-center gap-1 h-8 shrink-0 rounded-full bg-[#f0f4f1] text-[#111812] px-4 text-xs font-bold border border-[#dbe6dd] hover:bg-[#e2e8e4] transition-colors">
                        نظام العضوية
                    </button>
                    <button className="flex items-center gap-1 h-8 shrink-0 rounded-full bg-[#f0f4f1] text-[#111812] px-4 text-xs font-bold border border-[#dbe6dd] hover:bg-[#e2e8e4] transition-colors">
                        صندوق التكافل
                    </button>
                </div>
            </div>

            {/* Resolution Cards List */}
            <div className="flex flex-col gap-6">
                {/* Card 1: Active */}
                <div className="bg-white rounded-xl border border-[#dbe6dd] shadow-sm overflow-hidden hover:shadow-md transition-all group">
                    <div className="flex flex-col md:flex-row">
                        <div className="w-full md:w-2 bg-primary group-hover:bg-primary-dark transition-colors"></div>
                        <div className="p-6 flex-1 flex flex-col md:flex-row gap-6">
                            <div className="flex-none flex flex-col items-center justify-center border-2 border-[#D4AF37] bg-[#FDFBF7] rounded-lg p-4 w-full md:w-32">
                                <span className="text-xs font-bold text-[#D4AF37] mb-1 uppercase tracking-tighter">رقم القرار</span>
                                <span className="text-xl font-black text-[#111812]">2024-05</span>
                            </div>
                            <div className="flex-1 flex flex-col gap-3">
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <h3 className="text-xl font-bold text-[#111812] group-hover:text-primary transition-colors">تخصيص صندوق التعليم السنوي لعام 1445هـ</h3>
                                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-200 flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                        قرار ساري
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-[#618968]">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        <span>15 رمضان 1445 / 25 مارس 2024</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Scroll className="w-4 h-4" />
                                        <span>مالي • تعليمي</span>
                                    </div>
                                </div>
                                <p className="text-[#111812] leading-relaxed text-sm">تحديد معايير توزيع المنح الدراسية الأكاديمية عبر فروع العائلة المختلفة وضوابط صرفها للطلاب المتفوقين.</p>
                                <div className="flex justify-end mt-2">
                                    <Link href="/portal/admin/decisions/1" className="flex items-center gap-2 text-primary font-bold hover:underline text-sm">
                                        <Eye className="w-4 h-4" />
                                        عرض نص القرار كاملاً
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Card 2: Superseded */}
                <div className="bg-white rounded-xl border border-[#dbe6dd] shadow-sm overflow-hidden hover:shadow-md transition-all group opacity-80 hover:opacity-100">
                    <div className="flex flex-col md:flex-row">
                        <div className="w-full md:w-2 bg-gray-400"></div>
                        <div className="p-6 flex-1 flex flex-col md:flex-row gap-6">
                            <div className="flex-none flex flex-col items-center justify-center border-2 border-gray-200 bg-gray-50 rounded-lg p-4 w-full md:w-32">
                                <span className="text-xs font-bold text-gray-500 mb-1 uppercase">رقم القرار</span>
                                <span className="text-xl font-black text-gray-700">2023-14</span>
                            </div>
                            <div className="flex-1 flex flex-col gap-3">
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <h3 className="text-xl font-bold text-[#111812]">إعادة الهيكلة الإدارية لمجلس العائلة</h3>
                                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold border border-gray-200">
                                        مستبدل بقرار لاحق
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-[#618968]">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        <span>02 صفر 1444 / 29 أغسطس 2023</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Scale className="w-4 h-4" />
                                        <span>إداري • حوكمة</span>
                                    </div>
                                </div>
                                <p className="text-[#111812] leading-relaxed text-sm">تحديث اللوائح الداخلية للحوكمة وتعيين رؤساء اللجان الفرعية للمناطق.</p>
                                <div className="flex justify-end mt-2">
                                    <button className="flex items-center gap-2 text-gray-500 font-bold hover:text-primary transition-colors text-sm">
                                        <Eye className="w-4 h-4" />
                                        عرض نص القرار
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Card 3: Historical */}
                <div className="bg-white rounded-xl border border-[#dbe6dd] shadow-sm overflow-hidden hover:shadow-md transition-all group">
                    <div className="flex flex-col md:flex-row">
                        <div className="w-full md:w-2 bg-[#D4AF37]"></div>
                        <div className="p-6 flex-1 flex flex-col md:flex-row gap-6">
                            <div className="flex-none flex flex-col items-center justify-center border-2 border-[#D4AF37] bg-[#FDFBF7] rounded-lg p-4 w-full md:w-32">
                                <span className="text-xs font-bold text-[#D4AF37] mb-1 uppercase">رقم القرار</span>
                                <span className="text-xl font-black text-[#D4AF37]">2019-05</span>
                            </div>
                            <div className="flex-1 flex flex-col gap-3">
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <h3 className="text-xl font-bold text-[#111812]">اعتماد وثيقة اندماج فروع المنطقة الشمالية</h3>
                                    <span className="bg-yellow-50 text-[#D4AF37] px-3 py-1 rounded-full text-xs font-bold border border-yellow-100 flex items-center gap-1">
                                        <History className="w-3 h-3" />
                                        تاريخي
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-[#618968]">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        <span>22 جمادى الأولى 1440 / 28 يناير 2019</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Scroll className="w-4 h-4" />
                                        <span>تاريخي • تنظيمي</span>
                                    </div>
                                </div>
                                <p className="text-[#111812] leading-relaxed text-sm">قرار تاريخي بتوحيد التمثيل القانوني لجميع الفروع الشمالية تحت مظلة المجلس المركزي.</p>
                                <div className="flex justify-end mt-2">
                                    <button className="flex items-center gap-2 text-gray-500 font-bold hover:text-primary transition-colors text-sm">
                                        <Eye className="w-4 h-4" />
                                        عرض نص القرار
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pagination */}
            <div className="flex justify-center items-center gap-4 mt-12 py-6 border-t border-[#dbe6dd]">
                <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#dbe6dd] bg-white text-[#111812] hover:bg-gray-50 transition-colors">
                    <ChevronRight className="w-5 h-5" />
                </button>
                <div className="flex gap-2">
                    <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary text-white font-bold shadow-md shadow-primary/20">1</button>
                    <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#dbe6dd] bg-white hover:bg-gray-50 font-bold text-gray-600 transition-colors">2</button>
                    <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#dbe6dd] bg-white hover:bg-gray-50 font-bold text-gray-600 transition-colors">3</button>
                    <span className="flex items-end px-2 text-gray-400 font-bold">...</span>
                    <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#dbe6dd] bg-white hover:bg-gray-50 font-bold text-gray-600 transition-colors">12</button>
                </div>
                <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#dbe6dd] bg-white text-[#111812] hover:bg-gray-50 transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
