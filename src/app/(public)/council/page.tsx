import type { Metadata } from "next";
import Link from "next/link";
import { Eye, FileText, MapPin, User } from "lucide-react";
import { PageHero, SectionHeading } from "@/components/heritage/PageHero";
import { Star8 } from "@/components/heritage/Ornament";
import { getCouncilMembers } from "@/lib/data/members";
import { getCharter } from "@/lib/data/documents";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "مجلس العائلة" };

export default async function CouncilPage() {
    // Ordered by council_order; the first (the chair) gets the large card.
    const [[chair, ...members], charter] = await Promise.all([getCouncilMembers(), getCharter()]);

    return (
        <main className="flex-grow">
            <PageHero
                eyebrow="القيادة"
                title="مجلس العائلة"
                subtitle="قيادة تسعى لتمتين الروابط الأسرية وتعزيز قيم التلاحم والعطاء في ظل رؤية العائلة المستقبلية."
            />

            <div className="max-w-6xl mx-auto px-4 py-16 space-y-20">
                {chair && (
                    <section>
                        <Link
                            href={`/members/${chair.id}`}
                            className="group relative flex flex-col md:flex-row items-stretch bg-white rounded-3xl border border-primary/30 overflow-hidden shadow-xl shadow-deep/5 hover:border-primary transition-colors"
                        >
                            <div className="relative md:w-2/5 h-64 md:h-auto md:min-h-[380px] bg-deep flex items-center justify-center overflow-hidden">
                                <div className="absolute inset-0 heritage-pattern opacity-15" />
                                {chair.photoUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={chair.photoUrl} alt={chair.name} className="relative w-full h-full object-cover" />
                                ) : (
                                    <span className="relative size-36 rounded-full border-2 border-primary flex items-center justify-center">
                                        <User className="w-16 h-16 text-primary/70" />
                                    </span>
                                )}
                            </div>
                            <div className="md:w-3/5 p-8 md:p-12 flex flex-col justify-center">
                                <span className="inline-flex self-start items-center gap-2 bg-sand/70 text-deep px-3 py-1 rounded-full text-xs font-bold">
                                    <Star8 className="w-3 h-3 text-primary-dark" />
                                    {chair.role}
                                </span>
                                <h2 className="font-heritage font-bold text-4xl text-deep mt-4 leading-snug">{chair.name}</h2>
                                {chair.since && <p className="text-primary-dark font-bold mt-2">منذ {chair.since}</p>}
                                {chair.statement && (
                                    <blockquote className="mt-6 text-gray-700 text-lg leading-loose font-naskh border-r-4 border-primary pr-5">
                                        «{chair.statement}»
                                    </blockquote>
                                )}
                                <span className="mt-8 self-start inline-flex items-center gap-2 text-primary-dark font-bold group-hover:gap-3 transition-all">
                                    الملف الشخصي ←
                                </span>
                            </div>
                        </Link>
                    </section>
                )}

                <section>
                    <SectionHeading eyebrow="أعضاء المجلس" title="المكتب التنفيذي وممثلو الفروع" />
                    {members.length === 0 ? (
                        <p className="text-muted text-center py-10">لم تتم إضافة أعضاء المجلس بعد.</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-12">
                            {members.map((member) => (
                                <Link
                                    key={member.id}
                                    href={`/members/${member.id}`}
                                    className="group bg-white rounded-2xl border border-sand p-6 flex items-center gap-4 hover:border-primary hover:shadow-lg hover:shadow-deep/5 transition-all"
                                >
                                    <span className="size-20 rounded-full border-2 border-primary/60 overflow-hidden bg-cream flex items-center justify-center shrink-0">
                                        {member.photoUrl ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="w-9 h-9 text-primary/60" />
                                        )}
                                    </span>
                                    <span className="min-w-0">
                                        <span className="text-primary-dark text-xs font-bold">{member.role}</span>
                                        <span className="block font-heritage font-bold text-2xl text-deep mt-0.5 group-hover:text-primary-dark transition-colors">{member.name}</span>
                                        {member.location && (
                                            <span className="flex items-center gap-1.5 mt-1 text-muted text-sm">
                                                <MapPin className="w-3.5 h-3.5" />
                                                {member.location}
                                            </span>
                                        )}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>

                <section className="relative overflow-hidden bg-deep text-white rounded-3xl p-8 md:p-12">
                    <div className="absolute inset-0 heritage-pattern opacity-10" />
                    <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="text-center md:text-right flex-1">
                            <h2 className="font-heritage font-bold text-3xl text-primary mb-3">ميثاق العائلة</h2>
                            <p className="text-white/70 max-w-xl leading-loose font-naskh">
                                يتضمن الميثاق اللوائح التي تحكم عمل المجلس، وحقوق وواجبات أفراد العائلة، وآليات اتخاذ القرار والتمثيل الرسمي.
                            </p>
                        </div>
                        {charter ? (
                            <div className="flex flex-col sm:flex-row gap-3">
                                <a href={`/files/${charter.fileId}?download`} className="inline-flex items-center justify-center gap-2 bg-primary text-deep px-7 py-3.5 rounded-xl font-bold hover:bg-primary-light transition-colors">
                                    <FileText className="w-5 h-5" />
                                    تحميل الميثاق
                                </a>
                                <a href={`/files/${charter.fileId}`} target="_blank" className="inline-flex items-center justify-center gap-2 border border-primary/50 text-primary px-7 py-3.5 rounded-xl font-bold hover:bg-primary/10 transition-colors">
                                    <Eye className="w-5 h-5" />
                                    قراءة عبر الإنترنت
                                </a>
                            </div>
                        ) : (
                            <p className="text-white/60 text-sm border border-white/15 rounded-xl px-6 py-4">سيُنشر الميثاق هنا قريباً.</p>
                        )}
                    </div>
                </section>
            </div>
        </main>
    );
}
