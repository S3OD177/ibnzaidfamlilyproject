"use client";

import {
    Search, Filter, Calendar, ChevronLeft, ChevronRight,
    CheckCircle, XCircle, MoreHorizontal, Download, User
} from "lucide-react";

export default function ApprovalsPage() {
    return (
        <div className="max-w-7xl mx-auto font-display h-[calc(100vh-140px)] flex flex-col">
            {/* Header & Filters */}
            <div className="mb-6 flex flex-col gap-6">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-[#111814]">طلبات انضمام الأعضاء</h1>
                        <p className="text-[#618975] mt-1">مراجعة وتوثيق طلبات الانتساب الجديدة لجميع فروع العائلة</p>
                    </div>
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-4 h-10 rounded-lg bg-[#f0f4f2] text-sm font-bold hover:bg-[#e0e8e4] transition-colors text-[#111814]">
                            <Filter className="w-4 h-4" />
                            <span>تصفية</span>
                        </button>
                        <button className="flex items-center gap-2 px-4 h-10 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary-dark transition-colors shadow-sm">
                            <Download className="w-4 h-4" />
                            <span>تصدير التقرير</span>
                        </button>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pb-6 border-b border-[#dbe6e0]">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            className="bg-white border border-[#dbe6e0] rounded-lg pl-3 pr-9 py-2 text-sm outline-none focus:border-primary w-64"
                            placeholder="بحث عن اسم، رقم هوية..."
                        />
                    </div>
                    <div className="mr-auto flex items-center gap-2 bg-white border border-[#dbe6e0] rounded-lg px-3 py-2 cursor-pointer hover:bg-gray-50">
                        <Calendar className="w-4 h-4 text-[#618975]" />
                        <span className="text-sm font-bold text-[#111814]">ديسمبر 2023</span>
                    </div>
                </div>
            </div>

            {/* Main Content Area: List + Details Split View */}
            <div className="flex flex-1 gap-6 overflow-hidden">

                {/* LIST (Left side in RTL, but actually flex-1) */}
                <div className="flex-1 bg-white border border-[#dbe6e0] rounded-xl overflow-y-auto shadow-sm">
                    <table className="w-full text-right border-collapse">
                        <thead className="bg-[#f0f4f2]/50 text-[#618975] sticky top-0 z-10 backdrop-blur-sm">
                            <tr>
                                <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider">اسم العضو</th>
                                <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider">الفرع</th>
                                <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider">تاريخ الطلب</th>
                                <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider">الحالة</th>
                                <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#dbe6e0]">
                            {[
                                { name: "أحمد بن محمد الهاشم", branch: "المنطقة الوسطى", date: "2023/12/01", status: "review" },
                                { name: "سارة بنت خالد", branch: "فرع الشرقية", date: "2023/11/28", status: "new" },
                                { name: "فهد بن سلطان آل هاشم", branch: "فرع الشمال", date: "2023/11/25", status: "new" },
                                { name: "عبدالعزيز بن خالد", branch: "فرع الجنوب", date: "2023/11/24", status: "new" },
                                { name: "محمد العبدالله", branch: "المنطقة الوسطى", date: "2023/11/20", status: "rejected" },
                            ].map((row, i) => (
                                <tr key={i} className={`group hover:bg-gray-50 cursor-pointer transition-colors ${i === 0 ? "bg-primary/[0.03]" : ""}`}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="size-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-200">
                                                <User className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-[#111814]">{row.name}</div>
                                                <div className="text-xs text-[#618975]">رقم الهوية: 10xxxx</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex rounded-lg bg-[#f0f4f2] px-3 py-1 text-xs font-bold text-[#111814]">{row.branch}</span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-[#618975]">{row.date}</td>
                                    <td className="px-6 py-4">
                                        <div className={`flex items-center gap-1.5 text-xs font-bold ${row.status === 'review' ? 'text-amber-600' :
                                                row.status === 'rejected' ? 'text-red-500' : 'text-[#618975]'
                                            }`}>
                                            <span className={`size-2 rounded-full ${row.status === 'review' ? 'bg-amber-600 animate-pulse' :
                                                    row.status === 'rejected' ? 'bg-red-500' : 'bg-[#618975]'
                                                }`}></span>
                                            {row.status === 'review' ? 'قيد المراجعة' :
                                                row.status === 'rejected' ? 'مرفوض' : 'طلب جديد'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button className="text-gray-400 hover:text-primary transition-colors">
                                            <MoreHorizontal className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* DETAILS SIDEBAR (Right side in RTL) - Simulated Selection */}
                <div className="w-[350px] bg-white border border-[#dbe6e0] rounded-xl flex flex-col overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-[#dbe6e0] flex items-center justify-between bg-gray-50/50">
                        <h3 className="font-bold text-[#111814]">تفاصيل الطلب</h3>
                        <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-1 rounded">قيد المراجعة</span>
                    </div>

                    <div className="p-6 overflow-y-auto flex-1 space-y-6">
                        <div className="text-center">
                            <div className="size-24 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-300">
                                <User className="w-10 h-10" />
                            </div>
                            <h2 className="text-xl font-black text-[#111814]">أحمد بن محمد الهاشم</h2>
                            <p className="text-sm text-[#618975]">فرع المنطقة الوسطى</p>
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 rounded-lg border border-[#dbe6e0] bg-[#fcfdfa]">
                                <h4 className="text-xs font-bold uppercase text-[#618975] mb-3">المعلومات الشخصية</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">الجوال:</span>
                                        <span className="font-bold font-sans" dir="ltr">+966 50 123 4567</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">البريد:</span>
                                        <span className="font-bold">ahmed@example.com</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
                                <h4 className="text-xs font-bold uppercase text-primary mb-3">شجرة العائلة</h4>
                                <p className="text-sm text-[#111814] leading-relaxed">
                                    ابن <span className="font-bold">محمد بن عبدالله الهاشم</span>،
                                    حفيد <span className="font-bold">عبدالله بن عبدالعزيز</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 border-t border-[#dbe6e0] bg-gray-50/50 flex gap-3">
                        <button className="flex-1 bg-primary text-white py-2.5 rounded-lg text-sm font-bold hover:bg-primary-dark transition-colors flex items-center justify-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            <span>قبول</span>
                        </button>
                        <button className="flex-1 bg-white border border-red-200 text-red-600 py-2.5 rounded-lg text-sm font-bold hover:bg-red-50 transition-colors flex items-center justify-center gap-2">
                            <XCircle className="w-4 h-4" />
                            <span>رفض</span>
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
