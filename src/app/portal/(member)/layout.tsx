import { redirect } from "next/navigation";
import MemberShell from "@/components/layout/MemberShell";
import { getSession } from "@/lib/auth/current";
import { isStaff } from "@/lib/auth/session";
import { getSiteSettings } from "@/lib/settings";

// Members' portal: home, read-only tree, directory, profiles and account. Open to every
// signed-in role; staff also get a link to the admin portal.
export default async function MemberLayout({ children }: { children: React.ReactNode }) {
    const session = await getSession();
    if (!session) redirect("/portal/login");
    return (
        <MemberShell
            siteName={(await getSiteSettings()).siteName}
            displayName={session.displayName}
            memberId={session.memberId}
            isStaff={isStaff(session.role)}
        >
            {children}
        </MemberShell>
    );
}
