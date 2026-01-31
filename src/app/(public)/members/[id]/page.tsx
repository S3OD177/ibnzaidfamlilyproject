import Link from "next/link";
import {
    User,
    MapPin,
    Calendar,
    Phone,
    Mail,
    Award,
    Clock,
    ArrowRight,
    Share,
    Edit,
    Users,
    Heart,
    GitBranch,
    Crown
} from "lucide-react";

// Mock data for members
const MEMBERS_DB: Record<string, any> = {
    "1": {
        id: "1",
        name: "الشيخ محمد بن عبدالله",
        role: "رئيس المجلس",
        branch: "آل فهد",
        generation: "الجيل الثالث",
        gender: "male",
        image: null, // Removed URL
        cover: null, // Removed URL
        bio: [
            "رئيس مجلس العائلة، وشخصية قيادية بارزة ساهمت في تأسيس العديد من المبادرات الخيرية والاجتماعية.",
            "يتميز بحكمته ورؤيته المستقبلية التي ساهمت في جمع شمل العائلة وتوحيد كلمتها."
        ],
        dob: "1380 هـ",
        location: "الرياض",
        phone: "+966 50 XXX XXXX",
        email: "mohammed@family.sa",
        role_desc: "رئاسة المجلس وتوجيه السياسات العامة",
        role_date: "1440 هـ",
        parents: { father: "عبدالله بن فهد", mother: "الجوهرة بنت محمد" },
        spouse: "نورة بنت سعد",
        children: ["فهد", "محمد", "سارة", "هياء"]
    },
    "2": {
        id: "2",
        name: "سعادة الأستاذ خالد بن عبدالعزيز",
        role: "نائب رئيس المجلس",
        branch: "آل عبدالعزيز",
        generation: "الجيل الثالث",
        gender: "male",
        image: null,
        cover: null,
        bio: [
            "نائب رئيس المجلس، يمتلك خبرة إدارية واسعة في القطاع الحكومي والخاص.",
            "يشرف على تنفيذ المبادرات الاستراتيجية للمجلس ومتابعة لجان العمل."
        ],
        dob: "1385 هـ",
        location: "الرياض",
        phone: "+966 55 XXX XXXX",
        email: "khalid@family.sa",
        role_desc: "الإشراف التنفيذي ومتابعة اللجان",
        role_date: "1441 هـ",
        parents: { father: "عبدالعزيز بن محمد", mother: "سارة بنت خالد" },
        spouse: "مها بنت عبدالله",
        children: ["سلطان", "نايف", "ريم"]
    },
    "3": {
        id: "3",
        name: "المهندس عمر بن صالح",
        role: "أمين الصندوق",
        branch: "آل صالح",
        generation: "الجيل الرابع",
        gender: "male",
        image: null,
        cover: null,
        bio: [
            "أمين صندوق العائلة، مهندس مالي ذو خبرة في إدارة المحافظ الاستثمارية.",
            "يعمل على تنمية موارد الصندوق العائلي وضمان استدامته المالية."
        ],
        dob: "1395 هـ",
        location: "جدة",
        phone: "+966 54 XXX XXXX",
        email: "omar@family.sa",
        role_desc: "إدارة الموارد المالية والاستثمارات",
        role_date: "1442 هـ",
        parents: { father: "صالح بن علي", mother: "لطيفة بنت حمد" },
        spouse: "العنود بنت فهد",
        children: ["فيصل", "عبدالله"]
    },
    "4": {
        id: "4",
        name: "الدكتور أحمد بن إبراهيم",
        role: "أمين السر العام",
        branch: "آل إبراهيم",
        generation: "الجيل الرابع",
        gender: "male",
        image: null,
        cover: null,
        bio: [
            "أمين سر المجلس، أكاديمي وباحث في مجال التاريخ والآداب.",
            "يتولى توثيق اجتماعات المجلس وحفظ سجلات العائلة التاريخية."
        ],
        dob: "1398 هـ",
        location: "الدمام",
        phone: "+966 56 XXX XXXX",
        email: "ahmed@family.sa",
        role_desc: "أمانة المجلس والتوثيق",
        role_date: "1443 هـ",
        parents: { father: "إبراهيم بن محمد", mother: "حصة بنت عبدالله" },
        spouse: "منيرة بنت سعود",
        children: ["ياسر", "عمر", "لمى"]
    }
};

export default async function MemberProfile({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const member = MEMBERS_DB[id];

    if (!member) {
        return <div>Member not found</div>
    }

    const profileImage = member.image;

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
                            <div className="relative">
                                <div className="size-36 rounded-xl bg-white p-1 border-4 border-white shadow-lg overflow-hidden flex items-center justify-center bg-gray-50">
                                    <Users className="w-20 h-20 text-gray-300" />
                                </div>
                                <div className="absolute -bottom-2 -right-2 bg-[#D4AF37] text-white text-[10px] font-bold px-2 py-1 rounded-full border-2 border-white shadow-sm uppercase">
                                    VIP
                                </div>
                            </div>

                            {/* Basic Info */}
                            <div className="flex-1 pb-2 text-center md:text-right">
                                <h1 className="text-3xl font-bold text-[#111812] font-naskh mb-2">{member.name}</h1>
                                <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-2">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full ${iconBg} ${iconColor} text-sm font-medium border border-transparent`}>
                                        <GitBranch className="w-4 h-4 mr-2 ml-1" />
                                        {member.branch}
                                    </span>
                                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] text-sm font-medium border border-[#D4AF37]/20">
                                        <Clock className="w-4 h-4 mr-2 ml-1" />
                                        {member.generation}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pb-2 w-full md:w-auto">
                            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-white font-bold rounded-lg hover:bg-green-600 transition-all shadow-md shadow-primary/20">
                                <Share className="w-5 h-5" />
                                <span>مشاركة الملف</span>
                            </button>
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
                                        <p className="text-base font-bold text-[#111812]">{member.dob || "غير متوفر"}</p>
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
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <Phone className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm font-medium text-gray-700 dir-ltr">{member.phone}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Mail className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm font-medium text-gray-700">{member.email || "email@example.com"}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Role Card */}
                        <div className="bg-[#102210] rounded-xl p-6 text-white shadow-lg border border-primary/20">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="size-10 rounded-full bg-[#D4AF37]/20 flex items-center justify-center border border-[#D4AF37]/30">
                                    <Award className="w-5 h-5 text-[#D4AF37]" />
                                </div>
                                <h3 className="text-lg font-bold">الدور في العائلة</h3>
                            </div>
                            <p className="text-sm text-gray-300 leading-relaxed mb-4">
                                {member.role_desc || "عضو فاعل في مجلس العائلة."}
                            </p>
                            <div className="flex items-center justify-between pt-4 border-t border-white/10">
                                <span className="text-xs text-gray-400">تاريخ التعيين</span>
                                <span className="text-sm font-bold text-[#D4AF37]">{member.role_date || "1440 هـ"}</span>
                            </div>
                        </div>

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
                                {member.bio ? member.bio.map((p: string, i: number) => (
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
                                        {member.parents?.father && (
                                            <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-all">
                                                <div className="size-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                                                    <User className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold">{member.parents.father}</p>
                                                    <p className="text-[11px] text-gray-400">الأب</p>
                                                </div>
                                            </div>
                                        )}
                                        {member.parents?.mother && (
                                            <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-all">
                                                <div className="size-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500">
                                                    <User className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold">{member.parents.mother}</p>
                                                    <p className="text-[11px] text-gray-400">الأم</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Spouse & Children */}
                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest border-r-4 border-primary pr-3">العائلة المباشرة</h4>
                                    <div className="space-y-3">
                                        <div className="p-3 rounded-lg bg-[#f6f8f6] border border-primary/10">
                                            <p className="text-xs text-gray-500 mb-2">الأبناء ({member.children?.length || 0})</p>
                                            <div className="flex flex-wrap gap-2">
                                                {member.children?.map((child: string, i: number) => (
                                                    <span key={i} className="px-3 py-1 rounded-full bg-white border border-gray-200 text-xs font-bold">
                                                        {child}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        {member.spouse && (
                                            <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-all">
                                                <div className="size-10 rounded-full bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
                                                    <Heart className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold">{member.spouse}</p>
                                                    <p className="text-[11px] text-gray-400">الشريك</p>
                                                </div>
                                            </div>
                                        )}
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
