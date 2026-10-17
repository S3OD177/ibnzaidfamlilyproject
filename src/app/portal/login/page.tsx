"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Users, Lock, User, ArrowRight, Eye, EyeOff } from "lucide-react";

// Only allow same-site paths as the post-login destination.
function safeNext(): string {
    const next = new URLSearchParams(window.location.search).get("next");
    return next && next.startsWith("/") && !next.startsWith("//") ? next : "/portal/admin";
}

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        const form = new FormData(e.currentTarget);
        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: form.get("username"), password: form.get("password") }),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => null);
                setError(data?.error ?? "تعذر تسجيل الدخول، حاول مرة أخرى");
                return;
            }
            router.replace(safeNext());
            router.refresh();
        } catch {
            setError("تعذر الاتصال بالخادم، حاول مرة أخرى");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8faf9] flex flex-col items-center justify-center p-4 font-body">

            {/* Logo Section */}
            <Link href="/" className="mb-8 flex flex-col items-center gap-3 group">
                <div className="size-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-primary group-hover:scale-105 transition-transform duration-300 border border-gray-100">
                    <Users className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-bold text-[#111813] font-display">منصة العائلة</h1>
            </Link>

            {/* Login Card */}
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-gray-100/50 border border-gray-100 overflow-hidden">
                <div className="p-8 sm:p-10">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-[#111813] mb-2">تسجيل الدخول</h2>
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
                            <label className="text-sm font-bold text-[#111813] select-none" htmlFor="username">
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
                                    className="w-full pr-12 pl-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none text-[#111813] font-medium"
                                    placeholder="أدخل اسم المستخدم"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-bold text-[#111813] select-none" htmlFor="password">
                                    كلمة المرور
                                </label>
                                <Link href="/#contact" className="text-xs font-bold text-primary hover:text-primary-dark transition-colors">
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
                                    className="w-full pr-12 pl-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none text-[#111813] font-medium"
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
                </div>

                {/* Footer of Card */}
                <div className="bg-gray-50 border-t border-gray-100 p-6 text-center">
                    <p className="text-sm text-gray-500">
                        لست عضواً بعد؟{" "}
                        <Link href="/#contact" className="font-bold text-[#111813] hover:text-primary transition-colors">
                            تواصل مع الإدارة
                        </Link>
                    </p>
                </div>
            </div>

            {/* Back to Home */}
            <Link href="/" className="mt-8 flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors">
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                <span>العودة للرئيسية</span>
            </Link>

        </div>
    );
}
