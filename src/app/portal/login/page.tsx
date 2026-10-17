import LoginForm from "@/components/auth/LoginForm";
import { DEMO_ACCOUNTS, isDemoLoginEnabled } from "@/lib/auth/session";

// Rendered per request so toggling DEMO_LOGIN on CranL takes effect without a rebuild.
export const dynamic = "force-dynamic";

export default function LoginPage() {
    return <LoginForm demoAccounts={isDemoLoginEnabled() ? DEMO_ACCOUNTS : null} />;
}
