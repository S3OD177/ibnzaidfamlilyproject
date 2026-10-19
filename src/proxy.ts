import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, homeForRole, isStaff, verifySessionToken } from "@/lib/auth/session";

// Admin-only sections inside the staff portal.
const ADMIN_ONLY = ["/portal/admin/users", "/portal/admin/approvals", "/portal/admin/settings", "/portal/admin/fund", "/portal/admin/tree/import"];

// Pages anyone may open: sign-in and the "forgot password" flow.
const PUBLIC = ["/portal/login", "/portal/forgot", "/portal/reset"];

// Everything under /portal except those pages needs a session; /portal/admin needs
// an admin or editor. Pages re-check the account in the database (lib/auth/current).
export async function proxy(request: NextRequest) {
    const { pathname, search } = request.nextUrl;
    if (PUBLIC.includes(pathname)) return NextResponse.next();

    const session = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);

    if (!session) {
        const loginUrl = request.nextUrl.clone();
        loginUrl.pathname = "/portal/login";
        loginUrl.search = "";
        loginUrl.searchParams.set("next", pathname + search);
        return NextResponse.redirect(loginUrl);
    }

    const needsAdmin = ADMIN_ONLY.some((p) => pathname === p || pathname.startsWith(`${p}/`));
    if ((pathname.startsWith("/portal/admin") && !isStaff(session.role)) || (needsAdmin && session.role !== "admin")) {
        const homeUrl = request.nextUrl.clone();
        homeUrl.pathname = homeForRole(session.role);
        homeUrl.search = "";
        return NextResponse.redirect(homeUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/portal/:path*"],
};
