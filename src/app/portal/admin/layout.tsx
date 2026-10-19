import { redirect } from "next/navigation";
import AdminShell from "@/components/layout/AdminShell";
import { getSession } from "@/lib/auth/current";
import { homeForRole, isStaff } from "@/lib/auth/session";
import { countPendingRequests } from "@/lib/data/stats";
import { countPendingChanges } from "@/lib/data/change-requests";
import { countPendingProposals } from "@/lib/data/proposals";
import { countPendingOccasions } from "@/lib/data/occasions";
import { getSiteSettings } from "@/lib/settings";

// Server-side guard in addition to proxy.ts: admin pages render only for an active
// admin or editor account (checked against the database on every request).
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const session = await getSession();
    if (!session) redirect("/portal/login");
    if (!isStaff(session.role)) redirect(homeForRole(session.role));
    return (
        <AdminShell
            role={session.role}
            displayName={session.displayName}
            siteName={(await getSiteSettings()).siteName}
            pendingRequests={session.role === "admin" ? await countPendingRequests() : 0}
            pendingChanges={(await countPendingChanges()) + (await countPendingProposals())}
            pendingOccasions={await countPendingOccasions()}
        >
            {children}
        </AdminShell>
    );
}
