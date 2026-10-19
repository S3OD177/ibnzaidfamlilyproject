import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Emblem } from "@/components/heritage/Ornament";

/** The dark heritage frame and white card used by the login, forgot and reset pages. */
export default function AuthCard({ siteName, title, subtitle, children }: { siteName: string; title: string; subtitle?: string; children: React.ReactNode }) {
    return (
        <div className="relative min-h-screen bg-deep flex flex-col items-center justify-center p-4 font-body overflow-hidden">
            <div className="absolute inset-0 heritage-pattern opacity-[0.1]" />

            <Link href="/" className="relative mb-8 flex flex-col items-center gap-3 group">
                <Emblem className="w-16 h-16 group-hover:scale-105 transition-transform duration-300" />
                <h1 className="font-heritage text-4xl font-bold text-primary">{siteName}</h1>
            </Link>

            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-primary/30 overflow-hidden">
                <div className="p-8 sm:p-10">
                    <div className="text-center mb-8">
                        <h2 className="font-heritage text-3xl font-bold text-deep mb-2">{title}</h2>
                        {subtitle && <p className="text-gray-500 text-sm">{subtitle}</p>}
                    </div>
                    {children}
                </div>
                <div className="bg-cream border-t border-sand p-6 text-center">
                    <Link href="/portal/login" className="text-sm font-bold text-primary-dark hover:underline">
                        العودة إلى تسجيل الدخول
                    </Link>
                </div>
            </div>

            <Link href="/" className="relative mt-8 flex items-center gap-2 text-sm font-medium text-white/60 hover:text-primary transition-colors">
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                <span>العودة للرئيسية</span>
            </Link>
        </div>
    );
}

export const authInputClass =
    "w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none text-ink font-medium";

export const authButtonClass =
    "w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer";
