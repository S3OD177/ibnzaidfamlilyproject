// Fields a member may ask to change on their own tree record. Shared by the member's
// form and the staff review page; keys are member columns, or "socialLinks.<name>".

export type ChangeField = {
    key: string;
    label: string;
    kind: "text" | "textarea" | "select" | "photo" | "email" | "tel" | "url";
    max?: number;
    options?: Record<string, string>;
    group: "contact" | "personal" | "work" | "social";
};

export const MARITAL_STATUS: Record<string, string> = {
    single: "أعزب / عزباء",
    married: "متزوج / متزوجة",
    divorced: "مطلق / مطلقة",
    widowed: "أرمل / أرملة",
};

export const CHANGE_FIELDS: ChangeField[] = [
    { key: "photoUrl", label: "الصورة الشخصية", kind: "photo", group: "personal" },
    { key: "nickname", label: "اللقب", kind: "text", max: 100, group: "personal" },
    { key: "maritalStatus", label: "الحالة الاجتماعية", kind: "select", options: MARITAL_STATUS, group: "personal" },
    { key: "bio", label: "نبذة عني", kind: "textarea", max: 2000, group: "personal" },
    { key: "mobile", label: "رقم الجوال", kind: "tel", max: 20, group: "contact" },
    { key: "email", label: "البريد الإلكتروني", kind: "email", max: 200, group: "contact" },
    { key: "location", label: "المدينة", kind: "text", max: 100, group: "contact" },
    { key: "country", label: "الدولة", kind: "text", max: 100, group: "contact" },
    { key: "occupation", label: "الوظيفة", kind: "text", max: 150, group: "work" },
    { key: "company", label: "جهة العمل", kind: "text", max: 150, group: "work" },
    { key: "education", label: "المؤهل العلمي", kind: "text", max: 150, group: "work" },
    { key: "university", label: "الجامعة / المؤسسة", kind: "text", max: 150, group: "work" },
    { key: "socialLinks.twitter", label: "حساب X", kind: "text", max: 100, group: "social" },
    { key: "socialLinks.instagram", label: "انستقرام", kind: "text", max: 100, group: "social" },
    { key: "socialLinks.linkedin", label: "لينكدإن", kind: "url", max: 300, group: "social" },
    { key: "socialLinks.website", label: "الموقع الشخصي", kind: "url", max: 300, group: "social" },
];

export const FIELD_GROUPS: Record<ChangeField["group"], string> = {
    personal: "البيانات الشخصية",
    contact: "التواصل والسكن",
    work: "التعليم والعمل",
    social: "الحسابات والروابط",
};

export const fieldByKey = new Map(CHANGE_FIELDS.map((f) => [f.key, f]));

/** A stored value as people read it (select labels, empty dash). */
export function displayValue(key: string, value: string | null | undefined): string {
    if (!value) return "—";
    const field = fieldByKey.get(key);
    if (field?.options) return field.options[value] ?? value;
    return value;
}

export type ChangeRequestStatus = "pending" | "approved" | "rejected";

export const STATUS_LABELS: Record<ChangeRequestStatus, { label: string; className: string }> = {
    pending: { label: "قيد المراجعة", className: "bg-amber-50 text-amber-700 border-amber-200" },
    approved: { label: "تم الاعتماد", className: "bg-green-50 text-green-700 border-green-200" },
    rejected: { label: "مرفوض", className: "bg-red-50 text-red-600 border-red-100" },
};
