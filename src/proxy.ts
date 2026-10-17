import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, homeForRole, verifySessionToken } from "@/lib/auth/session";

// Everything under /portal except the login page needs a session;
// /portal/admin additionally needs the admin role.
export async function proxy(request: NextRequest) {
    const { pathname, search } = request.nextUrl;
    if (pathname === "/portal/login") return NextResponse.next();

    const role = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);

    if (!role) {
        const loginUrl = request.nextUrl.clone();
        loginUrl.pathname = "/portal/login";
        loginUrl.search = "";
        loginUrl.searchParams.set("next", pathname + search);
        return NextResponse.redirect(loginUrl);
    }

    if (pathname.startsWith("/portal/admin") && role !== "admin") {
        const homeUrl = request.nextUrl.clone();
        homeUrl.pathname = homeForRole(role);
        homeUrl.search = "";
        return NextResponse.redirect(homeUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/portal/:path*"],
};
