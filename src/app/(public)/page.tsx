import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { ArrowRight, Calendar, CalendarCheck, Users } from "lucide-react";

export default function Home() {
  return (
    <div className="bg-white min-h-screen flex flex-col font-body">
      <Header />

      <main className="flex-grow flex flex-col">
        {/* Hero Section */}
        <section className="w-full bg-white border-b border-[#f0f4f2] py-12 md:py-20">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-10">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
              <div className="flex-1 flex flex-col items-start gap-6">
                <div className="flex items-center gap-2 text-primary font-bold text-sm tracking-wider uppercase">
                  <CalendarCheck className="w-5 h-5" />
                  <span>أبرز الأحداث</span>
                </div>
                <h1 className="text-4xl lg:text-6xl font-black text-[#111813] leading-[1.15] font-display">
                  تحديد موعد الاجتماع السنوي التاسع للعائلة في الرياض
                </h1>
                <p className="text-lg text-[#61896f] leading-relaxed max-w-2xl">
                  يسر مجلس العائلة دعوة جميع الأفراد لحضور الاجتماع السنوي الذي سيقام في قاعة الاحتفالات الكبرى. يهدف اللقاء لتعزيز الروابط وتكريم المتميزين من أبناء وبنات العائلة.
                </p>
                <div className="flex items-center gap-4 text-sm text-[#61896f] mt-1">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-[18px] h-[18px]" />
                    <time>01 أكتوبر 2023</time>
                  </div>
                </div>
                <a
                  className="group inline-flex items-center gap-2 text-white bg-primary hover:bg-green-600 px-6 py-3 rounded-lg font-bold transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40 mt-4"
                  href="/news/1"
                >
                  <span>اقرأ التفاصيل</span>
                  {/* ArrowRight logic reversed for RTL */}
                  <ArrowRight className="w-5 h-5 rtl:rotate-180 group-hover:-translate-x-1 transition-transform" />
                </a>
              </div>
              <div className="flex-1 w-full max-w-[600px]">
                <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border-4 border-white rotate-1 hover:rotate-0 transition-transform duration-500 bg-gray-100">
                  <div className="absolute inset-0 bg-slate-200" /> {/* Placeholder */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Latest News Section */}
        <section className="w-full bg-white py-16">
          <div className="max-w-[960px] mx-auto px-4 sm:px-10 flex flex-col gap-10">
            <div className="flex items-center justify-between border-b border-[#f0f4f2] pb-4">
              <h2 className="text-3xl font-black text-[#111813] font-display">آخر الأخبار</h2>
              <Link href="/news" className="flex items-center gap-1 text-primary font-bold text-sm hover:underline">
                عرض الأرشيف
                <ArrowRight className="w-5 h-5 rtl:rotate-180" />
              </Link>
            </div>

            <div className="flex flex-col gap-6">
              {/* News Item 1 */}
              <ArticleCard
                title="تكريم الدكتور أحمد لحصوله على جائزة الملك فيصل العالمية"
                category="قصص نجاح"
                date="15 نوفمبر 2023"
                excerpt="في حفل بهيج حضره كبار الشخصيات، تم تكريم ابن العائلة الدكتور أحمد نظير إسهاماته العلمية المتميزة في مجال الطب والجراحة، والتي رفعت اسم العائلة عالياً..."
              />

              {/* News Item 2 */}
              <ArticleCard
                title="افتتاح معرض الفنون التشكيلية لمواهب العائلة الشابة"
                category="فعاليات"
                categoryColor="bg-orange-500/90"
                date="20 سبتمبر 2023"
                excerpt="في مبادرة لدعم المواهب، تم افتتاح المعرض الفني الذي يضم أكثر من ٥٠ عملاً فنياً من إبداع أبناء وبنات العائلة، ويستمر المعرض لمدة ثلاثة أيام..."
              />

              {/* News Item 3 */}
              <ArticleCard
                title="نعي فاضل: المغفور له بإذن الله الشيخ عبدالله"
                category="وفيات"
                categoryColor="bg-gray-600/90"
                date="10 أغسطس 2023"
                excerpt="بقلوب مؤمنة بقضاء الله وقدره، تنعي العائلة فقيدها الشيخ عبدالله الذي وافته المنية صباح اليوم. وسيوارى جثمانه الثرى بعد صلاة العصر..."
              />
            </div>
          </div>
        </section>
      </main>

      {/* Reusable Footer inline for now or import */}
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
    </div>
  );
}

function ArticleCard({ title, category, date, excerpt, categoryColor = "bg-primary/90" }: any) {
  return (
    <Link href="/news/1" className="flex flex-col md:flex-row gap-6 bg-white rounded-xl overflow-hidden border border-[#e5e7eb] hover:shadow-lg hover:shadow-gray-100/50 transition-all duration-300 group cursor-pointer">
      <div className="w-full md:w-64 h-56 md:h-auto shrink-0 relative overflow-hidden bg-slate-100">
        <div className="absolute top-3 right-3 z-10">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold text-white backdrop-blur-sm ${categoryColor}`}>
            {category}
          </span>
        </div>
        {/* Placeholder for Image */}
        <div className="w-full h-full flex items-center justify-center text-slate-300">
          <Calendar className="w-12 h-12 opacity-20" />
        </div>
      </div>
      <div className="flex flex-col justify-center p-6 md:pr-0 flex-1">
        <div className="flex items-center gap-2 text-[#61896f] text-sm mb-2">
          <Calendar className="w-[18px] h-[18px]" />
          <time>{date}</time>
        </div>
        <h3 className="text-2xl font-bold text-[#111813] mb-3 group-hover:text-primary transition-colors font-display">
          {title}
        </h3>
        <p className="text-[#61896f] leading-relaxed mb-4 line-clamp-2">
          {excerpt}
        </p>
        <div className="mt-auto">
          <span className="inline-flex items-center gap-1 text-primary font-bold text-sm hover:underline">
            اقرأ المزيد
            <ArrowRight className="w-[18px] h-[18px] rtl:rotate-180" />
          </span>
        </div>
      </div>
    </Link>
  )
}
