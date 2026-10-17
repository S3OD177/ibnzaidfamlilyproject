// Calendar event categories, shared by the add-event form (client) and the server actions.
export const EVENT_CATEGORIES = [
    { id: "meeting", label: "اجتماع", color: "bg-purple-100 text-purple-700 border-purple-200" },
    { id: "occasion", label: "مناسبة", color: "bg-amber-100 text-amber-700 border-amber-200" },
    { id: "urgent", label: "هام جداً", color: "bg-red-100 text-red-700 border-red-200" },
    { id: "general", label: "عام", color: "bg-blue-100 text-blue-700 border-blue-200" },
] as const;

export type EventCategoryId = (typeof EVENT_CATEGORIES)[number]["id"];

export function eventCategory(id: string) {
    return EVENT_CATEGORIES.find((c) => c.id === id) ?? EVENT_CATEGORIES[3];
}

// Timeline milestone types admins can add (births and deaths are not tracked here).
export const TIMELINE_TYPES = [
    { id: "milestone", label: "حدث تاريخي" },
    { id: "achievement", label: "إنجاز" },
    { id: "marriage", label: "زواج" },
] as const;
