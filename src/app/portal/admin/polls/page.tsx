import type { Metadata } from "next";
import PollCard from "@/components/polls/PollCard";
import PollForm from "@/components/polls/PollForm";
import PollAdminActions from "@/components/admin/polls/PollAdminActions";
import { getSession } from "@/lib/auth/current";
import { listPolls } from "@/lib/data/polls";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "التصويت" };

export default async function AdminPollsPage() {
    const session = await getSession();
    const polls = await listPolls({ viewerKey: session?.userId ?? "", staff: true, limit: 100 });
    return (
        <div className="max-w-4xl mx-auto font-display space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-ink">التصويت</h1>
                    <p className="text-muted mt-1">اطرح سؤالاً على أفراد العائلة واعرف رأيهم. ترى الإدارة النتائج دائماً.</p>
                </div>
                <PollForm />
            </div>
            {polls.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-16 border border-dashed border-gray-200 rounded-2xl bg-white">لم يُنشر أي تصويت بعد.</p>
            ) : (
                <div className="space-y-4">
                    {polls.map((p) => (
                        <PollCard key={p.id} poll={p} actions={<PollAdminActions id={p.id} question={p.question} closed={p.closed} />} />
                    ))}
                </div>
            )}
        </div>
    );
}
