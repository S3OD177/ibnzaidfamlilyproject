import Link from "next/link";
import { Calendar, User, ChevronLeft, Info } from "lucide-react";

export const metadata = {
    title: "تفاصيل الخبر | منصة العائلة",
};

export default function NewsDetailsPage({ params }: { params: { slug: string } }) {
    // Mock data - normally fetched via slug
    const article = {
        title: "انطلاق فعاليات الملتقى السنوي الخامس عشر لأبناء الأسرة في مدينة الرياض",
        date: "15 رجب 1445 هـ",
        author: "اللجنة الإعلامية",
        category: "اجتماعات رسمية",
        content: `
      <p class="mb-6 font-bold text-xl text-primary">الرياض -</p>
      <p class="mb-6 text-lg leading-loose text-gray-800">في أجواء مفعمة بالأخوة والمودة، وبحضور تجاوز ٥٠٠ شخص من أبناء العمومة من مختلف مناطق المملكة والخليج، انطلقت مساء يوم الجمعة فعاليات الملتقى السنوي الخامس عشر للأسرة الكريمة في قاعة الاحتفالات الكبرى بمدينة الرياض. ويأتي هذا اللقاء تجسيداً لقيم صلة الرحم والتواصل التي حث عليها ديننا الحنيف، ولتعزيز الروابط الاجتماعية بين أفراد الأسرة الواحدة.</p>
      
      <p class="mb-6 text-lg leading-loose text-gray-800">بدأ الحفل بآيات عطرة من الذكر الحكيم، تلاها كلمة ترحيبية من رئيس مجلس إدارة الصندوق العائلي، الشيخ محمد بن عبدالله، الذي رحب بالحضور وثمّن تجشمهم عناء السفر لحضور هذا المحفل الهام. وأكد في كلمته على أهمية هذه اللقاءات في تقوية اللحمة الوطنية والاجتماعية، ونقل الموروث القيمي للأجيال الصاعدة.</p>
      
      <div class="my-10 bg-primary/5 border-r-4 border-primary p-6 rounded-l-lg relative">
        <p class="font-display text-xl font-bold text-[#102210] mb-2 leading-normal">
            "إن قوتنا تكمن في وحدتنا، وفي تمسكنا بقيم آبائنا وأجدادنا. هذا الصندوق ليس مجرد مؤسسة مالية، بل هو وعاء يجمع قلوبنا قبل أموالنا لخدمة المحتاج ودعم الطالب وتكريم المتميز."
        </p>
        <footer class="mt-4 text-sm font-bold text-primary">- من كلمة رئيس مجلس الإدارة</footer>
      </div>

      <p class="mb-6 text-lg leading-loose text-gray-800">واستعرض الحفل تقريراً مرئياً عن إنجازات اللجان العاملة خلال العام المنصرم، شمل المبادرات الاجتماعية، وتكريم المتفوقين علمياً من أبناء وبنات الأسرة، بالإضافة إلى استعراض المشاريع الوقفية الجديدة التي يتبناها الصندوق. كما تم الإعلان عن تدشين "جائزة التميز والإبداع" والتي تهدف لتحفيز شباب الأسرة للمساهمة في نهضة الوطن.</p>
    `,
    };

    return (
        <>
            <main className="flex-grow w-full max-w-[1280px] mx-auto px-4 sm:px-10 py-10 font-naskh">
                <div className="flex flex-col lg:flex-row gap-12">

                    {/* Right Column: Article Content (Main) */}
                    <article className="w-full lg:w-2/3 flex flex-col">

                        {/* Breadcrumbs */}
                        <div className="flex flex-wrap items-center gap-2 mb-6 text-sm text-[#61896f] font-body">
                            <Link className="hover:text-primary transition-colors" href="/">الرئيسية</Link>
                            <ChevronLeft className="w-4 h-4 text-gray-400" />
                            <Link className="hover:text-primary transition-colors" href="/news">أخبار العائلة</Link>
                            <ChevronLeft className="w-4 h-4 text-gray-400" />
                            <span className="text-[#111813] font-semibold truncate max-w-[200px]">{article.title}</span>
                        </div>

                        {/* Headline */}
                        <h1 className="font-display text-3xl md:text-4xl lg:text-[42px] font-bold text-[#111813] leading-tight mb-4">
                            {article.title}
                        </h1>

                        {/* Meta Data */}
                        <div className="flex flex-wrap items-center gap-4 md:gap-6 pb-6 border-b border-[#f0f4f2] mb-8 font-body">
                            <div className="flex items-center gap-2 text-[#61896f]">
                                <Calendar className="w-5 h-5 text-primary" />
                                <span className="text-sm font-medium pt-1">{article.date}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[#61896f]">
                                <User className="w-5 h-5 text-primary" />
                                <span className="text-sm font-medium pt-1">{article.author}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[#61896f] mr-auto lg:mr-0">
                                <span className="px-3 py-1 bg-[#f0f4f0] text-primary rounded-full text-xs font-bold">
                                    {article.category}
                                </span>
                            </div>
                        </div>

                        {/* Featured Image */}
                        <div className="bg-white p-2 border border-[#f0f4f2] rounded-lg shadow-sm mb-8">
                            <div className="relative w-full h-[300px] md:h-[450px] overflow-hidden rounded bg-gray-100 flex items-center justify-center">
                                <span className="text-gray-400">صورة الخبر الرئيسية</span>
                            </div>
                            <div className="pt-3 pb-1 px-2">
                                <p className="text-[#61896f] text-sm leading-relaxed border-r-2 border-primary pr-3 font-naskh">
                                    جانب من حضور كبار أعيان الأسرة في القاعة الرئيسية خلال الحفل الخطابي لافتتاح الملتقى.
                                </p>
                            </div>
                        </div>

                        {/* Article Body */}
                        <div
                            className="prose prose-lg max-w-none font-naskh text-[#111813]"
                            dangerouslySetInnerHTML={{ __html: article.content }}
                        />

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-[#f0f4f2] font-body">
                            <span className="px-3 py-1 bg-[#f0f4f0] text-[#61896f] rounded-full text-sm font-medium hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer">#ملتقى_الرياض</span>
                            <span className="px-3 py-1 bg-[#f0f4f0] text-[#61896f] rounded-full text-sm font-medium hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer">#صلة_الرحم</span>
                            <span className="px-3 py-1 bg-[#f0f4f0] text-[#61896f] rounded-full text-sm font-medium hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer">#أخبار_العائلة_2024</span>
                        </div>

                    </article>


                    {/* Left Column: Sidebar */}
                    <aside className="w-full lg:w-1/3 flex flex-col gap-8">

                        {/* Latest News Widget */}
                        <div className="bg-white rounded-xl shadow-sm border border-[#f0f4f2] overflow-hidden p-6 font-body">
                            <div className="flex items-center justify-between mb-6 border-b border-[#f0f4f0] pb-4">
                                <h3 className="font-display text-xl font-bold text-primary">آخر الأخبار</h3>
                                <Link className="text-xs font-bold text-primary hover:underline" href="/news">عرض الكل</Link>
                            </div>
                            <div className="flex flex-col gap-6">
                                {/* Item 1 */}
                                <Link className="group flex gap-4 items-start" href="#">
                                    <div className="size-20 shrink-0 rounded-lg bg-gray-100 overflow-hidden relative"></div>
                                    <div className="flex flex-col pt-0.5">
                                        <span className="text-xs text-primary font-medium mb-1">إنجازات علمية</span>
                                        <h4 className="font-display font-bold text-[#111813] text-sm leading-tight group-hover:text-primary transition-colors">
                                            حصول الدكتور خالد بن سعيد على درجة الدكتوراه
                                        </h4>
                                        <span className="text-xs text-[#61896f] mt-2">منذ يومين</span>
                                    </div>
                                </Link>
                                {/* Item 2 */}
                                <Link className="group flex gap-4 items-start" href="#">
                                    <div className="size-20 shrink-0 rounded-lg bg-gray-100 overflow-hidden relative"></div>
                                    <div className="flex flex-col pt-0.5">
                                        <span className="text-xs text-primary font-medium mb-1">أفراحنا</span>
                                        <h4 className="font-display font-bold text-[#111813] text-sm leading-tight group-hover:text-primary transition-colors">
                                            دعوة لحضور حفل زفاف الشاب عبدالعزيز بن فهد
                                        </h4>
                                        <span className="text-xs text-[#61896f] mt-2">منذ أسبوع</span>
                                    </div>
                                </Link>
                            </div>
                        </div>

                        {/* Info Card Widget */}
                        <div className="bg-primary/5 rounded-xl border border-primary/20 p-6 font-body">
                            <div className="flex items-center gap-3 mb-4">
                                <Info className="w-6 h-6 text-primary" />
                                <h3 className="font-display text-lg font-bold text-primary">تنويه هام</h3>
                            </div>
                            <p className="text-sm text-gray-700 leading-relaxed mb-4 font-naskh">
                                نذكر جميع أفراد العائلة بضرورة تحديث بيانات شجرة العائلة عبر البوابة الإلكترونية قبل نهاية الشهر الحالي لضمان دقة السجلات في الإصدار المطبوع القادم.
                            </p>
                            <button className="w-full py-2 bg-white border border-primary/30 text-primary hover:bg-primary hover:text-white rounded-lg text-sm font-bold transition-all">
                                تحديث بياناتي
                            </button>
                        </div>

                    </aside>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-[#102210] text-white/80 py-12 mt-auto font-body">
                <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-b border-white/10 pb-8 mb-8">
                        <div className="flex items-center gap-3">
                            <div className="size-8 rounded bg-primary/20 flex items-center justify-center text-primary">
                                <User className="w-5 h-5" />
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
        </>
    );
}
