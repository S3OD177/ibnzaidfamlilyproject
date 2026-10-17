import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminShell from "@/components/layout/AdminShell";
import { SESSION_COOKIE, homeForRole, verifySessionToken } from "@/lib/auth/session";
import { countPendingRequests } from "@/lib/data/stats";

// Server-side guard in addition to proxy.ts, so admin pages never render without an admin session.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const cookieStore = await cookies();
    const role = await verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
    if (!role) redirect("/portal/login");
    if (role !== "admin") redirect(homeForRole(role));
    return <AdminShell pendingRequests={await countPendingRequests()}>{children}</AdminShell>;
}
