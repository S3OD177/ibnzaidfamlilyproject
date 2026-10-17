import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/current";
import { isStaff } from "@/lib/auth/session";
import { ActionError } from "@/lib/action-result";
import { storeFile, type Visibility } from "@/lib/files";

// Upload for admins and editors: multipart form with "file" and optional "visibility".
export async function POST(request: Request) {
    const session = await getSession();
    if (!session || !isStaff(session.role)) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

    const form = await request.formData().catch(() => null);
    const file = form?.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "اختر ملفاً" }, { status: 400 });
    const visibility: Visibility = form?.get("visibility") === "public" ? "public" : "members";

    try {
        const stored = await storeFile({
            name: file.name,
            mimeType: file.type,
            data: Buffer.from(await file.arrayBuffer()),
            visibility,
            uploadedBy: session.isDbUser ? session.userId : null,
        });
        return NextResponse.json({ ...stored, name: file.name, mimeType: file.type });
    } catch (error) {
        const message = error instanceof ActionError ? error.message : "تعذر رفع الملف";
        if (!(error instanceof ActionError)) console.error("[upload]", error);
        return NextResponse.json({ error: message }, { status: 400 });
    }
}
