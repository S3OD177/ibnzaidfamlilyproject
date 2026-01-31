"use client";

import {
    Bold, Italic, List, ListOrdered, AlignRight, AlignCenter, AlignLeft,
    Link as LinkIcon, Quote, Image as ImageIcon, Send, Calendar, Eye, Info,
    Save, Eye as View, UploadCloud
} from "lucide-react";

export default function NewsEditorPage() {
    return (
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 font-display pb-20">
            {/* Writing Area */}
            <div className="flex-1 space-y-6">
                {/* Title Input */}
                <div className="bg-white p-6 rounded-xl border border-[#dbe6e0] shadow-sm">
                    <input
                        className="w-full text-3xl font-bold bg-transparent border-none focus:ring-0 placeholder:text-gray-300 p-0 outline-none"
                        placeholder="عنوان المقال..."
                        type="text"
                    />
                    <div className="h-[1px] w-full bg-[#dbe6e0] mt-4"></div>

                    {/* Toolbar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 py-3 mt-2">
                        <div className="flex items-center gap-1 text-[#111814]">
                            <button className="p-2 hover:bg-gray-100 rounded transition-colors"><Bold className="w-5 h-5" /></button>
                            <button className="p-2 hover:bg-gray-100 rounded transition-colors"><Italic className="w-5 h-5" /></button>
                            <div className="w-px h-6 bg-gray-200 mx-1"></div>
                            <button className="p-2 hover:bg-gray-100 rounded transition-colors"><List className="w-5 h-5" /></button>
                            <button className="p-2 hover:bg-gray-100 rounded transition-colors"><ListOrdered className="w-5 h-5" /></button>
                            <div className="w-px h-6 bg-gray-200 mx-1"></div>
                            <button className="p-2 hover:bg-gray-100 rounded transition-colors text-primary"><AlignRight className="w-5 h-5" /></button>
                            <button className="p-2 hover:bg-gray-100 rounded transition-colors"><AlignCenter className="w-5 h-5" /></button>
                            <button className="p-2 hover:bg-gray-100 rounded transition-colors"><AlignLeft className="w-5 h-5" /></button>
                            <div className="w-px h-6 bg-gray-200 mx-1"></div>
                            <button className="p-2 hover:bg-gray-100 rounded transition-colors"><LinkIcon className="w-5 h-5" /></button>
                            <button className="p-2 hover:bg-gray-100 rounded transition-colors"><Quote className="w-5 h-5" /></button>
                        </div>
                        <button className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-bold hover:bg-primary/20 transition-all">
                            <ImageIcon className="w-5 h-5" />
                            <span>إضافة وسائط</span>
                        </button>
                    </div>

                    {/* Editor Content Placeholder */}
                    <textarea
                        className="w-full min-h-[500px] bg-transparent border-none focus:ring-0 text-lg leading-relaxed text-[#111814] placeholder:text-gray-300 p-0 resize-none mt-4 outline-none"
                        placeholder="ابدأ في كتابة تفاصيل الخبر هنا..."
                    ></textarea>
                </div>
            </div>

            {/* Sidebar Options */}
            <div className="w-full lg:w-80 space-y-6">
                {/* Publishing Options Card */}
                <div className="bg-white p-5 rounded-xl border border-[#dbe6e0] shadow-sm">
                    <h3 className="text-base font-bold mb-4 flex items-center gap-2 text-[#111814]">
                        <Send className="w-5 h-5 text-primary" />
                        خيارات النشر
                    </h3>
                    <div className="space-y-4">
                        <label className="block">
                            <span className="text-sm font-medium text-[#618975] mb-1.5 block">تصنيف الخبر</span>
                            <select className="w-full rounded-lg border border-[#dbe6e0] bg-white p-2.5 text-sm outline-none focus:border-primary">
                                <option>اختر التصنيف...</option>
                                <option>تعميمات</option>
                                <option>مناسبات</option>
                                <option>قصص نجاح</option>
                                <option>أخبار عائلية</option>
                            </select>
                        </label>
                        <label className="block">
                            <span className="text-sm font-medium text-[#618975] mb-1.5 block">تاريخ النشر</span>
                            <div className="relative">
                                <input className="w-full rounded-lg border border-[#dbe6e0] bg-white p-2.5 pl-10 text-sm outline-none focus:border-primary" type="date" />
                                <Calendar className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            </div>
                        </label>
                    </div>
                </div>

                {/* Featured Image Card */}
                <div className="bg-white p-5 rounded-xl border border-[#dbe6e0] shadow-sm">
                    <h3 className="text-base font-bold mb-4 flex items-center gap-2 text-[#111814]">
                        <ImageIcon className="w-5 h-5 text-primary" />
                        الصورة البارزة
                    </h3>
                    <div className="group cursor-pointer border-2 border-dashed border-[#dbe6e0] rounded-xl overflow-hidden aspect-video flex flex-col items-center justify-center hover:bg-gray-50 transition-all bg-gray-50">
                        <div className="flex flex-col items-center text-center p-4">
                            <UploadCloud className="w-8 h-8 text-primary mb-2" />
                            <span className="text-xs font-bold text-[#111814]">انقر لتغيير الصورة</span>
                            <span className="text-[10px] text-[#618975] mt-1">تنسيق JPG أو PNG</span>
                        </div>
                    </div>
                </div>

                {/* Visibility Card */}
                <div className="bg-white p-5 rounded-xl border border-[#dbe6e0] shadow-sm">
                    <h3 className="text-base font-bold mb-4 flex items-center gap-2 text-[#111814]">
                        <Eye className="w-5 h-5 text-primary" />
                        الخصوصية والظهور
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-[#f6f8f7] rounded-lg">
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-[#111814]">ظهور عام</span>
                                <span className="text-sm text-[#618975]">متاح للجميع خارج المنصة</span>
                            </div>
                            <input type="checkbox" className="accent-primary w-5 h-5" defaultChecked />
                        </div>
                        <div className="flex items-center gap-2 text-xs text-[#618975]">
                            <Info className="w-4 h-4" />
                            <span>سيتم إرسال تنبيه للأعضاء عند النشر.</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Fixed Bottom Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#dbe6e0] z-40 lg:mr-72 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-400">
                        <span className="flex items-center gap-1.5 text-xs text-[#618975] font-bold">
                            <span className="w-2 h-2 rounded-full bg-orange-400"></span>
                            آخر حفظ تلقائي: منذ دقيقتين
                        </span>
                    </div>
                    <div className="flex gap-3">
                        <button className="px-5 py-2.5 text-sm font-bold text-[#618975] hover:bg-gray-100 rounded-lg transition-all">
                            حفظ كمسودة
                        </button>
                        <button className="px-5 py-2.5 text-sm font-bold text-[#111814] border border-[#dbe6e0] hover:bg-gray-50 rounded-lg transition-all flex items-center gap-2">
                            <Eye className="w-4 h-4" />
                            معاينة
                        </button>
                        <button className="px-8 py-2.5 bg-primary text-white text-sm font-bold rounded-lg hover:shadow-lg hover:shadow-primary/30 transition-all flex items-center gap-2">
                            <Send className="w-4 h-4" />
                            نشر المقال
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
