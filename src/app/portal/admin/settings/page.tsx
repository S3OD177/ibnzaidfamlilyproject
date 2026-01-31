"use client";

import {
    Palette, Type, Layout, Mail, Link as LinkIcon,
    Save, RotateCcw, Upload, Check, ChevronRight
} from "lucide-react";

export default function SettingsPage() {
    return (
        <div className="flex flex-col lg:flex-row min-h-[calc(100vh-65px)] font-display bg-[#f6f8f6]">

            {/* Sidebar Navigation (Right in RTL) */}
            <aside className="w-full lg:w-72 bg-white border-l border-gray-200 p-6 hidden lg:block sticky top-0 h-[calc(100vh-65px)] overflow-y-auto">
                <div className="flex flex-col gap-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">أقسام الإعدادات</p>
                    <a className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/10 text-primary font-bold" href="#identity">
                        <Layout className="w-5 h-5" />
                        <span className="text-sm">الهوية والشعار</span>
                    </a>
                    <a className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors" href="#colors">
                        <Palette className="w-5 h-5" />
                        <span className="text-sm">لوحة الألوان</span>
                    </a>
                    <a className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors" href="#typography">
                        <Type className="w-5 h-5" />
                        <span className="text-sm">الخطوط الرسمية</span>
                    </a>
                    <a className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors" href="#contact">
                        <Mail className="w-5 h-5" />
                        <span className="text-sm">معلومات التواصل</span>
                    </a>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 p-6 md:p-10 pb-32 overflow-y-auto">
                <div className="mb-10">
                    <h2 className="text-3xl font-black text-[#111813] mb-2">تخصيص العلامة التجارية العالمية</h2>
                    <p className="text-gray-500 max-w-2xl">قم بإدارة العناصر المرئية، الشعار، والخطوط التي تمثل الهوية الرسمية للعائلة.</p>
                </div>

                {/* Section 1: Identity & Logo */}
                <section className="mb-12" id="identity">
                    <div className="flex items-center gap-2 mb-6 border-b border-gray-200 pb-4">
                        <Check className="w-6 h-6 text-primary" />
                        <h3 className="text-xl font-bold text-[#111813]">1. الهوية والشعار (Identity & Logo)</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Primary Logo */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center">
                            <div className="w-32 h-32 bg-gray-50 rounded-xl mb-4 border-2 border-dashed border-gray-200 flex items-center justify-center relative group cursor-pointer hover:border-primary transition-colors">
                                <Upload className="w-8 h-8 text-gray-400 group-hover:text-primary" />
                            </div>
                            <p className="font-bold text-sm mb-1 text-center text-[#111813]">شعار العائلة (الملون)</p>
                            <p className="text-[10px] text-gray-400 text-center uppercase tracking-tighter">Primary Family Crest</p>
                        </div>
                        {/* Monochrome Logo */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center">
                            <div className="w-32 h-32 bg-gray-50 rounded-xl mb-4 border-2 border-dashed border-gray-200 flex items-center justify-center relative group cursor-pointer hover:border-primary transition-colors">
                                <Upload className="w-8 h-8 text-gray-400 group-hover:text-primary" />
                            </div>
                            <p className="font-bold text-sm mb-1 text-center text-[#111813]">النسخة الأحادية</p>
                            <p className="text-[10px] text-gray-400 text-center uppercase tracking-tighter">Monochrome Version</p>
                        </div>
                        {/* Favicon */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center">
                            <div className="w-32 h-32 bg-gray-50 rounded-xl mb-4 border-2 border-dashed border-gray-200 flex items-center justify-center relative group cursor-pointer hover:border-primary transition-colors">
                                <Upload className="w-8 h-8 text-gray-400 group-hover:text-primary" />
                            </div>
                            <p className="font-bold text-sm mb-1 text-center text-[#111813]">أيقونة المتصفح (Favicon)</p>
                            <p className="text-[10px] text-gray-400 text-center uppercase tracking-tighter">Icon 32x32px</p>
                        </div>
                    </div>
                </section>

                {/* Section 2: Color Palette */}
                <section className="mb-12" id="colors">
                    <div className="flex items-center gap-2 mb-6 border-b border-gray-200 pb-4">
                        <Palette className="w-6 h-6 text-primary" />
                        <h3 className="text-xl font-bold text-[#111813]">2. لوحة الألوان (Color Palette)</h3>
                    </div>
                    <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                            <div className="space-y-4">
                                <label className="block">
                                    <span className="text-sm font-bold text-gray-700">اللون الأساسي (Primary)</span>
                                    <div className="mt-2 flex items-center gap-3">
                                        <div className="w-12 h-12 rounded bg-primary border border-gray-200"></div>
                                        <input className="flex-1 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono p-3 outline-none" type="text" defaultValue="#D4AF37" />
                                    </div>
                                </label>
                                <p className="text-xs text-gray-400 italic">يستخدم للأزرار، الروابط، والعناوين الهامة.</p>
                            </div>
                            <div className="space-y-4">
                                <label className="block">
                                    <span className="text-sm font-bold text-gray-700">اللون الثانوي (Secondary)</span>
                                    <div className="mt-2 flex items-center gap-3">
                                        <div className="w-12 h-12 rounded bg-[#4B3F35] border border-gray-200"></div>
                                        <input className="flex-1 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono p-3 outline-none" type="text" defaultValue="#4B3F35" />
                                    </div>
                                </label>
                                <p className="text-xs text-gray-400 italic">يستخدم للزخارف، الأيقونات الثانوية، واللمسات الجمالية.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 3: Typography */}
                <section className="mb-12" id="typography">
                    <div className="flex items-center gap-2 mb-6 border-b border-gray-200 pb-4">
                        <Type className="w-6 h-6 text-primary" />
                        <h3 className="text-xl font-bold text-[#111813]">3. الخطوط الرسمية (Typography)</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-2xl border border-gray-100">
                            <label className="block mb-4">
                                <span className="text-sm font-bold text-gray-700">خط العناوين (Heading Font)</span>
                                <select className="mt-2 w-full bg-gray-50 border border-gray-200 rounded-lg text-sm p-3 outline-none">
                                    <option>Cairo (الأكثر ملاءمة للأخبار)</option>
                                    <option>Almarai</option>
                                    <option>Tajawal</option>
                                </select>
                            </label>
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <p className="text-lg font-bold font-display text-[#111813]">نموذج لعناوين الأخبار والمنصة</p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Fixed Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-[100] shadow-2xl lg:mr-72">
                <div className="max-w-[1440px] mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-400">
                        <Save className="w-4 h-4" />
                        <span className="text-xs font-bold">آخر حفظ: اليوم في الساعة 10:45 صباحاً</span>
                    </div>
                    <div className="flex gap-4">
                        <button className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold transition-all text-sm flex items-center gap-2">
                            <RotateCcw className="w-4 h-4" />
                            إعادة التعيين
                        </button>
                        <button className="px-10 py-2.5 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all text-sm flex items-center gap-2">
                            <Save className="w-4 h-4" />
                            حفظ الإعدادات
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
