import Link from "next/link";
import { notFound } from "next/navigation";
import { getMemberProfile } from "@/lib/data/members";
import ShareButton from "@/components/common/ShareButton";
import { getSession } from "@/lib/auth/current";
import {
    User,
    MapPin,
    Calendar,
    Phone,
    Mail,
    Award,
    Clock,
    ArrowRight,
    Edit,
    Users,
    Heart,
    GitBranch
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MemberProfile({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const member = await getMemberProfile(id);
    if (!member) notFound();

    // Contact details are for signed-in family members only.
    const signedIn = Boolean(await getSession());

    const bgGradient = "from-primary/20 via-primary/5";
    const borderColor = "border-[#e8efe9]";
    const iconColor = "text-primary";
    const iconBg = "bg-primary/10";

    return (
        <div className="bg-[#f6f8f6] min-h-screen font-body text-[#111812]">

            <main className="max-w-[1200px] mx-auto px-4 py-8">

                {/* Profile Header Card */}
                <div className={`bg-white rounded-xl shadow-sm border ${borderColor} overflow-hidden mb-8`}>
                    {/* Cover Gradient (No Image) */}
                    <div className={`h-40 bg-gradient-to-l ${bgGradient} to-transparent relative`}>
                    </div>

                    <div className="px-8 pb-8 -mt-16 relative flex flex-col md:flex-row items-end justify-between gap-6">
                        <div className="flex flex-col md:flex-row items-end gap-6 w-full">
                            {/* Profile Picture Placeholder */}
                            <div className="relative self-center md:self-auto">
                                <div className="size-36 rounded-xl bg-white p-1 border-4 border-white shadow-lg overflow-hidden flex items-center justify-center bg-gray-50">
                                    {member.photoUrl ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover rounded-lg" />
                                    ) : (
                                        <Users className="w-20 h-20 text-gray-300" />
                                    )}
                                </div>
                                {member.councilRole && (
                                    <div className="absolute -bottom-2 -right-2 bg-[#D4AF37] text-white text-[10px] font-bold px-2 py-1 rounded-full border-2 border-white shadow-sm">
                                        المجلس
                                    </div>
                                )}
                            </div>

                            {/* Basic Info */}
                            <div className="flex-1 pb-2 text-center md:text-right">
                                <h1 className="text-3xl font-bold text-[#111812] font-naskh mb-2">{member.name}</h1>
                                <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-2">
                                    {member.councilRole && (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#102210] text-[#D4AF37] text-sm font-bold">
                                            <Award className="w-4 h-4 mr-2 ml-1" />
                                            {member.councilRole}
                                        </span>
                                    )}
                                    {member.branch && (
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full ${iconBg} ${iconColor} text-sm font-medium border border-transparent`}>
                                            <GitBranch className="w-4 h-4 mr-2 ml-1" />
                                            {member.branch}
                                        </span>
                                    )}
                                    {member.generation && (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] text-sm font-medium border border-[#D4AF37]/20">
                                            <Clock className="w-4 h-4 mr-2 ml-1" />
                                            {member.generation}
                                        </span>
                                    )}
                                    {member.status === "deceased" && (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-sm font-medium">
                                            رحمه الله{member.death ? ` (${member.death})` : ""}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pb-2 w-full md:w-auto">
                            <ShareButton
                                title={member.name}
                                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-white font-bold rounded-lg hover:bg-green-600 transition-all shadow-md shadow-primary/20 cursor-pointer"
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Sidebar (Right Layout in RTL) */}
                    <div className="lg:col-span-4 space-y-6 lg:order-2">

                        {/* Info Card */}
                        <div className={`bg-white rounded-xl border ${borderColor} p-6 shadow-sm`}>
                            <h3 className={`text-lg font-bold mb-6 pb-2 border-b border-gray-100 flex items-center gap-2 ${iconColor}`}>
                                <User className="w-5 h-5" />
                                البيانات الأساسية
                            </h3>
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="size-10 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100">
                                        <Calendar className="w-5 h-5 text-gray-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium">تاريخ الميلاد</p>
                                        <p className="text-base font-bold text-[#111812]">{member.birth || "غير متوفر"}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="size-10 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100">
                                        <MapPin className="w-5 h-5 text-gray-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium">مكان الإقامة</p>
                                        <p className="text-base font-bold text-[#111812]">{member.location || "غير متوفر"}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Private Info */}
                            <div className={`mt-6 p-4 rounded-xl ${iconBg} border border-transparent`}>
                                <h4 className={`text-sm font-bold ${iconColor} mb-3 flex items-center gap-2`}>
                                    معلومات التواصل (خاصة)
                                </h4>
                                {signedIn ? (
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <Phone className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm font-medium text-gray-700" dir="ltr">{member.mobile || "غير متوفر"}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Mail className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm font-medium text-gray-700">{member.email || "غير متوفر"}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-600">
                                        متاحة لأفراد العائلة بعد{" "}
                                        <Link href={`/portal/login?next=/members/${member.id}`} className="font-bold text-primary hover:underline">تسجيل الدخول</Link>
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Role Card */}
                        {member.councilRole && (
                        <div className="bg-[#102210] rounded-xl p-6 text-white shadow-lg border border-primary/20">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="size-10 rounded-full bg-[#D4AF37]/20 flex items-center justify-center border border-[#D4AF37]/30">
                                    <Award className="w-5 h-5 text-[#D4AF37]" />
                                </div>
                                <h3 className="text-lg font-bold">الدور في العائلة</h3>
                            </div>
                            <p className="text-sm text-gray-300 leading-relaxed mb-4">
                                {member.councilRole} في مجلس العائلة.
                            </p>
                            {member.councilSince && (
                                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                                    <span className="text-xs text-gray-400">تاريخ التعيين</span>
                                    <span className="text-sm font-bold text-[#D4AF37]">{member.councilSince}</span>
                                </div>
                            )}
                        </div>
                        )}

                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-8 space-y-6 lg:order-1">

                        {/* Biography */}
                        <section className={`bg-white rounded-xl border ${borderColor} p-8 shadow-sm`}>
                            <h2 className={`text-xl font-bold text-[#111812] mb-6 flex items-center gap-2 ${iconColor}`}>
                                <Edit className="w-5 h-5" />
                                السيرة الذاتية
                            </h2>
                            <div className="prose max-w-none text-gray-700 leading-loose text-lg">
                                {member.bio.length > 0 ? member.bio.map((p, i) => (
                                    <p key={i} className="mb-4">{p}</p>
                                )) : (
                                    <p>لا توجد سيرة ذاتية متاحة حالياً.</p>
                                )}
                            </div>
                        </section>

                        {/* Family Connections */}
                        <section className={`bg-white rounded-xl border ${borderColor} p-8 shadow-sm`}>
                            <h2 className={`text-xl font-bold text-[#111812] mb-8 flex items-center gap-2 ${iconColor}`}>
                                <Users className="w-5 h-5" />
                                الروابط العائلية
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Parents */}
                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest border-r-4 border-[#D4AF37] pr-3">الوالدين</h4>
                                    <div className="space-y-3">
                                        {!member.father && !member.mother && <p className="text-sm text-gray-400">غير مسجلين</p>}
                                        {member.father && (
                                            <Link href={`/members/${member.father.id}`} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-all">
                                                <div className="size-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                                                    <User className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold">{member.father.name}</p>
                                                    <p className="text-[11px] text-gray-400">الأب</p>
                                                </div>
                                            </Link>
                                        )}
                                        {member.mother && (
                                            <Link href={`/members/${member.mother.id}`} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-all">
                                                <div className="size-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500">
                                                    <User className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold">{member.mother.name}</p>
                                                    <p className="text-[11px] text-gray-400">الأم</p>
                                                </div>
                                            </Link>
                                        )}
                                    </div>
                                </div>

                                {/* Spouse & Children */}
                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest border-r-4 border-primary pr-3">العائلة المباشرة</h4>
                                    <div className="space-y-3">
                                        <div className="p-3 rounded-lg bg-[#f6f8f6] border border-primary/10">
                                            <p className="text-xs text-gray-500 mb-2">الأبناء ({member.children.length})</p>
                                            <div className="flex flex-wrap gap-2">
                                                {member.children.map((child) => (
                                                    <Link key={child.id} href={`/members/${child.id}`} className="px-3 py-1 rounded-full bg-white border border-gray-200 text-xs font-bold hover:border-primary hover:text-primary transition-colors">
                                                        {child.name}
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                        {member.spouses.map((spouse) => (
                                            <div key={spouse} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-all">
                                                <div className="size-10 rounded-full bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
                                                    <Heart className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold">{spouse}</p>
                                                    <p className="text-[11px] text-gray-400">{member.gender === "male" ? "الزوجة" : "الزوج"}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                            </div>
                        </section>

                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <Link href="/council" className="flex-1 flex items-center justify-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-all">
                                <ArrowRight className="w-5 h-5 text-primary rtl:rotate-180" />
                                <div className="text-right">
                                    <p className="text-xs text-gray-500">العودة إلى</p>
                                    <p className="text-base font-bold">مجلس العائلة</p>
                                </div>
                            </Link>
                        </div>

                    </div>
                </div>

            </main>
        </div>
    );
}
