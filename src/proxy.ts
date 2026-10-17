import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth/session";

// Everything under /portal except the login page needs an admin session.
export async function proxy(request: NextRequest) {
    const { pathname, search } = request.nextUrl;
    if (pathname === "/portal/login") return NextResponse.next();

    const token = request.cookies.get(SESSION_COOKIE)?.value;
    if (await verifySessionToken(token)) return NextResponse.next();

    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/portal/login";
    loginUrl.search = "";
    loginUrl.searchParams.set("next", pathname + search);
    return NextResponse.redirect(loginUrl);
}

export const config = {
    matcher: ["/portal/:path*"],
};
