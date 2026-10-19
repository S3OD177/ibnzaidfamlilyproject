"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, User, ArrowRight, Eye, EyeOff, ShieldCheck, UserRound } from "lucide-react";
import { Emblem } from "@/components/heritage/Ornament";

export type DemoAccounts = Record<"admin" | "member", { username: string; password: string }>;

// Only allow same-site paths as the post-login destination.
function safeNext(fallback: string): string {
    const next = new URLSearchParams(window.location.search).get("next");
    return next && next.startsWith("/") && !next.startsWith("//") ? next : fallback;
}

export default function LoginForm({ demoAccounts, siteName }: { demoAccounts: DemoAccounts | null; siteName: string }) {
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });
            const data = await res.json().catch(() => null);
            if (!res.ok) {
                setError(data?.error ?? "تعذر تسجيل الدخول، حاول مرة أخرى");
                return;
            }
            router.replace(safeNext(data?.home ?? "/portal/admin"));
            router.refresh();
        } catch {
            setError("تعذر الاتصال بالخادم، حاول مرة أخرى");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen bg-deep flex flex-col items-center justify-center p-4 font-body overflow-hidden">
            <div className="absolute inset-0 heritage-pattern opacity-[0.1]" />

            {/* Logo Section */}
            <Link href="/" className="relative mb-8 flex flex-col items-center gap-3 group">
                <Emblem className="w-16 h-16 group-hover:scale-105 transition-transform duration-300" />
                <h1 className="font-heritage text-4xl font-bold text-primary">{siteName}</h1>
            </Link>

            {/* Login Card */}
            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-primary/30 overflow-hidden">
                <div className="p-8 sm:p-10">
                    <div className="text-center mb-8">
                        <h2 className="font-heritage text-3xl font-bold text-deep mb-2">تسجيل الدخول</h2>
                        <p className="text-gray-500 text-sm">أهلاً بك في البوابة الإلكترونية للعائلة</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                                {error}
                            </div>
                        )}

                        {/* Username Field */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-ink select-none" htmlFor="username">
                                اسم المستخدم
                            </label>
                            <div className="relative">
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <User className="w-5 h-5" />
                                </div>
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    autoComplete="username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full pr-12 pl-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none text-ink font-medium"
                                    placeholder="أدخل اسم المستخدم"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-bold text-ink select-none" htmlFor="password">
                                    كلمة المرور
                                </label>
                                <Link href="/portal/forgot" className="text-xs font-bold text-primary hover:text-primary-dark transition-colors">
                                    نسيت كلمة المرور؟
                                </Link>
                            </div>
                            <div className="relative">
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pr-12 pl-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none text-ink font-medium"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer p-1"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {isLoading ? (
                                <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            ) : (
                                <>
                                    <span>تسجيل الدخول</span>
                                    <ArrowRight className="w-5 h-5 rtl:rotate-180" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* TEMPORARY: demo accounts, shown only when DEMO_LOGIN=true */}
                    {demoAccounts && (
                        <div className="mt-6 rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-4">
                            <p className="mb-3 text-center text-xs font-bold text-primary-dark">حسابات تجريبية مؤقتة</p>
                            <div className="grid grid-cols-2 gap-3">
                                {([
                                    ["admin", "مدير تجريبي", ShieldCheck],
                                    ["member", "عضو تجريبي", UserRound],
                                ] as const).map(([role, label, Icon]) => (
                                    <button
                                        key={role}
                                        type="button"
                                        onClick={() => {
                                            setUsername(demoAccounts[role].username);
                                            setPassword(demoAccounts[role].password);
                                            setError(null);
                                        }}
                                        className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-bold text-ink transition-colors hover:border-primary hover:text-primary cursor-pointer"
                                    >
                                        <Icon className="w-4 h-4" />
                                        <span>{label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer of Card */}
                <div className="bg-cream border-t border-sand p-6 text-center">
                    <p className="text-sm text-gray-500">
                        لست عضواً بعد؟{" "}
                        <Link href="/join" className="font-bold text-primary-dark hover:underline">
                            اطلب الانضمام
                        </Link>
                    </p>
                </div>
            </div>

            {/* Back to Home */}
            <Link href="/" className="relative mt-8 flex items-center gap-2 text-sm font-medium text-white/60 hover:text-primary transition-colors">
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                <span>العودة للرئيسية</span>
            </Link>

        </div>
    );
}
