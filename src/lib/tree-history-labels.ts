// Labels for the tree change history and the merge dialog. Shared by server pages and
// client components, so it holds no database code.

export const TREE_ACTIONS = {
    "member.update": "تعديل بيانات",
    "member.add": "إضافة فرد",
    "member.delete": "حذف فرد",
    "member.restore": "استعادة",
    "member.merge": "دمج مكرر",
    "link.add": "ربط والد بابن",
    "link.remove": "فك ربط",
    "parent.move": "نقل تحت والد آخر",
    "marriage.add": "إضافة زواج",
    "marriage.remove": "حذف زواج",
    import: "استيراد",
} as const;

export type TreeAction = keyof typeof TREE_ACTIONS;

export const isTreeAction = (value: unknown): value is TreeAction => typeof value === "string" && value in TREE_ACTIONS;

/** Arabic names of member columns, for diffs and the merge comparison. */
export const MEMBER_FIELD_LABELS: Record<string, string> = {
    fullName: "الاسم",
    serialNumber: "الرقم التسلسلي",
    nickname: "اللقب",
    gender: "الجنس",
    status: "الحالة",
    photoUrl: "الصورة",
    birthYear: "سنة الميلاد",
    birthMonth: "شهر الميلاد",
    birthDay: "يوم الميلاد",
    birthCalendar: "تقويم الميلاد",
    deathYear: "سنة الوفاة",
    deathMonth: "شهر الوفاة",
    deathDay: "يوم الوفاة",
    deathCalendar: "تقويم الوفاة",
    mobile: "الجوال",
    email: "البريد",
    location: "المدينة",
    country: "الدولة",
    maritalStatus: "الحالة الاجتماعية",
    occupation: "الوظيفة",
    company: "جهة العمل",
    education: "المؤهل",
    university: "الجامعة",
    socialLinks: "الحسابات",
    branch: "الفرع",
    generationLabel: "الجيل",
    siblingOrder: "ترتيب الإخوة",
    councilRole: "المنصب في المجلس",
    councilOrder: "ترتيب المجلس",
    councilSince: "في المجلس منذ",
    councilStatement: "كلمة المجلس",
    bio: "النبذة",
    interests: "الاهتمامات",
    isPublic: "ظاهر للعامة",
    privacy: "الخصوصية",
};

const VALUE_LABELS: Record<string, Record<string, string>> = {
    gender: { male: "ذكر", female: "أنثى" },
    status: { alive: "على قيد الحياة", deceased: "متوفى", unknown: "غير معروف" },
    birthCalendar: { hijri: "هجري", gregorian: "ميلادي" },
    deathCalendar: { hijri: "هجري", gregorian: "ميلادي" },
    maritalStatus: { single: "أعزب", married: "متزوج", divorced: "مطلق", widowed: "أرمل" },
};

/** A stored member value as people read it. */
export function formatFieldValue(key: string, value: unknown): string {
    if (value === null || value === undefined || value === "") return "—";
    if (Array.isArray(value)) return value.length ? value.join("، ") : "—";
    if (typeof value === "object") {
        const entries = Object.entries(value as Record<string, unknown>).filter(([, v]) => v !== undefined && v !== null && v !== "");
        return entries.length ? entries.map(([k, v]) => `${k}: ${String(v)}`).join("، ") : "—";
    }
    const text = String(value);
    if (key === "photoUrl") return text.startsWith("data:") ? "صورة مرفوعة" : text;
    return VALUE_LABELS[key]?.[text] ?? text;
}
