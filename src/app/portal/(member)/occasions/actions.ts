"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { ActionError, safeAction, type ActionResult } from "@/lib/action-result";
import { getSession, requireRole } from "@/lib/auth/current";
import { isStaff } from "@/lib/auth/session";
import { setFileVisibility, storeFile } from "@/lib/files";
import { OCCASION_TYPES, type OccasionType } from "@/lib/occasions";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DATA_URL = /^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/=]+)$/;
const FILE_URL = /^\/files\/([0-9a-f-]{36})$/i;

function refresh() {
    revalidatePath("/portal/occasions");
    revalidatePath("/portal/admin/occasions");
    revalidatePath("/portal");
    revalidatePath("/");
}

/** Keeps a post's photo as visible as the post: public posts need a public photo. */
async function syncPhoto(photoUrl: string | null, visibility: "public" | "members") {
    const match = photoUrl ? FILE_URL.exec(photoUrl) : null;
    if (match) await setFileVisibility(match[1], visibility);
}

export interface OccasionInput {
    type: string;
    title: string;
    message?: string;
    occasionDate?: string;
    memberId?: string | null;
    photo?: string;
    visibility?: "public" | "members";
}

/** Members' posts wait for review; staff posts are published straight away. */
export async function submitOccasion(input: OccasionInput): Promise<ActionResult<{ published: boolean }>> {
    return safeAction(async () => {
        const session = await getSession();
        if (!session) throw new ActionError("سجّل الدخول أولاً");
        const staff = isStaff(session.role);

        if (!(input.type in OCCASION_TYPES)) throw new ActionError("اختر نوع المناسبة");
        const title = input.title?.trim() ?? "";
        if (title.length < 3 || title.length > 150) throw new ActionError("العنوان بين 3 و150 حرفاً");
        const message = input.message?.trim().slice(0, 1000) || null;
        const occasionDate = input.occasionDate && /^\d{4}-\d{2}-\d{2}$/.test(input.occasionDate) ? input.occasionDate : null;
        const memberId = input.memberId && UUID.test(input.memberId) ? input.memberId : null;
        const visibility = staff && input.visibility === "public" ? "public" : "members";

        let photoUrl: string | null = null;
        if (input.photo) {
            const match = DATA_URL.exec(input.photo);
            if (!match) throw new ActionError("الصورة غير صالحة");
            const stored = await storeFile({
                name: `occasion.${match[1].split("/")[1]}`,
                mimeType: match[1],
                data: Buffer.from(match[2], "base64"),
                visibility,
                uploadedBy: session.isDbUser ? session.userId : null,
            });
            photoUrl = stored.url;
        }

        await getDb().insert(schema.occasions).values({
            type: input.type as OccasionType,
            title,
            message,
            occasionDate,
            memberId,
            photoUrl,
            visibility,
            status: staff ? "approved" : "pending",
            reviewedAt: staff ? new Date() : null,
            submittedBy: session.isDbUser ? session.userId : null,
            submitterName: session.displayName,
        });
        refresh();
        return { published: staff };
    });
}

/** Says مبارك under a post, or takes it back when said already. */
export async function toggleCongrats(occasionId: string, message?: string): Promise<ActionResult<{ congratulated: boolean }>> {
    return safeAction(async () => {
        const session = await getSession();
        if (!session) throw new ActionError("سجّل الدخول أولاً");
        if (!UUID.test(occasionId)) throw new ActionError("معرّف غير صالح");
        const db = getDb();
        const [occasion] = await db
            .select({ id: schema.occasions.id })
            .from(schema.occasions)
            .where(and(eq(schema.occasions.id, occasionId), eq(schema.occasions.status, "approved")));
        if (!occasion) throw new ActionError("المناسبة غير موجودة");

        const mine = and(eq(schema.occasionCongrats.occasionId, occasionId), eq(schema.occasionCongrats.authorKey, session.userId));
        const removed = await db.delete(schema.occasionCongrats).where(mine).returning({ id: schema.occasionCongrats.id });
        if (removed.length === 0) {
            await db.insert(schema.occasionCongrats).values({
                occasionId,
                authorKey: session.userId,
                authorName: session.displayName,
                message: message?.trim().slice(0, 300) || null,
            });
        }
        refresh();
        return { congratulated: removed.length === 0 };
    });
}

/** Staff: publish or decline a member's post. */
export async function reviewOccasion(id: string, decision: "approved" | "rejected", visibility: "public" | "members" = "members"): Promise<ActionResult<void>> {
    return safeAction(async () => {
        await requireRole("admin", "editor");
        if (!UUID.test(id)) throw new ActionError("معرّف غير صالح");
        const [row] = await getDb()
            .update(schema.occasions)
            .set({ status: decision, visibility, reviewedAt: new Date() })
            .where(and(eq(schema.occasions.id, id), eq(schema.occasions.status, "pending")))
            .returning({ photoUrl: schema.occasions.photoUrl });
        if (!row) throw new ActionError("الطلب غير موجود أو تمت مراجعته");
        if (decision === "approved") await syncPhoto(row.photoUrl, visibility);
        refresh();
    });
}

/** Staff: show a post on the public site too, or keep it for the family. */
export async function setOccasionVisibility(id: string, visibility: "public" | "members"): Promise<ActionResult<void>> {
    return safeAction(async () => {
        await requireRole("admin", "editor");
        if (!UUID.test(id)) throw new ActionError("معرّف غير صالح");
        const [row] = await getDb()
            .update(schema.occasions)
            .set({ visibility })
            .where(eq(schema.occasions.id, id))
            .returning({ photoUrl: schema.occasions.photoUrl });
        if (!row) throw new ActionError("المناسبة غير موجودة");
        await syncPhoto(row.photoUrl, visibility);
        refresh();
    });
}

/** Staff: remove a post (its photo is cleaned up with other unused files). */
export async function deleteOccasion(id: string): Promise<ActionResult<void>> {
    return safeAction(async () => {
        await requireRole("admin", "editor");
        if (!UUID.test(id)) throw new ActionError("معرّف غير صالح");
        await getDb().delete(schema.occasions).where(eq(schema.occasions.id, id));
        refresh();
    });
}
