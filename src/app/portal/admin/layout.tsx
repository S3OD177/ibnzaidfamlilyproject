import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminShell from "@/components/layout/AdminShell";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth/session";

// Server-side guard in addition to proxy.ts, so admin pages never render without a session.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const cookieStore = await cookies();
    if (!(await verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value))) {
        redirect("/portal/login");
    }
    return <AdminShell>{children}</AdminShell>;
}
