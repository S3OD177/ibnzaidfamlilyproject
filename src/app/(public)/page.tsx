import Link from "next/link";
import { ArrowLeft, BookOpen, Calendar, FileText, Landmark, Mail, MessageCircle, Network, PencilLine, Twitter, User, UserPlus, Users } from "lucide-react";
import { PageHero, SectionHeading } from "@/components/heritage/PageHero";
import { Star8 } from "@/components/heritage/Ornament";
import { categoryColor, formatNewsDate, latestNews, type NewsRow } from "@/lib/data/news";
import { getCouncilMembers } from "@/lib/data/members";
import { getCharter } from "@/lib/data/documents";
import { getPublicCounts } from "@/lib/data/stats";
import { getAboutContent, getSiteSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [news, site, about, counts, council, charter] = await Promise.all([
    latestNews(4),
    getSiteSettings(),
    getAboutContent(),
    getPublicCounts(),
    getCouncilMembers(),
    getCharter(),
  ]);
  const [featured, ...rest] = news;
  const chair = council[0];

  const stats = [
    { label: "فرداً في الشجرة", value: counts.members, icon: Users },
    { label: "جيلاً موثّقاً", value: counts.generations, icon: Network },
    { label: "أسرة", value: counts.families, icon: Landmark },
    { label: "خبراً منشوراً", value: counts.news, icon: BookOpen },
  ];

  return (
    <main className="flex-grow flex flex-col">
      <PageHero size="lg" eyebrow="الموقع الرسمي للعائلة" title={site.siteName} subtitle={about.heroTitle}>
        <p className="text-white/65 max-w-2xl mx-auto mt-3 leading-relaxed font-naskh">{about.heroText}</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-10">
          <Link href="/portal" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary text-deep px-7 py-3.5 rounded-xl font-bold hover:bg-primary-light transition-colors">
            <Network className="w-5 h-5" />
            شجرة العائلة وبوابة الأعضاء
          </Link>
          <Link href="/about" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-primary/50 text-primary px-7 py-3.5 rounded-xl font-bold hover:bg-primary/10 transition-colors">
            تعرّف على العائلة
          </Link>
        </div>
      </PageHero>

      {/* Family in numbers, overlapping the hero */}
      <section className="relative z-10 -mt-10 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {stats.map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-white rounded-2xl border border-primary/25 shadow-lg shadow-deep/5 p-5 text-center">
              <Icon className="w-5 h-5 text-primary mx-auto mb-2" />
              <p className="font-heritage font-bold text-4xl text-deep leading-none">{value}</p>
              <p className="text-sm text-muted mt-2">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mission, vision and values */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <SectionHeading eyebrow="من نحن" title="رسالتنا ورؤيتنا" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
            {[
              { title: "رسالتنا", text: about.mission },
              { title: "رؤيتنا", text: about.vision },
            ].map((card) => (
              <div key={card.title} className="relative bg-white rounded-2xl border border-sand p-8 overflow-hidden">
                <Star8 className="absolute -left-6 -top-6 w-24 h-24 text-primary/10" />
                <h3 className="font-heritage font-bold text-2xl text-deep mb-3">{card.title}</h3>
                <p className="text-gray-600 leading-loose font-naskh">{card.text}</p>
              </div>
            ))}
          </div>
          {about.values.length > 0 && (
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              {about.values.map((value) => (
                <span key={value} className="inline-flex items-center gap-2 bg-sand/60 text-deep px-4 py-2 rounded-full text-sm font-bold">
                  <Star8 className="w-3 h-3 text-primary-dark" />
                  {value}
                </span>
              ))}
            </div>
          )}
          <div className="text-center mt-8">
            <Link href="/about" className="inline-flex items-center gap-2 text-primary-dark font-bold hover:gap-3 transition-all">
              قصة العائلة كاملة
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Latest news */}
      <section className="bg-white border-y border-sand py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <SectionHeading eyebrow="المركز الإعلامي" title="أخبار العائلة" />
          {!featured ? (
            <p className="text-center text-muted mt-12">لا توجد أخبار منشورة بعد.</p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-12">
              <FeaturedCard item={featured} />
              <div className="lg:col-span-2 flex flex-col gap-4">
                {rest.map((item) => (
                  <CompactCard key={item.id} item={item} />
                ))}
                <Link href="/news" className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl border border-primary/40 text-primary-dark font-bold py-3 hover:bg-primary/5 transition-colors">
                  أرشيف الأخبار
                  <ArrowLeft className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Council */}
      <section className="relative overflow-hidden bg-deep text-white py-20 px-4">
        <div className="absolute inset-0 heritage-pattern opacity-[0.07]" />
        <div className="relative max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <SectionHeading eyebrow="القيادة" title="مجلس العائلة" align="start" light />
            <p className="text-white/75 leading-loose font-naskh mt-6">
              يقود المجلس شؤون العائلة، ويعمل على توثيق الروابط ودعم المبادرات الاجتماعية والتعليمية، وفق ميثاق يحدد الحقوق والواجبات وآليات اتخاذ القرار.
            </p>
            <div className="flex flex-wrap gap-3 mt-8">
              <Link href="/council" className="inline-flex items-center gap-2 bg-primary text-deep px-6 py-3 rounded-xl font-bold hover:bg-primary-light transition-colors">
                <Landmark className="w-5 h-5" />
                أعضاء المجلس
              </Link>
              {charter && (
                <a href={`/files/${charter.fileId}`} target="_blank" className="inline-flex items-center gap-2 border border-primary/50 text-primary px-6 py-3 rounded-xl font-bold hover:bg-primary/10 transition-colors">
                  <FileText className="w-5 h-5" />
                  ميثاق العائلة
                </a>
              )}
            </div>
          </div>
          {chair ? (
            <Link href={`/members/${chair.id}`} className="group bg-white/5 border border-primary/30 rounded-2xl p-6 md:p-8 flex items-center gap-5 hover:bg-white/10 transition-colors">
              <span className="size-24 md:size-28 rounded-full border-2 border-primary overflow-hidden bg-deep-light flex items-center justify-center shrink-0">
                {chair.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={chair.photoUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-primary/60" />
                )}
              </span>
              <span className="min-w-0">
                <span className="text-primary text-sm font-bold">{chair.role}</span>
                <span className="block font-heritage font-bold text-3xl mt-1">{chair.name}</span>
                {chair.statement && <span className="block text-white/70 text-sm mt-3 leading-relaxed line-clamp-3 font-naskh">«{chair.statement}»</span>}
              </span>
            </Link>
          ) : (
            <p className="text-white/60 text-center">ستُنشر أسماء أعضاء المجلس قريباً.</p>
          )}
        </div>
      </section>

      {/* Members' portal services */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <SectionHeading eyebrow="بوابة الأعضاء" title="خدمات أفراد العائلة" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-12">
            {[
              { title: "شجرة العائلة", desc: "تصفّح الشجرة واعرف صلة القرابة بين أي فردين", icon: Network, href: "/portal/tree" },
              { title: "دليل الأعضاء", desc: "ابحث عن أي فرد من العائلة وافتح ملفه", icon: Users, href: "/portal/directory" },
              { title: "تحديث بياناتي", desc: "أرسل تحديث بياناتك لتعتمده الإدارة", icon: PencilLine, href: "/portal/profile/edit" },
              { title: "طلب انضمام", desc: "لست مسجلاً بعد؟ اطلب حساباً في البوابة", icon: UserPlus, href: "/join" },
            ].map((s) => (
              <Link key={s.title} href={s.href} className="group bg-white rounded-2xl border border-sand p-6 hover:border-primary hover:shadow-lg hover:shadow-deep/5 transition-all">
                <span className="size-12 rounded-xl bg-deep text-primary flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  <s.icon className="w-6 h-6" />
                </span>
                <h3 className="font-heritage font-bold text-2xl text-deep mb-2">{s.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{s.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      {(site.contactEmail || site.xHandle || site.whatsapp) && (
        <section id="contact" className="bg-sand/40 border-t border-sand py-16 px-4 scroll-mt-20">
          <div className="max-w-4xl mx-auto">
            <SectionHeading eyebrow="نسعد بتواصلكم" title="تواصل معنا" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10">
              {site.xHandle && (
                <ContactCard href={`https://x.com/${site.xHandle}`} icon={Twitter} title="منصة X" detail={`@${site.xHandle}`} />
              )}
              {site.whatsapp && <ContactCard href={`https://wa.me/${site.whatsapp}`} icon={MessageCircle} title="واتساب" detail="تواصل مع الإدارة" />}
              {site.contactEmail && <ContactCard href={`mailto:${site.contactEmail}`} icon={Mail} title="البريد الإلكتروني" detail={site.contactEmail} />}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

function FeaturedCard({ item }: { item: NewsRow }) {
  return (
    <Link href={`/news/${item.slug}`} className="group lg:col-span-3 relative rounded-2xl overflow-hidden bg-deep min-h-[360px] flex flex-col justify-end border border-primary/30">
      {item.coverUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.coverUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" />
      ) : (
        <div className="absolute inset-0 heritage-pattern opacity-20" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-deep via-deep/60 to-transparent" />
      <div className="relative p-6 md:p-8 text-white">
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold text-white ${categoryColor(item.category)}`}>{item.category}</span>
        <h3 className="font-heritage font-bold text-3xl md:text-4xl leading-snug mt-3 group-hover:text-primary transition-colors">{item.title}</h3>
        {item.excerpt && <p className="text-white/75 mt-3 line-clamp-2 font-naskh">{item.excerpt}</p>}
        <p className="flex items-center gap-2 text-primary/90 text-sm mt-4">
          <Calendar className="w-4 h-4" />
          <time dateTime={item.publishedAt?.toISOString()}>{formatNewsDate(item.publishedAt)}</time>
        </p>
      </div>
    </Link>
  );
}

function CompactCard({ item }: { item: NewsRow }) {
  return (
    <Link href={`/news/${item.slug}`} className="group flex gap-4 bg-cream rounded-2xl border border-sand p-3 hover:border-primary transition-colors">
      <span className="size-24 shrink-0 rounded-xl overflow-hidden bg-deep relative">
        {item.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.coverUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <span className="absolute inset-0 heritage-pattern opacity-25" />
        )}
      </span>
      <span className="min-w-0 py-1">
        <span className="text-xs font-bold text-primary-dark">{item.category}</span>
        <span className="block font-bold text-deep leading-snug mt-1 line-clamp-2 group-hover:text-primary-dark transition-colors">{item.title}</span>
        <span className="block text-xs text-muted mt-2">{formatNewsDate(item.publishedAt)}</span>
      </span>
    </Link>
  );
}

function ContactCard({ href, icon: Icon, title, detail }: { href: string; icon: typeof Mail; title: string; detail: string }) {
  return (
    <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener" className="group bg-white rounded-2xl border border-sand p-6 text-center hover:border-primary transition-colors">
      <span className="size-12 mx-auto rounded-full bg-deep text-primary flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
        <Icon className="w-5 h-5" />
      </span>
      <span className="block font-bold text-deep">{title}</span>
      <span className="block text-sm text-muted mt-1 truncate" dir="auto">{detail}</span>
    </a>
  );
}
