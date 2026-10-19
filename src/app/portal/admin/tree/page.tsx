import FamilyTreeBuilder from "@/components/admin/tree/FamilyTreeBuilder";
import { getTreeData } from "@/lib/data/tree";
import { Users, Info } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TreeEditorPage() {
    const tree = await getTreeData();

    return (
        <div className="flex flex-col h-[calc(100vh-65px)] font-display bg-canvas">

            {/* Header Area */}
            <div className="bg-white border-b border-line px-4 sm:px-6 py-3 sm:py-4 flex flex-wrap gap-2 items-center justify-between">
                <div>
                    <h1 className="text-xl font-black text-ink flex items-center gap-2">
                        <Users className="w-6 h-6 text-primary" />
                        منشئ شجرة العائلة التفاعلي
                    </h1>
                    <p className="text-xs text-muted mt-1">اسحب بطاقة فرد إلى شخص آخر لنقله تحته، واستخدم زر الطي لكل فرع. التغييرات تحفظ تلقائياً.</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold border border-blue-100">
                    <Info className="w-4 h-4" />
                    <span>وضع التحرير النشط</span>
                </div>
            </div>

            {/* Tree Area */}
            <div className="flex-1 w-full relative">
                <FamilyTreeBuilder initialTree={tree} />
            </div>
        </div>
    );
}
