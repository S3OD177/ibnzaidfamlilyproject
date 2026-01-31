"use client";

import {
    FileText, UploadCloud, Search, Filter, Folder,
    MoreHorizontal, Download, Trash2, Eye, File,
    Image, FileJson, FileType, Clock, CheckCircle
} from "lucide-react";

export default function DocumentsPage() {
    return (
        <div className="max-w-[1440px] mx-auto w-full font-display min-h-screen">

            {/* Page Heading */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-6 border-b border-[#dbe6dd]">
                <div>
                    <h1 className="text-3xl font-black text-[#111812] mb-2">إدارة الوثائق والأرشيف</h1>
                    <p className="text-[#618968] max-w-2xl">مستودع مركزي لجميع الوثائق، الصور، والمستندات الرسمية للعائلة.</p>
                </div>
                <button className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all">
                    <UploadCloud className="w-5 h-5" />
                    <span>رفع ملف جديد</span>
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-5 rounded-xl border border-[#dbe6dd] shadow-sm flex items-center gap-4">
                    <div className="size-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                        <FileText className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-2xl font-black text-[#111812]">1,240</p>
                        <p className="text-xs font-bold text-[#618968]">إجمالي الملفات</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-[#dbe6dd] shadow-sm flex items-center gap-4">
                    <div className="size-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                        <Image className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-2xl font-black text-[#111812]">856</p>
                        <p className="text-xs font-bold text-[#618968]">صور ووسائط</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-[#dbe6dd] shadow-sm flex items-center gap-4">
                    <div className="size-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
                        <Folder className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-2xl font-black text-[#111812]">12</p>
                        <p className="text-xs font-bold text-[#618968]">مجلدات نشطة</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-[#dbe6dd] shadow-sm flex items-center gap-4">
                    <div className="size-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center border border-green-100">
                        <CheckCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-2xl font-black text-[#111812]">24.5GB</p>
                        <p className="text-xs font-bold text-[#618968]">المساحة المستخدمة</p>
                    </div>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="bg-white p-4 rounded-xl border border-[#dbe6dd] shadow-sm mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative w-full md:w-80">
                        <Search className="absolute right-3 top-3 text-[#618968] w-4 h-4" />
                        <input className="w-full rounded-lg border-[#dbe6dd] bg-[#f8faf8] focus:ring-primary focus:border-primary py-2.5 pr-10 pl-4 text-sm font-bold" placeholder="البحث عن ملف..." type="text" />
                    </div>
                </div>
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    <button className="flex items-center gap-2 px-4 py-2 bg-[#111812] text-white rounded-lg text-sm font-bold whitespace-nowrap">
                        <Filter className="w-4 h-4" />
                        الكل
                    </button>
                    <button className="px-4 py-2 bg-white border border-[#dbe6dd] text-[#618968] rounded-lg text-sm font-bold hover:bg-[#f8faf8] whitespace-nowrap transition-colors">Documents</button>
                    <button className="px-4 py-2 bg-white border border-[#dbe6dd] text-[#618968] rounded-lg text-sm font-bold hover:bg-[#f8faf8] whitespace-nowrap transition-colors">Images</button>
                    <button className="px-4 py-2 bg-white border border-[#dbe6dd] text-[#618968] rounded-lg text-sm font-bold hover:bg-[#f8faf8] whitespace-nowrap transition-colors">Archives</button>
                </div>
            </div>

            {/* File Browser Layout */}
            <div className="bg-white rounded-xl border border-[#dbe6dd] shadow-sm overflow-hidden">
                <div className="grid grid-cols-12 border-b border-[#dbe6dd] bg-[#f8faf8] text-xs font-bold text-[#618968] py-3 px-6">
                    <div className="col-span-6 md:col-span-5">الاسم</div>
                    <div className="col-span-3 md:col-span-2 hidden md:block">المالك</div>
                    <div className="col-span-3 md:col-span-2 hidden md:block">التاريخ</div>
                    <div className="col-span-3 md:col-span-2 text-center">الحجم</div>
                    <div className="col-span-3 md:col-span-1 text-left">إجراءات</div>
                </div>

                <div className="divide-y divide-[#f0f4f2]">
                    {/* Folder Row */}
                    <div className="grid grid-cols-12 items-center py-4 px-6 hover:bg-[#fcfdfc] transition-colors cursor-pointer group">
                        <div className="col-span-6 md:col-span-5 flex items-center gap-3">
                            <Folder className="w-5 h-5 text-amber-400 fill-amber-400" />
                            <span className="text-sm font-bold text-[#111812]">وثائق تأسيسية (مجلس 2024)</span>
                        </div>
                        <div className="col-span-3 md:col-span-2 hidden md:block text-xs font-medium text-gray-500">النظام</div>
                        <div className="col-span-3 md:col-span-2 hidden md:block text-xs text-gray-400">20 مارس 2024</div>
                        <div className="col-span-3 md:col-span-2 text-center text-xs font-bold text-[#111812]">--</div>
                        <div className="col-span-3 md:col-span-1 flex justify-end">
                            <button className="p-1 text-gray-400 hover:text-[#111812]"><MoreHorizontal className="w-4 h-4" /></button>
                        </div>
                    </div>

                    {/* File Row 1 */}
                    <div className="grid grid-cols-12 items-center py-4 px-6 hover:bg-[#fcfdfc] transition-colors group">
                        <div className="col-span-6 md:col-span-5 flex items-center gap-3">
                            <FileText className="w-5 h-5 text-blue-500" />
                            <div>
                                <p className="text-sm font-bold text-[#111812]">محضر اجتماع الجمعية العمومية.pdf</p>
                                <p className="text-[10px] text-gray-400 md:hidden">عبدالرحمن الهاشم • 2.4 MB</p>
                            </div>
                        </div>
                        <div className="col-span-3 md:col-span-2 hidden md:block text-xs font-medium text-gray-500">عبدالرحمن الهاشم</div>
                        <div className="col-span-3 md:col-span-2 hidden md:block text-xs text-gray-400">أمس، 10:30 ص</div>
                        <div className="col-span-3 md:col-span-2 text-center text-xs font-bold text-[#111812] hidden md:block">2.4 MB</div>
                        <div className="col-span-3 md:col-span-1 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-1.5 hover:bg-gray-100 rounded text-gray-500"><Download className="w-4 h-4" /></button>
                            <button className="p-1.5 hover:bg-gray-100 rounded text-gray-500"><Eye className="w-4 h-4" /></button>
                        </div>
                    </div>

                    {/* File Row 2 */}
                    <div className="grid grid-cols-12 items-center py-4 px-6 hover:bg-[#fcfdfc] transition-colors group">
                        <div className="col-span-6 md:col-span-5 flex items-center gap-3">
                            <Image className="w-5 h-5 text-purple-500" />
                            <div>
                                <p className="text-sm font-bold text-[#111812]">صورة غلاف التقرير السنوي.png</p>
                            </div>
                        </div>
                        <div className="col-span-3 md:col-span-2 hidden md:block text-xs font-medium text-gray-500">ساره خالد</div>
                        <div className="col-span-3 md:col-span-2 hidden md:block text-xs text-gray-400">15 يناير 2024</div>
                        <div className="col-span-3 md:col-span-2 text-center text-xs font-bold text-[#111812] hidden md:block">5.1 MB</div>
                        <div className="col-span-3 md:col-span-1 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-1.5 hover:bg-gray-100 rounded text-gray-500"><Download className="w-4 h-4" /></button>
                            <button className="p-1.5 hover:bg-gray-100 rounded text-gray-500"><Eye className="w-4 h-4" /></button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
