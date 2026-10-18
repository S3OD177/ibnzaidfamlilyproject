import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarDays, ChevronLeft, Images, PartyPopper, FileText, Gavel, Network, Newspaper, Paperclip, UserCircle, Users } from "lucide-react";
import { getSession } from "@/lib/auth/current";
import { getPortalMember } from "@/lib/data/members";
import { latestNews, formatNewsDate } from "@/lib/data/news";
import { listEvents } from "@/lib/data/events";
import { DECISION_STATES, listDecisions } from "@/lib/data/decisions";
import { listDocuments } from "@/lib/data/documents";
import { formatBytes } from "@/lib/files";
import { listOccasions } from "@/lib/data/occasions";
import OccasionCard from "@/components/occasions/OccasionCard";
import AlbumGrid from "@/components/albums/AlbumGrid";
import { listAlbums } from "@/lib/data/albums";
import { formatDateBoth, formatWeekday } from "@/lib/dates";

export const dynamic = "force-dynamic";


function Section({ title, icon: Icon, href, linkLabel, children }: {
    title: string;
    icon: typeof Newspaper;
    href?: string;
    linkLabel?: string;
    children: React.ReactNode;
}) {
    return (
        <section className="bg-white rounded-2xl border border-sand p-5 md:p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="font-heritage text-xl font-bold text-deep flex items-center gap-2">
                    <Icon className="w-5 h-5 text-primary" />
                    {title}
                </h2>
                {href && (
                    <Link href={href} className="text-sm font-bold text-primary flex items-center gap-1 hover:gap-2 transition-all">
                        {linkLabel}
                        <ChevronLeft className="w-4 h-4" />
                    </Link>
                )}
            </div>
            {children}
        </section>
    );
}

const Empty = ({ text }: { text: string }) => (
    <p className="text-sm text-gray-400 text-center py-6 border border-dashed border-gray-200 rounded-xl">{text}</p>
);

export default async function MemberHomePage() {
    const session = await getSession();
    if (!session) redirect("/portal/login");

    const today = new Date().toISOString().slice(0, 10);
    const [member, news, events, decisions, documents, occasions, albums] = await Promise.all([
        session.memberId ? getPortalMember(session.memberId, { kind: "member", memberId: session.memberId }) : Promise.resolve(null),
        latestNews(3),
        listEvents(),
        listDecisions({}),
        listDocuments({}),
        listOccasions({ limit: 2, viewerKey: session.userId }),
        listAlbums({ limit: 3 }),
    ]);
    const upcoming = events.filter((e) => e.date >= today).slice(0, 4);
    const files = documents.filter((d) => d.fileId);

    return (
        <div className="space-y-6">
            {/* Greeting and my card */}
            <section className="relative overflow-hidden bg-deep text-white rounded-2xl p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-6 border border-primary/25">
                <div className="absolute inset-0 heritage-pattern opacity-10 pointer-events-none" />
                <div className="relative flex items-center gap-4 flex-1 min-w-0">
                    <div className="size-16 rounded-full bg-white/10 border-2 border-primary overflow-hidden flex items-center justify-center shrink-0">
                        {member?.photo ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={member.photo} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <UserCircle className="w-9 h-9 text-white/80" />
                        )}
                    </div>
                    <div className="min-w-0">
                        <p className="text-white/75 text-sm">أهلاً بك</p>
                        <h1 data-on-dark className="font-heritage text-3xl font-bold text-primary truncate">{member?.label ?? session.displayName}</h1>
                        {member ? (
                            <>
                                <p className="text-white/75 text-sm mt-1 truncate">
                                    {[member.role, member.branch && `فرع ${member.branch}`, member.location].filter(Boolean).join(" · ") || "عضو في شجرة العائلة"}
                                </p>
                                <Link href="/portal/profile/edit" className="inline-block text-sm font-bold underline underline-offset-4 mt-2 hover:text-white/80">
                                    تحديث بياناتي
                                </Link>
                            </>
                        ) : (
                            <p className="text-white/75 text-sm mt-1">حسابك غير مرتبط بملف في الشجرة بعد، وستربطه الإدارة قريباً.</p>
                        )}
                    </div>
                </div>
                <div className="relative grid grid-cols-3 gap-2 md:w-auto">
                    {[
                        { href: "/portal/members/me", label: "ملفي", icon: UserCircle },
                        { href: "/portal/tree", label: "الشجرة", icon: Network },
                        { href: "/portal/directory", label: "الأعضاء", icon: Users },
                    ].map(({ href, label, icon: Icon }) => (
                        <Link
                            key={href}
                            href={href}
                            className="flex flex-col items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-primary/30 text-primary rounded-xl px-4 py-3 text-sm font-bold transition-colors"
                        >
                            <Icon className="w-5 h-5" />
                            {label}
                        </Link>
                    ))}
                </div>
            </section>

            {occasions.length > 0 && (
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="font-heritage text-2xl font-bold text-deep flex items-center gap-2">
                            <PartyPopper className="w-5 h-5 text-primary-dark" />
                            أفراح العائلة
                        </h2>
                        <Link href="/portal/occasions" className="text-sm font-bold text-primary-dark flex items-center gap-1 hover:gap-2 transition-all">
                            كل الأفراح
                            <ChevronLeft className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {occasions.map((o) => (
                            <OccasionCard key={o.id} occasion={o} canCongratulate />
                        ))}
                    </div>
                </section>
            )}

            {albums.length > 0 && (
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="font-heritage text-2xl font-bold text-deep flex items-center gap-2">
                            <Images className="w-5 h-5 text-primary-dark" />
                            أحدث الألبومات
                        </h2>
                        <Link href="/portal/albums" className="text-sm font-bold text-primary-dark flex items-center gap-1 hover:gap-2 transition-all">
                            كل الألبومات
                            <ChevronLeft className="w-4 h-4" />
                        </Link>
                    </div>
                    <AlbumGrid albums={albums} base="/portal/albums" />
                </section>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Section title="آخر الأخبار" icon={Newspaper} href="/news" linkLabel="كل الأخبار">
                        {news.length === 0 ? (
                            <Empty text="لا توجد أخبار منشورة بعد." />
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {news.map((item) => (
                                    <Link key={item.id} href={`/news/${item.slug}`} className="flex gap-4 py-3 first:pt-0 last:pb-0 group">
                                        <div className="size-20 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                                            {item.coverUrl ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={item.coverUrl} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                    <Newspaper className="w-7 h-7" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <span className="text-[11px] font-bold text-primary">{item.category}</span>
                                            <h3 className="font-bold leading-snug group-hover:text-primary transition-colors line-clamp-2">{item.title}</h3>
                                            <p className="text-xs text-gray-400 mt-1">{formatNewsDate(item.publishedAt)}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </Section>

                    <Section title="أحدث قرارات المجلس" icon={Gavel} href="/council" linkLabel="مجلس العائلة">
                        {decisions.length === 0 ? (
                            <Empty text="لا توجد قرارات منشورة بعد." />
                        ) : (
                            <ul className="space-y-3">
                                {decisions.slice(0, 3).map((d) => (
                                    <li key={d.id} className="rounded-xl border border-gray-100 p-4">
                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                            {d.referenceNumber && <span className="text-xs font-bold text-gray-500">{d.referenceNumber}</span>}
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${DECISION_STATES[d.state].className}`}>
                                                {DECISION_STATES[d.state].label}
                                            </span>
                                        </div>
                                        <h3 className="font-bold">{d.title}</h3>
                                        {d.body && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{d.body}</p>}
                                        {d.attachmentFileId && (
                                            <a href={`/files/${d.attachmentFileId}`} target="_blank" className="inline-flex items-center gap-1 text-xs font-bold text-primary mt-2 hover:underline">
                                                <Paperclip className="w-3.5 h-3.5" />
                                                {d.attachmentName ?? "المرفق"}
                                            </a>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Section>
                </div>

                <div className="space-y-6">
                    <Section title="المناسبات القادمة" icon={CalendarDays}>
                        {upcoming.length === 0 ? (
                            <Empty text="لا توجد مناسبات قادمة." />
                        ) : (
                            <ul className="space-y-3">
                                {upcoming.map((e) => {
                                    return (
                                        <li key={e.id} className="flex gap-3">
                                            <div className="w-1 rounded-full shrink-0" style={{ backgroundColor: e.color }} />
                                            <div className="min-w-0">
                                                <h3 className="font-bold text-sm">{e.title}</h3>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    {formatWeekday(e.date)} · {formatDateBoth(e.date)}
                                                </p>
                                                <span className="text-[11px] text-gray-400">{e.categoryLabel}</span>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </Section>

                    <Section title="الوثائق" icon={FileText}>
                        {files.length === 0 ? (
                            <Empty text="لا توجد وثائق بعد." />
                        ) : (
                            <ul className="space-y-2">
                                {files.slice(0, 5).map((doc) => (
                                    <li key={doc.id}>
                                        <a
                                            href={`/files/${doc.fileId}`}
                                            target="_blank"
                                            className="flex items-center gap-3 rounded-xl p-2 -mx-2 hover:bg-gray-50"
                                        >
                                            <span className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                                <FileText className="w-4 h-4" />
                                            </span>
                                            <span className="min-w-0">
                                                <span className="block text-sm font-bold truncate">{doc.title}</span>
                                                <span className="block text-[11px] text-gray-400">
                                                    {[doc.isCharter ? "ميثاق العائلة" : doc.category, doc.sizeBytes ? formatBytes(doc.sizeBytes) : null]
                                                        .filter(Boolean)
                                                        .join(" · ")}
                                                </span>
                                            </span>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Section>
                </div>
            </div>
        </div>
    );
}
