import { NextResponse } from "next/server";
import {
    SESSION_COOKIE,
    SESSION_MAX_AGE,
    checkCredentials,
    createSessionToken,
    homeForRole,
    isAuthConfigured,
} from "@/lib/auth/session";

export async function POST(request: Request) {
    if (!(await isAuthConfigured())) {
        return NextResponse.json({ error: "تسجيل الدخول غير مهيأ على الخادم" }, { status: 503 });
    }

    const body = await request.json().catch(() => null);
    const username = typeof body?.username === "string" ? body.username.trim() : "";
    const password = typeof body?.password === "string" ? body.password : "";

    const role = checkCredentials(username, password);
    if (!role) {
        // Small delay to slow down guessing.
        await new Promise((resolve) => setTimeout(resolve, 500));
        return NextResponse.json({ error: "اسم المستخدم أو كلمة المرور غير صحيحة" }, { status: 401 });
    }

    const response = NextResponse.json({ ok: true, role, home: homeForRole(role) });
    response.cookies.set(SESSION_COOKIE, await createSessionToken(role), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: SESSION_MAX_AGE,
    });
    return response;
}
