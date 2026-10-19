"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, UserRound } from "lucide-react";

// One-tap demo sign-in for the presentation. Rendered only when DEMO_LOGIN=true; the
// credentials come from the server as props (they are public on the login page then).
export type DemoAccounts = Record<"admin" | "member", { username: string; password: string }>;
const HOME = { member: "/portal", admin: "/portal/admin" } as const;

export default function DemoButtons({ accounts }: { accounts: DemoAccounts }) {
    const router = useRouter();
    const [busy, setBusy] = useState<keyof DemoAccounts | null>(null);
    const [error, setError] = useState<string | null>(null);

    const signIn = async (kind: keyof DemoAccounts) => {
        setBusy(kind);
        setError(null);
        try {
            const { username, password } = accounts[kind];
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });
            const data = await res.json().catch(() => null);
            if (!res.ok) {
                setError(data?.error ?? "تعذر تسجيل الدخول التجريبي");
                return;
            }
            router.push(HOME[kind]);
            router.refresh();
        } catch {
            setError("تعذر الاتصال بالخادم");
        } finally {
            setBusy(null);
        }
    };

    const base =
        "flex items-center justify-center gap-3 rounded-2xl px-8 py-5 text-2xl sm:text-3xl font-bold shadow-xl transition-transform hover:scale-[1.03] disabled:opacity-60 disabled:hover:scale-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/50";

    return (
        <div className="flex flex-col gap-4 w-full sm:w-auto">
            <div className="flex flex-col sm:flex-row gap-4">
                <button type="button" onClick={() => signIn("member")} disabled={busy !== null} className={`${base} bg-primary text-deep`}>
                    <UserRound className="w-8 h-8" aria-hidden />
                    {busy === "member" ? "جارٍ الدخول…" : "جرّب كعضو"}
                </button>
                <button type="button" onClick={() => signIn("admin")} disabled={busy !== null} className={`${base} bg-cream text-deep border-2 border-primary`}>
                    <ShieldCheck className="w-8 h-8" aria-hidden />
                    {busy === "admin" ? "جارٍ الدخول…" : "جرّب كمدير"}
                </button>
            </div>
            {error && (
                <p role="alert" className="rounded-xl bg-red-50 text-red-700 px-4 py-2 text-base font-medium">
                    {error}
                </p>
            )}
        </div>
    );
}
