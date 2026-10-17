import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/session";

export async function POST() {
    // Relative Location so the redirect stays on the public host behind the platform proxy.
    const response = new NextResponse(null, { status: 303, headers: { Location: "/portal/login" } });
    response.cookies.delete(SESSION_COOKIE);
    return response;
}
