"use client";

import Link from "next/link";
import { RotateCcw, TriangleAlert } from "lucide-react";

// Shown when a page fails to load (for example the database is briefly unreachable).
export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 font-body text-center" dir="rtl">
            <div className="size-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-primary border border-gray-100 mb-6">
                <TriangleAlert className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-ink mb-3">تعذر تحميل الصفحة</h1>
            <p className="text-gray-500 mb-8">حدث خطأ مؤقت. حاول مرة أخرى بعد لحظات.</p>
            <div className="flex flex-wrap justify-center gap-3">
                <button
                    type="button"
                    onClick={reset}
                    className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold px-6 py-3 rounded-xl transition-colors"
                >
                    <RotateCcw className="w-4 h-4" />
                    إعادة المحاولة
                </button>
                <Link href="/" className="inline-flex items-center px-6 py-3 rounded-xl font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50">
                    الرئيسية
                </Link>
            </div>
        </div>
    );
}
