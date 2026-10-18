import Link from "next/link";
import { ArrowLeft, Award, Heart, Landmark, ScrollText, Target } from "lucide-react";
import { PageHero, SectionHeading } from "@/components/heritage/PageHero";
import { Star8 } from "@/components/heritage/Ornament";
import { getAboutContent } from "@/lib/settings";

export const metadata = {
    title: "عن العائلة",
};

export const dynamic = "force-dynamic";

export default async function AboutPage() {
    // Texts are edited from the admin settings page.
    const about = await getAboutContent();
    const history = about.historyText.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

    const pillars = [
        { title: "رسالتنا", icon: Target, body: <p>{about.mission}</p> },
        { title: "رؤيتنا", icon: Award, body: <p>{about.vision}</p> },
        {
            title: "قيمنا",
            icon: Heart,
            body: (
                <ul className="space-y-2.5">
                    {about.values.map((value) => (
                        <li key={value} className="flex items-center gap-2">
                            <Star8 className="w-3 h-3 text-primary-dark shrink-0" />
                            {value}
                        </li>
                    ))}
                </ul>
            ),
        },
    ];

    return (
        <main className="flex-grow">
            <PageHero eyebrow="قصتنا ورؤيتنا" title={about.heroTitle} subtitle={about.heroText} />

            <section className="py-20 px-4">
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
                    {pillars.map(({ title, icon: Icon, body }) => (
                        <div key={title} className="relative bg-white rounded-2xl border border-sand p-8 overflow-hidden">
                            <Star8 className="absolute -left-8 -bottom-8 w-28 h-28 text-primary/10" />
                            <span className="size-12 rounded-xl bg-deep text-primary flex items-center justify-center mb-5">
                                <Icon className="w-6 h-6" />
                            </span>
                            <h2 className="font-heritage font-bold text-3xl text-deep mb-4">{title}</h2>
                            <div className="text-gray-600 leading-loose font-naskh">{body}</div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="bg-white border-y border-sand py-20 px-4">
                <div className="max-w-3xl mx-auto">
                    <SectionHeading eyebrow="لمحة تاريخية" title={about.historyTitle} />
                    <div className="relative mt-12 pr-8 border-r-2 border-primary/30 space-y-8">
                        {history.map((paragraph, i) => (
                            <div key={i} className="relative">
                                <span className="absolute -right-[42px] top-1 size-5 rounded-full bg-cream border-2 border-primary flex items-center justify-center">
                                    <Star8 className="w-2.5 h-2.5 text-primary-dark" />
                                </span>
                                <p className="text-gray-700 text-lg leading-loose font-naskh">{paragraph}</p>
                            </div>
                        ))}
                    </div>
                    <div className="text-center mt-12">
                        <Link href="/portal/tree" className="inline-flex items-center gap-2 text-primary-dark font-bold hover:gap-3 transition-all">
                            <ScrollText className="w-5 h-5" />
                            استكشف شجرة العائلة
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </section>

            <section className="relative overflow-hidden bg-deep text-white text-center py-20 px-4">
                <div className="absolute inset-0 heritage-pattern opacity-[0.08]" />
                <div className="relative max-w-2xl mx-auto">
                    <SectionHeading title={about.ctaTitle} light />
                    <p className="text-white/75 text-lg mt-6 mb-10 font-naskh leading-loose">{about.ctaText}</p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        <Link href="/council" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary text-deep px-8 py-3.5 rounded-xl font-bold hover:bg-primary-light transition-colors">
                            <Landmark className="w-5 h-5" />
                            تعرّف على المجلس
                        </Link>
                        <Link href="/join" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-primary/50 text-primary px-8 py-3.5 rounded-xl font-bold hover:bg-primary/10 transition-colors">
                            طلب انضمام للبوابة
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}
