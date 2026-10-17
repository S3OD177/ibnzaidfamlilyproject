import Link from "next/link";
import { MapPin, Eye, Users, FileText, User } from "lucide-react";
import { getCouncilMembers } from "@/lib/data/members";
import { getCharter } from "@/lib/data/documents";

export const dynamic = "force-dynamic";

export default async function CouncilPage() {
    // Ordered by council_order; the first (the chair) gets the large card.
    const [[chair, ...members], charter] = await Promise.all([getCouncilMembers(), getCharter()]);

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

                    {chair && (
                        <section className="mb-20">
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-gold/20 to-primary/20 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                                <div className="relative bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100">
                                    <Link href={`/members/${chair.id}`} className="flex flex-col md:flex-row items-stretch w-full hover:bg-gray-50 transition-colors">
                                        <div className="w-full md:w-2/5 aspect-[4/5] bg-gray-50 flex items-center justify-center border-l md:border-l-0 md:border-b border-[#e5e7eb] overflow-hidden">
                                            {chair.photoUrl ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={chair.photoUrl} alt={chair.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <User className="w-32 h-32 text-gray-300" />
                                            )}
                                        </div>
                                        <div className="w-full md:w-3/5 p-8 md:p-12 flex flex-col justify-center">
                                            <span className="inline-block self-start bg-primary/10 text-primary-dark px-3 py-1 rounded-full text-xs font-bold tracking-wider mb-4 border border-primary/20">
                                                {chair.role}
                                            </span>
                                            <h2 className="text-3xl font-bold text-gray-900 mb-2 font-naskh leading-snug">{chair.name}</h2>
                                            {chair.since && <p className="text-[#D4AF37] font-medium mb-6">فترة الولاية: {chair.since} - الحالي</p>}
                                            {chair.statement && (
                                                <div className="relative italic text-gray-700 mb-8 leading-relaxed text-lg font-naskh border-r-4 border-[#D4AF37] pr-6">
                                                    &quot;{chair.statement}&quot;
                                                </div>
                                            )}
                                            <span className="inline-flex self-start items-center gap-2 bg-[#111812] text-white px-6 py-3 rounded-lg font-bold">
                                                <span>السيرة الذاتية</span>
                                            </span>
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Council Members Grid */}
                    <section className="mb-20">
                        <div className="flex items-center justify-between mb-8 border-b-2 border-gray-100 pb-4">
                            <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3 font-naskh">
                                <Users className="text-primary w-6 h-6" />
                                أعضاء المكتب التنفيذي وممثلو الفروع
                            </h3>
                        </div>

                        {members.length === 0 ? (
                            <p className="text-gray-500 text-center py-10">لم تتم إضافة أعضاء المجلس بعد.</p>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                {members.map((member) => (
                                    <Link key={member.id} href={`/members/${member.id}`} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group">
                                        <div className="w-full aspect-[3/4] bg-gray-50 flex items-center justify-center border-b border-[#e5e7eb] group-hover:bg-gray-100 transition-colors overflow-hidden">
                                            {member.photoUrl ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <User className="w-24 h-24 text-gray-300" />
                                            )}
                                        </div>
                                        <div className="p-5">
                                            <span className="text-primary text-xs font-bold tracking-widest">{member.role}</span>
                                            <h4 className="text-lg font-bold mt-1 text-gray-900">{member.name}</h4>
                                            {member.location && (
                                                <div className="flex items-center gap-2 mt-3 text-gray-500 text-sm">
                                                    <MapPin className="w-4 h-4" />
                                                    <span>{member.location}</span>
                                                </div>
                                            )}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
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
                            {charter ? (
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <a href={`/files/${charter.fileId}?download`} className="bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-lg font-bold flex items-center gap-3 shadow-lg transition-transform active:scale-95">
                                        <FileText className="w-5 h-5 rtl:scale-x-[-1]" />
                                        <span>تحميل ميثاق العائلة</span>
                                    </a>
                                    <a href={`/files/${charter.fileId}`} target="_blank" className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-lg font-bold flex items-center gap-3 backdrop-blur-sm border border-white/20 transition-all">
                                        <Eye className="w-6 h-6" />
                                        <span>قراءة عبر الإنترنت</span>
                                    </a>
                                </div>
                            ) : (
                                <p className="text-gray-400 text-sm bg-white/5 border border-white/10 rounded-lg px-6 py-4">سيُنشر الميثاق هنا قريباً.</p>
                            )}
                        </div>
                    </section>

                </div>
            </main >

        </div >
    );
}
