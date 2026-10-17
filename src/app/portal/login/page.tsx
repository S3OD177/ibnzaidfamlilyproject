import LoginForm from "@/components/auth/LoginForm";
import { DEMO_ACCOUNTS, isDemoLoginEnabled } from "@/lib/auth/session";
import { getSiteSettings } from "@/lib/settings";

// Rendered per request so toggling DEMO_LOGIN on CranL takes effect without a rebuild.
export const dynamic = "force-dynamic";

export default async function LoginPage() {
    const site = await getSiteSettings();
    return <LoginForm demoAccounts={isDemoLoginEnabled() ? DEMO_ACCOUNTS : null} siteName={site.siteName} />;
}
