import Link from "next/link";
import { Landmark, ExternalLink } from "lucide-react";
import CouncilManager from "@/components/admin/council/CouncilManager";
import { listCouncilForAdmin } from "@/lib/data/members";
import { listMemberOptions } from "@/lib/data/users";

export const dynamic = "force-dynamic";

export default async function CouncilAdminPage() {
    const [council, members] = await Promise.all([listCouncilForAdmin(), listMemberOptions()]);

    return (
        <div className="max-w-5xl mx-auto font-display space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-[#111812] flex items-center gap-3">
                        <Landmark className="w-7 h-7 text-primary" />
                        مجلس العائلة
                    </h1>
                    <p className="text-[#618968] mt-1">الأعضاء بالترتيب كما يظهرون في صفحة المجلس؛ الأول هو الرئيس.</p>
                </div>
                <Link href="/council" target="_blank" className="flex items-center gap-2 text-sm font-bold text-primary hover:underline">
                    <ExternalLink className="w-4 h-4" />
                    عرض صفحة المجلس
                </Link>
            </div>
            <CouncilManager council={council} members={members} />
        </div>
    );
}
