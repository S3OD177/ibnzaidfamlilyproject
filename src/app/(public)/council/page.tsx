import Link from "next/link";
import { Mail, MapPin, Download, Eye, Users, FileText, User } from "lucide-react";

export default function CouncilPage() {
    return (
        <div className="bg-[#fcfdfa] min-h-screen flex flex-col font-body text-[#111812]" style={{
            backgroundImage: "radial-gradient(#e5e7eb 0.5px, transparent 0.5px)",
            backgroundSize: "20px 20px"
        }}>

            <main className="flex-grow">
                <div className="max-w-[1200px] mx-auto px-4 py-12">

                    {/* Main Hero Title */}
                    <div className="text-center mb-16">
                        <h1 className="text-primary font-bold text-5xl font-naskh mb-4">
                            هيكلية مجلس العائلة
                        </h1>
                        <div className="h-1 w-24 bg-[#D4AF37] mx-auto rounded-full"></div>
                        <p className="text-gray-600 mt-6 max-w-2xl mx-auto text-lg leading-relaxed">
                            قيادة تسعى لتمتين الروابط الأسرية وتعزيز قيم التلاحم والعطاء في ظل رؤية العائلة المستقبلية.
                        </p>
                    </div>

                    {/* President Section */}
                    <section className="mb-20">
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-gold/20 to-primary/20 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                            <div className="relative bg-white rounded-xl shadow-xl overflow-hidden border border-[#D4AF37]/30">
                                {/* Link wrapper for the whole card */}
                                <Link href="/members/1" className="flex flex-col md:flex-row items-stretch w-full hover:bg-gray-50 transition-colors">
                                    {/* Portrait Placeholder - Generic Male */}
                                    <div className="w-full md:w-2/5 aspect-[4/5] bg-gray-50 flex items-center justify-center border-l md:border-l-0 md:border-b border-[#e5e7eb]">
                                        <User className="w-32 h-32 text-gray-300" />
                                    </div>

                                    {/* Content */}
                                    <div className="w-full md:w-3/5 p-8 md:p-12 flex flex-col justify-center">
                                        <span className="inline-block self-start bg-primary/10 text-primary-dark px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-primary/20">
                                            رئيس المجلس
                                        </span>
                                        <h2 className="text-3xl font-bold text-gray-900 mb-2 font-naskh leading-snug">
                                            الشيخ عبد العزيز بن فهد آل سعود
                                        </h2>
                                        <p className="text-[#D4AF37] font-medium mb-6">فترة الولاية: ٢٠٢٢ - الحالي</p>
                                        <div className="relative italic text-gray-700 mb-8 leading-relaxed text-lg font-naskh border-r-4 border-[#D4AF37] pr-6">
                                            "نعتز بجمعتنا ونسعى لرفعة العائلة وتلاحمها في ظل قيمنا الأصيلة، إن هذا المجلس هو المظلة التي تجمع شتات الأفكار لتصيغ منها مستقبلاً مشرقاً لأجيالنا القادمة."
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <button className="flex items-center gap-2 bg-[#111812] text-white px-6 py-3 rounded-lg font-bold transition-all hover:scale-105 active:scale-95">
                                                <Mail className="w-5 h-5" />
                                                <span>رسالة رئيس المجلس</span>
                                            </button>
                                            <button className="flex items-center gap-2 border border-gray-300 px-6 py-3 rounded-lg font-bold hover:bg-gray-50 transition-all text-gray-700">
                                                <span>السيرة الذاتية</span>
                                            </button>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </section>

                    {/* Council Members Grid */}
                    <section className="mb-20">
                        <div className="flex items-center justify-between mb-8 border-b-2 border-gray-100 pb-4">
                            <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3 font-naskh">
                                <Users className="text-primary w-6 h-6" />
                                أعضاء المكتب التنفيذي وممثلو الفروع
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {/* Member 1: Vice President */}
                            <Link href="/members/2" className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group">
                                <div className="w-full aspect-[3/4] bg-gray-50 flex items-center justify-center border-b border-[#e5e7eb] group-hover:bg-gray-100 transition-colors">
                                    <User className="w-24 h-24 text-gray-300" />
                                </div>
                                <div className="p-5">
                                    <span className="text-primary text-xs font-bold uppercase tracking-widest">نائب رئيس المجلس</span>
                                    <h4 className="text-lg font-bold mt-1 text-gray-900">سعادة الأستاذ منصور آل سعود</h4>
                                    <div className="flex items-center gap-2 mt-3 text-gray-500 text-sm">
                                        <MapPin className="w-4 h-4" />
                                        <span>المنطقة الوسطى (الرياض)</span>
                                    </div>
                                </div>
                            </Link>

                            {/* Member 2: Treasurer */}
                            <Link href="/members/3" className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group">
                                <div className="w-full aspect-[3/4] bg-gray-50 flex items-center justify-center border-b border-[#e5e7eb] group-hover:bg-gray-100 transition-colors">
                                    <User className="w-24 h-24 text-gray-300" />
                                </div>
                                <div className="p-5">
                                    <span className="text-primary text-xs font-bold uppercase tracking-widest">أمين الصندوق</span>
                                    <h4 className="text-lg font-bold mt-1 text-gray-900">المهندس خالد الغامدي</h4>
                                    <div className="flex items-center gap-2 mt-3 text-gray-500 text-sm">
                                        <MapPin className="w-4 h-4" />
                                        <span>المنطقة الغربية (جدة)</span>
                                    </div>
                                </div>
                            </Link>

                            {/* Member 3: Secretary */}
                            <Link href="/members/4" className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group">
                                <div className="w-full aspect-[3/4] bg-gray-50 flex items-center justify-center border-b border-[#e5e7eb] group-hover:bg-gray-100 transition-colors">
                                    <User className="w-24 h-24 text-gray-300" />
                                </div>
                                <div className="p-5">
                                    <span className="text-primary text-xs font-bold uppercase tracking-widest">أمين السر العام</span>
                                    <h4 className="text-lg font-bold mt-1 text-gray-900">الدكتور محمد التميمي</h4>
                                    <div className="flex items-center gap-2 mt-3 text-gray-500 text-sm">
                                        <MapPin className="w-4 h-4" />
                                        <span>المنطقة الشرقية (الدمام)</span>
                                    </div>
                                </div>
                            </Link>

                            {/* Member 4: Rep */}
                            <Link href="/members/5" className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group">
                                <div className="w-full aspect-[3/4] bg-gray-50 flex items-center justify-center border-b border-[#e5e7eb] group-hover:bg-gray-100 transition-colors">
                                    <User className="w-24 h-24 text-gray-300" />
                                </div>
                                <div className="p-5">
                                    <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">ممثل فرع الشمال</span>
                                    <h4 className="text-lg font-bold mt-1 text-gray-900">الأستاذ فهد الشمري</h4>
                                    <div className="flex items-center gap-2 mt-3 text-gray-500 text-sm">
                                        <MapPin className="w-4 h-4" />
                                        <span>منطقة حائل</span>
                                    </div>
                                </div>
                            </Link>

                            {/* Member 5: Rep */}
                            <Link href="/members/6" className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group">
                                <div className="w-full aspect-[3/4] bg-gray-50 flex items-center justify-center border-b border-[#e5e7eb] group-hover:bg-gray-100 transition-colors">
                                    <User className="w-24 h-24 text-gray-300" />
                                </div>
                                <div className="p-5">
                                    <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">ممثل فرع الجنوب</span>
                                    <h4 className="text-lg font-bold mt-1 text-gray-900">الشيخ سلطان القحطاني</h4>
                                    <div className="flex items-center gap-2 mt-3 text-gray-500 text-sm">
                                        <MapPin className="w-4 h-4" />
                                        <span>منطقة عسير (أبها)</span>
                                    </div>
                                </div>
                            </Link>

                            {/* Member 6: Rep */}
                            <Link href="/members/7" className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group">
                                <div className="w-full aspect-[3/4] bg-gray-50 flex items-center justify-center border-b border-[#e5e7eb] group-hover:bg-gray-100 transition-colors">
                                    <User className="w-24 h-24 text-gray-300" />
                                </div>
                                <div className="p-5">
                                    <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">ممثل فرع القصيم</span>
                                    <h4 className="text-lg font-bold mt-1 text-gray-900">الأستاذ إبراهيم الهاشمي</h4>
                                    <div className="flex items-center gap-2 mt-3 text-gray-500 text-sm">
                                        <MapPin className="w-4 h-4" />
                                        <span>منطقة القصيم (بريدة)</span>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    </section>

                    {/* Council Charter Section */}
                    <section className="bg-[#111812] text-white rounded-xl p-10 overflow-hidden relative shadow-2xl">
                        <div className="absolute top-0 left-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="text-center md:text-right flex-1">
                                <h3 className="text-2xl font-bold mb-4 font-naskh">ميثاق مجلس العائلة</h3>
                                <p className="text-gray-400 max-w-xl leading-relaxed">
                                    يتضمن الميثاق الرسمي اللوائح والأنظمة التي تحكم عمل المجلس، وحقوق وواجبات كل فرد من أفراد العائلة، بالإضافة إلى آليات اتخاذ القرار والتمثيل الرسمي.
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button className="bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-lg font-bold flex items-center gap-3 shadow-lg transition-transform active:scale-95">
                                    <FileText className="w-5 h-5 rtl:scale-x-[-1]" />
                                    <span>تحميل ميثاق العائلة (PDF)</span>
                                </button>
                                <button className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-lg font-bold flex items-center gap-3 backdrop-blur-sm border border-white/20 transition-all">
                                    <Eye className="w-6 h-6" />
                                    <span>قراءة عبر الإنترنت</span>
                                </button>
                            </div>
                        </div>
                    </section>

                </div>
            </main >

            <footer className="bg-[#102210] text-white/80 py-12 mt-auto">
                <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-b border-white/10 pb-8 mb-8">
                        <div className="flex items-center gap-3">
                            <div className="size-8 rounded bg-primary/20 flex items-center justify-center text-primary">
                                <Users className="w-5 h-5" />
                            </div>
                            <span className="font-display text-lg font-bold text-white">منصة العائلة</span>
                        </div>
                        <div className="flex gap-6 text-sm font-medium">
                            <a className="hover:text-white transition-colors" href="#">سياسة الخصوصية</a>
                            <a className="hover:text-white transition-colors" href="#">شروط الاستخدام</a>
                            <a className="hover:text-white transition-colors" href="#">اتصل بنا</a>
                        </div>
                    </div>
                    <div className="text-center md:text-right">
                        <p className="text-xs leading-relaxed text-white/60 mb-2 font-naskh">
                            جميع الحقوق محفوظة لمنصة العائلة © 2024. المحتوى المنشور في هذه المنصة خاص بأفراد العائلة ومحمي بموجب حقوق النشر.
                        </p>
                        <p className="text-xs text-white/40 font-naskh">
                            تم التطوير بواسطة الفريق التقني للأسرة - الإصدار 2.0
                        </p>
                    </div>
                </div>
            </footer>
        </div >
    );
}
