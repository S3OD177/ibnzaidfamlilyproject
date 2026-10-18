import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/heritage/PageHero";
import JoinForm from "@/components/join/JoinForm";

export const metadata: Metadata = {
    title: "طلب انضمام",
};

export default function JoinPage() {
    return (
        <main className="flex-grow font-body">
            <PageHero eyebrow="بوابة الأعضاء" title="طلب انضمام" subtitle="البوابة خاصة بأفراد العائلة. أرسل بياناتك وستراجعها الإدارة قبل إنشاء حسابك." />
            <div className="max-w-xl mx-auto px-4 -mt-8 relative pb-16">
                <div className="bg-white rounded-3xl shadow-xl shadow-deep/5 border border-primary/25 p-6 sm:p-8">
                    <JoinForm />
                </div>
                <p className="text-center text-sm text-gray-500 mt-6">
                    لديك حساب؟{" "}
                    <Link href="/portal/login" className="font-bold text-primary-dark hover:underline">تسجيل الدخول</Link>
                </p>
            </div>
        </main>
    );
}
