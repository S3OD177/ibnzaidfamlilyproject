import {
    BarChart3,
    Calendar,
    FilePen,
    FileText,
    Gavel,
    History,
    Images,
    Landmark,
    LayoutDashboard,
    Newspaper,
    PartyPopper,
    Shield,
    UserPlus,
    Users,
    UsersRound,
    type LucideIcon,
} from "lucide-react";

type Role = "admin" | "editor" | "member";

export interface AdminTab {
    name: string;
    href: string;
    icon: LucideIcon;
    adminOnly?: boolean;
    /** Shows a pending count: join requests or members' change requests. */
    badge?: "joins" | "changes" | "occasions";
}

export interface AdminSection {
    name: string;
    icon: LucideIcon;
    tabs: AdminTab[];
}

// The sidebar lists sections; a section with several pages shows them as tabs at the
// top of each page. Every page keeps its own address, so old links still work.
export const ADMIN_SECTIONS: AdminSection[] = [
    {
        name: "لوحة التحكم",
        icon: LayoutDashboard,
        tabs: [
            { name: "نظرة عامة", href: "/portal/admin", icon: LayoutDashboard },
            { name: "الإحصائيات", href: "/portal/admin/analytics", icon: BarChart3 },
        ],
    },
    {
        name: "شجرة العائلة",
        icon: Users,
        tabs: [{ name: "شجرة العائلة", href: "/portal/admin/tree", icon: Users }],
    },
    {
        name: "المحتوى",
        icon: Newspaper,
        tabs: [
            { name: "الأخبار", href: "/portal/admin/news", icon: Newspaper },
            { name: "التقويم", href: "/portal/admin/calendar", icon: Calendar },
            { name: "السجل التاريخي", href: "/portal/admin/timeline", icon: History },
            { name: "الأفراح", href: "/portal/admin/occasions", icon: PartyPopper, badge: "occasions" },
            { name: "الألبومات", href: "/portal/admin/albums", icon: Images },
        ],
    },
    {
        name: "المجلس",
        icon: Landmark,
        tabs: [
            { name: "أعضاء المجلس", href: "/portal/admin/council", icon: Landmark },
            { name: "القرارات", href: "/portal/admin/decisions", icon: Gavel },
            { name: "الوثائق", href: "/portal/admin/documents", icon: FileText },
        ],
    },
    {
        name: "الأعضاء والحسابات",
        icon: UsersRound,
        tabs: [
            { name: "طلبات العضوية", href: "/portal/admin/approvals", icon: UserPlus, adminOnly: true, badge: "joins" },
            { name: "طلبات التعديل", href: "/portal/admin/change-requests", icon: FilePen, badge: "changes" },
            { name: "الحسابات", href: "/portal/admin/users", icon: Shield, adminOnly: true },
        ],
    },
];

const inTab = (pathname: string, href: string) =>
    href === "/portal/admin" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

/** Sections and tabs this role can open; sections left with no tabs are dropped. */
export function sectionsFor(role: Role): AdminSection[] {
    return ADMIN_SECTIONS.map((s) => ({ ...s, tabs: s.tabs.filter((t) => !t.adminOnly || role === "admin") })).filter(
        (s) => s.tabs.length > 0,
    );
}

/** The section and tab the current page belongs to, if any. */
export function findActive(sections: AdminSection[], pathname: string) {
    for (const section of sections) {
        const tab = section.tabs.find((t) => inTab(pathname, t.href));
        if (tab) return { section, tab };
    }
    return null;
}
