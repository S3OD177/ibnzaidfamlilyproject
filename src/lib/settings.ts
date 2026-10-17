import "server-only";
import { cache } from "react";
import { inArray } from "drizzle-orm";
import { getDb, schema } from "@/db";

// Site-wide texts edited from /portal/admin/settings, stored in the settings table.
// Defaults are the texts the site shipped with, so a missing row changes nothing.

export interface SiteSettings {
    siteName: string;
    tagline: string;
    contactEmail: string;
    xHandle: string; // without @
    whatsapp: string; // international digits, e.g. 9665xxxxxxxx
    footerText: string;
}

export interface AboutContent {
    heroTitle: string;
    heroText: string;
    mission: string;
    vision: string;
    values: string[];
    historyTitle: string;
    historyText: string; // blank line between paragraphs
    ctaTitle: string;
    ctaText: string;
}

export const DEFAULT_SITE: SiteSettings = {
    siteName: "منصة العائلة",
    tagline: "منصة أخبار العائلة والبوابة الخاصة",
    contactEmail: "H.ibnzaid@gmail.com",
    xHandle: "H_ibnzaid",
    whatsapp: "",
    footerText: "المحتوى المنشور في هذه المنصة خاص بأفراد العائلة ومحمي بموجب حقوق النشر.",
};

export const DEFAULT_ABOUT: AboutContent = {
    heroTitle: "جذور راسخة.. ومستقبل مشرق",
    heroText:
        "نحن عائلة تفخر بتاريخها العريق وموروثها الثقافي، نسعى لتعزيز أواصر القربى وبناء جيل واعٍ متمسك بقيمه، مساهم في رفعة وطنه ومجتمعه.",
    mission:
        "توثيق الروابط الأسرية، ودعم أفراد العائلة تعليمياً واجتماعياً، والمساهمة الفاعلة في التنمية المجتمعية من خلال مبادرات نوعية ومستدامة.",
    vision: "أن نكون نموذجاً رائداً في العمل العائلي المؤسسي، محققين للتكافل الاجتماعي والتميز المعرفي والقيمي لأبنائنا وبناتنا.",
    values: ["التراحم والتواصل", "الأصالة والمعاصرة", "التميز والإبداع"],
    historyTitle: "أكثر من ١٠٠ عام من العطاء",
    historyText:
        "تعود جذور عائلتنا إلى نجد العذية، حيث نشأ الأجداد ووضعوا اللبنات الأولى لهذا الكيان المترابط. عبر العقود، ساهم أبناء العائلة في بناء الوطن في مختلف الميادين، متمسكين بهويتهم ومبادئهم.\n\n" +
        'بدأ التنظيم المؤسسي للعائلة في عام ١٤٢٠هـ بتأسيس "صندوق العائلة" الذي كان النواة الأولى لكافة الأنشطة الاجتماعية والثقافية التي نراها اليوم.',
    ctaTitle: "انضم إلينا في مسيرة البناء",
    ctaText: "نسعد بمشاركة جميع أفراد العائلة في لجان المجلس ومبادراته المختلفة.",
};

const KEYS = { site: "site", about: "about" } as const;

/** Both settings rows, read once per request. */
const loadSettings = cache(async () => {
    // Pages prerendered at build time have no database; saving settings revalidates them.
    if (!process.env.DATABASE_URL) return { site: DEFAULT_SITE, about: DEFAULT_ABOUT };
    try {
        const rows = await getDb()
            .select()
            .from(schema.settings)
            .where(inArray(schema.settings.key, [KEYS.site, KEYS.about]));
        const byKey = new Map(rows.map((r) => [r.key, r.value as Record<string, unknown>]));
        return {
            site: { ...DEFAULT_SITE, ...(byKey.get(KEYS.site) ?? {}) } as SiteSettings,
            about: { ...DEFAULT_ABOUT, ...(byKey.get(KEYS.about) ?? {}) } as AboutContent,
        };
    } catch (error) {
        // Never take the site down over settings; fall back to the defaults.
        console.error("[settings] using defaults:", error);
        return { site: DEFAULT_SITE, about: DEFAULT_ABOUT };
    }
});

export const getSiteSettings = async () => (await loadSettings()).site;
export const getAboutContent = async () => (await loadSettings()).about;

export const SETTINGS_KEYS = KEYS;
