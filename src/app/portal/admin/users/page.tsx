"use client";

import {
    Shield, UserPlus, Search, Bell, History, RotateCw,
    Filter, ChevronDown, CheckSquare, Edit, Trash2,
    Lock, Users, Radio
} from "lucide-react";

export default function RolesPage() {
    return (
        <div className="max-w-[1440px] mx-auto w-full font-display min-h-screen">

            {/* Page Heading */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div className="space-y-1">
                    <h2 className="text-3xl font-black tracking-tight text-[#111813]">إدارة الأدوار والصلاحيات</h2>
                    <p className="text-[#61896b] max-w-2xl">قم بتخصيص مستويات الوصول للمشرفين والمحررين عبر فروع العائلة المختلفة.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#dbe6de] rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors text-[#111813]">
                        <History className="w-4 h-4" />
                        سجل النشاطات
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary-dark transition-all shadow-sm">
                        <RotateCw className="w-4 h-4" />
                        تحديث النظام
                    </button>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 items-start">

                {/* Main Content: Roles List */}
                <div className="flex-1 w-full space-y-4 order-1 lg:order-1">
                    <div className="bg-[#f0f4f1] p-4 rounded-xl flex items-center justify-between border border-[#dbe6de]">
                        <div className="flex items-center gap-2 text-[#111813]">
                            <Filter className="w-5 h-5 text-primary" />
                            <span className="text-sm font-bold">الأدوار الحالية (6 أدوار)</span>
                        </div>
                        <div className="flex gap-2">
                            <span className="px-2 py-1 bg-white text-[10px] font-bold rounded border border-[#dbe6de] text-green-700">نشط: 4</span>
                            <span className="px-2 py-1 bg-white text-[10px] font-bold rounded border border-[#dbe6de] text-gray-500">مسودة: 2</span>
                        </div>
                    </div>

                    {/* Role Accordions */}
                    <div className="space-y-3">
                        {/* General Admin */}
                        <details className="group bg-white border border-[#dbe6de] rounded-xl overflow-hidden transition-all duration-300">
                            <summary className="flex items-center justify-between p-5 cursor-pointer list-none hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="size-10 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                                        <Shield className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-[#111813]">مدير عام (General Admin)</h3>
                                        <p className="text-xs text-[#61896b]">صلاحيات كاملة على كافة أقسام المنصة وفروع العائلة</p>
                                    </div>
                                </div>
                                <ChevronDown className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" />
                            </summary>
                            <div className="p-6 pt-0 border-t border-[#f0f4f1]">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-bold text-primary flex items-center gap-2">
                                            محتوى الأخبار
                                        </h4>
                                        <div className="space-y-3">
                                            <label className="flex items-center justify-between p-3 bg-[#f6f8f6] rounded-lg cursor-pointer hover:bg-[#eef2ef] transition-colors">
                                                <span className="text-sm font-medium text-[#111813]">عرض الأخبار والتعليقات</span>
                                                <input defaultChecked className="accent-primary w-4 h-4" type="checkbox" />
                                            </label>
                                            <label className="flex items-center justify-between p-3 bg-[#f6f8f6] rounded-lg cursor-pointer hover:bg-[#eef2ef] transition-colors">
                                                <span className="text-sm font-medium text-[#111813]">إنشاء مقالات جديدة</span>
                                                <input defaultChecked className="accent-primary w-4 h-4" type="checkbox" />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </details>

                        {/* News Editor */}
                        <details className="group bg-white border border-[#dbe6de] rounded-xl overflow-hidden transition-all duration-300" open>
                            <summary className="flex items-center justify-between p-5 cursor-pointer list-none hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="size-10 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                                        <Edit className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-[#111813]">محرر أخبار (News Editor)</h3>
                                        <p className="text-xs text-[#61896b]">إدارة الأخبار والفعاليات والوسائط المتعددة</p>
                                    </div>
                                </div>
                                <ChevronDown className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" />
                            </summary>
                            <div className="p-6 pt-0 border-t border-[#f0f4f1]">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-bold text-primary flex items-center gap-2">
                                            الوثائق والأرشيف
                                        </h4>
                                        <div className="space-y-3">
                                            <label className="flex items-center justify-between p-3 bg-[#f6f8f6] rounded-lg cursor-pointer hover:bg-[#eef2ef] transition-colors">
                                                <span className="text-sm font-medium text-[#111813]">رفع وثائق جديدة</span>
                                                <input defaultChecked className="accent-primary w-4 h-4" type="checkbox" />
                                            </label>
                                            <label className="flex items-center justify-between p-3 bg-[#f6f8f6] rounded-lg cursor-pointer hover:bg-[#eef2ef] transition-colors">
                                                <span className="text-sm font-medium text-[#111813]">أرشفة الملفات القديمة</span>
                                                <input className="accent-primary w-4 h-4" type="checkbox" />
                                            </label>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-bold text-primary flex items-center gap-2">
                                            الإعدادات
                                        </h4>
                                        <div className="space-y-3">
                                            <label className="flex items-center justify-between p-3 bg-[#f6f8f6] rounded-lg cursor-not-allowed opacity-50">
                                                <span className="text-sm font-medium text-[#111813]">تغيير هوية المنصة</span>
                                                <input className="accent-primary w-4 h-4" disabled type="checkbox" />
                                            </label>
                                            <label className="flex items-center justify-between p-3 bg-[#f6f8f6] rounded-lg cursor-pointer hover:bg-[#eef2ef] transition-colors">
                                                <span className="text-sm font-medium text-[#111813]">إدارة تعليقات المستخدمين</span>
                                                <input defaultChecked className="accent-primary w-4 h-4" type="checkbox" />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </details>
                    </div>
                </div>

                {/* Sidebar: Forms & Settings */}
                <aside className="w-full lg:w-80 space-y-6 order-2 lg:order-2 lg:sticky lg:top-6">
                    {/* Add New Role Card */}
                    <div className="bg-white border border-[#dbe6de] rounded-xl p-6 shadow-sm">
                        <h3 className="font-bold mb-4 flex items-center gap-2 text-[#111813]">
                            <UserPlus className="w-5 h-5 text-primary" />
                            إضافة دور جديد
                        </h3>
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-[#61896b]">اسم الدور</label>
                                <input className="w-full text-sm rounded-lg border-[#dbe6de] bg-[#f6f8f6] focus:border-primary focus:ring-0 p-2.5 outline-none" placeholder="مثلاً: منسق فعاليات" type="text" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-[#61896b]">الوصف القصير</label>
                                <textarea className="w-full text-sm rounded-lg border-[#dbe6de] bg-[#f6f8f6] focus:border-primary focus:ring-0 p-2.5 outline-none resize-none" placeholder="أدخل وصفاً لمهام هذا الدور..." rows={2}></textarea>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-[#61896b]">تكرار صلاحيات من</label>
                                <select className="w-full text-sm rounded-lg border-[#dbe6de] bg-[#f6f8f6] focus:border-primary focus:ring-0 p-2.5 outline-none">
                                    <option>بدون (فارغ)</option>
                                    <option>مدير عام</option>
                                    <option>محرر أخبار</option>
                                </select>
                            </div>
                            <button className="w-full py-2.5 bg-primary/10 text-primary border border-primary/20 rounded-lg text-sm font-bold hover:bg-primary hover:text-white transition-all">
                                إنشاء المسودة
                            </button>
                        </div>
                    </div>

                    {/* Global Security Settings */}
                    <div className="bg-white border border-[#dbe6de] rounded-xl p-6 shadow-sm">
                        <h3 className="font-bold mb-4 flex items-center gap-2 text-[#111813]">
                            <Lock className="w-5 h-5 text-primary" />
                            سياسة الأمان العالمية
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <p className="text-sm font-medium text-[#111813]">التحقق الثنائي (2FA)</p>
                                    <p className="text-[10px] text-[#61896b]">إلزامي لجميع المشرفين</p>
                                </div>
                                <div className="relative inline-flex h-5 w-10 items-center rounded-full bg-primary/30 cursor-pointer">
                                    <span className="translate-x-1 inline-block h-3 w-3 transform rounded-full bg-primary transition"></span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <p className="text-sm font-medium text-[#111813]">انتهاء الجلسة</p>
                                    <p className="text-[10px] text-[#61896b]">بعد 30 دقيقة خمول</p>
                                </div>
                                <div className="relative inline-flex h-5 w-10 items-center rounded-full bg-gray-200 cursor-pointer">
                                    <span className="translate-x-6 inline-block h-3 w-3 transform rounded-full bg-white transition"></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
