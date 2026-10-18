// Family happy news: types with their labels and colours. Shared by client and server.

export type OccasionType = "wedding" | "birth" | "graduation" | "achievement" | "other";

export const OCCASION_TYPES: Record<OccasionType, { label: string; congrats: string; className: string }> = {
    wedding: { label: "زواج", congrats: "بارك الله لهما وبارك عليهما وجمع بينهما في خير", className: "bg-rose-50 text-rose-700 border-rose-200" },
    birth: { label: "مولود", congrats: "بارك الله لكم في الموهوب وشكرتم الواهب", className: "bg-sky-50 text-sky-700 border-sky-200" },
    graduation: { label: "تخرج", congrats: "مبارك التخرج، وإلى مزيد من التوفيق", className: "bg-violet-50 text-violet-700 border-violet-200" },
    achievement: { label: "إنجاز", congrats: "مبارك هذا الإنجاز، وإلى الأمام", className: "bg-amber-50 text-amber-800 border-amber-200" },
    other: { label: "مناسبة سعيدة", congrats: "مبارك، أدام الله أفراحكم", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
};

export interface OccasionView {
    id: string;
    type: OccasionType;
    title: string;
    message: string | null;
    occasionDate: string | null;
    memberId: string | null;
    memberName: string | null;
    photoUrl: string | null;
    visibility: "public" | "members";
    status: "pending" | "approved" | "rejected";
    submitterName: string;
    createdAt: string;
    congrats: { name: string; message: string | null }[];
    /** Whether the person viewing has already said مبارك. */
    congratulated: boolean;
}
