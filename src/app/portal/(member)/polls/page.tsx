import type { Metadata } from "next";
import { redirect } from "next/navigation";
import PollCard from "@/components/polls/PollCard";
import { getSession } from "@/lib/auth/current";
import { isStaff } from "@/lib/auth/session";
import { listPolls } from "@/lib/data/polls";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "التصويت" };

export default async function PollsPage() {
    const session = await getSession();
    if (!session) redirect("/portal/login?next=/portal/polls");
    const polls = await listPolls({ viewerKey: session.userId, staff: isStaff(session.role) });
    const open = polls.filter((p) => !p.closed);
    const closed = polls.filter((p) => p.closed);

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl">التصويت</h1>
                <p className="text-sm text-gray-500 mt-1">شارك برأيك في قرارات العائلة والمجلس.</p>
            </div>
            {polls.length === 0 && <p className="text-center text-muted py-16 bg-white rounded-2xl border border-dashed border-sand">لا يوجد تصويت حالياً.</p>}
            {open.length > 0 && (
                <section className="space-y-4">
                    <h2 className="font-heritage text-2xl font-bold text-deep">مفتوح للتصويت</h2>
                    {open.map((p) => (
                        <PollCard key={p.id} poll={p} />
                    ))}
                </section>
            )}
            {closed.length > 0 && (
                <section className="space-y-4">
                    <h2 className="font-heritage text-2xl font-bold text-deep">تصويتات سابقة</h2>
                    {closed.map((p) => (
                        <PollCard key={p.id} poll={p} />
                    ))}
                </section>
            )}
        </div>
    );
}
