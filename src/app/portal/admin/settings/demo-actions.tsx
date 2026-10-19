"use server";

import { revalidatePath } from "next/cache";
import { ImageResponse } from "next/og";
import { eq, inArray } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { ActionError, safeAction, type ActionResult } from "@/lib/action-result";
import { requireRole } from "@/lib/auth/current";
import { storeFile } from "@/lib/files";

// Sample content for presenting the site before the real family data is in. Every row
// created is recorded under the settings key "demo_content" so removal deletes exactly
// those rows and nothing the family added.
const KEY = "demo_content";
type Created = { events: string[]; polls: string[]; occasions: string[]; albums: string[]; files: string[]; fund: string[] };
const empty = (): Created => ({ events: [], polls: [], occasions: [], albums: [], files: [], fund: [] });

async function readCreated(): Promise<Created | null> {
    const [row] = await getDb().select().from(schema.settings).where(eq(schema.settings.key, KEY));
    return row ? { ...empty(), ...(row.value as Partial<Created>) } : null;
}

export async function hasDemoContent(): Promise<boolean> {
    return Boolean(await readCreated());
}

const day = (offset: number) => new Date(Date.now() + offset * 86_400_000).toISOString().slice(0, 10);

/**
 * A heritage-styled placeholder photo for the sample album: the family emblem on a deep
 * colour. No text, since the image renderer has no Arabic shaping; captions carry the words.
 */
async function placeholderPhoto(index: number, hue: string) {
    const image = new ImageResponse(
        (
            <div style={{ width: 1200, height: 800, display: "flex", alignItems: "center", justifyContent: "center", background: hue }}>
                <div style={{ display: "flex", width: 300, height: 300, borderRadius: 999, border: "10px solid #D4AF37", alignItems: "center", justifyContent: "center" }}>
                    <svg width="170" height="170" viewBox="0 0 64 64" fill="none" stroke="#D4AF37" strokeWidth="5" strokeLinecap="round">
                        <path d="M32 22v10M32 32H16v8M32 32h16v8" />
                        <circle cx="32" cy="14" r="8" fill="#D4AF37" stroke="none" />
                        <circle cx="16" cy="48" r="8" fill="#D4AF37" stroke="none" />
                        <circle cx="48" cy="48" r="8" fill="#D4AF37" stroke="none" />
                    </svg>
                </div>
                <div style={{ position: "absolute", bottom: 40, right: 50, display: "flex", color: "#D4AF37", fontSize: 48 }}>{String(index)}</div>
            </div>
        ),
        { width: 1200, height: 800 },
    );
    return Buffer.from(await image.arrayBuffer());
}

export async function addDemoContent(): Promise<ActionResult<void>> {
    return safeAction(async () => {
        const me = await requireRole("admin");
        if (await readCreated()) throw new ActionError("المحتوى التجريبي مضاف بالفعل");
        const db = getDb();
        const created = empty();
        const by = me.isDbUser ? me.userId : null;

        const events = await db
            .insert(schema.events)
            .values([
                { title: "الاجتماع السنوي للعائلة (تجريبي)", description: "لقاء العائلة السنوي وعرض تقرير المجلس.", eventDate: day(10), category: "meeting", location: "الرياض" },
                { title: "حفل تكريم المتفوقين (تجريبي)", description: "تكريم أبناء وبنات العائلة المتفوقين دراسياً.", eventDate: day(24), category: "occasion" },
                { title: "رحلة العائلة الربيعية (تجريبي)", description: "رحلة برية لكل أفراد العائلة.", eventDate: day(45), category: "general" },
            ])
            .returning({ id: schema.events.id });
        created.events = events.map((e) => e.id);

        await db.transaction(async (tx) => {
            const [poll] = await tx
                .insert(schema.polls)
                .values({
                    question: "ما الموعد الأنسب للاجتماع السنوي القادم؟ (تجريبي)",
                    description: "تصويت تجريبي لعرض الميزة.",
                    anonymous: true,
                    results: "after_vote",
                    closesAt: new Date(Date.now() + 30 * 86_400_000),
                    createdBy: by,
                })
                .returning({ id: schema.polls.id });
            await tx.insert(schema.pollOptions).values(
                ["إجازة منتصف العام", "إجازة عيد الفطر", "إجازة الصيف"].map((label, i) => ({ pollId: poll.id, label, sortOrder: i })),
            );
            created.polls.push(poll.id);
        });

        const occasions = await db
            .insert(schema.occasions)
            .values([
                { type: "graduation", title: "تخرج من الجامعة (تجريبي)", message: "نبارك لابن العائلة تخرجه بمرتبة الشرف.", occasionDate: day(-5), status: "approved", visibility: "members", submitterName: "الإدارة" },
                { type: "birth", title: "مولود جديد (تجريبي)", message: "رزق الله أحد أبناء العائلة بمولود، جعله الله من مواليد السعادة.", occasionDate: day(-2), status: "approved", visibility: "members", submitterName: "الإدارة" },
            ])
            .returning({ id: schema.occasions.id });
        created.occasions = occasions.map((o) => o.id);

        const [album] = await db
            .insert(schema.albums)
            .values({ title: "الاجتماع السنوي الماضي (تجريبي)", description: "صور توضيحية لعرض ألبومات العائلة.", eventDate: day(-60), visibility: "members", createdBy: by })
            .returning({ id: schema.albums.id });
        created.albums.push(album.id);
        const shades = ["#102210", "#1b3a1f", "#4B3F35", "#0f766e"];
        for (let i = 0; i < shades.length; i++) {
            const file = await storeFile({ name: `demo-${i + 1}.png`, mimeType: "image/png", data: await placeholderPhoto(i + 1, shades[i]), visibility: "members", uploadedBy: by });
            created.files.push(file.id);
            await db.insert(schema.albumPhotos).values({ albumId: album.id, fileId: file.id, caption: `صورة توضيحية ${i + 1}` });
        }

        const fund = await db
            .insert(schema.fundEntries)
            .values([
                { kind: "income", amount: "25000.00", entryDate: day(-90), category: "اشتراكات", description: "اشتراكات الأعضاء السنوية (تجريبي)", createdBy: by },
                { kind: "income", amount: "10000.00", entryDate: day(-40), category: "تبرعات", party: "متبرع", partyHidden: true, description: "تبرع لدعم التعليم (تجريبي)", createdBy: by },
                { kind: "expense", amount: "7500.00", entryDate: day(-30), category: "تعليم ومنح", description: "منح دراسية لثلاثة طلاب (تجريبي)", createdBy: by },
                { kind: "expense", amount: "4200.00", entryDate: day(-15), category: "فعاليات ومناسبات", description: "تكاليف اللقاء العائلي (تجريبي)", createdBy: by },
            ])
            .returning({ id: schema.fundEntries.id });
        created.fund = fund.map((f) => f.id);

        await db.insert(schema.settings).values({ key: KEY, value: created });
        for (const p of ["/portal", "/portal/polls", "/portal/occasions", "/portal/albums", "/portal/fund", "/portal/admin/settings"]) revalidatePath(p);
    });
}

export async function removeDemoContent(): Promise<ActionResult<void>> {
    return safeAction(async () => {
        await requireRole("admin");
        const created = await readCreated();
        if (!created) throw new ActionError("لا يوجد محتوى تجريبي");
        const db = getDb();
        await db.transaction(async (tx) => {
            if (created.events.length) await tx.delete(schema.events).where(inArray(schema.events.id, created.events));
            if (created.polls.length) await tx.delete(schema.polls).where(inArray(schema.polls.id, created.polls));
            if (created.occasions.length) await tx.delete(schema.occasions).where(inArray(schema.occasions.id, created.occasions));
            if (created.albums.length) await tx.delete(schema.albums).where(inArray(schema.albums.id, created.albums));
            if (created.files.length) await tx.delete(schema.files).where(inArray(schema.files.id, created.files));
            if (created.fund.length) await tx.delete(schema.fundEntries).where(inArray(schema.fundEntries.id, created.fund));
            await tx.delete(schema.settings).where(eq(schema.settings.key, KEY));
        });
        for (const p of ["/portal", "/portal/polls", "/portal/occasions", "/portal/albums", "/portal/fund", "/portal/admin/settings"]) revalidatePath(p);
    });
}
