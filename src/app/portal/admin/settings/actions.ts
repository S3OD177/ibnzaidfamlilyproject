"use server";

import { ActionError, safeAction, type ActionResult } from "@/lib/action-result";
import { revalidatePath } from "next/cache";
import { getDb, schema } from "@/db";
import { requireRole } from "@/lib/auth/current";
import { DEFAULT_ABOUT, DEFAULT_SITE, SETTINGS_KEYS, type AboutContent, type SiteSettings } from "@/lib/settings";

const text = (value: unknown, max: number) => (typeof value === "string" ? value.trim().slice(0, max) : "");

async function upsert(key: string, value: unknown) {
    await getDb()
        .insert(schema.settings)
        .values({ key, value })
        .onConflictDoUpdate({ target: schema.settings.key, set: { value, updatedAt: new Date() } });
    // Settings appear across the whole site.
    revalidatePath("/", "layout");
}

export async function saveSiteSettings(input: SiteSettings): Promise<ActionResult<void>> {
    return safeAction(async () => {
        await requireRole("admin");
        const siteName = text(input.siteName, 80);
        if (!siteName) throw new ActionError("اسم الموقع مطلوب");
        const contactEmail = text(input.contactEmail, 200).toLowerCase();
        if (contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) throw new ActionError("البريد الإلكتروني غير صالح");
        const xHandle = text(input.xHandle, 50).replace(/^@/, "").replace(/^https?:\/\/(www\.)?(x|twitter)\.com\//, "");
        if (xHandle && !/^[A-Za-z0-9_]{1,15}$/.test(xHandle)) throw new ActionError("معرّف منصة X غير صالح");
        const whatsapp = text(input.whatsapp, 20).replace(/[^\d]/g, "");
        if (whatsapp && !/^\d{9,15}$/.test(whatsapp)) throw new ActionError("رقم واتساب غير صالح (أرقام بالصيغة الدولية مثل 9665xxxxxxxx)");

        await upsert(SETTINGS_KEYS.site, {
            siteName,
            tagline: text(input.tagline, 200) || DEFAULT_SITE.tagline,
            contactEmail,
            xHandle,
            whatsapp,
            footerText: text(input.footerText, 500),
        } satisfies SiteSettings);
    });
}

export async function saveAboutContent(input: AboutContent): Promise<ActionResult<void>> {
    return safeAction(async () => {
        await requireRole("admin");
        const values = (Array.isArray(input.values) ? input.values : [])
            .map((v) => text(v, 60))
            .filter(Boolean)
            .slice(0, 8);
        const pick = (key: keyof Omit<AboutContent, "values">, max: number) => text(input[key], max) || DEFAULT_ABOUT[key];

        await upsert(SETTINGS_KEYS.about, {
            heroTitle: pick("heroTitle", 150),
            heroText: pick("heroText", 1000),
            mission: pick("mission", 1000),
            vision: pick("vision", 1000),
            values: values.length ? values : DEFAULT_ABOUT.values,
            historyTitle: pick("historyTitle", 150),
            historyText: pick("historyText", 5000),
            ctaTitle: pick("ctaTitle", 150),
            ctaText: pick("ctaText", 1000),
        } satisfies AboutContent);
    });
}
