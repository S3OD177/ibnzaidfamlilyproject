import Link from "next/link";
import { ArrowRight, Calendar, CalendarCheck, Users } from "lucide-react";
import { SocialHub } from "@/components/home/SocialHub";

export default function Home() {
  return (
    <>
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
                <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border-4 border-white rotate-1 hover:rotate-0 transition-transform duration-500 bg-gray-100 flex items-center justify-center">
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary to-transparent" />
                  <div className="relative z-10 p-8 text-center">
                    <CalendarCheck className="w-24 h-24 text-primary/20 mx-auto mb-4" />
                    <p className="text-primary/40 font-bold text-lg">صورة الحدث</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>





        {/* Latest News Section */}
        <section className="w-full bg-white py-16 border-b border-[#f0f4f2]">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-10 flex flex-col gap-10">
            <div className="flex items-center justify-between border-b border-[#f0f4f2] pb-6">
              <div className="flex items-center gap-2 text-primary font-bold text-sm tracking-wider uppercase">
                <CalendarCheck className="w-5 h-5" />
                <span>المركز الإعلامي</span>
              </div>
              <Link href="/news" className="flex items-center gap-1 text-primary font-bold text-sm hover:underline">
                عرض جميع الأخبار
                <ArrowRight className="w-5 h-5 rtl:rotate-180" />
              </Link>
            </div>
            <div className="mb-2">
              <h2 className="text-3xl lg:text-4xl font-black text-[#111813] font-display">
                آخر أخبار ومستجدات العائلة
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* News Item 1 */}
              <ArticleCard
                title="تكريم الدكتور أحمد لحصوله على جائزة الملك فيصل العالمية"
                category="قصص نجاح"
                date="15 نوفمبر 2023"
                imageColor="bg-blue-50"
                excerpt="في حفل بهيج حضره كبار الشخصيات، تم تكريم ابن العائلة الدكتور أحمد نظير إسهاماته العلمية المتميزة..."
              />

              {/* News Item 2 */}
              <ArticleCard
                title="افتتاح معرض الفنون التشكيلية لمواهب العائلة الشابة"
                category="فعاليات"
                categoryColor="bg-orange-500"
                date="20 سبتمبر 2023"
                imageColor="bg-orange-50"
                excerpt="في مبادرة لدعم المواهب، تم افتتاح المعرض الفني الذي يضم أكثر من ٥٠ عملاً فنياً من إبداع أبناء وبنات العائلة..."
              />

              {/* News Item 3 */}
              <ArticleCard
                title="نعي فاضل: المغفور له بإذن الله الشيخ عبدالله"
                category="وفيات"
                categoryColor="bg-gray-600"
                date="10 أغسطس 2023"
                imageColor="bg-gray-50"
                excerpt="بقلوب مؤمنة بقضاء الله وقدره، تنعي العائلة فقيدها الشيخ عبدالله الذي وافته المنية صباح اليوم..."
              />
            </div>
          </div>
        </section>

        {/* Social Hub Section */}
        <SocialHub />

        {/* Digital Services Section */}
        <section className="w-full bg-[#f8faf9] py-16">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-10">
            <div className="flex flex-col md:flex-row items-end justify-between mb-10 gap-4">
              <div>
                <div className="flex items-center gap-2 text-primary font-bold text-sm tracking-wider uppercase mb-2">
                  <CalendarCheck className="w-5 h-5" />
                  <span>الخدمات الإلكترونية</span>
                </div>
                <h2 className="text-3xl lg:text-4xl font-black text-[#111813] font-display">
                  خدمات العائلة الرقمية
                </h2>
              </div>
              <p className="text-[#61896f] max-w-md text-lg">
                مجموعة من الخدمات الإلكترونية المصممة لخدمة أفراد العائلة وتسهيل التواصل وتحديث المعلومات.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: "تحديث البيانات", icon: Users, href: "/portal/login", desc: "تحديث بياناتك وبيانات أسرتك في الشجرة" },
                { title: "المناسبات", icon: CalendarCheck, href: "/events", desc: "جدول مناسبات واجتماعات العائلة القادمة" },
                { title: "مكتبة الصور", icon: ArrowRight, href: "/gallery", desc: "أرشيف صور ووثائق العائلة التاريخية" },
              ].map((service, idx) => (
                <Link key={idx} href={service.href} className="group bg-white hover:bg-white p-8 rounded-2xl border border-gray-100 hover:border-gray-200 transition-all duration-300 hover:shadow-xl hover:shadow-gray-100/50 flex flex-col items-start">
                  <div className="p-4 bg-primary/5 rounded-xl shadow-sm mb-6 group-hover:scale-110 transition-transform duration-300 text-primary">
                    <service.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-[#111813] mb-2 font-display">{service.title}</h3>
                  <p className="text-[#61896f] text-sm leading-relaxed mb-6">
                    {service.desc}
                  </p>
                  <div className="mt-auto flex items-center gap-2 text-primary text-sm font-bold group-hover:gap-3 transition-all">
                    <span>دخول الخدمة</span>
                    <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                  </div>
                </Link>
              ))}
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
    </>
  );
}

function ArticleCard({ title, category, date, excerpt, categoryColor = "bg-primary", imageColor = "bg-slate-100" }: any) {
  return (
    <Link href="/news/1" className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-[#e5e7eb] hover:shadow-xl hover:shadow-gray-100/50 hover:-translate-y-1 transition-all duration-300">
      <div className={`relative w-full aspect-[16/10] overflow-hidden ${imageColor}`}>
        {/* Badge */}
        <div className="absolute top-4 right-4 z-10">
          <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-sm ${categoryColor}`}>
            {category}
          </span>
        </div>

        {/* Placeholder for Image */}
        <div className="w-full h-full flex items-center justify-center text-slate-300 group-hover:scale-105 transition-transform duration-700">
          <Calendar className="w-16 h-16 opacity-20" />
        </div>
      </div>

      <div className="flex flex-col flex-1 p-6">
        <div className="flex items-center gap-2 text-[#61896f] text-xs font-bold mb-3 uppercase tracking-wider">
          <Calendar className="w-4 h-4" />
          <time>{date}</time>
        </div>

        <h3 className="text-xl font-bold text-[#111813] mb-3 leading-snug group-hover:text-primary transition-colors font-display line-clamp-2">
          {title}
        </h3>

        <p className="text-[#61896f] text-sm leading-relaxed mb-6 line-clamp-3">
          {excerpt}
        </p>

        <div className="mt-auto pt-4 border-t border-gray-50 flex items-center text-primary text-sm font-bold group-hover:gap-2 transition-all">
          <span>اقرأ التفاصيل</span>
          <ArrowRight className="w-4 h-4 rtl:rotate-180" />
        </div>
      </div>
    </Link>
  )
}
