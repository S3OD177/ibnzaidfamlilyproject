// Who may see each personal detail on a member's record. Shared by the settings form
// (client) and the data loaders (server), which strip what the viewer may not see.

export type PrivacyLevel = "public" | "members" | "private";
export type PrivacyField = "photo" | "birthDate" | "location" | "mobile" | "email" | "social";
export type PrivacySettings = Record<PrivacyField, PrivacyLevel>;

export const PRIVACY_LEVELS: Record<PrivacyLevel, { label: string; hint: string }> = {
    public: { label: "الجميع", hint: "يظهر لكل زوار الموقع" },
    members: { label: "أفراد العائلة", hint: "يظهر للأعضاء المسجلين فقط" },
    private: { label: "الإدارة فقط", hint: "لا يراه إلا أنت والإدارة" },
};

export const PRIVACY_FIELDS: { key: PrivacyField; label: string }[] = [
    { key: "photo", label: "الصورة الشخصية" },
    { key: "birthDate", label: "تاريخ الميلاد" },
    { key: "location", label: "المدينة ومكان الإقامة" },
    { key: "mobile", label: "رقم الجوال" },
    { key: "email", label: "البريد الإلكتروني" },
    { key: "social", label: "الحسابات والروابط" },
];

/** Today's behaviour, so nothing changes until someone chooses otherwise. */
export const DEFAULT_PRIVACY: PrivacySettings = {
    photo: "public",
    birthDate: "public",
    location: "public",
    mobile: "members",
    email: "members",
    social: "members",
};

/** Stored settings merged over the defaults, ignoring anything unknown. */
export function readPrivacy(stored: unknown): PrivacySettings {
    const result = { ...DEFAULT_PRIVACY };
    if (stored && typeof stored === "object") {
        for (const { key } of PRIVACY_FIELDS) {
            const value = (stored as Record<string, unknown>)[key];
            if (value === "public" || value === "members" || value === "private") result[key] = value;
        }
    }
    return result;
}

/** Who is looking: a visitor, a signed-in member (and which tree person they are), or staff. */
export type Viewer = { kind: "anon" } | { kind: "member"; memberId: string | null } | { kind: "staff" };

export function canSee(level: PrivacyLevel, viewer: Viewer, ownerId: string): boolean {
    if (viewer.kind === "staff") return true;
    if (viewer.kind === "member" && viewer.memberId === ownerId) return true;
    if (level === "public") return true;
    return level === "members" && viewer.kind === "member";
}
