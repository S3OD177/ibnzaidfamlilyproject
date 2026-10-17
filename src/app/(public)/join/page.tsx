import type { Metadata } from "next";
import Link from "next/link";
import { UserPlus } from "lucide-react";
import JoinForm from "@/components/join/JoinForm";

export const metadata: Metadata = {
    title: "طلب انضمام | منصة العائلة",
};

export default function JoinPage() {
    return (
        <main className="flex-grow bg-[#f8faf9] py-12 px-4 font-body">
            <div className="max-w-xl mx-auto">
                <div className="text-center mb-8">
                    <div className="size-14 mx-auto mb-4 rounded-2xl bg-white shadow-sm border border-gray-100 text-primary flex items-center justify-center">
                        <UserPlus className="w-7 h-7" />
                    </div>
                    <h1 className="text-3xl font-black text-[#111813] font-display mb-2">طلب انضمام لبوابة العائلة</h1>
                    <p className="text-gray-500">
                        البوابة خاصة بأفراد العائلة. أرسل بياناتك وستراجعها الإدارة قبل إنشاء حسابك.
                    </p>
                </div>
                <div className="bg-white rounded-3xl shadow-xl shadow-gray-100/50 border border-gray-100 p-8">
                    <JoinForm />
                </div>
                <p className="text-center text-sm text-gray-500 mt-6">
                    لديك حساب؟{" "}
                    <Link href="/portal/login" className="font-bold text-primary hover:underline">تسجيل الدخول</Link>
                </p>
            </div>
        </main>
    );
}
