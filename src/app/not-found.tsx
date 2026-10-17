import Link from "next/link";
import { Users, ArrowRight } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-[#f8faf9] flex flex-col items-center justify-center p-4 font-body text-center">
            <div className="size-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-primary border border-gray-100 mb-6">
                <Users className="w-8 h-8" />
            </div>
            <p className="text-sm font-bold text-primary mb-2">404</p>
            <h1 className="text-2xl font-bold text-[#111813] font-display mb-3">الصفحة غير موجودة</h1>
            <p className="text-gray-500 mb-8 font-naskh">لم نتمكن من العثور على الصفحة أو العضو المطلوب.</p>
            <Link
                href="/"
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold px-6 py-3 rounded-xl transition-colors"
            >
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                <span>العودة للرئيسية</span>
            </Link>
        </div>
    );
}
