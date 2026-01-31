"use client";

import {
    Users,
    FileText,
    Clock,
    PlusSquare,
    Gavel,
    UploadCloud,
    UserPlus,
    CheckCircle,
    Image as ImageIcon
} from "lucide-react";

export default function AdminDashboard() {
    return (
        <div className="max-w-7xl mx-auto space-y-8 font-display">
            {/* Page Heading */}
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-[#111814] tracking-tight">لوحة التحكم العامة</h2>
                    <p className="text-[#618975] mt-1">مرحباً بك مجدداً. إليك نظرة سريعة على نشاط العائلة اليوم.</p>
                </div>
                <div className="text-sm text-[#618975] font-medium bg-white px-4 py-2 rounded-lg border border-[#dbe6e0]">
                    {new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-[#dbe6e0] shadow-sm flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-primary/10 rounded-lg text-primary">
                            <Users className="w-6 h-6" />
                        </div>
                        <span className="text-primary text-xs font-bold bg-primary/5 px-2 py-1 rounded">+١٢٪</span>
                    </div>
                    <p className="text-[#618975] text-sm font-medium">إجمالي أفراد العائلة</p>
                    <p className="text-3xl font-bold text-[#111814] mt-1">١,٢٤٠</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-[#dbe6e0] shadow-sm flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                            <FileText className="w-6 h-6" />
                        </div>
                        <span className="text-blue-600 text-xs font-bold bg-blue-50 px-2 py-1 rounded">+٢٪</span>
                    </div>
                    <p className="text-[#618975] text-sm font-medium">الأخبار المنشورة</p>
                    <p className="text-3xl font-bold text-[#111814] mt-1">٨٦</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-[#dbe6e0] shadow-sm flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-amber-100 rounded-lg text-amber-600">
                            <Clock className="w-6 h-6" />
                        </div>
                        <span className="text-red-500 text-xs font-bold bg-red-50 px-2 py-1 rounded">-٥٪</span>
                    </div>
                    <p className="text-[#618975] text-sm font-medium">وثائق قيد الانتظار</p>
                    <p className="text-3xl font-bold text-[#111814] mt-1">٧</p>
                </div>
            </div>

            {/* Quick Actions Section */}
            <div>
                <h3 className="text-xl font-bold text-[#111814] mb-4">إجراءات سريعة</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <button className="flex items-center gap-3 p-4 bg-primary text-white rounded-xl shadow-md hover:bg-primary/90 transition-all group active:scale-95">
                        <PlusSquare className="w-6 h-6 group-hover:scale-110 transition-transform" />
                        <span className="font-bold">نشر خبر جديد</span>
                    </button>
                    <button className="flex items-center gap-3 p-4 bg-white text-[#111814] border border-[#dbe6e0] rounded-xl hover:bg-gray-50 transition-all active:scale-95">
                        <Gavel className="w-6 h-6 text-primary" />
                        <span className="font-bold">إضافة قرار مجلس</span>
                    </button>
                    <button className="flex items-center gap-3 p-4 bg-white text-[#111814] border border-[#dbe6e0] rounded-xl hover:bg-gray-50 transition-all active:scale-95">
                        <UploadCloud className="w-6 h-6 text-primary" />
                        <span className="font-bold">رفع ميثاق العائلة</span>
                    </button>
                    <button className="flex items-center gap-3 p-4 bg-white text-[#111814] border border-[#dbe6e0] rounded-xl hover:bg-gray-50 transition-all active:scale-95">
                        <UserPlus className="w-6 h-6 text-primary" />
                        <span className="font-bold">دعوة عضو جديد</span>
                    </button>
                </div>
            </div>

            {/* Two Columns Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity (2/3 width) */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-[#111814]">النشاط الأخير</h3>
                        <button className="text-sm text-primary font-bold hover:underline">عرض السجل الكامل</button>
                    </div>
                    <div className="bg-white border border-[#dbe6e0] rounded-xl overflow-hidden shadow-sm">
                        <div className="divide-y divide-[#f0f4f2]">
                            {[
                                { user: "المدير خالد", action: 'قام بتحديث بيانات فرع "آل فلان" في شجرة العائلة.', time: "منذ ١٠ دقائق", icon: Users, color: "gray" },
                                { user: "النظام", action: 'نُشر قرار المجلس رقم ٤٢ المتعلق بصندوق التكافل العائلي.', time: "منذ ساعتين", icon: CheckCircle, color: "primary" },
                                { user: "سارة عبدالله", action: 'تم تفعيل حساب العضوية.', time: "منذ ٤ ساعات", icon: UserPlus, color: "gray" },
                                { user: "أحمد", action: 'أضاف ٥ صور جديدة لألبوم "اجتماع العيد ٢٠٢٣".', time: "يوم أمس", icon: ImageIcon, color: "blue" },
                            ].map((activity, i) => (
                                <div key={i} className="p-4 flex gap-4 items-center hover:bg-gray-50 transition-colors">
                                    <div className={`size-10 rounded-full flex items-center justify-center ${activity.color === "primary" ? "bg-primary/10 text-primary" :
                                            activity.color === "blue" ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500"
                                        }`}>
                                        <activity.icon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-[#111814]">
                                            <span className="font-bold">{activity.user}</span> {activity.action.replace(activity.user, "")}
                                        </p>
                                        <p className="text-[10px] text-[#618975] mt-0.5">{activity.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Pending Approvals (1/3 width) */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-[#111814]">طلبات انضمام</h3>
                        <span className="bg-primary/20 text-primary text-xs font-bold px-2 py-0.5 rounded-full">١٢ طلب</span>
                    </div>
                    <div className="bg-white border border-[#dbe6e0] rounded-xl p-4 space-y-4 shadow-sm">
                        {[
                            { name: "محمد بن خالد الفلاني", branch: "فرع الرياض • الفرع الخامس", time: "منذ يومين" },
                            { name: "نورة بنت سالم السالم", branch: "فرع الدمام • فرع الأحفاد", time: "منذ ٣ أيام" },
                        ].map((req, i) => (
                            <div key={i} className="p-3 bg-[#f6f8f7] rounded-lg border border-[#f0f4f2] space-y-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-bold text-sm text-[#111814] leading-tight">{req.name}</p>
                                        <p className="text-[10px] text-[#618975]">{req.branch}</p>
                                    </div>
                                    <span className="text-[9px] text-[#618975] font-medium italic">{req.time}</span>
                                </div>
                                <div className="flex gap-2">
                                    <button className="flex-1 bg-primary text-white text-[10px] font-bold py-1.5 rounded-md hover:bg-primary/90 transition-colors">اعتماد</button>
                                    <button className="flex-1 bg-white border border-gray-200 text-gray-500 text-[10px] font-bold py-1.5 rounded-md hover:bg-gray-50 transition-colors">رفض</button>
                                </div>
                            </div>
                        ))}
                        <button className="w-full text-center text-xs font-bold text-[#618975] py-2 hover:text-primary transition-colors">عرض كافة الطلبات (١٢)</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
