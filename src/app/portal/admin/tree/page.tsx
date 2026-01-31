"use client";

import FamilyTreeBuilder from "@/components/admin/tree/FamilyTreeBuilder";
import { Users, Info } from "lucide-react";

export default function TreeEditorPage() {
    return (
        <div className="flex flex-col h-[calc(100vh-65px)] font-display bg-[#f6f8f6]">

            {/* Header Area */}
            <div className="bg-white border-b border-[#dbe6e0] px-6 py-4 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-black text-[#111814] flex items-center gap-2">
                        <Users className="w-6 h-6 text-primary" />
                        منشئ شجرة العائلة التفاعلي
                    </h1>
                    <p className="text-xs text-[#61896f] mt-1">قم بالسحب والإفلات لتنظيم هيكلية العائلة. التغييرات تحفظ تلقائياً.</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold border border-blue-100">
                    <Info className="w-4 h-4" />
                    <span>وضع التحرير النشط</span>
                </div>
            </div>

            {/* Tree Area */}
            <div className="flex-1 w-full relative">
                <FamilyTreeBuilder />
            </div>
        </div>
    );
}
