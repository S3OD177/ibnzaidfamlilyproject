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
    ListChecks,
    Newspaper,
    PartyPopper,
    PiggyBank,
    Shield,
    UserPlus,
    Users,
    UsersRound,
    Vote,
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
        tabs: [
            { name: "شجرة العائلة", href: "/portal/admin/tree", icon: Users },
            { name: "فحص البيانات", href: "/portal/admin/tree/checks", icon: ListChecks },
        ],
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
            { name: "التصويت", href: "/portal/admin/polls", icon: Vote },
            { name: "الصندوق", href: "/portal/admin/fund", icon: PiggyBank, adminOnly: true },
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

/** The section and tab the current page belongs to (the most specific match), if any. */
export function findActive(sections: AdminSection[], pathname: string) {
    let best: { section: AdminSection; tab: AdminTab } | null = null;
    for (const section of sections) {
        for (const tab of section.tabs) {
            if (inTab(pathname, tab.href) && (!best || tab.href.length > best.tab.href.length)) best = { section, tab };
        }
    }
    return best;
}
