import Link from "next/link";
import { History, Target, Heart, Users, ScrollText, Award, ArrowRight } from "lucide-react";

export const metadata = {
    title: "عن العائلة | منصة العائلة",
};

export default function AboutPage() {
    return (
        <div className="bg-[#f9f7f2] min-h-screen flex flex-col font-body text-[#111812]">

            <main className="flex-grow">
                {/* Hero Section */}
                <section className="bg-white border-b border-[#f0f4f2] py-16 md:py-24 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                    <div className="relative max-w-[1280px] mx-auto px-4 sm:px-10 text-center">
                        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-bold mb-6 border border-primary/20">
                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                            <span>قصتنا ورؤيتنا</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-[#111813] mb-6 font-display leading-tight">
                            جذور راسخة.. ومستقبل مشرق
                        </h1>
                        <p className="text-[#61896f] text-lg md:text-xl max-w-3xl mx-auto leading-relaxed font-naskh">
                            نحن عائلة تفخر بتاريخها العريق وموروثها الثقافي، نسعى لتعزيز أواصر القربى وبناء جيل واعٍ متمسك بقيمه، مساهم في رفعة وطنه ومجتمعه.
                        </p>
                    </div>
                </section>

                {/* Values Grid */}
                <section className="py-16 md:py-24">
                    <div className="max-w-[1280px] mx-auto px-4 sm:px-10">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Mission */}
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#e5e7eb] hover:-translate-y-1 transition-transform duration-300">
                                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6">
                                    <Target className="w-6 h-6" />
                                </div>
                                <h3 className="text-2xl font-bold text-[#111813] mb-4 font-display">رسالتنا</h3>
                                <p className="text-gray-600 leading-relaxed font-naskh">
                                    توثيق الروابط الأسرية، ودعم أفراد العائلة تعليمياً واجتماعياً، والمساهمة الفاعلة في التنمية المجتمعية من خلال مبادرات نوعية ومستدامة.
                                </p>
                            </div>

                            {/* Vision */}
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#e5e7eb] hover:-translate-y-1 transition-transform duration-300 relative group">
                                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
                                <div className="relative z-10">
                                    <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-xl flex items-center justify-center text-[#D4AF37] mb-6">
                                        <Award className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-[#111813] mb-4 font-display">رؤيتنا</h3>
                                    <p className="text-gray-600 leading-relaxed font-naskh">
                                        أن نكون نموذجاً رائداً في العمل العائلي المؤسسي، محققين للتكافل الاجتماعي والتميز المعرفي والقيمي لأبنائنا وبناتنا.
                                    </p>
                                </div>
                            </div>

                            {/* Values */}
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#e5e7eb] hover:-translate-y-1 transition-transform duration-300">
                                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-6">
                                    <Heart className="w-6 h-6" />
                                </div>
                                <h3 className="text-2xl font-bold text-[#111813] mb-4 font-display">قيمنا</h3>
                                <div className="space-y-3 font-naskh text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                                        <span>التراحم والتواصل</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                                        <span>الأصالة والمعاصرة</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                                        <span>التميز والإبداع</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* History Section */}
                <section className="bg-white py-16 border-y border-[#f0f4f2]">
                    <div className="max-w-[1280px] mx-auto px-4 sm:px-10">
                        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                            <div className="flex-1 order-2 lg:order-1">
                                <div className="relative aspect-[4/3] bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center">
                                    <div className="text-center p-8">
                                        <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                        <p className="text-gray-400 font-bold">صورة تاريخية رمزية</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 order-1 lg:order-2">
                                <div className="flex items-center gap-2 text-[#D4AF37] font-bold text-sm tracking-wider uppercase mb-4">
                                    <ScrollText className="w-5 h-5" />
                                    <span>لمحة تاريخية</span>
                                </div>
                                <h2 className="text-3xl md:text-4xl font-black text-[#111813] mb-6 font-display">
                                    أكثر من ١٠٠ عام من العطاء
                                </h2>
                                <p className="text-gray-600 text-lg leading-loose font-naskh mb-8">
                                    تعود جذور عائلتنا إلى نجد العذية، حيث نشأ الأجداد ووضعوا اللبنات الأولى لهذا الكيان المترابط. عبر العقود، ساهم أبناء العائلة في بناء الوطن في مختلف الميادين، متمسكين بهويتهم ومبادئهم.
                                    <br /><br />
                                    بدأ التنظيم المؤسسي للعائلة في عام ١٤٢٠هـ بتأسيس "صندوق العائلة" الذي كان النواة الأولى لكافة الأنشطة الاجتماعية والثقافية التي نراها اليوم.
                                </p>
                                <Link href="/portal/tree" className="inline-flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all">
                                    <span>استكشف شجرة العائلة</span>
                                    <ArrowRight className="w-5 h-5 rtl:rotate-180" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20 bg-[#102210] text-white text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent opacity-50"></div>
                    <div className="relative z-10 max-w-2xl mx-auto px-4">
                        <Users className="w-12 h-12 mx-auto text-primary mb-6" />
                        <h2 className="text-3xl md:text-4xl font-black font-display mb-6">انضم إلينا في مسيرة البناء</h2>
                        <p className="text-white/70 text-lg mb-8 font-naskh">
                            نسعد بمشاركة جميع أفراد العائلة في لجان المجلس ومبادراته المختلفة.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="/council" className="w-full sm:w-auto bg-primary hover:bg-green-600 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-primary/20 flex items-center justify-center gap-2">
                                <span>تعرف على المجلس</span>
                                <ArrowRight className="w-5 h-5 rtl:rotate-180" />
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-[#0a160a] text-white/80 py-12">
                <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <p className="text-sm font-naskh">© 2024 منصة العائلة. جميع الحقوق محفوظة.</p>
                </div>
            </footer>
        </div>
    );
}
