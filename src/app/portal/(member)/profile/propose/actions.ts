"use server";

import { revalidatePath } from "next/cache";
import { getDb, schema } from "@/db";
import { ActionError, safeAction, type ActionResult } from "@/lib/action-result";
import { getSession } from "@/lib/auth/current";
import { allowedParents } from "@/lib/data/proposals";

export interface ProposalInput {
    parentId: string;
    fullName: string;
    gender: string;
    status: string;
    birthYear?: string;
    birthCalendar?: string;
    deathYear?: string;
    motherName?: string;
    note?: string;
}

function text(value: unknown, max: number, label: string): string | null {
    const v = typeof value === "string" ? value.trim() : "";
    if (v.length > max) throw new ActionError(`«${label}» أطول من المسموح`);
    return v || null;
}

function year(value: unknown, calendar: "hijri" | "gregorian", label: string): number | null {
    const v = typeof value === "string" ? value.trim() : "";
    if (!v) return null;
    if (!/^\d{1,4}$/.test(v)) throw new ActionError(`«${label}» غير صالحة`);
    const n = Number(v);
    const now = new Date().getFullYear();
    const [min, max] = calendar === "hijri" ? [1, Math.round((now - 622) * 1.0307) + 1] : [600, now];
    if (n < min || n > max) throw new ActionError(`«${label}» خارج النطاق المعقول`);
    return n;
}

/** Sends a proposal to add a new person under the member or one of their descendants. */
export async function submitProposal(input: ProposalInput): Promise<ActionResult<void>> {
    return safeAction(async () => {
        const session = await getSession();
        if (!session) throw new ActionError("سجّل الدخول أولاً");
        if (!session.memberId) throw new ActionError("حسابك غير مرتبط بملف في الشجرة بعد");
        if (!input || typeof input !== "object") throw new ActionError("بيانات غير صالحة");

        const parents = await allowedParents(session.memberId);
        if (!parents.some((p) => p.id === input.parentId)) throw new ActionError("لا يمكنك الإضافة تحت هذا الشخص");

        const fullName = text(input.fullName, 150, "الاسم");
        if (!fullName || fullName.length < 2) throw new ActionError("اكتب اسم الفرد");
        if (input.gender !== "male" && input.gender !== "female") throw new ActionError("اختر الجنس");
        if (input.status !== "alive" && input.status !== "deceased") throw new ActionError("اختر الحالة");
        const birthCalendar = input.birthCalendar === "gregorian" ? "gregorian" : "hijri";
        const birthYear = year(input.birthYear, birthCalendar, "سنة الميلاد");
        const deathYear = input.status === "deceased" ? year(input.deathYear, birthCalendar, "سنة الوفاة") : null;
        if (birthYear && deathYear && deathYear < birthYear) throw new ActionError("سنة الوفاة قبل سنة الميلاد");

        await getDb().insert(schema.memberProposals).values({
            parentId: input.parentId,
            fullName,
            gender: input.gender,
            status: input.status,
            birthYear,
            birthCalendar: birthYear ? birthCalendar : null,
            deathYear,
            motherName: text(input.motherName, 150, "اسم الأم"),
            note: text(input.note, 1000, "الملاحظة"),
            requesterName: session.displayName,
            requestedBy: session.isDbUser ? session.userId : null,
        });

        revalidatePath("/portal/profile/propose");
        revalidatePath("/portal/admin/change-requests");
    });
}
