"use server";

import { ActionError, safeAction, type ActionResult } from "@/lib/action-result";
import { revalidatePath } from "next/cache";
import { and, eq, ne } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { requireRole } from "@/lib/auth/current";

// Admins and editors manage content; server actions re-check the account every call.
async function requireStaff() {
    await requireRole("admin", "editor");
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_COVER = 1_500_000; // base64 data URL; moves to CranL storage later

export interface NewsInput {
    id?: string;
    title: string;
    excerpt: string;
    content: string;
    category: string;
    coverUrl: string | null;
    publish: boolean;
    publishedAt: string | null; // yyyy-mm-dd; empty = now
}

function text(value: unknown, max: number) {
    return typeof value === "string" ? value.trim().slice(0, max) : "";
}

// Arabic-friendly slug: letters and digits kept, everything else becomes "-".
function slugify(title: string) {
    return (
        title
            .toLowerCase()
            .replace(/[^\p{L}\p{N}]+/gu, "-")
            .replace(/^-+|-+$/g, "")
            .slice(0, 80) || "news"
    );
}

async function uniqueSlug(base: string, excludeId?: string) {
    const db = getDb();
    for (let n = 1; n < 50; n++) {
        const slug = n === 1 ? base : `${base}-${n}`;
        const [taken] = await db
            .select({ id: schema.news.id })
            .from(schema.news)
            .where(excludeId ? and(eq(schema.news.slug, slug), ne(schema.news.id, excludeId)) : eq(schema.news.slug, slug));
        if (!taken) return slug;
    }
    return `${base}-${Date.now()}`;
}

export async function saveNews(input: NewsInput): Promise<ActionResult<{ id: string; slug: string }>> {
    return safeAction(async () => {
        await requireStaff();
        const title = text(input.title, 200);
        if (!title) throw new ActionError("العنوان مطلوب");
        const category = text(input.category, 50);
        if (!category) throw new ActionError("اختر التصنيف");
        if (input.id && !UUID.test(input.id)) throw new ActionError("معرّف غير صالح");

        const cover = typeof input.coverUrl === "string" && input.coverUrl.length <= MAX_COVER ? input.coverUrl : null;
        let publishedAt: Date | null = null;
        if (input.publish) {
            publishedAt = input.publishedAt && /^\d{4}-\d{2}-\d{2}$/.test(input.publishedAt) ? new Date(`${input.publishedAt}T06:00:00Z`) : new Date();
        }

        const values = {
            title,
            excerpt: text(input.excerpt, 600) || null,
            content: text(input.content, 50_000) || null,
            category,
            coverUrl: cover,
            status: input.publish ? ("published" as const) : ("draft" as const),
            publishedAt,
        };

        const db = getDb();
        let row: { id: string; slug: string } | undefined;
        if (input.id) {
            // Keep the slug once set so shared links keep working.
            [row] = await db
                .update(schema.news)
                .set(values)
                .where(eq(schema.news.id, input.id))
                .returning({ id: schema.news.id, slug: schema.news.slug });
            if (!row) throw new ActionError("الخبر غير موجود");
        } else {
            const slug = await uniqueSlug(slugify(title));
            [row] = await db.insert(schema.news).values({ ...values, slug }).returning({ id: schema.news.id, slug: schema.news.slug });
        }

        revalidatePath("/");
        revalidatePath("/news");
        revalidatePath("/portal/admin/news");
        return row;
    });
}

export async function deleteNews(id: string): Promise<ActionResult<void>> {
    return safeAction(async () => {
        await requireStaff();
        if (!UUID.test(id)) throw new ActionError("معرّف غير صالح");
        await getDb().delete(schema.news).where(eq(schema.news.id, id));
        revalidatePath("/");
        revalidatePath("/news");
        revalidatePath("/portal/admin/news");
    });
}
